/**
 * Critical Auth Tests
 *
 * Essential authentication tests that must pass before deployment.
 * These cover the core auth flows without all the edge cases.
 *
 * Run: pnpm run test:critical
 */

import { test, expect } from '@playwright/test'
import { CriticalTestHelpers } from './helpers/critical-test-helpers'
import { TIMEOUTS, URL_PATTERNS } from './constants'

test.describe('Critical Auth Flows', () => {
  test('user can register new account', async ({ page }) => {
    const timestamp = Date.now()
    const testEmail = `test-${timestamp}@example.com`

    await page.goto('/auth/register')

    // Fill registration form
    await page.locator('input[type="email"]').first().fill(testEmail)
    await page.locator('input[type="password"]').first().fill('TestPassword123!')

    // Submit form
    await page.locator('button[type="submit"]').click()

    // Should redirect to account or show success
    await page.waitForURL(/\/(account|auth\/login)/, { timeout: TIMEOUTS.LONG })
  })

  test('user can login with valid credentials', async ({ page }) => {
    test.skip(
      !CriticalTestHelpers.hasTestUserCredentials(),
      'TEST_USER_PASSWORD environment variable not set'
    )

    const helpers = new CriticalTestHelpers(page)
    await helpers.loginAsTestUser()

    // Verify redirected to account page
    await expect(page).toHaveURL(URL_PATTERNS.ACCOUNT, { timeout: TIMEOUTS.LONG })
  })

  test('logged in user can logout', async ({ page }) => {
    test.skip(
      !CriticalTestHelpers.hasTestUserCredentials(),
      'TEST_USER_PASSWORD environment variable not set'
    )

    const helpers = new CriticalTestHelpers(page)

    // Login first
    await helpers.loginAsTestUser()
    await expect(page).toHaveURL(URL_PATTERNS.ACCOUNT, { timeout: TIMEOUTS.LONG })

    // Logout
    await helpers.logout()

    // Verify redirected to home or login
    await expect(page).toHaveURL(/\/(|auth\/login)$/, { timeout: TIMEOUTS.LONG })
  })
})
