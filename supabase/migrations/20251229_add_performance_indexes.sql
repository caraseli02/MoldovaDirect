-- =============================================================================
-- Migration: Add Performance Indexes for E-commerce Optimization
-- GitHub Issue: #175 - Deploy 20+ Missing Database Indexes
-- Date: 2025-12-29
-- Description: This migration adds missing indexes identified through analysis
--              of common e-commerce query patterns to improve performance.
--
-- IMPORTANT: All indexes use CREATE INDEX IF NOT EXISTS for idempotency
-- =============================================================================

-- =============================================================================
-- 1. PRODUCTS TABLE INDEXES (7 new indexes)
-- =============================================================================

-- Index for product price range queries (e.g., filtering by price)
CREATE INDEX IF NOT EXISTS idx_products_price_eur
  ON products(price_eur);

-- Composite index for category browsing with price sorting
CREATE INDEX IF NOT EXISTS idx_products_category_price
  ON products(category_id, price_eur)
  WHERE is_active = true;

-- Composite index for category browsing with date sorting (newest first)
CREATE INDEX IF NOT EXISTS idx_products_category_created
  ON products(category_id, created_at DESC)
  WHERE is_active = true;

-- Index for products with compare_at_price (sale items)
CREATE INDEX IF NOT EXISTS idx_products_on_sale
  ON products(category_id, price_eur, compare_at_price_eur)
  WHERE is_active = true AND compare_at_price_eur IS NOT NULL;

-- Index for low stock alerts
CREATE INDEX IF NOT EXISTS idx_products_low_stock
  ON products(stock_quantity, low_stock_threshold)
  WHERE is_active = true AND stock_quantity <= low_stock_threshold;

-- Index for products needing reorder
CREATE INDEX IF NOT EXISTS idx_products_needs_reorder
  ON products(stock_quantity, reorder_point)
  WHERE is_active = true;

-- Index for product weight (shipping calculations)
CREATE INDEX IF NOT EXISTS idx_products_weight
  ON products(weight_kg)
  WHERE is_active = true AND weight_kg IS NOT NULL;

-- =============================================================================
-- 2. CATEGORIES TABLE INDEXES (2 new indexes)
-- =============================================================================

-- Composite index for active categories with sorting
CREATE INDEX IF NOT EXISTS idx_categories_active_sorted
  ON categories(is_active, sort_order)
  WHERE is_active = true;

-- Index for category hierarchy queries (finding children)
CREATE INDEX IF NOT EXISTS idx_categories_parent_active
  ON categories(parent_id, is_active, sort_order)
  WHERE is_active = true;

-- =============================================================================
-- 3. ADDRESSES TABLE INDEXES (3 new indexes)
-- =============================================================================

-- Index for finding user's addresses by type
CREATE INDEX IF NOT EXISTS idx_addresses_user_type
  ON addresses(user_id, type);

-- Index for finding default addresses
CREATE INDEX IF NOT EXISTS idx_addresses_user_default
  ON addresses(user_id, is_default)
  WHERE is_default = true;

-- Index for addresses by country (potential shipping zone filtering)
CREATE INDEX IF NOT EXISTS idx_addresses_country
  ON addresses(country);

-- =============================================================================
-- 4. ORDERS TABLE INDEXES (5 new indexes)
-- =============================================================================

-- Index for orders by payment method (reporting)
CREATE INDEX IF NOT EXISTS idx_orders_payment_method
  ON orders(payment_method);

-- Composite index for revenue reports (date range + status)
CREATE INDEX IF NOT EXISTS idx_orders_revenue_reporting
  ON orders(created_at, status, total_eur)
  WHERE status NOT IN ('cancelled');

-- Index for shipped orders tracking
CREATE INDEX IF NOT EXISTS idx_orders_shipped_at
  ON orders(shipped_at DESC)
  WHERE shipped_at IS NOT NULL;

-- Index for delivered orders
CREATE INDEX IF NOT EXISTS idx_orders_delivered_at
  ON orders(delivered_at DESC)
  WHERE delivered_at IS NOT NULL;

-- Composite index for admin search by date and payment status
CREATE INDEX IF NOT EXISTS idx_orders_date_payment_search
  ON orders(created_at DESC, payment_status, status);

-- =============================================================================
-- 5. ORDER ITEMS TABLE INDEXES (2 new indexes)
-- =============================================================================

-- Index for calculating product sales totals
CREATE INDEX IF NOT EXISTS idx_order_items_product_total
  ON order_items(product_id, total_eur);

-- Index for order item quantity analysis
CREATE INDEX IF NOT EXISTS idx_order_items_product_quantity
  ON order_items(product_id, quantity);

-- =============================================================================
-- 6. INVENTORY LOGS TABLE INDEXES (2 new indexes)
-- =============================================================================

