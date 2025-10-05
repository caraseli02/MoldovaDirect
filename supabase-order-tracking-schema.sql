-- Order Tracking Schema Extensions
-- This migration adds tracking functionality to the orders system

-- =============================================
-- ADD TRACKING FIELDS TO ORDERS TABLE
-- =============================================

-- Add tracking fields to existing orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS carrier TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS estimated_delivery TIMESTAMP WITH TIME ZONE;

-- Add comments for documentation
COMMENT ON COLUMN orders.tracking_number IS 'Shipping carrier tracking number';
COMMENT ON COLUMN orders.carrier IS 'Shipping carrier name (e.g., DHL, UPS, FedEx)';
COMMENT ON COLUMN orders.estimated_delivery IS 'Estimated delivery date provided by carrier';

-- =============================================
-- ORDER TRACKING EVENTS TABLE
-- =============================================

-- Create order tracking events table for detailed tracking history
CREATE TABLE IF NOT EXISTS order_tracking_events (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN (
    'label_created',
    'picked_up',
    'in_transit',
    'out_for_delivery',
    'delivered',
    'exception',
    'returned'
  )),
  location TEXT,
  description TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comments for documentation
COMMENT ON TABLE order_tracking_events IS 'Detailed tracking events for order shipments';
COMMENT ON COLUMN order_tracking_events.status IS 'Current tracking status of the shipment';
COMMENT ON COLUMN order_tracking_events.location IS 'Geographic location of the tracking event';
COMMENT ON COLUMN order_tracking_events.description IS 'Human-readable description of the tracking event';
COMMENT ON COLUMN order_tracking_events.timestamp IS 'When the tracking event occurred (carrier time)';

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on order tracking events
ALTER TABLE order_tracking_events ENABLE ROW LEVEL SECURITY;

-- Users can view tracking events for their own orders
CREATE POLICY "Users can view own order tracking" ON order_tracking_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_tracking_events.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- Admin users can insert tracking events (for future admin functionality)
CREATE POLICY "Admins can insert tracking events" ON order_tracking_events
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      -- Note: Add admin role check when role system is implemented
    )
  );

-- Admin users can update tracking events
CREATE POLICY "Admins can update tracking events" ON order_tracking_events
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      -- Note: Add admin role check when role system is implemented
    )
  );

-- =============================================
-- PERFORMANCE INDEXES
-- =============================================

-- Index for finding tracking events by order
CREATE INDEX IF NOT EXISTS order_tracking_events_order_id_idx 
  ON order_tracking_events(order_id);

-- Index for sorting tracking events by timestamp
CREATE INDEX IF NOT EXISTS order_tracking_events_timestamp_idx 
  ON order_tracking_events(timestamp DESC);

-- Composite index for efficient queries by order and timestamp
CREATE INDEX IF NOT EXISTS order_tracking_events_order_timestamp_idx 
  ON order_tracking_events(order_id, timestamp DESC);

-- Index for filtering by status
CREATE INDEX IF NOT EXISTS order_tracking_events_status_idx 
  ON order_tracking_events(status);

-- Index on orders table for tracking number lookups
CREATE INDEX IF NOT EXISTS orders_tracking_number_idx 
  ON orders(tracking_number) WHERE tracking_number IS NOT NULL;

-- Index on orders table for carrier filtering
CREATE INDEX IF NOT EXISTS orders_carrier_idx 
  ON orders(carrier) WHERE carrier IS NOT NULL;

-- Index on orders table for estimated delivery date queries
CREATE INDEX IF NOT EXISTS orders_estimated_delivery_idx 
  ON orders(estimated_delivery) WHERE estimated_delivery IS NOT NULL;

-- Composite index for order history queries with status and date
CREATE INDEX IF NOT EXISTS orders_user_status_created_idx 
  ON orders(user_id, status, created_at DESC);

-- Composite index for order search by user and order number
CREATE INDEX IF NOT EXISTS orders_user_order_number_idx 
  ON orders(user_id, order_number);

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Function to get latest tracking event for an order
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
  FROM order_tracking_events ote
  WHERE ote.order_id = p_order_id
  ORDER BY ote.timestamp DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add a tracking event
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
  -- Insert the tracking event
  INSERT INTO order_tracking_events (
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
  
  -- Update order status based on tracking status
  IF p_status = 'delivered' THEN
    UPDATE orders 
    SET 
      status = 'delivered',
      delivered_at = p_timestamp
    WHERE id = p_order_id;
  ELSIF p_status = 'out_for_delivery' THEN
    UPDATE orders 
    SET status = 'shipped'
    WHERE id = p_order_id AND status != 'delivered';
  ELSIF p_status IN ('in_transit', 'picked_up') THEN
    UPDATE orders 
    SET 
      status = 'shipped',
      shipped_at = COALESCE(shipped_at, p_timestamp)
    WHERE id = p_order_id AND status = 'processing';
  END IF;
  
  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on helper functions
GRANT EXECUTE ON FUNCTION get_latest_tracking_event(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION add_tracking_event(INTEGER, TEXT, TEXT, TEXT, TIMESTAMP WITH TIME ZONE) TO authenticated;

-- =============================================
-- SAMPLE DATA FOR TESTING (OPTIONAL)
-- =============================================

-- Uncomment to insert sample tracking events for testing
/*
-- Example: Add tracking events for an existing order
INSERT INTO order_tracking_events (order_id, status, location, description, timestamp) VALUES
  (1, 'label_created', 'Madrid, Spain', 'Shipping label created', NOW() - INTERVAL '3 days'),
  (1, 'picked_up', 'Madrid, Spain', 'Package picked up by carrier', NOW() - INTERVAL '2 days'),
  (1, 'in_transit', 'Barcelona, Spain', 'Package in transit', NOW() - INTERVAL '1 day'),
  (1, 'out_for_delivery', 'Valencia, Spain', 'Out for delivery', NOW() - INTERVAL '4 hours');
*/
