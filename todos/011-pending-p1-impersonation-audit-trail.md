---
status: pending
priority: p1
issue_id: "011"
tags: [security, audit, admin, compliance, logging]
dependencies: []
github_issue: 87
---

# User Impersonation Without Proper Audit Trail

## Problem Statement

The admin impersonation feature has several security weaknesses: logs to console only, no time limits on sessions, no proper session tokens, no alerts to impersonated users, and client-side implementation allows session manipulation.

**Location:** `server/api/admin/impersonate.post.ts`

## Findings

**Discovered by:** Security audit (parallel agent analysis)
**GitHub Issue:** #87
**Review date:** 2025-11-01

**Current Implementation Issues:**
1. `logAdminAction()` just calls `console.log()` - no database persistence
2. No time limits on impersonation sessions
3. No proper session token generation
4. No alerts/notifications to impersonated user
5. Client-side implementation allows session manipulation

**Current Code:**
```typescript
export default defineEventHandler(async (event) => {
  await requireAdminRole(event)

  const { userId, action } = await readBody(event)

  if (action === 'start') {
    // ❌ Just console.log, not stored in database
    logAdminAction(adminId, 'impersonate_start', { userId })

    // ❌ No expiration time set
    return { success: true }
  }
})
```

## Impact

- **Admins can impersonate indefinitely** - No session limits
- **No accountability** if malicious admin actions occur
- **Difficult to investigate** security incidents
- **Potential unauthorized data access** without tracking
- **Compliance violations** (SOX, GDPR, PCI-DSS)
- **No user awareness** they're being impersonated

## Proposed Solutions

### Option 1: Database Audit Logging + Time-Limited Tokens (RECOMMENDED)

Implement comprehensive audit trail with session management:

**Step 1: Create audit table**
```sql
-- supabase/migrations/XXX_impersonation_logs.sql
CREATE TABLE impersonation_logs (
  id BIGSERIAL PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES auth.users(id),
  target_user_id UUID NOT NULL REFERENCES auth.users(id),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  ip_address INET,
  user_agent TEXT,
  reason TEXT,
  actions_taken JSONB DEFAULT '[]'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_impersonation_logs_admin ON impersonation_logs(admin_id);
CREATE INDEX idx_impersonation_logs_target ON impersonation_logs(target_user_id);
CREATE INDEX idx_impersonation_logs_active ON impersonation_logs(started_at, expires_at)
  WHERE ended_at IS NULL;

-- RLS policies
ALTER TABLE impersonation_logs ENABLE ROW LEVEL SECURITY;

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
```

**Step 2: Update impersonate endpoint**
```typescript
// server/api/admin/impersonate.post.ts
export default defineEventHandler(async (event) => {
  const admin = await requireAdminRole(event)
  const supabase = serverSupabaseServiceRole(event)

  const { userId, action, duration = 30, reason } = await readBody(event)

  if (action === 'start') {
    // Validate reason is provided
    if (!reason || reason.trim().length < 10) {
      throw createError({
        statusCode: 400,
        message: 'Reason for impersonation required (min 10 characters)'
      })
    }

    // Create database audit entry
    const { data: auditLog, error } = await supabase
      .from('impersonation_logs')
      .insert({
        admin_id: admin.id,
        target_user_id: userId,
        started_at: new Date(),
        expires_at: new Date(Date.now() + duration * 60000),
        ip_address: getRequestIP(event),
        user_agent: getHeader(event, 'user-agent'),
        reason: reason
      })
      .select()
      .single()

    if (error) throw error

    // Create time-limited JWT for impersonation
    const token = await generateImpersonationToken({
      adminId: admin.id,
      userId: userId,
      logId: auditLog.id,
      expiresIn: duration * 60
    })

    // Send notification to impersonated user
    await sendImpersonationAlert(userId, {
      adminEmail: admin.email,
      startTime: auditLog.started_at,
      reason: reason
    })

    return {
      token,
      logId: auditLog.id,
      expiresAt: auditLog.expires_at
    }
  }

  if (action === 'end') {
    const { logId } = await readBody(event)

    // Mark session as ended
    await supabase
      .from('impersonation_logs')
      .update({ ended_at: new Date() })
      .eq('id', logId)
      .eq('admin_id', admin.id)

    return { success: true }
  }
})
```

**Step 3: Token generation helper**
```typescript
// server/utils/impersonation.ts
import jwt from 'jsonwebtoken'

export async function generateImpersonationToken(payload: {
  adminId: string
  userId: string
  logId: number
  expiresIn: number
}): Promise<string> {
  const secret = process.env.IMPERSONATION_JWT_SECRET
  if (!secret) throw new Error('IMPERSONATION_JWT_SECRET not configured')

  return jwt.sign(
    {
      type: 'impersonation',
      admin_id: payload.adminId,
      user_id: payload.userId,
      log_id: payload.logId
    },
    secret,
    { expiresIn: payload.expiresIn }
  )
}

export async function verifyImpersonationToken(token: string) {
  const secret = process.env.IMPERSONATION_JWT_SECRET
  if (!secret) throw new Error('IMPERSONATION_JWT_SECRET not configured')

  try {
    return jwt.verify(token, secret)
  } catch (error) {
    throw createError({
      statusCode: 401,
      message: 'Invalid or expired impersonation token'
    })
  }
}
```

