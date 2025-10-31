import { test, expect } from '../fixtures/base'
import { TestHelpers } from '../fixtures/helpers'

/**
 * Admin Pages - Visual Regression Tests
 *
 * These tests capture screenshots of all admin pages to detect visual regressions.
 * High priority pages for admin interface testing.
 */

test.describe('Admin Pages - Visual Tests', () => {
  let helpers: TestHelpers

  test.beforeEach(async ({ adminPage }) => {
    helpers = new TestHelpers(adminPage)
  })

  test.describe('Admin Dashboard and Overview', () => {
    test('should match admin dashboard layout @visual', async ({ adminPage }) => {
      await adminPage.goto('/admin')
      await helpers.waitForPageLoad()

      await expect(adminPage).toHaveScreenshot('admin-dashboard-full.png', {
        fullPage: true,
        animations: 'disabled',
        mask: [
          adminPage.locator('[data-testid="dynamic-stats"]').or(adminPage.locator('.animate-pulse')),
          adminPage.locator('[data-testid="last-updated"]'),
        ],
      })
    })

    test('should match admin dashboard on mobile @visual', async ({ adminPage }) => {
      await adminPage.setViewportSize({ width: 375, height: 667 })
      await adminPage.goto('/admin')
      await helpers.waitForPageLoad()

      await expect(adminPage).toHaveScreenshot('admin-dashboard-mobile.png', {
        fullPage: true,
        animations: 'disabled',
      })
    })
  })

  test.describe('Admin Analytics', () => {
    test('should match analytics dashboard layout @visual', async ({ adminPage }) => {
      await adminPage.goto('/admin/analytics')
      await helpers.waitForPageLoad()

      await expect(adminPage).toHaveScreenshot('admin-analytics-full.png', {
        fullPage: true,
        animations: 'disabled',
        mask: [
          adminPage.locator('[data-testid="chart"]').or(adminPage.locator('canvas')),
          adminPage.locator('[data-testid="real-time-data"]'),
        ],
      })
    })
  })

  test.describe('Admin Orders', () => {
    test('should match orders list page layout @visual', async ({ adminPage }) => {
      await adminPage.goto('/admin/orders')
      await helpers.waitForPageLoad()

      await expect(adminPage).toHaveScreenshot('admin-orders-list-full.png', {
        fullPage: true,
        animations: 'disabled',
        mask: [
          adminPage.locator('[data-testid="order-timestamp"]'),
          adminPage.locator('.relative-time'),
        ],
      })
    })

    test('should match order detail page layout @visual', async ({ adminPage }) => {
      // Navigate to orders list first
      await adminPage.goto('/admin/orders')
      await helpers.waitForPageLoad()

      // Try to click first order link, if it exists
      const firstOrderLink = adminPage.locator('table tbody tr td:first-child a').first()
      if (await firstOrderLink.isVisible().catch(() => false)) {
        await firstOrderLink.click()
        await helpers.waitForPageLoad()

        await expect(adminPage).toHaveScreenshot('admin-order-detail-full.png', {
          fullPage: true,
          animations: 'disabled',
          mask: [
            adminPage.locator('[data-testid="order-timestamp"]'),
            adminPage.locator('[data-testid="order-number"]'),
          ],
        })
      }
    })

    test('should match order analytics page layout @visual', async ({ adminPage }) => {
      await adminPage.goto('/admin/orders/analytics')
      await helpers.waitForPageLoad()

      await expect(adminPage).toHaveScreenshot('admin-order-analytics-full.png', {
        fullPage: true,
        animations: 'disabled',
        mask: [
          adminPage.locator('canvas').or(adminPage.locator('[data-testid="chart"]')),
          adminPage.locator('[data-testid="real-time-data"]'),
        ],
      })
    })
  })

  test.describe('Admin Products', () => {
    test('should match products list page layout @visual', async ({ adminPage }) => {
      await adminPage.goto('/admin/products')
      await helpers.waitForPageLoad()

      await expect(adminPage).toHaveScreenshot('admin-products-list-full.png', {
        fullPage: true,
        animations: 'disabled',
      })
    })

    test('should match new product page layout @visual', async ({ adminPage }) => {
      await adminPage.goto('/admin/products/new')
      await helpers.waitForPageLoad()

      await expect(adminPage).toHaveScreenshot('admin-product-new-full.png', {
        fullPage: true,
        animations: 'disabled',
      })
    })

    test('should match edit product page layout @visual', async ({ adminPage }) => {
      // Navigate to products list first
      await adminPage.goto('/admin/products')
      await helpers.waitForPageLoad()

      // Try to click first product edit link, if it exists
      const firstProductLink = adminPage.locator('[data-testid^="edit-product-"]').first()
      if (await firstProductLink.isVisible().catch(() => false)) {
        await firstProductLink.click()
        await helpers.waitForPageLoad()

        await expect(adminPage).toHaveScreenshot('admin-product-edit-full.png', {
          fullPage: true,
          animations: 'disabled',
        })
      }
    })
  })

  test.describe('Admin Inventory', () => {
    test('should match inventory page layout @visual', async ({ adminPage }) => {
      await adminPage.goto('/admin/inventory')
      await helpers.waitForPageLoad()

      await expect(adminPage).toHaveScreenshot('admin-inventory-full.png', {
        fullPage: true,
        animations: 'disabled',
        mask: [
          adminPage.locator('[data-testid="stock-level"]').or(adminPage.locator('.stock-badge')),
          adminPage.locator('[data-testid="last-updated"]'),
        ],
      })
    })
  })

  test.describe('Admin Users', () => {
    test('should match users list page layout @visual', async ({ adminPage }) => {
      await adminPage.goto('/admin/users')
      await helpers.waitForPageLoad()

      await expect(adminPage).toHaveScreenshot('admin-users-list-full.png', {
        fullPage: true,
        animations: 'disabled',
        mask: [
          adminPage.locator('[data-testid="user-last-login"]'),
          adminPage.locator('[data-testid="user-joined"]'),
        ],
      })
    })
  })

  test.describe('Admin Email Management', () => {
    test('should match email templates page layout @visual', async ({ adminPage }) => {
      await adminPage.goto('/admin/email-templates')
      await helpers.waitForPageLoad()

      await expect(adminPage).toHaveScreenshot('admin-email-templates-full.png', {
        fullPage: true,
        animations: 'disabled',
      })
    })

    test('should match email logs page layout @visual', async ({ adminPage }) => {
      await adminPage.goto('/admin/email-logs')
      await helpers.waitForPageLoad()

      await expect(adminPage).toHaveScreenshot('admin-email-logs-full.png', {
        fullPage: true,
        animations: 'disabled',
        mask: [
          adminPage.locator('[data-testid="email-timestamp"]'),
          adminPage.locator('[data-testid="email-sent-at"]'),
        ],
      })
    })

    test('should match email testing tools page layout @visual', async ({ adminPage }) => {
      await adminPage.goto('/admin/tools/email-testing')
      await helpers.waitForPageLoad()

      await expect(adminPage).toHaveScreenshot('admin-email-testing-full.png', {
        fullPage: true,
        animations: 'disabled',
      })
    })
  })

  test.describe('Admin Development Tools', () => {
    test('should match seed orders page layout @visual', async ({ adminPage }) => {
      await adminPage.goto('/admin/seed-orders')
      await helpers.waitForPageLoad()

      await expect(adminPage).toHaveScreenshot('admin-seed-orders-full.png', {
        fullPage: true,
        animations: 'disabled',
      })
    })
  })

  test.describe('Responsive - Admin Mobile Views', () => {
    test('should match admin orders on mobile @visual', async ({ adminPage }) => {
      await adminPage.setViewportSize({ width: 375, height: 667 })
      await adminPage.goto('/admin/orders')
      await helpers.waitForPageLoad()

      await expect(adminPage).toHaveScreenshot('admin-orders-mobile.png', {
        fullPage: true,
        animations: 'disabled',
      })
    })

    test('should match admin products on mobile @visual', async ({ adminPage }) => {
      await adminPage.setViewportSize({ width: 375, height: 667 })
      await adminPage.goto('/admin/products')
      await helpers.waitForPageLoad()

      await expect(adminPage).toHaveScreenshot('admin-products-mobile.png', {
        fullPage: true,
        animations: 'disabled',
      })
    })
  })
})
