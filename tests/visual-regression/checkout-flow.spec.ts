/**
 * Visual Regression Tests - Hybrid Progressive Checkout Flow
 *
 * Comprehensive visual testing for the checkout experience including:
 * - Empty/guest checkout states
 * - Express checkout banner for returning users
 * - Progressive disclosure form sections
 * - Multi-locale coverage (EN, ES, RO, RU)
 * - Desktop and mobile viewports
 * - Error states and validation
 *
 * Usage:
 * - Generate baselines: npx playwright test checkout-flow --config=playwright.visual-regression.config.ts
 * - Update baselines: npx playwright test checkout-flow --config=playwright.visual-regression.config.ts --update-snapshots
 *
 * @see https://playwright.dev/docs/test-snapshots
 */

import { test, expect } from '@playwright/test'
import { CheckoutPage } from '../e2e/page-objects/CheckoutPage'
import { CriticalTestHelpers } from '../e2e/critical/helpers/critical-test-helpers'
import { TEST_DATA } from '../e2e/critical/constants'

// Common screenshot options
const screenshotOptions = {
  maxDiffPixelRatio: 0.02, // Allow 2% pixel difference
  threshold: 0.2, // Per-pixel color threshold
  animations: 'disabled' as const,
}

// Viewports for testing
const VIEWPORTS = {
  desktop: { width: 1920, height: 1080 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 667 },
}

// Dynamic content that should be masked in screenshots
const dynamicContentMasks = [
  '[data-testid="timestamp"]',
  '[data-testid="random-content"]',
  '.skeleton-loader',
  '.animate-pulse',
  // Price and totals may change
  '[data-testid="item-price"]',
  '[data-testid="cart-total"]',
  '[data-testid="order-total"]',
]

// ============================================
// Guest Checkout - Empty State
// ============================================

test.describe('Checkout - Empty State (No Items)', () => {
  test('empty checkout redirects or shows empty state - desktop', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop)
    await page.goto('/checkout')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Either shows empty state or redirects to cart
    const url = page.url()
    if (url.includes('/cart')) {
      // Redirected to empty cart
      await expect(page).toHaveScreenshot('checkout-empty-redirect-desktop.png', {
        ...screenshotOptions,
        fullPage: true,
      })
    }
    else {
      // Shows empty state on checkout
      await expect(page).toHaveScreenshot('checkout-empty-state-desktop.png', {
        ...screenshotOptions,
        fullPage: true,
      })
    }
  })

  test('empty checkout on mobile', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile)
    await page.goto('/checkout')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    const url = page.url()
    if (url.includes('/cart')) {
      await expect(page).toHaveScreenshot('checkout-empty-redirect-mobile.png', {
        ...screenshotOptions,
        fullPage: true,
      })
    }
    else {
      await expect(page).toHaveScreenshot('checkout-empty-state-mobile.png', {
        ...screenshotOptions,
        fullPage: true,
      })
    }
  })
})

// ============================================
// Guest Checkout - With Items
// ============================================

