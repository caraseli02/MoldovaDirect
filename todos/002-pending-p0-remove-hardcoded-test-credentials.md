---
status: completed
priority: p0
issue_id: "002"
tags: [security, critical, credentials, test-infrastructure, code-review]
dependencies: []
github_issue: 59
completed_date: 2025-11-02
completed_commit: ae7a026
---

# 🔴 CRITICAL: Remove Hardcoded Test Credentials from Source Control

## Problem Statement

Test user credentials (emails and passwords) are hardcoded in the test fixtures file, creating potential backdoor accounts if these credentials exist in non-development environments.

**Location:** `/Users/vladislavcaraseli/Documents/MoldovaDirect/tests/fixtures/base.ts`

```typescript
// Lines 43-50
testUser: async ({ locale }, use) => {
  const user: TestUser = {
    email: `test-${locale}@moldovadirect.com`,
    password: 'Test123!@#',  // ⚠️ HARDCODED
    name: `Test User ${locale.toUpperCase()}`,
    locale,
  }
  await use(user)
}

// Lines 53-60
adminUser: async ({}, use) => {
  const admin: AdminUser = {
    email: 'admin@moldovadirect.com',
    password: 'Admin123!@#',  // ⚠️ HARDCODED
    name: 'Admin User',
    role: 'admin',
  }
  await use(admin)
}
```

## Impact

- **Security Risk:** Hardcoded credentials in version control create backdoor accounts
- **Predictable Emails:** Easy to enumerate: `test-es@moldovadirect.com`, `test-en@moldovadirect.com`, etc.
- **Weak Passwords:** Same password for all test users
- **Admin Risk:** Admin account with known credentials is critical
- **Production Risk:** If these accounts exist in staging/production, immediate compromise

## Findings

**Discovered by:** security-sentinel agent during code review
**Review date:** 2025-11-01
**Attack Vectors:**
1. Direct login using exposed credentials
2. Password reset with known email addresses
3. Account enumeration via registration/login endpoints
4. Privilege escalation via admin account

**OWASP Category:** A07:2021 – Identification and Authentication Failures

## Proposed Solutions

### Option 1: Environment Variables (RECOMMENDED)

Replace hardcoded credentials with environment variables:

```typescript
testUser: async ({ locale }, use) => {
  const user: TestUser = {
    email: process.env.TEST_USER_EMAIL || `test-${locale}@example.test`,
    password: process.env.TEST_USER_PASSWORD || generateSecurePassword(),
    name: `Test User ${locale.toUpperCase()}`,
    locale,
  }
  await use(user)
}

adminUser: async ({}, use) => {
  const admin: AdminUser = {
    email: process.env.TEST_ADMIN_EMAIL || 'admin@example.test',
    password: process.env.TEST_ADMIN_PASSWORD || generateSecurePassword(),
    name: 'Admin User',
    role: 'admin',
  }
  await use(admin)
}
```

**Pros:**
- Credentials not in source control
- Different credentials per environment
- Can rotate without code changes

**Cons:**
- Requires environment configuration
- Team coordination needed

**Effort:** Small (1 hour)
**Risk:** Low

### Option 2: Dynamic Account Creation

Create test accounts dynamically in global-setup.ts:

```typescript
async function globalSetup(config: FullConfig) {
  // Create test users via API
  const testUser = await createTestUser({
    email: `test-${Date.now()}@example.test`,
    password: generateSecurePassword(),
  })

  // Store credentials in environment for tests
  process.env.TEST_USER_EMAIL = testUser.email
  process.env.TEST_USER_PASSWORD = testUser.password
}
```

**Pros:**
- No hardcoded credentials
- Truly unique per test run
- Automatic cleanup possible

**Cons:**
- More complex setup
- Requires API endpoints

**Effort:** Medium (3-4 hours)
**Risk:** Medium

### Option 3: Use .test Domain (IMMEDIATE MITIGATION)

At minimum, change to `.test` TLD to prevent confusion with production:

```typescript
email: `test-${locale}@moldovadirect.test`,  // .test instead of .com
```

**Pros:**
- Quick fix
- .test domain is reserved and can't be registered
- Makes it obvious these are test accounts

**Cons:**
- Still hardcoded
- Doesn't solve password issue

**Effort:** Small (15 minutes)
**Risk:** Very Low

## Recommended Action

**IMMEDIATE (Today):**

