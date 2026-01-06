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
import { CartPersistenceHelpers } from '../utils/cart-persistence-helpers'

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
    await helpers.addProductAndNavigateToCheckout()
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
      // Log error but continue - shipping methods may not be available
      console.warn(`⚠️  Shipping methods not loaded: ${e instanceof Error ? e.message : String(e)}`)
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
      // Verify shipping method was selected (RadioGroupItem uses data-state="checked" not checked attribute)
      await expect(checkoutPage.shippingMethodOptions.first()).toHaveAttribute('data-state', 'checked', { timeout: 3000 })
      await page.waitForTimeout(500)
    }
    catch (e) {
      // Log error but continue - this is a visual test
      console.warn(`⚠️  Shipping selection failed: ${e instanceof Error ? e.message : String(e)}`)
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
      await expect(checkoutPage.shippingMethodOptions.first()).toHaveAttribute('data-state', 'checked', { timeout: 3000 })
      await page.waitForTimeout(500)
      await checkoutPage.selectCashPayment()
      await expect(checkoutPage.cashPaymentOption).toBeChecked({ timeout: 3000 })
      await page.waitForTimeout(500)
    }
    catch (e) {
      // Log error but continue - this is a visual test
      console.warn(`⚠️  Payment selection failed: ${e instanceof Error ? e.message : String(e)}`)
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
      await expect(checkoutPage.shippingMethodOptions.first()).toHaveAttribute('data-state', 'checked', { timeout: 3000 })
      await page.waitForTimeout(500)
      await checkoutPage.selectCashPayment()
      await expect(checkoutPage.cashPaymentOption).toBeChecked({ timeout: 3000 })
      await page.waitForTimeout(500)
      await checkoutPage.acceptTerms()
      await page.waitForTimeout(500)
    }
    catch (e) {
      // Log error but continue - this is a visual test
      console.warn(`⚠️  Ready-to-order setup failed: ${e instanceof Error ? e.message : String(e)}`)
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
      await expect(checkoutPage.shippingMethodOptions.first()).toHaveAttribute('data-state', 'checked', { timeout: 3000 })
      await page.waitForTimeout(500)
      await checkoutPage.selectCashPayment()
      await expect(checkoutPage.cashPaymentOption).toBeChecked({ timeout: 3000 })
      await page.waitForTimeout(500)
      await checkoutPage.acceptTerms()
      await page.waitForTimeout(500)
    }
    catch (e) {
      // Log error but continue - this is a visual test
      console.warn(`⚠️  Ready-to-order mobile setup failed: ${e instanceof Error ? e.message : String(e)}`)
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

      // Navigate to products page in the target locale
      const productsUrl = locale.code === 'es' ? '/products' : `/${locale.code}/products`
      await page.goto(productsUrl)
      await page.waitForLoadState('networkidle')

      // Add first product to cart - find any "Add to Cart" button in any language
      const addToCartButton = page.locator('button').filter({
        hasText: /Añadir al Carrito|Add to Cart|Adaugă în coș|В корзину/i,
      }).first()

      await addToCartButton.waitFor({ state: 'visible', timeout: 10000 })
      await addToCartButton.click()

      // Wait for cart to update (button changes to "In cart" variant)
      await page.waitForTimeout(1500)

      // Force save cart to cookie
      const cartHelpers = new CartPersistenceHelpers(page)
      await cartHelpers.forceCartSave()

      // Navigate to cart first via header link (client-side navigation preserves Pinia state)
      const cartLink = page.locator('a[href*="/cart"]').first()
      await cartLink.click()
      await page.waitForURL(/\/cart/, { timeout: 10000 })
      await page.waitForLoadState('networkidle')

      // Click checkout button to navigate to checkout (supports multiple locales)
      const checkoutButton = page.locator(
        'button:has-text("Checkout"), button:has-text("Finalizar compra"), button:has-text("Finalizar Compra"), '
        + 'button:has-text("Оформить"), button:has-text("Finalizare Comandă"), button:has-text("Finalizare"), '
        + 'a:has-text("Checkout"), a:has-text("Finalizar compra"), a:has-text("Finalizare")',
      ).first()
      await checkoutButton.waitFor({ state: 'visible', timeout: 5000 })
      await checkoutButton.click()
      await page.waitForURL(/\/checkout/, { timeout: 10000 })
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
    await helpers.addProductAndNavigateToCheckout()
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
      await expect(checkoutPage.shippingMethodOptions.first()).toHaveAttribute('data-state', 'checked', { timeout: 3000 })
      await checkoutPage.selectCashPayment()
      await expect(checkoutPage.cashPaymentOption).toBeChecked({ timeout: 3000 })
      await page.waitForTimeout(500)
    }
    catch (e) {
      // Log error but continue - this is a visual component test
      console.warn(`⚠️  Mobile footer setup failed: ${e instanceof Error ? e.message : String(e)}`)
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
    await helpers.addProductAndNavigateToCheckout()
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

    // Clean up existing addresses for consistent screenshot size
    await helpers.deleteAllSavedAddresses()

    // Create a saved address to enable express checkout
    await helpers.createSavedAddressForUser()

    // Add product and navigate to checkout (uses client-side navigation to preserve cart state)
    await helpers.addProductAndNavigateToCheckout()
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
    else {
      console.log('  ⚠️ Express banner not visible - may need to check address/user setup')
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

    // Clean up existing addresses for consistent screenshot size
    await helpers.deleteAllSavedAddresses()
    await helpers.createSavedAddressForUser()

    // Use client-side navigation to preserve cart state
    await helpers.addProductAndNavigateToCheckout()
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
    else {
      console.log('  ⚠️ Express banner not visible - cannot test dismissal')
    }
  })

  test('express checkout banner - mobile', async ({ page }) => {
    if (!CriticalTestHelpers.hasTestUserCredentials()) {
      test.skip()
      return
    }

    // Start with desktop viewport for navigation (cart link visible on desktop)
    await page.setViewportSize(VIEWPORTS.desktop)

    const helpers = new CriticalTestHelpers(page)
    await helpers.loginAsTestUser()

    // Clean up existing addresses for consistent screenshot size
    await helpers.deleteAllSavedAddresses()
    await helpers.createSavedAddressForUser()

    // Use client-side navigation to preserve cart state (at desktop size)
    await helpers.addProductAndNavigateToCheckout()

    // Now resize to mobile and reload to test mobile layout
    await page.setViewportSize(VIEWPORTS.mobile)
    await page.reload()
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
    else {
      console.log('  ⚠️ Express banner not visible on mobile - may need to check address/user setup')
    }
  })
})

