/**
 * Critical Test Helpers
 *
 * Shared utilities for critical E2E tests to eliminate code duplication
 * and provide consistent, reliable test operations.
 *
 * Updated for Hybrid Progressive Checkout (Option D)
 */

import type { Page } from '@playwright/test'
import { SELECTORS, TIMEOUTS, TEST_DATA } from '../constants'

export class CriticalTestHelpers {
  constructor(private page: Page) {}

  /**
   * Login as test user
   * Uses TEST_USER_EMAIL and TEST_USER_PASSWORD from environment
   */
  async loginAsTestUser(): Promise<void> {
    const testEmail = process.env.TEST_USER_EMAIL || 'teste2e@example.com'
    const testPassword = process.env.TEST_USER_PASSWORD

    if (!testPassword) {
      throw new Error('TEST_USER_PASSWORD environment variable is required for authenticated tests')
    }

    await this.login(testEmail, testPassword)
  }

  /**
   * Login as admin user
   * Uses TEST_ADMIN_EMAIL/TEST_ADMIN_PASSWORD or falls back to TEST_USER credentials
   * Clears existing session before login to avoid conflicts with global setup
   */
  async loginAsAdmin(): Promise<void> {
    const adminEmail = process.env.TEST_ADMIN_EMAIL || process.env.ADMIN_EMAIL || process.env.TEST_USER_EMAIL || 'admin@example.com'
    const adminPassword = process.env.TEST_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || process.env.TEST_USER_PASSWORD

    if (!adminPassword) {
      throw new Error('TEST_ADMIN_PASSWORD or TEST_USER_PASSWORD environment variable is required for admin tests')
    }

    console.log(`  🔐 Admin login: ${adminEmail}`)

    // Simply login as admin - critical project doesn't use storageState
    // so tests start with a clean browser context
    await this.login(adminEmail, adminPassword)
  }

  /**
   * Internal login implementation
   * Uses event-based waiting instead of arbitrary timeouts
   */
  private async login(email: string, password: string): Promise<void> {
    await this.page.goto('/auth/login')

    // Wait for login form to be fully loaded
    await this.page.waitForLoadState('networkidle')

    // Wait for email input to be visible (using ID which is more reliable)
    await this.page.waitForSelector('#email', { state: 'visible', timeout: 10000 })

    // Fill login form using IDs (most reliable for Shadcn inputs)
    const emailInput = this.page.locator('#email')
    const passwordInput = this.page.locator('#password')

    // Clear and fill to ensure v-model updates properly
    await emailInput.click()
    await emailInput.fill(email)

    await passwordInput.click()
    await passwordInput.fill(password)

    // Wait for Vue reactivity to process
    await this.page.waitForTimeout(300)

    // Submit using the login button with data-testid
    const submitButton = this.page.locator('[data-testid="login-button"]')
    await submitButton.click()

    // Wait for navigation with longer timeout
    await this.page.waitForLoadState('networkidle')
    await this.page.waitForTimeout(2000)

    // Debug: log where we ended up
    const finalUrl = this.page.url()
    console.log(`  📍 Login completed - URL: ${finalUrl}`)

    // Check for error message on page
    const errorVisible = await this.page.locator('[data-testid="auth-error"]').isVisible().catch(() => false)
    if (errorVisible) {
      const errorText = await this.page.locator('[data-testid="auth-error"]').textContent()
      console.log(`  ❌ Auth error: ${errorText}`)
    }
  }

  /**
   * Logout current user
   * Navigates to account page and clicks logout button
   */
  async logout(): Promise<void> {
    // First, navigate to account page where the logout button is located
    await this.page.goto('/account')
    await this.page.waitForLoadState('networkidle')

    // Try multiple selector variations for logout button
    const logoutButton = this.page.locator(
      '[data-testid="logout-button"], button:has-text("Cerrar sesión"), button:has-text("Logout")',
    )

    await logoutButton.first().waitFor({ state: 'visible', timeout: 10000 })
    await logoutButton.first().click()

    // Wait for redirect to home or login page (login may include query params)
    await this.page.waitForURL(/\/(|auth\/login)/, { timeout: 10000 })
  }

