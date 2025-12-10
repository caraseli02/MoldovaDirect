import { chromium } from 'playwright'
import { writeFileSync } from 'fs'
import { join } from 'path'

const BASE_URL = 'http://localhost:3000'
const SCREENSHOT_DIR = '/Users/vladislavcaraseli/Documents/MoldovaDirect.worktrees/products-improvments/test-screenshots'

const ADMIN_PAGES = [
  { name: 'Dashboard', url: '/admin', slug: 'dashboard' },
  { name: 'Users', url: '/admin/users', slug: 'users' },
  { name: 'Products', url: '/admin/products', slug: 'products' },
  { name: 'Orders', url: '/admin/orders', slug: 'orders' },
  { name: 'Analytics', url: '/admin/analytics', slug: 'analytics' },
]

async function runComprehensiveTest() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  })
  const page = await context.newPage()

  const results = {
    timestamp: new Date().toISOString(),
    testRun: 'Final Admin Pages Verification',
    pages: [],
    summary: {
      total: 5,
      passed: 0,
      failed: 0,
    },
  }

  console.log('\n' + '='.repeat(50))
  console.log('COMPREHENSIVE ADMIN PAGES VERIFICATION TEST')
  console.log('='.repeat(50) + '\n')

  const consoleErrors = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text())
    }
  })

  try {
    console.log('Step 1: Logging in...')
    await page.goto(BASE_URL + '/auth/login', { waitUntil: 'networkidle', timeout: 30000 })

    await page.fill('input[type="email"]', 'admin@moldovadirect.com')
    await page.fill('input[type="password"]', 'Admin123!@#')
    await page.click('button[type="submit"]')

    await page.waitForTimeout(3000)
    console.log('Login successful\n')

    for (const adminPage of ADMIN_PAGES) {
      console.log('='.repeat(50))
      console.log('Testing: ' + adminPage.name + ' (' + adminPage.url + ')')
      console.log('='.repeat(50))

      const pageResult = {
        name: adminPage.name,
        url: adminPage.url,
        slug: adminPage.slug,
        status: 'UNKNOWN',
        httpStatus: null,
        loadTime: null,
        errors: [],
        warnings: [],
        checks: {
          pageLoads: false,
          no500Error: false,
          noDynamicImportError: false,
          dataDisplays: false,
          uiComponentsRender: false,
          noConsoleCriticalErrors: false,
        },
        screenshot: null,
      }

      consoleErrors.length = 0

      try {
        const startTime = Date.now()

        const response = await page.goto(BASE_URL + adminPage.url, {
          waitUntil: 'networkidle',
          timeout: 30000,
        })

        const loadTime = Date.now() - startTime
        pageResult.loadTime = loadTime
        pageResult.httpStatus = response.status()

        console.log('   HTTP Status: ' + response.status())
        console.log('   Load Time: ' + loadTime + 'ms')

        pageResult.checks.pageLoads = response.status() === 200
        console.log('   Page Loads: ' + (pageResult.checks.pageLoads ? 'YES' : 'NO'))

        pageResult.checks.no500Error = response.status() !== 500
        console.log('   No 500 Error: ' + (pageResult.checks.no500Error ? 'YES' : 'NO'))

        await page.waitForTimeout(3000)

        const dynamicImportErrors = consoleErrors.filter(err =>
          err.includes('Unknown variable dynamic import')
          || err.includes('dynamic import'),
        )
        pageResult.checks.noDynamicImportError = dynamicImportErrors.length === 0
        console.log('   No Dynamic Import Errors: ' + (pageResult.checks.noDynamicImportError ? 'YES' : 'NO'))

        if (dynamicImportErrors.length > 0) {
          pageResult.errors.push(...dynamicImportErrors)
        }

        const hasContent = await page.evaluate(() => {
          const body = document.body.innerText
          return body.length > 200 && !body.includes('Error loading')
        })
        pageResult.checks.dataDisplays = hasContent
        console.log('   Data Displays: ' + (pageResult.checks.dataDisplays ? 'YES' : 'NO'))

        const hasUIComponents = await page.evaluate(() => {
          const hasButtons = document.querySelectorAll('button').length > 0
          const hasCards = document.querySelectorAll('[class*="card"]').length > 0
            || document.querySelectorAll('[class*="Card"]').length > 0
          const hasTables = document.querySelectorAll('table').length > 0
          return hasButtons || hasCards || hasTables
        })
        pageResult.checks.uiComponentsRender = hasUIComponents
        console.log('   UI Components Render: ' + (pageResult.checks.uiComponentsRender ? 'YES' : 'NO'))

        const criticalErrors = consoleErrors.filter(err =>
          !err.includes('[vite]')
          && !err.includes('WebSocket')
          && !err.includes('HMR'),
        )
        pageResult.checks.noConsoleCriticalErrors = criticalErrors.length === 0
        console.log('   No Critical Console Errors: ' + (pageResult.checks.noConsoleCriticalErrors ? 'YES' : 'NO'))

        if (criticalErrors.length > 0) {
          pageResult.warnings.push('Found ' + criticalErrors.length + ' console errors')
          pageResult.errors.push(...criticalErrors.slice(0, 3))
        }

        const screenshotPath = join(SCREENSHOT_DIR, 'success-admin-' + pageResult.slug + '.png')
        await page.screenshot({ path: screenshotPath, fullPage: true })
        pageResult.screenshot = screenshotPath
        console.log('   Screenshot saved: ' + screenshotPath)

        const allChecksPassed = Object.values(pageResult.checks).every(check => check === true)
        pageResult.status = allChecksPassed ? 'SUCCESS' : 'PARTIAL'

        if (pageResult.httpStatus !== 200) {
          pageResult.status = 'FAILURE'
        }

        console.log('\n   Overall Status: ' + pageResult.status)
      }
      catch (error) {
        pageResult.status = 'FAILURE'
        pageResult.errors.push(error.message)
        console.log('   ERROR: ' + error.message)
      }

      results.pages.push(pageResult)

      if (pageResult.status === 'SUCCESS') {
        results.summary.passed++
      }
      else {
        results.summary.failed++
      }

      console.log('')
    }
  }
  catch (error) {
    console.error('\nTest execution failed:', error.message)
  }
  finally {
    await browser.close()
  }

  console.log('\n' + '='.repeat(50))
  console.log('FINAL TEST RESULTS SUMMARY')
  console.log('='.repeat(50))
  console.log('\nTotal Pages Tested: ' + results.summary.total)
  console.log('Passed: ' + results.summary.passed)
  console.log('Failed: ' + results.summary.failed)
  console.log('\nSuccess Rate: ' + results.summary.passed + '/' + results.summary.total + ' (' + Math.round(results.summary.passed / results.summary.total * 100) + '%)\n')

  console.log('\n' + '='.repeat(50))
  console.log('DETAILED RESULTS BY PAGE')
  console.log('='.repeat(50) + '\n')

  results.pages.forEach((page, index) => {
    const statusIcon = page.status === 'SUCCESS' ? 'PASS' : page.status === 'PARTIAL' ? 'PARTIAL' : 'FAIL'
    console.log((index + 1) + '. [' + statusIcon + '] ' + page.name + ' (' + page.url + ')')
    console.log('   Status: ' + page.status)
    console.log('   HTTP: ' + (page.httpStatus || 'N/A'))
    console.log('   Load Time: ' + (page.loadTime ? page.loadTime + 'ms' : 'N/A'))

    const checksCount = Object.values(page.checks).filter(v => v === true).length
    console.log('   Checks Passed: ' + checksCount + '/6')

    if (page.errors.length > 0) {
      console.log('   Errors: ' + page.errors.length)
      page.errors.slice(0, 2).forEach((err) => {
        console.log('      - ' + err.substring(0, 80))
      })
    }
    console.log('')
  })

  const reportPath = '/Users/vladislavcaraseli/Documents/MoldovaDirect.worktrees/products-improvments/final-admin-test-report.json'
  writeFileSync(reportPath, JSON.stringify(results, null, 2))
  console.log('\nFull report saved: ' + reportPath)

  console.log('\n' + '='.repeat(50))
  if (results.summary.passed === results.summary.total) {
    console.log('ALL TESTS PASSED! FIX IS COMPLETE!')
  }
  else if (results.summary.passed > 0) {
    console.log('PARTIAL SUCCESS - Some issues remain')
  }
  else {
    console.log('ALL TESTS FAILED - Critical issues detected')
  }
  console.log('='.repeat(50) + '\n')

  return results
}

runComprehensiveTest().catch(console.error)
