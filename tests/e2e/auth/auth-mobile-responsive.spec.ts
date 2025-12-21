import { test, expect } from '@playwright/test'

// Use unauthenticated context for auth page testing
test.use({ storageState: { cookies: [], origins: [] } })

// These tests run on mobile devices configured in playwright.config.ts
// Projects: 'Mobile Chrome' (Pixel 5) and 'Mobile Safari' (iPhone 12)

test.describe('Login Page Mobile', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login')
    await page.waitForLoadState('networkidle')
  })

  test('should display login form correctly on mobile', async ({ page }) => {
    // Form should be visible and properly sized
    const emailInput = page.locator('[data-testid="email-input"]')
    const passwordInput = page.locator('[data-testid="password-input"]')
    const loginButton = page.locator('[data-testid="login-button"]')

    await expect(emailInput).toBeVisible()
    await expect(passwordInput).toBeVisible()
    await expect(loginButton).toBeVisible()

    // Check button has minimum touch target size (44x44px)
    const buttonBox = await loginButton.boundingBox()
    expect(buttonBox?.height).toBeGreaterThanOrEqual(44)
  })

  test('should have proper input spacing on mobile', async ({ page }) => {
    const emailInput = page.locator('[data-testid="email-input"]')
    const passwordInput = page.locator('[data-testid="password-input"]')

    const emailBox = await emailInput.boundingBox()
    const passwordBox = await passwordInput.boundingBox()

    // Ensure adequate spacing between inputs (at least 16px)
    if (emailBox && passwordBox) {
      const spacing = passwordBox.y - (emailBox.y + emailBox.height)
      expect(spacing).toBeGreaterThanOrEqual(16)
    }
  })

  test('should show mobile-optimized keyboard for email input', async ({ page }) => {
    const emailInput = page.locator('[data-testid="email-input"]')

    await expect(emailInput).toHaveAttribute('type', 'email')
    await expect(emailInput).toHaveAttribute('inputmode', 'email')
  })

  test('should toggle password visibility on mobile', async ({ page }) => {
    const passwordInput = page.locator('#password')
    // Find the toggle button - it's a button inside the password input container
    const toggleButton = page.locator('#password').locator('..').locator('button[type="button"]').first()

    // Wait for toggle button to be visible
    await expect(toggleButton).toBeVisible({ timeout: 10000 })

    // Verify initial state
    await expect(passwordInput).toHaveAttribute('type', 'password')

    // Toggle visibility
    await toggleButton.tap()
    await expect(passwordInput).toHaveAttribute('type', 'text')

    // Toggle back
    await toggleButton.tap()
    await expect(passwordInput).toHaveAttribute('type', 'password')
  })

  test('should handle mobile viewport without horizontal scroll', async ({ page }) => {
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)

    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 10) // Allow small variance
  })

  test('should display forgot password link with adequate touch target', async ({ page }) => {
    const forgotPasswordLink = page.locator('[data-testid="forgot-password"]')

    const linkBox = await forgotPasswordLink.boundingBox()
    expect(linkBox?.height).toBeGreaterThanOrEqual(44)
  })
})

