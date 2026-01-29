/**
 * Page Object Model: Checkout Page
 *
 * Encapsulates all interactions with the hybrid single-page checkout,
 * including express checkout banner, form sections, and order placement.
 *
 * Updated for Hybrid Progressive Checkout (Option D)
 */

import { type Page, type Locator, expect } from '@playwright/test'

export class CheckoutPage {
  readonly page: Page

  // ===========================================
  // Express Checkout Banner Elements (Enhanced)
  // ===========================================
  readonly expressBanner: Locator
  readonly expressBannerTitle: Locator
  readonly expressSavedAddress: Locator
  readonly expressShippingMethod: Locator
  readonly expressOrderTotal: Locator
  readonly expressPlaceOrderButton: Locator
  readonly expressEditButton: Locator

  // ===========================================
  // Guest Checkout Elements
  // ===========================================
  readonly guestCheckoutPrompt: Locator
  readonly continueAsGuestButton: Locator
  readonly guestEmailInput: Locator
  readonly guestEmailUpdatesCheckbox: Locator

  // ===========================================
  // Checkout Sections (Single Page)
  // ===========================================
  readonly checkoutFormContainer: Locator
  readonly contactSection: Locator
  readonly addressSection: Locator
  readonly shippingMethodSection: Locator
  readonly paymentSection: Locator
  readonly instructionsSection: Locator
  readonly placeOrderSection: Locator

  // Section completion indicators
  readonly addressSectionComplete: Locator
  readonly shippingSectionComplete: Locator
  readonly paymentSectionComplete: Locator

  // ===========================================
  // Address Form Elements
  // ===========================================
  readonly addressForm: Locator
  readonly addressFields: {
    fullName: Locator
    street: Locator
    city: Locator
    postalCode: Locator
    country: Locator
    phone: Locator
  }

  readonly savedAddressSelect: Locator

  // ===========================================
  // Shipping Method Elements
  // ===========================================
  readonly shippingMethodOptions: Locator
  readonly shippingMethodError: Locator
  readonly shippingMethodLoading: Locator

  // ===========================================
  // Payment Elements
  // ===========================================
  readonly cashPaymentOption: Locator
  readonly creditCardOption: Locator
  readonly paypalOption: Locator

  // ===========================================
  // Delivery Instructions
  // ===========================================
  readonly deliveryInstructions: Locator

  // ===========================================
  // Terms & Place Order Elements
  // ===========================================
  readonly termsCheckbox: Locator
  readonly privacyCheckbox: Locator
  readonly marketingCheckbox: Locator
  readonly placeOrderButton: Locator

  // ===========================================
  // Order Summary (Sticky Sidebar)
  // ===========================================
  readonly orderSummary: Locator
  readonly orderSummaryItems: Locator
  readonly orderSummarySubtotal: Locator
  readonly orderSummaryShipping: Locator
  readonly orderSummaryTotal: Locator
  readonly orderSummaryItemCount: Locator

  // ===========================================
  // Mobile Elements
  // ===========================================
  readonly mobileStickyFooter: Locator
  readonly mobilePlaceOrderButton: Locator
  readonly mobileOrderTotal: Locator

  // ===========================================
  // Feedback Elements
  // ===========================================
  readonly toast: Locator
  readonly loadingSpinner: Locator
  readonly errorMessage: Locator
  readonly validationError: Locator

  // ===========================================
  // Trust Badges
  // ===========================================
  readonly trustBadges: Locator

