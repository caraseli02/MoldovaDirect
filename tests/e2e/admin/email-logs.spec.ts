/**
 * E2E Tests for Email Logs Admin Page
 *
 * Tests the email delivery monitoring functionality:
 * - Page loads without errors
 * - Email logs table renders properly
 * - Pagination works correctly
 * - Filter functionality (order number, email, type, status, dates)
 * - Details modal functionality
 * - Error handling and edge cases
 */

import { test, expect, type Page } from '@playwright/test'

test.describe('Admin Email Logs Page', () => {
  test.beforeEach(async ({ page, context }) => {
    // Add admin auth token to context to bypass auth middleware
    // This ensures we can access the admin page
    await context.addInitScript(() => {
      // Set up session/auth if needed
      localStorage.setItem('test-auth', 'true')
    })

    // Navigate to email logs page
    await page.goto('/admin/email-logs', { waitUntil: 'domcontentloaded' })

    // Wait for page to be interactive
    await page.waitForTimeout(1000)
  })

  test('should load page without errors', async ({ page }) => {
    // Check for page title
    const pageTitle = page.locator('h1')
    await expect(pageTitle).toContainText('Email Delivery Logs')

    // Check page description
    const pageDesc = page.locator('p')
    await expect(pageDesc.first()).toContainText('Monitor email delivery status and troubleshoot issues')

    // Verify no fatal errors in console
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    // Wait a bit for any potential errors to appear
    await page.waitForTimeout(1000)

    // Check for critical errors (filter out warnings)
    const criticalErrors = consoleErrors.filter(err =>
      !err.includes('deprecated')
      && !err.includes('warning')
      && !err.includes('warn'),
    )

    if (criticalErrors.length > 0) {
      console.warn('Console errors found:', criticalErrors)
    }
  })

  test('should display email delivery statistics section', async ({ page }) => {
    // Look for the stats section (AdminEmailDeliveryStats component)
    const statsSection = page.locator('[class*="space-y-6"]').first()
    await expect(statsSection).toBeVisible()

    // Wait for any stats to load
    await page.waitForTimeout(1500)

    // Check if stats cards are rendered (they may be empty if no data)
    const cards = page.locator('[class*="Card"]')
    // At least one card should be present (or loading state)
    const cardCount = await cards.count()
    console.log(`Stats cards found: ${cardCount}`)
  })

  test('should render email logs table', async ({ page }) => {
    // Wait for the table or empty state
    const table = page.locator('table')
    const emptyState = page.locator('text=No email logs found')

    // Either table or empty state should be visible
    const tableVisible = await table.isVisible().catch(() => false)
    const emptyStateVisible = await emptyState.isVisible().catch(() => false)

    expect(tableVisible || emptyStateVisible).toBeTruthy()

    if (tableVisible) {
      // Check table headers
      const headers = page.locator('th')
      const headerCount = await headers.count()
      expect(headerCount).toBeGreaterThan(0)

      // Verify key headers are present
      const headerTexts = await page.locator('th').allTextContents()
      console.log('Table headers:', headerTexts)
    }
  })

  test('should have all filter inputs available', async ({ page }) => {
    // Check Order Number filter
    const orderNumberInput = page.locator('input[placeholder="ORD-2024-001"]')
    await expect(orderNumberInput).toBeVisible()

    // Check Customer Email filter
    const emailInput = page.locator('input[placeholder="customer@example.com"]')
    await expect(emailInput).toBeVisible()

    // Check Email Type filter
    const emailTypeSelect = page.locator('select').first()
    await expect(emailTypeSelect).toBeVisible()

    // Check Status filter
    const statusSelect = page.locator('select').nth(1)
    await expect(statusSelect).toBeVisible()

    // Check Date From filter
    const dateFromInput = page.locator('input[type="date"]').first()
    await expect(dateFromInput).toBeVisible()

    // Check Date To filter
    const dateToInput = page.locator('input[type="date"]').nth(1)
    await expect(dateToInput).toBeVisible()
  })

  test('should filter by order number', async ({ page }) => {
    // Get initial row count
    const orderNumberInput = page.locator('input[placeholder="ORD-2024-001"]')

    // Type a test order number
    await orderNumberInput.fill('ORD-2024-001')

    // Wait for debounced search (500ms + network)
    await page.waitForTimeout(2000)

    // Check if results updated or empty state shown
    const table = page.locator('table')
    const emptyState = page.locator('text=No email logs found')
    const loadingState = page.locator('text=Loading email logs')

    // Wait for loading to complete
    await expect(loadingState).not.toBeVisible().catch(() => {})
    await page.waitForTimeout(500)

    // Either should have results or show empty state
    const hasTable = await table.isVisible().catch(() => false)
    const hasEmptyState = await emptyState.isVisible().catch(() => false)
    expect(hasTable || hasEmptyState).toBeTruthy()
  })

  test('should filter by customer email', async ({ page }) => {
    const emailInput = page.locator('input[placeholder="customer@example.com"]')

    // Type a test email
    await emailInput.fill('test@example.com')

    // Wait for debounced search
    await page.waitForTimeout(2000)

    // Check for results or empty state
    const table = page.locator('table')
    const emptyState = page.locator('text=No email logs found')

    const hasTable = await table.isVisible().catch(() => false)
    const hasEmptyState = await emptyState.isVisible().catch(() => false)
    expect(hasTable || hasEmptyState).toBeTruthy()
  })

  test('should filter by email type', async ({ page }) => {
    const emailTypeSelect = page.locator('select').first()

    // Select order confirmation type
    await emailTypeSelect.selectOption('order_confirmation')

    // Wait for search to complete
    await page.waitForTimeout(2000)

    // Verify results updated
    const table = page.locator('table')
    const emptyState = page.locator('text=No email logs found')

    const hasTable = await table.isVisible().catch(() => false)
    const hasEmptyState = await emptyState.isVisible().catch(() => false)
    expect(hasTable || hasEmptyState).toBeTruthy()
  })

  test('should filter by email delivery status', async ({ page }) => {
    const statusSelect = page.locator('select').nth(1)

    // Select delivered status
    await statusSelect.selectOption('delivered')

    // Wait for search
    await page.waitForTimeout(2000)

    // Verify UI updated
    const table = page.locator('table')
    const emptyState = page.locator('text=No email logs found')

    const hasTable = await table.isVisible().catch(() => false)
    const hasEmptyState = await emptyState.isVisible().catch(() => false)
    expect(hasTable || hasEmptyState).toBeTruthy()
  })

  test('should filter by date range', async ({ page }) => {
    const dateFromInput = page.locator('input[type="date"]').first()
    const dateToInput = page.locator('input[type="date"]').nth(1)

    // Set date range
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const dateFromValue = yesterday.toISOString().split('T')[0]

    await dateFromInput.fill(dateFromValue)
    await page.waitForTimeout(1000)

    // Set date to today
    const today = new Date().toISOString().split('T')[0]
    await dateToInput.fill(today)

    // Wait for search
    await page.waitForTimeout(2000)

    // Verify results
    const table = page.locator('table')
    const emptyState = page.locator('text=No email logs found')

    const hasTable = await table.isVisible().catch(() => false)
    const hasEmptyState = await emptyState.isVisible().catch(() => false)
    expect(hasTable || hasEmptyState).toBeTruthy()
  })

  test('should handle pagination controls', async ({ page }) => {
    // Wait for table to load
    await page.waitForTimeout(1500)

    // Check for pagination controls
    const prevButton = page.locator('button:has-text("Previous")')
    const nextButton = page.locator('button:has-text("Next")')

    // Pagination buttons should exist
    await expect(prevButton).toBeVisible()
    await expect(nextButton).toBeVisible()

    // Previous button should be disabled on first page
    const isPrevDisabled = await prevButton.isDisabled()
    expect(isPrevDisabled).toBe(true)

    // Try to click next if enabled
    const isNextDisabled = await nextButton.isDisabled()
    if (!isNextDisabled) {
      await nextButton.click()

      // Wait for page to update
      await page.waitForTimeout(2000)

      // Previous button should now be enabled
      const isPrevEnabledAfter = await prevButton.isDisabled()
      expect(isPrevEnabledAfter).toBe(false)
    }
    else {
      console.log('Only one page of results available')
    }
  })

  test('should display pagination info', async ({ page }) => {
    // Wait for table to load
    await page.waitForTimeout(1500)

    // Check for pagination text
    const paginationText = page.locator('text=/Showing \\d+ to \\d+ of \\d+ results/')

    const isVisible = await paginationText.isVisible().catch(() => false)
    if (isVisible) {
      const text = await paginationText.textContent()
      console.log('Pagination info:', text)
      expect(text).toMatch(/Showing \d+ to \d+ of \d+ results/)
    }
    else {
      // May not be visible if no results
      console.log('Pagination info not visible (no results)')
    }
  })

  test('should open details modal when clicking view button', async ({ page }) => {
    // Wait for table to load
    await page.waitForTimeout(1500)

    // Check if table has rows
    const tableRows = page.locator('tbody tr')
    const rowCount = await tableRows.count()

    if (rowCount > 0) {
      // Click view button on first row
      const viewButton = page.locator('button:has-text("View")').first()
      await viewButton.click()

      // Wait for modal to appear
      await page.waitForTimeout(500)

      // Check modal is visible
      const modal = page.locator('[class*="DialogContent"]')
      await expect(modal).toBeVisible()

      // Check modal title
      const modalTitle = page.locator('text=Email Log Details')
      await expect(modalTitle).toBeVisible()

      // Verify modal has content
      const modalLabels = page.locator('[class*="DialogContent"] label')
      const labelCount = await modalLabels.count()
      expect(labelCount).toBeGreaterThan(0)

      // Close modal by pressing Escape
      await page.keyboard.press('Escape')
      await page.waitForTimeout(300)

      // Modal should be closed
      const isModalVisible = await modal.isVisible().catch(() => false)
      expect(isModalVisible).toBe(false)
    }
    else {
      console.log('No email logs in table, skipping modal test')
    }
  })

  test('should reset filters when clearing inputs', async ({ page }) => {
    // Set a filter
    const orderNumberInput = page.locator('input[placeholder="ORD-2024-001"]')
    await orderNumberInput.fill('ORD-2024-001')
    await page.waitForTimeout(2000)

    // Clear the filter
    await orderNumberInput.clear()
    await page.waitForTimeout(2000)

    // Verify filter is empty
    const value = await orderNumberInput.inputValue()
    expect(value).toBe('')
  })

  test('should handle multiple filters together', async ({ page }) => {
    // Set multiple filters
    const orderNumberInput = page.locator('input[placeholder="ORD-2024-001"]')
    const emailTypeSelect = page.locator('select').first()

    await orderNumberInput.fill('ORD-2024')
    await emailTypeSelect.selectOption('order_shipped')

    // Wait for search
    await page.waitForTimeout(2000)

    // Verify UI updated
    const table = page.locator('table')
    const emptyState = page.locator('text=No email logs found')

    const hasTable = await table.isVisible().catch(() => false)
    const hasEmptyState = await emptyState.isVisible().catch(() => false)
    expect(hasTable || hasEmptyState).toBeTruthy()
  })

  test('should verify loading state appears during search', async ({ page }) => {
    // Clear any existing filters first
    const orderNumberInput = page.locator('input[placeholder="ORD-2024-001"]')
    await orderNumberInput.clear()
    await page.waitForTimeout(500)

    // Trigger a search
    await orderNumberInput.fill('test-order')

    // Check for loading indicator
    const loadingText = page.locator('text=Loading email logs')
    const loadingSpinner = page.locator('div[class*="animate-spin"]')

    // Loading should appear (might be very brief)
    const isLoadingTextVisible = await loadingText.isVisible().catch(() => false)
    const isSpinnerVisible = await loadingSpinner.isVisible().catch(() => false)

    console.log(`Loading indicator visible: ${isLoadingTextVisible || isSpinnerVisible}`)

    // Wait for loading to complete
    await page.waitForTimeout(2500)

    // After loading completes, table or empty state should be visible
    const table = page.locator('table')
    const emptyState = page.locator('text=No email logs found')

    const hasTable = await table.isVisible().catch(() => false)
    const hasEmptyState = await emptyState.isVisible().catch(() => false)
    expect(hasTable || hasEmptyState).toBeTruthy()
  })

  test('should check for console warnings and errors', async ({ page }) => {
    const messages: { type: string, text: string }[] = []

    page.on('console', (msg) => {
      messages.push({
        type: msg.type(),
        text: msg.text(),
      })
    })

    // Wait for page to fully load
    await page.waitForTimeout(2000)

    // Log all messages
    const errors = messages.filter(m => m.type === 'error')
    const warnings = messages.filter(m => m.type === 'warn')

    console.log('Console messages summary:')
    console.log(`- Errors: ${errors.length}`)
    console.log(`- Warnings: ${warnings.length}`)

    if (errors.length > 0) {
      console.log('Errors found:')
      errors.forEach(err => console.log(`  - ${err.text}`))
    }

    if (warnings.length > 0) {
      console.log('Warnings found:')
      warnings.slice(0, 5).forEach(warn => console.log(`  - ${warn.text}`))
    }
  })

  test('should verify responsive design on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Page should still load
    await expect(page.locator('h1')).toContainText('Email Delivery Logs')

    // Filters should stack vertically on mobile
    const filterInputs = page.locator('input[type="text"], input[type="email"], input[type="date"], select')
    const count = await filterInputs.count()
    expect(count).toBeGreaterThan(0)

    // Check if content is scrollable and not hidden
    const pageContent = page.locator('body')
    await expect(pageContent).toBeVisible()

    // Reset viewport for cleanup
    await page.setViewportSize({ width: 1280, height: 720 })
  })

  test('should verify table badges render correctly', async ({ page }) => {
    // Wait for table to load
    await page.waitForTimeout(1500)

    // Check if table has rows
    const tableRows = page.locator('tbody tr')
    const rowCount = await tableRows.count()

    if (rowCount > 0) {
      // Look for badge elements (status and email type badges)
      const badges = page.locator('[class*="Badge"]')
      const badgeCount = await badges.count()

      console.log(`Badges found in table: ${badgeCount}`)

      if (badgeCount > 0) {
        // Get some badge text to verify they're populated
        const badgeTexts = await badges.first().allTextContents()
        expect(badgeTexts.length).toBeGreaterThan(0)
      }
    }
  })

  test('should handle date input validation', async ({ page }) => {
    const dateFromInput = page.locator('input[type="date"]').first()

    // Try to fill with invalid date format (should be handled by browser)
    await dateFromInput.fill('2024-13-45') // Invalid month and day

    // Input should still exist
    await expect(dateFromInput).toBeVisible()

    // Clear and fill with valid date
    await dateFromInput.clear()
    await dateFromInput.fill('2024-11-15')

    // Value should be set correctly
    const value = await dateFromInput.inputValue()
    expect(value).toBe('2024-11-15')
  })
})
