/**
 * Page Object Model: Checkout Page
 *
 * Encapsulates all interactions with the checkout page,
 * including express checkout banner, forms, and navigation.
 */

import { type Page, type Locator, expect } from '@playwright/test'

export class CheckoutPage {
  readonly page: Page

  // Express Checkout Banner Elements
  readonly expressBanner: Locator
  readonly bannerTitle: Locator
  readonly bannerDescription: Locator
  readonly savedAddressDisplay: Locator
  readonly preferredShippingMethod: Locator
  readonly useExpressButton: Locator
  readonly editDetailsButton: Locator
  readonly closeBannerButton: Locator

  // Countdown Elements
  readonly countdownSection: Locator
  readonly countdownTitle: Locator
  readonly countdownMessage: Locator
  readonly countdownTimer: Locator
  readonly countdownProgressBar: Locator
  readonly cancelCountdownButton: Locator
  readonly lightningIcon: Locator

  // Guest Checkout Elements
  readonly guestCheckoutPrompt: Locator
  readonly continueAsGuestButton: Locator
  readonly guestEmailInput: Locator
  readonly guestEmailUpdatesCheckbox: Locator

  // Address Form Elements
  readonly addressForm: Locator
  readonly addressFields: {
    street: Locator
    city: Locator
    postalCode: Locator
    country: Locator
    firstName: Locator
    lastName: Locator
    phone: Locator
  }

  // Shipping Method Elements
  readonly shippingMethodSection: Locator
  readonly shippingMethodOptions: Locator
  readonly shippingMethodError: Locator

  // Navigation Elements
  readonly proceedButton: Locator
  readonly backButton: Locator

  // Feedback Elements
  readonly toast: Locator
  readonly loadingSpinner: Locator
  readonly errorMessage: Locator

  constructor(page: Page) {
    this.page = page

    // Express Checkout Banner
    this.expressBanner = page.locator('.express-checkout-banner, [class*="ExpressCheckout"]')
    this.bannerTitle = this.expressBanner.locator('h3').first()
    this.bannerDescription = this.expressBanner.locator('p').first()
    this.savedAddressDisplay = this.expressBanner.locator('.bg-white, .dark\\:bg-gray-800').first()
    this.preferredShippingMethod = this.expressBanner.locator('text=/preferred.*shipping/i').locator('..')
    this.useExpressButton = this.expressBanner.locator('button:has-text("Express"), button:has-text("Pago Express"), button:has-text("Экспресс"), button:has-text("Expres")')
    this.editDetailsButton = this.expressBanner.locator('button:has-text("Edit"), button:has-text("Editar"), button:has-text("Редактировать"), button:has-text("Editează")')
    this.closeBannerButton = this.expressBanner.locator('button[aria-label*="Close"], button[aria-label*="Cerrar"], button[aria-label*="Закрыть"], button[aria-label*="Închide"]')

    // Countdown Elements
    this.countdownSection = this.expressBanner.locator('.border-indigo-500, .dark\\:border-indigo-400')
    this.countdownTitle = this.countdownSection.locator('span.text-lg')
    this.countdownMessage = this.countdownSection.locator('p.text-sm')
    this.countdownTimer = this.countdownSection.locator('.text-2xl.font-bold')
    this.countdownProgressBar = this.countdownSection.locator('.bg-indigo-600, .dark\\:bg-indigo-400')
    this.cancelCountdownButton = this.countdownSection.locator('button:has-text("Wait"), button:has-text("Espera"), button:has-text("Подожди"), button:has-text("Așteaptă")')
    this.lightningIcon = this.countdownSection.locator('svg.animate-pulse')

    // Guest Checkout
    this.guestCheckoutPrompt = page.locator('text=/continue.*guest|continuar.*invitado/i').locator('..')
    this.continueAsGuestButton = page.locator('button:has-text("Continue as Guest"), button:has-text("Continuar como Invitado"), button:has-text("Продолжить как гость"), button:has-text("Continuă ca invitat")')
    this.guestEmailInput = page.locator('input[type="email"][name="email"], input[placeholder*="email"]')
    this.guestEmailUpdatesCheckbox = page.locator('input[type="checkbox"][name*="update"], input[type="checkbox"][name*="newsletter"]')

    // Address Form
    this.addressForm = page.locator('form, [class*="address-form"]')
    this.addressFields = {
      street: page.locator('input[name="address"], input[name="street"], input[placeholder*="dirección"], input[placeholder*="address"], input[placeholder*="адрес"], input[placeholder*="adresă"]'),
      city: page.locator('input[name="city"], input[placeholder*="ciudad"], input[placeholder*="city"], input[placeholder*="город"], input[placeholder*="oraș"]'),
      postalCode: page.locator('input[name="postal_code"], input[name="postalCode"], input[placeholder*="postal"], input[placeholder*="código"], input[placeholder*="индекс"], input[placeholder*="cod"]'),
      country: page.locator('select[name="country"], input[name="country"]'),
      firstName: page.locator('input[name="firstName"], input[name="first_name"], input[placeholder*="nombre"]'),
      lastName: page.locator('input[name="lastName"], input[name="last_name"], input[placeholder*="apellido"]'),
      phone: page.locator('input[name="phone"], input[type="tel"]'),
    }

    // Shipping Method
    this.shippingMethodSection = page.locator('[class*="shipping-method"], [class*="ShippingMethod"]')
    this.shippingMethodOptions = this.shippingMethodSection.locator('input[type="radio"], button[role="radio"]')
    this.shippingMethodError = this.shippingMethodSection.locator('text=/required|requerido|обязательно|obligatoriu/i')

    // Navigation
    this.proceedButton = page.locator('button:has-text("Proceed"), button:has-text("Continuar"), button:has-text("Продолжить"), button:has-text("Continuă")')
    this.backButton = page.locator('button:has-text("Back"), button:has-text("Volver"), button:has-text("Назад"), button:has-text("Înapoi"), a[href*="/cart"]')

    // Feedback
    this.toast = page.locator('[class*="toast"], [class*="notification"], [role="alert"]')
    this.loadingSpinner = page.locator('.animate-spin')
    this.errorMessage = page.locator('[class*="error"], .text-red-500, .text-red-600')
  }

