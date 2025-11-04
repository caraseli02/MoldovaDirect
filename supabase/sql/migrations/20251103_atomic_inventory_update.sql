-- Migration: Add atomic inventory update function for order fulfillment
-- Fixes race condition in concurrent inventory updates
-- Related: Issue #89, Issue #82 (test coverage)

-- Drop function if exists (for idempotency)
DROP FUNCTION IF EXISTS update_inventory_for_order_atomic(INTEGER, UUID);
DROP FUNCTION IF EXISTS rollback_inventory_for_order_atomic(INTEGER, UUID);

-- ============================================================================
-- Function: update_inventory_for_order_atomic
-- ============================================================================
-- Atomically updates inventory when order fulfillment picking task is completed
-- Uses FOR UPDATE row locking to prevent race conditions
-- All operations in single transaction (atomic commit/rollback)
--
-- Parameters:
--   p_order_id: Order ID to process
--   p_user_id: Admin user ID performing the action
--
-- Returns:
--   JSONB object with success status and details
--
-- Raises exception on:
--   - Insufficient stock
--   - Invalid order ID
--   - Any database error (triggers automatic rollback)
-- ============================================================================

CREATE OR REPLACE FUNCTION update_inventory_for_order_atomic(
  p_order_id INTEGER,
  p_user_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_order RECORD;
  v_item RECORD;
  v_current_stock INTEGER;
  v_new_stock INTEGER;
  v_products_updated INTEGER := 0;
BEGIN
  -- 1. Check if order exists and get current state
  --    Lock order row to prevent concurrent processing
  SELECT inventory_updated, status
  INTO v_order
  FROM orders
  WHERE id = p_order_id
  FOR UPDATE;  -- Lock this order row

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order % not found', p_order_id;
  END IF;

  -- 2. Check if inventory already updated (idempotency)
  IF v_order.inventory_updated THEN
    RETURN jsonb_build_object(
      'success', true,
      'message', 'Inventory already updated for this order',
      'products_updated', 0,
      'skipped', true
    );
  END IF;

  -- 3. Process each order item atomically
  FOR v_item IN
    SELECT product_id, quantity
    FROM order_items
    WHERE order_id = p_order_id
  LOOP
    -- Lock product row and get current stock
    -- FOR UPDATE prevents other transactions from reading/writing this row
    SELECT stock_quantity
    INTO v_current_stock
    FROM products
    WHERE id = v_item.product_id
    FOR UPDATE;  -- ⭐ This prevents race conditions!

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product % not found', v_item.product_id;
    END IF;

    -- Check sufficient stock
    IF v_current_stock < v_item.quantity THEN
      RAISE EXCEPTION 'Insufficient stock for product %. Available: %, Required: %',
        v_item.product_id, v_current_stock, v_item.quantity;
    END IF;

    -- Calculate new stock (cannot go below 0)
    v_new_stock := GREATEST(0, v_current_stock - v_item.quantity);

    -- Atomically update product stock
    UPDATE products
    SET stock_quantity = v_new_stock,
        updated_at = NOW()
    WHERE id = v_item.product_id;

    -- Log inventory change
    INSERT INTO inventory_logs (
      product_id,
      quantity_change,
      quantity_after,
      reason,
      reference_id,
      created_by,
      created_at
    ) VALUES (
      v_item.product_id,
      -v_item.quantity,
      v_new_stock,
      'sale',
      p_order_id,
      p_user_id,
      NOW()
    );

    v_products_updated := v_products_updated + 1;
  END LOOP;

  -- 4. Mark inventory as updated (prevents duplicate processing)
  UPDATE orders
  SET inventory_updated = true,
      updated_at = NOW()
  WHERE id = p_order_id;

  -- 5. Return success
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Inventory updated successfully',
    'products_updated', v_products_updated,
    'order_id', p_order_id
  );

