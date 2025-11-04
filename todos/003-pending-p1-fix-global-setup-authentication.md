---
status: completed
priority: p1
issue_id: "003"
tags: [test-infrastructure, authentication, playwright, code-review]
dependencies: ["002"]
github_issue: 60
completed_date: 2025-11-03
---

# Fix Global Setup - No Actual Authentication Happening

## Problem Statement

The global setup creates storage state files for authenticated tests, but **doesn't actually authenticate users**. It just visits the homepage and saves an empty storage state.

**Location:** `/Users/vladislavcaraseli/Documents/MoldovaDirect/tests/global-setup.ts:29-33`

```typescript
try {
  await page.goto('/')  // ❌ Just visits homepage

  const storageFile = path.join(authDir, `user-${locale}.json`)
  await context.storageState({ path: storageFile })  // Saves empty state

  console.log(`✓ Created storage state for locale: ${locale}`)
```

## Impact

- All tests configured with `storageState` are using **empty auth states**
- The `authenticatedPage` fixture in base.ts tries to use these files but they don't contain credentials
- Tests that expect to be authenticated will fail
- Global setup gives false confidence that auth is working
- Wastes test execution time creating useless files

## Findings

**Discovered by:** kieran-typescript-reviewer and architecture-strategist agents
**Review date:** 2025-11-01

**Related Issues:**
- Fixture `authenticatedPage` ignores storage state and logs in every time (defeats purpose)
- Playwright config line 37 references storage state for Chromium but Firefox/WebKit don't have it
- Global teardown deletes these files even though they're not actually used

## Proposed Solutions

### Option 1: Implement Actual Login in Global Setup (RECOMMENDED)

```typescript
async function globalSetup(config: FullConfig): Promise<void> {
  const baseURL = config.projects[0]?.use?.baseURL
  if (!baseURL) {
    throw new Error('baseURL not configured in playwright.config.ts')
  }

  // Verify server is accessible
  const browser = await chromium.launch()

  for (const locale of LOCALES) {
    const context = await browser.newContext({
      baseURL,
      locale,
      timezoneId: 'Europe/Madrid',
    })
    const page = await context.newPage()

    try {
      // ACTUALLY LOGIN
      const testEmail = process.env.TEST_USER_EMAIL || `test-${locale}@example.test`
      const testPassword = process.env.TEST_USER_PASSWORD || 'DefaultTestPassword123!'

      await page.goto('/login')
      await page.fill('[data-testid="email-input"]', testEmail)
      await page.fill('[data-testid="password-input"]', testPassword)
      await page.click('[data-testid="login-button"]')

      // Wait for successful login
      await page.waitForURL(/\/(account|dashboard|home)/, { timeout: 10000 })

      // Verify we're actually logged in
      const userMenu = page.locator('[data-testid="user-menu"]')
      await expect(userMenu).toBeVisible({ timeout: 5000 })

      // Save authenticated state
      const storageFile = path.join(authDir, `user-${locale}.json`)
      await context.storageState({ path: storageFile })

      console.log(`✓ Authenticated and saved storage state for locale: ${locale}`)

    } catch (error) {
      await context.close()
      await browser.close()
      throw new Error(`Setup failed for ${locale}: ${error}`)
    } finally {
      await context.close()
    }
  }

  await browser.close()
  console.log('Global setup completed successfully')
}
```

**Pros:**
- Actually creates authenticated storage states
- Tests can reuse auth state (faster)
- Proper use of Playwright's storage state feature
- Fail-fast if auth is broken

**Cons:**
- Requires test users to exist before setup runs
- More complex setup

**Effort:** Medium (2-3 hours)
**Risk:** Low

### Option 2: Delete Global Setup and Use Fixtures Only

If global setup is too complex, just delete it and let each test handle auth:

```typescript
// Remove global-setup.ts entirely
// Update playwright.config.ts to remove globalSetup/globalTeardown
// Update fixtures to handle auth as needed
```

**Pros:**
- Simpler
- Each test is independent
- No shared state issues

**Cons:**
- Slower tests (login for each test)
- More code duplication

**Effort:** Small (1 hour)
**Risk:** Very Low

### Option 3: Create Test Users in Global Setup

Have global setup both create users AND authenticate:

```typescript
async function globalSetup(config: FullConfig): Promise<void> {
  const browser = await chromium.launch()

  for (const locale of LOCALES) {
    // 1. Create test user via API or Supabase Admin
    const testUser = await createTestUser({
      email: `test-${locale}@example.test`,
      password: process.env.TEST_USER_PASSWORD,
      locale,
    })

    // 2. Login as that user
    const context = await browser.newContext({ baseURL, locale })
    const page = await context.newPage()
    await page.goto('/login')
    // ... login logic ...

    // 3. Save storage state
    await context.storageState({ path: storageFile })
  }
}
```

