/**
 * Extended Page Object Model: Stripe Checkout Page
 *
 * Extends the base CheckoutPage with Stripe-specific functionality
 * for comprehensive testing of the Stripe payment integration.
 *
 * Includes methods for:
 * - Stripe Elements interaction
 * - Card validation testing
 * - Payment processing
 * - Error handling
 * - Multi-language support
 * - Responsive design testing
 */

import { type Page, type Locator, expect } from '@playwright/test'
import { CheckoutPage } from './CheckoutPage'

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || process.env.BASE_URL || 'http://localhost:3000'
const TEST_ADDRESS = {
  fullName: 'Test User',
  street: '123 Test Street',
  city: 'Madrid',
  postalCode: '28001',
  country: 'ES',
  phone: '+34 600 123 456',
}

export class StripeCheckoutPage extends CheckoutPage {
  // ===========================================
  // Stripe-specific Elements
  // ===========================================
  readonly stripeCardContainer: Locator
  readonly stripeCardElement: Locator
  readonly stripeLoadingMessage: Locator
  readonly cardholderNameField: Locator
  readonly cardholderNameError: Locator
  readonly stripeErrorMessage: Locator
  readonly securityNotice: Locator
  readonly securityNoticeTitle: Locator
  readonly securityNoticeDescription: Locator

  // Payment method selection elements
  readonly cashPaymentCard: Locator
  readonly creditCardPaymentCard: Locator
  readonly cashPaymentLabel: Locator
  readonly creditCardPaymentLabel: Locator
  readonly paymentFormContainer: Locator

  // Error and validation elements
  readonly paymentErrorMessage: Locator
  readonly validationErrorMessage: Locator
  readonly networkErrorMessage: Locator

  constructor(page: Page) {
    super(page)

    // Stripe Elements
    this.stripeCardContainer = page.locator('.stripe-card-element')
    this.stripeCardElement = page.locator('iframe[name^="__privateStripeFrame"]')
    this.stripeLoadingMessage = page.locator('text=/Loading secure payment form/i')
    this.cardholderNameField = page.locator('#cardholder-name, input[autocomplete="cc-name"]')
    this.cardholderNameError = page.locator('#holder-name-error')
    this.stripeErrorMessage = page.locator('.stripe-card-element + p[role="alert"]')

    // Security notice
    this.securityNotice = page.locator('.bg-green-50, .bg-green-900\\/20').filter({ hasText: /secure.*payment/i })
    this.securityNoticeTitle = this.securityNotice.locator('h3')
    this.securityNoticeDescription = this.securityNotice.locator('p')

    // Payment method cards - more specific selectors
    this.cashPaymentCard = page.locator('div.p-4.border.rounded-lg').filter({ hasText: /💵/ })
    this.creditCardPaymentCard = page.locator('div.p-4.border.rounded-lg').filter({ hasText: /💳/ })
    this.cashPaymentLabel = this.cashPaymentCard.locator('p.font-medium')
    this.creditCardPaymentLabel = this.creditCardPaymentCard.locator('p.font-medium')
    this.paymentFormContainer = page.locator('div.mt-6').filter({ has: page.locator('[ref="paymentFormRef"]') })

    // Error messages
    this.paymentErrorMessage = page.locator('[role="alert"]').filter({ hasText: /payment.*failed|declined|insufficient/i })
    this.validationErrorMessage = page.locator('[role="alert"]').filter({ hasText: /validation.*error|check.*information/i })
    this.networkErrorMessage = page.locator('[role="alert"]').filter({ hasText: /network.*error|connection.*error/i })
  }

  // ===========================================
  // Setup and Navigation Methods
  // ===========================================

