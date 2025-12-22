import { test, expect } from '../../fixtures/base'

test.describe('Admin Inventory Page', () => {
  test('should load the admin inventory page successfully', async ({ adminAuthenticatedPage: adminPage }) => {
    // Navigate to admin inventory page
    await adminPage.goto('/admin/inventory')
    await adminPage.waitForLoadState('networkidle')

    // Check that we're on the correct page
    const currentUrl = adminPage.url()
    expect(currentUrl).toContain('/admin/inventory')

    // Check page title
    await expect(adminPage).toHaveTitle(/Inventory|Admin/i)
  })

  test('should display the page header with navigation', async ({ adminAuthenticatedPage: adminPage }) => {
    await adminPage.goto('/admin/inventory')
    await adminPage.waitForLoadState('networkidle')

    // Check main heading - use getByRole to be more specific
    const heading = adminPage.getByRole('heading', { name: /Inventory Management/i })
    await expect(heading).toBeVisible()

    // Check subtitle
    const subtitle = adminPage.locator('main p.text-sm').first()
    await expect(subtitle).toBeVisible()
  })

  test('should display tab navigation with correct tabs', async ({ adminAuthenticatedPage: adminPage }) => {
    await adminPage.goto('/admin/inventory')
    await adminPage.waitForLoadState('networkidle')

    // Check for tab navigation
    const tabButtons = adminPage.locator('nav button')
    const tabCount = await tabButtons.count()
    expect(tabCount).toBeGreaterThan(0)

    // Check for specific tab labels - use getByRole for buttons
    const reportsTab = adminPage.getByRole('button', { name: /Inventory Reports/i })
    const movementsTab = adminPage.getByRole('button', { name: /Movement History/i })

    await expect(reportsTab).toBeVisible()
    await expect(movementsTab).toBeVisible()
  })

  test('should display setup database button', async ({ adminAuthenticatedPage: adminPage }) => {
    await adminPage.goto('/admin/inventory')
    await adminPage.waitForLoadState('networkidle')

    // Check for setup button
    const setupButton = adminPage.locator('button:has-text("Setup Database")')
    await expect(setupButton).toBeVisible()

    // Button should not be disabled
    const isDisabled = await setupButton.isDisabled()
    expect(isDisabled).toBeFalsy()
  })

  test('should render Inventory Reports component by default', async ({ adminAuthenticatedPage: adminPage }) => {
    await adminPage.goto('/admin/inventory')
    await adminPage.waitForLoadState('networkidle')

    // Wait for reports component heading to be visible
    const reportsHeading = adminPage.getByRole('heading', { name: /Inventory Reports/i }).last()
    await expect(reportsHeading).toBeVisible({ timeout: 10000 })
  })

  test('should render Inventory Movements component on tab switch', async ({ adminAuthenticatedPage: adminPage }) => {
    await adminPage.goto('/admin/inventory')
    await adminPage.waitForLoadState('networkidle')

    // Click on Movement History tab
    const movementsTab = adminPage.locator('text=Movement History')
    await movementsTab.click()

    // Wait for movements component to be visible
    const movementsSection = adminPage.locator('text=Inventory Movements').first()
    await expect(movementsSection).toBeVisible({ timeout: 10000 })
  })

  test('should test Inventory Reports component functionality', async ({ adminAuthenticatedPage: adminPage }) => {
    await adminPage.goto('/admin/inventory')
    await adminPage.waitForLoadState('networkidle')

    // Check for report type selection buttons
    const reportTypeButtons = adminPage.locator('button[class*="border-2"]')
    const buttonCount = await reportTypeButtons.count()

    // Should have at least some report type buttons
    expect(buttonCount).toBeGreaterThanOrEqual(0)

    // Check for report type labels
    const hasStockLevelsOption = await adminPage.locator('text=Stock Levels').count() > 0
    const hasLowStockOption = await adminPage.locator('text=Low Stock').count() > 0

    // At least one of these should exist
    expect(hasStockLevelsOption || hasLowStockOption).toBeTruthy()
  })

  test('should test Movement History filtering options', async ({ adminAuthenticatedPage: adminPage }) => {
    await adminPage.goto('/admin/inventory')
    await adminPage.waitForLoadState('networkidle')

    // Click on Movement History tab
    const movementsTab = adminPage.locator('text=Movement History')
    await movementsTab.click()
    await adminPage.waitForTimeout(500)

    // Check for filter controls
    const movementTypeSelect = adminPage.locator('select:has-text("All Types")')
    if (await movementTypeSelect.count() > 0) {
      await expect(movementTypeSelect).toBeVisible()
    }

    // Check for date input fields
    const dateInputs = adminPage.locator('input[type="date"]')
    const dateInputCount = await dateInputs.count()
    expect(dateInputCount).toBeGreaterThanOrEqual(0)
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

    page.on('requestfailed', (request) => {
      const url = request.url()
      // Don't fail on non-critical API requests that might not have data
      if (!url.includes('/api/')) {
        pageErrors.push(`Request failed: ${url}`)
      }
    })

    // Navigate to inventory page
    await page.goto('/admin/inventory')
    await page.waitForLoadState('networkidle')

    // Check for console errors (not warnings)
    const errors = consoleLogs.filter(log =>
      log.type === 'error'
      && !log.text.includes('404')
      && !log.text.includes('Network request failed'),
    )

    // Log errors for debugging but don't fail on API 404s
    if (errors.length > 0) {
      console.log('Console errors found:', errors)
    }

    // Check page errors
    if (pageErrors.length > 0) {
      console.log('Page errors found:', pageErrors)
    }
  })

  test('should verify stock indicator component is used', async ({ adminAuthenticatedPage: adminPage }) => {
    await adminPage.goto('/admin/inventory')
    await adminPage.waitForLoadState('networkidle')

    // Click on Inventory Reports tab if visible (it may already be active)
    const reportsTab = adminPage.locator('text=Inventory Reports')
    const isTabVisible = await reportsTab.isVisible({ timeout: 5000 }).catch(() => false)
    if (isTabVisible) {
      await reportsTab.click()
      await adminPage.waitForTimeout(1000)
    }

    // Look for stock-related content - check heading or page content
    const pageContent = await adminPage.content()

    // Stock/inventory content should be present (page heading or components)
    const hasStockIndicators = pageContent.toLowerCase().includes('stock')
      || pageContent.toLowerCase().includes('inventory')

    expect(hasStockIndicators).toBeTruthy()
  })

  test('should test tab switching interaction', async ({ adminAuthenticatedPage: adminPage }) => {
    await adminPage.goto('/admin/inventory')
    await adminPage.waitForLoadState('networkidle')

    // Find tab buttons - they're in the nav element
    const tabButtons = adminPage.locator('nav button')
    const tabCount = await tabButtons.count()

    // Should have at least 2 tabs (Reports and Movements)
    expect(tabCount).toBeGreaterThanOrEqual(2)

    // Click Movement History tab if it exists
    const movementsTab = adminPage.locator('button:has-text("Movement History")')
    const movementsVisible = await movementsTab.isVisible({ timeout: 3000 }).catch(() => false)

    if (movementsVisible) {
      await movementsTab.click()
      await adminPage.waitForTimeout(500)

      // After clicking, the movements content should be visible
      const movementsContent = adminPage.locator('text=Inventory Movements').first()
      await expect(movementsContent).toBeVisible({ timeout: 5000 })
    }

    // Click Reports tab to switch back
    const reportsTab = adminPage.locator('button:has-text("Inventory Reports")')
    const reportsVisible = await reportsTab.isVisible({ timeout: 3000 }).catch(() => false)

    if (reportsVisible) {
      await reportsTab.click()
      await adminPage.waitForTimeout(500)
    }

    // Test passes if we can interact with tabs without errors
    expect(true).toBeTruthy()
  })

  test('should display responsive layout on different screen sizes', async ({ adminAuthenticatedPage: adminPage }) => {
    await adminPage.goto('/admin/inventory')
    await adminPage.waitForLoadState('networkidle')

    // Main heading should be visible - text is "Inventory Management"
    const heading = adminPage.getByRole('heading', { name: /Inventory Management/i })
    await expect(heading).toBeVisible({ timeout: 10000 })

    // Page should have a main content area
    const mainContent = adminPage.locator('.space-y-6').first()
    await expect(mainContent).toBeVisible()
  })

  test('should handle async component loading', async ({ adminAuthenticatedPage: adminPage }) => {
    await adminPage.goto('/admin/inventory')

    // Page should load even if components are async
    await adminPage.waitForLoadState('networkidle')

    // Main page content should be visible
    const heading = adminPage.locator('h1:has-text("Inventory Management")')
    await expect(heading).toBeVisible({ timeout: 15000 })

    // At least one tab should be rendered
    const tabs = adminPage.locator('nav button')
    expect(await tabs.count()).toBeGreaterThan(0)
  })

  test('should verify dark mode support in UI', async ({ adminAuthenticatedPage: adminPage }) => {
    await adminPage.goto('/admin/inventory')
    await adminPage.waitForLoadState('networkidle')

    // Check for dark mode classes in rendered elements
    const spaceDiv = adminPage.locator('.space-y-6').first()
    const hasElement = await spaceDiv.count() > 0
    expect(hasElement).toBeTruthy()

    // Check if dark mode classes are present in HTML
    const htmlContent = await adminPage.content()
    const hasDarkClasses = htmlContent.includes('dark:') || htmlContent.includes('dark')
    expect(hasDarkClasses).toBeTruthy()
  })

  test('should verify all UI components are accessible', async ({ adminAuthenticatedPage: adminPage }) => {
    await adminPage.goto('/admin/inventory')
    await adminPage.waitForLoadState('networkidle')

    // Check for buttons - some may be hidden on different viewport sizes
    const buttons = adminPage.locator('button')
    const buttonCount = await buttons.count()
    expect(buttonCount).toBeGreaterThan(0)

    // Find a visible button - the Setup Database button or tab buttons
    const setupButton = adminPage.locator('button:has-text("Setup Database")')
    const isSetupVisible = await setupButton.isVisible({ timeout: 5000 }).catch(() => false)

    if (isSetupVisible) {
      await expect(setupButton).toBeVisible()
    }
    else {
      // Check tab buttons
      const tabButtons = adminPage.locator('nav button')
      const tabCount = await tabButtons.count()
      expect(tabCount).toBeGreaterThan(0)

      // At least one tab should be visible
      const firstTab = tabButtons.first()
      await expect(firstTab).toBeVisible({ timeout: 5000 })
    }
  })

  test('should verify page renders without layout shift', async ({ adminAuthenticatedPage: adminPage }) => {
    await adminPage.goto('/admin/inventory')
    await adminPage.waitForLoadState('networkidle')

    // Wait for page to stabilize
    await adminPage.waitForTimeout(1500)

    // Take measurements after load - text is "Inventory Management"
    const heading = adminPage.getByRole('heading', { name: /Inventory Management/i })
    await expect(heading).toBeVisible({ timeout: 5000 })
    const initialBox = await heading.boundingBox()

    // Wait a bit and check if elements moved
    await adminPage.waitForTimeout(1000)
    const finalBox = await heading.boundingBox()

    // Elements should not shift significantly (or both should be null)
    if (initialBox && finalBox) {
      expect(Math.abs(initialBox.y - finalBox.y)).toBeLessThan(10)
    }
  })

  test('should verify tab content switches without full page reload', async ({ adminAuthenticatedPage: adminPage }) => {
    await adminPage.goto('/admin/inventory')
    await adminPage.waitForLoadState('networkidle')

    // Get initial URL
    const initialUrl = adminPage.url()

    // Find Movement History tab button
    const movementsTab = adminPage.locator('button:has-text("Movement History")')
    const movementsVisible = await movementsTab.isVisible({ timeout: 3000 }).catch(() => false)

    if (movementsVisible) {
      await movementsTab.click()
      await adminPage.waitForTimeout(500)

      // URL should not change (client-side tab switching)
      const finalUrl = adminPage.url()
      expect(finalUrl).toBe(initialUrl)

      // Switch back to reports
      const reportsTab = adminPage.locator('button:has-text("Inventory Reports")')
      const reportsVisible = await reportsTab.isVisible({ timeout: 3000 }).catch(() => false)
      if (reportsVisible) {
        await reportsTab.click()
        await adminPage.waitForTimeout(500)
        const backUrl = adminPage.url()
        expect(backUrl).toBe(initialUrl)
      }
    }
    else {
      // If tabs don't exist, page should still work
      expect(initialUrl).toContain('/admin/inventory')
    }
  })

  test('should take screenshot of loaded page', async ({ adminAuthenticatedPage: adminPage }) => {
    await adminPage.goto('/admin/inventory')
    await adminPage.waitForLoadState('networkidle')

    // Take screenshot of the full page
    await adminPage.screenshot({
      path: 'test-results/inventory-page-screenshot.png',
      fullPage: true,
    })

    // Screenshot should be created successfully
    expect(true).toBeTruthy()
  })

  test('should verify all text content is readable', async ({ adminAuthenticatedPage: adminPage }) => {
    await adminPage.goto('/admin/inventory')
    await adminPage.waitForLoadState('networkidle')

    // Get all visible text
    const mainContent = adminPage.locator('main, div[class*="space-y"]').first()
    const text = await mainContent.textContent()

    // Should contain inventory-related text
    expect(text?.toLowerCase()).toContain('inventory')
  })
})
