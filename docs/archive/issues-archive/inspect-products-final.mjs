import { chromium } from 'playwright'
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

const BASE_URL = 'http://localhost:3000'
const ADMIN_PRODUCTS_URL = BASE_URL + '/admin/products'
const LOGIN_URL = BASE_URL + '/auth/login'
const SCREENSHOT_DIR = './test-screenshots/products-inspection'

// Admin credentials from MANUAL-TEST-INSTRUCTIONS.md
const ADMIN_EMAIL = 'admin@moldovadirect.com'
const ADMIN_PASSWORD = 'Admin123!@#'

async function login(page) {
  console.log('Attempting login with admin credentials...')

  await page.goto(LOGIN_URL, { waitUntil: 'networkidle', timeout: 30000 })
  await page.waitForTimeout(1000)

  await page.fill('input[type="email"]', ADMIN_EMAIL)
  await page.fill('input[type="password"]', ADMIN_PASSWORD)

  await Promise.all([
    page.waitForNavigation({ timeout: 10000 }).catch(() => {}),
    page.click('button[type="submit"]'),
  ])

  await page.waitForTimeout(2000)

  const currentUrl = page.url()
  console.log('After login, URL:', currentUrl)

  return !currentUrl.includes('/auth/login')
}

async function inspectProductsPage() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    acceptDownloads: true,
  })

  const page = await context.newPage()

  const issues = []
  const screenshots = []
  const consoleErrors = []
  const consoleWarnings = []

  // Capture console messages
  page.on('console', (msg) => {
    const text = msg.text()
    if (msg.type() === 'error') {
      consoleErrors.push(text)
      console.log('[CONSOLE ERROR]:', text)
    }
    else if (msg.type() === 'warning') {
      consoleWarnings.push(text)
    }
  })

  try {
    mkdirSync(SCREENSHOT_DIR, { recursive: true })

    console.log('\n=== STEP 1: Authentication ===')
    const loginSuccess = await login(page)

    if (!loginSuccess) {
      const loginFailScreenshot = join(SCREENSHOT_DIR, '01-auth-failed.png')
      await page.screenshot({ path: loginFailScreenshot, fullPage: true })
      screenshots.push({ file: '01-auth-failed.png', description: 'Authentication failed' })

      issues.push({
        location: 'Authentication',
        severity: 'Critical',
        description: 'Failed to authenticate with admin credentials',
        screenshot: '01-auth-failed.png',
        recommendation: 'Check if admin user exists in database',
      })

      throw new Error('Authentication failed')
    }

    console.log('✓ Authentication successful')

    console.log('\n=== STEP 2: Navigate to Products Page ===')
    await page.goto(ADMIN_PRODUCTS_URL, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(3000)

    const finalUrl = page.url()
    console.log('Final URL:', finalUrl)

    if (finalUrl.includes('/auth/login')) {
      issues.push({
        location: 'Authentication',
        severity: 'Critical',
        description: 'Session lost - redirected back to login after authentication',
        screenshot: '02-session-lost.png',
        recommendation: 'Check session persistence and middleware',
      })

      const sessionLostScreenshot = join(SCREENSHOT_DIR, '02-session-lost.png')
      await page.screenshot({ path: sessionLostScreenshot, fullPage: true })
      screenshots.push({ file: '02-session-lost.png', description: 'Session lost' })

      throw new Error('Session lost')
    }

    console.log('\n=== STEP 3: Taking Screenshots ===')
    const fullPageScreenshot = join(SCREENSHOT_DIR, '02-full-page.png')
    await page.screenshot({ path: fullPageScreenshot, fullPage: true })
    screenshots.push({ file: '02-full-page.png', description: 'Full products page' })

    const viewportScreenshot = join(SCREENSHOT_DIR, '03-viewport.png')
    await page.screenshot({ path: viewportScreenshot, fullPage: false })
    screenshots.push({ file: '03-viewport.png', description: 'Viewport' })

    console.log('\n=== STEP 4: Analyzing Page Header ===')
    const h1Text = await page.locator('h1').first().textContent().catch(() => null)
    const h1Visible = await page.locator('h1').first().isVisible().catch(() => false)
    console.log('H1 Text:', h1Text, '| Visible:', h1Visible)

    if (!h1Text) {
      issues.push({
        location: 'Page Header - H1',
        severity: 'High',
        description: 'No H1 heading found on products page',
        screenshot: '03-viewport.png',
        recommendation: 'Add H1 with "Products" text',
      })
    }
    else if (!h1Text.toLowerCase().includes('product')) {
      issues.push({
        location: 'Page Header - H1',
        severity: 'Medium',
        description: 'H1 does not clearly indicate Products page: "' + h1Text + '"',
        screenshot: '03-viewport.png',
        recommendation: 'H1 should say "Products" or "Product Management"',
        current: h1Text,
      })
    }

    const subtitle = await page.locator('.text-gray-600, .text-gray-400').first().textContent().catch(() => null)
    console.log('Subtitle:', subtitle)

    console.log('\n=== STEP 5: Checking Add Product Button ===')
    const addProductButton = await page.locator('a:has-text("Add Product"), button:has-text("Add Product")').count()
    console.log('Add Product buttons found:', addProductButton)

    if (addProductButton === 0) {
      issues.push({
        location: 'Primary Action - Add Product Button',
        severity: 'Critical',
        description: 'No "Add Product" button found',
        screenshot: '03-viewport.png',
        recommendation: 'Add prominent "Add Product" button in page header',
      })
    }
    else {
      const btnScreenshot = join(SCREENSHOT_DIR, '04-add-button.png')
      await page.locator('a:has-text("Add Product")').first().screenshot({ path: btnScreenshot }).catch(() => null)
      screenshots.push({ file: '04-add-button.png', description: 'Add Product button' })
    }

    console.log('\n=== STEP 6: Analyzing Filters ===')
    const searchInputs = await page.locator('input[type="search"], input[placeholder*="Search" i]').count()
    const selectFilters = await page.locator('select').count()
    console.log('Search inputs:', searchInputs, '| Select filters:', selectFilters)

    if (searchInputs === 0) {
      issues.push({
        location: 'Filters - Search Input',
        severity: 'High',
        description: 'No search input field found',
        screenshot: '03-viewport.png',
        recommendation: 'Add search input to filter products by name/SKU',
      })
    }

    if (selectFilters < 3) {
      issues.push({
        location: 'Filters - Dropdown Filters',
        severity: 'Medium',
        description: 'Insufficient filter dropdowns (found ' + selectFilters + ', expected 3+)',
        screenshot: '03-viewport.png',
        recommendation: 'Add filters for category, status, and stock level',
      })
    }

    console.log('\n=== STEP 7: Analyzing Products Table ===')
    const tables = await page.locator('table').count()
    console.log('Tables found:', tables)

    if (tables === 0) {
      issues.push({
        location: 'Products Table',
        severity: 'Critical',
        description: 'No table element found - products cannot be displayed',
        screenshot: '03-viewport.png',
        recommendation: 'Add table to display products list',
      })
    }
    else {
      const tableScreenshot = join(SCREENSHOT_DIR, '05-table.png')
      await page.locator('table').first().screenshot({ path: tableScreenshot })
      screenshots.push({ file: '05-table.png', description: 'Products table' })

      // Analyze headers
      const headers = await page.locator('th').allTextContents()
      console.log('Table headers:', headers)

      const expectedColumns = {
        image: headers.some(h => /image|photo|thumbnail/i.test(h)),
        name: headers.some(h => /name|nombre|product/i.test(h)),
        price: headers.some(h => /price|precio/i.test(h)),
        stock: headers.some(h => /stock|inventory|cantidad/i.test(h)),
        category: headers.some(h => /category|categor/i.test(h)),
        status: headers.some(h => /status|estado|active/i.test(h)),
        actions: headers.some(h => /action|acciones/i.test(h)),
      }

      console.log('Column check:', expectedColumns)

      if (!expectedColumns.name) {
        issues.push({
          location: 'Table - Name Column',
          severity: 'Critical',
          description: 'No product name column in table',
          screenshot: '05-table.png',
          headers: headers,
        })
      }

      if (!expectedColumns.image) {
        issues.push({
          location: 'Table - Image Column',
          severity: 'High',
          description: 'No image/thumbnail column in table',
          screenshot: '05-table.png',
          recommendation: 'Add column to show product thumbnails',
        })
      }

      if (!expectedColumns.price) {
        issues.push({
          location: 'Table - Price Column',
          severity: 'High',
          description: 'No price column in table',
          screenshot: '05-table.png',
          recommendation: 'Add price column to display product prices',
        })
      }

      if (!expectedColumns.stock) {
        issues.push({
          location: 'Table - Stock Column',
          severity: 'High',
          description: 'No stock/inventory column in table',
          screenshot: '05-table.png',
          recommendation: 'Add stock quantity column',
        })
      }

      if (!expectedColumns.actions) {
        issues.push({
          location: 'Table - Actions Column',
          severity: 'Medium',
          description: 'No actions column in table',
          screenshot: '05-table.png',
          recommendation: 'Add actions column with Edit/Delete buttons',
        })
      }

      // Check table rows
      const rows = await page.locator('tbody tr').count()
      console.log('Table rows:', rows)

      if (rows === 0) {
        const emptyMessage = await page.locator('tbody').textContent()
        console.log('Empty table message:', emptyMessage)

        issues.push({
          location: 'Table - Data',
          severity: 'High',
          description: 'Table is empty - no products displayed',
          screenshot: '05-table.png',
          recommendation: 'Display products or show helpful empty state message',
          emptyMessage: emptyMessage,
        })
      }
      else {
        console.log('✓ Table has', rows, 'rows')

        // Check first row
        const firstRowScreenshot = join(SCREENSHOT_DIR, '06-table-row.png')
        await page.locator('tbody tr').first().screenshot({ path: firstRowScreenshot })
        screenshots.push({ file: '06-table-row.png', description: 'First product row' })

        // Check for product images
        const rowImages = await page.locator('tbody tr').first().locator('img').count()
        console.log('Images in first row:', rowImages)

        if (rowImages === 0 && expectedColumns.image) {
          issues.push({
            location: 'Table - Product Images',
            severity: 'Medium',
            description: 'No product thumbnail images visible in rows',
            screenshot: '06-table-row.png',
            recommendation: 'Display product images in table',
          })
        }

        if (rowImages > 0) {
          const img = page.locator('tbody tr').first().locator('img').first()
          const imgAlt = await img.getAttribute('alt').catch(() => null)
          const imgSrc = await img.getAttribute('src').catch(() => null)

          if (!imgAlt || imgAlt.trim() === '') {
            issues.push({
              location: 'Table - Image Accessibility',
              severity: 'Medium',
              description: 'Product images missing alt text',
              screenshot: '06-table-row.png',
              recommendation: 'Add descriptive alt text for accessibility',
            })
          }

          console.log('First image:', { alt: imgAlt, src: imgSrc })
        }
      }
    }

    console.log('\n=== STEP 8: Checking Pagination ===')
    const pagination = await page.locator('[role="navigation"], .pagination, button:has-text("Next"), button:has-text("Previous")').count()
    console.log('Pagination elements:', pagination)

    if (pagination > 0) {
      const paginationScreenshot = join(SCREENSHOT_DIR, '07-pagination.png')
      await page.locator('[role="navigation"], .pagination').first().screenshot({ path: paginationScreenshot }).catch(() => null)
      screenshots.push({ file: '07-pagination.png', description: 'Pagination' })
    }

    console.log('\n=== STEP 9: Console Errors Check ===')
    if (consoleErrors.length > 0) {
      console.log('Console errors found:', consoleErrors.length)

      issues.push({
        location: 'JavaScript Console',
        severity: 'High',
        description: consoleErrors.length + ' JavaScript errors detected',
        screenshot: '03-viewport.png',
        recommendation: 'Fix JavaScript errors',
        errors: consoleErrors.slice(0, 10),
      })
    }
    else {
      console.log('✓ No console errors')
    }

    console.log('\n=== STEP 10: Accessibility Check ===')
    const accessibilityIssues = await page.evaluate(() => {
      const issues = []

      const imgsWithoutAlt = document.querySelectorAll('img:not([alt]), img[alt=""]')
      if (imgsWithoutAlt.length > 0) {
        issues.push({ type: 'missing-alt', count: imgsWithoutAlt.length })
      }

      const btnsWithoutLabel = Array.from(document.querySelectorAll('button')).filter(btn =>
        !btn.textContent?.trim() && !btn.getAttribute('aria-label') && !btn.getAttribute('title'),
      )
      if (btnsWithoutLabel.length > 0) {
        issues.push({ type: 'missing-button-label', count: btnsWithoutLabel.length })
      }

      return issues
    })

    accessibilityIssues.forEach((issue) => {
      issues.push({
        location: 'Accessibility',
        severity: 'Medium',
        description: issue.type + ': ' + issue.count + ' elements affected',
        screenshot: '02-full-page.png',
        recommendation: 'Add appropriate labels and alt text',
      })
    })

    console.log('\n=== STEP 11: Final Screenshot ===')
    const finalScreenshot = join(SCREENSHOT_DIR, '08-final.png')
    await page.screenshot({ path: finalScreenshot, fullPage: true })
    screenshots.push({ file: '08-final.png', description: 'Final full page' })
  }
  catch (error) {
    console.error('\n!!! ERROR during inspection:', error.message)

    const errorScreenshot = join(SCREENSHOT_DIR, '99-error.png')
    await page.screenshot({ path: errorScreenshot, fullPage: true }).catch(() => {})
    screenshots.push({ file: '99-error.png', description: 'Error state' })

    issues.push({
      location: 'Inspection Process',
      severity: 'Critical',
      description: 'Failed to complete inspection: ' + error.message,
      screenshot: '99-error.png',
      error: error.stack,
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
    issues: issues.sort((a, b) => {
      const order = { Critical: 0, High: 1, Medium: 2, Low: 3 }
      return order[a.severity] - order[b.severity]
    }),
    screenshots,
    consoleErrors: consoleErrors.slice(0, 20),
    consoleWarnings: consoleWarnings.slice(0, 20),
  }

  const reportPath = join(SCREENSHOT_DIR, 'inspection-report.json')
  writeFileSync(reportPath, JSON.stringify(report, null, 2))

  console.log('\n')
  console.log('='.repeat(60))
  console.log('PRODUCTS PAGE INSPECTION COMPLETE')
  console.log('='.repeat(60))
  console.log('Total Issues:', report.totalIssues)
  console.log('  Critical:', report.issuesBySeverity.critical)
  console.log('  High:', report.issuesBySeverity.high)
  console.log('  Medium:', report.issuesBySeverity.medium)
  console.log('  Low:', report.issuesBySeverity.low)
  console.log('\nConsole Errors:', consoleErrors.length)
  console.log('Console Warnings:', consoleWarnings.length)
  console.log('\nReport:', reportPath)
  console.log('Screenshots:', SCREENSHOT_DIR)
  console.log('='.repeat(60))

  return report
}

inspectProductsPage().catch(console.error)
