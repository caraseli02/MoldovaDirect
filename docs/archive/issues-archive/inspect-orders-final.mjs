import { chromium } from 'playwright'
import { writeFileSync, mkdirSync } from 'fs'

const ADMIN_EMAIL = 'admin@moldovadirect.com'
const ADMIN_PASSWORD = 'Admin123!@#'

async function loginAsAdmin(page) {
  console.log('Logging in as admin...')

  await page.goto('http://localhost:3000/auth/login', {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  })

  await page.waitForTimeout(2000)

  const emailInput = page.getByTestId('email-input')
  await emailInput.waitFor({ state: 'visible', timeout: 10000 })
  await emailInput.fill(ADMIN_EMAIL)

  const passwordInput = page.getByTestId('password-input')
  await passwordInput.fill(ADMIN_PASSWORD)

  const loginButton = page.locator('button[type="submit"]').first()
  await loginButton.click()

  await page.waitForTimeout(4000)

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
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    })

    console.log('Response status:', response.status())
    await page.waitForTimeout(4000)

    const fullPagePath = screenshotDir + '/orders-authenticated.png'
    await page.screenshot({ path: fullPagePath, fullPage: true })
    screenshots.push({ name: 'Full Page', path: fullPagePath })
    console.log('Full page screenshot saved')

    const currentUrl = page.url()
    console.log('Current URL:', currentUrl)

    const title = await page.title()
    console.log('Page title:', title)

    const bodyText = await page.textContent('body')

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
    else {
      const tableScreenshot = screenshotDir + '/orders-table.png'
      await tables[0].screenshot({ path: tableScreenshot })
      screenshots.push({ name: 'Table', path: tableScreenshot })
    }

    // Check for tabs
    const tabs = await page.locator('[role="tablist"]').all()
    console.log('Tab groups:', tabs.length)

    if (tabs.length > 0) {
      const tabScreenshot = screenshotDir + '/orders-tabs.png'
      await tabs[0].screenshot({ path: tabScreenshot })
      screenshots.push({ name: 'Tabs', path: tabScreenshot })
    }

    // Check for translation keys
    const translationKeyPattern = /\b[a-z]+\.[a-z]+\.[a-z]+/gi
    const matches = bodyText.match(translationKeyPattern)

    if (matches && matches.length > 0) {
      console.log('Potential untranslated keys found:', matches.length)
      const uniqueKeys = Array.from(new Set(matches))
      for (const match of uniqueKeys.slice(0, 20)) {
        issues.push({
          severity: 'High',
          location: 'Translations',
          description: 'Missing translation: ' + match,
          screenshot: fullPagePath,
        })
      }
    }

    // Check for error messages
    const errorElements = await page.locator('[role="alert"]').all()
    for (const error of errorElements) {
      const isVisible = await error.isVisible()
      if (isVisible) {
        const text = await error.textContent()
        issues.push({
          severity: 'High',
          location: 'Error',
          description: 'Error message: ' + text,
          screenshot: fullPagePath,
        })
      }
    }

    // Check badges
    const badges = await page.locator('.badge, [class*="badge"]').all()
    console.log('Badges found:', badges.length)

    // Check buttons
    const buttons = await page.locator('button').all()
    console.log('Buttons found:', buttons.length)

    // Check images
    const images = await page.locator('img').all()
    console.log('Images found:', images.length)

    // Check for h1
    const h1 = await page.locator('h1').first()
    if (await h1.count() > 0) {
      const h1Text = await h1.textContent()
      console.log('H1:', h1Text)

      if (h1Text.match(translationKeyPattern)) {
        issues.push({
          severity: 'High',
          location: 'Page Title',
          description: 'H1 has translation key: ' + h1Text,
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
        badges: badges.length,
        buttons: buttons.length,
        images: images.length,
      },
    }

    writeFileSync(
      '/Users/vladislavcaraseli/Documents/MoldovaDirect.worktrees/products-improvments/ui-inspection-final.json',
      JSON.stringify(report, null, 2),
    )

    console.log('\n=== INSPECTION COMPLETE ===')
    console.log('Total issues:', issues.length)
    console.log('  Critical:', report.summary.critical)
    console.log('  High:', report.summary.high)
    console.log('  Medium:', report.summary.medium)
    console.log('  Low:', report.summary.low)
  }
  catch (error) {
    console.error('Error:', error.message)
    console.error(error.stack)
  }
  finally {
    await browser.close()
  }
}

inspectPage()
