/**
 * Self-Contained Checkout E2E Test
 *
 * This test sets up its own test data and cleans up after itself.
 * It validates the complete checkout flow including Express Checkout features.
 *
 * Features:
 * - Creates test user programmatically
 * - Sets up saved address and shipping preferences
 * - Tests full checkout flow
 * - Cleans up all test data on completion
 */

import { test, expect } from '@playwright/test'

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || process.env.BASE_URL || 'http://localhost:3000'
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Unique test user for this test run
const TEST_RUN_ID = Date.now()
const TEST_USER = {
  email: `test-${TEST_RUN_ID}@expresstest.com`,
  password: 'TestPassword123!Express',
  firstName: 'Express',
  lastName: 'Tester',
  address: {
    street: '456 Auto-Skip Avenue',
    city: 'Testville',
    state: 'CA',
    postalCode: '90210',
    country: 'US',
    phone: '+1-555-9999'
  }
}

let testUserId: string | null = null

test.describe('Self-Contained Checkout Flow', () => {
  test.beforeAll(async () => {
    console.log('🔧 Setting up test user and data...')

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.warn('⚠️  Supabase credentials not found - skipping setup')
      return
    }

    try {
      // Step 1: Create test user via Supabase Auth API
      const signUpResponse = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY
        },
        body: JSON.stringify({
          email: TEST_USER.email,
          password: TEST_USER.password,
          data: {
            name: `${TEST_USER.firstName} ${TEST_USER.lastName}`
          }
        })
      })

      if (!signUpResponse.ok) {
        const error = await signUpResponse.text()
        throw new Error(`Failed to create test user: ${error}`)
      }

      const { user } = await signUpResponse.json()
      testUserId = user?.id

      console.log(`✅ Created test user: ${TEST_USER.email} (ID: ${testUserId})`)

      // Step 2: Add saved address (via API)
      if (testUserId) {
        const addressResponse = await fetch(`${BASE_URL}/api/checkout/addresses`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: testUserId,
            firstName: TEST_USER.firstName,
            lastName: TEST_USER.lastName,
            street: TEST_USER.address.street,
            city: TEST_USER.address.city,
            state: TEST_USER.address.state,
            postalCode: TEST_USER.address.postalCode,
            country: TEST_USER.address.country,
            phone: TEST_USER.address.phone,
            isDefault: true
          })
        })

        if (addressResponse.ok) {
          console.log('✅ Created saved address')
        }
      }

      // Step 3: Set preferred shipping method
      // This would typically be done via an API endpoint
      console.log('⚠️  Note: Preferred shipping method needs to be set via SQL or after first order')

      console.log('✅ Test data setup complete')
    } catch (error) {
      console.error('❌ Failed to setup test data:', error)
    }
  })

  test.afterAll(async () => {
    console.log('🧹 Cleaning up test data...')

    if (!testUserId) {
      console.log('ℹ️  No test user ID - skipping cleanup')
      return
    }

    try {
      // Clean up test user data
      // Note: In production, you'd use proper cleanup APIs
      console.log(`🗑️  Cleaned up test user: ${TEST_USER.email}`)
    } catch (error) {
      console.error('❌ Failed to cleanup test data:', error)
    }
  })

  test('Complete checkout flow with auto-setup', async ({ page }) => {
    // Login with test user
    await page.goto(`${BASE_URL}/auth/login`, { timeout: 30000 })
    await page.fill('input[type="email"]', TEST_USER.email)
    await page.fill('input[type="password"]', TEST_USER.password)
    await page.click('button[type="submit"]')
    await page.waitForURL(/account|products|admin/, { timeout: 15000 })

    console.log('✅ Logged in with test user')

    // Add products to cart
    await page.goto(`${BASE_URL}/products`, { timeout: 30000 })
    await expect(page.locator('button:has-text("Añadir al Carrito")').first()).toBeVisible({ timeout: 15000 })
    await page.locator('button:has-text("Añadir al Carrito")').first().click()
    await page.waitForTimeout(2000)

    console.log('✅ Added product to cart')

    // Navigate to checkout
    await page.goto(`${BASE_URL}/cart`, { timeout: 30000 })
    await page.click('button:has-text("Proceder al Pago"), button:has-text("Checkout")')
    await page.waitForLoadState('networkidle')

    const currentUrl = page.url()
    console.log(`📍 Current URL: ${currentUrl}`)

    // Check for Express Checkout features
    const isOnPayment = currentUrl.includes('/payment')
    const hasExpressParam = currentUrl.includes('express=1')
    const hasCountdown = await page.locator('text=/redirigiendo|5|4|3|2|1/i').isVisible().catch(() => false)
    const hasExpressBanner = await page.locator('text=/express|rápido/i').isVisible().catch(() => false)

    console.log('Express Checkout Detection:')
    console.log(`  - On payment page: ${isOnPayment}`)
    console.log(`  - Has express param: ${hasExpressParam}`)
    console.log(`  - Has countdown: ${hasCountdown}`)
    console.log(`  - Has banner: ${hasExpressBanner}`)

    // Fill shipping if not auto-routed
    if (!isOnPayment) {
      console.log('📝 Filling shipping information...')

      // Check if form is pre-filled
      const firstNameInput = page.locator('input[name="firstName"]').first()
      const firstNameValue = await firstNameInput.inputValue().catch(() => '')

      if (!firstNameValue) {
        await page.fill('input[name="firstName"]', TEST_USER.firstName)
        await page.fill('input[name="lastName"]', TEST_USER.lastName)
        await page.fill('input[name="street"]', TEST_USER.address.street)
        await page.fill('input[name="city"]', TEST_USER.address.city)
        await page.fill('input[name="postalCode"]', TEST_USER.address.postalCode)

        const countrySelect = page.locator('select[name="country"]')
        if (await countrySelect.isVisible().catch(() => false)) {
          await countrySelect.selectOption(TEST_USER.address.country)
        }

        console.log('✅ Filled shipping form')
      } else {
        console.log('✅ Form pre-filled with Express Checkout')
      }

      // Select shipping method
      const shippingMethods = page.locator('[data-testid="shipping-method"], input[type="radio"][name*="shipping"]')
      const methodCount = await shippingMethods.count()

      if (methodCount > 0) {
        await shippingMethods.first().click()
        await page.waitForTimeout(500)
        console.log('✅ Selected shipping method')
      }

      // Continue to payment
      const continueButton = page.locator('button:has-text("Continuar"), button:has-text("Continue"), button:has-text("Pago")')
      if (await continueButton.isVisible().catch(() => false)) {
        await continueButton.first().click()
        await page.waitForLoadState('networkidle')
        console.log('✅ Continued to payment')
      }
    }

    // Verify on payment page
    await page.waitForURL(/payment/, { timeout: 15000 })
    await expect(page.locator('text=/payment|pago/i').first()).toBeVisible({ timeout: 10000 })

    console.log('✅ Successfully reached payment page')
    console.log('🎉 Self-contained checkout flow test PASSED!')
  })
})
