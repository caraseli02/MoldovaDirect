import { test as base } from '@playwright/test'
import {
  captureScreenshot,
  captureResponsiveScreenshots,
  generateVisualReport,
} from '../../../.visual-testing/utils'

/**
 * Admin Pages Visual Tests
 *
 * Tests all admin pages for visual regressions after shadcn-vue refactor.
 *
 * Run: pnpm run test:visual:admin
 * View: open .visual-testing/reports/index.html
 */

const FEATURE = 'admin-pages'

// Test credentials
const TEST_EMAIL = process.env.TEST_USER_EMAIL
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD

// Helper for inline login
async function performLogin(page: any) {
  await page.goto('/auth/login')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1000)

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

  await page.waitForTimeout(500)
  await loginButton.click({ timeout: 5000 })
  await page.waitForURL(/\/admin/, { timeout: 10000 })
}

// Authenticated admin fixture
const test = base.extend<{
  adminPage: ReturnType<typeof base.info>['fixtures']['page']
}>({
  adminPage: async ({ browser }, use) => {
    // Skip tests if credentials not available
    if (!TEST_EMAIL || !TEST_PASSWORD) {
      test.skip(true, 'TEST_USER_EMAIL and TEST_USER_PASSWORD not set in environment')
    }

    const context = await browser.newContext()
    const page = await context.newPage()

    // Check if already logged in
    await page.goto('/admin')
    await page.waitForLoadState('networkidle')

    if (page.url().includes('/auth/login')) {
      await performLogin(page)
    }

    // Verify we're on admin page
    if (!page.url().includes('/admin')) {
      await page.goto('/admin')
      await page.waitForLoadState('networkidle')
    }

    await use(page)
    await context.close()
  },
})

test.describe('Admin Pages Visual Review', () => {
  test.describe.configure({ mode: 'serial' })

  test('Dashboard - full page all viewports', async ({ adminPage }) => {
    await adminPage.goto('/admin')
    await adminPage.waitForLoadState('networkidle')
    await adminPage.waitForTimeout(2000)

    await captureResponsiveScreenshots(adminPage, {
      feature: FEATURE,
      name: 'dashboard-full',
      viewports: ['mobile', 'tablet', 'desktop'],
    })
  })

  test('Dashboard - metrics cards', async ({ adminPage }) => {
    await adminPage.goto('/admin')
    await adminPage.waitForLoadState('networkidle')
    await adminPage.waitForTimeout(2000)

    await captureScreenshot(adminPage, {
      feature: FEATURE,
      name: 'dashboard-metrics',
      viewport: 'desktop',
      element: 'main',
    })
  })

  test('Orders page - full page', async ({ adminPage }) => {
    await adminPage.goto('/admin/orders')
    await adminPage.waitForLoadState('networkidle')
    await adminPage.waitForTimeout(2000)

    await captureResponsiveScreenshots(adminPage, {
      feature: FEATURE,
      name: 'orders-full',
      viewports: ['mobile', 'tablet', 'desktop'],
    })
  })

  test('Orders page - filters', async ({ adminPage }) => {
    await adminPage.goto('/admin/orders')
    await adminPage.waitForLoadState('networkidle')
    await adminPage.waitForTimeout(2000)

    await captureScreenshot(adminPage, {
      feature: FEATURE,
      name: 'orders-filters',
      viewport: 'desktop',
      element: '[role="group"], .filters',
    })
  })

  test('Products page - full page', async ({ adminPage }) => {
    await adminPage.goto('/admin/products')
    await adminPage.waitForLoadState('networkidle')
    await adminPage.waitForTimeout(2000)

    await captureResponsiveScreenshots(adminPage, {
      feature: FEATURE,
      name: 'products-full',
      viewports: ['mobile', 'tablet', 'desktop'],
    })
  })

  test('Products page - table view', async ({ adminPage }) => {
    await adminPage.goto('/admin/products')
    await adminPage.waitForLoadState('networkidle')
    await adminPage.waitForTimeout(2000)

    await captureScreenshot(adminPage, {
      feature: FEATURE,
      name: 'products-table',
      viewport: 'desktop',
      element: 'table, .table',
    })
  })

  test('Users page - full page', async ({ adminPage }) => {
    await adminPage.goto('/admin/users')
    await adminPage.waitForLoadState('networkidle')
    await adminPage.waitForTimeout(2000)

    await captureResponsiveScreenshots(adminPage, {
      feature: FEATURE,
      name: 'users-full',
      viewports: ['mobile', 'tablet', 'desktop'],
    })
  })

  test('Email Templates page - full page', async ({ adminPage }) => {
    await adminPage.goto('/admin/email-templates')
    await adminPage.waitForLoadState('networkidle')
    await adminPage.waitForTimeout(2000)

    await captureResponsiveScreenshots(adminPage, {
      feature: FEATURE,
      name: 'email-templates-full',
      viewports: ['mobile', 'tablet', 'desktop'],
    })
  })

  test('Email Logs page - full page', async ({ adminPage }) => {
    await adminPage.goto('/admin/email-logs')
    await adminPage.waitForLoadState('networkidle')
    await adminPage.waitForTimeout(2000)

    await captureResponsiveScreenshots(adminPage, {
      feature: FEATURE,
      name: 'email-logs-full',
      viewports: ['mobile', 'tablet', 'desktop'],
    })
  })

  test('Analytics page - full page', async ({ adminPage }) => {
    await adminPage.goto('/admin/analytics')
    await adminPage.waitForLoadState('networkidle')
    await adminPage.waitForTimeout(2000)

    await captureResponsiveScreenshots(adminPage, {
      feature: FEATURE,
      name: 'analytics-full',
      viewports: ['mobile', 'tablet', 'desktop'],
    })
  })

  test('Inventory page - full page', async ({ adminPage }) => {
    await adminPage.goto('/admin/inventory')
    await adminPage.waitForLoadState('networkidle')
    await adminPage.waitForTimeout(2000)

    await captureResponsiveScreenshots(adminPage, {
      feature: FEATURE,
      name: 'inventory-full',
      viewports: ['mobile', 'tablet', 'desktop'],
    })
  })
})

test.afterAll(async () => {
  const reportPath = generateVisualReport(FEATURE)
  console.log(`\n✅ Admin visual tests complete!`)
  console.log(`   View report: open ${reportPath}`)
})
