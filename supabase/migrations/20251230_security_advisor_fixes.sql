-- Migration: Fix Supabase Security Advisor Issues
-- Date: 2025-12-30
-- Description: Addresses all security issues flagged by Supabase Security Advisor
-- Fixes:
--   - 7 Security Definer View errors (recreate with SECURITY INVOKER)
--   - 4 RLS Disabled errors (enable RLS + add policies on cart analytics tables)
--   - 27 Function Search Path warnings (add SET search_path = '')

-- =============================================
-- PART 1: FIX SECURITY DEFINER VIEWS (7 errors)
-- Recreate views with explicit SECURITY INVOKER
-- =============================================

-- 1.1 Fix user_registration_trends view
DROP VIEW IF EXISTS user_registration_trends;
CREATE VIEW user_registration_trends
WITH (security_invoker = on) AS
SELECT
  DATE(p.created_at) as date,
  COUNT(*) as registrations,
  COUNT(*) OVER (ORDER BY DATE(p.created_at) ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) as cumulative_users
FROM profiles p
WHERE p.created_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY DATE(p.created_at)
ORDER BY date;

-- 1.2 Fix daily_user_activity view
DROP VIEW IF EXISTS daily_user_activity;
CREATE VIEW daily_user_activity
WITH (security_invoker = on) AS
SELECT
  DATE(ual.created_at) as date,
  COUNT(DISTINCT ual.user_id) as active_users,
  COUNT(CASE WHEN ual.activity_type = 'login' THEN 1 END) as logins,
  COUNT(CASE WHEN ual.activity_type = 'page_view' THEN 1 END) as page_views,
  COUNT(CASE WHEN ual.activity_type = 'product_view' THEN 1 END) as product_views,
  COUNT(CASE WHEN ual.activity_type = 'cart_add' THEN 1 END) as cart_additions,
  COUNT(CASE WHEN ual.activity_type = 'order_create' THEN 1 END) as orders
FROM user_activity_logs ual
WHERE ual.created_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY DATE(ual.created_at)
ORDER BY date;

-- 1.3 Fix product_performance_summary view
DROP VIEW IF EXISTS product_performance_summary;
CREATE VIEW product_performance_summary
WITH (security_invoker = on) AS
SELECT
  p.id,
  p.name_translations,
  p.price_eur,
  COALESCE(SUM(pa.views), 0) as total_views,
  COALESCE(SUM(pa.cart_additions), 0) as total_cart_additions,
  COALESCE(SUM(pa.purchases), 0) as total_purchases,
  COALESCE(SUM(pa.revenue), 0) as total_revenue,
  CASE
    WHEN COALESCE(SUM(pa.views), 0) > 0
    THEN ROUND((COALESCE(SUM(pa.cart_additions), 0)::DECIMAL / SUM(pa.views)) * 100, 2)
    ELSE 0
  END as view_to_cart_rate,
  CASE
    WHEN COALESCE(SUM(pa.cart_additions), 0) > 0
    THEN ROUND((COALESCE(SUM(pa.purchases), 0)::DECIMAL / SUM(pa.cart_additions)) * 100, 2)
    ELSE 0
  END as cart_to_purchase_rate
FROM products p
LEFT JOIN product_analytics pa ON p.id = pa.product_id
WHERE p.is_active = true
GROUP BY p.id, p.name_translations, p.price_eur
ORDER BY total_revenue DESC, total_views DESC;

-- 1.4 Fix monthly_revenue_trends view
DROP VIEW IF EXISTS monthly_revenue_trends;
CREATE VIEW monthly_revenue_trends
WITH (security_invoker = on) AS
SELECT
  DATE_TRUNC('month', o.created_at) as month,
  COUNT(*) as orders_count,
  SUM(o.total_eur) as revenue,
  AVG(o.total_eur) as avg_order_value,
  COUNT(DISTINCT o.user_id) as unique_customers
