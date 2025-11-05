# GDPR Data Retention Policy

## Overview

This document describes the GDPR-compliant data retention policies implemented for Moldova Direct. The system automatically manages the lifecycle of Personally Identifiable Information (PII) to ensure compliance with GDPR regulations.

**GitHub Issue:** #90

## What is Data Retention?

Data retention refers to the practice of storing data for a specified period of time and then securely deleting it. GDPR Article 5(1)(e) requires that personal data be:

> "kept in a form which permits identification of data subjects for no longer than is necessary for the purposes for which the personal data are processed"

## Retention Policies

The following retention policies are configured:

| Table | Data Type | Retention Period | Justification |
|-------|-----------|------------------|---------------|
| `email_logs` | Email delivery logs | 90 days | Operational logs for customer service and troubleshooting |
| `user_activity_logs` | User activity tracking | 90 days | Analytics and security monitoring |
| `audit_logs` | Admin action logs | 365 days (1 year) | Compliance and security investigations |
| `impersonation_logs` | Admin impersonation logs | 365 days (1 year) | Compliance and oversight |

### PII Data in Each Table

#### email_logs
- **PII:** Recipient email address
- **Purpose:** Track email delivery for customer service
- **Retention:** 90 days after email sent

#### user_activity_logs
- **PII:** User ID, IP address, user agent, session ID
- **Purpose:** Analytics, security monitoring, fraud detection
- **Retention:** 90 days after activity

#### audit_logs
- **PII:** User ID, IP address, user agent
- **Purpose:** Security investigations, compliance audits
- **Retention:** 1 year after action (longer due to legal/compliance requirements)

#### impersonation_logs
- **PII:** Admin ID, target user ID, IP address, user agent
- **Purpose:** Admin oversight, compliance, security investigations
- **Retention:** 1 year after impersonation session

## How It Works

### Automatic Cleanup

The system provides SQL functions that can be called manually or scheduled via cron jobs:

```sql
-- Clean up all PII data according to retention policies
SELECT * FROM cleanup_all_pii_data();

-- Clean up specific tables
SELECT * FROM cleanup_old_email_logs(90);
SELECT * FROM cleanup_old_user_activity_logs(90);
SELECT * FROM cleanup_old_audit_logs(365);
SELECT * FROM cleanup_old_impersonation_logs(365);
```

### Admin API Endpoints

Two API endpoints are provided for managing data retention:

#### GET /api/admin/data-retention

Retrieve the current status of all retention policies.

**Authorization:** Admin role required

**Response:**
```json
{
  "success": true,
  "timestamp": "2025-11-05T10:00:00Z",
  "summary": {
    "total_tables": 4,
    "total_records": 15420,
    "total_to_delete": 450,
    "active_policies": 4
  },
  "policies": [
    {
      "table_name": "email_logs",
      "retention_days": 90,
      "is_active": true,
      "last_cleanup_at": "2025-11-04T00:00:00Z",
      "total_records": 5000,
      "records_to_delete": 150,
      "oldest_record": "2024-08-01T00:00:00Z",
      "disk_space_estimate": "2.5 MB"
    }
  ]
}
```

#### POST /api/admin/data-retention

Trigger data retention cleanup operations.

**Authorization:** Admin role required

**Request Body:**
```json
{
  "action": "cleanup-all",
  "confirm": true,
  "dryRun": false
}
```

**Available Actions:**
- `cleanup-all` - Run all retention cleanups
- `cleanup-email-logs` - Clean email logs only
- `cleanup-activity-logs` - Clean activity logs only
- `cleanup-audit-logs` - Clean audit logs only
- `cleanup-impersonation-logs` - Clean impersonation logs only
- `get-status` - Get status (same as GET endpoint)

**Safety Features:**
- `confirm: true` required for actual deletions
- `dryRun: true` to preview what would be deleted without deleting
- All operations are logged in audit_logs

**Response:**
```json
{
  "success": true,
  "message": "Successfully completed cleanup-all",
  "results": {
    "action": "cleanup-all",
    "timestamp": "2025-11-05T10:00:00Z",
    "dryRun": false,
    "deletedCounts": {
      "email_logs": 150,
      "user_activity_logs": 200,
      "audit_logs": 50,
      "impersonation_logs": 10
    },
    "details": [
      {
        "table_name": "email_logs",
        "retention_days": 90,
        "records_deleted": 150,
        "oldest_deleted": "2024-08-01T00:00:00Z",
        "execution_time_ms": 125
      }
    ],
    "errors": []
  }
}
```

## Usage Examples

### Check Status

```bash
curl -X GET https://your-domain.com/api/admin/data-retention \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Dry Run (Preview)

```bash
curl -X POST https://your-domain.com/api/admin/data-retention \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "cleanup-all",
    "dryRun": true
  }'
```

### Actual Cleanup

```bash
curl -X POST https://your-domain.com/api/admin/data-retention \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "cleanup-all",
    "confirm": true
  }'
```

### Clean Specific Table

```bash
curl -X POST https://your-domain.com/api/admin/data-retention \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "cleanup-email-logs",
    "confirm": true
  }'
```

## Setting Up Automated Cleanup

For production environments, you should set up automated cleanup using a cron job or scheduled task.

### Option 1: PostgreSQL pg_cron Extension

```sql
-- Install pg_cron extension (if not already installed)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily cleanup at 2 AM UTC
SELECT cron.schedule(
  'daily-pii-cleanup',
  '0 2 * * *',
  $$SELECT cleanup_all_pii_data()$$
);

