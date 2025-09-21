/**
 * Comprehensive Cart Workflow E2E Tests
 * 
 * Requirements addressed:
 * - Complete cart workflows from product discovery to checkout
 * - Multi-product cart operations
 * - Cart state management across authentication
 * - Error recovery workflows
 * - Advanced cart features (bulk operations, save for later)
 * - Performance testing with large carts
 */

import { test, expect } from '../fixtures/base'
import { ProductPage, CartPage, CheckoutPage } from '../fixtures/pages'
import { CartTestHelpers } from '../fixtures/cart-helpers'

test.describe('Cart Workflows - Comprehensive Tests', () => {
  let productPage: ProductPage
  let cartPage: CartPage
  let checkoutPage: CheckoutPage
  let cartHelpers: CartTestHelpers

  test.beforeEach(async ({ page, resetDatabase, seedDatabase }) => {
    await resetDatabase()
    await seedDatabase()
    
    productPage = new ProductPage(page)
    cartPage = new CartPage(page)
    checkoutPage = new CheckoutPage(page)
    cartHelpers = new CartTestHelpers(page)
    
    await cartHelpers.clearAllStorage()
  })

  test.describe('Complete Shopping Journeys', () => {
    test('should complete full shopping workflow from discovery to checkout', async ({ page, testProducts }) => {
      // Step 1: Product Discovery
      await page.goto('/')
      
      // Browse featured products
      const featuredSection = page.locator('[data-testid="featured-products"]')
      if (await featuredSection.isVisible()) {
        const featuredProduct = featuredSection.locator('[data-testid="product-card"]').first()
        await featuredProduct.click()
        
        // Add from product detail page
        await productPage.addToCart(1)
        await cartHelpers.verifyToastMessage('Producto añadido al carrito')
      }
      
      // Step 2: Browse product catalog
      await page.goto('/products')
      await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
      
      // Add multiple products from listing
      const productsToAdd = testProducts.slice(0, 3)
      for (const product of productsToAdd) {
        await cartHelpers.addProductFromListing(product.id)
        await cartHelpers.waitForCartUpdate()
      }
      
      // Step 3: Review and modify cart
      await cartHelpers.goToCart()
      
      // Verify all products are in cart
      for (const product of productsToAdd) {
        await expect(cartHelpers.getCartItem(product.id)).toBeVisible()
      }
      
      // Modify quantities
      await cartHelpers.increaseQuantity(productsToAdd[0].id)
      await cartHelpers.setQuantity(productsToAdd[1].id, 3)
      
      // Remove one product
      await cartHelpers.removeItem(productsToAdd[2].id)
      
      // Verify cart state after modifications
      const expectedSubtotal = (productsToAdd[0].price * 2) + (productsToAdd[1].price * 3)
      await cartHelpers.verifyCartState({
        itemCount: 5, // 2 + 3
        isEmpty: false,
        subtotal: expectedSubtotal
      })
      
      // Step 4: Proceed to checkout
      await cartHelpers.proceedToCheckout()
      
      // Verify checkout page loads with correct data
      await expect(page).toHaveURL(/.*\/checkout/)
      await expect(checkoutPage.orderSummary).toBeVisible()
      
      // Verify order summary contains correct items and totals
      await expect(checkoutPage.orderSummary).toContainText(productsToAdd[0].name)
      await expect(checkoutPage.orderSummary).toContainText(productsToAdd[1].name)
      await expect(checkoutPage.orderSummary).toContainText(expectedSubtotal.toFixed(2))
    })

    test('should handle guest to authenticated user workflow', async ({ page, testProducts, testUser }) => {
      const product = testProducts[0]
      
      // Step 1: Add products as guest
      await page.goto('/products')
      await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
      await cartHelpers.addProductFromListing(product.id)
      await cartHelpers.addProductFromListing(testProducts[1].id)
      
      // Verify guest cart
      await cartHelpers.verifyCartState({ itemCount: 2, isEmpty: false })
      
      // Step 2: Login during checkout
      await cartHelpers.goToCart()
      await cartHelpers.proceedToCheckout()
      
      // Should redirect to login or show login form
      const loginForm = page.locator('[data-testid="login-form"]')
      const loginPage = page.locator('h1:has-text("Iniciar Sesión")')
      
      if (await loginForm.isVisible() || await loginPage.isVisible()) {
        // Fill login form
        await page.fill('[data-testid="email-input"]', testUser.email)
        await page.fill('[data-testid="password-input"]', testUser.password)
        await page.click('[data-testid="login-button"]')
        
        // Wait for login to complete
        await page.waitForTimeout(2000)
      }
      
      // Step 3: Verify cart preserved after login
      if (await page.url().includes('/checkout')) {
        // Already on checkout page
        await expect(checkoutPage.orderSummary).toBeVisible()
        await expect(checkoutPage.orderSummary).toContainText(product.name)
        await expect(checkoutPage.orderSummary).toContainText(testProducts[1].name)
      } else {
        // Navigate back to cart to verify
        await cartHelpers.goToCart()
        await expect(cartHelpers.getCartItem(product.id)).toBeVisible()
        await expect(cartHelpers.getCartItem(testProducts[1].id)).toBeVisible()
        await cartHelpers.verifyCartState({ itemCount: 2, isEmpty: false })
      }
    })

    test('should handle cart modifications during checkout process', async ({ page, testProducts, context }) => {
      const product = testProducts[0]
      
      // Add product to cart
      await page.goto('/products')
      await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
      await cartHelpers.addProductFromListing(product.id)
      
      // Go to checkout
      await cartHelpers.goToCart()
      await cartHelpers.proceedToCheckout()
      
      // Open cart in new tab to simulate concurrent modification
      const newTab = await context.newPage()
      const newCartHelpers = new CartTestHelpers(newTab)
      
      await newCartHelpers.goToCart()
      
      // Modify cart in new tab
      await newCartHelpers.increaseQuantity(product.id)
      await newCartHelpers.addProductFromListing(testProducts[1].id)
      
      // Return to checkout tab
      await page.bringToFront()
      
      // Try to proceed with checkout (should detect changes)
      const proceedButton = page.locator('[data-testid="proceed-to-payment"]')
      if (await proceedButton.isVisible()) {
        await proceedButton.click()
        
        // Should show warning about cart changes
        const warningMessage = page.locator('[data-testid="cart-changed-warning"]')
        if (await warningMessage.isVisible()) {
          // Click to review changes
          await page.click('[data-testid="review-cart-changes"]')
          
          // Should navigate back to cart or show updated summary
          await page.waitForTimeout(2000)
        }
      }
      
      await newTab.close()
    })
  })

  test.describe('Multi-Product Complex Operations', () => {
    test('should handle large cart with multiple product types', async ({ page, testProducts }) => {
      // Add all available test products with varying quantities
      await page.goto('/products')
      await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
      
      const cartOperations = []
      let expectedTotal = 0
      let expectedItemCount = 0
      
      for (let i = 0; i < testProducts.length; i++) {
        const product = testProducts[i]
        const quantity = Math.floor(Math.random() * 5) + 1 // 1-5 items
        
        await cartHelpers.addProductFromListing(product.id)
        
        // Add additional quantities if needed
        if (quantity > 1) {
          await cartHelpers.goToCart()
          for (let j = 1; j < quantity; j++) {
            await cartHelpers.increaseQuantity(product.id)
          }
          await page.goto('/products')
          await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
        }
        
        expectedTotal += product.price * quantity
        expectedItemCount += quantity
        cartOperations.push({ productId: product.id, quantity })
      }
      
      // Navigate to cart and verify all items
      await cartHelpers.goToCart()
      
      // Verify cart state
      await cartHelpers.verifyCartState({
        itemCount: expectedItemCount,
        isEmpty: false,
        subtotal: expectedTotal,
        items: cartOperations
      })
      
      // Test bulk operations if available
      await cartHelpers.selectAllItems()
      
      const bulkPanel = page.locator('[data-testid="bulk-operations-panel"]')
      if (await bulkPanel.isVisible()) {
        // Test bulk quantity update
        await page.selectOption('[data-testid="bulk-quantity-select"]', '2')
        await page.click('[data-testid="bulk-update-quantity"]')
        
        // Confirm bulk operation
        const confirmButton = page.locator('[data-testid="confirm-bulk-operation"]')
        if (await confirmButton.isVisible()) {
          await confirmButton.click()
        }
        
        // Verify bulk update
        await cartHelpers.waitForCartUpdate()
        
        // All items should now have quantity 2
        for (const operation of cartOperations) {
          await expect(cartHelpers.getQuantityDisplay(operation.productId)).toContainText('2')
        }
        
        // Verify new totals
        const newExpectedTotal = testProducts.reduce((sum, product) => sum + (product.price * 2), 0)
        const newExpectedItemCount = testProducts.length * 2
        
        await cartHelpers.verifyCartState({
          itemCount: newExpectedItemCount,
          subtotal: newExpectedTotal
        })
      }
    })

    test('should handle save for later functionality', async ({ page, testProducts }) => {
      const productsToSave = testProducts.slice(0, 2)
      const productsToKeep = testProducts.slice(2, 4)
      
      // Add multiple products to cart
      await page.goto('/products')
      await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
      
      for (const product of [...productsToSave, ...productsToKeep]) {
        await cartHelpers.addProductFromListing(product.id)
      }
      
      await cartHelpers.goToCart()
      
      // Save some items for later
      for (const product of productsToSave) {
        await cartHelpers.saveItemForLater(product.id)
      }
      
      // Verify items moved to saved for later section
      const savedSection = page.locator('[data-testid="saved-for-later-section"]')
      if (await savedSection.isVisible()) {
        for (const product of productsToSave) {
          await expect(savedSection.locator(`[data-testid="saved-item-${product.id}"]`)).toBeVisible()
        }
      }
      
      // Verify remaining items in cart
      await cartHelpers.verifyCartState({
        itemCount: productsToKeep.length,
        isEmpty: false
      })
      
      for (const product of productsToKeep) {
        await expect(cartHelpers.getCartItem(product.id)).toBeVisible()
      }
      
      // Move items back to cart
      for (const product of productsToSave) {
        await cartHelpers.moveFromSavedToCart(product.id)
      }
      
      // Verify all items back in cart
      await cartHelpers.verifyCartState({
        itemCount: testProducts.slice(0, 4).length,
        isEmpty: false
      })
    })

    test('should handle cart recommendations and related products', async ({ page, testProducts }) => {
      const mainProduct = testProducts[0]
      
      // Add product to cart
      await page.goto('/products')
      await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
      await cartHelpers.addProductFromListing(mainProduct.id)
      
      await cartHelpers.goToCart()
      
      // Check for recommendations section
      const recommendationsSection = page.locator('[data-testid="cart-recommendations"]')
      if (await recommendationsSection.isVisible()) {
        // Add recommended product
        const firstRecommendation = recommendationsSection.locator('[data-testid="recommendation-card"]').first()
        const addRecommendationButton = firstRecommendation.locator('button:has-text("Añadir al Carrito")')
        
        if (await addRecommendationButton.isVisible()) {
          await addRecommendationButton.click()
          
          // Verify recommendation added to cart
          await cartHelpers.waitForCartUpdate()
          await cartHelpers.verifyCartState({ itemCount: 2, isEmpty: false })
        }
      }
      
      // Check for frequently bought together
      const frequentlyBoughtSection = page.locator('[data-testid="frequently-bought-together"]')
      if (await frequentlyBoughtSection.isVisible()) {
        const addBundleButton = frequentlyBoughtSection.locator('[data-testid="add-bundle-to-cart"]')
        
        if (await addBundleButton.isVisible()) {
          await addBundleButton.click()
          
          // Verify bundle added
          await cartHelpers.waitForCartUpdate()
          
          // Should have more items now
          const currentCount = await cartHelpers.getCartItemCount()
          expect(currentCount).toBeGreaterThan(2)
        }
      }
    })
  })

  test.describe('Error Recovery and Edge Cases', () => {
    test('should recover from network failures during cart operations', async ({ page, testProducts }) => {
      const product = testProducts[0]
      
      // Add product to cart
      await page.goto('/products')
      await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
      await cartHelpers.addProductFromListing(product.id)
      
      await cartHelpers.goToCart()
      
      // Simulate network failure
      await cartHelpers.simulateNetworkFailure()
      
      // Try multiple operations that should fail
      await cartHelpers.increaseQuantity(product.id)
      await cartHelpers.verifyToastMessage('Error de conexión')
      
      await cartHelpers.addProductFromListing(testProducts[1].id)
      await cartHelpers.verifyToastMessage('Error de conexión')
      
      // Restore network
      await cartHelpers.restoreNetwork()
      
      // Retry failed operations
      const retryButtons = page.locator('[data-testid="toast-action-button"]')
      const retryCount = await retryButtons.count()
      
      for (let i = 0; i < retryCount; i++) {
        const retryButton = retryButtons.nth(i)
        if (await retryButton.isVisible()) {
          await retryButton.click()
          await cartHelpers.waitForCartUpdate()
        }
      }
      
      // Verify operations completed after retry
      await expect(cartHelpers.getQuantityDisplay(product.id)).toContainText('2')
    })

    test('should handle inventory changes during cart session', async ({ page, testProducts }) => {
      const product = testProducts[0]
      
      // Add product to cart
      await page.goto('/products')
      await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
      await cartHelpers.addProductFromListing(product.id)
      
      // Simulate inventory reduction (mock API response)
      await page.route('**/api/products/validate', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            valid: false,
            reason: 'insufficient_stock',
            availableStock: 0,
            message: 'Producto agotado'
          })
        })
      })
      
      // Navigate to cart (should trigger validation)
      await cartHelpers.goToCart()
      
      // Should show out of stock message
      await cartHelpers.verifyToastMessage('Producto agotado')
      
      // Product should be removed from cart or marked as unavailable
      const outOfStockIndicator = page.locator('[data-testid="out-of-stock-indicator"]')
      const emptyCartMessage = page.locator('[data-testid="empty-cart-message"]')
      
      const isOutOfStock = await outOfStockIndicator.isVisible()
      const isCartEmpty = await emptyCartMessage.isVisible()
      
      expect(isOutOfStock || isCartEmpty).toBe(true)
      
      // Restore normal API behavior
      await page.unroute('**/api/products/validate')
    })

    test('should handle price changes during cart session', async ({ page, testProducts }) => {
      const product = testProducts[0]
      const originalPrice = product.price
      const newPrice = originalPrice * 1.2 // 20% increase
      
      // Add product to cart
      await page.goto('/products')
      await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
      await cartHelpers.addProductFromListing(product.id)
      
      // Simulate price change
      await page.route('**/api/products/validate', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            valid: true,
            product: {
              ...product,
              price: newPrice
            },
            priceChanged: true,
            message: 'El precio ha cambiado'
          })
        })
      })
      
      // Navigate to cart (should trigger validation)
      await cartHelpers.goToCart()
      
      // Should show price change notification
      await cartHelpers.verifyToastMessage('El precio ha cambiado')
      
      // Should show both old and new prices
      const priceChangeIndicator = page.locator('[data-testid="price-change-indicator"]')
      if (await priceChangeIndicator.isVisible()) {
        await expect(priceChangeIndicator).toContainText(originalPrice.toFixed(2))
        await expect(priceChangeIndicator).toContainText(newPrice.toFixed(2))
      }
      
      // Subtotal should reflect new price
      await cartHelpers.verifyCartState({
        subtotal: newPrice,
        itemCount: 1
      })
      
      await page.unroute('**/api/products/validate')
    })

    test('should handle cart corruption during active session', async ({ page, testProducts }) => {
      const product = testProducts[0]
      
      // Add product to cart
      await page.goto('/products')
      await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
      await cartHelpers.addProductFromListing(product.id)
      
      await cartHelpers.goToCart()
      await expect(cartHelpers.getCartItem(product.id)).toBeVisible()
      
      // Corrupt cart data in storage
      await page.evaluate(() => {
        localStorage.setItem('moldova-direct-cart', 'corrupted-data')
      })
      
      // Try to perform cart operation
      await cartHelpers.increaseQuantity(product.id)
      
      // Should detect corruption and recover
      await cartHelpers.verifyToastMessage('Error en los datos del carrito')
      
      // Should recover gracefully - either restore from session or start fresh
      await cartHelpers.waitForCartUpdate()
      
      // Cart should be functional again
      const isCartEmpty = await cartHelpers.isCartEmpty()
      const hasItems = await cartHelpers.getCartItem(product.id).isVisible()
      
      // Either recovered the item or started fresh (both are acceptable)
      expect(isCartEmpty || hasItems).toBe(true)
      
      // Should be able to add products normally
      if (isCartEmpty) {
        await page.goto('/products')
        await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
        await cartHelpers.addProductFromListing(product.id)
        
        await cartHelpers.goToCart()
        await expect(cartHelpers.getCartItem(product.id)).toBeVisible()
      }
    })
  })

  test.describe('Performance and Stress Testing', () => {
    test('should handle large cart operations efficiently', async ({ page, testProducts }) => {
      // Create a large cart
      const itemsToAdd = Math.min(testProducts.length, 10)
      
      await page.goto('/products')
      await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
      
      // Measure time to add multiple items
      const addTime = await cartHelpers.measureOperationTime(async () => {
        for (let i = 0; i < itemsToAdd; i++) {
          await cartHelpers.addProductFromListing(testProducts[i].id)
        }
      })
      
      // Should complete within reasonable time
      expect(addTime).toBeLessThan(itemsToAdd * 2000) // 2 seconds per item max
      
      // Navigate to cart and measure load time
      const cartLoadTime = await cartHelpers.measureOperationTime(async () => {
        await cartHelpers.goToCart()
        await cartHelpers.waitForCartUpdate()
      })
      
      // Cart should load quickly even with many items
      expect(cartLoadTime).toBeLessThan(5000) // 5 seconds max
      
      // Verify all items loaded correctly
      await cartHelpers.verifyCartState({
        itemCount: itemsToAdd,
        isEmpty: false
      })
      
      // Test bulk operations performance
      if (await page.locator('[data-testid="select-all-items"]').isVisible()) {
        const bulkOperationTime = await cartHelpers.measureOperationTime(async () => {
          await cartHelpers.selectAllItems()
          
          // Bulk quantity update
          await page.selectOption('[data-testid="bulk-quantity-select"]', '3')
          await page.click('[data-testid="bulk-update-quantity"]')
          
          const confirmButton = page.locator('[data-testid="confirm-bulk-operation"]')
          if (await confirmButton.isVisible()) {
            await confirmButton.click()
          }
          
          await cartHelpers.waitForCartUpdate()
        })
        
        // Bulk operations should be fast
        expect(bulkOperationTime).toBeLessThan(5000)
        
        // Verify bulk update worked
        await cartHelpers.verifyCartState({
          itemCount: itemsToAdd * 3
        })
      }
    })

    test('should handle rapid user interactions', async ({ page, testProducts }) => {
      const product = testProducts[0]
      
      // Add product to cart
      await page.goto('/products')
      await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
      await cartHelpers.addProductFromListing(product.id)
      
      await cartHelpers.goToCart()
      
      // Perform rapid quantity changes
      const rapidOperationTime = await cartHelpers.measureOperationTime(async () => {
        // Rapid increase operations
        for (let i = 0; i < 10; i++) {
          await cartHelpers.increaseQuantity(product.id)
          await page.waitForTimeout(100) // Small delay to simulate rapid clicking
        }
        
        // Rapid decrease operations
        for (let i = 0; i < 5; i++) {
          await cartHelpers.decreaseQuantity(product.id)
          await page.waitForTimeout(100)
        }
      })
      
      // Should handle rapid operations efficiently
      expect(rapidOperationTime).toBeLessThan(10000) // 10 seconds for all operations
      
      // Final quantity should be correct (1 + 10 - 5 = 6)
      await cartHelpers.waitForCartUpdate()
      await expect(cartHelpers.getQuantityDisplay(product.id)).toContainText('6')
      
      // Cart should remain responsive
      await cartHelpers.increaseQuantity(product.id)
      await expect(cartHelpers.getQuantityDisplay(product.id)).toContainText('7')
    })

    test('should maintain performance with concurrent operations', async ({ page, testProducts, context }) => {
      const product = testProducts[0]
      
      // Add product to cart
      await page.goto('/products')
      await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
      await cartHelpers.addProductFromListing(product.id)
      
      // Open multiple tabs
      const tab2 = await context.newPage()
      const tab3 = await context.newPage()
      
      const cartHelpers2 = new CartTestHelpers(tab2)
      const cartHelpers3 = new CartTestHelpers(tab3)
      
      // Navigate all tabs to cart
      await cartHelpers.goToCart()
      await cartHelpers2.goToCart()
      await cartHelpers3.goToCart()
      
      // Perform concurrent operations
      const concurrentOperationTime = await cartHelpers.measureOperationTime(async () => {
        await Promise.all([
          cartHelpers.increaseQuantity(product.id),
          cartHelpers2.increaseQuantity(product.id),
          cartHelpers3.increaseQuantity(product.id)
        ])
        
        // Wait for all operations to complete
        await Promise.all([
          cartHelpers.waitForCartUpdate(),
          cartHelpers2.waitForCartUpdate(),
          cartHelpers3.waitForCartUpdate()
        ])
      })
      
      // Should handle concurrent operations efficiently
      expect(concurrentOperationTime).toBeLessThan(5000)
      
      // All tabs should eventually show consistent state
      await page.reload()
      await tab2.reload()
      await tab3.reload()
      
      await Promise.all([
        cartHelpers.waitForCartUpdate(),
        cartHelpers2.waitForCartUpdate(),
        cartHelpers3.waitForCartUpdate()
      ])
      
      // Get final quantities from all tabs
      const quantity1 = await cartHelpers.getQuantityDisplay(product.id).textContent()
      const quantity2 = await cartHelpers2.getQuantityDisplay(product.id).textContent()
      const quantity3 = await cartHelpers3.getQuantityDisplay(product.id).textContent()
      
      // All tabs should show the same final quantity
      expect(quantity1).toBe(quantity2)
      expect(quantity2).toBe(quantity3)
      
      await tab2.close()
      await tab3.close()
    })
  })
})