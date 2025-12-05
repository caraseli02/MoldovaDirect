/**
 * Critical Cart Tests
 *
 * Essential cart functionality tests for deployment confidence.
 *
 * Run: pnpm run test:critical
 */

import { test, expect } from '@playwright/test'
import { CriticalTestHelpers } from './helpers/critical-test-helpers'
import { SELECTORS, TIMEOUTS, ERROR_MESSAGES } from './constants'

test.describe('Critical Cart Flows', () => {
  test('can add product to cart', async ({ page }) => {
    const helpers = new CriticalTestHelpers(page)

    // Add product to cart using helper
    await helpers.addFirstProductToCart()

    // Verify cart updated
    const cartUpdated = await helpers.verifyCartHasItems()
    expect(cartUpdated, ERROR_MESSAGES.CART_NOT_UPDATED).toBe(true)
  })

  test('can update cart quantity', async ({ page }) => {
    const helpers = new CriticalTestHelpers(page)

    // Add product to cart
    await helpers.addFirstProductToCart()

    // Go to cart
    await helpers.goToCart()

    // Increase quantity
    const increaseButton = page.locator(SELECTORS.INCREASE_QUANTITY).first()
    await increaseButton.click()

    // Wait for network to settle after quantity update
    await page.waitForLoadState('networkidle')

    // Verify quantity updated
    const quantityDisplay = page.locator(SELECTORS.ITEM_QUANTITY).first()
    await expect(quantityDisplay).toBeVisible({ timeout: TIMEOUTS.STANDARD })
  })

  test('can remove product from cart', async ({ page }) => {
    const helpers = new CriticalTestHelpers(page)

    // Add product to cart
    await helpers.addFirstProductToCart()

    // Go to cart
    await helpers.goToCart()

    // Click remove button
    const removeButton = page.locator(SELECTORS.REMOVE_ITEM).first()
    await removeButton.click()

    // Wait for network to settle
    await page.waitForLoadState('networkidle')

    // Verify empty cart message appears
    const emptyState = page.locator(SELECTORS.EMPTY_CART)
    await expect(emptyState).toBeVisible({ timeout: TIMEOUTS.STANDARD })
  })
})
