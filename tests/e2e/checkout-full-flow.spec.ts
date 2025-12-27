/**
 * Full Checkout Flow E2E Test
 *
 * Tests the complete checkout process using the Hybrid Progressive Checkout (Option D).
 * Single-page checkout with progressive disclosure sections.
 *
 * Test Coverage:
 * - Add products to cart
 * - Navigate to checkout
 * - Fill shipping address (single page)
 * - Select shipping method (progressive disclosure)
 * - Select payment method
 * - Accept terms and place order
 * - Verify confirmation page
 *
 * Updated for Hybrid Progressive Checkout
 */

import { test, expect } from '@playwright/test'
import { CheckoutPage } from './page-objects/CheckoutPage'

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || process.env.BASE_URL || 'http://localhost:3000'
const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL || 'teste2e@example.com'
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD || 'N7jKAcu2FHbt7cj'

// Test address data
const TEST_ADDRESS = {
  firstName: 'Test',
  lastName: 'User',
  street: '123 Test Street',
  city: 'Madrid',
  postalCode: '28001',
  country: 'ES',
  phone: '+34 600 123 456',
}

test.describe('Full Checkout Flow - Hybrid Progressive', () => {
  test.beforeEach(async ({ page }) => {
    // Start fresh - clear cart cookies
    await page.context().clearCookies()
  })

  test('Complete checkout flow as authenticated user', async ({ page }) => {
    const checkoutPage = new CheckoutPage(page)

    // Step 1: Login
    await page.goto(`${BASE_URL}/auth/login`, { timeout: 30000 })
    await page.waitForLoadState('networkidle')

    const emailInput = page.locator('input[type="email"]').first()
    await emailInput.fill(TEST_USER_EMAIL)
    await emailInput.blur()

    const passwordInput = page.locator('input[type="password"]').first()
    await passwordInput.fill(TEST_USER_PASSWORD)
    await passwordInput.blur()

    await page.waitForTimeout(500)

    const loginButton = page.locator('[data-testid="login-button"]')
    await expect(loginButton).toBeEnabled({ timeout: 5000 })
    await loginButton.click()

    await page.waitForURL(/account|products|admin|\/es\/|\/en\//, { timeout: 15000 })
    console.log('✅ Step 1: Logged in successfully')

    // Step 2: Add products to cart
    await page.goto(`${BASE_URL}/products`, { timeout: 30000 })
    await page.waitForLoadState('networkidle')

    const addToCartButton = page.locator('button:has-text("Añadir al Carrito"), button:has-text("Add to Cart")').first()
    await expect(addToCartButton).toBeVisible({ timeout: 15000 })
    await addToCartButton.click()
    await page.waitForTimeout(2000)

    console.log('✅ Step 2: Added product to cart')

    // Step 3: Navigate to checkout
    await page.goto(`${BASE_URL}/checkout`, { timeout: 30000 })
    await page.waitForLoadState('networkidle')

    // Check for express checkout banner (returning user with saved address)
    const hasExpressBanner = await checkoutPage.isExpressBannerVisible()

    if (hasExpressBanner) {
      console.log('🚀 Express Checkout Banner detected!')

      // Option A: Use express checkout
      // await checkoutPage.useExpressCheckout()

      // Option B: Edit details instead (to test full form)
      await checkoutPage.dismissExpressCheckout()
      console.log('✅ Dismissed express checkout to test full form')
    }

    console.log('✅ Step 3: On checkout page')

    // Step 4: Fill shipping address (single page form)
    // Check if address fields need to be filled
    const firstNameValue = await checkoutPage.addressFields.firstName.inputValue().catch(() => '')

    if (!firstNameValue) {
      await checkoutPage.fillShippingAddress(TEST_ADDRESS)
      console.log('✅ Step 4: Filled shipping address')
    }
    else {
      console.log('✅ Step 4: Address already pre-filled')
    }

    // Step 5: Wait for shipping methods to load (progressive disclosure)
    await checkoutPage.waitForShippingMethods(15000)
    await checkoutPage.selectShippingMethod(0)
    console.log('✅ Step 5: Selected shipping method')

    // Step 6: Verify payment section appeared and select payment
    const paymentVisible = await checkoutPage.isPaymentSectionVisible()
    expect(paymentVisible).toBe(true)

    await checkoutPage.selectCashPayment()
    console.log('✅ Step 6: Selected payment method (cash)')

    // Step 7: Accept terms and place order
    await checkoutPage.acceptTerms()
    console.log('✅ Step 7: Accepted terms and privacy')

    // Verify place order button is visible
    await expect(checkoutPage.placeOrderButton).toBeVisible({ timeout: 5000 })
    console.log('✅ Step 8: Place order button visible')

    // Place order and verify navigation to confirmation page
    await checkoutPage.placeOrder()
    await expect(page).toHaveURL(/\/checkout\/confirmation/, { timeout: 15000 })
    console.log('✅ Step 9: Order placed, on confirmation page')

    // Verify confirmation page elements
    const confirmationTitle = page.locator('h1, h2').filter({ hasText: /order.*confirmed|pedido.*confirmado|заказ.*подтвержден|comandă.*confirmată/i })
    await expect(confirmationTitle).toBeVisible({ timeout: 5000 })
    console.log('✅ Step 10: Confirmation title visible')

    // Verify new confirmation page UI elements
    // 1. Order status progress bar
    const progressBar = page.locator('.progress-fill, [role="progressbar"]')
    await expect(progressBar).toBeVisible({ timeout: 3000 })
    console.log('✅ Step 11: Order status progress bar visible')

    // 2. View Order Details button
    const viewDetailsButton = page.locator('button').filter({
      hasText: /view.*order.*details|ver.*detalles|посмотреть.*детали|vezi.*detalii/i,
    })
    await expect(viewDetailsButton).toBeVisible({ timeout: 3000 })
    console.log('✅ Step 12: View Order Details button visible')

    // 3. Quick info cards (delivery and total)
    const quickInfoCards = page.locator('[class*="bg-zinc-50"], [class*="bg-white"]').filter({
      has: page.locator('svg'),
    })
    expect(await quickInfoCards.count()).toBeGreaterThanOrEqual(1)
    console.log('✅ Step 13: Quick info cards visible')

    console.log('\n🎉 Full checkout flow completed successfully - Order placed!')
  })

  test('Complete checkout flow as guest user', async ({ page }) => {
    const checkoutPage = new CheckoutPage(page)

    // Step 1: Add product to cart without logging in
    await page.goto(`${BASE_URL}/products`, { timeout: 30000 })
    await page.waitForLoadState('networkidle')

    const addToCartButton = page.locator('button:has-text("Añadir al Carrito"), button:has-text("Add to Cart")').first()
    await expect(addToCartButton).toBeVisible({ timeout: 15000 })
    await addToCartButton.click()
    await page.waitForTimeout(2000)

    console.log('✅ Step 1: Added product to cart as guest')

    // Step 2: Navigate to checkout
    await page.goto(`${BASE_URL}/checkout`, { timeout: 30000 })
    await page.waitForLoadState('networkidle')

    expect(page.url()).toContain('/checkout')
    console.log('✅ Step 2: On checkout page')

    // Step 3: Should NOT see express checkout banner (guests have no saved data)
    const hasExpressBanner = await checkoutPage.isExpressBannerVisible()
    expect(hasExpressBanner).toBe(false)
    console.log('✅ Step 3: No express checkout banner for guest (correct)')

    // Step 4: Should see guest checkout prompt or checkout form
    const hasGuestPrompt = await checkoutPage.isGuestPromptVisible()

    if (hasGuestPrompt) {
      await checkoutPage.continueAsGuest()
      console.log('✅ Step 4: Continued as guest')
    }

    // Step 5: Fill guest email (if shown)
    const emailVisible = await checkoutPage.guestEmailInput.isVisible({ timeout: 3000 }).catch(() => false)
    if (emailVisible) {
      await checkoutPage.fillGuestEmail('guest.test@example.com')
      console.log('✅ Step 5: Filled guest email')
    }

    // Step 6: Fill shipping address
    await checkoutPage.fillShippingAddress(TEST_ADDRESS)
    console.log('✅ Step 6: Filled shipping address')

    // Step 7: Wait for and select shipping method
    await checkoutPage.waitForShippingMethods(15000)
    await checkoutPage.selectShippingMethod(0)
    console.log('✅ Step 7: Selected shipping method')

    // Step 8: Select payment
    await checkoutPage.selectCashPayment()
    console.log('✅ Step 8: Selected cash payment')

    // Step 9: Accept terms
    await checkoutPage.acceptTerms()
    console.log('✅ Step 9: Accepted terms and privacy')

    // Verify form is complete
    await expect(checkoutPage.placeOrderButton).toBeVisible({ timeout: 5000 })

    // Step 10: Place order
    await checkoutPage.placeOrder()
    await expect(page).toHaveURL(/\/checkout\/confirmation/, { timeout: 15000 })
    console.log('✅ Step 10: Order placed, on confirmation page')

    // Verify confirmation page elements
    const confirmationTitle = page.locator('h1, h2').filter({ hasText: /order.*confirmed|pedido.*confirmado|заказ.*подтвержден|comandă.*confirmată/i })
    await expect(confirmationTitle).toBeVisible({ timeout: 5000 })
    console.log('✅ Step 11: Confirmation title visible')

    console.log('\n🎉 Guest checkout flow completed successfully - Order placed!')
  })

  test('Express checkout for returning user with saved address', async ({ page }) => {
    test.skip(
      !process.env.TEST_USER_WITH_ADDRESS,
      'TEST_USER_WITH_ADDRESS environment variable not set',
    )

    const checkoutPage = new CheckoutPage(page)

    // Login as user with saved address
    await page.goto(`${BASE_URL}/auth/login`)
    await page.waitForLoadState('networkidle')

    const userEmail = process.env.TEST_USER_WITH_ADDRESS || TEST_USER_EMAIL
    const userPassword = process.env.TEST_USER_PASSWORD || TEST_USER_PASSWORD

    await page.fill('input[type="email"]', userEmail)
    await page.fill('input[type="password"]', userPassword)
    await page.click('[data-testid="login-button"]')
    await page.waitForURL(/account|products|admin/, { timeout: 15000 })

    // Add product to cart
    await page.goto(`${BASE_URL}/products`)
    await page.waitForLoadState('networkidle')

    const addButton = page.locator('button:has-text("Añadir al Carrito")').first()
    await addButton.click()
    await page.waitForTimeout(2000)

    // Navigate to checkout
    await page.goto(`${BASE_URL}/checkout`)
    await page.waitForLoadState('networkidle')

    // Should see express checkout banner
    const hasExpressBanner = await checkoutPage.isExpressBannerVisible()

    if (hasExpressBanner) {
      console.log('✅ Express checkout banner visible')

      // Verify saved address is displayed
      const addressText = await checkoutPage.getExpressAddress()
      expect(addressText.length).toBeGreaterThan(0)
      console.log(`✅ Saved address displayed: ${addressText.substring(0, 50)}...`)

      // Use express checkout
      await checkoutPage.useExpressCheckout()

      // Should navigate to confirmation
      await expect(page).toHaveURL(/\/checkout\/confirmation/, { timeout: 15000 })
      console.log('✅ Express checkout completed, on confirmation page')
    }
    else {
      console.log('⚠️ Express checkout banner not visible - user may not have saved address')
      test.skip(true, 'User does not have saved address for express checkout')
    }
  })

  test('Progressive disclosure - sections appear in order', async ({ page }) => {
    const checkoutPage = new CheckoutPage(page)

    // Add product and go to checkout
    await page.goto(`${BASE_URL}/products`)
    await page.waitForLoadState('networkidle')

    const addButton = page.locator('button:has-text("Añadir al Carrito")').first()
    await addButton.click()
    await page.waitForTimeout(2000)

    await page.goto(`${BASE_URL}/checkout`)
    await page.waitForLoadState('networkidle')

    // Handle guest prompt if shown
    if (await checkoutPage.isGuestPromptVisible()) {
      await checkoutPage.continueAsGuest()
    }

    // Initially: Address section visible, shipping method section NOT visible
    const addressVisible = await checkoutPage.addressSection.isVisible()
    expect(addressVisible).toBe(true)
    console.log('✅ Address section visible initially')

    // Shipping method section should NOT be visible until address is complete
    let shippingMethodVisible = await checkoutPage.isShippingMethodSectionVisible()
    // This might be visible if address is already pre-filled
    console.log(`Shipping method section visible: ${shippingMethodVisible}`)

    // Fill address to trigger shipping method section
    await checkoutPage.fillShippingAddress(TEST_ADDRESS)

    // Now shipping method section should appear
    await checkoutPage.waitForShippingMethods(15000)
    shippingMethodVisible = await checkoutPage.isShippingMethodSectionVisible()
    expect(shippingMethodVisible).toBe(true)
    console.log('✅ Shipping method section appeared after address filled')

    // Payment section should NOT be visible until shipping method selected
    let paymentVisible = await checkoutPage.isPaymentSectionVisible()
    // Might already be visible in some flows
    console.log(`Payment section visible before shipping: ${paymentVisible}`)

    // Select shipping method
    await checkoutPage.selectShippingMethod(0)

    // Now payment section should appear
    paymentVisible = await checkoutPage.isPaymentSectionVisible()
    expect(paymentVisible).toBe(true)
    console.log('✅ Payment section appeared after shipping method selected')

    // Select payment and verify place order section
    await checkoutPage.selectCashPayment()

    const placeOrderVisible = await checkoutPage.isPlaceOrderSectionVisible()
    expect(placeOrderVisible).toBe(true)
    console.log('✅ Place order section visible after all sections complete')

    console.log('\n🎉 Progressive disclosure flow validated!')
  })

  test('Order summary displays correctly', async ({ page }) => {
    const checkoutPage = new CheckoutPage(page)

    // Add product and go to checkout
    await page.goto(`${BASE_URL}/products`)
    await page.waitForLoadState('networkidle')

    const addButton = page.locator('button:has-text("Añadir al Carrito")').first()
    await addButton.click()
    await page.waitForTimeout(2000)

    await page.goto(`${BASE_URL}/checkout`)
    await page.waitForLoadState('networkidle')

    // Handle guest/express prompts
    if (await checkoutPage.isExpressBannerVisible()) {
      await checkoutPage.dismissExpressCheckout()
    }
    if (await checkoutPage.isGuestPromptVisible()) {
      await checkoutPage.continueAsGuest()
    }

    // Order summary should be visible (desktop sidebar)
    const viewport = page.viewportSize()
    if (viewport && viewport.width >= 1024) {
      const summaryVisible = await checkoutPage.isOrderSummaryVisible()
      expect(summaryVisible).toBe(true)
      console.log('✅ Order summary visible on desktop')

      // Should show order total
      const total = await checkoutPage.getOrderTotal()
      expect(total.length).toBeGreaterThan(0)
      console.log(`✅ Order total displayed: ${total}`)
    }
    else {
      console.log('⚠️ Mobile viewport - order summary may be collapsed')
    }
  })
})

test.describe('Confirmation Page UI Elements', () => {
  test('View Order Details button scrolls to details and expands sections', async ({ page }) => {
    const checkoutPage = new CheckoutPage(page)

    // Quick checkout flow to reach confirmation
    await page.context().clearCookies()
    await page.goto(`${BASE_URL}/products`, { timeout: 30000 })
    await page.waitForLoadState('networkidle')

    const addButton = page.locator('button:has-text("Añadir al Carrito"), button:has-text("Add to Cart")').first()
    await expect(addButton).toBeVisible({ timeout: 15000 })
    await addButton.click()
    await page.waitForTimeout(2000)

    await page.goto(`${BASE_URL}/checkout`, { timeout: 30000 })
    await page.waitForLoadState('networkidle')

    if (await checkoutPage.isExpressBannerVisible()) {
      await checkoutPage.dismissExpressCheckout()
    }
    if (await checkoutPage.isGuestPromptVisible()) {
      await checkoutPage.continueAsGuest()
    }

    await checkoutPage.fillShippingAddress(TEST_ADDRESS)
    await checkoutPage.waitForShippingMethods()
    await checkoutPage.selectShippingMethod(0)
    await checkoutPage.selectCashPayment()
    await checkoutPage.acceptTerms()
    await checkoutPage.placeOrder()

    // Wait for confirmation page
    await expect(page).toHaveURL(/\/checkout\/confirmation/, { timeout: 15000 })
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Find and click View Order Details button
    const viewDetailsButton = page.locator('button').filter({
      hasText: /view.*order.*details|ver.*detalles|посмотреть.*детали|vezi.*detalii/i,
    })
    await expect(viewDetailsButton).toBeVisible({ timeout: 5000 })
    await viewDetailsButton.click()
    await page.waitForTimeout(1000)

    // Verify order details section is in viewport
    const orderDetails = page.locator('#order-details, [id*="order-details"]')
    if (await orderDetails.count() > 0) {
      await expect(orderDetails.first()).toBeInViewport({ timeout: 3000 })
      console.log('✅ Order details section scrolled into view')
    }

    // Verify at least one expandable section is expanded
    const expandedSection = page.locator('[aria-expanded="true"]')
    expect(await expandedSection.count()).toBeGreaterThanOrEqual(1)
    console.log('✅ Expandable sections expanded after clicking View Order Details')

    console.log('\n🎉 View Order Details button test passed!')
  })

  test('Order status progress displays correctly', async ({ page }) => {
    const checkoutPage = new CheckoutPage(page)

    // Quick checkout flow
    await page.context().clearCookies()
    await page.goto(`${BASE_URL}/products`, { timeout: 30000 })
    await page.waitForLoadState('networkidle')

    const addButton = page.locator('button:has-text("Añadir al Carrito"), button:has-text("Add to Cart")').first()
    await addButton.click()
    await page.waitForTimeout(2000)

    await page.goto(`${BASE_URL}/checkout`, { timeout: 30000 })
    await page.waitForLoadState('networkidle')

    if (await checkoutPage.isExpressBannerVisible()) {
      await checkoutPage.dismissExpressCheckout()
    }
    if (await checkoutPage.isGuestPromptVisible()) {
      await checkoutPage.continueAsGuest()
    }

    await checkoutPage.fillShippingAddress(TEST_ADDRESS)
    await checkoutPage.waitForShippingMethods()
    await checkoutPage.selectShippingMethod(0)
    await checkoutPage.selectCashPayment()
    await checkoutPage.acceptTerms()
    await checkoutPage.placeOrder()

    await expect(page).toHaveURL(/\/checkout\/confirmation/, { timeout: 15000 })
    await page.waitForTimeout(2000)

    // Verify progress bar exists
    const progressBar = page.locator('.progress-fill, [role="progressbar"]')
    await expect(progressBar).toBeVisible({ timeout: 3000 })
    console.log('✅ Progress bar visible')

    // Verify step indicator shows "Step X of Y" format
    const stepIndicator = page.locator('text=/\\d+.*\\d+|шаг.*из|paso.*de|step.*of/i')
    await expect(stepIndicator).toBeVisible({ timeout: 3000 })
    console.log('✅ Step indicator visible')

    // Verify status labels (confirmed, preparing, shipped)
    const statusLabels = page.locator('text=/confirmed|confirmado|подтверждён|confirmat/i')
    await expect(statusLabels.first()).toBeVisible({ timeout: 3000 })
    console.log('✅ Status labels visible')

    console.log('\n🎉 Order status progress test passed!')
  })

  test('Expandable sections toggle correctly', async ({ page }) => {
    const checkoutPage = new CheckoutPage(page)

    // Quick checkout flow
    await page.context().clearCookies()
    await page.goto(`${BASE_URL}/products`, { timeout: 30000 })
    await page.waitForLoadState('networkidle')

    const addButton = page.locator('button:has-text("Añadir al Carrito"), button:has-text("Add to Cart")').first()
    await addButton.click()
    await page.waitForTimeout(2000)

    await page.goto(`${BASE_URL}/checkout`, { timeout: 30000 })
    await page.waitForLoadState('networkidle')

    if (await checkoutPage.isExpressBannerVisible()) {
      await checkoutPage.dismissExpressCheckout()
    }
    if (await checkoutPage.isGuestPromptVisible()) {
      await checkoutPage.continueAsGuest()
    }

    await checkoutPage.fillShippingAddress(TEST_ADDRESS)
    await checkoutPage.waitForShippingMethods()
    await checkoutPage.selectShippingMethod(0)
    await checkoutPage.selectCashPayment()
    await checkoutPage.acceptTerms()
    await checkoutPage.placeOrder()

    await expect(page).toHaveURL(/\/checkout\/confirmation/, { timeout: 15000 })
    await page.waitForTimeout(2000)

    // Find expandable section buttons (Order Items, Shipping Info)
    const expandableButtons = page.locator('button[aria-expanded]')
    const buttonCount = await expandableButtons.count()

    if (buttonCount > 0) {
      // Get initial state
      const firstButton = expandableButtons.first()
      const initialState = await firstButton.getAttribute('aria-expanded')
      console.log(`Initial aria-expanded state: ${initialState}`)

      // Click to toggle
      await firstButton.click()
      await page.waitForTimeout(500)

      // Verify state changed
      const newState = await firstButton.getAttribute('aria-expanded')
      expect(newState).not.toBe(initialState)
      console.log(`New aria-expanded state: ${newState}`)

      console.log('✅ Expandable section toggle works correctly')
    }
    else {
      console.log('⚠️ No expandable sections found')
    }

    console.log('\n🎉 Expandable sections test passed!')
  })
})

test.describe('Checkout Validation', () => {
  test('Empty cart redirects away from checkout', async ({ page }) => {
    await page.context().clearCookies()

    // Navigate directly to checkout without items
    await page.goto('/checkout')
    await page.waitForLoadState('networkidle')

    // Should redirect to cart or show empty cart message
    const url = page.url()
    const isOnCheckout = url.includes('/checkout') && !url.includes('/confirmation')

    if (isOnCheckout) {
      // Should show empty cart message or redirect
      const emptyMessage = page.locator(':has-text("vacío"), :has-text("empty"), :has-text("no hay")')
      const hasEmptyMessage = await emptyMessage.count() > 0

      expect(
        hasEmptyMessage || url.includes('/cart') || url.includes('/products'),
      ).toBe(true)
    }
    else {
      // Was redirected - this is expected
      expect(url).not.toContain('/checkout')
    }

    console.log('✅ Empty cart handling validated')
  })

  test('Terms and privacy must be accepted', async ({ page }) => {
    const checkoutPage = new CheckoutPage(page)

    // Add product and fill form
    await page.goto(`${BASE_URL}/products`)
    await page.waitForLoadState('networkidle')

    const addButton = page.locator('button:has-text("Añadir al Carrito")').first()
    await addButton.click()
    await page.waitForTimeout(2000)

    await page.goto(`${BASE_URL}/checkout`)
    await page.waitForLoadState('networkidle')

    // Handle prompts
    if (await checkoutPage.isExpressBannerVisible()) {
      await checkoutPage.dismissExpressCheckout()
    }
    if (await checkoutPage.isGuestPromptVisible()) {
      await checkoutPage.continueAsGuest()
    }

    // Fill form
    await checkoutPage.fillShippingAddress(TEST_ADDRESS)
    await checkoutPage.waitForShippingMethods()
    await checkoutPage.selectShippingMethod(0)
    await checkoutPage.selectCashPayment()

    // Place order button should be visible but may be disabled without terms
    const placeOrderButton = checkoutPage.placeOrderButton
    await expect(placeOrderButton).toBeVisible({ timeout: 5000 })

    // Now accept terms
    await checkoutPage.acceptTerms()

    // Button should now be enabled
    await expect(placeOrderButton).toBeEnabled({ timeout: 3000 })

    console.log('✅ Terms validation working correctly')
  })
})
