/**
 * Profile Management End-to-End Tests
 * 
 * Requirements addressed:
 * - 6.6: User profile management functionality
 * - 6.7: Account deletion functionality
 * - 10.1: Integration with shopping features
 * - 10.2: Proper cleanup of user data
 * 
 * These tests verify the complete user journey for profile management
 * including authentication, profile updates, address management, and account deletion.
 */

import { test, expect } from '@playwright/test'

test.describe('Profile Management E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/')
  })

  test.describe('Profile Access and Authentication', () => {
    test('should redirect unauthenticated users to login when accessing profile', async ({ page }) => {
      // Try to access profile page without authentication
      await page.goto('/account/profile')
      
      // Should be redirected to login page
      await expect(page).toHaveURL(/\/auth\/login/)
      
      // Should show login form
      await expect(page.locator('form')).toBeVisible()
      await expect(page.locator('input[type="email"]')).toBeVisible()
      await expect(page.locator('input[type="password"]')).toBeVisible()
    })

    test('should allow authenticated users to access profile page', async ({ page }) => {
      // Login first (this would use a test user account)
      await page.goto('/auth/login')
      await page.fill('input[type="email"]', 'test@example.com')
      await page.fill('input[type="password"]', 'testpassword123')
      await page.click('button[type="submit"]')
      
      // Navigate to profile page
      await page.goto('/account/profile')
      
      // Should see profile page content
      await expect(page.locator('h1')).toContainText('Profile Settings')
      await expect(page.locator('form')).toBeVisible()
    })
  })

  test.describe('Profile Form Management', () => {
    test.beforeEach(async ({ page }) => {
      // Login before each test
      await page.goto('/auth/login')
      await page.fill('input[type="email"]', 'test@example.com')
      await page.fill('input[type="password"]', 'testpassword123')
      await page.click('button[type="submit"]')
      await page.waitForURL('/account')
      
      // Navigate to profile page
      await page.goto('/account/profile')
    })

    test('should display user information in form fields', async ({ page }) => {
      // Check that form fields are populated with user data
      const nameInput = page.locator('input#name')
      const emailInput = page.locator('input#email')
      const phoneInput = page.locator('input#phone')
      const languageSelect = page.locator('select#language')

      await expect(nameInput).toHaveValue(/\w+/)
      await expect(emailInput).toHaveValue('test@example.com')
      await expect(emailInput).toBeDisabled()
      await expect(languageSelect).toHaveValue(/es|en|ro|ru/)
    })

    test('should validate required fields', async ({ page }) => {
      // Clear the name field
      await page.fill('input#name', '')
      
      // Try to submit the form
      await page.click('button[type="submit"]')
      
      // Should show validation error
      await expect(page.locator('.text-red-600')).toBeVisible()
    })

    test('should validate phone number format', async ({ page }) => {
      // Enter invalid phone number
      await page.fill('input#phone', '123')
      
      // Try to submit the form
      await page.click('button[type="submit"]')
      
      // Should show validation error for phone
      const phoneError = page.locator('input#phone + p.text-red-600')
      await expect(phoneError).toBeVisible()
    })

    test('should successfully update profile information', async ({ page }) => {
      // Update profile information
      await page.fill('input#name', 'Updated Test User')
      await page.fill('input#phone', '+34123456789')
      await page.selectOption('select#language', 'en')
      
      // Submit the form
      await page.click('button[type="submit"]')
      
      // Should show success message
      await expect(page.locator('.toast-success, .alert-success')).toBeVisible()
      
      // Form should reflect the changes
      await expect(page.locator('input#name')).toHaveValue('Updated Test User')
      await expect(page.locator('input#phone')).toHaveValue('+34123456789')
      await expect(page.locator('select#language')).toHaveValue('en')
    })

    test('should detect and enable save button only when changes are made', async ({ page }) => {
      // Initially, save button should be disabled (no changes)
      const saveButton = page.locator('button[type="submit"]')
      await expect(saveButton).toBeDisabled()
      
      // Make a change
      await page.fill('input#name', 'Changed Name')
      
      // Save button should now be enabled
      await expect(saveButton).toBeEnabled()
      
      // Reset the change
      await page.fill('input#name', 'Test User')
      
      // Save button should be disabled again
      await expect(saveButton).toBeDisabled()
    })
  })

  test.describe('Profile Picture Management', () => {
    test.beforeEach(async ({ page }) => {
      // Login and navigate to profile
      await page.goto('/auth/login')
      await page.fill('input[type="email"]', 'test@example.com')
      await page.fill('input[type="password"]', 'testpassword123')
      await page.click('button[type="submit"]')
      await page.goto('/account/profile')
    })

    test('should display user initials when no profile picture exists', async ({ page }) => {
      // Should show user initials in avatar circle
      const avatar = page.locator('.rounded-full').first()
      await expect(avatar).toBeVisible()
      
      // Should contain initials (letters)
      const initialsText = await avatar.textContent()
      expect(initialsText).toMatch(/[A-Z]{1,2}/)
    })

    test('should open file picker when upload button is clicked', async ({ page }) => {
      // Set up file chooser listener
      const fileChooserPromise = page.waitForEvent('filechooser')
      
      // Click upload button
      await page.click('button:has-text("Upload Picture"), button:has-text("Change Picture")')
      
      // File chooser should open
      const fileChooser = await fileChooserPromise
      expect(fileChooser).toBeTruthy()
    })

    test('should handle profile picture upload', async ({ page }) => {
      // Mock file upload
      const fileChooserPromise = page.waitForEvent('filechooser')
      await page.click('button:has-text("Upload Picture"), button:has-text("Change Picture")')
      
      const fileChooser = await fileChooserPromise
      
      // Create a test image file
      await fileChooser.setFiles({
        name: 'avatar.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from('fake-image-data')
      })
      
      // Should show loading state
      await expect(page.locator('.animate-spin')).toBeVisible()
      
      // Should show success message after upload
      await expect(page.locator('.toast-success, .alert-success')).toBeVisible()
    })
  })

  test.describe('Address Management', () => {
    test.beforeEach(async ({ page }) => {
      // Login and navigate to profile
      await page.goto('/auth/login')
      await page.fill('input[type="email"]', 'test@example.com')
      await page.fill('input[type="password"]', 'testpassword123')
      await page.click('button[type="submit"]')
      await page.goto('/account/profile')
    })

    test('should show empty state when no addresses exist', async ({ page }) => {
      // Should show no addresses message
      await expect(page.locator('text=You don\'t have any addresses saved yet')).toBeVisible()
      
      // Should show add address button
      await expect(page.locator('button:has-text("Add Your First Address")')).toBeVisible()
    })

    test('should open address form modal when add address is clicked', async ({ page }) => {
      // Click add address button
      await page.click('button:has-text("Add Address"), button:has-text("Add Your First Address")')
      
      // Modal should be visible
      await expect(page.locator('.fixed.inset-0')).toBeVisible()
      await expect(page.locator('h3:has-text("Add Address")')).toBeVisible()
      
      // Form fields should be visible
      await expect(page.locator('input#street')).toBeVisible()
      await expect(page.locator('input#city')).toBeVisible()
      await expect(page.locator('input#postalCode')).toBeVisible()
    })

    test('should validate address form fields', async ({ page }) => {
      // Open address form
      await page.click('button:has-text("Add Address"), button:has-text("Add Your First Address")')
      
      // Try to submit empty form
      await page.click('button[type="submit"]')
      
      // Should show validation errors
      await expect(page.locator('.text-red-600')).toHaveCount.greaterThan(0)
    })

    test('should successfully create a new address', async ({ page }) => {
      // Open address form
      await page.click('button:has-text("Add Address"), button:has-text("Add Your First Address")')
      
      // Fill address form
      await page.check('input[value="shipping"]')
      await page.fill('input#street', 'Calle Mayor 123')
      await page.fill('input#city', 'Madrid')
      await page.fill('input#postalCode', '28001')
      await page.selectOption('select#country', 'ES')
      await page.check('input#isDefault')
      
      // Submit form
      await page.click('button[type="submit"]')
      
      // Should show success message
      await expect(page.locator('.toast-success, .alert-success')).toBeVisible()
      
      // Modal should close
      await expect(page.locator('.fixed.inset-0')).not.toBeVisible()
      
      // Address should appear in the list
      await expect(page.locator('text=Calle Mayor 123')).toBeVisible()
      await expect(page.locator('text=Madrid, 28001')).toBeVisible()
    })

    test('should allow editing existing addresses', async ({ page }) => {
      // Assuming an address exists, click edit button
      await page.click('button[title="Edit Address"]')
      
      // Modal should open with existing data
      await expect(page.locator('h3:has-text("Edit Address")')).toBeVisible()
      
      // Fields should be populated
      await expect(page.locator('input#street')).not.toHaveValue('')
      
      // Make changes
      await page.fill('input#street', 'Calle Nueva 456')
      
      // Submit changes
      await page.click('button[type="submit"]')
      
      // Should show success message
      await expect(page.locator('.toast-success, .alert-success')).toBeVisible()
    })

    test('should allow deleting addresses with confirmation', async ({ page }) => {
      // Click delete button
      await page.click('button[title="Delete Address"]')
      
      // Should show confirmation dialog
      page.on('dialog', dialog => {
        expect(dialog.message()).toContain('Are you sure')
        dialog.accept()
      })
      
      // Should show success message after deletion
      await expect(page.locator('.toast-success, .alert-success')).toBeVisible()
    })
  })

  test.describe('Account Deletion', () => {
    test.beforeEach(async ({ page }) => {
      // Login and navigate to profile
      await page.goto('/auth/login')
      await page.fill('input[type="email"]', 'test@example.com')
      await page.fill('input[type="password"]', 'testpassword123')
      await page.click('button[type="submit"]')
      await page.goto('/account/profile')
    })

    test('should open delete account modal when delete button is clicked', async ({ page }) => {
      // Click delete account button
      await page.click('button:has-text("Delete Account")')
      
      // Modal should be visible
      await expect(page.locator('.fixed.inset-0')).toBeVisible()
      await expect(page.locator('h3:has-text("Delete Account")')).toBeVisible()
      
      // Should show warning message
      await expect(page.locator('text=This action cannot be undone')).toBeVisible()
      
      // Should show consequences list
      await expect(page.locator('text=Delete all your personal data')).toBeVisible()
    })

    test('should validate deletion confirmation requirements', async ({ page }) => {
      // Open delete modal
      await page.click('button:has-text("Delete Account")')
      
      // Try to submit without proper confirmation
      await page.fill('input#confirmation', 'wrong')
      await page.fill('input#password', 'password')
      
      // Delete button should be disabled
      await expect(page.locator('button:has-text("Delete My Account")')).toBeDisabled()
      
      // Enter correct confirmation
      await page.fill('input#confirmation', 'DELETE')
      
      // Delete button should be enabled
      await expect(page.locator('button:has-text("Delete My Account")')).toBeEnabled()
    })

    test('should require password confirmation for account deletion', async ({ page }) => {
      // Open delete modal
      await page.click('button:has-text("Delete Account")')
      
      // Fill confirmation but no password
      await page.fill('input#confirmation', 'DELETE')
      
      // Delete button should still be disabled
      await expect(page.locator('button:has-text("Delete My Account")')).toBeDisabled()
      
      // Add password
      await page.fill('input#password', 'testpassword123')
      
      // Delete button should be enabled
      await expect(page.locator('button:has-text("Delete My Account")')).toBeEnabled()
    })

    test('should allow selecting deletion reason', async ({ page }) => {
      // Open delete modal
      await page.click('button:has-text("Delete Account")')
      
      // Should have reason dropdown
      await expect(page.locator('select#reason')).toBeVisible()
      
      // Should have multiple options
      await page.selectOption('select#reason', 'not_using')
      await expect(page.locator('select#reason')).toHaveValue('not_using')
      
      await page.selectOption('select#reason', 'privacy_concerns')
      await expect(page.locator('select#reason')).toHaveValue('privacy_concerns')
    })

    test('should handle account deletion process', async ({ page }) => {
      // Open delete modal
      await page.click('button:has-text("Delete Account")')
      
      // Fill required fields
      await page.fill('input#confirmation', 'DELETE')
      await page.fill('input#password', 'testpassword123')
      await page.selectOption('select#reason', 'not_using')
      
      // Submit deletion
      await page.click('button:has-text("Delete My Account")')
      
      // Should show loading state
      await expect(page.locator('.animate-spin')).toBeVisible()
      
      // Should redirect to homepage after successful deletion
      await expect(page).toHaveURL('/')
      
      // Should show success message
      await expect(page.locator('.toast-success, .alert-success')).toBeVisible()
    })
  })

  test.describe('Mobile Responsiveness', () => {
    test('should be fully functional on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })
      
      // Login and navigate to profile
      await page.goto('/auth/login')
      await page.fill('input[type="email"]', 'test@example.com')
      await page.fill('input[type="password"]', 'testpassword123')
      await page.click('button[type="submit"]')
      await page.goto('/account/profile')
      
      // Profile form should be visible and functional
      await expect(page.locator('form')).toBeVisible()
      await expect(page.locator('input#name')).toBeVisible()
      
      // Address section should be responsive
      await expect(page.locator('h2:has-text("Addresses")')).toBeVisible()
      
      // Buttons should be touch-friendly (minimum 44px)
      const buttons = page.locator('button')
      const buttonCount = await buttons.count()
      
      for (let i = 0; i < buttonCount; i++) {
        const button = buttons.nth(i)
        const box = await button.boundingBox()
        if (box) {
          expect(box.height).toBeGreaterThanOrEqual(44)
        }
      }
    })

    test('should handle touch interactions properly', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })
      
      // Login and navigate to profile
      await page.goto('/auth/login')
      await page.fill('input[type="email"]', 'test@example.com')
      await page.fill('input[type="password"]', 'testpassword123')
      await page.click('button[type="submit"]')
      await page.goto('/account/profile')
      
      // Test touch interactions
      await page.tap('button:has-text("Add Address"), button:has-text("Add Your First Address")')
      
      // Modal should open
      await expect(page.locator('.fixed.inset-0')).toBeVisible()
      
      // Should be able to close modal by tapping outside
      await page.tap('.fixed.inset-0', { position: { x: 10, y: 10 } })
      await expect(page.locator('.fixed.inset-0')).not.toBeVisible()
    })
  })

  test.describe('Accessibility', () => {
    test('should be accessible with keyboard navigation', async ({ page }) => {
      // Login and navigate to profile
      await page.goto('/auth/login')
      await page.fill('input[type="email"]', 'test@example.com')
      await page.fill('input[type="password"]', 'testpassword123')
      await page.click('button[type="submit"]')
      await page.goto('/account/profile')
      
      // Should be able to navigate form with keyboard
      await page.keyboard.press('Tab')
      await expect(page.locator('input#name')).toBeFocused()
      
      await page.keyboard.press('Tab')
      await expect(page.locator('input#phone')).toBeFocused()
      
      await page.keyboard.press('Tab')
      await expect(page.locator('select#language')).toBeFocused()
    })

    test('should have proper ARIA labels and roles', async ({ page }) => {
      // Login and navigate to profile
      await page.goto('/auth/login')
      await page.fill('input[type="email"]', 'test@example.com')
      await page.fill('input[type="password"]', 'testpassword123')
      await page.click('button[type="submit"]')
      await page.goto('/account/profile')
      
      // Check for proper labels
      await expect(page.locator('label[for="name"]')).toBeVisible()
      await expect(page.locator('label[for="phone"]')).toBeVisible()
      await expect(page.locator('label[for="language"]')).toBeVisible()
      
      // Check for required field indicators
      await expect(page.locator('label:has-text("*")')).toHaveCount.greaterThan(0)
    })

    test('should announce form validation errors to screen readers', async ({ page }) => {
      // Login and navigate to profile
      await page.goto('/auth/login')
      await page.fill('input[type="email"]', 'test@example.com')
      await page.fill('input[type="password"]', 'testpassword123')
      await page.click('button[type="submit"]')
      await page.goto('/account/profile')
      
      // Clear required field and submit
      await page.fill('input#name', '')
      await page.click('button[type="submit"]')
      
      // Error message should be associated with the field
      const errorMessage = page.locator('input#name + p.text-red-600')
      await expect(errorMessage).toBeVisible()
      
      // Error should be announced (aria-describedby or similar)
      const nameInput = page.locator('input#name')
      const ariaDescribedBy = await nameInput.getAttribute('aria-describedby')
      expect(ariaDescribedBy).toBeTruthy()
    })
  })
})