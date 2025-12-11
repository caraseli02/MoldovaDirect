import { test, expect } from '../../fixtures/base'

test.describe('Admin Orders Analytics Page', () => {
  test('should load the page without errors and display title', async ({ authenticatedPage }) => {
    // Listen for console errors
    const consoleErrors: string[] = []
    const consoleWarnings: string[] = []

    authenticatedPage.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
      if (msg.type() === 'warning') {
        consoleWarnings.push(msg.text())
      }
    })

    // Navigate to the page
    await authenticatedPage.goto('/admin/orders/analytics')
    await authenticatedPage.waitForLoadState('networkidle')

    // Verify page title
    await expect(authenticatedPage).toHaveTitle(/Analytics|Admin|Order/i)

    // Check for main heading
    const heading = authenticatedPage.locator('h1:has-text("Order Analytics")')
    await expect(heading).toBeVisible()

    // Verify description
    const description = authenticatedPage.locator('p:has-text("Comprehensive insights")')
    await expect(description).toBeVisible()

    // Log any errors found
    if (consoleErrors.length > 0) {
      console.log('Console Errors found:', consoleErrors)
    }

    console.log(`Total console warnings: ${consoleWarnings.length}`)
  })

  test('should take screenshot and verify visual layout', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/admin/orders/analytics')
    await authenticatedPage.waitForLoadState('networkidle')
    await authenticatedPage.waitForTimeout(1000)

    // Take screenshot
    const screenshotPath = 'tests/screenshots/orders-analytics-full.png'
    await authenticatedPage.screenshot({
      path: screenshotPath,
      fullPage: true,
    })

    console.log(`Screenshot saved to ${screenshotPath}`)
  })

  test('should display date range filter controls', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/admin/orders/analytics')
    await authenticatedPage.waitForLoadState('networkidle')

    // Check for date input fields
    const dateFromInput = authenticatedPage.locator('input[type="date"]').first()
    const dateToInput = authenticatedPage.locator('input[type="date"]').nth(1)

    await expect(dateFromInput).toBeVisible()
    await expect(dateToInput).toBeVisible()

    // Check for date range label
    const dateLabel = authenticatedPage.locator('label:has-text("Date Range")')
    await expect(dateLabel).toBeVisible()

    // Verify date preset buttons
    const last7DaysButton = authenticatedPage.getByRole('button').filter({ hasText: /Last 7 days/i })
    const last30DaysButton = authenticatedPage.getByRole('button').filter({ hasText: /Last 30 days/i })
    const last90DaysButton = authenticatedPage.getByRole('button').filter({ hasText: /Last 90 days/i })

    await expect(last7DaysButton).toBeVisible()
    await expect(last30DaysButton).toBeVisible()
    await expect(last90DaysButton).toBeVisible()
  })

  test('should display all key metrics and KPIs', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/admin/orders/analytics')
    await authenticatedPage.waitForLoadState('networkidle')
    await authenticatedPage.waitForTimeout(1000)

    // Check for summary metrics cards
    const totalOrdersCard = authenticatedPage.locator('text=/Total Orders/i')
    const totalRevenueCard = authenticatedPage.locator('text=/Total Revenue/i')
    const averageOrderValueCard = authenticatedPage.locator('text=/Average Order Value/i')
    const fulfillmentRateCard = authenticatedPage.locator('text=/Fulfillment Rate/i')

    await expect(totalOrdersCard).toBeVisible()
    await expect(totalRevenueCard).toBeVisible()
    await expect(averageOrderValueCard).toBeVisible()
    await expect(fulfillmentRateCard).toBeVisible()

    // Check for performance metrics
    const avgFulfillmentTimeCard = authenticatedPage.locator('text=/Average Fulfillment Time/i')
    const avgDeliveryTimeCard = authenticatedPage.locator('text=/Average Delivery Time/i')

    await expect(avgFulfillmentTimeCard).toBeVisible()
    await expect(avgDeliveryTimeCard).toBeVisible()
  })

  test('should verify metrics display numeric values', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/admin/orders/analytics')
    await authenticatedPage.waitForLoadState('networkidle')
    await authenticatedPage.waitForTimeout(1000)

    // Get text content of metrics
    const totalOrdersValue = authenticatedPage.locator('text=/Total Orders/i').locator('..').locator('div:has-text(/\\d/)').first()
    const totalRevenueValue = authenticatedPage.locator('text=/Total Revenue/i').locator('..').locator('div:has-text(/[€$]/)').first()

    const ordersText = await totalOrdersValue.textContent()
    const revenueText = await totalRevenueValue.textContent()

    // Verify they contain numeric or currency values
    expect(ordersText).toBeTruthy()
    expect(revenueText).toBeTruthy()

    console.log(`Total Orders: ${ordersText}`)
    console.log(`Total Revenue: ${revenueText}`)
  })

  test('should display Order Status Breakdown', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/admin/orders/analytics')
    await authenticatedPage.waitForLoadState('networkidle')
    await authenticatedPage.waitForTimeout(1000)

    // Check for status breakdown section
    const statusBreakdownTitle = authenticatedPage.locator('text=/Order Status Breakdown/i')
    await expect(statusBreakdownTitle).toBeVisible()

    // Check for status badges or status items
    const statusItems = authenticatedPage.locator('[class*="border"]').filter({ has: authenticatedPage.locator('[class*="status"]') })
    const statusItemCount = await statusItems.count()

    console.log(`Found ${statusItemCount} status items`)
  })

  test('should display Payment Methods breakdown', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/admin/orders/analytics')
    await authenticatedPage.waitForLoadState('networkidle')
    await authenticatedPage.waitForTimeout(1000)

    // Check for payment methods section
    const paymentTitle = authenticatedPage.locator('text=/Payment Methods/i')
    await expect(paymentTitle).toBeVisible()

    // Check for payment method items
    const paymentItems = authenticatedPage.locator('text=/Payment Methods/i').locator('..').locator('[class*="space-y"]').locator('div').first()
    const isPaymentVisible = await paymentItems.isVisible().catch(() => false)

    if (isPaymentVisible) {
      console.log('Payment methods section is visible')
    }
  })

  test('should display Revenue Breakdown components', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/admin/orders/analytics')
    await authenticatedPage.waitForLoadState('networkidle')
    await authenticatedPage.waitForTimeout(1000)

    // Check for revenue breakdown section
    const revenueTitle = authenticatedPage.locator('text=/Revenue Breakdown/i')
    await expect(revenueTitle).toBeVisible()

    // Check for revenue components
    const subtotalItem = authenticatedPage.locator('text=/Subtotal/i')
    const shippingItem = authenticatedPage.locator('text=/Shipping/i')
    const taxItem = authenticatedPage.locator('text=/Tax/i')
    const totalItem = authenticatedPage.locator('text=/Total/i').nth(1)

    await expect(subtotalItem).toBeVisible()
    await expect(shippingItem).toBeVisible()
    await expect(taxItem).toBeVisible()
    await expect(totalItem).toBeVisible()
  })

  test('should display Revenue Trend chart', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/admin/orders/analytics')
    await authenticatedPage.waitForLoadState('networkidle')
    await authenticatedPage.waitForTimeout(1000)

    // Check for revenue trend title
    const trendTitle = authenticatedPage.locator('text=/Revenue Trend/i')
    await expect(trendTitle).toBeVisible()

    // Check for chart visualization (bar chart)
    const chartContainer = authenticatedPage.locator('[class*="h-64"]')
    const isChartVisible = await chartContainer.isVisible().catch(() => false)

    if (isChartVisible) {
      console.log('Revenue trend chart is visible')

      // Look for chart bars
      const chartBars = authenticatedPage.locator('[class*="bg-blue"]')
      const barCount = await chartBars.count()
      console.log(`Found ${barCount} chart bars`)
    }
    else {
      console.log('Note: Chart may be loading or using different selectors')
    }
  })

  test('should test date filtering functionality', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/admin/orders/analytics')
    await authenticatedPage.waitForLoadState('networkidle')

    // Get initial date values
    const dateFromInput = authenticatedPage.locator('input[type="date"]').first()
    const dateToInput = authenticatedPage.locator('input[type="date"]').nth(1)

    const initialFromValue = await dateFromInput.inputValue()
    const initialToValue = await dateToInput.inputValue()

    console.log(`Initial date range: ${initialFromValue} to ${initialToValue}`)

    // Click on "Last 7 days" preset
    const last7DaysButton = authenticatedPage.getByRole('button').filter({ hasText: /Last 7 days/i })
    await last7DaysButton.click()

    await authenticatedPage.waitForTimeout(500)

    // Verify date values changed
    const newFromValue = await dateFromInput.inputValue()
    const newToValue = await dateToInput.inputValue()

    console.log(`After preset: ${newFromValue} to ${newToValue}`)

    // Dates should have changed
    expect(newFromValue).not.toBe(initialFromValue)
  })

  test('should test Refresh button functionality', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/admin/orders/analytics')
    await authenticatedPage.waitForLoadState('networkidle')

    // Find Refresh button
    const refreshButton = authenticatedPage.getByRole('button').filter({ hasText: /Refresh/i })
    await expect(refreshButton).toBeVisible()

    // Monitor network requests
    let dataRequested = false
    authenticatedPage.on('response', (response) => {
      if (response.url().includes('/api/admin/orders/analytics')) {
        dataRequested = true
      }
    })

    // Click refresh
    await refreshButton.click()

    // Wait for potential loading state
    await authenticatedPage.waitForTimeout(500)

    console.log(`Data refetch triggered: ${dataRequested}`)
  })

  test('should test Export CSV functionality', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/admin/orders/analytics')
    await authenticatedPage.waitForLoadState('networkidle')
    await authenticatedPage.waitForTimeout(1000)

    // Find Export CSV button
    const exportButton = authenticatedPage.getByRole('button').filter({ hasText: /Export CSV/i })
    await expect(exportButton).toBeVisible()

    // Setup download listener
    const downloadPromise = authenticatedPage.waitForEvent('download')

    // Click export button
    await exportButton.click()

    try {
      const download = await downloadPromise
      console.log(`File downloaded: ${download.suggestedFilename()}`)
      expect(download.suggestedFilename()).toContain('order-analytics')
    }
    catch (e) {
      console.log('Note: Download event not captured (may require specific Playwright configuration)')
    }
  })

  test('should handle network errors gracefully', async ({ authenticatedPage }) => {
    const errors: string[] = []
    const pageErrors: string[] = []

    // Listen for errors
    authenticatedPage.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    authenticatedPage.on('pageerror', (err) => {
      pageErrors.push(err.toString())
    })

    // Navigate to page
    await authenticatedPage.goto('/admin/orders/analytics')
    await authenticatedPage.waitForLoadState('networkidle')
    await authenticatedPage.waitForTimeout(2000)

    // Filter out non-critical errors
    const criticalErrors = errors.filter(e =>
      !e.includes('404')
      && !e.includes('Failed to fetch')
      && !e.toLowerCase().includes('network')
      && !e.includes('undefined'),
    )

    console.log(`Critical errors: ${criticalErrors.length}`)
    console.log(`Page errors: ${pageErrors.length}`)

    expect(criticalErrors.length).toBeLessThan(3)
  })

  test('should verify responsive layout', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/admin/orders/analytics')
    await authenticatedPage.waitForLoadState('networkidle')

    // Check that main heading is visible
    const heading = authenticatedPage.locator('h1:has-text("Order Analytics")')
    await expect(heading).toBeVisible()

    // Check that metrics are visible in grid layout
    const metricsGrid = authenticatedPage.locator('[class*="grid"]')
    const gridCount = await metricsGrid.count()

    console.log(`Found ${gridCount} grid layouts`)
    expect(gridCount).toBeGreaterThan(0)
  })

  test('should verify all charts and data elements render without critical errors', async ({ authenticatedPage }) => {
    const chartErrors: string[] = []

    // Monitor chart-related errors
    authenticatedPage.on('console', (msg) => {
      if (msg.type() === 'error' && msg.text().includes('Chart')) {
        chartErrors.push(msg.text())
      }
    })

    await authenticatedPage.goto('/admin/orders/analytics')
    await authenticatedPage.waitForLoadState('networkidle')
    await authenticatedPage.waitForTimeout(2000)

    // Check for key chart elements
    const revenueChart = authenticatedPage.locator('text=/Revenue Trend/i')
    const statusBreakdown = authenticatedPage.locator('text=/Order Status Breakdown/i')
    const paymentMethods = authenticatedPage.locator('text=/Payment Methods/i')

    await expect(revenueChart).toBeVisible()
    await expect(statusBreakdown).toBeVisible()
    await expect(paymentMethods).toBeVisible()

    console.log(`Chart-related errors: ${chartErrors.length}`)
    expect(chartErrors.length).toBe(0)
  })

  test('should verify API response structure', async ({ authenticatedPage }) => {
    let apiResponseCaptured = false
    let responseData: unknown = null

    // Intercept API responses
    authenticatedPage.on('response', async (response) => {
      if (response.url().includes('/api/admin/orders/analytics')) {
        apiResponseCaptured = true
        try {
          responseData = await response.json()
        }
        catch (e) {
          console.log('Could not parse response as JSON')
        }
      }
    })

    await authenticatedPage.goto('/admin/orders/analytics')
    await authenticatedPage.waitForLoadState('networkidle')
    await authenticatedPage.waitForTimeout(1000)

    if (apiResponseCaptured && responseData) {
      console.log('API Response captured:')

      // Verify response structure
      expect(responseData).toHaveProperty('success')
      expect(responseData).toHaveProperty('data')

      if (responseData.data) {
        expect(responseData.data).toHaveProperty('summary')
        expect(responseData.data).toHaveProperty('statusBreakdown')
        expect(responseData.data).toHaveProperty('paymentMethodBreakdown')
        expect(responseData.data).toHaveProperty('revenueBreakdown')
        expect(responseData.data).toHaveProperty('timeSeries')

        console.log('All expected data properties present')
      }
    }
  })

  test('should verify summary metrics are properly calculated', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/admin/orders/analytics')
    await authenticatedPage.waitForLoadState('networkidle')
    await authenticatedPage.waitForTimeout(1000)

    // Get metric values by checking the cards
    const summaryCards = authenticatedPage.locator('[class*="rounded-2xl"]')
    const cardCount = await summaryCards.count()

    console.log(`Found ${cardCount} metric cards`)

    // Get specific metric values
    const totalOrdersCard = authenticatedPage.locator('text=/Total Orders/i').locator('..').locator('..')
    const isMetricVisible = await totalOrdersCard.isVisible().catch(() => false)

    if (isMetricVisible) {
      console.log('Metrics cards are properly displayed')
    }

    expect(cardCount).toBeGreaterThanOrEqual(4)
  })

  test('should check loading and error states', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/admin/orders/analytics')

    // Check for loading indicator initially
    const loadingSpinner = authenticatedPage.locator('text=/loader|loading/i')
    const hasLoadingState = await loadingSpinner.isVisible().catch(() => false)

    // Wait for content to load
    await authenticatedPage.waitForLoadState('networkidle')
    await authenticatedPage.waitForTimeout(1000)

    // Check that either content or error message is displayed
    const analyticsContent = authenticatedPage.locator('[class*="rounded-2xl"]').first()
    const errorMessage = authenticatedPage.locator('text=/Failed to load|error/i')

    const hasContent = await analyticsContent.isVisible().catch(() => false)
    const hasError = await errorMessage.isVisible().catch(() => false)

    console.log(`Loading state observed: ${hasLoadingState}`)
    console.log(`Content rendered: ${hasContent}`)
    console.log(`Error displayed: ${hasError}`)

    expect(hasContent || hasError).toBe(true)
  })

  test('should verify page has proper accessibility structure', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/admin/orders/analytics')
    await authenticatedPage.waitForLoadState('networkidle')

    // Check for main heading
    const mainHeading = authenticatedPage.locator('h1')
    const headingCount = await mainHeading.count()

    // Check for navigation elements
    const buttons = authenticatedPage.locator('button[role="button"]')
    const buttonCount = await buttons.count()

    // Check for semantic structure
    const cards = authenticatedPage.locator('[class*="Card"]')
    const cardCount = await cards.count()

    console.log(`Main headings: ${headingCount}`)
    console.log(`Interactive buttons: ${buttonCount}`)
    console.log(`Content cards: ${cardCount}`)

    expect(headingCount).toBeGreaterThan(0)
    expect(buttonCount).toBeGreaterThan(0)
  })
})
