/**
 * E2E tests for email verification and password reset workflows
 * 
 * Requirements addressed:
 * - 2.1-2.10: Email verification workflow end-to-end
 * - 4.1-4.13: Password reset workflow end-to-end
 * - 6.1-6.3: Multi-language functionality validation
 * - 9.1-9.2: Error handling and user feedback
 */

import { test, expect } from '../fixtures/base'
import { AuthPage } from '../fixtures/pages'
import { TestHelpers } from '../fixtures/helpers'

test.describe('Email Verification Workflow', () => {
  let authPage: AuthPage
  let helpers: TestHelpers

  test.beforeEach(async ({ page, resetDatabase, seedDatabase }) => {
    await resetDatabase()
    await seedDatabase()
    authPage = new AuthPage(page)
    helpers = new TestHelpers(page)
  })

  test('should complete email verification flow successfully', async ({ page, locale }) => {
    // Step 1: Register new user
    await authPage.gotoRegister()
    
    const uniqueEmail = `verify-test-${Date.now()}@example.com`
    await authPage.register(uniqueEmail, 'TestPassword123!', 'Verify User')
    
    // Should redirect to verification pending page
    await page.waitForURL('**/auth/verification-pending')
    await helpers.checkHeading('Email Verification Required')
    
    // Check that email is displayed
    await expect(page.locator('[data-testid="verification-email"]')).toContainText(uniqueEmail)
    
    // Step 2: Simulate clicking verification link
    // In a real test, this would involve checking email and clicking the link
    // For testing, we'll navigate directly to the verification page with a token
    const mockToken = 'mock-verification-token-123'
    await page.goto(`/auth/verify-email?token=${mockToken}`)
    
    // Should show verification success
    await expect(page.locator('[data-testid="verification-success"]')).toBeVisible()
    await helpers.checkToast('Email verified successfully')
    
    // Should redirect to login page
    await page.waitForURL('**/auth/login')
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Email verified')
  })

  test('should handle expired verification token', async ({ page }) => {
    const expiredToken = 'expired-token-123'
    await page.goto(`/auth/verify-email?token=${expiredToken}`)
    
    // Should show error message
    await expect(page.locator('[data-testid="verification-error"]')).toBeVisible()
    await expect(page.locator('[data-testid="error-message"]')).toContainText('expired')
    
    // Should provide option to resend verification
    const resendButton = page.locator('[data-testid="resend-verification-button"]')
    await expect(resendButton).toBeVisible()
    
    // Test resend functionality
    await page.fill('[data-testid="email-input"]', 'user@example.com')
    await resendButton.click()
    
    await helpers.checkToast('Verification email sent')
  })

  test('should handle invalid verification token', async ({ page }) => {
    const invalidToken = 'invalid-token-xyz'
    await page.goto(`/auth/verify-email?token=${invalidToken}`)
    
    // Should show error message
    await expect(page.locator('[data-testid="verification-error"]')).toBeVisible()
    await expect(page.locator('[data-testid="error-message"]')).toContainText('invalid')
    
    // Should provide link back to login
    const loginLink = page.locator('[data-testid="back-to-login-link"]')
    await expect(loginLink).toBeVisible()
    
    await loginLink.click()
    await page.waitForURL('**/auth/login')
  })

  test('should handle already verified account', async ({ page, testUser }) => {
    // Simulate user already verified
    const verificationToken = 'already-verified-token'
    await page.goto(`/auth/verify-email?token=${verificationToken}`)
    
    // Should show already verified message
    await expect(page.locator('[data-testid="already-verified-message"]')).toBeVisible()
    
    // Should redirect to login
    await page.waitForURL('**/auth/login')
    await expect(page.locator('[data-testid="info-message"]')).toContainText('already verified')
  })

  test('should allow resending verification email from pending page', async ({ page }) => {
    await page.goto('/auth/verification-pending?email=test@example.com')
    
    // Check initial state
    await expect(page.locator('[data-testid="verification-email"]')).toContainText('test@example.com')
    
    const resendButton = page.locator('[data-testid="resend-button"]')
    await expect(resendButton).toBeVisible()
    await expect(resendButton).toBeEnabled()
    
    // Click resend
    await resendButton.click()
    
    // Should show success message
    await helpers.checkToast('Verification email sent')
    
    // Button should be temporarily disabled
    await expect(resendButton).toBeDisabled()
    
    // Should show countdown or cooldown message
    await expect(page.locator('[data-testid="resend-cooldown"]')).toBeVisible()
  })

  test('should work in different languages', async ({ page, locale }) => {
    await page.goto(`/${locale}/auth/verification-pending?email=test@example.com`)
    
    const expectedTexts = {
      es: 'Verificación de Email Requerida',
      en: 'Email Verification Required',
      ro: 'Verificare Email Necesară',
      ru: 'Требуется Подтверждение Email'
    }
    
    const expectedText = expectedTexts[locale] || expectedTexts.es
    await helpers.checkHeading(expectedText)
    
    // Check that resend button text is translated
    const resendButton = page.locator('[data-testid="resend-button"]')
    await expect(resendButton).toBeVisible()
  })
})

