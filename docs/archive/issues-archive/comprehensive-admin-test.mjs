import { chromium } from 'playwright'
import { writeFileSync } from 'fs'

const BASE_URL = 'http://localhost:3000'
const ADMIN_EMAIL = 'admin@moldovadirect.com'
const ADMIN_PASSWORD = 'test1234'

async function comprehensiveTest() {
  console.log('='.repeat(70))
  console.log('  COMPREHENSIVE ADMIN AUTHENTICATION TEST')
  console.log('='.repeat(70))
  console.log('')

  const browser = await chromium.launch({
    headless: false,
    slowMo: 200,
  })
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  })
  const page = await context.newPage()

  const results = {
    authentication: { status: 'PENDING', errors: [] },
    pages: [],
  }

  const networkErrors = []

  page.on('response', async (response) => {
    const url = response.url()
    const status = response.status()

    if (status >= 400) {
      const error = {
        url,
        status,
        statusText: response.statusText(),
        pageUrl: page.url(),
      }
      networkErrors.push(error)

      if (url.includes('/api/')) {
        console.log(`⚠️  API Error: ${status} ${url}`)
      }
    }

    if (url.includes('supabase') && url.includes('auth')) {
      console.log(`🔐 Supabase Auth: ${response.request().method()} ${url} - ${status}`)
    }
  })

  page.on('console', (msg) => {
    const type = msg.type()
    if (type === 'error') {
      console.log(`❌ Console Error: ${msg.text()}`)
    }
  })

  try {
    console.log('')
    console.log('-'.repeat(70))
    console.log('PHASE 1: AUTHENTICATION')
    console.log('-'.repeat(70))
    console.log('')

    console.log('1.1 Loading login page...')
    await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)
    console.log('    ✓ Login page loaded')

    console.log('')
    console.log('1.2 Filling credentials...')
    console.log(`    Email: ${ADMIN_EMAIL}`)

    await page.fill('input[type="email"]', ADMIN_EMAIL)
    await page.fill('input[type="password"]', ADMIN_PASSWORD)
    console.log('    ✓ Credentials entered')

    console.log('')
    console.log('1.3 Submitting login form...')

    const navigationPromise = page.waitForNavigation({
      timeout: 15000,
      waitUntil: 'networkidle',
    }).catch(() => null)

    await page.click('button[type="submit"]')

    await Promise.race([
      navigationPromise,
      page.waitForTimeout(10000),
    ])

    await page.waitForTimeout(3000)

    const currentUrl = page.url()
    console.log(`    Current URL: ${currentUrl}`)

    if (currentUrl.includes('/admin')) {
      console.log('    ✓ Successfully redirected to admin area')
      results.authentication.status = 'PASS'
    }
    else if (currentUrl.includes('/login')) {
      console.log('    ✗ Still on login page - authentication failed')
      results.authentication.status = 'FAIL'
      results.authentication.errors.push('Login failed - no redirect occurred')

      const content = await page.content()
      if (content.includes('error') || content.includes('Error')) {
        console.log('    ⚠️  Error message detected on page')
      }
    }
    else {
      console.log(`    ? Unexpected redirect to: ${currentUrl}`)
      results.authentication.status = 'UNKNOWN'
    }

    if (results.authentication.status === 'FAIL') {
      console.log('')
      console.log('❌ AUTHENTICATION FAILED - Cannot proceed with page tests')
      console.log('')
      throw new Error('Authentication failed')
    }

    console.log('')
    console.log('-'.repeat(70))
    console.log('PHASE 2: TESTING ADMIN PAGES')
    console.log('-'.repeat(70))
    console.log('')

    const pages = [
      { name: 'Dashboard', url: '/admin', screenshot: 'dashboard-working.png' },
      { name: 'Users', url: '/admin/users', screenshot: 'users-page-working.png' },
      { name: 'Products', url: '/admin/products', screenshot: 'products-page-working.png' },
      { name: 'Orders', url: '/admin/orders', screenshot: 'orders-page-working.png' },
      { name: 'Analytics', url: '/admin/analytics', screenshot: 'analytics-page-working.png' },
    ]

    for (let i = 0; i < pages.length; i++) {
      const pageConfig = pages[i]
      const pageNum = i + 1

      console.log(`${pageNum}. Testing ${pageConfig.name} Page`)
      console.log(`   URL: ${BASE_URL}${pageConfig.url}`)

      const result = {
        name: pageConfig.name,
        url: pageConfig.url,
        status: 'PASS',
        errors: [],
        screenshot: pageConfig.screenshot,
      }

      try {
        const beforeErrorCount = networkErrors.length

        await page.goto(`${BASE_URL}${pageConfig.url}`, {
          waitUntil: 'networkidle',
          timeout: 15000,
        })
        await page.waitForTimeout(4000)

        const finalUrl = page.url()

        if (finalUrl.includes('/login') || finalUrl.includes('/auth')) {
          result.status = 'FAIL'
          result.errors.push('Redirected to login - authentication lost')
          console.log('   ✗ FAIL: Redirected to login page')
        }
        else if (!finalUrl.includes(pageConfig.url)) {
          result.status = 'FAIL'
          result.errors.push(`Unexpected redirect to ${finalUrl}`)
          console.log(`   ✗ FAIL: Unexpected redirect`)
        }
        else {
          console.log('   ✓ Page loaded successfully')
        }

        const pageContent = await page.content()

        if (pageContent.includes('>401<') || (pageContent.includes('401') && pageContent.includes('Unauthorized'))) {
          result.status = 'FAIL'
          result.errors.push('401 Unauthorized error detected')
          console.log('   ✗ FAIL: 401 Unauthorized')
        }

        if (pageContent.includes('>500<') || (pageContent.includes('500') && pageContent.includes('Internal Server Error'))) {
          result.status = 'FAIL'
          result.errors.push('500 Internal Server Error detected')
          console.log('   ✗ FAIL: 500 Server Error')
        }

        const newErrors = networkErrors.slice(beforeErrorCount)
        const apiErrors = newErrors.filter(e => e.url.includes('/api/'))

        if (apiErrors.length > 0) {
          result.status = 'FAIL'
          apiErrors.forEach((err) => {
            const errorMsg = `${err.status} - ${err.url}`
            result.errors.push(errorMsg)
          })
          console.log(`   ✗ FAIL: ${apiErrors.length} API error(s)`)
        }

        const screenshotPath = `/Users/vladislavcaraseli/Documents/MoldovaDirect.worktrees/products-improvments/test-screenshots/${pageConfig.screenshot}`
        await page.screenshot({ path: screenshotPath, fullPage: true })
        console.log(`   📸 Screenshot: ${pageConfig.screenshot}`)

        if (result.status === 'PASS') {
          console.log(`   ✅ PASS`)
        }
      }
      catch (error) {
        result.status = 'FAIL'
        result.errors.push(`Test error: ${error.message}`)
        console.log(`   ✗ FAIL: ${error.message}`)
      }

      results.pages.push(result)
      console.log('')
    }
  }
  catch (error) {
    console.error('\n❌ Critical test failure:', error.message)
  }
  finally {
    await browser.close()
  }

  console.log('')
  console.log('='.repeat(70))
  console.log('  TEST RESULTS SUMMARY')
  console.log('='.repeat(70))
  console.log('')

  const report = {
    timestamp: new Date().toISOString(),
    authentication: results.authentication,
    totalPages: results.pages.length,
    passed: results.pages.filter(r => r.status === 'PASS').length,
    failed: results.pages.filter(r => r.status === 'FAIL').length,
    results: results.pages,
  }

  writeFileSync(
    '/Users/vladislavcaraseli/Documents/MoldovaDirect.worktrees/products-improvments/admin-test-report.json',
    JSON.stringify(report, null, 2),
  )

  console.log('| Page       | Status | Errors     | Screenshot              |')
  console.log('|------------|--------|------------|-------------------------|')

  results.pages.forEach((result) => {
    const status = result.status === 'PASS' ? '✓' : '✗'
    const errorCount = result.errors.length
    const errorSummary = errorCount > 0 ? `${errorCount} error(s)` : 'None'
    const name = (result.name + ' '.repeat(10)).substring(0, 10)
    const statusCol = (status + ' '.repeat(6)).substring(0, 6)
    const errCol = (errorSummary + ' '.repeat(10)).substring(0, 10)
    console.log(`| ${name} | ${statusCol} | ${errCol} | ${result.screenshot}`)
  })

  console.log('')

  const failedResults = results.pages.filter(r => r.status === 'FAIL')
  if (failedResults.length > 0) {
    console.log('DETAILED ERROR REPORT:')
    console.log('-'.repeat(70))
    failedResults.forEach((result) => {
      console.log(`\n${result.name} Page:`)
      result.errors.forEach(err => console.log(`  • ${err}`))
    })
    console.log('')
  }
  else {
    console.log('✅ ALL TESTS PASSED!')
    console.log('   All admin pages loaded successfully without errors.')
    console.log('')
  }

  console.log('-'.repeat(70))
  console.log(`FINAL RESULT: ${report.passed}/${report.totalPages} pages passed`)
  console.log('='.repeat(70))
  console.log('')
  console.log(`📄 Full report: admin-test-report.json`)
  console.log(`📁 Screenshots: test-screenshots/`)
  console.log('')

  process.exit(failedResults.length > 0 ? 1 : 0)
}

comprehensiveTest().catch(console.error)
