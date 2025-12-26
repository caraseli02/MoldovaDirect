/**
 * Confirmation Page Visual Regression Tests
 *
 * Tests visual appearance of the order confirmation page across:
 * - Multiple locales (en, es, ro, ru)
 * - Multiple viewports (desktop, tablet, mobile)
 * - Different checkout types (guest, authenticated, express)
 *
 * Coverage: 10 screenshots
 */

import { test, expect } from '@playwright/test'
import { CheckoutHelpers } from '../e2e/visual-regression/helpers'

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000'

// Screenshot configuration
const screenshotOptions = {
  animations: 'disabled' as const,
  maxDiffPixelRatio: 0.02, // 2% tolerance for dynamic content
}

// Dynamic content to mask (prices, order numbers, timestamps)
const dynamicContentMasks = [
  '[data-testid="order-number"]',
  '[data-testid="order-id"]',
  '[data-testid="order-total"]',
  '[data-testid="order-date"]',
  '[data-testid="price"]',
  '[data-testid="total"]',
  '.order-number',
  '.order-id',
  '.order-date',
  '.timestamp',
]

test.describe('Confirmation Page - Guest Checkout', () => {
  test('confirmation page - guest checkout - desktop', async ({ page }) => {
    const helpers = new CheckoutHelpers(page)

    // Complete full guest checkout flow
    await helpers.addProductAndGoToCheckout()
    await helpers.continueAsGuest()
    await helpers.fillGuestEmail('test-visual@example.com')
    await helpers.fillAddress({
      fullName: 'Visual Test User',
      street: '123 Test Street',
      city: 'Madrid',
      postalCode: '28001',
      country: 'ES',
    })
    await helpers.waitForShippingMethods()
    await helpers.selectShippingMethod(0)
    await helpers.selectCashPayment()
    await helpers.acceptTerms()
    await helpers.placeOrder()

    // Wait for confirmation page
    await expect(page).toHaveURL(/\/checkout\/confirmation/, { timeout: 15000 })
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000) // Allow animations to settle

    // Take screenshot
    await expect(page).toHaveScreenshot('confirmation-guest-desktop.png', {
      ...screenshotOptions,
      fullPage: true,
      mask: dynamicContentMasks.map(s => page.locator(s)),
    })
  })

  test('confirmation page - guest checkout - mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    const helpers = new CheckoutHelpers(page)

    // Complete full guest checkout flow
    await helpers.addProductAndGoToCheckout()
    await helpers.continueAsGuest()
    await helpers.fillGuestEmail('test-visual-mobile@example.com')
    await helpers.fillAddress({
      fullName: 'Mobile Test User',
      street: '123 Mobile Street',
      city: 'Madrid',
      postalCode: '28001',
      country: 'ES',
    })
    await helpers.waitForShippingMethods()
    await helpers.selectShippingMethod(0)
    await helpers.selectCashPayment()
    await helpers.acceptTerms()
    await helpers.placeOrder()

    // Wait for confirmation page
    await expect(page).toHaveURL(/\/checkout\/confirmation/, { timeout: 15000 })
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Take screenshot
    await expect(page).toHaveScreenshot('confirmation-guest-mobile.png', {
      ...screenshotOptions,
      fullPage: true,
      mask: dynamicContentMasks.map(s => page.locator(s)),
    })
  })

  test('confirmation page - guest checkout - tablet', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })

    const helpers = new CheckoutHelpers(page)

    // Complete full guest checkout flow
    await helpers.addProductAndGoToCheckout()
    await helpers.continueAsGuest()
    await helpers.fillGuestEmail('test-visual-tablet@example.com')
    await helpers.fillAddress({
      fullName: 'Tablet Test User',
      street: '123 Tablet Street',
      city: 'Madrid',
      postalCode: '28001',
      country: 'ES',
    })
    await helpers.waitForShippingMethods()
    await helpers.selectShippingMethod(0)
    await helpers.selectCashPayment()
    await helpers.acceptTerms()
    await helpers.placeOrder()

    // Wait for confirmation page
    await expect(page).toHaveURL(/\/checkout\/confirmation/, { timeout: 15000 })
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Take screenshot
    await expect(page).toHaveScreenshot('confirmation-guest-tablet.png', {
      ...screenshotOptions,
      fullPage: true,
      mask: dynamicContentMasks.map(s => page.locator(s)),
    })
  })
})

