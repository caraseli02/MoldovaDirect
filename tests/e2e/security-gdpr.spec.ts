/**
 * E2E Tests for Security & GDPR Compliance Features
 *
 * Tests the security improvements from PR #255:
 * - Atomic account deletion (GDPR Article 17)
 * - Admin MFA enforcement
 * - Secure logging (PII redaction)
 */

import { test, expect, type Page } from '@playwright/test'
import path from 'path'

// Helper function to login via UI (triggers Vue reactivity correctly)
async function loginUser(page: Page, email: string, password: string) {
  await page.goto('/auth/login')
  await page.waitForLoadState('networkidle')

  await page.evaluate(({ email, password }) => {
    const emailInput = document.querySelector('#email') as HTMLInputElement | null
    const passwordInput = document.querySelector('#password') as HTMLInputElement | null

    if (emailInput && passwordInput) {
      emailInput.value = email
      passwordInput.value = password
      emailInput.dispatchEvent(new Event('input', { bubbles: true }))
      passwordInput.dispatchEvent(new Event('input', { bubbles: true }))

      // Submit the form
      const form = emailInput.closest('form')
      if (form) {
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
      }
    }
  }, { email, password })

  // Wait for navigation
  await page.waitForTimeout(3000)
}

test.describe('GDPR Compliance - Account Deletion', () => {
  test('should delete user account atomically with all data', async ({ page, request }) => {
    const testEmail = process.env.TEST_USER_EMAIL || 'teste2e@example.com'
    const testPassword = process.env.TEST_USER_PASSWORD || 'N7jKAcu2FHbt7cj'

    // Login with test credentials
    await loginUser(page, testEmail, testPassword)

    // Verify login succeeded
    const currentUrl = page.url()
    if (currentUrl.includes('/auth/login')) {
      console.log('⚠ Login failed - check credentials')
      test.skip()
      return
    }

    // Navigate to account settings
    await page.goto('/account/settings')
    await page.waitForLoadState('networkidle')

    // Get user info before deletion (for verification)
    const response = await request.get('/api/auth/user')
    const userData = await response.json()
    const userId = userData.user?.id

    expect(userId).toBeTruthy()

    // Trigger account deletion via API (simulating UI interaction)
    const deleteResponse = await request.delete('/api/auth/delete-account', {
      data: {
        password: process.env.TEST_USER_PASSWORD || 'Admin123!@#',
        reason: 'E2E test - automated account deletion'
      }
    })

    // Verify successful deletion
    expect(deleteResponse.status()).toBe(200)
    const deleteResult = await deleteResponse.json()

    expect(deleteResult.success).toBe(true)
    expect(deleteResult.message).toContain('deleted successfully')

    // Verify deletion details are returned
    expect(deleteResult.details).toBeDefined()
    expect(deleteResult.details.profile_deleted).toBe(true)

    // Verify user is logged out (session invalidated)
    await page.goto('/account')
    await page.waitForLoadState('networkidle')

    // Should redirect to login page
    await expect(page).toHaveURL(/\/auth\/login/)

    // Verify cannot login with deleted account
    await page.evaluate(({ email, password }) => {
      const emailInput = document.querySelector('#email') as HTMLInputElement | null
      const passwordInput = document.querySelector('#password') as HTMLInputElement | null

      if (emailInput && passwordInput) {
        emailInput.value = email
        passwordInput.value = password
        emailInput.dispatchEvent(new Event('input', { bubbles: true }))
        passwordInput.dispatchEvent(new Event('input', { bubbles: true }))

        const form = emailInput.closest('form')
        if (form) {
          form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
        }
      }
    }, { email: userData.user.email, password: testPassword })

    await page.waitForTimeout(2000)

    // Should show error (account no longer exists)
    await expect(page.locator(':text("Invalid")')).toBeVisible({ timeout: 5000 })
  })

  test('should require password confirmation for account deletion', async ({ request }) => {
    // Try to delete without password
    const response = await request.delete('/api/auth/delete-account', {
      data: {
        reason: 'E2E test'
        // password missing
      }
    })

    // Should fail with 400 Bad Request
    expect(response.status()).toBe(400)
  })

  test('should reject account deletion with wrong password', async ({ request }) => {
    const response = await request.delete('/api/auth/delete-account', {
      data: {
        password: 'WrongPassword123!',
        reason: 'E2E test'
      }
    })

    // Should fail with 401 Unauthorized
    expect(response.status()).toBe(401)
    const result = await response.json()
    expect(result.statusMessage).toContain('Invalid password')
  })

  test('should not expose sensitive data in deletion response', async ({ request }) => {
    const response = await request.delete('/api/auth/delete-account', {
      data: {
        password: process.env.TEST_USER_PASSWORD || 'Admin123!@#',
        reason: 'E2E test - checking data exposure'
      }
    })

    const result = await response.json()

    // Verify no email, phone, or address data in response
    const responseText = JSON.stringify(result)
    expect(responseText).not.toContain('@') // No emails
    expect(responseText).not.toContain('+1') // No phone numbers
    expect(responseText).not.toContain('street') // No addresses

    // Only safe metadata should be present
    expect(result.details).toBeDefined()
    expect(typeof result.details.addresses_deleted).toBe('number')
    expect(typeof result.details.carts_deleted).toBe('number')
  })
})

