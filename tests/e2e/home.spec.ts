import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test('should load the home page successfully', async ({ page }) => {
    await page.goto('/')

    // Wait for the page to be loaded
    await page.waitForLoadState('networkidle')

    // Check that the page title or main content is present
    await expect(page).toHaveTitle(/Moldova Direct/i)
  })

  test('should display the main navigation', async ({ page, isMobile }) => {
    await page.goto('/')

    if (isMobile) {
      // On mobile, check that the header is present with logo and menu button
      const header = page.locator('header')
      await expect(header).toBeVisible()

      // Verify the logo link is visible in the header
      const logo = page.getByRole('link', { name: 'Moldova Direct' })
      await expect(logo).toBeVisible()
    } else {
      // On desktop, the main navigation should be visible
      const nav = page.locator('nav')
      await expect(nav.first()).toBeVisible()
    }
  })
})
