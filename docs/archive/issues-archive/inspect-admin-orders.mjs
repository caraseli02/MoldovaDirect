import { chromium } from 'playwright'
import { writeFileSync, mkdirSync } from 'fs'
import { dirname } from 'path'

async function inspectAdminOrdersPage() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 2,
  })
  const page = await context.newPage()

  const issues = []
  const screenshots = []

  try {
    console.log('Navigating to admin orders page...')

    // Navigate to the orders page
    const response = await page.goto('http://localhost:3000/admin/orders', {
      waitUntil: 'networkidle',
      timeout: 30000,
    })

    console.log('Response status:', response.status())

    // Wait a bit for any async content
    await page.waitForTimeout(2000)

    // Take full page screenshot
    const screenshotDir = '/Users/vladislavcaraseli/Documents/MoldovaDirect.worktrees/products-improvments/ui-inspection-screenshots'
    mkdirSync(screenshotDir, { recursive: true })

    const fullPagePath = `${screenshotDir}/admin-orders-full-page.png`
    await page.screenshot({ path: fullPagePath, fullPage: true })
    screenshots.push({ name: 'Full Page', path: fullPagePath })
    console.log('Full page screenshot saved')

    // Check if we're on login page (not authenticated)
    const currentUrl = page.url()
    if (currentUrl.includes('/login') || currentUrl.includes('/auth')) {
      issues.push({
        severity: 'Critical',
        location: 'Page Access',
        description: 'Redirected to login page - authentication required. Cannot inspect orders page without authentication.',
        screenshot: fullPagePath,
      })

      const report = {
        url: currentUrl,
        timestamp: new Date().toISOString(),
        authenticated: false,
        issues,
        screenshots,
      }

      writeFileSync(
        '/Users/vladislavcaraseli/Documents/MoldovaDirect.worktrees/products-improvments/ui-inspection-report.json',
        JSON.stringify(report, null, 2),
      )

      console.log('\n=== AUTHENTICATION REQUIRED ===')
      console.log('The admin orders page requires authentication.')
      console.log('Please provide login credentials to inspect the page.')

      await browser.close()
      return
    }

    // Get page title
    const title = await page.title()
    console.log('Page title:', title)

    // Check for error messages
    const errorElements = await page.locator('[role="alert"], .error, .alert-error').all()
    if (errorElements.length > 0) {
      for (const error of errorElements) {
        const text = await error.textContent()
        issues.push({
          severity: 'High',
          location: 'Error Message',
          description: `Error displayed: ${text}`,
          screenshot: fullPagePath,
        })
      }
    }

    // Check for 404 or error pages
    const pageContent = await page.content()
    if (pageContent.includes('404') || pageContent.includes('Page not found')) {
      issues.push({
        severity: 'Critical',
        location: 'Page',
        description: '404 error - page not found',
        screenshot: fullPagePath,
      })
    }

    // Analyze layout structure
    const mainContent = await page.locator('main, [role="main"], .main-content').first()
    if (await mainContent.count() === 0) {
      issues.push({
        severity: 'High',
        location: 'Layout',
        description: 'No main content area found',
        screenshot: fullPagePath,
      })
    }

    // Check for table
    const tables = await page.locator('table').all()
    console.log('Tables found:', tables.length)

    if (tables.length === 0) {
      issues.push({
        severity: 'Critical',
        location: 'Orders Table',
        description: 'No table element found on the page',
        screenshot: fullPagePath,
      })
    }
    else {
      // Check table structure
      for (let i = 0; i < tables.length; i++) {
        const table = tables[i]
        const headers = await table.locator('th').all()
        const rows = await table.locator('tbody tr').all()

        console.log(`Table ${i + 1}: ${headers.length} headers, ${rows.length} rows`)

        if (headers.length === 0) {
          issues.push({
            severity: 'High',
            location: 'Orders Table',
            description: 'Table has no header row',
            screenshot: fullPagePath,
          })
        }

        // Check for empty state
        if (rows.length === 0) {
          const emptyState = await page.locator('.empty-state, [data-empty], .no-data').first()
          if (await emptyState.count() === 0) {
            issues.push({
              severity: 'Medium',
              location: 'Orders Table',
              description: 'Empty table with no empty state message',
              screenshot: fullPagePath,
            })
          }
        }
      }
    }

    // Check for tabs
    const tabs = await page.locator('[role="tablist"], .tabs, .tab-list').all()
    if (tabs.length > 0) {
      const tabScreenshot = `${screenshotDir}/admin-orders-tabs.png`
      await tabs[0].screenshot({ path: tabScreenshot })
      screenshots.push({ name: 'Tabs', path: tabScreenshot })

      const tabButtons = await page.locator('[role="tab"], .tab').all()
      console.log('Tab buttons found:', tabButtons.length)

      for (const tab of tabButtons) {
        const isDisabled = await tab.isDisabled()
        const ariaSelected = await tab.getAttribute('aria-selected')
        const text = await tab.textContent()
        console.log(`Tab: ${text?.trim()}, Selected: ${ariaSelected}, Disabled: ${isDisabled}`)
      }
    }

    // Check for filters
    const filters = await page.locator('input[type="search"], input[type="text"][placeholder*="filter"], input[placeholder*="search"]').all()
    if (filters.length > 0) {
      const filterScreenshot = `${screenshotDir}/admin-orders-filters.png`
      await page.locator('.filters, [data-filters], form').first().screenshot({ path: filterScreenshot }).catch(() => {})
      screenshots.push({ name: 'Filters', path: filterScreenshot })
    }

    // Check for date pickers
    const datePickers = await page.locator('input[type="date"], .date-picker, [data-date-picker]').all()
    console.log('Date pickers found:', datePickers.length)

    // Check for status badges
    const badges = await page.locator('.badge, [data-badge], .status').all()
    if (badges.length > 0) {
      console.log('Status badges found:', badges.length)

      // Check badge colors and accessibility
      for (const badge of badges.slice(0, 10)) { // Check first 10
        const bgColor = await badge.evaluate(el => window.getComputedStyle(el).backgroundColor)
        const color = await badge.evaluate(el => window.getComputedStyle(el).color)
        const text = await badge.textContent()

        console.log(`Badge: ${text?.trim()}, BG: ${bgColor}, Color: ${color}`)

        // Check for potential contrast issues (simplified)
        if (bgColor === color) {
          issues.push({
            severity: 'High',
            location: 'Status Badge',
            description: `Badge "${text?.trim()}" has same background and text color: ${bgColor}`,
            screenshot: fullPagePath,
          })
        }
      }
    }

    // Check typography consistency
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all()
    console.log('Headings found:', headings.length)

    const fontSizes = new Set()
    const fontWeights = new Set()
    const fontFamilies = new Set()

    for (const heading of headings) {
      const fontSize = await heading.evaluate(el => window.getComputedStyle(el).fontSize)
      const fontWeight = await heading.evaluate(el => window.getComputedStyle(el).fontWeight)
      const fontFamily = await heading.evaluate(el => window.getComputedStyle(el).fontFamily)

      fontSizes.add(fontSize)
      fontWeights.add(fontWeight)
      fontFamilies.add(fontFamily)
    }

    if (fontFamilies.size > 2) {
      issues.push({
        severity: 'Low',
        location: 'Typography',
        description: `Inconsistent font families used: ${Array.from(fontFamilies).join(', ')}`,
        screenshot: fullPagePath,
      })
    }

    // Check for broken images
    const images = await page.locator('img').all()
    for (const img of images) {
      const naturalWidth = await img.evaluate(el => el.naturalWidth)
      const src = await img.getAttribute('src')

      if (naturalWidth === 0 && src) {
        issues.push({
          severity: 'Medium',
          location: 'Images',
          description: `Broken image: ${src}`,
          screenshot: fullPagePath,
        })
      }
    }

    // Check for missing translations (text with translation keys)
    const translationKeys = await page.locator('text=/^[a-z]+\\.[a-z]+\\.[a-z]+/i').all()
    if (translationKeys.length > 0) {
      for (const key of translationKeys.slice(0, 5)) {
        const text = await key.textContent()
        issues.push({
          severity: 'High',
          location: 'Translations',
          description: `Missing translation: ${text}`,
          screenshot: fullPagePath,
        })
      }
    }

    // Check spacing and alignment
    const containers = await page.locator('.container, .wrapper, [class*="container"]').all()
    console.log('Container elements:', containers.length)

    // Check for overlapping elements
    const allElements = await page.locator('body *').all()
    console.log('Total elements on page:', allElements.length)

    // Accessibility checks
    const missingAltImages = await page.locator('img:not([alt])').all()
    if (missingAltImages.length > 0) {
      issues.push({
        severity: 'Medium',
        location: 'Accessibility',
        description: `${missingAltImages.length} images missing alt text`,
        screenshot: fullPagePath,
      })
    }

    const buttonsWithoutLabel = await page.locator('button:not([aria-label]):not(:has-text())').all()
    if (buttonsWithoutLabel.length > 0) {
      issues.push({
        severity: 'Medium',
        location: 'Accessibility',
        description: `${buttonsWithoutLabel.length} buttons without accessible labels`,
        screenshot: fullPagePath,
      })
    }

    // Check for loading states
    const loadingIndicators = await page.locator('.loading, .spinner, [data-loading]').all()
    if (loadingIndicators.length > 0) {
      issues.push({
        severity: 'Low',
        location: 'Loading State',
        description: `${loadingIndicators.length} loading indicators still visible`,
        screenshot: fullPagePath,
      })
    }

    // Take screenshot of specific sections
    const sections = [
      { selector: 'header, [role="banner"]', name: 'header' },
      { selector: 'nav, [role="navigation"]', name: 'navigation' },
      { selector: 'table', name: 'table' },
      { selector: '.filters, [data-filters]', name: 'filters' },
    ]

    for (const section of sections) {
      const element = page.locator(section.selector).first()
      if (await element.count() > 0) {
        const sectionPath = `${screenshotDir}/admin-orders-${section.name}.png`
        await element.screenshot({ path: sectionPath }).catch(() => {})
        screenshots.push({ name: section.name, path: sectionPath })
      }
    }

    // Generate report
    const report = {
      url: page.url(),
      timestamp: new Date().toISOString(),
      authenticated: true,
      pageTitle: title,
      summary: {
        totalIssues: issues.length,
        critical: issues.filter(i => i.severity === 'Critical').length,
        high: issues.filter(i => i.severity === 'High').length,
        medium: issues.filter(i => i.severity === 'Medium').length,
        low: issues.filter(i => i.severity === 'Low').length,
      },
      issues,
      screenshots,
      pageMetrics: {
        tables: tables.length,
        headings: headings.length,
        images: images.length,
        tabs: tabs.length,
        filters: filters.length,
      },
    }

    writeFileSync(
      '/Users/vladislavcaraseli/Documents/MoldovaDirect.worktrees/products-improvments/ui-inspection-report.json',
      JSON.stringify(report, null, 2),
    )

    console.log('\n=== UI INSPECTION COMPLETE ===')
    console.log(`Total issues found: ${issues.length}`)
    console.log(`Critical: ${report.summary.critical}`)
    console.log(`High: ${report.summary.high}`)
    console.log(`Medium: ${report.summary.medium}`)
    console.log(`Low: ${report.summary.low}`)
    console.log(`\nScreenshots saved to: ${screenshotDir}`)
    console.log(`Report saved to: ui-inspection-report.json`)
  }
  catch (error) {
    console.error('Error during inspection:', error)
    issues.push({
      severity: 'Critical',
      location: 'Page Load',
      description: `Error: ${error.message}`,
      screenshot: null,
    })

    const report = {
      url: 'http://localhost:3000/admin/orders',
      timestamp: new Date().toISOString(),
      error: error.message,
      issues,
      screenshots,
    }

    writeFileSync(
      '/Users/vladislavcaraseli/Documents/MoldovaDirect.worktrees/products-improvments/ui-inspection-report.json',
      JSON.stringify(report, null, 2),
    )
  }
  finally {
    await browser.close()
  }
}

inspectAdminOrdersPage()
