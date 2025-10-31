import { test, expect } from '@playwright/test'

/**
 * Account Pages - Visual Regression Tests
 *
 * These tests capture screenshots of all account management pages to detect visual regressions.
 * High priority pages for authenticated user experience.
 */

test.describe('Account Pages - Visual Tests', () => {
  // Helper function to wait for page load
  const waitForPageLoad = async (page) => {
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000) // Additional wait for animations/dynamic content
  }

  // Helper function to login (simple approach for visual tests)
  const loginUser = async (page) => {
    await page.goto('/auth/login')
    await waitForPageLoad(page)

    // Try to fill in login form if it exists
    const emailInput = page.locator('input[type="email"], input[name="email"], [data-testid="email-input"]')
    const passwordInput = page.locator('input[type="password"], input[name="password"], [data-testid="password-input"]')
    const loginButton = page.locator('button[type="submit"], [data-testid="login-button"]').first()

    if (await emailInput.isVisible().catch(() => false)) {
      await emailInput.fill('test@example.com')
      await passwordInput.fill('testpassword123')
      await loginButton.click()
      await page.waitForTimeout(2000) // Wait for login to complete
    }
  }

  test.describe('Account Dashboard', () => {
    test('should match account dashboard layout @visual', async ({ page }) => {
      await loginUser(page)
      await page.goto('/account')
      await waitForPageLoad(page)

      await expect(page).toHaveScreenshot('account-dashboard-full.png', {
        fullPage: true,
        animations: 'disabled',
        mask: [
          page.locator('[data-testid="user-email"]').or(page.locator('.user-email')),
          page.locator('[data-testid="last-login"]'),
          page.locator('[data-testid="member-since"]'),
        ],
      })
    })

    test('should match account dashboard on mobile @visual', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await loginUser(page)
      await page.goto('/account')
      await waitForPageLoad(page)

      await expect(page).toHaveScreenshot('account-dashboard-mobile.png', {
        fullPage: true,
        animations: 'disabled',
      })
    })
  })

  test.describe('Account Profile', () => {
    test('should match profile settings page layout @visual', async ({ page }) => {
      await loginUser(page)
      await page.goto('/account/profile')
      await waitForPageLoad(page)

      await expect(page).toHaveScreenshot('account-profile-full.png', {
        fullPage: true,
        animations: 'disabled',
        mask: [
          page.locator('input[type="email"]').or(page.locator('[data-testid="email-input"]')),
          page.locator('[data-testid="user-name"]'),
          page.locator('[data-testid="avatar"]').or(page.locator('.avatar')),
        ],
      })
    })

    test('should match profile page on mobile @visual', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await loginUser(page)
      await page.goto('/account/profile')
      await waitForPageLoad(page)

      await expect(page).toHaveScreenshot('account-profile-mobile.png', {
        fullPage: true,
        animations: 'disabled',
      })
    })

    test('should match profile page with address section @visual', async ({ page }) => {
      await loginUser(page)
      await page.goto('/account/profile')
      await waitForPageLoad(page)

      // Scroll to addresses section
      const addressSection = page.locator('h2:has-text("Address"), h3:has-text("Address")').first()
      if (await addressSection.isVisible().catch(() => false)) {
        await addressSection.scrollIntoViewIfNeeded()
        await page.waitForTimeout(500)

        await expect(page).toHaveScreenshot('account-profile-addresses.png', {
          fullPage: true,
          animations: 'disabled',
        })
      }
    })
  })

  test.describe('Account Orders', () => {
    test('should match orders list page layout @visual', async ({ page }) => {
      await loginUser(page)
      await page.goto('/account/orders')
      await waitForPageLoad(page)

      await expect(page).toHaveScreenshot('account-orders-list-full.png', {
        fullPage: true,
        animations: 'disabled',
        mask: [
          page.locator('[data-testid="order-date"]'),
          page.locator('[data-testid="order-number"]'),
          page.locator('.order-timestamp'),
        ],
      })
    })

    test('should match order detail page layout @visual', async ({ page }) => {
      await loginUser(page)
      await page.goto('/account/orders')
      await waitForPageLoad(page)

      // Try to click first order link, if it exists
      const firstOrderLink = page.locator('[data-testid^="order-"], a[href*="/account/orders/"]').first()
      if (await firstOrderLink.isVisible().catch(() => false)) {
        await firstOrderLink.click()
        await waitForPageLoad(page)

        await expect(page).toHaveScreenshot('account-order-detail-full.png', {
          fullPage: true,
          animations: 'disabled',
          mask: [
            page.locator('[data-testid="order-date"]'),
            page.locator('[data-testid="order-number"]'),
            page.locator('[data-testid="tracking-number"]'),
          ],
        })
      }
    })

    test('should match empty orders state @visual', async ({ page }) => {
      await loginUser(page)
      await page.goto('/account/orders')
      await waitForPageLoad(page)

      // If there's an empty state message, capture it
      const emptyState = page.locator('text=No orders, text=You haven\'t placed any orders')
      if (await emptyState.isVisible().catch(() => false)) {
        await expect(page).toHaveScreenshot('account-orders-empty.png', {
          fullPage: true,
          animations: 'disabled',
        })
      }
    })
  })

  test.describe('Account Security', () => {
    test('should match security/MFA settings page layout @visual', async ({ page }) => {
      await loginUser(page)
      await page.goto('/account/security/mfa')
      await waitForPageLoad(page)

      await expect(page).toHaveScreenshot('account-security-mfa-full.png', {
        fullPage: true,
        animations: 'disabled',
        mask: [
          page.locator('[data-testid="qr-code"]').or(page.locator('.qr-code')),
          page.locator('[data-testid="backup-codes"]'),
        ],
      })
    })

    test('should match MFA page on mobile @visual', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await loginUser(page)
      await page.goto('/account/security/mfa')
      await waitForPageLoad(page)

      await expect(page).toHaveScreenshot('account-security-mfa-mobile.png', {
        fullPage: true,
        animations: 'disabled',
      })
    })
  })

  test.describe('Responsive - Account Tablet Views', () => {
    test('should match account dashboard on tablet @visual', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })
      await loginUser(page)
      await page.goto('/account')
      await waitForPageLoad(page)

      await expect(page).toHaveScreenshot('account-dashboard-tablet.png', {
        fullPage: true,
        animations: 'disabled',
      })
    })

    test('should match profile page on tablet @visual', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })
      await loginUser(page)
      await page.goto('/account/profile')
      await waitForPageLoad(page)

      await expect(page).toHaveScreenshot('account-profile-tablet.png', {
        fullPage: true,
        animations: 'disabled',
      })
    })
  })
})
