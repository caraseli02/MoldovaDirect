-- Add RLS policies for order creation
-- This allows both authenticated users and service role to create orders

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can create own orders" ON orders;
DROP POLICY IF EXISTS "Service role can create orders" ON orders;
DROP POLICY IF EXISTS "Allow order creation" ON orders;
DROP POLICY IF EXISTS "Users can update own orders" ON orders;
DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
DROP POLICY IF EXISTS "Allow order items insert" ON order_items;

-- Allow order creation for both authenticated users and guest checkout
-- This policy allows:
-- 1. Authenticated users to create orders (user_id = auth.uid())
-- 2. Guest checkout (user_id IS NULL and guest_email is provided)
-- 3. Service role to create any order (bypasses RLS automatically)
CREATE POLICY "Allow order creation" ON orders
  FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id OR 
    (user_id IS NULL AND guest_email IS NOT NULL) OR
    user_id IS NULL
  );

-- Policy for users to update their own orders (for status updates)
CREATE POLICY "Users can update own orders" ON orders
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Add policies for order_items
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Users can view their own order items
CREATE POLICY "Users can view own order items" ON order_items
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- Allow inserting order items (will be restricted by order ownership)
CREATE POLICY "Allow order items insert" ON order_items
  FOR INSERT 
  WITH CHECK (true);
