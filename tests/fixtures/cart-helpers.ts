import type { Page, Locator } from '@playwright/test'

export interface CartTestProduct {
  id: string
  name: string
  price: number
  stock: number
  slug: string
}

export class CartTestHelpers {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  /**
   * Add a product to cart from product listing page
   */
  async addProductFromListing(productId: string): Promise<void> {
    const productCard = this.page.locator(`[data-testid="product-card-${productId}"]`)
    await productCard.locator('button:has-text("Añadir al Carrito")').click()

    // Wait for toast notification
    await this.page.waitForSelector('[data-testid="toast"]', { timeout: 5000 })
  }

  /**
   * Add a product to cart from product detail page
   */
  async addProductFromDetail(productSlug: string, quantity: number = 1): Promise<void> {
    await this.page.goto(`/products/${productSlug}`)

    // Set quantity if different from 1
    if (quantity !== 1) {
      await this.page.fill('[data-testid="quantity-input"]', quantity.toString())
    }

    await this.page.click('[data-testid="add-to-cart-button"]')

    // Wait for toast notification
    await this.page.waitForSelector('[data-testid="toast"]', { timeout: 5000 })
  }

  /**
   * Navigate to cart page and wait for it to load
   */
  async goToCart(): Promise<void> {
    await this.page.goto('/cart')
    await this.page.waitForSelector('h1:has-text("Carrito")', { timeout: 10000 })
  }

  /**
   * Get cart item element by product ID
   */
  getCartItem(productId: string): Locator {
    return this.page.locator(`[data-testid="cart-item-${productId}"]`)
  }

  /**
   * Get quantity display for a cart item
   */
  getQuantityDisplay(productId: string): Locator {
    return this.page.locator(`[data-testid="quantity-display-${productId}"]`)
  }

  /**
   * Increase quantity of a cart item
   */
  async increaseQuantity(productId: string): Promise<void> {
    await this.page.click(`[data-testid="increase-quantity-${productId}"]`)
    await this.page.waitForTimeout(500) // Wait for update
  }

  /**
   * Decrease quantity of a cart item
   */
  async decreaseQuantity(productId: string): Promise<void> {
    await this.page.click(`[data-testid="decrease-quantity-${productId}"]`)
    await this.page.waitForTimeout(500) // Wait for update
  }

  /**
   * Update quantity directly by typing in input field
   */
  async setQuantity(productId: string, quantity: number): Promise<void> {
    const quantityInput = this.page.locator(`[data-testid="quantity-input-${productId}"]`)
    await quantityInput.fill(quantity.toString())
    await quantityInput.press('Enter')
    await this.page.waitForTimeout(500) // Wait for update
  }

  /**
   * Remove an item from cart
   */
  async removeItem(productId: string): Promise<void> {
    await this.page.click(`[data-testid="remove-item-${productId}"]`)

    // Wait for removal animation/update
    await this.page.waitForTimeout(1000)
  }

  /**
   * Clear entire cart
   */
  async clearCart(): Promise<void> {
    await this.page.click('[data-testid="clear-cart-button"]')

    // Confirm if confirmation dialog appears
    const confirmButton = this.page.locator('button:has-text("OK")').first()
    if (await confirmButton.isVisible({ timeout: 2000 })) {
      await confirmButton.click()
    }

    await this.page.waitForTimeout(1000)
  }

  /**
   * Get cart icon element
   */
  getCartIcon(): Locator {
    return this.page.locator('[data-testid="cart-icon"]')
  }

  /**
   * Get cart item count from cart icon
   */
  async getCartItemCount(): Promise<number> {
    const cartIcon = this.getCartIcon()
    const text = await cartIcon.textContent()
    const match = text?.match(/\d+/)
    return match ? parseInt(match[0]) : 0
  }

  /**
   * Get cart subtotal element
   */
  getSubtotal(): Locator {
    return this.page.locator('[data-testid="cart-subtotal"]')
  }

  /**
   * Get formatted subtotal value
   */
  async getSubtotalValue(): Promise<number> {
    const subtotalElement = this.getSubtotal()
    const text = await subtotalElement.textContent()
    const match = text?.match(/[\d,]+\.?\d*/)?.[0]
    return match ? parseFloat(match.replace(',', '')) : 0
  }

  /**
   * Check if cart is empty
   */
  async isCartEmpty(): Promise<boolean> {
    return await this.page.locator('[data-testid="empty-cart-message"]').isVisible()
  }

