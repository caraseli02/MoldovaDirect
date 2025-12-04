/**
 * Critical Product Tests
 *
 * Essential product browsing tests for deployment confidence.
 *
 * Run: pnpm run test:critical
 */

import { test, expect } from '@playwright/test'

test.describe('Critical Product Flows', () => {
  test('products page loads with product list', async ({ page }) => {
    await page.goto('/products')

    // Wait for products to load
    await page.waitForLoadState('networkidle')

    // Check at least one product is visible
    const productCards = page.locator('[data-testid="product-card"]')
    await expect(productCards.first()).toBeVisible({ timeout: 10000 })

    // Check we have multiple products
    const count = await productCards.count()
    expect(count).toBeGreaterThan(0)
  })

  test('can view product detail page', async ({ page }) => {
    await page.goto('/products')

    // Wait for products
    await page.waitForSelector('[data-testid="product-card"]', {
      state: 'visible',
      timeout: 10000
    })

    // Click first product
    await page.locator('[data-testid="product-card"]').first().click()

    // Should navigate to product detail
    await expect(page).toHaveURL(/\/products\/[^/]+/, { timeout: 5000 })

    // Product details should be visible
    await expect(page.locator('h1, [data-testid="product-title"]')).toBeVisible()
  })
})