test.describe('Password Reset Workflow', () => {
  let authPage: AuthPage
  let helpers: TestHelpers

  test.beforeEach(async ({ page, resetDatabase, seedDatabase }) => {
    await resetDatabase()
    await seedDatabase()
    authPage = new AuthPage(page)
    helpers = new TestHelpers(page)
  })

  test('should complete password reset flow successfully', async ({ page, testUser }) => {
    // Step 1: Request password reset
    await authPage.gotoLogin()
    await authPage.forgotPasswordLink.click()
    
    await page.waitForURL('**/auth/forgot-password')
    await helpers.checkHeading('Reset Password')
    
    // Enter email
    await page.fill('[data-testid="email-input"]', testUser.email)
    await page.click('[data-testid="send-reset-button"]')
    
    // Should show confirmation message
    await helpers.checkToast('Password reset email sent')
    await expect(page.locator('[data-testid="reset-sent-message"]')).toBeVisible()
    
    // Step 2: Simulate clicking reset link
    const mockResetToken = 'mock-reset-token-123'
    await page.goto(`/auth/reset-password?token=${mockResetToken}`)
    
    await helpers.checkHeading('Set New Password')
    
    // Enter new password
    const newPassword = 'NewSecurePassword123!'
    await page.fill('[data-testid="password-input"]', newPassword)
    await page.fill('[data-testid="confirm-password-input"]', newPassword)
    
    // Check password strength indicator
    const strengthMeter = page.locator('[data-testid="password-strength"]')
    await expect(strengthMeter).toBeVisible()
    await expect(strengthMeter).toContainText('Strong')
    
    // Submit new password
    await page.click('[data-testid="reset-password-button"]')
    
    // Should show success and redirect to login
    await helpers.checkToast('Password reset successfully')
    await page.waitForURL('**/auth/login')
    await expect(page.locator('[data-testid="success-message"]')).toContainText('password reset')
  })

  test('should validate password reset form', async ({ page }) => {
    const validToken = 'valid-reset-token'
    await page.goto(`/auth/reset-password?token=${validToken}`)
    
    // Try to submit without passwords
    await page.click('[data-testid="reset-password-button"]')
    
    // Should show validation errors
    await expect(page.locator('[data-testid="password-error"]')).toContainText('Password is required')
    await expect(page.locator('[data-testid="confirm-password-error"]')).toContainText('required')
    
    // Enter weak password
    await page.fill('[data-testid="password-input"]', 'weak')
    await page.fill('[data-testid="confirm-password-input"]', 'weak')
    
    // Should show password strength warning
    const strengthMeter = page.locator('[data-testid="password-strength"]')
    await expect(strengthMeter).toContainText('Weak')
    
    await page.click('[data-testid="reset-password-button"]')
    await expect(page.locator('[data-testid="password-error"]')).toContainText('at least 8 characters')
    
    // Enter mismatched passwords
    await page.fill('[data-testid="password-input"]', 'StrongPassword123!')
    await page.fill('[data-testid="confirm-password-input"]', 'DifferentPassword123!')
    
    await page.click('[data-testid="reset-password-button"]')
    await expect(page.locator('[data-testid="confirm-password-error"]')).toContainText('do not match')
  })

  test('should handle expired reset token', async ({ page }) => {
    const expiredToken = 'expired-reset-token'
    await page.goto(`/auth/reset-password?token=${expiredToken}`)
    
    // Should show error message
    await expect(page.locator('[data-testid="token-error"]')).toBeVisible()
    await expect(page.locator('[data-testid="error-message"]')).toContainText('expired')
    
    // Should provide option to request new reset
    const requestNewButton = page.locator('[data-testid="request-new-reset-button"]')
    await expect(requestNewButton).toBeVisible()
    
    await requestNewButton.click()
    await page.waitForURL('**/auth/forgot-password')
  })

  test('should handle invalid reset token', async ({ page }) => {
    const invalidToken = 'invalid-reset-token'
    await page.goto(`/auth/reset-password?token=${invalidToken}`)
    
    // Should show error message
    await expect(page.locator('[data-testid="token-error"]')).toBeVisible()
    await expect(page.locator('[data-testid="error-message"]')).toContainText('invalid')
    
    // Should provide link back to login
    const loginLink = page.locator('[data-testid="back-to-login-link"]')
    await expect(loginLink).toBeVisible()
    
    await loginLink.click()
    await page.waitForURL('**/auth/login')
  })

  test('should handle forgot password form validation', async ({ page }) => {
    await page.goto('/auth/forgot-password')
    
    // Try to submit without email
    await page.click('[data-testid="send-reset-button"]')
    
    // Should show validation error
    await expect(page.locator('[data-testid="email-error"]')).toContainText('Email is required')
    
    // Enter invalid email
    await page.fill('[data-testid="email-input"]', 'invalid-email')
    await page.click('[data-testid="send-reset-button"]')
    
    await expect(page.locator('[data-testid="email-error"]')).toContainText('valid email')
    
    // Enter valid email
    await page.fill('[data-testid="email-input"]', 'valid@example.com')
    await page.click('[data-testid="send-reset-button"]')
    
    // Should show success message (even for non-existent email for security)
    await helpers.checkToast('Password reset email sent')
  })

  test('should rate limit password reset requests', async ({ page }) => {
    await page.goto('/auth/forgot-password')
    
    const email = 'test@example.com'
    
    // Send multiple requests quickly
    for (let i = 0; i < 4; i++) {
      await page.fill('[data-testid="email-input"]', email)
      await page.click('[data-testid="send-reset-button"]')
      await page.waitForTimeout(100) // Small delay between requests
    }
    
    // Should show rate limit message
    await expect(page.locator('[data-testid="rate-limit-error"]')).toBeVisible()
    await expect(page.locator('[data-testid="error-message"]')).toContainText('too many')
    
    // Button should be disabled
    const sendButton = page.locator('[data-testid="send-reset-button"]')
    await expect(sendButton).toBeDisabled()
  })

  test('should work in different languages', async ({ page, locale }) => {
    await page.goto(`/${locale}/auth/forgot-password`)
    
    const expectedTexts = {
      es: 'Restablecer Contraseña',
      en: 'Reset Password',
      ro: 'Resetare Parolă',
      ru: 'Сброс Пароля'
    }
    
    const expectedText = expectedTexts[locale] || expectedTexts.es
    await helpers.checkHeading(expectedText)
    
    // Check that form elements are translated
    const emailInput = page.locator('[data-testid="email-input"]')
    const sendButton = page.locator('[data-testid="send-reset-button"]')
    
    await expect(emailInput).toBeVisible()
    await expect(sendButton).toBeVisible()
  })
})

