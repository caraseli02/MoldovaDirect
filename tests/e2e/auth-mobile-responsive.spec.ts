import { test, expect } from '@playwright/test'

/**
 * Mobile Experience and Accessibility Tests for Authentication
 * 
 * Requirements addressed:
 * - 8.1: Fully functional forms without horizontal scrolling
 * - 8.2: Appropriately sized input fields for touch interaction
 * - 8.3: Clearly visible and readable error messages
 * - 8.4: Appropriate input types and keyboards
 * - 8.5: Proper auto-capitalization settings
 * - 8.6: Show/hide password toggle
 * - 8.7: Responsive layout adaptation
 * - 8.8: Minimum touch target sizes (44px)
 */

// Test viewports for different screen sizes
const viewports = [
  { name: 'Mobile Portrait', width: 375, height: 667 },
  { name: 'Mobile Landscape', width: 667, height: 375 },
  { name: 'Tablet Portrait', width: 768, height: 1024 },
  { name: 'Tablet Landscape', width: 1024, height: 768 },
  { name: 'Desktop', width: 1920, height: 1080 }
]

for (const viewport of viewports) {
  test.describe(`Authentication Mobile Experience - ${viewport.name}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
    })

    test('login page should be fully responsive without horizontal scrolling', async ({ page }) => {
      await page.goto('/auth/login')
      
      // Check that page doesn't require horizontal scrolling
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
      const viewportWidth = viewport.width
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth)
      
      // Verify form is visible and accessible
      const form = page.locator('form')
      await expect(form).toBeVisible()
      
      // Check that all form elements are within viewport
      const formBounds = await form.boundingBox()
      expect(formBounds?.width).toBeLessThanOrEqual(viewportWidth)
    })

    test('register page should be fully responsive without horizontal scrolling', async ({ page }) => {
      await page.goto('/auth/register')
      
      // Check that page doesn't require horizontal scrolling
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
      const viewportWidth = viewport.width
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth)
      
      // Verify form is visible and accessible
      const form = page.locator('form')
      await expect(form).toBeVisible()
      
      // Check that all form elements are within viewport
      const formBounds = await form.boundingBox()
      expect(formBounds?.width).toBeLessThanOrEqual(viewportWidth)
    })

    test('input fields should meet minimum touch target size requirements', async ({ page }) => {
      await page.goto('/auth/login')
      
      // Check email input
      const emailInput = page.locator('#email')
      const emailBounds = await emailInput.boundingBox()
      expect(emailBounds?.height).toBeGreaterThanOrEqual(44)
      
      // Check password input
      const passwordInput = page.locator('#password')
      const passwordBounds = await passwordInput.boundingBox()
      expect(passwordBounds?.height).toBeGreaterThanOrEqual(44)
      
      // Check password toggle button
      const passwordToggle = page.locator('button[aria-label*="password"]').first()
      const toggleBounds = await passwordToggle.boundingBox()
      expect(toggleBounds?.width).toBeGreaterThanOrEqual(44)
      expect(toggleBounds?.height).toBeGreaterThanOrEqual(44)
      
      // Check submit button
      const submitButton = page.locator('button[type="submit"]')
      const submitBounds = await submitButton.boundingBox()
      expect(submitBounds?.height).toBeGreaterThanOrEqual(48)
    })

    test('input fields should have appropriate input types and attributes', async ({ page }) => {
      await page.goto('/auth/login')
      
      // Email input should have correct attributes
      const emailInput = page.locator('#email')
      await expect(emailInput).toHaveAttribute('type', 'email')
      await expect(emailInput).toHaveAttribute('autocomplete', 'email')
      await expect(emailInput).toHaveAttribute('autocapitalize', 'none')
      await expect(emailInput).toHaveAttribute('autocorrect', 'off')
      await expect(emailInput).toHaveAttribute('spellcheck', 'false')
      await expect(emailInput).toHaveAttribute('inputmode', 'email')
      
      // Password input should have correct attributes
      const passwordInput = page.locator('#password')
      await expect(passwordInput).toHaveAttribute('type', 'password')
      await expect(passwordInput).toHaveAttribute('autocomplete', 'current-password')
      await expect(passwordInput).toHaveAttribute('autocapitalize', 'none')
      await expect(passwordInput).toHaveAttribute('autocorrect', 'off')
      await expect(passwordInput).toHaveAttribute('spellcheck', 'false')
    })

    test('register page input fields should have appropriate attributes', async ({ page }) => {
      await page.goto('/auth/register')
      
      // Name input should allow capitalization
      const nameInput = page.locator('#name')
      await expect(nameInput).toHaveAttribute('type', 'text')
      await expect(nameInput).toHaveAttribute('autocomplete', 'name')
      await expect(nameInput).toHaveAttribute('autocapitalize', 'words')
      await expect(nameInput).toHaveAttribute('autocorrect', 'on')
      await expect(nameInput).toHaveAttribute('spellcheck', 'true')
      
      // Phone input should have correct type
      const phoneInput = page.locator('#phone')
      await expect(phoneInput).toHaveAttribute('type', 'tel')
      await expect(phoneInput).toHaveAttribute('autocomplete', 'tel')
      await expect(phoneInput).toHaveAttribute('inputmode', 'tel')
      await expect(phoneInput).toHaveAttribute('autocapitalize', 'none')
    })

    test('password visibility toggle should work correctly', async ({ page }) => {
      await page.goto('/auth/login')
      
      const passwordInput = page.locator('#password')
      const toggleButton = page.locator('button[aria-label*="password"]').first()
      
      // Initially password should be hidden
      await expect(passwordInput).toHaveAttribute('type', 'password')
      await expect(toggleButton).toHaveAttribute('aria-pressed', 'false')
      
      // Click toggle to show password
      await toggleButton.click()
      await expect(passwordInput).toHaveAttribute('type', 'text')
      await expect(toggleButton).toHaveAttribute('aria-pressed', 'true')
      
      // Click toggle to hide password again
      await toggleButton.click()
      await expect(passwordInput).toHaveAttribute('type', 'password')
      await expect(toggleButton).toHaveAttribute('aria-pressed', 'false')
    })

    test('form validation should display clear error messages', async ({ page }) => {
      await page.goto('/auth/login')
      
      const emailInput = page.locator('#email')
      const passwordInput = page.locator('#password')
      
      // Enter invalid email and blur
      await emailInput.fill('invalid-email')
      await emailInput.blur()
      
      // Check for error message
      const emailError = page.locator('#email-error')
      await expect(emailError).toBeVisible()
      await expect(emailError).toHaveAttribute('role', 'alert')
      
      // Error message should be readable on mobile
      const errorBounds = await emailError.boundingBox()
      expect(errorBounds?.width).toBeLessThanOrEqual(viewport.width - 32) // Account for padding
    })

    test('accessibility attributes should be properly set', async ({ page }) => {
      await page.goto('/auth/login')
      
      // Check ARIA attributes on inputs
      const emailInput = page.locator('#email')
      await expect(emailInput).toHaveAttribute('aria-invalid', 'false')
      
      const passwordInput = page.locator('#password')
      await expect(passwordInput).toHaveAttribute('aria-invalid', 'false')
      
      // Check form has proper structure
      const form = page.locator('form')
      await expect(form).toBeVisible()
      
      // Check labels are properly associated
      const emailLabel = page.locator('label[for="email"]')
      await expect(emailLabel).toBeVisible()
      
      const passwordLabel = page.locator('label[for="password"]')
      await expect(passwordLabel).toBeVisible()
    })

    test('keyboard navigation should work properly', async ({ page }) => {
      await page.goto('/auth/login')
      
      // Tab through form elements
      await page.keyboard.press('Tab')
      await expect(page.locator('#email')).toBeFocused()
      
      await page.keyboard.press('Tab')
      await expect(page.locator('#password')).toBeFocused()
      
      await page.keyboard.press('Tab')
      await expect(page.locator('#remember')).toBeFocused()
      
      await page.keyboard.press('Tab')
      await expect(page.locator('a[href*="forgot-password"]')).toBeFocused()
      
      await page.keyboard.press('Tab')
      await expect(page.locator('button[type="submit"]')).toBeFocused()
    })

    test('focus indicators should be visible', async ({ page }) => {
      await page.goto('/auth/login')
      
      const emailInput = page.locator('#email')
      await emailInput.focus()
      
      // Check that focus ring is visible
      const focusRing = await emailInput.evaluate((el) => {
        const styles = window.getComputedStyle(el)
        return styles.outline !== 'none' || styles.boxShadow.includes('ring')
      })
      expect(focusRing).toBe(true)
    })

    test('form should handle mobile keyboard properly', async ({ page }) => {
      // Only test on mobile viewports
      if (viewport.width > 768) return
      
      await page.goto('/auth/login')
      
      const emailInput = page.locator('#email')
      await emailInput.click()
      
      // Verify input is focused and visible
      await expect(emailInput).toBeFocused()
      
      // Check that the input is still visible after keyboard appears
      // (This is a basic check - real mobile keyboard testing requires device testing)
      const inputBounds = await emailInput.boundingBox()
      expect(inputBounds?.y).toBeGreaterThan(0)
    })

    test('loading states should be accessible', async ({ page }) => {
      await page.goto('/auth/login')
      
      const submitButton = page.locator('button[type="submit"]')
      const emailInput = page.locator('#email')
      const passwordInput = page.locator('#password')
      
      // Fill form with valid data
      await emailInput.fill('test@example.com')
      await passwordInput.fill('password123')
      
      // Submit form (will fail but we can test loading state)
      await submitButton.click()
      
      // Check loading state accessibility
      await expect(submitButton).toHaveAttribute('aria-label')
      
      // Check for loading status announcement
      const loadingStatus = page.locator('#login-status')
      if (await loadingStatus.isVisible()) {
        await expect(loadingStatus).toHaveAttribute('aria-live', 'polite')
      }
    })
  })
}

test.describe('Authentication Progress Indicator', () => {
  test('should display progress correctly for multi-step flows', async ({ page }) => {
    // This would be used in multi-step registration or password reset
    await page.goto('/auth/register')
    
    // Check if progress indicator exists (if implemented)
    const progressIndicator = page.locator('[role="progressbar"]')
    if (await progressIndicator.isVisible()) {
      await expect(progressIndicator).toHaveAttribute('aria-valuenow')
      await expect(progressIndicator).toHaveAttribute('aria-valuemin', '1')
      await expect(progressIndicator).toHaveAttribute('aria-valuemax')
      await expect(progressIndicator).toHaveAttribute('aria-label')
    }
  })
})

test.describe('High Contrast and Accessibility Features', () => {
  test('should work with high contrast mode', async ({ page }) => {
    // Simulate high contrast mode
    await page.emulateMedia({ colorScheme: 'dark', forcedColors: 'active' })
    await page.goto('/auth/login')
    
    // Verify form is still usable
    const form = page.locator('form')
    await expect(form).toBeVisible()
    
    const emailInput = page.locator('#email')
    await expect(emailInput).toBeVisible()
    
    const submitButton = page.locator('button[type="submit"]')
    await expect(submitButton).toBeVisible()
  })

  test('should respect reduced motion preferences', async ({ page }) => {
    // Simulate reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/auth/login')
    
    // Verify page loads and functions normally
    const form = page.locator('form')
    await expect(form).toBeVisible()
    
    // Animations should be disabled or reduced
    const animatedElements = page.locator('.transition-all, .animate-spin')
    for (const element of await animatedElements.all()) {
      const transitionDuration = await element.evaluate((el) => {
        return window.getComputedStyle(el).transitionDuration
      })
      // In reduced motion mode, transitions should be very short or none
      expect(transitionDuration === '0s' || transitionDuration === 'none').toBe(true)
    }
  })
})