-- Checkout & Payment Processing Database Schema Extensions
-- This file extends the existing schema with checkout-specific enhancements

-- =============================================
-- PAYMENT METHODS (for saved payment methods)
-- =============================================
CREATE TABLE IF NOT EXISTS payment_methods (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('credit_card', 'paypal')),
  provider_id TEXT NOT NULL, -- Stripe customer ID, PayPal reference, etc.
  last_four TEXT,
  brand TEXT,
  expires_month INTEGER,
  expires_year INTEGER,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on payment_methods
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- Users can manage their own payment methods
CREATE POLICY "Users can manage own payment methods" ON payment_methods
  FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- ENHANCE EXISTING ORDERS TABLE
-- =============================================

-- Add guest email field for guest checkout
ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_email TEXT;

-- Update payment method check constraint to include bank_transfer
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_method_check;
ALTER TABLE orders ADD CONSTRAINT orders_payment_method_check 
  CHECK (payment_method IN ('credit_card', 'paypal', 'bank_transfer', 'stripe', 'cod'));

-- Add shipping method information
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_method JSONB;

-- Add order tracking information
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS carrier TEXT;

-- =============================================
-- ADDITIONAL INDEXES FOR CHECKOUT PERFORMANCE
-- =============================================

-- Payment methods indexes
CREATE INDEX IF NOT EXISTS payment_methods_user_id_idx ON payment_methods(user_id);
CREATE INDEX IF NOT EXISTS payment_methods_type_idx ON payment_methods(type);
CREATE INDEX IF NOT EXISTS payment_methods_is_default_idx ON payment_methods(is_default);

-- Orders indexes for checkout queries
CREATE INDEX IF NOT EXISTS orders_order_number_idx ON orders(order_number);
CREATE INDEX IF NOT EXISTS orders_payment_status_idx ON orders(payment_status);
CREATE INDEX IF NOT EXISTS orders_guest_email_idx ON orders(guest_email);

-- =============================================
-- FUNCTIONS FOR ORDER MANAGEMENT
-- =============================================

-- Function to generate unique order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  order_num TEXT;
  counter INTEGER := 0;
BEGIN
  LOOP
    -- Generate order number with format: MD-YYYYMMDD-XXXX
    order_num := 'MD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
                 LPAD((EXTRACT(EPOCH FROM NOW())::INTEGER % 10000)::TEXT, 4, '0');
    
    -- Check if order number already exists
    IF NOT EXISTS (SELECT 1 FROM orders WHERE order_number = order_num) THEN
      RETURN order_num;
    END IF;
    
    counter := counter + 1;
    IF counter > 100 THEN
      -- Fallback to UUID if we can't generate unique number
      RETURN 'MD-' || REPLACE(gen_random_uuid()::TEXT, '-', '')::TEXT;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to update inventory on order completion
CREATE OR REPLACE FUNCTION update_inventory_on_order(order_id_param INTEGER)
RETURNS VOID AS $$
DECLARE
  item RECORD;
BEGIN
  -- Update product stock for each order item
  FOR item IN 
    SELECT product_id, quantity 
    FROM order_items 
    WHERE order_id = order_id_param
  LOOP
    UPDATE products 
    SET stock_quantity = stock_quantity - item.quantity,
        updated_at = NOW()
    WHERE id = item.product_id;
    
    -- Log inventory change
    INSERT INTO inventory_logs (
      product_id, 
      quantity_change, 
      quantity_after, 
      reason, 
      reference_id
    )
    SELECT 
      item.product_id,
      -item.quantity,
      stock_quantity,
      'sale',
      order_id_param
    FROM products 
    WHERE id = item.product_id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to validate cart items before checkout
CREATE OR REPLACE FUNCTION validate_cart_for_checkout(cart_id_param INTEGER)
RETURNS TABLE(
  valid BOOLEAN,
  errors JSONB
) AS $$
DECLARE
  validation_errors JSONB := '[]'::JSONB;
  item RECORD;
  product_stock INTEGER;
BEGIN
  -- Check each cart item
  FOR item IN 
    SELECT ci.product_id, ci.quantity, p.stock_quantity, p.name_translations, p.is_active
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.cart_id = cart_id_param
  LOOP
    -- Check if product is still active
    IF NOT item.is_active THEN
      validation_errors := validation_errors || jsonb_build_object(
        'product_id', item.product_id,
        'error', 'product_inactive',
        'message', 'Product is no longer available'
      );
    END IF;
    
    -- Check stock availability
    IF item.quantity > item.stock_quantity THEN
      validation_errors := validation_errors || jsonb_build_object(
        'product_id', item.product_id,
        'error', 'insufficient_stock',
        'message', 'Not enough stock available',
        'available_quantity', item.stock_quantity,
        'requested_quantity', item.quantity
      );
    END IF;
  END LOOP;
  
  RETURN QUERY SELECT 
    (jsonb_array_length(validation_errors) = 0) as valid,
    validation_errors as errors;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- TRIGGERS FOR ORDER MANAGEMENT
-- =============================================

-- Trigger to set order number on insert
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number_trigger
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION set_order_number();

-- =============================================
-- ADMIN POLICIES FOR ORDER MANAGEMENT
-- =============================================

-- Note: Admin policies are handled in the API layer for now
-- Future implementation could use a user_roles table:
-- 
-- CREATE TABLE user_roles (
--   user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
--   role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'user')),
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
--   PRIMARY KEY (user_id, role)
-- );
--
-- Then add policies like:
-- CREATE POLICY "Admins can view all orders" ON orders
--   FOR SELECT USING (
--     EXISTS (
--       SELECT 1 FROM user_roles 
--       WHERE user_id = auth.uid() AND role = 'admin'
--     )
--   );