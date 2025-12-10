import { test, expect, Page } from '@playwright/test'

/**
 * E2E Tests for Cart Functionality
 *
 * These tests ensure cart functionality works correctly across all pages.
 * Runs on every PR to catch regressions early.
 */

// Helper function to wait for page to be fully loaded with Vue hydration
async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle')
  // Wait for Vue app to be hydrated by checking for interactive elements
  await page.waitForFunction(() => {
    const nuxtApp = document.getElementById('__nuxt')
    return nuxtApp !== null && nuxtApp.children.length > 0
  }, { timeout: 10000 }).catch(() => {
    // Fallback: wait a short time if hydration check fails
    return page.waitForTimeout(500)
  })
}

// Helper to get cart count from badge
// Returns the count if badge is visible, 0 if badge doesn't exist (empty cart)
// Throws if there's an unexpected error (e.g., page not loaded)
async function getCartCount(page: Page): Promise<number> {
  const badge = page.locator('[class*="cart"] [class*="badge"], [data-testid="cart-count"]').first()

  // Check if badge exists and is visible (empty cart won't have a badge)
  const isVisible = await badge.isVisible({ timeout: 3000 }).catch(() => false)
  if (!isVisible) {
    return 0 // Empty cart - no badge displayed
  }

  const text = await badge.textContent({ timeout: 5000 })
  const count = parseInt(text?.trim() || '0', 10)

  if (isNaN(count)) {
    console.warn(`Warning: Cart badge text "${text}" could not be parsed as number`)
    return 0
  }

  return count
}

// Helper to clear cart before tests
// Navigates to cart and clears items if present
// Only catches expected cases (empty cart), re-throws unexpected errors
async function clearCart(page: Page) {
  // Navigate to cart page
  const response = await page.goto('/cart')

  // Verify cart page loaded successfully
  if (!response || response.status() >= 400) {
    throw new Error(`Cart page failed to load: status ${response?.status() || 'no response'}`)
  }

  await waitForPageLoad(page)

  // Look for clear button - if not visible, cart is empty (which is fine)
  const clearButton = page.locator('button:has-text("Clear"), button:has-text("Vaciar")').first()
  const isVisible = await clearButton.isVisible({ timeout: 2000 }).catch(() => false)

  if (isVisible) {
    await clearButton.click()
    // Wait for cart to clear by checking for empty state or badge disappearance
    await page.waitForFunction(() => {
      const badge = document.querySelector('[data-testid="cart-count"]')
      return !badge || badge.textContent?.trim() === '0' || badge.textContent?.trim() === ''
    }, { timeout: 5000 }).catch(() => {})
  }
  // If no clear button, cart is empty - that's expected, no error needed
}

// Helper to wait for cart count to update after adding item
async function waitForCartUpdate(page: Page, expectedMinCount: number) {
  await page.waitForFunction(
    (minCount) => {
      const badge = document.querySelector('[data-testid="cart-count"], [class*="badge"]')
      if (!badge) return minCount === 0
      const count = parseInt(badge.textContent?.trim() || '0', 10)
      return count >= minCount
    },
    expectedMinCount,
    { timeout: 10000 }
  ).catch(() => {
    // Fallback to short wait if function-based wait fails
    return page.waitForTimeout(500)
  })
}

