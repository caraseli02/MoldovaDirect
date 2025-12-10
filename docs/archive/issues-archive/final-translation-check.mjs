import puppeteer from 'puppeteer'
import fs from 'fs'

const ADMIN_EMAIL = 'admin@moldovadirect.com'
const ADMIN_PASSWORD = 'admin123'
const BASE_URL = 'http://localhost:3000'

const pages = [
  { name: 'Dashboard', url: '/admin', key: 'dashboard' },
  { name: 'Users', url: '/admin/users', key: 'users' },
  { name: 'Products', url: '/admin/products', key: 'products' },
  { name: 'Orders', url: '/admin/orders', key: 'orders' },
  { name: 'Analytics', url: '/admin/analytics', key: 'analytics' },
]

async function login(page) {
  console.log('Logging in...')
  await page.goto(BASE_URL + '/login', { waitUntil: 'networkidle0' })
  await page.waitForSelector('input[type="email"]', { timeout: 10000 })
  await page.type('input[type="email"]', ADMIN_EMAIL)
  await page.type('input[type="password"]', ADMIN_PASSWORD)
  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 15000 }),
  ])
  console.log('Login successful')
}

async function checkPage(page, pageInfo) {
  console.log('Testing: ' + pageInfo.name)
  await page.goto(BASE_URL + pageInfo.url, { waitUntil: 'networkidle0', timeout: 15000 })
  await new Promise(resolve => setTimeout(resolve, 2000))

  const pageText = await page.evaluate(() => document.body.innerText)

  const adminKeys = pageText.match(/admin\.\w+/g) || []
  const accountKeys = pageText.match(/account\.\w+/g) || []
  const commonKeys = pageText.match(/common\.\w+/g) || []
  const allKeys = [...new Set([...adminKeys, ...accountKeys, ...commonKeys])]

  const navigationText = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('nav a, nav button'))
    return items.map(item => item.textContent.trim()).filter(text => text.length > 0)
  })

  const buttonText = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'))
    return buttons.map(btn => btn.textContent.trim()).filter(text => text.length > 0)
  })

  const tableHeaders = await page.evaluate(() => {
    const headers = Array.from(document.querySelectorAll('th'))
    return headers.map(h => h.textContent.trim()).filter(text => text.length > 0)
  })

  const screenshotPath = 'test-screenshots/final-check-' + pageInfo.key + '.png'
  await page.screenshot({ path: screenshotPath, fullPage: true })

  return {
    page: pageInfo.name,
    url: pageInfo.url,
    status: allKeys.length === 0 ? 'PASS' : 'FAIL',
    translationKeysFound: allKeys,
    screenshot: screenshotPath,
    navigationText,
    buttonText,
    tableHeaders,
  }
}

async function runTests() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  const results = []

  try {
    const page = await browser.newPage()
    await page.setViewport({ width: 1920, height: 1080 })
    await login(page)

    for (const pageInfo of pages) {
      try {
        const result = await checkPage(page, pageInfo)
        results.push(result)
        console.log('Status: ' + result.status)
        console.log('Keys found: ' + result.translationKeysFound.length)
      }
      catch (error) {
        console.error('Error on ' + pageInfo.name + ': ' + error.message)
        results.push({
          page: pageInfo.name,
          url: pageInfo.url,
          status: 'ERROR',
          error: error.message,
          translationKeysFound: [],
        })
      }
    }
  }
  finally {
    await browser.close()
  }

  return results
}

if (!fs.existsSync('test-screenshots')) {
  fs.mkdirSync('test-screenshots')
}

runTests().then((results) => {
  console.log('\n=== FINAL TRANSLATION VERIFICATION REPORT ===\n')

  results.forEach((result) => {
    console.log('Page: ' + result.page)
    console.log('Status: ' + result.status)
    console.log('Translation Keys: ' + (result.translationKeysFound.length === 0 ? 'None' : result.translationKeysFound.join(', ')))
    console.log('Screenshot: ' + result.screenshot)
    console.log('---')
  })

  const passed = results.filter(r => r.status === 'PASS').length
  console.log('\nPassed: ' + passed + '/' + results.length)

  fs.writeFileSync('final-translation-check-report.json', JSON.stringify(results, null, 2))
  process.exit(passed === results.length ? 0 : 1)
}).catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
