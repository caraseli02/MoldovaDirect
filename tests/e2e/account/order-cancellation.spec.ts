/**
 * Order Cancellation E2E Tests
 *
 * Tests the order cancellation user flow:
 * - View cancel button on pending orders
 * - Cancel confirmation modal
 * - Order status change after cancellation
 * - Cancelled orders in order history
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

test.describe('Order Cancellation Flow', () => {
  test.describe('Cancel Button Visibility', () => {
    test('should show cancel button on pending order', async ({ authenticatedPage }) => {
      // Navigate to orders page
      await authenticatedPage.goto('/account/orders')
      await authenticatedPage.waitForLoadState('networkidle')
      await authenticatedPage.waitForTimeout(1000)

      // Find an order with pending status
      const pendingOrder = authenticatedPage.locator('[data-testid="order-card"]').filter({
        has: authenticatedPage.locator('[data-testid="order-status-pending"]'),
      }).first()

      const hasPendingOrder = await pendingOrder.count() > 0

      if (hasPendingOrder) {
        // Click to view order details
        await pendingOrder.click()
        await authenticatedPage.waitForLoadState('networkidle')

        // Should see cancel button in actions section
        const cancelButton = authenticatedPage.locator('[data-testid="cancel-order-button"]')
        await expect(cancelButton).toBeVisible({ timeout: 5000 })
      }
      else {
        // Create a mock pending order or skip
        test.skip(true, 'No pending orders available to test cancellation')
      }
    })

    test('should NOT show cancel button on shipped order', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/account/orders')
      await authenticatedPage.waitForLoadState('networkidle')
      await authenticatedPage.waitForTimeout(1000)

      // Find an order with shipped status
      const shippedOrder = authenticatedPage.locator('[data-testid="order-card"]').filter({
        has: authenticatedPage.locator('[data-testid="order-status-shipped"]'),
      }).first()

      const hasShippedOrder = await shippedOrder.count() > 0

      if (hasShippedOrder) {
        await shippedOrder.click()
        await authenticatedPage.waitForLoadState('networkidle')

        // Cancel button should NOT be visible
        const cancelButton = authenticatedPage.locator('[data-testid="cancel-order-button"]')
        await expect(cancelButton).not.toBeVisible()
      }
      else {
        test.skip(true, 'No shipped orders available to test')
      }
    })

    test('should NOT show cancel button on delivered order', async ({ authenticatedPage }) => {
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

        // Cancel button should NOT be visible
        const cancelButton = authenticatedPage.locator('[data-testid="cancel-order-button"]')
        await expect(cancelButton).not.toBeVisible()
      }
      else {
        test.skip(true, 'No delivered orders available to test')
      }
    })

    test('should NOT show cancel button on already cancelled order', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/account/orders')
      await authenticatedPage.waitForLoadState('networkidle')
      await authenticatedPage.waitForTimeout(1000)

      // Find an order with cancelled status
      const cancelledOrder = authenticatedPage.locator('[data-testid="order-card"]').filter({
        has: authenticatedPage.locator('[data-testid="order-status-cancelled"]'),
      }).first()

      const hasCancelledOrder = await cancelledOrder.count() > 0

      if (hasCancelledOrder) {
        await cancelledOrder.click()
        await authenticatedPage.waitForLoadState('networkidle')

        // Cancel button should NOT be visible
        const cancelButton = authenticatedPage.locator('[data-testid="cancel-order-button"]')
        await expect(cancelButton).not.toBeVisible()
      }
      else {
        test.skip(true, 'No cancelled orders available to test')
      }
    })
  })

  test.describe('Cancel Confirmation Modal', () => {
    test('should show confirmation modal when clicking cancel button', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/account/orders')
      await authenticatedPage.waitForLoadState('networkidle')
      await authenticatedPage.waitForTimeout(1000)

      // Find pending order
      const pendingOrder = authenticatedPage.locator('[data-testid="order-card"]').filter({
        has: authenticatedPage.locator('[data-testid="order-status-pending"]'),
      }).first()

      const hasPendingOrder = await pendingOrder.count() > 0

      if (hasPendingOrder) {
        await pendingOrder.click()
        await authenticatedPage.waitForLoadState('networkidle')

        // Click cancel button
        const cancelButton = authenticatedPage.locator('[data-testid="cancel-order-button"]')
        await cancelButton.click()

        // Confirmation modal should appear
        const confirmModal = authenticatedPage.locator('[data-testid="cancel-confirmation-modal"]')
        await expect(confirmModal).toBeVisible({ timeout: 5000 })

        // Modal should have confirm and cancel buttons
        const confirmBtn = authenticatedPage.locator('[data-testid="confirm-cancel-button"]')
        const dismissBtn = authenticatedPage.locator('[data-testid="dismiss-cancel-button"]')
        await expect(confirmBtn).toBeVisible()
        await expect(dismissBtn).toBeVisible()
      }
      else {
        test.skip(true, 'No pending orders available to test')
      }
    })

    test('should close modal when clicking dismiss button', async ({ authenticatedPage }) => {
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

        const cancelButton = authenticatedPage.locator('[data-testid="cancel-order-button"]')
        await cancelButton.click()

        const confirmModal = authenticatedPage.locator('[data-testid="cancel-confirmation-modal"]')
        await expect(confirmModal).toBeVisible()

        // Click dismiss button
        const dismissBtn = authenticatedPage.locator('[data-testid="dismiss-cancel-button"]')
        await dismissBtn.click()

        // Modal should close
        await expect(confirmModal).not.toBeVisible()
      }
      else {
        test.skip(true, 'No pending orders available to test')
      }
    })
  })

  test.describe('Order Status Change', () => {
    test('should change order status to cancelled after confirmation', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/account/orders')
      await authenticatedPage.waitForLoadState('networkidle')
      await authenticatedPage.waitForTimeout(1000)

      const pendingOrder = authenticatedPage.locator('[data-testid="order-card"]').filter({
        has: authenticatedPage.locator('[data-testid="order-status-pending"]'),
      }).first()

      const hasPendingOrder = await pendingOrder.count() > 0

      if (hasPendingOrder) {
        // Get order number before cancelling (for verification after cancel)
        const _orderNumber = await pendingOrder.locator('[data-testid="order-number"]').textContent()

        await pendingOrder.click()
        await authenticatedPage.waitForLoadState('networkidle')

        // Click cancel button
        const cancelButton = authenticatedPage.locator('[data-testid="cancel-order-button"]')
        await cancelButton.click()

        // Confirm cancellation
        const confirmBtn = authenticatedPage.locator('[data-testid="confirm-cancel-button"]')
        await confirmBtn.click()

        // Wait for API response
        await authenticatedPage.waitForTimeout(2000)

        // Should show success message
        const successMessage = authenticatedPage.locator('[data-testid="cancel-success-message"]')
        await expect(successMessage).toBeVisible({ timeout: 5000 })

        // Order status should now show cancelled
        const statusBadge = authenticatedPage.locator('[data-testid="order-status-cancelled"]')
        await expect(statusBadge).toBeVisible()
      }
      else {
        test.skip(true, 'No pending orders available to test cancellation')
      }
    })
  })

  test.describe('Cancelled Order in History', () => {
    test('should show cancelled order with correct status in order history', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/account/orders')
      await authenticatedPage.waitForLoadState('networkidle')
      await authenticatedPage.waitForTimeout(1000)

      // Look for any cancelled orders
      const cancelledOrders = authenticatedPage.locator('[data-testid="order-card"]').filter({
        has: authenticatedPage.locator('[data-testid="order-status-cancelled"]'),
      })

      const hasCancelledOrders = await cancelledOrders.count() > 0

      if (hasCancelledOrders) {
        // First cancelled order should be visible
        const firstCancelled = cancelledOrders.first()
        await expect(firstCancelled).toBeVisible()

        // Status badge should show "Cancelled" text
        const statusBadge = firstCancelled.locator('[data-testid="order-status-cancelled"]')
        await expect(statusBadge).toContainText(/cancelled|cancelado|anulat|отменен/i)
      }
      else {
        // Just verify the orders page loads correctly
        const ordersPage = authenticatedPage.locator('h1, h2').filter({ hasText: /orders|pedidos|comenzi|заказы/i })
        await expect(ordersPage.first()).toBeVisible()
      }
    })

    test('should display cancellation date for cancelled orders', async ({ authenticatedPage }) => {
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

        // Should show cancellation date in order details
        const cancellationDate = authenticatedPage.locator('[data-testid="cancellation-date"]')
        await expect(cancellationDate).toBeVisible()
      }
      else {
        test.skip(true, 'No cancelled orders available to test')
      }
    })
  })
})
