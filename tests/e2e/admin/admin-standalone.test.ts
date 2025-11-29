#!/usr/bin/env npx playwright test

/**
 * Admin Page Test - Standalone
 * Tests admin page functionality without requiring authentication
 * This test navigates directly to the admin page to check for console errors and UI issues
 */

import { test as base, expect, Page } from '@playwright/test'

// Use base test without storage state
const test = base.extend({})

test.describe('Admin Page - Standalone Testing (No Auth Required)', () => {
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

    // Capture request failures
    page.on('requestfailed', request => {
      console.log(`[REQUEST FAILED] ${request.method()} ${request.url()} - ${request.failure()?.errorText}`)
    })
  })

  test('1. Navigate to /admin and check for 404 or auth redirect', async () => {
    console.log('\n========== TEST 1: Admin Page Navigation ==========')

    const response = await page.goto('http://localhost:3000/admin', {
      waitUntil: 'domcontentloaded'
    })

    if (response) {
      console.log(`Response status: ${response.status()}`)
      console.log(`Response OK: ${response.ok()}`)

      if (response.status() === 404) {
        console.log('Admin page not found (404)')
      } else if (response.status() === 401 || response.status() === 403) {
        console.log('Admin page requires authentication')
      }
    }

    const currentUrl = page.url()
    console.log(`Current URL: ${currentUrl}`)

    // Take screenshot
    await page.screenshot({
      path: '/Users/vladislavcaraseli/Documents/MoldovaDirect.worktrees/products-improvments/admin-standalone-1-navigation.png',
      fullPage: true
    })
    console.log('✓ Screenshot saved: admin-standalone-1-navigation.png')
  })

  test('2. Check admin page for errors if accessible, or auth redirect', async () => {
    console.log('\n========== TEST 2: Admin Page Load and Errors ==========')

    const response = await page.goto('http://localhost:3000/admin', {
      waitUntil: 'domcontentloaded'
    })

    const statusCode = response?.status() || 0
    console.log(`Page load status: ${statusCode}`)

    // Wait for any deferred errors
    await page.waitForTimeout(2000)

    // Check current URL
    const currentUrl = page.url()
    console.log(`Final URL: ${currentUrl}`)

    // Check if we were redirected to auth login
    if (currentUrl.includes('/auth/signin') || currentUrl.includes('/auth/login')) {
      console.log('Redirected to authentication page - this is expected if not logged in')
    }

    // Console errors summary
    const errors = consoleMessages.filter(m => m.type === 'error')
    const warnings = consoleMessages.filter(m => m.type === 'warning')

    console.log(`\nConsole messages:`)
    console.log(`  Errors: ${errors.length}`)
    console.log(`  Warnings: ${warnings.length}`)
    console.log(`  Page errors: ${pageErrors.length}`)

    if (errors.length > 0) {
      console.log('\nFirst 5 console errors:')
      errors.slice(0, 5).forEach((err, idx) => {
        console.log(`  ${idx + 1}. ${err.message.substring(0, 150)}`)
      })
    }

    // Check for critical component issues
    const criticalComponents = ['UiButton', 'UiSonner', 'hydration', 'cart', 'store']
    const relevantErrors = errors.filter(err =>
      criticalComponents.some(comp => err.message.toLowerCase().includes(comp.toLowerCase()))
    )

    if (relevantErrors.length > 0) {
      console.log(`\nCritical component errors found:`)
      relevantErrors.forEach(err => {
        console.log(`  - ${err.message}`)
      })
    }
  })

  test('3. Direct admin page check via HTTP (ignore redirects)', async () => {
    console.log('\n========== TEST 3: Direct HTTP Check of /admin ==========')

    // Don't follow redirects to see the actual endpoint response
    const response = await page.request.get('http://localhost:3000/admin', {
      headers: {
        'Accept': 'text/html'
      }
    })

    console.log(`GET /admin response:`)
    console.log(`  Status: ${response.status()}`)
    console.log(`  OK: ${response.ok()}`)

    // Check response headers
    const headers = response.headers()
    console.log(`  Content-Type: ${headers['content-type']}`)
    console.log(`  Location (if redirect): ${headers['location'] || 'N/A'}`)

    if (response.status() === 200) {
      const text = await response.text()
      console.log(`  Response length: ${text.length} bytes`)
      console.log(`  Contains "admin": ${text.toLowerCase().includes('admin')}`)
      console.log(`  Contains "dashboard": ${text.toLowerCase().includes('dashboard')}`)
    }
  })

  test('4. Take login page screenshot and check for form issues', async () => {
    console.log('\n========== TEST 4: Login Page Check ==========')

    // Navigate to login page
    const response = await page.goto('http://localhost:3000/auth/login', {
      waitUntil: 'domcontentloaded'
    })

    console.log(`Login page status: ${response?.status()}`)

    // Wait for page to settle
    await page.waitForTimeout(2000)

    // Take screenshot
    await page.screenshot({
      path: '/Users/vladislavcaraseli/Documents/MoldovaDirect.worktrees/products-improvments/admin-standalone-4-login-page.png',
      fullPage: true
    })
    console.log('✓ Screenshot saved: admin-standalone-4-login-page.png')

    // Check for console errors on login page
    const loginErrors = consoleMessages.filter(m => m.type === 'error')
    if (loginErrors.length > 0) {
      console.log(`\nConsole errors on login page (${loginErrors.length}):`)
      loginErrors.slice(0, 5).forEach((err, idx) => {
        console.log(`  ${idx + 1}. ${err.message.substring(0, 150)}`)
      })
    } else {
      console.log('✓ No console errors on login page')
    }
  })

  test('5. Check middleware and auth configuration', async () => {
    console.log('\n========== TEST 5: Auth Configuration Check ==========')

    // Check if middleware files exist and analyze
    const middlewareContent = await page.evaluate(() => {
      return {
        hasAuth: !!(window as any).__NUXT_CONTEXT__?.auth,
        hasSession: !!(window as any).__NUXT_CONTEXT__?.session,
        location: window.location.href,
        isSecure: window.location.protocol === 'https:',
      }
    })

    console.log('Auth context:')
    console.log(`  Has auth: ${middlewareContent.hasAuth}`)
    console.log(`  Has session: ${middlewareContent.hasSession}`)
    console.log(`  Current location: ${middlewareContent.location}`)
    console.log(`  Is secure (HTTPS): ${middlewareContent.isSecure}`)

    // Check for Nuxt meta tags
    const metaTags = await page.evaluate(() => {
      const tags = {
        title: document.title,
        lang: document.documentElement.lang,
        metaAuth: document.querySelector('meta[name="auth"]')?.getAttribute('content'),
      }
      return tags
    })

    console.log('\nPage meta information:')
    console.log(`  Title: ${metaTags.title}`)
    console.log(`  Lang: ${metaTags.lang}`)
  })

  test('6. Comprehensive console and error report', async () => {
    console.log('\n========== TEST 6: Comprehensive Error Report ==========')

    // Navigate to admin
    await page.goto('http://localhost:3000/admin', {
      waitUntil: 'domcontentloaded'
    })

    // Wait for deferred errors
    await page.waitForTimeout(3000)

    // Generate report
    const report = {
      timestamp: new Date().toISOString(),
      currentUrl: page.url(),
      consoleMessages: {
        total: consoleMessages.length,
        errors: consoleMessages.filter(m => m.type === 'error').length,
        warnings: consoleMessages.filter(m => m.type === 'warning').length,
        logs: consoleMessages.filter(m => m.type === 'log').length,
        info: consoleMessages.filter(m => m.type === 'info').length,
      },
      pageErrors: pageErrors.length,
      criticalIssues: [] as string[]
    }

    // Check for critical issues
    const allText = consoleMessages.map(m => m.message).join('\n').toLowerCase()
    const criticalKeywords = ['hydration mismatch', 'ui button', 'uisonner', 'cart store error', 'parse error']

    criticalKeywords.forEach(keyword => {
      if (allText.includes(keyword)) {
        report.criticalIssues.push(keyword)
      }
    })

    // Print report
    console.log('\n========== ERROR REPORT SUMMARY ==========')
    console.log(JSON.stringify(report, null, 2))

    if (pageErrors.length > 0) {
      console.log('\n========== PAGE ERRORS ==========')
      pageErrors.forEach((err, idx) => {
        console.log(`\n${idx + 1}. ${err.message}`)
        if (err.stack) {
          console.log(`Stack: ${err.stack.substring(0, 300)}`)
        }
      })
    }

    if (consoleMessages.length > 0) {
      const allErrors = consoleMessages.filter(m => m.type === 'error')
      if (allErrors.length > 0) {
        console.log('\n========== ALL CONSOLE ERRORS ==========')
        allErrors.forEach((err, idx) => {
          console.log(`${idx + 1}. ${err.message}`)
        })
      }
    }
  })

  test('7. Check for missing assets and broken resources', async () => {
    console.log('\n========== TEST 7: Resource Check ==========')

    const failedRequests: Array<{ url: string; status: number }> = []

    // Monitor all requests
    page.on('response', response => {
      if (response.status() >= 400) {
        failedRequests.push({
          url: response.url(),
          status: response.status()
        })
      }
    })

    // Navigate to admin
    await page.goto('http://localhost:3000/admin', {
      waitUntil: 'domcontentloaded'
    })

    // Wait for resources to load
    await page.waitForTimeout(3000)

    if (failedRequests.length > 0) {
      console.log(`\nFailed requests (${failedRequests.length}):`)
      failedRequests.slice(0, 10).forEach((req, idx) => {
        console.log(`  ${idx + 1}. ${req.status} ${req.url}`)
      })
    } else {
      console.log('✓ No failed requests detected')
    }

    // Check for broken images
    const images = await page.evaluate(() => {
      const imgs = document.querySelectorAll('img')
      return Array.from(imgs).map(img => ({
        src: (img as HTMLImageElement).src,
        alt: img.alt,
        complete: (img as HTMLImageElement).complete,
        naturalWidth: (img as HTMLImageElement).naturalWidth
      }))
    })

    const brokenImages = images.filter(img => img.complete && img.naturalWidth === 0)
    if (brokenImages.length > 0) {
      console.log(`\nBroken images (${brokenImages.length}):`)
      brokenImages.slice(0, 5).forEach((img, idx) => {
        console.log(`  ${idx + 1}. ${img.src} (alt: ${img.alt})`)
      })
    }
  })
})
