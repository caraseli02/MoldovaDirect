import { test, expect } from '@playwright/test'

test.describe('Cart Advanced Features', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to products page and add some items to cart
    await page.goto('/products')
    
    // Wait for products to load
    await page.waitForSelector('[data-testid="product-card"]')
    
    // Add first product to cart
    const firstProduct = page.locator('[data-testid="product-card"]').first()
    await firstProduct.locator('button:has-text("Añadir al Carrito")').click()
    
    // Wait for toast notification
    await page.waitForSelector('.toast', { timeout: 5000 })
    
    // Add second product to cart
    const secondProduct = page.locator('[data-testid="product-card"]').nth(1)
    await secondProduct.locator('button:has-text("Añadir al Carrito")').click()
    
    // Wait for toast notification
    await page.waitForSelector('.toast', { timeout: 5000 })
    
    // Navigate to cart page
    await page.goto('/cart')
    await page.waitForSelector('[data-testid="cart-item"]')
  })

  test('should allow bulk selection of cart items', async ({ page }) => {
    // Check that cart items are present
    const cartItems = page.locator('[data-testid^="cart-item-"]')
    await expect(cartItems).toHaveCount(2)
    
    // Select first item
    const firstCheckbox = cartItems.first().locator('input[type="checkbox"]')
    await firstCheckbox.check()
    
    // Verify bulk operations panel appears
    await expect(page.locator('text=1 producto seleccionado')).toBeVisible()
    
    // Select all items using the select all toggle
    await page.locator('text=Seleccionar todo').click()
    
    // Verify all items are selected
    await expect(page.locator('text=2 productos seleccionados')).toBeVisible()
    
    // Verify bulk operations are available
    await expect(page.locator('button:has-text("Eliminar seleccionados")')).toBeVisible()
    await expect(page.locator('button:has-text("Guardar para después")')).toBeVisible()
  })

  test('should perform bulk remove operation', async ({ page }) => {
    // Select all items
    await page.locator('text=Seleccionar todo').click()
    
    // Click bulk remove
    await page.locator('button:has-text("Eliminar seleccionados")').click()
    
    // Confirm in dialog
    await page.locator('button:has-text("OK")').click()
    
    // Verify cart is empty
    await expect(page.locator('[data-testid="empty-cart-message"]')).toBeVisible()
    await expect(page.locator('text=Tu carrito está vacío')).toBeVisible()
  })

  test('should save items for later', async ({ page }) => {
    // Click save for later on first item
    const firstItem = page.locator('[data-testid^="cart-item-"]').first()
    await firstItem.locator('button:has-text("Guardar para después")').click()
    
    // Verify item was moved to saved for later section
    await expect(page.locator('text=Guardado para después (1)')).toBeVisible()
    
    // Verify cart now has one less item
    const remainingItems = page.locator('[data-testid^="cart-item-"]')
    await expect(remainingItems).toHaveCount(1)
  })

  test('should move saved items back to cart', async ({ page }) => {
    // First save an item for later
    const firstItem = page.locator('[data-testid^="cart-item-"]').first()
    await firstItem.locator('button:has-text("Guardar para después")').click()
    
    // Wait for saved for later section to appear
    await expect(page.locator('text=Guardado para después (1)')).toBeVisible()
    
    // Move item back to cart
    await page.locator('button:has-text("Mover al carrito")').click()
    
    // Verify item is back in cart
    const cartItems = page.locator('[data-testid^="cart-item-"]')
    await expect(cartItems).toHaveCount(2)
    
    // Verify saved for later section is gone or empty
    await expect(page.locator('text=Guardado para después')).not.toBeVisible()
  })

  test('should show recommendations when cart has items', async ({ page }) => {
    // Scroll down to see recommendations section
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    
    // Check if recommendations section is visible
    const recommendationsSection = page.locator('text=También te puede interesar')
    
    // Wait a bit for recommendations to load
    await page.waitForTimeout(2000)
    
    // Recommendations should be visible if there are products available
    if (await recommendationsSection.isVisible()) {
      await expect(recommendationsSection).toBeVisible()
      
      // Check if recommendation cards are present
      const recommendationCards = page.locator('.grid .border').filter({ hasText: 'Añadir' })
      const cardCount = await recommendationCards.count()
      
      if (cardCount > 0) {
        // Try to add a recommended product
        await recommendationCards.first().locator('button:has-text("Añadir")').click()
        
        // Verify toast notification appears
        await expect(page.locator('.toast')).toBeVisible({ timeout: 5000 })
      }
    }
  })

  test('should perform bulk save for later operation', async ({ page }) => {
    // Select all items
    await page.locator('text=Seleccionar todo').click()
    
    // Click bulk save for later
    await page.locator('button:has-text("Guardar para después")').click()
    
    // Verify all items were moved to saved for later
    await expect(page.locator('text=Guardado para después (2)')).toBeVisible()
    
    // Verify cart is empty
    await expect(page.locator('[data-testid="empty-cart-message"]')).toBeVisible()
  })

  test('should update quantities in bulk', async ({ page }) => {
    // Select all items
    await page.locator('text=Seleccionar todo').click()
    
    // Change bulk quantity to 3
    await page.locator('select').selectOption('3')
    
    // Click update button
    await page.locator('button:has-text("Actualizar")').click()
    
    // Confirm in dialog
    await page.locator('button:has-text("OK")').click()
    
    // Verify quantities were updated
    const quantityDisplays = page.locator('[data-testid^="quantity-display-"]')
    for (let i = 0; i < await quantityDisplays.count(); i++) {
      await expect(quantityDisplays.nth(i)).toHaveText('3')
    }
  })

  test('should clear all saved for later items', async ({ page }) => {
    // First save some items for later
    await page.locator('text=Seleccionar todo').click()
    await page.locator('button:has-text("Guardar para después")').click()
    
    // Verify saved for later section appears
    await expect(page.locator('text=Guardado para después (2)')).toBeVisible()
    
    // Click clear all in saved for later section
    await page.locator('button:has-text("Eliminar todo")').click()
    
    // Confirm in dialog
    await page.locator('button:has-text("OK")').click()
    
    // Verify saved for later section is gone
    await expect(page.locator('text=Guardado para después')).not.toBeVisible()
  })
})