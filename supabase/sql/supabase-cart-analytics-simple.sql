-- Simplified Cart Analytics Schema
-- Requirements addressed:
-- - Track add-to-cart events with product details
-- - Monitor cart abandonment patterns
-- - Implement cart value and conversion tracking

-- Cart Analytics Events Table
-- Stores all cart-related events (add, remove, update, view, etc.)
CREATE TABLE IF NOT EXISTS cart_analytics_events (
    id BIGSERIAL PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('cart_add', 'cart_remove', 'cart_update', 'cart_view', 'cart_abandon', 'cart_checkout_start', 'cart_checkout_complete')),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    cart_value DECIMAL(10,2) NOT NULL DEFAULT 0,
    item_count INTEGER NOT NULL DEFAULT 0,
    product_id VARCHAR(255),
    product_name VARCHAR(500),
    product_price DECIMAL(10,2),
    product_category VARCHAR(255),
    product_quantity INTEGER,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Basic indexes for cart analytics events
CREATE INDEX IF NOT EXISTS idx_cart_events_session_id ON cart_analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_cart_events_event_type ON cart_analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_cart_events_timestamp ON cart_analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_cart_events_product_id ON cart_analytics_events(product_id);

-- Cart Conversion Metrics Table
-- Tracks conversion funnel from cart creation to checkout completion
CREATE TABLE IF NOT EXISTS cart_conversion_metrics (
    id BIGSERIAL PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    cart_created_at TIMESTAMPTZ NOT NULL,
    cart_value DECIMAL(10,2) NOT NULL DEFAULT 0,
    item_count INTEGER NOT NULL DEFAULT 0,
    time_to_conversion BIGINT, -- milliseconds
    conversion_stage VARCHAR(50) NOT NULL CHECK (conversion_stage IN ('cart_created', 'checkout_started', 'checkout_completed')),
    products JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Basic indexes for conversion metrics
CREATE INDEX IF NOT EXISTS idx_conversion_session_id ON cart_conversion_metrics(session_id);
CREATE INDEX IF NOT EXISTS idx_conversion_stage ON cart_conversion_metrics(conversion_stage);
CREATE INDEX IF NOT EXISTS idx_conversion_created_at ON cart_conversion_metrics(cart_created_at);

-- Cart Abandonment Data Table
-- Stores detailed information about cart abandonment events
CREATE TABLE IF NOT EXISTS cart_abandonment_data (
    id BIGSERIAL PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    cart_value DECIMAL(10,2) NOT NULL DEFAULT 0,
    item_count INTEGER NOT NULL DEFAULT 0,
    time_spent_in_cart BIGINT NOT NULL DEFAULT 0, -- milliseconds
    last_activity TIMESTAMPTZ NOT NULL,
    abandonment_stage VARCHAR(50) NOT NULL CHECK (abandonment_stage IN ('cart_view', 'quantity_change', 'checkout_start', 'checkout_process')),
    products JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Basic indexes for abandonment data
CREATE INDEX IF NOT EXISTS idx_abandonment_session_id ON cart_abandonment_data(session_id);
CREATE INDEX IF NOT EXISTS idx_abandonment_stage ON cart_abandonment_data(abandonment_stage);
CREATE INDEX IF NOT EXISTS idx_abandonment_last_activity ON cart_abandonment_data(last_activity);
CREATE INDEX IF NOT EXISTS idx_abandonment_cart_value ON cart_abandonment_data(cart_value);

-- Daily Cart Analytics Table
-- Aggregated daily metrics for cart performance
CREATE TABLE IF NOT EXISTS daily_cart_analytics (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    cart_additions INTEGER NOT NULL DEFAULT 0,
    cart_views INTEGER NOT NULL DEFAULT 0,
    checkout_starts INTEGER NOT NULL DEFAULT 0,
    checkout_completions INTEGER NOT NULL DEFAULT 0,
    cart_abandonment_count INTEGER NOT NULL DEFAULT 0,
    total_cart_value DECIMAL(12,2) NOT NULL DEFAULT 0,
    conversion_rate DECIMAL(5,2) NOT NULL DEFAULT 0, -- percentage
    abandonment_rate DECIMAL(5,2) NOT NULL DEFAULT 0, -- percentage
    avg_cart_value DECIMAL(10,2) NOT NULL DEFAULT 0,
    avg_items_per_cart DECIMAL(5,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Basic indexes for daily cart analytics
CREATE INDEX IF NOT EXISTS idx_daily_cart_date ON daily_cart_analytics(date);
CREATE INDEX IF NOT EXISTS idx_daily_cart_conversion_rate ON daily_cart_analytics(conversion_rate);
CREATE INDEX IF NOT EXISTS idx_daily_cart_abandonment_rate ON daily_cart_analytics(abandonment_rate);

-- Simple views for analytics querying

-- Cart Conversion Funnel View
CREATE OR REPLACE VIEW cart_conversion_funnel AS
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

-- Top Abandoned Products View
CREATE OR REPLACE VIEW top_abandoned_products AS
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

-- Cart Performance Summary View
CREATE OR REPLACE VIEW cart_performance_summary AS
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