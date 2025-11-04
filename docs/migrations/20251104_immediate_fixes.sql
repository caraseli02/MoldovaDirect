-- =============================================
-- IMMEDIATE DATABASE FIXES
-- MoldovaDirect E-commerce Platform
-- Date: 2025-11-04
-- Issue: Database performance and security improvements
-- Estimated execution time: 2-3 minutes
-- =============================================

BEGIN;

-- =============================================
-- 1. CRITICAL MISSING INDEXES ON PRODUCTS
-- =============================================

-- Stock quantity filtering
CREATE INDEX IF NOT EXISTS idx_products_stock_quantity
ON products(stock_quantity) WHERE is_active = true;

-- Low stock alerts
CREATE INDEX IF NOT EXISTS idx_products_low_stock
ON products(is_active, stock_quantity, low_stock_threshold)
WHERE is_active = true AND stock_quantity <= low_stock_threshold;

-- Price range filtering
CREATE INDEX IF NOT EXISTS idx_products_price_range
ON products(price_eur) WHERE is_active = true;

-- Category + price sorting
CREATE INDEX IF NOT EXISTS idx_products_category_price
ON products(category_id, price_eur) WHERE is_active = true;

-- Full-text search on name translations
CREATE INDEX IF NOT EXISTS idx_products_name_translations_gin
ON products USING gin(name_translations);

-- Full-text search on description translations
CREATE INDEX IF NOT EXISTS idx_products_description_translations_gin
ON products USING gin(description_translations);

-- Common product listing query
CREATE INDEX IF NOT EXISTS idx_products_active_category_created
ON products(is_active, category_id, created_at DESC)
WHERE is_active = true;

-- =============================================
-- 2. CRITICAL MISSING INDEXES ON ORDERS
-- =============================================

-- Status + payment status filtering
CREATE INDEX IF NOT EXISTS idx_orders_status_payment_status
ON orders(status, payment_status) WHERE status != 'cancelled';

-- Revenue aggregation
CREATE INDEX IF NOT EXISTS idx_orders_created_total
ON orders(created_at DESC, total_eur) WHERE status != 'cancelled';

-- Guest order lookups
CREATE INDEX IF NOT EXISTS idx_orders_guest_email
ON orders(guest_email) WHERE guest_email IS NOT NULL;

-- Payment intent lookups
CREATE INDEX IF NOT EXISTS idx_orders_payment_intent
ON orders(payment_intent_id) WHERE payment_intent_id IS NOT NULL;

-- Fulfillment workflow
CREATE INDEX IF NOT EXISTS idx_orders_fulfillment
ON orders(status, payment_status, created_at DESC)
WHERE status IN ('pending', 'processing') AND payment_status = 'paid';

-- =============================================
-- 3. DATA INTEGRITY CONSTRAINTS
-- =============================================

-- Product prices must be positive
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'products_price_positive'
    AND table_name = 'products'
  ) THEN
    ALTER TABLE products
    ADD CONSTRAINT products_price_positive
    CHECK (price_eur >= 0 AND (compare_at_price_eur IS NULL OR compare_at_price_eur >= price_eur));
  END IF;
END $$;

-- Stock quantities must be non-negative
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'products_stock_non_negative'
    AND table_name = 'products'
  ) THEN
    ALTER TABLE products
    ADD CONSTRAINT products_stock_non_negative
    CHECK (stock_quantity >= 0 AND low_stock_threshold >= 0 AND reorder_point >= 0);
  END IF;
END $$;

-- Order dates must be logical
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'orders_date_logic'
    AND table_name = 'orders'
  ) THEN
    ALTER TABLE orders
    ADD CONSTRAINT orders_date_logic
    CHECK (
      (shipped_at IS NULL OR shipped_at >= created_at) AND
      (delivered_at IS NULL OR delivered_at >= shipped_at)
    );
  END IF;
END $$;

-- Cart expiration must be in future
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'carts_expires_future'
    AND table_name = 'carts'
  ) THEN
    ALTER TABLE carts
    ADD CONSTRAINT carts_expires_future
    CHECK (expires_at IS NULL OR expires_at > created_at);
  END IF;
END $$;

-- =============================================
-- 4. FIX ANALYTICS RLS POLICIES
-- =============================================

-- Drop overly permissive policies
DROP POLICY IF EXISTS "Analytics require authentication" ON daily_analytics;
DROP POLICY IF EXISTS "Product analytics require authentication" ON product_analytics;
DROP POLICY IF EXISTS "User activity logs require authentication" ON user_activity_logs;
DROP POLICY IF EXISTS "Audit logs require authentication" ON audit_logs;

-- Create admin-only policies
CREATE POLICY "Analytics admin only" ON daily_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Product analytics admin only" ON product_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "User activity admin only" ON user_activity_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Audit logs admin only" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- =============================================
-- 5. DASHBOARD STATS MATERIALIZED VIEW
-- =============================================

DROP MATERIALIZED VIEW IF EXISTS dashboard_stats_cache CASCADE;

