-- Migration: Create impersonation_logs table for audit trail
-- GitHub Issue: #87
-- Date: 2025-11-04
-- Description: Adds comprehensive audit logging for admin user impersonation

-- =============================================
-- IMPERSONATION LOGS TABLE
-- =============================================

-- Create impersonation_logs table
CREATE TABLE IF NOT EXISTS impersonation_logs (
  id BIGSERIAL PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  ip_address INET,
  user_agent TEXT,
  reason TEXT NOT NULL,
  actions_taken JSONB DEFAULT '[]'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Index for looking up impersonations by admin
CREATE INDEX IF NOT EXISTS idx_impersonation_logs_admin
  ON impersonation_logs(admin_id);

-- Index for looking up impersonations of a target user
CREATE INDEX IF NOT EXISTS idx_impersonation_logs_target
  ON impersonation_logs(target_user_id);

-- Index for finding active impersonation sessions
CREATE INDEX IF NOT EXISTS idx_impersonation_logs_active
  ON impersonation_logs(started_at, expires_at)
  WHERE ended_at IS NULL;

-- Index for time-based queries
CREATE INDEX IF NOT EXISTS idx_impersonation_logs_created_at
  ON impersonation_logs(created_at);

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS
ALTER TABLE impersonation_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view all impersonation logs
CREATE POLICY "Admins can view all impersonation logs"
  ON impersonation_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: System can insert impersonation logs (for service role)
CREATE POLICY "System can insert impersonation logs"
  ON impersonation_logs FOR INSERT
  WITH CHECK (true);

-- Policy: System can update impersonation logs (for ending sessions)
CREATE POLICY "System can update impersonation logs"
  ON impersonation_logs FOR UPDATE
  USING (true);

-- =============================================
-- TRIGGER FOR UPDATED_AT
-- =============================================

-- Create or replace the update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to update updated_at on row changes
CREATE TRIGGER update_impersonation_logs_updated_at
  BEFORE UPDATE ON impersonation_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Function to get active impersonation session for an admin
CREATE OR REPLACE FUNCTION get_active_impersonation(p_admin_id UUID)
RETURNS TABLE (
  log_id BIGINT,
  target_user_id UUID,
  expires_at TIMESTAMPTZ,
  reason TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    id,
    impersonation_logs.target_user_id,
    impersonation_logs.expires_at,
    impersonation_logs.reason
  FROM impersonation_logs
  WHERE admin_id = p_admin_id
    AND ended_at IS NULL
    AND expires_at > NOW()
  ORDER BY started_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to end all expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_impersonations()
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  WITH updated AS (
    UPDATE impersonation_logs
    SET ended_at = NOW()
    WHERE ended_at IS NULL
      AND expires_at <= NOW()
    RETURNING id
  )
  SELECT COUNT(*) INTO updated_count FROM updated;

  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================

COMMENT ON TABLE impersonation_logs IS 'Audit trail for admin user impersonation sessions';
COMMENT ON COLUMN impersonation_logs.admin_id IS 'ID of the admin performing the impersonation';
COMMENT ON COLUMN impersonation_logs.target_user_id IS 'ID of the user being impersonated';
COMMENT ON COLUMN impersonation_logs.started_at IS 'Timestamp when impersonation session started';
COMMENT ON COLUMN impersonation_logs.expires_at IS 'Timestamp when impersonation session expires';
COMMENT ON COLUMN impersonation_logs.ended_at IS 'Timestamp when impersonation session was explicitly ended (NULL if still active or expired)';
COMMENT ON COLUMN impersonation_logs.reason IS 'Required reason/justification for the impersonation';
COMMENT ON COLUMN impersonation_logs.actions_taken IS 'JSON array of actions performed during impersonation session';
