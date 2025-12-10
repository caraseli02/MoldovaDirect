/**
 * Critical Admin Tests
 *
 * Essential admin panel tests for deployment confidence.
 *
 * Run: pnpm run test:critical
 */

import { test, expect } from '@playwright/test'
import { CriticalTestHelpers } from './helpers/critical-test-helpers'
import { SELECTORS, TIMEOUTS, URL_PATTERNS, ERROR_MESSAGES } from './constants'

test.describe('Critical Admin Flows', () => {
  test('admin can access admin dashboard', async ({ page }) => {
    test.skip(
      !CriticalTestHelpers.hasAdminCredentials(),
      'ADMIN_PASSWORD or TEST_USER_PASSWORD environment variable not set',
    )

    const helpers = new CriticalTestHelpers(page)

    // Login as admin
    await helpers.loginAsAdmin()

    // Navigate to admin
    await page.goto('/admin')

    // Verify on admin page
    await expect(page, ERROR_MESSAGES.ADMIN_NOT_ACCESSIBLE).toHaveURL(
      URL_PATTERNS.ADMIN,
      { timeout: TIMEOUTS.STANDARD },
    )

    // Dashboard content should be visible
    const dashboard = page.locator(SELECTORS.ADMIN_DASHBOARD)
    await expect(dashboard.first()).toBeVisible({ timeout: TIMEOUTS.STANDARD })
  })

  test('admin dashboard loads without critical errors', async ({ page }) => {
    test.skip(
      !CriticalTestHelpers.hasAdminCredentials(),
      'ADMIN_PASSWORD or TEST_USER_PASSWORD environment variable not set',
    )

    const helpers = new CriticalTestHelpers(page)

    // Track critical console errors
    const criticalErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text()
        // Only track truly critical errors
        if (text.includes('Uncaught') || text.includes('TypeError') || text.includes('ReferenceError') || text.includes('500')) {
          criticalErrors.push(text)
        }
      }
    })

    // Login and go to admin
    await helpers.loginAsAdmin()
    await page.goto('/admin')
    await page.waitForLoadState('networkidle')

    // Verify no critical errors occurred
    expect(criticalErrors, 'Admin dashboard should load without critical console errors').toHaveLength(0)
  })
})
