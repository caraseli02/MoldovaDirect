import { test, expect } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'
import { ProfilePage } from '../page-objects/ProfilePage'

// Test credentials
const TEST_EMAIL = process.env.CUSTOMER_EMAIL || 'customer@moldovadirect.com'
const TEST_PASSWORD = (process.env.CUSTOMER_PASSWORD || 'Customer123!@#').replace(/'/g, '')

/**
 * Authentication Helper
 */
async function authenticateUser(context: any) {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase credentials not found, skipping authentication')
    return false
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  })

  if (authError || !authData.session) {
    console.warn(`Authentication failed: ${authError?.message || 'No session'}`)
    return false
  }

  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)/)?.[1] || 'khvzbjemydddnryreytu'

  await context.addCookies([
    {
      name: `sb-${projectRef}-auth-token`,
      value: JSON.stringify({
        access_token: authData.session.access_token,
        refresh_token: authData.session.refresh_token,
        expires_at: authData.session.expires_at,
        expires_in: authData.session.expires_in,
        token_type: authData.session.token_type,
        user: {
          ...authData.session.user,
          email_confirmed_at: new Date().toISOString(),
          user_metadata: {
            ...authData.session.user?.user_metadata,
            name: 'Test User',
            full_name: 'Test User',
          },
        },
      }),
      domain: 'localhost',
      path: '/',
    },
  ])

  return true
}

test.describe('Profile Page I18n & Error Handling', () => {
  // Use serial mode to prevent DB conflicts when testing save failures vs language saves
  test.describe.configure({ mode: 'serial' })
  let profilePage: ProfilePage

  test.beforeEach(async ({ context, page }) => {
    const isAuthenticated = await authenticateUser(context)
    if (!isAuthenticated) {
      test.skip()
    }

    profilePage = new ProfilePage(page)
    await profilePage.goto()
  })

  test('should switch language and update section headers', async ({ page }) => {
    // Mock success for Supabase user update using catch-all for debugging
    await page.route('**', async (route) => {
      const url = route.request().url()
      const method = route.request().method()

      // Only log if it looks like an API call to reduce noise
      if (url.includes('supabase') || url.includes('auth') || method !== 'GET') {
        console.log('Intercepted Request:', url, method)
      }

      if (url.includes('/auth/v1/user') && method === 'PUT') {
        console.log('MATCHED PUT USER REQUEST')
        const requestBody = JSON.parse(route.request().postData() || '{}')
        const preferredLang = requestBody.data?.preferred_language || 'en'

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            user: {
              id: 'test-user-id',
              aud: 'authenticated',
              role: 'authenticated',
              email: 'test@example.com',
              user_metadata: {
                preferred_language: preferredLang,
                name: 'Test User',
                full_name: 'Test User',
              },
              updated_at: new Date().toISOString(),
              email_confirmed_at: new Date().toISOString(),
            },
          }),
        })
      }
      else {
        await route.continue()
      }
    })

    // Debug initial state
    const initialHeader = await profilePage.getPersonalHeader()
    console.log('Initial Personal Header:', initialHeader)

    // Ensure we start from Spanish to guarantee a change event when switching to English
    // This addresses the issue where the test user might persist "en" from a previous run
    await profilePage.toggleAccordion(profilePage.preferencesAccordion, 'open')
    const currentLang = await profilePage.languageSelect.inputValue()
    console.log('Current Language:', currentLang)

    if (currentLang !== 'es') {
      console.log('Resetting language to es...')
      await profilePage.languageSelect.selectOption('es')
      await profilePage.waitForSave()
      // Wait for UI to settle in Spanish to ensure re-render is complete
      await expect(profilePage.personalInfoAccordion).toContainText(/Información Personal|Informacion/i)
    }

    // Switch to English explicitly
    // This triggers the mock
    await profilePage.setLanguage('en')

    // Check if change reflected
    const enHeader = await profilePage.getPersonalHeader()
    console.log('Header after EN switch:', enHeader)

    // Verify English headers (broad regex to catch variations)
    await expect(profilePage.personalInfoAccordion).toContainText(/Personal Info|Personal Information|Information/i)
    await expect(profilePage.preferencesAccordion).toContainText(/Preferences/i)

    // Switch to Spanish
    // Note: We need to update the mock if we want this to work "correctly" with different data,
    // but typically we can just reuse the mock or update it.
    // However, since we are mocking, the Backend won't actually update the DB.
    // BUT profile.vue now uses form.preferredLanguage to set locale, so UI should update regardless of mock body language!
    await profilePage.setLanguage('es')
    const esHeader = await profilePage.getPersonalHeader()
    console.log('Header after ES switch:', esHeader)

    await expect(profilePage.personalInfoAccordion).toContainText(/Información Personal|Informacion/i)
    await expect(profilePage.preferencesAccordion).toContainText(/Preferencias/i)
  })

  test('should show error toast when profile save fails', async ({ page }) => {
    // Mock 500 error for Supabase user update
    // The endpoint usually contains /auth/v1/user
    await page.route('**/auth/v1/user', async (route) => {
      console.log('Intercepted User Update Request:', route.request().method())
      if (route.request().method() === 'PUT') {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Internal Server Error' }),
        })
      }
      else {
        await route.continue()
      }
    })

    // Trigger save by changing name manually
    // We assume the component debounces input by 1s
    await profilePage.toggleAccordion(profilePage.personalInfoAccordion, 'open')
    await profilePage.nameInput.fill('Error Test Name')

    // Wait for debounce (1s) + potential network latency
    await page.waitForTimeout(2000)

    // Verify error toast
    const toast = await profilePage.getErrorToast()

    // Use toBeVisible with extended timeout
    await expect(toast).toBeVisible({ timeout: 10000 })
  })

  test('should show error toast when address save fails', async ({ page }) => {
    await profilePage.toggleAccordion(profilePage.addressesAccordion, 'open')
    await profilePage.addAddressButton.click()

    await page.route('**/rest/v1/user_addresses*', async (route) => {
      console.log('Intercepted Address Request:', route.request().method())
      if (route.request().method() === 'POST' || route.request().method() === 'PATCH') {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Database Error' }),
        })
      }
      else {
        await route.continue()
      }
    })

    await profilePage.fillAddressForm({
      firstName: 'Error',
      lastName: 'Test',
      street: 'Error St',
      city: 'Error City',
      postalCode: '12345',
      country: 'ES',
      phone: '123456789',
    })

    await profilePage.addrSaveButton.click()

    // Verify toast
    const toast = await profilePage.getErrorToast()
    await expect(toast).toBeVisible({ timeout: 10000 })

    // Ensure modal is still open
    await expect(profilePage.addressDialog).toBeVisible()
  })
})
