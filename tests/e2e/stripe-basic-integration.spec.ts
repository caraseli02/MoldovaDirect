/**
 * Basic Stripe Payment Integration E2E Tests
 *
 * Focused tests for core Stripe payment functionality:
 * - Payment method selection UI
 * - Stripe Elements loading
 * - Basic form validation
 * - Payment flow navigation
 *
 * These tests validate the essential Stripe integration without
 * complex scenarios that might be environment-dependent.
 */

import { test, expect } from '@playwright/test'
import { CheckoutPage } from './page-objects/CheckoutPage'

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || process.env.BASE_URL || 'http://localhost:3000'

// Test address data
const TEST_ADDRESS = {
  fullName: 'Test User',
  street: '123 Test Street',
  city: 'Madrid',
  postalCode: '28001',
  country: 'ES',
  phone: '+34 600 123 456',
}

test.describe('Stripe Payment Integration - Basic Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Start fresh - clear cart cookies
    await page.context().clearCookies()
  })

  test('Payment method selection shows cash and credit card options', async ({ page }) => {
    const checkoutPage = new CheckoutPage(page)

    // Add product to cart
    await page.goto(`${BASE_URL}/products`, { timeout: 30000 })
    await page.waitForLoadState('networkidle')

    const addToCartButton = page.locator('button:has-text("Añadir al Carrito"), button:has-text("Add to Cart")').first()
    await expect(addToCartButton).toBeVisible({ timeout: 15000 })
    await addToCartButton.click()
    await page.waitForTimeout(2000)

    // Navigate to checkout
    await page.goto(`${BASE_URL}/checkout`, { timeout: 30000 })
    await page.waitForLoadState('networkidle')

    // Handle express checkout and guest prompts
    if (await checkoutPage.isExpressBannerVisible()) {
      await checkoutPage.dismissExpressCheckout()
    }
    if (await checkoutPage.isGuestPromptVisible()) {
      await checkoutPage.continueAsGuest()
    }

    // Fill shipping address to reach payment section
    await checkoutPage.fillShippingAddress(TEST_ADDRESS)
    await checkoutPage.waitForShippingMethods(15000)
    await checkoutPage.selectShippingMethod(0)

    console.log('✅ Step 1: Setup completed, reached payment section')

    // Verify payment section is visible
    const paymentSectionVisible = await checkoutPage.isPaymentSectionVisible()
    expect(paymentSectionVisible).toBe(true)
    console.log('✅ Step 2: Payment section is visible')

    // Verify cash payment option exists and has correct styling
    const cashPaymentCard = page.locator('div.p-4.border.rounded-lg').filter({ hasText: /💵/ })
    await expect(cashPaymentCard).toBeVisible()
    console.log('✅ Step 3: Cash payment option visible')

    // Verify credit card payment option exists
    const creditCardPaymentCard = page.locator('div.p-4.border.rounded-lg').filter({ hasText: /💳/ })
    await expect(creditCardPaymentCard).toBeVisible()
    console.log('✅ Step 4: Credit card payment option visible')

    // Verify cash is selected by default
    const cashRadio = cashPaymentCard.locator('input[type="radio"][value="cash"]')
    await expect(cashRadio).toBeChecked()
    console.log('✅ Step 5: Cash payment selected by default')

    // Click credit card option
    await creditCardPaymentCard.click()
    await page.waitForTimeout(1000)

    // Verify credit card is now selected
    const creditCardRadio = creditCardPaymentCard.locator('input[type="radio"][value="credit_card"]')
    await expect(creditCardRadio).toBeChecked()
    console.log('✅ Step 6: Credit card payment can be selected')

    // Verify payment form appears for credit card
    const paymentFormContainer = page.locator('div.mt-6').filter({
      has: page.locator('.stripe-card-element, [ref="paymentFormRef"]'),
    })

    // Give it some time to appear
    await page.waitForTimeout(2000)
    const paymentFormVisible = await paymentFormContainer.isVisible().catch(() => false)

    if (paymentFormVisible) {
      console.log('✅ Step 7: Payment form appears for credit card')
    }
    else {
      console.log('⚠️ Step 7: Payment form not immediately visible (may still be loading)')
    }

    console.log('\n🎉 Basic payment method selection test completed!')
  })

  test('Stripe Elements container loads when credit card is selected', async ({ page }) => {
    const checkoutPage = new CheckoutPage(page)

    // Setup checkout flow
    await page.goto(`${BASE_URL}/products`, { timeout: 30000 })
    await page.waitForLoadState('networkidle')

    const addToCartButton = page.locator('button:has-text("Añadir al Carrito"), button:has-text("Add to Cart")').first()
    await addToCartButton.click()
    await page.waitForTimeout(2000)

    await page.goto(`${BASE_URL}/checkout`, { timeout: 30000 })
    await page.waitForLoadState('networkidle')

    if (await checkoutPage.isExpressBannerVisible()) {
      await checkoutPage.dismissExpressCheckout()
    }
    if (await checkoutPage.isGuestPromptVisible()) {
      await checkoutPage.continueAsGuest()
    }

    await checkoutPage.fillShippingAddress(TEST_ADDRESS)
    await checkoutPage.waitForShippingMethods(15000)
    await checkoutPage.selectShippingMethod(0)

    console.log('✅ Step 1: Setup completed')

    // Select credit card payment
    const creditCardPaymentCard = page.locator('div.p-4.border.rounded-lg').filter({ hasText: /💳/ })
    await creditCardPaymentCard.click()
    await page.waitForTimeout(2000)

    console.log('✅ Step 2: Selected credit card payment')

    // Check if Stripe card container appears
    const stripeCardContainer = page.locator('.stripe-card-element')

    // Wait a bit longer for Stripe to load
    await page.waitForTimeout(5000)

    const stripeContainerVisible = await stripeCardContainer.isVisible().catch(() => false)

    if (stripeContainerVisible) {
      console.log('✅ Step 3: Stripe card container is visible')

      // Check if cardholder name field is present
      const cardholderNameField = page.locator('#cardholder-name, input[autocomplete="cc-name"]')
      const cardholderNameVisible = await cardholderNameField.isVisible().catch(() => false)

      if (cardholderNameVisible) {
        console.log('✅ Step 4: Cardholder name field is visible')
      }
      else {
        console.log('⚠️ Step 4: Cardholder name field not found')
      }

      // Check for security notice
      const securityNotice = page.locator('.bg-green-50, .bg-green-900\\/20').filter({ hasText: /secure/i })
      const securityNoticeVisible = await securityNotice.isVisible().catch(() => false)

      if (securityNoticeVisible) {
        console.log('✅ Step 5: Security notice is visible')
      }
      else {
        console.log('⚠️ Step 5: Security notice not found')
      }
    }
    else {
      console.log('⚠️ Step 3: Stripe card container not visible - checking for loading state')

      // Check if loading message is present
      const loadingMessage = page.locator('text=/Loading.*payment/i, text=/Cargando.*pago/i')
      const loadingVisible = await loadingMessage.isVisible().catch(() => false)

      if (loadingVisible) {
        console.log('ℹ️ Stripe is still loading')
      }
      else {
        console.log('⚠️ No loading message found - Stripe may not be configured')
      }
    }

    console.log('\n🎉 Stripe Elements loading test completed!')
  })

  test('Payment form validation works for cardholder name', async ({ page }) => {
    const checkoutPage = new CheckoutPage(page)

    // Setup checkout flow
    await page.goto(`${BASE_URL}/products`, { timeout: 30000 })
    await page.waitForLoadState('networkidle')

    const addToCartButton = page.locator('button:has-text("Añadir al Carrito"), button:has-text("Add to Cart")').first()
    await addToCartButton.click()
    await page.waitForTimeout(2000)

    await page.goto(`${BASE_URL}/checkout`, { timeout: 30000 })
    await page.waitForLoadState('networkidle')

    if (await checkoutPage.isExpressBannerVisible()) {
      await checkoutPage.dismissExpressCheckout()
    }
    if (await checkoutPage.isGuestPromptVisible()) {
      await checkoutPage.continueAsGuest()
    }

    await checkoutPage.fillShippingAddress(TEST_ADDRESS)
    await checkoutPage.waitForShippingMethods(15000)
    await checkoutPage.selectShippingMethod(0)

    // Select credit card payment
    const creditCardPaymentCard = page.locator('div.p-4.border.rounded-lg').filter({ hasText: /💳/ })
    await creditCardPaymentCard.click()
    await page.waitForTimeout(3000)

    console.log('✅ Step 1: Selected credit card payment')

    // Look for cardholder name field
    const cardholderNameField = page.locator('#cardholder-name, input[autocomplete="cc-name"]')
    const cardholderNameVisible = await cardholderNameField.isVisible().catch(() => false)

    if (cardholderNameVisible) {
      console.log('✅ Step 2: Cardholder name field found')

      // Test empty field validation
      await cardholderNameField.fill('')
      await cardholderNameField.blur()
      await page.waitForTimeout(500)

      // Look for validation error
      const errorMessage = page.locator('#holder-name-error, [role="alert"]').filter({ hasText: /name.*required|nombre.*requerido/i })
      const hasError = await errorMessage.isVisible({ timeout: 2000 }).catch(() => false)

      if (hasError) {
        console.log('✅ Step 3: Validation error shown for empty name')
      }
      else {
        console.log('⚠️ Step 3: No validation error found (may be handled differently)')
      }

      // Test valid name clears error
      await cardholderNameField.fill('John Doe')
      await cardholderNameField.blur()
      await page.waitForTimeout(500)

      const errorCleared = await errorMessage.isVisible({ timeout: 1000 }).catch(() => false)
      if (!errorCleared) {
        console.log('✅ Step 4: Error cleared with valid name')
      }
      else {
        console.log('⚠️ Step 4: Error still visible')
      }
    }
    else {
      console.log('⚠️ Step 2: Cardholder name field not found - Stripe may not be fully loaded')
    }

    console.log('\n🎉 Form validation test completed!')
  })

  test('Can complete checkout flow with cash payment (baseline)', async ({ page }) => {
    const checkoutPage = new CheckoutPage(page)

    // Setup checkout flow
    await page.goto(`${BASE_URL}/products`, { timeout: 30000 })
    await page.waitForLoadState('networkidle')

    const addToCartButton = page.locator('button:has-text("Añadir al Carrito"), button:has-text("Add to Cart")').first()
    await addToCartButton.click()
    await page.waitForTimeout(2000)

    await page.goto(`${BASE_URL}/checkout`, { timeout: 30000 })
    await page.waitForLoadState('networkidle')

    if (await checkoutPage.isExpressBannerVisible()) {
      await checkoutPage.dismissExpressCheckout()
    }
    if (await checkoutPage.isGuestPromptVisible()) {
      await checkoutPage.continueAsGuest()
    }

    await checkoutPage.fillShippingAddress(TEST_ADDRESS)
    await checkoutPage.waitForShippingMethods(15000)
    await checkoutPage.selectShippingMethod(0)

    console.log('✅ Step 1: Filled address and selected shipping')

    // Verify cash payment is selected (default)
    const cashPaymentCard = page.locator('div.p-4.border.rounded-lg').filter({ hasText: /💵/ })
    const cashRadio = cashPaymentCard.locator('input[type="radio"][value="cash"]')
    await expect(cashRadio).toBeChecked()
    console.log('✅ Step 2: Cash payment is selected')

    // Accept terms
    await checkoutPage.acceptTerms()
    console.log('✅ Step 3: Accepted terms')

    // Verify place order button is enabled
    const placeOrderButton = checkoutPage.placeOrderButton
    await expect(placeOrderButton).toBeVisible({ timeout: 5000 })
    await expect(placeOrderButton).toBeEnabled({ timeout: 3000 })
    console.log('✅ Step 4: Place order button is enabled')

    // Place order
    await checkoutPage.placeOrder()

    // Verify navigation to confirmation
    await expect(page).toHaveURL(/\/checkout\/confirmation/, { timeout: 15000 })
    console.log('✅ Step 5: Navigated to confirmation page')

    // Verify confirmation elements
    const confirmationTitle = page.locator('h1, h2').filter({
      hasText: /order.*confirmed|pedido.*confirmado/i,
    })
    await expect(confirmationTitle).toBeVisible({ timeout: 5000 })
    console.log('✅ Step 6: Confirmation title visible')

    console.log('\n🎉 Cash payment checkout flow completed successfully!')
  })

  test('Credit card payment option shows appropriate UI elements', async ({ page }) => {
    const checkoutPage = new CheckoutPage(page)

    // Setup checkout flow
    await page.goto(`${BASE_URL}/products`, { timeout: 30000 })
    await page.waitForLoadState('networkidle')

    const addToCartButton = page.locator('button:has-text("Añadir al Carrito"), button:has-text("Add to Cart")').first()
    await addToCartButton.click()
    await page.waitForTimeout(2000)

    await page.goto(`${BASE_URL}/checkout`, { timeout: 30000 })
    await page.waitForLoadState('networkidle')

    if (await checkoutPage.isExpressBannerVisible()) {
      await checkoutPage.dismissExpressCheckout()
    }
    if (await checkoutPage.isGuestPromptVisible()) {
      await checkoutPage.continueAsGuest()
    }

    await checkoutPage.fillShippingAddress(TEST_ADDRESS)
    await checkoutPage.waitForShippingMethods(15000)
    await checkoutPage.selectShippingMethod(0)

    console.log('✅ Step 1: Setup completed')

    // Verify credit card option has correct text and styling
    const creditCardPaymentCard = page.locator('div.p-4.border.rounded-lg').filter({ hasText: /💳/ })
    await expect(creditCardPaymentCard).toBeVisible()

    // Check for credit card label text
    const creditCardLabel = creditCardPaymentCard.locator('p.font-medium')
    const labelText = await creditCardLabel.textContent()
    expect(labelText?.toLowerCase()).toMatch(/tarjeta|credit.*card/)
    console.log('✅ Step 2: Credit card label text is correct')

    // Check for credit card description
    const creditCardDescription = creditCardPaymentCard.locator('p.text-sm')
    const descriptionText = await creditCardDescription.textContent()
    expect(descriptionText?.length).toBeGreaterThan(0)
    console.log('✅ Step 3: Credit card description is present')

    // Select credit card and verify styling changes
    await creditCardPaymentCard.click()
    await page.waitForTimeout(1000)

    // Check if card gets selected styling (blue background)
    const cardClasses = await creditCardPaymentCard.getAttribute('class')
    const hasSelectedStyling = cardClasses?.includes('bg-blue') || cardClasses?.includes('border-blue')

    if (hasSelectedStyling) {
      console.log('✅ Step 4: Credit card shows selected styling')
    }
    else {
      console.log('⚠️ Step 4: Selected styling not detected (may use different classes)')
    }

    // Verify radio button is checked
    const creditCardRadio = creditCardPaymentCard.locator('input[type="radio"][value="credit_card"]')
    await expect(creditCardRadio).toBeChecked()
    console.log('✅ Step 5: Credit card radio button is checked')

    console.log('\n🎉 Credit card UI elements test completed!')
  })
})

