/**
 * Critical Auth Tests
 *
 * Essential authentication tests that must pass before deployment.
 * These cover the core auth flows without all the edge cases.
 *
 * Run: pnpm run test:critical
 */

import { test, expect } from '@playwright/test'

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
    await page.waitForURL(/\/(account|auth\/login)/, { timeout: 10000 })
  })

  test('user can login with valid credentials', async ({ page }) => {
    await page.goto('/auth/login')

    const testEmail = process.env.TEST_USER_EMAIL || 'teste2e@example.com'
    const testPassword = process.env.TEST_USER_PASSWORD

    if (!testPassword) {
      test.skip()
    }

    // Fill login form
    await page.locator('input[type="email"]').first().fill(testEmail)
    await page.locator('input[type="password"]').first().fill(testPassword)

    // Submit
    await page.locator('button[type="submit"]').click()

    // Should redirect to account
    await page.waitForURL(/\/account/, { timeout: 10000 })
  })

  test('logged in user can logout', async ({ page }) => {
    const testEmail = process.env.TEST_USER_EMAIL || 'teste2e@example.com'
    const testPassword = process.env.TEST_USER_PASSWORD

    if (!testPassword) {
      test.skip()
    }

    // Login first
    await page.goto('/auth/login')
    await page.locator('input[type="email"]').first().fill(testEmail)
    await page.locator('input[type="password"]').first().fill(testPassword)
    await page.locator('button[type="submit"]').click()
    await page.waitForURL(/\/account/, { timeout: 10000 })

    // Logout
    await page.locator('button:has-text("Cerrar sesión"), button:has-text("Logout"), a:has-text("Cerrar sesión")').first().click()

    // Should redirect to home or login
    await page.waitForURL(/\/(|auth\/login)$/, { timeout: 10000 })
  })
})
