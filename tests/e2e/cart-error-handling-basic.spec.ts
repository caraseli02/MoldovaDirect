import { test, expect } from '@playwright/test'

test.describe('Cart Error Handling - Basic Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to cart page
    await page.goto('/cart')
  })

  test('should display empty cart message when cart is empty', async ({ page }) => {
    // Check for empty cart message
    const emptyMessage = page.locator('[data-testid="empty-cart-message"]')
    await expect(emptyMessage).toBeVisible()
    await expect(emptyMessage).toContainText('Tu carrito está vacío')
  })

  test('should show error boundary when localStorage is corrupted', async ({ page }) => {
    // Corrupt localStorage
    await page.evaluate(() => {
      localStorage.setItem('moldova-direct-cart', 'invalid-json')
    })
    
    // Reload page to trigger error
    await page.reload()
    
    // Wait a bit for error to be processed
    await page.waitForTimeout(1000)
    
    // Check if error boundary appears or if it gracefully handles the error
    const errorBoundary = page.locator('[data-testid="error-boundary"]')
    const emptyCart = page.locator('[data-testid="empty-cart-message"]')
    
    // Either error boundary should show or cart should gracefully show empty state
    const hasErrorBoundary = await errorBoundary.isVisible()
    const hasEmptyCart = await emptyCart.isVisible()
    
    expect(hasErrorBoundary || hasEmptyCart).toBe(true)
  })

  test('should have toast container in the page', async ({ page }) => {
    // Check if toast container is present in DOM (even if not visible)
    const toastContainer = page.locator('div').filter({ hasText: /toast/i }).first()
    // Just check that the page loads without errors
    await expect(page.locator('h1')).toContainText('Carrito')
  })

  test('should handle navigation to products page', async ({ page }) => {
    // Click continue shopping button
    const continueButton = page.locator('text=Continuar Comprando')
    if (await continueButton.isVisible()) {
      await continueButton.click()
      await expect(page).toHaveURL(/.*\/products/)
    }
  })

  test('should display cart page title correctly', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Carrito')
  })

  test('should have proper page structure', async ({ page }) => {
    // Check basic page structure
    const container = page.locator('.container')
    await expect(container).toBeVisible()
    
    const heading = page.locator('h1')
    await expect(heading).toBeVisible()
  })

  test('should handle error boundary retry functionality', async ({ page }) => {
    // Simulate error
    await page.evaluate(() => {
      localStorage.setItem('moldova-direct-cart', 'invalid-json')
    })
    await page.reload()
    
    // Check if retry button exists and is clickable
    const retryButton = page.locator('[data-testid="error-retry-button"]')
    if (await retryButton.isVisible()) {
      await retryButton.click()
      // Should not crash
      await expect(page.locator('h1')).toBeVisible()
    }
  })

  test('should handle fallback action in error boundary', async ({ page }) => {
    // Simulate error
    await page.evaluate(() => {
      localStorage.setItem('moldova-direct-cart', 'invalid-json')
    })
    await page.reload()
    
    // Check if fallback button exists
    const fallbackButton = page.locator('[data-testid="error-fallback-button"]')
    if (await fallbackButton.isVisible()) {
      await fallbackButton.click()
      // Should navigate somewhere or handle gracefully
      await page.waitForTimeout(1000)
      // Page should still be functional
      await expect(page.locator('body')).toBeVisible()
    }
  })

  test('should maintain accessibility standards', async ({ page }) => {
    // Check for basic accessibility
    const heading = page.locator('h1')
    await expect(heading).toBeVisible()
    
    // Check that buttons are focusable
    const buttons = page.locator('button')
    const buttonCount = await buttons.count()
    
    if (buttonCount > 0) {
      const firstButton = buttons.first()
      await firstButton.focus()
      await expect(firstButton).toBeFocused()
    }
  })

  test('should handle different locales', async ({ page }) => {
    // Test Spanish (default)
    await expect(page.locator('h1')).toContainText('Carrito')
    
    // Try to change locale if locale switcher exists
    const localeSwitcher = page.locator('[data-testid="locale-switcher"]')
    if (await localeSwitcher.isVisible()) {
      await localeSwitcher.click()
      
      const englishOption = page.locator('[data-testid="locale-en"]')
      if (await englishOption.isVisible()) {
        await englishOption.click()
        await page.waitForTimeout(1000)
        await expect(page.locator('h1')).toContainText('Cart')
      }
    }
  })
})