  /**
   * Wait for cart to update after an operation
   */
  async waitForCartUpdate(): Promise<void> {
    await this.page.waitForTimeout(1000)

    // Wait for any loading states to complete
    const loadingElements = this.page.locator('[data-testid*="loading"]')
    if (await loadingElements.count() > 0) {
      await loadingElements.first().waitFor({ state: 'hidden', timeout: 5000 })
    }
  }

  /**
   * Verify cart persistence by reloading page
   */
  async verifyCartPersistence(expectedItemCount: number): Promise<void> {
    await this.page.reload()
    await this.waitForCartUpdate()

    const actualCount = await this.getCartItemCount()
    if (actualCount !== expectedItemCount) {
      throw new Error(`Cart persistence failed: expected ${expectedItemCount} items, got ${actualCount}`)
    }
  }

  /**
   * Simulate storage failure
   */
  async simulateStorageFailure(storageType: 'localStorage' | 'sessionStorage' = 'localStorage'): Promise<void> {
    await this.page.addInitScript((type) => {
      Object.defineProperty(window, type, {
        value: {
          getItem: () => { throw new Error(`${type} disabled`) },
          setItem: () => { throw new Error(`${type} disabled`) },
          removeItem: () => { throw new Error(`${type} disabled`) },
          clear: () => { throw new Error(`${type} disabled`) },
        },
      })
    }, storageType)
  }

  /**
   * Simulate network failure
   */
  async simulateNetworkFailure(): Promise<void> {
    await this.page.route('**/api/**', route => route.abort('failed'))
  }

  /**
   * Restore network connectivity
   */
  async restoreNetwork(): Promise<void> {
    await this.page.unroute('**/api/**')
  }

  /**
   * Get toast notification element
   */
  getToast(): Locator {
    return this.page.locator('[data-testid="toast"]').first()
  }

  /**
   * Wait for and verify toast message
   */
  async verifyToastMessage(expectedMessage: string): Promise<void> {
    const toast = this.getToast()
    await toast.waitFor({ state: 'visible', timeout: 5000 })

    const toastText = await toast.textContent()
    if (!toastText?.includes(expectedMessage)) {
      throw new Error(`Expected toast message "${expectedMessage}", got "${toastText}"`)
    }
  }

  /**
   * Click toast action button (like "Undo" or "Retry")
   */
  async clickToastAction(): Promise<void> {
    const actionButton = this.page.locator('[data-testid="toast-action-button"]')
    await actionButton.click()
  }

  /**
   * Dismiss toast notification
   */
  async dismissToast(): Promise<void> {
    const closeButton = this.page.locator('[data-testid="toast-close-button"]')
    if (await closeButton.isVisible()) {
      await closeButton.click()
    }
    else {
      // Wait for auto-dismiss
      await this.getToast().waitFor({ state: 'hidden', timeout: 10000 })
    }
  }

  /**
   * Test bulk operations (if available)
   */
  async selectAllItems(): Promise<void> {
    const selectAllButton = this.page.locator('text=Seleccionar todo')
    if (await selectAllButton.isVisible()) {
      await selectAllButton.click()
      await this.waitForCartUpdate()
    }
  }

  /**
   * Perform bulk removal of selected items
   */
  async bulkRemoveSelected(): Promise<void> {
    const bulkRemoveButton = this.page.locator('button:has-text("Eliminar seleccionados")')
    if (await bulkRemoveButton.isVisible()) {
      await bulkRemoveButton.click()

      // Confirm if confirmation dialog appears
      const confirmButton = this.page.locator('button:has-text("OK")').first()
      if (await confirmButton.isVisible({ timeout: 2000 })) {
        await confirmButton.click()
      }

      await this.waitForCartUpdate()
    }
  }

  /**
   * Save item for later (if feature is available)
   */
  async saveItemForLater(productId: string): Promise<void> {
    const saveButton = this.page.locator(`[data-testid="save-for-later-${productId}"]`)
    if (await saveButton.isVisible()) {
      await saveButton.click()
      await this.waitForCartUpdate()
    }
  }

  /**
   * Move item from saved for later back to cart
   */
  async moveFromSavedToCart(productId: string): Promise<void> {
    const moveButton = this.page.locator(`[data-testid="move-to-cart-${productId}"]`)
    if (await moveButton.isVisible()) {
      await moveButton.click()
      await this.waitForCartUpdate()
    }
  }

