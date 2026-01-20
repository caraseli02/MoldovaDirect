import { test, expect } from '@playwright/test'

/**
 * Products Page Breadcrumb Localization Tests
 *
 * Validates breadcrumb localization across different languages.
 * Tests the i18n implementation for the Products page breadcrumb navigation.
 */

const SELECTORS = {
  BREADCRUMB_LINK: 'nav[aria-label="Breadcrumb"] a[href="/products"]',
}

test.describe('Products Page Breadcrumb Localization', () => {
  test('should display "Tienda" in Spanish (default locale)', async ({ page }) => {
    await page.goto('/products')
    await expect(page.locator(SELECTORS.BREADCRUMB_LINK)).toHaveText('Tienda', { timeout: 5000 })
  })

  test.describe('English Locale', () => {
    test.use({
      locale: 'en-US',
      storageState: 'tests/fixtures/.auth/user-en.json',
    })

    test('should display "Shop" in English', async ({ page }) => {
      // Navigate to English version using i18n prefix strategy
      // The app uses 'prefix_except_default' strategy with default locale 'es'
      // So English URLs are prefixed with /en
      await page.goto('/en/products')
      await expect(page.locator(SELECTORS.BREADCRUMB_LINK)).toHaveText('Shop', { timeout: 10000 })
    })
  })
})