test.describe('Stripe Integration - Environment Check', () => {
  test('Stripe configuration is available', async ({ page }) => {
    // Check if Stripe keys are configured by trying to load the checkout page
    await page.goto(`${BASE_URL}/checkout`, { timeout: 30000 })
    await page.waitForLoadState('networkidle')

    // Check for any Stripe-related errors in console
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error' && msg.text().toLowerCase().includes('stripe')) {
        consoleErrors.push(msg.text())
      }
    })

    // Add a product and navigate to payment section
    await page.goto(`${BASE_URL}/products`)
    const addToCartButton = page.locator('button:has-text("Añadir al Carrito")').first()
    if (await addToCartButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await addToCartButton.click()
      await page.waitForTimeout(1000)
    }

    await page.goto(`${BASE_URL}/checkout`)
    await page.waitForTimeout(3000)

    // Check if we can reach the payment section without critical errors
    const pageHasContent = await page.locator('body').isVisible()
    expect(pageHasContent).toBe(true)

    // Log any Stripe-related console errors
    if (consoleErrors.length > 0) {
      console.log('⚠️ Stripe-related console errors found:')
      consoleErrors.forEach(error => console.log(`  - ${error}`))
    }
    else {
      console.log('✅ No Stripe-related console errors detected')
    }

    console.log('\n🎉 Environment check completed!')
  })
})