  /**
   * Add first product to cart
   * Waits for cart to update instead of arbitrary timeout
   */
  async addFirstProductToCart(): Promise<void> {
    await this.page.goto('/products', { waitUntil: 'domcontentloaded' })
    await this.page.waitForLoadState('networkidle')

    // Wait for "Add to Cart" button to be visible
    await this.page.waitForSelector('button:has-text("Añadir al Carrito")', {
      state: 'visible',
      timeout: 10000,
    })

    // Get the first add to cart button
    const addButton = this.page.locator('button:has-text("Añadir al Carrito")').first()

    // Click add to cart
    await addButton.click()

    // Wait for cart to update - button text changes to "En el Carrito" when added
    await this.waitForCartUpdate()
  }

  /**
   * Wait for cart count to update
   * Verifies cart was updated by checking multiple indicators
   * Uses a fallback for test environments where cart state updates are delayed
   */
  async waitForCartUpdate(): Promise<void> {
    // Wait for client-side hydration to complete
    await this.page.waitForLoadState('networkidle')

    // First, wait for the loading state to complete (cartLoading becomes false)
    // This is the most reliable indicator that the addItem operation finished
    try {
      await this.page.waitForFunction(
        () => {
          // Check if any button with loading spinner exists
          const buttons = document.querySelectorAll('button')
          for (const btn of buttons) {
            const svg = btn.querySelector('svg.animate-spin')
            if (svg) return false // Still loading
          }
          return true // All done loading
        },
        { timeout: 15000 },
      )
    }
    catch (e) {
      console.warn('Loading state check timed out, continuing with extended verification...')
    }

    // Extended wait for Vue/Pinia state updates and rendering
    await this.page.waitForTimeout(1000)

    // Try multiple verification methods with better error handling
    let cartUpdated = false
    let verificationMethod = ''

    try {
      // Method 1: Check if button text changed to "En el carrito" / "En el Carrito"
      const buttonCount = await this.page.locator(
        'button:has-text("En el Carrito"), button:has-text("En el carrito")',
      ).count()

      if (buttonCount > 0) {
        cartUpdated = true
        verificationMethod = 'button text changed'
      }
    }
    catch (e) {
      console.debug('Method 1 (button text) check failed:', e)
    }

    if (!cartUpdated) {
      try {
        // Method 2: Check for cart count badge
        const badges = await this.page.locator('[data-testid="cart-count"]')
        const badgeCount = await badges.count()

        if (badgeCount > 0) {
          const text = await badges.first().textContent()
          if (text && parseInt(text) > 0) {
            cartUpdated = true
            verificationMethod = `cart badge updated (count: ${text})`
          }
        }
      }
      catch (e) {
        console.debug('Method 2 (cart badge) check failed:', e)
      }
    }

    if (!cartUpdated) {
      try {
        // Method 3: Check page content for any cart indicator
        const pageContent = await this.page.content()
        if (pageContent.includes('En el carrito') || pageContent.includes('En el Carrito')) {
          cartUpdated = true
          verificationMethod = 'page content check'
        }
      }
      catch (e) {
        console.debug('Method 3 (page content) check failed:', e)
      }
    }

    if (!cartUpdated) {
      // Last resort: check for any visual change by waiting a bit longer
      // and trying the checks again
      console.warn('⏳ Cart update not detected in initial checks, waiting for extended Vue cycle...')
      await this.page.waitForTimeout(2000)

      try {
        const buttonCount = await this.page.locator(
          'button:has-text("En el Carrito"), button:has-text("En el carrito")',
        ).count()
        if (buttonCount > 0) {
          cartUpdated = true
          verificationMethod = 'button text changed (delayed)'
        }
      }
      catch (_e) {
        // Ignore errors in retry
      }
    }

    if (!cartUpdated) {
      // Log detailed debugging info
      console.error('❌ Cart update verification failed')

      try {
        const buttons = await this.page.locator('button').allTextContents()
        console.error('Available buttons (first 15):', buttons.slice(0, 15))

        const badges = await this.page.locator('[data-testid="cart-count"]').count()
        console.error('Cart badges found:', badges)

        // Log any error messages on the page
        const errorElements = await this.page.locator('[data-testid="auth-error"], [role="alert"]').allTextContents()
        if (errorElements.length > 0) {
          console.error('Error messages found on page:', errorElements)
        }

        // Check if cart functionality is even loaded
        const cartCheckout = await this.page.locator('[data-testid="cart-"], a[href*="cart"]').count()
        console.error('Cart-related elements found:', cartCheckout)

        // Log page errors
        const errors = await this.page.evaluate(() => {
          const consoleErrors: any[] = []
          return consoleErrors
        })
        if (errors.length > 0) {
          console.error('Console errors:', errors)
        }
      }
      catch (debugError) {
        console.error('Failed to collect debug info:', debugError)
      }

      throw new Error('Cart update indicator did not appear after extended wait. The cart functionality may not be properly initialized in the test environment.')
    }

    console.log(`✅ Cart updated (verified via: ${verificationMethod})`)
  }

