/**
 * Helper: Cart Operations
 *
 * Provides utilities for cart-related operations in tests
 */

import { type Page, type Locator, expect } from '@playwright/test'

export class CartHelper {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  /**
   * Add first available product to cart
   */
  async addProductToCart(): Promise<void> {
    // Navigate to home page if not already there
    const currentUrl = this.page.url()
    if (!currentUrl.includes('/es') && !currentUrl.includes('/en') && !currentUrl.includes('/ro') && !currentUrl.includes('/ru')) {
      await this.page.goto('/')
      await this.page.waitForLoadState('networkidle')
    }

    // Find and click first "Add to Cart" button
    const addToCartButton = this.page.locator(
      'button:has-text("Add to Cart"), button:has-text("Añadir al Carrito"), button:has-text("Добавить в корзину"), button:has-text("Adaugă în coș")',
    ).first()

    await addToCartButton.waitFor({ state: 'visible', timeout: 10000 })
    await addToCartButton.click()

    // Wait for cart to update
    await this.page.waitForTimeout(1000)
  }

  /**
   * Add specific product to cart by ID
   */
  async addProductById(productId: string | number): Promise<void> {
    await this.page.goto(`/products/${productId}`)
    await this.page.waitForLoadState('networkidle')

    const addButton = this.page.locator('button:has-text("Add to Cart"), button:has-text("Añadir")')
    await addButton.click()
    await this.page.waitForTimeout(1000)
  }

  /**
   * Navigate to cart page
   */
  async navigateToCart(): Promise<void> {
    await this.page.goto('/cart')
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Get cart item count
   */
  async getCartCount(): Promise<number> {
    const cartBadge = this.page.locator('[class*="cart-count"], [class*="badge"]')

    if (await cartBadge.isVisible()) {
      const text = await cartBadge.textContent()
      return parseInt(text?.trim() || '0', 10)
    }

    return 0
  }

  /**
   * Clear all items from cart
   */
  async clearCart(): Promise<void> {
    await this.navigateToCart()

    const removeButtons = this.page.locator('button:has-text("Remove"), button:has-text("Eliminar"), button:has-text("Удалить")')
    const count = await removeButtons.count()

    for (let i = 0; i < count; i++) {
      await removeButtons.first().click()
      await this.page.waitForTimeout(500)
    }
  }

  /**
   * Verify cart has items
   */
  async verifyCartHasItems(): Promise<void> {
    const count = await this.getCartCount()
    expect(count).toBeGreaterThan(0)
  }

  /**
   * Verify cart is empty
   */
  async verifyCartIsEmpty(): Promise<void> {
    const count = await this.getCartCount()
    expect(count).toBe(0)
  }
}
