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
  console.log(`⏳ Waiting for server at ${baseURL}...`)

  while (Date.now() - startTime < timeout) {
    try {
      const response = await fetch(baseURL)
      if (response.status < 500) {
        console.log('✅ Server is ready!')
        return
      }
    }
    catch (_error: any) {
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

  const locales = ['es', 'en', 'ro', 'ru']

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
      const testEmail = process.env.TEST_USER_EMAIL || `test-${locale}@example.test`
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

      // Fill in credentials
      await emailInput.click()
      await emailInput.fill(testEmail)

      // Verify email was filled correctly
      const filledEmail = await emailInput.inputValue()
      console.log(`  Filled email: "${filledEmail}"`)
      await page.waitForTimeout(100)

      // Password input - try data-testid first, fallback to type=password
      let passwordInput = page.locator('[data-testid="password-input"]')
      const hasPasswordTestId = await passwordInput.count() > 0
      if (!hasPasswordTestId) {
        console.log(`  ⚠️  Falling back to input[type="password"]`)
        passwordInput = page.locator('input[type="password"]').first()
      }

      await passwordInput.click()
      await passwordInput.fill(testPassword)

      // Verify password was filled correctly (length check for security)
      const filledPassword = await passwordInput.inputValue()
      console.log(`  Password filled: ${filledPassword.length} characters (expected: ${testPassword.length})`)
      console.log(`  Password matches: ${filledPassword === testPassword}`)

      await page.waitForTimeout(500)

      // Login button - try data-testid first, fallback to button text
      let loginButton = page.locator('[data-testid="login-button"]')
      const hasButtonTestId = await loginButton.count() > 0
      if (!hasButtonTestId) {
        console.log(`  ⚠️  Falling back to button with type=submit`)
        loginButton = page.locator('button[type="submit"]').first()
      }

      await loginButton.waitFor({ state: 'visible' })

      // Submit login form (force click to bypass validation for global setup)
      console.log(`  Submitting login form...`)
      await loginButton.click({ force: true })

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
    catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : String(error)

      // If it's an auth error, try to create an empty auth file to skip this locale
      // This allows tests to run even if the test account doesn't exist
      if (errorMessage.includes('Correo o contraseña incorrectos') || errorMessage.includes('incorrect')) {
        console.warn(`⚠️ Auth failed for ${locale}: Account may not exist. Creating empty auth state.`)
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
        throw new Error(`Global setup failed for locale ${locale}: ${errorMessage}`)
      }
    }
    finally {
      try {
        await context.close()
      }
      catch (_e: any) {
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
      await emailInput.fill(adminEmail)
      await passwordInput.click()
      await passwordInput.fill(adminPassword)
      await loginButton.click({ force: true })

      await adminPage.waitForTimeout(3000)

      const urlAfterLogin = adminPage.url()
      console.log(`  URL after admin login: ${urlAfterLogin}`)

      if (!urlAfterLogin.match(/\/(admin|account)/)) {
        console.warn(`  ⚠️  Admin login may have failed - URL: ${urlAfterLogin}`)
      }
      else {
        const adminStorageFile = path.join(authDir, 'admin.json')
        await adminContext.storageState({ path: adminStorageFile })
        console.log(`✓ Admin authentication completed and saved`)
      }
    }
    catch (error: any) {
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

  console.log('✓ Global setup completed successfully')
}

export default globalSetup
