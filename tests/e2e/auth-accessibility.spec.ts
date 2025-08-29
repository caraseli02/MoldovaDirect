/**
 * E2E Accessibility tests for authentication forms
 * 
 * Requirements addressed:
 * - 8.1-8.8: Mobile responsiveness and accessibility
 * - WCAG 2.1 AA compliance
 * - Screen reader compatibility
 * - Keyboard navigation
 * - Focus management
 */

import { test, expect } from '@playwright/test'

// Test different viewport sizes for accessibility
const viewports = [
  { name: 'Mobile', width: 375, height: 667 },
  { name: 'Tablet', width: 768, height: 1024 },
  { name: 'Desktop', width: 1920, height: 1080 }
]

test.describe('Authentication Accessibility Tests', () => {
  for (const viewport of viewports) {
    test.describe(`${viewport.name} Accessibility`, () => {
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height })
      })

      test('login form should be fully accessible', async ({ page }) => {
        await page.goto('/auth/login')

        // Check page structure
        const main = page.locator('main')
        await expect(main).toHaveAttribute('role', 'main')

        const heading = page.locator('h1')
        await expect(heading).toBeVisible()
        await expect(heading).toHaveAccessibleName()

        // Check form accessibility
        const form = page.locator('form')
        await expect(form).toBeVisible()

        // Check input labels and associations
        const emailInput = page.locator('#email')
        const emailLabel = page.locator('label[for="email"]')
        await expect(emailInput).toBeVisible()
        await expect(emailLabel).toBeVisible()
        await expect(emailInput).toHaveAttribute('aria-describedby')

        const passwordInput = page.locator('#password')
        const passwordLabel = page.locator('label[for="password"]')
        await expect(passwordInput).toBeVisible()
        await expect(passwordLabel).toBeVisible()

        // Check required field indicators
        await expect(emailInput).toHaveAttribute('required')
        await expect(passwordInput).toHaveAttribute('required')
        await expect(emailInput).toHaveAttribute('aria-required', 'true')
        await expect(passwordInput).toHaveAttribute('aria-required', 'true')

        // Check submit button
        const submitButton = page.locator('button[type="submit"]')
        await expect(submitButton).toBeVisible()
        await expect(submitButton).toHaveAccessibleName()
        await expect(submitButton).toBeEnabled()
      })

      test('register form should be fully accessible', async ({ page }) => {
        await page.goto('/auth/register')

        // Check form structure
        const form = page.locator('form')
        await expect(form).toBeVisible()

        // Check all form fields have proper labels
        const formFields = [
          { id: 'name', required: true },
          { id: 'email', required: true },
          { id: 'phone', required: false },
          { id: 'password', required: true },
          { id: 'confirmPassword', required: true }
        ]

        for (const field of formFields) {
          const input = page.locator(`#${field.id}`)
          const label = page.locator(`label[for="${field.id}"]`)
          
          await expect(input).toBeVisible()
          await expect(label).toBeVisible()
          
          if (field.required) {
            await expect(input).toHaveAttribute('required')
            await expect(input).toHaveAttribute('aria-required', 'true')
          }
        }

        // Check terms checkbox
        const termsCheckbox = page.locator('#acceptTerms')
        const termsLabel = page.locator('label[for="acceptTerms"]')
        await expect(termsCheckbox).toBeVisible()
        await expect(termsLabel).toBeVisible()
        await expect(termsCheckbox).toHaveAttribute('aria-required', 'true')

        // Check password strength meter accessibility
        const passwordInput = page.locator('#password')
        await passwordInput.fill('TestPassword123!')
        
        const strengthMeter = page.locator('[role="progressbar"]')
        await expect(strengthMeter).toBeVisible()
        await expect(strengthMeter).toHaveAttribute('aria-label')
        await expect(strengthMeter).toHaveAttribute('aria-valuenow')
        await expect(strengthMeter).toHaveAttribute('aria-valuemin')
        await expect(strengthMeter).toHaveAttribute('aria-valuemax')
      })

      test('password visibility toggle should be accessible', async ({ page }) => {
        await page.goto('/auth/login')

        const passwordInput = page.locator('#password')
        const toggleButton = page.locator('button[aria-label*="password"]').first()

        // Check initial state
        await expect(passwordInput).toHaveAttribute('type', 'password')
        await expect(toggleButton).toHaveAttribute('aria-pressed', 'false')
        await expect(toggleButton).toHaveAccessibleName()

        // Check toggle functionality
        await toggleButton.click()
        await expect(passwordInput).toHaveAttribute('type', 'text')
        await expect(toggleButton).toHaveAttribute('aria-pressed', 'true')

        // Toggle back
        await toggleButton.click()
        await expect(passwordInput).toHaveAttribute('type', 'password')
        await expect(toggleButton).toHaveAttribute('aria-pressed', 'false')
      })

      test('form validation errors should be accessible', async ({ page }) => {
        await page.goto('/auth/login')

        const emailInput = page.locator('#email')
        const passwordInput = page.locator('#password')
        const submitButton = page.locator('button[type="submit"]')

        // Submit empty form
        await submitButton.click()

        // Check error messages are accessible
        const emailError = page.locator('#email-error')
        const passwordError = page.locator('#password-error')

        await expect(emailError).toBeVisible()
        await expect(passwordError).toBeVisible()
        await expect(emailError).toHaveAttribute('role', 'alert')
        await expect(passwordError).toHaveAttribute('role', 'alert')
        await expect(emailError).toHaveAttribute('aria-live', 'polite')
        await expect(passwordError).toHaveAttribute('aria-live', 'polite')

        // Check inputs are marked as invalid
        await expect(emailInput).toHaveAttribute('aria-invalid', 'true')
        await expect(passwordInput).toHaveAttribute('aria-invalid', 'true')
        await expect(emailInput).toHaveAttribute('aria-describedby', 'email-error')
        await expect(passwordInput).toHaveAttribute('aria-describedby', 'password-error')
      })

      test('keyboard navigation should work correctly', async ({ page }) => {
        await page.goto('/auth/login')

        // Tab through form elements in correct order
        await page.keyboard.press('Tab')
        await expect(page.locator('#email')).toBeFocused()

        await page.keyboard.press('Tab')
        await expect(page.locator('#password')).toBeFocused()

        await page.keyboard.press('Tab')
        const passwordToggle = page.locator('button[aria-label*="password"]').first()
        await expect(passwordToggle).toBeFocused()

        await page.keyboard.press('Tab')
        await expect(page.locator('#remember')).toBeFocused()

        await page.keyboard.press('Tab')
        await expect(page.locator('a[href*="forgot-password"]')).toBeFocused()

        await page.keyboard.press('Tab')
        await expect(page.locator('button[type="submit"]')).toBeFocused()

        // Should be able to submit with Enter
        await page.fill('#email', 'test@example.com')
        await page.fill('#password', 'password123')
        await page.keyboard.press('Enter')

        // Form should attempt to submit (will show validation or error)
        await expect(page.locator('[role="alert"]')).toBeVisible()
      })

      test('focus indicators should be visible', async ({ page }) => {
        await page.goto('/auth/login')

        const focusableElements = [
          '#email',
          '#password',
          'button[aria-label*="password"]',
          '#remember',
          'a[href*="forgot-password"]',
          'button[type="submit"]'
        ]

        for (const selector of focusableElements) {
          const element = page.locator(selector).first()
          await element.focus()

          // Check that focus ring is visible
          const focusRing = await element.evaluate((el) => {
            const styles = window.getComputedStyle(el)
            return (
              styles.outline !== 'none' ||
              styles.boxShadow.includes('ring') ||
              styles.boxShadow.includes('focus') ||
              styles.border.includes('blue') ||
              styles.borderColor.includes('blue')
            )
          })
          expect(focusRing).toBe(true)
        }
      })

      test('loading states should be accessible', async ({ page }) => {
        await page.goto('/auth/login')

        const emailInput = page.locator('#email')
        const passwordInput = page.locator('#password')
        const submitButton = page.locator('button[type="submit"]')

        await emailInput.fill('test@example.com')
        await passwordInput.fill('password123')

        // Submit form
        await submitButton.click()

        // Check loading state accessibility
        await expect(submitButton).toHaveAttribute('aria-busy', 'true')
        await expect(submitButton).toBeDisabled()

        // Check for loading announcement
        const loadingStatus = page.locator('[aria-live="polite"]')
        if (await loadingStatus.isVisible()) {
          await expect(loadingStatus).toContainText('loading')
        }
      })

      test('success and error messages should be accessible', async ({ page }) => {
        await page.goto('/auth/login')

        // Trigger an error
        await page.fill('#email', 'invalid@example.com')
        await page.fill('#password', 'wrongpassword')
        await page.click('button[type="submit"]')

        // Check error message accessibility
        const errorMessage = page.locator('[role="alert"]')
        await expect(errorMessage).toBeVisible()
        await expect(errorMessage).toHaveAttribute('aria-live')

        // Error should be announced to screen readers
        const errorText = await errorMessage.textContent()
        expect(errorText).toBeTruthy()
        expect(errorText?.length).toBeGreaterThan(0)
      })

      test('should work with high contrast mode', async ({ page }) => {
        // Enable high contrast mode
        await page.emulateMedia({ colorScheme: 'dark', forcedColors: 'active' })
        await page.goto('/auth/login')

        // Form should still be visible and usable
        const form = page.locator('form')
        await expect(form).toBeVisible()

        const emailInput = page.locator('#email')
        const passwordInput = page.locator('#password')
        const submitButton = page.locator('button[type="submit"]')

        await expect(emailInput).toBeVisible()
        await expect(passwordInput).toBeVisible()
        await expect(submitButton).toBeVisible()

        // Elements should have sufficient contrast
        const emailBounds = await emailInput.boundingBox()
        expect(emailBounds).toBeTruthy()
      })

      test('should respect reduced motion preferences', async ({ page }) => {
        // Enable reduced motion
        await page.emulateMedia({ reducedMotion: 'reduce' })
        await page.goto('/auth/login')

        // Check that animations are disabled or reduced
        const animatedElements = page.locator('.transition, .animate-spin, .animate-pulse')
        
        for (const element of await animatedElements.all()) {
          const transitionDuration = await element.evaluate((el) => {
            return window.getComputedStyle(el).transitionDuration
          })
          
          // Transitions should be very short or disabled
          expect(['0s', 'none'].includes(transitionDuration)).toBe(true)
        }
      })

      test('should support screen reader announcements', async ({ page }) => {
        await page.goto('/auth/register')

        const passwordInput = page.locator('#password')
        const strengthMeter = page.locator('[role="progressbar"]')

        // Type password and check strength meter updates
        await passwordInput.fill('weak')
        await expect(strengthMeter).toHaveAttribute('aria-valuenow', '1')

        await passwordInput.fill('StrongPassword123!')
        await expect(strengthMeter).toHaveAttribute('aria-valuenow', '4')

        // Check that strength changes are announced
        const liveRegion = page.locator('[aria-live="polite"]')
        if (await liveRegion.isVisible()) {
          const announcement = await liveRegion.textContent()
          expect(announcement).toContain('Strong')
        }
      })

      test('should handle form submission errors accessibly', async ({ page }) => {
        await page.goto('/auth/login')

        // Fill form with invalid data
        await page.fill('#email', 'invalid@example.com')
        await page.fill('#password', 'wrongpassword')
        await page.click('button[type="submit"]')

        // Wait for error response
        await page.waitForTimeout(1000)

        // Check that error is properly announced
        const errorAlert = page.locator('[role="alert"]')
        await expect(errorAlert).toBeVisible()

        // Focus should return to first invalid field
        const emailInput = page.locator('#email')
        await expect(emailInput).toBeFocused()
        await expect(emailInput).toHaveAttribute('aria-invalid', 'true')
      })

      test('should provide clear instructions and help text', async ({ page }) => {
        await page.goto('/auth/register')

        // Check password requirements are clearly stated
        const passwordInput = page.locator('#password')
        const passwordHelp = page.locator('#password-help')

        await expect(passwordHelp).toBeVisible()
        await expect(passwordInput).toHaveAttribute('aria-describedby')

        const helpText = await passwordHelp.textContent()
        expect(helpText).toContain('8 characters')
        expect(helpText).toContain('uppercase')
        expect(helpText).toContain('lowercase')
        expect(helpText).toContain('number')
      })

      test('should handle language switching accessibly', async ({ page }) => {
        await page.goto('/auth/login')

        // Check if language switcher exists and is accessible
        const languageSwitcher = page.locator('[data-testid="language-switcher"]')
        
        if (await languageSwitcher.isVisible()) {
          await expect(languageSwitcher).toHaveAttribute('aria-label')
          
          // Should be keyboard accessible
          await languageSwitcher.focus()
          await expect(languageSwitcher).toBeFocused()
          
          // Should announce current language
          const currentLang = await languageSwitcher.getAttribute('aria-label')
          expect(currentLang).toBeTruthy()
        }
      })
    })
  }

  test.describe('Touch and Mobile Accessibility', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
    })

    test('should have adequate touch targets', async ({ page }) => {
      await page.goto('/auth/login')

      const touchTargets = [
        '#email',
        '#password',
        'button[aria-label*="password"]',
        '#remember',
        'button[type="submit"]'
      ]

      for (const selector of touchTargets) {
        const element = page.locator(selector).first()
        const bounds = await element.boundingBox()
        
        expect(bounds?.width).toBeGreaterThanOrEqual(44)
        expect(bounds?.height).toBeGreaterThanOrEqual(44)
      }
    })

    test('should handle virtual keyboard properly', async ({ page }) => {
      await page.goto('/auth/login')

      const emailInput = page.locator('#email')
      await emailInput.click()

      // Check that input is still visible after virtual keyboard
      const bounds = await emailInput.boundingBox()
      expect(bounds?.y).toBeGreaterThan(0)
      expect(bounds?.y).toBeLessThan(400) // Should be in visible area
    })

    test('should support zoom up to 200%', async ({ page }) => {
      await page.goto('/auth/login')

      // Simulate 200% zoom
      await page.setViewportSize({ width: 187, height: 333 }) // Half the original size

      // Form should still be usable
      const form = page.locator('form')
      await expect(form).toBeVisible()

      const emailInput = page.locator('#email')
      const passwordInput = page.locator('#password')
      const submitButton = page.locator('button[type="submit"]')

      await expect(emailInput).toBeVisible()
      await expect(passwordInput).toBeVisible()
      await expect(submitButton).toBeVisible()

      // Should not require horizontal scrolling
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
      expect(bodyWidth).toBeLessThanOrEqual(187)
    })
  })

  test.describe('Assistive Technology Compatibility', () => {
    test('should work with screen reader simulation', async ({ page }) => {
      await page.goto('/auth/login')

      // Simulate screen reader navigation
      const headings = page.locator('h1, h2, h3, h4, h5, h6')
      const headingCount = await headings.count()
      expect(headingCount).toBeGreaterThan(0)

      // Check heading hierarchy
      const mainHeading = page.locator('h1')
      await expect(mainHeading).toBeVisible()

      // Check landmarks
      const main = page.locator('main')
      const nav = page.locator('nav')
      
      await expect(main).toBeVisible()
      if (await nav.isVisible()) {
        await expect(nav).toHaveAttribute('aria-label')
      }
    })

    test('should provide skip links', async ({ page }) => {
      await page.goto('/auth/login')

      // Check for skip link (usually hidden but accessible)
      const skipLink = page.locator('a[href="#main-content"], a[href="#main"]')
      
      if (await skipLink.isVisible()) {
        await expect(skipLink).toHaveAccessibleName()
      }
    })

    test('should have proper page titles', async ({ page }) => {
      const pages = [
        { url: '/auth/login', expectedTitle: 'Login' },
        { url: '/auth/register', expectedTitle: 'Register' },
        { url: '/auth/forgot-password', expectedTitle: 'Reset Password' }
      ]

      for (const { url, expectedTitle } of pages) {
        await page.goto(url)
        const title = await page.title()
        expect(title).toContain(expectedTitle)
      }
    })
  })
})