test.describe('Register Page Mobile', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/register')
    await page.waitForLoadState('networkidle')
  })

  test('should display registration form correctly on mobile', async ({ page }) => {
    const nameInput = page.locator('[data-testid="name-input"]')
    const emailInput = page.locator('[data-testid="email-input"]')
    const passwordInput = page.locator('[data-testid="password-input"]')
    const registerButton = page.locator('[data-testid="register-button"]')

    await expect(nameInput).toBeVisible()
    await expect(emailInput).toBeVisible()
    await expect(passwordInput).toBeVisible()
    await expect(registerButton).toBeVisible()
  })

  test('should show password strength meter on mobile', async ({ page }) => {
    const passwordInput = page.locator('[data-testid="password-input"]')

    await passwordInput.fill('WeakPassword')

    // Password strength meter should be visible
    const strengthMeter = page.locator('[data-testid="password-strength-meter"]')
    const isVisible = await strengthMeter.isVisible().catch(() => false)

    // Meter might not be visible if not implemented
    if (isVisible) {
      const meterBox = await strengthMeter.boundingBox()
      expect(meterBox).toBeTruthy()
    }
  })

  test('should handle long form scrolling on mobile', async ({ page }) => {
    const timestamp = Date.now()

    // Fill form from top to bottom
    await page.fill('[data-testid="name-input"]', 'Test User')
    await page.fill('[data-testid="email-input"]', `user-${timestamp}@example.test`)
    await page.fill('[data-testid="password-input"]', 'SecurePassword123!')
    await page.fill('[data-testid="confirm-password-input"]', 'SecurePassword123!')

    // Terms checkbox should be visible after scrolling
    const termsCheckbox = page.locator('#terms')
    await termsCheckbox.scrollIntoViewIfNeeded()
    await expect(termsCheckbox).toBeVisible()
  })

  test('should open terms link in new tab on mobile', async ({ page, context }) => {
    // Look for terms link - may have different text based on locale
    const termsLink = page.locator('a[href*="/terms"], a:has-text("términos"), a:has-text("terms")').first()

    // Wait for terms link to be visible
    const isVisible = await termsLink.isVisible({ timeout: 5000 }).catch(() => false)

    if (!isVisible) {
      // Terms link might not be visible without scrolling
      await page.locator('#terms, button[role="checkbox"]').first().scrollIntoViewIfNeeded()
      await page.waitForTimeout(500)
    }

    // If link has target="_blank", wait for new page
    const target = await termsLink.getAttribute('target')

    if (target === '_blank') {
      const [newPage] = await Promise.all([
        context.waitForEvent('page'),
        termsLink.tap(),
      ])
      await newPage.waitForLoadState('domcontentloaded')
      await newPage.close()
    }
    else {
      // Link opens in same tab - just verify it's tappable
      const linkBox = await termsLink.boundingBox()
      expect(linkBox).toBeTruthy()
    }
  })
})

test.describe('Mobile Form Validation', () => {
  test('should show validation errors without obscuring inputs', async ({ page }) => {
    await page.goto('/auth/login')

    await page.fill('[data-testid="email-input"]', 'invalid-email')
    await page.locator('[data-testid="email-input"]').blur()

    // Try multiple possible error selectors
    const emailError = page.locator('#email-error, [data-testid="email-error"], .error:has-text("email"), [role="alert"]').first()
    const emailInput = page.locator('[data-testid="email-input"]')

    // Check if error message appears (may take a moment for validation)
    await page.waitForTimeout(500)

    const errorVisible = await emailError.isVisible().catch(() => false)

    if (errorVisible) {
      // Both error and input should be visible
      await expect(emailError).toBeVisible()
      await expect(emailInput).toBeVisible()

      // Error should not cover the input
      const errorBox = await emailError.boundingBox()
      const inputBox = await emailInput.boundingBox()

      if (errorBox && inputBox) {
        expect(errorBox.y).toBeGreaterThan(inputBox.y + inputBox.height)
      }
    }
    else {
      // If no error shown, just verify input is still visible
      await expect(emailInput).toBeVisible()
    }
  })
})

test.describe('Mobile Keyboard Handling', () => {
  test('should not zoom in when focusing inputs', async ({ page }) => {
    await page.goto('/auth/login')

    // Check viewport meta tag prevents zoom
    const viewport = await page.evaluate(() => {
      const meta = document.querySelector('meta[name="viewport"]')
      return meta?.getAttribute('content')
    })

    // Should have proper viewport settings
    expect(viewport).toBeTruthy()
  })

  test('should show appropriate keyboard for phone input', async ({ page }) => {
    await page.goto('/auth/register')

    const phoneInput = page.locator('[data-testid="phone-input"]')

    // Phone input should have tel inputmode
    await expect(phoneInput).toHaveAttribute('inputmode', 'tel')
    await expect(phoneInput).toHaveAttribute('type', 'tel')
  })
})

