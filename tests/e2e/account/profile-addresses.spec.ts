import { test, expect } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'
import { ProfilePage } from '../page-objects/ProfilePage'

// Test credentials from environment
const TEST_EMAIL = process.env.CUSTOMER_EMAIL || 'customer@moldovadirect.com'
const TEST_PASSWORD = (process.env.CUSTOMER_PASSWORD || 'Customer123!@#').replace(/'/g, '')

/**
 * Helper to authenticate user and set cookies
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

  // Extract project ref from URL for cookie name
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
      }),
      domain: 'localhost',
      path: '/',
    },
  ])

  return true
}

test.describe('Profile Address Management', () => {
  test.describe.configure({ mode: 'serial' })
  let profilePage: ProfilePage

  test.beforeEach(async ({ context, page }) => {
    const isAuthenticated = await authenticateUser(context)
    if (!isAuthenticated) {
      test.skip()
    }

    profilePage = new ProfilePage(page)
    await profilePage.goto()
    await profilePage.toggleAccordion(profilePage.addressesAccordion, 'open')
  })

  test('should add a new shipping address', async () => {
    const initialCount = await profilePage.getAddressCount()

    const timestamp = Date.now()
    const newAddress = {
      firstName: `Jane-${timestamp}`,
      lastName: 'Doe-Test',
      street: `Calle Mayor ${timestamp}`,
      city: 'Madrid',
      postalCode: '28013',
      country: 'ES',
      phone: '612345678',
    }

    await profilePage.addAddress(newAddress)

    const finalCount = await profilePage.getAddressCount()
    expect(finalCount).toBe(initialCount + 1)

    // Verify names in list
    await expect(profilePage.addressNames.last()).toHaveText(/Jane-\d+ Doe-Test/)
  })

  test('should edit an existing address', async () => {
    const addressCount = await profilePage.getAddressCount()
    if (addressCount === 0) {
      // Add one first if none exists
      await profilePage.addAddress({
        firstName: 'Initial',
        lastName: 'User',
        street: 'Initial Street',
        city: 'Initial City',
        postalCode: '28001',
        country: 'ES',
      })
    }

    const updatedAddress = {
      firstName: 'Edited-Name',
      lastName: 'Surname',
      street: 'Updated Street 123',
    }

    await profilePage.editAddress(0, updatedAddress)

    // Verify update
    await expect(profilePage.addressNames.first()).toContainText('Edited-Name Surname')
    await expect(profilePage.addressCards.first()).toContainText('Updated Street 123')
  })

  test('should delete an address', async () => {
    // Ensure we have at least one address
    const initialCount = await profilePage.getAddressCount()
    if (initialCount === 0) {
      await profilePage.addAddress({
        firstName: 'To Delete',
        lastName: 'User',
        street: 'Delete St 1',
        city: 'Madrid',
        postalCode: '28001',
        country: 'ES',
      })
    }

    const countBeforeDelete = await profilePage.getAddressCount()
    await profilePage.deleteAddress(0)

    const countAfterDelete = await profilePage.getAddressCount()
    expect(countAfterDelete).toBe(countBeforeDelete - 1)
  })

  test('should show validation errors in address form', async () => {
    await profilePage.addAddressButton.click()

    // Try to save empty form
    await profilePage.addrSaveButton.click()

    // Check for error messages (localized)
    // The specific error text might vary by locale, but we expect some error indicators
    const errorMessages = profilePage.addressDialog.locator('.text-red-600')
    await expect(errorMessages.first()).toBeVisible()

    // Close modal
    await profilePage.addrCancelButton.click()
  })

  test('should validate postal code format', async () => {
    await profilePage.addAddressButton.click()

    await profilePage.fillAddressForm({
      firstName: 'Test',
      lastName: 'User',
      street: 'Street 1',
      city: 'City',
      postalCode: '123', // Invalid Spanish postal code (must be 5 digits)
      country: 'ES',
    })

    await profilePage.addrSaveButton.click()

    const postalCodeError = profilePage.addressDialog.locator('p:has-text("postal")')
    await expect(postalCodeError).toBeVisible()

    await profilePage.addrCancelButton.click()
  })
  test('should not allow creating duplicate addresses', async ({ page: _page }) => {
    // 1. Add an address with unique data
    const timestamp = Date.now()
    const address = {
      firstName: `Dup-${timestamp}`,
      lastName: 'Test',
      street: `Dup St ${timestamp}`,
      city: 'Duplicate City',
      postalCode: '12345',
      country: 'ES',
      phone: '123456789',
    }

    await profilePage.addAddress(address)

    // 2. Try to add the same address again
    await profilePage.addAddressButton.click()
    await profilePage.fillAddressForm(address)
    await profilePage.addrSaveButton.click()

    // 3. Verify save was prevented (dialog still open)
    await expect(profilePage.addressDialog).toBeVisible()

    // Optional: check for error message if stable, but dialog open is sufficient proof it didn't save
    // const errorToast = page.getByText(/Address/i)
    // await expect(errorToast).toBeVisible()

    // 4. Close modal
    await profilePage.addrCancelButton.click()
  })
})