  /**
   * Verify cart has items
   * Returns true if cart shows any items (via badge or button state), false otherwise
   */
  async verifyCartHasItems(): Promise<boolean> {
    // Method 1: Check if cart badge shows a count (data-testid) - use first() for multiple badges
    const cartBadge = this.page.locator('[data-testid="cart-count"]').first()
    if (await cartBadge.count() > 0) {
      const text = await cartBadge.textContent()
      if (text && parseInt(text) > 0) {
        return true
      }
    }

    // Method 2: Look for "En el Carrito" text anywhere on the page
    const pageContent = await this.page.content()
    if (pageContent.includes('En el Carrito') || pageContent.includes('En el carrito')) {
      return true
    }

    return false
  }

  /**
   * Navigate to cart page by clicking cart icon
   * This preserves client-side state better than page.goto()
   */
  async goToCart(): Promise<void> {
    // Click the cart link in the header to navigate (preserves client state)
    const cartLink = this.page.locator('a[href*="/cart"]').first()
    await cartLink.click()

    // Wait for navigation to complete
    await this.page.waitForURL(/\/cart/, { timeout: 10000 })
    await this.page.waitForLoadState('networkidle')

    // Wait for cart items to render (if any)
    await this.page.waitForTimeout(500)
  }

  /**
   * Navigate to checkout page
   */
  async goToCheckout(): Promise<void> {
    await this.page.goto('/checkout')
    await this.page.waitForURL(/\/checkout/, { timeout: 5000 })
  }

  /**
   * Check if user credentials are available
   * Useful for skipping tests that require authentication
   */
  static hasTestUserCredentials(): boolean {
    return !!process.env.TEST_USER_PASSWORD
  }

  /**
   * Check if admin credentials are available
   */
  static hasAdminCredentials(): boolean {
    return !!(process.env.TEST_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || process.env.TEST_USER_PASSWORD)
  }

  /**
   * Get test user credentials
   */
  static getTestUserCredentials() {
    return {
      email: process.env.TEST_USER_EMAIL || 'teste2e@example.com',
      password: process.env.TEST_USER_PASSWORD,
    }
  }

  /**
   * Get admin credentials
   */
  static getAdminCredentials() {
    return {
      email: process.env.TEST_ADMIN_EMAIL || process.env.ADMIN_EMAIL || process.env.TEST_USER_EMAIL || 'admin@example.com',
      password: process.env.TEST_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || process.env.TEST_USER_PASSWORD,
    }
  }

  // ===========================================
  // Checkout Helpers (Hybrid Progressive)
  // ===========================================

  /**
   * Handle express checkout banner or guest prompt
   * Dismisses banners to show full checkout form
   */
  async handleCheckoutPrompts(): Promise<void> {
    // Handle express checkout banner if visible
    const expressBanner = this.page.locator(SELECTORS.EXPRESS_BANNER)
    if (await expressBanner.isVisible({ timeout: TIMEOUTS.SHORT }).catch(() => false)) {
      await this.page.locator(SELECTORS.EXPRESS_EDIT).click()
      await this.page.waitForTimeout(TIMEOUTS.VERY_SHORT)
    }

    // Handle guest prompt if visible
    const guestPrompt = this.page.locator(SELECTORS.GUEST_PROMPT)
    if (await guestPrompt.isVisible({ timeout: TIMEOUTS.SHORT }).catch(() => false)) {
      await this.page.locator(SELECTORS.CONTINUE_AS_GUEST).click()
      await this.page.waitForTimeout(TIMEOUTS.VERY_SHORT)
    }
  }

