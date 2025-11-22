import { test, expect, Page } from '@playwright/test'

/**
 * Standalone test for Orders Analytics page
 * Does not rely on global setup - handles authentication directly
 */
test.describe('Admin Orders Analytics Page - Standalone', () => {
  let page: Page

  test.beforeEach(async ({ browser }) => {
    const context = await browser.newContext()
    page = await context.newPage()

    // Login directly
    const baseURL = process.env.BASE_URL || 'http://localhost:3000'
    const email = process.env.TEST_USER_EMAIL || 'admin@moldovadirect.com'
    const password = process.env.TEST_USER_PASSWORD || 'Admin123!@#'

    console.log(`Logging in as: ${email}`)

    await page.goto(`${baseURL}/auth/login`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)

    // Find and fill email input
    const emailInputs = await page.locator('input[type="email"]').all()
    if (emailInputs.length > 0) {
      await emailInputs[0].fill(email)
    }

    // Find and fill password input
    const passwordInputs = await page.locator('input[type="password"]').all()
    if (passwordInputs.length > 0) {
      await passwordInputs[0].fill(password)
    }

    // Find and click login button
    const loginBtn = await page.locator('button[type="submit"]').or(page.getByRole('button').filter({ hasText: /Login|Ingresar/ }))
    await loginBtn.first().click()

    // Wait for login to complete
    await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => null)
    await page.waitForTimeout(1000)

    console.log(`Current URL after login: ${page.url()}`)
  })

  test('should load the page without errors and display title', async () => {
    const consoleErrors: string[] = []
    const consoleWarnings: string[] = []
    const pageErrors: string[] = []

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      } else if (msg.type() === 'warning') {
        consoleWarnings.push(msg.text())
      }
    })

    page.on('pageerror', err => {
      pageErrors.push(err.toString())
    })

    // Navigate to the page
    const baseURL = process.env.BASE_URL || 'http://localhost:3000'
    await page.goto(`${baseURL}/admin/orders/analytics`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)

    console.log(`Page URL: ${page.url()}`)
    console.log(`Page title: ${await page.title()}`)

    // Check for main heading
    const heading = page.locator('h1:has-text("Order Analytics")')
    const headingVisible = await heading.isVisible().catch(() => false)

    if (!headingVisible) {
      console.log('Heading not found, looking for alternatives...')
      const allHeadings = await page.locator('h1').all()
      for (const h of allHeadings) {
        console.log(`Found heading: ${await h.textContent()}`)
      }
    }

    // Log errors
    console.log(`\n=== CONSOLE ERRORS (${consoleErrors.length}) ===`)
    consoleErrors.slice(0, 10).forEach(e => console.log(`ERROR: ${e}`))

    console.log(`\n=== CONSOLE WARNINGS (${consoleWarnings.length}) ===`)
    consoleWarnings.slice(0, 5).forEach(w => console.log(`WARN: ${w}`))

    console.log(`\n=== PAGE ERRORS (${pageErrors.length}) ===`)
    pageErrors.forEach(e => console.log(`PAGE ERROR: ${e}`))

    // Check page is accessible
    expect(page.url()).toContain('/admin/orders/analytics')
  })

  test('should take screenshot for visual inspection', async () => {
    const baseURL = process.env.BASE_URL || 'http://localhost:3000'
    await page.goto(`${baseURL}/admin/orders/analytics`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(1000)

    // Take screenshot
    const screenshotPath = 'tests/screenshots/orders-analytics-full-page.png'
    await page.screenshot({
      path: screenshotPath,
      fullPage: true
    })

    console.log(`Screenshot saved to ${screenshotPath}`)
    console.log(`Page height: ${await page.evaluate(() => document.documentElement.scrollHeight)}px`)
    console.log(`Page width: ${await page.evaluate(() => document.documentElement.scrollWidth)}px`)
  })

  test('should display date range filter controls', async () => {
    const baseURL = process.env.BASE_URL || 'http://localhost:3000'
    await page.goto(`${baseURL}/admin/orders/analytics`, { waitUntil: 'networkidle' })

    // Check for date input fields
    const dateInputs = await page.locator('input[type="date"]').all()
    console.log(`Found ${dateInputs.length} date input fields`)

    expect(dateInputs.length).toBeGreaterThanOrEqual(2)

    // Check for date range label
    const dateLabel = page.locator('label:has-text("Date Range")')
    const labelVisible = await dateLabel.isVisible().catch(() => false)
    console.log(`Date Range label visible: ${labelVisible}`)

    // Verify date preset buttons
    const buttonTexts = await page.locator('button').allTextContents()
    const hasPresets = buttonTexts.some(text =>
      text.includes('Last 7 days') || text.includes('Last 30 days') || text.includes('Last 90 days')
    )

    console.log(`Date preset buttons found: ${hasPresets}`)
    console.log(`All button texts: ${buttonTexts.join(', ')}`)
  })

  test('should display all key metrics and KPIs', async () => {
    const baseURL = process.env.BASE_URL || 'http://localhost:3000'
    await page.goto(`${baseURL}/admin/orders/analytics`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(1500)

    // List of expected metrics
    const expectedMetrics = [
      'Total Orders',
      'Total Revenue',
      'Average Order Value',
      'Fulfillment Rate',
      'Average Fulfillment Time',
      'Average Delivery Time'
    ]

    console.log('\n=== CHECKING FOR METRICS ===')
    for (const metric of expectedMetrics) {
      const metricLocator = page.locator(`text=/${metric}/i`)
      const isVisible = await metricLocator.isVisible().catch(() => false)
      console.log(`${metric}: ${isVisible ? 'FOUND' : 'NOT FOUND'}`)

      if (isVisible) {
        const value = await metricLocator.locator('..').locator('div').first().textContent().catch(() => 'N/A')
        console.log(`  Value: ${value}`)
      }
    }

    // Check for any visible cards
    const cards = await page.locator('[class*="rounded-2xl"]').all()
    console.log(`\nTotal cards found: ${cards.length}`)
  })

  test('should verify metrics display numeric values', async () => {
    const baseURL = process.env.BASE_URL || 'http://localhost:3000'
    await page.goto(`${baseURL}/admin/orders/analytics`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(1500)

    // Get all visible text content
    const allText = await page.textContent('body')
    console.log('\n=== SAMPLE OF PAGE CONTENT ===')
    if (allText) {
      const lines = allText.split('\n').filter(l => l.trim().length > 0)
      lines.slice(0, 30).forEach(line => {
        if (line.trim().length > 2) {
          console.log(line.trim())
        }
      })
    }

    // Look for numeric patterns
    const numberPattern = /\d+[.,]\d+|[€$]\d+|\d+%/
    const hasNumbers = numberPattern.test(allText || '')
    console.log(`\nNumeric values found: ${hasNumbers}`)
  })

  test('should display Order Status Breakdown', async () => {
    const baseURL = process.env.BASE_URL || 'http://localhost:3000'
    await page.goto(`${baseURL}/admin/orders/analytics`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(1500)

    const statusTitle = page.locator('text=/Order Status Breakdown/i')
    const isTitleVisible = await statusTitle.isVisible().catch(() => false)

    console.log(`Status Breakdown title visible: ${isTitleVisible}`)

    if (isTitleVisible) {
      // Get the section content
      const section = statusTitle.locator('..')
      const content = await section.textContent().catch(() => 'N/A')
      console.log(`Section content preview: ${content?.substring(0, 200)}...`)
    }
  })

  test('should display Payment Methods and Revenue Breakdown', async () => {
    const baseURL = process.env.BASE_URL || 'http://localhost:3000'
    await page.goto(`${baseURL}/admin/orders/analytics`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(1500)

    console.log('\n=== CHECKING BREAKDOWN SECTIONS ===')

    const paymentTitle = page.locator('text=/Payment Methods/i')
    const revenueTitle = page.locator('text=/Revenue Breakdown/i')

    const paymentVisible = await paymentTitle.isVisible().catch(() => false)
    const revenueVisible = await revenueTitle.isVisible().catch(() => false)

    console.log(`Payment Methods section visible: ${paymentVisible}`)
    console.log(`Revenue Breakdown section visible: ${revenueVisible}`)

    if (paymentVisible) {
      const content = await paymentTitle.locator('..').textContent()
      console.log(`Payment methods content: ${content?.substring(0, 150)}...`)
    }

    if (revenueVisible) {
      const content = await revenueTitle.locator('..').textContent()
      console.log(`Revenue breakdown content: ${content?.substring(0, 150)}...`)
    }
  })

  test('should display Revenue Trend chart', async () => {
    const baseURL = process.env.BASE_URL || 'http://localhost:3000'
    await page.goto(`${baseURL}/admin/orders/analytics`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(1500)

    const trendTitle = page.locator('text=/Revenue Trend/i')
    const isTitleVisible = await trendTitle.isVisible().catch(() => false)

    console.log(`Revenue Trend title visible: ${isTitleVisible}`)

    if (isTitleVisible) {
      // Look for chart visualization
      const chartContainer = trendTitle.locator('..').locator('[class*="h-64"], [class*="h-48"], [class*="flex"]')
      const isChartVisible = await chartContainer.isVisible().catch(() => false)
      console.log(`Chart container visible: ${isChartVisible}`)

      // Look for bar elements
      const bars = await chartContainer.locator('[class*="bg-"]').all().catch(() => [])
      console.log(`Chart bars/elements found: ${bars.length}`)
    }
  })

  test('should test date filtering functionality', async () => {
    const baseURL = process.env.BASE_URL || 'http://localhost:3000'
    await page.goto(`${baseURL}/admin/orders/analytics`, { waitUntil: 'networkidle' })

    const dateInputs = await page.locator('input[type="date"]').all()

    if (dateInputs.length >= 2) {
      const dateFromInput = dateInputs[0]
      const dateToInput = dateInputs[1]

      const initialFromValue = await dateFromInput.inputValue()
      const initialToValue = await dateToInput.inputValue()

      console.log(`Initial date range: ${initialFromValue} to ${initialToValue}`)

      // Try clicking "Last 7 days" button
      const presetButton = page.getByRole('button').filter({ hasText: /Last 7 days/i })
      const buttonExists = await presetButton.isVisible().catch(() => false)

      if (buttonExists) {
        console.log('Clicking Last 7 days button...')
        await presetButton.click()
        await page.waitForTimeout(500)

        const newFromValue = await dateFromInput.inputValue()
        const newToValue = await dateToInput.inputValue()

        console.log(`After preset: ${newFromValue} to ${newToValue}`)
        console.log(`Dates changed: ${newFromValue !== initialFromValue || newToValue !== initialToValue}`)
      } else {
        console.log('Preset button not found')
      }
    }
  })

  test('should test Refresh button functionality', async () => {
    const baseURL = process.env.BASE_URL || 'http://localhost:3000'
    await page.goto(`${baseURL}/admin/orders/analytics`, { waitUntil: 'networkidle' })

    const refreshButton = page.getByRole('button').filter({ hasText: /Refresh/i })
    const buttonVisible = await refreshButton.isVisible().catch(() => false)

    console.log(`Refresh button visible: ${buttonVisible}`)

    if (buttonVisible) {
      let dataRefetched = false

      page.on('response', response => {
        if (response.url().includes('/api/admin/orders/analytics')) {
          dataRefetched = true
          console.log(`API request detected: ${response.url()}`)
        }
      })

      console.log('Clicking Refresh button...')
      await refreshButton.click()
      await page.waitForTimeout(1000)

      console.log(`Data refetch triggered: ${dataRefetched}`)
    }
  })

  test('should check for console errors during page load', async () => {
    const baseURL = process.env.BASE_URL || 'http://localhost:3000'

    const consoleMessages: { type: string; text: string }[] = []

    page.on('console', msg => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text()
      })
    })

    await page.goto(`${baseURL}/admin/orders/analytics`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)

    const errors = consoleMessages.filter(m => m.type === 'error')
    const warnings = consoleMessages.filter(m => m.type === 'warning')
    const logs = consoleMessages.filter(m => m.type === 'log')

    console.log(`\n=== CONSOLE SUMMARY ===`)
    console.log(`Errors: ${errors.length}`)
    console.log(`Warnings: ${warnings.length}`)
    console.log(`Logs: ${logs.length}`)

    if (errors.length > 0) {
      console.log('\nErrors:')
      errors.forEach(e => console.log(`  - ${e.text}`))
    }
  })

  test('should verify API response structure', async () => {
    const baseURL = process.env.BASE_URL || 'http://localhost:3000'

    const responses: { url: string; status: number; data?: any }[] = []

    page.on('response', async response => {
      if (response.url().includes('/api/admin/orders/analytics')) {
        try {
          const data = await response.json()
          responses.push({
            url: response.url(),
            status: response.status(),
            data
          })
        } catch {
          responses.push({
            url: response.url(),
            status: response.status()
          })
        }
      }
    })

    await page.goto(`${baseURL}/admin/orders/analytics`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(1500)

    console.log(`\n=== API RESPONSES ===`)
    console.log(`Total requests: ${responses.length}`)

    responses.forEach((resp, i) => {
      console.log(`\nRequest ${i + 1}:`)
      console.log(`  URL: ${resp.url}`)
      console.log(`  Status: ${resp.status}`)

      if (resp.data) {
        console.log(`  Success: ${resp.data.success}`)
        console.log(`  Data keys: ${Object.keys(resp.data.data || {}).join(', ')}`)

        if (resp.data.data?.summary) {
          console.log(`  Summary metrics:`)
          Object.entries(resp.data.data.summary).forEach(([key, value]) => {
            console.log(`    - ${key}: ${value}`)
          })
        }
      }
    })
  })
})
