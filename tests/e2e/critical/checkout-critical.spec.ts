/**
 * Critical Checkout Tests
 *
 * Essential checkout flow tests for deployment confidence.
 *
 * Run: pnpm run test:critical
 */

import { test, expect } from '@playwright/test'

test.describe('Critical Checkout Flows', () => {
  test('guest can access checkout page with items in cart', async ({ page }) => {
    // Add product to cart
    await page.goto('/products')
    await page.waitForSelector('button:has-text("Añadir al Carrito")', {
      state: 'visible',
      timeout: 10000
    })
    await page.locator('button:has-text("Añadir al Carrito")').first().click()
    await page.waitForTimeout(1000)

    // Go to checkout
    await page.goto('/checkout')

    // Should see checkout form (not be redirected away)
    await expect(page).toHaveURL(/\/checkout/, { timeout: 5000 })

    // Checkout form should be visible
    const checkoutForm = page.locator('form, [data-testid="checkout-form"]')
    await expect(checkoutForm).toBeVisible({ timeout: 5000 })
  })

  test('authenticated user can access checkout', async ({ page }) => {
    const testEmail = process.env.TEST_USER_EMAIL || 'teste2e@example.com'
    const testPassword = process.env.TEST_USER_PASSWORD

    if (!testPassword) {
      test.skip()
    }

    // Login
    await page.goto('/auth/login')
    await page.locator('input[type="email"]').first().fill(testEmail)
    await page.locator('input[type="password"]').first().fill(testPassword)
    await page.locator('button[type="submit"]').click()
    await page.waitForURL(/\/account/, { timeout: 10000 })

    // Add product to cart
    await page.goto('/products')
    await page.waitForSelector('button:has-text("Añadir al Carrito")', {
      state: 'visible',
      timeout: 10000
    })
    await page.locator('button:has-text("Añadir al Carrito")').first().click()
    await page.waitForTimeout(1000)

    // Go to checkout
    await page.goto('/checkout')

    // Should see checkout page
    await expect(page).toHaveURL(/\/checkout/, { timeout: 5000 })

    // Checkout form should be visible
    const checkoutForm = page.locator('form, [data-testid="checkout-form"]')
    await expect(checkoutForm).toBeVisible({ timeout: 5000 })
  })
})