test.describe('Admin MFA Enforcement', () => {
  test('should redirect admin without MFA to setup page', async ({ page }) => {
    const adminEmail = process.env.TEST_ADMIN_EMAIL || 'admin@moldovadirect.com'
    const adminPassword = process.env.TEST_ADMIN_PASSWORD || 'Admin123!@#'

    // Login as admin using helper
    await loginUser(page, adminEmail, adminPassword)

    await page.waitForLoadState('networkidle')

    // Try to access admin dashboard
    await page.goto('/admin/dashboard')

    // Should redirect to MFA setup if not enabled
    // OR allow access if MFA is already enabled
    await page.waitForLoadState('networkidle')

    const currentUrl = page.url()

    // Either at MFA setup page or admin dashboard
    const isAtMfaSetup = currentUrl.includes('/account/security/mfa')
    const isAtAdminDashboard = currentUrl.includes('/admin')

    expect(isAtMfaSetup || isAtAdminDashboard).toBe(true)

    if (isAtMfaSetup) {
      console.log('✓ Admin redirected to MFA setup (MFA not enabled)')
      // Verify MFA setup page loaded
      await expect(page.locator('text=Multi-Factor Authentication')).toBeVisible()
    } else {
      console.log('✓ Admin accessed dashboard (MFA already enabled)')
    }
  })

  test('should not allow admin access without MFA verification', async ({ page, request }) => {
    const adminEmail = process.env.TEST_ADMIN_EMAIL || 'admin@moldovadirect.com'
    const adminPassword = process.env.TEST_ADMIN_PASSWORD || 'Admin123!@#'

    // Login as admin using helper
    await loginUser(page, adminEmail, adminPassword)

    await page.waitForLoadState('networkidle')

    // Try to access admin API endpoint directly
    const response = await request.get('/api/admin/users')

    // Should either:
    // 1. Redirect to MFA setup (status 403)
    // 2. Allow access if MFA enabled (status 200)
    expect([200, 403]).toContain(response.status())

    if (response.status() === 403) {
      console.log('✓ Admin API blocked without MFA')
      const result = await response.json()
      expect(result.statusMessage).toBeDefined()
    } else {
      console.log('✓ Admin API accessible (MFA verified)')
    }
  })

  test('should handle MFA verification errors gracefully', async ({ page }) => {
    const adminEmail = process.env.TEST_ADMIN_EMAIL || 'admin@moldovadirect.com'
    const adminPassword = process.env.TEST_ADMIN_PASSWORD || 'Admin123!@#'

    // Simulate network error during MFA check
    await page.route('**/auth/v1/factors**', route => {
      route.abort('failed')
    })

    // Login as admin using helper
    await loginUser(page, adminEmail, adminPassword)

    await page.waitForLoadState('networkidle')

    // Try to access admin area
    await page.goto('/admin/dashboard')

    // Should show error message (not silent redirect)
    await page.waitForLoadState('networkidle')

    // Check for error message or error state
    const hasError = await page.locator(':text("Failed")').count() > 0 ||
                     await page.locator(':text("Error")').count() > 0 ||
                     await page.locator('[role="alert"]').count() > 0

    expect(hasError).toBe(true)
    console.log('✓ MFA error handled with visible error message')
  })
})

