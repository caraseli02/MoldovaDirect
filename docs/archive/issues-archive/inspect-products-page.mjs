import { chromium } from 'playwright'
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

const ADMIN_PRODUCTS_URL = 'http://localhost:3000/admin/products'
const LOGIN_URL = 'http://localhost:3000/auth/login'
const SCREENSHOT_DIR = './test-screenshots/products-inspection'

async function inspectProductsPage() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  })
  const page = await context.newPage()

  const issues = []
  const screenshots = []
  const consoleErrors = []

  // Capture console errors
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text())
    }
  })

  try {
    // Create screenshot directory
    mkdirSync(SCREENSHOT_DIR, { recursive: true })

    console.log('Step 1: Navigating to admin products page...')
    const response = await page.goto(ADMIN_PRODUCTS_URL, {
      waitUntil: 'networkidle',
      timeout: 30000,
    })

    // Check if redirected to login
    const currentUrl = page.url()
    console.log('Current URL:', currentUrl)

    if (currentUrl.includes('/auth/login')) {
      console.log('Redirected to login page. Attempting authentication...')

      // Take screenshot of login redirect
      const loginScreenshot = join(SCREENSHOT_DIR, '01-login-redirect.png')
      await page.screenshot({ path: loginScreenshot, fullPage: true })
      screenshots.push({ file: '01-login-redirect.png', description: 'Login redirect page' })

      issues.push({
        location: 'Authentication',
        severity: 'Critical',
        description: 'Not authenticated - redirected to login page',
        screenshot: '01-login-redirect.png',
      })

      // Try to login with test credentials
      await page.fill('input[type="email"]', 'admin@test.com')
      await page.fill('input[type="password"]', 'password123')
      await page.click('button[type="submit"]')

      await page.waitForTimeout(2000)

      // Navigate to products page after login
      await page.goto(ADMIN_PRODUCTS_URL, { waitUntil: 'networkidle', timeout: 30000 })
    }

    await page.waitForTimeout(2000)

    console.log('Step 2: Taking full page screenshot...')
    const fullPageScreenshot = join(SCREENSHOT_DIR, '02-full-page.png')
    await page.screenshot({ path: fullPageScreenshot, fullPage: true })
    screenshots.push({ file: '02-full-page.png', description: 'Full products page view' })

    console.log('Step 3: Taking viewport screenshot...')
    const viewportScreenshot = join(SCREENSHOT_DIR, '03-viewport.png')
    await page.screenshot({ path: viewportScreenshot, fullPage: false })
    screenshots.push({ file: '03-viewport.png', description: 'Viewport view' })

    console.log('Step 4: Analyzing page structure...')

    // Check for page title/header
    const pageTitle = await page.locator('h1, h2[class*="title"], [data-testid*="title"]').first().textContent().catch(() => null)
    console.log('Page title:', pageTitle)

    if (!pageTitle) {
      issues.push({
        location: 'Page Header',
        severity: 'High',
        description: 'No visible page title or heading found',
        screenshot: '03-viewport.png',
      })
    }

    // Check for products table
    const hasTable = await page.locator('table, [role="table"], .table, [data-testid*="table"]').count()
    console.log('Tables found:', hasTable)

    if (hasTable === 0) {
      issues.push({
        location: 'Products Table',
        severity: 'Critical',
        description: 'No products table found on the page',
        screenshot: '03-viewport.png',
      })
    }
    else {
      // Take table screenshot
      const tableScreenshot = join(SCREENSHOT_DIR, '04-table.png')
      await page.locator('table, [role="table"], .table').first().screenshot({ path: tableScreenshot }).catch(() => null)
      screenshots.push({ file: '04-table.png', description: 'Products table' })

      // Check table headers
      const headers = await page.locator('th, [role="columnheader"]').allTextContents()
      console.log('Table headers:', headers)

      if (headers.length === 0) {
        issues.push({
          location: 'Products Table - Headers',
          severity: 'High',
          description: 'No table headers found',
          screenshot: '04-table.png',
        })
      }

      // Check for table rows
      const rowCount = await page.locator('tbody tr, [role="row"]:not(:first-child)').count()
      console.log('Table rows:', rowCount)

      if (rowCount === 0) {
        issues.push({
          location: 'Products Table - Data',
          severity: 'High',
          description: 'No product rows found in table (empty table)',
          screenshot: '04-table.png',
        })
      }

      // Check for product images
      const productImages = await page.locator('tbody img, [role="row"] img').count()
      console.log('Product images:', productImages)

      if (productImages === 0 && rowCount > 0) {
        issues.push({
          location: 'Products Table - Images',
          severity: 'Medium',
          description: 'No product images/thumbnails found in table rows',
          screenshot: '04-table.png',
        })
      }
    }

    // Check for filters/search
    const filterElements = await page.locator('input[type="search"], input[placeholder*="search" i], select, [data-testid*="filter"]').count()
    console.log('Filter elements:', filterElements)

    if (filterElements === 0) {
      issues.push({
        location: 'Filters/Search',
        severity: 'Medium',
        description: 'No search or filter controls found',
        screenshot: '03-viewport.png',
      })
    }
    else {
      // Take filters screenshot
      const filtersScreenshot = join(SCREENSHOT_DIR, '05-filters.png')
      await page.locator('input[type="search"], select, [data-testid*="filter"]').first().screenshot({ path: filtersScreenshot }).catch(() => null)
      screenshots.push({ file: '05-filters.png', description: 'Filter controls' })
    }

    // Check for action buttons
    const actionButtons = await page.locator('button:has-text("Add"), button:has-text("New"), button:has-text("Create"), [data-testid*="add"], [data-testid*="create"]').count()
    console.log('Action buttons:', actionButtons)

    if (actionButtons === 0) {
      issues.push({
        location: 'Action Buttons',
        severity: 'High',
        description: 'No Add Product or Create button found',
        screenshot: '03-viewport.png',
      })
    }

    // Check for pagination
    const pagination = await page.locator('[role="navigation"], .pagination, [data-testid*="pagination"]').count()
    console.log('Pagination elements:', pagination)

    console.log('Step 5: Checking console errors...')

    if (consoleErrors.length > 0) {
      const errorList = consoleErrors.slice(0, 3).join('; ')
      issues.push({
        location: 'Console',
        severity: 'High',
        description: 'Console errors detected: ' + errorList,
        screenshot: '03-viewport.png',
      })
    }

    console.log('Step 6: Checking accessibility...')

    // Check for missing alt text on images
    const imagesWithoutAlt = await page.locator('img:not([alt])').count()
    if (imagesWithoutAlt > 0) {
      issues.push({
        location: 'Images',
        severity: 'Medium',
        description: imagesWithoutAlt + ' images missing alt text (accessibility issue)',
        screenshot: '02-full-page.png',
      })
    }

    console.log('Step 7: Checking for error messages...')

    const errorMessages = await page.locator('.error, [role="alert"], .alert-error, [data-testid*="error"]').count()
    if (errorMessages > 0) {
      const errorScreenshot = join(SCREENSHOT_DIR, '06-errors.png')
      await page.locator('.error, [role="alert"]').first().screenshot({ path: errorScreenshot }).catch(() => null)
      screenshots.push({ file: '06-errors.png', description: 'Error messages' })

      const errorText = await page.locator('.error, [role="alert"]').first().textContent().catch(() => 'Unknown error')
      issues.push({
        location: 'Error Messages',
        severity: 'Critical',
        description: 'Error message displayed: ' + errorText,
        screenshot: '06-errors.png',
      })
    }

    console.log('Step 8: Taking final screenshot...')
    const finalScreenshot = join(SCREENSHOT_DIR, '07-final.png')
    await page.screenshot({ path: finalScreenshot, fullPage: true })
    screenshots.push({ file: '07-final.png', description: 'Final view' })
  }
  catch (error) {
    console.error('Error during inspection:', error)
    issues.push({
      location: 'Page Load',
      severity: 'Critical',
      description: 'Failed to load or inspect page: ' + error.message,
      screenshot: 'N/A',
    })
  }
  finally {
    await browser.close()
  }

  // Generate report
  const report = {
    timestamp: new Date().toISOString(),
    url: ADMIN_PRODUCTS_URL,
    totalIssues: issues.length,
    issuesBySeverity: {
      critical: issues.filter(i => i.severity === 'Critical').length,
      high: issues.filter(i => i.severity === 'High').length,
      medium: issues.filter(i => i.severity === 'Medium').length,
      low: issues.filter(i => i.severity === 'Low').length,
    },
    issues,
    screenshots,
  }

  const reportPath = join(SCREENSHOT_DIR, 'inspection-report.json')
  writeFileSync(reportPath, JSON.stringify(report, null, 2))

  console.log('\n=== INSPECTION COMPLETE ===')
  console.log('Total issues found:', issues.length)
  console.log('Critical:', report.issuesBySeverity.critical)
  console.log('High:', report.issuesBySeverity.high)
  console.log('Medium:', report.issuesBySeverity.medium)
  console.log('Low:', report.issuesBySeverity.low)
  console.log('\nReport saved to:', reportPath)
  console.log('Screenshots saved to:', SCREENSHOT_DIR)

  return report
}

inspectProductsPage().catch(console.error)
