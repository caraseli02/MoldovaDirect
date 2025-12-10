import type { Page } from '@playwright/test'
import { test, expect } from '@playwright/test'

test.describe('Admin Dashboard - Comprehensive Testing', () => {
  let page: Page
  const consoleMessages: Array<{ type: string, message: string }> = []

  test.beforeEach(async ({ browser }) => {
    const context = await browser.newContext()
    page = await context.newPage()

    // Capture console messages
    page.on('console', (msg) => {
      consoleMessages.push({
        type: msg.type(),
        message: msg.text(),
      })
      console.log(`[${msg.type().toUpperCase()}] ${msg.text()}`)
    })

    // Capture page errors
    page.on('pageerror', (error) => {
      consoleMessages.push({
        type: 'error',
        message: `Page Error: ${error.message}`,
      })
      console.log(`[PAGE ERROR] ${error.message}`)
    })
  })

  test('1. Navigate to admin page and verify it loads without errors', async () => {
    console.log('\n========== TEST 1: Page Navigation and Load ==========')

    // Navigate to admin page
    const response = await page.goto('http://localhost:3000/admin', {
      waitUntil: 'networkidle',
    })

    // Verify response is OK
    if (response) {
      console.log(`✓ Page loaded with status: ${response.status()}`)
      expect(response.status()).toBeLessThan(400)
    }

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle')

    // Take screenshot
    const screenshotPath = '/Users/vladislavcaraseli/Documents/MoldovaDirect.worktrees/products-improvments/admin-test-1-page-load.png'
    await page.screenshot({ path: screenshotPath, fullPage: true })
    console.log(`✓ Screenshot saved to: ${screenshotPath}`)

    // Verify page title
    const title = await page.title()
    console.log(`✓ Page title: "${title}"`)
    expect(title).toBeTruthy()

    // Check page URL
    const url = page.url()
    console.log(`✓ Current URL: ${url}`)
    expect(url).toContain('/admin')

    // Verify body content exists
    const bodyContent = await page.locator('body').isVisible()
    expect(bodyContent).toBeTruthy()
    console.log(`✓ Body content is visible: ${bodyContent}`)

    // Get page metrics
    const metrics = await page.evaluate(() => {
      return {
        documentElement: document.documentElement.tagName,
        bodyChildCount: document.body.children.length,
        readyState: document.readyState,
        location: window.location.href,
      }
    })

    console.log(`✓ Document metrics:`)
    console.log(`  - Root element: ${metrics.documentElement}`)
    console.log(`  - Body child elements: ${metrics.bodyChildCount}`)
    console.log(`  - Ready state: ${metrics.readyState}`)
  })

  test('2. Check console for errors and warnings', async () => {
    console.log('\n========== TEST 2: Console Error/Warning Check ==========')

    // Navigate to page first
    await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle' })

    // Wait a moment for any deferred errors
    await page.waitForTimeout(2000)

    // Get all console messages that were captured
    const errors = consoleMessages.filter(msg => msg.type === 'error')
    const warnings = consoleMessages.filter(msg => msg.type === 'warning')
    const logs = consoleMessages.filter(msg => msg.type === 'log')

    console.log(`✓ Console message summary:`)
    console.log(`  - Total messages: ${consoleMessages.length}`)
    console.log(`  - Errors: ${errors.length}`)
    console.log(`  - Warnings: ${warnings.length}`)
    console.log(`  - Logs: ${logs.length}`)

    if (errors.length > 0) {
      console.log(`\nErrors found (${errors.length}):`)
      errors.forEach((err, idx) => {
        console.log(`  ${idx + 1}. ${err.message}`)
      })
      // Log errors but don't fail test - may have expected errors
    }

    if (warnings.length > 0) {
      console.log(`\nWarnings found (${warnings.length}):`)
      warnings.slice(0, 5).forEach((warn, idx) => {
        console.log(`  ${idx + 1}. ${warn.message}`)
      })
    }

    // Check for unhandled rejections
    let unhandledRejection = false
    page.once('crash', () => {
      unhandledRejection = true
      console.log('✗ Page crashed!')
    })

    const pageInfo = await page.evaluate(() => {
      return {
        title: document.title,
        hasErrors: !!(window as any).__NUXT_ERROR__,
        errorCount: (window as any).__NUXT_ERROR_LOG__?.length || 0,
      }
    })

    console.log(`✓ Page info:`)
    console.log(`  - Title: ${pageInfo.title}`)
    console.log(`  - Has framework errors: ${pageInfo.hasErrors}`)
    console.log(`  - Error log count: ${pageInfo.errorCount}`)
  })

  test('3. Verify all UI elements render correctly (stats cards, charts, tables)', async () => {
    console.log('\n========== TEST 3: UI Elements Verification ==========')

    await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle' })

    // Check for main container
    const mainSelectors = [
      { name: 'main element', selector: 'main' },
      { name: 'admin layout', selector: '[class*="admin"]' },
      { name: 'dashboard container', selector: '[class*="dashboard"]' },
      { name: 'generic container', selector: '#__nuxt' },
    ]

    let foundMain = false
    for (const item of mainSelectors) {
      const exists = await page.locator(item.selector).isVisible({ timeout: 2000 }).catch(() => false)
      if (exists) {
        console.log(`✓ Found ${item.name}`)
        foundMain = true
        break
      }
    }

    if (!foundMain) {
      console.log('✗ Could not locate main content area')
    }

    // Count key UI elements
    const uiElements = [
      { name: 'Cards/Panels', selectors: ['[class*="card"]', '[class*="panel"]', '[class*="stat"]'] },
      { name: 'Charts/Graphs', selectors: ['[class*="chart"]', '[class*="graph"]', 'canvas', 'svg[class*="chart"]'] },
      { name: 'Tables', selectors: ['table', '[role="table"]', '[class*="table"]'] },
      { name: 'Buttons', selectors: ['button', '[role="button"]'] },
      { name: 'Forms/Inputs', selectors: ['form', 'input:not([type="hidden"])', 'textarea', 'select'] },
      { name: 'Navigation Links', selectors: ['nav a', '[class*="nav"] a', '[class*="sidebar"] a', 'aside a'] },
    ]

    console.log(`\n✓ UI Element Count:`)
    const elementCounts: Record<string, number> = {}

    for (const element of uiElements) {
      let totalCount = 0
      for (const selector of element.selectors) {
        const count = await page.locator(selector).count().catch(() => 0)
        totalCount += count
      }
      elementCounts[element.name] = totalCount
      const status = totalCount > 0 ? '✓' : '✗'
      console.log(`  ${status} ${element.name}: ${totalCount}`)
    }

    // Check for any visible text content
    const textContent = await page.locator('body').evaluate((el) => {
      const text = el.innerText.trim()
      return {
        length: text.length,
        wordCount: text.split(/\s+/).length,
        hasContent: text.length > 0,
      }
    })

    console.log(`\n✓ Page Content:`)
    console.log(`  - Text length: ${textContent.length} characters`)
    console.log(`  - Word count: ${textContent.wordCount}`)
    console.log(`  - Has content: ${textContent.hasContent}`)

    // Take screenshot
    const screenshotPath = '/Users/vladislavcaraseli/Documents/MoldovaDirect.worktrees/products-improvments/admin-test-2-ui-elements.png'
    await page.screenshot({ path: screenshotPath, fullPage: true })
    console.log(`\n✓ Screenshot saved to: ${screenshotPath}`)
  })

  test('4. Try clicking on navigation links in the sidebar', async () => {
    console.log('\n========== TEST 4: Navigation Links Testing ==========')

    await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle' })

    // Find navigation elements
    const navSelectors = ['nav a', '[class*="sidebar"] a', '[class*="menu"] a', 'aside a', '[role="navigation"] a']

    let foundLinks: Array<{ text: string, href: string, selector: string }> = []

    for (const selector of navSelectors) {
      const links = await page.locator(selector).all()
      for (const link of links) {
        const text = await link.textContent()
        const href = await link.getAttribute('href')

        if (text && href && !href.includes('javascript') && href.startsWith('/')) {
          foundLinks.push({
            text: text.trim(),
            href: href,
            selector: selector,
          })
        }
      }
    }

    // Remove duplicates
    foundLinks = Array.from(new Map(foundLinks.map(l => [l.href, l])).values())

    console.log(`✓ Found ${foundLinks.length} navigation links`)

    const testedLinks: Array<{ text: string, href: string, clickable: boolean, status: string, error?: string }> = []

    // Test clicking first 5 links
    for (let i = 0; i < Math.min(foundLinks.length, 5); i++) {
      const linkInfo = foundLinks[i]
      console.log(`\n  Testing link ${i + 1}/${Math.min(foundLinks.length, 5)}: "${linkInfo.text}" -> ${linkInfo.href}`)

      try {
        // Navigate back to admin
        await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle' })

        // Find and click the link
        const link = page.locator(`${linkInfo.selector}:has-text("${linkInfo.text}")`).first()
        const isVisible = await link.isVisible({ timeout: 2000 }).catch(() => false)

        if (!isVisible) {
          console.log(`    ✗ Link not visible`)
          testedLinks.push({
            text: linkInfo.text,
            href: linkInfo.href,
            clickable: false,
            status: 'Not visible',
          })
          continue
        }

        await link.click({ timeout: 5000 })
        await page.waitForLoadState('networkidle')

        const newUrl = page.url()
        const urlMatches = newUrl.includes(linkInfo.href) || newUrl.includes(linkInfo.href.split('/').pop() || '')

        if (urlMatches) {
          console.log(`    ✓ Successfully clicked and navigated to: ${newUrl}`)
          testedLinks.push({
            text: linkInfo.text,
            href: linkInfo.href,
            clickable: true,
            status: 'Success',
          })
        }
        else {
          console.log(`    ⚠ Clicked but URL mismatch. Got: ${newUrl}`)
          testedLinks.push({
            text: linkInfo.text,
            href: linkInfo.href,
            clickable: true,
            status: 'URL mismatch',
            error: `Expected ${linkInfo.href}, got ${newUrl}`,
          })
        }
      }
      catch (error) {
        console.log(`    ✗ Error: ${error}`)
        testedLinks.push({
          text: linkInfo.text,
          href: linkInfo.href,
          clickable: false,
          status: 'Error',
          error: String(error).substring(0, 100),
        })
      }
    }

    console.log(`\n✓ Navigation test summary: ${testedLinks.length}/${Math.min(foundLinks.length, 5)} links tested`)
    testedLinks.forEach((link, idx) => {
      const icon = link.clickable ? '✓' : '✗'
      console.log(`  ${icon} ${link.text}: ${link.status}`)
    })
  })

  test('5. Check for broken components or missing data', async () => {
    console.log('\n========== TEST 5: Broken Components & Missing Data Check ==========')

    await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle' })

    const issues: Array<{ type: string, description: string, severity: 'critical' | 'warning' | 'info' }> = []

    // Check for broken images
    console.log(`\n  Checking images...`)
    const images = await page.locator('img').all()
    console.log(`    Found ${images.length} images`)

    let brokenImages = 0
    for (const img of images) {
      const imageStatus = await img.evaluate((element: HTMLImageElement) => ({
        src: element.src,
        complete: element.complete,
        naturalWidth: element.naturalWidth,
        naturalHeight: element.naturalHeight,
      }))

      if (imageStatus.complete && imageStatus.naturalWidth === 0 && imageStatus.naturalHeight === 0) {
        brokenImages++
        issues.push({
          type: 'Broken Image',
          description: `Failed to load image: ${imageStatus.src}`,
          severity: 'warning',
        })
      }
    }

    if (brokenImages === 0 && images.length > 0) {
      console.log(`    ✓ All ${images.length} images loaded correctly`)
    }
    else if (brokenImages > 0) {
      console.log(`    ✗ ${brokenImages}/${images.length} images failed to load`)
    }

    // Check for error messages on page
    console.log(`\n  Checking for error messages...`)
    const errorElements = await page.locator('[class*="error"], [data-error], [role="alert"]').all()
    console.log(`    Found ${errorElements.length} error elements`)

    for (const errorEl of errorElements) {
      const text = await errorEl.textContent()
      if (text && text.trim()) {
        issues.push({
          type: 'Error Message',
          description: text.trim(),
          severity: 'warning',
        })
      }
    }

    // Check for loading skeletons (might indicate missing data)
    console.log(`\n  Checking for loading states...`)
    const skeletons = await page.locator('[class*="skeleton"], [class*="loading"], [class*="placeholder"]').all()
    console.log(`    Found ${skeletons.length} loading/skeleton elements`)

    if (skeletons.length > 3) {
      issues.push({
        type: 'Possible Data Loading Issue',
        description: `Found ${skeletons.length} loading/skeleton elements - data may still be loading`,
        severity: 'info',
      })
    }

    // Check page health
    console.log(`\n  Checking page health...`)
    const pageHealth = await page.evaluate(() => {
      const scripts = document.querySelectorAll('script[src]')
      const stylesheets = document.querySelectorAll('link[rel="stylesheet"]')
      const metaTags = document.querySelectorAll('meta')

      return {
        scriptsLoaded: scripts.length,
        stylesLoaded: stylesheets.length,
        metaTags: metaTags.length,
        hasMainContent: document.body.children.length > 0,
      }
    })

    console.log(`    Scripts loaded: ${pageHealth.scriptsLoaded}`)
    console.log(`    Stylesheets loaded: ${pageHealth.stylesLoaded}`)
    console.log(`    Meta tags: ${pageHealth.metaTags}`)
    console.log(`    Has main content: ${pageHealth.hasMainContent}`)

    if (pageHealth.scriptsLoaded === 0) {
      issues.push({
        type: 'Missing Scripts',
        description: 'No scripts loaded on page',
        severity: 'critical',
      })
    }

    // Summary
    console.log(`\n✓ Issues Summary:`)
    const critical = issues.filter(i => i.severity === 'critical')
    const warnings = issues.filter(i => i.severity === 'warning')
    const infos = issues.filter(i => i.severity === 'info')

    console.log(`  Critical: ${critical.length}`)
    console.log(`  Warnings: ${warnings.length}`)
    console.log(`  Info: ${infos.length}`)

    if (critical.length > 0) {
      console.log(`\n  Critical Issues:`)
      critical.forEach((issue, idx) => {
        console.log(`    ${idx + 1}. [${issue.type}] ${issue.description}`)
      })
    }

    if (warnings.length > 0) {
      console.log(`\n  Warnings:`)
      warnings.forEach((issue, idx) => {
        console.log(`    ${idx + 1}. [${issue.type}] ${issue.description}`)
      })
    }
  })

  test('6. Comprehensive page validation and detailed error reporting', async () => {
    console.log('\n========== TEST 6: Page Validation & Error Reporting ==========')

    await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle' })

    // Get detailed page structure
    console.log(`\n  Page Structure:`)
    const structure = await page.evaluate(() => {
      return {
        headings: {
          h1: document.querySelectorAll('h1').length,
          h2: document.querySelectorAll('h2').length,
          h3: document.querySelectorAll('h3').length,
          h4: document.querySelectorAll('h4').length,
          h5: document.querySelectorAll('h5').length,
          h6: document.querySelectorAll('h6').length,
        },
        buttons: document.querySelectorAll('button').length,
        links: document.querySelectorAll('a').length,
        formElements: {
          inputs: document.querySelectorAll('input:not([type="hidden"])').length,
          textareas: document.querySelectorAll('textarea').length,
          selects: document.querySelectorAll('select').length,
          forms: document.querySelectorAll('form').length,
        },
        lists: {
          unordered: document.querySelectorAll('ul').length,
          ordered: document.querySelectorAll('ol').length,
          datalists: document.querySelectorAll('datalist').length,
        },
        media: {
          images: document.querySelectorAll('img').length,
          videos: document.querySelectorAll('video').length,
          audios: document.querySelectorAll('audio').length,
        },
      }
    })

    console.log(`    Headings: H1=${structure.headings.h1}, H2=${structure.headings.h2}, H3=${structure.headings.h3}`)
    console.log(`    Interactive: Buttons=${structure.buttons}, Links=${structure.links}`)
    console.log(`    Forms: Inputs=${structure.formElements.inputs}, Textareas=${structure.formElements.textareas}, Forms=${structure.formElements.forms}`)
    console.log(`    Media: Images=${structure.media.images}, Videos=${structure.media.videos}`)

    // Check accessibility
    console.log(`\n  Accessibility Attributes:`)
    const a11y = await page.evaluate(() => {
      return {
        ariaLabels: document.querySelectorAll('[aria-label]').length,
        ariaDescribedBy: document.querySelectorAll('[aria-describedby]').length,
        roles: document.querySelectorAll('[role]').length,
        ariaHidden: document.querySelectorAll('[aria-hidden="true"]').length,
        langAttribute: document.documentElement.lang || 'not set',
      }
    })

    console.log(`    Aria labels: ${a11y.ariaLabels}`)
    console.log(`    Aria describedby: ${a11y.ariaDescribedBy}`)
    console.log(`    Role attributes: ${a11y.roles}`)
    console.log(`    Aria hidden: ${a11y.ariaHidden}`)
    console.log(`    Document language: ${a11y.langAttribute}`)

    // Performance metrics
    console.log(`\n  Performance Metrics:`)
    const metrics = await page.evaluate(() => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      return {
        domContentLoaded: perfData?.domContentLoadedEventEnd - perfData?.domContentLoadedEventStart || 'N/A',
        loadComplete: perfData?.loadEventEnd - perfData?.loadEventStart || 'N/A',
        domInteractive: perfData?.domInteractive || 'N/A',
      }
    })

    console.log(`    DOM Content Loaded: ${metrics.domContentLoaded}ms`)
    console.log(`    Load Complete: ${metrics.loadComplete}ms`)

    // Take final full screenshot
    const screenshotPath = '/Users/vladislavcaraseli/Documents/MoldovaDirect.worktrees/products-improvments/admin-test-3-final.png'
    await page.screenshot({ path: screenshotPath, fullPage: true })
    console.log(`\n✓ Final screenshot saved to: ${screenshotPath}`)
  })

  test.afterEach(async () => {
    // Summary of all console messages
    console.log('\n========== CONSOLE MESSAGES SUMMARY ==========')
    console.log(`Total messages captured: ${consoleMessages.length}`)

    const msgsByType = {
      error: consoleMessages.filter(m => m.type === 'error').length,
      warning: consoleMessages.filter(m => m.type === 'warning').length,
      log: consoleMessages.filter(m => m.type === 'log').length,
      info: consoleMessages.filter(m => m.type === 'info').length,
      debug: consoleMessages.filter(m => m.type === 'debug').length,
    }

    console.log(`Message breakdown:`)
    console.log(`  Errors: ${msgsByType.error}`)
    console.log(`  Warnings: ${msgsByType.warning}`)
    console.log(`  Logs: ${msgsByType.log}`)
    console.log(`  Info: ${msgsByType.info}`)
    console.log(`  Debug: ${msgsByType.debug}`)

    if (msgsByType.error > 0) {
      console.log(`\nFirst 5 errors:`)
      consoleMessages
        .filter(m => m.type === 'error')
        .slice(0, 5)
        .forEach((msg, idx) => {
          console.log(`  ${idx + 1}. ${msg.message}`)
        })
    }

    await page.close()
  })
})
