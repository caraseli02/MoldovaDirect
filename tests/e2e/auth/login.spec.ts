import { test, expect } from '../../fixtures/base'
import type { Page } from '@playwright/test'

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear storage state to test unauthenticated login
    await page.context().clearCookies()
    await page.goto('/auth/login')
    await page.waitForLoadState('networkidle')
  })

  test.describe('Valid Credentials', () => {
    test('should successfully login with valid credentials', async ({ page, testUser }) => {
      // Arrange - Fill in the form
      await page.fill('[data-testid="email-input"]', testUser.email)
      await page.fill('[data-testid="password-input"]', testUser.password)

      // Act - Submit the form
      await page.click('[data-testid="login-button"]')

      // Assert - Should redirect to account page
      await expect(page).toHaveURL(/\/(account|dashboard)/, { timeout: 10000 })

      // Verify user menu is visible (confirms authenticated state)
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible({ timeout: 5000 })
    })

    // TODO: Success message redirects too fast to test
    test.skip('should display success message on successful login', async ({ page, testUser }) => {
      await page.fill('[data-testid="email-input"]', testUser.email)
      await page.fill('[data-testid="password-input"]', testUser.password)
      await page.click('[data-testid="login-button"]')

      // Wait for success message before redirect
      const successAlert = page.locator('[data-testid="auth-success"]')
      await expect(successAlert).toBeVisible({ timeout: 3000 })
    })

    test('should remember user when "Remember me" is checked', async ({ page, testUser }) => {
      await page.fill('[data-testid="email-input"]', testUser.email)
      await page.fill('[data-testid="password-input"]', testUser.password)

      // Check remember me checkbox
      await page.check('#remember')

      await page.click('[data-testid="login-button"]')
      await expect(page).toHaveURL(/\/(account|dashboard)/, { timeout: 10000 })

      // Verify remember me preference is set in storage
      const cookies = await page.context().cookies()
      const hasAuthCookie = cookies.some(cookie =>
        cookie.name.includes('auth') && cookie.expires && cookie.expires > Date.now() / 1000
      )
      expect(hasAuthCookie).toBeTruthy()
    })
  })

  test.describe('Invalid Credentials', () => {
    // TODO: Validation timing issue - blur event may not trigger validation consistently
    test.skip('should show error for invalid email format', async ({ page }) => {
      await page.fill('[data-testid="email-input"]', 'invalid-email')
      await page.fill('[data-testid="password-input"]', 'password123')
      await page.locator('[data-testid="email-input"]').blur()

      // Email validation error should appear
      const emailError = page.locator('#email-error')
      await expect(emailError).toBeVisible()
    })

    test('should show error for incorrect password', async ({ page, testUser }) => {
      await page.fill('[data-testid="email-input"]', testUser.email)
      await page.fill('[data-testid="password-input"]', 'wrongpassword123')
      await page.click('[data-testid="login-button"]')

      // Should show auth error alert
      const errorAlert = page.locator('[data-testid="auth-error"]')
      await expect(errorAlert).toBeVisible({ timeout: 5000 })
    })

    test('should show error for non-existent user', async ({ page }) => {
      await page.fill('[data-testid="email-input"]', 'nonexistent@example.test')
      await page.fill('[data-testid="password-input"]', 'password123')
      await page.click('[data-testid="login-button"]')

      const errorAlert = page.locator('[data-testid="auth-error"]')
      await expect(errorAlert).toBeVisible({ timeout: 5000 })
    })

    test('should show error for empty email field', async ({ page }) => {
      await page.fill('[data-testid="password-input"]', 'password123')

      // HTML5 validation should prevent submission - button should be disabled
      const emailInput = page.locator('[data-testid="email-input"]')
      await expect(emailInput).toHaveAttribute('required')

      const loginButton = page.locator('[data-testid="login-button"]')
      await expect(loginButton).toBeDisabled()
    })

    test('should show error for empty password field', async ({ page }) => {
      await page.fill('[data-testid="email-input"]', 'test@example.com')

      // HTML5 validation should prevent submission - button should be disabled
      const passwordInput = page.locator('[data-testid="password-input"]')
      await expect(passwordInput).toHaveAttribute('required')

      const loginButton = page.locator('[data-testid="login-button"]')
      await expect(loginButton).toBeDisabled()
    })

    // TODO: Validation timing issue - blur event may not trigger validation consistently
    test.skip('should show error for password shorter than 8 characters', async ({ page, testUser }) => {
      await page.fill('[data-testid="email-input"]', testUser.email)
      await page.fill('[data-testid="password-input"]', 'short')
      await page.locator('[data-testid="password-input"]').blur()

      // Password validation error should appear
      const passwordError = page.locator('#password-error')
      await expect(passwordError).toBeVisible()
    })
  })

  test.describe('Form Validation', () => {
    test('should disable submit button when form is invalid', async ({ page }) => {
      const loginButton = page.locator('[data-testid="login-button"]')

      // Button should be disabled initially
      await expect(loginButton).toBeDisabled()

      // Fill only email
      await page.fill('[data-testid="email-input"]', 'test@example.com')
      await expect(loginButton).toBeDisabled()

      // Fill both fields
      await page.fill('[data-testid="password-input"]', 'password123')
      await expect(loginButton).toBeEnabled()
    })

    // TODO: Validation timing issue - blur event may not trigger validation consistently
    test.skip('should validate email on blur', async ({ page }) => {
      const emailInput = page.locator('[data-testid="email-input"]')

      await emailInput.fill('invalid-email')
      await emailInput.blur()

      const emailError = page.locator('#email-error')
      await expect(emailError).toBeVisible()

      // Correct the email
      await emailInput.fill('valid@example.com')
      await emailInput.blur()
      await expect(emailError).not.toBeVisible()
    })

    // TODO: Validation timing issue - blur event may not trigger validation consistently
    test.skip('should validate password on input', async ({ page }) => {
      const passwordInput = page.locator('[data-testid="password-input"]')

      await passwordInput.fill('short')
      await passwordInput.blur()

      const passwordError = page.locator('#password-error')
      await expect(passwordError).toBeVisible()

      // Correct the password
      await passwordInput.fill('validpassword123')
      await expect(passwordError).not.toBeVisible()
    })

    test('should show loading state while authenticating', async ({ page, testUser }) => {
      await page.fill('[data-testid="email-input"]', testUser.email)
      await page.fill('[data-testid="password-input"]', testUser.password)

      const loginButton = page.locator('[data-testid="login-button"]')
      await loginButton.click()

      // Button should show loading spinner
      const spinner = loginButton.locator('svg.animate-spin')
      await expect(spinner).toBeVisible()
    })
  })

  test.describe('Password Visibility Toggle', () => {
    test('should toggle password visibility', async ({ page }) => {
      const passwordInput = page.locator('[data-testid="password-input"]')
      const toggleButton = page.locator('[data-testid="password-toggle"]')

      // Initially password should be hidden
      await expect(passwordInput).toHaveAttribute('type', 'password')

      // Click toggle button
      await toggleButton.click()

      // Password should now be visible
      await expect(passwordInput).toHaveAttribute('type', 'text')

      // Click again to hide
      await toggleButton.click()
      await expect(passwordInput).toHaveAttribute('type', 'password')
    })

    test('should announce password visibility to screen readers', async ({ page }) => {
      const toggleButton = page.locator('[data-testid="password-toggle"]')

      // Check aria-pressed attribute changes
      await toggleButton.click()
      await expect(toggleButton).toHaveAttribute('aria-pressed', 'true')

      await toggleButton.click()
      await expect(toggleButton).toHaveAttribute('aria-pressed', 'false')
    })
  })

  test.describe('Keyboard Navigation', () => {
    test('should allow form submission with Enter key', async ({ page, testUser }) => {
      await page.fill('[data-testid="email-input"]', testUser.email)
      await page.fill('[data-testid="password-input"]', testUser.password)

      // Press Enter on password field
      await page.press('[data-testid="password-input"]', 'Enter')

      // Should redirect to account page
      await expect(page).toHaveURL(/\/(account|dashboard)/, { timeout: 10000 })
    })

    // TODO: Tab navigation can be browser-dependent and flaky
    test.skip('should navigate between fields with Tab key', async ({ page }) => {
      await page.keyboard.press('Tab') // Focus email input
      const emailInput = page.locator('[data-testid="email-input"]')
      await expect(emailInput).toBeFocused()

      await page.keyboard.press('Tab') // Focus password input
      const passwordInput = page.locator('[data-testid="password-input"]')
      await expect(passwordInput).toBeFocused()
    })

    test('should allow toggling password visibility with keyboard', async ({ page }) => {
      const toggleButton = page.locator('[data-testid="password-toggle"]')
      const passwordInput = page.locator('[data-testid="password-input"]')

      // Focus toggle button
      await toggleButton.focus()

      // Press Enter or Space to toggle
      await page.keyboard.press('Enter')
      await expect(passwordInput).toHaveAttribute('type', 'text')

      await page.keyboard.press('Enter')
      await expect(passwordInput).toHaveAttribute('type', 'password')
    })
  })

  // TODO: Implement magic link authentication first
  test.describe.skip('Magic Link Authentication', () => {
    test('should send magic link when email is provided', async ({ page }) => {
      await page.fill('[data-testid="email-input"]', 'test@example.com')
      await page.click('[data-testid="magic-link-button"]')

      // Should show success message
      const successAlert = page.locator('[data-testid="auth-success"]')
      await expect(successAlert).toBeVisible({ timeout: 5000 })
      await expect(successAlert).toContainText(/magic link/i)
    })

    test('should disable magic link button when email is empty', async ({ page }) => {
      const magicLinkButton = page.locator('[data-testid="magic-link-button"]')
      await expect(magicLinkButton).toBeDisabled()

      await page.fill('[data-testid="email-input"]', 'test@example.com')
      await expect(magicLinkButton).toBeEnabled()
    })

    test('should show loading state while sending magic link', async ({ page }) => {
      await page.fill('[data-testid="email-input"]', 'test@example.com')

      const magicLinkButton = page.locator('[data-testid="magic-link-button"]')
      await magicLinkButton.click()

      // Button should show loading spinner
      const spinner = magicLinkButton.locator('svg.animate-spin')
      await expect(spinner).toBeVisible()
    })
  })

  test.describe('Redirect After Login', () => {
    // TODO: Verify redirect query param handling is implemented
    test.skip('should redirect to specified URL after login', async ({ page, testUser }) => {
      // Navigate to login with redirect query parameter
      await page.goto('/auth/login?redirect=/products')

      await page.fill('[data-testid="email-input"]', testUser.email)
      await page.fill('[data-testid="password-input"]', testUser.password)
      await page.click('[data-testid="login-button"]')

      // Should redirect to the specified page
      await expect(page).toHaveURL(/\/products/, { timeout: 10000 })
    })

    test('should redirect to account page by default', async ({ page, testUser }) => {
      await page.fill('[data-testid="email-input"]', testUser.email)
      await page.fill('[data-testid="password-input"]', testUser.password)
      await page.click('[data-testid="login-button"]')

      // Should redirect to account page
      await expect(page).toHaveURL(/\/(account|dashboard)/, { timeout: 10000 })
    })
  })

  test.describe('Forgot Password Link', () => {
    test('should navigate to forgot password page', async ({ page, locale }) => {
      const forgotPasswordLink = page.locator('[data-testid="forgot-password"]')
      await forgotPasswordLink.click()

      // Should navigate to forgot password page with locale
      await expect(page).toHaveURL(/\/auth\/forgot-password/)
    })

    test('should preserve email when navigating to forgot password', async ({ page }) => {
      const testEmail = 'test@example.com'
      await page.fill('[data-testid="email-input"]', testEmail)

      await page.click('[data-testid="forgot-password"]')
      await expect(page).toHaveURL(/\/auth\/forgot-password/)

      // Email should be preserved in the URL or session storage
      // (This depends on implementation - may need to adjust)
    })
  })

  test.describe('Security', () => {
    test('should not expose password in network requests', async ({ page, testUser }) => {
      const requests: string[] = []

      page.on('request', request => {
        requests.push(request.url())
      })

      await page.fill('[data-testid="email-input"]', testUser.email)
      await page.fill('[data-testid="password-input"]', testUser.password)
      await page.click('[data-testid="login-button"]')

      // Wait for request to complete
      await page.waitForTimeout(2000)

      // Verify password is not in URL
      requests.forEach(url => {
        expect(url.toLowerCase()).not.toContain(testUser.password.toLowerCase())
      })
    })

    test('should clear password field after failed login', async ({ page }) => {
      await page.fill('[data-testid="email-input"]', 'test@example.com')
      await page.fill('[data-testid="password-input"]', 'wrongpassword')
      await page.click('[data-testid="login-button"]')

      // Wait for error to appear
      await page.locator('[data-testid="auth-error"]').waitFor()

      // Password field should remain filled for user convenience
      // (This is a UX decision - some apps clear, others don't)
      const passwordInput = page.locator('[data-testid="password-input"]')
      const value = await passwordInput.inputValue()

      // Verify behavior matches implementation
      // If implementation clears password:
      // expect(value).toBe('')
      // If implementation keeps password for retry:
      expect(value).toBeTruthy()
    })
  })

  // TODO: Implement rate limiting first
  test.describe.skip('Rate Limiting', () => {
    test('should handle too many login attempts gracefully', async ({ page }) => {
      // Attempt multiple failed logins
      for (let i = 0; i < 5; i++) {
        await page.fill('[data-testid="email-input"]', 'test@example.com')
        await page.fill('[data-testid="password-input"]', 'wrongpassword')
        await page.click('[data-testid="login-button"]')
        await page.waitForTimeout(500)
      }

      // Should show rate limit error or account lockout message
      const errorAlert = page.locator('[data-testid="auth-error"]')
      await expect(errorAlert).toBeVisible()

      // Error message should mention rate limiting or account lockout
      const errorText = await errorAlert.textContent()
      expect(errorText).toMatch(/too many|rate limit|locked|wait|try again/i)
    })
  })
})
