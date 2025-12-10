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

  console.log('Starting Admin Pages Visual Test\n')
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
    if (type === 'error' || type === 'warning') {
      console.log('   [' + type + '] ' + text)
    }
  })

  try {
    await mkdir('/Users/vladislavcaraseli/Documents/MoldovaDirect.worktrees/products-improvments/test-screenshots', { recursive: true })

    console.log('\nStep 1: Logging in...')
    await page.goto(BASE_URL + '/auth/login', { waitUntil: 'networkidle', timeout: 30000 })

    await page.fill('input[type="email"]', CREDENTIALS.email)
    await page.fill('input[type="password"]', CREDENTIALS.password)
    await page.click('button[type="submit"]')

    await page.waitForURL(/\/admin/, { timeout: 15000 })
    console.log('   Login successful')

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
      }

      try {
        const startTime = Date.now()

        const response = await page.goto(BASE_URL + adminPage.url, {
          waitUntil: 'networkidle',
          timeout: 30000,
        })

        pageResult.loadTime = Date.now() - startTime

        const status = response.status()
        pageResult.httpStatus = status

        if (status === 500) {
          pageResult.has500Error = true
          pageResult.status = 'failed'
          console.log('   HTTP 500 Error detected')
        }
        else {
          console.log('   HTTP Status: ' + status)
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
          console.log('   Import errors found: ' + importErrors.length)
          importErrors.forEach(err => console.log('      - ' + err.text.substring(0, 100)))
        }
        else {
          console.log('   No import errors detected')
        }

        const allErrors = consoleLogs.filter(log => log.type === 'error')
        if (allErrors.length > 0) {
          pageResult.errors.push(...allErrors.map(e => e.text))
          console.log('   Total console errors: ' + allErrors.length)
        }

        const warnings = consoleLogs.filter(log => log.type === 'warning')
        if (warnings.length > 0) {
          pageResult.warnings.push(...warnings.map(w => w.text))
        }

        const bodyText = await page.textContent('body')
        const hasErrorPage = bodyText.includes('500')
          || bodyText.includes('Server Error')
          || bodyText.includes('Something went wrong')

        if (hasErrorPage) {
          pageResult.status = 'failed'
          console.log('   Error page detected in body')
        }

        let keyElements = []
        switch (adminPage.key) {
          case 'dashboard':
            keyElements = ['Total Sales', 'Total Orders', 'Total Users']
            break

          case 'users':
            keyElements = ['Name', 'Email', 'Role']
            break
          case 'products':
            keyElements = ['Product Name', 'Price', 'Stock']
            break
          case 'orders':
            keyElements = ['Order ID', 'Customer', 'Status']
            break
          case 'analytics':
            keyElements = ['Revenue', 'Sales', 'Traffic']
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
          console.log('   Key UI elements found: ' + elementsFound + '/' + keyElements.length)
        }
        else {
          console.log('   No key UI elements found')
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
            console.log('   Page Status: PASSED')
          }
          else if (pageResult.componentsRendered && !pageResult.hasImportErrors) {
            pageResult.status = 'partial'
            console.log('   Page Status: PARTIAL (rendered but has issues)')
          }
          else {
            pageResult.status = 'failed'
            console.log('   Page Status: FAILED')
          }
        }

        console.log('   Load time: ' + pageResult.loadTime + 'ms')
      }
      catch (error) {
        pageResult.status = 'failed'
        pageResult.errors.push(error.message)
        console.log('   Error testing page: ' + error.message)
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

  console.log('\nPassed: ' + passed + '/5')
  console.log('Partial: ' + partial + '/5')
  console.log('Failed: ' + failed + '/5')

  console.log('\nDetailed Results:\n')
  results.pages.forEach((page) => {
    const icon = page.status === 'passed' ? 'PASS' : page.status === 'partial' ? 'PART' : 'FAIL'
    console.log('[' + icon + '] ' + page.name + ' - ' + page.status)
    if (page.hasImportErrors) {
      console.log('   Has import errors')
    }
    if (page.has500Error) {
      console.log('   HTTP 500 error')
    }
    if (!page.componentsRendered) {
      console.log('   Components not rendered')
    }
    if (page.errors.length > 0 && page.errors.length <= 3) {
      page.errors.forEach((err) => {
        console.log('   Error: ' + err.substring(0, 80))
      })
    }
    else if (page.errors.length > 3) {
      console.log('   ' + page.errors.length + ' errors (see JSON report)')
    }
  })

  const reportPath = '/Users/vladislavcaraseli/Documents/MoldovaDirect.worktrees/products-improvments/test-screenshots/admin-fixes-test-report.json'
  writeFileSync(reportPath, JSON.stringify(results, null, 2))
  console.log('\nDetailed report saved: test-screenshots/admin-fixes-test-report.json')

  return results
}

testAdminPages()
  .then(() => {
    console.log('\nTest completed successfully\n')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\nTest failed:', error)
    process.exit(1)
  })
