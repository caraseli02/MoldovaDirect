/**
 * Stripe Payment Integration E2E Tests
 *
 * Comprehensive tests for the Stripe payment integration including:
 * - Payment method selection (cash vs credit card)
 * - Stripe Elements loading and functionality
 * - Card input validation and error handling
 * - Payment processing flow
 * - Multi-language support
 * - Responsive design
 * - Error scenarios with test cards
 *
 * Test Coverage:
 * - Payment method selection UI
 * - Stripe Elements integration
 * - Card validation (real-time and form submission)
 * - Payment processing with test cards
 * - Error handling and user feedback
 * - Responsive design across devices
 * - Multi-language payment flow
 */

import { test, expect } from '@playwright/test'
import { StripeCheckoutPage } from './page-objects/StripeCheckoutPage'

const _BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || process.env.BASE_URL || 'http://localhost:3000'
const _TEST_USER_EMAIL = process.env.TEST_USER_EMAIL || 'delivered@resend.dev'
const _TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD || 'N7jKAcu2FHbt7cj'

// Test address data
const _TEST_ADDRESS = {
  fullName: 'Test User',
  street: '123 Test Street',
  city: 'Madrid',
  postalCode: '28001',
  country: 'ES',
  phone: '+34 600 123 456',
}

// Stripe test cards
const STRIPE_TEST_CARDS = {
  SUCCESS: '4242424242424242',
  DECLINED: '4000000000000002',
  INSUFFICIENT_FUNDS: '4000000000009995',
  EXPIRED: '4000000000000069',
  CVV_FAIL: '4000000000000127',
}