-- Index for inventory adjustments by creator
CREATE INDEX IF NOT EXISTS idx_inventory_logs_created_by
  ON inventory_logs(created_by)
  WHERE created_by IS NOT NULL;

-- Index for inventory changes by date (recent first)
CREATE INDEX IF NOT EXISTS idx_inventory_logs_created_at_desc
  ON inventory_logs(created_at DESC);

-- =============================================================================
-- 7. PROFILES TABLE INDEXES (2 new indexes)
-- =============================================================================

-- Index for profiles by language preference (locale-based communications)
CREATE INDEX IF NOT EXISTS idx_profiles_language
  ON profiles(preferred_language);

-- Composite index for admin user listing with date
CREATE INDEX IF NOT EXISTS idx_profiles_role_created
  ON profiles(role, created_at DESC);

-- =============================================================================
-- 8. SUPPORT TICKETS COMPOSITE INDEXES (2 new indexes)
-- =============================================================================

-- Composite index for ticket dashboard (status + priority + date)
CREATE INDEX IF NOT EXISTS idx_support_tickets_dashboard
  ON support_tickets(status, priority, created_at DESC);

-- Composite index for user's ticket history
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_status
  ON support_tickets(user_id, status, created_at DESC);

-- =============================================================================
-- 9. ORDER RETURNS COMPOSITE INDEXES (2 new indexes)
-- =============================================================================

-- Composite index for returns dashboard
CREATE INDEX IF NOT EXISTS idx_order_returns_dashboard
  ON order_returns(status, requested_at DESC);

-- Composite index for user's return history
CREATE INDEX IF NOT EXISTS idx_order_returns_user_status
  ON order_returns(user_id, status, requested_at DESC);

-- =============================================================================
-- 10. USER ADDRESSES TABLE INDEXES (1 new index)
-- =============================================================================

-- Index for finding addresses by city (potential local delivery features)
CREATE INDEX IF NOT EXISTS idx_user_addresses_city
  ON user_addresses(city);

-- =============================================================================
-- 11. CART ANALYTICS COMPOSITE INDEXES (2 new indexes)
-- =============================================================================

-- Composite index for cart funnel analysis by date and event type
CREATE INDEX IF NOT EXISTS idx_cart_events_date_type
  ON cart_analytics_events(DATE(timestamp), event_type);

-- Index for cart value analysis
CREATE INDEX IF NOT EXISTS idx_cart_events_value
  ON cart_analytics_events(cart_value DESC)
  WHERE event_type IN ('cart_abandon', 'cart_checkout_complete');

-- =============================================================================
-- 12. AUDIT LOGS COMPOSITE INDEX (1 new index)
-- =============================================================================

-- Composite index for audit log filtering by resource and action
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_action
  ON audit_logs(resource_type, action, created_at DESC);

-- =============================================================================
-- 13. USER ACTIVITY LOGS COMPOSITE INDEXES (2 new indexes)
-- =============================================================================

-- Composite index for session activity analysis
CREATE INDEX IF NOT EXISTS idx_user_activity_session
  ON user_activity_logs(session_id, activity_type, created_at);

-- Index for order-related activity
CREATE INDEX IF NOT EXISTS idx_user_activity_order
  ON user_activity_logs(order_id)
  WHERE order_id IS NOT NULL;

-- =============================================================================
-- UPDATE TABLE STATISTICS FOR QUERY PLANNER
-- =============================================================================

ANALYZE products;
ANALYZE categories;
ANALYZE addresses;
ANALYZE orders;
ANALYZE order_items;
ANALYZE inventory_logs;
ANALYZE profiles;
ANALYZE support_tickets;
ANALYZE order_returns;
ANALYZE user_addresses;
ANALYZE cart_analytics_events;
ANALYZE audit_logs;
ANALYZE user_activity_logs;

-- =============================================================================
-- DOCUMENTATION COMMENTS
-- =============================================================================

COMMENT ON INDEX idx_products_price_eur IS 'Index for product price range filtering queries';
COMMENT ON INDEX idx_products_category_price IS 'Composite index for category browsing sorted by price';
COMMENT ON INDEX idx_products_category_created IS 'Composite index for category browsing sorted by newest';
COMMENT ON INDEX idx_products_on_sale IS 'Index for finding products on sale (with compare_at_price)';
COMMENT ON INDEX idx_products_low_stock IS 'Partial index for low stock alerts';
COMMENT ON INDEX idx_products_needs_reorder IS 'Partial index for reorder point notifications';
COMMENT ON INDEX idx_orders_revenue_reporting IS 'Composite index for revenue and sales reports';
COMMENT ON INDEX idx_support_tickets_dashboard IS 'Composite index for admin support ticket dashboard';
COMMENT ON INDEX idx_order_returns_dashboard IS 'Composite index for admin returns dashboard';
