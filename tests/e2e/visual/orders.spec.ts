import { test as base } from '@playwright/test'
import path from 'path'
import fs from 'fs'
import {
  captureScreenshot,
  captureResponsiveScreenshots,
  generateVisualReport,
} from '../../../.visual-testing/utils'

/**
 * Orders Page Visual Tests
 *
 * Captures screenshots for visual review of the orders page.
 *
 * Run: pnpm run test:visual:orders
 * View: open .visual-testing/reports/index.html
 */

const FEATURE = 'orders'

// Test credentials
const TEST_EMAIL = process.env.TEST_USER_EMAIL
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD

if (!TEST_EMAIL || !TEST_PASSWORD) {
  throw new Error('TEST_USER_EMAIL and TEST_USER_PASSWORD required')
}

// Helper for inline login - use pressSequentially to trigger Vue reactivity
async function performLogin(page: any) {
  await page.goto('/auth/login')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1000) // Wait for hydration

  const emailInput = page.locator('[data-testid="email-input"]')
  const passwordInput = page.locator('[data-testid="password-input"]')
  const loginButton = page.locator('[data-testid="login-button"]')

  await emailInput.click()
  await emailInput.clear()
  await emailInput.pressSequentially(TEST_EMAIL, { delay: 10 })
  await emailInput.blur()

  await passwordInput.click()
  await passwordInput.clear()
  await passwordInput.pressSequentially(TEST_PASSWORD, { delay: 10 })
  await passwordInput.blur()

  await page.waitForTimeout(500) // Wait for Vue reactivity
  await loginButton.click({ timeout: 5000 })
  await page.waitForURL(/\/(admin|account|$)/, { timeout: 10000 })
}

// Authenticated test fixture
const test = base.extend<{
  authPage: ReturnType<typeof base.info>['fixtures']['page']
}>({
  authPage: async ({ browser }, use, testInfo) => {
    const projectName = testInfo.project.name
    const locale = projectName.split('-')[1] || 'es'
    const storagePath = path.join(process.cwd(), `tests/fixtures/.auth/user-${locale}.json`)

    const context = await browser.newContext({
      storageState: fs.existsSync(storagePath) ? storagePath : undefined,
    })
    const page = await context.newPage()

    await page.goto('/account')
    await page.waitForLoadState('networkidle')

    if (page.url().includes('/auth/login')) {
      await performLogin(page)
    }

    await use(page)
    await context.close()
  },
})

test.describe('Orders Page Visual Review', () => {
  test.describe.configure({ mode: 'serial' })

  test('Full page - all viewports', async ({ authPage }) => {
    await authPage.goto('/account/orders')
    await authPage.waitForLoadState('networkidle')
    await authPage.waitForTimeout(2000)

    await captureResponsiveScreenshots(authPage, {
      feature: FEATURE,
      name: 'full-page',
      viewports: ['mobile', 'tablet', 'desktop'],
    })
  })

  test('Metrics section', async ({ authPage }) => {
    await authPage.goto('/account/orders')
    await authPage.waitForLoadState('networkidle')
    await authPage.waitForTimeout(2000)

    await captureScreenshot(authPage, {
      feature: FEATURE,
      name: 'metrics-section',
      viewport: 'desktop',
      element: '.grid.grid-cols-2.md\\:grid-cols-4',
    })
  })

  test('Smart filters', async ({ authPage }) => {
    await authPage.goto('/account/orders')
    await authPage.waitForLoadState('networkidle')
    await authPage.waitForTimeout(2000)

    await captureScreenshot(authPage, {
      feature: FEATURE,
      name: 'smart-filters',
      viewport: 'desktop',
      element: '[role="group"]',
    })
  })

  test('In Transit filter active', async ({ authPage }) => {
    await authPage.goto('/account/orders')
    await authPage.waitForLoadState('networkidle')
    await authPage.waitForTimeout(2000)

    const btn = authPage.locator('button:has-text("In Transit")').first()
    if (await btn.isVisible()) {
      await btn.click()
      await authPage.waitForTimeout(1000)
    }

    await captureScreenshot(authPage, {
      feature: FEATURE,
      name: 'filter-in-transit',
      viewport: 'desktop',
    })
  })

  test('Delivered This Month filter active', async ({ authPage }) => {
    await authPage.goto('/account/orders')
    await authPage.waitForLoadState('networkidle')
    await authPage.waitForTimeout(2000)

    const btn = authPage.locator('button:has-text("Delivered This Month")').first()
    if (await btn.isVisible()) {
      await btn.click()
      await authPage.waitForTimeout(1000)
    }

    await captureScreenshot(authPage, {
      feature: FEATURE,
      name: 'filter-delivered-month',
      viewport: 'desktop',
    })
  })

  test('Search active', async ({ authPage }) => {
    await authPage.goto('/account/orders')
    await authPage.waitForLoadState('networkidle')
    await authPage.waitForTimeout(2000)

    const input = authPage.locator('input[type="search"], input[placeholder*="Search"]').first()
    if (await input.isVisible()) {
      await input.fill('wine')
      await authPage.waitForTimeout(1500)
    }

    await captureScreenshot(authPage, {
      feature: FEATURE,
      name: 'search-active',
      viewport: 'desktop',
    })
  })

  test('Order card', async ({ authPage }) => {
    await authPage.goto('/account/orders')
    await authPage.waitForLoadState('networkidle')
    await authPage.waitForTimeout(2000)

    await captureScreenshot(authPage, {
      feature: FEATURE,
      name: 'order-card',
      viewport: 'desktop',
      element: 'article',
    })
  })

  test('Empty state', async ({ authPage }) => {
    await authPage.goto('/account/orders')
    await authPage.waitForLoadState('networkidle')
    await authPage.waitForTimeout(2000)

    // Search for something that won't exist
    const input = authPage.locator('input[type="search"], input[placeholder*="Search"]').first()
    if (await input.isVisible()) {
      await input.fill('xyznonexistent999')
      await authPage.waitForTimeout(1500)
    }

    await captureScreenshot(authPage, {
      feature: FEATURE,
      name: 'empty-state',
      viewport: 'desktop',
    })
  })

  test('Loading state', async ({ authPage }) => {
    // Slow network to capture loading
    await authPage.route('**/api/**', async (route) => {
      await new Promise(r => setTimeout(r, 2000))
      await route.continue()
    })

    await authPage.goto('/account/orders')
    await authPage.waitForTimeout(500)

    await captureScreenshot(authPage, {
      feature: FEATURE,
      name: 'loading-state',
      viewport: 'desktop',
      fullPage: false,
    })
  })
})

// Generate report after all tests
test.afterAll(async () => {
  const reportPath = generateVisualReport(FEATURE)
  console.log(`\n✅ Visual tests complete!`)
  console.log(`   View report: open ${reportPath}`)
})