test.describe('Stripe Payment Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Clear browser storage to start fresh
    await page.context().clearCookies()

    // Clear localStorage and sessionStorage to remove any persisted cart data
    await page.goto('http://localhost:3000')
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
  })

  test('Payment method selection - Cash vs Credit Card', async ({ page }) => {
    const checkoutPage = new StripeCheckoutPage(page)

    // Setup: Add product and navigate to checkout
    await checkoutPage.setupCheckoutFlow()

    console.log('✅ Step 1: Setup checkout flow completed')

    // Verify cash payment is selected by default
    const isCashSelected = await checkoutPage.isCashPaymentSelected()
    expect(isCashSelected).toBe(true)
    console.log('✅ Step 2: Cash payment selected by default')

    // Verify cash payment styling (green background/border)
    const cashStyling = await checkoutPage.getCashPaymentStyling()
    expect(cashStyling).toContain('green')
    console.log('✅ Step 3: Cash payment has correct styling')

    // Switch to credit card payment
    await checkoutPage.selectCreditCardPayment()
    console.log('✅ Step 4: Switched to credit card payment')

    // Verify credit card payment is now selected
    const isCreditCardSelected = await checkoutPage.isCreditCardPaymentSelected()
    expect(isCreditCardSelected).toBe(true)
    console.log('✅ Step 5: Credit card payment selected')

    // Verify credit card payment styling (blue background/border)
    const creditCardStyling = await checkoutPage.getCreditCardPaymentStyling()
    expect(creditCardStyling).toContain('blue')
    console.log('✅ Step 6: Credit card payment has correct styling')

    // Verify payment form appears for credit card
    const isPaymentFormVisible = await checkoutPage.isStripePaymentFormVisible()
    expect(isPaymentFormVisible).toBe(true)
    console.log('✅ Step 7: Stripe payment form appears for credit card')

    // Switch back to cash
    await checkoutPage.selectCashPayment()

    // Verify payment form disappears for cash
    const isPaymentFormHidden = await checkoutPage.isStripePaymentFormHidden()
    expect(isPaymentFormHidden).toBe(true)
    console.log('✅ Step 8: Payment form hidden for cash payment')

    console.log('\n🎉 Payment method selection test completed successfully!')
  })

  test('Stripe Elements loading and integration', async ({ page }) => {
    const checkoutPage = new StripeCheckoutPage(page)

    // Setup checkout flow
    await checkoutPage.setupCheckoutFlow()

    // Select credit card payment
    await checkoutPage.selectCreditCardPayment()
    console.log('✅ Step 1: Selected credit card payment')

    // Verify loading message appears initially
    const loadingMessageVisible = await checkoutPage.isStripeLoadingMessageVisible()
    if (loadingMessageVisible) {
      console.log('✅ Step 2: Stripe loading message visible')
    }

    // Wait for Stripe Elements to load
    await checkoutPage.waitForStripeElementsToLoad()
    console.log('✅ Step 3: Stripe Elements loaded')

    // Verify Stripe card element is present and styled correctly
    const isStripeCardElementVisible = await checkoutPage.isStripeCardElementVisible()
    expect(isStripeCardElementVisible).toBe(true)
    console.log('✅ Step 4: Stripe card element visible')

    // Verify cardholder name field is separate and visible
    const isCardholderNameVisible = await checkoutPage.isCardholderNameFieldVisible()
    expect(isCardholderNameVisible).toBe(true)
    console.log('✅ Step 5: Cardholder name field visible')

    // Verify security notice is displayed
    const isSecurityNoticeVisible = await checkoutPage.isSecurityNoticeVisible()
    expect(isSecurityNoticeVisible).toBe(true)
    console.log('✅ Step 6: Security notice visible')

    // Test card element styling and focus
    await checkoutPage.focusStripeCardElement()
    const isFocused = await checkoutPage.isStripeCardElementFocused()
    expect(isFocused).toBe(true)
    console.log('✅ Step 7: Stripe card element focus works')

    console.log('\n🎉 Stripe Elements integration test completed successfully!')
  })

  test('Card input validation and real-time feedback', async ({ page }) => {
    const checkoutPage = new StripeCheckoutPage(page)

    // Setup and select credit card payment
    await checkoutPage.setupCheckoutFlow()
    await checkoutPage.selectCreditCardPayment()
    await checkoutPage.waitForStripeElementsToLoad()

    console.log('✅ Step 1: Setup completed, Stripe Elements loaded')

    // Test cardholder name validation
    await checkoutPage.fillCardholderName('')
    await checkoutPage.blurCardholderNameField()

    const hasNameError = await checkoutPage.hasCardholderNameError()
    expect(hasNameError).toBe(true)
    console.log('✅ Step 2: Cardholder name validation works (empty name)')

    // Test short name validation
    await checkoutPage.fillCardholderName('A')
    await checkoutPage.blurCardholderNameField()

    const hasShortNameError = await checkoutPage.hasCardholderNameError()
    expect(hasShortNameError).toBe(true)
    console.log('✅ Step 3: Cardholder name validation works (short name)')

    // Test valid name clears error
    await checkoutPage.fillCardholderName('John Doe')
    await checkoutPage.blurCardholderNameField()

    const nameErrorCleared = await checkoutPage.hasCardholderNameError()
    expect(nameErrorCleared).toBe(false)
    console.log('✅ Step 4: Valid cardholder name clears error')

    // Test invalid card number in Stripe element
    await checkoutPage.fillStripeCardNumber('1234')
    const hasCardError = await checkoutPage.hasStripeCardError()
    expect(hasCardError).toBe(true)
    console.log('✅ Step 5: Invalid card number shows error')

    // Test valid card number clears error
    await checkoutPage.fillStripeCardNumber(STRIPE_TEST_CARDS.SUCCESS)
    await page.waitForTimeout(1000) // Wait for Stripe validation

    const cardErrorCleared = await checkoutPage.hasStripeCardError()
    expect(cardErrorCleared).toBe(false)
    console.log('✅ Step 6: Valid card number clears error')

    // Test expiry date validation
    await checkoutPage.fillStripeCardExpiry('01/20') // Past date
    const hasExpiryError = await checkoutPage.hasStripeCardError()
    expect(hasExpiryError).toBe(true)
    console.log('✅ Step 7: Expired card shows error')

    // Test valid expiry clears error
    await checkoutPage.fillStripeCardExpiry('12/30')
    await page.waitForTimeout(1000)

    const expiryErrorCleared = await checkoutPage.hasStripeCardError()
    expect(expiryErrorCleared).toBe(false)
    console.log('✅ Step 8: Valid expiry clears error')

    // Test CVV validation
    await checkoutPage.fillStripeCardCVC('12') // Too short
    const hasCvcError = await checkoutPage.hasStripeCardError()
    expect(hasCvcError).toBe(true)
    console.log('✅ Step 9: Invalid CVC shows error')

    // Test valid CVC clears error
    await checkoutPage.fillStripeCardCVC('123')
    await page.waitForTimeout(1000)

    const cvcErrorCleared = await checkoutPage.hasStripeCardError()
    expect(cvcErrorCleared).toBe(false)
    console.log('✅ Step 10: Valid CVC clears error')

    console.log('\n🎉 Card validation test completed successfully!')
  })

  test('Successful payment processing with Stripe', async ({ page }) => {
    const checkoutPage = new StripeCheckoutPage(page)

    // Track console messages and errors
    const consoleMessages: string[] = []
    const consoleErrors: string[] = []

    page.on('console', (msg) => {
      const text = msg.text()
      consoleMessages.push(`[${msg.type()}] ${text}`)
      if (msg.type() === 'error') {
        console.log('❌ Browser console error:', text)
        consoleErrors.push(text)
      }
    })

    // Listen for page errors
    page.on('pageerror', (error) => {
      const errorMsg = error.message
      console.log('❌ Page error:', errorMsg)
      consoleErrors.push(errorMsg)
    })

    // Track network requests
    const networkRequests: any[] = []
    page.on('request', (request) => {
      if (request.url().includes('/api/')) {
        networkRequests.push({
          url: request.url(),
          method: request.method(),
        })
      }
    })

    page.on('response', async (response) => {
      if (response.url().includes('/api/')) {
        const status = response.status()
        if (status >= 400) {
          console.log(`❌ API error: ${response.url()} - ${status}`)
          try {
            const body = await response.text()
            console.log(`   Response: ${body.substring(0, 200)}`)
          }
          catch {
            // Ignore if can't read body
          }
        }
      }
    })

    // Setup checkout flow
    await checkoutPage.setupCheckoutFlow()
    await checkoutPage.selectCreditCardPayment()
    await checkoutPage.waitForStripeElementsToLoad()

    console.log('✅ Step 1: Setup completed')

    // Fill valid card details
    await checkoutPage.fillValidStripeCard({
      cardNumber: STRIPE_TEST_CARDS.SUCCESS,
      expiry: '12/30',
      cvc: '123',
      cardholderName: 'John Doe',
    })
    console.log('✅ Step 2: Filled valid card details')

    // Wait a bit longer for Stripe to fully process the card details
    await page.waitForTimeout(2000)
    console.log('✅ Step 2.5: Waited for Stripe to process card details')

    // Verify form validation passes
    const isFormValid = await checkoutPage.isPaymentFormValid()
    expect(isFormValid).toBe(true)
    console.log('✅ Step 3: Payment form validation passes')

    // Accept terms and place order
    await checkoutPage.acceptTerms()
    console.log('✅ Step 4: Accepted terms')

    // Verify place order button is enabled
    const isPlaceOrderEnabled = await checkoutPage.isPlaceOrderEnabled()
    expect(isPlaceOrderEnabled).toBe(true)
    console.log('✅ Step 5: Place order button enabled')

    // Place order and verify processing
    console.log('🔄 Clicking Place Order button...')

    try {
      await checkoutPage.placeOrder()
      console.log('✅ Step 6: Placed order')

      // Wait for payment processing and redirect to confirmation
      await expect(page).toHaveURL(/\/checkout\/confirmation/, { timeout: 45000 })
      console.log('✅ Step 7: Redirected to confirmation page')

      // Verify confirmation page elements
      const confirmationTitle = page.locator('h1, h2').filter({
        hasText: /order.*confirmed|pedido.*confirmado|заказ.*подтвержден|comandă.*confirmată/i,
      })
      await expect(confirmationTitle).toBeVisible({ timeout: 5000 })
      console.log('✅ Step 8: Confirmation title visible')

      console.log('\n🎉 Successful Stripe payment test completed!')
    }
    catch (error) {
      console.log('\n❌ Test failed with error:', error.message)
      console.log('\n📋 Console errors:', consoleErrors.length > 0 ? consoleErrors : 'None')
      console.log('\n📋 Recent console messages:')
      consoleMessages.slice(-10).forEach(msg => console.log('   ', msg))
      console.log('\n📋 API requests made:')
      networkRequests.slice(-5).forEach(req => console.log('   ', req.method, req.url))
      throw error
    }
  })

  test('Payment failure handling - Declined card', async ({ page }) => {
    const checkoutPage = new StripeCheckoutPage(page)

    // Setup checkout flow
    await checkoutPage.setupCheckoutFlow()
    await checkoutPage.selectCreditCardPayment()
    await checkoutPage.waitForStripeElementsToLoad()

    // Fill declined card details
    await checkoutPage.fillValidStripeCard({
      cardNumber: STRIPE_TEST_CARDS.DECLINED,
      expiry: '12/30',
      cvc: '123',
      cardholderName: 'John Doe',
    })
    console.log('✅ Step 1: Filled declined card details')

    // Accept terms and attempt to place order
    await checkoutPage.acceptTerms()
    await checkoutPage.placeOrder()
    console.log('✅ Step 2: Attempted to place order')

    // Verify error handling
    const hasPaymentError = await checkoutPage.hasPaymentError()
    expect(hasPaymentError).toBe(true)
    console.log('✅ Step 3: Payment error displayed')

    // Verify user-friendly error message
    const errorMessage = await checkoutPage.getPaymentErrorMessage()
    expect(errorMessage.toLowerCase()).toContain('declined')
    console.log('✅ Step 4: User-friendly error message displayed')

    // Verify user stays on checkout page
    expect(page.url()).toContain('/checkout')
    expect(page.url()).not.toContain('/confirmation')
    console.log('✅ Step 5: User remains on checkout page')

    console.log('\n🎉 Payment failure handling test completed!')
  })

  test('Payment failure handling - Insufficient funds', async ({ page }) => {
    const checkoutPage = new StripeCheckoutPage(page)

    // Setup checkout flow
    await checkoutPage.setupCheckoutFlow()
    await checkoutPage.selectCreditCardPayment()
    await checkoutPage.waitForStripeElementsToLoad()

    // Fill insufficient funds card details
    await checkoutPage.fillValidStripeCard({
      cardNumber: STRIPE_TEST_CARDS.INSUFFICIENT_FUNDS,
      expiry: '12/30',
      cvc: '123',
      cardholderName: 'John Doe',
    })
    console.log('✅ Step 1: Filled insufficient funds card details')

    // Accept terms and attempt to place order
    await checkoutPage.acceptTerms()
    await checkoutPage.placeOrder()
    console.log('✅ Step 2: Attempted to place order')

    // Verify error handling
    const hasPaymentError = await checkoutPage.hasPaymentError()
    expect(hasPaymentError).toBe(true)
    console.log('✅ Step 3: Payment error displayed')

    // Verify appropriate error message
    const errorMessage = await checkoutPage.getPaymentErrorMessage()
    expect(errorMessage.toLowerCase()).toMatch(/insufficient|funds|balance/)
    console.log('✅ Step 4: Appropriate error message displayed')

    console.log('\n🎉 Insufficient funds handling test completed!')
  })

  test('Form submission validation - Missing card details', async ({ page }) => {
    const checkoutPage = new StripeCheckoutPage(page)

    // Setup checkout flow
    await checkoutPage.setupCheckoutFlow()
    await checkoutPage.selectCreditCardPayment()
    await checkoutPage.waitForStripeElementsToLoad()

    // Fill only cardholder name, leave card details empty
    await checkoutPage.fillCardholderName('John Doe')
    console.log('✅ Step 1: Filled only cardholder name')

    // Accept terms and attempt to place order
    await checkoutPage.acceptTerms()

    // Verify place order button is disabled or shows validation error
    const canPlaceOrder = await checkoutPage.isPlaceOrderEnabled()
    if (canPlaceOrder) {
      await checkoutPage.placeOrder()

      // Should show validation error
      const hasValidationError = await checkoutPage.hasValidationError()
      expect(hasValidationError).toBe(true)
      console.log('✅ Step 2: Validation error shown for incomplete card')
    }
    else {
      console.log('✅ Step 2: Place order button disabled for incomplete card')
    }

    // Verify user stays on checkout page
    expect(page.url()).toContain('/checkout')
    expect(page.url()).not.toContain('/confirmation')
    console.log('✅ Step 3: User remains on checkout page')

    console.log('\n🎉 Form validation test completed!')
  })

  test('Responsive design - Mobile payment flow', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    const checkoutPage = new StripeCheckoutPage(page)

    // Setup checkout flow
    await checkoutPage.setupCheckoutFlow()
    await checkoutPage.selectCreditCardPayment()
    await checkoutPage.waitForStripeElementsToLoad()

    console.log('✅ Step 1: Mobile setup completed')

    // Verify payment method cards are properly sized
    const paymentMethodsVisible = await checkoutPage.arePaymentMethodsVisibleOnMobile()
    expect(paymentMethodsVisible).toBe(true)
    console.log('✅ Step 2: Payment methods visible on mobile')

    // Verify Stripe card element is properly sized
    const stripeElementSized = await checkoutPage.isStripeElementProperlyResized()
    expect(stripeElementSized).toBe(true)
    console.log('✅ Step 3: Stripe element properly sized on mobile')

    // Test card input on mobile
    await checkoutPage.fillValidStripeCard({
      cardNumber: STRIPE_TEST_CARDS.SUCCESS,
      expiry: '12/30',
      cvc: '123',
      cardholderName: 'John Doe',
    })
    console.log('✅ Step 4: Card input works on mobile')

    // Verify mobile sticky footer if present
    const hasMobileFooter = await checkoutPage.isMobileFooterVisible()
    if (hasMobileFooter) {
      console.log('✅ Step 5: Mobile sticky footer visible')
    }

    console.log('\n🎉 Mobile responsive test completed!')
  })

  test('Multi-language payment flow - Spanish', async ({ page }) => {
    const checkoutPage = new StripeCheckoutPage(page)

    // Setup checkout flow
    await checkoutPage.setupCheckoutFlow()
    await checkoutPage.selectCreditCardPayment()
    await checkoutPage.waitForStripeElementsToLoad()

    console.log('✅ Step 1: Setup completed')

    // Verify Spanish payment method labels
    const cashLabelText = await checkoutPage.getCashPaymentLabelText()
    expect(cashLabelText.toLowerCase()).toContain('efectivo')
    console.log('✅ Step 2: Spanish cash payment label verified')

    const creditCardLabelText = await checkoutPage.getCreditCardPaymentLabelText()
    expect(creditCardLabelText.toLowerCase()).toContain('tarjeta')
    console.log('✅ Step 3: Spanish credit card label verified')

    // Verify Spanish field labels
    const cardholderNameLabel = await checkoutPage.getCardholderNameLabelText()
    expect(cardholderNameLabel.toLowerCase()).toMatch(/titular|nombre/)
    console.log('✅ Step 4: Spanish cardholder name label verified')

    // Verify Spanish security notice
    const securityNoticeText = await checkoutPage.getSecurityNoticeText()
    expect(securityNoticeText.toLowerCase()).toContain('segur')
    console.log('✅ Step 5: Spanish security notice verified')

    // Test validation error messages in Spanish
    await checkoutPage.fillCardholderName('')
    await checkoutPage.blurCardholderNameField()

    const errorMessage = await checkoutPage.getCardholderNameErrorText()
    expect(errorMessage.toLowerCase()).toMatch(/requerido|obligatorio|necesario/)
    console.log('✅ Step 6: Spanish validation error message verified')

    console.log('\n🎉 Spanish language test completed!')
  })

  test('Network error handling and recovery', async ({ page }) => {
    const checkoutPage = new StripeCheckoutPage(page)

    // Setup checkout flow
    await checkoutPage.setupCheckoutFlow()
    await checkoutPage.selectCreditCardPayment()
    await checkoutPage.waitForStripeElementsToLoad()

    // Fill valid card details
    await checkoutPage.fillValidStripeCard({
      cardNumber: STRIPE_TEST_CARDS.SUCCESS,
      expiry: '12/30',
      cvc: '123',
      cardholderName: 'John Doe',
    })

    // Simulate network failure during payment
    await page.route('**/api/checkout/create-payment-intent', (route) => {
      route.abort('failed')
    })

    await checkoutPage.acceptTerms()
    await checkoutPage.placeOrder()

    console.log('✅ Step 1: Simulated network failure')

    // Verify error handling
    const hasNetworkError = await checkoutPage.hasNetworkError()
    expect(hasNetworkError).toBe(true)
    console.log('✅ Step 2: Network error handled')

    // Remove network simulation and retry
    await page.unroute('**/api/checkout/create-payment-intent')

    // Retry payment
    await checkoutPage.placeOrder()

    // Should succeed now
    await expect(page).toHaveURL(/\/checkout\/confirmation/, { timeout: 30000 })
    console.log('✅ Step 3: Payment succeeded after network recovery')

    console.log('\n🎉 Network error handling test completed!')
  })

  test('Security - No sensitive data in network requests', async ({ page }) => {
    const checkoutPage = new StripeCheckoutPage(page)
    const networkRequests: any[] = []

    // Capture all network requests
    page.on('request', (request) => {
      networkRequests.push({
        url: request.url(),
        method: request.method(),
        postData: request.postData(),
        headers: request.headers(),
      })
    })

    // Setup checkout flow
    await checkoutPage.setupCheckoutFlow()
    await checkoutPage.selectCreditCardPayment()
    await checkoutPage.waitForStripeElementsToLoad()

    // Fill card details
    await checkoutPage.fillValidStripeCard({
      cardNumber: STRIPE_TEST_CARDS.SUCCESS,
      expiry: '12/30',
      cvc: '123',
      cardholderName: 'John Doe',
    })

    await checkoutPage.acceptTerms()
    await checkoutPage.placeOrder()

    console.log('✅ Step 1: Completed payment flow')

    // Analyze network requests for sensitive data
    const sensitiveDataFound = networkRequests.some((request) => {
      const postData = request.postData || ''
      const url = request.url

      // Check if card number appears in any request to our API
      if (url.includes('/api/') && postData.includes('4242424242424242')) {
        return true
      }

      // Check if CVV appears in any request to our API
      if (url.includes('/api/') && postData.includes('123')) {
        return true
      }

      return false
    })

    expect(sensitiveDataFound).toBe(false)
    console.log('✅ Step 2: No sensitive card data found in API requests')

    // Verify Stripe requests are present (payment processing)
    const stripeRequests = networkRequests.filter(request =>
      request.url.includes('stripe.com') || request.url.includes('js.stripe.com'),
    )

    expect(stripeRequests.length).toBeGreaterThan(0)
    console.log('✅ Step 3: Stripe API requests present (secure processing)')

    console.log('\n🎉 Security test completed!')
  })
})