test.describe('Confirmation Page - Multi-Locale', () => {
  const locales = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'ro', name: 'Romanian' },
    { code: 'ru', name: 'Russian' },
  ]

  for (const locale of locales) {
    test(`confirmation page in ${locale.name} (${locale.code}) - desktop`, async ({ page }) => {
      const helpers = new CheckoutHelpers(page)

      // Navigate with locale
      await page.goto(`${BASE_URL}/${locale.code}/products`)
      await page.waitForLoadState('networkidle')

      // Add product
      const addButton = page.locator('button').filter({ hasText: /add.*cart|añadir.*carrito|adaugă.*coș|добавить.*корзину/i }).first()
      await expect(addButton).toBeVisible({ timeout: 10000 })
      await addButton.click()
      await page.waitForTimeout(2000)

      // Go to checkout
      await page.goto(`${BASE_URL}/${locale.code}/checkout`)
      await page.waitForLoadState('networkidle')

      // Handle guest prompt
      const guestPrompt = page.locator('[data-testid="guest-prompt"]')
      if (await guestPrompt.isVisible({ timeout: 2000 }).catch(() => false)) {
        const continueButton = page.locator('button').filter({ hasText: /continue.*guest|continuar.*invitado|continuă.*oaspete|продолжить.*гость/i })
        await continueButton.click()
        await page.waitForTimeout(500)
      }

      // Fill guest email
      const emailInput = page.locator('input[type="email"]').first()
      if (await emailInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await emailInput.fill(`test-${locale.code}@example.com`)
      }

      // Fill address
      await helpers.fillAddress({
        fullName: `${locale.name} Test User`,
        street: '123 Test Street',
        city: 'Madrid',
        postalCode: '28001',
        country: 'ES',
      })

      // Complete checkout
      await helpers.waitForShippingMethods()
      await helpers.selectShippingMethod(0)
      await helpers.selectCashPayment()
      await helpers.acceptTerms()
      await helpers.placeOrder()

      // Wait for confirmation page
      await expect(page).toHaveURL(new RegExp(`/${locale.code}/checkout/confirmation`), { timeout: 15000 })
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000)

      // Take screenshot
      await expect(page).toHaveScreenshot(`confirmation-${locale.code}-desktop.png`, {
        ...screenshotOptions,
        fullPage: true,
        mask: dynamicContentMasks.map(s => page.locator(s)),
      })
    })
  }
})

test.describe('Confirmation Page - Express Checkout', () => {
  test.skip('confirmation page - express checkout - desktop', async ({ page }) => {
    test.skip(
      !process.env.TEST_USER_WITH_ADDRESS,
      'TEST_USER_WITH_ADDRESS environment variable not set',
    )

    const helpers = new CheckoutHelpers(page)

    // Login as user with saved address
    await page.goto(`${BASE_URL}/auth/login`)
    await page.waitForLoadState('networkidle')

    const userEmail = process.env.TEST_USER_WITH_ADDRESS!
    const userPassword = process.env.TEST_USER_PASSWORD!

    await page.fill('input[type="email"]', userEmail)
    await page.fill('input[type="password"]', userPassword)
    await page.click('[data-testid="login-button"]')
    await page.waitForURL(/\/(account|admin|products)/, { timeout: 15000 })

    // Add product
    await page.goto(`${BASE_URL}/products`)
    await page.waitForLoadState('networkidle')
    const addButton = page.locator('button').filter({ hasText: /add.*cart/i }).first()
    await addButton.click()
    await page.waitForTimeout(2000)

    // Go to checkout
    await page.goto(`${BASE_URL}/checkout`)
    await page.waitForLoadState('networkidle')

    // Should see express checkout banner
    const expressBanner = page.locator('[data-testid="express-checkout-banner"]')
    await expect(expressBanner).toBeVisible({ timeout: 5000 })

    // Use express checkout
    const useExpressButton = page.locator('button').filter({ hasText: /use.*express|usar.*express|folosește.*express|использовать.*экспресс/i })
    await useExpressButton.click()

    // Should navigate to confirmation
    await expect(page).toHaveURL(/\/checkout\/confirmation/, { timeout: 15000 })
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Take screenshot
    await expect(page).toHaveScreenshot('confirmation-express-desktop.png', {
      ...screenshotOptions,
      fullPage: true,
      mask: dynamicContentMasks.map(s => page.locator(s)),
    })
  })
})

test.describe('Confirmation Page - Components', () => {
  test('confirmation page - order summary section', async ({ page }) => {
    const helpers = new CheckoutHelpers(page)

    // Complete checkout flow
    await helpers.addProductAndGoToCheckout()
    await helpers.continueAsGuest()
    await helpers.fillGuestEmail('test-summary@example.com')
    await helpers.fillAddress({
      fullName: 'Summary Test User',
      street: '123 Summary Street',
      city: 'Madrid',
      postalCode: '28001',
      country: 'ES',
    })
    await helpers.waitForShippingMethods()
    await helpers.selectShippingMethod(0)
    await helpers.selectCashPayment()
    await helpers.acceptTerms()
    await helpers.placeOrder()

    // Wait for confirmation
    await expect(page).toHaveURL(/\/checkout\/confirmation/, { timeout: 15000 })
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Focus on order summary section
    const orderSummary = page.locator('[data-testid="order-summary"], .order-summary').first()
    await expect(orderSummary).toBeVisible({ timeout: 5000 })

    // Take screenshot of just the order summary
    await expect(orderSummary).toHaveScreenshot('confirmation-order-summary.png', {
      ...screenshotOptions,
      mask: dynamicContentMasks.map(s => page.locator(s)),
    })
  })
})
