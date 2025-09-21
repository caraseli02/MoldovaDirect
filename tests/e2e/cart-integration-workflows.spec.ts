import { test, expect } from '../fixtures/base'
import { ProductPage, CartPage, CheckoutPage } from '../fixtures/pages'
import { CartTestHelpers } from '../fixtures/cart-helpers'

test.describe('Cart Integration - Complete Workflows', () => {
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
    
    // Clear any existing cart data
    await cartHelpers.clearAllStorage()
  })

  test.describe('Complete Shopping Journey', () => {
    test('should complete full shopping workflow from product discovery to checkout', async ({ page, testProducts }) => {
      // Step 1: Browse products and add to cart
      await page.goto('/products')
      await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
      
      const firstProduct = testProducts[0]
      const secondProduct = testProducts[1]
      
      // Add first product from product listing
      const firstProductCard = page.locator(`[data-testid="product-card-${firstProduct.id}"]`).first()
      await firstProductCard.locator('button:has-text("Añadir al Carrito")').click()
      
      // Verify cart icon updates
      await expect(page.locator('[data-testid="cart-icon"]')).toContainText('1')
      
      // Navigate to product detail page and add second product
      await productPage.goto(secondProduct.id)
      await productPage.addToCart(2)
      
      // Verify cart icon updates
      await expect(page.locator('[data-testid="cart-icon"]')).toContainText('3')
      
      // Step 2: Review and modify cart
      await cartPage.goto()
      
      // Verify both products are in cart
      await expect(cartPage.getCartItem(firstProduct.id)).toBeVisible()
      await expect(cartPage.getCartItem(secondProduct.id)).toBeVisible()
      
      // Verify quantities
      await expect(cartPage.getQuantityDisplay(firstProduct.id)).toContainText('1')
      await expect(cartPage.getQuantityDisplay(secondProduct.id)).toContainText('2')
      
      // Modify quantity of first product
      await cartPage.increaseQuantity(firstProduct.id)
      await expect(cartPage.getQuantityDisplay(firstProduct.id)).toContainText('2')
      
      // Verify subtotal calculation
      const expectedSubtotal = (firstProduct.price * 2) + (secondProduct.price * 2)
      await expect(cartPage.subtotal).toContainText(expectedSubtotal.toFixed(2))
      
      // Step 3: Proceed to checkout
      await cartPage.proceedToCheckout()
      
      // Verify checkout page loads with correct items
      await expect(page).toHaveURL(/.*\/checkout/)
      await expect(checkoutPage.orderSummary).toBeVisible()
      
      // Verify order summary contains correct items and totals
      await expect(checkoutPage.orderSummary).toContainText(firstProduct.name)
      await expect(checkoutPage.orderSummary).toContainText(secondProduct.name)
      await expect(checkoutPage.orderSummary).toContainText(expectedSubtotal.toFixed(2))
    })

    test('should handle cart modifications during checkout process', async ({ page, testProducts }) => {
      const product = testProducts[0]
      
      // Add product to cart
      await productPage.goto(product.id)
      await productPage.addToCart(1)
      
      // Go to checkout
      await cartPage.goto()
      await cartPage.proceedToCheckout()
      
      // Open cart in new tab to simulate concurrent modification
      const newPage = await page.context().newPage()
      await newPage.goto('/cart')
      
      // Modify cart in new tab
      await newPage.locator(`[data-testid="increase-quantity-${product.id}"]`).click()
      
      // Return to checkout tab and verify it detects changes
      await page.reload()
      
      // Should show updated quantity or warning about cart changes
      const orderSummary = page.locator('[data-testid="order-summary"]')
      await expect(orderSummary).toBeVisible()
      
      await newPage.close()
    })

    test('should maintain cart state across authentication', async ({ page, testProducts, testUser }) => {
      const product = testProducts[0]
      
      // Add product to cart as guest
      await productPage.goto(product.id)
      await productPage.addToCart(1)
      
      // Verify cart has item
      await cartPage.goto()
      await expect(cartPage.getCartItem(product.id)).toBeVisible()
      
      // Login
      await page.goto('/auth/login')
      await page.fill('[data-testid="email-input"]', testUser.email)
      await page.fill('[data-testid="password-input"]', testUser.password)
      await page.click('[data-testid="login-button"]')
      
      // Wait for login to complete
      await page.waitForURL(/.*\//)
      
      // Verify cart is still intact after login
      await cartPage.goto()
      await expect(cartPage.getCartItem(product.id)).toBeVisible()
      await expect(cartPage.getQuantityDisplay(product.id)).toContainText('1')
    })
  })

  test.describe('Multi-Product Workflows', () => {
    test('should handle complex cart operations with multiple products', async ({ page, testProducts }) => {
      // Add multiple products with different quantities
      for (let i = 0; i < 3; i++) {
        const product = testProducts[i]
        await productPage.goto(product.id)
        await productPage.addToCart(i + 1) // 1, 2, 3 quantities
      }
      
      await cartPage.goto()
      
      // Verify all products are in cart with correct quantities
      for (let i = 0; i < 3; i++) {
        const product = testProducts[i]
        await expect(cartPage.getCartItem(product.id)).toBeVisible()
        await expect(cartPage.getQuantityDisplay(product.id)).toContainText((i + 1).toString())
      }
      
      // Test bulk operations if available
      if (await page.locator('text=Seleccionar todo').isVisible()) {
        // Select all items
        await page.locator('text=Seleccionar todo').click()
        
        // Verify bulk operations panel appears
        await expect(page.locator('text=3 productos seleccionados')).toBeVisible()
        
        // Test bulk quantity update
        await page.locator('select').selectOption('5')
        await page.locator('button:has-text("Actualizar")').click()
        
        // Confirm bulk update
        if (await page.locator('button:has-text("OK")').isVisible()) {
          await page.locator('button:has-text("OK")').click()
        }
        
        // Verify quantities were updated
        for (const product of testProducts.slice(0, 3)) {
          await expect(cartPage.getQuantityDisplay(product.id)).toContainText('5')
        }
      }
    })

    test('should handle save for later functionality', async ({ page, testProducts }) => {
      const product = testProducts[0]
      
      // Add product to cart
      await productPage.goto(product.id)
      await productPage.addToCart(1)
      
      await cartPage.goto()
      
      // Save item for later if functionality exists
      const saveForLaterButton = page.locator('button:has-text("Guardar para después")')
      if (await saveForLaterButton.isVisible()) {
        await saveForLaterButton.click()
        
        // Verify item moved to saved for later section
        await expect(page.locator('text=Guardado para después')).toBeVisible()
        
        // Verify cart is now empty
        await expect(page.locator('[data-testid="empty-cart-message"]')).toBeVisible()
        
        // Move item back to cart
        await page.locator('button:has-text("Mover al carrito")').click()
        
        // Verify item is back in cart
        await expect(cartPage.getCartItem(product.id)).toBeVisible()
      }
    })
  })

  test.describe('Error Recovery Workflows', () => {
    test('should recover from cart corruption and continue shopping', async ({ page, testProducts }) => {
      const product = testProducts[0]
      
      // Add product to cart
      await productPage.goto(product.id)
      await productPage.addToCart(1)
      
      // Corrupt cart data
      await page.evaluate(() => {
        localStorage.setItem('moldova-direct-cart', 'invalid-json-data')
      })
      
      // Navigate to cart page
      await cartPage.goto()
      
      // Should show error boundary or recover gracefully
      if (await page.locator('[data-testid="error-boundary"]').isVisible()) {
        // Click retry button
        await page.locator('[data-testid="error-retry-button"]').click()
      }
      
      // Should be able to continue shopping
      await page.goto('/products')
      await page.waitForSelector('[data-testid="product-card"]')
      
      // Add product again
      const productCard = page.locator('[data-testid="product-card"]').first()
      await productCard.locator('button:has-text("Añadir al Carrito")').click()
      
      // Verify cart works again
      await cartPage.goto()
      await expect(page.locator('[data-testid="cart-item"]')).toBeVisible()
    })

    test('should handle network failures gracefully', async ({ page, testProducts }) => {
      const product = testProducts[0]
      
      // Add product to cart
      await productPage.goto(product.id)
      await productPage.addToCart(1)
      
      // Simulate network failure
      await page.route('**/api/**', route => route.abort('failed'))
      
      await cartPage.goto()
      
      // Try to update quantity (should fail gracefully)
      await cartPage.increaseQuantity(product.id)
      
      // Should show error message
      await expect(page.locator('[data-testid="toast"]')).toBeVisible()
      
      // Restore network
      await page.unroute('**/api/**')
      
      // Should be able to retry operation
      const retryButton = page.locator('[data-testid="toast-action-button"]')
      if (await retryButton.isVisible()) {
        await retryButton.click()
        
        // Should succeed now
        await expect(cartPage.getQuantityDisplay(product.id)).toContainText('2')
      }
    })
  })

  test.describe('Cross-Tab Synchronization', () => {
    test('should synchronize cart changes across multiple tabs', async ({ page, testProducts }) => {
      const product = testProducts[0]
      
      // Add product in first tab
      await productPage.goto(product.id)
      await productPage.addToCart(1)
      
      // Open second tab
      const secondTab = await page.context().newPage()
      await secondTab.goto('/cart')
      
      // Verify product appears in second tab
      await expect(secondTab.locator(`[data-testid="cart-item-${product.id}"]`)).toBeVisible()
      
      // Modify quantity in second tab
      await secondTab.locator(`[data-testid="increase-quantity-${product.id}"]`).click()
      
      // Switch back to first tab and check if it updates
      await page.goto('/cart')
      
      // Should show updated quantity (may require page refresh or real-time sync)
      await page.reload()
      await expect(page.locator(`[data-testid="quantity-display-${product.id}"]`)).toContainText('2')
      
      await secondTab.close()
    })
  })

  test.describe('Locale-Specific Workflows', () => {
    test('should maintain cart functionality across language changes', async ({ page, testProducts }) => {
      const product = testProducts[0]
      
      // Add product in Spanish
      await helpers.changeLocale('es')
      await productPage.goto(product.id)
      await productPage.addToCart(1)
      
      // Change to English
      await helpers.changeLocale('en')
      await cartPage.goto()
      
      // Verify cart still works and shows correct product
      await expect(page.locator(`[data-testid="cart-item-${product.id}"]`)).toBeVisible()
      
      // Verify interface is in English
      await expect(page.locator('h1')).toContainText('Cart')
      
      // Test cart operations in English
      await page.locator(`[data-testid="increase-quantity-${product.id}"]`).click()
      await expect(page.locator(`[data-testid="quantity-display-${product.id}"]`)).toContainText('2')
      
      // Change back to Spanish
      await helpers.changeLocale('es')
      await cartPage.goto()
      
      // Verify cart state persisted and interface is in Spanish
      await expect(page.locator('h1')).toContainText('Carrito')
      await expect(page.locator(`[data-testid="quantity-display-${product.id}"]`)).toContainText('2')
    })
  })

  test.describe('Performance and Load Testing', () => {
    test('should handle large cart efficiently', async ({ page, testProducts }) => {
      // Add many items to cart
      const itemsToAdd = Math.min(testProducts.length, 10)
      
      for (let i = 0; i < itemsToAdd; i++) {
        const product = testProducts[i]
        await productPage.goto(product.id)
        await productPage.addToCart(Math.floor(Math.random() * 5) + 1)
      }
      
      // Measure cart page load time
      const startTime = Date.now()
      await cartPage.goto()
      await page.waitForSelector('[data-testid="cart-item"]')
      const loadTime = Date.now() - startTime
      
      // Should load within reasonable time (5 seconds)
      expect(loadTime).toBeLessThan(5000)
      
      // Verify all items are displayed
      const cartItems = page.locator('[data-testid^="cart-item-"]')
      await expect(cartItems).toHaveCount(itemsToAdd)
      
      // Test bulk operations performance
      if (await page.locator('text=Seleccionar todo').isVisible()) {
        const bulkStartTime = Date.now()
        await page.locator('text=Seleccionar todo').click()
        await expect(page.locator(`text=${itemsToAdd} productos seleccionados`)).toBeVisible()
        const bulkTime = Date.now() - bulkStartTime
        
        // Bulk selection should be fast
        expect(bulkTime).toBeLessThan(2000)
      }
    })
  })
})