import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'
import { CartTestHelpers } from './cart-helpers'

export class TestHelpers {
  readonly cart: CartTestHelpers

  constructor(private page: Page) {
    this.cart = new CartTestHelpers(page)
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle')
    await this.page.waitForTimeout(500)
  }

  async checkLocale(expectedLocale: string) {
    const htmlLang = await this.page.getAttribute('html', 'lang')
    expect(htmlLang).toBe(expectedLocale)
  }

  async changeLocale(newLocale: string) {
    await this.page.click('[data-testid="locale-switcher"]')
    await this.page.click(`[data-testid="locale-${newLocale}"]`)
    await this.waitForPageLoad()
    await this.checkLocale(newLocale)
  }

  async addToCart(productId: string) {
    await this.page.click(`[data-testid="add-to-cart-${productId}"]`)
    await this.page.waitForSelector('[data-testid="cart-notification"]')
  }

  async goToCart() {
    await this.page.click('[data-testid="cart-icon"]')
    await this.page.waitForURL('**/cart')
  }

  async login(email: string, password: string) {
    await this.page.goto('/login')
    await this.page.fill('[data-testid="email-input"]', email)
    await this.page.fill('[data-testid="password-input"]', password)
    await this.page.click('[data-testid="login-button"]')
    await this.page.waitForURL(/\/(account|$)/)
  }

  async logout() {
    await this.page.click('[data-testid="user-menu"]')
    await this.page.click('[data-testid="logout-button"]')
    await this.page.waitForURL('**/')
  }

  async searchProducts(query: string) {
    await this.page.fill('[data-testid="search-input"]', query)
    await this.page.press('[data-testid="search-input"]', 'Enter')
    await this.waitForPageLoad()
  }

  async selectCategory(category: string) {
    await this.page.click(`[data-testid="category-${category}"]`)
    await this.waitForPageLoad()
  }

  async proceedToCheckout() {
    await this.goToCart()
    await this.page.click('[data-testid="checkout-button"]')
    await this.page.waitForURL('**/checkout')
  }

  async fillCheckoutForm(data: {
    fullName: string
    email: string
    phone: string
    address: string
    city: string
    postalCode: string
  }) {
    await this.page.fill('[data-testid="fullname-input"]', data.fullName)
    await this.page.fill('[data-testid="email-input"]', data.email)
    await this.page.fill('[data-testid="phone-input"]', data.phone)
    await this.page.fill('[data-testid="address-input"]', data.address)
    await this.page.fill('[data-testid="city-input"]', data.city)
    await this.page.fill('[data-testid="postal-input"]', data.postalCode)
  }

  async submitOrder() {
    await this.page.click('[data-testid="submit-order-button"]')
    await this.page.waitForURL('**/order-confirmation')
  }

  async checkToast(message: string) {
    const toast = this.page.locator('[data-testid="toast"]').first()
    await expect(toast).toContainText(message)
  }

  async checkToastType(type: 'success' | 'error' | 'warning' | 'info') {
    const toast = this.page.locator('[data-testid="toast"]').first()
    const typeIcon = toast.locator(`[data-testid="toast-type-${type}"]`)
    await expect(typeIcon).toBeVisible()
  }

  async clickToastAction() {
    const toast = this.page.locator('[data-testid="toast"]').first()
    const actionButton = toast.locator('[data-testid="toast-action-button"]')
    await actionButton.click()
  }

  async dismissToast() {
    const toast = this.page.locator('[data-testid="toast"]').first()
    const closeButton = toast.locator('[data-testid="toast-close-button"]')
    await closeButton.click()
  }

  async checkPageTitle(title: string) {
    await expect(this.page).toHaveTitle(title)
  }

  async checkHeading(text: string) {
    const heading = this.page.locator('h1')
    await expect(heading).toContainText(text)
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({
      path: `tests/visual/screenshots/${name}.png`,
      fullPage: true,
    })
  }

  async checkAccessibility() {
    const violations = await this.page.evaluate(() => {
      return []
    })
    expect(violations).toHaveLength(0)
  }
}