1. **Verify accounts don't exist in production:**
   ```sql
   SELECT email, created_at, last_sign_in_at
   FROM auth.users
   WHERE email LIKE 'test-%@moldovadirect.com'
      OR email = 'admin@moldovadirect.com';
   ```

2. **If accounts exist, delete them immediately:**
   ```sql
   -- Only in production/staging if you found them!
   DELETE FROM auth.users
   WHERE email IN (
     'test-es@moldovadirect.com',
     'test-en@moldovadirect.com',
     'test-ro@moldovadirect.com',
     'test-ru@moldovadirect.com',
     'admin@moldovadirect.com'
   );
   ```

3. **Add database constraint to prevent recreation:**
   ```sql
   -- Prevent test accounts in production
   CREATE OR REPLACE FUNCTION prevent_test_accounts()
   RETURNS TRIGGER AS $$
   BEGIN
     IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') AND
        NEW.email ~ '^test-.*@moldovadirect\.com$' THEN
       RAISE EXCEPTION 'Test accounts not allowed in this environment';
     END IF;
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql;

   CREATE TRIGGER prevent_test_accounts_trigger
   BEFORE INSERT OR UPDATE ON auth.users
   FOR EACH ROW EXECUTE FUNCTION prevent_test_accounts();
   ```

**THIS WEEK:**

4. Implement Option 1 (Environment Variables)
5. Create helper function for secure password generation
6. Update CI/CD to set test credentials
7. Document test account management process

## Technical Details

- **Affected Files:**
  - `tests/fixtures/base.ts` (lines 43-60)
  - Any test files using these fixtures

- **Test Account Patterns:**
  - `test-es@moldovadirect.com`
  - `test-en@moldovadirect.com`
  - `test-ro@moldovadirect.com`
  - `test-ru@moldovadirect.com`
  - `admin@moldovadirect.com`

- **Passwords:**
  - User: `Test123!@#`
  - Admin: `Admin123!@#`

- **Database Changes:** Add trigger to prevent test account creation (see above)

## Resources

- OWASP Authentication Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
- Supabase Auth Admin: https://supabase.com/docs/guides/auth/auth-helpers/auth-ui
- Password Generator: https://www.npmjs.com/package/generate-password

## Acceptance Criteria

- [ ] Verified test accounts don't exist in production database
- [ ] Verified test accounts don't exist in staging database
- [ ] Database trigger added to prevent test account creation
- [ ] Hardcoded credentials removed from base.ts
- [ ] Environment variables configured in .env.example
- [ ] Test credentials stored in Vercel environment variables
- [ ] CI/CD updated with test credentials
- [ ] All tests still pass with new credentials
- [ ] Documentation updated with test account management process

## Work Log

### 2025-11-01 - Code Review Discovery
**By:** Claude Code Review System (security-sentinel agent)
**Actions:**
- Discovered during comprehensive e2e test infrastructure security audit
- Identified hardcoded credentials in test fixtures
- Found predictable email pattern and weak passwords
- Categorized as P0 critical security issue

**Learnings:**
- Test credentials should never be hardcoded in source control
- Even test accounts can be security risks if patterns exist in production
- Admin test accounts are especially dangerous
- .test TLD should be used for test accounts to prevent confusion

## Notes

**Database Query for Verification:**
```sql
-- Run in production Supabase SQL editor
SELECT
  id,
  email,
  created_at,
  last_sign_in_at,
  email_confirmed_at
FROM auth.users
WHERE email LIKE 'test-%@moldovadirect.com'
   OR email = 'admin@moldovadirect.com'
ORDER BY created_at DESC;
```

**Secure Password Generator:**
```typescript
// Add to tests/utils/
import { randomBytes } from 'crypto'

export function generateSecurePassword(length = 16): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  const randomValues = randomBytes(length)
  let password = ''

  for (let i = 0; i < length; i++) {
    password += chars[randomValues[i] % chars.length]
  }

  return password
}
```

**Team Communication:**
After fixing, send team message:
```
🔒 Security Update: Test Credentials Changed

We've removed hardcoded test credentials from source control.

Action Required:
1. Pull latest main branch
2. Add these to your .env file:
   TEST_USER_PASSWORD=<see 1Password>
   TEST_ADMIN_PASSWORD=<see 1Password>
3. Run `pnpm test` to verify

Questions? See docs/testing/authentication.md
```

Source: E2E test infrastructure security review performed on 2025-11-01
Review command: `/compounding-engineering:review e2e tests setup files`