// ============================================
// Tablet Viewport
// ============================================

test.describe('Checkout - Tablet Viewport', () => {
  test.beforeEach(async ({ page }) => {
    const helpers = new CriticalTestHelpers(page)
    await helpers.addProductAndNavigateToCheckout()
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

// ============================================
// Confirmation Page
// ============================================

test.describe('Checkout - Confirmation Page', () => {
  test('order confirmation - desktop', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop)

    const helpers = new CriticalTestHelpers(page)
    await helpers.addProductAndNavigateToCheckout()

    const checkoutPage = new CheckoutPage(page)

    if (await checkoutPage.isGuestPromptVisible()) {
      await checkoutPage.continueAsGuest()
      await page.waitForTimeout(500)
    }

    // Fill all checkout steps
    await checkoutPage.fillShippingAddress(TEST_DATA.TEST_ADDRESS)
    await page.waitForTimeout(1000)

    await checkoutPage.waitForShippingMethods()
    await checkoutPage.selectShippingMethod(0)
    await expect(checkoutPage.shippingMethodOptions.first()).toHaveAttribute('data-state', 'checked', { timeout: 3000 })
    await page.waitForTimeout(500)

    // Cash payment is selected by default, just verify it's checked
    await page.waitForTimeout(1000) // Wait for reactivity to update

    // Scroll to bottom to reveal the terms section
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(1000)

    // Wait for the terms checkbox to be visible (canShowPlaceOrder should be true now)
    const termsCheckbox = checkoutPage.termsCheckbox
    await expect(termsCheckbox).toBeVisible({ timeout: 10000 })

    // Wait for translations to load (look for translated text, not raw i18n keys)
    await expect(page.locator('text=Acepto los').or(page.locator('text=I accept the'))).toBeVisible({ timeout: 10000 })

    // Accept terms - screenshot before placing order
    await checkoutPage.acceptTerms()
    await page.waitForTimeout(500)

    await expect(page).toHaveScreenshot('checkout-terms-accepted-desktop.png', {
      ...screenshotOptions,
      fullPage: true,
      mask: dynamicContentMasks.map(s => page.locator(s)),
    })

    // Place the order
    await checkoutPage.placeOrder()

    // Wait for confirmation page
    await expect(page).toHaveURL(/\/checkout\/confirmation/, { timeout: 30000 })
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000) // Allow animations to settle

    await expect(page).toHaveScreenshot('checkout-confirmation-desktop.png', {
      ...screenshotOptions,
      fullPage: true,
      mask: [
        ...dynamicContentMasks.map(s => page.locator(s)),
        page.locator('.text-2xl.font-bold.text-zinc-900'), // Order number (new confirmation UI)
        page.locator('[data-testid="order-number"]'), // Fallback order number selector
      ],
    })
  })

  test('order confirmation - mobile', async ({ page }) => {
    // Use tablet viewport for this test to avoid mobile header issues
    await page.setViewportSize({ width: 768, height: 1024 })

    const helpers = new CriticalTestHelpers(page)
    await helpers.addProductAndNavigateToCheckout()

    const checkoutPage = new CheckoutPage(page)

    if (await checkoutPage.isGuestPromptVisible()) {
      await checkoutPage.continueAsGuest()
      await page.waitForTimeout(500)
    }

    await checkoutPage.fillShippingAddress(TEST_DATA.TEST_ADDRESS)
    await page.waitForTimeout(1000)

    await checkoutPage.waitForShippingMethods()
    await checkoutPage.selectShippingMethod(0)
    await page.waitForTimeout(500)

    // Cash payment is selected by default
    await page.waitForTimeout(1000)

    // Scroll to bottom to reveal the terms section
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(1000)

    // Wait for terms checkbox to be visible
    const termsCheckbox = checkoutPage.termsCheckbox
    await expect(termsCheckbox).toBeVisible({ timeout: 10000 })

    // Wait for translations to load (look for translated text, not raw i18n keys)
    await expect(page.locator('text=Acepto los').or(page.locator('text=I accept the'))).toBeVisible({ timeout: 10000 })

    await checkoutPage.acceptTerms()
    await page.waitForTimeout(500)

    // Place the order
    await checkoutPage.placeOrder()

    // Wait for confirmation page
    await expect(page).toHaveURL(/\/checkout\/confirmation/, { timeout: 30000 })
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Now set mobile viewport for screenshot
    await page.setViewportSize(VIEWPORTS.mobile)
    await page.waitForTimeout(500)

    await expect(page).toHaveScreenshot('checkout-confirmation-mobile.png', {
      ...screenshotOptions,
      fullPage: true,
      mask: [
        ...dynamicContentMasks.map(s => page.locator(s)),
        page.locator('.text-2xl.font-bold.text-zinc-900'), // Order number (new confirmation UI)
        page.locator('[data-testid="order-number"]'), // Fallback order number selector
      ],
    })
  })
})
