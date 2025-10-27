-- Admin Order Management Schema Extension
-- This migration adds tables and fields needed for admin order management

-- =============================================
-- EXTEND ORDERS TABLE WITH ADMIN FIELDS
-- =============================================

-- Add admin-specific fields to orders table
ALTER TABLE orders 
  ADD COLUMN IF NOT EXISTS priority_level INTEGER DEFAULT 1 CHECK (priority_level BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS estimated_ship_date DATE,
  ADD COLUMN IF NOT EXISTS tracking_number TEXT,
  ADD COLUMN IF NOT EXISTS shipping_carrier TEXT,
  ADD COLUMN IF NOT EXISTS fulfillment_progress INTEGER DEFAULT 0 CHECK (fulfillment_progress BETWEEN 0 AND 100);

-- =============================================
-- ORDER STATUS HISTORY TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS order_status_history (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status TEXT NOT NULL CHECK (to_status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  automated BOOLEAN DEFAULT FALSE
);

-- Enable RLS on order_status_history
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

-- Admin can view all status history
CREATE POLICY "Admins can view all order status history" ON order_status_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid()
    )
  );

-- Admin can insert status history
CREATE POLICY "Admins can insert order status history" ON order_status_history
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid()
    )
  );

-- Users can view status history for their own orders
CREATE POLICY "Users can view own order status history" ON order_status_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_status_history.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- =============================================
-- ORDER NOTES TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS order_notes (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  note_type TEXT NOT NULL DEFAULT 'internal' CHECK (note_type IN ('internal', 'customer')),
  content TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on order_notes
ALTER TABLE order_notes ENABLE ROW LEVEL SECURITY;

-- Admin can view all notes
CREATE POLICY "Admins can view all order notes" ON order_notes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid()
    )
  );

-- Admin can insert notes
CREATE POLICY "Admins can insert order notes" ON order_notes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid()
    )
  );

-- Admin can update their own notes
CREATE POLICY "Admins can update own order notes" ON order_notes
  FOR UPDATE USING (
    created_by = auth.uid()
  );

-- Admin can delete their own notes
CREATE POLICY "Admins can delete own order notes" ON order_notes
  FOR DELETE USING (
    created_by = auth.uid()
  );

-- Users can view customer-facing notes for their orders
CREATE POLICY "Users can view customer notes for own orders" ON order_notes
  FOR SELECT USING (
    note_type = 'customer' AND
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_notes.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- =============================================
-- ORDER FULFILLMENT TASKS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS order_fulfillment_tasks (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  task_type TEXT NOT NULL CHECK (task_type IN ('picking', 'packing', 'shipping', 'quality_check', 'custom')),
  task_name TEXT NOT NULL,
  description TEXT,
  required BOOLEAN DEFAULT TRUE,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on order_fulfillment_tasks
ALTER TABLE order_fulfillment_tasks ENABLE ROW LEVEL SECURITY;

-- Admin can manage all fulfillment tasks
CREATE POLICY "Admins can view all fulfillment tasks" ON order_fulfillment_tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid()
    )
  );

CREATE POLICY "Admins can insert fulfillment tasks" ON order_fulfillment_tasks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid()
    )
  );

CREATE POLICY "Admins can update fulfillment tasks" ON order_fulfillment_tasks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid()
    )
  );

CREATE POLICY "Admins can delete fulfillment tasks" ON order_fulfillment_tasks
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid()
    )
  );

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Order status history indexes
CREATE INDEX IF NOT EXISTS order_status_history_order_id_idx ON order_status_history(order_id);
CREATE INDEX IF NOT EXISTS order_status_history_changed_at_idx ON order_status_history(changed_at DESC);
CREATE INDEX IF NOT EXISTS order_status_history_to_status_idx ON order_status_history(to_status);

-- Order notes indexes
CREATE INDEX IF NOT EXISTS order_notes_order_id_idx ON order_notes(order_id);
CREATE INDEX IF NOT EXISTS order_notes_created_at_idx ON order_notes(created_at DESC);
CREATE INDEX IF NOT EXISTS order_notes_note_type_idx ON order_notes(note_type);

-- Order fulfillment tasks indexes
CREATE INDEX IF NOT EXISTS order_fulfillment_tasks_order_id_idx ON order_fulfillment_tasks(order_id);
CREATE INDEX IF NOT EXISTS order_fulfillment_tasks_completed_idx ON order_fulfillment_tasks(completed);
CREATE INDEX IF NOT EXISTS order_fulfillment_tasks_task_type_idx ON order_fulfillment_tasks(task_type);

-- Orders admin fields indexes
CREATE INDEX IF NOT EXISTS orders_priority_level_idx ON orders(priority_level);
CREATE INDEX IF NOT EXISTS orders_estimated_ship_date_idx ON orders(estimated_ship_date);
CREATE INDEX IF NOT EXISTS orders_tracking_number_idx ON orders(tracking_number);
CREATE INDEX IF NOT EXISTS orders_fulfillment_progress_idx ON orders(fulfillment_progress);

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================

-- Apply updated_at trigger to order_notes
CREATE TRIGGER update_order_notes_updated_at 
  BEFORE UPDATE ON order_notes 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- FUNCTION TO AUTO-CREATE STATUS HISTORY
-- =============================================

-- Function to automatically log status changes
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO order_status_history (
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically log status changes
DROP TRIGGER IF EXISTS log_order_status_change_trigger ON orders;
CREATE TRIGGER log_order_status_change_trigger
  AFTER UPDATE ON orders
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION log_order_status_change();

-- =============================================
-- ADMIN ROLE POLICIES (PLACEHOLDER)
-- =============================================
-- Note: These policies use a simple check for authenticated users
-- In production, you should implement proper admin role checking
-- using a roles table or user metadata

-- Admin can view all orders
CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid()
    )
  );

-- Admin can update all orders
CREATE POLICY "Admins can update all orders" ON orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid()
    )
  );

-- Admin can view all order items
CREATE POLICY "Admins can view all order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid()
    )
  );

-- =============================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================

COMMENT ON TABLE order_status_history IS 'Tracks all status changes for orders with timestamps and admin attribution';
COMMENT ON TABLE order_notes IS 'Stores internal admin notes and customer-facing notes for orders';
COMMENT ON TABLE order_fulfillment_tasks IS 'Manages fulfillment workflow tasks for order processing';

COMMENT ON COLUMN orders.priority_level IS 'Order priority from 1 (lowest) to 5 (highest)';
COMMENT ON COLUMN orders.estimated_ship_date IS 'Estimated date when order will be shipped';
COMMENT ON COLUMN orders.tracking_number IS 'Shipping carrier tracking number';
COMMENT ON COLUMN orders.shipping_carrier IS 'Name of shipping carrier (e.g., DHL, UPS, FedEx)';
COMMENT ON COLUMN orders.fulfillment_progress IS 'Percentage of fulfillment tasks completed (0-100)';