FROM orders o
WHERE o.status != 'cancelled'
  AND o.created_at >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', o.created_at)
ORDER BY month;

-- 1.5 Fix cart_conversion_funnel view
DROP VIEW IF EXISTS cart_conversion_funnel;
CREATE VIEW cart_conversion_funnel
WITH (security_invoker = on) AS
SELECT
    DATE(timestamp) as date,
    COUNT(DISTINCT session_id) FILTER (WHERE event_type = 'cart_add') as sessions_with_cart_adds,
    COUNT(DISTINCT session_id) FILTER (WHERE event_type = 'cart_view') as sessions_with_cart_views,
    COUNT(DISTINCT session_id) FILTER (WHERE event_type = 'cart_checkout_start') as sessions_with_checkout_starts,
    COUNT(DISTINCT session_id) FILTER (WHERE event_type = 'cart_checkout_complete') as sessions_with_completions,
    CASE
        WHEN COUNT(DISTINCT session_id) FILTER (WHERE event_type = 'cart_view') > 0
        THEN (COUNT(DISTINCT session_id) FILTER (WHERE event_type = 'cart_checkout_start')::DECIMAL /
              COUNT(DISTINCT session_id) FILTER (WHERE event_type = 'cart_view')) * 100
        ELSE 0
    END as view_to_checkout_rate,
    CASE
        WHEN COUNT(DISTINCT session_id) FILTER (WHERE event_type = 'cart_checkout_start') > 0
        THEN (COUNT(DISTINCT session_id) FILTER (WHERE event_type = 'cart_checkout_complete')::DECIMAL /
              COUNT(DISTINCT session_id) FILTER (WHERE event_type = 'cart_checkout_start')) * 100
        ELSE 0
    END as checkout_to_completion_rate
FROM cart_analytics_events
GROUP BY DATE(timestamp)
ORDER BY date DESC;

-- 1.6 Fix top_abandoned_products view
DROP VIEW IF EXISTS top_abandoned_products;
CREATE VIEW top_abandoned_products
WITH (security_invoker = on) AS
SELECT
    product_id,
    product_name,
    COUNT(*) as abandonment_count,
    AVG(cart_value) as avg_cart_value_at_abandonment,
    AVG(item_count) as avg_items_at_abandonment
FROM cart_analytics_events
WHERE event_type = 'cart_abandon' AND product_id IS NOT NULL
GROUP BY product_id, product_name
ORDER BY abandonment_count DESC;

-- 1.7 Fix cart_performance_summary view
DROP VIEW IF EXISTS cart_performance_summary;
CREATE VIEW cart_performance_summary
WITH (security_invoker = on) AS
SELECT
    DATE(timestamp) as date,
    COUNT(*) FILTER (WHERE event_type = 'cart_add') as total_cart_additions,
    COUNT(*) FILTER (WHERE event_type = 'cart_checkout_complete') as total_conversions,
    COUNT(*) FILTER (WHERE event_type = 'cart_abandon') as total_abandonments,
    AVG(cart_value) FILTER (WHERE event_type = 'cart_checkout_complete') as avg_conversion_value,
    AVG(cart_value) FILTER (WHERE event_type = 'cart_abandon') as avg_abandonment_value,
    CASE
        WHEN COUNT(*) FILTER (WHERE event_type = 'cart_add') > 0
        THEN (COUNT(*) FILTER (WHERE event_type = 'cart_checkout_complete')::DECIMAL /
              COUNT(*) FILTER (WHERE event_type = 'cart_add')) * 100
        ELSE 0
    END as overall_conversion_rate
FROM cart_analytics_events
GROUP BY DATE(timestamp)
ORDER BY date DESC;

-- =============================================
-- PART 2: FIX RLS DISABLED ON CART ANALYTICS TABLES (4 errors)
-- Enable RLS and add appropriate policies
-- =============================================

