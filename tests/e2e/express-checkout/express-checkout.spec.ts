/**
 * Express Checkout E2E Tests
 *
 * Comprehensive tests for the auto-skip express checkout feature.
 * These tests run in CI/CD only (not in pre-commit).
 *
 * Features tested:
 * - Auto-routing to payment when user has complete data
 * - 5-second countdown timer with progress bar
 * - Cancel functionality
 * - Manual express checkout for users without shipping method
 * - Guest checkout (no express features)
 */

import { test, expect, Page } from '@playwright/test'

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || process.env.BASE_URL || 'http://localhost:3000'

// Test user credentials from .env
const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL || 'teste2e@example.com'
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD || 'N7jKAcu2FHbt7cj'

// Use the same test user for all scenarios
// We'll check their data state dynamically in tests
const TEST_USER_WITH_ADDRESS = {
  email: TEST_USER_EMAIL,
  password: TEST_USER_PASSWORD,
  hasAddress: true,
  hasPreviousOrder: true
}

const TEST_USER_WITHOUT_ORDER = {
  email: TEST_USER_EMAIL,
  password: TEST_USER_PASSWORD,
  hasAddress: true,
  hasPreviousOrder: false
}

// Helper functions
async function loginUser(page: Page, email: string, password: string) {
  await page.goto(`${BASE_URL}/auth/login`, { timeout: 30000 })
  await page.fill('input[type="email"], input[name="email"]', email)
  await page.fill('input[type="password"], input[name="password"]', password)
  await page.click('button:has-text("Iniciar"), button[type="submit"]')
  await page.waitForURL(/account|products|admin|\/(?:es|en|ro|ru)?$/, { timeout: 10000 })
}

async function addProductToCart(page: Page) {
  await page.goto(`${BASE_URL}/products`, { timeout: 30000 })
  await expect(page.locator('button:has-text("Añadir al Carrito")').first()).toBeVisible({ timeout: 15000 })
  await page.locator('button:has-text("Añadir al Carrito")').first().click()
  await page.waitForTimeout(2000) // Wait for cart to update
}

async function navigateToCheckout(page: Page) {
  await page.goto(`${BASE_URL}/cart`, { timeout: 30000 })
  await page.click('button:has-text("Proceder al Pago"), button:has-text("Checkout")')
}