  /**
   * Complete setup flow: add product to cart and navigate to checkout
   */
  async setupCheckoutFlow() {
    // Add product to cart
    await this.page.goto(`${BASE_URL}/products`, { timeout: 30000 })
    await this.page.waitForLoadState('networkidle')

    const addToCartButton = this.page.locator('button:has-text("Añadir al Carrito"), button:has-text("Add to Cart")').first()
    await expect(addToCartButton).toBeVisible({ timeout: 15000 })
    await addToCartButton.click()
    await this.page.waitForTimeout(2000)

    // Navigate to checkout
    await this.page.goto(`${BASE_URL}/checkout`, { timeout: 30000 })
    await this.page.waitForLoadState('networkidle')

    // Handle express checkout and guest prompts
    if (await this.isExpressBannerVisible()) {
      await this.dismissExpressCheckout()
    }
    if (await this.isGuestPromptVisible()) {
      await this.continueAsGuest()
    }

    // Fill shipping address
    await this.fillShippingAddress(TEST_ADDRESS)
    await this.waitForShippingMethods(15000)
    await this.selectShippingMethod(0)
  }

  // ===========================================
  // Payment Method Selection Methods
  // ===========================================

  /**
   * Select credit card payment method
   */
  async selectCreditCardPayment() {
    await this.creditCardPaymentCard.click()
    await this.page.waitForTimeout(500)
  }

  /**
   * Check if cash payment is selected
   */
  async isCashPaymentSelected(): Promise<boolean> {
    const cashRadio = this.cashPaymentCard.locator('input[type="radio"][value="cash"]')
    return await cashRadio.isChecked()
  }

  /**
   * Check if credit card payment is selected
   */
  async isCreditCardPaymentSelected(): Promise<boolean> {
    const creditCardRadio = this.creditCardPaymentCard.locator('input[type="radio"][value="credit_card"]')
    return await creditCardRadio.isChecked()
  }

  /**
   * Get cash payment card styling classes
   */
  async getCashPaymentStyling(): Promise<string> {
    return await this.cashPaymentCard.getAttribute('class') || ''
  }

  /**
   * Get credit card payment card styling classes
   */
  async getCreditCardPaymentStyling(): Promise<string> {
    return await this.creditCardPaymentCard.getAttribute('class') || ''
  }

  /**
   * Get cash payment label text
   */
  async getCashPaymentLabelText(): Promise<string> {
    return await this.cashPaymentLabel.textContent() || ''
  }

  /**
   * Get credit card payment label text
   */
  async getCreditCardPaymentLabelText(): Promise<string> {
    return await this.creditCardPaymentLabel.textContent() || ''
  }

  // ===========================================
  // Stripe Elements Methods
  // ===========================================

  /**
   * Check if Stripe loading message is visible
   */
  async isStripeLoadingMessageVisible(): Promise<boolean> {
    return await this.stripeLoadingMessage.isVisible({ timeout: 2000 }).catch(() => false)
  }

  /**
   * Wait for Stripe Elements to load completely
   */
  async waitForStripeElementsToLoad(timeout: number = 10000) {
    // Wait for loading message to disappear
    await expect(this.stripeLoadingMessage).not.toBeVisible({ timeout })

    // Wait for Stripe card container to be visible
    await expect(this.stripeCardContainer).toBeVisible({ timeout })

    // Wait for Stripe iframe to load
    await this.page.waitForTimeout(2000)
  }

  /**
   * Check if Stripe card element is visible
   */
  async isStripeCardElementVisible(): Promise<boolean> {
    return await this.stripeCardContainer.isVisible()
  }

  /**
   * Check if Stripe payment form is visible
   */
  async isStripePaymentFormVisible(): Promise<boolean> {
    // Check if the payment form container is visible (appears when credit card is selected)
    const paymentFormVisible = await this.page.locator('div.mt-6').filter({
      has: this.page.locator('.stripe-card-element'),
    }).isVisible({ timeout: 3000 }).catch(() => false)

    return paymentFormVisible
  }

  /**
   * Check if Stripe payment form is hidden
   */
  async isStripePaymentFormHidden(): Promise<boolean> {
    return !(await this.isStripePaymentFormVisible())
  }

  /**
   * Focus on Stripe card element
   */
  async focusStripeCardElement() {
    await this.stripeCardContainer.click()
    await this.page.waitForTimeout(500)
  }

  /**
   * Check if Stripe card element is focused
   */
  async isStripeCardElementFocused(): Promise<boolean> {
    const focusedClass = await this.stripeCardContainer.getAttribute('class')
    return focusedClass?.includes('focus') || false
  }

