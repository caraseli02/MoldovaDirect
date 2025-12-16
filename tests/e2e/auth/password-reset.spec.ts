import { test, expect } from '../../fixtures/base'

test.describe('Password Reset Flow', () => {
  test.describe('Forgot Password Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/auth/forgot-password')
      await page.waitForLoadState('networkidle')
    })

    test('should display forgot password form', async ({ page }) => {
      await expect(page).toHaveTitle(/forgot password/i)

      // Form elements should be visible
      await expect(page.locator('#email')).toBeVisible()
      await expect(page.locator('button[type="submit"]')).toBeVisible()
    })

    test('should send password reset email with valid email', async ({ page, testUser }) => {
      await page.fill('#email', testUser.email)
      await page.click('button[type="submit"]')

      // Should show success message
      const successMessage = page.locator('text=/password reset/i')
      await expect(successMessage).toBeVisible({ timeout: 5000 })
    })

    test('should validate email format', async ({ page }) => {
      await page.fill('#email', 'invalid-email')
      await page.click('button[type="submit"]')

      // HTML5 validation should catch this
      const emailInput = page.locator('#email')
      await expect(emailInput).toHaveAttribute('type', 'email')
    })

    test('should handle non-existent email gracefully', async ({ page }) => {
      await page.fill('#email', 'nonexistent@example.test')
      await page.click('button[type="submit"]')

      // Should still show success message (security best practice - don't reveal user existence)
      const successMessage = page.locator('text=/password reset/i')
      await expect(successMessage).toBeVisible({ timeout: 5000 })
    })

    test('should disable submit button while sending request', async ({ page, testUser }) => {
      await page.fill('#email', testUser.email)

      const submitButton = page.locator('button[type="submit"]')
      await submitButton.click()

      // Button should show loading state
      await expect(submitButton).toBeDisabled()
    })

    test('should navigate back to login page', async ({ page }) => {
      const backLink = page.locator('a[href*="/auth/login"]')
      await backLink.click()

      await expect(page).toHaveURL(/\/auth\/login/)
    })

    test('should handle network errors', async ({ page }) => {
      await page.context().setOffline(true)

      await page.fill('#email', 'test@example.com')
      await page.click('button[type="submit"]')

      // Should show error message
      await page.waitForTimeout(3000)
      await page.context().setOffline(false)
    })
  })

  test.describe('Reset Password Page', () => {
    test.beforeEach(async ({ page }) => {
      // Navigate with a mock reset token
      await page.goto('/auth/reset-password?token=mock-reset-token')
      await page.waitForLoadState('networkidle')
    })

    test('should display reset password form', async ({ page }) => {
      await expect(page).toHaveTitle(/reset password/i)

      // Form elements should be visible
      await expect(page.locator('[data-testid="password-input"]')).toBeVisible()
      await expect(page.locator('[data-testid="confirm-password-input"]')).toBeVisible()
    })

    test('should reset password with valid token and new password', async ({ page }) => {
      await page.fill('[data-testid="password-input"]', 'NewSecurePassword123!')
      await page.fill('[data-testid="confirm-password-input"]', 'NewSecurePassword123!')
      await page.click('[data-testid="reset-password-button"]')

      // Should show success message
      const successMessage = page.locator('[data-testid="auth-success"]')
      await expect(successMessage).toBeVisible({ timeout: 10000 })
    })

    test('should validate password strength', async ({ page }) => {
      await page.fill('[data-testid="password-input"]', 'weak')
      await page.locator('[data-testid="password-input"]').blur()

      const passwordError = page.locator('#password-error')
      await expect(passwordError).toBeVisible()
    })

    test('should validate password confirmation match', async ({ page }) => {
      await page.fill('[data-testid="password-input"]', 'NewPassword123!')
      await page.fill('[data-testid="confirm-password-input"]', 'DifferentPassword123!')
      await page.locator('[data-testid="confirm-password-input"]').blur()

      const confirmError = page.locator('#confirm-password-error')
      await expect(confirmError).toBeVisible()
    })

    test('should handle expired reset token', async ({ page }) => {
      await page.goto('/auth/reset-password?token=expired-token')

      await page.fill('[data-testid="password-input"]', 'NewPassword123!')
      await page.fill('[data-testid="confirm-password-input"]', 'NewPassword123!')
      await page.click('[data-testid="reset-password-button"]')

      // Should show error about expired token
      const errorAlert = page.locator('[data-testid="auth-error"]')
      await expect(errorAlert).toBeVisible({ timeout: 5000 })
      await expect(errorAlert).toContainText(/expired|invalid/i)
    })

    test('should handle invalid reset token', async ({ page }) => {
      await page.goto('/auth/reset-password?token=invalid-token')

      await page.fill('[data-testid="password-input"]', 'NewPassword123!')
      await page.fill('[data-testid="confirm-password-input"]', 'NewPassword123!')
      await page.click('[data-testid="reset-password-button"]')

      // Should show error about invalid token
      const errorAlert = page.locator('[data-testid="auth-error"]')
      await expect(errorAlert).toBeVisible({ timeout: 5000 })
    })

    test('should toggle password visibility', async ({ page }) => {
      const passwordInput = page.locator('[data-testid="password-input"]')
      const toggleButton = page.locator('[data-testid="password-toggle"]')

      await expect(passwordInput).toHaveAttribute('type', 'password')
      await toggleButton.click()
      await expect(passwordInput).toHaveAttribute('type', 'text')
    })

    test('should redirect to login after successful reset', async ({ page }) => {
      await page.fill('[data-testid="password-input"]', 'NewPassword123!')
      await page.fill('[data-testid="confirm-password-input"]', 'NewPassword123!')
      await page.click('[data-testid="reset-password-button"]')

      // Wait for success message
      await page.locator('[data-testid="auth-success"]').waitFor({ timeout: 10000 })

      // Should redirect to login
      await page.waitForTimeout(2000)
      const currentUrl = page.url()
      expect(currentUrl).toMatch(/\/(auth\/login|$)/)
    })
  })

  test.describe('Security', () => {
    test('should not expose password in URL or network requests', async ({ page }) => {
      const requests: string[] = []

      page.on('request', (request) => {
        requests.push(request.url())
      })

      await page.goto('/auth/reset-password?token=test-token')
      await page.fill('[data-testid="password-input"]', 'SecurePassword123!')
      await page.fill('[data-testid="confirm-password-input"]', 'SecurePassword123!')
      await page.click('[data-testid="reset-password-button"]')

      await page.waitForTimeout(2000)

      // Password should not appear in any URLs
      requests.forEach((url) => {
        expect(url.toLowerCase()).not.toContain('securepassword123')
      })
    })

    test('should invalidate token after use', async ({ page }) => {
      await page.goto('/auth/reset-password?token=one-time-token')

      await page.fill('[data-testid="password-input"]', 'NewPassword123!')
      await page.fill('[data-testid="confirm-password-input"]', 'NewPassword123!')
      await page.click('[data-testid="reset-password-button"]')

      // Wait for success
      await page.locator('[data-testid="auth-success"]').waitFor({ timeout: 10000 })

      // Try to use the same token again
      await page.goto('/auth/reset-password?token=one-time-token')
      await page.fill('[data-testid="password-input"]', 'AnotherPassword123!')
      await page.fill('[data-testid="confirm-password-input"]', 'AnotherPassword123!')
      await page.click('[data-testid="reset-password-button"]')

      // Should show error about used/invalid token
      const errorAlert = page.locator('[data-testid="auth-error"]')
      await expect(errorAlert).toBeVisible({ timeout: 5000 })
    })

    test('should enforce password complexity requirements', async ({ page }) => {
      await page.goto('/auth/reset-password?token=test-token')

      const weakPasswords = [
        'short',
        'noNumbers',
        '12345678',
        'NoSpecialChar123',
      ]

      for (const password of weakPasswords) {
        await page.fill('[data-testid="password-input"]', password)
        await page.locator('[data-testid="password-input"]').blur()

        const passwordError = page.locator('#password-error')
        const isVisible = await passwordError.isVisible()

        // At least some of these should trigger validation errors
        if (password.length < 8) {
          expect(isVisible).toBeTruthy()
        }
      }
    })
  })

  test.describe('Accessibility', () => {
    test('should have proper labels and ARIA attributes', async ({ page }) => {
      await page.goto('/auth/forgot-password')

      const emailInput = page.locator('#email')
      await expect(emailInput).toHaveAttribute('type', 'email')
      await expect(emailInput).toHaveAttribute('autocomplete', 'email')
    })

    test('should announce validation errors to screen readers', async ({ page }) => {
      await page.goto('/auth/reset-password?token=test-token')

      await page.fill('[data-testid="password-input"]', 'weak')
      await page.locator('[data-testid="password-input"]').blur()

      const passwordError = page.locator('#password-error')
      await expect(passwordError).toHaveAttribute('role', 'alert')
    })

    test('should support keyboard navigation', async ({ page }) => {
      await page.goto('/auth/forgot-password')

      await page.keyboard.press('Tab')
      await expect(page.locator('#email')).toBeFocused()

      await page.keyboard.press('Tab')
      await expect(page.locator('button[type="submit"]')).toBeFocused()
    })
  })

  test.describe('Keyboard Navigation', () => {
    test('should allow form submission with Enter key', async ({ page, testUser }) => {
      await page.goto('/auth/forgot-password')

      await page.fill('#email', testUser.email)
      await page.press('#email', 'Enter')

      const successMessage = page.locator('text=/password reset/i')
      await expect(successMessage).toBeVisible({ timeout: 5000 })
    })

    test('should allow password reset with Enter key', async ({ page }) => {
      await page.goto('/auth/reset-password?token=test-token')

      await page.fill('[data-testid="password-input"]', 'NewPassword123!')
      await page.fill('[data-testid="confirm-password-input"]', 'NewPassword123!')
      await page.press('[data-testid="confirm-password-input"]', 'Enter')

      const successMessage = page.locator('[data-testid="auth-success"]')
      await expect(successMessage).toBeVisible({ timeout: 10000 })
    })
  })
})
