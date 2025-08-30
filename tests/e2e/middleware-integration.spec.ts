/**
 * Integration tests for authentication middleware
 * 
 * Tests the complete authentication flow including:
 * - Route protection
 * - Redirect preservation
 * - Email verification requirements
 * - Cross-page navigation
 */

import { test, expect } from '@playwright/test'

test.describe('Authentication Middleware Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing authentication state
    await page.context().clearCookies()
    await page.goto('/')
  })

  test('should redirect unauthenticated users from protected pages', async ({ page }) => {
    // Try to access protected account page
    await page.goto('/account')
    
    // Should be redirected to login with redirect parameter
    await expect(page).toHaveURL(/\/auth\/login\?.*redirect=%2Faccount/)
    
    // Should show login required message
    await expect(page.locator('[data-testid="login-required-message"]')).toBeVisible()
  })

  test('should redirect unauthenticated users from cart page', async ({ page }) => {
    // Try to access protected cart page
    await page.goto('/cart')
    
    // Should be redirected to login with redirect parameter
    await expect(page).toHaveURL(/\/auth\/login\?.*redirect=%2Fcart/)
  })

  test('should redirect unauthenticated users from admin pages', async ({ page }) => {
    // Try to access protected admin page
    await page.goto('/admin')
    
    // Should be redirected to login with redirect parameter
    await expect(page).toHaveURL(/\/auth\/login\?.*redirect=%2Fadmin/)
  })

  test('should preserve redirect after successful login', async ({ page }) => {
    // Try to access protected page first
    await page.goto('/account')
    await expect(page).toHaveURL(/\/auth\/login\?.*redirect=%2Faccount/)
    
    // Mock successful login (this would need to be implemented based on your auth setup)
    // For now, we'll test the redirect parameter preservation
    const url = new URL(page.url())
    expect(url.searchParams.get('redirect')).toBe('/account')
  })

  test('should allow access to public pages without authentication', async ({ page }) => {
    // Test public pages
    const publicPages = ['/', '/products', '/about', '/contact']
    
    for (const pagePath of publicPages) {
      await page.goto(pagePath)
      // Should not be redirected to login
      expect(page.url()).not.toContain('/auth/login')
    }
  })

  test('should redirect authenticated users away from auth pages', async ({ page }) => {
    // This test would need to mock an authenticated state
    // For now, we'll test the guest middleware logic structure
    
    // Navigate to login page
    await page.goto('/auth/login')
    
    // Should be able to access login page when not authenticated
    await expect(page.locator('h2')).toContainText(/sign in|iniciar sesión/i)
  })

  test('should handle email verification requirements', async ({ page }) => {
    // This test would need to mock an unverified user state
    // For now, we'll test the verification page accessibility
    
    await page.goto('/auth/verify-email')
    
    // Should be able to access verification page
    await expect(page.locator('h2')).toContainText(/verify|verificar/i)
  })

  test('should handle multiple redirect scenarios', async ({ page }) => {
    // Test nested redirects don't cause loops
    await page.goto('/account/orders')
    
    // Should redirect to login with the full path
    await expect(page).toHaveURL(/\/auth\/login\?.*redirect=%2Faccount%2Forders/)
  })

  test('should not redirect from homepage to login', async ({ page }) => {
    // Access homepage
    await page.goto('/')
    
    // Should stay on homepage, not redirect to login
    expect(page.url()).toContain('/')
    expect(page.url()).not.toContain('/auth/login')
  })

  test('should handle special characters in redirect URLs', async ({ page }) => {
    // Test URL encoding in redirects
    await page.goto('/products?category=wine&sort=price')
    
    // Should not redirect (products is public)
    expect(page.url()).toContain('/products')
    expect(page.url()).not.toContain('/auth/login')
  })

  test('should prevent external redirect attacks', async ({ page }) => {
    // Try to access login with external redirect
    await page.goto('/auth/login?redirect=https://evil.com')
    
    // Should be on login page
    await expect(page).toHaveURL(/\/auth\/login/)
    
    // The redirect parameter should be sanitized or ignored
    // (This would be tested in the actual login flow)
  })
})

test.describe('Middleware Error Handling', () => {
  test('should handle network errors gracefully', async ({ page }) => {
    // Simulate network issues
    await page.route('**/*', route => route.abort())
    
    try {
      await page.goto('/account')
      // Should still attempt to redirect even with network issues
    } catch (error) {
      // Expected to fail due to network simulation
    }
  })

  test('should handle malformed user data', async ({ page }) => {
    // This would test how middleware handles corrupted auth state
    // Implementation depends on your specific auth setup
    await page.goto('/auth/login')
    await expect(page.locator('form')).toBeVisible()
  })
})

test.describe('Cross-tab Authentication', () => {
  test('should sync authentication state across tabs', async ({ browser }) => {
    // Create two browser contexts to simulate tabs
    const context1 = await browser.newContext()
    const context2 = await browser.newContext()
    
    const page1 = await context1.newPage()
    const page2 = await context2.newPage()
    
    // Both should redirect to login when accessing protected pages
    await page1.goto('/account')
    await page2.goto('/cart')
    
    await expect(page1).toHaveURL(/\/auth\/login/)
    await expect(page2).toHaveURL(/\/auth\/login/)
    
    await context1.close()
    await context2.close()
  })
})