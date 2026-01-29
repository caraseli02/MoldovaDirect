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
    this.expressEditButton = this.expressBanner.locator('button:has-text("Edit"), button:has-text("Editar"), button:has-text("Редактировать"), button:has-text("Editează")')

    // Guest Checkout
    this.guestCheckoutPrompt = page.locator('[data-testid="guest-checkout-prompt"], [class*="GuestCheckoutPrompt"]')
    this.continueAsGuestButton = page.locator('[data-testid="continue-as-guest"], button:has-text("Continue as Guest"), button:has-text("Continuar como Invitado"), button:has-text("Продолжить как гость"), button:has-text("Continuă ca invitat")')
    this.guestEmailInput = page.locator('input[type="email"][name="email"], #guestEmail, input[id="guestEmail"], [data-testid="guest-email"]')
    this.guestEmailUpdatesCheckbox = page.locator('input[type="checkbox"][name*="update"], input[type="checkbox"][name*="newsletter"], #emailUpdates, input[id="emailUpdates"], input[id="email-updates"]')

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
      country: page.locator('[data-testid="country-select"]'),
      phone: page.locator('#phone, input[type="tel"]'),
    }
    this.savedAddressSelect = page.locator('[data-testid="saved-address-select"], select[name="savedAddress"]')

    // Shipping Method - RadioGroupItem renders as button with role="radio" and data-slot="radio-group-item"
    // Note: Component class is "shipping-method-selector" (lowercase with dashes)
    this.shippingMethodOptions = page.locator('.shipping-method-selector button[role="radio"], .shipping-method-selector [data-slot="radio-group-item"], [data-testid="shipping-method-option"]')
    this.shippingMethodError = page.locator('.shipping-method-selector [class*="error"], [data-testid="shipping-method-error"]')
    this.shippingMethodLoading = page.locator('.shipping-method-selector .animate-pulse')

    // Payment Options - using IDs from PaymentSection.vue (UiRadioGroupItem with id attribute)
    this.cashPaymentOption = page.locator('#payment-cash, [data-testid="payment-cash"], button[role="radio"][id="payment-cash"]')
    this.creditCardOption = page.locator('#payment-card, [data-testid="payment-card"], button[role="radio"][id="payment-card"]')
    this.paypalOption = page.locator('#payment-paypal, [data-testid="payment-paypal"], button[role="radio"][id="payment-paypal"]')

    // Delivery Instructions
    this.deliveryInstructions = page.locator('textarea[name="instructions"], textarea[id="instructions"], [data-testid="delivery-instructions"]')

    // Terms & Order - UiCheckbox renders as button with role="checkbox"
    // Select all checkboxes in the terms section and index them
    this.termsCheckbox = page.locator('.checkout-section-highlight [role="checkbox"]').nth(0)
    this.privacyCheckbox = page.locator('.checkout-section-highlight [role="checkbox"]').nth(1)
    this.marketingCheckbox = page.locator('.checkout-section-highlight [role="checkbox"]').nth(2)
    this.placeOrderButton = page.locator('button:has-text("Place Order"), button:has-text("Realizar Pedido"), button:has-text("Оформить заказ"), button:has-text("Plasează comanda")').first()

    // Order Summary (Sidebar) - matches order-summary-card class or data-testid
    this.orderSummary = page.locator('.order-summary-card, [class*="OrderSummaryCard"], [data-testid="order-summary"]')
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
    await this.guestEmailInput.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {})
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

  /**
   * Ensure guest email is filled if the field is visible
   */
  async ensureGuestEmail(email: string, receiveUpdates: boolean = false) {
    await this.guestEmailInput.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {})
    const isVisible = await this.guestEmailInput.isVisible({ timeout: 2000 }).catch(() => false)
    if (!isVisible) {
      return
    }

    const currentValue = await this.guestEmailInput.inputValue().catch(() => '')
    if (!currentValue) {
      await this.fillGuestEmail(email, receiveUpdates)
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
    // If saved addresses exist, switch to the new address option when available
    const useNewAddressContainer = this.page.locator('[data-testid="use-new-address"]')
    const hasUseNewAddress = await useNewAddressContainer.isVisible({ timeout: 2000 }).catch(() => false)
    const isFormVisible = await this.addressFields.fullName.isVisible({ timeout: 2000 }).catch(() => false)

    if (hasUseNewAddress && !isFormVisible) {
      await useNewAddressContainer.scrollIntoViewIfNeeded()
      const useNewAddressRadio = useNewAddressContainer.locator('[role="radio"]').first()
      if (await useNewAddressRadio.isVisible({ timeout: 2000 }).catch(() => false)) {
        await useNewAddressRadio.click()
      }
      else {
        await useNewAddressContainer.click()
      }
      await this.page.waitForTimeout(300)
    }

    const canFillForm = await this.addressFields.fullName.isVisible({ timeout: 5000 }).catch(() => false)
    if (!canFillForm && hasUseNewAddress) {
      // Fall back to using the first saved address if the form is hidden
      const firstSavedAddress = this.page.locator('.address-form [role="radio"]').first()
      if (await firstSavedAddress.isVisible({ timeout: 2000 }).catch(() => false)) {
        await firstSavedAddress.click()
        await this.page.waitForTimeout(300)
      }
      return
    }

    // Wait for the address form fields to be visible
    await expect(this.addressFields.fullName).toBeVisible({ timeout: 10000 })

    // Fill full name
    await this.addressFields.fullName.fill(address.fullName)
    await this.addressFields.fullName.blur()
    await this.page.waitForTimeout(200)

    // Fill street
    await expect(this.addressFields.street).toBeVisible({ timeout: 5000 })
    await this.addressFields.street.fill(address.street)
    await this.addressFields.street.blur()
    await this.page.waitForTimeout(200)

    // Fill city
    await expect(this.addressFields.city).toBeVisible({ timeout: 5000 })
    await this.addressFields.city.fill(address.city)
    await this.addressFields.city.blur()
    await this.page.waitForTimeout(200)

    // Fill postal code
    await expect(this.addressFields.postalCode).toBeVisible({ timeout: 5000 })
    await this.addressFields.postalCode.fill(address.postalCode)
    await this.addressFields.postalCode.blur()

    // Select country if visible (UiSelect)
    let countryTrigger = this.addressFields.country
    if (!(await countryTrigger.isVisible({ timeout: 2000 }).catch(() => false))) {
      countryTrigger = this.page.locator('[role="combobox"]').filter({ hasText: /selecciona|select|país/i }).first()
    }

    if (await countryTrigger.isVisible({ timeout: 2000 }).catch(() => false)) {
      await countryTrigger.scrollIntoViewIfNeeded()
      await countryTrigger.click({ force: true })
      await this.page.locator('[role="option"]').first().waitFor({ state: 'visible', timeout: 2000 }).catch(() => {})

      const optionByValue = this.page.locator(`[role="option"][data-value="${address.country}"]`)
      const optionByText = this.page.locator('[role="option"]').filter({ hasText: address.country })

      if (await optionByValue.isVisible({ timeout: 2000 }).catch(() => false)) {
        await optionByValue.click()
      }
      else if (await optionByText.isVisible({ timeout: 2000 }).catch(() => false)) {
        await optionByText.click()
      }
      else {
        const firstOption = this.page.locator('[role="option"]').first()
        if (await firstOption.isVisible({ timeout: 2000 }).catch(() => false)) {
          await firstOption.click()
        }
      }

      await this.page.keyboard.press('Escape').catch(() => {})
    }

    // Fill phone if provided
    if (address.phone) {
      const phoneLocator = this.addressFields.phone
      if (await phoneLocator.isVisible({ timeout: 2000 }).catch(() => false)) {
        await phoneLocator.fill(address.phone)
      }
    }

    await this.page.waitForTimeout(300)
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
    // Check if methods are auto-selected (banner showing, no clickable options)
    const autoSelectedBanner = this.page.locator('.shipping-method-selector').filter({ hasText: /free.*shipping|auto.*applied/i })
    const isAutoSelected = await autoSelectedBanner.isVisible({ timeout: 2000 }).catch(() => false)

    if (isAutoSelected) {
      console.log('✅ Shipping method auto-selected, no need to click')
      return
    }

    // Close any open select dropdowns (e.g., country) that can intercept clicks
    await this.page.keyboard.press('Escape').catch(() => {})

    // Otherwise click on the shipping method option
    const option = this.shippingMethodOptions.nth(index)
    if (await option.isVisible({ timeout: 3000 }).catch(() => false)) {
      await option.scrollIntoViewIfNeeded()
      await option.click({ force: true })
      await this.page.waitForTimeout(300)
    }
    else {
      console.log('⚠️ Shipping method option not visible, may be auto-selected')
    }
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
    // Try multiple strategies to click the cash payment option
    // Strategy 1: Try the label that contains the radio item (most reliable for UiRadioGroupItem)
    const cashLabel = this.page.locator('label').filter({ has: this.page.locator('#payment-cash') }).first()
    if (await cashLabel.isVisible({ timeout: 2000 }).catch(() => false)) {
      await cashLabel.click()
      await this.page.waitForTimeout(300)
      return
    }

    // Strategy 2: Try clicking the radio item directly
    const cashRadio = this.page.locator('#payment-cash')
    if (await cashRadio.isVisible({ timeout: 2000 }).catch(() => false)) {
      await cashRadio.click()
      await this.page.waitForTimeout(300)
      return
    }

    // Strategy 3: Try finding by text content
    const cashByText = this.page.locator('label').filter({ hasText: /cash|efectivo|наличными|numerar/i }).first()
    if (await cashByText.isVisible({ timeout: 2000 }).catch(() => false)) {
      await cashByText.click()
      await this.page.waitForTimeout(300)
      return
    }

    throw new Error('Could not find or click cash payment option')
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
   */
  async acceptTerms() {
    // Click the checkboxes (UiCheckbox renders as button with role="checkbox")
    const terms = this.page.locator('#terms-checkbox')
    const privacy = this.page.locator('#privacy-checkbox')

    if (await terms.isVisible({ timeout: 2000 }).catch(() => false)) {
      await terms.click()
    }
    if (await privacy.isVisible({ timeout: 2000 }).catch(() => false)) {
      await privacy.click()
    }
  }

  /**
   * Place order (clicks the Place Order button - handles both desktop and mobile)
   */
  async placeOrder() {
    // Log current state before clicking
    console.log('🔍 Current URL before place order:', this.page.url())

    const orderResponsePromise = this.page
      .waitForResponse(
        response => response.url().includes('/api/checkout/create-order'),
        { timeout: 15000 },
      )
      .catch(() => null)

    // Try desktop button first
    if (await this.placeOrderButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('✅ Found desktop place order button')
      await this.placeOrderButton.click({ force: true })
    }
    else {
      // Try mobile sticky footer button
      const mobileButton = this.page.locator('.lg\\:hidden button:has-text("Realizar"), .lg\\:hidden button:has-text("Place Order"), button.fixed:has-text("Realizar"), button.fixed:has-text("Place Order")').first()
      if (await mobileButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        console.log('✅ Found mobile place order button')
        await mobileButton.click()
      }
      else {
        // Last resort: use JavaScript to find and click any place order button
        console.log('⚠️  Using JavaScript to find place order button')
        await this.page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('button'))
          const placeOrderBtn = buttons.find(b =>
            b.textContent?.includes('Realizar Pedido')
            || b.textContent?.includes('Place Order')
            || b.textContent?.includes('Plasează'),
          )
          if (placeOrderBtn) {
            console.log('Found button:', placeOrderBtn.textContent)
            placeOrderBtn.click()
          }
          else {
            console.log('❌ No place order button found')
          }
        })
      }
    }

    console.log('⏳ Waiting for navigation or error...')

    const orderResponse = await orderResponsePromise
    if (orderResponse) {
      const status = orderResponse.status()
      if (!orderResponse.ok()) {
        const bodyText = await orderResponse.text().catch(() => '')
        console.log('❌ Order API failed:', status, bodyText)
        throw new Error(`Order API failed with status ${status}`)
      }
    }

    // Wait for either:
    // 1. Navigation to confirmation page (success)
    // 2. Error message (failure)
    try {
      await Promise.race([
        this.page.waitForURL('**/checkout/confirmation**', { timeout: 45000 }).then(() => {
          console.log('✅ Navigated to confirmation page')
        }),
        this.page.waitForSelector('[role="alert"], [data-sonner-toast]', { timeout: 45000 }).then(async () => {
          const alertText = await this.page.locator('[role="alert"], [data-sonner-toast]').first().textContent()
          console.log('⚠️  Alert appeared:', alertText)
        }),
      ])
    }
    catch (error) {
      // If timeout, log detailed debugging info
      console.log('❌ Timeout waiting for navigation or error')
      console.log('   Current URL:', this.page.url())

      // Check for any console errors
      const consoleErrors = await this.page.evaluate(() => {
        return (window as any).__testErrors || []
      })
      if (consoleErrors.length > 0) {
        console.log('   Console errors:', consoleErrors)
      }

      // Check if button is still enabled (might indicate processing stuck)
      const buttonEnabled = await this.placeOrderButton.isEnabled().catch(() => null)
      console.log('   Place order button enabled:', buttonEnabled)

      // Take a screenshot for debugging
      await this.page.screenshot({ path: 'test-results/place-order-timeout.png', fullPage: true })
      console.log('   Screenshot saved to: test-results/place-order-timeout.png')

      throw error
    }
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
