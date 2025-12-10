import { chromium } from 'playwright'
import { writeFileSync, mkdirSync } from 'fs'

const ADMIN_EMAIL = 'admin@moldovadirect.com'
const ADMIN_PASSWORD = 'Admin123!@#'

async function loginAsAdmin(page) {
  console.log('Logging in as admin...')

  await page.goto('http://localhost:3000/auth/login', {
    waitUntil: 'networkidle',
    timeout: 30000,
  })

  const emailInput = page.locator('input[type="email"]')
  await emailInput.waitFor({ state: 'visible', timeout: 10000 })
  await emailInput.fill(ADMIN_EMAIL)

  const passwordInput = page.locator('input[type="password"]')
  await passwordInput.fill(ADMIN_PASSWORD)

  const loginButton = page.locator('button:has-text("Iniciar Sesión")')
  await loginButton.click()

  await page.waitForTimeout(3000)

  console.log('Logged in, current URL:', page.url())
}

async function inspectPage() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 2,
  })
  const page = await context.newPage()

  const issues = []
  const screenshots = []
  const screenshotDir = '/Users/vladislavcaraseli/Documents/MoldovaDirect.worktrees/products-improvments/ui-inspection-screenshots'
  mkdirSync(screenshotDir, { recursive: true })

  try {
    await loginAsAdmin(page)

    console.log('Navigating to admin orders page...')

    const response = await page.goto('http://localhost:3000/admin/orders', {
      waitUntil: 'networkidle',
      timeout: 30000,
    })

    console.log('Response status:', response.status())
    await page.waitForTimeout(3000)

    const fullPagePath = screenshotDir + '/admin-orders-full.png'
    await page.screenshot({ path: fullPagePath, fullPage: true })
    screenshots.push({ name: 'Full Page', path: fullPagePath })
    console.log('Full page screenshot saved')

    const currentUrl = page.url()
    console.log('Current URL:', currentUrl)

    const title = await page.title()
    console.log('Page title:', title)

    // Check for tables
    const tables = await page.locator('table').all()
    console.log('Tables found:', tables.length)

    if (tables.length === 0) {
      issues.push({
        severity: 'Critical',
        location: 'Orders Table',
        description: 'No table element found',
        screenshot: fullPagePath,
      })
    }

    // Check for tabs
    const tabs = await page.locator('[role="tablist"]').all()
    console.log('Tab groups:', tabs.length)

    // Check for translation keys
    const allText = await page.textContent('body')
    const translationKeyPattern = /\b[a-z]+\.[a-z]+\.[a-z]+/gi
    const matches = allText.match(translationKeyPattern)

    if (matches && matches.length > 0) {
      console.log('Potential untranslated keys found:', matches.length)
      for (const match of matches.slice(0, 10)) {
        issues.push({
          severity: 'High',
          location: 'Translations',
          description: 'Missing translation: ' + match,
          screenshot: fullPagePath,
        })
      }
    }

    const report = {
      url: currentUrl,
      timestamp: new Date().toISOString(),
      authenticated: !currentUrl.includes('/login'),
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
        tabs: tabs.length,
      },
    }

    writeFileSync(
      '/Users/vladislavcaraseli/Documents/MoldovaDirect.worktrees/products-improvments/ui-report.json',
      JSON.stringify(report, null, 2),
    )

    console.log('Report saved')
  }
  catch (error) {
    console.error('Error:', error.message)
  }
  finally {
    await browser.close()
  }
}

inspectPage()
