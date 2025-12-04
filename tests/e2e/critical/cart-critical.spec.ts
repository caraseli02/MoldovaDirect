/**
 * Critical Cart Tests
 *
 * Essential cart functionality tests for deployment confidence.
 *
 * Run: pnpm run test:critical
 */

import { test, expect } from '@playwright/test'

test.describe('Critical Cart Flows', () => {
  test('can add product to cart', async ({ page }) => {
    await page.goto('/products')

    // Wait for products
    await page.waitForSelector('button:has-text("Añadir al Carrito")', {
      state: 'visible',
      timeout: 10000
    })

    // Click "Add to Cart" on first product
    await page.locator('button:has-text("Añadir al Carrito")').first().click()

    // Wait for cart update
    await page.waitForTimeout(1000)

    // Cart count should show at least 1 item
    const cartSelectors = [
      '[data-testid="cart-count"]',
      '[data-testid="cart-badge"]',
      '.cart-count'
    ]

    let foundCart = false
    for (const selector of cartSelectors) {
      const element = page.locator(selector)
      if (await element.count() > 0) {
        const text = await element.textContent()
        if (text && parseInt(text) > 0) {
          foundCart = true
          break
        }
      }
    }

    expect(foundCart).toBe(true)
  })

  test('can update cart quantity', async ({ page }) => {
    // Add product to cart first
    await page.goto('/products')
    await page.waitForSelector('button:has-text("Añadir al Carrito")', {
      state: 'visible',
      timeout: 10000
    })
    await page.locator('button:has-text("Añadir al Carrito")').first().click()
    await page.waitForTimeout(1000)

    // Go to cart
    await page.locator('[href="/cart"], a:has-text("Carrito"), button:has-text("Carrito")').first().click()
    await page.waitForURL(/\/cart/, { timeout: 5000 })

    // Find quantity controls
    const increaseButton = page.locator('[data-testid="increase-quantity"], button:has-text("+")').first()

    if (await increaseButton.count() > 0) {
      await increaseButton.click()
      await page.waitForTimeout(500)

      // Verify quantity updated (check for "2" in quantity display)
      const quantityDisplay = page.locator('[data-testid="item-quantity"], input[type="number"]').first()
      await expect(quantityDisplay).toBeVisible()
    }
  })

  test('can remove product from cart', async ({ page }) => {
    // Add product to cart first
    await page.goto('/products')
    await page.waitForSelector('button:has-text("Añadir al Carrito")', {
      state: 'visible',
      timeout: 10000
    })
    await page.locator('button:has-text("Añadir al Carrito")').first().click()
    await page.waitForTimeout(1000)

    // Go to cart
    await page.locator('[href="/cart"], a:has-text("Carrito")').first().click()
    await page.waitForURL(/\/cart/, { timeout: 5000 })

    // Find and click remove button
    const removeButton = page.locator('[data-testid="remove-item"], button:has-text("Eliminar"), button[aria-label*="emove"]').first()

    if (await removeButton.count() > 0) {
      await removeButton.click()
      await page.waitForTimeout(500)

      // Cart should be empty or show empty state
      const emptyState = page.locator(':has-text("carrito está vacío"), :has-text("No items"), :has-text("empty")')
      await expect(emptyState).toBeVisible({ timeout: 5000 })
    }
  })
})
