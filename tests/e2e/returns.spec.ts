/**
 * Returns Page E2E Test
 *
 * Tests the returns policy page loads correctly with all sections visible.
 *
 * Test Coverage:
 * - Page loads with main content
 * - All sections render (eligibility, steps, support)
 * - CTA buttons navigate correctly
 * - i18n content renders (not raw keys)
 */

import { test, expect } from '@playwright/test'

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || process.env.BASE_URL || 'http://localhost:3000'

test.describe('Returns Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/returns`, { timeout: 30000 })
    await page.waitForLoadState('networkidle')
  })

  test('page loads with hero section visible', async ({ page }) => {
    // Check page title/heading is visible and not a raw i18n key
    const heading = page.locator('h1').first()
    await expect(heading).toBeVisible({ timeout: 10000 })

    const headingText = await heading.textContent()
    expect(headingText).not.toContain('returns.title')
    expect(headingText?.length).toBeGreaterThan(3)
  })

  test('summary cards render correctly', async ({ page }) => {
    // Should have 4 summary cards (window, condition, support, refunds)
    const summaryCards = page.locator('[class*="grid"] > div').filter({
      has: page.locator('p[class*="font-semibold"]'),
    })

    // At least some cards should be visible
    await expect(summaryCards.first()).toBeVisible({ timeout: 10000 })
  })

  test('eligibility and resolution sections render', async ({ page }) => {
    // Check for ReturnsEligibility component content
    const eligibilitySection = page.locator('text=/eligib|elegib/i').first()
    await expect(eligibilitySection).toBeVisible({ timeout: 10000 })

    // Check for ReturnsResolution component content
    const resolutionSection = page.locator('text=/resolution|refund|reembolso/i').first()
    await expect(resolutionSection).toBeVisible({ timeout: 10000 })
  })

  test('returns steps section renders', async ({ page }) => {
    // Check for steps content (numbered process)
    const stepsSection = page.locator('text=/step|paso|1|2|3/i').first()
    await expect(stepsSection).toBeVisible({ timeout: 10000 })
  })

  test('support section with contact info renders', async ({ page }) => {
    // Check for support email or contact section
    const supportSection = page.locator('text=/support|soporte|contact|@/i').first()
    await expect(supportSection).toBeVisible({ timeout: 10000 })
  })

  test('CTA navigates to contact page', async ({ page }) => {
    // Find and click the contact/start return CTA
    const contactLink = page.locator('a[href*="/contact"]').first()
    await expect(contactLink).toBeVisible({ timeout: 10000 })

    await contactLink.click()
    await page.waitForURL(/\/contact/, { timeout: 15000 })

    expect(page.url()).toContain('/contact')
  })

  test('CTA navigates to orders page', async ({ page }) => {
    // Find the orders link
    const ordersLink = page.locator('a[href*="/account/orders"]').first()
    await expect(ordersLink).toBeVisible({ timeout: 10000 })

    await ordersLink.click()
    // Should redirect to login if not authenticated, or orders page
    await page.waitForURL(/\/(account\/orders|auth\/login)/, { timeout: 15000 })
  })

  test('page has correct SEO meta tags', async ({ page }) => {
    // Check title contains returns-related content
    const title = await page.title()
    expect(title.toLowerCase()).toMatch(/return|refund|devolu/)

    // Check meta description exists
    const metaDescription = page.locator('meta[name="description"]')
    await expect(metaDescription).toHaveAttribute('content', /.+/)
  })

  test('i18n renders actual content, not keys', async ({ page }) => {
    // Get all visible text and ensure no raw i18n keys
    const bodyText = await page.locator('body').textContent()

    // These patterns would indicate broken i18n
    expect(bodyText).not.toContain('returns.title')
    expect(bodyText).not.toContain('returns.description')
    expect(bodyText).not.toContain('returns.eligibility.')
    expect(bodyText).not.toContain('returns.steps.')
  })
})
