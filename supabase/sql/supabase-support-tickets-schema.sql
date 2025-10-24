-- Support Tickets Schema
-- This migration creates the necessary tables for handling customer support tickets

-- Create support tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
  ticket_number TEXT UNIQUE,
  subject TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('order_status', 'shipping', 'product_issue', 'payment', 'return', 'other')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting_customer', 'resolved', 'closed')),
  message TEXT NOT NULL,
  order_context JSONB,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  closed_at TIMESTAMP WITH TIME ZONE
);

-- Create support ticket messages table for conversation thread
CREATE TABLE IF NOT EXISTS support_ticket_messages (
  id SERIAL PRIMARY KEY,
  ticket_id INTEGER NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  is_staff BOOLEAN NOT NULL DEFAULT false,
  message TEXT NOT NULL,
  attachments JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Generate ticket number function
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.ticket_number = 'TICKET-' || LPAD(NEW.id::TEXT, 8, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for ticket number generation
DROP TRIGGER IF EXISTS generate_ticket_number_trigger ON support_tickets;
CREATE TRIGGER generate_ticket_number_trigger
  AFTER INSERT ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION generate_ticket_number();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_order_id ON support_tickets(order_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_category ON support_tickets(category);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned_to ON support_tickets(assigned_to);

CREATE INDEX IF NOT EXISTS idx_support_ticket_messages_ticket_id ON support_ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_support_ticket_messages_created_at ON support_ticket_messages(created_at DESC);

-- Enable RLS
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_ticket_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for support_tickets
-- Users can view their own tickets
CREATE POLICY "Users can view own tickets" ON support_tickets
  FOR SELECT USING (user_id = auth.uid());

-- Users can create tickets
CREATE POLICY "Users can create tickets" ON support_tickets
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can update their own open tickets
CREATE POLICY "Users can update own open tickets" ON support_tickets
  FOR UPDATE USING (
    user_id = auth.uid() AND 
    status IN ('open', 'waiting_customer')
  );

-- Note: Admin policies will be added when role system is implemented
-- For now, admin access is handled through service role in API layer

-- RLS Policies for support_ticket_messages
-- Users can view messages for their own tickets
CREATE POLICY "Users can view own ticket messages" ON support_ticket_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM support_tickets 
      WHERE support_tickets.id = support_ticket_messages.ticket_id 
      AND support_tickets.user_id = auth.uid()
    )
  );

-- Users can create messages for their own tickets
CREATE POLICY "Users can create ticket messages" ON support_ticket_messages
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM support_tickets 
      WHERE support_tickets.id = support_ticket_messages.ticket_id 
      AND support_tickets.user_id = auth.uid()
    )
  );

-- Note: Admin policies will be added when role system is implemented
-- For now, admin access is handled through service role in API layer

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_support_tickets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  
  -- Update resolved_at when status changes to resolved
  IF NEW.status = 'resolved' AND OLD.status != 'resolved' THEN
    NEW.resolved_at = NOW();
  END IF;
  
  -- Update closed_at when status changes to closed
  IF NEW.status = 'closed' AND OLD.status != 'closed' THEN
    NEW.closed_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS support_tickets_updated_at ON support_tickets;
CREATE TRIGGER support_tickets_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_support_tickets_updated_at();

-- Add comments to tables
COMMENT ON TABLE support_tickets IS 'Stores customer support tickets';
COMMENT ON TABLE support_ticket_messages IS 'Stores conversation messages for support tickets';
COMMENT ON COLUMN support_tickets.order_context IS 'JSONB object containing order details for context';
COMMENT ON COLUMN support_tickets.priority IS 'Priority level of the ticket';
COMMENT ON COLUMN support_tickets.status IS 'Current status of the ticket';
