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
    const testPassword = 'TestPassword123!'

    await page.goto('/auth/register')

    // Wait for form to be visible
    await page.waitForSelector('input[type="email"]', { state: 'visible', timeout: TIMEOUTS.STANDARD })

    // Fill registration form - all required fields
    // Full Name field (first text input)
    const nameInput = page.locator('input[type="text"]').first()
    if (await nameInput.isVisible()) {
      await nameInput.fill('Test User')
    }

    // Email
    await page.locator('input[type="email"]').first().fill(testEmail)

    // Password (first password field)
    await page.locator('input[type="password"]').first().fill(testPassword)

    // Confirm Password (second password field, if exists)
    const passwordInputs = page.locator('input[type="password"]')
    if (await passwordInputs.count() > 1) {
      await passwordInputs.nth(1).fill(testPassword)
    }

    // Submit form - try multiple selectors for the register button
    const submitButton = page.locator(
      'button[type="submit"], button:has-text("Crear Cuenta"), button:has-text("Registrarse"), button:has-text("Register"), button:has-text("Sign up")'
    ).first()
    await submitButton.click()

    // Should redirect to account, verify email page, or show success
    await page.waitForURL(/\/(account|auth\/(login|verify-email))/, { timeout: TIMEOUTS.LONG })
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
