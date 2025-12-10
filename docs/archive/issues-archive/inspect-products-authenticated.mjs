import { chromium } from 'playwright'
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

const BASE_URL = 'http://localhost:3000'
const ADMIN_PRODUCTS_URL = BASE_URL + '/admin/products'
const SCREENSHOT_DIR = './test-screenshots/products-inspection'

async function authenticateAsAdmin(page) {
  console.log('Checking authentication status...')

  // Navigate to admin page to check if already authenticated
  await page.goto(ADMIN_PRODUCTS_URL, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await page.waitForTimeout(2000)

  const currentUrl = page.url()

  if (currentUrl.includes('/auth/login')) {
    console.log('Not authenticated. Attempting login...')

    // Try different admin credentials
    const credentials = [
      { email: 'admin@example.com', password: 'admin123' },
      { email: 'admin@test.com', password: 'password123' },
      { email: 'test@example.com', password: 'password' },
    ]

    for (const cred of credentials) {
      console.log('Trying credentials:', cred.email)

      await page.fill('input[type="email"]', cred.email)
      await page.fill('input[type="password"]', cred.password)
      await page.click('button[type="submit"]')

      await page.waitForTimeout(3000)

      const newUrl = page.url()
      console.log('URL after login attempt:', newUrl)

      if (!newUrl.includes('/auth/login')) {
        console.log('Login successful with:', cred.email)

        // Navigate to products page
        await page.goto(ADMIN_PRODUCTS_URL, { waitUntil: 'networkidle', timeout: 30000 })
        await page.waitForTimeout(2000)
        return true
      }

      // Clear fields for next attempt
      await page.fill('input[type="email"]', '')
      await page.fill('input[type="password"]', '')
    }

    console.log('All login attempts failed')
    return false
  }

  console.log('Already authenticated')
  return true
}

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
  const consoleWarnings = []

  // Capture console messages
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text())
    }
    else if (msg.type() === 'warning') {
      consoleWarnings.push(msg.text())
    }
  })

  try {
    mkdirSync(SCREENSHOT_DIR, { recursive: true })

    console.log('Step 1: Authenticating...')
    const authenticated = await authenticateAsAdmin(page)

    if (!authenticated) {
      const loginFailScreenshot = join(SCREENSHOT_DIR, '01-auth-failed.png')
      await page.screenshot({ path: loginFailScreenshot, fullPage: true })
      screenshots.push({ file: '01-auth-failed.png', description: 'Authentication failed' })

      issues.push({
        location: 'Authentication',
        severity: 'Critical',
        description: 'Failed to authenticate with test credentials. Unable to access admin products page.',
        screenshot: '01-auth-failed.png',
        recommendation: 'Verify admin user exists in database or update test credentials',
      })

      await browser.close()

      const report = {
        timestamp: new Date().toISOString(),
        url: ADMIN_PRODUCTS_URL,
        authenticated: false,
        totalIssues: issues.length,
        issuesBySeverity: { critical: 1, high: 0, medium: 0, low: 0 },
        issues,
        screenshots,
      }

      const reportPath = join(SCREENSHOT_DIR, 'inspection-report.json')
      writeFileSync(reportPath, JSON.stringify(report, null, 2))

      console.log('\n=== INSPECTION FAILED - AUTHENTICATION ISSUE ===')
      console.log('Report saved to:', reportPath)

      return report
    }

    console.log('Step 2: Taking initial screenshots...')
    const fullPageScreenshot = join(SCREENSHOT_DIR, '02-full-page.png')
    await page.screenshot({ path: fullPageScreenshot, fullPage: true })
    screenshots.push({ file: '02-full-page.png', description: 'Full products page view' })

    const viewportScreenshot = join(SCREENSHOT_DIR, '03-viewport.png')
    await page.screenshot({ path: viewportScreenshot, fullPage: false })
    screenshots.push({ file: '03-viewport.png', description: 'Initial viewport' })

    console.log('Step 3: Analyzing page header and title...')
    const pageH1 = await page.locator('h1').first().textContent().catch(() => null)
    console.log('H1 title:', pageH1)

    if (!pageH1 || !pageH1.toLowerCase().includes('product')) {
      issues.push({
        location: 'Page Header - H1 Title',
        severity: 'High',
        description: 'H1 heading missing or does not indicate Products page',
        screenshot: '03-viewport.png',
        recommendation: 'Add clear H1 heading like "Products" or "Product Management"',
        current: pageH1 || 'No H1 found',
      })
    }

    const pageSubtitle = await page.locator('p.text-gray-600, p.text-gray-400').first().textContent().catch(() => null)
    console.log('Subtitle:', pageSubtitle)

    const headerScreenshot = join(SCREENSHOT_DIR, '04-header.png')
    await page.locator('div').first().screenshot({ path: headerScreenshot }).catch(() => null)
    screenshots.push({ file: '04-header.png', description: 'Page header section' })

    console.log('Step 4: Checking Add Product button...')
    const addButton = await page.locator('button:has-text("Add"), a:has-text("Add")').count()
    console.log('Add Product buttons found:', addButton)

    if (addButton === 0) {
      issues.push({
        location: 'Action Buttons - Add Product',
        severity: 'Critical',
        description: 'No "Add Product" button found',
        screenshot: '03-viewport.png',
        recommendation: 'Add prominent "Add Product" button in top-right of page header',
      })
    }
    else {
      const buttonScreenshot = join(SCREENSHOT_DIR, '05-add-button.png')
      await page.locator('button:has-text("Add"), a:has-text("Add")').first().screenshot({ path: buttonScreenshot }).catch(() => null)
      screenshots.push({ file: '05-add-button.png', description: 'Add Product button' })

      // Check button styling
      const buttonColor = await page.locator('a:has-text("Add")').first().evaluate((el) => {
        const style = window.getComputedStyle(el)
        return { bg: style.backgroundColor, color: style.color, padding: style.padding }
      }).catch(() => null)

      console.log('Button styling:', buttonColor)
    }

    console.log('Step 5: Analyzing filters section...')
    const searchInput = await page.locator('input[type="search"], input[placeholder*="Search" i], input[placeholder*="Buscar" i]').count()
    const selectFilters = await page.locator('select').count()
    console.log('Search inputs:', searchInput, 'Select filters:', selectFilters)

    if (searchInput === 0) {
      issues.push({
        location: 'Filters - Search',
        severity: 'High',
        description: 'No search input field found',
        screenshot: '03-viewport.png',
        recommendation: 'Add search input to filter products by name or SKU',
      })
    }

    if (selectFilters === 0) {
      issues.push({
        location: 'Filters - Dropdowns',
        severity: 'Medium',
        description: 'No filter dropdowns found (category, status, stock level)',
        screenshot: '03-viewport.png',
        recommendation: 'Add filter controls for category, status, and stock levels',
      })
    }

    if (searchInput > 0 || selectFilters > 0) {
      const filtersScreenshot = join(SCREENSHOT_DIR, '06-filters.png')
      const filterContainer = await page.locator('div').filter({ hasText: /search|filter|buscar/i }).first()
      if (await filterContainer.count() > 0) {
        await filterContainer.screenshot({ path: filtersScreenshot }).catch(() => null)
        screenshots.push({ file: '06-filters.png', description: 'Filters section' })
      }
    }

    console.log('Step 6: Analyzing products table...')
    const tables = await page.locator('table').count()
    console.log('Tables found:', tables)

    if (tables === 0) {
      issues.push({
        location: 'Products Table',
        severity: 'Critical',
        description: 'No table element found on the page',
        screenshot: '03-viewport.png',
        recommendation: 'Products should be displayed in a table format',
      })
    }
    else {
      const tableScreenshot = join(SCREENSHOT_DIR, '07-table.png')
      await page.locator('table').first().screenshot({ path: tableScreenshot })
      screenshots.push({ file: '07-table.png', description: 'Products table' })

      // Analyze table headers
      const headers = await page.locator('th').allTextContents()
      console.log('Table headers:', headers)

      const expectedHeaders = ['Name', 'Nombre', 'Image', 'Price', 'Precio', 'Stock', 'Category', 'Status']
      const hasImageColumn = headers.some(h => h.toLowerCase().includes('image') || h.toLowerCase().includes('photo'))
      const hasPriceColumn = headers.some(h => h.toLowerCase().includes('price') || h.toLowerCase().includes('precio'))
      const hasStockColumn = headers.some(h => h.toLowerCase().includes('stock') || h.toLowerCase().includes('inventory'))
      const hasActionsColumn = headers.some(h => h.toLowerCase().includes('action') || h.toLowerCase().includes('acciones'))

      if (!hasImageColumn) {
        issues.push({
          location: 'Products Table - Headers',
          severity: 'Medium',
          description: 'No Image/Photo column header found',
          screenshot: '07-table.png',
          recommendation: 'Add column for product thumbnail images',
          headers: headers,
        })
      }

      if (!hasPriceColumn) {
        issues.push({
          location: 'Products Table - Headers',
          severity: 'High',
          description: 'No Price column found',
          screenshot: '07-table.png',
          recommendation: 'Add price column to display product prices',
          headers: headers,
        })
      }

      if (!hasStockColumn) {
        issues.push({
          location: 'Products Table - Headers',
          severity: 'High',
          description: 'No Stock/Inventory column found',
          screenshot: '07-table.png',
          recommendation: 'Add stock quantity column',
          headers: headers,
        })
      }

      if (!hasActionsColumn) {
        issues.push({
          location: 'Products Table - Headers',
          severity: 'Medium',
          description: 'No Actions column found',
          screenshot: '07-table.png',
          recommendation: 'Add actions column with Edit/Delete buttons',
          headers: headers,
        })
      }

      // Check table rows
      const rows = await page.locator('tbody tr').count()
      console.log('Table rows:', rows)

      if (rows === 0) {
        issues.push({
          location: 'Products Table - Data',
          severity: 'High',
          description: 'Table is empty - no product rows displayed',
          screenshot: '07-table.png',
          recommendation: 'Display products or show "No products found" message',
        })
      }
      else {
        // Check first row for images
        const firstRowImages = await page.locator('tbody tr').first().locator('img').count()
        console.log('Images in first row:', firstRowImages)

        if (firstRowImages === 0) {
          issues.push({
            location: 'Products Table - Product Images',
            severity: 'Medium',
            description: 'No product images/thumbnails visible in table rows',
            screenshot: '07-table.png',
            recommendation: 'Display product thumbnail images in table',
          })
        }
        else {
          // Check image alt text
          const firstImage = page.locator('tbody tr').first().locator('img').first()
          const imgAlt = await firstImage.getAttribute('alt').catch(() => null)
          const imgSrc = await firstImage.getAttribute('src').catch(() => null)

          if (!imgAlt) {
            issues.push({
              location: 'Products Table - Image Accessibility',
              severity: 'Medium',
              description: 'Product images missing alt text',
              screenshot: '07-table.png',
              recommendation: 'Add descriptive alt text to all product images',
            })
          }

          console.log('First image:', { alt: imgAlt, src: imgSrc })
        }

        // Take screenshot of first row
        const firstRowScreenshot = join(SCREENSHOT_DIR, '08-table-row.png')
        await page.locator('tbody tr').first().screenshot({ path: firstRowScreenshot })
        screenshots.push({ file: '08-table-row.png', description: 'First table row detail' })
      }
    }

    console.log('Step 7: Checking pagination...')
    const paginationControls = await page.locator('[role="navigation"], .pagination, button:has-text("Next"), button:has-text("Previous")').count()
    console.log('Pagination controls:', paginationControls)

    if (paginationControls > 0) {
      const paginationScreenshot = join(SCREENSHOT_DIR, '09-pagination.png')
      await page.locator('[role="navigation"], .pagination').first().screenshot({ path: paginationScreenshot }).catch(() => null)
      screenshots.push({ file: '09-pagination.png', description: 'Pagination controls' })
    }
    else {
      issues.push({
        location: 'Pagination',
        severity: 'Low',
        description: 'No pagination controls visible',
        screenshot: '03-viewport.png',
        recommendation: 'Add pagination for large product lists',
      })
    }

    console.log('Step 8: Checking for loading states...')
    const loadingIndicators = await page.locator('[data-loading], .loading, .spinner, [role="progressbar"], svg.animate-spin').count()
    console.log('Loading indicators:', loadingIndicators)

    console.log('Step 9: Checking console errors...')
    if (consoleErrors.length > 0) {
      console.log('Console errors found:', consoleErrors.length)
      const errorSummary = consoleErrors.slice(0, 5).join('\n')

      issues.push({
        location: 'JavaScript Console',
        severity: 'High',
        description: consoleErrors.length + ' console errors detected',
        screenshot: '03-viewport.png',
        recommendation: 'Fix JavaScript errors to ensure proper functionality',
        errors: consoleErrors.slice(0, 10),
      })
    }

    console.log('Step 10: Typography and spacing analysis...')
    const typographyAnalysis = await page.evaluate(() => {
      const issues = []
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
      const fontFamilies = new Set()
      const fontSizes = []

      headings.forEach((h) => {
        const style = window.getComputedStyle(h)
        fontFamilies.add(style.fontFamily)
        fontSizes.push({ tag: h.tagName, size: style.fontSize })
      })

      // Check for consistent spacing
      const elements = document.querySelectorAll('div, section')
      const margins = []
      const paddings = []

      elements.forEach((el) => {
        const style = window.getComputedStyle(el)
        if (style.margin !== '0px') margins.push(style.margin)
        if (style.padding !== '0px') paddings.push(style.padding)
      })

      return {
        uniqueFonts: fontFamilies.size,
        fontSizes: fontSizes,
        uniqueMargins: new Set(margins).size,
        uniquePaddings: new Set(paddings).size,
      }
    })

    console.log('Typography analysis:', typographyAnalysis)

    if (typographyAnalysis.uniqueFonts > 3) {
      issues.push({
        location: 'Typography - Font Consistency',
        severity: 'Low',
        description: 'Too many different font families used: ' + typographyAnalysis.uniqueFonts,
        screenshot: '02-full-page.png',
        recommendation: 'Limit to 2-3 font families for consistency',
      })
    }

    console.log('Step 11: Accessibility check...')
    const accessibilityIssues = await page.evaluate(() => {
      const issues = []

      // Check for missing alt text
      const imagesWithoutAlt = document.querySelectorAll('img:not([alt])')
      if (imagesWithoutAlt.length > 0) {
        issues.push({ type: 'missing-alt', count: imagesWithoutAlt.length })
      }

      // Check for buttons without accessible names
      const buttonsWithoutText = Array.from(document.querySelectorAll('button')).filter((btn) => {
        return !btn.textContent?.trim() && !btn.getAttribute('aria-label')
      })
      if (buttonsWithoutText.length > 0) {
        issues.push({ type: 'missing-button-label', count: buttonsWithoutText.length })
      }

      // Check for links without text
      const linksWithoutText = Array.from(document.querySelectorAll('a')).filter((link) => {
        return !link.textContent?.trim() && !link.getAttribute('aria-label')
      })
      if (linksWithoutText.length > 0) {
        issues.push({ type: 'missing-link-text', count: linksWithoutText.length })
      }

      return issues
    })

    accessibilityIssues.forEach((issue) => {
      issues.push({
        location: 'Accessibility',
        severity: 'Medium',
        description: issue.type + ': ' + issue.count + ' elements affected',
        screenshot: '02-full-page.png',
        recommendation: 'Add appropriate labels and alt text for accessibility',
      })
    })

    console.log('Step 12: Final full page screenshot...')
    const finalScreenshot = join(SCREENSHOT_DIR, '10-final-full.png')
    await page.screenshot({ path: finalScreenshot, fullPage: true })
    screenshots.push({ file: '10-final-full.png', description: 'Final full page view' })
  }
  catch (error) {
    console.error('Error during inspection:', error)
    issues.push({
      location: 'Page Inspection',
      severity: 'Critical',
      description: 'Failed to complete inspection: ' + error.message,
      screenshot: 'N/A',
      error: error.stack,
    })
  }
  finally {
    await browser.close()
  }

  // Generate comprehensive report
  const report = {
    timestamp: new Date().toISOString(),
    url: ADMIN_PRODUCTS_URL,
    authenticated: true,
    totalIssues: issues.length,
    issuesBySeverity: {
      critical: issues.filter(i => i.severity === 'Critical').length,
      high: issues.filter(i => i.severity === 'High').length,
      medium: issues.filter(i => i.severity === 'Medium').length,
      low: issues.filter(i => i.severity === 'Low').length,
    },
    issues: issues.sort((a, b) => {
      const severityOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 }
      return severityOrder[a.severity] - severityOrder[b.severity]
    }),
    screenshots,
    consoleErrors: consoleErrors.slice(0, 20),
    consoleWarnings: consoleWarnings.slice(0, 20),
  }

  const reportPath = join(SCREENSHOT_DIR, 'inspection-report.json')
  writeFileSync(reportPath, JSON.stringify(report, null, 2))

  console.log('\n=== INSPECTION COMPLETE ===')
  console.log('Total issues found:', issues.length)
  console.log('  Critical:', report.issuesBySeverity.critical)
  console.log('  High:', report.issuesBySeverity.high)
  console.log('  Medium:', report.issuesBySeverity.medium)
  console.log('  Low:', report.issuesBySeverity.low)
  console.log('\nConsole Errors:', consoleErrors.length)
  console.log('Console Warnings:', consoleWarnings.length)
  console.log('\nReport saved to:', reportPath)
  console.log('Screenshots saved to:', SCREENSHOT_DIR)

  return report
}

inspectProductsPage().catch(console.error)
