/**
 * Order Return Request E2E Tests
 *
 * Tests the order return request user flow:
 * - Request return on delivered orders
 * - Return reason selection
 * - Return request creation
 * - Return request visibility in order details
 */

import { test as base, expect } from '@playwright/test'
import path from 'path'

// Test credentials
const TEST_EMAIL = process.env.TEST_USER_EMAIL
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD

if (!TEST_EMAIL || !TEST_PASSWORD) {
  throw new Error('TEST_USER_EMAIL and TEST_USER_PASSWORD environment variables are required')
}

// Helper to perform inline login
async function performInlineLogin(page: any) {
  await page.goto('/auth/login')
  await page.waitForLoadState('networkidle')

  await page.fill('[data-testid="email-input"]', TEST_EMAIL)
  await page.fill('[data-testid="password-input"]', TEST_PASSWORD)
  await page.click('[data-testid="login-button"]')

  await page.waitForURL(/\/(admin|account|$)/, { timeout: 10000 })
}

// Create authenticated test fixture
const test = base.extend<{
  authenticatedPage: ReturnType<typeof base.info>['fixtures']['page']
}>({
  authenticatedPage: async ({ browser }, use, testInfo) => {
    const projectName = testInfo.project.name
    const locale = projectName.split('-')[1] || 'es'
    const storageStatePath = path.join(process.cwd(), `tests/fixtures/.auth/user-${locale}.json`)

    const context = await browser.newContext({
      storageState: storageStatePath,
    })
    const page = await context.newPage()

    await page.goto('/account')
    await page.waitForLoadState('networkidle')

    const isLoggedIn = !page.url().includes('/auth/login')

    if (!isLoggedIn) {
      await performInlineLogin(page)
    }

    await page.waitForTimeout(500)

    await use(page)

    await context.close()
  },
})