  constructor(page: Page) {
    this.page = page

    // Express Checkout Banner (Enhanced)
    this.expressBanner = page.locator('[class*="ExpressCheckoutBanner"], [data-testid="express-checkout-banner"]')
    this.expressBannerTitle = this.expressBanner.locator('h3, [class*="title"]').first()
    this.expressSavedAddress = this.expressBanner.locator('[class*="address"], [data-testid="saved-address"]')
    this.expressShippingMethod = this.expressBanner.locator('[class*="shipping"], [data-testid="shipping-method"]')
    this.expressOrderTotal = this.expressBanner.locator('[class*="total"], [data-testid="order-total"]')
    this.expressPlaceOrderButton = this.expressBanner.locator('button:has-text("Place Order Now"), button:has-text("Realizar Pedido Ahora"), button:has-text("Оформить заказ"), button:has-text("Plasează comanda")')
    this.expressEditButton = this.expressBanner.locator('[data-testid="express-edit-button"], button:has-text("Edit Details"), button:has-text("Edit"), button:has-text("Editar"), button:has-text("Editar detalles"), button:has-text("Редактировать"), button:has-text("Editează")')

    // Guest Checkout
    this.guestCheckoutPrompt = page.locator('[class*="GuestCheckoutPrompt"], [data-testid="guest-checkout-prompt"]')
    this.continueAsGuestButton = page.locator('button:has-text("Continue as Guest"), button:has-text("Continuar como Invitado"), button:has-text("Продолжить как гость"), button:has-text("Continuă ca invitat")')
    this.guestEmailInput = page.locator('input[type="email"][name="email"], input[id="guest-email"]')
    this.guestEmailUpdatesCheckbox = page.locator('input[type="checkbox"][name*="update"], input[type="checkbox"][name*="newsletter"], input[id="email-updates"]')

    // Checkout Form Container
    this.checkoutFormContainer = page.locator('.checkout-form-container, [data-testid="checkout-form"]')

    // Checkout Sections (by section class and number)
    this.contactSection = page.locator('.checkout-section').filter({ hasText: /contact|contacto|контакт|contact/i }).first()
    this.addressSection = page.locator('.checkout-section').filter({ hasText: /shipping address|dirección|адрес|adresă/i }).first()
    this.shippingMethodSection = page.locator('.checkout-section').filter({ hasText: /shipping method|método de envío|способ доставки|metodă de livrare/i }).first()
    this.paymentSection = page.locator('.checkout-section').filter({ hasText: /payment|pago|оплата|plată/i }).first()
    this.instructionsSection = page.locator('.checkout-section').filter({ hasText: /instructions|instrucciones|инструкции|instrucțiuni/i }).first()
    this.placeOrderSection = page.locator('.checkout-section.checkout-section-highlight, [data-testid="place-order-section"]')

    // Section completion indicators (checkmark icons)
    this.addressSectionComplete = this.addressSection.locator('.section-complete')
    this.shippingSectionComplete = this.shippingMethodSection.locator('.section-complete')
    this.paymentSectionComplete = this.paymentSection.locator('.section-complete')

    // Address Form - Hybrid Checkout uses single fullName field (split by component)
    this.addressForm = page.locator('[class*="AddressForm"], [data-testid="address-form"]')
    this.addressFields = {
      fullName: page.locator('#fullName'),
      street: page.locator('#street'),
      city: page.locator('#city'),
      postalCode: page.locator('#postalCode'),
      country: page.locator('#country'),
      phone: page.locator('#phone, input[type="tel"]'),
    }
    this.savedAddressSelect = page.locator('[data-testid="saved-address-select"], select[name="savedAddress"]')

    // Shipping Method - RadioGroupItem renders as button with role="radio" and data-slot="radio-group-item"
    // Note: Component class is "shipping-method-selector" (lowercase with dashes)
    this.shippingMethodOptions = page.locator('.shipping-method-selector button[role="radio"], .shipping-method-selector [data-slot="radio-group-item"], [data-testid="shipping-method-option"]')
    this.shippingMethodError = page.locator('.shipping-method-selector [class*="error"], [data-testid="shipping-method-error"]')
    this.shippingMethodLoading = page.locator('.shipping-method-selector .animate-pulse')

    // Payment Options - reka-ui RadioGroupItem renders button with data-value
    this.cashPaymentOption = page.locator('[data-value="cash"], #payment-cash, input[type="radio"][value="cash"]')
    this.creditCardOption = page.locator('[data-value="credit_card"], #payment-card, input[type="radio"][value="credit_card"]')
    this.paypalOption = page.locator('[data-value="paypal"], #payment-paypal, input[type="radio"][value="paypal"]')

    // Delivery Instructions
    this.deliveryInstructions = page.locator('textarea[name="instructions"], textarea[id="instructions"], [data-testid="delivery-instructions"]')

    // Terms & Order - Use data-testid for reliable selection
    this.termsCheckbox = page.locator('[data-testid="terms-checkbox"]')
    this.privacyCheckbox = page.locator('[data-testid="privacy-checkbox"]')
    this.marketingCheckbox = page.locator('[data-testid="marketing-checkbox"]')
    this.placeOrderButton = page.locator('[data-testid="place-order-button"], button:has-text("Place Order"), button:has-text("Realizar Pedido"), button:has-text("Оформить заказ"), button:has-text("Plasează comanda")').first()

    // Order Summary (Sidebar)
    this.orderSummary = page.locator('[class*="OrderSummaryCard"], [data-testid="order-summary"]')
    this.orderSummaryItems = this.orderSummary.locator('[data-testid="order-item"], [class*="order-item"]')
    this.orderSummarySubtotal = this.orderSummary.locator('text=/subtotal/i').locator('..').locator('span').last()
    this.orderSummaryShipping = this.orderSummary.locator('text=/shipping|envío/i').locator('..').locator('span').last()
    this.orderSummaryTotal = this.orderSummary.locator('[class*="total"], [data-testid="order-total"]')
    this.orderSummaryItemCount = this.orderSummary.locator('[data-testid="item-count"]')

    // Mobile Sticky Footer
    this.mobileStickyFooter = page.locator('.lg\\:hidden.fixed.bottom-0, [data-testid="mobile-checkout-footer"]')
    this.mobilePlaceOrderButton = this.mobileStickyFooter.locator('button')
    this.mobileOrderTotal = this.mobileStickyFooter.locator('[class*="total"]')

    // Feedback
    this.toast = page.locator('[class*="toast"], [class*="notification"], [role="alert"]')
    this.loadingSpinner = page.locator('.animate-spin')
    this.errorMessage = page.locator('[class*="error"], .text-red-500, .text-red-600')
    this.validationError = page.locator('[class*="validation-error"], [data-testid="validation-error"]')

    // Trust Badges
    this.trustBadges = page.locator('[class*="trust"], [data-testid="trust-badges"]')
  }

