/**
 * Direct Test of Admin Email Logs Page - http://localhost:3000/admin/email-logs
 *
 * Tests the email delivery monitoring functionality:
 * 1. Navigate directly to the page
 * 2. Check what happens (authentication redirect or page load)
 * 3. Take screenshots for analysis
 * 4. Check console for errors
 * 5. Verify table renders if accessible
 * 6. Test pagination and filters if accessible
 */

import { test, expect, type Page } from '@playwright/test'

test.describe('Admin Email Logs Page - Direct Test', () => {

  test('1. Navigate to email logs and check page status', async ({ page, baseURL }) => {
    console.log('\n========== TEST 1: Direct Navigation ==========')

    // Navigate directly to email logs
    const response = await page.goto(`${baseURL}/admin/email-logs`, { waitUntil: 'domcontentloaded' })

    // Check response status
    if (response) {
      console.log(`✓ Response status: ${response.status()}`)
      console.log(`✓ Response status text: ${response.statusText()}`)
    }

    // Check current URL
    const currentUrl = page.url()
    console.log(`✓ Current URL: ${currentUrl}`)

    // Check if redirected to login
    if (currentUrl.includes('/auth/login')) {
      console.log('⚠ Redirected to login - page requires authentication')
    } else if (currentUrl.includes('/admin/email-logs')) {
      console.log('✓ Successfully loaded admin email-logs page')
    }

    // Take screenshot
    await page.screenshot({
      path: 'test-results/email-logs-direct-test-1-navigation.png',
      fullPage: true
    })
    console.log('✓ Screenshot saved: test-results/email-logs-direct-test-1-navigation.png')
  })

  test('2. Check page content and console errors', async ({ page, baseURL }) => {
    console.log('\n========== TEST 2: Content and Console Check ==========')

    const consoleMessages: { type: string; text: string }[] = []

    // Capture console messages
    page.on('console', msg => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text()
      })
    })

    // Navigate to email logs
    await page.goto(`${baseURL}/admin/email-logs`, { waitUntil: 'domcontentloaded' })

    // Wait for any potential errors to appear
    await page.waitForLoadState('networkidle').catch(() => {})
    await page.waitForTimeout(2000)

    // Get page title
    const pageTitle = await page.title()
    console.log(`✓ Page title: "${pageTitle}"`)

    // Get all h1/h2 headings
    const headings = await page.locator('h1, h2').allTextContents()
    console.log(`✓ Headings found: ${headings.length}`)
    headings.forEach((h, idx) => console.log(`  ${idx + 1}. ${h}`))

    // Analyze console messages
    const errors = consoleMessages.filter(m => m.type === 'error')
    const warnings = consoleMessages.filter(m => m.type === 'warn')
    const logs = consoleMessages.filter(m => m.type === 'log')

    console.log(`\n✓ Console messages summary:`)
    console.log(`  - Total: ${consoleMessages.length}`)
    console.log(`  - Errors: ${errors.length}`)
    console.log(`  - Warnings: ${warnings.length}`)
    console.log(`  - Logs: ${logs.length}`)

    if (errors.length > 0) {
      console.log(`\n✓ Errors found (first 5):`)
      errors.slice(0, 5).forEach((e, idx) => console.log(`  ${idx + 1}. ${e.text}`))
    }

    if (warnings.length > 0) {
      console.log(`\n✓ Warnings found (first 5):`)
      warnings.slice(0, 5).forEach((w, idx) => console.log(`  ${idx + 1}. ${w.text}`))
    }
  })

  test('3. Check for email logs table', async ({ page, baseURL }) => {
    console.log('\n========== TEST 3: Table Rendering ==========')

    // Navigate to email logs
    await page.goto(`${baseURL}/admin/email-logs`, { waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('networkidle').catch(() => {})
    await page.waitForTimeout(1500)

    // Check for table
    const table = page.locator('table')
    const tableVisible = await table.isVisible().catch(() => false)
    console.log(`✓ Table visible: ${tableVisible}`)

    if (tableVisible) {
      // Get table structure
      const headers = await table.locator('th').allTextContents()
      console.log(`✓ Table headers found: ${headers.length}`)
      headers.forEach((h, idx) => console.log(`  ${idx + 1}. ${h}`))

      const rows = await table.locator('tbody tr').count()
      console.log(`✓ Table rows: ${rows}`)
    }

    // Check for empty state
    const emptyState = page.locator('text=/No email logs|No data/')
    const emptyStateVisible = await emptyState.isVisible().catch(() => false)
    console.log(`✓ Empty state visible: ${emptyStateVisible}`)

    // Check for loading state
    const loadingSpinner = page.locator('[class*="animate-spin"], [class*="spinner"], [class*="loading"]')
    const spinnerCount = await loadingSpinner.count()
    console.log(`✓ Loading spinners found: ${spinnerCount}`)
  })

  test('4. Check filter inputs', async ({ page, baseURL }) => {
    console.log('\n========== TEST 4: Filter Inputs ==========')

    // Navigate to email logs
    await page.goto(`${baseURL}/admin/email-logs`, { waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('networkidle').catch(() => {})
    await page.waitForTimeout(1500)

    // Check for filter inputs
    const textInputs = page.locator('input[type="text"]')
    const emailInputs = page.locator('input[type="email"]')
    const dateInputs = page.locator('input[type="date"]')
    const selects = page.locator('select')
    const buttons = page.locator('button')

    const textCount = await textInputs.count()
    const emailCount = await emailInputs.count()
    const dateCount = await dateInputs.count()
    const selectCount = await selects.count()
    const buttonCount = await buttons.count()

    console.log(`✓ Input elements found:`)
    console.log(`  - Text inputs: ${textCount}`)
    console.log(`  - Email inputs: ${emailCount}`)
    console.log(`  - Date inputs: ${dateCount}`)
    console.log(`  - Selects: ${selectCount}`)
    console.log(`  - Buttons: ${buttonCount}`)

    // Try to interact with first text input
    if (textCount > 0) {
      const firstInput = textInputs.first()
      const placeholder = await firstInput.getAttribute('placeholder')
      const ariaLabel = await firstInput.getAttribute('aria-label')
      console.log(`\n✓ First text input:`)
      console.log(`  - Placeholder: ${placeholder}`)
      console.log(`  - Aria-label: ${ariaLabel}`)
    }
  })

  test('5. Check pagination controls', async ({ page, baseURL }) => {
    console.log('\n========== TEST 5: Pagination ==========')

    // Navigate to email logs
    await page.goto(`${baseURL}/admin/email-logs`, { waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('networkidle').catch(() => {})
    await page.waitForTimeout(1500)

    // Check for pagination buttons
    const prevButton = page.locator('button:has-text("Previous")')
    const nextButton = page.locator('button:has-text("Next")')

    const prevExists = await prevButton.isVisible().catch(() => false)
    const nextExists = await nextButton.isVisible().catch(() => false)

    console.log(`✓ Pagination buttons:`)
    console.log(`  - Previous: ${prevExists}`)
    console.log(`  - Next: ${nextExists}`)

    if (prevExists) {
      const isPrevDisabled = await prevButton.isDisabled()
      console.log(`  - Previous disabled: ${isPrevDisabled}`)
    }

    if (nextExists) {
      const isNextDisabled = await nextButton.isDisabled()
      console.log(`  - Next disabled: ${isNextDisabled}`)
    }

    // Check for pagination info text
    const paginationInfo = page.locator('text=/Showing|Page|of/')
    const infoVisible = await paginationInfo.isVisible().catch(() => false)
    console.log(`✓ Pagination info visible: ${infoVisible}`)

    if (infoVisible) {
      const infoText = await paginationInfo.textContent()
      console.log(`  - Text: ${infoText}`)
    }
  })

  test('6. Check mobile responsive design', async ({ page, baseURL }) => {
    console.log('\n========== TEST 6: Mobile Responsive ==========')

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    console.log('✓ Viewport set to mobile (375x667)')

    // Navigate to email logs
    await page.goto(`${baseURL}/admin/email-logs`, { waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('networkidle').catch(() => {})
    await page.waitForTimeout(1500)

    // Check if page is visible
    const bodyVisible = await page.locator('body').isVisible()
    console.log(`✓ Body content visible: ${bodyVisible}`)

    // Check for horizontal scrolling
    const scrollWidth = await page.evaluate(() => {
      return document.documentElement.scrollWidth
    })
    const viewportWidth = 375

    console.log(`✓ Viewport width: ${viewportWidth}px`)
    console.log(`✓ Document scroll width: ${scrollWidth}px`)

    if (scrollWidth > viewportWidth) {
      console.log('⚠ Page may have horizontal scroll (responsive issue)')
    } else {
      console.log('✓ No horizontal scroll (responsive OK)')
    }

    // Take mobile screenshot
    await page.screenshot({
      path: 'test-results/email-logs-direct-test-6-mobile.png',
      fullPage: true
    })
    console.log('✓ Mobile screenshot saved: test-results/email-logs-direct-test-6-mobile.png')

    // Reset viewport
    await page.setViewportSize({ width: 1280, height: 720 })
  })

  test('7. Check page performance metrics', async ({ page, baseURL }) => {
    console.log('\n========== TEST 7: Performance Metrics ==========')

    // Navigate to email logs
    await page.goto(`${baseURL}/admin/email-logs`, { waitUntil: 'networkidle' })

    // Get performance metrics
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      const paint = performance.getEntriesByType('paint')

      return {
        domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart,
        loadComplete: navigation?.loadEventEnd - navigation?.loadEventStart,
        domInteractive: navigation?.domInteractive - navigation?.fetchStart,
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime,
      }
    })

    console.log(`✓ Performance metrics:`)
    console.log(`  - DOM Content Loaded: ${metrics.domContentLoaded?.toFixed(2)}ms`)
    console.log(`  - Load Complete: ${metrics.loadComplete?.toFixed(2)}ms`)
    console.log(`  - DOM Interactive: ${metrics.domInteractive?.toFixed(2)}ms`)
    console.log(`  - First Paint: ${metrics.firstPaint?.toFixed(2)}ms`)
    console.log(`  - First Contentful Paint: ${metrics.firstContentfulPaint?.toFixed(2)}ms`)
  })

  test('8. Comprehensive page analysis', async ({ page, baseURL }) => {
    console.log('\n========== TEST 8: Comprehensive Analysis ==========')

    // Navigate to email logs
    await page.goto(`${baseURL}/admin/email-logs`, { waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('networkidle').catch(() => {})
    await page.waitForTimeout(2000)

    // Get page structure
    const structure = await page.evaluate(() => {
      return {
        headingCount: document.querySelectorAll('h1, h2, h3, h4, h5, h6').length,
        buttonCount: document.querySelectorAll('button').length,
        inputCount: document.querySelectorAll('input').length,
        linkCount: document.querySelectorAll('a').length,
        divCount: document.querySelectorAll('div').length,
        formCount: document.querySelectorAll('form').length,
        imageCount: document.querySelectorAll('img').length,
        tableCount: document.querySelectorAll('table').length,
      }
    })

    console.log(`✓ Page structure:`)
    console.log(`  - Headings: ${structure.headingCount}`)
    console.log(`  - Buttons: ${structure.buttonCount}`)
    console.log(`  - Inputs: ${structure.inputCount}`)
    console.log(`  - Links: ${structure.linkCount}`)
    console.log(`  - Forms: ${structure.formCount}`)
    console.log(`  - Images: ${structure.imageCount}`)
    console.log(`  - Tables: ${structure.tableCount}`)
    console.log(`  - Divs: ${structure.divCount}`)

    // Check current URL
    const currentUrl = page.url()
    console.log(`\n✓ Final URL: ${currentUrl}`)

    // Take final screenshot
    await page.screenshot({
      path: 'test-results/email-logs-direct-test-8-final.png',
      fullPage: true
    })
    console.log('✓ Final screenshot saved: test-results/email-logs-direct-test-8-final.png')
  })

})
