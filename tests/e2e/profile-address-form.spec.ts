import { test, expect } from '@playwright/test'

/**
 * Test Suite: Profile Address Form Modal Verification
 * 
 * Purpose: Verify that the address form modal fixes are working correctly
 * 
 * What Was Fixed:
 * 1. Component name mismatch: ProfileAddressFormModal → AddressFormModal
 * 2. Added missing i18n translation keys for all 4 locales
 * 
 * Test Scenarios:
 * - Navigate to profile page
 * - Open address form modal
 * - Verify modal displays correctly (not gray screen)
 * - Verify all form fields are visible
 * - Fill out form with test data
 * - Submit form
 * - Verify success message and new address appears
 */

test.describe('Profile Address Form Modal', () => {
  const TEST_USER = {
    email: 'customer@moldovadirect.com',
    password: 'Customer123!@#'
  }

  const TEST_ADDRESS = {
    firstName: 'Juan',
    lastName: 'García',
    street: 'Calle Gran Vía 123',
    city: 'Madrid',
    postalCode: '28013',
    country: 'ES',
    phone: '+34 612 345 678'
  }

  test.beforeEach(async ({ page }) => {
    // Navigate to the site
    await page.goto('http://localhost:3000')
    
    // Login as customer
    await page.goto('http://localhost:3000/auth/login')
    await page.fill('input[type="email"]', TEST_USER.email)
    await page.fill('input[type="password"]', TEST_USER.password)
    await page.click('button[type="submit"]')
    
    // Wait for successful login and redirect
    await page.waitForURL('http://localhost:3000/**', { timeout: 10000 })
    
    // Navigate to profile page
    await page.goto('http://localhost:3000/account/profile')
    await page.waitForLoadState('networkidle')
  })

  test('Step 1-2: Profile page loads and displays correctly', async ({ page }) => {
    // Take screenshot of profile page
    await page.screenshot({ 
      path: '/tmp/profile-page.png',
      fullPage: true 
    })

    // Verify we're on the profile page
    expect(page.url()).toContain('/account/profile')
    
    // Verify page has loaded
    const heading = await page.locator('h1, h2').first()
    await expect(heading).toBeVisible()
    
    console.log('✓ Step 1-2: Profile page loaded successfully')
  })

  test('Step 3-4: Address modal opens and displays correctly', async ({ page }) => {
    // Find and click "Añadir Dirección" button
    const addAddressButton = page.locator('button', { hasText: /añadir dirección|add address/i })
    await expect(addAddressButton).toBeVisible()
    await addAddressButton.click()
    
    // Wait for modal to open
    await page.waitForTimeout(500)
    
    // Take screenshot of opened modal
    await page.screenshot({ 
      path: '/tmp/address-modal-opened.png',
      fullPage: true 
    })
    
    // Verify modal is visible (not gray screen)
    const modal = page.locator('[role="dialog"], .modal, [data-testid="address-modal"]').first()
    await expect(modal).toBeVisible()
    
    console.log('✓ Step 3-4: Address modal opened successfully (not gray screen)')
  })

  test('Step 5-6: All form fields are visible', async ({ page }) => {
    // Open modal
    const addAddressButton = page.locator('button', { hasText: /añadir dirección|add address/i })
    await addAddressButton.click()
    await page.waitForTimeout(500)
    
    // Verify Address Type radio buttons
    const shippingRadio = page.locator('input[type="radio"][value="shipping"], input[type="radio"][value="Shipping"]').first()
    const billingRadio = page.locator('input[type="radio"][value="billing"], input[type="radio"][value="Billing"]').first()
    await expect(shippingRadio).toBeVisible()
    await expect(billingRadio).toBeVisible()
    console.log('✓ Address Type radio buttons visible')
    
    // Verify First Name input
    const firstNameInput = page.locator('input[name="firstName"], input[placeholder*="nombre" i], input[placeholder*="first name" i]').first()
    await expect(firstNameInput).toBeVisible()
    console.log('✓ First Name input visible')
    
    // Verify Last Name input
    const lastNameInput = page.locator('input[name="lastName"], input[placeholder*="apellido" i], input[placeholder*="last name" i]').first()
    await expect(lastNameInput).toBeVisible()
    console.log('✓ Last Name input visible')
    
    // Verify Company input (optional)
    const companyInput = page.locator('input[name="company"], input[placeholder*="empresa" i], input[placeholder*="company" i]').first()
    await expect(companyInput).toBeVisible()
    console.log('✓ Company input visible')
    
    // Verify Street input
    const streetInput = page.locator('input[name="street"], input[placeholder*="calle" i], input[placeholder*="street" i]').first()
    await expect(streetInput).toBeVisible()
    console.log('✓ Street input visible')
    
    // Verify City input
    const cityInput = page.locator('input[name="city"], input[placeholder*="ciudad" i], input[placeholder*="city" i]').first()
    await expect(cityInput).toBeVisible()
    console.log('✓ City input visible')
    
    // Verify Postal Code input
    const postalCodeInput = page.locator('input[name="postalCode"], input[placeholder*="código postal" i], input[placeholder*="postal code" i]').first()
    await expect(postalCodeInput).toBeVisible()
    console.log('✓ Postal Code input visible')
    
    // Verify Province input (optional)
    const provinceInput = page.locator('input[name="province"], input[placeholder*="provincia" i], input[placeholder*="province" i]').first()
    await expect(provinceInput).toBeVisible()
    console.log('✓ Province input visible')
    
    // Verify Country dropdown
    const countrySelect = page.locator('select[name="country"], [role="combobox"]').first()
    await expect(countrySelect).toBeVisible()
    console.log('✓ Country dropdown visible')
    
    // Verify Phone input (optional)
    const phoneInput = page.locator('input[name="phone"], input[placeholder*="teléfono" i], input[placeholder*="phone" i]').first()
    await expect(phoneInput).toBeVisible()
    console.log('✓ Phone input visible')
    
    // Verify Set as Default checkbox
    const defaultCheckbox = page.locator('input[type="checkbox"][name="isDefault"], input[type="checkbox"]').first()
    await expect(defaultCheckbox).toBeVisible()
    console.log('✓ Set as Default checkbox visible')
    
    console.log('✓ Step 5-6: All form fields verified successfully')
  })

  test('Step 7-12: Fill out form, submit, and verify success', async ({ page }) => {
    // Open modal
    const addAddressButton = page.locator('button', { hasText: /añadir dirección|add address/i })
    await addAddressButton.click()
    await page.waitForTimeout(500)
    
    // Select Shipping type
    const shippingRadio = page.locator('input[type="radio"][value="shipping"], input[type="radio"][value="Shipping"]').first()
    await shippingRadio.click()
    
    // Fill First Name
    const firstNameInput = page.locator('input[name="firstName"], input[placeholder*="nombre" i], input[placeholder*="first name" i]').first()
    await firstNameInput.fill(TEST_ADDRESS.firstName)
    
    // Fill Last Name
    const lastNameInput = page.locator('input[name="lastName"], input[placeholder*="apellido" i], input[placeholder*="last name" i]').first()
    await lastNameInput.fill(TEST_ADDRESS.lastName)
    
    // Fill Street
    const streetInput = page.locator('input[name="street"], input[placeholder*="calle" i], input[placeholder*="street" i]').first()
    await streetInput.fill(TEST_ADDRESS.street)
    
    // Fill City
    const cityInput = page.locator('input[name="city"], input[placeholder*="ciudad" i], input[placeholder*="city" i]').first()
    await cityInput.fill(TEST_ADDRESS.city)
    
    // Fill Postal Code
    const postalCodeInput = page.locator('input[name="postalCode"], input[placeholder*="código postal" i], input[placeholder*="postal code" i]').first()
    await postalCodeInput.fill(TEST_ADDRESS.postalCode)
    
    // Select Country (España/ES)
    const countrySelect = page.locator('select[name="country"]').first()
    if (await countrySelect.isVisible()) {
      await countrySelect.selectOption(TEST_ADDRESS.country)
    } else {
      // Handle combobox/dropdown if it's not a native select
      const countryDropdown = page.locator('[role="combobox"]').first()
      await countryDropdown.click()
      await page.locator(`[role="option"]`, { hasText: /españa|spain/i }).first().click()
    }
    
    // Fill Phone
    const phoneInput = page.locator('input[name="phone"], input[placeholder*="teléfono" i], input[placeholder*="phone" i]').first()
    await phoneInput.fill(TEST_ADDRESS.phone)
    
    // Check "Set as Default"
    const defaultCheckbox = page.locator('input[type="checkbox"][name="isDefault"], input[type="checkbox"]').first()
    await defaultCheckbox.check()
    
    // Take screenshot of filled form
    await page.screenshot({ 
      path: '/tmp/address-form-filled.png',
      fullPage: true 
    })
    console.log('✓ Step 7-8: Form filled with test data')
    
    // Submit the form
    const submitButton = page.locator('button[type="submit"]', { hasText: /guardar|save|añadir|add/i }).first()
    await submitButton.click()
    
    // Wait for submission
    await page.waitForTimeout(2000)
    
    // Take screenshot after submission
    await page.screenshot({ 
      path: '/tmp/address-form-submitted.png',
      fullPage: true 
    })
    console.log('✓ Step 9-10: Form submitted')
    
    // Verify success message appears
    const successMessage = page.locator('[role="alert"], .success, .toast', { hasText: /éxito|success|guardado|saved/i }).first()
    await expect(successMessage).toBeVisible({ timeout: 5000 })
    console.log('✓ Step 11: Success message displayed')
    
    // Verify new address appears in address list
    const addressList = page.locator('.address-list, [data-testid="address-list"]').first()
    const newAddress = addressList.locator('text=' + TEST_ADDRESS.street).first()
    await expect(newAddress).toBeVisible({ timeout: 5000 })
    console.log('✓ Step 12: New address appears in address list')
    
    console.log('✅ ALL STEPS COMPLETED SUCCESSFULLY')
  })
})
