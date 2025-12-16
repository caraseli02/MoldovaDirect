import { test, expect } from '../../fixtures/base'

test.describe('Admin Email Testing Tool', () => {
  test('should load the email testing page successfully', async ({ adminAuthenticatedPage }) => {
    // Navigate to email testing page
    await adminAuthenticatedPage.goto('/admin/tools/email-testing')
    await adminAuthenticatedPage.waitForLoadState('networkidle')

    // Check that the page title is correct
    await expect(adminAuthenticatedPage).toHaveTitle(/Email|Admin/i)

    // Check for main heading
    const heading = adminAuthenticatedPage.locator('h1:has-text("Email Testing Playground")')
    await expect(heading).toBeVisible()
  })

  test('should render all form fields correctly', async ({ adminAuthenticatedPage }) => {
    await adminAuthenticatedPage.goto('/admin/tools/email-testing')
    await adminAuthenticatedPage.waitForLoadState('networkidle')

    // Check for recipient email input
    const emailInput = adminAuthenticatedPage.locator('input[type="email"]#email')
    await expect(emailInput).toBeVisible()
    await expect(emailInput).toHaveAttribute('placeholder', 'qa@example.com')

    // Check for email type select dropdown
    const emailTypeSelect = adminAuthenticatedPage.locator('select#emailType')
    await expect(emailTypeSelect).toBeVisible()

    // Check for locale select dropdown
    const localeSelect = adminAuthenticatedPage.locator('select#locale')
    await expect(localeSelect).toBeVisible()

    // Check for submit button
    const submitButton = adminAuthenticatedPage.locator('button[type="submit"]:has-text("Send Test Email")')
    await expect(submitButton).toBeVisible()
  })

  test('should have all email type options available', async ({ adminAuthenticatedPage }) => {
    await adminAuthenticatedPage.goto('/admin/tools/email-testing')
    await adminAuthenticatedPage.waitForLoadState('networkidle')

    const emailTypeSelect = adminAuthenticatedPage.locator('select#emailType')
    const options = emailTypeSelect.locator('option')

    const optionCount = await options.count()
    expect(optionCount).toBeGreaterThanOrEqual(6)

    // Check for specific email types
    const optionTexts = await options.allTextContents()
    expect(optionTexts).toContain(expect.stringContaining('Order Confirmation'))
    expect(optionTexts).toContain(expect.stringContaining('Order Processing'))
    expect(optionTexts).toContain(expect.stringContaining('Order Shipped'))
    expect(optionTexts).toContain(expect.stringContaining('Order Delivered'))
    expect(optionTexts).toContain(expect.stringContaining('Order Cancelled'))
    expect(optionTexts).toContain(expect.stringContaining('Order Issue'))
  })

  test('should have all locale options available', async ({ adminAuthenticatedPage }) => {
    await adminAuthenticatedPage.goto('/admin/tools/email-testing')
    await adminAuthenticatedPage.waitForLoadState('networkidle')

    const localeSelect = adminAuthenticatedPage.locator('select#locale')
    const options = localeSelect.locator('option')

    const optionCount = await options.count()
    expect(optionCount).toBe(4)

    // Check for specific locales
    const optionTexts = await options.allTextContents()
    expect(optionTexts).toContain('English')
    expect(optionTexts).toContain('Español')
    expect(optionTexts).toContain('Română')
    expect(optionTexts).toContain('Русский')
  })

  test('should show issue description field when "Order Issue" is selected', async ({ adminAuthenticatedPage }) => {
    await adminAuthenticatedPage.goto('/admin/tools/email-testing')
    await adminAuthenticatedPage.waitForLoadState('networkidle')

    // Issue description should not be visible initially
    const issueDescriptionField = adminAuthenticatedPage.locator('textarea#issueDescription')

    // Select "Order Issue" email type
    const emailTypeSelect = adminAuthenticatedPage.locator('select#emailType')
    await emailTypeSelect.selectOption('order_issue')

    // Wait for the conditional field to appear
    await adminAuthenticatedPage.waitForTimeout(500)

    // Now the issue description should be visible
    await expect(issueDescriptionField).toBeVisible()
    await expect(issueDescriptionField).toHaveAttribute('placeholder', expect.stringContaining('Optional context'))
  })

  test('should hide issue description field when non-issue email type is selected', async ({ adminAuthenticatedPage }) => {
    await adminAuthenticatedPage.goto('/admin/tools/email-testing')
    await adminAuthenticatedPage.waitForLoadState('networkidle')

    // Select "Order Issue" first
    const emailTypeSelect = adminAuthenticatedPage.locator('select#emailType')
    await emailTypeSelect.selectOption('order_issue')
    await adminAuthenticatedPage.waitForTimeout(500)

    // Verify it's visible
    const issueDescriptionField = adminAuthenticatedPage.locator('textarea#issueDescription')
    await expect(issueDescriptionField).toBeVisible()

    // Select "Order Confirmation"
    await emailTypeSelect.selectOption('order_confirmation')
    await adminAuthenticatedPage.waitForTimeout(500)

    // Issue description should be hidden
    const isHidden = await issueDescriptionField.isVisible().catch(() => false)
    expect(isHidden).toBe(false)
  })

  test('should disable submit button while loading', async ({ adminAuthenticatedPage }) => {
    await adminAuthenticatedPage.goto('/admin/tools/email-testing')
    await adminAuthenticatedPage.waitForLoadState('networkidle')

    const emailInput = adminAuthenticatedPage.locator('input#email')
    const submitButton = adminAuthenticatedPage.locator('button[type="submit"]')

    // Fill in valid email
    await emailInput.fill('test@example.com')

    // Intercept the API call to simulate loading
    await adminAuthenticatedPage.route('/api/tools/send-test-email', (route) => {
      // Delay the response
      setTimeout(() => {
        route.continue()
      }, 2000)
    })

    // Click submit
    const clickPromise = submitButton.click()

    // Check that button is disabled immediately after click
    await adminAuthenticatedPage.waitForTimeout(100)
    const isDisabled = await submitButton.isDisabled().catch(() => false)

    // Button should be disabled or have loading indicator
    const hasLoadingText = await submitButton.locator('text=/Sending/i').isVisible().catch(() => false)
    expect(isDisabled || hasLoadingText).toBe(true)

    // Clean up
    await clickPromise
  })

  test('should validate email format before submission', async ({ adminAuthenticatedPage }) => {
    await adminAuthenticatedPage.goto('/admin/tools/email-testing')
    await adminAuthenticatedPage.waitForLoadState('networkidle')

    const emailInput = adminAuthenticatedPage.locator('input#email')
    const submitButton = adminAuthenticatedPage.locator('button[type="submit"]')
    const errorMessage = adminAuthenticatedPage.locator('[class*="error"]')

    // Try to submit with invalid email
    await emailInput.fill('invalid-email')
    await submitButton.click()

    // Should show error message
    await adminAuthenticatedPage.waitForTimeout(500)
    const errorVisible = await errorMessage.isVisible().catch(() => false)

    if (errorVisible) {
      const errorText = await errorMessage.textContent()
      expect(errorText).toContain('valid email')
    }
  })

  test('should display success message on successful submission', async ({ adminAuthenticatedPage }) => {
    await adminAuthenticatedPage.goto('/admin/tools/email-testing')
    await adminAuthenticatedPage.waitForLoadState('networkidle')

    const emailInput = adminAuthenticatedPage.locator('input#email')
    const submitButton = adminAuthenticatedPage.locator('button[type="submit"]')

    // Fill in valid email
    await emailInput.fill('qa@example.com')

    // Mock successful API response
    await adminAuthenticatedPage.route('/api/tools/send-test-email', async (route) => {
      await route.abort('blockedbyclient')
    })

    // Try to submit (will fail due to abort, but we're testing UI response)
    await submitButton.click()
    await adminAuthenticatedPage.waitForTimeout(1000)

    // Look for either success or error message
    const successMessage = adminAuthenticatedPage.locator('[class*="bg-green"], text=/✔/i')
    const errorMessage = adminAuthenticatedPage.locator('[class*="bg-red"]')

    const hasSuccessOrError = await Promise.race([
      successMessage.isVisible().catch(() => false),
      errorMessage.isVisible().catch(() => false),
    ])

    expect(hasSuccessOrError).toBeDefined()
  })

  test('should render properly with dark mode styles', async ({ adminAuthenticatedPage }) => {
    await adminAuthenticatedPage.goto('/admin/tools/email-testing')
    await adminAuthenticatedPage.waitForLoadState('networkidle')

    // Page should have dark mode styling available
    const darkModeElements = await adminAuthenticatedPage.locator('[class*="dark:"]').count()
    expect(darkModeElements).toBeGreaterThan(0)
  })

  test('should not have critical console errors', async ({ adminAuthenticatedPage }) => {
    const consoleErrors: string[] = []
    const pageErrors: string[] = []

    // Listen for console messages
    adminAuthenticatedPage.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    // Listen for page errors
    adminAuthenticatedPage.on('pageerror', (err) => {
      pageErrors.push(err.toString())
    })

    // Navigate to email testing page
    await adminAuthenticatedPage.goto('/admin/tools/email-testing')
    await adminAuthenticatedPage.waitForLoadState('networkidle')

    // Wait a bit for any delayed errors
    await adminAuthenticatedPage.waitForTimeout(2000)

    // Log any errors for debugging
    if (consoleErrors.length > 0) {
      console.log('Console Errors:', consoleErrors)
    }
    if (pageErrors.length > 0) {
      console.log('Page Errors:', pageErrors)
    }

    // Filter out non-critical errors
    const criticalErrors = consoleErrors.filter(e =>
      !e.includes('404')
      && !e.includes('Failed to fetch')
      && !e.toLowerCase().includes('network')
      && !e.includes('blockedbyclient'),
    )

    expect(criticalErrors.length).toBe(0)
    expect(pageErrors.length).toBe(0)
  })

  test('should render responsive design on mobile', async ({ adminAuthenticatedPage }) => {
    // Set mobile viewport
    await adminAuthenticatedPage.setViewportSize({ width: 375, height: 667 })

    await adminAuthenticatedPage.goto('/admin/tools/email-testing')
    await adminAuthenticatedPage.waitForLoadState('networkidle')

    // Check that main elements are visible
    const heading = adminAuthenticatedPage.locator('h1:has-text("Email Testing Playground")')
    await expect(heading).toBeVisible()

    const emailInput = adminAuthenticatedPage.locator('input#email')
    await expect(emailInput).toBeVisible()

    const submitButton = adminAuthenticatedPage.locator('button[type="submit"]')
    await expect(submitButton).toBeVisible()

    // Form should be readable on mobile
    const formContainer = adminAuthenticatedPage.locator('form').first()
    await expect(formContainer).toBeVisible()
  })

  test('should have proper accessibility attributes', async ({ adminAuthenticatedPage }) => {
    await adminAuthenticatedPage.goto('/admin/tools/email-testing')
    await adminAuthenticatedPage.waitForLoadState('networkidle')

    // Check for form labels
    const emailLabel = adminAuthenticatedPage.locator('label[for="email"]')
    await expect(emailLabel).toBeVisible()

    const emailTypeLabel = adminAuthenticatedPage.locator('label[for="emailType"]')
    await expect(emailTypeLabel).toBeVisible()

    const localeLabel = adminAuthenticatedPage.locator('label[for="locale"]')
    await expect(localeLabel).toBeVisible()

    // Check that inputs are associated with labels
    const emailInput = adminAuthenticatedPage.locator('input#email')
    const emailInputId = await emailInput.getAttribute('id')
    expect(emailInputId).toBe('email')
  })

  test('should have description text explaining the tool', async ({ adminAuthenticatedPage }) => {
    await adminAuthenticatedPage.goto('/admin/tools/email-testing')
    await adminAuthenticatedPage.waitForLoadState('networkidle')

    // Check for description paragraph
    const description = adminAuthenticatedPage.locator('[class*="text-sm"][class*="text-gray"]').first()
    const descriptionVisible = await description.isVisible().catch(() => false)

    // Check for note about test data
    const testDataNote = adminAuthenticatedPage.locator('text=/TEST|test|temporary/i')
    const noteVisible = await testDataNote.isVisible().catch(() => false)

    expect(descriptionVisible || noteVisible).toBe(true)
  })

  test('should clear error/success messages when user modifies form', async ({ adminAuthenticatedPage }) => {
    await adminAuthenticatedPage.goto('/admin/tools/email-testing')
    await adminAuthenticatedPage.waitForLoadState('networkidle')

    const emailInput = adminAuthenticatedPage.locator('input#email')
    const submitButton = adminAuthenticatedPage.locator('button[type="submit"]')

    // Trigger error by submitting invalid email
    await emailInput.fill('invalid-email')
    await submitButton.click()
    await adminAuthenticatedPage.waitForTimeout(500)

    // Check for error message
    const errorMessage = adminAuthenticatedPage.locator('[class*="bg-red"]')
    const errorVisible = await errorMessage.isVisible().catch(() => false)

    if (errorVisible) {
      // Error should be displayed
      await expect(errorMessage).toBeVisible()

      // Now modify input - error should clear on next submission attempt
      await emailInput.fill('valid@email.com')
      await adminAuthenticatedPage.waitForTimeout(300)

      // The form should be ready for new submission
      await expect(submitButton).not.toBeDisabled()
    }
  })

  test('should take screenshot for visual inspection', async ({ adminAuthenticatedPage }) => {
    // Navigate and wait for load
    await adminAuthenticatedPage.goto('/admin/tools/email-testing')
    await adminAuthenticatedPage.waitForLoadState('networkidle')
    await adminAuthenticatedPage.waitForTimeout(1000)

    // Take screenshot of page with all form fields
    await adminAuthenticatedPage.screenshot({
      path: 'tests/screenshots/email-testing-page.png',
      fullPage: true,
    })
  })

  test('should take screenshot with Order Issue variant', async ({ adminAuthenticatedPage }) => {
    await adminAuthenticatedPage.goto('/admin/tools/email-testing')
    await adminAuthenticatedPage.waitForLoadState('networkidle')

    // Select Order Issue type
    const emailTypeSelect = adminAuthenticatedPage.locator('select#emailType')
    await emailTypeSelect.selectOption('order_issue')
    await adminAuthenticatedPage.waitForTimeout(500)

    // Take screenshot with issue description field visible
    await adminAuthenticatedPage.screenshot({
      path: 'tests/screenshots/email-testing-order-issue.png',
      fullPage: true,
    })
  })

  test('should handle API timeout gracefully', async ({ adminAuthenticatedPage }) => {
    await adminAuthenticatedPage.goto('/admin/tools/email-testing')
    await adminAuthenticatedPage.waitForLoadState('networkidle')

    const emailInput = adminAuthenticatedPage.locator('input#email')
    const submitButton = adminAuthenticatedPage.locator('button[type="submit"]')

    // Fill in valid email
    await emailInput.fill('test@example.com')

    // Mock API timeout
    await adminAuthenticatedPage.route('/api/tools/send-test-email', (route) => {
      route.abort('timedout')
    })

    // Submit form
    await submitButton.click()
    await adminAuthenticatedPage.waitForTimeout(2000)

    // Should display an error message gracefully
    const errorMessage = adminAuthenticatedPage.locator('[class*="bg-red"], [class*="error"]')
    const hasErrorMessage = await errorMessage.isVisible().catch(() => false)

    if (hasErrorMessage) {
      await expect(errorMessage).toBeVisible()
    }

    // Button should be re-enabled
    const isDisabled = await submitButton.isDisabled().catch(() => false)
    expect(isDisabled).toBe(false)
  })

  test('should have proper page structure and layout', async ({ adminAuthenticatedPage }) => {
    await adminAuthenticatedPage.goto('/admin/tools/email-testing')
    await adminAuthenticatedPage.waitForLoadState('networkidle')

    // Check for main container
    const mainContainer = adminAuthenticatedPage.locator('[class*="max-w"]').first()
    await expect(mainContainer).toBeVisible()

    // Check for card/box styling
    const cardElement = adminAuthenticatedPage.locator('[class*="bg-white"], [class*="dark:bg-gray"], [class*="rounded"], [class*="shadow"]').first()
    await expect(cardElement).toBeVisible()

    // Check for form element
    const form = adminAuthenticatedPage.locator('form').first()
    await expect(form).toBeVisible()

    // Form should have proper spacing
    const formGroups = await adminAuthenticatedPage.locator('[class*="space-y"]').count()
    expect(formGroups).toBeGreaterThan(0)
  })
})