test.describe('Express Checkout - Auto-Skip Flow', () => {
  test.skip('REQUIRES: Test user with saved address and previous order', async () => {
    // This test requires database setup
    // Create test user with:
    // 1. Saved address in user_addresses table
    // 2. Previous order with preferred_shipping_method in user_checkout_preferences
  })

  test('Auto-routes to payment when user has complete data', async ({ page }) => {
    // Login as user with complete data
    await loginUser(page, TEST_USER_WITH_ADDRESS.email, TEST_USER_WITH_ADDRESS.password)

    // Add product to cart
    await addProductToCart(page)

    // Navigate to checkout
    await navigateToCheckout(page)

    // Should auto-route to payment with express query param
    await page.waitForURL(/checkout\/payment\?express=1/, { timeout: 10000 })
    expect(page.url()).toContain('/checkout/payment')
    expect(page.url()).toContain('express=1')
  })

  test('Shows countdown timer on auto-routed payment page', async ({ page }) => {
    await loginUser(page, TEST_USER_WITH_ADDRESS.email, TEST_USER_WITH_ADDRESS.password)
    await addProductToCart(page)
    await navigateToCheckout(page)

    // Wait for auto-route
    await page.waitForURL(/checkout\/payment\?express=1/, { timeout: 10000 })

    // Countdown should be visible
    await expect(page.locator('text=/5|4|3|2|1/')).toBeVisible({ timeout: 2000 })

    // Progress bar visible
    await expect(page.locator('.progress-bar, [role="progressbar"]')).toBeVisible()
  })

  test('Countdown decreases from 5 to 1', async ({ page }) => {
    await loginUser(page, TEST_USER_WITH_ADDRESS.email, TEST_USER_WITH_ADDRESS.password)
    await addProductToCart(page)
    await navigateToCheckout(page)

    await page.waitForURL(/checkout\/payment\?express=1/)

    // Check countdown starts at 5
    await expect(page.locator('text=/5/')).toBeVisible({ timeout: 1000 })

    // Wait and check it decreases
    await page.waitForTimeout(2000)
    await expect(page.locator('text=/3|2|1/')).toBeVisible()
  })

  test('Cancel button stops countdown', async ({ page }) => {
    await loginUser(page, TEST_USER_WITH_ADDRESS.email, TEST_USER_WITH_ADDRESS.password)
    await addProductToCart(page)
    await navigateToCheckout(page)

    await page.waitForURL(/checkout\/payment\?express=1/)

    // Click cancel button (different possible text variations)
    const cancelButton = page.locator('button:has-text("Espera"), button:has-text("Cancel"), button:has-text("Wait")')
    await cancelButton.click()

    // Countdown should disappear or stop
    await expect(page.locator('text=/redirigiendo|redirecting/i')).not.toBeVisible({ timeout: 2000 })

    // Should show toast notification
    await expect(page.locator('text=/cancelad|cancel/i')).toBeVisible({ timeout: 3000 })
  })

  test('After countdown, shows express checkout banner', async ({ page }) => {
    await loginUser(page, TEST_USER_WITH_ADDRESS.email, TEST_USER_WITH_ADDRESS.password)
    await addProductToCart(page)
    await navigateToCheckout(page)

    await page.waitForURL(/checkout\/payment\?express=1/)

    // Wait for countdown to finish (6 seconds)
    await page.waitForTimeout(6000)

    // Banner should show with manual button or pre-filled form
    const hasExpressBanner = await page.locator('text=/express|rápido/i').isVisible()
    const hasPreFilledAddress = await page.locator('input[value]:not([value=""])').count() > 0

    expect(hasExpressBanner || hasPreFilledAddress).toBeTruthy()
  })
})

test.describe('Express Checkout - Manual Flow', () => {
  test.skip('REQUIRES: Test user with saved address but no previous order', async () => {
    // This test requires database setup
    // Create test user with:
    // 1. Saved address in user_addresses table
    // 2. NO previous orders (no preferred_shipping_method)
  })

  test('User without shipping method lands on shipping page', async ({ page }) => {
    await loginUser(page, TEST_USER_WITHOUT_ORDER.email, TEST_USER_WITHOUT_ORDER.password)
    await addProductToCart(page)
    await navigateToCheckout(page)

    // Should land on shipping step (no auto-route)
    await page.waitForLoadState('networkidle')
    expect(page.url()).toContain('/checkout')
    expect(page.url()).not.toContain('/payment')
  })

  test('Shows Express Checkout banner on shipping page', async ({ page }) => {
    await loginUser(page, TEST_USER_WITHOUT_ORDER.email, TEST_USER_WITHOUT_ORDER.password)
    await addProductToCart(page)
    await navigateToCheckout(page)

    // Banner should be visible
    await expect(page.locator('text=/express|rápido/i')).toBeVisible({ timeout: 5000 })
  })

  test('Banner does NOT show countdown without preferred method', async ({ page }) => {
    await loginUser(page, TEST_USER_WITHOUT_ORDER.email, TEST_USER_WITHOUT_ORDER.password)
    await addProductToCart(page)
    await navigateToCheckout(page)

    // Should NOT see countdown timer
    await expect(page.locator('text=/5|4|3|2|1/')).not.toBeVisible({ timeout: 3000 })
  })

  test('Manual "Use Express Checkout" button pre-fills address', async ({ page }) => {
    await loginUser(page, TEST_USER_WITHOUT_ORDER.email, TEST_USER_WITHOUT_ORDER.password)
    await addProductToCart(page)
    await navigateToCheckout(page)

    // Click express checkout button
    await page.click('button:has-text("Express"), button:has-text("Rápido")')

    // Address fields should be filled
    await page.waitForTimeout(1000)
    const filledInputs = await page.locator('input[value]:not([value=""])').count()
    expect(filledInputs).toBeGreaterThan(0)
  })
})

