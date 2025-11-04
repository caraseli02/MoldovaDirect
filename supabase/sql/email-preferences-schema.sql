-- Email Notification Preferences Schema
-- This table stores user preferences for email notifications

-- Create email_preferences table
CREATE TABLE IF NOT EXISTS email_preferences (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  guest_email VARCHAR(255),

  -- Notification preferences (true = send emails, false = opt-out)
  order_confirmation BOOLEAN DEFAULT true NOT NULL,
  order_status_updates BOOLEAN DEFAULT true NOT NULL,
  order_shipped BOOLEAN DEFAULT true NOT NULL,
  order_delivered BOOLEAN DEFAULT true NOT NULL,
  support_tickets BOOLEAN DEFAULT true NOT NULL,
  marketing BOOLEAN DEFAULT false NOT NULL,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT user_or_guest_required CHECK (
    (user_id IS NOT NULL) OR (guest_email IS NOT NULL)
  ),
  CONSTRAINT unique_user_preference UNIQUE (user_id),
  CONSTRAINT unique_guest_preference UNIQUE (guest_email)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_email_preferences_user_id ON email_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_email_preferences_guest_email ON email_preferences(guest_email);

-- Enable Row Level Security
ALTER TABLE email_preferences ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own preferences
CREATE POLICY email_preferences_select_own ON email_preferences
  FOR SELECT
  USING (
    auth.uid() = user_id OR
    guest_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Policy: Users can update their own preferences
CREATE POLICY email_preferences_update_own ON email_preferences
  FOR UPDATE
  USING (
    auth.uid() = user_id OR
    guest_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Policy: Users can insert their own preferences
CREATE POLICY email_preferences_insert_own ON email_preferences
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id OR
    guest_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_email_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER trigger_update_email_preferences_updated_at
  BEFORE UPDATE ON email_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_email_preferences_updated_at();

-- Comments for documentation
COMMENT ON TABLE email_preferences IS 'Stores user email notification preferences';
COMMENT ON COLUMN email_preferences.user_id IS 'Reference to authenticated user (nullable for guests)';
COMMENT ON COLUMN email_preferences.guest_email IS 'Email address for guest users (nullable for authenticated)';
COMMENT ON COLUMN email_preferences.order_confirmation IS 'Allow order confirmation emails';
COMMENT ON COLUMN email_preferences.order_status_updates IS 'Allow order status update emails';
COMMENT ON COLUMN email_preferences.order_shipped IS 'Allow order shipped notification emails';
COMMENT ON COLUMN email_preferences.order_delivered IS 'Allow order delivered notification emails';
COMMENT ON COLUMN email_preferences.support_tickets IS 'Allow support ticket notification emails';
COMMENT ON COLUMN email_preferences.marketing IS 'Allow marketing and promotional emails';
