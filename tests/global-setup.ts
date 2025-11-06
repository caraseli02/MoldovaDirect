import { chromium, FullConfig } from '@playwright/test'
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

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use

  if (!baseURL) {
    throw new Error('baseURL not configured in playwright.config.ts')
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

    try {
      // ACTUALLY LOGIN - Get credentials from environment variables
      const testEmail = process.env.TEST_USER_EMAIL || `test-${locale}@example.test`
      const testPassword = process.env.TEST_USER_PASSWORD

      if (!testPassword) {
        throw new Error('TEST_USER_PASSWORD environment variable is required for global setup')
      }

      console.log(`→ Authenticating user for locale: ${locale}`)

      // Navigate to login page
      await page.goto('/auth/login')

      // Fill in credentials
      await page.fill('[data-testid="email-input"]', testEmail)
      await page.fill('[data-testid="password-input"]', testPassword)

      // Submit login form
      await page.click('[data-testid="login-button"]')

      // Wait for successful login - should redirect to account or dashboard
      await page.waitForURL(/^\/(account|dashboard)/, { timeout: 10000 })

      // Save authenticated storage state
      const storageFile = path.join(authDir, `user-${locale}.json`)
      await context.storageState({ path: storageFile })

      console.log(`✓ Authenticated and saved storage state for locale: ${locale}`)
    } catch (error) {
      await context.close()
      await browser.close()
      throw new Error(`Global setup failed for locale ${locale}: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      await context.close()
    }
  }

  await browser.close()

  console.log('✓ Global setup completed successfully')
}

export default globalSetup