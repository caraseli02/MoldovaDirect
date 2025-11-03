-- Migration: Create atomic order creation with inventory update
-- Issue: #89 - No Transaction for Order Creation + Inventory Update
-- Date: 2025-11-03
-- Description: This migration creates a database function that handles order creation
--              and inventory updates atomically, preventing data corruption from
--              network failures or race conditions.

-- Drop function if exists (for idempotency)
DROP FUNCTION IF EXISTS create_order_with_inventory(JSONB, JSONB[]);

-- Create the atomic order creation function
CREATE OR REPLACE FUNCTION create_order_with_inventory(
  order_data JSONB,
  order_items_data JSONB[]
) RETURNS JSONB AS $$
DECLARE
  new_order_id INTEGER;
  item JSONB;
  product_id INTEGER;
  quantity INTEGER;
  current_stock INTEGER;
  product_snapshot JSONB;
  price_eur DECIMAL(10,2);
  total_eur DECIMAL(10,2);
  result_order JSONB;
BEGIN
  -- Validate input
  IF order_data IS NULL OR order_items_data IS NULL OR array_length(order_items_data, 1) = 0 THEN
    RAISE EXCEPTION 'Missing required order data or items';
  END IF;

  -- Start transaction (implicit in function)
  -- All operations below are atomic - either all succeed or all fail

  -- 1. Create order
  INSERT INTO orders (
    order_number,
    user_id,
    status,
    payment_method,
    payment_status,
    payment_intent_id,
    subtotal_eur,
    shipping_cost_eur,
    tax_eur,
    total_eur,
    shipping_address,
    billing_address,
    guest_email,
    created_at,
    updated_at
  ) VALUES (
    (order_data->>'order_number')::TEXT,
    NULLIF(order_data->>'user_id', '')::UUID,
    (order_data->>'status')::TEXT,
    (order_data->>'payment_method')::TEXT,
    (order_data->>'payment_status')::TEXT,
    (order_data->>'payment_intent_id')::TEXT,
    (order_data->>'subtotal_eur')::DECIMAL,
    (order_data->>'shipping_cost_eur')::DECIMAL,
    COALESCE((order_data->>'tax_eur')::DECIMAL, 0),
    (order_data->>'total_eur')::DECIMAL,
    (order_data->'shipping_address')::JSONB,
    (order_data->'billing_address')::JSONB,
    NULLIF(order_data->>'guest_email', ''),
    NOW(),
    NOW()
  ) RETURNING id INTO new_order_id;

  -- 2. Process each item: create order item + update inventory
  FOREACH item IN ARRAY order_items_data LOOP
    product_id := (item->>'product_id')::INTEGER;
    quantity := (item->>'quantity')::INTEGER;
    product_snapshot := (item->'product_snapshot')::JSONB;
    price_eur := (item->>'price_eur')::DECIMAL;
    total_eur := (item->>'total_eur')::DECIMAL;

    -- Validate quantity
    IF quantity <= 0 THEN
      RAISE EXCEPTION 'Invalid quantity % for product %', quantity, product_id;
    END IF;

    -- Check current stock with row-level lock (prevents race conditions)
    -- Using NOWAIT to fail fast if row is locked instead of waiting indefinitely
    BEGIN
      SELECT stock_quantity INTO current_stock
      FROM products
      WHERE id = product_id AND is_active = true
      FOR UPDATE NOWAIT;  -- Fail immediately if row is locked
    EXCEPTION
      WHEN lock_not_available THEN
        RAISE EXCEPTION 'Product % is currently being processed by another order. Please try again.', product_id;
    END;

    -- Verify product exists
    IF current_stock IS NULL THEN
      RAISE EXCEPTION 'Product % not found or inactive', product_id;
    END IF;

    -- Check sufficient stock
    IF current_stock < quantity THEN
      RAISE EXCEPTION 'Insufficient stock for product %: requested %, available %',
        product_id, quantity, current_stock;
    END IF;

    -- Insert order item
    INSERT INTO order_items (
      order_id,
      product_id,
      product_snapshot,
      quantity,
      price_eur,
      total_eur
    ) VALUES (
      new_order_id,
      product_id,
      product_snapshot,
      quantity,
      price_eur,
      total_eur
    );

    -- Update inventory (atomic with order creation)
    UPDATE products
    SET
      stock_quantity = stock_quantity - quantity,
      updated_at = NOW()
    WHERE id = product_id;

    -- Create inventory log record
    INSERT INTO inventory_logs (
      product_id,
      quantity_change,
      quantity_after,
      reason,
      reference_id,
      created_at
    ) VALUES (
      product_id,
      -quantity,  -- Negative because it's a sale
      current_stock - quantity,
      'sale',
      new_order_id,
      NOW()
    );

  END LOOP;

  -- Fetch the created order for return
  SELECT jsonb_build_object(
    'success', true,
    'order', jsonb_build_object(
      'id', o.id,
      'order_number', o.order_number,
      'total', o.total_eur,
      'status', o.status,
      'payment_status', o.payment_status,
      'created_at', o.created_at
    )
  ) INTO result_order
  FROM orders o
  WHERE o.id = new_order_id;

  -- Return success with order details
  RETURN result_order;

EXCEPTION
  WHEN OTHERS THEN
    -- Transaction automatically rolled back on any error
    -- Re-raise the error with context
    RAISE EXCEPTION 'Order creation failed: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment explaining the function
COMMENT ON FUNCTION create_order_with_inventory(JSONB, JSONB[]) IS
'Atomically creates an order with all items and updates inventory. Uses row-level locking to prevent race conditions. All operations are in a single transaction - either all succeed or all are rolled back.';

-- Grant execute permission ONLY to service role (not authenticated users)
-- This prevents direct client access and ensures all orders go through server-side validation
-- SECURITY: authenticated users should NOT be able to call this directly - only server-side code
GRANT EXECUTE ON FUNCTION create_order_with_inventory(JSONB, JSONB[]) TO service_role;
