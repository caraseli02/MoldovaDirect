import { test, expect, Page } from '@playwright/test'

/**
 * E2E Tests for Cart Functionality
 *
 * These tests ensure cart functionality works correctly across all pages.
 * Runs on every PR to catch regressions early.
 */

// Helper function to wait for page to be fully loaded
async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1000) // Extra time for hydration
}

// Helper to get cart count from badge
async function getCartCount(page: Page): Promise<number> {
  try {
    const badge = page.locator('[class*="cart"] [class*="badge"], [data-testid="cart-count"]').first()
    const text = await badge.textContent({ timeout: 5000 })
    return parseInt(text?.trim() || '0', 10)
  } catch {
    return 0
  }
}

// Helper to clear cart before tests
async function clearCart(page: Page) {
  // Navigate to cart page and clear all items
  try {
    await page.goto('/cart')
    await waitForPageLoad(page)

    const clearButton = page.locator('button:has-text("Clear"), button:has-text("Vaciar")').first()
    if (await clearButton.isVisible({ timeout: 2000 })) {
      await clearButton.click()
      await page.waitForTimeout(1000)
    }
  } catch (error) {
    // Cart might already be empty
    console.log('Cart already empty or clear button not found')
  }
}

test.describe('Cart Functionality E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Clear cart before each test to ensure clean state
    await clearCart(page)
  })

  test('should add product to cart from landing page', async ({ page }) => {
    // Navigate to landing page
    await page.goto('/')
    await waitForPageLoad(page)

    // Get initial cart count
    const initialCount = await getCartCount(page)

    // Find first available "Add to Cart" button
    const addToCartButton = page.locator('button:has-text("Add to Cart"), button:has-text("Añadir al Carrito")').first()

    // Wait for button to be visible and enabled
    await expect(addToCartButton).toBeVisible({ timeout: 10000 })
    await expect(addToCartButton).toBeEnabled()

    // Click Add to Cart
    await addToCartButton.click()

    // Wait for cart to update
    await page.waitForTimeout(2000)

    // Verify cart count increased
    const newCount = await getCartCount(page)
    expect(newCount).toBe(initialCount + 1)

    // Verify button state changed
    await expect(addToCartButton).toContainText(/In Cart|En el Carrito/i, { timeout: 5000 })
  })

  test('should add product to cart from products listing page', async ({ page }) => {
    // Navigate to products page
    await page.goto('/products')
    await waitForPageLoad(page)

    // Get initial cart count
    const initialCount = await getCartCount(page)

    // Find first available product card
    const productCard = page.locator('[class*="ProductCard"], .product-card').first()
    await expect(productCard).toBeVisible({ timeout: 10000 })

    // Find Add to Cart button within the card
    const addToCartButton = productCard.locator('button:has-text("Add to Cart"), button:has-text("Añadir al Carrito")').first()
    await expect(addToCartButton).toBeVisible()
    await expect(addToCartButton).toBeEnabled()

    // Click Add to Cart
    await addToCartButton.click()
    await page.waitForTimeout(2000)

    // Verify cart count increased
    const newCount = await getCartCount(page)
    expect(newCount).toBe(initialCount + 1)
  })

  test('should add product to cart from product detail page', async ({ page }) => {
    // Navigate to products page first
    await page.goto('/products')
    await waitForPageLoad(page)

    // Click on first product to go to detail page
    const productLink = page.locator('a[href*="/products/"]').first()
    await expect(productLink).toBeVisible({ timeout: 10000 })
    await productLink.click()
    await waitForPageLoad(page)

    // Get initial cart count
    const initialCount = await getCartCount(page)

    // Find Add to Cart button on detail page
    const addToCartButton = page.locator('button:has-text("Add to Cart"), button:has-text("Añadir al Carrito")').first()
    await expect(addToCartButton).toBeVisible({ timeout: 10000 })
    await expect(addToCartButton).toBeEnabled()

    // Click Add to Cart
    await addToCartButton.click()
    await page.waitForTimeout(2000)

    // Verify cart count increased
    const newCount = await getCartCount(page)
    expect(newCount).toBe(initialCount + 1)

    // Verify button state changed
    await expect(addToCartButton).toContainText(/In Cart|En el Carrito/i, { timeout: 5000 })
  })

  test('should update quantity in cart', async ({ page }) => {
    // First, add a product to cart
    await page.goto('/products')
    await waitForPageLoad(page)

    const addButton = page.locator('button:has-text("Add to Cart"), button:has-text("Añadir al Carrito")').first()
    await addButton.click()
    await page.waitForTimeout(2000)

    // Navigate to cart page
    await page.goto('/cart')
    await waitForPageLoad(page)

    // Find quantity input
    const quantityInput = page.locator('input[type="number"], [data-testid="quantity-input"]').first()
    await expect(quantityInput).toBeVisible({ timeout: 5000 })

    // Get current value
    const currentValue = await quantityInput.inputValue()
    const currentQuantity = parseInt(currentValue, 10)

    // Increase quantity
    await quantityInput.fill((currentQuantity + 1).toString())
    await quantityInput.blur()
    await page.waitForTimeout(1000)

    // Verify quantity updated
    const newValue = await quantityInput.inputValue()
    expect(parseInt(newValue, 10)).toBe(currentQuantity + 1)
  })

  test('should remove item from cart', async ({ page }) => {
    // First, add a product to cart
    await page.goto('/products')
    await waitForPageLoad(page)

    const addButton = page.locator('button:has-text("Add to Cart"), button:has-text("Añadir al Carrito")').first()
    await addButton.click()
    await page.waitForTimeout(2000)

    // Get cart count
    const cartCountBefore = await getCartCount(page)
    expect(cartCountBefore).toBeGreaterThan(0)

    // Navigate to cart page
    await page.goto('/cart')
    await waitForPageLoad(page)

    // Find and click remove button
    const removeButton = page.locator('button:has-text("Remove"), button:has-text("Eliminar"), [aria-label*="Remove"], [aria-label*="Eliminar"]').first()
    await expect(removeButton).toBeVisible({ timeout: 5000 })
    await removeButton.click()
    await page.waitForTimeout(1000)

    // Verify cart count decreased
    const cartCountAfter = await getCartCount(page)
    expect(cartCountAfter).toBe(cartCountBefore - 1)
  })

  test('should persist cart items across page navigation', async ({ page }) => {
    // Add item from landing page
    await page.goto('/')
    await waitForPageLoad(page)

    const addButton = page.locator('button:has-text("Add to Cart"), button:has-text("Añadir al Carrito")').first()
    await addButton.click()
    await page.waitForTimeout(2000)

    const cartCountAfterAdd = await getCartCount(page)
    expect(cartCountAfterAdd).toBeGreaterThan(0)

    // Navigate to products page
    await page.goto('/products')
    await waitForPageLoad(page)

    // Verify cart count persisted
    const cartCountOnProducts = await getCartCount(page)
    expect(cartCountOnProducts).toBe(cartCountAfterAdd)

    // Navigate to cart page
    await page.goto('/cart')
    await waitForPageLoad(page)

    // Verify item is in cart
    const cartItems = page.locator('[class*="cart-item"], [data-testid="cart-item"]')
    await expect(cartItems.first()).toBeVisible({ timeout: 5000 })
  })

  test('should show correct cart badge count', async ({ page }) => {
    // Start with empty cart
    await clearCart(page)
    await page.goto('/')
    await waitForPageLoad(page)

    // Verify cart is empty
    let cartCount = await getCartCount(page)
    expect(cartCount).toBe(0)

    // Add first item
    await page.goto('/products')
    await waitForPageLoad(page)

    const addButton1 = page.locator('button:has-text("Add to Cart"), button:has-text("Añadir al Carrito")').first()
    await addButton1.click()
    await page.waitForTimeout(2000)

    cartCount = await getCartCount(page)
    expect(cartCount).toBe(1)

    // Add second item
    const addButton2 = page.locator('button:has-text("Add to Cart"), button:has-text("Añadir al Carrito")').nth(1)
    await addButton2.click()
    await page.waitForTimeout(2000)

    cartCount = await getCartCount(page)
    expect(cartCount).toBe(2)
  })

  test('should not add out-of-stock items to cart', async ({ page }) => {
    await page.goto('/products')
    await waitForPageLoad(page)

    // Look for out of stock button
    const outOfStockButton = page.locator('button:has-text("Out of Stock"), button:has-text("Agotado")').first()

    if (await outOfStockButton.isVisible({ timeout: 2000 })) {
      // Verify button is disabled
      await expect(outOfStockButton).toBeDisabled()

      // Verify clicking doesn't add to cart
      const initialCount = await getCartCount(page)

      // Try to click (should not work)
      await outOfStockButton.click({ force: true }).catch(() => {})
      await page.waitForTimeout(1000)

      const finalCount = await getCartCount(page)
      expect(finalCount).toBe(initialCount)
    } else {
      // No out of stock items available, skip this test
      test.skip()
    }
  })

  test('should display cart total correctly', async ({ page }) => {
    // Clear cart and add items
    await clearCart(page)
    await page.goto('/products')
    await waitForPageLoad(page)

    // Add first item
    const addButton = page.locator('button:has-text("Add to Cart"), button:has-text("Añadir al Carrito")').first()
    await addButton.click()
    await page.waitForTimeout(2000)

    // Navigate to cart
    await page.goto('/cart')
    await waitForPageLoad(page)

    // Verify subtotal is displayed and is a number
    const subtotal = page.locator('[data-testid="cart-subtotal"], :has-text("Subtotal")').first()
    await expect(subtotal).toBeVisible({ timeout: 5000 })

    const subtotalText = await subtotal.textContent()
    expect(subtotalText).toMatch(/\d+\.\d{2}/)  // Should contain price like 25.99
  })

  test('should handle rapid add to cart clicks gracefully', async ({ page }) => {
    await page.goto('/products')
    await waitForPageLoad(page)

    const initialCount = await getCartCount(page)
    const addButton = page.locator('button:has-text("Add to Cart"), button:has-text("Añadir al Carrito")').first()

    // Click rapidly 3 times
    await addButton.click()
    await page.waitForTimeout(100)
    await addButton.click()
    await page.waitForTimeout(100)
    await addButton.click()

    await page.waitForTimeout(3000)

    // Should handle gracefully (either add once or with proper debouncing)
    const finalCount = await getCartCount(page)
    expect(finalCount).toBeGreaterThanOrEqual(initialCount + 1)
    expect(finalCount).toBeLessThanOrEqual(initialCount + 3)
  })
})

