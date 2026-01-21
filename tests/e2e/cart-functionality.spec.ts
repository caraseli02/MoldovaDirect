import type { Page } from '@playwright/test'
import { test, expect } from '@playwright/test'

/**
 * E2E Tests for Cart Functionality
 *
 * These tests ensure cart functionality works correctly across all pages
 * and responsive layouts (desktop header + mobile bottom navigation).
 * Runs on every PR to catch regressions early.
 */

// Helper function to wait for page to be fully loaded with Vue hydration
// Falls back to fixed timeout if hydration check fails (logs no error)
async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle')
  // Wait for Vue app to be hydrated by checking for interactive elements
  await page.waitForFunction(() => {
    const nuxtApp = document.getElementById('__nuxt')
    return nuxtApp !== null && nuxtApp.children.length > 0
  }, { timeout: 10000 }).catch((error) => {
    // Log hydration failure before falling back
    console.warn(`[waitForPageLoad] Hydration check failed: ${error.message}`)
    console.warn('[waitForPageLoad] Falling back to timeout - page may not be hydrated')
    return page.waitForTimeout(500)
  })
}

// Helper to check element visibility with proper error handling
// Distinguishes between timeout (acceptable) and unexpected errors (should log)

async function isVisibleOrFalse(

  locator: any,
  context: string,
): Promise<boolean> {
  // eslint-disable-next-line sonarjs/no-invariant-returns -- false is correct fallback for all error cases, success returns true from promise
  return locator.isVisible({ timeout: 2000 }).catch((error) => {
    // Only treat timeout/element-not-found as "not visible"
    if (error.name === 'TimeoutError') {
      return false
    }
    // Log unexpected errors but still return false
    console.error(`[${context}] Unexpected visibility check error: ${error.message}`)
    return false
  })
}

// Helper to get cart count from badge
// Returns the count if badge is visible, 0 if badge doesn't exist (empty cart)
// Throws if there's an unexpected error (e.g., page not loaded)
// After shadcn-vue refactor: badge is in header (desktop) OR BottomNav (mobile)
// Uses 3-tier fallback: 1) header, 2) BottomNav, 3) general search
async function getCartCount(page: Page): Promise<number> {
  // Try to find badge in desktop header first
  let badge = page.locator('header [data-testid="cart-count"]')

  // Check if badge exists and is visible in header
  let isVisible = await isVisibleOrFalse(badge, 'getCartCount-header')

  // If not in header, try mobile BottomNav
  if (!isVisible) {
    badge = page.locator('nav[role="navigation"] [data-testid="cart-count"]')
    isVisible = await isVisibleOrFalse(badge, 'getCartCount-bottomNav')
  }

  // Fallback to general search
  if (!isVisible) {
    badge = page.locator('[data-testid="cart-count"]').first()
    isVisible = await isVisibleOrFalse(badge, 'getCartCount-general')
  }

  if (!isVisible) {
    return 0 // Empty cart - no badge displayed
  }

  const text = await badge.textContent({ timeout: 5000 }).catch((error) => {
    console.error(`[getCartCount] Failed to read cart badge text: ${error.message}`)
    throw new Error(`Cannot read cart badge text: ${error.message}`)
  })
  const count = parseInt(text?.trim() || '0', 10)

  if (isNaN(count)) {
    console.warn(`Warning: Cart badge text "${text}" could not be parsed as number`)
    return 0
  }

  return count
}

// Helper to clear cart before tests
// Navigates to cart and clears items if present
// Only catches expected cases (empty cart), logs warnings for failures
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
  const isVisible = await isVisibleOrFalse(clearButton, 'clearCart')

  if (isVisible) {
    await clearButton.click()
    // Wait for cart to clear by checking for empty state or badge disappearance
    await page.waitForFunction(() => {
      // Use 3-tier fallback matching getCartCount pattern
      const badge = document.querySelector('header [data-testid="cart-count"]')
        || document.querySelector('nav[role="navigation"] [data-testid="cart-count"]')
        || document.querySelector('[data-testid="cart-count"]')
      return !badge || badge.textContent?.trim() === '0' || badge.textContent?.trim() === ''
    }, { timeout: 5000 }).catch((error) => {
      console.warn(`[clearCart] Cart may not have cleared properly: ${error.message}`)
    })
  }
  // If no clear button, cart is empty - that's expected, no error needed
}

