-- =====================================================
-- Newsletter Subscriptions Schema
-- =====================================================
-- This schema stores email newsletter subscriptions
-- from various sources (landing page, checkout, etc.)
-- =====================================================

-- =====================================================
-- 1. NEWSLETTER_SUBSCRIPTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Email information
  email TEXT NOT NULL UNIQUE,
  locale TEXT NOT NULL DEFAULT 'es' CHECK (locale IN ('es', 'en', 'ro', 'ru')),

  -- Subscription status
  is_active BOOLEAN NOT NULL DEFAULT true,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  unsubscribed_at TIMESTAMPTZ,

  -- Source tracking
  source TEXT NOT NULL DEFAULT 'landing_page' CHECK (source IN (
    'landing_page',
    'checkout',
    'account_settings',
    'product_page',
    'cart',
    'footer'
  )),

  -- Additional metadata (JSONB for flexibility)
  -- Examples: { "referrer": "...", "campaign": "...", "page_url": "..." }
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- 2. INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_active ON newsletter_subscriptions(is_active);
CREATE INDEX IF NOT EXISTS idx_newsletter_source ON newsletter_subscriptions(source);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribed_at ON newsletter_subscriptions(subscribed_at DESC);
CREATE INDEX IF NOT EXISTS idx_newsletter_metadata ON newsletter_subscriptions USING gin(metadata);

-- =====================================================
-- 3. TRIGGER FOR UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION update_newsletter_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_newsletter_subscriptions_updated_at ON newsletter_subscriptions;
CREATE TRIGGER trigger_newsletter_subscriptions_updated_at
  BEFORE UPDATE ON newsletter_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_newsletter_subscriptions_updated_at();

-- =====================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can read all subscriptions
DROP POLICY IF EXISTS "newsletter_subscriptions_select_admin" ON newsletter_subscriptions;
CREATE POLICY "newsletter_subscriptions_select_admin"
  ON newsletter_subscriptions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: Allow anonymous inserts (for landing page form)
DROP POLICY IF EXISTS "newsletter_subscriptions_insert_anon" ON newsletter_subscriptions;
CREATE POLICY "newsletter_subscriptions_insert_anon"
  ON newsletter_subscriptions
  FOR INSERT
  WITH CHECK (true);

-- Policy: Admins can update subscriptions
DROP POLICY IF EXISTS "newsletter_subscriptions_update_admin" ON newsletter_subscriptions;
CREATE POLICY "newsletter_subscriptions_update_admin"
  ON newsletter_subscriptions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- =====================================================
-- 5. HELPER FUNCTIONS
-- =====================================================

-- Function: Subscribe to newsletter (handles duplicates)
CREATE OR REPLACE FUNCTION subscribe_to_newsletter(
  p_email TEXT,
  p_locale TEXT DEFAULT 'es',
  p_source TEXT DEFAULT 'landing_page',
  p_metadata JSONB DEFAULT '{}'
)
RETURNS TABLE (
  id UUID,
  email TEXT,
  is_new_subscription BOOLEAN
) AS $$
DECLARE
  v_subscription newsletter_subscriptions%ROWTYPE;
  v_is_new BOOLEAN;
BEGIN
  -- Try to find existing subscription
  SELECT * INTO v_subscription
  FROM newsletter_subscriptions
  WHERE newsletter_subscriptions.email = LOWER(TRIM(p_email));

  IF FOUND THEN
    -- Email exists
    IF v_subscription.is_active THEN
      -- Already subscribed and active
      v_is_new := false;
    ELSE
      -- Was unsubscribed, reactivate
      UPDATE newsletter_subscriptions
      SET
        is_active = true,
        unsubscribed_at = NULL,
        subscribed_at = now(),
        locale = p_locale,
        source = p_source,
        metadata = p_metadata,
        updated_at = now()
      WHERE newsletter_subscriptions.email = LOWER(TRIM(p_email))
      RETURNING * INTO v_subscription;

      v_is_new := true;
    END IF;
  ELSE
    -- New subscription
    INSERT INTO newsletter_subscriptions (email, locale, source, metadata)
    VALUES (LOWER(TRIM(p_email)), p_locale, p_source, p_metadata)
    RETURNING * INTO v_subscription;

    v_is_new := true;
  END IF;

  RETURN QUERY SELECT v_subscription.id, v_subscription.email, v_is_new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Unsubscribe from newsletter
CREATE OR REPLACE FUNCTION unsubscribe_from_newsletter(
  p_email TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_updated BOOLEAN;
BEGIN
  UPDATE newsletter_subscriptions
  SET
    is_active = false,
    unsubscribed_at = now(),
    updated_at = now()
  WHERE email = LOWER(TRIM(p_email))
    AND is_active = true
  RETURNING true INTO v_updated;

  RETURN COALESCE(v_updated, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION subscribe_to_newsletter(TEXT, TEXT, TEXT, JSONB) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION unsubscribe_from_newsletter(TEXT) TO anon, authenticated;

-- =====================================================
-- 6. COMMENTS FOR DOCUMENTATION
-- =====================================================
COMMENT ON TABLE newsletter_subscriptions IS 'Stores email newsletter subscriptions from various sources';
COMMENT ON COLUMN newsletter_subscriptions.email IS 'Subscriber email address (unique, lowercase, trimmed)';
COMMENT ON COLUMN newsletter_subscriptions.is_active IS 'Whether the subscription is currently active';
COMMENT ON COLUMN newsletter_subscriptions.source IS 'Where the subscription originated (landing_page, checkout, etc.)';
COMMENT ON COLUMN newsletter_subscriptions.metadata IS 'Additional subscription metadata as JSONB (referrer, campaign, etc.)';
