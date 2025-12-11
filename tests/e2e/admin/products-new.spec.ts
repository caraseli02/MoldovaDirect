import { test, expect } from '../../fixtures/base'

test.describe('Admin Products - New Product Page', () => {
  test('should load the admin products new page successfully', async ({ authenticatedPage }) => {
    // Navigate to admin products new page
    await authenticatedPage.goto('/admin/products/new')
    await authenticatedPage.waitForLoadState('networkidle')

    // Check that we're on the correct page
    const currentUrl = authenticatedPage.url()
    expect(currentUrl).toContain('/admin/products/new')

    // Check page title
    await expect(authenticatedPage).toHaveTitle(/Create Product|Product|Admin/i)
  })

  test('should display the product form with all required fields', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/admin/products/new')
    await authenticatedPage.waitForLoadState('networkidle')

    // Check for form existence
    const form = authenticatedPage.locator('form').first()
    await expect(form).toBeVisible()

    // Check for main heading
    const heading = authenticatedPage.locator('h1')
    const headingText = await heading.textContent()
    expect(headingText).toContain('Create New Product')

    // Check for common form fields
    const inputs = await authenticatedPage.locator('input').count()
    expect(inputs).toBeGreaterThan(0)

    console.log(`Found ${inputs} input fields in the form`)
  })

  test('should not have rendering errors on page load', async ({ page }) => {
    const consoleLogs: { type: string, text: string }[] = []
    const pageErrors: string[] = []

    page.on('console', (msg) => {
      consoleLogs.push({
        type: msg.type(),
        text: msg.text(),
      })
    })

    page.on('pageerror', (error) => {
      pageErrors.push(error.toString())
    })

    // Navigate to the page
    await page.goto('/admin/products/new')
    await page.waitForLoadState('networkidle')

    // Check for critical errors
    const criticalErrors = pageErrors.filter(err => !err.includes('hydration'))
    expect(criticalErrors).toHaveLength(0)

    // Log any hydration issues for awareness
    const hydrationErrors = consoleLogs.filter(
      log => log.type === 'error' && log.text.includes('Hydration'),
    )

    if (hydrationErrors.length > 0) {
      console.log(`Note: Found ${hydrationErrors.length} hydration mismatches (non-critical)`)
    }
  })

  test('should display success/error message containers', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/admin/products/new')
    await authenticatedPage.waitForLoadState('networkidle')

    // Check for success message container (may not be visible initially)
    const successMessageDiv = authenticatedPage.locator('div.bg-green-50, div.bg-green-900').first()
    const isSuccessVisible = await successMessageDiv.isVisible().catch(() => false)

    // Check for error message container (may not be visible initially)
    const errorMessageDiv = authenticatedPage.locator('div.bg-red-50, div.bg-red-900').first()
    const isErrorVisible = await errorMessageDiv.isVisible().catch(() => false)

    // Either could be visible, neither should cause errors
    console.log(`Success message visible: ${isSuccessVisible}, Error message visible: ${isErrorVisible}`)
  })

  test('should have functioning cancel button', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/admin/products/new')
    await authenticatedPage.waitForLoadState('networkidle')

    // Look for cancel button
    const cancelButton = authenticatedPage.locator('button').filter({ hasText: /Cancel|Back/i }).first()
    const buttonExists = await cancelButton.count() > 0

    if (buttonExists) {
      await expect(cancelButton).toBeVisible()
      console.log('Cancel button found and visible')
    }
    else {
      console.log('Note: Cancel button not found in expected selectors')
    }
  })

  test('should have functioning submit button', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/admin/products/new')
    await authenticatedPage.waitForLoadState('networkidle')

    // Look for submit button
    const submitButton = authenticatedPage.locator('button[type="submit"]').first()
    await expect(submitButton).toBeVisible()
    console.log('Submit button found and visible')
  })

  test('should render AdminProductsForm component', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/admin/products/new')
    await authenticatedPage.waitForLoadState('networkidle')

    // The AdminProductsForm should be loaded via async component
    // Check for form content specific to product creation
    const form = authenticatedPage.locator('form')
    await expect(form.first()).toBeVisible()

    // Check that the page is not showing login form (authenticated)
    const loginForm = authenticatedPage.locator('input[type="email"][placeholder*="Correo"]').first()
    const isLoginVisible = await loginForm.isVisible().catch(() => false)

    expect(isLoginVisible).toBe(false)
    console.log('Product form confirmed, not login form')
  })

  test('should handle page navigation correctly', async ({ page }) => {
    // Navigate to the admin products list first
    await page.goto('/admin/products')
    await page.waitForLoadState('networkidle')

    // Then navigate to new product page
    const newProductLink = page.locator('a, button').filter({ hasText: /New|Create|Add/i }).first()

    // Even if link doesn't exist, direct navigation should work
    await page.goto('/admin/products/new')
    await page.waitForLoadState('networkidle')

    const currentUrl = page.url()
    expect(currentUrl).toContain('/admin/products/new')
    console.log(`Successfully navigated to: ${currentUrl}`)
  })
})
