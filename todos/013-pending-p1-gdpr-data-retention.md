---
status: pending
priority: p1
issue_id: "013"
tags: [gdpr, compliance, data-retention, privacy]
dependencies: []
github_issue: 90
---

# GDPR: No Data Retention Policy for PII

## Problem Statement

Analytics and logging tables grow unbounded with no retention policy. IP addresses and user activity stored indefinitely, violating GDPR data minimization principles.

**Location:**
- `supabase/sql/supabase-analytics-schema.sql`
- `supabase/sql/supabase-email-logs-schema.sql`

## Findings

**Discovered by:** Data integrity review
**GitHub Issue:** #90

**GDPR Violations:**
1. IP addresses stored indefinitely (PII under GDPR)
2. User activity tracked without time limit
3. No automated data purging
4. Violates data minimization principle (GDPR Article 5)
5. No "right to erasure" automation

## Impact

- GDPR fines up to 4% of annual revenue
- Privacy breach liability
- Database performance degradation
- Cannot demonstrate compliance

## Proposed Solution

**1. Add retention policies:**
```sql
COMMENT ON TABLE user_activity_logs IS 'Retention: 90 days';
COMMENT ON TABLE audit_logs IS 'Retention: 7 years';
COMMENT ON TABLE email_logs IS 'Retention: 2 years';
```

**2. Create cleanup function:**
```sql
CREATE FUNCTION cleanup_old_data()
RETURNS void AS $$
BEGIN
  DELETE FROM user_activity_logs 
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  DELETE FROM email_logs 
  WHERE created_at < NOW() - INTERVAL '2 years';
  
  -- Anonymize instead of delete for audit logs
  UPDATE audit_logs
  SET ip_address = NULL, user_agent = NULL
  WHERE created_at < NOW() - INTERVAL '7 years';
END;
$$ LANGUAGE plpgsql;
```

**3. Schedule monthly cleanup via cron**
**4. Implement PII anonymization on user deletion**

## Acceptance Criteria

- [ ] Retention policies documented
- [ ] Automated cleanup implemented
- [ ] PII anonymization on account deletion
- [ ] Tested cleanup doesn't affect active data
- [ ] GDPR compliance verified

## Estimated Effort

4-6 hours

## Resources

- GitHub Issue: #90
- GDPR Article 5: https://gdpr-info.eu/art-5-gdpr/
- Supabase pg_cron: https://supabase.com/docs/guides/database/extensions/pg_cron

---
Source: Data integrity review 2025-11-01, synced from GitHub issue #90