  // ===========================================
  // Navigation Methods
  // ===========================================

  /**
   * Navigate to checkout page
   */
  async navigate() {
    await this.page.goto('/checkout')
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Check if on checkout page
   */
  async isOnCheckoutPage(): Promise<boolean> {
    return this.page.url().includes('/checkout')
  }

  /**
   * Check if on confirmation page
   */
  async isOnConfirmationPage(): Promise<boolean> {
    return this.page.url().includes('/checkout/confirmation')
  }

  // ===========================================
  // Express Checkout Methods
  // ===========================================

  /**
   * Check if express checkout banner is visible
   */
  async isExpressBannerVisible(): Promise<boolean> {
    return await this.expressBanner.isVisible({ timeout: 3000 }).catch(() => false)
  }

  /**
   * Wait for express checkout banner
   */
  async waitForExpressBanner(timeout: number = 5000) {
    await expect(this.expressBanner).toBeVisible({ timeout })
  }

  /**
   * Use express checkout to place order immediately
   */
  async useExpressCheckout() {
    await this.expressPlaceOrderButton.click()
    // Wait for order processing
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Dismiss express checkout and show full form
   */
  async dismissExpressCheckout() {
    await this.expressEditButton.click()
    await expect(this.checkoutFormContainer).toBeVisible()
  }

  /**
   * Get displayed address from express banner
   */
  async getExpressAddress(): Promise<string> {
    return await this.expressSavedAddress.textContent() || ''
  }

  // ===========================================
  // Guest Checkout Methods
  // ===========================================

  /**
   * Check if guest checkout prompt is visible
   */
  async isGuestPromptVisible(): Promise<boolean> {
    return await this.guestCheckoutPrompt.isVisible({ timeout: 3000 }).catch(() => false)
  }

  /**
   * Continue as guest
   */
  async continueAsGuest() {
    await this.continueAsGuestButton.click()
    await this.page.waitForTimeout(500)
  }

  /**
   * Fill guest email
   */
  async fillGuestEmail(email: string, receiveUpdates: boolean = false) {
    await this.guestEmailInput.fill(email)
    if (receiveUpdates) {
      await this.guestEmailUpdatesCheckbox.check()
    }
  }

  // ===========================================
  // Address Methods
  // ===========================================

  /**
   * Fill shipping address form.
   * The fullName value is split into firstName/lastName by the AddressForm component.
   * @param address - Address fields to fill
   */
  async fillShippingAddress(address: {
    fullName: string
    street: string
    city: string
    postalCode: string
    country: string
    phone?: string
  }) {
    // Handle saved addresses - select "Use new address" if visible
    const useNewAddressOption = this.page.locator('input[type="radio"][value="null"]').filter({ hasText: /use.*new.*address|usar.*nueva.*dirección|folosește.*adresă.*nouă|использовать.*новый.*адрес/i })
    if (await useNewAddressOption.isVisible({ timeout: 2000 }).catch(() => false)) {
      await useNewAddressOption.click()
      await this.page.waitForTimeout(500)
    }

    await this.page.waitForSelector('#fullName', { timeout: 15000 })
    await this.page.waitForTimeout(500)

    await expect(this.addressFields.fullName).toBeVisible({ timeout: 5000 })
    await this.addressFields.fullName.fill(address.fullName)
    await this.addressFields.fullName.blur()
    await this.page.waitForTimeout(300)

    await expect(this.addressFields.street).toBeVisible({ timeout: 5000 })
    await this.addressFields.street.fill(address.street)
    await this.addressFields.street.blur()
    await this.page.waitForTimeout(300)

    await expect(this.addressFields.city).toBeVisible({ timeout: 5000 })
    await this.addressFields.city.fill(address.city)
    await this.addressFields.city.blur()
    await this.page.waitForTimeout(300)

    await expect(this.addressFields.postalCode).toBeVisible({ timeout: 5000 })
    await this.addressFields.postalCode.fill(address.postalCode)
    await this.addressFields.postalCode.blur()

    const countryLocator = this.addressFields.country
    if (await countryLocator.isVisible({ timeout: 2000 }).catch(() => false)) {
      await countryLocator.selectOption(address.country)
    }

    if (address.phone) {
      const phoneLocator = this.addressFields.phone
      if (await phoneLocator.isVisible({ timeout: 2000 }).catch(() => false)) {
        await phoneLocator.fill(address.phone)
      }
    }

    await this.page.waitForTimeout(1000)
  }

  /**
   * Check if address section is complete
   */
  async isAddressComplete(): Promise<boolean> {
    return await this.addressSectionComplete.isVisible({ timeout: 2000 }).catch(() => false)
  }

  /**
   * Select a saved address
   */
  async selectSavedAddress(index: number = 0) {
    const options = await this.savedAddressSelect.locator('option').all()
    if (options.length > index + 1) { // +1 to skip placeholder
      await this.savedAddressSelect.selectOption({ index: index + 1 })
    }
  }

  // ===========================================
  // Shipping Method Methods
  // ===========================================

  /**
   * Wait for shipping methods to load
   */
  async waitForShippingMethods(timeout: number = 10000) {
    // Wait for loading to finish
    await expect(this.shippingMethodLoading).not.toBeVisible({ timeout })
    // Wait for at least one option
    await expect(this.shippingMethodOptions.first()).toBeVisible({ timeout })
  }

  /**
   * Select shipping method by index
   */
  async selectShippingMethod(index: number = 0) {
    await this.shippingMethodOptions.nth(index).click()
    await this.page.waitForTimeout(300)
  }

  /**
   * Check if shipping section is complete
   */
  async isShippingComplete(): Promise<boolean> {
    return await this.shippingSectionComplete.isVisible({ timeout: 2000 }).catch(() => false)
  }

  /**
   * Get number of available shipping methods
   */
  async getShippingMethodCount(): Promise<number> {
    return await this.shippingMethodOptions.count()
  }

  // ===========================================
  // Payment Methods
  // ===========================================

  /**
   * Select cash payment
   */
  async selectCashPayment() {
    // First ensure payment section is visible (progressive disclosure)
    await this.paymentSection.waitFor({ state: 'visible', timeout: 10000 })
    // Wait for the cash option to be attached
    await this.cashPaymentOption.waitFor({ state: 'attached', timeout: 5000 })
    await this.cashPaymentOption.click()
    await this.page.waitForTimeout(300)
  }

  /**
   * Check if payment section is complete
   */
  async isPaymentComplete(): Promise<boolean> {
    return await this.paymentSectionComplete.isVisible({ timeout: 2000 }).catch(() => false)
  }

  // ===========================================
  // Order Placement Methods
  // ===========================================

  /**
   * Accept terms and privacy
   * Uses data-testid selectors for reliable checkbox interaction
   */
  async acceptTerms() {
    // Get current states
    const termsState = await this.termsCheckbox.getAttribute('data-state')
    const privacyState = await this.privacyCheckbox.getAttribute('data-state')

    // Click terms checkbox if unchecked
    if (termsState !== 'checked') {
      await this.termsCheckbox.click()
      // Wait for Vue reactivity to update
      await this.page.waitForTimeout(200)
    }

    // Click privacy checkbox if unchecked
    if (privacyState !== 'checked') {
      await this.privacyCheckbox.click()
      await this.page.waitForTimeout(200)
    }

    console.log('✅ Terms and privacy accepted')
  }

  /**
   * Place order (clicks the Place Order button)
   */
  async placeOrder() {
    // Log current state before clicking
    console.log('🔍 Current URL before place order:', this.page.url())

    // Find and click the place order button
    if (await this.placeOrderButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('✅ Found desktop place order button')
      await this.placeOrderButton.click()
    }
    else {
      // Try mobile sticky footer button
      const mobileButton = this.page.locator('.lg\\:hidden button:has-text("Realizar"), .lg\\:hidden button:has-text("Place Order"), button.fixed:has-text("Realizar"), button.fixed:has-text("Place Order")').first()
      if (await mobileButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        console.log('✅ Found mobile place order button')
        await mobileButton.click()
      }
      else {
        throw new Error('Place order button not found')
      }
    }

    console.log('⏳ Waiting for navigation to confirmation page...')

    // Wait for navigation to confirmation page
    await this.page.waitForURL('**/checkout/confirmation**', { timeout: 30000 })
    console.log('✅ Navigated to confirmation page')
  }

  /**
   * Complete full checkout flow (fill form, accept terms, place order)
   */
  async completeCheckout(options: {
    address: {
      fullName: string
      street: string
      city: string
      postalCode: string
      country: string
      phone?: string
    }
    guestEmail?: string
  }) {
    // Handle guest checkout if needed
    if (options.guestEmail && await this.isGuestPromptVisible()) {
      await this.continueAsGuest()
      await this.fillGuestEmail(options.guestEmail)
    }

    // Fill address
    await this.fillShippingAddress(options.address)

    // Wait for and select shipping method
    await this.waitForShippingMethods()
    await this.selectShippingMethod(0)

    // Select payment
    await this.selectCashPayment()

    // Accept terms and place order
    await this.acceptTerms()
    await this.placeOrder()
  }

  /**
   * Check if place order button is enabled
   */
  async isPlaceOrderEnabled(): Promise<boolean> {
    return await this.placeOrderButton.isEnabled()
  }

  /**
   * Check if all sections are complete (ready to place order)
   */
  async isReadyToPlaceOrder(): Promise<boolean> {
    const addressComplete = await this.isAddressComplete()
    const shippingComplete = await this.isShippingComplete()
    const paymentComplete = await this.isPaymentComplete()
    return addressComplete && shippingComplete && paymentComplete
  }

  // ===========================================
  // Order Summary Methods
  // ===========================================

  /**
   * Get order total from summary
   */
  async getOrderTotal(): Promise<string> {
    return await this.orderSummaryTotal.textContent() || ''
  }

  /**
   * Get item count from summary
   */
  async getItemCount(): Promise<number> {
    const text = await this.orderSummaryItemCount.textContent()
    return parseInt(text?.match(/\d+/)?.[0] || '0', 10)
  }

  /**
   * Check if order summary is visible
   */
  async isOrderSummaryVisible(): Promise<boolean> {
    return await this.orderSummary.isVisible()
  }

  // ===========================================
  // Mobile Methods
  // ===========================================

  /**
   * Check if mobile footer is visible
   */
  async isMobileFooterVisible(): Promise<boolean> {
    return await this.mobileStickyFooter.isVisible()
  }

  /**
   * Place order from mobile footer
   */
  async placeOrderMobile() {
    await this.mobilePlaceOrderButton.click()
    await this.page.waitForLoadState('networkidle')
  }

  // ===========================================
  // Validation & Feedback Methods
  // ===========================================

  /**
   * Wait for toast notification
   */
  async waitForToast(messagePattern?: RegExp, timeout: number = 5000) {
    await expect(this.toast).toBeVisible({ timeout })
    if (messagePattern) {
      await expect(this.toast).toContainText(messagePattern)
    }
  }

  /**
   * Dismiss toast
   */
  async dismissToast() {
    const closeButton = this.toast.locator('button[aria-label*="Close"], button[aria-label*="Cerrar"]')
    if (await closeButton.isVisible()) {
      await closeButton.click()
    }
  }

  /**
   * Check for validation errors
   */
  async hasValidationErrors(): Promise<boolean> {
    return await this.validationError.isVisible({ timeout: 1000 }).catch(() => false)
  }

  /**
   * Check if any loading spinner is active
   */
  async isLoading(): Promise<boolean> {
    return await this.loadingSpinner.isVisible()
  }

  // ===========================================
  // Section Visibility Methods
  // ===========================================

  /**
   * Check if shipping method section is visible (appears after address is valid)
   */
  async isShippingMethodSectionVisible(): Promise<boolean> {
    return await this.shippingMethodSection.isVisible({ timeout: 2000 }).catch(() => false)
  }

  /**
   * Check if payment section is visible (appears after shipping method selected)
   */
  async isPaymentSectionVisible(): Promise<boolean> {
    return await this.paymentSection.isVisible({ timeout: 2000 }).catch(() => false)
  }

  /**
   * Check if place order section is visible
   */
  async isPlaceOrderSectionVisible(): Promise<boolean> {
    return await this.placeOrderSection.isVisible({ timeout: 2000 }).catch(() => false)
  }
}