  /**
   * Fill Stripe card number (interacts with Stripe iframe)
   */
  async fillStripeCardNumber(cardNumber: string) {
    // Click on the Stripe card container to focus
    await this.stripeCardContainer.click()

    // Type the card number
    await this.page.keyboard.type(cardNumber)
    await this.page.waitForTimeout(500)
  }

  /**
   * Fill Stripe card expiry (interacts with Stripe iframe)
   */
  async fillStripeCardExpiry(expiry: string) {
    // Tab to expiry field or click if separate
    await this.page.keyboard.press('Tab')
    await this.page.keyboard.type(expiry)
    await this.page.waitForTimeout(500)
  }

  /**
   * Fill Stripe card CVC (interacts with Stripe iframe)
   */
  async fillStripeCardCVC(cvc: string) {
    // Tab to CVC field
    await this.page.keyboard.press('Tab')
    await this.page.keyboard.type(cvc)
    await this.page.waitForTimeout(500)
  }

  /**
   * Check if Stripe card element has error
   */
  async hasStripeCardError(): Promise<boolean> {
    // Check for error styling on container
    const containerClass = await this.stripeCardContainer.getAttribute('class')
    if (containerClass?.includes('border-red')) {
      return true
    }

    // Check for error message
    return await this.stripeErrorMessage.isVisible({ timeout: 1000 }).catch(() => false)
  }

  /**
   * Check if Stripe form is reset (empty)
   */
  async isStripeFormReset(): Promise<boolean> {
    // Click on card element and check if it's empty
    await this.stripeCardContainer.click()
    await this.page.keyboard.selectAll()
    const selectedText = await this.page.evaluate(() => window.getSelection()?.toString() || '')
    return selectedText.trim() === ''
  }

  // ===========================================
  // Cardholder Name Methods
  // ===========================================

  /**
   * Check if cardholder name field is visible
   */
  async isCardholderNameFieldVisible(): Promise<boolean> {
    return await this.cardholderNameField.isVisible()
  }

  /**
   * Fill cardholder name
   */
  async fillCardholderName(name: string) {
    await this.cardholderNameField.fill(name)
  }

  /**
   * Blur cardholder name field
   */
  async blurCardholderNameField() {
    await this.cardholderNameField.blur()
    await this.page.waitForTimeout(300)
  }

  /**
   * Check if cardholder name has error
   */
  async hasCardholderNameError(): Promise<boolean> {
    return await this.cardholderNameError.isVisible({ timeout: 1000 }).catch(() => false)
  }

  /**
   * Get cardholder name error text
   */
  async getCardholderNameErrorText(): Promise<string> {
    return await this.cardholderNameError.textContent() || ''
  }

  /**
   * Get cardholder name label text
   */
  async getCardholderNameLabelText(): Promise<string> {
    const label = this.page.locator('label[for="cardholder-name"]')
    return await label.textContent() || ''
  }

  // ===========================================
  // Security Notice Methods
  // ===========================================

  /**
   * Check if security notice is visible
   */
  async isSecurityNoticeVisible(): Promise<boolean> {
    return await this.securityNotice.isVisible()
  }

  /**
   * Get security notice text
   */
  async getSecurityNoticeText(): Promise<string> {
    return await this.securityNoticeDescription.textContent() || ''
  }

  // ===========================================
  // Form Validation Methods
  // ===========================================

  /**
   * Fill valid Stripe card details
   */
  async fillValidStripeCard(cardDetails: {
    cardNumber: string
    expiry: string
    cvc: string
    cardholderName: string
  }) {
    // Fill cardholder name first
    await this.fillCardholderName(cardDetails.cardholderName)

    // Fill Stripe card details
    await this.fillStripeCardNumber(cardDetails.cardNumber)
    await this.fillStripeCardExpiry(cardDetails.expiry)
    await this.fillStripeCardCVC(cardDetails.cvc)

    // Wait for validation
    await this.page.waitForTimeout(1000)
  }

  /**
   * Check if payment form is valid
   */
  async isPaymentFormValid(): Promise<boolean> {
    const hasCardholderNameError = await this.hasCardholderNameError()
    const hasStripeError = await this.hasStripeCardError()

    return !hasCardholderNameError && !hasStripeError
  }

