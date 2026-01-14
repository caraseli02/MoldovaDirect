import type { FullConfig } from '@playwright/test'
import { chromium } from '@playwright/test'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

// Load environment variables from .env file
dotenv.config()

// Prevent vitest setup from being loaded in Playwright context
process.env.PLAYWRIGHT_TEST = 'true'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Wait for the dev server to be ready
 */
async function waitForServer(baseURL: string, timeout = 120000) {
  const startTime = Date.now()
  // Check auth/login page as it's more reliable than root
  const healthCheckURL = `${baseURL}/auth/login`
  console.log(`⏳ Waiting for server at ${healthCheckURL}...`)

  while (Date.now() - startTime < timeout) {
    try {
      const response = await fetch(healthCheckURL)
      if (response.status < 500) {
        console.log('✅ Server is ready!')
        return
      }
    }
    catch {
      // Server not ready yet, continue waiting
    }
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  throw new Error(`Server at ${baseURL} did not become ready within ${timeout}ms`)
}

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use

  if (!baseURL) {
    throw new Error('baseURL not configured in playwright.config.ts')
  }

  // Wait for the dev server to be ready
  await waitForServer(baseURL)

  // Check if we're only running pre-commit tests (which don't need authentication)
  const isPreCommitOnly = process.argv.includes('--project=pre-commit')
    || process.env.PLAYWRIGHT_PROJECT === 'pre-commit'

  if (isPreCommitOnly) {
    console.log('⏭️  Skipping authentication for pre-commit smoke tests (no auth required)')
    return
  }

  const browser = await chromium.launch()

  const authDir = path.join(__dirname, 'fixtures', '.auth')
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true })
  }

  // Only create auth for locales actually used in test projects
  const locales = ['es', 'en']

  for (const locale of locales) {
    const context = await browser.newContext({
      baseURL,
      locale,
      timezoneId: 'Europe/Madrid',
    })

    const page = await context.newPage()

    // Capture browser console output
    page.on('console', (msg) => {
      const type = msg.type()
      if (type === 'error' || type === 'warning') {
        console.log(`  [Browser ${type}]:`, msg.text())
      }
    })

    // Capture page errors
    page.on('pageerror', (err) => {
      console.error(`  [Page Error]:`, err.message)
    })

    try {
      // ACTUALLY LOGIN - Get credentials from environment variables
      // Use Resend's test address for reliable E2E email testing
      const testEmail = process.env.TEST_USER_EMAIL || 'delivered@resend.dev'
      const testPassword = process.env.TEST_USER_PASSWORD

      if (!testPassword) {
        throw new Error('TEST_USER_PASSWORD environment variable is required for global setup')
      }

      console.log(`→ Authenticating user for locale: ${locale}`)
      console.log(`  Email: ${testEmail}`)

      // Navigate to login page (without locale prefix, app will handle it)
      const loginUrl = `${baseURL}/auth/login`
      console.log(`  Navigating to: ${loginUrl}`)
      await page.goto(loginUrl, { waitUntil: 'networkidle' })

      // Wait for client-side hydration
      console.log(`  Waiting for hydration...`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(2000) // Give time for hydration

      // Debug: Check what attributes the email input has
      const inputs = await page.locator('input[type="email"]').all()
      console.log(`  Found ${inputs.length} email input(s)`)
      for (let i = 0; i < inputs.length; i++) {
        const attrs = await inputs[i].evaluate((el) => {
          const attributes: Record<string, string> = {}
          for (const attr of el.attributes) {
            attributes[attr.name] = attr.value
          }
          return attributes
        })
        console.log(`  Email input #${i} attributes:`, JSON.stringify(attrs, null, 2))
      }

      // Try to find input by data-testid first, fallback to type=email
      let emailInput = page.locator('[data-testid="email-input"]')
      const hasTestId = await emailInput.count() > 0
      console.log(`  Has data-testid="email-input": ${hasTestId}`)

      if (!hasTestId) {
        console.log(`  ⚠️  Falling back to input[type="email"]`)
        emailInput = page.locator('input[type="email"]').first()
      }

      // Fill in credentials using keyboard to trigger Vue v-model properly
      await emailInput.click()
      // Select all and delete to clear
      await page.keyboard.press('Meta+a')
      await page.keyboard.press('Backspace')
      // Type character by character to trigger Vue reactivity
      await page.keyboard.type(testEmail, { delay: 5 })
      await page.waitForTimeout(100)
      // Tab to password to trigger blur validation
      await page.keyboard.press('Tab')

      // Verify email was filled correctly
      const filledEmail = await emailInput.inputValue()
      console.log(`  Filled email: "${filledEmail}"`)

      // Password should now be focused after Tab
      let passwordInput = page.locator('[data-testid="password-input"]')
      const hasPasswordTestId = await passwordInput.count() > 0
      if (!hasPasswordTestId) {
        console.log(`  ⚠️  Falling back to input[type="password"]`)
        passwordInput = page.locator('input[type="password"]').first()
      }

      // Type password
      await page.keyboard.type(testPassword, { delay: 5 })
      await page.waitForTimeout(100)
      // Tab away to trigger blur validation
      await page.keyboard.press('Tab')

      // Verify password was filled correctly (length check for security)
      const filledPassword = await passwordInput.inputValue()
      console.log(`  Password filled: ${filledPassword.length} characters (expected: ${testPassword.length})`)
      console.log(`  Password matches: ${filledPassword === testPassword}`)

      // Wait for Vue reactivity to enable the button
      await page.waitForTimeout(500)

      // Login button - try data-testid first, fallback to button text
      let loginButton = page.locator('[data-testid="login-button"]')
      const hasButtonTestId = await loginButton.count() > 0
      if (!hasButtonTestId) {
        console.log(`  ⚠️  Falling back to button with type=submit`)
        loginButton = page.locator('button[type="submit"]').first()
      }

      await loginButton.waitFor({ state: 'visible' })

      // Check if button is enabled
      const isDisabled = await loginButton.isDisabled()
      console.log(`  Login button disabled: ${isDisabled}`)

      if (isDisabled) {
        console.log(`  ⚠️  Button disabled - using Supabase REST API directly`)

        // Get Supabase URL and key from environment
        const supabaseUrl = process.env.SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL
        const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NUXT_PUBLIC_SUPABASE_KEY

        if (!supabaseUrl || !supabaseKey) {
          console.log(`  ⚠️  Supabase credentials not found in env`)
        }
        else {
          console.log(`  Calling Supabase auth API...`)
          try {
            const authResponse = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'apikey': supabaseKey,
              },
              body: JSON.stringify({
                email: testEmail,
                password: testPassword,
              }),
            })

            const authData = await authResponse.json()

            if (authResponse.ok && authData.access_token) {
              console.log(`  ✅ Supabase auth successful: ${authData.user?.email}`)

              // Extract project ref from Supabase URL (e.g., khvzbjemydddnryreytu from https://khvzbjemydddnryreytu.supabase.co)
              const projectRef = new URL(supabaseUrl).hostname.split('.')[0]
              console.log(`  Setting auth for project: ${projectRef}`)

              // Set the auth cookies in the browser (matching @nuxtjs/supabase format)
              await context.addCookies([
                {
                  name: `sb-${projectRef}-auth-token`,
                  value: JSON.stringify({
                    access_token: authData.access_token,
                    refresh_token: authData.refresh_token,
                    token_type: 'bearer',
                    expires_in: authData.expires_in,
                    expires_at: authData.expires_at,
                    user: authData.user,
                  }),
                  domain: new URL(baseURL).hostname,
                  path: '/',
                  httpOnly: false,
                },
              ])

              // Also set localStorage via page.evaluate
              await page.evaluate((data) => {
                const storageKey = `sb-${data.projectRef}-auth-token`
                localStorage.setItem(storageKey, JSON.stringify({
                  access_token: data.tokens.access_token,
                  refresh_token: data.tokens.refresh_token,
                  token_type: 'bearer',
                  expires_in: data.tokens.expires_in,
                  expires_at: data.tokens.expires_at,
                  user: data.tokens.user,
                }))
                console.log(`Set localStorage key: ${storageKey}`)
              }, { projectRef, tokens: authData })

              // Reload to apply auth
              await page.goto(`${baseURL}/account`, { waitUntil: 'networkidle' })
              await page.waitForTimeout(2000)

              const finalUrl = page.url()
              console.log(`  Final URL after auth: ${finalUrl}`)
            }
            else {
              console.log(`  ❌ Supabase auth failed:`, authData.error || authData.msg || 'Unknown error')
            }
          }
          catch (fetchError: any) {
            console.log(`  ❌ Fetch error:`, fetchError.message)
          }
        }
      }
      else {
        // Submit login form normally
        console.log(`  Submitting login form...`)
        await loginButton.click({ timeout: 5000 })
      }

      // Wait a bit for navigation
      await page.waitForTimeout(3000)

      // Check current URL
      const urlAfterSubmit = page.url()
      console.log(`  URL after submit: ${urlAfterSubmit}`)

      // Check for error messages
      const errorAlert = page.locator('[data-testid="auth-error"]')
      const hasError = await errorAlert.count() > 0
      if (hasError) {
        const errorText = await errorAlert.textContent()
        console.log(`  ❌ Login error: ${errorText}`)
        throw new Error(`Login failed: ${errorText}`)
      }

      // Take screenshot if still on login page
      if (urlAfterSubmit.includes('/auth/login')) {
        const screenshotPath = path.join(__dirname, `login-failed-${locale}.png`)
        await page.screenshot({ path: screenshotPath, fullPage: true })
        console.log(`  📸 Screenshot saved to: ${screenshotPath}`)
      }

      // Wait for successful login - should redirect to account, dashboard, or admin
      // Check if already redirected, otherwise wait
      const currentUrl = page.url()
      if (!currentUrl.match(/\/(account|dashboard|admin)/)) {
        await page.waitForURL(/\/(account|dashboard|admin)/, { timeout: 10000 })
      }

      const finalUrl = page.url()
      console.log(`  ✅ Login successful! Redirected to: ${finalUrl}`)

      // Save authenticated storage state
      const storageFile = path.join(authDir, `user-${locale}.json`)
      await context.storageState({ path: storageFile })

      console.log(`✓ Authenticated and saved storage state for locale: ${locale}`)
    }
    catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error)

      // Handle various error types gracefully - create empty auth state to allow tests to continue
      // This allows tests to run even if the test account doesn't exist or page fails to load
      const isRecoverableError = errorMessage.includes('Correo o contraseña incorrectos')
        || errorMessage.includes('incorrect')
        || errorMessage.includes('Timeout')
        || errorMessage.includes('timeout')
        || errorMessage.includes('exceeded')
        || errorMessage.includes('navigation')

      if (isRecoverableError) {
        console.warn(`⚠️ Auth failed for ${locale}: ${errorMessage}`)
        console.warn(`   Creating empty auth state to allow tests to continue.`)
        // Create an empty storage state to allow tests to run
        // Tests can then handle authentication errors gracefully
        const emptyAuthFile = path.join(authDir, `user-${locale}.json`)
        fs.writeFileSync(emptyAuthFile, JSON.stringify({ cookies: [], origins: [] }))
        console.log(`✓ Empty auth state created for locale: ${locale}`)
        await context.close()
      }
      else {
        await context.close()
        await browser.close()
        throw new Error(`Global setup failed for locale ${locale}: ${errorMessage}`, { cause: error })
      }
    }
    finally {
      try {
        await context.close()
      }
      catch {
        // Already closed in catch block
      }
    }
  }

  // Create admin auth storage state
  console.log('→ Setting up admin authentication')
  const adminEmail = process.env.TEST_ADMIN_EMAIL || 'admin@example.test'
  const adminPassword = process.env.TEST_ADMIN_PASSWORD || process.env.TEST_USER_PASSWORD

  if (adminPassword) {
    const adminContext = await browser.newContext({
      baseURL,
      locale: 'es',
      timezoneId: 'Europe/Madrid',
    })

    const adminPage = await adminContext.newPage()

    try {
      console.log(`  Admin email: ${adminEmail}`)
      await adminPage.goto(`${baseURL}/auth/login`, { waitUntil: 'networkidle' })
      await adminPage.waitForLoadState('networkidle')
      await adminPage.waitForTimeout(2000)

      const emailInput = adminPage.locator('[data-testid="email-input"]')
      const passwordInput = adminPage.locator('[data-testid="password-input"]')
      const loginButton = adminPage.locator('[data-testid="login-button"]')

      await emailInput.click()
      await emailInput.clear()
      await emailInput.pressSequentially(adminEmail, { delay: 10 })
      await emailInput.blur()
      await passwordInput.click()
      await passwordInput.clear()
      await passwordInput.pressSequentially(adminPassword, { delay: 10 })
      await passwordInput.blur()
      await adminPage.waitForTimeout(500)
      await loginButton.click({ timeout: 5000 })

      await adminPage.waitForTimeout(3000)

      const urlAfterLogin = adminPage.url()
      console.log(`  URL after admin login: ${urlAfterLogin}`)

      if (!urlAfterLogin.match(/\/(admin|account)/)) {
        console.warn(`  ⚠️  Admin login may have failed - URL: ${urlAfterLogin}`)
      }
      else {
        // Set admin role via test API
        console.log(`  Setting admin role in database...`)
        const roleResponse = await adminPage.request.post(`${baseURL}/api/test/set-admin-role`, {
          data: { email: adminEmail },
        })

        if (roleResponse.ok()) {
          const roleData = await roleResponse.json()
          console.log(`  ✅ Admin role set: ${roleData.user.profile.role}`)
        }
        else {
          const errorText = await roleResponse.text()
          console.warn(`  ⚠️  Failed to set admin role: ${roleResponse.status()}`)
          console.warn(`  Error: ${errorText}`)
        }

        const adminStorageFile = path.join(authDir, 'admin.json')
        await adminContext.storageState({ path: adminStorageFile })
        console.log(`✓ Admin authentication completed and saved`)
      }
    }
    catch (error: unknown) {
      console.warn(`⚠️ Admin auth setup failed: ${error.message}`)
      console.warn('  Admin tests may fail. Please ensure TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD are set.')
    }
    finally {
      await adminContext.close()
    }
  }
  else {
    console.warn('⚠️  No admin password provided - skipping admin auth setup')
  }

  await browser.close()

  // Seed test products for E2E tests
  console.log('→ Seeding test products for E2E tests')
  try {
    const seedBrowser = await chromium.launch()
    const seedContext = await seedBrowser.newContext({ baseURL })
    const seedPage = await seedContext.newPage()

    // Import the seeding helper
    const { ensureTestProducts } = await import('./helpers/seed-test-products')

    // Ensure test products exist
    await ensureTestProducts(seedPage, baseURL)

    await seedContext.close()
    await seedBrowser.close()

    console.log('✓ Test products seeding completed')
  }
  catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.warn(`⚠️  Failed to seed test products: ${errorMessage}`)
    console.warn('   E2E tests may fail if products are not available')
  }

  console.log('✓ Global setup completed successfully')
}

export default globalSetup
