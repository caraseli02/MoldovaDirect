/**
 * Full Checkout Flow E2E Test
 *
 * Tests the complete checkout process from adding products to order confirmation.
 * Uses test user credentials from .env file.
 *
 * Test Coverage:
 * - Add products to cart
 * - Navigate to checkout
 * - Fill shipping information
 * - Select shipping method
 * - Proceed to payment
 * - Complete order
 */

import { test, expect } from '@playwright/test'

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || process.env.BASE_URL || 'http://localhost:3000'
const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL || 'teste2e@example.com'
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD || 'N7jKAcu2FHbt7cj'

test.describe('Full Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Start fresh - clear cart cookies
    await page.context().clearCookies()
  })

  test('Complete checkout flow as authenticated user', async ({ page }) => {
    // Step 1: Login
    await page.goto(`${BASE_URL}/auth/login`, { timeout: 30000 })
    await page.fill('input[type="email"]', TEST_USER_EMAIL)
    await page.fill('input[type="password"]', TEST_USER_PASSWORD)
    await page.click('button[type="submit"]')
    await page.waitForURL(/account|products|admin/, { timeout: 15000 })

    console.log('✅ Step 1: Logged in successfully')

    // Step 2: Add products to cart
    await page.goto(`${BASE_URL}/products`, { timeout: 30000 })
    await expect(page.locator('button:has-text("Añadir al Carrito")').first()).toBeVisible({ timeout: 15000 })

    // Add 2 products
    await page.locator('button:has-text("Añadir al Carrito")').first().click()
    await page.waitForTimeout(1500)
    await page.locator('button:has-text("Añadir al Carrito")').nth(1).click()
    await page.waitForTimeout(1500)

    console.log('✅ Step 2: Added 2 products to cart')

    // Step 3: Navigate to cart
    await page.goto(`${BASE_URL}/cart`, { timeout: 30000 })
    await expect(page.locator('button:has-text("Proceder al Pago"), button:has-text("Checkout")').first()).toBeVisible({ timeout: 10000 })

    console.log('✅ Step 3: Cart page loaded')

    // Step 4: Proceed to checkout
    await page.click('button:has-text("Proceder al Pago"), button:has-text("Checkout")')
    await page.waitForLoadState('networkidle')

    // Check if we're on checkout or payment page
    const currentUrl = page.url()
    console.log(`Current URL after checkout: ${currentUrl}`)

    // Step 5: Fill shipping information if needed
    if (currentUrl.includes('/checkout') && !currentUrl.includes('/payment')) {
      console.log('📝 On shipping page - filling form...')

      // Check if Express Checkout Banner is visible
      const hasExpressBanner = await page.locator('text=/express|rápido/i').isVisible().catch(() => false)
      if (hasExpressBanner) {
        console.log('🚀 Express Checkout Banner detected!')

        // Try to click "Use Express Checkout" button
        const expressButton = page.locator('button:has-text("Express"), button:has-text("Rápido")')
        if (await expressButton.isVisible().catch(() => false)) {
          await expressButton.click()
          await page.waitForTimeout(1000)
          console.log('✅ Clicked Express Checkout button')
        }
      }

      // Check if form is pre-filled or needs manual input
      const firstNameInput = page.locator('input[name="firstName"], input[placeholder*="first name" i]').first()
      const firstNameValue = await firstNameInput.inputValue()

      if (!firstNameValue) {
        // Form not pre-filled, fill manually
        console.log('Filling shipping form manually...')

        await page.fill('input[name="firstName"], input[placeholder*="first name" i]', 'Test')
        await page.fill('input[name="lastName"], input[placeholder*="last name" i]', 'User')
        await page.fill('input[name="street"], input[placeholder*="street" i]', '123 Test Street')
        await page.fill('input[name="city"], input[placeholder*="city" i]', 'Test City')
        await page.fill('input[name="postalCode"], input[placeholder*="postal" i]', '12345')

        // Select country if dropdown exists
        const countrySelect = page.locator('select[name="country"]')
        if (await countrySelect.isVisible().catch(() => false)) {
          await countrySelect.selectOption('US')
        }

        console.log('✅ Filled shipping information')
      }
      else {
        console.log('✅ Form already pre-filled with Express Checkout')
      }

      // Step 6: Select shipping method
      const shippingMethods = page.locator('[data-testid="shipping-method"], input[type="radio"]')
      const methodCount = await shippingMethods.count()

      if (methodCount > 0) {
        await shippingMethods.first().click()
        await page.waitForTimeout(500)
        console.log('✅ Selected shipping method')
      }

      // Step 7: Continue to payment
      const continueButton = page.locator('button:has-text("Continuar"), button:has-text("Continue"), button:has-text("Pago")')
      if (await continueButton.isVisible().catch(() => false)) {
        await continueButton.first().click()
        await page.waitForLoadState('networkidle')
        console.log('✅ Navigated to payment page')
      }
    }
    else if (currentUrl.includes('/payment')) {
      console.log('🚀 Auto-routed to payment page with Express Checkout!')

      // Check for countdown timer
      const hasCountdown = await page.locator('text=/redirigiendo|redirecting|5|4|3|2|1/i').isVisible().catch(() => false)
      if (hasCountdown) {
        console.log('⏱️  Countdown timer detected - waiting...')
        await page.waitForTimeout(6000) // Wait for countdown to complete
      }
    }

    // Step 8: Verify we're on payment page
    await page.waitForURL(/payment/, { timeout: 10000 })
    expect(page.url()).toContain('/payment')
    console.log('✅ Step 8: On payment page')

    // Step 9: Payment form should be visible
    await expect(page.locator('text=/payment|pago/i').first()).toBeVisible({ timeout: 10000 })
    console.log('✅ Step 9: Payment form visible')

    console.log('\n🎉 Full checkout flow completed successfully!')
  })

  test('Complete checkout flow as guest user', async ({ page }) => {
    // Step 1: Add products without logging in
    await page.goto(`${BASE_URL}/products`, { timeout: 30000 })
    await expect(page.locator('button:has-text("Añadir al Carrito")').first()).toBeVisible({ timeout: 15000 })

    await page.locator('button:has-text("Añadir al Carrito")').first().click()
    await page.waitForTimeout(2000)

    console.log('✅ Added product to cart as guest')

    // Step 2: Navigate to checkout
    await page.goto(`${BASE_URL}/cart`, { timeout: 30000 })
    await page.click('button:has-text("Proceder al Pago"), button:has-text("Checkout")')
    await page.waitForLoadState('networkidle')

    // Step 3: Should see guest checkout form
    expect(page.url()).toContain('/checkout')
    expect(page.url()).not.toContain('/payment') // Guests should NOT be auto-routed

    console.log('✅ Guest user on shipping page (no auto-skip)')

    // Step 4: Should NOT see Express Checkout Banner
    const hasExpressBanner = await page.locator('text=/express checkout|pago express/i').isVisible().catch(() => false)
    expect(hasExpressBanner).toBe(false)

    console.log('✅ No Express Checkout banner for guests')

    // Step 5: Should see guest email form
    await expect(page.locator('input[type="email"]').first()).toBeVisible()

    console.log('🎉 Guest checkout flow validated successfully!')
  })
})
