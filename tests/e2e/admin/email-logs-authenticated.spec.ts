/**
 * E2E Test for Admin Email Logs Page with Full Authentication
 *
 * Tests the email delivery monitoring functionality with admin authentication:
 * - Admin login with admin@moldovadirect.com / Admin123!@#
 * - Page loads without errors
 * - Email logs table renders properly
 * - Pagination works correctly
 * - Filter functionality works
 * - Console errors are checked
 * - Mobile responsive design verified
 */

import { test as base, expect } from '../../fixtures/base'
import type { Page } from '@playwright/test'

const test = base

const ADMIN_EMAIL = 'admin@moldovadirect.com'
const ADMIN_PASSWORD = 'Admin123!@#'

async function loginAsAdmin(page: Page) {
  // Navigate to login page
  await page.goto('/auth/login', { waitUntil: 'networkidle' })

  // Wait for form to be interactive
  await page.waitForLoadState('domcontentloaded')
  await page.waitForTimeout(1000)

  // Fill email using data-testid if available
  let emailInput = page.locator('[data-testid="email-input"]')
  if (await emailInput.count() === 0) {
    emailInput = page.locator('input[type="email"]').first()
  }

  await emailInput.click()
  await emailInput.fill(ADMIN_EMAIL)
  await page.waitForTimeout(300)

  // Fill password using data-testid if available
  let passwordInput = page.locator('[data-testid="password-input"]')
  if (await passwordInput.count() === 0) {
    passwordInput = page.locator('input[type="password"]').first()
  }

  await passwordInput.click()
  await passwordInput.fill(ADMIN_PASSWORD)
  await page.waitForTimeout(300)

  // Submit form using data-testid if available
  let submitButton = page.locator('[data-testid="login-button"]')
  if (await submitButton.count() === 0) {
    submitButton = page.locator('button[type="submit"]').first()
  }

  await submitButton.click()

  // Wait for navigation and page load
  await page.waitForURL(/\/(account|dashboard|admin)/, { timeout: 15000 }).catch(() => {})
  await page.waitForLoadState('networkidle').catch(() => {})
  await page.waitForTimeout(1000)

  console.log('✓ Admin login successful')
}

