/**
 * Pre-Commit Smoke Tests
 *
 * Ultra-fast smoke tests that run on every commit (< 30 seconds).
 * These catch obvious breakage before code is committed.
 *
 * Strategy:
 * - Test only the most critical user paths
 * - Use minimal assertions
 * - No authentication required (faster)
 * - Focus on "does it load?" not "does it work perfectly?"
 *
 * Run: pnpm run test:pre-commit
 */

import { test, expect } from '@playwright/test'

test.describe('Smoke Tests - Critical Paths', () => {
  test('homepage loads without errors', async ({ page }) => {
    await page.goto('/')

    // Check page loaded
    await expect(page).toHaveTitle(/Moldova Direct/i)

    // Check no console errors (critical failures only)
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    await page.waitForLoadState('networkidle')

    // Allow non-critical errors but fail on critical ones
    const criticalErrors = errors.filter(err =>
      err.includes('Uncaught') ||
      err.includes('TypeError') ||
      err.includes('ReferenceError')
    )
    expect(criticalErrors).toHaveLength(0)
  })

  test('can navigate to products page', async ({ page }) => {
    await page.goto('/products')

    // Wait for products to load
    await page.waitForLoadState('networkidle')

    // Check at least one product card exists
    const productCards = page.locator('[data-testid="product-card"]')
    await expect(productCards.first()).toBeVisible({ timeout: 10000 })
  })

  test('can add product to cart', async ({ page }) => {
    await page.goto('/products')

    // Wait for products to load
    await page.waitForSelector('button:has-text("Añadir al Carrito")', {
      state: 'visible',
      timeout: 10000
    })

    // Click first "Add to Cart" button
    await page.locator('button:has-text("Añadir al Carrito")').first().click()

    // Verify cart count updated (check multiple possible selectors)
    const cartIndicators = [
      '[data-testid="cart-count"]',
      '[data-testid="cart-badge"]',
      '.cart-count',
      '[aria-label*="cart"] [aria-label*="item"]'
    ]

    let cartUpdated = false
    for (const selector of cartIndicators) {
      const element = page.locator(selector)
      if (await element.count() > 0) {
        const text = await element.textContent()
        if (text && parseInt(text) > 0) {
          cartUpdated = true
          break
        }
      }
    }

    expect(cartUpdated).toBe(true)
  })
})
