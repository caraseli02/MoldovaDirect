import { test, expect } from '../fixtures/base'
import { TestHelpers } from '../fixtures/helpers'

/**
 * Account Pages - Visual Regression Tests
 *
 * These tests capture screenshots of all account management pages to detect visual regressions.
 * High priority pages for authenticated user experience.
 */

test.describe('Account Pages - Visual Tests', () => {
  let helpers: TestHelpers

  test.beforeEach(async ({ authenticatedPage }) => {
    helpers = new TestHelpers(authenticatedPage)
  })

  test.describe('Account Dashboard', () => {
    test('should match account dashboard layout @visual', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/account')
      await helpers.waitForPageLoad()

      await expect(authenticatedPage).toHaveScreenshot('account-dashboard-full.png', {
        fullPage: true,
        animations: 'disabled',
        mask: [
          authenticatedPage.locator('[data-testid="user-email"]').or(authenticatedPage.locator('.user-email')),
          authenticatedPage.locator('[data-testid="last-login"]'),
          authenticatedPage.locator('[data-testid="member-since"]'),
        ],
      })
    })

    test('should match account dashboard on mobile @visual', async ({ authenticatedPage }) => {
      await authenticatedPage.setViewportSize({ width: 375, height: 667 })
      await authenticatedPage.goto('/account')
      await helpers.waitForPageLoad()

      await expect(authenticatedPage).toHaveScreenshot('account-dashboard-mobile.png', {
        fullPage: true,
        animations: 'disabled',
      })
    })
  })

  test.describe('Account Profile', () => {
    test('should match profile settings page layout @visual', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/account/profile')
      await helpers.waitForPageLoad()

      await expect(authenticatedPage).toHaveScreenshot('account-profile-full.png', {
        fullPage: true,
        animations: 'disabled',
        mask: [
          authenticatedPage.locator('input[type="email"]').or(authenticatedPage.locator('[data-testid="email-input"]')),
          authenticatedPage.locator('[data-testid="user-name"]'),
          authenticatedPage.locator('[data-testid="avatar"]').or(authenticatedPage.locator('.avatar')),
        ],
      })
    })

    test('should match profile page on mobile @visual', async ({ authenticatedPage }) => {
      await authenticatedPage.setViewportSize({ width: 375, height: 667 })
      await authenticatedPage.goto('/account/profile')
      await helpers.waitForPageLoad()

      await expect(authenticatedPage).toHaveScreenshot('account-profile-mobile.png', {
        fullPage: true,
        animations: 'disabled',
      })
    })

    test('should match profile page with address section @visual', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/account/profile')
      await helpers.waitForPageLoad()

      // Scroll to addresses section
      const addressSection = authenticatedPage.locator('h2:has-text("Address"), h3:has-text("Address")').first()
      if (await addressSection.isVisible().catch(() => false)) {
        await addressSection.scrollIntoViewIfNeeded()
        await authenticatedPage.waitForTimeout(500)

        await expect(authenticatedPage).toHaveScreenshot('account-profile-addresses.png', {
          fullPage: true,
          animations: 'disabled',
        })
      }
    })
  })

  test.describe('Account Orders', () => {
    test('should match orders list page layout @visual', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/account/orders')
      await helpers.waitForPageLoad()

      await expect(authenticatedPage).toHaveScreenshot('account-orders-list-full.png', {
        fullPage: true,
        animations: 'disabled',
        mask: [
          authenticatedPage.locator('[data-testid="order-date"]'),
          authenticatedPage.locator('[data-testid="order-number"]'),
          authenticatedPage.locator('.order-timestamp'),
        ],
      })
    })

    test('should match order detail page layout @visual', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/account/orders')
      await helpers.waitForPageLoad()

      // Try to click first order link, if it exists
      const firstOrderLink = authenticatedPage.locator('[data-testid^="order-"], a[href*="/account/orders/"]').first()
      if (await firstOrderLink.isVisible().catch(() => false)) {
        await firstOrderLink.click()
        await helpers.waitForPageLoad()

        await expect(authenticatedPage).toHaveScreenshot('account-order-detail-full.png', {
          fullPage: true,
          animations: 'disabled',
          mask: [
            authenticatedPage.locator('[data-testid="order-date"]'),
            authenticatedPage.locator('[data-testid="order-number"]'),
            authenticatedPage.locator('[data-testid="tracking-number"]'),
          ],
        })
      }
    })

    test('should match empty orders state @visual', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/account/orders')
      await helpers.waitForPageLoad()

      // If there's an empty state message, capture it
      const emptyState = authenticatedPage.locator('text=No orders, text=You haven\'t placed any orders')
      if (await emptyState.isVisible().catch(() => false)) {
        await expect(authenticatedPage).toHaveScreenshot('account-orders-empty.png', {
          fullPage: true,
          animations: 'disabled',
        })
      }
    })
  })

  test.describe('Account Security', () => {
    test('should match security/MFA settings page layout @visual', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/account/security/mfa')
      await helpers.waitForPageLoad()

      await expect(authenticatedPage).toHaveScreenshot('account-security-mfa-full.png', {
        fullPage: true,
        animations: 'disabled',
        mask: [
          authenticatedPage.locator('[data-testid="qr-code"]').or(authenticatedPage.locator('.qr-code')),
          authenticatedPage.locator('[data-testid="backup-codes"]'),
        ],
      })
    })

    test('should match MFA page on mobile @visual', async ({ authenticatedPage }) => {
      await authenticatedPage.setViewportSize({ width: 375, height: 667 })
      await authenticatedPage.goto('/account/security/mfa')
      await helpers.waitForPageLoad()

      await expect(authenticatedPage).toHaveScreenshot('account-security-mfa-mobile.png', {
        fullPage: true,
        animations: 'disabled',
      })
    })
  })

  test.describe('Responsive - Account Tablet Views', () => {
    test('should match account dashboard on tablet @visual', async ({ authenticatedPage }) => {
      await authenticatedPage.setViewportSize({ width: 768, height: 1024 })
      await authenticatedPage.goto('/account')
      await helpers.waitForPageLoad()

      await expect(authenticatedPage).toHaveScreenshot('account-dashboard-tablet.png', {
        fullPage: true,
        animations: 'disabled',
      })
    })

    test('should match profile page on tablet @visual', async ({ authenticatedPage }) => {
      await authenticatedPage.setViewportSize({ width: 768, height: 1024 })
      await authenticatedPage.goto('/account/profile')
      await helpers.waitForPageLoad()

      await expect(authenticatedPage).toHaveScreenshot('account-profile-tablet.png', {
        fullPage: true,
        animations: 'disabled',
      })
    })
  })
})
