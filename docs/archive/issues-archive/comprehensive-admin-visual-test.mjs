import { chromium } from 'playwright'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'

const BASE_URL = 'http://localhost:3000'
const SCREENSHOT_DIR = '/Users/vladislavcaraseli/Documents/MoldovaDirect.worktrees/products-improvments/test-screenshots'
const REPORT_FILE = '/Users/vladislavcaraseli/Documents/MoldovaDirect.worktrees/products-improvments/admin-comprehensive-test-report.json'

const CREDENTIALS = {
  email: 'admin@moldovadirect.com',
  password: 'test1234',
}

const PAGES_TO_TEST = [
  { name: 'Dashboard', url: `${BASE_URL}/admin`, route: '/admin' },
  { name: 'Users', url: `${BASE_URL}/admin/users`, route: '/admin/users' },
  { name: 'Products', url: `${BASE_URL}/admin/products`, route: '/admin/products' },
  { name: 'Orders', url: `${BASE_URL}/admin/orders`, route: '/admin/orders' },
  { name: 'Analytics', url: `${BASE_URL}/admin/analytics`, route: '/admin/analytics' },
]

class AdminPageTester {
  constructor() {
    this.browser = null
    this.context = null
    this.page = null
    this.results = {
      timestamp: new Date().toISOString(),
      authentication: null,
      pages: [],
      summary: { total: PAGES_TO_TEST.length, passed: 0, failed: 0, warnings: 0 },
    }
    this.consoleMessages = []
    this.networkErrors = []
  }

  async initialize() {
    console.log('Initializing browser...')
    if (!existsSync(SCREENSHOT_DIR)) {
      mkdirSync(SCREENSHOT_DIR, { recursive: true })
    }
    this.browser = await chromium.launch({ headless: true, args: ['--disable-dev-shm-usage'] })
    this.context = await this.browser.newContext({ viewport: { width: 1920, height: 1080 }, ignoreHTTPSErrors: true })
    this.page = await this.context.newPage()

    this.page.on('console', (msg) => {
      const type = msg.type()
      const text = msg.text()
      this.consoleMessages.push({ type, text, timestamp: new Date().toISOString() })
      if (type === 'error' || type === 'warning') {
        console.log(`[CONSOLE ${type.toUpperCase()}] ${text}`)
      }
    })

    this.page.on('response', (response) => {
      const status = response.status()
      const url = response.url()
      if (status >= 400) {
        this.networkErrors.push({ url, status, statusText: response.statusText(), timestamp: new Date().toISOString() })
        console.log(`[NETWORK ERROR] ${status} - ${url}`)
      }
    })

    this.page.on('pageerror', (error) => {
      console.log(`[PAGE ERROR] ${error.message}`)
      this.consoleMessages.push({ type: 'pageerror', text: error.message, stack: error.stack, timestamp: new Date().toISOString() })
    })
  }

  async authenticate() {
    console.log('\n=== AUTHENTICATION PHASE ===')
    console.log(`Navigating to login page: ${BASE_URL}/auth/login`)
    this.consoleMessages = []
    this.networkErrors = []

    try {
      await this.page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'networkidle', timeout: 30000 })
      await this.page.screenshot({ path: join(SCREENSHOT_DIR, '00-login-page.png'), fullPage: true })

      console.log('Filling in credentials...')
      await this.page.fill('input[type="email"]', CREDENTIALS.email)
      await this.page.fill('input[type="password"]', CREDENTIALS.password)
      await this.page.screenshot({ path: join(SCREENSHOT_DIR, '00-login-filled.png'), fullPage: true })

      console.log('Submitting login form...')
      await this.page.click('button[type="submit"]')
      await this.page.waitForTimeout(3000)

      const currentUrl = this.page.url()
      const cookies = await this.context.cookies()
      await this.page.screenshot({ path: join(SCREENSHOT_DIR, '00-after-login.png'), fullPage: true })

      this.results.authentication = {
        success: currentUrl.includes('/admin') || currentUrl.includes('/account'),
        finalUrl: currentUrl,
        hasCookies: cookies.length > 0,
        cookieCount: cookies.length,
        consoleErrors: this.consoleMessages.filter(m => m.type === 'error'),
        networkErrors: [...this.networkErrors],
      }

      console.log(`Authentication result: ${this.results.authentication.success ? 'SUCCESS' : 'FAILED'}`)
      console.log(`Final URL: ${currentUrl}`)
      console.log(`Cookies found: ${cookies.length}`)

