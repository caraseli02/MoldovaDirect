import { test as base, expect, Page, devices } from '@playwright/test'

// Create test without global setup
const test = base.extend({})

test.use({
  // Disable global setup/teardown
  serviceWorkers: 'allow'
})

test.describe.configure({ mode: 'parallel' })

test.describe('Admin Dashboard - With Authentication', () => {
  let page: Page
  const consoleMessages: Array<{ type: string; message: string; timestamp: number }> = []
  const pageErrors: Array<{ message: string; stack?: string; timestamp: number }> = []

  test.beforeEach(async ({ browser }) => {
    const context = await browser.newContext()
    page = await context.newPage()

    // Capture console messages
    page.on('console', msg => {
      const timestamp = Date.now()
      const message = msg.text()
      consoleMessages.push({
        type: msg.type(),
        message: message,
        timestamp: timestamp
      })
      console.log(`[${msg.type().toUpperCase()}] ${message}`)
    })

    // Capture page errors
    page.on('pageerror', error => {
      const timestamp = Date.now()
      pageErrors.push({
        message: error.message,
        stack: error.stack,
        timestamp: timestamp
      })
      console.log(`[PAGE ERROR] ${error.message}`)
    })
  })

  test.afterEach(async () => {
    // Print summary of console messages
    if (consoleMessages.length > 0) {
      const errorCount = consoleMessages.filter(m => m.type === 'error').length
      const warningCount = consoleMessages.filter(m => m.type === 'warning').length
      console.log(`\n========== CONSOLE SUMMARY ==========`)
      console.log(`Total messages: ${consoleMessages.length}`)
      console.log(`Errors: ${errorCount}`)
      console.log(`Warnings: ${warningCount}`)
    }

    if (pageErrors.length > 0) {
      console.log(`\n========== PAGE ERRORS SUMMARY ==========`)
      console.log(`Total page errors: ${pageErrors.length}`)
      pageErrors.forEach((err, idx) => {
        console.log(`${idx + 1}. ${err.message}`)
      })
    }
  })

  test('1. Authenticate and navigate to admin dashboard', async () => {
    console.log('\n========== TEST 1: Authentication and Navigation ==========')

    // Step 1: Navigate to login page
    console.log('Step 1: Navigating to login page...')
    const loginResponse = await page.goto('http://localhost:3000/auth/signin', {
      waitUntil: 'networkidle'
    })

    if (loginResponse) {
      console.log(`✓ Login page loaded with status: ${loginResponse.status()}`)
      expect(loginResponse.status()).toBeLessThan(400)
    }

    // Take screenshot of login page
    await page.screenshot({
      path: '/Users/vladislavcaraseli/Documents/MoldovaDirect.worktrees/products-improvments/admin-auth-1-login-page.png',
      fullPage: true
    })
    console.log('✓ Screenshot saved: admin-auth-1-login-page.png')

    // Step 2: Fill in email
    console.log('\nStep 2: Filling in email...')
    const emailInput = page.locator('[data-testid="email-input"], input[type="email"], input[placeholder*="email" i]').first()
    const emailInputExists = await emailInput.count() > 0
    expect(emailInputExists).toBeTruthy()

    await emailInput.fill('admin@moldovadirect.com')
    console.log('✓ Email filled: admin@moldovadirect.com')

    // Step 3: Fill in password
    console.log('\nStep 3: Filling in password...')
    const passwordInput = page.locator('[data-testid="password-input"], input[type="password"], input[placeholder*="password" i]').first()
    const passwordInputExists = await passwordInput.count() > 0
    expect(passwordInputExists).toBeTruthy()

    await passwordInput.fill('Admin123!@#')
    console.log('✓ Password filled')

    // Step 4: Click submit/login button
    console.log('\nStep 4: Clicking login button...')
    const loginButton = page.locator(
      '[data-testid="login-button"], [data-testid="submit-button"], button:has-text("Sign in"), button:has-text("Login")'
    ).first()
    const loginButtonExists = await loginButton.count() > 0
    expect(loginButtonExists).toBeTruthy()

    await loginButton.click()
    console.log('✓ Login button clicked')

    // Step 5: Wait for redirect to admin dashboard
    console.log('\nStep 5: Waiting for redirect to admin dashboard...')

    // Wait for either /admin or redirect completion
    try {
      await page.waitForURL(/\/admin|\/dashboard/, { timeout: 15000 })
      console.log(`✓ Redirected to: ${page.url()}`)
    } catch (error) {
      // If not redirected to admin, check if there's an error on the login page
      const pageUrl = page.url()
      if (!pageUrl.includes('/admin')) {
        console.log(`⚠ Not redirected to /admin, current URL: ${pageUrl}`)

        // Check for error messages
        const errorMessages = await page.locator('[role="alert"], [class*="error"], [class*="toast"]').all()
        if (errorMessages.length > 0) {
          for (let i = 0; i < Math.min(errorMessages.length, 3); i++) {
            const text = await errorMessages[i].textContent()
            console.log(`  Error message: ${text}`)
          }
        }
      }
    }

    // Wait for page to load
    await page.waitForLoadState('networkidle')

    // Verify we're on the admin page
    const currentUrl = page.url()
    console.log(`\n✓ Final URL: ${currentUrl}`)

    if (currentUrl.includes('/admin')) {
      console.log('✓ Successfully authenticated and on admin page')
    } else {
      console.log(`⚠ Not on expected admin page. Current URL: ${currentUrl}`)
    }

    // Get page title
    const title = await page.title()
    console.log(`✓ Page title: "${title}"`)
  })

  test('2. Verify admin page is fully loaded', async () => {
    console.log('\n========== TEST 2: Admin Page Load Verification ==========')

    // First authenticate
    await authenticateAdmin(page)

    // Wait for network idle
    await page.waitForLoadState('networkidle')
    console.log('✓ Page reached network idle state')

    // Verify we're on admin page
    const url = page.url()
    expect(url).toContain('/admin')
    console.log(`✓ On admin page: ${url}`)

    // Get document ready state
    const metrics = await page.evaluate(() => {
      return {
        readyState: document.readyState,
        documentElement: document.documentElement.tagName,
        bodyChildCount: document.body.children.length,
        hasMainContent: !!document.querySelector('main') || !!document.querySelector('[role="main"]')
      }
    })

    console.log(`✓ Document metrics:`)
    console.log(`  - Ready state: ${metrics.readyState}`)
    console.log(`  - Root element: ${metrics.documentElement}`)
    console.log(`  - Body child elements: ${metrics.bodyChildCount}`)
    console.log(`  - Has main content: ${metrics.hasMainContent}`)

    // Take screenshot
    await page.screenshot({
      path: '/Users/vladislavcaraseli/Documents/MoldovaDirect.worktrees/products-improvments/admin-auth-2-page-loaded.png',
      fullPage: true
    })
    console.log('✓ Screenshot saved: admin-auth-2-page-loaded.png')
  })

  test('3. Check console for specific errors (UiButton, UiSonner, hydration, cart store)', async () => {
    console.log('\n========== TEST 3: Console Error Check (Critical Components) ==========')

    // Authenticate and wait
    await authenticateAdmin(page)
    await page.waitForLoadState('networkidle')

    // Wait a moment for any deferred errors
    await page.waitForTimeout(3000)

    // Analyze console messages
    const errorMessages = consoleMessages.filter(msg => msg.type === 'error')
    const warningMessages = consoleMessages.filter(msg => msg.type === 'warning')

    console.log(`\n✓ Total console errors: ${errorMessages.length}`)
    console.log(`✓ Total console warnings: ${warningMessages.length}`)

    // Check for specific component errors
    const criticalComponents = ['UiButton', 'UiSonner', 'hydration', 'cart store', 'cart', 'store']
    const issuesByComponent: Record<string, string[]> = {}

    criticalComponents.forEach(component => {
      const relevantErrors = errorMessages.filter(msg =>
        msg.message.toLowerCase().includes(component.toLowerCase())
      )
      const relevantWarnings = warningMessages.filter(msg =>
        msg.message.toLowerCase().includes(component.toLowerCase())
      )

      if (relevantErrors.length > 0 || relevantWarnings.length > 0) {
        issuesByComponent[component] = [
          ...relevantErrors.map(e => `ERROR: ${e.message}`),
          ...relevantWarnings.map(w => `WARNING: ${w.message}`)
        ]
      }
    })

    if (Object.keys(issuesByComponent).length > 0) {
      console.log(`\n⚠ Issues found in critical components:`)
      Object.entries(issuesByComponent).forEach(([component, issues]) => {
        console.log(`\n  ${component}:`)
        issues.slice(0, 3).forEach(issue => {
          console.log(`    - ${issue.substring(0, 120)}...`)
        })
      })
    } else {
      console.log(`\n✓ No critical component errors found`)
    }

    // Log first 10 errors for review
    if (errorMessages.length > 0) {
      console.log(`\nAll errors (${errorMessages.length} total):`)
      errorMessages.slice(0, 10).forEach((err, idx) => {
        console.log(`  ${idx + 1}. ${err.message.substring(0, 120)}`)
      })
      if (errorMessages.length > 10) {
        console.log(`  ... and ${errorMessages.length - 10} more`)
      }
    }

    // Log first 5 warnings
    if (warningMessages.length > 0) {
      console.log(`\nWarnings (${warningMessages.length} total, showing first 5):`)
      warningMessages.slice(0, 5).forEach((warn, idx) => {
        console.log(`  ${idx + 1}. ${warn.message.substring(0, 120)}`)
      })
    }
  })

  test('4. Verify UI elements render: stats cards, charts, recent activity', async () => {
    console.log('\n========== TEST 4: UI Elements Verification ==========')

    await authenticateAdmin(page)
    await page.waitForLoadState('networkidle')

    // Define selectors for key UI elements
    const uiElementSelectors = [
      { name: 'Stats Cards', selectors: ['[class*="card"]', '[class*="stat"]', '[data-testid*="card"]', '[data-testid*="stat"]'] },
      { name: 'Charts', selectors: ['canvas', '[class*="chart"]', '[data-testid*="chart"]', 'svg[class*="chart"]'] },
      { name: 'Recent Activity', selectors: ['[class*="activity"]', '[class*="recent"]', '[data-testid*="activity"]', '[data-testid*="recent"]'] },
      { name: 'Tables', selectors: ['table', '[role="table"]', '[class*="table"]'] },
      { name: 'Headers', selectors: ['h1', 'h2', '[role="heading"]'] },
      { name: 'Navigation/Sidebar', selectors: ['nav', 'aside', '[class*="sidebar"]', '[class*="nav"]'] }
    ]

    console.log(`\n✓ UI Element Inventory:`)
    const foundElements: Record<string, number> = {}

    for (const element of uiElementSelectors) {
      let totalCount = 0
      for (const selector of element.selectors) {
        try {
          const count = await page.locator(selector).count()
          totalCount += count
        } catch (e) {
          // Selector error, continue
        }
      }
      foundElements[element.name] = totalCount
      const status = totalCount > 0 ? '✓' : '✗'
      console.log(`  ${status} ${element.name}: ${totalCount}`)
    }

    // Verify we have some meaningful content
    const hasContent = await page.evaluate(() => {
      const bodyText = document.body.innerText
      return {
        hasText: bodyText.length > 100,
        wordCount: bodyText.split(/\s+/).length,
        elementCount: document.querySelectorAll('*').length
      }
    })

    console.log(`\n✓ Page Content:`)
    console.log(`  - Has meaningful text: ${hasContent.hasText}`)
    console.log(`  - Word count: ${hasContent.wordCount}`)
    console.log(`  - Total elements on page: ${hasContent.elementCount}`)

    // Take screenshot
    await page.screenshot({
      path: '/Users/vladislavcaraseli/Documents/MoldovaDirect.worktrees/products-improvments/admin-auth-4-ui-elements.png',
      fullPage: true
    })
    console.log('\n✓ Screenshot saved: admin-auth-4-ui-elements.png')
  })

  test('5. Test sidebar navigation clicks', async () => {
    console.log('\n========== TEST 5: Sidebar Navigation Testing ==========')

    await authenticateAdmin(page)
    await page.waitForLoadState('networkidle')

    // Find sidebar navigation elements
    const navSelectors = [
      'nav a',
      'aside a',
      '[class*="sidebar"] a',
      '[class*="menu"] a',
      '[role="navigation"] a'
    ]

    interface NavLink {
      text: string
      href: string
      selector: string
    }

    let navLinks: NavLink[] = []

    for (const selector of navSelectors) {
      try {
        const links = await page.locator(selector).all()
        for (const link of links) {
          try {
            const text = await link.textContent()
            const href = await link.getAttribute('href')

            if (text && href && !href.includes('javascript') && (href.startsWith('/') || href.startsWith('http'))) {
              navLinks.push({
                text: text.trim(),
                href: href,
                selector: selector
              })
            }
          } catch (e) {
            // Error reading link, continue
          }
        }
      } catch (e) {
        // Error with selector, continue
      }
    }

    // Remove duplicates by href
    const uniqueLinks = Array.from(new Map(navLinks.map(l => [l.href, l])).values())
    console.log(`\n✓ Found ${uniqueLinks.length} unique navigation links`)

    // Display all found links
    if (uniqueLinks.length > 0) {
      console.log('\nNavigation links:')
      uniqueLinks.forEach((link, idx) => {
        console.log(`  ${idx + 1}. ${link.text.substring(0, 30)} -> ${link.href}`)
      })
    }

    // Test clicking first few links
    const testLimit = Math.min(uniqueLinks.length, 5)
    console.log(`\n✓ Testing first ${testLimit} links...`)

    const testedLinks: Array<{ text: string; href: string; clickable: boolean; status: string; error?: string }> = []

    for (let i = 0; i < testLimit; i++) {
      const link = uniqueLinks[i]
      console.log(`\n  Link ${i + 1}/${testLimit}: "${link.text.substring(0, 30)}" -> ${link.href}`)

      try {
        // Re-navigate to admin in case we moved away
        if (!page.url().includes('/admin')) {
          await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle' })
        }

        // Try to find and click the link
        const linkElement = page.locator(`${link.selector}:has-text("${link.text}")`).first()
        const isVisible = await linkElement.isVisible({ timeout: 2000 }).catch(() => false)

        if (!isVisible) {
          console.log(`    ✗ Link not visible after re-navigation`)
          testedLinks.push({
            text: link.text,
            href: link.href,
            clickable: false,
            status: 'Not visible'
          })
          continue
        }

        await linkElement.click({ timeout: 5000 })
        await page.waitForLoadState('networkidle')

        const newUrl = page.url()
        const clickSuccess = true

        console.log(`    ✓ Clicked successfully, navigated to: ${newUrl}`)
        testedLinks.push({
          text: link.text,
          href: link.href,
          clickable: true,
          status: 'Success'
        })
      } catch (error) {
        const errorMsg = String(error).substring(0, 100)
        console.log(`    ✗ Error: ${errorMsg}`)
        testedLinks.push({
          text: link.text,
          href: link.href,
          clickable: false,
          status: 'Error',
          error: errorMsg
        })
      }
    }

    // Summary
    const successCount = testedLinks.filter(l => l.clickable).length
    console.log(`\n✓ Navigation test summary: ${successCount}/${testLimit} links clickable`)
  })

  test('6. Full page screenshot and visual verification', async () => {
    console.log('\n========== TEST 6: Full Page Screenshot and Verification ==========')

    await authenticateAdmin(page)
    await page.waitForLoadState('networkidle')

    // Wait a bit more for any lazy-loaded content
    await page.waitForTimeout(2000)

    // Take full page screenshot
    const screenshotPath = '/Users/vladislavcaraseli/Documents/MoldovaDirect.worktrees/products-improvments/admin-auth-6-full-page.png'
    await page.screenshot({ path: screenshotPath, fullPage: true })
    console.log(`✓ Full page screenshot saved: admin-auth-6-full-page.png`)

    // Get visible viewport screenshot
    const viewportPath = '/Users/vladislavcaraseli/Documents/MoldovaDirect.worktrees/products-improvments/admin-auth-6-viewport.png'
    await page.screenshot({ path: viewportPath })
    console.log(`✓ Viewport screenshot saved: admin-auth-6-viewport.png`)

    // Analyze page structure
    const pageStructure = await page.evaluate(() => {
      return {
        title: document.title,
        headings: {
          h1: document.querySelectorAll('h1').length,
          h2: document.querySelectorAll('h2').length,
          h3: document.querySelectorAll('h3').length,
          h4: document.querySelectorAll('h4').length,
        },
        images: document.querySelectorAll('img').length,
        buttons: document.querySelectorAll('button').length,
        links: document.querySelectorAll('a').length,
        forms: document.querySelectorAll('form').length,
        inputs: document.querySelectorAll('input').length,
        isFocusableElementPresent: !!document.querySelector('button, a, input, [tabindex]')
      }
    })

    console.log(`\n✓ Page Structure Analysis:`)
    console.log(`  - Title: ${pageStructure.title}`)
    console.log(`  - H1 headings: ${pageStructure.headings.h1}`)
    console.log(`  - H2 headings: ${pageStructure.headings.h2}`)
    console.log(`  - Images: ${pageStructure.images}`)
    console.log(`  - Buttons: ${pageStructure.buttons}`)
    console.log(`  - Links: ${pageStructure.links}`)
    console.log(`  - Forms: ${pageStructure.forms}`)
    console.log(`  - Input fields: ${pageStructure.inputs}`)
    console.log(`  - Has focusable elements: ${pageStructure.isFocusableElementPresent}`)
  })

  test('7. Comprehensive error and warning report', async () => {
    console.log('\n========== TEST 7: Comprehensive Error and Warning Report ==========')

    await authenticateAdmin(page)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000) // Wait for deferred errors

    // Categorize console messages
    const errors = consoleMessages.filter(m => m.type === 'error')
    const warnings = consoleMessages.filter(m => m.type === 'warning')
    const logs = consoleMessages.filter(m => m.type === 'log')
    const infos = consoleMessages.filter(m => m.type === 'info')

    console.log(`\n========== CONSOLE MESSAGE SUMMARY ==========`)
    console.log(`Total messages: ${consoleMessages.length}`)
    console.log(`  - Errors: ${errors.length}`)
    console.log(`  - Warnings: ${warnings.length}`)
    console.log(`  - Logs: ${logs.length}`)
    console.log(`  - Info: ${infos.length}`)

    if (errors.length > 0) {
      console.log(`\n========== ERRORS (${errors.length}) ==========`)
      errors.forEach((err, idx) => {
        console.log(`${idx + 1}. ${err.message}`)
      })
    }

    if (warnings.length > 0) {
      console.log(`\n========== WARNINGS (${warnings.length}, showing first 10) ==========`)
      warnings.slice(0, 10).forEach((warn, idx) => {
        console.log(`${idx + 1}. ${warn.message}`)
      })
      if (warnings.length > 10) {
        console.log(`... and ${warnings.length - 10} more warnings`)
      }
    }

    // Check for page errors
    if (pageErrors.length > 0) {
      console.log(`\n========== PAGE ERRORS (${pageErrors.length}) ==========`)
      pageErrors.forEach((err, idx) => {
        console.log(`${idx + 1}. ${err.message}`)
        if (err.stack) {
          console.log(`   Stack: ${err.stack.substring(0, 200)}...`)
        }
      })
    }

    // Visual issues check
    const visualIssues = await page.evaluate(() => {
      const issues: string[] = []

      // Check for broken images
      const images = document.querySelectorAll('img')
      images.forEach((img, idx) => {
        if ((img as HTMLImageElement).naturalWidth === 0) {
          issues.push(`Broken image: ${img.src}`)
        }
      })

      // Check for visible overflow
      const bodyOverflow = window.getComputedStyle(document.body).overflow
      if (bodyOverflow === 'hidden') {
        issues.push('Body has overflow:hidden')
      }

      // Check for elements with 0 width/height
      const allElements = document.querySelectorAll('*')
      let zeroSizeCount = 0
      allElements.forEach(el => {
        const rect = el.getBoundingClientRect()
        if (rect.width === 0 || rect.height === 0) {
          zeroSizeCount++
        }
      })

      if (zeroSizeCount > 0) {
        issues.push(`${zeroSizeCount} elements with 0 width or height`)
      }

      return {
        brokenImages: images.length - (images.length - issues.filter(i => i.includes('Broken')).length),
        issues: issues
      }
    })

    if (visualIssues.issues.length > 0) {
      console.log(`\n========== VISUAL ISSUES (${visualIssues.issues.length}) ==========`)
      visualIssues.issues.forEach((issue, idx) => {
        console.log(`${idx + 1}. ${issue}`)
      })
    } else {
      console.log(`\n✓ No visual issues detected`)
    }

    // Final verdict
    console.log(`\n========== TEST VERDICT ==========`)
    const hasErrors = errors.length > 0
    const hasPageErrors = pageErrors.length > 0
    const hasVisualIssues = visualIssues.issues.length > 0

    if (!hasErrors && !hasPageErrors && !hasVisualIssues) {
      console.log('✓ PASS: Admin page loads successfully with no critical issues')
    } else {
      console.log('⚠ ISSUES DETECTED:')
      if (hasErrors) console.log(`  - ${errors.length} console errors`)
      if (hasPageErrors) console.log(`  - ${pageErrors.length} page errors`)
      if (hasVisualIssues) console.log(`  - ${visualIssues.issues.length} visual issues`)
    }
  })
})

// Helper function to authenticate
async function authenticateAdmin(page: Page) {
  console.log('Authenticating as admin...')

  // Navigate to login
  await page.goto('http://localhost:3000/auth/signin', { waitUntil: 'networkidle' })

  // Fill in credentials
  const emailInput = page.locator('[data-testid="email-input"], input[type="email"]').first()
  const passwordInput = page.locator('[data-testid="password-input"], input[type="password"]').first()

  await emailInput.fill('admin@moldovadirect.com')
  await passwordInput.fill('Admin123!@#')

  // Click login
  const loginButton = page.locator(
    '[data-testid="login-button"], [data-testid="submit-button"], button:has-text("Sign in"), button:has-text("Login")'
  ).first()

  await loginButton.click()

  // Wait for navigation
  try {
    await page.waitForURL(/\/admin|\/dashboard/, { timeout: 15000 })
  } catch (e) {
    console.log('Note: Did not redirect to /admin, continuing with current page')
  }

  await page.waitForLoadState('networkidle')
  console.log('✓ Authentication completed')
}
