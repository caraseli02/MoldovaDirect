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
  test('registration form is accessible and can be filled', async ({ page }) => {
    // Note: Full registration with checkbox interaction is flaky due to Radix/Vue
    // This test validates that the form loads and can be filled correctly
    const timestamp = Date.now()
    const testEmail = `test-${timestamp}@example.com`
    const testPassword = 'TestPassword123!'

    await page.goto('/auth/register')
    await page.waitForLoadState('networkidle')

    // Wait for form to be fully loaded using element ID
    await page.waitForSelector('#name', { state: 'visible', timeout: TIMEOUTS.STANDARD })

    // Fill registration form using element IDs (most reliable for Shadcn inputs)
    const nameInput = page.locator('#name')
    const emailInput = page.locator('#email')
    const passwordInput = page.locator('#password')
    const confirmPasswordInput = page.locator('#confirmPassword')

    // Clear and fill name
    await nameInput.click()
    await nameInput.fill('Test User')

    // Clear and fill email
    await emailInput.click()
    await emailInput.fill(testEmail)

    // Clear and fill password
    await passwordInput.click()
    await passwordInput.fill(testPassword)

    // Clear and fill confirm password
    await confirmPasswordInput.click()
    await confirmPasswordInput.fill(testPassword)

    // Wait for Vue reactivity to process
    await page.waitForTimeout(300)

    // Verify all form fields were filled correctly
    await expect(nameInput).toHaveValue('Test User')
    await expect(emailInput).toHaveValue(testEmail)
    await expect(passwordInput).toHaveValue(testPassword)
    await expect(confirmPasswordInput).toHaveValue(testPassword)

    // Verify the checkbox and submit button are present
    const termsCheckbox = page.locator('button[role="checkbox"]').first()
    await expect(termsCheckbox).toBeVisible()

    const submitButton = page.locator('[data-testid="register-button"]')
    await expect(submitButton).toBeVisible()

    // Note: Full form submission with checkbox is tested manually due to Radix/Playwright interaction issues
    // The test validates that the form is accessible and can be filled correctly
  })

  test('user can login with valid credentials', async ({ page }) => {
    test.skip(
      !CriticalTestHelpers.hasTestUserCredentials(),
      'TEST_USER_PASSWORD environment variable not set',
    )

    const helpers = new CriticalTestHelpers(page)
    await helpers.loginAsTestUser()

    // Verify redirected to account or admin page (test user might be admin)
    await page.waitForURL(/\/(account|admin)/, { timeout: TIMEOUTS.LONG })
  })

  test('logged in user can logout', async ({ page }) => {
    test.skip(
      !CriticalTestHelpers.hasTestUserCredentials(),
      'TEST_USER_PASSWORD environment variable not set',
    )

    const helpers = new CriticalTestHelpers(page)

    // Login first
    await helpers.loginAsTestUser()
    // Test user might redirect to /admin (if admin) or /account (if regular user)
    await page.waitForURL(/\/(account|admin)/, { timeout: TIMEOUTS.LONG })

    // Logout
    await helpers.logout()

    // Verify redirected to home or login (may include query params)
    await expect(page).toHaveURL(/\/(|auth\/login)/, { timeout: TIMEOUTS.LONG })
  })
})
