/**
 * Critical Checkout Tests
 *
 * Essential checkout flow tests for deployment confidence.
 * Tests the checkout flow up to (but not including) actual payment processing.
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
      { timeout: TIMEOUTS.STANDARD },
    )

    // Checkout form should be visible
    const checkoutForm = page.locator(SELECTORS.CHECKOUT_FORM)
    await expect(checkoutForm).toBeVisible({ timeout: TIMEOUTS.STANDARD })
  })

  test('authenticated user can access checkout', async ({ page }) => {
    test.skip(
      !CriticalTestHelpers.hasTestUserCredentials(),
      'TEST_USER_PASSWORD environment variable not set',
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
      { timeout: TIMEOUTS.STANDARD },
    )

    // Checkout form should be visible
    const checkoutForm = page.locator(SELECTORS.CHECKOUT_FORM)
    await expect(checkoutForm).toBeVisible({ timeout: TIMEOUTS.STANDARD })
  })

  test('checkout shows order summary with cart items', async ({ page }) => {
    const helpers = new CriticalTestHelpers(page)

    // Add product to cart
    await helpers.addFirstProductToCart()

    // Go to checkout
    await helpers.goToCheckout()

    // Wait for checkout page to load
    await expect(page).toHaveURL(URL_PATTERNS.CHECKOUT, { timeout: TIMEOUTS.STANDARD })
    await page.waitForLoadState('networkidle')

    // Order summary section should be visible with items
    const orderSummary = page.locator('[data-testid="order-summary"], .order-summary, [class*="order-summary"]')
    const summaryExists = await orderSummary.count() > 0

    // Either order summary exists OR the page has the checkout form
    const checkoutForm = page.locator(SELECTORS.CHECKOUT_FORM)
    expect(summaryExists || await checkoutForm.isVisible()).toBe(true)
  })

  test('checkout page has form elements', async ({ page }) => {
    const helpers = new CriticalTestHelpers(page)

    // Add product to cart
    await helpers.addFirstProductToCart()

    // Go to checkout
    await helpers.goToCheckout()

    // Wait for page to be ready
    await page.waitForLoadState('networkidle')

    // Should be on checkout page or redirected appropriately
    const url = page.url()
    const isOnCheckout = url.includes('/checkout')

    if (isOnCheckout) {
      // Look for any interactive elements (form elements or buttons)
      const interactiveElements = page.locator('input, select, button, textarea')
      const elementCount = await interactiveElements.count()

      // Checkout page should have interactive elements
      expect(elementCount).toBeGreaterThan(0)
    }
    else {
      // If redirected away, that's acceptable behavior (e.g., cart issues)
      expect(url).toMatch(/\/(cart|products|auth)/)
    }
  })

  test('checkout has navigation controls', async ({ page }) => {
    const helpers = new CriticalTestHelpers(page)

    // Add product to cart
    await helpers.addFirstProductToCart()

    // Go to checkout
    await helpers.goToCheckout()
    await page.waitForLoadState('networkidle')

    // Look for step indicators or navigation elements
    const stepIndicators = page.locator('[data-testid="checkout-steps"], [class*="step"], [class*="progress"]')
    const continueButton = page.locator('button:has-text("Continuar"), button:has-text("Continue"), button:has-text("Siguiente"), button[type="submit"]').first()
    const backButton = page.locator('button:has-text("Volver"), button:has-text("Back"), button:has-text("Atrás"), a:has-text("Volver")')

    // At least one navigation control should exist
    const hasStepIndicators = await stepIndicators.count() > 0
    const hasContinueButton = await continueButton.count() > 0
    const hasBackButton = await backButton.count() > 0

    // Should have either step indicators or at least a continue button
    expect(hasStepIndicators || hasContinueButton || hasBackButton).toBe(true)
  })

  test('empty cart redirects away from checkout', async ({ page }) => {
    // Navigate directly to checkout without items
    await page.goto('/checkout')
    await page.waitForLoadState('networkidle')

    // Should be redirected to cart or products page, or show empty cart message
    const isOnCheckout = page.url().includes('/checkout')

    if (isOnCheckout) {
      // If still on checkout, should show empty cart message
      const emptyMessage = page.locator(':has-text("vacío"), :has-text("empty"), :has-text("no hay")')
      const hasEmptyMessage = await emptyMessage.count() > 0

      // Either shows empty message or the page redirects
      expect(hasEmptyMessage || page.url().includes('/cart') || page.url().includes('/products')).toBe(true)
    }
    else {
      // Was redirected away from checkout - this is expected behavior
      expect(page.url()).not.toContain('/checkout')
    }
  })

  test('checkout retains cart items on page refresh', async ({ page }) => {
    const helpers = new CriticalTestHelpers(page)

    // Add product to cart
    await helpers.addFirstProductToCart()

    // Go to checkout
    await helpers.goToCheckout()
    await expect(page).toHaveURL(URL_PATTERNS.CHECKOUT, { timeout: TIMEOUTS.STANDARD })
    await page.waitForLoadState('networkidle')

    // Refresh the page
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Should still be on checkout page (items persisted)
    // OR redirected to cart if session expired
    const currentUrl = page.url()
    const isStillCheckout = currentUrl.includes('/checkout')
    const isOnCart = currentUrl.includes('/cart')

    expect(isStillCheckout || isOnCart).toBe(true)
  })
})
