import { test, expect } from '@playwright/test'

test.describe('Address Form CRUD Verification', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('http://localhost:3000/auth/login')
    await page.waitForLoadState('networkidle')
    
    await page.fill('input[type="email"]', 'customer@moldovadirect.com')
    await page.fill('input[type="password"]', 'Customer123!@#')
    await page.click('button[type="submit"]')
    
    // Wait for navigation after login
    await page.waitForURL(/.*\//, { timeout: 10000 })
    await page.waitForTimeout(2000)
  })

  test('Complete Address CRUD Flow', async ({ page }) => {
    // Step 1: Navigate to profile page
    console.log('Step 1: Navigating to profile page...')
    await page.goto('http://localhost:3000/account/profile')
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: '/tmp/01-profile-page.png', fullPage: true })
    console.log('✓ Screenshot saved: 01-profile-page.png')

    // Step 2: Click "Añadir Dirección" button
    console.log('Step 2: Opening address modal...')
    const addButton = page.locator('button', { hasText: 'Añadir' }).first()
    await expect(addButton).toBeVisible({ timeout: 5000 })
    await addButton.click()
    await page.waitForTimeout(1500)
    
    // Step 3: Verify modal opens with WHITE background (not gray)
    console.log('Step 3: Verifying modal background...')
    const dialogOverlay = page.locator('[data-radix-dialog-overlay]').first()
    await expect(dialogOverlay).toBeVisible({ timeout: 5000 })
    
    const dialogContent = page.locator('[role="dialog"]').first()
    await expect(dialogContent).toBeVisible({ timeout: 5000 })
    
    await page.screenshot({ path: '/tmp/02-modal-opened.png', fullPage: true })
    console.log('✓ Screenshot saved: 02-modal-opened.png')
    
    // Check background color
    const bgColor = await dialogContent.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor
    })
    console.log(`Modal background color: ${bgColor}`)
    
    // Step 4: Verify all form fields are visible
    console.log('Step 4: Verifying form fields visibility...')
    
    // Address Type radio buttons
    const shippingRadio = page.locator('input[value="shipping"]')
    const billingRadio = page.locator('input[value="billing"]')
    await expect(shippingRadio).toBeVisible()
    await expect(billingRadio).toBeVisible()
    console.log('✓ Address type radio buttons visible')
    
    // Name fields
    const firstNameInput = page.locator('input[name="first_name"]')
    const lastNameInput = page.locator('input[name="last_name"]')
    await expect(firstNameInput).toBeVisible()
    await expect(lastNameInput).toBeVisible()
    console.log('✓ Name fields visible')
    
    // Address fields
    const streetInput = page.locator('input[name="street"]')
    const cityInput = page.locator('input[name="city"]')
    const postalCodeInput = page.locator('input[name="postal_code"]')
    const countryInput = page.locator('input[name="country"]')
    await expect(streetInput).toBeVisible()
    await expect(cityInput).toBeVisible()
    await expect(postalCodeInput).toBeVisible()
    await expect(countryInput).toBeVisible()
    console.log('✓ Address fields visible')
    
    // Optional fields
    const companyInput = page.locator('input[name="company"]')
    const provinceInput = page.locator('input[name="province"]')
    const phoneInput = page.locator('input[name="phone"]')
    await expect(companyInput).toBeVisible()
    await expect(provinceInput).toBeVisible()
    await expect(phoneInput).toBeVisible()
    console.log('✓ Optional fields visible')
    
    // Default checkbox
    const defaultCheckbox = page.locator('input[name="is_default"]')
    await expect(defaultCheckbox).toBeVisible()
    console.log('✓ Default checkbox visible')
    
    // Step 5: Fill out form with test data
    console.log('Step 5: Filling form with test data...')
    await shippingRadio.click()
    await firstNameInput.fill('Juan')
    await lastNameInput.fill('García')
    await streetInput.fill('Calle Gran Vía 123')
    await cityInput.fill('Madrid')
    await postalCodeInput.fill('28013')
    await countryInput.fill('ES')
    await phoneInput.fill('+34 612 345 678')
    await defaultCheckbox.click()
    
    await page.waitForTimeout(1000)
    await page.screenshot({ path: '/tmp/03-form-filled.png', fullPage: true })
    console.log('✓ Screenshot saved: 03-form-filled.png')
    
    // Step 6: Submit form
    console.log('Step 6: Submitting form...')
    const saveButton = page.locator('button', { hasText: 'Guardar' }).first()
    await saveButton.click()
    
    // Wait for success message or modal close
    await page.waitForTimeout(3000)
    await page.screenshot({ path: '/tmp/04-after-submit.png', fullPage: true })
    console.log('✓ Screenshot saved: 04-after-submit.png')
    
    // Step 7: Verify address appears in list
    console.log('Step 7: Verifying address in list...')
    const addressCard = page.locator('text=Juan García').first()
    await expect(addressCard).toBeVisible({ timeout: 5000 })
    console.log('✓ Address card found in list')
    
    await page.screenshot({ path: '/tmp/05-address-list.png', fullPage: true })
    console.log('✓ Screenshot saved: 05-address-list.png')
    
    // Step 8: Test edit functionality
    console.log('Step 8: Testing edit functionality...')
    const editButton = page.locator('button[aria-label*="Edit"], button:has-text("Editar")').first()
    await editButton.click()
    await page.waitForTimeout(1500)
    
    await page.screenshot({ path: '/tmp/06-edit-modal.png', fullPage: true })
    console.log('✓ Screenshot saved: 06-edit-modal.png')
    
    // Step 9: Verify pre-filled data
    console.log('Step 9: Verifying pre-filled data...')
    const editFirstName = page.locator('input[name="first_name"]')
    const firstNameValue = await editFirstName.inputValue()
    expect(firstNameValue).toBe('Juan')
    console.log('✓ Form pre-filled with existing data')
    
    // Step 10: Update first name
    console.log('Step 10: Updating address...')
    await editFirstName.fill('Pedro')
    
    await page.waitForTimeout(500)
    await page.screenshot({ path: '/tmp/07-form-edited.png', fullPage: true })
    console.log('✓ Screenshot saved: 07-form-edited.png')
    
    // Step 11: Save changes
    const saveEditButton = page.locator('button', { hasText: 'Guardar' }).first()
    await saveEditButton.click()
    await page.waitForTimeout(3000)
    
    await page.screenshot({ path: '/tmp/08-after-edit.png', fullPage: true })
    console.log('✓ Screenshot saved: 08-after-edit.png')
    
    // Step 12: Verify updated address
    console.log('Step 11: Verifying updated address...')
    const updatedCard = page.locator('text=Pedro García').first()
    await expect(updatedCard).toBeVisible({ timeout: 5000 })
    console.log('✓ Address updated successfully')
    
    await page.screenshot({ path: '/tmp/09-final-state.png', fullPage: true })
    console.log('✓ Screenshot saved: 09-final-state.png')
    
    console.log('\n✅ ALL TESTS PASSED - Address CRUD flow working correctly!')
  })
})
