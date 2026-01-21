import { test as base } from '@playwright/test'
import {
  captureScreenshot,
  captureResponsiveScreenshots,
  generateVisualReport,
} from '../../../.visual-testing/utils'

/**
 * Profile Pages Visual Tests
 *
 * Tests profile and account pages for visual regressions after shadcn-vue refactor.
 *
 * Run: pnpm run test:visual:profile
 * View: open .visual-testing/reports/index.html
 */

const FEATURE = 'profile-pages'

// Test credentials
const TEST_EMAIL = process.env.TEST_USER_EMAIL
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD

if (!TEST_EMAIL || !TEST_PASSWORD) {
  throw new Error('TEST_USER_EMAIL and TEST_USER_PASSWORD required')
}

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
  await page.waitForURL(/\/account/, { timeout: 10000 })
}

// Authenticated user fixture
const test = base.extend<{
  authPage: ReturnType<typeof base.info>['fixtures']['page']
}>({
  authPage: async ({ browser }, use) => {
    const context = await browser.newContext()
    const page = await context.newPage()

    // Check if already logged in
    await page.goto('/account')
    await page.waitForLoadState('networkidle')

    if (page.url().includes('/auth/login')) {
      await performLogin(page)
    }

    // Verify we're on account page
    if (!page.url().includes('/account')) {
      await page.goto('/account')
      await page.waitForLoadState('networkidle')
    }

    await use(page)
    await context.close()
  },
})

test.describe('Profile Pages Visual Review', () => {
  test.describe.configure({ mode: 'serial' })

  test('Profile page - full page all viewports', async ({ authPage }) => {
    await authPage.goto('/account/profile')
    await authPage.waitForLoadState('networkidle')
    await authPage.waitForTimeout(2000)

    await captureResponsiveScreenshots(authPage, {
      feature: FEATURE,
      name: 'profile-full',
      viewports: ['mobile', 'tablet', 'desktop'],
    })
  })

  test('Profile - personal info section', async ({ authPage }) => {
    await authPage.goto('/account/profile')
    await authPage.waitForLoadState('networkidle')
    await authPage.waitForTimeout(2000)

    await captureScreenshot(authPage, {
      feature: FEATURE,
      name: 'profile-personal-info',
      viewport: 'desktop',
      element: 'form',
    })
  })

  test('Profile - preferences section', async ({ authPage }) => {
    await authPage.goto('/account/profile')
    await authPage.waitForLoadState('networkidle')
    await authPage.waitForTimeout(2000)

    // Scroll to preferences
    await authPage.evaluate(() => window.scrollTo(0, 500))
    await authPage.waitForTimeout(500)

    await captureScreenshot(authPage, {
      feature: FEATURE,
      name: 'profile-preferences',
      viewport: 'desktop',
    })
  })

  test('Profile - security section', async ({ authPage }) => {
    await authPage.goto('/account/profile')
    await authPage.waitForLoadState('networkidle')
    await authPage.waitForTimeout(2000)

    // Scroll to security
    await authPage.evaluate(() => window.scrollTo(0, 1000))
    await authPage.waitForTimeout(500)

    await captureScreenshot(authPage, {
      feature: FEATURE,
      name: 'profile-security',
      viewport: 'desktop',
    })
  })

  test('Account home - full page all viewports', async ({ authPage }) => {
    await authPage.goto('/account')
    await authPage.waitForLoadState('networkidle')
    await authPage.waitForTimeout(2000)

    await captureResponsiveScreenshots(authPage, {
      feature: FEATURE,
      name: 'account-home-full',
      viewports: ['mobile', 'tablet', 'desktop'],
    })
  })

  test('Account home - profile completion', async ({ authPage }) => {
    await authPage.goto('/account')
    await authPage.waitForLoadState('networkidle')
    await authPage.waitForTimeout(2000)

    await captureScreenshot(authPage, {
      feature: FEATURE,
      name: 'account-completion',
      viewport: 'desktop',
      element: '[class*="progress"], [class*="completion"]',
    })
  })
})

test.afterAll(async () => {
  const reportPath = generateVisualReport(FEATURE)
  console.log(`\n✅ Profile visual tests complete!`)
  console.log(`   View report: open ${reportPath}`)
})