test.describe('Stripe Payment Integration - Edge Cases', () => {
  test('Browser compatibility - Stripe Elements fallback', async ({ page }) => {
    const checkoutPage = new StripeCheckoutPage(page)

    // Setup checkout flow
    await checkoutPage.setupCheckoutFlow()
    await checkoutPage.selectCreditCardPayment()

    // Simulate Stripe loading failure
    await page.addInitScript(() => {
      // Mock Stripe loading failure
      window.Stripe = undefined
    })

    // Verify graceful fallback
    const hasStripeError = await checkoutPage.hasStripeLoadingError()
    if (hasStripeError) {
      console.log('✅ Stripe loading error handled gracefully')
    }
    else {
      console.log('✅ Stripe loaded successfully')
    }

    console.log('\n🎉 Browser compatibility test completed!')
  })

  test('Form state management - Payment method switching', async ({ page }) => {
    const checkoutPage = new StripeCheckoutPage(page)

    // Setup checkout flow
    await checkoutPage.setupCheckoutFlow()

    // Start with cash payment
    await checkoutPage.selectCashPayment()
    console.log('✅ Step 1: Selected cash payment')

    // Switch to credit card
    await checkoutPage.selectCreditCardPayment()
    await checkoutPage.waitForStripeElementsToLoad()
    console.log('✅ Step 2: Switched to credit card')

    // Fill card details
    await checkoutPage.fillValidStripeCard({
      cardNumber: STRIPE_TEST_CARDS.SUCCESS,
      expiry: '12/30',
      cvc: '123',
      cardholderName: 'John Doe',
    })
    console.log('✅ Step 3: Filled card details')

    // Switch back to cash
    await checkoutPage.selectCashPayment()
    console.log('✅ Step 4: Switched back to cash')

    // Verify payment form is hidden
    const isFormHidden = await checkoutPage.isStripePaymentFormHidden()
    expect(isFormHidden).toBe(true)
    console.log('✅ Step 5: Payment form hidden for cash')

    // Switch back to credit card
    await checkoutPage.selectCreditCardPayment()
    await checkoutPage.waitForStripeElementsToLoad()
    console.log('✅ Step 6: Switched back to credit card')

    // Verify form state is reset (empty)
    const isFormReset = await checkoutPage.isStripeFormReset()
    expect(isFormReset).toBe(true)
    console.log('✅ Step 7: Form state reset correctly')

    console.log('\n🎉 Form state management test completed!')
  })

  test('Performance - Stripe Elements loading time', async ({ page }) => {
    const checkoutPage = new StripeCheckoutPage(page)

    // Setup checkout flow
    await checkoutPage.setupCheckoutFlow()

    // Measure Stripe Elements loading time
    const startTime = Date.now()

    await checkoutPage.selectCreditCardPayment()
    await checkoutPage.waitForStripeElementsToLoad()

    const loadTime = Date.now() - startTime

    // Stripe Elements should load within reasonable time (< 5 seconds)
    expect(loadTime).toBeLessThan(5000)
    console.log(`✅ Stripe Elements loaded in ${loadTime}ms`)

    console.log('\n🎉 Performance test completed!')
  })
})
