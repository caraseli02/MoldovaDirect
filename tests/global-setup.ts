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
      // Try to authenticate - if it fails, create empty auth file
      const testEmail = process.env.TEST_USER_EMAIL || `test-${locale}@example.test`
      const testPassword = process.env.TEST_USER_PASSWORD

      console.log(`→ Attempting authentication for locale: ${locale}`)

      if (testPassword) {
        try {
          // Navigate to login page
          await page.goto('/auth/login')
          await page.waitForLoadState('networkidle')

          // Fill in credentials and submit the form programmatically
          await page.evaluate(({ email, password }) => {
            const emailInput = document.querySelector('#email') as HTMLInputElement
            const passwordInput = document.querySelector('#password') as HTMLInputElement

            if (emailInput && passwordInput) {
              emailInput.value = email
              passwordInput.value = password

              // Trigger Vue reactivity
              emailInput.dispatchEvent(new Event('input', { bubbles: true }))
              passwordInput.dispatchEvent(new Event('input', { bubbles: true }))

              // Submit the form
              const form = emailInput.closest('form')
              if (form) {
                // Call the submit handler directly
                const submitEvent = new Event('submit', { bubbles: true, cancelable: true })
                form.dispatchEvent(submitEvent)
              }
            }
          }, { email: testEmail, password: testPassword })

          // Wait for navigation away from login page or error
          await Promise.race([
            page.waitForFunction(
              () => !window.location.pathname.includes('/auth/login'),
              { timeout: 10000 }
            ),
            page.waitForSelector('[role="alert"]', { timeout: 10000 })
          ]).catch(() => {
            // Timeout - login might have failed
          })

          await page.waitForTimeout(1000)

          const currentUrl = page.url()

          if (currentUrl.includes('/auth/login')) {
            console.log(`  ⚠ Authentication failed for ${locale} - tests will run unauthenticated`)
            // Create empty auth state
            const storageFile = path.join(authDir, `user-${locale}.json`)
            await context.storageState({ path: storageFile })
          } else {
            console.log(`  ✓ Authenticated successfully for ${locale}`)
            // Save authenticated storage state
            const storageFile = path.join(authDir, `user-${locale}.json`)
            await context.storageState({ path: storageFile })
          }
        } catch (authError) {
          console.log(`  ⚠ Authentication error for ${locale}: ${authError instanceof Error ? authError.message : String(authError)}`)
          // Create empty auth state for tests to handle
          const storageFile = path.join(authDir, `user-${locale}.json`)
          await context.storageState({ path: storageFile })
        }
      } else {
        console.log(`  ⚠ No TEST_USER_PASSWORD - creating empty auth state for ${locale}`)
        const storageFile = path.join(authDir, `user-${locale}.json`)
        await context.storageState({ path: storageFile })
      }
    } catch (error) {
      console.error(`Error in global setup for ${locale}:`, error)
      // Create empty auth state even on error
      const storageFile = path.join(authDir, `user-${locale}.json`)
      try {
        await context.storageState({ path: storageFile })
      } catch (e) {
        // Ignore
      }
    } finally {
      await context.close()
    }
  }

  await browser.close()

  console.log('✓ Global setup completed successfully')
}

export default globalSetup