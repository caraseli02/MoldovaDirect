-- Add reorder_point column to products table
-- This column is used for inventory management to trigger reorder alerts

ALTER TABLE products ADD COLUMN reorder_point INTEGER DEFAULT 5;

-- Add comment for documentation
COMMENT ON COLUMN products.reorder_point IS 'Minimum stock level that triggers reorder alert';

-- Update existing products to have a reasonable reorder point based on low_stock_threshold
UPDATE products 
SET reorder_point = GREATEST(low_stock_threshold, 5)
WHERE reorder_point IS NULL;

-- Add index for efficient queries on reorder alerts
CREATE INDEX products_reorder_point_idx ON products(reorder_point) WHERE is_active = TRUE;