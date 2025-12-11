/**
 * Critical Test Helpers
 *
 * Shared utilities for critical E2E tests to eliminate code duplication
 * and provide consistent, reliable test operations.
 */

import type { Page } from '@playwright/test'
import { _expect } from '@playwright/test'

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
   * Tries multiple selector variations for logout button
   */
  async logout(): Promise<void> {
    const logoutButton = this.page.locator(
      'button:has-text("Cerrar sesión"), button:has-text("Logout"), a:has-text("Cerrar sesión"), [data-testid="logout-button"]',
    )

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
   * Verifies either the cart badge appears or the button text changes to "En el Carrito"
   * Throws an error if cart update is not detected - this ensures tests fail when cart is broken
   */
  async waitForCartUpdate(): Promise<void> {
    // Wait for client-side hydration to complete
    await this.page.waitForLoadState('networkidle')

    // Try multiple verification methods - fail if none work
    try {
      await Promise.race([
        // Method 1: Wait for button text to change to "En el Carrito"
        this.page.waitForSelector('button:has-text("En el Carrito"), button:has-text("En el carrito")', {
          state: 'visible',
          timeout: 10000,
        }),
        // Method 2: Wait for cart count badge to appear
        this.page.waitForSelector('[data-testid="cart-count"]', {
          state: 'visible',
          timeout: 10000,
        }),
      ])
    }
    catch (_error) {
      // Log the error for debugging but re-throw to fail the test
      console.error('❌ Cart update verification failed - cart functionality may be broken')
      throw new Error('Cart update indicator did not appear within timeout. The cart may be broken or the page failed to hydrate properly.')
    }
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
}