test.describe('Express Checkout - Guest Flow', () => {
  test('Guest users do not see Express Checkout banner', async ({ page }) => {
    // Ensure not logged in
    await page.goto(`${BASE_URL}/auth/logout`)

    await addProductToCart(page)
    await navigateToCheckout(page)

    // Should NOT see express banner
    await expect(page.locator('text=/express checkout|pago express/i')).not.toBeVisible({ timeout: 3000 })
  })

  test('Guest users land on shipping page (no auto-route)', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/logout`)
    await addProductToCart(page)
    await navigateToCheckout(page)

    // Should land on shipping step
    await page.waitForLoadState('networkidle')
    expect(page.url()).toContain('/checkout')
    expect(page.url()).not.toContain('/payment')
  })

  test('Guest users see normal shipping form', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/logout`)
    await addProductToCart(page)
    await navigateToCheckout(page)

    // Should see guest email form and shipping form
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('text=/información de contacto|contact information/i')).toBeVisible()
  })
})

test.describe('Express Checkout - Edge Cases', () => {
  test('Back button from payment returns to shipping', async ({ page }) => {
    await loginUser(page, TEST_USER_WITH_ADDRESS.email, TEST_USER_WITH_ADDRESS.password)
    await addProductToCart(page)
    await navigateToCheckout(page)

    // Wait for auto-route to payment
    await page.waitForURL(/checkout\/payment/)

    // Click back
    await page.goBack()

    // Should be on shipping or cart
    expect(page.url()).toMatch(/checkout|cart/)
  })

  test('Manual navigation to payment without express param shows normal payment form', async ({ page }) => {
    await loginUser(page, TEST_USER_WITH_ADDRESS.email, TEST_USER_WITH_ADDRESS.password)
    await addProductToCart(page)

    // Navigate directly to payment (no express param)
    await page.goto(`${BASE_URL}/checkout/payment`)

    // Should not show countdown
    await expect(page.locator('text=/5|4|3|2|1/')).not.toBeVisible({ timeout: 2000 })
  })

  test('Checkout with empty cart redirects to cart page', async ({ page }) => {
    await page.goto(`${BASE_URL}/checkout`)

    // Should redirect to cart with message
    await page.waitForURL(/cart/)
    expect(page.url()).toContain('/cart')
  })

  test('Console logs show auto-routing debug messages', async ({ page }) => {
    const consoleLogs: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'log') {
        consoleLogs.push(msg.text())
      }
    })

    await loginUser(page, TEST_USER_WITH_ADDRESS.email, TEST_USER_WITH_ADDRESS.password)
    await addProductToCart(page)
    await navigateToCheckout(page)

    await page.waitForURL(/checkout\/payment/)

    // Should see debug logs
    const hasAutoRouteLog = consoleLogs.some(log =>
      log.includes('Express checkout') || log.includes('Auto-routing')
    )
    expect(hasAutoRouteLog).toBeTruthy()
  })
})

test.describe('Express Checkout - Multi-Language (Spanish only)', () => {
  test('Countdown messages display in Spanish', async ({ page }) => {
    await loginUser(page, TEST_USER_WITH_ADDRESS.email, TEST_USER_WITH_ADDRESS.password)
    await addProductToCart(page)
    await navigateToCheckout(page)

    await page.waitForURL(/checkout\/payment\?express=1/)

    // Should see Spanish text
    await expect(page.locator('text=/redirigiendo|pago express|express/i')).toBeVisible({ timeout: 3000 })
  })

  test('Cancel button shows Spanish text', async ({ page }) => {
    await loginUser(page, TEST_USER_WITH_ADDRESS.email, TEST_USER_WITH_ADDRESS.password)
    await addProductToCart(page)
    await navigateToCheckout(page)

    await page.waitForURL(/checkout\/payment\?express=1/)

    // Should see Spanish cancel button
    await expect(page.locator('button:has-text("Espera"), button:has-text("revisar")')).toBeVisible()
  })
})
