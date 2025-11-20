-- Migration: GDPR Data Retention Policies
-- Issue: #90 - No Data Retention Policy
-- Date: 2025-11-13
-- Description: Implements automated data retention and cleanup policies
--              to comply with GDPR Article 5 (data minimization principle)

-- Drop existing functions if they exist (for idempotency)
DROP FUNCTION IF EXISTS cleanup_old_user_activity_logs();
DROP FUNCTION IF EXISTS cleanup_old_audit_logs();
DROP FUNCTION IF EXISTS cleanup_old_email_logs();
DROP FUNCTION IF EXISTS cleanup_old_auth_events();

-- ============================================================================
-- RETENTION POLICY CONFIGURATION
-- ============================================================================

-- Document retention periods in table comments for visibility
COMMENT ON TABLE user_activity_logs IS
  'User activity tracking data. Retention: 90 days. Auto-cleanup enabled.';

COMMENT ON TABLE audit_logs IS
  'System audit logs for compliance. Retention: 7 years. Auto-cleanup enabled.';

COMMENT ON TABLE email_logs IS
  'Email sending history. Retention: 2 years. Auto-cleanup enabled.';

COMMENT ON TABLE auth_events IS
  'Authentication events. Retention: 1 year. Auto-cleanup enabled.';

-- ============================================================================
-- CLEANUP FUNCTIONS
-- ============================================================================

-- Cleanup old user activity logs (90 days retention)
CREATE OR REPLACE FUNCTION cleanup_old_user_activity_logs()
RETURNS TABLE (
  deleted_count INTEGER,
  retention_days INTEGER,
  cleanup_timestamp TIMESTAMP
) AS $$
DECLARE
  v_deleted_count INTEGER;
  v_retention_days INTEGER := 90;
  v_cutoff_date TIMESTAMP;
BEGIN
  v_cutoff_date := NOW() - INTERVAL '90 days';

  -- Delete old activity logs
  DELETE FROM user_activity_logs
  WHERE created_at < v_cutoff_date;

  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

  -- Log cleanup action
  INSERT INTO audit_logs (
    user_id,
    action,
    resource_type,
    metadata,
    created_at
  ) VALUES (
    NULL,
    'automated_data_retention_cleanup',
    'user_activity_logs',
    jsonb_build_object(
      'deleted_count', v_deleted_count,
      'retention_days', v_retention_days,
      'cutoff_date', v_cutoff_date::TEXT
    ),
    NOW()
  );

  RETURN QUERY SELECT v_deleted_count, v_retention_days, NOW();
END;
$$ LANGUAGE plpgsql;

-- Cleanup old audit logs (7 years retention)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS TABLE (
  deleted_count INTEGER,
  retention_years INTEGER,
  cleanup_timestamp TIMESTAMP
) AS $$
DECLARE
  v_deleted_count INTEGER;
  v_retention_years INTEGER := 7;
  v_cutoff_date TIMESTAMP;
BEGIN
  v_cutoff_date := NOW() - INTERVAL '7 years';

  -- Delete old audit logs (except critical events)
  -- Keep: security events, account deletions, admin actions
  DELETE FROM audit_logs
  WHERE created_at < v_cutoff_date
    AND action NOT IN (
      'account_deleted',
      'account_deleted_atomic',
      'security_breach',
      'unauthorized_access',
      'privilege_escalation'
    );

  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

  RETURN QUERY SELECT v_deleted_count, v_retention_years, NOW();
END;
$$ LANGUAGE plpgsql;

-- Cleanup old email logs (2 years retention)
CREATE OR REPLACE FUNCTION cleanup_old_email_logs()
RETURNS TABLE (
  deleted_count INTEGER,
  retention_years INTEGER,
  cleanup_timestamp TIMESTAMP
) AS $$
DECLARE
  v_deleted_count INTEGER;
  v_retention_years INTEGER := 2;
  v_cutoff_date TIMESTAMP;
BEGIN
  v_cutoff_date := NOW() - INTERVAL '2 years';

  -- Delete old email logs
  DELETE FROM email_logs
  WHERE created_at < v_cutoff_date;

  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

  RETURN QUERY SELECT v_deleted_count, v_retention_years, NOW();
END;
$$ LANGUAGE plpgsql;