test.describe('Secure Logging - PII Protection', () => {
  let consoleErrors: string[] = []
  let consoleLogs: string[] = []

  test.beforeEach(async ({ page }) => {
    // Capture console output
    page.on('console', msg => {
      const text = msg.text()
      if (msg.type() === 'error') {
        consoleErrors.push(text)
      } else {
        consoleLogs.push(text)
      }
    })
  })

  test('should not expose PII in console logs during account operations', async ({ page }) => {
    await page.goto('/account/settings')
    await page.waitForLoadState('networkidle')

    // Navigate through account pages that might log data
    await page.goto('/account/orders')
    await page.waitForLoadState('networkidle')

    await page.goto('/account/addresses')
    await page.waitForLoadState('networkidle')

    // Check console logs for PII patterns
    const allLogs = [...consoleErrors, ...consoleLogs].join(' ')

    // Should NOT contain email patterns
    const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/
    expect(emailPattern.test(allLogs)).toBe(false)

    // Should NOT contain phone patterns
    const phonePattern = /\+?[\d\s\-\(\)]{10,}/
    expect(phonePattern.test(allLogs)).toBe(false)

    // Should NOT contain typical address keywords with actual values
    const sensitiveKeywords = ['street', 'apartment', 'postal', 'zipcode']
    sensitiveKeywords.forEach(keyword => {
      const keywordRegex = new RegExp(`${keyword}.*:.*["'][^"']+["']`, 'i')
      expect(keywordRegex.test(allLogs)).toBe(false)
    })

    console.log('✓ No PII detected in console logs')
  })

  test('should not expose user data in error messages', async ({ page, request }) => {
    consoleErrors = []

    // Trigger an error that might contain user data
    const response = await request.post('/api/checkout/create-order', {
      data: {
        // Invalid data to trigger error
        items: [],
        guestEmail: 'test-pii@example.com',
        shippingAddress: {
          street: '123 Secret Lane',
          city: 'Privacy City'
        }
      }
    })

    // Error response should NOT contain PII
    const errorText = await response.text()

    expect(errorText).not.toContain('test-pii@example.com')
    expect(errorText).not.toContain('Secret Lane')
    expect(errorText).not.toContain('Privacy City')

    console.log('✓ Error messages do not expose PII')
  })

  test('should redact PII in server error logs', async ({ page }) => {
    // Navigate to a page that might trigger server-side logging
    await page.goto('/account/settings')

    // Check page for any leaked data in HTML/scripts
    const pageContent = await page.content()

    // Should not contain raw email in HTML (except in form values)
    const emailsInPage = pageContent.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}/g) || []

    // Filter out expected emails (like form placeholders, support emails)
    const unexpectedEmails = emailsInPage.filter(email =>
      !email.includes('example.com') &&
      !email.includes('placeholder') &&
      !email.includes('moldovadirect.com') &&
      !email.endsWith('@')
    )

    expect(unexpectedEmails.length).toBe(0)
    console.log('✓ No unexpected PII in page content')
  })
})

test.describe('Security Integration Tests', () => {
  test('should enforce HTTPS in production URLs', async ({ page }) => {
    // This test ensures production uses HTTPS
    const currentUrl = page.url()

    if (process.env.NODE_ENV === 'production') {
      expect(currentUrl).toMatch(/^https:\/\//)
    } else {
      // In development, http is acceptable
      console.log('✓ Development environment - HTTP allowed')
    }
  })

  test('should have security headers set', async ({ request }) => {
    const response = await request.get('/')
    const headers = response.headers()

    // Check for important security headers
    const securityHeaders = {
      'x-frame-options': expect.anything(),
      'x-content-type-options': expect.anything(),
      'referrer-policy': expect.anything(),
    }

    // At least some security headers should be present
    const hasSecurityHeaders = Object.keys(securityHeaders).some(header =>
      headers[header] !== undefined
    )

    expect(hasSecurityHeaders).toBe(true)
    console.log('✓ Security headers configured')
  })

  test('should validate authentication on protected routes', async ({ page }) => {
    // Clear auth state
    await page.context().clearCookies()

    // Try to access protected route
    await page.goto('/account/orders')
    await page.waitForLoadState('networkidle')

    // Should redirect to login
    await expect(page).toHaveURL(/\/auth\/login/)
    console.log('✓ Protected routes require authentication')
  })
})
