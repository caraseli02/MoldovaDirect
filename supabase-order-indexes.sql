-- Order History Performance Indexes
-- This migration adds indexes to optimize order queries for filtering and search

-- Index for user_id and created_at (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_orders_user_created 
ON orders(user_id, created_at DESC);

-- Index for user_id and status (for status filtering)
CREATE INDEX IF NOT EXISTS idx_orders_user_status 
ON orders(user_id, status);

-- Index for user_id and total_eur (for amount filtering)
CREATE INDEX IF NOT EXISTS idx_orders_user_total 
ON orders(user_id, total_eur);

-- Index for order_number search (case-insensitive)
CREATE INDEX IF NOT EXISTS idx_orders_order_number_lower 
ON orders(LOWER(order_number));

-- Composite index for common filter combinations
CREATE INDEX IF NOT EXISTS idx_orders_user_status_created 
ON orders(user_id, status, created_at DESC);

-- Index for tracking queries
CREATE INDEX IF NOT EXISTS idx_orders_tracking_number 
ON orders(tracking_number) WHERE tracking_number IS NOT NULL;

-- Index for order items by order_id (already exists but ensuring it's there)
CREATE INDEX IF NOT EXISTS idx_order_items_order_id 
ON order_items(order_id);

-- Index for order items by product_id (for product-based queries)
CREATE INDEX IF NOT EXISTS idx_order_items_product_id 
ON order_items(product_id);

-- Add GIN index for product_snapshot JSONB search (for searching product names in orders)
CREATE INDEX IF NOT EXISTS idx_order_items_product_snapshot_gin 
ON order_items USING gin(product_snapshot);

-- Analyze tables to update statistics for query planner
ANALYZE orders;
ANALYZE order_items;
