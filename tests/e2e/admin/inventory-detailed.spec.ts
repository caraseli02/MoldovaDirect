import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:3000'

test.describe('Admin Inventory Page - Detailed Analysis', () => {
  test('inventory page error analysis and reporting', async ({ page, context }) => {
    console.log('=== ADMIN INVENTORY PAGE TEST ===\n')

    const testResults = {
      authentication: {
        status: 'pending' as string,
        details: ''
      },
      pageAccess: {
        status: 'pending' as string,
        errorCode: null as number | null,
        errorMessage: ''
      },
      componentRendering: {
        status: 'pending' as string,
        details: ''
      },
      consoleErrors: [] as string[]
    }

    // Capture network and console errors
    page.on('console', msg => {
      console.log(`[${msg.type().toUpperCase()}] ${msg.text()}`)
      if (msg.type() === 'error') {
        testResults.consoleErrors.push(msg.text())
      }
    })

    page.on('response', response => {
      if (response.status() >= 400) {
        console.log(`[HTTP ${response.status()}] ${response.url()}`)
      }
    })

    try {
      // Test 1: Try accessing inventory without login first
      console.log('TEST 1: Direct access to /admin/inventory without auth')
      console.log('---')

      await page.goto(`${BASE_URL}/admin/inventory`, { waitUntil: 'domcontentloaded' })
      let currentUrl = page.url()
      console.log(`Resulted URL: ${currentUrl}`)

      if (currentUrl.includes('/auth/login') || currentUrl.includes('/login')) {
        console.log('✓ Correctly redirected to login (unauthenticated)')
        testResults.authentication.status = 'redirected'
        testResults.authentication.details = 'Page requires authentication'

        // Test 2: Navigate through login
        console.log('\nTEST 2: Attempting login with credentials')
        console.log('---')

        const emailInput = await page.$('input[type="email"]')
        const passwordInput = await page.$('input[type="password"]')

        if (emailInput && passwordInput) {
          const testEmail = process.env.TEST_USER_EMAIL || 'admin@moldovadirect.com'
          const testPassword = process.env.TEST_USER_PASSWORD || 'Admin123!@#'

          await emailInput.fill(testEmail)
          await passwordInput.fill(testPassword)

          const submitBtn = await page.$('button[type="submit"]')
          if (submitBtn) {
            await submitBtn.click()
            await page.waitForTimeout(3000)

            currentUrl = page.url()
            console.log(`After login, URL: ${currentUrl}`)

            if (currentUrl.includes('/auth/login')) {
              const errorMsg = await page.textContent('[data-testid="auth-error"], [role="alert"]')
              console.log(`⚠ Login failed: ${errorMsg || 'Unknown error'}`)
              testResults.authentication.status = 'failed'
              testResults.authentication.details = errorMsg || 'Login returned error'
            } else {
              console.log('✓ Login appeared successful')
              testResults.authentication.status = 'success'
            }
          }
        }
      } else if (currentUrl.includes('/admin/inventory')) {
        console.log('✓ Accessed inventory page directly (authenticated session)')
        testResults.authentication.status = 'authenticated'
      }

      // Test 3: Navigate to inventory after auth
      console.log('\nTEST 3: Navigate to /admin/inventory')
      console.log('---')

      const inventoryResponse = await page.goto(`${BASE_URL}/admin/inventory`, {
        waitUntil: 'domcontentloaded'
      })

      const statusCode = inventoryResponse?.status()
      console.log(`Response status: ${statusCode}`)

      if (statusCode && statusCode >= 500) {
        testResults.pageAccess.status = 'error'
        testResults.pageAccess.errorCode = statusCode
        console.log(`✗ Server error: ${statusCode}`)

        // Extract error details from page
        const errorTitle = await page.$eval('body', el => el.textContent).catch(() => '')
        if (errorTitle.includes('Unknown variable dynamic import')) {
          testResults.pageAccess.errorMessage = 'Vite dynamic import resolution issue'
          console.log('ERROR IDENTIFIED: Dynamic import resolution failure in Vite')
          console.log('File: components/admin/Inventory/Reports.vue')
          console.log('Issue: Dynamic import path cannot be statically analyzed by Vite')
        }
      } else if (statusCode && statusCode < 400) {
        testResults.pageAccess.status = 'success'
        console.log('✓ Page loaded successfully')
      }

      await page.waitForTimeout(2000)

      // Test 4: Check page rendering
      console.log('\nTEST 4: Component and DOM Analysis')
      console.log('---')

      const pageTitle = await page.title()
      console.log(`Page title: "${pageTitle}"`)

      const h1 = await page.$('h1')
      const h1Text = h1 ? await h1.textContent() : null
      console.log(`Main heading: "${h1Text || 'Not found'}"`)

      const mainContent = await page.$('main, [role="main"]')
      console.log(`Main content: ${mainContent ? 'Found' : 'Not found'}`)

      const buttons = await page.$$('button')
      console.log(`Buttons on page: ${buttons.length}`)

      if (pageTitle.includes('500')) {
        console.log('⚠ Page is showing error page (500)')
        testResults.componentRendering.status = 'error'
        testResults.componentRendering.details = 'Server error preventing component render'
      } else if (mainContent && h1) {
        console.log('✓ Page rendered with content')
        testResults.componentRendering.status = 'success'
        testResults.componentRendering.details = 'Components rendered'
      } else {
        console.log('⚠ Page structure incomplete')
        testResults.componentRendering.status = 'incomplete'
      }

      // Test 5: Screenshots
      console.log('\nTEST 5: Taking Screenshots')
      console.log('---')

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      await page.screenshot({
        path: `./tests/e2e/admin/inventory-full-${timestamp}.png`,
        fullPage: true
      })
      console.log(`✓ Full page screenshot saved`)

      // Test 6: Console errors analysis
      console.log('\nTEST 6: Console Errors Analysis')
      console.log('---')

      if (testResults.consoleErrors.length === 0) {
        console.log('✓ No console errors detected')
      } else {
        console.log(`✗ ${testResults.consoleErrors.length} console error(s) detected:`)
        testResults.consoleErrors.forEach((err, i) => {
          console.log(`  ${i + 1}. ${err.substring(0, 80)}...`)
        })
      }

      // Final Report
      console.log('\n=== TEST REPORT SUMMARY ===\n')
      console.log('AUTHENTICATION:', testResults.authentication.status)
      console.log('  Details:', testResults.authentication.details)
      console.log('\nPAGE ACCESS:', testResults.pageAccess.status)
      if (testResults.pageAccess.errorCode) {
        console.log(`  Error Code: ${testResults.pageAccess.errorCode}`)
        console.log(`  Error: ${testResults.pageAccess.errorMessage}`)
      }
      console.log('\nCOMPONENT RENDERING:', testResults.componentRendering.status)
      console.log('  Details:', testResults.componentRendering.details)
      console.log('\nCONSOLE ERRORS:', testResults.consoleErrors.length)

      // Issues and Recommendations
      console.log('\n=== IDENTIFIED ISSUES ===\n')

      const issues = []

      if (testResults.authentication.status === 'failed') {
        issues.push({
          severity: 'CRITICAL',
          issue: 'Admin login not working',
          file: 'pages/auth/login.vue',
          details: `Credentials rejected: ${testResults.authentication.details}`
        })
      }

      if (testResults.pageAccess.errorCode === 500) {
        issues.push({
          severity: 'CRITICAL',
          issue: 'Dynamic import resolution failure',
          file: 'composables/useAsyncAdmin.ts',
          details: 'Cannot resolve dynamic import in useAsyncAdminComponent(). Vite requires static import paths.'
        })
      }

      if (testResults.consoleErrors.length > 0) {
        issues.push({
          severity: 'HIGH',
          issue: `${testResults.consoleErrors.length} console error(s)`,
          file: 'Various',
          details: testResults.consoleErrors.slice(0, 2).join('; ')
        })
      }

      if (issues.length === 0) {
        console.log('✓ No critical issues found')
      } else {
        issues.forEach((issue, i) => {
          console.log(`${i + 1}. [${issue.severity}] ${issue.issue}`)
          console.log(`   File: ${issue.file}`)
          console.log(`   Details: ${issue.details}`)
          console.log()
        })
      }

      // Recommendations
      console.log('=== RECOMMENDATIONS ===\n')

      if (testResults.pageAccess.errorMessage.includes('dynamic import')) {
        console.log('1. Fix Dynamic Import Issue:')
        console.log('   The dynamic import in useAsyncAdminComponent() needs to be static.')
        console.log('   Options:')
        console.log('   a) Use defineAsyncComponent with import.meta.glob() pattern')
        console.log('   b) Create a component registry for admin components')
        console.log('   c) Use explicit import statements instead of dynamic paths')
        console.log()
      }

      if (testResults.authentication.status !== 'success' && testResults.authentication.status !== 'authenticated') {
        console.log('2. Fix Authentication:')
        console.log('   a) Verify test credentials are correct')
        console.log('   b) Check if login endpoint is working')
        console.log('   c) Verify Supabase configuration')
        console.log()
      }

      console.log('=== END OF REPORT ===')

    } catch (error) {
      console.error('Test error:', error)
      throw error
    }
  })
})
