import { test, expect } from '../../fixtures/base'

// Use unauthenticated context for auth page testing
test.use({ storageState: { cookies: [], origins: [] } })

test.describe('Registration Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/register')
    await page.waitForLoadState('networkidle')
  })

  test.describe('Valid Registration', () => {
    test('should successfully register with valid data', async ({ page }) => {
      const timestamp = Date.now()
      const testEmail = `newuser-${timestamp}@example.test`

      // Fill registration form
      await page.fill('[data-testid="name-input"]', 'Test User')
      await page.fill('[data-testid="email-input"]', testEmail)
      await page.fill('[data-testid="password-input"]', 'SecurePassword123!')
      await page.fill('[data-testid="confirm-password-input"]', 'SecurePassword123!')

      // Accept terms and conditions
      await page.check('#terms')

      // Submit form
      await page.click('[data-testid="register-button"]')

      // Should show success message
      const successAlert = page.locator('[data-testid="auth-success"]')
      await expect(successAlert).toBeVisible({ timeout: 10000 })
    })

    test('should accept optional phone number', async ({ page }) => {
      const timestamp = Date.now()

      await page.fill('[data-testid="name-input"]', 'Test User')
      await page.fill('[data-testid="email-input"]', `user-${timestamp}@example.test`)
      await page.fill('[data-testid="phone-input"]', '+37369123456')
      await page.fill('[data-testid="password-input"]', 'SecurePassword123!')
      await page.fill('[data-testid="confirm-password-input"]', 'SecurePassword123!')
      await page.check('#terms')

      await page.click('[data-testid="register-button"]')

      const successAlert = page.locator('[data-testid="auth-success"]')
      await expect(successAlert).toBeVisible({ timeout: 10000 })
    })
  })

  test.describe('Form Validation', () => {
    test.describe('Name Validation', () => {
      test('should show error for name shorter than 2 characters', async ({ page }) => {
        await page.fill('[data-testid="name-input"]', 'A')
        await page.locator('[data-testid="name-input"]').blur()

        const nameError = page.locator('#name-error')
        await expect(nameError).toBeVisible()
      })

      test('should show error for invalid name characters', async ({ page }) => {
        await page.fill('[data-testid="name-input"]', 'Test123')
        await page.locator('[data-testid="name-input"]').blur()

        const nameError = page.locator('#name-error')
        await expect(nameError).toBeVisible()
      })

      test('should accept names with spaces and hyphens', async ({ page }) => {
        await page.fill('[data-testid="name-input"]', 'John-Paul Smith')
        await page.locator('[data-testid="name-input"]').blur()

        const nameError = page.locator('#name-error')
        await expect(nameError).not.toBeVisible()
      })

      test('should accept names with accented characters', async ({ page }) => {
        await page.fill('[data-testid="name-input"]', 'José María García')
        await page.locator('[data-testid="name-input"]').blur()

        const nameError = page.locator('#name-error')
        await expect(nameError).not.toBeVisible()
      })
    })

    test.describe('Email Validation', () => {
      test('should show error for invalid email format', async ({ page }) => {
        await page.fill('[data-testid="email-input"]', 'invalid-email')
        await page.locator('[data-testid="email-input"]').blur()

        const emailError = page.locator('#email-error')
        await expect(emailError).toBeVisible()
      })

      test('should show error for email without domain', async ({ page }) => {
        await page.fill('[data-testid="email-input"]', 'test@')
        await page.locator('[data-testid="email-input"]').blur()

        const emailError = page.locator('#email-error')
        await expect(emailError).toBeVisible()
      })

      test('should accept valid email formats', async ({ page }) => {
        const validEmails = [
          'test@example.com',
          'user+tag@example.co.uk',
          'name.surname@example.org',
        ]

        for (const email of validEmails) {
          await page.fill('[data-testid="email-input"]', email)
          await page.locator('[data-testid="email-input"]').blur()

          const emailError = page.locator('#email-error')
          await expect(emailError).not.toBeVisible()
        }
      })
    })

    test.describe('Phone Validation', () => {
      test('should show error for invalid phone format', async ({ page }) => {
        await page.fill('[data-testid="phone-input"]', 'abc123')
        await page.locator('[data-testid="phone-input"]').blur()

        const phoneError = page.locator('#phone-error')
        await expect(phoneError).toBeVisible()
      })

      test('should accept international phone formats', async ({ page }) => {
        const validPhones = [
          '+37369123456',
          '+1234567890',
          '0691234567',
        ]

        for (const phone of validPhones) {
          await page.fill('[data-testid="phone-input"]', phone)
          await page.locator('[data-testid="phone-input"]').blur()

          const phoneError = page.locator('#phone-error')
          await expect(phoneError).not.toBeVisible()
        }
      })
    })

    test.describe('Password Validation', () => {
      test('should show error for password shorter than 8 characters', async ({ page }) => {
        await page.fill('[data-testid="password-input"]', 'Short1!')
        await page.locator('[data-testid="password-input"]').blur()

        const passwordError = page.locator('#password-error')
        await expect(passwordError).toBeVisible()
      })

      test('should display password strength meter', async ({ page }) => {
        await page.fill('[data-testid="password-input"]', 'WeakPassword')

        // Password strength meter component should be visible
        const strengthMeter = page.locator('[data-testid="password-strength-meter"]')
        await expect(strengthMeter).toBeVisible()
      })

      test('should update password strength in real-time', async ({ page }) => {
        const passwordInput = page.locator('[data-testid="password-input"]')

        // Weak password
        await passwordInput.fill('weak')
        await page.waitForTimeout(300)

        // Strong password
        await passwordInput.fill('StrongPassword123!')
        await page.waitForTimeout(300)

        // Strength meter should reflect the change
        const strengthMeter = page.locator('[data-testid="password-strength-meter"]')
        await expect(strengthMeter).toBeVisible()
      })

      test('should show password requirements', async ({ page }) => {
        await page.focus('[data-testid="password-input"]')

        // Password requirements should be visible
        // This depends on implementation - may be in a tooltip or below the field
        const requirements = page.locator('#password-requirements')
        await expect(requirements).toBeAttached()
      })
    })

    test.describe('Password Confirmation', () => {
      test('should show error when passwords do not match', async ({ page }) => {
        await page.fill('[data-testid="password-input"]', 'Password123!')
        await page.fill('[data-testid="confirm-password-input"]', 'DifferentPassword123!')
        await page.locator('[data-testid="confirm-password-input"]').blur()

        const confirmError = page.locator('#confirm-password-error')
        await expect(confirmError).toBeVisible()
        await expect(confirmError).toContainText(/mismatch|match/i)
      })

      test('should show success indicator when passwords match', async ({ page }) => {
        await page.fill('[data-testid="password-input"]', 'Password123!')
        await page.fill('[data-testid="confirm-password-input"]', 'Password123!')

        // Should show checkmark or success message
        const matchIndicator = page.locator('text=/Passwords match/i')
        await expect(matchIndicator).toBeVisible()
      })

      test('should validate confirmation when password is changed', async ({ page }) => {
        await page.fill('[data-testid="password-input"]', 'Password123!')
        await page.fill('[data-testid="confirm-password-input"]', 'Password123!')

        // Change password
        await page.fill('[data-testid="password-input"]', 'NewPassword123!')
        await page.locator('[data-testid="password-input"]').blur()

        // Confirmation error should appear
        const confirmError = page.locator('#confirm-password-error')
        await expect(confirmError).toBeVisible()
      })
    })

    test.describe('Terms and Conditions', () => {
      test('should require terms acceptance', async ({ page }) => {
        const timestamp = Date.now()

        await page.fill('[data-testid="name-input"]', 'Test User')
        await page.fill('[data-testid="email-input"]', `user-${timestamp}@example.test`)
        await page.fill('[data-testid="password-input"]', 'Password123!')
        await page.fill('[data-testid="confirm-password-input"]', 'Password123!')

        // Do not check terms
        const registerButton = page.locator('[data-testid="register-button"]')
        await expect(registerButton).toBeDisabled()
      })

      test('should enable submit button when all fields are valid and terms are accepted', async ({ page }) => {
        const timestamp = Date.now()

        await page.fill('[data-testid="name-input"]', 'Test User')
        await page.fill('[data-testid="email-input"]', `user-${timestamp}@example.test`)
        await page.fill('[data-testid="password-input"]', 'Password123!')
        await page.fill('[data-testid="confirm-password-input"]', 'Password123!')

        const registerButton = page.locator('[data-testid="register-button"]')
        await expect(registerButton).toBeDisabled()

        // Accept terms
        await page.check('#terms')
        await expect(registerButton).toBeEnabled()
      })

      test('should open terms page in new tab', async ({ page, context }) => {
        const termsLink = page.locator('a[href*="/terms"]')

        // Click terms link
        const [newPage] = await Promise.all([
          context.waitForEvent('page'),
          termsLink.click(),
        ])

        await expect(newPage).toHaveURL(/\/terms/)
        await newPage.close()
      })

      test('should open privacy policy in new tab', async ({ page, context }) => {
        const privacyLink = page.locator('a[href*="/privacy"]')

        const [newPage] = await Promise.all([
          context.waitForEvent('page'),
          privacyLink.click(),
        ])

        await expect(newPage).toHaveURL(/\/privacy/)
        await newPage.close()
      })
    })
  })

  test.describe('Password Visibility Toggle', () => {
    test('should toggle password visibility', async ({ page }) => {
      const passwordInput = page.locator('[data-testid="password-input"]')
      const toggleButton = page.locator('[data-testid="password-toggle"]')

      await expect(passwordInput).toHaveAttribute('type', 'password')
      await toggleButton.click()
      await expect(passwordInput).toHaveAttribute('type', 'text')
      await toggleButton.click()
      await expect(passwordInput).toHaveAttribute('type', 'password')
    })

    test('should toggle confirm password visibility independently', async ({ page }) => {
      const confirmPasswordInput = page.locator('[data-testid="confirm-password-input"]')
      const toggleButton = page.locator('[data-testid="confirm-password-toggle"]')

      await expect(confirmPasswordInput).toHaveAttribute('type', 'password')
      await toggleButton.click()
      await expect(confirmPasswordInput).toHaveAttribute('type', 'text')
    })
  })

  test.describe('Keyboard Navigation', () => {
    test('should allow form navigation with Tab key', async ({ page }) => {
      await page.keyboard.press('Tab')
      await expect(page.locator('[data-testid="name-input"]')).toBeFocused()

      await page.keyboard.press('Tab')
      await expect(page.locator('[data-testid="email-input"]')).toBeFocused()

      await page.keyboard.press('Tab')
      // Skip phone (optional field) or include it depending on focus order
    })

    test('should allow form submission with Enter key', async ({ page }) => {
      const timestamp = Date.now()

      await page.fill('[data-testid="name-input"]', 'Test User')
      await page.fill('[data-testid="email-input"]', `user-${timestamp}@example.test`)
      await page.fill('[data-testid="password-input"]', 'Password123!')
      await page.fill('[data-testid="confirm-password-input"]', 'Password123!')
      await page.check('#terms')

      await page.press('[data-testid="confirm-password-input"]', 'Enter')

      const successAlert = page.locator('[data-testid="auth-success"]')
      await expect(successAlert).toBeVisible({ timeout: 10000 })
    })
  })

  test.describe('Error Scenarios', () => {
    test('should show error for duplicate email', async ({ page, testUser }) => {
      await page.fill('[data-testid="name-input"]', 'Test User')
      await page.fill('[data-testid="email-input"]', testUser.email)
      await page.fill('[data-testid="password-input"]', 'Password123!')
      await page.fill('[data-testid="confirm-password-input"]', 'Password123!')
      await page.check('#terms')

      await page.click('[data-testid="register-button"]')

      // Should show error about email already being registered
      const errorAlert = page.locator('[data-testid="auth-error"]')
      await expect(errorAlert).toBeVisible({ timeout: 5000 })
      await expect(errorAlert).toContainText(/already|exists|registered/i)
    })

    test('should handle network errors gracefully', async ({ page }) => {
      // Simulate offline condition
      await page.context().setOffline(true)

      const timestamp = Date.now()
      await page.fill('[data-testid="name-input"]', 'Test User')
      await page.fill('[data-testid="email-input"]', `user-${timestamp}@example.test`)
      await page.fill('[data-testid="password-input"]', 'Password123!')
      await page.fill('[data-testid="confirm-password-input"]', 'Password123!')
      await page.check('#terms')

      await page.click('[data-testid="register-button"]')

      // Should show network error
      const errorAlert = page.locator('[data-testid="auth-error"]')
      await expect(errorAlert).toBeVisible({ timeout: 5000 })

      // Restore network
      await page.context().setOffline(false)
    })
  })

  test.describe('Loading States', () => {
    test('should show loading state during registration', async ({ page }) => {
      const timestamp = Date.now()

      await page.fill('[data-testid="name-input"]', 'Test User')
      await page.fill('[data-testid="email-input"]', `user-${timestamp}@example.test`)
      await page.fill('[data-testid="password-input"]', 'Password123!')
      await page.fill('[data-testid="confirm-password-input"]', 'Password123!')
      await page.check('#terms')

      const registerButton = page.locator('[data-testid="register-button"]')
      await registerButton.click()

      // Button should show loading spinner
      const spinner = registerButton.locator('svg.animate-spin')
      await expect(spinner).toBeVisible()

      // Button should be disabled during loading
      await expect(registerButton).toBeDisabled()
    })
  })

  test.describe('Navigation Links', () => {
    test('should navigate to login page', async ({ page }) => {
      const loginLink = page.locator('a[href*="/auth/login"]')
      await loginLink.click()

      await expect(page).toHaveURL(/\/auth\/login/)
    })
  })

  test.describe('Security', () => {
    test('should not expose password in network requests', async ({ page }) => {
      const requests: string[] = []

      page.on('request', (request) => {
        requests.push(request.url())
      })

      const timestamp = Date.now()
      await page.fill('[data-testid="name-input"]', 'Test User')
      await page.fill('[data-testid="email-input"]', `user-${timestamp}@example.test`)
      await page.fill('[data-testid="password-input"]', 'Password123!')
      await page.fill('[data-testid="confirm-password-input"]', 'Password123!')
      await page.check('#terms')

      await page.click('[data-testid="register-button"]')
      await page.waitForTimeout(2000)

      // Verify password is not in URL
      requests.forEach((url) => {
        expect(url.toLowerCase()).not.toContain('password123')
      })
    })

    test('should sanitize name input to prevent XSS', async ({ page }) => {
      const xssPayload = '<script>alert("XSS")</script>'

      await page.fill('[data-testid="name-input"]', xssPayload)
      await page.locator('[data-testid="name-input"]').blur()

      // Should either sanitize or show validation error
      const nameValue = await page.locator('[data-testid="name-input"]').inputValue()
      expect(nameValue).not.toContain('<script>')
    })
  })

  test.describe('Accessibility', () => {
    test('should have proper ARIA labels on all inputs', async ({ page }) => {
      const nameInput = page.locator('[data-testid="name-input"]')
      await expect(nameInput).toHaveAttribute('id', 'name')

      const emailInput = page.locator('[data-testid="email-input"]')
      await expect(emailInput).toHaveAttribute('id', 'email')

      const passwordInput = page.locator('[data-testid="password-input"]')
      await expect(passwordInput).toHaveAttribute('id', 'password')
    })

    test('should announce validation errors to screen readers', async ({ page }) => {
      await page.fill('[data-testid="email-input"]', 'invalid')
      await page.locator('[data-testid="email-input"]').blur()

      const emailError = page.locator('#email-error')
      await expect(emailError).toHaveAttribute('role', 'alert')
    })

    test('should have proper autocomplete attributes', async ({ page }) => {
      await expect(page.locator('[data-testid="name-input"]')).toHaveAttribute('autocomplete', 'name')
      await expect(page.locator('[data-testid="email-input"]')).toHaveAttribute('autocomplete', 'email')
      await expect(page.locator('[data-testid="password-input"]')).toHaveAttribute('autocomplete', 'new-password')
    })
  })
})
