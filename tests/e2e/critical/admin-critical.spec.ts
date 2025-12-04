/**
 * Critical Admin Tests
 *
 * Essential admin panel tests for deployment confidence.
 *
 * Run: pnpm run test:critical
 */

import { test, expect } from '@playwright/test'

test.describe('Critical Admin Flows', () => {
  test('admin can access admin dashboard', async ({ page }) => {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.TEST_USER_EMAIL || 'admin@example.com'
    const adminPassword = process.env.ADMIN_PASSWORD || process.env.TEST_USER_PASSWORD

    if (!adminPassword) {
      test.skip()
    }

    // Login as admin
    await page.goto('/auth/login')
    await page.locator('input[type="email"]').first().fill(adminEmail)
    await page.locator('input[type="password"]').first().fill(adminPassword)
    await page.locator('button[type="submit"]').click()
    await page.waitForLoadState('networkidle')

    // Navigate to admin
    await page.goto('/admin')

    // Should see admin dashboard (not redirected)
    await expect(page).toHaveURL(/\/admin/, { timeout: 5000 })

    // Dashboard content should be visible
    const dashboard = page.locator('[data-testid="admin-dashboard"], h1:has-text("Panel"), h1:has-text("Dashboard")')
    await expect(dashboard.first()).toBeVisible({ timeout: 5000 })
  })

  test('admin dashboard loads without errors', async ({ page }) => {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.TEST_USER_EMAIL || 'admin@example.com'
    const adminPassword = process.env.ADMIN_PASSWORD || process.env.TEST_USER_PASSWORD

    if (!adminPassword) {
      test.skip()
    }

    // Track console errors
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    // Login and go to admin
    await page.goto('/auth/login')
    await page.locator('input[type="email"]').first().fill(adminEmail)
    await page.locator('input[type="password"]').first().fill(adminPassword)
    await page.locator('button[type="submit"]').click()
    await page.waitForLoadState('networkidle')

    await page.goto('/admin')
    await page.waitForLoadState('networkidle')

    // Check no critical errors
    const criticalErrors = errors.filter(err =>
      err.includes('Uncaught') ||
      err.includes('TypeError') ||
      err.includes('ReferenceError') ||
      err.includes('500')
    )

    expect(criticalErrors).toHaveLength(0)
  })
})
