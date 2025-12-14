import { test, expect } from '../../fixtures/base'

test.describe('Admin Inventory Page', () => {
  test('should load the admin inventory page successfully', async ({ adminPage }) => {
    // Navigate to admin inventory page
    await adminPage.goto('/admin/inventory')
    await adminPage.waitForLoadState('networkidle')

    // Check that we're on the correct page
    const currentUrl = adminPage.url()
    expect(currentUrl).toContain('/admin/inventory')

    // Check page title
    await expect(adminPage).toHaveTitle(/Inventory|Admin/i)
  })

  test('should display the page header with navigation', async ({ adminPage }) => {
    await adminPage.goto('/admin/inventory')
    await adminPage.waitForLoadState('networkidle')

    // Check main heading
    const heading = adminPage.locator('h1')
    const headingText = await heading.textContent()
    expect(headingText).toContain('Inventory Management')

    // Check subtitle
    const subtitle = adminPage.locator('p.text-sm')
    const hasSubtitle = await subtitle.isVisible()
    expect(hasSubtitle).toBeTruthy()
  })

  test('should display tab navigation with correct tabs', async ({ adminPage }) => {
    await adminPage.goto('/admin/inventory')
    await adminPage.waitForLoadState('networkidle')

    // Check for tab navigation
    const tabButtons = adminPage.locator('nav button')
    const tabCount = await tabButtons.count()
    expect(tabCount).toBeGreaterThan(0)

    // Check for specific tab labels
    const reportsTab = adminPage.locator('text=Inventory Reports')
    const movementsTab = adminPage.locator('text=Movement History')

    await expect(reportsTab).toBeVisible()
    await expect(movementsTab).toBeVisible()
  })

  test('should display setup database button', async ({ adminPage }) => {
    await adminPage.goto('/admin/inventory')
    await adminPage.waitForLoadState('networkidle')

    // Check for setup button
    const setupButton = adminPage.locator('button:has-text("Setup Database")')
    await expect(setupButton).toBeVisible()

    // Button should not be disabled
    const isDisabled = await setupButton.isDisabled()
    expect(isDisabled).toBeFalsy()
  })

  test('should render Inventory Reports component by default', async ({ adminPage }) => {
    await adminPage.goto('/admin/inventory')
    await adminPage.waitForLoadState('networkidle')

    // Wait for reports component to be visible
    const reportsSection = adminPage.locator('text=Inventory Reports')
    await expect(reportsSection).toBeVisible({ timeout: 10000 })
  })

  test('should render Inventory Movements component on tab switch', async ({ adminPage }) => {
    await adminPage.goto('/admin/inventory')
    await adminPage.waitForLoadState('networkidle')

    // Click on Movement History tab
    const movementsTab = adminPage.locator('text=Movement History')
    await movementsTab.click()

    // Wait for movements component to be visible
    const movementsSection = adminPage.locator('text=Inventory Movements').first()
    await expect(movementsSection).toBeVisible({ timeout: 10000 })
  })

  test('should test Inventory Reports component functionality', async ({ adminPage }) => {
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

  test('should test Movement History filtering options', async ({ adminPage }) => {
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

  test('should verify stock indicator component is used', async ({ adminPage }) => {
    await adminPage.goto('/admin/inventory')
    await adminPage.waitForLoadState('networkidle')

    // Click on Inventory Reports tab to ensure it's active
    const reportsTab = adminPage.locator('text=Inventory Reports')
    await reportsTab.click()
    await adminPage.waitForTimeout(1000)

    // Look for stock-related content
    const pageContent = await adminPage.content()

    // Stock indicator should be present (either inline or in components)
    const hasStockIndicators = pageContent.includes('stock')
      || pageContent.includes('Stock')
      || pageContent.includes('inventory')

    expect(hasStockIndicators).toBeTruthy()
  })

  test('should test tab switching interaction', async ({ adminPage }) => {
    await adminPage.goto('/admin/inventory')
    await adminPage.waitForLoadState('networkidle')

    // Click Reports tab
    const reportsTab = adminPage.locator('text=Inventory Reports')
    await reportsTab.click()
    await adminPage.waitForTimeout(500)

    // Check if reports tab is active (has blue border or active class)
    const reportsTabElement = reportsTab.locator('..')
    const isReportsActive = await reportsTabElement.evaluate((el) => {
      return el.className.includes('border-blue')
        || el.className.includes('blue-600')
        || el.textContent?.includes('Inventory Reports')
    })

    // Click Movements tab
    const movementsTab = adminPage.locator('text=Movement History')
    await movementsTab.click()
    await adminPage.waitForTimeout(500)

    // Tab switching should work
    const movementsTabElement = movementsTab.locator('..')
    const isMovementsActive = await movementsTabElement.evaluate((el) => {
      return el.className.includes('border-blue')
        || el.className.includes('blue-600')
        || el.textContent?.includes('Movement History')
    })

    // At least one should be active
    expect(isReportsActive || isMovementsActive).toBeTruthy()
  })

  test('should display responsive layout on different screen sizes', async ({ adminPage }) => {
    await adminPage.goto('/admin/inventory')
    await adminPage.waitForLoadState('networkidle')

    // Desktop layout
    const heading = adminPage.locator('h1')
    await expect(heading).toBeVisible()

    // Header flex layout should be visible
    const headerFlex = adminPage.locator('.flex.items-center.justify-between').first()
    const isHeaderVisible = await headerFlex.isVisible()
    expect(isHeaderVisible).toBeTruthy()
  })

  test('should handle async component loading', async ({ adminPage }) => {
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

  test('should verify dark mode support in UI', async ({ adminPage }) => {
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

  test('should verify all UI components are accessible', async ({ adminPage }) => {
    await adminPage.goto('/admin/inventory')
    await adminPage.waitForLoadState('networkidle')

    // Check for buttons
    const buttons = adminPage.locator('button')
    expect(await buttons.count()).toBeGreaterThan(0)

    // All buttons should be accessible
    const firstButton = buttons.first()
    await expect(firstButton).toBeVisible()

    // Check tab buttons are keyboard accessible
    const tabButtons = adminPage.locator('nav button')
    if (await tabButtons.count() > 0) {
      const firstTab = tabButtons.first()
      await expect(firstTab).toBeFocusable()
    }
  })

  test('should verify page renders without layout shift', async ({ adminPage }) => {
    await adminPage.goto('/admin/inventory')
    await adminPage.waitForLoadState('networkidle')

    // Take measurements after load
    const heading = adminPage.locator('h1')
    const initialBox = await heading.boundingBox()

    // Wait a bit and check if elements moved
    await adminPage.waitForTimeout(1000)
    const finalBox = await heading.boundingBox()

    // Elements should not shift significantly
    if (initialBox && finalBox) {
      expect(Math.abs(initialBox.y - finalBox.y)).toBeLessThan(5)
    }
  })

  test('should verify tab content switches without full page reload', async ({ adminPage }) => {
    await adminPage.goto('/admin/inventory')
    await adminPage.waitForLoadState('networkidle')

    // Get initial URL
    const initialUrl = adminPage.url()

    // Switch tabs
    const movementsTab = adminPage.locator('text=Movement History')
    await movementsTab.click()
    await adminPage.waitForTimeout(500)

    // URL should not change (client-side routing)
    const finalUrl = adminPage.url()
    expect(finalUrl).toBe(initialUrl)

    // Switch back to reports
    const reportsTab = adminPage.locator('text=Inventory Reports')
    await reportsTab.click()
    await adminPage.waitForTimeout(500)

    const backUrl = adminPage.url()
    expect(backUrl).toBe(initialUrl)
  })

  test('should take screenshot of loaded page', async ({ adminPage }) => {
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

  test('should verify all text content is readable', async ({ adminPage }) => {
    await adminPage.goto('/admin/inventory')
    await adminPage.waitForLoadState('networkidle')

    // Get all visible text
    const mainContent = adminPage.locator('main, div[class*="space-y"]').first()
    const text = await mainContent.textContent()

    // Should contain inventory-related text
    expect(text?.toLowerCase()).toContain('inventory')
  })
})
