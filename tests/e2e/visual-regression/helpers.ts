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
   * Uses client-side navigation to preserve Pinia cart state
   */
  async addProductAndGoToCheckout() {
    // Go to products page
    await this.page.goto(`${BASE_URL}/products`)
    await this.page.waitForLoadState('networkidle')

    // Add first product to cart
    const addButton = this.page.locator('button').filter({ hasText: /add.*cart|añadir.*carrito|adaugă.*coș|добавить.*корзину/i }).first()
    await expect(addButton).toBeVisible({ timeout: 10000 })
    await addButton.click()

    // Wait for cart to update (button text changes to "In Cart" / "En el Carrito")
    await this.waitForCartUpdate()

    // Use CLIENT-SIDE navigation to preserve Pinia cart state
    // (page.goto() causes full page reload which loses Pinia state before cookies persist)

    // Find the VISIBLE cart link (different on mobile vs desktop)
    // On mobile, the bottom nav has the cart link; on desktop, it's in the header
    // We simply find any visible cart link and click it
    const cartLink = this.page.locator('a[href*="/cart"]:visible').first()
    await expect(cartLink).toBeVisible({ timeout: 5000 })
    await cartLink.click()

    await this.page.waitForURL(/\/cart/, { timeout: 10000 })
    await this.page.waitForLoadState('networkidle')
    await this.page.waitForTimeout(1000) // Wait for cart state to sync

    // Click Checkout button (client-side navigation preserves Pinia state)
    // Scroll to make sure button is in view on mobile
    const checkoutButton = this.page.locator('button').filter({ hasText: /checkout|finalizar.*compra|proceder.*pago|оформить/i }).first()
    await checkoutButton.scrollIntoViewIfNeeded()
    await expect(checkoutButton).toBeVisible({ timeout: 5000 })
    await checkoutButton.click()

    // Wait for checkout page
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
    // First wait a bit for the shipping calculation to start
    await this.page.waitForTimeout(1000)

    // Wait for loading spinner to disappear (if exists)
    const loadingSpinner = this.page.locator('[data-testid="shipping-loading"], .loading, .animate-spin')
    try {
      await expect(loadingSpinner).not.toBeVisible({ timeout: 5000 })
    }
    catch {
      // Loading spinner may not exist, continue
    }

    // Try multiple selectors for shipping options
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

    // Wait for any shipping option to appear
    for (const selector of shippingSelectors) {
      const option = this.page.locator(selector).first()
      if (await option.isVisible({ timeout: 2000 }).catch(() => false)) {
        return
      }
    }

    // If no shipping options found, throw error
    throw new Error(`Shipping methods not found after ${timeout}ms. Tried selectors: ${shippingSelectors.join(', ')}`)
  }

  /**
   * Select shipping method by index (0-based)
   */
  async selectShippingMethod(index = 0) {
    // Try multiple selectors for shipping options
    const selectors = [
      '[data-testid="shipping-method"]',
      'input[type="radio"][name="shippingMethod"]',
      'input[type="radio"][name="shipping"]',
      '[id^="ship-"]', // RadioGroupItem with id="ship-${method.id}"
      '.shipping-method-selector label',
      'button[role="radio"]',
    ]

    for (const selector of selectors) {
      const options = this.page.locator(selector)
      const count = await options.count()
      if (count > index) {
        await options.nth(index).click()
        await this.page.waitForTimeout(500)
        return
      }
    }

    // Fallback: click any visible shipping option
    const anyOption = this.page.locator('.shipping-method-selector label:visible, [data-state] label:visible').first()
    if (await anyOption.isVisible({ timeout: 2000 }).catch(() => false)) {
      await anyOption.click()
      await this.page.waitForTimeout(500)
    }
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

  /**
   * Wait for cart to update after adding item
   * Checks for button state change and loading spinners
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
    catch {
      // Continue anyway
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
        return
      }
    }

    // Fallback: wait a bit more for state to sync
    await this.page.waitForTimeout(2000)
  }
}
