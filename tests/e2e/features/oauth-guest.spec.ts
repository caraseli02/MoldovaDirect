import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:3000'

// Test without using the global setup authentication
test.describe('OAuth Login (Guest)', () => {
  // Use a fresh context without auth state
  test.use({ storageState: { cookies: [], origins: [] } })

  test('should display OAuth buttons and preserve redirect parameter', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/login?redirect=/cart`)
    await page.waitForLoadState('networkidle')

    // Take screenshot
    await page.screenshot({
      path: 'tests/e2e/features/screenshots/oauth-login-guest.png',
      fullPage: true,
    })

    // Check URL contains redirect parameter
    const url = page.url()
    expect(url).toContain('redirect')

    // Check Google button
    const googleButton = page.locator('button').filter({ hasText: /google/i })
    await expect(googleButton).toBeVisible()

    // Check Apple button
    const appleButton = page.locator('button').filter({ hasText: /apple/i })
    await expect(appleButton).toBeVisible()

    // Verify buttons are clickable (not disabled)
    await expect(googleButton).toBeEnabled()
    await expect(appleButton).toBeEnabled()
  })
})
