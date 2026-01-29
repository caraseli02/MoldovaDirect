import { test, expect } from '@playwright/test'
import {
  captureScreenshot,
  captureResponsiveScreenshots,
  generateVisualReport,
} from '../../../.visual-testing/utils'

/**
 * QA Issues Visual Review
 *
 * Captures screenshots and logs for known QA issues to validate fixes
 * using the Chromatic-like local review UI.
 */

const FEATURE = 'qa-issues'

async function waitForProducts(page: any) {
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1500)
}

function productCards(page: any) {
  return page.locator('[data-testid="product-card"], .product-card, [class*="product"]')
}

test.describe('QA Issues Visual Review', () => {
  test.describe.configure({ mode: 'serial' })

  test('Search results vanish after query', async ({ page }) => {
    await page.goto('/products')
    await waitForProducts(page)

    const initialCount = await productCards(page).count()
    console.log(`Initial product card count: ${initialCount}`)

    await captureScreenshot(page, {
      feature: FEATURE,
      name: '01-products-initial',
      viewport: 'desktop',
      fullPage: true,
    })

    const searchInput = page.locator('input[type="search"]').first()
    await expect(searchInput).toBeVisible({ timeout: 5000 })
    await searchInput.click()
    await searchInput.fill('wine')
    await page.keyboard.press('Enter')
    await page.waitForTimeout(1500)

    const afterCount = await productCards(page).count()
    console.log(`Product card count after search: ${afterCount}`)

    expect(afterCount, 'Search results vanished after query').toBeGreaterThan(0)

    await captureScreenshot(page, {
      feature: FEATURE,
      name: '02-products-search-wine',
      viewport: 'desktop',
      fullPage: true,
    })
  })

  test('Search + filter interactions break', async ({ page }) => {
    await page.goto('/products')
    await waitForProducts(page)

    const searchInput = page.locator('input[type="search"]').first()
    await searchInput.fill('wine')
    await page.waitForTimeout(1000)

    const filterButton = page.locator('button[aria-controls="filter-panel"]').first()
    await filterButton.click()

    const inStockCheckbox = page.locator('#filter-in-stock')
    await inStockCheckbox.waitFor({ state: 'visible', timeout: 5000 })
    await inStockCheckbox.click()

    const applyButton = page.locator('button', { hasText: /apply|aplicar/i }).first()
    await applyButton.click()
    await page.waitForTimeout(1500)

    const countAfterFilter = await productCards(page).count()
    console.log(`Product card count after search + filter: ${countAfterFilter}`)

    expect(countAfterFilter, 'Search + filter returned empty results').toBeGreaterThan(0)

    await captureScreenshot(page, {
      feature: FEATURE,
      name: '03-search-plus-filter',
      viewport: 'desktop',
      fullPage: true,
    })
  })

  test('Search bar scrolls to page bottom on Enter', async ({ page }) => {
    await page.goto('/products')
    await waitForProducts(page)

    const beforeScrollY = await page.evaluate(() => window.scrollY)

    const searchInput = page.locator('input[type="search"]').first()
    await searchInput.click()
    await searchInput.fill('wine')
    await page.keyboard.press('Enter')
    await page.waitForTimeout(800)

    const afterScrollY = await page.evaluate(() => window.scrollY)
    console.log(`ScrollY before: ${beforeScrollY}, after: ${afterScrollY}`)

    if (afterScrollY > beforeScrollY + 100) {
      console.log('⚠️ Search Enter caused scroll jump')
    }

    await captureScreenshot(page, {
      feature: FEATURE,
      name: '04-search-enter-scroll',
      viewport: 'desktop',
      fullPage: false,
    })
  })

  test('Missing product images / placeholder icons', async ({ page }) => {
    await page.goto('/products')
    await waitForProducts(page)

    const placeholders = page.locator('[role="img"][aria-label]')
    const placeholderCount = await placeholders.count()
    console.log(`Placeholder image count: ${placeholderCount}`)

    await captureScreenshot(page, {
      feature: FEATURE,
      name: '05-product-placeholders',
      viewport: 'desktop',
      fullPage: true,
    })
  })

  test('Account registration fails silently', async ({ page }) => {
    // Ensure logged-out state (project uses storageState by default)
    await page.context().clearCookies()
    await page.goto('/auth/login', { waitUntil: 'domcontentloaded' })
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })

    await page.goto('/auth/register', { waitUntil: 'networkidle' })
    if (!page.url().includes('/auth/register')) {
      console.log(`⚠️ Registration page redirected to: ${page.url()}`)
      await captureScreenshot(page, {
        feature: FEATURE,
        name: '06-registration-redirected',
        viewport: 'desktop',
        fullPage: false,
      })
      return
    }
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    await page.locator('[data-testid="name-input"]').waitFor({ state: 'visible', timeout: 10000 })
    await page.locator('[data-testid="name-input"]').fill('QA Test User')
    const email = `qa-${Date.now()}@example.com`
    await page.locator('[data-testid="email-input"]').fill(email)
    await page.locator('[data-testid="password-input"]').fill('TestPass123!')
    await page.locator('[data-testid="confirm-password-input"]').fill('TestPass123!')

    const termsCheckbox = page.locator('#terms')
    await termsCheckbox.click()

    const registerButton = page.locator('[data-testid="register-button"]')
    await captureScreenshot(page, {
      feature: FEATURE,
      name: '06-registration-filled',
      viewport: 'desktop',
      fullPage: false,
    })

    const isEnabled = await registerButton.isEnabled()
    expect(isEnabled, 'Register button remained disabled after filling form').toBe(true)

    await registerButton.click()

    const successBanner = page.locator('[data-testid="auth-success"]')
    const errorBanner = page.locator('[data-testid="auth-error"]')

    const result = await Promise.race([
      successBanner.waitFor({ state: 'visible', timeout: 8000 }).then(() => 'success').catch(() => null),
      errorBanner.waitFor({ state: 'visible', timeout: 8000 }).then(() => 'error').catch(() => null),
      page.waitForTimeout(8000).then(() => 'timeout'),
    ])

    if (result === 'timeout') {
      throw new Error('Registration produced no success or error message (silent failure)')
    }

    await captureScreenshot(page, {
      feature: FEATURE,
      name: '06-registration-submit',
      viewport: 'desktop',
      fullPage: false,
    })
  })

  test('Mobile header icons too small', async ({ page }) => {
    await page.goto('/products')
    await waitForProducts(page)

    await captureResponsiveScreenshots(page, {
      feature: FEATURE,
      name: '07-mobile-header-icons',
      viewports: ['mobile'],
      fullPage: false,
    })
  })

  test('Footer contrast and newsletter labels (dark mode)', async ({ page }) => {
    await page.goto('/products')
    await waitForProducts(page)

    const themeToggle = page.locator('button[aria-label*="dark mode"], button[aria-label*="light mode"]').first()
    if (await themeToggle.isVisible().catch(() => false)) {
      await themeToggle.click()
      await page.waitForTimeout(500)
    }

    const footer = page.locator('footer').first()
    await footer.scrollIntoViewIfNeeded()
    await page.waitForTimeout(500)

    const newsletterInput = footer.locator('input[type="email"]')
    const newsletterAria = await newsletterInput.getAttribute('aria-label')
    console.log(`Newsletter aria-label: ${newsletterAria}`)

    await captureScreenshot(page, {
      feature: FEATURE,
      name: '08-footer-dark-mode',
      viewport: 'desktop',
      fullPage: false,
      element: 'footer',
    })
  })
})

// Generate report after all tests
// eslint-disable-next-line @typescript-eslint/no-floating-promises
test.afterAll(async () => {
  const reportPath = generateVisualReport(FEATURE)
  console.log(`\n✅ QA visual tests complete!`)
  console.log(`   View report: open ${reportPath}`)
})
