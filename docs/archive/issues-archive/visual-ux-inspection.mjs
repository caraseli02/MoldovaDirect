import { chromium } from 'playwright'
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

const BASE_URL = 'http://localhost:3000'
const SCREENSHOTS_DIR = './ux-inspection-screenshots'

try {
  mkdirSync(SCREENSHOTS_DIR, { recursive: true })
}
catch (_e) {
  // Suppress errors
}

async function inspectAdminUsersPage() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  })

  const page = await context.newPage()

  const report = {
    url: BASE_URL + '/admin/users',
    timestamp: new Date().toISOString(),
    issues: [],
    screenshots: [],
  }

  try {
    console.log('Navigating to admin users page...')

    const response = await page.goto(BASE_URL + '/admin/users', {
      waitUntil: 'networkidle',
      timeout: 30000,
    })

    const statusCode = response ? response.status() : 'unknown'
    console.log('Page loaded with status: ' + statusCode)

    await page.waitForTimeout(2000)

    const fullPagePath = join(SCREENSHOTS_DIR, '01-full-page.png')
    await page.screenshot({ path: fullPagePath, fullPage: true })
    report.screenshots.push({ name: '01-full-page.png', description: 'Full page view' })
    console.log('Full page screenshot taken')

    const viewportPath = join(SCREENSHOTS_DIR, '02-viewport.png')
    await page.screenshot({ path: viewportPath, fullPage: false })
    report.screenshots.push({ name: '02-viewport.png', description: 'Viewport view' })
    console.log('Viewport screenshot taken')

    const pageTitle = await page.title()
    console.log('Page title: ' + pageTitle)

    const layoutAnalysis = await page.evaluate(() => {
      const results = {
        hasMainLayout: false,
        hasSidebar: false,
        hasHeader: false,
        hasTable: false,
        hasPagination: false,
        hasSearchFilters: false,
        translationKeys: [],
        missingImages: [],
        brokenElements: [],
        textContent: { headings: [], buttons: [], labels: [] },
      }

      results.hasMainLayout = !!document.querySelector('main, [role="main"], .layout, .admin-layout')
      results.hasSidebar = !!document.querySelector('aside, .sidebar, nav[class*="sidebar"]')
      results.hasHeader = !!document.querySelector('header, [role="banner"], .header')
      results.hasTable = !!document.querySelector('table, .table, [role="table"]')
      results.hasPagination = !!document.querySelector('.pagination, [aria-label*="pagination"], button[aria-label*="page"]')
      results.hasSearchFilters = !!document.querySelector('input[type="search"], .search, .filter')

      const allText = document.body.innerText || ''
      const translationKeyPattern = /\b([a-z]+\.[a-z.]+|[A-Z_]{3,})\b/g
      const matches = allText.match(translationKeyPattern)
      if (matches) {
        results.translationKeys = [...new Set(matches)].slice(0, 20)
      }

      document.querySelectorAll('img').forEach((img) => {
        if (!img.complete || img.naturalHeight === 0) {
          results.missingImages.push(img.src || img.alt || 'unknown')
        }
      })

      document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((h) => {
        const text = h.textContent ? h.textContent.trim() : ''
        results.textContent.headings.push({
          tag: h.tagName.toLowerCase(),
          text: text,
          className: h.className,
        })
      })

      document.querySelectorAll('button, a[role="button"], .btn').forEach((btn) => {
        const text = btn.textContent ? btn.textContent.trim() : ''
        results.textContent.buttons.push({
          text: text,
          className: btn.className,
          disabled: btn.hasAttribute('disabled'),
        })
      })

      document.querySelectorAll('label, .label').forEach((label) => {
        const text = label.textContent ? label.textContent.trim() : ''
        results.textContent.labels.push({
          text: text,
          htmlFor: label.getAttribute('for'),
        })
      })

      return results
    })

    console.log('Layout analysis complete')

    const componentChecks = await page.evaluate(() => {
      return {
        tableHeaders: Array.from(document.querySelectorAll('th, [role="columnheader"]')).map(th => th.textContent ? th.textContent.trim() : ''),
        tableRows: document.querySelectorAll('tr, [role="row"]').length,
        inputFields: document.querySelectorAll('input').length,
        selectFields: document.querySelectorAll('select').length,
        buttons: document.querySelectorAll('button').length,
        links: document.querySelectorAll('a').length,
        forms: document.querySelectorAll('form').length,
        errorMessages: Array.from(document.querySelectorAll('[class*="error"], [role="alert"]')).map(el => el.textContent ? el.textContent.trim() : ''),
        loadingIndicators: document.querySelectorAll('[class*="loading"], [class*="spinner"], [aria-busy="true"]').length,
      }
    })

    console.log('Component checks complete')

    const tableElement = await page.locator('table, [role="table"]').first()
    if (await tableElement.count() > 0) {
      const tablePath = join(SCREENSHOTS_DIR, '03-table-area.png')
      await tableElement.screenshot({ path: tablePath })
      report.screenshots.push({ name: '03-table-area.png', description: 'Table component' })
      console.log('Table screenshot taken')
    }

    const header = await page.locator('header, nav, [role="banner"]').first()
    if (await header.count() > 0) {
      const headerPath = join(SCREENSHOTS_DIR, '04-header.png')
      await header.screenshot({ path: headerPath })
      report.screenshots.push({ name: '04-header.png', description: 'Header/Navigation' })
      console.log('Header screenshot taken')
    }

    if (layoutAnalysis.translationKeys.length > 0) {
      report.issues.push({
        severity: 'HIGH',
        category: 'Translation',
        location: 'Page content',
        description: 'Translation keys visible instead of translated text',
        details: 'Found ' + layoutAnalysis.translationKeys.length + ' potential translation keys',
        screenshot: '01-full-page.png',
      })
    }

    if (!layoutAnalysis.hasMainLayout) {
      report.issues.push({
        severity: 'CRITICAL',
        category: 'Layout',
        location: 'Page structure',
        description: 'Missing main layout container',
        details: 'No main layout element detected',
        screenshot: '01-full-page.png',
      })
    }

    if (!layoutAnalysis.hasTable) {
      report.issues.push({
        severity: 'CRITICAL',
        category: 'Components',
        location: 'Main content area',
        description: 'Table component not rendering',
        details: 'No table element found on users page',
        screenshot: '01-full-page.png',
      })
    }

    if (!layoutAnalysis.hasPagination) {
      report.issues.push({
        severity: 'MEDIUM',
        category: 'Components',
        location: 'Bottom of page',
        description: 'Missing pagination controls',
        details: 'No pagination component detected',
        screenshot: '01-full-page.png',
      })
    }

    if (componentChecks.errorMessages.length > 0) {
      report.issues.push({
        severity: 'HIGH',
        category: 'Errors',
        location: 'Page content',
        description: 'Error messages displayed',
        details: componentChecks.errorMessages.join('; '),
        screenshot: '01-full-page.png',
      })
    }

    report.rawData = {
      layoutAnalysis,
      componentChecks,
      pageTitle,
    }

    console.log('Inspection complete. Found ' + report.issues.length + ' issues.')
  }
  catch (error) {
    console.error('Error during inspection:', error)
    report.error = error.message

    try {
      const errorPath = join(SCREENSHOTS_DIR, 'error-state.png')
      await page.screenshot({ path: errorPath, fullPage: true })
      report.screenshots.push({ name: 'error-state.png', description: 'Error state' })
    }
    catch (_e) {
      // Suppress errors
    }
  }
  finally {
    await browser.close()
  }

  const reportPath = join(SCREENSHOTS_DIR, 'ux-inspection-report.json')
  writeFileSync(reportPath, JSON.stringify(report, null, 2))
  console.log('Report saved to: ' + reportPath)

  return report
}

inspectAdminUsersPage()
  .then((report) => {
    console.log('\n=== UX INSPECTION SUMMARY ===')
    console.log('Total issues found: ' + report.issues.length)
    console.log('Screenshots captured: ' + report.screenshots.length)
    process.exit(0)
  })
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
