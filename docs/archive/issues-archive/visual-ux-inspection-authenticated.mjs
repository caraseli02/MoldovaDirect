import { chromium } from 'playwright'
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

const BASE_URL = 'http://localhost:3000'
const SCREENSHOTS_DIR = './ux-inspection-screenshots'

try {
  mkdirSync(SCREENSHOTS_DIR, { recursive: true })
}
catch (e) {}

async function inspectAdminUsersPageAuthenticated() {
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
    authenticationStatus: 'pending',
  }

  try {
    console.log('Step 1: Navigating to login page...')
    await page.goto(BASE_URL + '/auth/login', { waitUntil: 'networkidle', timeout: 30000 })

    console.log('Step 2: Attempting to login with test credentials...')
    // Fill in login form - using common admin test credentials
    await page.fill('input[type="email"], input[name="email"]', 'admin@moldovadirect.com')
    await page.fill('input[type="password"], input[name="password"]', 'admin123')

    // Take screenshot of login form
    await page.screenshot({ path: join(SCREENSHOTS_DIR, '00-login-form.png') })
    report.screenshots.push({ name: '00-login-form.png', description: 'Login form filled' })

    // Click login button
    const loginButton = page.locator('button:has-text("Iniciar Sesión")').first()
    await loginButton.click()

    console.log('Step 3: Waiting for login to complete...')
    await page.waitForTimeout(3000)

    // Check if we're still on login page or redirected
    const currentUrl = page.url()
    console.log('Current URL after login attempt: ' + currentUrl)

    if (currentUrl.includes('/auth/login')) {
      report.authenticationStatus = 'failed'
      report.issues.push({
        severity: 'CRITICAL',
        category: 'Authentication',
        location: 'Login page',
        description: 'Unable to authenticate - login failed',
        details: 'Still on login page after submitting credentials',
        screenshot: '00-login-form.png',
      })
    }
    else {
      report.authenticationStatus = 'success'

      // Now navigate to admin users page
      console.log('Step 4: Navigating to admin users page...')
      const response = await page.goto(BASE_URL + '/admin/users', {
        waitUntil: 'networkidle',
        timeout: 30000,
      })

      const statusCode = response ? response.status() : 'unknown'
      console.log('Page loaded with status: ' + statusCode)

      await page.waitForTimeout(2000)

      // Take screenshots
      const fullPagePath = join(SCREENSHOTS_DIR, '01-full-page-authenticated.png')
      await page.screenshot({ path: fullPagePath, fullPage: true })
      report.screenshots.push({ name: '01-full-page-authenticated.png', description: 'Full page view (authenticated)' })
      console.log('Full page screenshot taken')

      const viewportPath = join(SCREENSHOTS_DIR, '02-viewport-authenticated.png')
      await page.screenshot({ path: viewportPath, fullPage: false })
      report.screenshots.push({ name: '02-viewport-authenticated.png', description: 'Viewport view (authenticated)' })
      console.log('Viewport screenshot taken')

      const pageTitle = await page.title()
      console.log('Page title: ' + pageTitle)

      // Comprehensive UI analysis
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
          textContent: { headings: [], buttons: [], labels: [], tableHeaders: [] },
          bodyClasses: document.body.className,
          mainContentVisible: false,
        }

        results.hasMainLayout = !!document.querySelector('main, [role="main"], .layout, .admin-layout')
        results.hasSidebar = !!document.querySelector('aside, .sidebar, nav[class*="sidebar"]')
        results.hasHeader = !!document.querySelector('header, [role="banner"], .header')
        results.hasTable = !!document.querySelector('table, .table, [role="table"]')
        results.hasPagination = !!document.querySelector('.pagination, [aria-label*="pagination"], button[aria-label*="page"]')
        results.hasSearchFilters = !!document.querySelector('input[type="search"], .search, .filter')

        const main = document.querySelector('main')
        if (main) {
          const styles = window.getComputedStyle(main)
          results.mainContentVisible = styles.display !== 'none' && styles.visibility !== 'hidden'
        }

        const allText = document.body.innerText || ''
        const translationKeyPattern = /\b([a-z]+\.[a-z.]+)\b/g
        const matches = allText.match(translationKeyPattern)
        if (matches) {
          results.translationKeys = [...new Set(matches)].filter((key) => {
            return key.split('.').length >= 2 && !key.startsWith('www')
          }).slice(0, 20)
        }

        document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((h) => {
          const text = h.textContent ? h.textContent.trim() : ''
          results.textContent.headings.push({
            tag: h.tagName.toLowerCase(),
            text: text,
            className: h.className,
          })
        })

        document.querySelectorAll('th, [role="columnheader"]').forEach((th) => {
          const text = th.textContent ? th.textContent.trim() : ''
          results.textContent.tableHeaders.push(text)
        })

        document.querySelectorAll('button:not([aria-hidden="true"])').forEach((btn) => {
          const text = btn.textContent ? btn.textContent.trim() : ''
          if (text) {
            results.textContent.buttons.push({
              text: text,
              className: btn.className,
              disabled: btn.hasAttribute('disabled'),
              visible: window.getComputedStyle(btn).display !== 'none',
            })
          }
        })

        return results
      })

      console.log('Layout analysis complete')
      console.log('Has table: ' + layoutAnalysis.hasTable)
      console.log('Table headers: ' + JSON.stringify(layoutAnalysis.textContent.tableHeaders))

      const componentChecks = await page.evaluate(() => {
        return {
          tableHeaders: Array.from(document.querySelectorAll('th, [role="columnheader"]')).map(th => th.textContent ? th.textContent.trim() : ''),
          tableRows: document.querySelectorAll('tbody tr, [role="table"] [role="row"]').length,
          dataCells: document.querySelectorAll('td, [role="cell"]').length,
          inputFields: document.querySelectorAll('input:not([type="hidden"])').length,
          buttons: document.querySelectorAll('button:not([aria-hidden="true"])').length,
          links: document.querySelectorAll('a').length,
          errorMessages: Array.from(document.querySelectorAll('[class*="error"], [role="alert"]')).map(el => el.textContent ? el.textContent.trim() : ''),
          loadingIndicators: document.querySelectorAll('[class*="loading"], [class*="spinner"], [aria-busy="true"]').length,
          emptyStates: Array.from(document.querySelectorAll('[class*="empty"]')).map(el => el.textContent ? el.textContent.trim() : ''),
        }
      })

      console.log('Component checks:', JSON.stringify(componentChecks))

      // Take component screenshots
      const tableElement = await page.locator('table, [role="table"]').first()
      if (await tableElement.count() > 0) {
        const tablePath = join(SCREENSHOTS_DIR, '03-table-authenticated.png')
        await tableElement.screenshot({ path: tablePath })
        report.screenshots.push({ name: '03-table-authenticated.png', description: 'Users table' })
        console.log('Table screenshot taken')
      }

      const sidebar = await page.locator('aside, .sidebar, nav[class*="sidebar"]').first()
      if (await sidebar.count() > 0) {
        const sidebarPath = join(SCREENSHOTS_DIR, '04-sidebar.png')
        await sidebar.screenshot({ path: sidebarPath })
        report.screenshots.push({ name: '04-sidebar.png', description: 'Admin sidebar navigation' })
        console.log('Sidebar screenshot taken')
      }

      const header = await page.locator('header, [role="banner"]').first()
      if (await header.count() > 0) {
        const headerPath = join(SCREENSHOTS_DIR, '05-header-authenticated.png')
        await header.screenshot({ path: headerPath })
        report.screenshots.push({ name: '05-header-authenticated.png', description: 'Page header' })
        console.log('Header screenshot taken')
      }

      // Analyze issues
      if (layoutAnalysis.translationKeys.length > 0) {
        report.issues.push({
          severity: 'HIGH',
          category: 'Translation',
          location: 'Page content',
          description: 'Translation keys visible instead of translated text',
          details: 'Found translation keys: ' + layoutAnalysis.translationKeys.join(', '),
          screenshot: '01-full-page-authenticated.png',
        })
      }

      if (!layoutAnalysis.hasTable) {
        report.issues.push({
          severity: 'CRITICAL',
          category: 'Components',
          location: 'Main content area',
          description: 'Users table not rendering',
          details: 'No table element found. Table rows: ' + componentChecks.tableRows + ', Data cells: ' + componentChecks.dataCells,
          screenshot: '01-full-page-authenticated.png',
        })
      }
      else if (componentChecks.tableRows === 0) {
        report.issues.push({
          severity: 'HIGH',
          category: 'Data',
          location: 'Users table',
          description: 'Table is empty - no user data displayed',
          details: 'Table element exists but contains 0 rows',
          screenshot: '03-table-authenticated.png',
        })
      }

      if (!layoutAnalysis.hasSidebar) {
        report.issues.push({
          severity: 'HIGH',
          category: 'Navigation',
          location: 'Page layout',
          description: 'Admin sidebar navigation missing',
          details: 'No sidebar navigation element detected',
          screenshot: '01-full-page-authenticated.png',
        })
      }

      if (!layoutAnalysis.hasPagination && componentChecks.tableRows > 10) {
        report.issues.push({
          severity: 'MEDIUM',
          category: 'Components',
          location: 'Below table',
          description: 'Pagination controls missing',
          details: 'No pagination detected for data table',
          screenshot: '01-full-page-authenticated.png',
        })
      }

      if (componentChecks.errorMessages.length > 0) {
        report.issues.push({
          severity: 'HIGH',
          category: 'Errors',
          location: 'Page content',
          description: 'Error messages displayed',
          details: componentChecks.errorMessages.join('; '),
          screenshot: '01-full-page-authenticated.png',
        })
      }

      if (componentChecks.loadingIndicators > 0) {
        report.issues.push({
          severity: 'MEDIUM',
          category: 'Performance',
          location: 'Various',
          description: 'Loading indicators stuck',
          details: componentChecks.loadingIndicators + ' loading indicators still visible',
          screenshot: '01-full-page-authenticated.png',
        })
      }

      report.rawData = {
        layoutAnalysis,
        componentChecks,
        pageTitle,
      }
    }

    console.log('Inspection complete. Found ' + report.issues.length + ' issues.')
  }
  catch (error) {
    console.error('Error during inspection:', error)
    report.error = error.message
    report.errorStack = error.stack

    try {
      const errorPath = join(SCREENSHOTS_DIR, 'error-state.png')
      await page.screenshot({ path: errorPath, fullPage: true })
      report.screenshots.push({ name: 'error-state.png', description: 'Error state' })
    }
    catch (e) {}
  }
  finally {
    await browser.close()
  }

  const reportPath = join(SCREENSHOTS_DIR, 'ux-inspection-authenticated-report.json')
  writeFileSync(reportPath, JSON.stringify(report, null, 2))
  console.log('Report saved to: ' + reportPath)

  return report
}

inspectAdminUsersPageAuthenticated()
  .then((report) => {
    console.log('\n=== AUTHENTICATED UX INSPECTION SUMMARY ===')
    console.log('Authentication status: ' + report.authenticationStatus)
    console.log('Total issues found: ' + report.issues.length)
    console.log('Screenshots captured: ' + report.screenshots.length)

    if (report.issues.length > 0) {
      console.log('\nIssues by severity:')
      const bySeverity = {}
      report.issues.forEach((issue) => {
        bySeverity[issue.severity] = (bySeverity[issue.severity] || 0) + 1
      })
      Object.keys(bySeverity).forEach((severity) => {
        console.log('  ' + severity + ': ' + bySeverity[severity])
      })
    }

    process.exit(0)
  })
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
