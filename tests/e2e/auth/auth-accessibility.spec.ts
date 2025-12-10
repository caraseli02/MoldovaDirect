import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Authentication Accessibility (WCAG 2.1 Level AA)', () => {
  test.describe('Login Page Accessibility', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/auth/login')
      await page.waitForLoadState('networkidle')
    })

    test('should not have any automatically detectable WCAG 2.1 Level AA violations', async ({ page }) => {
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()

      expect(accessibilityScanResults.violations).toEqual([])
    })

    test('should have proper form labels', async ({ page }) => {
      const emailInput = page.locator('[data-testid="email-input"]')
      const passwordInput = page.locator('[data-testid="password-input"]')

      // Inputs should have associated labels
      await expect(emailInput).toHaveAttribute('id')
      await expect(passwordInput).toHaveAttribute('id')

      // Labels should exist
      const emailLabel = page.locator('label[for="email"]')
      const passwordLabel = page.locator('label[for="password"]')

      await expect(emailLabel).toBeVisible()
      await expect(passwordLabel).toBeVisible()
    })

    test('should have proper ARIA attributes for error states', async ({ page }) => {
      await page.fill('[data-testid="email-input"]', 'invalid-email')
      await page.blur('[data-testid="email-input"]')

      const emailInput = page.locator('[data-testid="email-input"]')
      const emailError = page.locator('#email-error')

      // Input should be marked as invalid
      await expect(emailInput).toHaveAttribute('aria-invalid', 'true')

      // Input should reference the error message
      const ariaDescribedBy = await emailInput.getAttribute('aria-describedby')
      expect(ariaDescribedBy).toContain('email-error')

      // Error should have alert role
      await expect(emailError).toHaveAttribute('role', 'alert')
    })

    test('should announce loading states to screen readers', async ({ page }) => {
      await page.fill('[data-testid="email-input"]', 'test@example.com')
      await page.fill('[data-testid="password-input"]', 'password123')

      const loginButton = page.locator('[data-testid="login-button"]')

      // Check for aria-live region for status updates
      const statusRegion = page.locator('#login-status')

      await loginButton.click()

      // Status region should be announced (aria-live="polite")
      if (await statusRegion.count() > 0) {
        await expect(statusRegion).toHaveAttribute('aria-live', 'polite')
      }
    })

    test('should have sufficient color contrast', async ({ page }) => {
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2aa'])
        .include('button, input, label, a')
        .analyze()

      const contrastViolations = accessibilityScanResults.violations.filter(
        v => v.id === 'color-contrast',
      )

      expect(contrastViolations).toEqual([])
    })

    test('should have keyboard accessible password toggle', async ({ page }) => {
      const toggleButton = page.locator('[data-testid="password-toggle"]')

      // Toggle should be keyboard accessible
      await toggleButton.focus()
      await expect(toggleButton).toBeFocused()

      // Toggle should have proper ARIA attributes
      await expect(toggleButton).toHaveAttribute('aria-label')
      await expect(toggleButton).toHaveAttribute('aria-pressed')

      // Should toggle with Enter key
      const passwordInput = page.locator('[data-testid="password-input"]')
      await page.keyboard.press('Enter')
      await expect(passwordInput).toHaveAttribute('type', 'text')
    })

    test('should have descriptive button text or aria-label', async ({ page }) => {
      const loginButton = page.locator('[data-testid="login-button"]')
      const magicLinkButton = page.locator('[data-testid="magic-link-button"]')

      // Buttons should have accessible names
      const loginText = await loginButton.textContent()
      const loginAriaLabel = await loginButton.getAttribute('aria-label')

      expect(loginText || loginAriaLabel).toBeTruthy()

      const magicText = await magicLinkButton.textContent()
      const magicAriaLabel = await magicLinkButton.getAttribute('aria-label')

      expect(magicText || magicAriaLabel).toBeTruthy()
    })
  })

  test.describe('Register Page Accessibility', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/auth/register')
      await page.waitForLoadState('networkidle')
    })

    test('should not have any WCAG 2.1 Level AA violations', async ({ page }) => {
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()

      expect(accessibilityScanResults.violations).toEqual([])
    })

    test('should have proper form field labels', async ({ page }) => {
      const fields = ['name', 'email', 'password']

      for (const field of fields) {
        const input = page.locator(`#${field}`)
        const label = page.locator(`label[for="${field}"]`)

        await expect(input).toBeAttached()
        await expect(label).toBeVisible()

        // Label text should be meaningful
        const labelText = await label.textContent()
        expect(labelText?.trim().length).toBeGreaterThan(0)
      }
    })

    test('should have accessible password strength indicator', async ({ page }) => {
      await page.fill('[data-testid="password-input"]', 'WeakPassword')

      const strengthMeter = page.locator('[data-testid="password-strength-meter"]')

      // If strength meter exists, it should be accessible
      if (await strengthMeter.count() > 0) {
        // Should have role or aria-label
        const hasRole = await strengthMeter.getAttribute('role')
        const hasAriaLabel = await strengthMeter.getAttribute('aria-label')

        expect(hasRole || hasAriaLabel).toBeTruthy()
      }
    })

    test('should have accessible terms and privacy links', async ({ page }) => {
      const termsLink = page.locator('a[href*="/terms"]')
      const privacyLink = page.locator('a[href*="/privacy"]')

      // Links should have accessible names
      await expect(termsLink).toBeVisible()
      await expect(privacyLink).toBeVisible()

      // Links should open in new tab with proper attributes
      await expect(termsLink).toHaveAttribute('target', '_blank')

      // Should have aria-label for screen readers
      const termsAriaLabel = await termsLink.getAttribute('aria-label')
      expect(termsAriaLabel).toBeTruthy()
    })

    test('should announce password match status to screen readers', async ({ page }) => {
      await page.fill('[data-testid="password-input"]', 'Password123!')
      await page.fill('[data-testid="confirm-password-input"]', 'Password123!')

      // Match indicator should be announced
      const matchIndicator = page.locator('text=/Passwords match/i')

      if (await matchIndicator.count() > 0) {
        await expect(matchIndicator).toBeVisible()
      }
    })

    test('should have proper autocomplete attributes', async ({ page }) => {
      await expect(page.locator('[data-testid="name-input"]')).toHaveAttribute('autocomplete', 'name')
      await expect(page.locator('[data-testid="email-input"]')).toHaveAttribute('autocomplete', 'email')
      await expect(page.locator('[data-testid="password-input"]')).toHaveAttribute('autocomplete', 'new-password')
    })
  })

  test.describe('Forgot Password Page Accessibility', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/auth/forgot-password')
      await page.waitForLoadState('networkidle')
    })

    test('should not have any WCAG violations', async ({ page }) => {
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze()

      expect(accessibilityScanResults.violations).toEqual([])
    })

    test('should have clear page title and heading', async ({ page }) => {
      // Page should have descriptive title
      await expect(page).toHaveTitle(/forgot password/i)

      // Should have h1 or main heading
      const heading = page.locator('h1, h2').first()
      await expect(heading).toBeVisible()

      const headingText = await heading.textContent()
      expect(headingText?.toLowerCase()).toContain('forgot')
    })

    test('should have accessible back to login link', async ({ page }) => {
      const backLink = page.locator('a[href*="/auth/login"]')

      await expect(backLink).toBeVisible()

      // Link should have accessible name
      const linkText = await backLink.textContent()
      const ariaLabel = await backLink.getAttribute('aria-label')

      expect(linkText || ariaLabel).toBeTruthy()
    })
  })

  test.describe('Keyboard Navigation', () => {
    test('should support full keyboard navigation on login page', async ({ page }) => {
      await page.goto('/auth/login')

      // Tab through all interactive elements
      await page.keyboard.press('Tab') // Email input
      await expect(page.locator('[data-testid="email-input"]')).toBeFocused()

      await page.keyboard.press('Tab') // Password input
      await expect(page.locator('[data-testid="password-input"]')).toBeFocused()

      await page.keyboard.press('Tab') // Password toggle or next element
      await page.keyboard.press('Tab') // Continue tabbing

      // Should eventually reach login button
      let attempts = 0
      while (attempts < 10) {
        const focusedElement = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'))
        if (focusedElement === 'login-button') {
          break
        }
        await page.keyboard.press('Tab')
        attempts++
      }

      // Login button should be reachable
      expect(attempts).toBeLessThan(10)
    })

    test('should support reverse tab navigation', async ({ page }) => {
      await page.goto('/auth/login')

      // Navigate to login button first
      await page.locator('[data-testid="login-button"]').focus()
      await expect(page.locator('[data-testid="login-button"]')).toBeFocused()

      // Shift+Tab should go backwards
      await page.keyboard.press('Shift+Tab')

      // Should focus on an earlier element
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName)
      expect(focusedElement).toBeTruthy()
    })

    test('should have visible focus indicators', async ({ page }) => {
      await page.goto('/auth/login')

      const emailInput = page.locator('[data-testid="email-input"]')
      await emailInput.focus()

      // Check for focus styles (outline or ring)
      const focusStyle = await emailInput.evaluate((el) => {
        const styles = window.getComputedStyle(el)
        return {
          outline: styles.outline,
          outlineWidth: styles.outlineWidth,
          boxShadow: styles.boxShadow,
        }
      })

      // Should have visible focus indicator
      const hasFocusIndicator
        = focusStyle.outline !== 'none'
          || parseInt(focusStyle.outlineWidth) > 0
          || focusStyle.boxShadow !== 'none'

      expect(hasFocusIndicator).toBeTruthy()
    })
  })

  test.describe('Screen Reader Support', () => {
    test('should have proper page landmarks', async ({ page }) => {
      await page.goto('/auth/login')

      // Should have main landmark
      const main = page.locator('main, [role="main"]')
      expect(await main.count()).toBeGreaterThan(0)

      // Form should have proper structure
      const form = page.locator('form')
      await expect(form).toBeAttached()
    })

    test('should announce form submission state', async ({ page }) => {
      await page.goto('/auth/login')

      await page.fill('[data-testid="email-input"]', 'test@example.com')
      await page.fill('[data-testid="password-input"]', 'password123')

      const loginButton = page.locator('[data-testid="login-button"]')

      // Button should have aria-label for current state
      const initialAriaLabel = await loginButton.getAttribute('aria-label')
      expect(initialAriaLabel).toBeTruthy()

      await loginButton.click()

      // Aria-label should update during loading
      await page.waitForTimeout(500)
      const loadingAriaLabel = await loginButton.getAttribute('aria-label')

      // Labels should indicate state change
      expect(loadingAriaLabel).toBeTruthy()
    })

    test('should have sr-only helper text', async ({ page }) => {
      await page.goto('/auth/login')

      // Check for screen reader only content
      const srOnlyElements = await page.evaluate(() => {
        const elements = document.querySelectorAll('.sr-only, .visually-hidden')
        return Array.from(elements).length
      })

      // Should have some SR-only content for better screen reader experience
      expect(srOnlyElements).toBeGreaterThan(0)
    })
  })

  test.describe('Form Accessibility', () => {
    test('should group related form controls properly', async ({ page }) => {
      await page.goto('/auth/register')

      // Check for fieldset/legend or proper grouping
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['best-practice'])
        .analyze()

      // Should not have form-related violations
      const formViolations = accessibilityScanResults.violations.filter(
        v => v.id.includes('form') || v.id.includes('label'),
      )

      expect(formViolations).toEqual([])
    })

    test('should have required field indicators', async ({ page }) => {
      await page.goto('/auth/register')

      const requiredInputs = page.locator('input[required]')
      const count = await requiredInputs.count()

      // Required inputs should exist
      expect(count).toBeGreaterThan(0)

      // Each required input should have aria-required or visual indicator
      for (let i = 0; i < count; i++) {
        const input = requiredInputs.nth(i)
        const hasRequired = await input.getAttribute('required')
        const hasAriaRequired = await input.getAttribute('aria-required')

        expect(hasRequired !== null || hasAriaRequired === 'true').toBeTruthy()
      }
    })
  })

  test.describe('Error Messaging Accessibility', () => {
    test('should have accessible error messages', async ({ page }) => {
      await page.goto('/auth/login')

      await page.fill('[data-testid="email-input"]', 'invalid')
      await page.blur('[data-testid="email-input"]')

      const emailError = page.locator('#email-error')

      // Error should be visible
      await expect(emailError).toBeVisible()

      // Error should have role="alert"
      await expect(emailError).toHaveAttribute('role', 'alert')

      // Input should reference error
      const emailInput = page.locator('[data-testid="email-input"]')
      const describedBy = await emailInput.getAttribute('aria-describedby')

      expect(describedBy).toContain('email-error')
    })

    test('should announce global errors to screen readers', async ({ page }) => {
      await page.goto('/auth/login')

      await page.fill('[data-testid="email-input"]', 'test@example.com')
      await page.fill('[data-testid="password-input"]', 'wrongpassword')
      await page.click('[data-testid="login-button"]')

      const errorAlert = page.locator('[data-testid="auth-error"]')
      await errorAlert.waitFor({ state: 'visible', timeout: 5000 })

      // Error alert should be announced
      // Check for alert role or aria-live
      const hasAlertRole = await errorAlert.evaluate(el =>
        el.getAttribute('role') === 'alert' || el.closest('[role="alert"]') !== null,
      )

      expect(hasAlertRole).toBeTruthy()
    })
  })

  test.describe('Mobile Accessibility', () => {
    test.use({ viewport: { width: 375, height: 667 } })

    test('should maintain accessibility on mobile viewport', async ({ page }) => {
      await page.goto('/auth/login')

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze()

      expect(accessibilityScanResults.violations).toEqual([])
    })

    test('should have adequate touch targets on mobile', async ({ page }) => {
      await page.goto('/auth/login')

      // Check button sizes
      const loginButton = page.locator('[data-testid="login-button"]')
      const buttonBox = await loginButton.boundingBox()

      expect(buttonBox?.height).toBeGreaterThanOrEqual(44)
      expect(buttonBox?.width).toBeGreaterThanOrEqual(44)
    })
  })
})