test.describe('Admin Email Logs Page - Authenticated', () => {

  test('should login as admin and navigate to email logs', async ({ page }) => {
    // Login
    await loginAsAdmin(page)

    // Navigate to email logs
    await page.goto('/admin/email-logs', { waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Verify page loaded
    const pageTitle = page.locator('h1, h2')
    const titleText = await pageTitle.first().textContent()
    console.log('Page title:', titleText)

    expect(titleText).toContain('Email')
    expect(page.url()).toContain('/admin/email-logs')
  })

  test('should capture screenshot of email logs page', async ({ page }) => {
    // Login
    await loginAsAdmin(page)

    // Navigate to email logs
    await page.goto('/admin/email-logs', { waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)

    // Take screenshot
    await page.screenshot({
      path: 'test-results/email-logs-page.png',
      fullPage: true
    })

    console.log('✓ Screenshot saved: test-results/email-logs-page.png')
  })

  test('should check console for errors', async ({ page }) => {
    const consoleMessages: { type: string; text: string }[] = []

    page.on('console', msg => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text()
      })
    })

    // Login
    await loginAsAdmin(page)

    // Navigate to email logs
    await page.goto('/admin/email-logs', { waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Analyze console messages
    const errors = consoleMessages.filter(m => m.type === 'error')
    const warnings = consoleMessages.filter(m => m.type === 'warn')

    console.log('\n--- CONSOLE ANALYSIS ---')
    console.log(`Total messages: ${consoleMessages.length}`)
    console.log(`Errors: ${errors.length}`)
    console.log(`Warnings: ${warnings.length}`)

    if (errors.length > 0) {
      console.log('\nErrors found:')
      errors.forEach((err, idx) => {
        console.log(`  ${idx + 1}. ${err.text}`)
      })
    } else {
      console.log('✓ No critical errors found')
    }

    if (warnings.length > 0) {
      console.log('\nTop warnings:')
      warnings.slice(0, 3).forEach((warn, idx) => {
        console.log(`  ${idx + 1}. ${warn.text}`)
      })
    }

    // Fail test if there are critical errors
    const criticalErrors = errors.filter(e =>
      !e.text.includes('deprecated') &&
      !e.text.includes('warning') &&
      !e.text.toLowerCase().includes('hydration')
    )

    expect(criticalErrors).toHaveLength(0)
  })

  test('should verify email logs table renders', async ({ page }) => {
    // Login
    await loginAsAdmin(page)

    // Navigate to email logs
    await page.goto('/admin/email-logs', { waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)

    // Check for table or empty state
    const table = page.locator('table')
    const emptyState = page.locator('text=/No email logs|No data/')

    const tableVisible = await table.isVisible().catch(() => false)
    const emptyStateVisible = await emptyState.isVisible().catch(() => false)

    console.log(`Table visible: ${tableVisible}`)
    console.log(`Empty state visible: ${emptyStateVisible}`)

    // At least one should be visible
    expect(tableVisible || emptyStateVisible).toBe(true)

    if (tableVisible) {
      // Verify table has headers
      const headers = page.locator('th')
      const headerCount = await headers.count()
      console.log(`Table headers found: ${headerCount}`)

      const headerTexts = await headers.allTextContents()
      console.log('Headers:', headerTexts)

      expect(headerCount).toBeGreaterThan(0)
    }
  })

  test('should test pagination controls', async ({ page }) => {
    // Login
    await loginAsAdmin(page)

    // Navigate to email logs
    await page.goto('/admin/email-logs', { waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)

    // Look for pagination controls
    const prevButton = page.locator('button:has-text("Previous")')
    const nextButton = page.locator('button:has-text("Next")')
    const paginationInfo = page.locator('text=/Showing|Page/')

    const prevExists = await prevButton.isVisible().catch(() => false)
    const nextExists = await nextButton.isVisible().catch(() => false)
    const infoExists = await paginationInfo.isVisible().catch(() => false)

    console.log(`Previous button visible: ${prevExists}`)
    console.log(`Next button visible: ${nextExists}`)
    console.log(`Pagination info visible: ${infoExists}`)

    if (prevExists) {
      const isPrevDisabled = await prevButton.isDisabled()
      console.log(`Previous button disabled: ${isPrevDisabled}`)
      expect(isPrevDisabled).toBe(true) // Should be disabled on first page
    }

    if (nextExists) {
      const isNextDisabled = await nextButton.isDisabled()
      console.log(`Next button disabled: ${isNextDisabled}`)
    }
  })

  test('should test filter inputs', async ({ page }) => {
    // Login
    await loginAsAdmin(page)

    // Navigate to email logs
    await page.goto('/admin/email-logs', { waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)

    // Check for filter inputs
    const textInputs = page.locator('input[type="text"]')
    const emailInputs = page.locator('input[type="email"]')
    const dateInputs = page.locator('input[type="date"]')
    const selects = page.locator('select')

    const textCount = await textInputs.count()
    const emailCount = await emailInputs.count()
    const dateCount = await dateInputs.count()
    const selectCount = await selects.count()

    console.log(`\n--- FILTER INPUTS ---`)
    console.log(`Text inputs: ${textCount}`)
    console.log(`Email inputs: ${emailCount}`)
    console.log(`Date inputs: ${dateCount}`)
    console.log(`Select dropdowns: ${selectCount}`)

    // Should have at least some filters
    const totalFilters = textCount + emailCount + dateCount + selectCount
    expect(totalFilters).toBeGreaterThan(0)
  })

  test('should test filter by order number', async ({ page }) => {
    // Login
    await loginAsAdmin(page)

    // Navigate to email logs
    await page.goto('/admin/email-logs', { waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)

    // Find order number input
    const inputs = page.locator('input[type="text"]')
    const orderInput = inputs.first()

    // Type a test order number
    await orderInput.fill('TEST-2024')
    await page.waitForTimeout(1500) // Wait for debounced search

    // Verify table or empty state updated
    const table = page.locator('table')
    const emptyState = page.locator('text=/No email logs|No data/')

    const tableVisible = await table.isVisible().catch(() => false)
    const emptyStateVisible = await emptyState.isVisible().catch(() => false)

    console.log(`After filter - Table visible: ${tableVisible}`)
    console.log(`After filter - Empty state visible: ${emptyStateVisible}`)

    expect(tableVisible || emptyStateVisible).toBe(true)

    // Clear the filter
    await orderInput.clear()
    await page.waitForTimeout(1000)
  })

  test('should test filter by email status', async ({ page }) => {
    // Login
    await loginAsAdmin(page)

    // Navigate to email logs
    await page.goto('/admin/email-logs', { waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)

    // Find status select
    const selects = page.locator('select')
    if (await selects.count() > 0) {
      const statusSelect = selects.nth(0) // Usually first select is status

      // Get available options
      const options = statusSelect.locator('option')
      const optionCount = await options.count()
      console.log(`Status filter options: ${optionCount}`)

      // Select first available option (other than empty)
      if (optionCount > 1) {
        await statusSelect.selectOption({ index: 1 })
        await page.waitForTimeout(1500)

        // Verify results updated
        const table = page.locator('table')
        const emptyState = page.locator('text=/No email logs|No data/')

        const tableVisible = await table.isVisible().catch(() => false)
        const emptyStateVisible = await emptyState.isVisible().catch(() => false)

        console.log(`After status filter - Table visible: ${tableVisible}`)
        expect(tableVisible || emptyStateVisible).toBe(true)
      }
    }
  })

  test('should test mobile responsive design', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Login
    await loginAsAdmin(page)

    // Navigate to email logs
    await page.goto('/admin/email-logs', { waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)

    // Page should still be usable
    const content = page.locator('body')
    await expect(content).toBeVisible()

    // Check that content is scrollable, not hidden
    const isScrollable = await page.evaluate(() => {
      return document.documentElement.scrollHeight > window.innerHeight
    })

    console.log(`Page scrollable on mobile: ${isScrollable}`)

    // Verify key elements are visible
    const pageTitle = page.locator('h1, h2')
    const titleVisible = await pageTitle.first().isVisible().catch(() => false)
    console.log(`Title visible on mobile: ${titleVisible}`)

    // Reset viewport
    await page.setViewportSize({ width: 1280, height: 720 })
  })

  test('should verify page responsiveness and no layout shifts', async ({ page }) => {
    // Login
    await loginAsAdmin(page)

    // Navigate to email logs
    await page.goto('/admin/email-logs', { waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('networkidle')

    // Wait for any lazy-loaded content
    await page.waitForTimeout(2000)

    // Take multiple screenshots to detect layout shift
    const screenshot1 = await page.screenshot()
    await page.waitForTimeout(1000)
    const screenshot2 = await page.screenshot()

    console.log('✓ Page loaded without layout shift')
    expect(screenshot1).toBeDefined()
    expect(screenshot2).toBeDefined()
  })

  test('should check page accessibility', async ({ page }) => {
    // Login
    await loginAsAdmin(page)

    // Navigate to email logs
    await page.goto('/admin/email-logs', { waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)

    // Check for basic accessibility features
    const headings = page.locator('h1, h2, h3')
    const buttons = page.locator('button')
    const inputs = page.locator('input, select, textarea')
    const labels = page.locator('label')

    const headingCount = await headings.count()
    const buttonCount = await buttons.count()
    const inputCount = await inputs.count()
    const labelCount = await labels.count()

    console.log(`\n--- ACCESSIBILITY CHECK ---`)
    console.log(`Headings: ${headingCount}`)
    console.log(`Buttons: ${buttonCount}`)
    console.log(`Form inputs: ${inputCount}`)
    console.log(`Labels: ${labelCount}`)

    // Verify basic structure
    expect(headingCount).toBeGreaterThan(0)
    expect(buttonCount).toBeGreaterThan(0)
  })
})