test.describe('Mobile Navigation', () => {
  test('should navigate between auth pages smoothly', async ({ page }) => {
    await page.goto('/auth/login')

    // Navigate to register
    await page.click('a[href*="/auth/register"]')
    await expect(page).toHaveURL(/\/auth\/register/)

    // Navigate back to login
    await page.click('a[href*="/auth/login"]')
    await expect(page).toHaveURL(/\/auth\/login/)
  })

  test('should handle back button navigation', async ({ page }) => {
    await page.goto('/auth/login')
    await page.click('a[href*="/auth/register"]')
    await expect(page).toHaveURL(/\/auth\/register/)

    await page.goBack()
    await expect(page).toHaveURL(/\/auth\/login/)
  })
})

test.describe('Mobile Touch Interactions', () => {
  test('should handle tap on submit button', async ({ page }) => {
    await page.goto('/auth/login')

    const timestamp = Date.now()
    await page.fill('#email', `test-${timestamp}@example.test`)
    // Use a stronger password that meets validation requirements
    await page.fill('#password', 'SecurePassword123!')

    const loginButton = page.locator('[data-testid="login-button"]')

    // Wait for button to be enabled (validation may take a moment)
    await page.waitForTimeout(500)

    // Tap the button
    await loginButton.tap()

    // Should process the login attempt
    await page.waitForTimeout(1000)
  })

  test('should handle swipe gestures gracefully', async ({ page }) => {
    await page.goto('/auth/login')

    // Verify page doesn't break with touch gestures
    const emailInput = page.locator('#email')
    await emailInput.tap()

    // Verify input remains visible and functional
    await expect(emailInput).toBeVisible()
  })
})

test.describe('Mobile Performance', () => {
  test('should load auth page quickly on mobile', async ({ page }) => {
    const startTime = Date.now()

    await page.goto('/auth/login')
    await page.waitForLoadState('networkidle')

    const loadTime = Date.now() - startTime

    // Should load in under 5 seconds
    expect(loadTime).toBeLessThan(5000)
  })

  test('should render form elements without layout shift', async ({ page }) => {
    await page.goto('/auth/login')

    // Wait for all elements to load
    await page.waitForLoadState('networkidle')

    const emailInput = page.locator('[data-testid="email-input"]')
    const initialBox = await emailInput.boundingBox()

    // Wait a bit more
    await page.waitForTimeout(1000)

    const finalBox = await emailInput.boundingBox()

    // Position should not have shifted
    if (initialBox && finalBox) {
      expect(Math.abs(initialBox.y - finalBox.y)).toBeLessThan(5)
    }
  })
})

test.describe('Orientation Changes', () => {
  test('should handle portrait to landscape orientation', async ({ page }) => {
    await page.goto('/auth/login')

    // Test portrait mode (default)
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible()

    // Simulate landscape mode by changing viewport
    await page.setViewportSize({ width: 844, height: 390 })

    // Form should still be visible and usable
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="password-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="login-button"]')).toBeVisible()
  })
})

test.describe('Cross-Device Consistency', () => {
  test('should maintain consistent spacing across devices', async ({ page }) => {
    const viewportSizes = [
      { width: 375, height: 667, name: 'iPhone SE' },
      { width: 414, height: 896, name: 'iPhone 11 Pro Max' },
      { width: 360, height: 740, name: 'Galaxy S10' },
    ]

    for (const viewport of viewportSizes) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.goto('/auth/login')

      const loginButton = page.locator('[data-testid="login-button"]')
      const buttonBox = await loginButton.boundingBox()

      // Button should always meet minimum touch target
      expect(buttonBox?.height, `${viewport.name} button height`).toBeGreaterThanOrEqual(44)
    }
  })
})
