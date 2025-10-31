-- Migration: Add role column to profiles table
-- Created: 2025-10-30
-- Description: Adds role-based access control to the profiles table

-- Add role column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'customer'
CHECK (role IN ('customer', 'admin', 'manager'));

-- Create index for role column
CREATE INDEX IF NOT EXISTS profiles_role_idx ON profiles(role);

-- Admin policies: Allow admins to view and update all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admin order policies
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update all orders" ON orders;
CREATE POLICY "Admins can update all orders" ON orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Update existing profiles to have default role
UPDATE profiles SET role = 'customer' WHERE role IS NULL;

-- Make the first user an admin (optional - comment out if not desired)
-- UPDATE profiles SET role = 'admin' WHERE id = (SELECT id FROM profiles ORDER BY created_at ASC LIMIT 1);

COMMENT ON COLUMN profiles.role IS 'User role: customer (default), admin, or manager';
