---
status: completed
priority: p0
issue_id: "009"
tags: [security, critical, authorization, admin, email-templates]
dependencies: []
github_issue: 86
completed_date: 2025-11-02
completed_commit: 1c778b1
---

# CRITICAL: Missing Admin Authorization on Email Template Endpoints

## Problem Statement

All email template endpoints (`/api/admin/email-templates/*`) have NO admin authorization check. Any authenticated or potentially unauthenticated user can modify email templates used throughout the application.

**Location:**
- `server/api/admin/email-templates/save.post.ts`
- `server/api/admin/email-templates/preview.post.ts`
- `server/api/admin/email-templates/rollback.post.ts`
- `server/api/admin/email-templates/synchronize.post.ts`

## Findings

**Discovered by:** Security audit (parallel agent analysis)
**GitHub Issue:** #86
**Review date:** 2025-11-01

**Vulnerable Code Pattern:**
```typescript
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  // ❌ NO ADMIN AUTHORIZATION CHECK!
  const supabase = serverSupabaseServiceRole(event)
  await supabase.from('email_templates').insert({...})
})
```

**Attack Scenario:**
1. Attacker discovers unprotected endpoint
2. Sends POST to `/api/admin/email-templates/save`
3. Injects malicious content: `<script>steal_data()</script>`
4. All order confirmation emails now contain XSS payload
5. Customer data exfiltrated, brand damage, trust lost

## Impact

- **Unauthorized modification** of email templates
- **Phishing attacks** via modified transactional emails
- **XSS attacks** via injected scripts in email content
- **Brand damage** and loss of customer trust
- **Data exfiltration** by modifying order confirmation emails

## Proposed Solutions

### Option 1: Add requireAdminRole Check (Primary Solution)

**Fix Required:**
```typescript
// Add to ALL 4 endpoints
export default defineEventHandler(async (event) => {
  await requireAdminRole(event)  // ✅ ADD THIS LINE
  const body = await readBody(event)
  // ... rest of code
})
```

**Files to Update:**
1. `server/api/admin/email-templates/save.post.ts`
2. `server/api/admin/email-templates/preview.post.ts`
3. `server/api/admin/email-templates/rollback.post.ts`
4. `server/api/admin/email-templates/synchronize.post.ts`

**Pros:**
- Simple fix (1 line per file)
- Consistent with other admin endpoints
- Uses existing auth infrastructure

**Cons:**
- None

**Effort:** Small (1 hour - 15 minutes per endpoint)
**Risk:** Very Low

### Option 2: Create Middleware for All /admin Routes

Create a global middleware to protect all admin routes:

```typescript
// server/middleware/admin-auth.ts
export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname

  if (path.startsWith('/api/admin')) {
    await requireAdminRole(event)
  }
})
```

**Pros:**
- Protects ALL admin routes automatically
- Can't forget to add auth to new endpoints
- Central authorization logic

**Cons:**
- May affect performance (runs on all requests)
- Need to handle public admin endpoints if any

**Effort:** Small (1 hour)
**Risk:** Low

## Recommended Action

**IMMEDIATE (Today - 1 hour):**

1. **Verify requireAdminRole exists:**
   ```typescript
   // Should be in server/utils/auth.ts or similar
   export async function requireAdminRole(event: H3Event) {
     const user = await serverSupabaseUser(event)

     if (!user) {
       throw createError({
         statusCode: 401,
         statusMessage: 'Unauthorized'
       })
     }

     const { data: profile } = await serverSupabaseServiceRole(event)
       .from('profiles')
       .select('role')
       .eq('id', user.id)
       .single()

     if (profile?.role !== 'admin') {
       throw createError({
         statusCode: 403,
         statusMessage: 'Forbidden - Admin access required'
       })
     }

     return user
   }
   ```

2. **Add auth check to all 4 endpoints** (Option 1)

3. **Test with non-admin user:**
   ```bash
   # Should return 403
   curl -X POST http://localhost:3000/api/admin/email-templates/save \
     -H "Authorization: Bearer <non-admin-token>" \
     -d '{"type":"test","content":"test"}'
   ```

4. **Test with admin user:**
   ```bash
   # Should return 200
   curl -X POST http://localhost:3000/api/admin/email-templates/save \
     -H "Authorization: Bearer <admin-token>" \
     -d '{"type":"test","content":"test"}'
   ```

**OPTIONAL (This Week - 1 hour):**
5. Implement Option 2 (middleware) for defense-in-depth

## Technical Details

- **Affected Files:**
  - `server/api/admin/email-templates/save.post.ts`
  - `server/api/admin/email-templates/preview.post.ts`
  - `server/api/admin/email-templates/rollback.post.ts`
  - `server/api/admin/email-templates/synchronize.post.ts`
  - Potentially: `server/utils/auth.ts` (if requireAdminRole doesn't exist)

- **Related Components:**
  - Email template system
  - Admin dashboard
  - Authentication middleware

- **Database Changes:** None required

## Resources

- GitHub Issue: #86
- Security Audit Report
- OWASP: A01:2021 – Broken Access Control
- Related: #73 (missing role-based access control)

## Acceptance Criteria

- [ ] `requireAdminRole()` helper exists and works correctly
- [ ] All 4 email template endpoints protected with auth check
- [ ] Test with non-admin user returns 403 for all endpoints
- [ ] Test with admin user succeeds for all endpoints
- [ ] No regression in functionality
- [ ] Tests updated to include authorization checks
- [ ] Audit log entry added when templates are modified

## Work Log

### 2025-11-02 - GitHub Issue Synced to Local Todo
**By:** Claude Documentation Triage System
**Actions:**
- Created local todo from GitHub issue #86
- Issue originally discovered on 2025-11-01 during security audit
- Categorized as P0 critical security issue
- Estimated effort: 1 hour

**Learnings:**
- Email templates are powerful attack vectors
- All admin endpoints must have authorization checks
- Defense-in-depth: both endpoint-level and middleware-level protection
- XSS in emails can bypass many client-side protections

## Notes

**Priority Rationale:**
- P0 because it allows unauthorized access to critical functionality
- Email templates control all transactional emails (security-sensitive)
- XSS in emails can bypass Content Security Policy
- Easy to exploit, high impact

**Attack Vectors:**
1. Direct API manipulation (no UI needed)
2. XSS payload injection
3. Phishing via template modification
4. Data exfiltration by modifying templates to send data elsewhere

**Testing Checklist:**
- [ ] Non-admin cannot access save endpoint
- [ ] Non-admin cannot access preview endpoint
- [ ] Non-admin cannot access rollback endpoint
- [ ] Non-admin cannot access synchronize endpoint
- [ ] Admin can access all endpoints
- [ ] Unauthenticated user gets 401
- [ ] Non-admin authenticated user gets 403

Source: Security audit on 2025-11-01, synced from GitHub issue #86
Related: Security issues #85, #87, Code review findings
