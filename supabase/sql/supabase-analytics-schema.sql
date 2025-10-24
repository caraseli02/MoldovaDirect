-- Analytics Schema Extension for Admin Dashboard
-- This extends the existing schema with analytics tables and views

-- =============================================
-- ANALYTICS AGGREGATION TABLES
-- =============================================

-- Daily analytics aggregation table
CREATE TABLE IF NOT EXISTS daily_analytics (
  date DATE PRIMARY KEY,
  total_users INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  new_registrations INTEGER DEFAULT 0,
  page_views INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  orders_count INTEGER DEFAULT 0,
  revenue DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product analytics tracking
CREATE TABLE IF NOT EXISTS product_analytics (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  views INTEGER DEFAULT 0,
  cart_additions INTEGER DEFAULT 0,
  purchases INTEGER DEFAULT 0,
  revenue DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, date)
);

-- User activity tracking
CREATE TABLE IF NOT EXISTS user_activity_logs (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('login', 'logout', 'page_view', 'product_view', 'cart_add', 'order_create')),
  page_url TEXT,
  product_id INTEGER REFERENCES products(id),
  order_id INTEGER REFERENCES orders(id),
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit logs for admin actions (from design document)
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id VARCHAR(100),
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR ANALYTICS PERFORMANCE
-- =============================================

-- Daily analytics indexes
CREATE INDEX IF NOT EXISTS daily_analytics_date_idx ON daily_analytics(date);

-- Product analytics indexes
CREATE INDEX IF NOT EXISTS product_analytics_product_id_idx ON product_analytics(product_id);
CREATE INDEX IF NOT EXISTS product_analytics_date_idx ON product_analytics(date);
CREATE INDEX IF NOT EXISTS product_analytics_product_date_idx ON product_analytics(product_id, date);

-- User activity logs indexes
CREATE INDEX IF NOT EXISTS user_activity_logs_user_id_idx ON user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS user_activity_logs_activity_type_idx ON user_activity_logs(activity_type);
CREATE INDEX IF NOT EXISTS user_activity_logs_created_at_idx ON user_activity_logs(created_at);
CREATE INDEX IF NOT EXISTS user_activity_logs_product_id_idx ON user_activity_logs(product_id);

-- Audit logs indexes
CREATE INDEX IF NOT EXISTS audit_logs_user_id_idx ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS audit_logs_resource_type_idx ON audit_logs(resource_type);

-- =============================================
-- ANALYTICS VIEWS FOR EFFICIENT QUERIES
-- =============================================

-- User registration trends view
CREATE OR REPLACE VIEW user_registration_trends AS
SELECT 
  DATE(p.created_at) as date,
  COUNT(*) as registrations,
  COUNT(*) OVER (ORDER BY DATE(p.created_at) ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) as cumulative_users
FROM profiles p
WHERE p.created_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY DATE(p.created_at)
ORDER BY date;

-- Daily user activity summary view
CREATE OR REPLACE VIEW daily_user_activity AS
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

-- Product performance summary view
CREATE OR REPLACE VIEW product_performance_summary AS
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

-- Monthly revenue trends view
CREATE OR REPLACE VIEW monthly_revenue_trends AS
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

-- =============================================
-- FUNCTIONS FOR ANALYTICS AGGREGATION
-- =============================================

-- Function to aggregate daily analytics
CREATE OR REPLACE FUNCTION aggregate_daily_analytics(target_date DATE DEFAULT CURRENT_DATE - INTERVAL '1 day')
RETURNS VOID AS $$
DECLARE
  analytics_date DATE := target_date;
BEGIN
  -- Insert or update daily analytics for the target date
  INSERT INTO daily_analytics (
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
    (SELECT COUNT(*) FROM profiles WHERE DATE(created_at) <= analytics_date),
    COALESCE((SELECT COUNT(DISTINCT user_id) FROM user_activity_logs 
              WHERE DATE(created_at) = analytics_date), 0),
    COALESCE((SELECT COUNT(*) FROM profiles 
              WHERE DATE(created_at) = analytics_date), 0),
    COALESCE((SELECT COUNT(*) FROM user_activity_logs 
              WHERE DATE(created_at) = analytics_date AND activity_type = 'page_view'), 0),
    COALESCE((SELECT COUNT(DISTINCT user_id) FROM user_activity_logs 
              WHERE DATE(created_at) = analytics_date), 0),
    COALESCE((SELECT COUNT(*) FROM orders 
              WHERE DATE(created_at) = analytics_date AND status != 'cancelled'), 0),
    COALESCE((SELECT SUM(total_eur) FROM orders 
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
$$ LANGUAGE plpgsql;

-- Function to update product analytics
CREATE OR REPLACE FUNCTION update_product_analytics(
  p_product_id INTEGER,
  p_activity_type TEXT,
  p_date DATE DEFAULT CURRENT_DATE
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO product_analytics (product_id, date, views, cart_additions, purchases)
  VALUES (
    p_product_id, 
    p_date,
    CASE WHEN p_activity_type = 'view' THEN 1 ELSE 0 END,
    CASE WHEN p_activity_type = 'cart_add' THEN 1 ELSE 0 END,
    CASE WHEN p_activity_type = 'purchase' THEN 1 ELSE 0 END
  )
  ON CONFLICT (product_id, date)
  DO UPDATE SET
    views = product_analytics.views + CASE WHEN p_activity_type = 'view' THEN 1 ELSE 0 END,
    cart_additions = product_analytics.cart_additions + CASE WHEN p_activity_type = 'cart_add' THEN 1 ELSE 0 END,
    purchases = product_analytics.purchases + CASE WHEN p_activity_type = 'purchase' THEN 1 ELSE 0 END,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on analytics tables
ALTER TABLE daily_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Admin-only access policies (will be enhanced with proper role checking)
CREATE POLICY "Analytics require authentication" ON daily_analytics
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Product analytics require authentication" ON product_analytics
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "User activity logs require authentication" ON user_activity_logs
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Audit logs require authentication" ON audit_logs
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow inserts for system operations
CREATE POLICY "System can insert analytics" ON daily_analytics
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can insert product analytics" ON product_analytics
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can insert user activity" ON user_activity_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (true);

-- Allow updates for system operations
CREATE POLICY "System can update analytics" ON daily_analytics
  FOR UPDATE USING (true);

CREATE POLICY "System can update product analytics" ON product_analytics
  FOR UPDATE USING (true);

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================

CREATE TRIGGER update_daily_analytics_updated_at 
  BEFORE UPDATE ON daily_analytics 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_analytics_updated_at 
  BEFORE UPDATE ON product_analytics 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();