-- Additional indexes and constraints for checkout performance optimization
-- Run this after the main checkout schema

-- =============================================
-- PERFORMANCE INDEXES
-- =============================================

-- Orders table indexes for checkout queries
CREATE INDEX IF NOT EXISTS orders_user_id_status_idx ON orders(user_id, status);
CREATE INDEX IF NOT EXISTS orders_guest_email_idx ON orders(guest_email) WHERE guest_email IS NOT NULL;
CREATE INDEX IF NOT EXISTS orders_payment_status_created_idx ON orders(payment_status, created_at);
CREATE INDEX IF NOT EXISTS orders_status_created_idx ON orders(status, created_at);

-- Order items indexes for order processing
CREATE INDEX IF NOT EXISTS order_items_order_product_idx ON order_items(order_id, product_id);

-- Payment methods indexes
CREATE INDEX IF NOT EXISTS payment_methods_user_default_idx ON payment_methods(user_id, is_default);

-- Cart items indexes for checkout validation
CREATE INDEX IF NOT EXISTS cart_items_cart_product_idx ON cart_items(cart_id, product_id);

-- Products indexes for inventory checking
CREATE INDEX IF NOT EXISTS products_active_stock_idx ON products(is_active, stock_quantity) WHERE is_active = true;

-- Inventory logs indexes for tracking
CREATE INDEX IF NOT EXISTS inventory_logs_product_created_idx ON inventory_logs(product_id, created_at);
CREATE INDEX IF NOT EXISTS inventory_logs_reference_reason_idx ON inventory_logs(reference_id, reason);

-- =============================================
-- CONSTRAINTS FOR DATA INTEGRITY
-- =============================================

-- Ensure order totals are consistent
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'orders_total_consistency' 
    AND table_name = 'orders'
  ) THEN
    ALTER TABLE orders ADD CONSTRAINT orders_total_consistency 
      CHECK (total_eur = subtotal_eur + shipping_cost_eur + tax_eur);
  END IF;
END $$;

-- Ensure positive amounts
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'orders_positive_amounts' 
    AND table_name = 'orders'
  ) THEN
    ALTER TABLE orders ADD CONSTRAINT orders_positive_amounts 
      CHECK (subtotal_eur >= 0 AND shipping_cost_eur >= 0 AND tax_eur >= 0 AND total_eur >= 0);
  END IF;
END $$;

-- Ensure order item totals are consistent
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'order_items_total_consistency' 
    AND table_name = 'order_items'
  ) THEN
    ALTER TABLE order_items ADD CONSTRAINT order_items_total_consistency 
      CHECK (total_eur = price_eur * quantity);
  END IF;
END $$;

-- Ensure positive quantities and prices
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'order_items_positive_values' 
    AND table_name = 'order_items'
  ) THEN
    ALTER TABLE order_items ADD CONSTRAINT order_items_positive_values 
      CHECK (quantity > 0 AND price_eur >= 0 AND total_eur >= 0);
  END IF;
END $$;

-- Ensure payment method expiry dates are valid
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'payment_methods_valid_expiry' 
    AND table_name = 'payment_methods'
  ) THEN
    ALTER TABLE payment_methods ADD CONSTRAINT payment_methods_valid_expiry 
      CHECK (
        (expires_month IS NULL AND expires_year IS NULL) OR 
        (expires_month BETWEEN 1 AND 12 AND expires_year >= EXTRACT(YEAR FROM NOW()))
      );
  END IF;
END $$;

-- =============================================
-- PARTIAL INDEXES FOR SPECIFIC QUERIES
-- =============================================

-- Index for active orders only
CREATE INDEX IF NOT EXISTS orders_active_status_idx ON orders(status, created_at) 
  WHERE status IN ('pending', 'processing', 'shipped');

-- Index for failed payments that might need retry
CREATE INDEX IF NOT EXISTS orders_failed_payments_idx ON orders(payment_status, created_at) 
  WHERE payment_status = 'failed';

-- Index for orders needing fulfillment
CREATE INDEX IF NOT EXISTS orders_fulfillment_idx ON orders(status, created_at) 
  WHERE status = 'processing' AND payment_status = 'paid';

-- Index for default payment methods
CREATE INDEX IF NOT EXISTS payment_methods_default_idx ON payment_methods(user_id) 
  WHERE is_default = true;

-- =============================================
-- COMPOSITE INDEXES FOR COMPLEX QUERIES
-- =============================================

-- For admin order management with multiple filters
CREATE INDEX IF NOT EXISTS orders_admin_filter_idx ON orders(status, payment_status, created_at);

-- For user order history with status filtering
CREATE INDEX IF NOT EXISTS orders_user_history_idx ON orders(user_id, status, created_at DESC);

-- For inventory management queries
CREATE INDEX IF NOT EXISTS inventory_logs_management_idx ON inventory_logs(product_id, reason, created_at DESC);

-- =============================================
-- STATISTICS AND MAINTENANCE
-- =============================================

-- Update table statistics for better query planning
ANALYZE orders;
ANALYZE order_items;
ANALYZE payment_methods;
ANALYZE cart_items;
ANALYZE products;
ANALYZE inventory_logs;