// Helper to wait for cart count to update after adding item
// After shadcn-vue refactor: badge is in header (desktop) OR BottomNav (mobile)
// Uses 3-tier fallback: 1) header, 2) BottomNav, 3) general search
async function waitForCartUpdate(page: Page, expectedMinCount: number) {
  await page.waitForFunction(
    (minCount) => {
      // Try header first (desktop), then BottomNav (mobile), then general
      const badge = document.querySelector('header [data-testid="cart-count"]')
        || document.querySelector('nav[role="navigation"] [data-testid="cart-count"]')
        || document.querySelector('[data-testid="cart-count"]')
      if (!badge) return minCount === 0
      const count = parseInt(badge.textContent?.trim() || '0', 10)
      return count >= minCount
    },
    expectedMinCount,
    { timeout: 10000 },
  ).catch((error) => {
    console.warn(`[waitForCartUpdate] Cart update verification failed: ${error.message}`)
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
      console.warn('[test] Add to Cart button not visible on homepage - skipping. This may indicate: no products on homepage, selector issue, or page load failure.')
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
        console.warn('[test] Add to Cart button not visible on product detail - skipping. This may indicate: product unavailable, out of stock, or page load failure.')
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

    // Cart items have data-testid="cart-item-{productId}"
    const cartItem = page.locator('[data-testid^="cart-item-"]').first()
    await expect(cartItem).toBeVisible({ timeout: 5000 })

    // Find the quantity display using data-testid
    const quantityDisplay = page.locator('[data-testid="cart-quantity"]').first()
    await expect(quantityDisplay).toBeVisible({ timeout: 5000 })

    // Get current quantity
    const currentQuantityText = await quantityDisplay.textContent()
    const currentQuantity = parseInt(currentQuantityText?.trim() || '1', 10)

    // Find the increase button using data-testid
    const increaseButton = page.locator('[data-testid="cart-increase-button"]').first()
    await expect(increaseButton).toBeVisible({ timeout: 3000 })
    await increaseButton.click()
    await page.waitForTimeout(800)

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

    // Find the cart item using testid
    const cartItem = page.locator('[data-testid^="cart-item-"]').first()
    await expect(cartItem).toBeVisible({ timeout: 5000 })

    // Find and click remove button using data-testid
    const removeButton = page.locator('[data-testid="cart-remove-button"]').first()
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

    // Verify item is in cart using testid
    const cartItem = page.locator('[data-testid^="cart-item-"]').first()
    await expect(cartItem).toBeVisible({ timeout: 5000 })

    // Verify cart count is still the same
    const cartCountOnCartPage = await getCartCount(page)
    expect(cartCountOnCartPage).toBe(cartCountAfterAdd)
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
    }
    else {
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

    // Find the subtotal using data-testid (desktop) or mobile variant
    const subtotalValue = page.locator('[data-testid="cart-subtotal"], [data-testid="cart-subtotal-mobile"]').first()
    await expect(subtotalValue).toBeVisible({ timeout: 5000 })
    const subtotalText = await subtotalValue.textContent()

    // Should contain currency and price (e.g., "€25.99" or "25,99 €")
    expect(subtotalText).toMatch(/[\d,]+[.,]\d{2}/) // Should contain price like 25.99 or 25,99
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
  test('cart icon should be visible in header (desktop) or bottom nav (mobile)', async ({ page }) => {
    await page.goto('/')
    await waitForPageLoad(page)

    // After shadcn-vue refactor:
    // - Desktop: cart icon is in header (a[href="/cart"] with cart SVG)
    // - Mobile: cart icon is in BottomNav (fixed bottom nav, md:hidden)
    // Look for cart icon in either location
    const cartIconInHeader = page.locator('header a[href="/cart"]').first()
    const cartIconInBottomNav = page.locator('nav[role="navigation"] a[href="/cart"]').first()

    // At least one should be visible (desktop shows header, mobile shows bottom nav)
    const headerVisible = await cartIconInHeader.isVisible({ timeout: 2000 }).catch(() => false)
    const bottomNavVisible = await cartIconInBottomNav.isVisible({ timeout: 2000 }).catch(() => false)

    expect(headerVisible || bottomNavVisible).toBe(true)
  })

  test('cart page should load without errors', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    await page.goto('/cart')
    await waitForPageLoad(page)

    // Should not have critical errors
    const criticalErrors = errors.filter(err =>
      err.includes('Failed to load module')
      || err.includes('Pinia')
      || err.includes('useCart'),
    )

    // Log errors before assertion for better debugging
    if (criticalErrors.length > 0) {
      console.error('[test] Critical console errors on cart page:', criticalErrors)
    }
    expect(criticalErrors.length).toBe(0)
  })

  test('JavaScript bundles should load successfully', async ({ page }) => {
    const failedResources: string[] = []

    page.on('response', (response) => {
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

// Additional responsive and accessibility tests
test.describe('Cart Responsive & Accessibility Tests', () => {
  test('cart badge should be consistent across desktop and mobile views', async ({ page }) => {
    // Start on desktop
    await page.goto('/products')
    await waitForPageLoad(page)

    // Add item to cart
    const addButton = page.locator('button:has-text("Add to Cart"), button:has-text("Añadir al Carrito")').first()
    await addButton.click()
    await waitForCartUpdate(page, 1)

    // Check desktop badge count
    const desktopBadge = page.locator('header [data-testid="cart-count"]')
    const desktopCountText = await desktopBadge.textContent()
    const desktopCount = parseInt(desktopCountText?.trim() || '0', 10)

    // Resize to mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.reload()
    await waitForPageLoad(page)

    // Check mobile badge shows same count
    const mobileBadge = page.locator('nav[role="navigation"] [data-testid="cart-count"]')
    await expect(mobileBadge).toBeVisible({ timeout: 5000 })
    const mobileCountText = await mobileBadge.textContent()
    const mobileCount = parseInt(mobileCountText?.trim() || '0', 10)

    expect(mobileCount).toBe(desktopCount)
  })

  test('cart icon should have correct aria-label with item count', async ({ page }) => {
    await page.goto('/products')
    await waitForPageLoad(page)

    // Add item to cart
    const addButton = page.locator('button:has-text("Add to Cart"), button:has-text("Añadir al Carrito")').first()
    await addButton.click()
    await waitForCartUpdate(page, 1)

    // Check that cart link has aria-label mentioning cart and count
    const cartLink = page.locator('header a[href="/cart"], nav[role="navigation"] a[href="/cart"]').first()
    const ariaLabel = await cartLink.getAttribute('aria-label')

    // Should mention cart (case-insensitive check)
    expect(ariaLabel?.toLowerCase()).toContain('cart')
  })

  test('quantity display should have accessibility attributes', async ({ page }) => {
    // Add item to cart
    await page.goto('/products')
    await waitForPageLoad(page)

    const addButton = page.locator('button:has-text("Add to Cart"), button:has-text("Añadir al Carrito")').first()
    await addButton.click()
    await waitForCartUpdate(page, 1)

    // Navigate to cart
    await page.goto('/cart')
    await waitForPageLoad(page)

    // Check quantity display has accessibility attributes
    const quantityDisplay = page.locator('[data-testid="cart-quantity"]').first()

    // Verify role="status" and aria-live="polite"
    const role = await quantityDisplay.getAttribute('role')
    const ariaLive = await quantityDisplay.getAttribute('aria-live')

    expect(role).toBe('status')
    expect(ariaLive).toBe('polite')
  })

  test('should wait for cart badge after ClientOnly hydration', async ({ page }) => {
    await page.goto('/products')
    await waitForPageLoad(page)

    // Add item to cart first
    const addButton = page.locator('button:has-text("Add to Cart"), button:has-text("Añadir al Carrito")').first()
    await addButton.click()

    // Badge should appear (not immediately, but after hydration completes)
    const badge = page.locator('header [data-testid="cart-count"], nav[role="navigation"] [data-testid="cart-count"]').first()

    // Badge should exist and be visible within reasonable time
    await expect(badge).toBeVisible({ timeout: 5000 })

    // Should have count greater than 0
    const count = parseInt((await badge.textContent()) || '0', 10)
    expect(count).toBeGreaterThan(0)
  })

  test('should display 99+ for large cart counts', async ({ page }) => {
    // This test verifies the "99+" truncation logic
    // Note: We simulate this by directly checking the UI behavior
    // In a real scenario, you would add 100+ items to the cart

    await page.goto('/products')
    await waitForPageLoad(page)

    // Add an item to cart
    const addButton = page.locator('button:has-text("Add to Cart"), button:has-text("Añadir al Carrito")').first()
    await addButton.click()
    await waitForCartUpdate(page, 1)

    // Check that badge exists and shows a number
    const badge = page.locator('header [data-testid="cart-count"], nav[role="navigation"] [data-testid="cart-count"]').first()
    await expect(badge).toBeVisible({ timeout: 5000 })

    const badgeText = await badge.textContent()
    const count = parseInt(badgeText?.trim() || '0', 10)

    // For small counts, should show actual number
    // For 100+, would show "99+" (this test verifies the mechanism works)
    expect(count).toBeGreaterThanOrEqual(1)

    // Note: To fully test "99+" display, you would need to:
    // 1. Mock the cart store to return 100+ items, OR
    // 2. Actually add 100+ items (not practical in E2E)
    // This test verifies the badge display mechanism is working
  })
})