  /**
   * Proceed to checkout
   */
  async proceedToCheckout(): Promise<void> {
    const checkoutButton = this.page.locator('[data-testid="checkout-button"]')
    await checkoutButton.click()

    // Wait for navigation to checkout page
    await this.page.waitForURL(/.*\/checkout/, { timeout: 10000 })
  }

  /**
   * Continue shopping from empty cart
   */
  async continueShopping(): Promise<void> {
    const continueButton = this.page.locator('[data-testid="continue-shopping"]')
    await continueButton.click()

    // Wait for navigation to products page
    await this.page.waitForURL(/.*\/products/, { timeout: 10000 })
  }

  /**
   * Change language and verify cart persists
   */
  async changeLanguageAndVerifyCart(locale: string, expectedItemCount: number): Promise<void> {
    // Change language
    const localeButton = this.page.locator(`[data-testid="locale-${locale}"]`)
    if (await localeButton.isVisible()) {
      await localeButton.click()
      await this.waitForCartUpdate()
    }

    // Verify cart persisted
    const actualCount = await this.getCartItemCount()
    if (actualCount !== expectedItemCount) {
      throw new Error(`Cart not preserved after language change: expected ${expectedItemCount} items, got ${actualCount}`)
    }
  }

  /**
   * Measure cart operation performance
   */
  async measureOperationTime(operation: () => Promise<void>): Promise<number> {
    const startTime = Date.now()
    await operation()
    return Date.now() - startTime
  }

  /**
   * Create multiple cart items for testing
   */
  async createTestCart(products: CartTestProduct[]): Promise<void> {
    for (const product of products) {
      await this.addProductFromDetail(product.slug, 1)
    }

    await this.goToCart()
    await this.waitForCartUpdate()
  }

  /**
   * Verify cart state matches expected state
   */
  async verifyCartState(expectedState: {
    itemCount: number
    subtotal?: number
    isEmpty?: boolean
    items?: { productId: string, quantity: number }[]
  }): Promise<void> {
    // Check item count
    const actualItemCount = await this.getCartItemCount()
    if (actualItemCount !== expectedState.itemCount) {
      throw new Error(`Item count mismatch: expected ${expectedState.itemCount}, got ${actualItemCount}`)
    }

    // Check if empty
    if (expectedState.isEmpty !== undefined) {
      const isEmpty = await this.isCartEmpty()
      if (isEmpty !== expectedState.isEmpty) {
        throw new Error(`Empty state mismatch: expected ${expectedState.isEmpty}, got ${isEmpty}`)
      }
    }

    // Check subtotal
    if (expectedState.subtotal !== undefined) {
      const actualSubtotal = await this.getSubtotalValue()
      if (Math.abs(actualSubtotal - expectedState.subtotal) > 0.01) {
        throw new Error(`Subtotal mismatch: expected ${expectedState.subtotal}, got ${actualSubtotal}`)
      }
    }

    // Check individual items
    if (expectedState.items) {
      for (const expectedItem of expectedState.items) {
        const cartItem = this.getCartItem(expectedItem.productId)
        if (!await cartItem.isVisible()) {
          throw new Error(`Expected item ${expectedItem.productId} not found in cart`)
        }

        const quantityDisplay = this.getQuantityDisplay(expectedItem.productId)
        const actualQuantity = parseInt(await quantityDisplay.textContent() || '0')
        if (actualQuantity !== expectedItem.quantity) {
          throw new Error(`Quantity mismatch for ${expectedItem.productId}: expected ${expectedItem.quantity}, got ${actualQuantity}`)
        }
      }
    }
  }

  /**
   * Clear all browser storage
   */
  async clearAllStorage(): Promise<void> {
    await this.page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
  }

  /**
   * Set cart data directly in storage for testing
   */
  async setCartDataInStorage(cartData: any): Promise<void> {
    await this.page.evaluate((data) => {
      localStorage.setItem('moldova-direct-cart', JSON.stringify(data))
    }, cartData)
  }

  /**
   * Get cart data from storage
   */
  async getCartDataFromStorage(): Promise<any> {
    return await this.page.evaluate(() => {
      const data = localStorage.getItem('moldova-direct-cart')
      return data ? JSON.parse(data) : null
    })
  }
}
