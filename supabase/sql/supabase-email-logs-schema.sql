-- =============================================
-- EMAIL LOGS SCHEMA
-- =============================================
-- This schema supports email logging for order confirmation emails
-- and other transactional emails sent by the system.
-- 
-- Requirements: 4.1, 4.2, 4.3

-- Create email_logs table
CREATE TABLE IF NOT EXISTS email_logs (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  email_type VARCHAR(50) NOT NULL CHECK (email_type IN (
    'order_confirmation',
    'order_processing',
    'order_shipped',
    'order_delivered',
    'order_cancelled',
    'order_issue'
  )),
  recipient_email VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',
    'sent',
    'delivered',
    'failed',
    'bounced'
  )),
  attempts INTEGER NOT NULL DEFAULT 0,
  last_attempt_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  bounce_reason TEXT,
  external_id VARCHAR(255),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS email_logs_order_id_idx ON email_logs(order_id);
CREATE INDEX IF NOT EXISTS email_logs_recipient_email_idx ON email_logs(recipient_email);
CREATE INDEX IF NOT EXISTS email_logs_status_idx ON email_logs(status);
CREATE INDEX IF NOT EXISTS email_logs_email_type_idx ON email_logs(email_type);
CREATE INDEX IF NOT EXISTS email_logs_created_at_idx ON email_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS email_logs_order_email_type_idx ON email_logs(order_id, email_type);

-- Composite index for admin search queries (order number, email, date range)
CREATE INDEX IF NOT EXISTS email_logs_search_idx ON email_logs(recipient_email, created_at DESC);

-- Enable Row Level Security
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can view email logs
-- Note: Admin-specific policies will be added when role system is implemented
-- For now, admin access is handled through service role in API layer
CREATE POLICY "Email logs require authentication" ON email_logs
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Policy: System can insert email logs (service role)
CREATE POLICY "System can insert email logs" ON email_logs
  FOR INSERT
  WITH CHECK (true);

-- Policy: System can update email logs (service role)
CREATE POLICY "System can update email logs" ON email_logs
  FOR UPDATE
  USING (true);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_email_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function
CREATE TRIGGER email_logs_updated_at_trigger
  BEFORE UPDATE ON email_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_email_logs_updated_at();

-- =============================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================
COMMENT ON TABLE email_logs IS 'Tracks all transactional emails sent by the system, including order confirmations and status updates';
COMMENT ON COLUMN email_logs.order_id IS 'Reference to the order this email relates to';
COMMENT ON COLUMN email_logs.email_type IS 'Type of email sent (order_confirmation, order_shipped, etc.)';
COMMENT ON COLUMN email_logs.recipient_email IS 'Email address where the email was sent';
COMMENT ON COLUMN email_logs.status IS 'Current delivery status of the email';
COMMENT ON COLUMN email_logs.attempts IS 'Number of delivery attempts made';
COMMENT ON COLUMN email_logs.external_id IS 'External email service provider ID (e.g., Resend message ID)';
COMMENT ON COLUMN email_logs.metadata IS 'Additional metadata about the email (locale, template version, etc.)';
