-- Migration: Add admin role support and inventory tracking
-- Date: 2025-10-30
-- Purpose: Add role field to profiles table and inventory_updated flag to orders table

-- =============================================
-- ADD ROLE FIELD TO PROFILES TABLE
-- =============================================

-- Add role column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'manager'));

-- Create index on role for faster lookups
CREATE INDEX IF NOT EXISTS profiles_role_idx ON profiles(role);

-- Comment for documentation
COMMENT ON COLUMN profiles.role IS 'User role: customer (default), admin, or manager. Used for access control in admin endpoints.';

-- =============================================
-- ADD INVENTORY TRACKING TO ORDERS TABLE
-- =============================================

-- Add inventory_updated flag to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS inventory_updated BOOLEAN DEFAULT FALSE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS orders_inventory_updated_idx ON orders(inventory_updated);

-- Comment for documentation
COMMENT ON COLUMN orders.inventory_updated IS 'Tracks whether inventory has been decremented for this order. Prevents duplicate inventory updates when completing multiple picking tasks.';

-- =============================================
-- UPDATE INVENTORY LOGS REASON ENUM
-- =============================================

-- Add 'sale_reversal' to the inventory_logs reason constraint if not already present
-- First, drop the existing constraint
ALTER TABLE inventory_logs DROP CONSTRAINT IF EXISTS inventory_logs_reason_check;

-- Recreate with the new value
ALTER TABLE inventory_logs ADD CONSTRAINT inventory_logs_reason_check
CHECK (reason IN ('sale', 'return', 'manual_adjustment', 'stock_receipt', 'sale_reversal'));

-- Comment for documentation
COMMENT ON COLUMN inventory_logs.reason IS 'Reason for inventory change: sale, return, manual_adjustment, stock_receipt, sale_reversal (when unchecking completed tasks)';

-- =============================================
-- GRANT PERMISSIONS
-- =============================================

-- Note: RLS policies for admin access are handled in the adminAuth utility
-- Service role bypasses RLS automatically
