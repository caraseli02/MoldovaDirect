-- =====================================================
-- Notification Preferences Schema
-- =====================================================
-- Purpose: Store user preferences for multi-channel notifications
-- Channels: Email, WhatsApp, SMS (future)
-- Created: 2025-11-28
-- =====================================================

-- Drop existing table if exists (for clean reinstall)
DROP TABLE IF EXISTS notification_preferences CASCADE;

-- =====================================================
-- Table: notification_preferences
-- =====================================================
-- Stores per-user notification channel preferences
-- Supports both authenticated users and guest checkout
-- =====================================================

CREATE TABLE notification_preferences (
  -- Primary identifier
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User reference (NULL for guest checkouts)
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Guest identification (for non-authenticated users)
  guest_email VARCHAR(255),

  -- Contact information
  phone_number VARCHAR(20), -- E.164 format: +1234567890
  phone_verified BOOLEAN DEFAULT false,
  phone_verified_at TIMESTAMPTZ,

  -- Email preferences (existing channel)
  email_enabled BOOLEAN DEFAULT true,
  email_order_confirmation BOOLEAN DEFAULT true,
  email_order_updates BOOLEAN DEFAULT true,
  email_shipping BOOLEAN DEFAULT true,
  email_delivery BOOLEAN DEFAULT true,
  email_marketing BOOLEAN DEFAULT false,
  email_support BOOLEAN DEFAULT true,

  -- WhatsApp preferences (new channel)
  whatsapp_enabled BOOLEAN DEFAULT false, -- Opt-in by default
  whatsapp_order_confirmation BOOLEAN DEFAULT true,
  whatsapp_order_updates BOOLEAN DEFAULT true,
  whatsapp_shipping BOOLEAN DEFAULT true,
  whatsapp_delivery BOOLEAN DEFAULT true,
  whatsapp_marketing BOOLEAN DEFAULT false,
  whatsapp_support BOOLEAN DEFAULT true,

  -- SMS preferences (future expansion)
  sms_enabled BOOLEAN DEFAULT false,
  sms_order_confirmation BOOLEAN DEFAULT true,
  sms_order_updates BOOLEAN DEFAULT true,
  sms_shipping BOOLEAN DEFAULT true,
  sms_delivery BOOLEAN DEFAULT true,

  -- Metadata
  preferred_language VARCHAR(5) DEFAULT 'es', -- es, en, ro, ru
  timezone VARCHAR(50) DEFAULT 'Europe/Bucharest',

  -- Audit fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_user_or_guest CHECK (
    (user_id IS NOT NULL AND guest_email IS NULL) OR
    (user_id IS NULL AND guest_email IS NOT NULL)
  ),
  CONSTRAINT valid_phone_format CHECK (
    phone_number IS NULL OR
    phone_number ~ '^\+[1-9]\d{1,14}$' -- E.164 international format
  ),
  CONSTRAINT valid_language CHECK (
    preferred_language IN ('es', 'en', 'ro', 'ru')
  )
);

-- =====================================================
-- Indexes for Performance
-- =====================================================

CREATE INDEX idx_notification_prefs_user_id
  ON notification_preferences(user_id)
  WHERE user_id IS NOT NULL;

CREATE INDEX idx_notification_prefs_guest_email
  ON notification_preferences(guest_email)
  WHERE guest_email IS NOT NULL;

CREATE INDEX idx_notification_prefs_phone
  ON notification_preferences(phone_number)
  WHERE phone_number IS NOT NULL;

CREATE INDEX idx_notification_prefs_whatsapp_enabled
  ON notification_preferences(whatsapp_enabled)
  WHERE whatsapp_enabled = true;

-- =====================================================
-- Unique Constraints
-- =====================================================

CREATE UNIQUE INDEX unique_user_preferences
  ON notification_preferences(user_id)
  WHERE user_id IS NOT NULL;

CREATE UNIQUE INDEX unique_guest_preferences
  ON notification_preferences(guest_email)
  WHERE guest_email IS NOT NULL;

-- =====================================================
-- Updated At Trigger
-- =====================================================

CREATE OR REPLACE FUNCTION update_notification_prefs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_notification_prefs_timestamp
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_prefs_updated_at();

-- =====================================================
-- Row Level Security (RLS)
-- =====================================================

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Users can read their own preferences
CREATE POLICY "Users can view own notification preferences"
  ON notification_preferences
  FOR SELECT
  USING (
    auth.uid() = user_id OR
    (user_id IS NULL AND guest_email IS NOT NULL)
  );

-- Users can insert their own preferences
CREATE POLICY "Users can insert own notification preferences"
  ON notification_preferences
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id OR
    (user_id IS NULL AND guest_email IS NOT NULL)
  );

-- Users can update their own preferences
CREATE POLICY "Users can update own notification preferences"
  ON notification_preferences
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own preferences
CREATE POLICY "Users can delete own notification preferences"
  ON notification_preferences
  FOR DELETE
  USING (auth.uid() = user_id);

-- Service role has full access (for server-side operations)
CREATE POLICY "Service role has full access to notification preferences"
  ON notification_preferences
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- =====================================================
-- Helper Functions
-- =====================================================

-- Function to create default preferences for new users
CREATE OR REPLACE FUNCTION create_default_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notification_preferences (
    user_id,
    email_enabled,
    whatsapp_enabled,
    preferred_language
  ) VALUES (
    NEW.id,
    true,
    false, -- WhatsApp opt-in required
    COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'es')
  ) ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create preferences on user signup
CREATE TRIGGER trigger_create_notification_preferences
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_notification_preferences();

-- =====================================================
-- Sample Data (for development/testing)
-- =====================================================

-- Uncomment for local testing
-- INSERT INTO notification_preferences (
--   user_id,
--   phone_number,
--   phone_verified,
--   whatsapp_enabled,
--   preferred_language
-- ) VALUES (
--   'your-test-user-id-here',
--   '+1234567890',
--   true,
--   true,
--   'en'
-- );

-- =====================================================
-- Comments for Documentation
-- =====================================================

COMMENT ON TABLE notification_preferences IS
  'Stores user preferences for multi-channel notifications (email, WhatsApp, SMS)';

COMMENT ON COLUMN notification_preferences.user_id IS
  'References auth.users - NULL for guest checkouts';

COMMENT ON COLUMN notification_preferences.guest_email IS
  'Email for guest users who checkout without account';

COMMENT ON COLUMN notification_preferences.phone_number IS
  'E.164 international format: +[country code][number]';

COMMENT ON COLUMN notification_preferences.whatsapp_enabled IS
  'Master switch for WhatsApp notifications - defaults to false (opt-in required)';

COMMENT ON COLUMN notification_preferences.phone_verified IS
  'Whether phone number has been verified via OTP';