  /**
   * Check if validation error is present
   */
  async hasValidationError(): Promise<boolean> {
    return await this.validationErrorMessage.isVisible({ timeout: 3000 }).catch(() => false)
  }

  // ===========================================
  // Payment Processing Methods
  // ===========================================

  /**
   * Check if payment error occurred
   */
  async hasPaymentError(): Promise<boolean> {
    return await this.paymentErrorMessage.isVisible({ timeout: 10000 }).catch(() => false)
  }

  /**
   * Get payment error message text
   */
  async getPaymentErrorMessage(): Promise<string> {
    return await this.paymentErrorMessage.textContent() || ''
  }

  /**
   * Check if network error occurred
   */
  async hasNetworkError(): Promise<boolean> {
    return await this.networkErrorMessage.isVisible({ timeout: 5000 }).catch(() => false)
  }

  /**
   * Check if Stripe loading error occurred
   */
  async hasStripeLoadingError(): Promise<boolean> {
    const errorText = this.page.locator('text=/Stripe.*not.*available|failed.*to.*load/i')
    return await errorText.isVisible({ timeout: 3000 }).catch(() => false)
  }

  // ===========================================
  // Responsive Design Methods
  // ===========================================

  /**
   * Check if payment methods are visible on mobile
   */
  async arePaymentMethodsVisibleOnMobile(): Promise<boolean> {
    const cashVisible = await this.cashPaymentCard.isVisible()
    const creditCardVisible = await this.creditCardPaymentCard.isVisible()
    return cashVisible && creditCardVisible
  }

  /**
   * Check if Stripe element is properly resized for mobile
   */
  async isStripeElementProperlyResized(): Promise<boolean> {
    const containerBox = await this.stripeCardContainer.boundingBox()
    if (!containerBox) return false

    // Check if container width is reasonable for mobile (not too wide)
    return containerBox.width <= 400 && containerBox.width >= 250
  }

  // ===========================================
  // Accessibility Methods
  // ===========================================

  /**
   * Check if payment form has proper ARIA labels
   */
  async hasProperAriaLabels(): Promise<boolean> {
    const cardholderNameLabel = await this.cardholderNameField.getAttribute('aria-label')
    const cardholderNameDescribedBy = await this.cardholderNameField.getAttribute('aria-describedby')

    return !!(cardholderNameLabel || cardholderNameDescribedBy)
  }

  /**
   * Check if error messages have proper ARIA roles
   */
  async hasProperErrorAria(): Promise<boolean> {
    if (await this.hasCardholderNameError()) {
      const errorRole = await this.cardholderNameError.getAttribute('role')
      return errorRole === 'alert'
    }
    return true
  }

  // ===========================================
  // Performance Methods
  // ===========================================

  /**
   * Measure Stripe Elements loading time
   */
  async measureStripeLoadingTime(): Promise<number> {
    const startTime = Date.now()
    await this.waitForStripeElementsToLoad()
    return Date.now() - startTime
  }

  // ===========================================
  // Debug and Utility Methods
  // ===========================================

  /**
   * Take screenshot of payment section
   */
  async screenshotPaymentSection(filename: string) {
    const paymentSection = this.page.locator('.checkout-section').filter({ hasText: /payment/i })
    await paymentSection.screenshot({ path: `test-results/${filename}` })
  }

  /**
   * Get all visible error messages
   */
  async getAllErrorMessages(): Promise<string[]> {
    const errorElements = this.page.locator('[role="alert"]:visible')
    const count = await errorElements.count()
    const errors: string[] = []

    for (let i = 0; i < count; i++) {
      const text = await errorElements.nth(i).textContent()
      if (text) errors.push(text)
    }

    return errors
  }

  /**
   * Log current form state for debugging
   */
  async logFormState() {
    const isCashSelected = await this.isCashPaymentSelected()
    const isCreditCardSelected = await this.isCreditCardPaymentSelected()
    const isStripeFormVisible = await this.isStripePaymentFormVisible()
    const hasErrors = await this.hasValidationError()

    console.log('Form State:', {
      cashSelected: isCashSelected,
      creditCardSelected: isCreditCardSelected,
      stripeFormVisible: isStripeFormVisible,
      hasErrors: hasErrors,
    })
  }
}
