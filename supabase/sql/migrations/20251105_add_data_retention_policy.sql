-- Migration: GDPR Data Retention Policy for PII
-- GitHub Issue: #90
-- Date: 2025-11-05
-- Description: Implements comprehensive data retention policies for GDPR compliance
--
-- This migration adds:
-- 1. Data retention policy configuration table
-- 2. Cleanup functions for PII-containing tables
-- 3. Master cleanup function
-- 4. Audit logging for data retention operations

-- =============================================
-- DATA RETENTION POLICIES TABLE
-- =============================================

-- Create table to store retention policy configuration
CREATE TABLE IF NOT EXISTS data_retention_policies (
  id SERIAL PRIMARY KEY,
  table_name VARCHAR(100) NOT NULL UNIQUE,
  retention_days INTEGER NOT NULL CHECK (retention_days > 0),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  last_cleanup_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default retention policies (GDPR-compliant)
INSERT INTO data_retention_policies (table_name, retention_days, description) VALUES
  ('email_logs', 90, 'Email delivery logs - retained for 90 days for customer service and troubleshooting'),
  ('user_activity_logs', 90, 'User activity tracking - retained for 90 days for analytics and security monitoring'),
  ('audit_logs', 365, 'Admin action audit logs - retained for 1 year for compliance and security investigations'),
  ('impersonation_logs', 365, 'Admin impersonation logs - retained for 1 year for compliance and oversight')
ON CONFLICT (table_name) DO NOTHING;

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_data_retention_policies_table
  ON data_retention_policies(table_name);

-- Enable RLS
ALTER TABLE data_retention_policies ENABLE ROW LEVEL SECURITY;

-- Admin-only access policy
CREATE POLICY "Admins can view retention policies"
  ON data_retention_policies FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Service role can update policies
CREATE POLICY "Service role can update retention policies"
  ON data_retention_policies FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Trigger for updated_at
CREATE TRIGGER update_data_retention_policies_updated_at
  BEFORE UPDATE ON data_retention_policies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- CLEANUP FUNCTIONS FOR EACH TABLE
-- =============================================

-- Function to cleanup old email logs
CREATE OR REPLACE FUNCTION cleanup_old_email_logs(retention_days INTEGER DEFAULT 90)
RETURNS TABLE (
  deleted_count BIGINT,
  oldest_deleted_date TIMESTAMPTZ
) AS $$
DECLARE
  cutoff_date TIMESTAMPTZ;
  result_count BIGINT;
  oldest_date TIMESTAMPTZ;
BEGIN
  -- Calculate cutoff date
  cutoff_date := NOW() - (retention_days || ' days')::INTERVAL;

  -- Get the oldest record that will be deleted
  SELECT MIN(created_at) INTO oldest_date
  FROM email_logs
  WHERE created_at < cutoff_date;

  -- Delete old email logs
  WITH deleted AS (
    DELETE FROM email_logs
    WHERE created_at < cutoff_date
    RETURNING id
  )
  SELECT COUNT(*) INTO result_count FROM deleted;

  -- Update last cleanup timestamp
  UPDATE data_retention_policies
  SET last_cleanup_at = NOW()
  WHERE table_name = 'email_logs';

  -- Return results
  RETURN QUERY SELECT result_count, oldest_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup old user activity logs
CREATE OR REPLACE FUNCTION cleanup_old_user_activity_logs(retention_days INTEGER DEFAULT 90)
RETURNS TABLE (
  deleted_count BIGINT,
  oldest_deleted_date TIMESTAMPTZ
) AS $$
DECLARE
  cutoff_date TIMESTAMPTZ;
  result_count BIGINT;
  oldest_date TIMESTAMPTZ;
BEGIN
  -- Calculate cutoff date
  cutoff_date := NOW() - (retention_days || ' days')::INTERVAL;

  -- Get the oldest record that will be deleted
  SELECT MIN(created_at) INTO oldest_date
  FROM user_activity_logs
  WHERE created_at < cutoff_date;

  -- Delete old activity logs
  WITH deleted AS (
    DELETE FROM user_activity_logs
    WHERE created_at < cutoff_date
    RETURNING id
  )
  SELECT COUNT(*) INTO result_count FROM deleted;

  -- Update last cleanup timestamp
  UPDATE data_retention_policies
  SET last_cleanup_at = NOW()
  WHERE table_name = 'user_activity_logs';

  -- Return results
  RETURN QUERY SELECT result_count, oldest_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup old audit logs
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs(retention_days INTEGER DEFAULT 365)
RETURNS TABLE (
  deleted_count BIGINT,
  oldest_deleted_date TIMESTAMPTZ
) AS $$
DECLARE
  cutoff_date TIMESTAMPTZ;
  result_count BIGINT;
  oldest_date TIMESTAMPTZ;
BEGIN
  -- Calculate cutoff date
  cutoff_date := NOW() - (retention_days || ' days')::INTERVAL;

  -- Get the oldest record that will be deleted
  SELECT MIN(created_at) INTO oldest_date
  FROM audit_logs
  WHERE created_at < cutoff_date;

  -- Delete old audit logs
  WITH deleted AS (
    DELETE FROM audit_logs
    WHERE created_at < cutoff_date
    RETURNING id
  )
  SELECT COUNT(*) INTO result_count FROM deleted;

  -- Update last cleanup timestamp
  UPDATE data_retention_policies
  SET last_cleanup_at = NOW()
  WHERE table_name = 'audit_logs';

  -- Return results
  RETURN QUERY SELECT result_count, oldest_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup old impersonation logs
CREATE OR REPLACE FUNCTION cleanup_old_impersonation_logs(retention_days INTEGER DEFAULT 365)
RETURNS TABLE (
  deleted_count BIGINT,
  oldest_deleted_date TIMESTAMPTZ
) AS $$
DECLARE
  cutoff_date TIMESTAMPTZ;
  result_count BIGINT;
  oldest_date TIMESTAMPTZ;
BEGIN
  -- Calculate cutoff date
  cutoff_date := NOW() - (retention_days || ' days')::INTERVAL;

  -- Get the oldest record that will be deleted
  SELECT MIN(created_at) INTO oldest_date
  FROM impersonation_logs
  WHERE created_at < cutoff_date;

  -- Delete old impersonation logs
  WITH deleted AS (
    DELETE FROM impersonation_logs
    WHERE created_at < cutoff_date
    RETURNING id
  )
  SELECT COUNT(*) INTO result_count FROM deleted;

  -- Update last cleanup timestamp
  UPDATE data_retention_policies
  SET last_cleanup_at = NOW()
  WHERE table_name = 'impersonation_logs';

  -- Return results
  RETURN QUERY SELECT result_count, oldest_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- MASTER CLEANUP FUNCTION
-- =============================================

-- Function to run all data retention cleanups
CREATE OR REPLACE FUNCTION cleanup_all_pii_data()
RETURNS TABLE (
  table_name VARCHAR(100),
  retention_days INTEGER,
  records_deleted BIGINT,
  oldest_deleted TIMESTAMPTZ,
  execution_time_ms INTEGER
) AS $$
DECLARE
  policy RECORD;
  start_time TIMESTAMPTZ;
  end_time TIMESTAMPTZ;
  deleted_count BIGINT;
  oldest_date TIMESTAMPTZ;
BEGIN
  -- Loop through all active retention policies
  FOR policy IN
    SELECT drp.table_name, drp.retention_days
    FROM data_retention_policies drp
    WHERE drp.is_active = true
    ORDER BY drp.table_name
  LOOP
    start_time := clock_timestamp();

    -- Execute appropriate cleanup function based on table name
    CASE policy.table_name
      WHEN 'email_logs' THEN
        SELECT * INTO deleted_count, oldest_date
        FROM cleanup_old_email_logs(policy.retention_days);

      WHEN 'user_activity_logs' THEN
        SELECT * INTO deleted_count, oldest_date
        FROM cleanup_old_user_activity_logs(policy.retention_days);

      WHEN 'audit_logs' THEN
        SELECT * INTO deleted_count, oldest_date
        FROM cleanup_old_audit_logs(policy.retention_days);

      WHEN 'impersonation_logs' THEN
        SELECT * INTO deleted_count, oldest_date
        FROM cleanup_old_impersonation_logs(policy.retention_days);

      ELSE
        -- Skip unknown tables
        deleted_count := 0;
        oldest_date := NULL;
    END CASE;

    end_time := clock_timestamp();

    -- Return results for this table
    RETURN QUERY SELECT
      policy.table_name,
      policy.retention_days,
      COALESCE(deleted_count, 0),
      oldest_date,
      EXTRACT(MILLISECONDS FROM (end_time - start_time))::INTEGER;
  END LOOP;

  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Function to get current retention policy status
CREATE OR REPLACE FUNCTION get_retention_policy_status()
RETURNS TABLE (
  table_name VARCHAR(100),
  retention_days INTEGER,
  is_active BOOLEAN,
  last_cleanup_at TIMESTAMPTZ,
  total_records BIGINT,
  records_to_delete BIGINT,
  oldest_record TIMESTAMPTZ,
  disk_space_estimate VARCHAR(50)
) AS $$
BEGIN
  RETURN QUERY
  WITH table_stats AS (
    SELECT 'email_logs' as tbl,
           COUNT(*) as total,
           COUNT(*) FILTER (WHERE created_at < NOW() - (
             SELECT retention_days::TEXT || ' days'
             FROM data_retention_policies
             WHERE table_name = 'email_logs'
           )::INTERVAL) as to_delete,
           MIN(created_at) as oldest
    FROM email_logs

    UNION ALL

    SELECT 'user_activity_logs' as tbl,
           COUNT(*) as total,
           COUNT(*) FILTER (WHERE created_at < NOW() - (
             SELECT retention_days::TEXT || ' days'
             FROM data_retention_policies
             WHERE table_name = 'user_activity_logs'
           )::INTERVAL) as to_delete,
           MIN(created_at) as oldest
    FROM user_activity_logs

    UNION ALL

    SELECT 'audit_logs' as tbl,
           COUNT(*) as total,
           COUNT(*) FILTER (WHERE created_at < NOW() - (
             SELECT retention_days::TEXT || ' days'
             FROM data_retention_policies
             WHERE table_name = 'audit_logs'
           )::INTERVAL) as to_delete,
           MIN(created_at) as oldest
    FROM audit_logs

    UNION ALL

    SELECT 'impersonation_logs' as tbl,
           COUNT(*) as total,
           COUNT(*) FILTER (WHERE created_at < NOW() - (
             SELECT retention_days::TEXT || ' days'
             FROM data_retention_policies
             WHERE table_name = 'impersonation_logs'
           )::INTERVAL) as to_delete,
           MIN(created_at) as oldest
    FROM impersonation_logs
  )
  SELECT
    drp.table_name,
    drp.retention_days,
    drp.is_active,
    drp.last_cleanup_at,
    COALESCE(ts.total, 0) as total_records,
    COALESCE(ts.to_delete, 0) as records_to_delete,
    ts.oldest as oldest_record,
    pg_size_pretty(
      pg_total_relation_size(drp.table_name::regclass)
    ) as disk_space_estimate
  FROM data_retention_policies drp
  LEFT JOIN table_stats ts ON ts.tbl = drp.table_name
  ORDER BY drp.table_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- AUDIT LOGGING FOR DATA RETENTION
-- =============================================

-- Function to log data retention operations
CREATE OR REPLACE FUNCTION log_data_retention_operation(
  operation_type VARCHAR(50),
  affected_table VARCHAR(100),
  records_affected BIGINT,
  retention_days INTEGER,
  admin_user_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    old_values,
    new_values,
    ip_address,
    user_agent
  ) VALUES (
    admin_user_id,
    'data_retention_cleanup',
    'data_retention',
    affected_table,
    jsonb_build_object(
      'records_count', records_affected,
      'retention_days', retention_days
    ),
    jsonb_build_object(
      'operation', operation_type,
      'timestamp', NOW()
    ),
    NULL, -- IP will be set by API layer if available
    NULL  -- User agent will be set by API layer if available
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- INDEXES FOR EFFICIENT CLEANUP
-- =============================================

-- Ensure created_at indexes exist for efficient deletions
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at_cleanup
  ON email_logs(created_at)
  WHERE created_at < NOW() - INTERVAL '90 days';

CREATE INDEX IF NOT EXISTS idx_user_activity_logs_created_at_cleanup
  ON user_activity_logs(created_at)
  WHERE created_at < NOW() - INTERVAL '90 days';

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at_cleanup
  ON audit_logs(created_at)
  WHERE created_at < NOW() - INTERVAL '365 days';

CREATE INDEX IF NOT EXISTS idx_impersonation_logs_created_at_cleanup
  ON impersonation_logs(created_at)
  WHERE created_at < NOW() - INTERVAL '365 days';

-- =============================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================

COMMENT ON TABLE data_retention_policies IS 'GDPR-compliant data retention policies for PII and sensitive data';
COMMENT ON COLUMN data_retention_policies.retention_days IS 'Number of days to retain data before automatic deletion';
COMMENT ON COLUMN data_retention_policies.last_cleanup_at IS 'Timestamp of last successful cleanup operation';

COMMENT ON FUNCTION cleanup_old_email_logs IS 'Deletes email logs older than specified retention period (default 90 days)';
COMMENT ON FUNCTION cleanup_old_user_activity_logs IS 'Deletes user activity logs older than specified retention period (default 90 days)';
COMMENT ON FUNCTION cleanup_old_audit_logs IS 'Deletes audit logs older than specified retention period (default 365 days)';
COMMENT ON FUNCTION cleanup_old_impersonation_logs IS 'Deletes impersonation logs older than specified retention period (default 365 days)';
COMMENT ON FUNCTION cleanup_all_pii_data IS 'Master function that executes all data retention cleanup operations';
COMMENT ON FUNCTION get_retention_policy_status IS 'Returns current status of all retention policies including records pending deletion';