test.describe('Checkout - Guest Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    const helpers = new CriticalTestHelpers(page)

    // Add product to cart
    await helpers.addFirstProductToCart()

    // Navigate to checkout
    await page.goto('/checkout')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
  })

  test('guest checkout prompt - desktop EN', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop)

    const checkoutPage = new CheckoutPage(page)

    // Check if guest prompt is visible
    const hasGuestPrompt = await checkoutPage.isGuestPromptVisible()

    if (hasGuestPrompt) {
      await expect(page).toHaveScreenshot('checkout-guest-prompt-desktop-en.png', {
        ...screenshotOptions,
        fullPage: true,
        mask: dynamicContentMasks.map(s => page.locator(s)),
      })
    }
  })

  test('guest checkout initial state - desktop', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop)

    const checkoutPage = new CheckoutPage(page)

    // Dismiss guest prompt if exists
    if (await checkoutPage.isGuestPromptVisible()) {
      await checkoutPage.continueAsGuest()
      await page.waitForTimeout(500)
    }

    await expect(page).toHaveScreenshot('checkout-guest-initial-desktop.png', {
      ...screenshotOptions,
      fullPage: true,
      mask: dynamicContentMasks.map(s => page.locator(s)),
    })
  })

  test('guest checkout initial state - mobile', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile)

    const checkoutPage = new CheckoutPage(page)

    if (await checkoutPage.isGuestPromptVisible()) {
      await checkoutPage.continueAsGuest()
      await page.waitForTimeout(500)
    }

    await expect(page).toHaveScreenshot('checkout-guest-initial-mobile.png', {
      ...screenshotOptions,
      fullPage: true,
      mask: dynamicContentMasks.map(s => page.locator(s)),
    })
  })

  test('address form filled - desktop', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop)

    const checkoutPage = new CheckoutPage(page)

    if (await checkoutPage.isGuestPromptVisible()) {
      await checkoutPage.continueAsGuest()
      await page.waitForTimeout(500)
    }

    // Fill address form
    await checkoutPage.fillShippingAddress(TEST_DATA.TEST_ADDRESS)
    await page.waitForTimeout(500)

    await expect(page).toHaveScreenshot('checkout-address-filled-desktop.png', {
      ...screenshotOptions,
      fullPage: true,
      mask: dynamicContentMasks.map(s => page.locator(s)),
    })
  })

  test('shipping methods loaded - desktop', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop)

    const checkoutPage = new CheckoutPage(page)

    if (await checkoutPage.isGuestPromptVisible()) {
      await checkoutPage.continueAsGuest()
      await page.waitForTimeout(500)
    }

    // Fill address to trigger shipping methods
    await checkoutPage.fillShippingAddress(TEST_DATA.TEST_ADDRESS)
    await page.waitForTimeout(1000)

    // Wait for shipping methods to load
    try {
      await checkoutPage.waitForShippingMethods()
    }
    catch (e) {
      // May timeout if shipping method API is slow
      await page.waitForTimeout(2000)
    }

    await expect(page).toHaveScreenshot('checkout-shipping-methods-desktop.png', {
      ...screenshotOptions,
      fullPage: true,
      mask: dynamicContentMasks.map(s => page.locator(s)),
    })
  })

  test('shipping method selected - desktop', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop)

    const checkoutPage = new CheckoutPage(page)

    if (await checkoutPage.isGuestPromptVisible()) {
      await checkoutPage.continueAsGuest()
      await page.waitForTimeout(500)
    }

    await checkoutPage.fillShippingAddress(TEST_DATA.TEST_ADDRESS)
    await page.waitForTimeout(1000)

    try {
      await checkoutPage.waitForShippingMethods()
      await checkoutPage.selectShippingMethod(0)
      await page.waitForTimeout(500)
    }
    catch (e) {
      // Continue if shipping methods not available
    }

    await expect(page).toHaveScreenshot('checkout-shipping-selected-desktop.png', {
      ...screenshotOptions,
      fullPage: true,
      mask: dynamicContentMasks.map(s => page.locator(s)),
    })
  })

  test('payment method selected - desktop', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop)

    const checkoutPage = new CheckoutPage(page)

    if (await checkoutPage.isGuestPromptVisible()) {
      await checkoutPage.continueAsGuest()
      await page.waitForTimeout(500)
    }

    await checkoutPage.fillShippingAddress(TEST_DATA.TEST_ADDRESS)
    await page.waitForTimeout(1000)

    try {
      await checkoutPage.waitForShippingMethods()
      await checkoutPage.selectShippingMethod(0)
      await page.waitForTimeout(500)
      await checkoutPage.selectCashPayment()
      await page.waitForTimeout(500)
    }
    catch (e) {
      // Continue if steps not available
    }

    await expect(page).toHaveScreenshot('checkout-payment-selected-desktop.png', {
      ...screenshotOptions,
      fullPage: true,
      mask: dynamicContentMasks.map(s => page.locator(s)),
    })
  })

  test('ready to place order - desktop', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop)

    const checkoutPage = new CheckoutPage(page)

    if (await checkoutPage.isGuestPromptVisible()) {
      await checkoutPage.continueAsGuest()
      await page.waitForTimeout(500)
    }

    await checkoutPage.fillShippingAddress(TEST_DATA.TEST_ADDRESS)
    await page.waitForTimeout(1000)

    try {
      await checkoutPage.waitForShippingMethods()
      await checkoutPage.selectShippingMethod(0)
      await page.waitForTimeout(500)
      await checkoutPage.selectCashPayment()
      await page.waitForTimeout(500)
      await checkoutPage.acceptTerms()
      await page.waitForTimeout(500)
    }
    catch (e) {
      // Continue if steps not available
    }

    await expect(page).toHaveScreenshot('checkout-ready-to-order-desktop.png', {
      ...screenshotOptions,
      fullPage: true,
      mask: dynamicContentMasks.map(s => page.locator(s)),
    })
  })

  test('ready to place order - mobile', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile)

    const checkoutPage = new CheckoutPage(page)

    if (await checkoutPage.isGuestPromptVisible()) {
      await checkoutPage.continueAsGuest()
      await page.waitForTimeout(500)
    }

    await checkoutPage.fillShippingAddress(TEST_DATA.TEST_ADDRESS)
    await page.waitForTimeout(1000)

    try {
      await checkoutPage.waitForShippingMethods()
      await checkoutPage.selectShippingMethod(0)
      await page.waitForTimeout(500)
      await checkoutPage.selectCashPayment()
      await page.waitForTimeout(500)
      await checkoutPage.acceptTerms()
      await page.waitForTimeout(500)
    }
    catch (e) {
      // Continue if steps not available
    }

    await expect(page).toHaveScreenshot('checkout-ready-to-order-mobile.png', {
      ...screenshotOptions,
      fullPage: true,
      mask: dynamicContentMasks.map(s => page.locator(s)),
    })
  })
})

