-- Migration: Add indexes for products table to optimize order creation performance
-- Issue: #89 - Improve performance of FOR UPDATE queries in create_order_with_inventory
-- Date: 2025-11-03
-- Description: Adds indexes to support efficient row-level locking and querying
--              during the atomic order creation process.

-- Index for the FOR UPDATE query in create_order_with_inventory function
-- This index supports: WHERE id = product_id AND is_active = true FOR UPDATE
CREATE INDEX IF NOT EXISTS idx_products_id_active
ON products(id)
WHERE is_active = true;

-- Additional index for general product queries
CREATE INDEX IF NOT EXISTS idx_products_active
ON products(is_active)
WHERE is_active = true;

-- Index for stock quantity queries (useful for low-stock alerts)
CREATE INDEX IF NOT EXISTS idx_products_stock
ON products(stock_quantity)
WHERE is_active = true AND stock_quantity > 0;
