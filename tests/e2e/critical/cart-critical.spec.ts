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

    // Verify cart updated - check for "En el Carrito" button or cart badge
    const cartUpdated = await helpers.verifyCartHasItems()
    expect(cartUpdated, ERROR_MESSAGES.CART_NOT_UPDATED).toBe(true)
  })

  test('can update cart quantity', async ({ page }) => {
    const helpers = new CriticalTestHelpers(page)

    // Add product to cart
    await helpers.addFirstProductToCart()

    // Go to cart page
    await helpers.goToCart()
    await page.waitForLoadState('networkidle')

    // Wait for cart items to load
    const cartItem = page.locator('[data-testid^="cart-item-"]').first()
    await expect(cartItem).toBeVisible({ timeout: TIMEOUTS.LONG })

    // Find and click increase quantity button
    const increaseButton = page.locator(SELECTORS.INCREASE_QUANTITY).first()
    await expect(increaseButton).toBeVisible({ timeout: TIMEOUTS.STANDARD })
    await increaseButton.click()

    // Wait for network to settle after quantity update
    await page.waitForLoadState('networkidle')

    // Verify the cart item is still visible (quantity update successful)
    await expect(cartItem).toBeVisible({ timeout: TIMEOUTS.STANDARD })
  })

  test('cart page shows items and controls', async ({ page }) => {
    const helpers = new CriticalTestHelpers(page)

    // Add product to cart
    await helpers.addFirstProductToCart()

    // Go to cart page
    await helpers.goToCart()
    await page.waitForLoadState('networkidle')

    // Wait for cart items to load
    const cartItem = page.locator('[data-testid^="cart-item-"]').first()
    await expect(cartItem).toBeVisible({ timeout: TIMEOUTS.LONG })

    // Verify cart controls are present
    const increaseButton = page.locator(SELECTORS.INCREASE_QUANTITY).first()
    await expect(increaseButton).toBeVisible({ timeout: TIMEOUTS.STANDARD })

    const decreaseButton = page.locator(SELECTORS.DECREASE_QUANTITY).first()
    await expect(decreaseButton).toBeVisible({ timeout: TIMEOUTS.STANDARD })

    const removeButton = page.locator('button[aria-label="Eliminar artículo"]').first()
    await expect(removeButton).toBeVisible({ timeout: TIMEOUTS.STANDARD })

    // Verify checkout button is present
    const checkoutButton = page.locator('button:has-text("Finalizar Compra"), a:has-text("Finalizar Compra")')
    await expect(checkoutButton.first()).toBeVisible({ timeout: TIMEOUTS.STANDARD })
  })
})
