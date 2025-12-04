/**
 * E2E Test Suite: Express Checkout Auto-Skip Feature
 *
 * Comprehensive tests covering:
 * 1. Auto-skip flow (returning user with complete data)
 * 2. Manual express (user without shipping method)
 * 3. Guest checkout (no express features)
 * 4. Multi-language support
 * 5. Edge cases and error handling
 *
 * Test Architecture:
 * - Page Object Models for reusability
 * - Fixtures for test data
 * - Helper utilities for common operations
 * - Locale-aware assertions
 */

import { test, expect, type Page } from '@playwright/test'
import { CheckoutPage } from './page-objects/CheckoutPage'
import { AuthPage } from './page-objects/AuthPage'
import { CartHelper } from './helpers/CartHelper'
import { ExpressCheckoutFixtures } from './fixtures/express-checkout-fixtures'
import { LocaleHelper } from './helpers/LocaleHelper'
import { WaitHelper } from './helpers/WaitHelper'

// Test configuration
const TEST_CONFIG = {
  countdownDuration: 5000, // 5 seconds
  countdownTolerance: 500, // Allow 500ms variance
  navigationTimeout: 10000,
  shortTimeout: 2000,
}

test.describe('Express Checkout Auto-Skip Feature', () => {
  let checkoutPage: CheckoutPage
  let authPage: AuthPage
  let cartHelper: CartHelper
  let waitHelper: WaitHelper

  test.beforeEach(async ({ page }) => {
    // Initialize page objects and helpers
    checkoutPage = new CheckoutPage(page)
    authPage = new AuthPage(page)
    cartHelper = new CartHelper(page)
    waitHelper = new WaitHelper(page)

    // Clear browser state for clean test
    await page.context().clearCookies()
    await page.context().clearPermissions()
  })

  test.describe('1. Auto-Skip Flow (Returning User)', () => {
    test('should auto-navigate to payment with countdown timer', async ({ page }) => {
      // Arrange: Sign in as returning user with saved data
      const user = ExpressCheckoutFixtures.returningUserWithPreferences()
      await authPage.signIn(user.email, user.password)
      await cartHelper.addProductToCart()

      // Act: Navigate to checkout with express query parameter
      await checkoutPage.navigateWithExpress()

      // Assert: Countdown is visible and working
      await expect(checkoutPage.countdownTimer).toBeVisible()
      await expect(checkoutPage.countdownProgressBar).toBeVisible()

      // Verify countdown starts at 5 seconds
      const initialCount = await checkoutPage.getCountdownValue()
      expect(initialCount).toBe(5)

      // Wait for countdown to decrease
      await page.waitForTimeout(1500)
      const decreasedCount = await checkoutPage.getCountdownValue()
      expect(decreasedCount).toBeLessThan(initialCount)

      // Assert: Saved address is displayed
      await expect(checkoutPage.savedAddressDisplay).toBeVisible()
      await expect(checkoutPage.savedAddressDisplay).toContainText(user.address.street)

      // Assert: Preferred shipping method is shown
      await expect(checkoutPage.preferredShippingMethod).toBeVisible()
      await expect(checkoutPage.preferredShippingMethod).toContainText('Standard')

      // Assert: Auto-navigation to payment after countdown
      await waitHelper.waitForCountdown(TEST_CONFIG.countdownDuration)
      await expect(page).toHaveURL(/\/checkout\/payment/, {
        timeout: TEST_CONFIG.navigationTimeout
      })
    })

    test('should show progress bar animation during countdown', async ({ page }) => {
      const user = ExpressCheckoutFixtures.returningUserWithPreferences()
      await authPage.signIn(user.email, user.password)
      await cartHelper.addProductToCart()
      await checkoutPage.navigateWithExpress()

      // Get initial progress bar width
      const initialWidth = await checkoutPage.getProgressBarWidth()
      expect(initialWidth).toBeGreaterThan(90) // Should start near 100%

      // Wait and verify progress decreases
      await page.waitForTimeout(2000)
      const decreasedWidth = await checkoutPage.getProgressBarWidth()
      expect(decreasedWidth).toBeLessThan(initialWidth)
    })

    test('should cancel countdown when cancel button is clicked', async ({ page }) => {
      const user = ExpressCheckoutFixtures.returningUserWithPreferences()
      await authPage.signIn(user.email, user.password)
      await cartHelper.addProductToCart()
      await checkoutPage.navigateWithExpress()

      // Wait for countdown to start
      await expect(checkoutPage.countdownTimer).toBeVisible()

      // Click cancel button
      await checkoutPage.cancelCountdownButton.click()

      // Assert: Countdown stops and banner remains on shipping page
      await expect(checkoutPage.countdownTimer).not.toBeVisible()
      await expect(page).toHaveURL(/\/checkout$/)

      // Assert: Manual express button is now visible
      await expect(checkoutPage.useExpressButton).toBeVisible()

      // Assert: Toast notification shows cancellation message
      await expect(checkoutPage.toast).toContainText(/countdown.*cancel/i)
    })

    test('should display all countdown UI elements correctly', async ({ page }) => {
      const user = ExpressCheckoutFixtures.returningUserWithPreferences()
      await authPage.signIn(user.email, user.password)
      await cartHelper.addProductToCart()
      await checkoutPage.navigateWithExpress()

      // Verify all UI elements are present
      await expect(checkoutPage.countdownTitle).toBeVisible()
      await expect(checkoutPage.countdownMessage).toBeVisible()
      await expect(checkoutPage.countdownTimer).toBeVisible()
      await expect(checkoutPage.countdownProgressBar).toBeVisible()
      await expect(checkoutPage.cancelCountdownButton).toBeVisible()

      // Verify lightning icon animation
      await expect(checkoutPage.lightningIcon).toHaveClass(/animate-pulse/)
    })

    test('should pre-populate checkout store with saved data', async ({ page }) => {
      const user = ExpressCheckoutFixtures.returningUserWithPreferences()
      await authPage.signIn(user.email, user.password)
      await cartHelper.addProductToCart()
      await checkoutPage.navigateWithExpress()

      // Wait for auto-navigation
      await waitHelper.waitForCountdown(TEST_CONFIG.countdownDuration)
      await expect(page).toHaveURL(/\/checkout\/payment/)

      // Navigate back to shipping to verify data persistence
      await page.goBack()
      await page.waitForLoadState('networkidle')

      // Assert: Form is pre-populated with saved data
      await expect(checkoutPage.addressFields.street).toHaveValue(user.address.street)
      await expect(checkoutPage.addressFields.city).toHaveValue(user.address.city)
      await expect(checkoutPage.addressFields.postalCode).toHaveValue(user.address.postalCode)
    })
  })

  test.describe('2. Manual Express (User Without Shipping Method)', () => {
    test('should show banner without countdown for new user with address', async ({ page }) => {
      // User has saved address but no order history (no preferred method)
      const user = ExpressCheckoutFixtures.userWithAddressOnly()
      await authPage.signIn(user.email, user.password)
      await cartHelper.addProductToCart()
      await checkoutPage.navigate()

      // Assert: Banner is visible
      await expect(checkoutPage.expressBanner).toBeVisible()

      // Assert: No countdown UI elements
      await expect(checkoutPage.countdownTimer).not.toBeVisible()
      await expect(checkoutPage.countdownProgressBar).not.toBeVisible()

      // Assert: Manual button is visible
      await expect(checkoutPage.useExpressButton).toBeVisible()

      // Assert: Address is displayed
      await expect(checkoutPage.savedAddressDisplay).toContainText(user.address.street)

      // Assert: No preferred shipping method section
      await expect(checkoutPage.preferredShippingMethod).not.toBeVisible()
    })

    test('should pre-fill form but stay on shipping page when using manual express', async ({ page }) => {
      const user = ExpressCheckoutFixtures.userWithAddressOnly()
      await authPage.signIn(user.email, user.password)
      await cartHelper.addProductToCart()
      await checkoutPage.navigate()

      // Click manual express button
      await checkoutPage.useExpressButton.click()

      // Assert: Stays on shipping page (doesn't auto-navigate)
      await page.waitForTimeout(TEST_CONFIG.shortTimeout)
      await expect(page).toHaveURL(/\/checkout$/)

      // Assert: Form is pre-populated
      await expect(checkoutPage.addressFields.street).toHaveValue(user.address.street)
      await expect(checkoutPage.addressFields.city).toHaveValue(user.address.city)

      // Assert: Shipping method section is visible but not selected
      await expect(checkoutPage.shippingMethodSection).toBeVisible()

      // Assert: Toast shows info message
      await expect(checkoutPage.toast).toContainText(/address.*loaded/i)
      await expect(checkoutPage.toast).toContainText(/select.*shipping/i)
    })

    test('should allow user to edit pre-filled address', async ({ page }) => {
      const user = ExpressCheckoutFixtures.userWithAddressOnly()
      await authPage.signIn(user.email, user.password)
      await cartHelper.addProductToCart()
      await checkoutPage.navigate()

      // Use express checkout to pre-fill
      await checkoutPage.useExpressButton.click()

      // Edit the street address
      await checkoutPage.addressFields.street.clear()
      await checkoutPage.addressFields.street.fill('456 New Street')

      // Verify the change persists
      await expect(checkoutPage.addressFields.street).toHaveValue('456 New Street')
    })

    test('should dismiss banner when edit button is clicked', async ({ page }) => {
      const user = ExpressCheckoutFixtures.userWithAddressOnly()
      await authPage.signIn(user.email, user.password)
      await cartHelper.addProductToCart()
      await checkoutPage.navigate()

      // Click edit/dismiss button
      await checkoutPage.editDetailsButton.click()

      // Assert: Banner is dismissed
      await expect(checkoutPage.expressBanner).not.toBeVisible()

      // Assert: Regular form is shown
      await expect(checkoutPage.addressForm).toBeVisible()
    })
  })

  test.describe('3. Guest Checkout (No Express Features)', () => {
    test('should not show express banner for guest users', async ({ page }) => {
      // Act: Add product and go to checkout as guest
      await cartHelper.addProductToCart()
      await checkoutPage.navigate()

      // Assert: No express banner
      await expect(checkoutPage.expressBanner).not.toBeVisible()

      // Assert: Guest checkout prompt is shown
      await expect(checkoutPage.guestCheckoutPrompt).toBeVisible()
      await expect(checkoutPage.continueAsGuestButton).toBeVisible()
    })

    test('should show normal checkout flow for guest', async ({ page }) => {
      await cartHelper.addProductToCart()
      await checkoutPage.navigate()

      // Continue as guest
      await checkoutPage.continueAsGuestButton.click()

      // Assert: Guest email form appears
      await expect(checkoutPage.guestEmailInput).toBeVisible()

      // Fill guest info
      await checkoutPage.fillGuestInfo('guest@example.com')

      // Assert: Address form appears (no pre-population)
      await expect(checkoutPage.addressForm).toBeVisible()
      await expect(checkoutPage.addressFields.street).toHaveValue('')
    })

    test('should not trigger auto-skip with express query param as guest', async ({ page }) => {
      await cartHelper.addProductToCart()

      // Navigate with express param (shouldn't matter for guest)
      await page.goto('/checkout?express=1')

      // Assert: No countdown, just normal guest flow
      await expect(checkoutPage.countdownTimer).not.toBeVisible()
      await expect(checkoutPage.expressBanner).not.toBeVisible()
      await expect(checkoutPage.guestCheckoutPrompt).toBeVisible()
    })
  })

  test.describe('4. Multi-Language Support', () => {
    const locales = ['es', 'en', 'ro', 'ru'] as const

    for (const locale of locales) {
      test(`should display countdown messages in ${locale}`, async ({ page }) => {
        // Set locale
        const localeHelper = new LocaleHelper(page, locale)
        await localeHelper.setLocale()

        const user = ExpressCheckoutFixtures.returningUserWithPreferences()
        await authPage.signIn(user.email, user.password)
        await cartHelper.addProductToCart()
        await checkoutPage.navigateWithExpress()

        // Get translated strings
        const translations = localeHelper.getExpressCheckoutTranslations()

        // Verify countdown title
        await expect(checkoutPage.countdownTitle).toContainText(
          new RegExp(translations.countdownTitle, 'i')
        )

        // Verify countdown message
        await expect(checkoutPage.countdownMessage).toBeVisible()

        // Verify cancel button text
        await expect(checkoutPage.cancelCountdownButton).toContainText(
          new RegExp(translations.cancelButton, 'i')
        )
      })

      test(`should display manual express messages in ${locale}`, async ({ page }) => {
        const localeHelper = new LocaleHelper(page, locale)
        await localeHelper.setLocale()

        const user = ExpressCheckoutFixtures.userWithAddressOnly()
        await authPage.signIn(user.email, user.password)
        await cartHelper.addProductToCart()
        await checkoutPage.navigate()

        const translations = localeHelper.getExpressCheckoutTranslations()

        // Verify banner title
        await expect(checkoutPage.bannerTitle).toContainText(
          new RegExp(translations.title, 'i')
        )

        // Verify use button text
        await expect(checkoutPage.useExpressButton).toContainText(
          new RegExp(translations.useButton, 'i')
        )
      })
    }
  })

  test.describe('5. Edge Cases and Error Handling', () => {
    test('should handle navigation during countdown gracefully', async ({ page }) => {
      const user = ExpressCheckoutFixtures.returningUserWithPreferences()
      await authPage.signIn(user.email, user.password)
      await cartHelper.addProductToCart()
      await checkoutPage.navigateWithExpress()

      // Wait for countdown to start
      await expect(checkoutPage.countdownTimer).toBeVisible()

      // Navigate away during countdown
      await page.goto('/cart')
      await page.waitForLoadState('networkidle')

      // Navigate back to checkout
      await checkoutPage.navigate()

      // Assert: Countdown should not auto-start again
      await page.waitForTimeout(TEST_CONFIG.shortTimeout)
      await expect(checkoutPage.countdownTimer).not.toBeVisible()

      // Assert: Manual express button is shown instead
      await expect(checkoutPage.useExpressButton).toBeVisible()
    })

    test('should prevent multiple countdown triggers', async ({ page }) => {
      const user = ExpressCheckoutFixtures.returningUserWithPreferences()
      await authPage.signIn(user.email, user.password)
      await cartHelper.addProductToCart()

      // Navigate with express param multiple times
      await checkoutPage.navigateWithExpress()
      await expect(checkoutPage.countdownTimer).toBeVisible()

      const firstCount = await checkoutPage.getCountdownValue()

      // Try to trigger again by reloading
      await page.reload()
      await page.waitForLoadState('networkidle')

      // Countdown should restart, not stack
      const secondCount = await checkoutPage.getCountdownValue()
      expect(secondCount).toBe(5) // Fresh countdown
    })

    test('should handle back button during countdown', async ({ page }) => {
      const user = ExpressCheckoutFixtures.returningUserWithPreferences()
      await authPage.signIn(user.email, user.password)
      await cartHelper.addProductToCart()
      await checkoutPage.navigateWithExpress()

      // Wait for countdown
      await expect(checkoutPage.countdownTimer).toBeVisible()

      // Press back button
      await page.goBack()
      await page.waitForLoadState('networkidle')

      // Assert: Should be on cart page
      await expect(page).toHaveURL(/\/cart/)

      // Navigate forward
      await page.goForward()
      await page.waitForLoadState('networkidle')

      // Countdown should be cancelled
      await expect(checkoutPage.countdownTimer).not.toBeVisible()
    })

    test('should handle session expiry gracefully', async ({ page, context }) => {
      const user = ExpressCheckoutFixtures.returningUserWithPreferences()
      await authPage.signIn(user.email, user.password)
      await cartHelper.addProductToCart()

      // Clear cookies to simulate session expiry
      await context.clearCookies()

      // Try to navigate with express
      await checkoutPage.navigateWithExpress()

      // Should redirect to auth or show guest flow
      await page.waitForTimeout(TEST_CONFIG.shortTimeout)

      const currentUrl = page.url()
      const isAuthPage = currentUrl.includes('/auth/')
      const isGuestFlow = await checkoutPage.guestCheckoutPrompt.isVisible()

      expect(isAuthPage || isGuestFlow).toBeTruthy()
    })

    test('should cleanup countdown timer on unmount', async ({ page }) => {
      const user = ExpressCheckoutFixtures.returningUserWithPreferences()
      await authPage.signIn(user.email, user.password)
      await cartHelper.addProductToCart()
      await checkoutPage.navigateWithExpress()

      // Start countdown
      await expect(checkoutPage.countdownTimer).toBeVisible()

      // Navigate away immediately
      await page.goto('/')

      // Navigate back after countdown would have completed
      await page.waitForTimeout(TEST_CONFIG.countdownDuration + 1000)
      await checkoutPage.navigate()

      // Should not auto-navigate (timer was cleaned up)
      await page.waitForTimeout(TEST_CONFIG.shortTimeout)
      await expect(page).toHaveURL(/\/checkout$/)
    })

    test('should handle missing default address gracefully', async ({ page }) => {
      // User is authenticated but has no saved addresses
      const user = ExpressCheckoutFixtures.userWithoutAddress()
      await authPage.signIn(user.email, user.password)
      await cartHelper.addProductToCart()
      await checkoutPage.navigateWithExpress()

      // Assert: No banner shown
      await expect(checkoutPage.expressBanner).not.toBeVisible()

      // Assert: Regular address form is shown
      await expect(checkoutPage.addressForm).toBeVisible()
    })

    test('should handle API errors during express checkout', async ({ page }) => {
      const user = ExpressCheckoutFixtures.returningUserWithPreferences()
      await authPage.signIn(user.email, user.password)
      await cartHelper.addProductToCart()

      // Intercept and fail the shipping info update
      await page.route('**/api/checkout/**', route => {
        route.fulfill({
          status: 500,
          body: JSON.stringify({ error: 'Server error' })
        })
      })

      await checkoutPage.navigate()
      await checkoutPage.useExpressButton.click()

      // Assert: Error toast is shown
      await expect(checkoutPage.toast).toContainText(/error|failed/i)

      // Assert: User stays on checkout page
      await expect(page).toHaveURL(/\/checkout$/)
    })

    test('should handle concurrent navigation attempts', async ({ page }) => {
      const user = ExpressCheckoutFixtures.returningUserWithPreferences()
      await authPage.signIn(user.email, user.password)
      await cartHelper.addProductToCart()
      await checkoutPage.navigateWithExpress()

      // Wait for countdown to nearly complete
      await waitHelper.waitForCountdown(TEST_CONFIG.countdownDuration - 1000)

      // Try to manually navigate while auto-navigation is about to trigger
      const manualNavigation = page.goto('/checkout/payment')

      // Wait for auto-navigation
      await page.waitForTimeout(1500)

      // Should end up on payment page without errors
      await expect(page).toHaveURL(/\/checkout\/payment/)
    })
  })

  test.describe('6. Accessibility and UX', () => {
    test('should have proper ARIA labels on countdown elements', async ({ page }) => {
      const user = ExpressCheckoutFixtures.returningUserWithPreferences()
      await authPage.signIn(user.email, user.password)
      await cartHelper.addProductToCart()
      await checkoutPage.navigateWithExpress()

      // Check cancel button has aria-label
      const cancelButton = checkoutPage.cancelCountdownButton
      await expect(cancelButton).toHaveAttribute('aria-label', /.+/)
    })

    test('should be keyboard navigable', async ({ page }) => {
      const user = ExpressCheckoutFixtures.returningUserWithPreferences()
      await authPage.signIn(user.email, user.password)
      await cartHelper.addProductToCart()
      await checkoutPage.navigateWithExpress()

      // Tab to cancel button
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')

      // Cancel with Enter key
      await page.keyboard.press('Enter')

      // Verify countdown cancelled
      await expect(checkoutPage.countdownTimer).not.toBeVisible()
    })

    test('should show loading state on express button', async ({ page }) => {
      const user = ExpressCheckoutFixtures.userWithAddressOnly()
      await authPage.signIn(user.email, user.password)
      await cartHelper.addProductToCart()
      await checkoutPage.navigate()

      // Click express button and immediately check loading state
      const clickPromise = checkoutPage.useExpressButton.click()

      // Check for loading indicator
      await expect(checkoutPage.useExpressButton).toBeDisabled()
      await expect(page.locator('.animate-spin')).toBeVisible()

      await clickPromise
    })

    test('should display address in readable format', async ({ page }) => {
      const user = ExpressCheckoutFixtures.returningUserWithPreferences()
      await authPage.signIn(user.email, user.password)
      await cartHelper.addProductToCart()
      await checkoutPage.navigateWithExpress()

      // Check address formatting
      const addressDisplay = checkoutPage.savedAddressDisplay

      // Should show full name
      await expect(addressDisplay).toContainText(user.address.firstName)
      await expect(addressDisplay).toContainText(user.address.lastName)

      // Should show street on separate line
      await expect(addressDisplay).toContainText(user.address.street)

      // Should show city and postal code together
      await expect(addressDisplay).toContainText(
        `${user.address.city}, ${user.address.postalCode}`
      )
    })
  })

  test.describe('7. Performance and Timing', () => {
    test('should countdown accurately (within tolerance)', async ({ page }) => {
      const user = ExpressCheckoutFixtures.returningUserWithPreferences()
      await authPage.signIn(user.email, user.password)
      await cartHelper.addProductToCart()
      await checkoutPage.navigateWithExpress()

      // Record start time
      const startTime = Date.now()

      // Wait for navigation to payment
      await expect(page).toHaveURL(/\/checkout\/payment/, {
        timeout: TEST_CONFIG.countdownDuration + TEST_CONFIG.navigationTimeout
      })

      // Calculate elapsed time
      const elapsed = Date.now() - startTime

      // Verify timing is accurate (within tolerance)
      expect(elapsed).toBeGreaterThanOrEqual(TEST_CONFIG.countdownDuration - TEST_CONFIG.countdownTolerance)
      expect(elapsed).toBeLessThanOrEqual(TEST_CONFIG.countdownDuration + TEST_CONFIG.countdownTolerance + TEST_CONFIG.navigationTimeout)
    })

    test('should update countdown UI smoothly', async ({ page }) => {
      const user = ExpressCheckoutFixtures.returningUserWithPreferences()
      await authPage.signIn(user.email, user.password)
      await cartHelper.addProductToCart()
      await checkoutPage.navigateWithExpress()

      // Sample countdown values over time
      const samples: number[] = []

      for (let i = 0; i < 4; i++) {
        samples.push(await checkoutPage.getCountdownValue())
        await page.waitForTimeout(1000)
      }

      // Verify countdown is decreasing
      for (let i = 1; i < samples.length; i++) {
        expect(samples[i]).toBeLessThan(samples[i - 1])
      }
    })

    test('should not cause layout shifts during countdown', async ({ page }) => {
      const user = ExpressCheckoutFixtures.returningUserWithPreferences()
      await authPage.signIn(user.email, user.password)
      await cartHelper.addProductToCart()
      await checkoutPage.navigateWithExpress()

      // Get initial banner position
      const initialBox = await checkoutPage.expressBanner.boundingBox()

      // Wait for countdown to progress
      await page.waitForTimeout(2000)

      // Get banner position after countdown
      const afterBox = await checkoutPage.expressBanner.boundingBox()

      // Positions should be stable
      expect(initialBox?.y).toBe(afterBox?.y)
      expect(initialBox?.height).toBeCloseTo(afterBox?.height || 0, 5)
    })
  })
})
