/**
 * Shipping Page E2E Test
 *
 * Tests the shipping information page loads correctly with all sections visible.
 *
 * Test Coverage:
 * - Page loads with main content
 * - Hero section with CTAs
 * - Shipping methods display
 * - Coverage regions render
 * - Timeline steps render
 * - i18n content renders (not raw keys)
 */

import { test, expect } from '@playwright/test'

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || process.env.BASE_URL || 'http://localhost:3000'

test.describe('Shipping Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/shipping`, { timeout: 30000 })
    await page.waitForLoadState('networkidle')
  })

  test('page loads with hero section visible', async ({ page }) => {
    // Check page title/heading is visible
    const heading = page.locator('h1').first()
    await expect(heading).toBeVisible({ timeout: 10000 })

    const headingText = await heading.textContent()
    expect(headingText).not.toContain('shippingPage.hero.title')
    expect(headingText?.length).toBeGreaterThan(3)
  })

  test('hero badge is visible', async ({ page }) => {
    // Check for the shipping badge
    const badge = page.locator('p[class*="rounded-full"]').first()
    await expect(badge).toBeVisible({ timeout: 10000 })
  })

  test('track order CTA is visible and navigates', async ({ page }) => {
    const trackLink = page.locator('a[href*="/track-order"]').first()
    await expect(trackLink).toBeVisible({ timeout: 10000 })

    await trackLink.click()
    await page.waitForURL(/\/track-order/, { timeout: 15000 })
    expect(page.url()).toContain('/track-order')
  })

  test('contact CTA is visible', async ({ page }) => {
    const contactLink = page.locator('a[href*="/contact"]').first()
    await expect(contactLink).toBeVisible({ timeout: 10000 })
  })

  test('highlights section renders', async ({ page }) => {
    // Check highlights sidebar with items
    const highlightsSection = page.locator('[aria-labelledby="highlights-title"]')
    await expect(highlightsSection).toBeVisible({ timeout: 10000 })

    // Should have highlight items
    const highlightItems = highlightsSection.locator('li')
    const count = await highlightItems.count()
    expect(count).toBeGreaterThanOrEqual(3)
  })

  test('shipping methods section renders with 3 methods', async ({ page }) => {
    // Check methods section
    const methodsSection = page.locator('[aria-labelledby="methods-title"]')
    await expect(methodsSection).toBeVisible({ timeout: 10000 })

    // Should have 3 shipping method cards (express, standard, refrigerated)
    const methodCards = methodsSection.locator('article')
    const count = await methodCards.count()
    expect(count).toBe(3)
  })

  test('coverage section renders with regions', async ({ page }) => {
    // Check coverage section
    const coverageSection = page.locator('[aria-labelledby="coverage-title"]')
    await expect(coverageSection).toBeVisible({ timeout: 10000 })

    // Should have coverage regions
    const regions = coverageSection.locator('li')
    const count = await regions.count()
    expect(count).toBeGreaterThanOrEqual(3)
  })

  test('timeline section renders with 4 steps', async ({ page }) => {
    // Check timeline section
    const timelineSection = page.locator('[aria-labelledby="timeline-title"]')
    await expect(timelineSection).toBeVisible({ timeout: 10000 })

    // Should have 4 timeline steps
    const steps = timelineSection.locator('ol > li')
    const count = await steps.count()
    expect(count).toBe(4)

    // Check step numbers are visible
    const firstStepNumber = timelineSection.locator('div[class*="rounded-full"]').first()
    await expect(firstStepNumber).toContainText('1')
  })

  test('contact card section renders', async ({ page }) => {
    // Check contact card section at bottom
    const contactSection = page.locator('[aria-labelledby="contact-title"]')
    await expect(contactSection).toBeVisible({ timeout: 10000 })

    // Should have FAQ link
    const faqLink = contactSection.locator('a[href*="/faq"]')
    await expect(faqLink).toBeVisible()
  })

  test('FAQ link navigates correctly', async ({ page }) => {
    const faqLink = page.locator('a[href*="/faq"]').first()
    await expect(faqLink).toBeVisible({ timeout: 10000 })

    await faqLink.click()
    await page.waitForURL(/\/faq/, { timeout: 15000 })
    expect(page.url()).toContain('/faq')
  })

  test('page has correct SEO meta tags', async ({ page }) => {
    // Check title contains shipping-related content
    const title = await page.title()
    expect(title.toLowerCase()).toMatch(/shipping|envío|delivery/)

    // Check meta description exists
    const metaDescription = page.locator('meta[name="description"]')
    await expect(metaDescription).toHaveAttribute('content', /.+/)
  })

  test('i18n renders actual content, not keys', async ({ page }) => {
    // Get all visible text and ensure no raw i18n keys
    const bodyText = await page.locator('body').textContent()

    // These patterns would indicate broken i18n
    expect(bodyText).not.toContain('shippingPage.hero.')
    expect(bodyText).not.toContain('shippingPage.methods.')
    expect(bodyText).not.toContain('shippingPage.timeline.')
    expect(bodyText).not.toContain('shippingPage.coverage.')
  })
})