      return this.results.authentication.success
    }
    catch (error) {
      console.error('Authentication error:', error.message)
      this.results.authentication = {
        success: false,
        error: error.message,
        consoleErrors: this.consoleMessages.filter(m => m.type === 'error'),
        networkErrors: [...this.networkErrors],
      }
      return false
    }
  }

  async testPage(pageInfo) {
    console.log(`\n=== TESTING: ${pageInfo.name} ===`)
    console.log(`URL: ${pageInfo.url}`)

    this.consoleMessages = []
    this.networkErrors = []

    const pageResult = {
      name: pageInfo.name,
      url: pageInfo.url,
      route: pageInfo.route,
      timestamp: new Date().toISOString(),
      status: 'unknown',
      issues: [],
      consoleErrors: [],
      consoleWarnings: [],
      networkErrors: [],
      screenshots: [],
      loadTime: 0,
      visualChecks: {
        hasTranslationKeys: false,
        has500Error: false,
        hasMissingComponents: false,
        hasEmptyTables: false,
        hasLayoutIssues: false,
      },
    }

    try {
      const startTime = Date.now()
      console.log(`Navigating to ${pageInfo.url}...`)
      const response = await this.page.goto(pageInfo.url, { waitUntil: 'networkidle', timeout: 30000 })

      pageResult.httpStatus = response.status()
      console.log(`HTTP Status: ${pageResult.httpStatus}`)

      await this.page.waitForTimeout(3000)
      try {
        await this.page.waitForSelector('main, .admin-layout, [class*="admin"]', { timeout: 5000 })
      }
      catch (e) {
        console.log('Main content selector not found, continuing...')
      }

      pageResult.loadTime = Date.now() - startTime
      console.log(`Load time: ${pageResult.loadTime}ms`)

      const screenshotName = pageInfo.name.toLowerCase().replace(/\s+/g, '-')
      const screenshotPath = join(SCREENSHOT_DIR, `${screenshotName}-initial.png`)
      await this.page.screenshot({ path: screenshotPath, fullPage: true })
      pageResult.screenshots.push(screenshotPath)
      console.log(`Screenshot saved: ${screenshotPath}`)

      const bodyText = await this.page.textContent('body')
      const hasTranslationKeys = /\b(admin\.|account\.|common\.)[a-zA-Z0-9_.]+\b/.test(bodyText)
      pageResult.visualChecks.hasTranslationKeys = hasTranslationKeys

      if (hasTranslationKeys) {
        console.log('WARNING: Translation keys detected in page content')
        const matches = bodyText.match(/\b(admin\.|account\.|common\.)[a-zA-Z0-9_.]+\b/g)
        pageResult.issues.push({
          type: 'translation_keys',
          severity: 'high',
          description: 'Untranslated keys visible on page',
          keys: [...new Set(matches)].slice(0, 10),
        })
      }

      const has500Error = bodyText.includes('500') && (
        bodyText.includes('Server Error')
        || bodyText.includes('Internal Server')
        || bodyText.includes('Something went wrong')
      )
      pageResult.visualChecks.has500Error = has500Error

      if (has500Error) {
        console.log('ERROR: 500 error page detected')
        pageResult.issues.push({
          type: '500_error',
          severity: 'critical',
          description: '500 Internal Server Error page displayed',
        })
      }

      const errorMessages = await this.page.$$eval('[class*="error"], .error-message, [data-error]',
        elements => elements.map(el => el.textContent.trim()),
      ).catch(() => [])

      if (errorMessages.length > 0) {
        console.log(`Found ${errorMessages.length} error message(s) on page`)
        pageResult.visualChecks.hasMissingComponents = true
        pageResult.issues.push({
          type: 'error_messages',
          severity: 'high',
          description: 'Error messages found on page',
          messages: errorMessages,
        })
      }

      const tables = await this.page.$$('table')
      for (const table of tables) {
        const rows = await table.$$('tbody tr')
        if (rows.length === 0) {
          const noDataText = await table.textContent()
          if (!noDataText.includes('No data') && !noDataText.includes('No results') && !noDataText.includes('Empty')) {
            console.log('WARNING: Table with no rows detected')
            pageResult.visualChecks.hasEmptyTables = true
            pageResult.issues.push({
              type: 'empty_table',
              severity: 'medium',
              description: 'Table element found with no data rows',
            })
          }
        }
      }

      const viewportSize = this.page.viewportSize()
      const bodyBox = await this.page.$eval('body', el => ({ width: el.scrollWidth, height: el.scrollHeight }))

      const hasHorizontalScroll = bodyBox.width > viewportSize.width + 20
      if (hasHorizontalScroll) {
        console.log('WARNING: Horizontal scroll detected (potential layout issue)')
        pageResult.visualChecks.hasLayoutIssues = true
        pageResult.issues.push({
          type: 'layout_issue',
          severity: 'low',
          description: 'Horizontal scrollbar present (page wider than viewport)',
          details: { bodyWidth: bodyBox.width, viewportWidth: viewportSize.width },
        })
      }

      pageResult.consoleErrors = this.consoleMessages.filter(m => m.type === 'error' || m.type === 'pageerror').map(m => ({ text: m.text, stack: m.stack }))
      pageResult.consoleWarnings = this.consoleMessages.filter(m => m.type === 'warning').map(m => ({ text: m.text }))
      pageResult.networkErrors = [...this.networkErrors]

      if (has500Error || pageResult.httpStatus >= 500) {
        pageResult.status = 'failed'
        console.log('Status: FAILED (500 error)')
      }
      else if (hasTranslationKeys || pageResult.consoleErrors.length > 0 || pageResult.networkErrors.length > 0) {
        pageResult.status = 'warning'
        console.log('Status: WARNING (issues detected)')
      }
      else {
        pageResult.status = 'passed'
        console.log('Status: PASSED')
      }

      console.log(`Console Errors: ${pageResult.consoleErrors.length}`)
      console.log(`Console Warnings: ${pageResult.consoleWarnings.length}`)
      console.log(`Network Errors: ${pageResult.networkErrors.length}`)
      console.log(`Issues Found: ${pageResult.issues.length}`)
    }
    catch (error) {
      console.error(`ERROR testing ${pageInfo.name}:`, error.message)
      pageResult.status = 'failed'
      pageResult.error = error.message
      pageResult.issues.push({
        type: 'exception',
        severity: 'critical',
        description: 'Exception occurred during page test',
        error: error.message,
      })
    }

    return pageResult
  }

  async runAllTests() {
    console.log('Starting comprehensive admin page testing...\n')

    try {
      await this.initialize()
      const authSuccess = await this.authenticate()

      if (!authSuccess) {
        console.error('\nAuthentication failed. Cannot proceed with page tests.')
        this.results.summary.failed = PAGES_TO_TEST.length
        return this.results
      }

      console.log('\nAuthentication successful. Proceeding with page tests...')

      for (const pageInfo of PAGES_TO_TEST) {
        const pageResult = await this.testPage(pageInfo)
        this.results.pages.push(pageResult)

        if (pageResult.status === 'passed') {
          this.results.summary.passed++
        }
        else if (pageResult.status === 'warning') {
          this.results.summary.warnings++
        }
        else {
          this.results.summary.failed++
        }

        await this.page.waitForTimeout(1000)
      }

      console.log('\n=== TEST SUMMARY ===')
      console.log(`Total Pages: ${this.results.summary.total}`)
      console.log(`Passed: ${this.results.summary.passed}`)
      console.log(`Warnings: ${this.results.summary.warnings}`)
      console.log(`Failed: ${this.results.summary.failed}`)
    }
    catch (error) {
      console.error('Fatal error during testing:', error)
      this.results.fatalError = error.message
    }
    finally {
      if (this.browser) {
        await this.browser.close()
      }
    }

    return this.results
  }

  saveReport() {
    console.log(`\nSaving report to: ${REPORT_FILE}`)
    writeFileSync(REPORT_FILE, JSON.stringify(this.results, null, 2))
    console.log('Report saved successfully.')
  }

  printDetailedReport() {
    console.log('\n\n' + '='.repeat(80))
    console.log('DETAILED TEST REPORT')
    console.log('='.repeat(80))

    console.log('\n--- AUTHENTICATION ---')
    if (this.results.authentication) {
      console.log(`Status: ${this.results.authentication.success ? 'SUCCESS' : 'FAILED'}`)
      console.log(`Final URL: ${this.results.authentication.finalUrl || 'N/A'}`)
      console.log(`Console Errors: ${this.results.authentication.consoleErrors?.length || 0}`)
      console.log(`Network Errors: ${this.results.authentication.networkErrors?.length || 0}`)
    }

    console.log('\n--- PAGE RESULTS ---')
    for (const page of this.results.pages) {
      console.log(`\n${page.name} (${page.route})`)
      console.log(`  Status: ${page.status.toUpperCase()}`)
      console.log(`  HTTP Status: ${page.httpStatus || 'N/A'}`)
      console.log(`  Load Time: ${page.loadTime}ms`)
      console.log(`  Issues: ${page.issues.length}`)

      if (page.issues.length > 0) {
        console.log('  Issue Details:')
        for (const issue of page.issues) {
          console.log(`    - [${issue.severity.toUpperCase()}] ${issue.type}: ${issue.description}`)
          if (issue.keys) {
            const keyPreview = issue.keys.slice(0, 3).join(', ')
            console.log(`      Keys: ${keyPreview}${issue.keys.length > 3 ? '...' : ''}`)
          }
        }
      }

      console.log(`  Console Errors: ${page.consoleErrors.length}`)
      if (page.consoleErrors.length > 0) {
        for (const err of page.consoleErrors.slice(0, 3)) {
          console.log(`    - ${err.text}`)
        }
        if (page.consoleErrors.length > 3) {
          console.log(`    ... and ${page.consoleErrors.length - 3} more`)
        }
      }

      console.log(`  Network Errors: ${page.networkErrors.length}`)
      if (page.networkErrors.length > 0) {
        for (const err of page.networkErrors.slice(0, 3)) {
          console.log(`    - ${err.status} ${err.url}`)
        }
        if (page.networkErrors.length > 3) {
          console.log(`    ... and ${page.networkErrors.length - 3} more`)
        }
      }

      console.log(`  Screenshots: ${page.screenshots.length}`)
    }

    console.log('\n' + '='.repeat(80))
  }
}

const tester = new AdminPageTester()
tester.runAllTests()
  .then(() => {
    tester.saveReport()
    tester.printDetailedReport()
    const hasFailures = tester.results.summary.failed > 0
    process.exit(hasFailures ? 1 : 0)
  })
  .catch((error) => {
    console.error('Test execution failed:', error)
    process.exit(1)
  })
