-- Order Returns Schema
-- This migration creates the necessary tables for handling order returns

-- Create order returns table
CREATE TABLE IF NOT EXISTS order_returns (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'processing', 'completed', 'cancelled')),
  return_items JSONB NOT NULL,
  total_refund_amount DECIMAL(10, 2) NOT NULL,
  additional_notes TEXT,
  admin_notes TEXT,
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  refund_method TEXT,
  refund_transaction_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_order_returns_order_id ON order_returns(order_id);
CREATE INDEX IF NOT EXISTS idx_order_returns_user_id ON order_returns(user_id);
CREATE INDEX IF NOT EXISTS idx_order_returns_status ON order_returns(status);
CREATE INDEX IF NOT EXISTS idx_order_returns_requested_at ON order_returns(requested_at DESC);

-- Enable RLS
ALTER TABLE order_returns ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own returns
CREATE POLICY "Users can view own returns" ON order_returns
  FOR SELECT USING (user_id = auth.uid());

-- Users can create returns for their own orders
CREATE POLICY "Users can create returns" ON order_returns
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_returns.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- Users can update their own pending returns (to cancel)
CREATE POLICY "Users can update own pending returns" ON order_returns
  FOR UPDATE USING (
    user_id = auth.uid() AND 
    status = 'pending'
  );

-- Note: Admin policies will be added when role system is implemented
-- For now, admin access is handled through service role in API layer

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_order_returns_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS order_returns_updated_at ON order_returns;
CREATE TRIGGER order_returns_updated_at
  BEFORE UPDATE ON order_returns
  FOR EACH ROW
  EXECUTE FUNCTION update_order_returns_updated_at();

-- Add comment to table
COMMENT ON TABLE order_returns IS 'Stores customer return requests for orders';
COMMENT ON COLUMN order_returns.return_items IS 'JSONB array of items being returned with quantities and reasons';
COMMENT ON COLUMN order_returns.status IS 'Current status of the return request';
COMMENT ON COLUMN order_returns.total_refund_amount IS 'Total amount to be refunded in EUR';