-- Cleanup old auth events (1 year retention)
CREATE OR REPLACE FUNCTION cleanup_old_auth_events()
RETURNS TABLE (
  deleted_count INTEGER,
  retention_years INTEGER,
  cleanup_timestamp TIMESTAMP
) AS $$
DECLARE
  v_deleted_count INTEGER;
  v_retention_years INTEGER := 1;
  v_cutoff_date TIMESTAMP;
BEGIN
  v_cutoff_date := NOW() - INTERVAL '1 year';

  -- Delete old auth events (except account deletions)
  DELETE FROM auth_events
  WHERE created_at < v_cutoff_date
    AND event_type NOT IN (
      'account_deleted',
      'account_deleted_atomic'
    );

  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

  RETURN QUERY SELECT v_deleted_count, v_retention_years, NOW();
END;
$$ LANGUAGE plpgsql;

-- Master cleanup function that runs all cleanup jobs
CREATE OR REPLACE FUNCTION run_data_retention_cleanup()
RETURNS JSONB AS $$
DECLARE
  v_activity_logs_result RECORD;
  v_audit_logs_result RECORD;
  v_email_logs_result RECORD;
  v_auth_events_result RECORD;
BEGIN
  -- Run all cleanup functions
  SELECT * INTO v_activity_logs_result FROM cleanup_old_user_activity_logs();
  SELECT * INTO v_audit_logs_result FROM cleanup_old_audit_logs();
  SELECT * INTO v_email_logs_result FROM cleanup_old_email_logs();
  SELECT * INTO v_auth_events_result FROM cleanup_old_auth_events();

  -- Return summary
  RETURN jsonb_build_object(
    'success', true,
    'timestamp', NOW()::TEXT,
    'results', jsonb_build_object(
      'user_activity_logs', jsonb_build_object(
        'deleted', v_activity_logs_result.deleted_count,
        'retention_days', v_activity_logs_result.retention_days
      ),
      'audit_logs', jsonb_build_object(
        'deleted', v_audit_logs_result.deleted_count,
        'retention_years', v_audit_logs_result.retention_years
      ),
      'email_logs', jsonb_build_object(
        'deleted', v_email_logs_result.deleted_count,
        'retention_years', v_email_logs_result.retention_years
      ),
      'auth_events', jsonb_build_object(
        'deleted', v_auth_events_result.deleted_count,
        'retention_years', v_auth_events_result.retention_years
      )
    )
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SCHEDULED CLEANUP (using pg_cron extension)
-- ============================================================================

-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily cleanup at 2 AM UTC
-- Note: Adjust timezone as needed for your deployment
SELECT cron.schedule(
  'data-retention-cleanup',
  '0 2 * * *', -- Every day at 2 AM
  'SELECT run_data_retention_cleanup()'
);

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant execute permissions to service role for manual cleanup if needed
GRANT EXECUTE ON FUNCTION cleanup_old_user_activity_logs() TO service_role;
GRANT EXECUTE ON FUNCTION cleanup_old_audit_logs() TO service_role;
GRANT EXECUTE ON FUNCTION cleanup_old_email_logs() TO service_role;
GRANT EXECUTE ON FUNCTION cleanup_old_auth_events() TO service_role;
GRANT EXECUTE ON FUNCTION run_data_retention_cleanup() TO service_role;

-- ============================================================================
-- DOCUMENTATION
-- ============================================================================

COMMENT ON FUNCTION cleanup_old_user_activity_logs() IS
  'GDPR Compliance: Automatically deletes user activity logs older than 90 days.
   Scheduled to run daily at 2 AM UTC via pg_cron.';

COMMENT ON FUNCTION cleanup_old_audit_logs() IS
  'GDPR Compliance: Automatically deletes audit logs older than 7 years.
   Critical security events are preserved indefinitely.
   Scheduled to run daily at 2 AM UTC via pg_cron.';

COMMENT ON FUNCTION cleanup_old_email_logs() IS
  'GDPR Compliance: Automatically deletes email logs older than 2 years.
   Scheduled to run daily at 2 AM UTC via pg_cron.';

COMMENT ON FUNCTION cleanup_old_auth_events() IS
  'GDPR Compliance: Automatically deletes auth events older than 1 year.
   Account deletion events are preserved indefinitely.
   Scheduled to run daily at 2 AM UTC via pg_cron.';

COMMENT ON FUNCTION run_data_retention_cleanup() IS
  'Master function that runs all data retention cleanup jobs.
   Returns a summary of deleted records for each table.
   Scheduled to run daily at 2 AM UTC via pg_cron.';