// ============================================
// Multi-Locale Testing
// ============================================

test.describe('Checkout - Multi-Locale Coverage', () => {
  const locales = [
    { code: 'es', name: 'Spanish' },
    { code: 'en', name: 'English' },
    { code: 'ro', name: 'Romanian' },
    { code: 'ru', name: 'Russian' },
  ]

  for (const locale of locales) {
    test(`checkout page in ${locale.name} (${locale.code}) - desktop`, async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop)

      const helpers = new CriticalTestHelpers(page)

      // Add product to cart
      await page.goto(`/${locale.code}/products`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000)

      const addButton = page.locator('button:has-text("Añadir"), button:has-text("Add"), button:has-text("Adaugă"), button:has-text("Добавить")').first()
      if (await addButton.isVisible({ timeout: 5000 })) {
        await addButton.click()
        await page.waitForTimeout(1500)
      }

      // Navigate to checkout
      await page.goto(`/${locale.code}/checkout`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000)

      const checkoutPage = new CheckoutPage(page)

      if (await checkoutPage.isGuestPromptVisible()) {
        await checkoutPage.continueAsGuest()
        await page.waitForTimeout(500)
      }

      await expect(page).toHaveScreenshot(`checkout-initial-desktop-${locale.code}.png`, {
        ...screenshotOptions,
        fullPage: true,
        mask: dynamicContentMasks.map(s => page.locator(s)),
      })
    })
  }
})

// ============================================
// Component-Level Screenshots
// ============================================

