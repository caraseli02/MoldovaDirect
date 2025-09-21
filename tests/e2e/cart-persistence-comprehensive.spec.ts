/**
 * Comprehensive Cart Persistence E2E Tests
 * 
 * Requirements addressed:
 * - Test cart persistence across browser sessions
 * - Test localStorage/sessionStorage fallback mechanisms
 * - Test cart data migration between storage types
 * - Test cart recovery from corrupted data
 * - Test cart expiration and cleanup
 * - Test cross-tab synchronization
 */

import { test, expect } from '../fixtures/base'
import { CartTestHelpers } from '../fixtures/cart-helpers'

test.describe('Cart Persistence - Comprehensive Tests', () => {
  let cartHelpers: CartTestHelpers

  test.beforeEach(async ({ page, resetDatabase, seedDatabase }) => {
    await resetDatabase()
    await seedDatabase()
    
    cartHelpers = new CartTestHelpers(page)
    await cartHelpers.clearAllStorage()
  })

  test.describe('Basic Persistence', () => {
    test('should persist cart across page reloads', async ({ page, testProducts }) => {
      const product = testProducts[0]
      
      // Add product to cart
      await page.goto('/products')
      await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
      await cartHelpers.addProductFromListing(product.id)
      
      // Verify cart state
      await cartHelpers.verifyCartState({ itemCount: 1, isEmpty: false })
      
      // Reload page
      await page.reload()
      await cartHelpers.waitForCartUpdate()
      
      // Verify cart persisted
      await cartHelpers.verifyCartState({ itemCount: 1, isEmpty: false })
      
      // Navigate to cart and verify item details
      await cartHelpers.goToCart()
      await expect(cartHelpers.getCartItem(product.id)).toBeVisible()
      await expect(cartHelpers.getQuantityDisplay(product.id)).toContainText('1')
    })

    test('should persist cart across browser sessions', async ({ page, testProducts, context }) => {
      const product = testProducts[0]
      
      // Add product to cart
      await page.goto('/products')
      await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
      await cartHelpers.addProductFromListing(product.id)
      
      // Close current page
      await page.close()
      
      // Create new page (simulating new browser session)
      const newPage = await context.newPage()
      const newCartHelpers = new CartTestHelpers(newPage)
      
      // Navigate to cart
      await newCartHelpers.goToCart()
      
      // Verify cart persisted across sessions
      await expect(newCartHelpers.getCartItem(product.id)).toBeVisible()
      await expect(newCartHelpers.getQuantityDisplay(product.id)).toContainText('1')
    })

    test('should persist multiple items with different quantities', async ({ page, testProducts }) => {
      // Add multiple products with different quantities
      await page.goto('/products')
      await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
      
      const expectedItems = []
      for (let i = 0; i < 3; i++) {
        const product = testProducts[i]
        const quantity = i + 1
        
        await cartHelpers.addProductFromListing(product.id)
        
        // Add additional quantities for products 2 and 3
        if (i > 0) {
          await cartHelpers.goToCart()
          for (let j = 1; j < quantity; j++) {
            await cartHelpers.increaseQuantity(product.id)
          }
          await page.goto('/products')
          await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
        }
        
        expectedItems.push({ productId: product.id, quantity })
      }
      
      // Reload page
      await page.reload()
      await cartHelpers.waitForCartUpdate()
      
      // Verify all items persisted with correct quantities
      await cartHelpers.verifyCartState({
        itemCount: 6, // 1 + 2 + 3
        isEmpty: false,
        items: expectedItems
      })
    })
  })

  test.describe('Storage Fallback Mechanisms', () => {
    test('should fallback to sessionStorage when localStorage fails', async ({ page, testProducts }) => {
      const product = testProducts[0]
      
      // Disable localStorage
      await cartHelpers.simulateStorageFailure('localStorage')
      
      // Add product to cart
      await page.goto('/products')
      await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
      await cartHelpers.addProductFromListing(product.id)
      
      // Should show warning about limited storage
      await expect(cartHelpers.getToast()).toBeVisible()
      
      // Cart should still work
      await cartHelpers.verifyCartState({ itemCount: 1, isEmpty: false })
      
      // Navigate to cart and verify functionality
      await cartHelpers.goToCart()
      await expect(cartHelpers.getCartItem(product.id)).toBeVisible()
      
      // Test cart operations work with sessionStorage
      await cartHelpers.increaseQuantity(product.id)
      await expect(cartHelpers.getQuantityDisplay(product.id)).toContainText('2')
    })

    test('should handle both localStorage and sessionStorage failures', async ({ page, testProducts }) => {
      const product = testProducts[0]
      
      // Disable both storage types
      await cartHelpers.simulateStorageFailure('localStorage')
      await cartHelpers.simulateStorageFailure('sessionStorage')
      
      // Add product to cart
      await page.goto('/products')
      await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
      await cartHelpers.addProductFromListing(product.id)
      
      // Should show warning about memory-only storage
      await expect(cartHelpers.getToast()).toBeVisible()
      
      // Cart should still work in memory
      await cartHelpers.verifyCartState({ itemCount: 1, isEmpty: false })
      
      // Navigate to cart and verify functionality
      await cartHelpers.goToCart()
      await expect(cartHelpers.getCartItem(product.id)).toBeVisible()
      
      // Test cart operations work in memory mode
      await cartHelpers.increaseQuantity(product.id)
      await expect(cartHelpers.getQuantityDisplay(product.id)).toContainText('2')
      
      // However, cart should not persist across page reloads
      await page.reload()
      await cartHelpers.waitForCartUpdate()
      
      // Cart should be empty after reload
      await cartHelpers.verifyCartState({ itemCount: 0, isEmpty: true })
    })

    test('should migrate data between storage types', async ({ page, testProducts }) => {
      const product = testProducts[0]
      
      // Add product to cart with localStorage working
      await page.goto('/products')
      await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
      await cartHelpers.addProductFromListing(product.id)
      
      // Verify data is in localStorage
      const localStorageData = await cartHelpers.getCartDataFromStorage()
      expect(localStorageData).toBeTruthy()
      expect(localStorageData.items).toHaveLength(1)
      
      // Simulate localStorage failure (forcing migration to sessionStorage)
      await page.addInitScript(() => {
        // Save current data
        const currentData = localStorage.getItem('moldova-direct-cart')
        
        // Disable localStorage
        Object.defineProperty(window, 'localStorage', {
          value: {
            getItem: () => currentData, // Allow reading existing data
            setItem: () => { throw new Error('localStorage disabled') },
            removeItem: () => { throw new Error('localStorage disabled') },
            clear: () => { throw new Error('localStorage disabled') }
          }
        })
      })
      
      // Trigger cart operation that would require saving
      await cartHelpers.goToCart()
      await cartHelpers.increaseQuantity(product.id)
      
      // Should show migration message
      await expect(cartHelpers.getToast()).toBeVisible()
      
      // Cart should still work
      await expect(cartHelpers.getQuantityDisplay(product.id)).toContainText('2')
      
      // Data should now be in sessionStorage
      const sessionStorageData = await page.evaluate(() => {
        const data = sessionStorage.getItem('moldova-direct-cart')
        return data ? JSON.parse(data) : null
      })
      
      expect(sessionStorageData).toBeTruthy()
      expect(sessionStorageData.items).toHaveLength(1)
      expect(sessionStorageData.items[0].quantity).toBe(2)
    })
  })

  test.describe('Data Corruption Recovery', () => {
    test('should recover from corrupted cart data', async ({ page, testProducts }) => {
      const product = testProducts[0]
      
      // Set corrupted data in localStorage
      await page.evaluate(() => {
        localStorage.setItem('moldova-direct-cart', 'invalid-json-data')
      })
      
      // Navigate to cart
      await cartHelpers.goToCart()
      
      // Should show error recovery message
      await expect(cartHelpers.getToast()).toBeVisible()
      
      // Cart should be empty but functional
      await cartHelpers.verifyCartState({ itemCount: 0, isEmpty: true })
      
      // Should be able to add products normally
      await page.goto('/products')
      await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
      await cartHelpers.addProductFromListing(product.id)
      
      // Cart should work normally now
      await cartHelpers.verifyCartState({ itemCount: 1, isEmpty: false })
    })

    test('should handle partially corrupted cart data', async ({ page, testProducts }) => {
      const validProduct = testProducts[0]
      const corruptedData = {
        items: [
          {
            // Missing required fields
            product: { name: 'Incomplete Product' },
            quantity: 'invalid-quantity'
          },
          {
            id: 'valid-item',
            product: validProduct,
            quantity: 2,
            addedAt: new Date().toISOString()
          },
          {
            // Another invalid item
            id: 'invalid-item',
            product: null,
            quantity: -1,
            addedAt: 'invalid-date'
          }
        ],
        sessionId: 'recovery-session',
        updatedAt: new Date().toISOString()
      }
      
      await cartHelpers.setCartDataInStorage(corruptedData)
      
      // Navigate to cart
      await cartHelpers.goToCart()
      
      // Should show recovery message
      await expect(cartHelpers.getToast()).toBeVisible()
      
      // Should only show valid items
      await expect(cartHelpers.getCartItem(validProduct.id)).toBeVisible()
      await expect(cartHelpers.getQuantityDisplay(validProduct.id)).toContainText('2')
      
      // Should have correct item count (only valid items)
      await cartHelpers.verifyCartState({ itemCount: 2, isEmpty: false })
    })

    test('should handle missing session ID', async ({ page, testProducts }) => {
      const product = testProducts[0]
      
      const dataWithoutSession = {
        items: [{
          id: 'item-without-session',
          product: product,
          quantity: 1,
          addedAt: new Date().toISOString()
        }],
        // Missing sessionId
        updatedAt: new Date().toISOString()
      }
      
      await cartHelpers.setCartDataInStorage(dataWithoutSession)
      
      // Navigate to cart
      await cartHelpers.goToCart()
      
      // Should generate new session ID and preserve items
      await expect(cartHelpers.getCartItem(product.id)).toBeVisible()
      
      // Verify new session ID was generated
      const recoveredData = await cartHelpers.getCartDataFromStorage()
      expect(recoveredData.sessionId).toBeTruthy()
      expect(recoveredData.sessionId).toMatch(/^cart_\d+_[a-z0-9]+$/)
    })
  })

  test.describe('Cart Expiration and Cleanup', () => {
    test('should clear expired cart data', async ({ page }) => {
      // Create expired cart data (older than 30 days)
      const expiredDate = new Date()
      expiredDate.setDate(expiredDate.getDate() - 35)
      
      const expiredCartData = {
        items: [{
          id: 'expired-item',
          product: {
            id: 'expired-product',
            name: 'Expired Product',
            price: 10.00,
            images: ['expired.jpg'],
            stock: 5
          },
          quantity: 1,
          addedAt: expiredDate.toISOString()
        }],
        sessionId: 'expired-session',
        updatedAt: expiredDate.toISOString()
      }
      
      await cartHelpers.setCartDataInStorage(expiredCartData)
      
      // Navigate to cart
      await cartHelpers.goToCart()
      
      // Should show expiration message
      await expect(cartHelpers.getToast()).toBeVisible()
      
      // Cart should be empty
      await cartHelpers.verifyCartState({ itemCount: 0, isEmpty: true })
      
      // Storage should be cleared
      const clearedData = await cartHelpers.getCartDataFromStorage()
      expect(clearedData).toBeNull()
    })

    test('should preserve recent cart data', async ({ page, testProducts }) => {
      const product = testProducts[0]
      
      // Create recent cart data (within 30 days)
      const recentDate = new Date()
      recentDate.setDate(recentDate.getDate() - 5) // 5 days ago
      
      const recentCartData = {
        items: [{
          id: 'recent-item',
          product: product,
          quantity: 2,
          addedAt: recentDate.toISOString()
        }],
        sessionId: 'recent-session',
        updatedAt: recentDate.toISOString()
      }
      
      await cartHelpers.setCartDataInStorage(recentCartData)
      
      // Navigate to cart
      await cartHelpers.goToCart()
      
      // Should preserve recent data
      await expect(cartHelpers.getCartItem(product.id)).toBeVisible()
      await expect(cartHelpers.getQuantityDisplay(product.id)).toContainText('2')
      
      // Should have correct item count
      await cartHelpers.verifyCartState({ itemCount: 2, isEmpty: false })
    })

    test('should handle mixed expired and valid items', async ({ page, testProducts }) => {
      const validProduct = testProducts[0]
      const expiredDate = new Date()
      expiredDate.setDate(expiredDate.getDate() - 35)
      const recentDate = new Date()
      recentDate.setDate(recentDate.getDate() - 5)
      
      const mixedCartData = {
        items: [
          {
            id: 'expired-item',
            product: {
              id: 'expired-product',
              name: 'Expired Product',
              price: 10.00,
              images: ['expired.jpg'],
              stock: 5
            },
            quantity: 1,
            addedAt: expiredDate.toISOString()
          },
          {
            id: 'valid-item',
            product: validProduct,
            quantity: 3,
            addedAt: recentDate.toISOString()
          }
        ],
        sessionId: 'mixed-session',
        updatedAt: recentDate.toISOString()
      }
      
      await cartHelpers.setCartDataInStorage(mixedCartData)
      
      // Navigate to cart
      await cartHelpers.goToCart()
      
      // Should show cleanup message
      await expect(cartHelpers.getToast()).toBeVisible()
      
      // Should only show valid items
      await expect(cartHelpers.getCartItem(validProduct.id)).toBeVisible()
      await expect(cartHelpers.getQuantityDisplay(validProduct.id)).toContainText('3')
      
      // Should have correct item count (only valid items)
      await cartHelpers.verifyCartState({ itemCount: 3, isEmpty: false })
    })
  })

  test.describe('Cross-Tab Synchronization', () => {
    test('should synchronize cart changes across tabs', async ({ page, testProducts, context }) => {
      const product = testProducts[0]
      
      // Add product in first tab
      await page.goto('/products')
      await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
      await cartHelpers.addProductFromListing(product.id)
      
      // Open second tab
      const secondTab = await context.newPage()
      const secondCartHelpers = new CartTestHelpers(secondTab)
      
      // Navigate to cart in second tab
      await secondCartHelpers.goToCart()
      
      // Should show item from first tab
      await expect(secondCartHelpers.getCartItem(product.id)).toBeVisible()
      await expect(secondCartHelpers.getQuantityDisplay(product.id)).toContainText('1')
      
      // Modify quantity in second tab
      await secondCartHelpers.increaseQuantity(product.id)
      await secondCartHelpers.waitForCartUpdate()
      
      // Switch back to first tab and check synchronization
      await cartHelpers.goToCart()
      
      // May need to refresh or wait for storage event
      await page.reload()
      await cartHelpers.waitForCartUpdate()
      
      // Should show updated quantity
      await expect(cartHelpers.getQuantityDisplay(product.id)).toContainText('2')
      
      await secondTab.close()
    })

    test('should handle concurrent modifications gracefully', async ({ page, testProducts, context }) => {
      const product = testProducts[0]
      
      // Add product in first tab
      await page.goto('/products')
      await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
      await cartHelpers.addProductFromListing(product.id)
      
      // Open second tab
      const secondTab = await context.newPage()
      const secondCartHelpers = new CartTestHelpers(secondTab)
      await secondCartHelpers.goToCart()
      
      // Perform concurrent modifications
      const [, ] = await Promise.allSettled([
        cartHelpers.goToCart().then(() => cartHelpers.increaseQuantity(product.id)),
        secondCartHelpers.increaseQuantity(product.id)
      ])
      
      // Wait for both operations to complete
      await cartHelpers.waitForCartUpdate()
      await secondCartHelpers.waitForCartUpdate()
      
      // Both tabs should eventually show consistent state
      await page.reload()
      await secondTab.reload()
      
      await cartHelpers.waitForCartUpdate()
      await secondCartHelpers.waitForCartUpdate()
      
      const firstTabQuantity = await cartHelpers.getQuantityDisplay(product.id).textContent()
      const secondTabQuantity = await secondCartHelpers.getQuantityDisplay(product.id).textContent()
      
      // Both tabs should show the same final quantity
      expect(firstTabQuantity).toBe(secondTabQuantity)
      
      await secondTab.close()
    })

    test('should handle tab closure and reopening', async ({ page, testProducts, context }) => {
      const product = testProducts[0]
      
      // Add product and modify cart
      await page.goto('/products')
      await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
      await cartHelpers.addProductFromListing(product.id)
      await cartHelpers.goToCart()
      await cartHelpers.increaseQuantity(product.id)
      
      // Close the tab
      await page.close()
      
      // Open new tab
      const newTab = await context.newPage()
      const newCartHelpers = new CartTestHelpers(newTab)
      
      // Navigate to cart
      await newCartHelpers.goToCart()
      
      // Should preserve cart state
      await expect(newCartHelpers.getCartItem(product.id)).toBeVisible()
      await expect(newCartHelpers.getQuantityDisplay(product.id)).toContainText('2')
    })
  })

  test.describe('Performance and Reliability', () => {
    test('should handle rapid storage operations', async ({ page, testProducts }) => {
      const products = testProducts.slice(0, 3)
      
      await page.goto('/products')
      await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
      
      // Perform rapid cart operations
      const operationTime = await cartHelpers.measureOperationTime(async () => {
        for (const product of products) {
          await cartHelpers.addProductFromListing(product.id)
        }
        
        await cartHelpers.goToCart()
        
        // Rapid quantity updates
        for (const product of products) {
          await cartHelpers.increaseQuantity(product.id)
          await cartHelpers.increaseQuantity(product.id)
        }
      })
      
      // Should complete within reasonable time
      expect(operationTime).toBeLessThan(10000) // 10 seconds
      
      // Verify final state is correct
      await cartHelpers.verifyCartState({
        itemCount: 9, // 3 products * 3 quantity each
        isEmpty: false
      })
      
      // Verify persistence after rapid operations
      await page.reload()
      await cartHelpers.waitForCartUpdate()
      
      await cartHelpers.verifyCartState({
        itemCount: 9,
        isEmpty: false
      })
    })

    test('should recover from storage quota exceeded', async ({ page, testProducts }) => {
      const product = testProducts[0]
      
      // Add product to cart
      await page.goto('/products')
      await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
      await cartHelpers.addProductFromListing(product.id)
      
      // Simulate storage quota exceeded
      await page.addInitScript(() => {
        const originalSetItem = localStorage.setItem
        let callCount = 0
        
        localStorage.setItem = function(key, value) {
          callCount++
          if (callCount > 2) { // Allow initial operations, then fail
            throw new DOMException('QuotaExceededError')
          }
          return originalSetItem.call(this, key, value)
        }
      })
      
      // Try to update cart (should trigger quota error)
      await cartHelpers.goToCart()
      await cartHelpers.increaseQuantity(product.id)
      
      // Should show quota error message and fallback
      await expect(cartHelpers.getToast()).toBeVisible()
      
      // Cart should still work (using sessionStorage fallback)
      await expect(cartHelpers.getQuantityDisplay(product.id)).toContainText('2')
    })

    test('should handle storage corruption during operations', async ({ page, testProducts }) => {
      const product = testProducts[0]
      
      // Add product to cart
      await page.goto('/products')
      await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
      await cartHelpers.addProductFromListing(product.id)
      
      // Corrupt storage during operation
      await page.evaluate(() => {
        const originalGetItem = localStorage.getItem
        let corruptionTriggered = false
        
        localStorage.getItem = function(key) {
          if (key === 'moldova-direct-cart' && !corruptionTriggered) {
            corruptionTriggered = true
            return 'corrupted-data-during-operation'
          }
          return originalGetItem.call(this, key)
        }
      })
      
      // Navigate to cart (should trigger corruption detection)
      await cartHelpers.goToCart()
      
      // Should show recovery message
      await expect(cartHelpers.getToast()).toBeVisible()
      
      // Should recover gracefully and maintain current session state
      await cartHelpers.verifyCartState({ itemCount: 1, isEmpty: false })
    })
  })
})