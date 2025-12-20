/**
 * Setup: Express Checkout Tests
 *
 * Prepares test environment and user data for express checkout tests
 */

import { test as setup, expect } from '@playwright/test'
import { ExpressCheckoutFixtures } from '../fixtures/express-checkout-fixtures'

const STORAGE_STATE_DIR = 'tests/fixtures/.auth'

/**
 * Setup authenticated users with different data states
 */
setup.describe('Express Checkout Test Setup', () => {
  setup('setup user with preferences (auto-skip)', async ({ page, context }) => {
    const user = ExpressCheckoutFixtures.returningUserWithPreferences()

    // Sign in
    await page.goto('/auth/login')
    await page.fill('input[type="email"]', user.email)
    await page.fill('input[type="password"]', user.password)
    await page.click('button[type="submit"]')

    // Wait for redirect
    await page.waitForURL(/\/(en|es|ro|ru)\/?$/, { timeout: 10000 })

    // Verify signed in
    await expect(page.locator('text=/account|cuenta|cont/i')).toBeVisible()

    // Save authentication state
    await context.storageState({
      path: `${STORAGE_STATE_DIR}/user-with-preferences.json`,
    })
  })

  setup('setup user with address only (manual express)', async ({ page, context }) => {
    const user = ExpressCheckoutFixtures.userWithAddressOnly()

    // Sign in
    await page.goto('/auth/login')
    await page.fill('input[type="email"]', user.email)
    await page.fill('input[type="password"]', user.password)
    await page.click('button[type="submit"]')

    // Wait for redirect
    await page.waitForURL(/\/(en|es|ro|ru)\/?$/, { timeout: 10000 })

    // Save authentication state
    await context.storageState({
      path: `${STORAGE_STATE_DIR}/user-address-only.json`,
    })
  })

  setup('setup user without data (new user)', async ({ page, context }) => {
    const user = ExpressCheckoutFixtures.userWithoutAddress()

    // Sign in
    await page.goto('/auth/login')
    await page.fill('input[type="email"]', user.email)
    await page.fill('input[type="password"]', user.password)
    await page.click('button[type="submit"]')

    // Wait for redirect
    await page.waitForURL(/\/(en|es|ro|ru)\/?$/, { timeout: 10000 })

    // Save authentication state
    await context.storageState({
      path: `${STORAGE_STATE_DIR}/user-no-data.json`,
    })
  })

  setup('verify test database is accessible', async ({ page }) => {
    // Make a test request to verify database connection
    const response = await page.request.get('/api/health')

    expect(response.ok()).toBeTruthy()
  })

  setup('seed test data if needed', async () => {
    // This would typically seed database with test users and addresses
    // Implementation depends on your database setup

    // Example: Make API call to seed endpoint
    // await page.request.post('/api/test/seed', {
    //   data: {
    //     users: [
    //       ExpressCheckoutFixtures.returningUserWithPreferences(),
    //       ExpressCheckoutFixtures.userWithAddressOnly(),
    //     ]
    //   }
    // })

    console.log('Test data seeding skipped - configure based on your setup')
  })
})
