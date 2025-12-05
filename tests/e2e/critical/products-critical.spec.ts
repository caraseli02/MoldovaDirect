/**
 * Critical Product Tests
 *
 * Essential product browsing tests for deployment confidence.
 *
 * Run: pnpm run test:critical
 */

import { test, expect } from '@playwright/test'
import { SELECTORS, TIMEOUTS, URL_PATTERNS, ERROR_MESSAGES, TEST_DATA } from './constants'

test.describe('Critical Product Flows', () => {
  test('products page loads with product list', async ({ page }) => {
    await page.goto('/products')

    // Wait for page to load
    await page.waitForLoadState('networkidle')

    // Check at least one product is visible
    const productCards = page.locator(SELECTORS.PRODUCT_CARD)
    await expect(productCards.first(), ERROR_MESSAGES.PRODUCT_NOT_FOUND).toBeVisible({
      timeout: TIMEOUTS.LONG
    })

    // Check we have multiple products
    const count = await productCards.count()
    expect(count, 'Products page should display at least one product').toBeGreaterThanOrEqual(
      TEST_DATA.MIN_PRODUCTS
    )
  })

  test('can view product detail page', async ({ page }) => {
    await page.goto('/products')

    // Wait for products to load
    await page.waitForSelector(SELECTORS.PRODUCT_CARD, {
      state: 'visible',
      timeout: TIMEOUTS.LONG
    })

    // Click first product
    await page.locator(SELECTORS.PRODUCT_CARD).first().click()

    // Should navigate to product detail
    await expect(page).toHaveURL(URL_PATTERNS.PRODUCT_DETAIL, { timeout: TIMEOUTS.STANDARD })

    // Product details should be visible (title or product-title testid)
    const productTitle = page.locator('h1, [data-testid="product-title"]')
    await expect(productTitle).toBeVisible({ timeout: TIMEOUTS.STANDARD })
  })
})