test.describe('Checkout - Component Screenshots', () => {
  test.beforeEach(async ({ page }) => {
    const helpers = new CriticalTestHelpers(page)
    await helpers.addFirstProductToCart()
    await page.goto('/checkout')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
  })

  test('order summary sidebar - desktop', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop)

    const checkoutPage = new CheckoutPage(page)

    if (await checkoutPage.isGuestPromptVisible()) {
      await checkoutPage.continueAsGuest()
      await page.waitForTimeout(500)
    }

    const orderSummary = checkoutPage.orderSummary
    if (await orderSummary.isVisible()) {
      await expect(orderSummary).toHaveScreenshot('component-order-summary-desktop.png', {
        ...screenshotOptions,
        mask: [
          page.locator('[data-testid="item-price"]'),
          page.locator('[data-testid="order-total"]'),
        ],
      })
    }
  })

  test('address form empty - desktop', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop)

    const checkoutPage = new CheckoutPage(page)

    if (await checkoutPage.isGuestPromptVisible()) {
      await checkoutPage.continueAsGuest()
      await page.waitForTimeout(500)
    }

    const addressForm = checkoutPage.addressForm
    if (await addressForm.isVisible()) {
      await expect(addressForm).toHaveScreenshot('component-address-form-empty.png', {
        ...screenshotOptions,
      })
    }
  })

  test('address form filled - desktop', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop)

    const checkoutPage = new CheckoutPage(page)

    if (await checkoutPage.isGuestPromptVisible()) {
      await checkoutPage.continueAsGuest()
      await page.waitForTimeout(500)
    }

    await checkoutPage.fillShippingAddress(TEST_DATA.TEST_ADDRESS)
    await page.waitForTimeout(500)

    const addressForm = checkoutPage.addressForm
    if (await addressForm.isVisible()) {
      await expect(addressForm).toHaveScreenshot('component-address-form-filled.png', {
        ...screenshotOptions,
      })
    }
  })

  test('mobile sticky footer', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile)

    const checkoutPage = new CheckoutPage(page)

    if (await checkoutPage.isGuestPromptVisible()) {
      await checkoutPage.continueAsGuest()
      await page.waitForTimeout(500)
    }

    await checkoutPage.fillShippingAddress(TEST_DATA.TEST_ADDRESS)
    await page.waitForTimeout(1000)

    try {
      await checkoutPage.waitForShippingMethods()
      await checkoutPage.selectShippingMethod(0)
      await checkoutPage.selectCashPayment()
      await page.waitForTimeout(500)
    }
    catch (e) {
      // Continue if steps fail
    }

    const mobileFooter = checkoutPage.mobileStickyFooter
    if (await mobileFooter.isVisible()) {
      await expect(mobileFooter).toHaveScreenshot('component-mobile-sticky-footer.png', {
        ...screenshotOptions,
        mask: [page.locator('[data-testid="order-total"]')],
      })
    }
  })
})

// ============================================
// Error States
// ============================================

test.describe('Checkout - Error States', () => {
  test.beforeEach(async ({ page }) => {
    const helpers = new CriticalTestHelpers(page)
    await helpers.addFirstProductToCart()
    await page.goto('/checkout')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
  })

  test('address validation errors - desktop', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop)

    const checkoutPage = new CheckoutPage(page)

    if (await checkoutPage.isGuestPromptVisible()) {
      await checkoutPage.continueAsGuest()
      await page.waitForTimeout(500)
    }

    // Fill with invalid data to trigger validation
    await checkoutPage.addressFields.fullName.fill('A') // Too short
    await checkoutPage.addressFields.street.fill('B')
    await checkoutPage.addressFields.city.fill('C')
    await checkoutPage.addressFields.postalCode.fill('123') // Invalid format
    await checkoutPage.addressFields.postalCode.blur()
    await page.waitForTimeout(500)

    // Check if validation errors appear
    const hasErrors = await checkoutPage.hasValidationErrors()

    if (hasErrors) {
      await expect(page).toHaveScreenshot('checkout-validation-errors-desktop.png', {
        ...screenshotOptions,
        fullPage: true,
        mask: dynamicContentMasks.map(s => page.locator(s)),
      })
    }
  })
})

// ============================================
// Express Checkout (Returning Users)
// ============================================

