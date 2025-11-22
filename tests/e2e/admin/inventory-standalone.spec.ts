import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:3000'

test.describe('Admin Inventory Page', () => {
  test('should load inventory page with admin authentication', async ({ page, context }) => {
    // Collect console messages
    const consoleLogs: { type: string; message: string }[] = []
    const consoleErrors: string[] = []

    page.on('console', msg => {
      consoleLogs.push({ type: msg.type(), message: msg.text() })
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    page.on('pageerror', error => {
      consoleErrors.push(`[PAGE ERROR] ${error.message}`)
    })

    page.on('response', response => {
      if (response.status() >= 400) {
        console.log(`[HTTP ${response.status()}] ${response.url()}`)
      }
    })

    try {
      // Step 1: Navigate to login page
      console.log('=== STEP 1: Navigating to Login ===')
      await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'domcontentloaded' })

      // Wait for elements to be available
      await page.waitForLoadState('networkidle').catch(() => null)
      await page.waitForTimeout(2000)

      // Check if we need to handle language selector
      const langSelector = await page.$('[data-testid="language-selector"], [class*="language"]')
      if (langSelector) {
        console.log('Found language selector, checking current selection...')
      }

      // Step 2: Login as admin
      console.log('\n=== STEP 2: Logging in as admin ===')
      const testEmail = process.env.TEST_USER_EMAIL || 'admin@moldovadirect.com'
      const testPassword = process.env.TEST_USER_PASSWORD || 'Admin123!@#'

      // Find and fill email
      const emailInput = await page.$('input[type="email"]')
      if (!emailInput) {
        throw new Error('Email input not found on login page')
      }

      await emailInput.fill(testEmail)
      console.log(`Filled email: ${testEmail}`)

      // Find and fill password
      const passwordInput = await page.$('input[type="password"]')
      if (!passwordInput) {
        throw new Error('Password input not found on login page')
      }

      await passwordInput.fill(testPassword)
      console.log(`Filled password (${testPassword.length} chars)`)

      // Submit form
      const submitButton = await page.$('button[type="submit"]')
      if (!submitButton) {
        throw new Error('Submit button not found')
      }

      console.log('Clicking submit button...')
      await submitButton.click()

      // Wait for navigation or timeout
      await Promise.race([
        page.waitForNavigation({ timeout: 10000 }).catch(() => {
          console.log('Navigation timeout (but continuing...)')
        }),
        page.waitForTimeout(5000),
      ])

      const currentUrl = page.url()
      console.log(`URL after login attempt: ${currentUrl}`)

      // Check for error
      const errorElement = await page.$('[data-testid="auth-error"], [role="alert"]')
      if (errorElement) {
        const errorText = await errorElement.textContent()
        throw new Error(`Login failed: ${errorText}`)
      }

      // If still on login page, take screenshot for debug
      if (currentUrl.includes('/auth/login')) {
        console.log('⚠️ Still on login page, checking page state...')
        const pageContent = await page.content()
        const hasErrorMsg = pageContent.includes('Correo') || pageContent.includes('incorrectos')
        console.log(`Page contains Spanish error messages: ${hasErrorMsg}`)

        // Try to see if there are visible error messages
        const allText = await page.textContent('body')
        console.log(`Page contains "incorrectos": ${allText?.includes('incorrectos') || false}`)
      }

      // Step 3: Navigate to inventory page
      console.log('\n=== STEP 3: Navigating to /admin/inventory ===')
      await page.goto(`${BASE_URL}/admin/inventory`, { waitUntil: 'domcontentloaded' })

      await page.waitForLoadState('networkidle').catch(() => null)
      await page.waitForTimeout(1500)

      const inventoryUrl = page.url()
      console.log(`Inventory page URL: ${inventoryUrl}`)

      // Step 4: Take screenshot
      console.log('\n=== STEP 4: Taking Screenshot ===')
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      await page.screenshot({
        path: `./tests/e2e/admin/inventory-screenshot-${timestamp}.png`,
        fullPage: true,
      })
      console.log(`✓ Screenshot saved`)

      // Step 5: Check console for errors
      console.log('\n=== STEP 5: Console Analysis ===')
      console.log(`Total messages: ${consoleLogs.length}`)
      console.log(`Total errors: ${consoleErrors.length}`)

      if (consoleErrors.length > 0) {
        console.log('\nConsole Errors Detected:')
        consoleErrors.forEach((err, i) => {
          console.log(`  ${i + 1}. ${err.substring(0, 100)}`)
        })
      } else {
        console.log('✓ No console errors')
      }

      // Step 6: Verify component rendering
      console.log('\n=== STEP 6: Component Verification ===')

      const pageTitle = await page.title()
      console.log(`Page title: "${pageTitle}"`)

      // Check for main content elements
      const mainElement = await page.$('main, [role="main"]')
      console.log(`Main content area: ${mainElement ? '✓ Found' : '✗ Not found'}`)

      const headings = await page.$$eval('h1, h2', els => els.map(el => el.textContent).slice(0, 3))
      console.log(`Page headings: ${headings.length > 0 ? headings.join(', ') : 'None found'}`)

      // Look for table or data grid
      const table = await page.$('table, [role="table"], [data-testid*="inventory"], [data-testid*="table"]')
      console.log(`Table/Data Grid: ${table ? '✓ Found' : '✗ Not found'}`)

      // Check for buttons
      const buttons = await page.$$('button')
      console.log(`Interactive buttons: ${buttons.length} found`)

      // Check for inputs
      const inputs = await page.$$('input:not([type="hidden"])')
      console.log(`Input fields: ${inputs.length} found`)

      // Step 7: Test interactive elements
      console.log('\n=== STEP 7: Testing Interactive Elements ===')

      // Look for search input
      const searchInput = await page.$('input[placeholder*="search" i], input[aria-label*="search" i]')
      if (searchInput) {
        console.log('✓ Search input found')
        await searchInput.focus()
        console.log('  - Focused search input')
      }

      // Look for action buttons
      const actionButtons = await page.$$eval(
        'button:not([aria-hidden="true"])',
        els => els.slice(0, 5).map(el => el.textContent?.trim() || el.getAttribute('aria-label') || 'Unnamed'),
      )
      if (actionButtons.length > 0) {
        console.log('✓ Action buttons found:')
        actionButtons.forEach((btn, i) => {
          if (btn) console.log(`  ${i + 1}. ${btn.substring(0, 40)}`)
        })
      }

      // Step 8: Check page structure
      console.log('\n=== STEP 8: Page Structure ===')
      const hasNav = !!(await page.$('nav, [role="navigation"]'))
      const hasSidebar = !!(await page.$('aside, [role="complementary"], [class*="sidebar"]'))
      const hasHeader = !!(await page.$('header, [role="banner"]'))

      console.log(`Navigation: ${hasNav ? '✓' : '✗'}`)
      console.log(`Sidebar: ${hasSidebar ? '✓' : '✗'}`)
      console.log(`Header: ${hasHeader ? '✓' : '✗'}`)

      // Final assessment
      console.log('\n=== TEST ASSESSMENT ===')
      const isInventoryPage = inventoryUrl.includes('/admin/inventory')
      const hasPageContent = !!mainElement || (headings.length > 0 && buttons.length > 0)
      const noErrors = consoleErrors.length === 0

      if (isInventoryPage) {
        console.log('✓ Successfully navigated to inventory page')
      } else {
        console.log('✗ Not on inventory page')
      }

      if (hasPageContent) {
        console.log('✓ Page has expected content')
      } else {
        console.log('⚠ Page content might be missing')
      }

      if (noErrors) {
        console.log('✓ No console errors')
      } else {
        console.log(`⚠ ${consoleErrors.length} console error(s) detected`)
      }

      // Assertions
      expect(isInventoryPage).toBeTruthy()
    } catch (error) {
      console.error('\n=== TEST FAILED ===')
      console.error(`Error: ${error instanceof Error ? error.message : String(error)}`)

      // Take failure screenshot
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      await page
        .screenshot({
          path: `./tests/e2e/admin/inventory-failure-${timestamp}.png`,
          fullPage: true,
        })
        .catch(() => null)

      throw error
    }
  })
})
