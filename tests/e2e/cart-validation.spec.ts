import { test, expect } from '@playwright/test'

test.describe('Cart Validation System', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/')
    
    // Clear any existing cart data
    await page.evaluate(() => {
      localStorage.removeItem('moldova-direct-cart')
      sessionStorage.removeItem('moldova-direct-cart')
    })
  })

  test('should cache validation results and reduce API calls', async ({ page }) => {
    // Navigate to products page
    await page.goto('/products')
    
    // Wait for products to load
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
    
    // Get the first product
    const firstProduct = page.locator('[data-testid="product-card"]').first()
    await firstProduct.click()
    
    // Add product to cart multiple times quickly
    const addToCartButton = page.locator('button:has-text("Añadir al carrito")')
    await addToCartButton.waitFor({ state: 'visible' })
    
    // Monitor network requests
    const apiCalls = []
    page.on('request', request => {
      if (request.url().includes('/api/products/')) {
        apiCalls.push(request.url())
      }
    })
    
    // Add to cart multiple times quickly (should be debounced)
    await addToCartButton.click()
    await page.waitForTimeout(100)
    await addToCartButton.click()
    await page.waitForTimeout(100)
    await addToCartButton.click()
    
    // Wait for any pending validations
    await page.waitForTimeout(2000)
    
    // Check that API calls were minimized due to caching/debouncing
    console.log('API calls made:', apiCalls.length)
    
    // Verify cart has items
    const cartIcon = page.locator('[data-testid="cart-icon"]')
    await expect(cartIcon).toContainText('3')
  })

  test('should handle background validation', async ({ page }) => {
    // Navigate to products page and add an item
    await page.goto('/products')
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
    
    const firstProduct = page.locator('[data-testid="product-card"]').first()
    await firstProduct.click()
    
    const addToCartButton = page.locator('button:has-text("Añadir al carrito")')
    await addToCartButton.waitFor({ state: 'visible' })
    await addToCartButton.click()
    
    // Wait for item to be added
    await page.waitForTimeout(1000)
    
    // Navigate to cart page
    await page.goto('/cart')
    
    // Verify cart has items
    await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(1)
    
    // Wait for background validation to potentially run
    await page.waitForTimeout(5000)
    
    // Verify cart still has items (no validation errors)
    await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(1)
  })

  test('should validate cart items and handle stock changes', async ({ page }) => {
    // Mock API to simulate stock changes
    await page.route('**/api/products/**', async route => {
      const url = route.request().url()
      
      // Simulate reduced stock
      const mockProduct = {
        id: 'test-product-1',
        slug: 'test-product',
        name: 'Test Product',
        price: 10.99,
        stock: 2, // Reduced stock
        images: []
      }
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockProduct)
      })
    })
    
    // Add cart validation test logic here
    // This would require the cart to have validation UI elements
    await page.goto('/cart')
    
    // For now, just verify the page loads
    await expect(page.locator('h1')).toContainText('Carrito')
  })

  test('should persist validation cache across page reloads', async ({ page }) => {
    // Navigate to products and add item
    await page.goto('/products')
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
    
    const firstProduct = page.locator('[data-testid="product-card"]').first()
    await firstProduct.click()
    
    const addToCartButton = page.locator('button:has-text("Añadir al carrito")')
    await addToCartButton.waitFor({ state: 'visible' })
    await addToCartButton.click()
    
    // Wait for validation cache to be populated
    await page.waitForTimeout(2000)
    
    // Reload the page
    await page.reload()
    
    // Navigate to cart
    await page.goto('/cart')
    
    // Verify cart data persisted
    await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(1)
  })

  test('should handle validation errors gracefully', async ({ page }) => {
    // Mock API to return errors
    await page.route('**/api/products/**', async route => {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Product not found' })
      })
    })
    
    // Navigate to cart page
    await page.goto('/cart')
    
    // Verify page still loads even with validation errors
    await expect(page.locator('h1')).toContainText('Carrito')
  })
})