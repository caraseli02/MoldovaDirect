-- =============================================
-- ROLLBACK SCRIPT FOR 20251104_remaining_fixes.sql
-- MoldovaDirect E-commerce Platform
-- Date: 2025-11-04 (Updated)
-- =============================================
-- WARNING: Only use this if there are critical issues after migration
-- Most changes improve security and performance and should NOT be rolled back
-- =============================================

BEGIN;

-- =============================================
-- 1. ROLLBACK NEW INDEXES (Safe to remove)
-- =============================================

-- Product indexes
DROP INDEX IF EXISTS idx_products_low_stock;
DROP INDEX IF EXISTS idx_products_price_range;
DROP INDEX IF EXISTS idx_products_category_price;
DROP INDEX IF EXISTS idx_products_active_category_created;

-- Admin order indexes
DROP INDEX IF EXISTS idx_orders_status_payment_status;
DROP INDEX IF EXISTS idx_orders_created_total;
DROP INDEX IF EXISTS idx_orders_guest_email;
DROP INDEX IF EXISTS idx_orders_payment_intent;
DROP INDEX IF EXISTS idx_orders_fulfillment;

-- Analytics table indexes
DROP INDEX IF EXISTS idx_user_activity_date_type;
DROP INDEX IF EXISTS idx_product_analytics_date_revenue;
DROP INDEX IF EXISTS idx_daily_analytics_date_range;

-- Inventory logs indexes
DROP INDEX IF EXISTS idx_inventory_logs_product_reason_date;
DROP INDEX IF EXISTS idx_inventory_logs_reference;

-- =============================================
-- 2. ROLLBACK MATERIALIZED VIEW (Safe to remove)
-- =============================================

DROP MATERIALIZED VIEW IF EXISTS dashboard_stats_cache CASCADE;
DROP FUNCTION IF EXISTS refresh_dashboard_stats_cache();

-- =============================================
-- 3. DO NOT ROLLBACK: Data Integrity Constraints
-- =============================================
-- Constraints ensure data integrity and should NOT be removed
-- unless they are causing data insertion failures
--
-- If you MUST remove constraints (not recommended):
--
-- ALTER TABLE products DROP CONSTRAINT IF EXISTS products_price_positive;
-- ALTER TABLE products DROP CONSTRAINT IF EXISTS products_stock_non_negative;
-- ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_date_logic;
-- ALTER TABLE carts DROP CONSTRAINT IF EXISTS carts_expires_future;

-- =============================================
-- 4. ROLLBACK RLS POLICIES (NOT RECOMMENDED - SECURITY RISK)
-- =============================================
-- The new policies fix security issues and should NOT be rolled back
-- Rolling back compromises security by allowing any authenticated user to see analytics
--
-- If you MUST rollback (compromises security):
--
-- DROP POLICY IF EXISTS "Analytics admin only" ON daily_analytics;
-- DROP POLICY IF EXISTS "Product analytics admin only" ON product_analytics;
-- DROP POLICY IF EXISTS "User activity admin only" ON user_activity_logs;
-- DROP POLICY IF EXISTS "Audit logs admin only" ON audit_logs;
--
-- -- Restore old permissive policies (NOT RECOMMENDED - SECURITY RISK)
-- CREATE POLICY "Analytics require authentication" ON daily_analytics
--   FOR SELECT USING (auth.role() = 'authenticated');
--
-- CREATE POLICY "Product analytics require authentication" ON product_analytics
--   FOR SELECT USING (auth.role() = 'authenticated');
--
-- CREATE POLICY "User activity logs require authentication" ON user_activity_logs
--   FOR SELECT USING (auth.role() = 'authenticated');

COMMIT;

-- Verify rollback
SELECT 'Rollback completed' as status;
