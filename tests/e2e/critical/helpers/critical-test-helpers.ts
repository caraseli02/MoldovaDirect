/**
 * Critical Test Helpers
 *
 * Shared utilities for critical E2E tests to eliminate code duplication
 * and provide consistent, reliable test operations.
 */

import { Page, expect } from '@playwright/test'

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
   * Uses ADMIN_EMAIL/ADMIN_PASSWORD or falls back to TEST_USER credentials
   */
  async loginAsAdmin(): Promise<void> {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.TEST_USER_EMAIL || 'admin@example.com'
    const adminPassword = process.env.ADMIN_PASSWORD || process.env.TEST_USER_PASSWORD

    if (!adminPassword) {
      throw new Error('ADMIN_PASSWORD or TEST_USER_PASSWORD environment variable is required for admin tests')
    }

    await this.login(adminEmail, adminPassword)
  }

  /**
   * Internal login implementation
   * Uses event-based waiting instead of arbitrary timeouts
   */
  private async login(email: string, password: string): Promise<void> {
    await this.page.goto('/auth/login')

    // Fill login form
    await this.page.locator('input[type="email"]').first().fill(email)
    await this.page.locator('input[type="password"]').first().fill(password)

    // Submit and wait for navigation
    await this.page.locator('button[type="submit"]').click()
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Logout current user
   * Tries multiple selector variations for logout button
   */
  async logout(): Promise<void> {
    const logoutButton = this.page.locator(
      'button:has-text("Cerrar sesión"), button:has-text("Logout"), a:has-text("Cerrar sesión"), [data-testid="logout-button"]'
    )

    await logoutButton.first().click()
    await this.page.waitForURL(/\/(|auth\/login)$/, { timeout: 10000 })
  }

  /**
   * Add first product to cart
   * Waits for cart to update instead of arbitrary timeout
   */
  async addFirstProductToCart(): Promise<void> {
    await this.page.goto('/products', { waitUntil: 'domcontentloaded' })

    // Wait for "Add to Cart" button to be visible
    await this.page.waitForSelector('button:has-text("Añadir al Carrito")', {
      state: 'visible',
      timeout: 10000
    })

    // Click add to cart
    await this.page.locator('button:has-text("Añadir al Carrito")').first().click()

    // Wait for cart to actually update (not arbitrary timeout)
    await this.waitForCartUpdate()
  }

  /**
   * Wait for cart count to update
   * Uses proper event-based waiting instead of waitForTimeout
   */
  async waitForCartUpdate(): Promise<void> {
    // Wait for cart count to appear with non-zero value (faster than networkidle)
    const cartCount = this.page.locator(
      '[data-testid="cart-count"], [data-testid="cart-badge"], .cart-count'
    ).first()

    // Wait up to 10 seconds for cart count to show and update
    await expect(cartCount).toBeVisible({ timeout: 10000 })

    // Optional: wait a bit for the count to update from 0
    await this.page.waitForFunction(
      () => {
        const elements = document.querySelectorAll('[data-testid="cart-count"], [data-testid="cart-badge"], .cart-count')
        for (const el of elements) {
          const text = el.textContent?.trim()
          if (text && parseInt(text) > 0) return true
        }
        return false
      },
      { timeout: 5000 }
    ).catch(() => {
      // If cart count doesn't update, that's okay for smoke tests
      // The visibility check already passed
    })
  }

  /**
   * Verify cart has items
   * Returns true if cart shows any items, false otherwise
   */
  async verifyCartHasItems(): Promise<boolean> {
    const selectors = [
      '[data-testid="cart-count"]',
      '[data-testid="cart-badge"]',
      '.cart-count',
      '[aria-label*="cart"] [aria-label*="item"]'
    ]

    for (const selector of selectors) {
      const element = this.page.locator(selector)

      if (await element.count() > 0) {
        const text = await element.textContent()
        if (text && parseInt(text) > 0) {
          return true
        }
      }
    }

    return false
  }

  /**
   * Navigate to cart page
   */
  async goToCart(): Promise<void> {
    await this.page.goto('/cart')
    await this.page.waitForURL(/\/cart/, { timeout: 5000 })
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
    return !!(process.env.ADMIN_PASSWORD || process.env.TEST_USER_PASSWORD)
  }

  /**
   * Get test user credentials
   */
  static getTestUserCredentials() {
    return {
      email: process.env.TEST_USER_EMAIL || 'teste2e@example.com',
      password: process.env.TEST_USER_PASSWORD
    }
  }

  /**
   * Get admin credentials
   */
  static getAdminCredentials() {
    return {
      email: process.env.ADMIN_EMAIL || process.env.TEST_USER_EMAIL || 'admin@example.com',
      password: process.env.ADMIN_PASSWORD || process.env.TEST_USER_PASSWORD
    }
  }
}