  /**
   * Fill shipping address form with test data
   * Uses fullName field which is internally split into firstName/lastName
   */
  async fillShippingAddress(address?: typeof TEST_DATA.TEST_ADDRESS): Promise<void> {
    const addr = address || TEST_DATA.TEST_ADDRESS

    const fullName = this.page.locator(SELECTORS.ADDRESS_FULL_NAME).first()
    if (await fullName.isVisible({ timeout: TIMEOUTS.STANDARD }).catch(() => false)) {
      await fullName.fill(addr.fullName)
      await this.page.locator(SELECTORS.ADDRESS_STREET).first().fill(addr.street)
      await this.page.locator(SELECTORS.ADDRESS_CITY).first().fill(addr.city)
      await this.page.locator(SELECTORS.ADDRESS_POSTAL_CODE).first().fill(addr.postalCode)

      // Select country if available
      const country = this.page.locator(SELECTORS.ADDRESS_COUNTRY).first()
      if (await country.isVisible({ timeout: TIMEOUTS.SHORT }).catch(() => false)) {
        await country.selectOption(addr.country)
      }

      // Fill phone if available
      const phone = this.page.locator(SELECTORS.ADDRESS_PHONE).first()
      if (await phone.isVisible({ timeout: TIMEOUTS.SHORT }).catch(() => false)) {
        await phone.fill(addr.phone)
      }

      // Trigger blur to validate
      await this.page.locator(SELECTORS.ADDRESS_POSTAL_CODE).first().blur()
      await this.page.waitForTimeout(TIMEOUTS.VERY_SHORT)
    }
  }

  /**
   * Wait for shipping methods to load and select first option
   */
  async selectShippingMethod(index: number = 0): Promise<void> {
    // Wait for loading to finish
    const loadingSpinner = this.page.locator(SELECTORS.SHIPPING_METHOD_LOADING)
    await loadingSpinner.waitFor({ state: 'hidden', timeout: TIMEOUTS.LONG }).catch(() => {})

    // Wait for shipping options
    const shippingOptions = this.page.locator(SELECTORS.SHIPPING_METHOD_OPTIONS)
    await shippingOptions.first().waitFor({ state: 'visible', timeout: TIMEOUTS.LONG }).catch(() => {})

    // Select option
    const option = shippingOptions.nth(index)
    if (await option.isVisible({ timeout: TIMEOUTS.SHORT }).catch(() => false)) {
      await option.click()
      await this.page.waitForTimeout(TIMEOUTS.VERY_SHORT)
    }
  }

  /**
   * Select cash payment method
   */
  async selectCashPayment(): Promise<void> {
    const cashOption = this.page.locator(SELECTORS.PAYMENT_CASH)
    if (await cashOption.isVisible({ timeout: TIMEOUTS.STANDARD }).catch(() => false)) {
      await cashOption.click()
      await this.page.waitForTimeout(TIMEOUTS.VERY_SHORT)
    }
  }

  /**
   * Accept terms and privacy checkboxes
   */
  async acceptTerms(): Promise<void> {
    const termsCheckbox = this.page.locator(SELECTORS.TERMS_CHECKBOX)
    const privacyCheckbox = this.page.locator(SELECTORS.PRIVACY_CHECKBOX)

    if (await termsCheckbox.isVisible({ timeout: TIMEOUTS.STANDARD }).catch(() => false)) {
      await termsCheckbox.check()
    }

    if (await privacyCheckbox.isVisible({ timeout: TIMEOUTS.SHORT }).catch(() => false)) {
      await privacyCheckbox.check()
    }
  }

  /**
   * Complete full checkout form (without placing order)
   * Fills address, selects shipping, selects payment, accepts terms
   */
  async fillCheckoutForm(): Promise<void> {
    await this.handleCheckoutPrompts()
    await this.fillShippingAddress()
    await this.selectShippingMethod()
    await this.selectCashPayment()
    await this.acceptTerms()
  }

  /**
   * Check if express checkout banner is visible
   */
  async isExpressBannerVisible(): Promise<boolean> {
    const expressBanner = this.page.locator(SELECTORS.EXPRESS_BANNER)
    return await expressBanner.isVisible({ timeout: TIMEOUTS.SHORT }).catch(() => false)
  }

  /**
   * Use express checkout to place order
   */
  async useExpressCheckout(): Promise<void> {
    const expressButton = this.page.locator(SELECTORS.EXPRESS_PLACE_ORDER)
    await expressButton.click()
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Click place order button
   */
  async placeOrder(): Promise<void> {
    const placeOrderButton = this.page.locator(SELECTORS.PLACE_ORDER_BUTTON).first()
    await placeOrderButton.click()
    await this.page.waitForLoadState('networkidle')
  }
}