**Step 4: User notification**
```typescript
// server/utils/notifications.ts
export async function sendImpersonationAlert(
  userId: string,
  details: {
    adminEmail: string
    startTime: Date
    reason: string
  }
) {
  // Send email notification
  await sendEmail({
    to: userId,
    template: 'impersonation_alert',
    data: {
      admin_email: details.adminEmail,
      start_time: details.startTime,
      reason: details.reason,
      support_url: 'https://moldovadirect.com/support'
    }
  })

  // Optional: In-app notification
  await createNotification({
    user_id: userId,
    type: 'security_alert',
    title: 'Account Access',
    message: `An administrator accessed your account for: ${details.reason}`,
    created_at: new Date()
  })
}
```

**Pros:**
- **Complete audit trail** in database
- **Time-limited sessions** prevent indefinite access
- **User notifications** provide transparency
- **Trackable actions** for compliance
- **Secure tokens** prevent manipulation

**Cons:**
- More implementation complexity
- Requires JWT secret management
- Email sending dependency

**Effort:** Medium (4 hours)
**Risk:** Low

### Option 2: Minimal Logging Enhancement

Just add database logging without other improvements:

```typescript
// Quick fix - still has security gaps
logAdminAction(adminId, 'impersonate_start', { userId })

await supabase
  .from('admin_action_logs')
  .insert({
    admin_id: adminId,
    action: 'impersonate',
    target_user_id: userId,
    timestamp: new Date()
  })
```

**Pros:**
- Quick to implement (30 min)
- Better than console.log

**Cons:**
- Still no time limits
- Still no user notifications
- Still allows session manipulation
- Incomplete solution

**Effort:** Small (30 minutes)
**Risk:** Medium (doesn't fix core issues)

## Recommended Action

**THIS WEEK (4 hours):**

Implement Option 1 (full solution):

1. **Create migration** for impersonation_logs table
2. **Update impersonate endpoint** with audit logging
3. **Implement JWT token generation** with expiration
4. **Add user notification** system
5. **Create admin UI** to view impersonation logs
6. **Test expiration** - verify sessions end automatically
7. **Test audit trail** - verify all actions logged

**Testing:**
```typescript
// Test 1: Impersonation requires reason
await expect(startImpersonation({ userId, reason: '' }))
  .rejects.toThrow('Reason required')

// Test 2: Session expires after duration
const { token, expiresAt } = await startImpersonation({
  userId,
  duration: 1, // 1 minute
  reason: 'Customer support request #123'
})
// Wait 61 seconds
await expect(useToken(token)).rejects.toThrow('expired')

// Test 3: User receives notification
const notifications = await getNotifications(userId)
expect(notifications).toContainMatch(/administrator accessed your account/)

// Test 4: All actions logged in database
const logs = await getImpersonationLogs(adminId)
expect(logs).toHaveLength(1)
expect(logs[0].reason).toBe('Customer support request #123')
```

## Technical Details

- **Affected Files:**
  - New: `supabase/migrations/XXX_impersonation_logs.sql`
  - Update: `server/api/admin/impersonate.post.ts`
  - New: `server/utils/impersonation.ts`
  - Update: `server/utils/notifications.ts`
  - New: Admin UI component for viewing logs

- **Environment Variables:**
  - `IMPERSONATION_JWT_SECRET` - Secret for JWT signing

- **Database Changes:**
  - New table: `impersonation_logs`
  - RLS policies for admin access

## Resources

- GitHub Issue: #87
- JWT Library: https://github.com/auth0/node-jsonwebtoken
- SOX Compliance: https://www.sec.gov/spotlight/sarbanes-oxley.htm
- Related: #73 (admin authorization)

## Acceptance Criteria

- [ ] Migration created with impersonation_logs table
- [ ] Endpoint requires reason for impersonation (min 10 chars)
- [ ] Time-limited JWT tokens generated (default 30 min)
- [ ] Database logs all impersonation sessions
- [ ] IP address and user agent captured
- [ ] User receives email notification when impersonated
- [ ] Admin UI shows impersonation history
- [ ] Sessions automatically expire
- [ ] Cannot extend expired sessions without re-auth
- [ ] All acceptance tests pass

## Work Log

### 2025-11-02 - GitHub Issue Synced to Local Todo
**By:** Claude Documentation Triage System
**Actions:**
- Created local todo from GitHub issue #87
- Issue originally discovered on 2025-11-01 during security audit
- Categorized as P1 high priority security issue
- Estimated effort: 4 hours

**Learnings:**
- Impersonation is a powerful admin feature requiring strong controls
- Audit trails are critical for compliance and incident investigation
- Time limits prevent indefinite access and forgotten sessions
- User notifications provide transparency and trust

## Notes

**Priority Rationale:**
- P1 (not P0) because feature exists but needs hardening
- Critical for compliance (SOX, GDPR, PCI-DSS)
- Important for incident investigation
- Should be fixed before next compliance audit

**Compliance Requirements:**
- SOX: Requires audit trail of privileged access
- GDPR: Users have right to know who accessed their data
- PCI-DSS: All access to cardholder data must be logged

**Best Practices:**
- Always require reason for impersonation
- Notify users when accessed by admin
- Time-limit all privileged sessions
- Log all actions taken during impersonation
- Periodic review of impersonation logs

Source: Security audit on 2025-11-01, synced from GitHub issue #87
Related: Security issues #73, #86, admin audit requirements