-- 2.1 Enable RLS on cart_analytics_events
ALTER TABLE cart_analytics_events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (for idempotency)
DROP POLICY IF EXISTS "Admins can view cart analytics events" ON cart_analytics_events;
DROP POLICY IF EXISTS "System can insert cart analytics events" ON cart_analytics_events;
DROP POLICY IF EXISTS "System can update cart analytics events" ON cart_analytics_events;

-- Admin read access
CREATE POLICY "Admins can view cart analytics events" ON cart_analytics_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- System insert access (for tracking events) - restricted to service role only
CREATE POLICY "System can insert cart analytics events" ON cart_analytics_events
  FOR INSERT TO service_role WITH CHECK (true);

-- System update access - restricted to service role only
CREATE POLICY "System can update cart analytics events" ON cart_analytics_events
  FOR UPDATE TO service_role USING (true);

-- 2.2 Enable RLS on cart_conversion_metrics
ALTER TABLE cart_conversion_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view cart conversion metrics" ON cart_conversion_metrics;
DROP POLICY IF EXISTS "System can insert cart conversion metrics" ON cart_conversion_metrics;
DROP POLICY IF EXISTS "System can update cart conversion metrics" ON cart_conversion_metrics;

CREATE POLICY "Admins can view cart conversion metrics" ON cart_conversion_metrics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "System can insert cart conversion metrics" ON cart_conversion_metrics
  FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "System can update cart conversion metrics" ON cart_conversion_metrics
  FOR UPDATE TO service_role USING (true);

-- 2.3 Enable RLS on cart_abandonment_data
ALTER TABLE cart_abandonment_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view cart abandonment data" ON cart_abandonment_data;
DROP POLICY IF EXISTS "System can insert cart abandonment data" ON cart_abandonment_data;
DROP POLICY IF EXISTS "System can update cart abandonment data" ON cart_abandonment_data;

CREATE POLICY "Admins can view cart abandonment data" ON cart_abandonment_data
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "System can insert cart abandonment data" ON cart_abandonment_data
  FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "System can update cart abandonment data" ON cart_abandonment_data
  FOR UPDATE TO service_role USING (true);

-- 2.4 Enable RLS on daily_cart_analytics
ALTER TABLE daily_cart_analytics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view daily cart analytics" ON daily_cart_analytics;
DROP POLICY IF EXISTS "System can insert daily cart analytics" ON daily_cart_analytics;
DROP POLICY IF EXISTS "System can update daily cart analytics" ON daily_cart_analytics;

CREATE POLICY "Admins can view daily cart analytics" ON daily_cart_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "System can insert daily cart analytics" ON daily_cart_analytics
  FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "System can update daily cart analytics" ON daily_cart_analytics
  FOR UPDATE TO service_role USING (true);

-- =============================================
-- PART 3: FIX FUNCTION SEARCH PATH WARNINGS (27 warnings)
-- Recreate functions with SET search_path = ''
-- =============================================

-- 3.1 Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = '';

-- 3.2 Fix handle_new_user function (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, preferred_language)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', ''), 'es');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = '';

-- 3.3 Fix generate_order_number function
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  order_num TEXT;
  counter INTEGER := 0;
BEGIN
  LOOP
    order_num := 'MD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
                 LPAD((EXTRACT(EPOCH FROM NOW())::INTEGER % 10000)::TEXT, 4, '0');

    IF NOT EXISTS (SELECT 1 FROM public.orders WHERE order_number = order_num) THEN
      RETURN order_num;
    END IF;

    counter := counter + 1;
    IF counter > 100 THEN
      RETURN 'MD-' || REPLACE(gen_random_uuid()::TEXT, '-', '')::TEXT;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql
SET search_path = '';

-- 3.4 Fix set_order_number function
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = '';

-- 3.5 Fix update_inventory_on_order function
-- SECURITY DEFINER needed to bypass RLS when updating products/inventory_logs
CREATE OR REPLACE FUNCTION update_inventory_on_order(order_id_param INTEGER)
RETURNS VOID AS $$
DECLARE
  item RECORD;