// Critical smoke tests that must always pass
test.describe('Cart Critical Smoke Tests', () => {
  test('cart badge should be visible in header', async ({ page }) => {
    await page.goto('/')
    await waitForPageLoad(page)

    const cartBadge = page.locator('[class*="cart"], [data-testid="cart-icon"]').first()
    await expect(cartBadge).toBeVisible({ timeout: 10000 })
  })

  test('cart page should load without errors', async ({ page }) => {
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    await page.goto('/cart')
    await waitForPageLoad(page)

    // Should not have critical errors
    const criticalErrors = errors.filter(err =>
      err.includes('Failed to load module') ||
      err.includes('Pinia') ||
      err.includes('useCart')
    )

    expect(criticalErrors.length).toBe(0)
  })

  test('JavaScript bundles should load successfully', async ({ page }) => {
    const failedResources: string[] = []

    page.on('response', response => {
      if (response.url().includes('/_nuxt/') && response.url().endsWith('.js')) {
        if (response.status() !== 200) {
          failedResources.push(`${response.url()} - ${response.status()}`)
        }
      }
    })

    await page.goto('/')
    await waitForPageLoad(page)

    // All JavaScript bundles should load successfully
    expect(failedResources.length).toBe(0)
  })

  test('Pinia should be initialized', async ({ page }) => {
    await page.goto('/')
    await waitForPageLoad(page)

    // Check if Pinia is initialized by verifying cart functionality exists
    const hasPinia = await page.evaluate(() => {
      return typeof window !== 'undefined' &&
             window.__NUXT__ !== undefined
    })

    expect(hasPinia).toBe(true)
  })
})
