/**
 * Checkout Helpers for Visual Regression Tests
 *
 * Simplified helpers for completing checkout flows in visual regression tests.
 * These helpers abstract away the complexity of the checkout process.
 */

import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000'

export class CheckoutHelpers {
  constructor(private page: Page) {}

  /**
   * Add a product to cart and navigate to checkout
   */
  async addProductAndGoToCheckout() {
    // Go to products page
    await this.page.goto(`${BASE_URL}/products`)
    await this.page.waitForLoadState('networkidle')

    // Add first product to cart
    const addButton = this.page.locator('button').filter({ hasText: /add.*cart|añadir.*carrito|adaugă.*coș|добавить.*корзину/i }).first()
    await expect(addButton).toBeVisible({ timeout: 10000 })
    await addButton.click()
    await this.page.waitForTimeout(2000)

    // Navigate to checkout
    await this.page.goto(`${BASE_URL}/checkout`)
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Click "Continue as Guest" button
   */
  async continueAsGuest() {
    const guestPrompt = this.page.locator('[data-testid="guest-prompt"]')
    if (await guestPrompt.isVisible({ timeout: 2000 }).catch(() => false)) {
      const continueButton = this.page.locator('button').filter({ hasText: /continue.*guest|continuar.*invitado|continuă.*oaspete|продолжить.*гость/i })
      await continueButton.click()
      await this.page.waitForTimeout(500)
    }
  }

  /**
   * Fill guest email
   */
  async fillGuestEmail(email: string) {
    const emailInput = this.page.locator('input[type="email"]').first()
    if (await emailInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await emailInput.fill(email)
      await emailInput.blur()
    }
  }

  /**
   * Fill shipping address
   */
  async fillAddress(address: {
    fullName: string
    street: string
    city: string
    postalCode: string
    country: string
  }) {
    // Check if there are saved addresses and we need to select "Use new address"
    const useNewAddressOption = this.page.locator('input[type="radio"][value="null"]').filter({ hasText: /use.*new.*address|usar.*nueva.*dirección|folosește.*adresă.*nouă|использовать.*новый.*адрес/i })
    if (await useNewAddressOption.isVisible({ timeout: 2000 }).catch(() => false)) {
      await useNewAddressOption.click()
      await this.page.waitForTimeout(500)
    }

    // Wait for form to be visible - use the correct selector (id="fullName" and name="name")
    await this.page.waitForSelector('#fullName, input[id="fullName"]', { timeout: 15000 })
    await this.page.waitForTimeout(500) // Allow form to fully render

    // Fill fullName (has id="fullName" but name="name")
    const fullNameInput = this.page.locator('#fullName').first()
    await expect(fullNameInput).toBeVisible({ timeout: 5000 })
    await fullNameInput.fill(address.fullName)
    await fullNameInput.blur()
    await this.page.waitForTimeout(300)

    // Fill street
    const streetInput = this.page.locator('#street').first()
    await expect(streetInput).toBeVisible({ timeout: 5000 })
    await streetInput.fill(address.street)
    await streetInput.blur()
    await this.page.waitForTimeout(300)

    // Fill city
    const cityInput = this.page.locator('#city').first()
    await expect(cityInput).toBeVisible({ timeout: 5000 })
    await cityInput.fill(address.city)
    await cityInput.blur()
    await this.page.waitForTimeout(300)

    // Fill postal code
    const postalCodeInput = this.page.locator('#postalCode').first()
    await expect(postalCodeInput).toBeVisible({ timeout: 5000 })
    await postalCodeInput.fill(address.postalCode)
    await postalCodeInput.blur()

    // Select country if select exists
    const countrySelect = this.page.locator('#country').first()
    if (await countrySelect.isVisible({ timeout: 2000 }).catch(() => false)) {
      await countrySelect.selectOption(address.country)
    }

    // Wait for validation and any auto-complete
    await this.page.waitForTimeout(1000)
  }

  /**
   * Wait for shipping methods to load
   */
  async waitForShippingMethods(timeout = 15000) {
    // Wait for loading spinner to disappear
    const loadingSpinner = this.page.locator('[data-testid="shipping-loading"], .loading')
    await expect(loadingSpinner).not.toBeVisible({ timeout })

    // Wait for shipping options to appear
    const shippingOptions = this.page.locator('[data-testid="shipping-method"], input[type="radio"][name="shippingMethod"]')
    await expect(shippingOptions.first()).toBeVisible({ timeout })
  }

  /**
   * Select shipping method by index (0-based)
   */
  async selectShippingMethod(index = 0) {
    const shippingOptions = this.page.locator('[data-testid="shipping-method"], input[type="radio"][name="shippingMethod"]')
    const option = shippingOptions.nth(index)
    await option.click()
    await this.page.waitForTimeout(500)
  }

  /**
   * Select cash payment method
   */
  async selectCashPayment() {
    const cashRadio = this.page.locator('input[type="radio"][value="cash"], input[type="radio"][id="cash"]').first()
    await expect(cashRadio).toBeVisible({ timeout: 5000 })
    await cashRadio.click()
    await this.page.waitForTimeout(500)
  }

  /**
   * Accept terms and conditions
   */
  async acceptTerms() {
    const termsCheckbox = this.page.locator('input[type="checkbox"][id="terms"], input[type="checkbox"][name="terms"]')
    if (await termsCheckbox.isVisible({ timeout: 3000 }).catch(() => false)) {
      await termsCheckbox.check()
    }

    const privacyCheckbox = this.page.locator('input[type="checkbox"][id="privacy"], input[type="checkbox"][name="privacy"]')
    if (await privacyCheckbox.isVisible({ timeout: 3000 }).catch(() => false)) {
      await privacyCheckbox.check()
    }

    await this.page.waitForTimeout(500)
  }

  /**
   * Click "Place Order" button
   */
  async placeOrder() {
    const placeOrderButton = this.page.locator('button').filter({ hasText: /place.*order|realizar.*pedido|plasează.*comanda|оформить.*заказ/i }).first()
    await expect(placeOrderButton).toBeVisible({ timeout: 5000 })
    await expect(placeOrderButton).toBeEnabled({ timeout: 3000 })
    await placeOrderButton.click()
    await this.page.waitForLoadState('networkidle')
  }
}