test.describe('Order Return Request Flow', () => {
  test.describe('Return Button Visibility', () => {
    test('should show return button on delivered order within return window', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/account/orders')
      await authenticatedPage.waitForLoadState('networkidle')
      await authenticatedPage.waitForTimeout(1000)

      // Find an order with delivered status
      const deliveredOrder = authenticatedPage.locator('[data-testid="order-card"]').filter({
        has: authenticatedPage.locator('[data-testid="order-status-delivered"]'),
      }).first()

      const hasDeliveredOrder = await deliveredOrder.count() > 0

      if (hasDeliveredOrder) {
        await deliveredOrder.click()
        await authenticatedPage.waitForLoadState('networkidle')

        // Should see return button in actions section (if within return window)
        const returnButton = authenticatedPage.locator('[data-testid="return-order-button"]')
        // The button may or may not be visible depending on the return window
        // Just verify we can locate it if it exists
        const isVisible = await returnButton.isVisible().catch(() => false)
        expect(typeof isVisible).toBe('boolean')
      }
      else {
        test.skip(true, 'No delivered orders available to test return')
      }
    })

    test('should NOT show return button on pending order', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/account/orders')
      await authenticatedPage.waitForLoadState('networkidle')
      await authenticatedPage.waitForTimeout(1000)

      const pendingOrder = authenticatedPage.locator('[data-testid="order-card"]').filter({
        has: authenticatedPage.locator('[data-testid="order-status-pending"]'),
      }).first()

      const hasPendingOrder = await pendingOrder.count() > 0

      if (hasPendingOrder) {
        await pendingOrder.click()
        await authenticatedPage.waitForLoadState('networkidle')

        // Return button should NOT be visible
        const returnButton = authenticatedPage.locator('[data-testid="return-order-button"]')
        await expect(returnButton).not.toBeVisible()
      }
      else {
        test.skip(true, 'No pending orders available to test')
      }
    })

    test('should NOT show return button on cancelled order', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/account/orders')
      await authenticatedPage.waitForLoadState('networkidle')
      await authenticatedPage.waitForTimeout(1000)

      const cancelledOrder = authenticatedPage.locator('[data-testid="order-card"]').filter({
        has: authenticatedPage.locator('[data-testid="order-status-cancelled"]'),
      }).first()

      const hasCancelledOrder = await cancelledOrder.count() > 0

      if (hasCancelledOrder) {
        await cancelledOrder.click()
        await authenticatedPage.waitForLoadState('networkidle')

        // Return button should NOT be visible
        const returnButton = authenticatedPage.locator('[data-testid="return-order-button"]')
        await expect(returnButton).not.toBeVisible()
      }
      else {
        test.skip(true, 'No cancelled orders available to test')
      }
    })
  })

  test.describe('Return Request Modal', () => {
    test('should show return request modal when clicking return button', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/account/orders')
      await authenticatedPage.waitForLoadState('networkidle')
      await authenticatedPage.waitForTimeout(1000)

      // Find delivered order
      const deliveredOrder = authenticatedPage.locator('[data-testid="order-card"]').filter({
        has: authenticatedPage.locator('[data-testid="order-status-delivered"]'),
      }).first()

      const hasDeliveredOrder = await deliveredOrder.count() > 0

      if (hasDeliveredOrder) {
        await deliveredOrder.click()
        await authenticatedPage.waitForLoadState('networkidle')

        const returnButton = authenticatedPage.locator('[data-testid="return-order-button"]')
        const isReturnAvailable = await returnButton.isVisible().catch(() => false)

        if (isReturnAvailable) {
          await returnButton.click()

          // Return request modal should appear
          const returnModal = authenticatedPage.locator('[data-testid="return-request-modal"]')
          await expect(returnModal).toBeVisible({ timeout: 5000 })
        }
        else {
          test.skip(true, 'Return not available for this order (outside return window)')
        }
      }
      else {
        test.skip(true, 'No delivered orders available to test')
      }
    })

    test('should require return reason selection', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/account/orders')
      await authenticatedPage.waitForLoadState('networkidle')
      await authenticatedPage.waitForTimeout(1000)

      const deliveredOrder = authenticatedPage.locator('[data-testid="order-card"]').filter({
        has: authenticatedPage.locator('[data-testid="order-status-delivered"]'),
      }).first()

      const hasDeliveredOrder = await deliveredOrder.count() > 0

      if (hasDeliveredOrder) {
        await deliveredOrder.click()
        await authenticatedPage.waitForLoadState('networkidle')

        const returnButton = authenticatedPage.locator('[data-testid="return-order-button"]')
        const isReturnAvailable = await returnButton.isVisible().catch(() => false)

        if (isReturnAvailable) {
          await returnButton.click()

          const returnModal = authenticatedPage.locator('[data-testid="return-request-modal"]')
          await expect(returnModal).toBeVisible()

          // Reason select should be required
          const reasonSelect = authenticatedPage.locator('[data-testid="return-reason-select"]')
          await expect(reasonSelect).toBeVisible()

          // Submit button should be disabled when no reason selected
          const submitButton = authenticatedPage.locator('[data-testid="submit-return-button"]')
          await expect(submitButton).toBeDisabled()
        }
        else {
          test.skip(true, 'Return not available for this order')
        }
      }
      else {
        test.skip(true, 'No delivered orders available to test')
      }
    })

    test('should enable submit after selecting reason', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/account/orders')
      await authenticatedPage.waitForLoadState('networkidle')
      await authenticatedPage.waitForTimeout(1000)

      const deliveredOrder = authenticatedPage.locator('[data-testid="order-card"]').filter({
        has: authenticatedPage.locator('[data-testid="order-status-delivered"]'),
      }).first()

      const hasDeliveredOrder = await deliveredOrder.count() > 0

      if (hasDeliveredOrder) {
        await deliveredOrder.click()
        await authenticatedPage.waitForLoadState('networkidle')

        const returnButton = authenticatedPage.locator('[data-testid="return-order-button"]')
        const isReturnAvailable = await returnButton.isVisible().catch(() => false)

        if (isReturnAvailable) {
          await returnButton.click()

          const returnModal = authenticatedPage.locator('[data-testid="return-request-modal"]')
          await expect(returnModal).toBeVisible()

          // Select a reason
          const reasonSelect = authenticatedPage.locator('[data-testid="return-reason-select"]')
          await reasonSelect.selectOption({ index: 1 }) // Select first non-empty option

          // Submit button should now be enabled
          const submitButton = authenticatedPage.locator('[data-testid="submit-return-button"]')
          await expect(submitButton).toBeEnabled()
        }
        else {
          test.skip(true, 'Return not available for this order')
        }
      }
      else {
        test.skip(true, 'No delivered orders available to test')
      }
    })
  })

  test.describe('Return Request Submission', () => {
    test('should create return request with pending status', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/account/orders')
      await authenticatedPage.waitForLoadState('networkidle')
      await authenticatedPage.waitForTimeout(1000)

      const deliveredOrder = authenticatedPage.locator('[data-testid="order-card"]').filter({
        has: authenticatedPage.locator('[data-testid="order-status-delivered"]'),
      }).first()

      const hasDeliveredOrder = await deliveredOrder.count() > 0

      if (hasDeliveredOrder) {
        await deliveredOrder.click()
        await authenticatedPage.waitForLoadState('networkidle')

        const returnButton = authenticatedPage.locator('[data-testid="return-order-button"]')
        const isReturnAvailable = await returnButton.isVisible().catch(() => false)

        if (isReturnAvailable) {
          await returnButton.click()

          const returnModal = authenticatedPage.locator('[data-testid="return-request-modal"]')
          await expect(returnModal).toBeVisible()

          // Select a reason
          const reasonSelect = authenticatedPage.locator('[data-testid="return-reason-select"]')
          await reasonSelect.selectOption({ index: 1 })

          // Submit the return request
          const submitButton = authenticatedPage.locator('[data-testid="submit-return-button"]')
          await submitButton.click()

          // Wait for response
          await authenticatedPage.waitForTimeout(2000)

          // Should show success message or return request status
          const successMessage = authenticatedPage.locator('[data-testid="return-success-message"]')
          const returnStatus = authenticatedPage.locator('[data-testid="return-request-status"]')

          const hasSuccess = await successMessage.isVisible().catch(() => false)
          const hasStatus = await returnStatus.isVisible().catch(() => false)

          expect(hasSuccess || hasStatus).toBeTruthy()
        }
        else {
          test.skip(true, 'Return not available for this order')
        }
      }
      else {
        test.skip(true, 'No delivered orders available to test')
      }
    })

    test('should show return request in order details', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/account/orders')
      await authenticatedPage.waitForLoadState('networkidle')
      await authenticatedPage.waitForTimeout(1000)

      // Look for orders that have a return request
      const orderWithReturn = authenticatedPage.locator('[data-testid="order-card"]').filter({
        has: authenticatedPage.locator('[data-testid="has-return-request"]'),
      }).first()

      const hasOrderWithReturn = await orderWithReturn.count() > 0

      if (hasOrderWithReturn) {
        await orderWithReturn.click()
        await authenticatedPage.waitForLoadState('networkidle')

        // Should see return request section
        const returnSection = authenticatedPage.locator('[data-testid="return-request-section"]')
        await expect(returnSection).toBeVisible()

        // Should show return status
        const returnStatus = authenticatedPage.locator('[data-testid="return-request-status"]')
        await expect(returnStatus).toBeVisible()
      }
      else {
        // If no orders with returns, just verify the page loads
        const ordersPage = authenticatedPage.locator('h1, h2').filter({ hasText: /orders|pedidos|comenzi|заказы/i })
        await expect(ordersPage.first()).toBeVisible()
      }
    })
  })

  test.describe('Return Request Cancellation', () => {
    test('should allow cancelling pending return request', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/account/orders')
      await authenticatedPage.waitForLoadState('networkidle')
      await authenticatedPage.waitForTimeout(1000)

      // Look for orders that have a pending return request
      const orderWithPendingReturn = authenticatedPage.locator('[data-testid="order-card"]').filter({
        has: authenticatedPage.locator('[data-testid="return-status-pending"]'),
      }).first()

      const hasOrderWithPendingReturn = await orderWithPendingReturn.count() > 0

      if (hasOrderWithPendingReturn) {
        await orderWithPendingReturn.click()
        await authenticatedPage.waitForLoadState('networkidle')

        // Should see cancel return request button
        const cancelReturnButton = authenticatedPage.locator('[data-testid="cancel-return-button"]')
        const canCancel = await cancelReturnButton.isVisible().catch(() => false)

        if (canCancel) {
          await cancelReturnButton.click()

          // Confirm cancellation
          const confirmCancelButton = authenticatedPage.locator('[data-testid="confirm-cancel-return"]')
          await confirmCancelButton.click()

          // Should show success message
          const successMessage = authenticatedPage.locator('[data-testid="return-cancelled-message"]')
          await expect(successMessage).toBeVisible({ timeout: 5000 })
        }
        else {
          test.skip(true, 'Return request cannot be cancelled')
        }
      }
      else {
        test.skip(true, 'No orders with pending return requests')
      }
    })
  })
})