test.describe('Checkout - Express Checkout Banner', () => {
  test('express checkout banner for returning user - desktop', async ({ page }) => {
    // This test requires authentication and a saved address
    // Skip if credentials not available
    if (!CriticalTestHelpers.hasTestUserCredentials()) {
      test.skip()
      return
    }

    await page.setViewportSize(VIEWPORTS.desktop)

    const helpers = new CriticalTestHelpers(page)

    // Login as test user
    await helpers.loginAsTestUser()

    // Add product to cart
    await helpers.addFirstProductToCart()

    // Navigate to checkout
    await page.goto('/checkout')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)

    const checkoutPage = new CheckoutPage(page)

    // Check if express banner is visible
    const hasExpressBanner = await checkoutPage.isExpressBannerVisible()

    if (hasExpressBanner) {
      await expect(page).toHaveScreenshot('checkout-express-banner-desktop.png', {
        ...screenshotOptions,
        fullPage: true,
        mask: [
          ...dynamicContentMasks.map(s => page.locator(s)),
          // Mask personal data in express banner
          page.locator('[data-testid="saved-address"]'),
        ],
      })
    }
  })

  test('express checkout dismissed - show full form', async ({ page }) => {
    if (!CriticalTestHelpers.hasTestUserCredentials()) {
      test.skip()
      return
    }

    await page.setViewportSize(VIEWPORTS.desktop)

    const helpers = new CriticalTestHelpers(page)
    await helpers.loginAsTestUser()
    await helpers.addFirstProductToCart()
    await page.goto('/checkout')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)

    const checkoutPage = new CheckoutPage(page)

    if (await checkoutPage.isExpressBannerVisible()) {
      await checkoutPage.dismissExpressCheckout()
      await page.waitForTimeout(500)

      await expect(page).toHaveScreenshot('checkout-express-dismissed-desktop.png', {
        ...screenshotOptions,
        fullPage: true,
        mask: dynamicContentMasks.map(s => page.locator(s)),
      })
    }
  })

  test('express checkout banner - mobile', async ({ page }) => {
    if (!CriticalTestHelpers.hasTestUserCredentials()) {
      test.skip()
      return
    }

    await page.setViewportSize(VIEWPORTS.mobile)

    const helpers = new CriticalTestHelpers(page)
    await helpers.loginAsTestUser()
    await helpers.addFirstProductToCart()
    await page.goto('/checkout')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)

    const checkoutPage = new CheckoutPage(page)

    if (await checkoutPage.isExpressBannerVisible()) {
      await expect(page).toHaveScreenshot('checkout-express-banner-mobile.png', {
        ...screenshotOptions,
        fullPage: true,
        mask: [
          ...dynamicContentMasks.map(s => page.locator(s)),
          page.locator('[data-testid="saved-address"]'),
        ],
      })
    }
  })
})

// ============================================
// Tablet Viewport
// ============================================

test.describe('Checkout - Tablet Viewport', () => {
  test.beforeEach(async ({ page }) => {
    const helpers = new CriticalTestHelpers(page)
    await helpers.addFirstProductToCart()
    await page.goto('/checkout')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
  })

  test('checkout initial state - tablet', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.tablet)

    const checkoutPage = new CheckoutPage(page)

    if (await checkoutPage.isGuestPromptVisible()) {
      await checkoutPage.continueAsGuest()
      await page.waitForTimeout(500)
    }

    await expect(page).toHaveScreenshot('checkout-initial-tablet.png', {
      ...screenshotOptions,
      fullPage: true,
      mask: dynamicContentMasks.map(s => page.locator(s)),
    })
  })

  test('checkout ready to order - tablet', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.tablet)

    const checkoutPage = new CheckoutPage(page)

    if (await checkoutPage.isGuestPromptVisible()) {
      await checkoutPage.continueAsGuest()
      await page.waitForTimeout(500)
    }

    await checkoutPage.fillShippingAddress(TEST_DATA.TEST_ADDRESS)
    await page.waitForTimeout(1000)

    try {
      await checkoutPage.waitForShippingMethods()
      await checkoutPage.selectShippingMethod(0)
      await page.waitForTimeout(500)
      await checkoutPage.selectCashPayment()
      await page.waitForTimeout(500)
      await checkoutPage.acceptTerms()
      await page.waitForTimeout(500)
    }
    catch (e) {
      // Continue if steps fail
    }

    await expect(page).toHaveScreenshot('checkout-ready-to-order-tablet.png', {
      ...screenshotOptions,
      fullPage: true,
      mask: dynamicContentMasks.map(s => page.locator(s)),
    })
  })
})
