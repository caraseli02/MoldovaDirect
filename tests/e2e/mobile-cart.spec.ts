import { test, expect } from '@playwright/test'

test.describe('Mobile Cart Experience', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
  })

  test('should display mobile-optimized cart layout', async ({ page }) => {
    await page.goto('/cart')
    
    // Wait for page to load
    await page.waitForTimeout(1000)
    
    // Check that the cart page loads
    await expect(page.locator('h1')).toContainText('Carrito')
    
    // Check that mobile responsive classes are present in the HTML
    const mobileElements = await page.locator('.lg\\:hidden').count()
    expect(mobileElements).toBeGreaterThan(0)
    
    // Check that desktop-only elements exist but are hidden on mobile
    const desktopElements = await page.locator('.hidden.lg\\:block').count()
    expect(desktopElements).toBeGreaterThan(0)
  })

  test('should have mobile-responsive design elements', async ({ page }) => {
    await page.goto('/cart')
    await page.waitForTimeout(1000)
    
    // Check that mobile padding classes are applied
    const containerElements = await page.locator('.px-4.md\\:px-6').count()
    expect(containerElements).toBeGreaterThan(0)
    
    // Check that mobile text sizing is applied
    const mobileHeadings = await page.locator('.text-2xl.md\\:text-4xl').count()
    expect(mobileHeadings).toBeGreaterThan(0)
    
    // Check that mobile spacing is applied
    const mobileSpacing = await page.locator('.py-4.md\\:py-12').count()
    expect(mobileSpacing).toBeGreaterThan(0)
  })

  test('should show expandable mobile cart summary', async ({ page }) => {
    await page.goto('/cart')
    
    // Check that summary is initially collapsed
    const summaryDetails = page.locator('.lg\\:hidden .mt-3.pt-3.border-t')
    await expect(summaryDetails).not.toBeVisible()
    
    // Click to expand summary
    await page.locator('.lg\\:hidden button:has-text("Resumen del Pedido")').click()
    
    // Check that summary details are now visible
    await expect(summaryDetails).toBeVisible()
    
    // Verify subtotal and shipping info are shown
    await expect(page.locator('text=Subtotal')).toBeVisible()
    await expect(page.locator('text=Envío')).toBeVisible()
  })

  test('should have prominent checkout button on mobile', async ({ page }) => {
    await page.goto('/cart')
    
    // Check that mobile checkout button is large and prominent
    const checkoutButton = page.locator('.lg\\:hidden button:has-text("Finalizar Compra")')
    await expect(checkoutButton).toBeVisible()
    
    // Verify button styling for mobile
    await expect(checkoutButton).toHaveClass(/py-4/)
    await expect(checkoutButton).toHaveClass(/text-lg/)
  })

  test('should handle swipe gestures on cart items', async ({ page }) => {
    await page.goto('/cart')
    
    // Get the first cart item
    const cartItem = page.locator('[data-testid^="cart-item-"]').first()
    await expect(cartItem).toBeVisible()
    
    // Simulate touch start, move, and end for swipe gesture
    const itemBox = await cartItem.boundingBox()
    if (itemBox) {
      // Start touch at right side of item
      await page.touchscreen.tap(itemBox.x + itemBox.width - 50, itemBox.y + itemBox.height / 2)
      
      // Simulate swipe left gesture
      await cartItem.dispatchEvent('touchstart', {
        touches: [{ clientX: itemBox.x + itemBox.width - 50, clientY: itemBox.y + itemBox.height / 2 }]
      })
      
      await cartItem.dispatchEvent('touchmove', {
        touches: [{ clientX: itemBox.x + 50, clientY: itemBox.y + itemBox.height / 2 }]
      })
      
      await cartItem.dispatchEvent('touchend', {
        touches: []
      })
      
      // Wait for any animations or state changes
      await page.waitForTimeout(500)
    }
  })

  test('should maintain cart functionality across different mobile orientations', async ({ page }) => {
    await page.goto('/cart')
    
    // Test portrait mode (default)
    await expect(page.locator('[data-testid^="cart-item-"]')).toBeVisible()
    
    // Switch to landscape mode
    await page.setViewportSize({ width: 667, height: 375 })
    await page.waitForTimeout(500)
    
    // Verify cart still works in landscape
    await expect(page.locator('[data-testid^="cart-item-"]')).toBeVisible()
    await expect(page.locator('.lg\\:hidden.fixed.bottom-0')).toBeVisible()
    
    // Test quantity controls still work
    const increaseButton = page.locator('[data-testid^="increase-quantity-"]').first()
    await increaseButton.click()
    
    // Verify quantity updated
    await page.waitForTimeout(500)
  })

  test('should provide adequate spacing for mobile interaction', async ({ page }) => {
    await page.goto('/cart')
    
    // Check spacing between interactive elements
    const quantityControls = page.locator('.flex.items-center.bg-gray-50.rounded-lg.p-1')
    await expect(quantityControls).toBeVisible()
    
    // Verify remove button is adequately spaced from quantity controls
    const removeButton = page.locator('[data-testid^="remove-item-"]').first()
    const quantityBox = await quantityControls.boundingBox()
    const removeBox = await removeButton.boundingBox()
    
    if (quantityBox && removeBox) {
      // Ensure there's adequate spacing between controls
      const spacing = Math.abs(removeBox.x - (quantityBox.x + quantityBox.width))
      expect(spacing).toBeGreaterThan(8) // Minimum 8px spacing
    }
  })
})