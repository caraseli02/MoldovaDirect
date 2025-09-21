import { test, expect } from '../fixtures/base'
import { CartTestHelpers } from '../fixtures/cart-helpers'

test.describe('Cart Cross-Browser Compatibility', () => {
  let cartHelpers: CartTestHelpers

  test.beforeEach(async ({ page, resetDatabase, seedDatabase }) => {
    await resetDatabase()
    await seedDatabase()
    
    cartHelpers = new CartTestHelpers(page)
    await cartHelpers.clearAllStorage()
  })

  test('should add products to cart across browsers', async ({ page, testProducts }) => {
    await page.goto('/products')
    
    // Wait for products to load with longer timeout for slower browsers
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 15000 })
    
    const product = testProducts[0]
    
    // Add first product to cart
    await cartHelpers.addProductFromListing(product.id)
    
    // Verify cart icon shows correct count
    await expect(cartHelpers.getCartIcon()).toContainText('1')
    
    // Navigate to cart and verify item is there
    await cartHelpers.goToCart()
    await expect(cartHelpers.getCartItem(product.id)).toBeVisible()
  })

  test('should persist cart data across page reloads', async ({ page, testProducts }) => {
    const product = testProducts[0]
    
    await page.goto('/products')
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 15000 })
    
    // Add product to cart
    await cartHelpers.addProductFromListing(product.id)
    
    // Verify cart persistence
    await cartHelpers.verifyCartPersistence(1)
    
    // Navigate to cart and verify item is still there
    await cartHelpers.goToCart()
    await expect(cartHelpers.getCartItem(product.id)).toBeVisible()
  })

  test('should handle quantity updates', async ({ page, testProducts }) => {
    const product = testProducts[0]
    
    await page.goto('/products')
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 15000 })
    
    // Add product to cart
    await cartHelpers.addProductFromListing(product.id)
    
    // Navigate to cart
    await cartHelpers.goToCart()
    
    // Increase quantity
    await cartHelpers.increaseQuantity(product.id)
    
    // Verify quantity display updated
    await expect(cartHelpers.getQuantityDisplay(product.id)).toContainText('2')
    
    // Verify cart icon updated
    await expect(cartHelpers.getCartIcon()).toContainText('2')
  })

  test('should remove items from cart', async ({ page, testProducts }) => {
    const product = testProducts[0]
    
    await page.goto('/products')
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 15000 })
    
    // Add product to cart
    await cartHelpers.addProductFromListing(product.id)
    
    // Navigate to cart
    await cartHelpers.goToCart()
    
    // Remove item
    await cartHelpers.removeItem(product.id)
    
    // Verify empty cart state
    expect(await cartHelpers.isCartEmpty()).toBe(true)
  })

  test('should handle localStorage availability fallback', async ({ page, testProducts }) => {
    const product = testProducts[0]
    
    // Test with localStorage disabled
    await cartHelpers.simulateStorageFailure('localStorage')
    
    await page.goto('/products')
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 15000 })
    
    // Should still be able to add to cart (using sessionStorage fallback)
    await cartHelpers.addProductFromListing(product.id)
    
    // Cart should still work
    await expect(cartHelpers.getCartIcon()).toContainText('1')
  })

  test('should handle network errors gracefully', async ({ page, testProducts }) => {
    const product = testProducts[0]
    
    await page.goto('/products')
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 15000 })
    
    // Add product to cart first
    await cartHelpers.addProductFromListing(product.id)
    
    // Navigate to cart
    await cartHelpers.goToCart()
    
    // Simulate network failure
    await cartHelpers.simulateNetworkFailure()
    
    // Try to update quantity (should fail gracefully)
    await cartHelpers.increaseQuantity(product.id)
    
    // Should show error toast
    await expect(cartHelpers.getToast()).toBeVisible()
    
    // Restore network
    await cartHelpers.restoreNetwork()
    
    // Should be able to retry
    const retryButton = page.locator('[data-testid="toast-action-button"]')
    if (await retryButton.isVisible()) {
      await cartHelpers.clickToastAction()
      
      // Should succeed now
      await cartHelpers.waitForCartUpdate()
      await expect(cartHelpers.getQuantityDisplay(product.id)).toContainText('2')
    }
  })

  // Browser-specific tests based on project name
  test('should handle browser-specific behaviors', async ({ page, testProducts }, testInfo) => {
    const browserName = testInfo.project.name.split('-')[0]
    const product = testProducts[0]
    
    if (browserName === 'webkit') {
      // Safari-specific localStorage behavior in private mode
      await page.goto('/products')
      await page.waitForSelector('[data-testid="product-card"]', { timeout: 15000 })
      
      await cartHelpers.addProductFromListing(product.id)
      
      // Verify cart works despite Safari quirks
      await expect(cartHelpers.getCartIcon()).toContainText('1')
      
      await cartHelpers.goToCart()
      await expect(cartHelpers.getCartItem(product.id)).toBeVisible()
    }
    
    if (browserName === 'firefox') {
      // Firefox-specific storage event behavior
      await page.goto('/products')
      await page.waitForSelector('[data-testid="product-card"]', { timeout: 15000 })
      
      await cartHelpers.addProductFromListing(product.id)
      
      // Open new tab to test cross-tab synchronization
      const newPage = await page.context().newPage()
      const newCartHelpers = new CartTestHelpers(newPage)
      
      await newCartHelpers.goToCart()
      
      // Should show cart item in new tab
      await expect(newCartHelpers.getCartItem(product.id)).toBeVisible()
      
      await newPage.close()
    }
    
    if (browserName === 'chromium') {
      // Chrome-specific performance optimizations
      await page.goto('/products')
      await page.waitForSelector('[data-testid="product-card"]', { timeout: 15000 })
      
      // Test rapid cart operations
      const operationTime = await cartHelpers.measureOperationTime(async () => {
        await cartHelpers.addProductFromListing(product.id)
        await cartHelpers.goToCart()
        await cartHelpers.increaseQuantity(product.id)
        await cartHelpers.increaseQuantity(product.id)
      })
      
      // Should complete quickly in Chrome
      expect(operationTime).toBeLessThan(5000)
    }
  })

  // Mobile vs Desktop specific tests
  test('should handle device-specific interactions', async ({ page, testProducts }, testInfo) => {
    const isMobile = testInfo.project.name.includes('Mobile')
    const product = testProducts[0]
    
    await page.goto('/products')
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 15000 })
    
    if (isMobile) {
      // Mobile-specific touch interactions
      const firstProduct = page.locator('[data-testid="product-card"]').first()
      const addButton = firstProduct.locator('button:has-text("Añadir al Carrito")')
      await addButton.tap()
      
      await cartHelpers.goToCart()
      
      // Test touch interactions on quantity controls
      const increaseButton = page.locator(`[data-testid="increase-quantity-${product.id}"]`)
      await increaseButton.tap()
      
      // Verify quantity updated
      await cartHelpers.waitForCartUpdate()
      await expect(cartHelpers.getQuantityDisplay(product.id)).toContainText('2')
      
      // Check mobile-specific elements are visible
      const mobileElements = page.locator('.lg\\:hidden')
      if (await mobileElements.count() > 0) {
        await expect(mobileElements.first()).toBeVisible()
      }
    } else {
      // Desktop-specific interactions
      await cartHelpers.addProductFromListing(product.id)
      await cartHelpers.goToCart()
      
      // Test keyboard navigation
      const increaseButton = page.locator(`[data-testid="increase-quantity-${product.id}"]`)
      await increaseButton.focus()
      await page.keyboard.press('Enter')
      
      // Verify quantity updated
      await cartHelpers.waitForCartUpdate()
      await expect(cartHelpers.getQuantityDisplay(product.id)).toContainText('2')
      
      // Test hover interactions
      const cartItem = cartHelpers.getCartItem(product.id)
      await cartItem.hover()
      
      // Remove button should be visible on hover
      const removeButton = page.locator(`[data-testid="remove-item-${product.id}"]`)
      await expect(removeButton).toBeVisible()
    }
  })

  // Cross-browser compatibility tests
  test.describe('Cross-Browser Data Compatibility', () => {
    test('should maintain cart data format across browsers', async ({ page, testProducts }) => {
      const product = testProducts[0]
      
      // Test that cart data saved in one browser format works in others
      const cartData = {
        items: [{
          id: 'test-item-1',
          product: product,
          quantity: 2,
          addedAt: new Date().toISOString()
        }],
        sessionId: 'cross-browser-session',
        updatedAt: new Date().toISOString()
      }
      
      // Set cart data directly in localStorage
      await cartHelpers.setCartDataInStorage(cartData)
      
      // Navigate to cart
      await cartHelpers.goToCart()
      
      // Should load cart data correctly
      await expect(cartHelpers.getCartItem(product.id)).toBeVisible()
      await expect(cartHelpers.getQuantityDisplay(product.id)).toContainText('2')
    })

    test('should handle different date formats across browsers', async ({ page, testProducts }) => {
      const product = testProducts[0]
      
      // Test with different date formats that might be produced by different browsers
      const cartDataWithDifferentDates = {
        items: [{
          id: 'date-test-item',
          product: product,
          quantity: 1,
          addedAt: '2024-01-15T10:30:00.000Z' // ISO string format
        }],
        sessionId: 'date-test-session',
        updatedAt: new Date().toISOString()
      }
      
      await cartHelpers.setCartDataInStorage(cartDataWithDifferentDates)
      
      await cartHelpers.goToCart()
      
      // Should handle date parsing correctly
      await expect(cartHelpers.getCartItem(product.id)).toBeVisible()
    })
  })

  // Performance tests across browsers
  test.describe('Cross-Browser Performance', () => {
    test('should load cart within acceptable time across all browsers', async ({ page, testProducts }) => {
      // Add multiple items to test performance
      await page.goto('/products')
      await page.waitForSelector('[data-testid="product-card"]', { timeout: 15000 })
      
      // Add multiple products to cart
      const productsToAdd = testProducts.slice(0, 3)
      for (const product of productsToAdd) {
        await cartHelpers.addProductFromListing(product.id)
      }
      
      // Measure cart page load time
      const loadTime = await cartHelpers.measureOperationTime(async () => {
        await cartHelpers.goToCart()
        await cartHelpers.waitForCartUpdate()
      })
      
      // Should load within 5 seconds even with multiple items
      expect(loadTime).toBeLessThan(5000)
      
      // Verify all items loaded
      for (const product of productsToAdd) {
        await expect(cartHelpers.getCartItem(product.id)).toBeVisible()
      }
    })
  })
})