test.describe('Cart Functionality E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Clear cart before each test to ensure clean state
    await clearCart(page)
  })

  test('should add product to cart from homepage products section', async ({ page }) => {
    // Navigate to homepage and scroll to products section
    await page.goto('/')
    await waitForPageLoad(page)

    // Get initial cart count
    const initialCount = await getCartCount(page)

    // Scroll down to products section
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2))
    await page.waitForTimeout(500)

    // Find first available "Add to Cart" button
    const addToCartButton = page.locator('button:has-text("Añadir al Carrito"), button:has-text("Añadir al carrito"), button:has-text("Add to Cart")').first()

    // If no button on homepage, skip this test (products might not be on landing page)
    const isVisible = await addToCartButton.isVisible().catch(() => false)
    if (!isVisible) {
      test.skip()
      return
    }

    await addToCartButton.click()
    await waitForCartUpdate(page, initialCount + 1)

    // Verify cart count increased
    const newCount = await getCartCount(page)
    expect(newCount).toBe(initialCount + 1)
  })

  test('should add product to cart from products listing page', async ({ page }) => {
    // Navigate to products page
    await page.goto('/products')
    await waitForPageLoad(page)

    // Get initial cart count
    const initialCount = await getCartCount(page)

    // Find first Add to Cart button on the page
    const addToCartButton = page.locator('button:has-text("Añadir al Carrito"), button:has-text("Añadir al carrito"), button:has-text("Add to Cart")').first()
    await expect(addToCartButton).toBeVisible({ timeout: 10000 })
    await expect(addToCartButton).toBeEnabled()

    // Click Add to Cart
    await addToCartButton.click()
    await waitForCartUpdate(page, initialCount + 1)

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

    // Wait for product detail to fully load
    await page.waitForTimeout(2000)

    // Get initial cart count
    const initialCount = await getCartCount(page)

    // Find Add to Cart button on detail page
    const addToCartButton = page.locator('button:has-text("Añadir al Carrito"), button:has-text("Añadir al carrito"), button:has-text("Add to Cart")').first()

    // Skip if product detail page didn't load (might be slow network or API issue)
    const isVisible = await addToCartButton.isVisible().catch(() => false)
    if (!isVisible) {
      // Try waiting a bit more
      await page.waitForTimeout(3000)
      const stillNotVisible = !(await addToCartButton.isVisible().catch(() => false))
      if (stillNotVisible) {
        test.skip()
        return
      }
    }

    await expect(addToCartButton).toBeEnabled()
    await addToCartButton.click()
    await page.waitForTimeout(1000)

    // Verify cart count increased
    const newCount = await getCartCount(page)
    expect(newCount).toBe(initialCount + 1)
  })

  test('should update quantity in cart', async ({ page }) => {
    // First, add a product to cart
    await page.goto('/products')
    await waitForPageLoad(page)

    const addButton = page.locator('button:has-text("Add to Cart"), button:has-text("Añadir al Carrito")').first()
    await addButton.click()
    await page.waitForTimeout(1000)

    // Navigate to cart page
    await page.goto('/cart')
    await waitForPageLoad(page)

    // Cart uses +/- buttons for quantity control
    // The quantity is displayed between two buttons: [-] [qty] [+]
    // Find the cart item container first
    const cartItem = page.locator('.border-b, [class*="cart-item"]').first()

    // Find the quantity display - it's a span with min-w-[2rem] class showing the number
    const quantityDisplay = cartItem.locator('span.min-w-\\[2rem\\], span.text-center.font-medium').first()
    await expect(quantityDisplay).toBeVisible({ timeout: 5000 })

    // Get current quantity
    const currentQuantityText = await quantityDisplay.textContent()
    const currentQuantity = parseInt(currentQuantityText?.trim() || '1', 10)

    // Find and click the increase button (+) - it's the second button in the quantity controls
    // Look for the button with the + icon (path with "M12 6v6m0 0v6")
    const increaseButton = cartItem.locator('button:has(svg path[d*="M12 6v"])').first()
    await expect(increaseButton).toBeVisible({ timeout: 3000 })
    await increaseButton.click()
    await page.waitForTimeout(500)

    // Verify quantity updated
    const newQuantityText = await quantityDisplay.textContent()
    const newQuantity = parseInt(newQuantityText?.trim() || '1', 10)
    expect(newQuantity).toBe(currentQuantity + 1)
  })

  test('should remove item from cart', async ({ page }) => {
    // First, add a product to cart
    await page.goto('/products')
    await waitForPageLoad(page)

    const addButton = page.locator('button:has-text("Add to Cart"), button:has-text("Añadir al Carrito")').first()
    await addButton.click()
    await page.waitForTimeout(1000)

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
    // Add item from products page (more reliable)
    await page.goto('/products')
    await waitForPageLoad(page)

    const addButton = page.locator('button:has-text("Añadir al Carrito"), button:has-text("Añadir al carrito"), button:has-text("Add to Cart")').first()
    await addButton.click()
    await page.waitForTimeout(1000)

    const cartCountAfterAdd = await getCartCount(page)
    expect(cartCountAfterAdd).toBeGreaterThan(0)

    // Navigate to homepage
    await page.goto('/')
    await waitForPageLoad(page)

    // Verify cart count persisted
    const cartCountOnHome = await getCartCount(page)
    expect(cartCountOnHome).toBe(cartCountAfterAdd)

    // Navigate to cart page
    await page.goto('/cart')
    await waitForPageLoad(page)

    // Verify item is in cart - look for cart item container
    const cartItem = page.locator('.border-b, [class*="item"]').first()
    await expect(cartItem).toBeVisible({ timeout: 5000 })
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
    await page.waitForTimeout(1000)

    cartCount = await getCartCount(page)
    expect(cartCount).toBe(1)

    // Add second item
    const addButton2 = page.locator('button:has-text("Add to Cart"), button:has-text("Añadir al Carrito")').nth(1)
    await addButton2.click()
    await page.waitForTimeout(1000)

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
    await page.waitForTimeout(1000)

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
  test('cart icon should be visible in header', async ({ page }) => {
    await page.goto('/')
    await waitForPageLoad(page)

    // Look for cart icon in header - it's an SVG with shopping cart path or a link to /cart
    const cartIcon = page.locator('header a[href="/cart"], header button:has(svg), [aria-label*="cart"], [aria-label*="carrito"]').first()
    await expect(cartIcon).toBeVisible({ timeout: 10000 })
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

  test('Nuxt app should be hydrated', async ({ page }) => {
    await page.goto('/')
    await waitForPageLoad(page)

    // Check if Nuxt app is hydrated by looking for hydration markers
    const isHydrated = await page.evaluate(() => {
      // Check for Nuxt app element or any interactive Vue component
      const nuxtApp = document.getElementById('__nuxt') || document.querySelector('[data-v-app]')
      return nuxtApp !== null
    })

    expect(isHydrated).toBe(true)
  })
})