  /**
   * Navigate to checkout page
   */
  async navigate() {
    await this.page.goto('/checkout')
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Navigate to checkout with express query parameter
   */
  async navigateWithExpress() {
    await this.page.goto('/checkout?express=1')
    await this.page.waitForLoadState('networkidle')
    // Small delay to allow countdown to initialize
    await this.page.waitForTimeout(500)
  }

  /**
   * Get current countdown value
   */
  async getCountdownValue(): Promise<number> {
    const text = await this.countdownTimer.textContent()
    const value = parseInt(text?.trim() || '0', 10)
    return value
  }

  /**
   * Get progress bar width percentage
   */
  async getProgressBarWidth(): Promise<number> {
    const element = this.countdownProgressBar
    const style = await element.getAttribute('style')

    if (style) {
      const match = style.match(/width:\s*(\d+(?:\.\d+)?)%/)
      if (match) {
        return parseFloat(match[1])
      }
    }

    // Fallback: calculate from bounding box
    const containerBox = await this.countdownSection.locator('.bg-gray-200').boundingBox()
    const barBox = await element.boundingBox()

    if (containerBox && barBox) {
      return (barBox.width / containerBox.width) * 100
    }

    return 0
  }

  /**
   * Fill guest information
   */
  async fillGuestInfo(email: string, receiveUpdates: boolean = false) {
    await this.guestEmailInput.fill(email)

    if (receiveUpdates) {
      await this.guestEmailUpdatesCheckbox.check()
    }
  }

  /**
   * Fill shipping address
   */
  async fillShippingAddress(address: {
    firstName: string
    lastName: string
    street: string
    city: string
    postalCode: string
    country: string
    phone?: string
  }) {
    await this.addressFields.firstName.fill(address.firstName)
    await this.addressFields.lastName.fill(address.lastName)
    await this.addressFields.street.fill(address.street)
    await this.addressFields.city.fill(address.city)
    await this.addressFields.postalCode.fill(address.postalCode)

    // Handle country select or input
    if (await this.addressFields.country.evaluate(el => el.tagName === 'SELECT')) {
      await this.addressFields.country.selectOption(address.country)
    } else {
      await this.addressFields.country.fill(address.country)
    }

    if (address.phone) {
      await this.addressFields.phone.fill(address.phone)
    }
  }

  /**
   * Select shipping method by index
   */
  async selectShippingMethod(index: number = 0) {
    const options = this.shippingMethodOptions
    await options.nth(index).click()
  }

  /**
   * Wait for express banner to appear
   */
  async waitForExpressBanner(timeout: number = 5000) {
    await expect(this.expressBanner).toBeVisible({ timeout })
  }

  /**
   * Wait for countdown to start
   */
  async waitForCountdownStart(timeout: number = 2000) {
    await expect(this.countdownTimer).toBeVisible({ timeout })
  }

  /**
   * Verify address is displayed in banner
   */
  async verifyAddressDisplay(address: {
    firstName: string
    lastName: string
    street: string
    city: string
    postalCode: string
    country: string
  }) {
    const display = this.savedAddressDisplay

    await expect(display).toContainText(address.firstName)
    await expect(display).toContainText(address.lastName)
    await expect(display).toContainText(address.street)
    await expect(display).toContainText(address.city)
    await expect(display).toContainText(address.postalCode)
    await expect(display).toContainText(address.country)
  }

  /**
   * Wait for toast message
   */
  async waitForToast(messagePattern?: RegExp, timeout: number = 5000) {
    await expect(this.toast).toBeVisible({ timeout })

    if (messagePattern) {
      await expect(this.toast).toContainText(messagePattern)
    }
  }

  /**
   * Dismiss toast notification
   */
  async dismissToast() {
    const closeButton = this.toast.locator('button[aria-label*="Close"], button[aria-label*="Cerrar"]')

    if (await closeButton.isVisible()) {
      await closeButton.click()
    }
  }

  /**
   * Check if user is on checkout page
   */
  async isOnCheckoutPage(): Promise<boolean> {
    return this.page.url().includes('/checkout')
  }

  /**
   * Check if countdown is active
   */
  async isCountdownActive(): Promise<boolean> {
    return await this.countdownTimer.isVisible()
  }

  /**
   * Cancel countdown if active
   */
  async cancelCountdownIfActive() {
    if (await this.isCountdownActive()) {
      await this.cancelCountdownButton.click()
      await expect(this.countdownTimer).not.toBeVisible()
    }
  }

  /**
   * Proceed to payment step
   */
  async proceedToPayment() {
    await this.proceedButton.click()
    await this.page.waitForURL(/\/checkout\/payment/, { timeout: 10000 })
  }

  /**
   * Go back to cart
   */
  async goBackToCart() {
    await this.backButton.click()
    await this.page.waitForURL(/\/cart/, { timeout: 10000 })
  }
}