CREATE MATERIALIZED VIEW dashboard_stats_cache AS
SELECT
  -- Product metrics
  COUNT(*) FILTER (WHERE is_active = true) as active_products,
  COUNT(*) as total_products,
  COUNT(*) FILTER (WHERE is_active = true AND stock_quantity <= low_stock_threshold) as low_stock_products,

  -- User metrics
  (SELECT COUNT(*) FROM profiles) as total_users,
  (SELECT COUNT(*) FROM profiles WHERE created_at >= CURRENT_DATE) as new_users_today,

  -- Order metrics
  (SELECT COUNT(*) FROM orders WHERE status != 'cancelled') as total_orders,
  (SELECT COUNT(*) FROM orders WHERE status = 'pending') as pending_orders,
  (SELECT COUNT(*) FROM orders WHERE status = 'processing') as processing_orders,
  (SELECT COUNT(*) FROM orders WHERE status = 'shipped') as shipped_orders,
  (SELECT COUNT(*) FROM orders WHERE status = 'delivered') as delivered_orders,
  (SELECT COUNT(*) FROM orders WHERE created_at >= CURRENT_DATE AND status != 'cancelled') as orders_today,

  -- Revenue metrics
  (SELECT COALESCE(SUM(total_eur), 0) FROM orders WHERE status != 'cancelled') as total_revenue,
  (SELECT COALESCE(SUM(total_eur), 0) FROM orders WHERE created_at >= CURRENT_DATE AND status != 'cancelled') as revenue_today,
  (SELECT COALESCE(AVG(total_eur), 0) FROM orders WHERE status != 'cancelled') as avg_order_value,

  -- Cache metadata
  NOW() as last_updated
FROM products;

CREATE UNIQUE INDEX idx_dashboard_stats_cache ON dashboard_stats_cache(last_updated);

-- Refresh function
CREATE OR REPLACE FUNCTION refresh_dashboard_stats_cache()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY dashboard_stats_cache;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION refresh_dashboard_stats_cache() IS
'Refreshes the dashboard statistics cache. Should be called every 5 minutes via cron job.';

-- Grant execute permission to service role
GRANT EXECUTE ON FUNCTION refresh_dashboard_stats_cache() TO service_role;

-- Initial refresh
REFRESH MATERIALIZED VIEW dashboard_stats_cache;

-- =============================================
-- 6. ANALYTICS TABLE INDEXES
-- =============================================

-- Activity aggregation queries
CREATE INDEX IF NOT EXISTS idx_user_activity_date_type
ON user_activity_logs(DATE(created_at), activity_type, user_id);

-- Product analytics queries
CREATE INDEX IF NOT EXISTS idx_product_analytics_date_revenue
ON product_analytics(date DESC, revenue DESC);

-- Daily analytics date range queries
CREATE INDEX IF NOT EXISTS idx_daily_analytics_date_range
ON daily_analytics(date DESC)
WHERE date >= CURRENT_DATE - INTERVAL '90 days';

-- =============================================
-- 7. INVENTORY LOGS INDEXES
-- =============================================

-- Inventory audit trail queries
CREATE INDEX IF NOT EXISTS idx_inventory_logs_product_reason_date
ON inventory_logs(product_id, reason, created_at DESC);

-- Order reference lookups
CREATE INDEX IF NOT EXISTS idx_inventory_logs_reference
ON inventory_logs(reference_id, reason)
WHERE reference_id IS NOT NULL;

-- =============================================
-- 8. ANALYZE TABLES FOR QUERY PLANNER
-- =============================================

ANALYZE products;
ANALYZE orders;
ANALYZE order_items;
ANALYZE profiles;
ANALYZE daily_analytics;
ANALYZE product_analytics;
ANALYZE user_activity_logs;
ANALYZE inventory_logs;
ANALYZE cart_items;
ANALYZE carts;

COMMIT;

-- =============================================
-- POST-MIGRATION VERIFICATION
-- =============================================

-- Check index creation
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('products', 'orders', 'user_activity_logs', 'product_analytics', 'inventory_logs')
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Check constraints
SELECT
  conname,
  contype,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE connamespace = 'public'::regnamespace
  AND conrelid::regclass::text IN ('products', 'orders', 'carts')
  AND conname LIKE '%_positive%' OR conname LIKE '%_non_negative%' OR conname LIKE '%_logic%' OR conname LIKE '%_future%'
ORDER BY conrelid, conname;

-- Verify materialized view
SELECT
  'Dashboard cache created:' as status,
  active_products,
  total_users,
  total_orders,
  total_revenue,
  last_updated
FROM dashboard_stats_cache;

-- Check RLS policies
SELECT
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('daily_analytics', 'product_analytics', 'user_activity_logs', 'audit_logs')
ORDER BY tablename, policyname;

-- Summary
SELECT
  'Migration completed successfully!' as status,
  COUNT(*) FILTER (WHERE indexname LIKE 'idx_products%') as products_indexes,
  COUNT(*) FILTER (WHERE indexname LIKE 'idx_orders%') as orders_indexes,
  COUNT(*) FILTER (WHERE indexname LIKE 'idx_user_activity%') as analytics_indexes,
  COUNT(*) as total_new_indexes
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%';
