import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'

const BASE_URL = 'http://localhost:3000'
const ADMIN_EMAIL = 'admin@moldovadirect.com'
const ADMIN_PASSWORD = 'Admin123!@#'
const SCREENSHOT_DIR = 'test-screenshots'

const pages = [
  { name: 'Dashboard', url: '/admin' },
  { name: 'Users', url: '/admin/users' },
  { name: 'Products', url: '/admin/products' },
  { name: 'Orders', url: '/admin/orders' },
  { name: 'Analytics', url: '/admin/analytics' },
]

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true })
}

async function loginAsAdmin(page) {
  console.log('Logging in as admin...')
  await page.goto(BASE_URL + '/auth/signin', { waitUntil: 'networkidle', timeout: 30000 })
  await page.waitForTimeout(1000)

  await page.locator('input[type="email"]').first().fill(ADMIN_EMAIL)
  await page.locator('input[type="password"]').first().fill(ADMIN_PASSWORD)

  const loginButton = page.locator('button:has-text("Iniciar Sesión"), button:has-text("Sign in"), button:has-text("Login")').first()
  await loginButton.click()
  await page.waitForTimeout(3000)

  const currentUrl = page.url()
  if (currentUrl.includes('/login') || currentUrl.includes('/signin')) {
    throw new Error('Login failed')
  }

  console.log('Login successful\n')
}

async function checkPageForTranslationKeys(page, pageInfo) {
  console.log('='.repeat(80))
  console.log('Page: ' + pageInfo.name)
  console.log('URL: ' + pageInfo.url)
  console.log('='.repeat(80))

  try {
    await page.goto(BASE_URL + pageInfo.url, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(2000)

    const bodyText = await page.textContent('body')

    const translationKeys = []
    const patterns = [
      /admin\.\w+(\.\w+)*/g,
      /account\.\w+(\.\w+)*/g,
      /common\.\w+(\.\w+)*/g,
      /navigation\.\w+(\.\w+)*/g,
    ]

    patterns.forEach((pattern) => {
      const matches = bodyText.match(pattern) || []
      matches.forEach((match) => {
        if (!translationKeys.includes(match)) {
          translationKeys.push(match)
        }
      })
    })

    const navigationText = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('nav a, nav button, [role="navigation"] a, [role="navigation"] button'))
      return items.map(item => item.textContent.trim()).filter(text => text.length > 0)
    })

    const buttonText = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'))
      return buttons.map(btn => btn.textContent.trim()).filter(text => text.length > 0).slice(0, 15)
    })

    const tableHeaders = await page.evaluate(() => {
      const headers = Array.from(document.querySelectorAll('th'))
      return headers.map(h => h.textContent.trim()).filter(text => text.length > 0)
    })

    const screenshotFile = 'final-verification-' + pageInfo.name.toLowerCase().replace(/\s+/g, '-') + '.png'
    const screenshotPath = path.join(SCREENSHOT_DIR, screenshotFile)
    await page.screenshot({ path: screenshotPath, fullPage: true })

    const status = translationKeys.length === 0 ? 'PASS' : 'FAIL'
    const statusIcon = status === 'PASS' ? '✅' : '❌'

    console.log('Status: ' + statusIcon + ' ' + status)
    console.log('Translation Keys Found: ' + (translationKeys.length === 0 ? 'None' : translationKeys.length))

    if (translationKeys.length > 0) {
      console.log('\nTRANSLATION KEYS DETECTED:')
      translationKeys.forEach(key => console.log('  - ' + key))
    }

    console.log('Screenshot: ' + screenshotFile)

    console.log('\nNAVIGATION TEXT (sample):')
    console.log('  ' + navigationText.slice(0, 8).join(', '))

    if (buttonText.length > 0) {
      console.log('\nBUTTON LABELS (sample):')
      console.log('  ' + buttonText.slice(0, 8).join(', '))
    }

    if (tableHeaders.length > 0) {
      console.log('\nTABLE HEADERS:')
      console.log('  ' + tableHeaders.join(', '))
    }

    console.log('')

    return {
      page: pageInfo.name,
      url: pageInfo.url,
      status,
      translationKeysFound: translationKeys,
      screenshot: screenshotPath,
      navigationText,
      buttonText,
      tableHeaders,
      notes: translationKeys.length > 0 ? 'Translation keys still visible on page' : 'All text properly translated',
    }
  }
  catch (error) {
    console.log('Status: ❌ ERROR')
    console.log('Error: ' + error.message)
    console.log('')

    return {
      page: pageInfo.name,
      url: pageInfo.url,
      status: 'ERROR',
      error: error.message,
      translationKeysFound: [],
      notes: 'Failed to test page: ' + error.message,
    }
  }
}

async function runTests() {
  console.log('\n' + '='.repeat(80))
  console.log('FINAL TRANSLATION VERIFICATION')
  console.log('='.repeat(80))
  console.log('Goal: Verify NO translation keys are visible on admin pages')
  console.log('Expected: All text should be in proper language (Spanish/English/Romanian/Russian)')
  console.log('='.repeat(80) + '\n')

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } })
  const page = await context.newPage()

  const results = []

  try {
    await loginAsAdmin(page)

    for (const pageInfo of pages) {
      const result = await checkPageForTranslationKeys(page, pageInfo)
      results.push(result)
    }
  }
  finally {
    await browser.close()
  }

  console.log('\n' + '='.repeat(80))
  console.log('COMPREHENSIVE REPORT')
  console.log('='.repeat(80) + '\n')

  results.forEach((result, index) => {
    console.log((index + 1) + '. Page: ' + result.page)
    console.log('   Status: ' + (result.status === 'PASS' ? '✅' : '❌') + ' ' + result.status)
    console.log('   Translation Keys Found: ' + (result.translationKeysFound.length === 0 ? 'None' : result.translationKeysFound.join(', ')))
    console.log('   Screenshot: ' + path.basename(result.screenshot || 'N/A'))
    console.log('   Notes: ' + result.notes)
    console.log('')
  })

  console.log('='.repeat(80))
  console.log('SUMMARY')
  console.log('='.repeat(80))

  const passed = results.filter(r => r.status === 'PASS').length
  const failed = results.filter(r => r.status === 'FAIL').length
  const errors = results.filter(r => r.status === 'ERROR').length
  const total = results.length

  console.log('Total Pages Tested: ' + total)
  console.log('✅ Passed: ' + passed)
  console.log('❌ Failed: ' + failed)
  console.log('⚠️  Errors: ' + errors)
  console.log('')

  const allPassed = passed === total
  console.log('Overall Result: ' + (allPassed ? '✅ ALL TESTS PASSED - No translation keys visible' : '❌ SOME TESTS FAILED - Translation keys still visible'))
  console.log('='.repeat(80) + '\n')

  const reportPath = path.join(SCREENSHOT_DIR, 'final-translation-verification-report.json')
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: { total, passed, failed, errors },
    results,
  }, null, 2))

  console.log('Detailed JSON report saved to: ' + reportPath)

  process.exit(allPassed ? 0 : 1)
}

runTests().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