**Pros:**
- Self-contained setup
- No manual user creation needed
- Tests always have fresh users

**Cons:**
- Most complex option
- Requires API for user creation
- Need cleanup in teardown

**Effort:** Large (6-8 hours)
**Risk:** Medium

## Recommended Action

**THIS WEEK:**

1. **Implement Option 1** (Actual login in global setup)

2. **Prerequisites:**
   - Resolve todo #002 (credentials in env vars)
   - Manually create test users in development database:
     ```sql
     -- In Supabase SQL editor (development only)
     -- Use auth.users or your signup API
     ```

3. **Update global-setup.ts** with actual login logic

4. **Verify storage state files contain tokens:**
   ```bash
   # After running setup
   cat tests/fixtures/.auth/user-es.json
   # Should see: cookies, localStorage with auth tokens
   ```

5. **Update authenticatedPage fixture** to USE the storage state instead of logging in again:
   ```typescript
   authenticatedPage: async ({ page }, use) => {
     // Storage state already applied from config
     // Just verify we're authenticated
     await page.goto('/')
     const userMenu = page.locator('[data-testid="user-menu"]')
     await expect(userMenu).toBeVisible()

     await use(page)
   }
   ```

6. **Add storage state to Firefox/WebKit projects** in playwright.config.ts:
   ```typescript
   {
     name: `firefox-${locale}`,
     use: {
       ...devices['Desktop Firefox'],
       locale,
       storageState: `tests/fixtures/.auth/user-${locale}.json`,  // ADD THIS
     },
   }
   ```

## Technical Details

- **Affected Files:**
  - `tests/global-setup.ts` (lines 29-33: needs login logic)
  - `tests/fixtures/base.ts` (lines 87-98: should use storage state)
  - `playwright.config.ts` (lines 41-55: add storageState to Firefox/WebKit)

- **Storage State File Format:**
  ```json
  {
    "cookies": [...],
    "origins": [
      {
        "origin": "http://localhost:3000",
        "localStorage": [
          {
            "name": "supabase.auth.token",
            "value": "..."
          }
        ]
      }
    ]
  }
  ```

- **Test Impact:**
  - All tests using chromium-* projects will benefit
  - Need to add storageState to other browser projects

## Resources

- Playwright Authentication Guide: https://playwright.dev/docs/auth
- Playwright Storage State: https://playwright.dev/docs/api/class-browsercontext#browser-context-storage-state
- Supabase Auth: https://supabase.com/docs/guides/auth

## Acceptance Criteria

- [ ] Global setup actually logs in for each locale
- [ ] Storage state files contain valid auth tokens
- [ ] Verified tokens work by inspecting file contents
- [ ] All browser projects (chromium, firefox, webkit) have storageState configured
- [ ] `authenticatedPage` fixture uses storage state instead of logging in
- [ ] Tests that need auth actually work
- [ ] Login only happens once per locale in global setup, not per test
- [ ] Setup fails fast if login fails for any locale
- [ ] Documentation updated with auth setup process

## Work Log

### 2025-11-01 - Code Review Discovery
**By:** Claude Code Review System (kieran-typescript-reviewer, architecture-strategist)
**Actions:**
- Discovered during comprehensive e2e test infrastructure review
- Identified that global setup only visits homepage
- Found that storage state files are empty
- Noted that authenticatedPage fixture doesn't use storage state
- Categorized as P1 high priority issue

**Learnings:**
- Global setup should actually authenticate, not just visit pages
- Storage state is powerful but requires proper setup
- Fail-fast in global setup prevents confusing test failures
- Storage state should be used consistently across all browser projects

## Notes

**Testing the Fix:**

After implementing, verify storage state works:

```typescript
// tests/e2e/verify-auth.spec.ts
import { test, expect } from '@playwright/test'

test('storage state contains auth', async ({ page }) => {
  // If storage state is configured, we should already be logged in
  await page.goto('/')

  const userMenu = page.locator('[data-testid="user-menu"]')
  await expect(userMenu).toBeVisible()

  // Should NOT see login button
  const loginButton = page.locator('[data-testid="login-button"]')
  await expect(loginButton).not.toBeVisible()
})
```

**Common Issues:**

1. **Storage state file not found**
   - Run global setup: `npx playwright test --global-setup-only`
   - Check file exists: `ls tests/fixtures/.auth/`

2. **Auth tokens expired**
   - Storage state might be old
   - Delete files and re-run global setup
   - Consider adding expiration check in global setup

3. **Different baseURL**
   - Storage state is tied to origin
   - localhost:3000 state won't work with localhost:3001
   - Re-run setup if baseURL changes

Source: E2E test infrastructure review performed on 2025-11-01
Review command: `/compounding-engineering:review e2e tests setup files`