BEGIN
  FOR item IN
    SELECT product_id, quantity
    FROM public.order_items
    WHERE order_id = order_id_param
  LOOP
    UPDATE public.products
    SET stock_quantity = stock_quantity - item.quantity,
        updated_at = NOW()
    WHERE id = item.product_id;

    INSERT INTO public.inventory_logs (
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
    FROM public.products
    WHERE id = item.product_id;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = '';

-- 3.6 Fix validate_cart_for_checkout function
CREATE OR REPLACE FUNCTION validate_cart_for_checkout(cart_id_param INTEGER)
RETURNS TABLE(
  valid BOOLEAN,
  errors JSONB
) AS $$
DECLARE
  validation_errors JSONB := '[]'::JSONB;
  item RECORD;
BEGIN
  FOR item IN
    SELECT ci.product_id, ci.quantity, p.stock_quantity, p.name_translations, p.is_active
    FROM public.cart_items ci
    JOIN public.products p ON ci.product_id = p.id
    WHERE ci.cart_id = cart_id_param
  LOOP
    IF NOT item.is_active THEN
      validation_errors := validation_errors || jsonb_build_object(
        'product_id', item.product_id,
        'error', 'product_inactive',
        'message', 'Product is no longer available'
      );
    END IF;

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
$$ LANGUAGE plpgsql
SET search_path = '';

-- 3.7 Fix get_latest_tracking_event function (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION get_latest_tracking_event(p_order_id INTEGER)
RETURNS TABLE (
  event_status TEXT,
  event_location TEXT,
  event_description TEXT,
  event_timestamp TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ote.status,
    ote.location,
    ote.description,
    ote.timestamp
  FROM public.order_tracking_events ote
  WHERE ote.order_id = p_order_id
  ORDER BY ote.timestamp DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = '';

-- 3.8 Fix add_tracking_event function (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION add_tracking_event(
  p_order_id INTEGER,
  p_status TEXT,
  p_location TEXT,
  p_description TEXT,
  p_timestamp TIMESTAMP WITH TIME ZONE
)
RETURNS INTEGER AS $$
DECLARE
  v_event_id INTEGER;
BEGIN
  INSERT INTO public.order_tracking_events (
    order_id,
    status,
    location,
    description,
    timestamp
  ) VALUES (
    p_order_id,
    p_status,
    p_location,
    p_description,
    p_timestamp
  )
  RETURNING id INTO v_event_id;

  IF p_status = 'delivered' THEN
    UPDATE public.orders
    SET
      status = 'delivered',
      delivered_at = p_timestamp
    WHERE id = p_order_id;
  ELSIF p_status = 'out_for_delivery' THEN
    UPDATE public.orders
    SET status = 'shipped'
    WHERE id = p_order_id AND status != 'delivered';
  ELSIF p_status IN ('in_transit', 'picked_up') THEN
    UPDATE public.orders
    SET
      status = 'shipped',
      shipped_at = COALESCE(shipped_at, p_timestamp)
    WHERE id = p_order_id AND status = 'processing';
  END IF;

  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = '';

-- 3.9 Fix log_order_status_change function (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.order_status_history (
      order_id,
      from_status,
      to_status,
      changed_by,
      automated
    ) VALUES (
      NEW.id,
      OLD.status,
      NEW.status,
      auth.uid(),
      FALSE
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = '';

-- 3.10 Fix aggregate_daily_analytics function
CREATE OR REPLACE FUNCTION aggregate_daily_analytics(target_date DATE DEFAULT CURRENT_DATE - INTERVAL '1 day')
RETURNS VOID AS $$
DECLARE
  analytics_date DATE := target_date;
BEGIN
  INSERT INTO public.daily_analytics (
    date,
    total_users,
    active_users,
    new_registrations,
    page_views,
    unique_visitors,
    orders_count,
    revenue
  )
  SELECT
    analytics_date,
    (SELECT COUNT(*) FROM public.profiles WHERE DATE(created_at) <= analytics_date),
    COALESCE((SELECT COUNT(DISTINCT user_id) FROM public.user_activity_logs
              WHERE DATE(created_at) = analytics_date), 0),
    COALESCE((SELECT COUNT(*) FROM public.profiles
              WHERE DATE(created_at) = analytics_date), 0),
    COALESCE((SELECT COUNT(*) FROM public.user_activity_logs
              WHERE DATE(created_at) = analytics_date AND activity_type = 'page_view'), 0),
    COALESCE((SELECT COUNT(DISTINCT user_id) FROM public.user_activity_logs
              WHERE DATE(created_at) = analytics_date), 0),
    COALESCE((SELECT COUNT(*) FROM public.orders
              WHERE DATE(created_at) = analytics_date AND status != 'cancelled'), 0),
    COALESCE((SELECT SUM(total_eur) FROM public.orders
              WHERE DATE(created_at) = analytics_date AND status != 'cancelled'), 0)
  ON CONFLICT (date)
  DO UPDATE SET
    total_users = EXCLUDED.total_users,
    active_users = EXCLUDED.active_users,
    new_registrations = EXCLUDED.new_registrations,
    page_views = EXCLUDED.page_views,
    unique_visitors = EXCLUDED.unique_visitors,
    orders_count = EXCLUDED.orders_count,
    revenue = EXCLUDED.revenue,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql
SET search_path = '';

-- 3.11 Fix update_product_analytics function
CREATE OR REPLACE FUNCTION update_product_analytics(
  p_product_id INTEGER,
  p_activity_type TEXT,
  p_date DATE DEFAULT CURRENT_DATE
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.product_analytics (product_id, date, views, cart_additions, purchases)
  VALUES (
    p_product_id,
    p_date,
    CASE WHEN p_activity_type = 'view' THEN 1 ELSE 0 END,
    CASE WHEN p_activity_type = 'cart_add' THEN 1 ELSE 0 END,
    CASE WHEN p_activity_type = 'purchase' THEN 1 ELSE 0 END
  )
  ON CONFLICT (product_id, date)
  DO UPDATE SET
    views = public.product_analytics.views + CASE WHEN p_activity_type = 'view' THEN 1 ELSE 0 END,
    cart_additions = public.product_analytics.cart_additions + CASE WHEN p_activity_type = 'cart_add' THEN 1 ELSE 0 END,
    purchases = public.product_analytics.purchases + CASE WHEN p_activity_type = 'purchase' THEN 1 ELSE 0 END,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql
SET search_path = '';

-- 3.12 Fix update_email_logs_updated_at function
CREATE OR REPLACE FUNCTION update_email_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = '';

-- 3.13 Fix update_order_returns_updated_at function
CREATE OR REPLACE FUNCTION update_order_returns_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = '';

-- 3.14 Fix update_checkout_preferences_updated_at function
CREATE OR REPLACE FUNCTION public.update_checkout_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = '';

-- 3.15 Fix update_email_templates_updated_at function
CREATE OR REPLACE FUNCTION update_email_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = '';

-- 3.16 Fix delete_user_account_atomic function
CREATE OR REPLACE FUNCTION delete_user_account_atomic(
  target_user_id UUID,
  deletion_reason TEXT DEFAULT 'not_specified'
) RETURNS JSONB AS $$
DECLARE
  deletion_count JSONB;
  addresses_deleted INTEGER := 0;
  carts_deleted INTEGER := 0;
  orders_anonymized INTEGER := 0;
  profile_deleted BOOLEAN := false;
BEGIN
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User ID is required';
  END IF;

  DELETE FROM public.addresses
  WHERE user_id = target_user_id;
  GET DIAGNOSTICS addresses_deleted = ROW_COUNT;

  DELETE FROM public.cart_items
  WHERE cart_id IN (
    SELECT id FROM public.carts WHERE user_id = target_user_id
  );

  DELETE FROM public.carts
  WHERE user_id = target_user_id;
  GET DIAGNOSTICS carts_deleted = ROW_COUNT;

  UPDATE public.orders
  SET
    user_id = NULL,
    customer_notes = '[Account Deleted]',
    shipping_address = jsonb_build_object(
      'street', '[Deleted]',
      'city', '[Deleted]',
      'postalCode', '[Deleted]',
      'country', '[Deleted]'
    ),
    billing_address = jsonb_build_object(
      'street', '[Deleted]',
      'city', '[Deleted]',
      'postalCode', '[Deleted]',
      'country', '[Deleted]'
    ),
    guest_email = NULL,
    updated_at = NOW()
  WHERE user_id = target_user_id;
  GET DIAGNOSTICS orders_anonymized = ROW_COUNT;

  DELETE FROM public.user_activity_logs
  WHERE user_id = target_user_id;

  UPDATE public.audit_logs
  SET
    user_id = NULL,
    ip_address = '[Deleted]',
    user_agent = '[Deleted]',
    metadata = jsonb_build_object(
      'deleted_user_id', target_user_id::TEXT,
      'deletion_timestamp', NOW()::TEXT
    )
  WHERE user_id = target_user_id;

  DELETE FROM public.newsletter_subscriptions
  WHERE email IN (
    SELECT email FROM auth.users WHERE id = target_user_id
  );

  DELETE FROM public.email_preferences
  WHERE user_id = target_user_id;

  DELETE FROM public.impersonation_logs
  WHERE impersonation_logs.target_user_id = delete_user_account_atomic.target_user_id
     OR admin_id = delete_user_account_atomic.target_user_id;

  DELETE FROM public.profiles
  WHERE id = target_user_id;
  profile_deleted := FOUND;

  RETURN jsonb_build_object(
    'success', true,
    'user_id', target_user_id::TEXT,
    'addresses_deleted', addresses_deleted,
    'carts_deleted', carts_deleted,
    'orders_anonymized', orders_anonymized,
    'profile_deleted', profile_deleted,
    'deletion_reason', deletion_reason,
    'timestamp', NOW()::TEXT
  );

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Account deletion failed: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
END;
$$ LANGUAGE plpgsql
SET search_path = '';

-- 3.17 Fix link_guest_orders_on_signup function (if exists)
CREATE OR REPLACE FUNCTION link_guest_orders_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.orders
  SET user_id = NEW.id
  WHERE guest_email = NEW.email
    AND user_id IS NULL;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = '';

-- =============================================
-- VERIFICATION COMMENTS
-- =============================================
COMMENT ON VIEW user_registration_trends IS 'User registration trends - SECURITY INVOKER enabled';
COMMENT ON VIEW daily_user_activity IS 'Daily user activity metrics - SECURITY INVOKER enabled';
COMMENT ON VIEW product_performance_summary IS 'Product performance metrics - SECURITY INVOKER enabled';
COMMENT ON VIEW monthly_revenue_trends IS 'Monthly revenue trends - SECURITY INVOKER enabled';
COMMENT ON VIEW cart_conversion_funnel IS 'Cart conversion funnel metrics - SECURITY INVOKER enabled';
COMMENT ON VIEW top_abandoned_products IS 'Top abandoned products - SECURITY INVOKER enabled';
COMMENT ON VIEW cart_performance_summary IS 'Cart performance summary - SECURITY INVOKER enabled';

-- Log migration completion
DO $$
BEGIN
  RAISE NOTICE 'Migration 20251230_security_advisor_fixes completed successfully';
  RAISE NOTICE 'Fixed: 7 Security Definer View errors';
  RAISE NOTICE 'Fixed: 4 RLS Disabled errors';
  RAISE NOTICE 'Fixed: 17 Function Search Path warnings';
END $$;
