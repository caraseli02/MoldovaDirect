import { chromium } from 'playwright'
import { writeFileSync } from 'fs'
import { mkdir } from 'fs/promises'

const BASE_URL = 'http://localhost:3000'
const CREDENTIALS = {
  email: 'admin@moldovadirect.com',
  password: 'Admin123!@#',
}

const ADMIN_PAGES = [
  { name: 'Dashboard', url: '/admin', key: 'dashboard' },
  { name: 'Users', url: '/admin/users', key: 'users' },
  { name: 'Products', url: '/admin/products', key: 'products' },
  { name: 'Orders', url: '/admin/orders', key: 'orders' },
  { name: 'Analytics', url: '/admin/analytics', key: 'analytics' },
]

async function testAdminPages() {
  const results = {
    timestamp: new Date().toISOString(),
    success: true,
    pages: [],
  }

  console.log('Starting Direct Admin Pages Test\n')
  console.log('============================================================')

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  })
  const page = await context.newPage()

  const consoleLogs = []
  page.on('console', (msg) => {
    const text = msg.text()
    const type = msg.type()
    consoleLogs.push({ type, text })
  })

  try {
    await mkdir('/Users/vladislavcaraseli/Documents/MoldovaDirect.worktrees/products-improvments/test-screenshots', { recursive: true })

    console.log('\nStep 1: Logging in...')
    await page.goto(BASE_URL + '/auth/login', { waitUntil: 'networkidle', timeout: 30000 })

    await page.fill('input[type="email"]', CREDENTIALS.email)
    await page.fill('input[type="password"]', CREDENTIALS.password)
    await page.click('button[type="submit"]')

    await page.waitForTimeout(3000)

    const currentUrl = page.url()
    console.log('   After login, current URL: ' + currentUrl)

    if (currentUrl.includes('/admin')) {
      console.log('   Login successful - redirected to admin')
    }
    else if (currentUrl.includes('/account')) {
      console.log('   Warning: Redirected to /account, not /admin')
      console.log('   Will attempt to navigate to admin pages directly...')
    }
    else {
      console.log('   Warning: Unexpected redirect to: ' + currentUrl)
    }

    console.log('\nStep 2: Testing Admin Pages\n')

    for (const adminPage of ADMIN_PAGES) {
      console.log('\nTesting ' + adminPage.name + ' Page (' + adminPage.url + ')')
      console.log('------------------------------------------------------------')

      consoleLogs.length = 0

      const pageResult = {
        name: adminPage.name,
        url: adminPage.url,
        status: 'unknown',
        errors: [],
        warnings: [],
        loadTime: 0,
        hasImportErrors: false,
        has500Error: false,
        componentsRendered: false,
        screenshot: 'fixed-admin-' + adminPage.key + '.png',
        finalUrl: '',
      }

      try {
        const startTime = Date.now()

        const response = await page.goto(BASE_URL + adminPage.url, {
          waitUntil: 'networkidle',
          timeout: 30000,
        })

        pageResult.loadTime = Date.now() - startTime
        pageResult.finalUrl = page.url()

        const status = response.status()
        pageResult.httpStatus = status

        console.log('   Final URL: ' + pageResult.finalUrl)
        console.log('   HTTP Status: ' + status)

        if (status === 500) {
          pageResult.has500Error = true
          pageResult.status = 'failed'
          console.log('   [FAIL] HTTP 500 Error detected')
        }

        if (pageResult.finalUrl.includes('/auth/login')) {
          console.log('   [FAIL] Redirected to login - authentication issue')
          pageResult.status = 'failed'
          pageResult.errors.push('Redirected to login page - authentication failed')
        }

        await page.waitForTimeout(2000)

        const importErrors = consoleLogs.filter(log =>
          log.type === 'error'
          && (log.text.includes('Unknown variable dynamic import')
            || log.text.includes('Failed to fetch dynamically imported module')
            || (log.text.includes('import') && log.text.includes('error'))),
        )

        if (importErrors.length > 0) {
          pageResult.hasImportErrors = true
          pageResult.status = 'failed'
          pageResult.errors.push(...importErrors.map(e => e.text))
          console.log('   [FAIL] Import errors found: ' + importErrors.length)
          importErrors.forEach(err => console.log('      - ' + err.text.substring(0, 120)))
        }
        else {
          console.log('   [PASS] No import errors detected')
        }

        const allErrors = consoleLogs.filter(log =>
          log.type === 'error'
          && !log.text.includes('Cart initialization')
          && !log.text.includes('useCartStore'),
        )

        if (allErrors.length > 0) {
          pageResult.errors.push(...allErrors.map(e => e.text))
          console.log('   [WARN] Console errors: ' + allErrors.length)
          if (allErrors.length <= 2) {
            allErrors.forEach(err => console.log('      - ' + err.text.substring(0, 120)))
          }
        }

        const bodyText = await page.textContent('body')
        const hasErrorPage = bodyText.includes('Server Error')
          || bodyText.includes('Something went wrong')
          || (bodyText.includes('500') && bodyText.includes('error'))

        if (hasErrorPage) {
          pageResult.status = 'failed'
          console.log('   [FAIL] Error page content detected')
        }

        let keyElements = []
        switch (adminPage.key) {
          case 'dashboard':
            keyElements = ['Dashboard', 'Overview']
            break
          case 'users':
            keyElements = ['Users', 'Email']
            break
          case 'products':
            keyElements = ['Products', 'Product']
            break
          case 'orders':
            keyElements = ['Orders', 'Order']
            break
          case 'analytics':
            keyElements = ['Analytics', 'Revenue']
            break
        }

        let elementsFound = 0
        for (const element of keyElements) {
          if (bodyText.includes(element)) {
            elementsFound++
          }
        }

        pageResult.componentsRendered = elementsFound > 0
        if (elementsFound > 0) {
          console.log('   [PASS] Key UI elements found: ' + elementsFound + '/' + keyElements.length)
        }
        else {
          console.log('   [WARN] No key UI elements found')
        }

        const screenshotPath = '/Users/vladislavcaraseli/Documents/MoldovaDirect.worktrees/products-improvments/test-screenshots/' + pageResult.screenshot
        await page.screenshot({
          path: screenshotPath,
          fullPage: true,
        })
        console.log('   Screenshot saved: ' + pageResult.screenshot)

        if (pageResult.status !== 'failed') {
          if (!pageResult.hasImportErrors && !pageResult.has500Error && pageResult.componentsRendered) {
            pageResult.status = 'passed'
            console.log('   [SUCCESS] Page Status: PASSED')
          }
          else if (pageResult.componentsRendered && !pageResult.hasImportErrors) {
            pageResult.status = 'partial'
            console.log('   [PARTIAL] Page rendered but has minor issues')
          }
          else {
            pageResult.status = 'failed'
            console.log('   [FAIL] Page Status: FAILED')
          }
        }

        console.log('   Load time: ' + pageResult.loadTime + 'ms')
      }
      catch (error) {
        pageResult.status = 'failed'
        pageResult.errors.push(error.message)
        console.log('   [ERROR] ' + error.message)

        try {
          const screenshotPath = '/Users/vladislavcaraseli/Documents/MoldovaDirect.worktrees/products-improvments/test-screenshots/' + pageResult.screenshot
          await page.screenshot({ path: screenshotPath, fullPage: true })
          console.log('   Screenshot saved (error state): ' + pageResult.screenshot)
        }
        catch (e) {
          console.log('   Could not save screenshot')
        }
      }

      results.pages.push(pageResult)
    }
  }
  catch (error) {
    console.error('\nFatal error during testing:', error.message)
    results.success = false
    results.error = error.message
  }
  finally {
    await browser.close()
  }

  console.log('\n============================================================')
  console.log('TEST SUMMARY')
  console.log('============================================================')

  const passed = results.pages.filter(p => p.status === 'passed').length
  const partial = results.pages.filter(p => p.status === 'partial').length
  const failed = results.pages.filter(p => p.status === 'failed').length

  console.log('\n[RESULTS]')
  console.log('  Passed:  ' + passed + '/5')
  console.log('  Partial: ' + partial + '/5')
  console.log('  Failed:  ' + failed + '/5')

  console.log('\n[DETAILED BREAKDOWN]\n')
  results.pages.forEach((page) => {
    const statusIcon = page.status === 'passed' ? '[PASS]' : page.status === 'partial' ? '[PART]' : '[FAIL]'
    console.log(statusIcon + ' ' + page.name)

    if (page.hasImportErrors) {
      console.log('        Import errors detected')
    }
    if (page.has500Error) {
      console.log('        HTTP 500 error')
    }
    if (!page.componentsRendered && page.status !== 'passed') {
      console.log('        Components not rendered')
    }
    if (page.finalUrl && !page.finalUrl.includes(page.url)) {
      console.log('        Unexpected redirect: ' + page.finalUrl)
    }
  })

  const reportPath = '/Users/vladislavcaraseli/Documents/MoldovaDirect.worktrees/products-improvments/test-screenshots/admin-fixes-test-report.json'
  writeFileSync(reportPath, JSON.stringify(results, null, 2))
  console.log('\n[REPORT] Saved to: test-screenshots/admin-fixes-test-report.json')

  console.log('\n[SCREENSHOTS] Saved to: test-screenshots/')
  results.pages.forEach((p) => {
    console.log('  - ' + p.screenshot)
  })

  return results
}

testAdminPages()
  .then(() => {
    console.log('\nTest execution completed\n')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\nTest failed:', error)
    process.exit(1)
  })
