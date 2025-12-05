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
import { CriticalTestHelpers } from '../e2e/critical/helpers/critical-test-helpers'
import { SELECTORS, TIMEOUTS, ERROR_MESSAGES } from '../e2e/critical/constants'

test.describe('Smoke Tests - Critical Paths', () => {
  test('homepage loads without errors', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })

    // Check page loaded with title
    await expect(page).toHaveTitle(/Moldova Direct/i, { timeout: TIMEOUTS.LONG })
  })

  test('can navigate to products page', async ({ page }) => {
    await page.goto('/products', { waitUntil: 'domcontentloaded' })

    // Check at least one product card exists
    const productCards = page.locator(SELECTORS.PRODUCT_CARD)
    await expect(productCards.first(), ERROR_MESSAGES.PRODUCT_NOT_FOUND).toBeVisible({
      timeout: TIMEOUTS.LONG
    })
  })

  test('can add product to cart', async ({ page }) => {
    const helpers = new CriticalTestHelpers(page)

    // Add product to cart
    await helpers.addFirstProductToCart()

    // Verify cart updated
    const cartUpdated = await helpers.verifyCartHasItems()
    expect(cartUpdated, ERROR_MESSAGES.CART_NOT_UPDATED).toBe(true)
  })
})