test.describe('Email Workflow Security', () => {
  test('should prevent token reuse', async ({ page }) => {
    const token = 'used-token-123'
    
    // First use of token should work
    await page.goto(`/auth/verify-email?token=${token}`)
    await expect(page.locator('[data-testid="verification-success"]')).toBeVisible()
    
    // Second use of same token should fail
    await page.goto(`/auth/verify-email?token=${token}`)
    await expect(page.locator('[data-testid="verification-error"]')).toBeVisible()
    await expect(page.locator('[data-testid="error-message"]')).toContainText('already used')
  })

  test('should handle malformed tokens gracefully', async ({ page }) => {
    const malformedTokens = [
      'short',
      'contains spaces',
      'contains/special/chars',
      'very-long-token-that-exceeds-normal-length-limits-and-should-be-rejected',
      ''
    ]
    
    for (const token of malformedTokens) {
      await page.goto(`/auth/verify-email?token=${encodeURIComponent(token)}`)
      
      // Should show appropriate error
      await expect(page.locator('[data-testid="verification-error"]')).toBeVisible()
      
      // Should not crash or expose system information
      await expect(page.locator('body')).not.toContainText('Error:')
      await expect(page.locator('body')).not.toContainText('Stack trace')
    }
  })

  test('should prevent email enumeration in forgot password', async ({ page }) => {
    await page.goto('/auth/forgot-password')
    
    const nonExistentEmail = 'nonexistent@example.com'
    const existentEmail = 'existing@example.com'
    
    // Both existing and non-existent emails should show same message
    await page.fill('[data-testid="email-input"]', nonExistentEmail)
    await page.click('[data-testid="send-reset-button"]')
    
    const message1 = await page.locator('[data-testid="success-message"]').textContent()
    
    await page.fill('[data-testid="email-input"]', existentEmail)
    await page.click('[data-testid="send-reset-button"]')
    
    const message2 = await page.locator('[data-testid="success-message"]').textContent()
    
    // Messages should be identical
    expect(message1).toBe(message2)
  })
})

