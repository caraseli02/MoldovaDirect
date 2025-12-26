/**
 * Checkout Helpers for Visual Regression Tests
 *
 * Simplified helpers for completing checkout flows in visual regression tests.
 * These helpers abstract away the complexity of the checkout process.
 *
 * Uses client-side navigation (click-through cart page) rather than page.goto()
 * because direct navigation triggers a full page reload that loses Pinia store
 * state before it can be persisted to cookies/localStorage.
 */

import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000'

export class CheckoutHelpers {
  constructor(private page: Page) {}

  /**
   * Add a product to cart and navigate to checkout.
   * Uses client-side navigation to preserve Pinia cart state.
   * @throws Error if cart update verification fails
   */
  async addProductAndGoToCheckout() {
    await this.page.goto(`${BASE_URL}/products`)
    await this.page.waitForLoadState('networkidle')

    const addButton = this.page.locator('button').filter({ hasText: /add.*cart|añadir.*carrito|adaugă.*coș|добавить.*корзину/i }).first()
    await expect(addButton).toBeVisible({ timeout: 10000 })
    await addButton.click()

    await this.waitForCartUpdate()

    // Click visible cart link (location differs on mobile vs desktop)
    const cartLink = this.page.locator('a[href*="/cart"]:visible').first()
    await expect(cartLink).toBeVisible({ timeout: 5000 })
    await cartLink.click()

    await this.page.waitForURL(/\/cart/, { timeout: 10000 })
    await this.page.waitForLoadState('networkidle')
    await this.page.waitForTimeout(1000)

    const checkoutButton = this.page.locator('button').filter({ hasText: /checkout|finalizar.*compra|proceder.*pago|оформить/i }).first()
    await checkoutButton.scrollIntoViewIfNeeded()
    await expect(checkoutButton).toBeVisible({ timeout: 5000 })
    await checkoutButton.click()

    await this.page.waitForURL(/\/checkout/, { timeout: 10000 })
    await this.page.waitForLoadState('networkidle')
    await this.page.waitForTimeout(1000)
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
   * Fill shipping address form
   * @param address - Address fields to fill
   */
  async fillAddress(address: {
    fullName: string
    street: string
    city: string
    postalCode: string
    country: string
  }) {
    // Handle saved addresses - select "Use new address" if visible
    const useNewAddressOption = this.page.locator('input[type="radio"][value="null"]').filter({ hasText: /use.*new.*address|usar.*nueva.*dirección|folosește.*adresă.*nouă|использовать.*новый.*адрес/i })
    if (await useNewAddressOption.isVisible({ timeout: 2000 }).catch(() => false)) {
      await useNewAddressOption.click()
      await this.page.waitForTimeout(500)
    }

    await this.page.waitForSelector('#fullName', { timeout: 15000 })
    await this.page.waitForTimeout(500)

    const fullNameInput = this.page.locator('#fullName').first()
    await expect(fullNameInput).toBeVisible({ timeout: 5000 })
    await fullNameInput.fill(address.fullName)
    await fullNameInput.blur()
    await this.page.waitForTimeout(300)

    const streetInput = this.page.locator('#street').first()
    await expect(streetInput).toBeVisible({ timeout: 5000 })
    await streetInput.fill(address.street)
    await streetInput.blur()
    await this.page.waitForTimeout(300)

    const cityInput = this.page.locator('#city').first()
    await expect(cityInput).toBeVisible({ timeout: 5000 })
    await cityInput.fill(address.city)
    await cityInput.blur()
    await this.page.waitForTimeout(300)

    const postalCodeInput = this.page.locator('#postalCode').first()
    await expect(postalCodeInput).toBeVisible({ timeout: 5000 })
    await postalCodeInput.fill(address.postalCode)
    await postalCodeInput.blur()

    const countrySelect = this.page.locator('#country').first()
    if (await countrySelect.isVisible({ timeout: 2000 }).catch(() => false)) {
      await countrySelect.selectOption(address.country)
    }

    await this.page.waitForTimeout(1000)
  }

  /**
   * Wait for shipping methods to load after address is filled
   * @param timeout - Maximum time to wait in ms (default: 15000)
   * @throws Error if no shipping methods appear within timeout
   */
  async waitForShippingMethods(timeout = 15000) {
    await this.page.waitForTimeout(1000)

    // Wait for loading spinner to disappear if present
    const loadingSpinner = this.page.locator('[data-testid="shipping-loading"], .loading, .animate-spin')
    try {
      await expect(loadingSpinner).not.toBeVisible({ timeout: 5000 })
    }
    catch (error) {
      // Loading spinner may not exist - this is expected in some UI states
      console.debug(`Loading spinner check: ${error instanceof Error ? error.message : 'element not found'}`)
    }

    const shippingSelectors = [
      '[data-testid="shipping-method"]',
      'input[type="radio"][name="shippingMethod"]',
      'input[type="radio"][name="shipping"]',
      '[data-testid="shipping-option"]',
      '.shipping-method input[type="radio"]',
      'label:has-text("Standard") input[type="radio"]',
      'label:has-text("Express") input[type="radio"]',
      'label:has-text("Envío") input[type="radio"]',
    ]

    for (const selector of shippingSelectors) {
      const option = this.page.locator(selector).first()
      if (await option.isVisible({ timeout: 2000 }).catch(() => false)) {
        return
      }
    }

    throw new Error(`Shipping methods not found after ${timeout}ms. Tried selectors: ${shippingSelectors.join(', ')}`)
  }

  /**
   * Select shipping method by index (0-based)
   * @param index - Index of shipping method to select (default: 0)
   * @throws Error if no shipping method could be selected
   */
  async selectShippingMethod(index = 0) {
    const selectors = [
      '[data-testid="shipping-method"]',
      'input[type="radio"][name="shippingMethod"]',
      'input[type="radio"][name="shipping"]',
      '[id^="ship-"]',
      '.shipping-method-selector label',
      'button[role="radio"]',
    ]

    for (const selector of selectors) {
      const options = this.page.locator(selector)
      const count = await options.count()
      if (count > index) {
        await options.nth(index).click()
        await this.page.waitForTimeout(500)
        console.log(`✅ Shipping method selected (selector: ${selector}, index: ${index})`)
        return
      }
    }

    // Fallback: click any visible shipping option
    const anyOption = this.page.locator('.shipping-method-selector label:visible, [data-state] label:visible').first()
    if (await anyOption.isVisible({ timeout: 2000 }).catch(() => false)) {
      await anyOption.click()
      await this.page.waitForTimeout(500)
      console.log('✅ Shipping method selected (fallback selector)')
      return
    }

    throw new Error(`Failed to select shipping method at index ${index}. No shipping options found using any of the expected selectors.`)
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
   * Accept terms and conditions checkboxes
   * Verifies checkboxes are checked after clicking
   */
  async acceptTerms() {
    const termsCheckbox = this.page.locator('input[type="checkbox"][id="terms"], input[type="checkbox"][name="terms"]')
    if (await termsCheckbox.isVisible({ timeout: 3000 }).catch(() => false)) {
      await termsCheckbox.check()
      await expect(termsCheckbox).toBeChecked({ timeout: 2000 })
    }

    const privacyCheckbox = this.page.locator('input[type="checkbox"][id="privacy"], input[type="checkbox"][name="privacy"]')
    if (await privacyCheckbox.isVisible({ timeout: 3000 }).catch(() => false)) {
      await privacyCheckbox.check()
      await expect(privacyCheckbox).toBeChecked({ timeout: 2000 })
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

  /**
   * Wait for cart to update after adding item
   * Verifies cart update by checking for button state change or cart badge
   * @throws Error if cart update cannot be verified
   */
  private async waitForCartUpdate(): Promise<void> {
    await this.page.waitForLoadState('networkidle')

    // Wait for loading spinners to disappear
    try {
      await this.page.waitForFunction(
        () => {
          const buttons = document.querySelectorAll('button')
          for (const btn of buttons) {
            const svg = btn.querySelector('svg.animate-spin')
            if (svg) return false
          }
          return true
        },
        { timeout: 10000 },
      )
    }
    catch (error) {
      // Log but don't fail - spinner check is supplementary
      console.warn(`Cart loading spinner check timed out: ${error instanceof Error ? error.message : String(error)}`)
    }

    // Verify cart updated by checking for "In Cart" button state or cart badge
    const cartIndicators = [
      'button:has-text("En el Carrito")',
      'button:has-text("In Cart")',
      'button:has-text("În coș")',
      'button:has-text("В корзине")',
      '[aria-label*="Cart (1)"]',
      '[aria-label*="Carrito (1)"]',
      '[data-testid="cart-count"]:has-text("1")',
    ]

    for (const selector of cartIndicators) {
      const indicator = this.page.locator(selector).first()
      if (await indicator.isVisible({ timeout: 2000 }).catch(() => false)) {
        console.log(`✅ Cart updated (verified via: ${selector.includes('button') ? 'button text changed' : 'cart badge'})`)
        return
      }
    }

    // Cart update verification failed - throw error instead of silently continuing
    throw new Error(
      `Cart update verification failed: none of the expected cart indicators were visible after adding item. `
      + `Tried indicators: ${cartIndicators.join(', ')}`,
    )
  }
}
