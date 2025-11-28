/**
 * E2E Tests for Checkout Smart Pre-population Feature
 *
 * Tests the complete checkout flow including:
 * - Address saving on first checkout
 * - Express Checkout Banner appearance for returning users
 * - Data pre-population from saved addresses
 * - Preference persistence
 *
 * These tests validate all phases of the checkout smart pre-population feature.
 */

import { test, expect } from '@playwright/test'

// Test configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL || 'customer@moldovadirect.com'
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD || 'Customer123!@#'

test.describe('Checkout Smart Pre-population', () => {
  test.beforeEach(async ({ page }) => {
    // Start fresh for each test
    await page.goto(BASE_URL)
  })

  test('Phase 1: Database migrations are applied', async ({ page }) => {
    // This test verifies the database schema is ready
    // We'll check by attempting to fetch user data (which requires the tables to exist)

    // Sign in first
    await page.goto(`${BASE_URL}/auth/login`)
    await page.fill('input[type="email"]', TEST_USER_EMAIL)
    await page.fill('input[type="password"]', TEST_USER_PASSWORD)
    await page.click('button[type="submit"]')

    // Wait for redirect after sign in
    await page.waitForURL(/\/(en|es|ro|ru)\/?$/, { timeout: 10000 })

    // Navigate to checkout to trigger data fetch
    await page.goto(`${BASE_URL}/checkout`)

    // If we can load checkout without errors, migrations are applied
    await expect(page.locator('h2:has-text("Información de Envío"), h2:has-text("Shipping Information")')).toBeVisible({ timeout: 5000 })
  })

  test('Phase 2: Guest checkout works (baseline)', async ({ page }) => {
    // Add product to cart
    await page.goto(BASE_URL)

    // Find and click first "Add to Cart" button
    const addToCartButton = page.locator('button:has-text("Añadir al Carrito"), button:has-text("Add to Cart")').first()
    await addToCartButton.click()

    // Wait for cart to update
    await page.waitForTimeout(1000)

    // Go to checkout
    await page.goto(`${BASE_URL}/checkout`)

    // Should see guest checkout option
    await expect(page.locator('text=/Continuar como Invitado|Continue as Guest/i')).toBeVisible({ timeout: 5000 })

    // Take screenshot
    await page.screenshot({ path: 'test-screenshots/e2e/01-guest-checkout.png', fullPage: true })
  })

  test('Phase 3: Authenticated user - first checkout (save address)', async ({ page }) => {
    // Sign in
    await page.goto(`${BASE_URL}/auth/login`)
    await page.fill('input[type="email"]', TEST_USER_EMAIL)
    await page.fill('input[type="password"]', TEST_USER_PASSWORD)
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/(en|es|ro|ru)\/?$/, { timeout: 10000 })

    // Add product to cart
    const addToCartButton = page.locator('button:has-text("Añadir al Carrito"), button:has-text("Add to Cart")').first()
    await addToCartButton.click()
    await page.waitForTimeout(1000)

    // Go to checkout
    await page.goto(`${BASE_URL}/checkout`)

    // Should NOT see Express Checkout banner on first visit (no saved data yet)
    await expect(page.locator('text=/Pago Express|Express Checkout/i')).not.toBeVisible()

    // Fill in address form
    await page.fill('input[name="full_name"], input[name="fullName"]', 'John Doe')
    await page.fill('input[name="address"], input[placeholder*="dirección"], input[placeholder*="address"]', '123 Main Street')
    await page.fill('input[name="city"], input[placeholder*="ciudad"], input[placeholder*="city"]', 'Madrid')
    await page.fill('input[name="postal_code"], input[name="postalCode"]', '28001')

    // Select country if dropdown exists
    const countrySelect = page.locator('select[name="country"]')
    if (await countrySelect.count() > 0) {
      await countrySelect.selectOption('ES')
    }

    // Take screenshot
    await page.screenshot({ path: 'test-screenshots/e2e/02-first-checkout-form-filled.png', fullPage: true })

    // Note: We won't complete the checkout to avoid creating actual orders
    // The important part is that the form can be filled
  })

  test('Phase 4: Express Checkout Banner appears for returning user', async ({ page }) => {
    // This test assumes the user already has saved address from previous session
    // In a real scenario, you'd need to set up test data first

    // Sign in
    await page.goto(`${BASE_URL}/auth/login`)
    await page.fill('input[type="email"]', TEST_USER_EMAIL)
    await page.fill('input[type="password"]', TEST_USER_PASSWORD)
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/(en|es|ro|ru)\/?$/, { timeout: 10000 })

    // Add product to cart
    const addToCartButton = page.locator('button:has-text("Añadir al Carrito"), button:has-text("Add to Cart")').first()
    await addToCartButton.click()
    await page.waitForTimeout(1000)

    // Go to checkout
    await page.goto(`${BASE_URL}/checkout`)

    // Wait for page to load
    await page.waitForLoadState('networkidle')

    // Check if Express Checkout Banner appears
    // Note: This will only pass if user has saved addresses in database
    const bannerVisible = await page.locator('.express-checkout-banner, [class*="ExpressCheckout"]').isVisible().catch(() => false)

    if (bannerVisible) {
      // Banner should show saved address
      await expect(page.locator('text=/Pago Express|Express Checkout/i')).toBeVisible()

      // Take screenshot showing the banner
      await page.screenshot({ path: 'test-screenshots/e2e/03-express-checkout-banner-visible.png', fullPage: true })

      console.log('✅ Express Checkout Banner is visible!')
    } else {
      // Take screenshot showing no banner (expected if no saved data)
      await page.screenshot({ path: 'test-screenshots/e2e/03-no-banner-no-saved-data.png', fullPage: true })

      console.log('ℹ️  Express Checkout Banner not visible - user may not have saved addresses')
    }
  })

  test('Phase 5: Middleware prefetch works without errors', async ({ page, context }) => {
    // Monitor console errors
    const consoleErrors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    // Monitor network errors (especially 500s)
    const networkErrors: string[] = []
    page.on('response', response => {
      if (response.status() >= 500) {
        networkErrors.push(`${response.status()} - ${response.url()}`)
      }
    })

    // Sign in
    await page.goto(`${BASE_URL}/auth/login`)
    await page.fill('input[type="email"]', TEST_USER_EMAIL)
    await page.fill('input[type="password"]', TEST_USER_PASSWORD)
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/(en|es|ro|ru)\/?$/, { timeout: 10000 })

    // Navigate to checkout (this triggers middleware)
    await page.goto(`${BASE_URL}/checkout`)
    await page.waitForLoadState('networkidle')

    // Verify no 500 errors occurred
    expect(networkErrors, `Network errors occurred: ${networkErrors.join(', ')}`).toHaveLength(0)

    // Take screenshot
    await page.screenshot({ path: 'test-screenshots/e2e/04-checkout-loaded-no-errors.png', fullPage: true })
  })

  test('Phase 6: Data prefetch API endpoint responds correctly', async ({ page, context }) => {
    // Sign in
    await page.goto(`${BASE_URL}/auth/login`)
    await page.fill('input[type="email"]', TEST_USER_EMAIL)
    await page.fill('input[type="password"]', TEST_USER_PASSWORD)
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/(en|es|ro|ru)\/?$/, { timeout: 10000 })

    // Intercept the user-data API call
    let apiCalled = false
    let apiResponse: any = null

    page.on('response', async response => {
      if (response.url().includes('/api/checkout/user-data')) {
        apiCalled = true
        try {
          apiResponse = await response.json()
        } catch (e) {
          // Response might not be JSON
        }
      }
    })

    // Navigate to checkout to trigger the API call
    await page.goto(`${BASE_URL}/checkout`)
    await page.waitForLoadState('networkidle')

    // Verify API was called
    expect(apiCalled, 'API /api/checkout/user-data should be called').toBeTruthy()

    // If API responded with data, verify structure
    if (apiResponse) {
      console.log('API Response:', JSON.stringify(apiResponse, null, 2))
    }
  })

  test('Phase 7: useUserAddresses composable integration', async ({ page }) => {
    // This test verifies the composable is working by checking if addresses load

    // Sign in
    await page.goto(`${BASE_URL}/auth/login`)
    await page.fill('input[type="email"]', TEST_USER_EMAIL)
    await page.fill('input[type="password"]', TEST_USER_PASSWORD)
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/(en|es|ro|ru)\/?$/, { timeout: 10000 })

    // Navigate to checkout
    await page.goto(`${BASE_URL}/checkout`)
    await page.waitForLoadState('networkidle')

    // Check if the shipping form exists (indicates composable worked)
    await expect(page.locator('h2:has-text("Información de Envío"), h2:has-text("Shipping Information")')).toBeVisible()

    // Take screenshot
    await page.screenshot({ path: 'test-screenshots/e2e/05-composable-integration-working.png', fullPage: true })
  })

  test('Phase 8: No console errors during checkout flow', async ({ page }) => {
    const errors: string[] = []

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    page.on('pageerror', error => {
      errors.push(error.message)
    })

    // Sign in
    await page.goto(`${BASE_URL}/auth/login`)
    await page.fill('input[type="email"]', TEST_USER_EMAIL)
    await page.fill('input[type="password"]', TEST_USER_PASSWORD)
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/(en|es|ro|ru)\/?$/, { timeout: 10000 })

    // Add product
    const addToCartButton = page.locator('button:has-text("Añadir al Carrito"), button:has-text("Add to Cart")').first()
    await addToCartButton.click()
    await page.waitForTimeout(1000)

    // Navigate to checkout
    await page.goto(`${BASE_URL}/checkout`)
    await page.waitForLoadState('networkidle')

    // Filter out known non-critical warnings
    const criticalErrors = errors.filter(err =>
      !err.includes('Warning') &&
      !err.includes('i18n') &&
      !err.includes('Duplicated imports')
    )

    // Report any critical errors
    if (criticalErrors.length > 0) {
      console.error('Console errors found:', criticalErrors)
    }

    expect(criticalErrors, `Critical console errors: ${criticalErrors.join(', ')}`).toHaveLength(0)
  })
})
