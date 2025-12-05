/**
 * Critical Checkout Tests
 *
 * Essential checkout flow tests for deployment confidence.
 *
 * Run: pnpm run test:critical
 */

import { test, expect } from '@playwright/test'
import { CriticalTestHelpers } from './helpers/critical-test-helpers'
import { SELECTORS, TIMEOUTS, URL_PATTERNS, ERROR_MESSAGES } from './constants'

test.describe('Critical Checkout Flows', () => {
  test('guest can access checkout page with items in cart', async ({ page }) => {
    const helpers = new CriticalTestHelpers(page)

    // Add product to cart
    await helpers.addFirstProductToCart()

    // Go to checkout
    await helpers.goToCheckout()

    // Verify on checkout page
    await expect(page, ERROR_MESSAGES.CHECKOUT_NOT_ACCESSIBLE).toHaveURL(
      URL_PATTERNS.CHECKOUT,
      { timeout: TIMEOUTS.STANDARD }
    )

    // Checkout form should be visible
    const checkoutForm = page.locator(SELECTORS.CHECKOUT_FORM)
    await expect(checkoutForm).toBeVisible({ timeout: TIMEOUTS.STANDARD })
  })

  test('authenticated user can access checkout', async ({ page }) => {
    test.skip(
      !CriticalTestHelpers.hasTestUserCredentials(),
      'TEST_USER_PASSWORD environment variable not set'
    )

    const helpers = new CriticalTestHelpers(page)

    // Login
    await helpers.loginAsTestUser()
    await expect(page).toHaveURL(URL_PATTERNS.ACCOUNT, { timeout: TIMEOUTS.LONG })

    // Add product to cart
    await helpers.addFirstProductToCart()

    // Go to checkout
    await helpers.goToCheckout()

    // Verify on checkout page
    await expect(page, ERROR_MESSAGES.CHECKOUT_NOT_ACCESSIBLE).toHaveURL(
      URL_PATTERNS.CHECKOUT,
      { timeout: TIMEOUTS.STANDARD }
    )

    // Checkout form should be visible
    const checkoutForm = page.locator(SELECTORS.CHECKOUT_FORM)
    await expect(checkoutForm).toBeVisible({ timeout: TIMEOUTS.STANDARD })
  })
})
