-- =====================================================
-- Notification Logs Schema (Multi-Channel)
-- =====================================================
-- Purpose: Track all notifications across channels (Email, WhatsApp, SMS)
-- Replaces: email_logs (backward compatible)
-- Created: 2025-11-28
-- =====================================================

-- Note: This schema extends the existing email_logs structure
-- Migration path: Rename email_logs → notification_logs, add channel column

-- =====================================================
-- Table: notification_logs
-- =====================================================
-- Unified logging for all notification channels
-- =====================================================

CREATE TABLE IF NOT EXISTS notification_logs (
  -- Primary identifier
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Channel information (NEW)
  channel VARCHAR(20) NOT NULL DEFAULT 'email', -- 'email' | 'whatsapp' | 'sms'

  -- Recipient information
  recipient_email VARCHAR(255),
  recipient_phone VARCHAR(20), -- For WhatsApp/SMS (E.164 format)
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Message classification
  notification_type VARCHAR(50) NOT NULL, -- 'order_confirmation', 'order_shipped', etc.
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,

  -- Message content
  subject TEXT, -- For email (NULL for WhatsApp/SMS)
  template_id VARCHAR(100), -- WhatsApp template ID or email template name
  template_version INTEGER DEFAULT 1,

  -- Delivery tracking
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced' | 'read'
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ, -- WhatsApp read receipts
  failed_at TIMESTAMPTZ,

  -- Retry logic
  attempt_count INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  next_retry_at TIMESTAMPTZ,
  last_error TEXT,

  -- External provider tracking
  external_id VARCHAR(255), -- Resend message ID, Twilio SID, etc.
  provider VARCHAR(50), -- 'resend' | 'twilio' | 'messagebird' | 'whatsapp_cloud'

  -- Metadata (JSONB for flexibility)
  metadata JSONB DEFAULT '{}'::jsonb,
  -- Example metadata:
  -- {
  --   "locale": "es",
  --   "customer_name": "John Doe",
  --   "order_total": 49.99,
  --   "tracking_number": "1Z999AA1...",
  --   "template_params": {...}
  -- }

  -- Audit fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_channel CHECK (
    channel IN ('email', 'whatsapp', 'sms')
  ),
  CONSTRAINT valid_status CHECK (
    status IN ('pending', 'sent', 'delivered', 'failed', 'bounced', 'read')
  ),
  CONSTRAINT valid_recipient CHECK (
    (channel = 'email' AND recipient_email IS NOT NULL) OR
    (channel IN ('whatsapp', 'sms') AND recipient_phone IS NOT NULL)
  )
);

-- =====================================================
-- Indexes for Performance
-- =====================================================

-- Query by status for retry jobs
CREATE INDEX idx_notification_logs_status
  ON notification_logs(status, next_retry_at)
  WHERE status IN ('pending', 'failed');

-- Query by channel
CREATE INDEX idx_notification_logs_channel
  ON notification_logs(channel, created_at DESC);

-- Query by order (for customer support)
CREATE INDEX idx_notification_logs_order_id
  ON notification_logs(order_id, created_at DESC)
  WHERE order_id IS NOT NULL;

-- Query by user
CREATE INDEX idx_notification_logs_user_id
  ON notification_logs(user_id, created_at DESC)
  WHERE user_id IS NOT NULL;

-- Query by recipient (email or phone)
CREATE INDEX idx_notification_logs_recipient_email
  ON notification_logs(recipient_email, created_at DESC)
  WHERE recipient_email IS NOT NULL;

CREATE INDEX idx_notification_logs_recipient_phone
  ON notification_logs(recipient_phone, created_at DESC)
  WHERE recipient_phone IS NOT NULL;

-- Query by external ID (for webhook callbacks)
CREATE INDEX idx_notification_logs_external_id
  ON notification_logs(external_id)
  WHERE external_id IS NOT NULL;

-- Query by notification type
CREATE INDEX idx_notification_logs_type
  ON notification_logs(notification_type, created_at DESC);

-- Composite index for retry processing
CREATE INDEX idx_notification_logs_retry
  ON notification_logs(channel, status, next_retry_at, attempt_count)
  WHERE status IN ('pending', 'failed') AND attempt_count < max_attempts;

-- =====================================================
-- Updated At Trigger
-- =====================================================

CREATE OR REPLACE FUNCTION update_notification_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_notification_logs_timestamp
  BEFORE UPDATE ON notification_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_logs_updated_at();

