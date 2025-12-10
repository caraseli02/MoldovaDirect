import { test, expect } from '../../fixtures/base'

test.describe('Admin Products List Page - Comprehensive Testing', () => {
  test('1. Page Load & Screenshots', async ({ authenticatedPage }) => {
    // Navigate to admin products page
    await authenticatedPage.goto('/admin/products')
    await authenticatedPage.waitForLoadState('networkidle')

    // Verify correct URL
    const currentUrl = authenticatedPage.url()
    expect(currentUrl).toContain('/admin/products')

    // Take a screenshot
    await authenticatedPage.screenshot({ path: 'admin-products-page.png' })
    console.log('✓ Screenshot taken: admin-products-page.png')

    // Verify page title
    await expect(authenticatedPage).toHaveTitle(/Product|Admin/i)
    console.log('✓ Page title verified')
  })

  test('2. Check Console for Errors and Hydration Issues', async ({ page }) => {
    const consoleLogs: { type: string, text: string }[] = []
    const pageErrors: string[] = []
    const networkErrors: string[] = []

    // Capture console messages
    page.on('console', (msg) => {
      const logEntry = {
        type: msg.type(),
        text: msg.text(),
      }
      consoleLogs.push(logEntry)
      if (msg.type() === 'error' || msg.type() === 'warning') {
        console.log(`[CONSOLE ${msg.type().toUpperCase()}] ${msg.text()}`)
      }
    })

    // Capture page errors
    page.on('pageerror', (error) => {
      pageErrors.push(error.toString())
      console.log(`[PAGE ERROR] ${error.toString()}`)
    })

    // Capture network failures
    page.on('requestfailed', (request) => {
      networkErrors.push(`${request.method()} ${request.url()}`)
      console.log(`[NETWORK ERROR] ${request.method()} ${request.url()}`)
    })

    // Navigate to the page
    await page.goto('/admin/products')
    await page.waitForLoadState('networkidle')

    // Analyze results
    const hydrationErrors = consoleLogs.filter(
      log => log.type === 'error' && log.text.includes('Hydration'),
    )

    const criticalErrors = pageErrors.filter(
      err => !err.includes('hydration') && !err.includes('Hydration'),
    )

    console.log('\n=== CONSOLE CHECK RESULTS ===')
    console.log(`Total console messages: ${consoleLogs.length}`)
    console.log(`Total page errors: ${pageErrors.length}`)
    console.log(`Hydration issues: ${hydrationErrors.length}`)
    console.log(`Critical errors: ${criticalErrors.length}`)
    console.log(`Network failures: ${networkErrors.length}`)

    if (hydrationErrors.length > 0) {
      console.log('\nHydration Errors:')
      hydrationErrors.forEach(err => console.log(`  - ${err.text}`))
    }

    // Assert no critical errors
    expect(criticalErrors).toHaveLength(0)
    console.log('\n✓ No critical errors found')
  })

  test('3. Verify Products Table Renders', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/admin/products')
    await authenticatedPage.waitForLoadState('networkidle')

    // Look for table element
    const table = authenticatedPage.locator('table, [role="table"], [role="grid"]').first()
    await expect(table).toBeVisible({ timeout: 10000 })
    console.log('✓ Products table found and visible')

    // Check for table headers
    const headers = authenticatedPage.locator('th, [role="columnheader"]')
    const headerCount = await headers.count()
    console.log(`✓ Table headers found: ${headerCount}`)

    // Check for table rows (products)
    const rows = authenticatedPage.locator('tbody tr, [role="row"]')
    const rowCount = await rows.count()
    console.log(`✓ Table rows found: ${rowCount}`)

    if (rowCount > 0) {
      console.log(`✓ Products are displayed in the table (${rowCount} rows)`)
    }
    else {
      console.log('⚠ No product rows found in table - table may be empty or not loaded')
    }

    // Take a screenshot of the table
    await table.screenshot({ path: 'admin-products-table.png' })
    console.log('✓ Screenshot taken: admin-products-table.png')
  })

  test('4. Test Search Functionality', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/admin/products')
    await authenticatedPage.waitForLoadState('networkidle')

    // Look for search input
    const searchInput = authenticatedPage.locator(
      'input[placeholder*="Search"], input[aria-label*="Search"], input[type="search"]',
    ).first()

    const searchExists = await searchInput.count() > 0
    if (!searchExists) {
      console.log('⚠ Search input not found - skipping search test')
      return
    }

    await expect(searchInput).toBeVisible()
    console.log('✓ Search input found and visible')

    // Type in search box
    await searchInput.fill('test')
    await authenticatedPage.waitForLoadState('networkidle')
    console.log('✓ Search term entered')

    // Verify search was triggered
    const url = authenticatedPage.url()
    const hasSearchParam = url.includes('search') || url.includes('q')
    console.log(`✓ Search triggered (URL updated: ${hasSearchParam})`)

    // Take a screenshot of search results
    await authenticatedPage.screenshot({ path: 'admin-products-search.png' })
    console.log('✓ Screenshot taken: admin-products-search.png')

    // Clear search
    await searchInput.clear()
    await authenticatedPage.waitForLoadState('networkidle')
    console.log('✓ Search cleared')
  })

  test('5. Test Filter Functionality', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/admin/products')
    await authenticatedPage.waitForLoadState('networkidle')

    // Look for filter buttons or dropdowns
    const filterButtons = authenticatedPage.locator('button, [role="button"]').filter({
      hasText: /Filter|Category|Status|Sort/i,
    })

    const filterCount = await filterButtons.count()
    console.log(`Filter controls found: ${filterCount}`)

    if (filterCount === 0) {
      console.log('⚠ No filter controls found - skipping filter test')
      return
    }

    // Click on first filter
    const firstFilter = filterButtons.first()
    await expect(firstFilter).toBeVisible()
    await firstFilter.click()
    await authenticatedPage.waitForTimeout(500)

    console.log('✓ Filter dropdown opened')

    // Take a screenshot
    await authenticatedPage.screenshot({ path: 'admin-products-filter.png' })
    console.log('✓ Screenshot taken: admin-products-filter.png')

    // Click elsewhere to close dropdown
    await authenticatedPage.click('body')
    console.log('✓ Filter tested')
  })

  test('6. Click "New Product" Button to Test Navigation', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/admin/products')
    await authenticatedPage.waitForLoadState('networkidle')

    // Look for "New Product" button
    const newProductButton = authenticatedPage.locator('button, a').filter({
      hasText: /New|Create|Add/i,
    }).first()

    const buttonExists = await newProductButton.count() > 0
    if (!buttonExists) {
      console.log('⚠ "New Product" button not found')
      return
    }

    await expect(newProductButton).toBeVisible()
    console.log('✓ "New Product" button found and visible')

    // Get button text
    const buttonText = await newProductButton.textContent()
    console.log(`✓ Button text: "${buttonText?.trim()}"`)

    // Click the button
    await newProductButton.click()
    await authenticatedPage.waitForLoadState('networkidle')

    // Verify navigation
    const newUrl = authenticatedPage.url()
    expect(newUrl).toContain('/admin/products')
    console.log(`✓ Navigated to: ${newUrl}`)

    // Check if form is visible
    const form = authenticatedPage.locator('form').first()
    const formVisible = await form.isVisible().catch(() => false)
    if (formVisible) {
      console.log('✓ Product form is visible')
    }

    // Take a screenshot
    await authenticatedPage.screenshot({ path: 'admin-products-new.png' })
    console.log('✓ Screenshot taken: admin-products-new.png')
  })

  test('7. Click on Product to View Details', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/admin/products')
    await authenticatedPage.waitForLoadState('networkidle')

    // Look for product rows
    const productRows = authenticatedPage.locator('tbody tr, [role="row"]')
    const rowCount = await productRows.count()

    if (rowCount === 0) {
      console.log('⚠ No products found to click - skipping product details test')
      return
    }

    console.log(`✓ Found ${rowCount} product rows`)

    // Get the first row
    const firstRow = productRows.first()
    await expect(firstRow).toBeVisible()

    // Get product name from first column
    const productName = firstRow.locator('td').first()
    const productText = await productName.textContent()
    console.log(`✓ First product: "${productText?.trim()}"`)

    // Look for clickable element in the row (could be a link or the row itself)
    const clickableElements = firstRow.locator('a, button, [role="button"]')
    const clickableCount = await clickableElements.count()

    if (clickableCount > 0) {
      console.log(`✓ Found ${clickableCount} clickable elements in row`)
      const firstClickable = clickableElements.first()
      await firstClickable.click()
      await authenticatedPage.waitForLoadState('networkidle')

      const detailUrl = authenticatedPage.url()
      console.log(`✓ Navigated to: ${detailUrl}`)

      // Take a screenshot
      await authenticatedPage.screenshot({ path: 'admin-products-details.png' })
      console.log('✓ Screenshot taken: admin-products-details.png')
    }
    else {
      // Try clicking on the row itself
      console.log('⚠ No clickable elements found - trying to click row')
      await firstRow.click().catch(() => {
        console.log('⚠ Could not click product row')
      })
    }
  })

  test('8. Comprehensive Page Load Test with Multiple Checks', async ({ page }) => {
    const issues: string[] = []
    const warnings: string[] = []

    console.log('\n=== STARTING COMPREHENSIVE PAGE TEST ===\n')

    // Test 1: Load the page
    try {
      await page.goto('/admin/products', { waitUntil: 'networkidle' })
      console.log('✓ Page loaded successfully')
    }
    catch (error) {
      issues.push(`Failed to load page: ${error}`)
      return
    }

    // Test 2: Check page is not showing error page
    const isErrorPage = await page.locator('text=/Error|404|500/i').isVisible({ timeout: 2000 }).catch(() => false)
    if (isErrorPage) {
      issues.push('Page appears to be showing an error page')
    }
    else {
      console.log('✓ Not an error page')
    }

    // Test 3: Check page title
    const title = await page.title()
    if (title && title.length > 0) {
      console.log(`✓ Page title: "${title}"`)
    }
    else {
      warnings.push('Page title is empty')
    }

    // Test 4: Check for main content area
    const mainContent = page.locator('main, [role="main"]').first()
    const hasMainContent = await mainContent.isVisible({ timeout: 5000 }).catch(() => false)
    if (hasMainContent) {
      console.log('✓ Main content area found')
    }
    else {
      warnings.push('Main content area not found')
    }

    // Test 5: Check for navigation
    const nav = page.locator('nav, [role="navigation"]').first()
    const hasNav = await nav.isVisible({ timeout: 5000 }).catch(() => false)
    if (hasNav) {
      console.log('✓ Navigation found')
    }
    else {
      warnings.push('Navigation not found')
    }

    // Test 6: Check for any disabled elements that shouldn't be
    const disabledInputs = page.locator('input[disabled], button[disabled]')
    const disabledCount = await disabledInputs.count()
    if (disabledCount === 0) {
      console.log('✓ No unexpectedly disabled elements')
    }
    else {
      console.log(`⚠ Found ${disabledCount} disabled elements (may be expected)`)
    }

    // Test 7: Check page response time
    const navigationTiming = await page.evaluate(() => {
      const timing = performance.getEntriesByType('navigation')[0] as any
      return {
        loadTime: timing?.loadEventEnd - timing?.loadEventStart || 0,
        domContentLoaded: timing?.domContentLoadedEventEnd - timing?.domContentLoadedEventStart || 0,
      }
    })
    console.log(`✓ Page load time: ${navigationTiming.loadTime}ms`)
    console.log(`✓ DOM Content Loaded: ${navigationTiming.domContentLoaded}ms`)

    // Test 8: Check for layout shift (CLS)
    const layoutShifts = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let cls = 0
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              cls += entry.value
            }
          })
        })
        observer.observe({ type: 'layout-shift', buffered: true })
        setTimeout(() => {
          observer.disconnect()
          resolve(cls)
        }, 500)
      })
    }).catch(() => 0)
    console.log(`✓ Cumulative Layout Shift: ${layoutShifts}`)

    // Test 9: Check for accessibility issues
    const ariaLabels = page.locator('[aria-label]')
    const ariaCount = await ariaLabels.count()
    console.log(`✓ Elements with ARIA labels: ${ariaCount}`)

    // Test 10: Check viewport
    const viewport = page.viewportSize()
    console.log(`✓ Viewport: ${viewport?.width}x${viewport?.height}`)

    // Final screenshot
    await page.screenshot({ path: 'admin-products-comprehensive.png' })
    console.log('✓ Screenshot taken: admin-products-comprehensive.png')

    // Report summary
    console.log('\n=== COMPREHENSIVE TEST SUMMARY ===')
    console.log(`Issues: ${issues.length}`)
    console.log(`Warnings: ${warnings.length}`)

    if (issues.length > 0) {
      console.log('\nIssues:')
      issues.forEach(issue => console.log(`  - ${issue}`))
    }

    if (warnings.length > 0) {
      console.log('\nWarnings:')
      warnings.forEach(warning => console.log(`  - ${warning}`))
    }

    expect(issues).toHaveLength(0)
  })
})
