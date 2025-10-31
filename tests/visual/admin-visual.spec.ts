import { test, expect } from '@playwright/test'

/**
 * Admin Pages - Visual Regression Tests
 *
 * These tests capture screenshots of all admin pages to detect visual regressions.
 * High priority pages for admin interface testing.
 */

test.describe('Admin Pages - Visual Tests', () => {
  // Helper function to wait for page load
  const waitForPageLoad = async (page) => {
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000) // Additional wait for animations/dynamic content
  }

  test.describe('Admin Dashboard and Overview', () => {
    test('should match admin dashboard layout @visual', async ({ page }) => {
      await page.goto('/admin')
      await waitForPageLoad(page)

      await expect(page).toHaveScreenshot('admin-dashboard-full.png', {
        fullPage: true,
        animations: 'disabled',
        mask: [
          page.locator('[data-testid="dynamic-stats"]').or(page.locator('.animate-pulse')),
          page.locator('[data-testid="last-updated"]'),
        ],
      })
    })

    test('should match admin dashboard on mobile @visual', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/admin')
      await waitForPageLoad(page)

      await expect(page).toHaveScreenshot('admin-dashboard-mobile.png', {
        fullPage: true,
        animations: 'disabled',
      })
    })
  })

  test.describe('Admin Analytics', () => {
    test('should match analytics dashboard layout @visual', async ({ page }) => {
      await page.goto('/admin/analytics')
      await waitForPageLoad(page)

      await expect(page).toHaveScreenshot('admin-analytics-full.png', {
        fullPage: true,
        animations: 'disabled',
        mask: [
          page.locator('[data-testid="chart"]').or(page.locator('canvas')),
          page.locator('[data-testid="real-time-data"]'),
        ],
      })
    })
  })

  test.describe('Admin Orders', () => {
    test('should match orders list page layout @visual', async ({ page }) => {
      await page.goto('/admin/orders')
      await waitForPageLoad(page)

      await expect(page).toHaveScreenshot('admin-orders-list-full.png', {
        fullPage: true,
        animations: 'disabled',
        mask: [
          page.locator('[data-testid="order-timestamp"]'),
          page.locator('.relative-time'),
        ],
      })
    })

    test('should match order detail page layout @visual', async ({ page }) => {
      // Navigate to orders list first
      await page.goto('/admin/orders')
      await waitForPageLoad(page)

      // Try to click first order link, if it exists
      const firstOrderLink = page.locator('table tbody tr td:first-child a').first()
      if (await firstOrderLink.isVisible().catch(() => false)) {
        await firstOrderLink.click()
        await waitForPageLoad(page)

        await expect(page).toHaveScreenshot('admin-order-detail-full.png', {
          fullPage: true,
          animations: 'disabled',
          mask: [
            page.locator('[data-testid="order-timestamp"]'),
            page.locator('[data-testid="order-number"]'),
          ],
        })
      }
    })

    test('should match order analytics page layout @visual', async ({ page }) => {
      await page.goto('/admin/orders/analytics')
      await waitForPageLoad(page)

      await expect(page).toHaveScreenshot('admin-order-analytics-full.png', {
        fullPage: true,
        animations: 'disabled',
        mask: [
          page.locator('canvas').or(page.locator('[data-testid="chart"]')),
          page.locator('[data-testid="real-time-data"]'),
        ],
      })
    })
  })

  test.describe('Admin Products', () => {
    test('should match products list page layout @visual', async ({ page }) => {
      await page.goto('/admin/products')
      await waitForPageLoad(page)

      await expect(page).toHaveScreenshot('admin-products-list-full.png', {
        fullPage: true,
        animations: 'disabled',
      })
    })

    test('should match new product page layout @visual', async ({ page }) => {
      await page.goto('/admin/products/new')
      await waitForPageLoad(page)

      await expect(page).toHaveScreenshot('admin-product-new-full.png', {
        fullPage: true,
        animations: 'disabled',
      })
    })

    test('should match edit product page layout @visual', async ({ page }) => {
      // Navigate to products list first
      await page.goto('/admin/products')
      await waitForPageLoad(page)

      // Try to click first product edit link, if it exists
      const firstProductLink = page.locator('[data-testid^="edit-product-"]').first()
      if (await firstProductLink.isVisible().catch(() => false)) {
        await firstProductLink.click()
        await waitForPageLoad(page)

        await expect(page).toHaveScreenshot('admin-product-edit-full.png', {
          fullPage: true,
          animations: 'disabled',
        })
      }
    })
  })

  test.describe('Admin Inventory', () => {
    test('should match inventory page layout @visual', async ({ page }) => {
      await page.goto('/admin/inventory')
      await waitForPageLoad(page)

      await expect(page).toHaveScreenshot('admin-inventory-full.png', {
        fullPage: true,
        animations: 'disabled',
        mask: [
          page.locator('[data-testid="stock-level"]').or(page.locator('.stock-badge')),
          page.locator('[data-testid="last-updated"]'),
        ],
      })
    })
  })

  test.describe('Admin Users', () => {
    test('should match users list page layout @visual', async ({ page }) => {
      await page.goto('/admin/users')
      await waitForPageLoad(page)

      await expect(page).toHaveScreenshot('admin-users-list-full.png', {
        fullPage: true,
        animations: 'disabled',
        mask: [
          page.locator('[data-testid="user-last-login"]'),
          page.locator('[data-testid="user-joined"]'),
        ],
      })
    })
  })

  test.describe('Admin Email Management', () => {
    test('should match email templates page layout @visual', async ({ page }) => {
      await page.goto('/admin/email-templates')
      await waitForPageLoad(page)

      await expect(page).toHaveScreenshot('admin-email-templates-full.png', {
        fullPage: true,
        animations: 'disabled',
      })
    })

    test('should match email logs page layout @visual', async ({ page }) => {
      await page.goto('/admin/email-logs')
      await waitForPageLoad(page)

      await expect(page).toHaveScreenshot('admin-email-logs-full.png', {
        fullPage: true,
        animations: 'disabled',
        mask: [
          page.locator('[data-testid="email-timestamp"]'),
          page.locator('[data-testid="email-sent-at"]'),
        ],
      })
    })

    test('should match email testing tools page layout @visual', async ({ page }) => {
      await page.goto('/admin/tools/email-testing')
      await waitForPageLoad(page)

      await expect(page).toHaveScreenshot('admin-email-testing-full.png', {
        fullPage: true,
        animations: 'disabled',
      })
    })
  })

  test.describe('Admin Development Tools', () => {
    test('should match seed orders page layout @visual', async ({ page }) => {
      await page.goto('/admin/seed-orders')
      await waitForPageLoad(page)

      await expect(page).toHaveScreenshot('admin-seed-orders-full.png', {
        fullPage: true,
        animations: 'disabled',
      })
    })
  })

  test.describe('Responsive - Admin Mobile Views', () => {
    test('should match admin orders on mobile @visual', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/admin/orders')
      await waitForPageLoad(page)

      await expect(page).toHaveScreenshot('admin-orders-mobile.png', {
        fullPage: true,
        animations: 'disabled',
      })
    })

    test('should match admin products on mobile @visual', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/admin/products')
      await waitForPageLoad(page)

      await expect(page).toHaveScreenshot('admin-products-mobile.png', {
        fullPage: true,
        animations: 'disabled',
      })
    })
  })
})