-- =====================================================
-- Row Level Security (RLS)
-- =====================================================

ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own notification logs
CREATE POLICY "Users can view own notification logs"
  ON notification_logs
  FOR SELECT
  USING (
    auth.uid() = user_id OR
    recipient_email IN (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
  );

-- Service role has full access
CREATE POLICY "Service role has full access to notification logs"
  ON notification_logs
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- Admin users can view all logs (requires admin role in profiles table)
CREATE POLICY "Admin users can view all notification logs"
  ON notification_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- =====================================================
-- Helper Functions
-- =====================================================

-- Function to get pending notifications for retry
CREATE OR REPLACE FUNCTION get_pending_notifications_for_retry(
  p_channel VARCHAR(20) DEFAULT NULL,
  p_limit INTEGER DEFAULT 100
)
RETURNS TABLE (
  id UUID,
  channel VARCHAR(20),
  recipient_email VARCHAR(255),
  recipient_phone VARCHAR(20),
  notification_type VARCHAR(50),
  template_id VARCHAR(100),
  metadata JSONB,
  attempt_count INTEGER,
  last_error TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    nl.id,
    nl.channel,
    nl.recipient_email,
    nl.recipient_phone,
    nl.notification_type,
    nl.template_id,
    nl.metadata,
    nl.attempt_count,
    nl.last_error
  FROM notification_logs nl
  WHERE
    nl.status IN ('pending', 'failed')
    AND nl.attempt_count < nl.max_attempts
    AND (nl.next_retry_at IS NULL OR nl.next_retry_at <= NOW())
    AND (p_channel IS NULL OR nl.channel = p_channel)
  ORDER BY nl.created_at ASC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get delivery statistics
CREATE OR REPLACE FUNCTION get_notification_stats(
  p_channel VARCHAR(20) DEFAULT NULL,
  p_start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  p_end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
  channel VARCHAR(20),
  notification_type VARCHAR(50),
  total_sent BIGINT,
  total_delivered BIGINT,
  total_failed BIGINT,
  total_bounced BIGINT,
  total_read BIGINT,
  delivery_rate NUMERIC,
  read_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    nl.channel,
    nl.notification_type,
    COUNT(*) AS total_sent,
    COUNT(*) FILTER (WHERE nl.status = 'delivered') AS total_delivered,
    COUNT(*) FILTER (WHERE nl.status = 'failed') AS total_failed,
    COUNT(*) FILTER (WHERE nl.status = 'bounced') AS total_bounced,
    COUNT(*) FILTER (WHERE nl.status = 'read') AS total_read,
    ROUND(
      100.0 * COUNT(*) FILTER (WHERE nl.status = 'delivered') / NULLIF(COUNT(*), 0),
      2
    ) AS delivery_rate,
    ROUND(
      100.0 * COUNT(*) FILTER (WHERE nl.status = 'read') / NULLIF(COUNT(*) FILTER (WHERE nl.status = 'delivered'), 0),
      2
    ) AS read_rate
  FROM notification_logs nl
  WHERE
    nl.created_at BETWEEN p_start_date AND p_end_date
    AND (p_channel IS NULL OR nl.channel = p_channel)
  GROUP BY nl.channel, nl.notification_type
  ORDER BY nl.channel, total_sent DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Migration Helper (Email Logs → Notification Logs)
-- =====================================================

-- Function to migrate existing email_logs to notification_logs
-- Run this if you have existing email_logs table
CREATE OR REPLACE FUNCTION migrate_email_logs_to_notification_logs()
RETURNS INTEGER AS $$
DECLARE
  migrated_count INTEGER;
BEGIN
  -- Check if email_logs table exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'email_logs'
  ) THEN
    RETURN 0;
  END IF;

  -- Insert from email_logs to notification_logs
  INSERT INTO notification_logs (
    id,
    channel,
    recipient_email,
    user_id,
    notification_type,
    order_id,
    subject,
    template_id,
    status,
    sent_at,
    delivered_at,
    failed_at,
    attempt_count,
    max_attempts,
    next_retry_at,
    last_error,
    external_id,
    provider,
    metadata,
    created_at,
    updated_at
  )
  SELECT
    id,
    'email' AS channel,
    recipient_email,
    user_id,
    email_type AS notification_type,
    order_id,
    subject,
    template_name AS template_id,
    status,
    sent_at,
    delivered_at,
    failed_at,
    attempt_count,
    COALESCE(max_attempts, 3) AS max_attempts,
    next_retry_at,
    error_message AS last_error,
    external_id,
    'resend' AS provider,
    metadata,
    created_at,
    updated_at
  FROM email_logs
  ON CONFLICT (id) DO NOTHING;

  GET DIAGNOSTICS migrated_count = ROW_COUNT;
  RETURN migrated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Comments for Documentation
-- =====================================================

COMMENT ON TABLE notification_logs IS
  'Unified logging for all notification channels (email, WhatsApp, SMS)';

COMMENT ON COLUMN notification_logs.channel IS
  'Notification channel: email, whatsapp, or sms';

COMMENT ON COLUMN notification_logs.recipient_phone IS
  'E.164 format phone number for WhatsApp/SMS: +[country][number]';

COMMENT ON COLUMN notification_logs.template_id IS
  'WhatsApp template content SID or email template name';

COMMENT ON COLUMN notification_logs.status IS
  'Delivery status: pending → sent → delivered/failed/bounced, read (WhatsApp only)';

COMMENT ON COLUMN notification_logs.read_at IS
  'WhatsApp read receipt timestamp (when available)';

COMMENT ON COLUMN notification_logs.metadata IS
  'Template parameters, customer info, and other context (JSONB)';

-- =====================================================
-- Example Queries
-- =====================================================

-- Get pending WhatsApp notifications for retry
-- SELECT * FROM get_pending_notifications_for_retry('whatsapp', 50);

-- Get notification stats for last 7 days
-- SELECT * FROM get_notification_stats(NULL, NOW() - INTERVAL '7 days', NOW());

-- Get all WhatsApp notifications for a specific order
-- SELECT * FROM notification_logs
-- WHERE channel = 'whatsapp' AND order_id = 'your-order-id'
-- ORDER BY created_at DESC;