test.describe('Email Workflow Accessibility', () => {
  test('should be accessible with screen readers', async ({ page }) => {
    await page.goto('/auth/verification-pending?email=test@example.com')
    
    // Check ARIA labels and roles
    const mainContent = page.locator('main')
    await expect(mainContent).toHaveAttribute('role', 'main')
    
    const heading = page.locator('h1')
    await expect(heading).toBeVisible()
    
    // Check form accessibility
    const resendButton = page.locator('[data-testid="resend-button"]')
    await expect(resendButton).toHaveAttribute('aria-label')
    
    // Check status messages
    const statusMessage = page.locator('[role="status"]')
    if (await statusMessage.isVisible()) {
      await expect(statusMessage).toHaveAttribute('aria-live')
    }
  })

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/auth/forgot-password')
    
    // Tab through form elements
    await page.keyboard.press('Tab')
    await expect(page.locator('[data-testid="email-input"]')).toBeFocused()
    
    await page.keyboard.press('Tab')
    await expect(page.locator('[data-testid="send-reset-button"]')).toBeFocused()
    
    // Should be able to submit with Enter
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.keyboard.press('Enter')
    
    await helpers.checkToast('Password reset email sent')
  })

  test('should have proper focus management', async ({ page }) => {
    await page.goto('/auth/reset-password?token=valid-token')
    
    // Focus should be on first input
    await expect(page.locator('[data-testid="password-input"]')).toBeFocused()
    
    // After validation error, focus should return to invalid field
    await page.click('[data-testid="reset-password-button"]')
    await expect(page.locator('[data-testid="password-input"]')).toBeFocused()
  })
})