-- View scheduled jobs
SELECT * FROM cron.job;

-- Unschedule if needed
SELECT cron.unschedule('daily-pii-cleanup');
```

### Option 2: External Cron Job

Create a script that calls the API endpoint:

```bash
#!/bin/bash
# cleanup-pii.sh

ADMIN_TOKEN="your-admin-token"
API_URL="https://your-domain.com/api/admin/data-retention"

curl -X POST "$API_URL" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action": "cleanup-all", "confirm": true}'
```

Add to crontab:
```bash
# Run daily at 2 AM
0 2 * * * /path/to/cleanup-pii.sh >> /var/log/pii-cleanup.log 2>&1
```

### Option 3: GitHub Actions (for development/staging)

```yaml
name: Daily PII Cleanup
on:
  schedule:
    - cron: '0 2 * * *'  # 2 AM UTC daily
  workflow_dispatch:  # Allow manual trigger

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - name: Run Data Retention Cleanup
        run: |
          curl -X POST ${{ secrets.API_URL }}/api/admin/data-retention \
            -H "Authorization: Bearer ${{ secrets.ADMIN_TOKEN }}" \
            -H "Content-Type: application/json" \
            -d '{"action": "cleanup-all", "confirm": true}'
```

## Compliance Considerations

### GDPR Requirements Met

✅ **Article 5(1)(e) - Storage Limitation:** Data is retained only as long as necessary

✅ **Article 17 - Right to Erasure:** Data is automatically deleted after retention period

✅ **Article 30 - Records of Processing:** All deletions are logged in audit_logs

✅ **Article 32 - Security:** Only admins can trigger cleanup, all operations audited

### Audit Trail

All data retention operations are logged in the `audit_logs` table with:
- Admin user who triggered the operation
- Timestamp of operation
- Number of records deleted
- IP address and user agent
- Details of what was deleted

### Data Subject Rights

Users can request data deletion at any time via account deletion:
- Account deletion triggers immediate anonymization/deletion
- Data retention policies ensure no data persists beyond necessary period
- Audit logs track all data operations for compliance reporting

## Modifying Retention Policies

Retention periods can be adjusted by updating the `data_retention_policies` table:

```sql
-- Update retention period for email logs (requires service role)
UPDATE data_retention_policies
SET retention_days = 60,  -- Change from 90 to 60 days
    updated_at = NOW()
WHERE table_name = 'email_logs';

-- Disable a retention policy temporarily
UPDATE data_retention_policies
SET is_active = false
WHERE table_name = 'email_logs';

-- Re-enable a retention policy
UPDATE data_retention_policies
SET is_active = true
WHERE table_name = 'email_logs';
```

**Note:** Changes to retention policies should be reviewed by legal/compliance team.

## Monitoring

### Database Queries

Check what will be deleted:
```sql
SELECT * FROM get_retention_policy_status();
```

Check last cleanup times:
```sql
SELECT table_name, retention_days, last_cleanup_at
FROM data_retention_policies
ORDER BY last_cleanup_at DESC;
```

View cleanup audit logs:
```sql
SELECT *
FROM audit_logs
WHERE action = 'data_retention_cleanup'
ORDER BY created_at DESC
LIMIT 10;
```

### Alerts

Set up monitoring alerts for:
- Large numbers of records pending deletion (> threshold)
- Failed cleanup operations
- Cleanup operations not run in > 24 hours
- Unusual deletion patterns

## Troubleshooting

### Cleanup Not Working

1. **Check if policies are active:**
   ```sql
   SELECT * FROM data_retention_policies WHERE is_active = false;
   ```

2. **Check for errors in audit logs:**
   ```sql
   SELECT * FROM audit_logs
   WHERE action = 'data_retention_cleanup_failed'
   ORDER BY created_at DESC;
   ```

3. **Manually run cleanup with verbose output:**
   ```sql
   SELECT * FROM cleanup_all_pii_data();
   ```

### Performance Issues

If cleanup is slow:

1. **Check indexes exist:**
   ```sql
   SELECT tablename, indexname
   FROM pg_indexes
   WHERE indexname LIKE '%created_at%';
   ```

2. **Run cleanup during off-peak hours**

3. **Consider batch deletion for large tables**

### Records Not Being Deleted

Verify the record age:
```sql
-- Check oldest records in each table
SELECT 'email_logs' as table_name, MIN(created_at) as oldest FROM email_logs
UNION ALL
SELECT 'user_activity_logs', MIN(created_at) FROM user_activity_logs
UNION ALL
SELECT 'audit_logs', MIN(created_at) FROM audit_logs
UNION ALL
SELECT 'impersonation_logs', MIN(created_at) FROM impersonation_logs;
```

## Related Documentation

- [GDPR Compliance Overview](./GDPR_COMPLIANCE.md) (if exists)
- [User Data Deletion](./USER_DATA_DELETION.md) (if exists)
- [Admin API Documentation](./ADMIN_API.md) (if exists)
- [Security Policy](./SECURITY.md) (if exists)

## Support

For questions or issues with data retention policies:
1. Check the troubleshooting section above
2. Review audit logs for error messages
3. Contact the development team
4. For legal/compliance questions, contact the legal department

---

**Last Updated:** 2025-11-05
**Implemented in:** Issue #90
**Version:** 1.0