EXCEPTION
  WHEN OTHERS THEN
    -- Log error and re-raise (transaction will auto-rollback)
    RAISE NOTICE 'Error updating inventory for order %: %', p_order_id, SQLERRM;
    RAISE;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Function: rollback_inventory_for_order_atomic
-- ============================================================================
-- Atomically rolls back inventory when picking task is marked incomplete
-- Uses same locking strategy as update function
--
-- Parameters:
--   p_order_id: Order ID to process
--   p_user_id: Admin user ID performing the action
--
-- Returns:
--   JSONB object with success status and details
--
-- Raises exception on:
--   - Order already shipped/delivered
--   - Invalid order ID
--   - Any database error (triggers automatic rollback)
-- ============================================================================

CREATE OR REPLACE FUNCTION rollback_inventory_for_order_atomic(
  p_order_id INTEGER,
  p_user_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_order RECORD;
  v_item RECORD;
  v_current_stock INTEGER;
  v_new_stock INTEGER;
  v_products_updated INTEGER := 0;
BEGIN
  -- 1. Check if order exists and get current state
  --    Lock order row to prevent concurrent processing
  SELECT inventory_updated, status
  INTO v_order
  FROM orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order % not found', p_order_id;
  END IF;

  -- 2. Check if inventory was updated (can't rollback if never updated)
  IF NOT v_order.inventory_updated THEN
    RETURN jsonb_build_object(
      'success', true,
      'message', 'Inventory was not updated for this order',
      'products_updated', 0,
      'skipped', true
    );
  END IF;

  -- 3. Prevent rollback for shipped/delivered orders
  IF v_order.status IN ('shipped', 'delivered') THEN
    RAISE EXCEPTION 'Cannot rollback inventory for % orders', v_order.status;
  END IF;

  -- 4. Process each order item atomically (add stock back)
  FOR v_item IN
    SELECT product_id, quantity
    FROM order_items
    WHERE order_id = p_order_id
  LOOP
    -- Lock product row and get current stock
    SELECT stock_quantity
    INTO v_current_stock
    FROM products
    WHERE id = v_item.product_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product % not found', v_item.product_id;
    END IF;

    -- Calculate new stock (add quantity back)
    v_new_stock := v_current_stock + v_item.quantity;

    -- Atomically update product stock
    UPDATE products
    SET stock_quantity = v_new_stock,
        updated_at = NOW()
    WHERE id = v_item.product_id;

    -- Log inventory reversal
    INSERT INTO inventory_logs (
      product_id,
      quantity_change,
      quantity_after,
      reason,
      reference_id,
      created_by,
      created_at
    ) VALUES (
      v_item.product_id,
      v_item.quantity,
      v_new_stock,
      'sale_reversal',
      p_order_id,
      p_user_id,
      NOW()
    );

    v_products_updated := v_products_updated + 1;
  END LOOP;

  -- 5. Reset inventory_updated flag
  UPDATE orders
  SET inventory_updated = false,
      updated_at = NOW()
  WHERE id = p_order_id;

  -- 6. Return success
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Inventory rolled back successfully',
    'products_updated', v_products_updated,
    'order_id', p_order_id
  );

EXCEPTION
  WHEN OTHERS THEN
    -- Log error and re-raise (transaction will auto-rollback)
    RAISE NOTICE 'Error rolling back inventory for order %: %', p_order_id, SQLERRM;
    RAISE;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions to authenticated users (will be checked by requireAdminRole)
GRANT EXECUTE ON FUNCTION update_inventory_for_order_atomic(INTEGER, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION rollback_inventory_for_order_atomic(INTEGER, UUID) TO authenticated;

-- Add comments for documentation
COMMENT ON FUNCTION update_inventory_for_order_atomic IS
'Atomically updates inventory for order fulfillment. Uses FOR UPDATE locking to prevent race conditions. All operations in single transaction.';

COMMENT ON FUNCTION rollback_inventory_for_order_atomic IS
'Atomically rolls back inventory when picking task is unchecked. Prevents rollback for shipped/delivered orders. All operations in single transaction.';
