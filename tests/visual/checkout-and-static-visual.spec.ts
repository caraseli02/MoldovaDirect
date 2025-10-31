import { test, expect } from '@playwright/test'

/**
 * Checkout Steps and Static Pages - Visual Regression Tests
 *
 * These tests capture screenshots of checkout flow steps and static/informational pages
 * to detect visual regressions. High priority for e-commerce functionality.
 */

test.describe('Checkout Steps - Visual Tests', () => {
  // Helper function to wait for page load
  const waitForPageLoad = async (page) => {
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
  }

  // Helper to add item to cart for checkout tests
  const addItemToCart = async (page) => {
    await page.goto('/products')
    await waitForPageLoad(page)

    // Try to add first product to cart
    const addToCartButton = page.locator('[data-testid^="add-to-cart-"], button:has-text("Add to Cart")').first()
    if (await addToCartButton.isVisible().catch(() => false)) {
      await addToCartButton.click()
      await page.waitForTimeout(1000)
    }
  }

  test.describe('Checkout Flow Pages', () => {
    test('should match checkout main page layout @visual', async ({ page }) => {
      await addItemToCart(page)
      await page.goto('/checkout')
      await waitForPageLoad(page)

      await expect(page).toHaveScreenshot('checkout-main-full.png', {
        fullPage: true,
        animations: 'disabled',
        mask: [
          page.locator('[data-testid="cart-items"]'),
          page.locator('[data-testid="cart-total"]'),
        ],
      })
    })

    test('should match checkout payment step layout @visual', async ({ page }) => {
      await addItemToCart(page)
      await page.goto('/checkout/payment')
      await waitForPageLoad(page)

      await expect(page).toHaveScreenshot('checkout-payment-full.png', {
        fullPage: true,
        animations: 'disabled',
      })
    })

    test('should match checkout review step layout @visual', async ({ page }) => {
      await addItemToCart(page)
      await page.goto('/checkout/review')
      await waitForPageLoad(page)

      await expect(page).toHaveScreenshot('checkout-review-full.png', {
        fullPage: true,
        animations: 'disabled',
        mask: [
          page.locator('[data-testid="order-items"]'),
          page.locator('[data-testid="order-total"]'),
        ],
      })
    })

    test('should match checkout confirmation page layout @visual', async ({ page }) => {
      await page.goto('/checkout/confirmation')
      await waitForPageLoad(page)

      await expect(page).toHaveScreenshot('checkout-confirmation-full.png', {
        fullPage: true,
        animations: 'disabled',
        mask: [
          page.locator('[data-testid="order-number"]'),
          page.locator('[data-testid="order-date"]'),
        ],
      })
    })
  })

  test.describe('Checkout Responsive Views', () => {
    test('should match checkout payment on mobile @visual', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await addItemToCart(page)
      await page.goto('/checkout/payment')
      await waitForPageLoad(page)

      await expect(page).toHaveScreenshot('checkout-payment-mobile.png', {
        fullPage: true,
        animations: 'disabled',
      })
    })

    test('should match checkout review on mobile @visual', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await addItemToCart(page)
      await page.goto('/checkout/review')
      await waitForPageLoad(page)

      await expect(page).toHaveScreenshot('checkout-review-mobile.png', {
        fullPage: true,
        animations: 'disabled',
      })
    })
  })
})

test.describe('Order Tracking - Visual Tests', () => {
  const waitForPageLoad = async (page) => {
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
  }

  test('should match order tracking page layout @visual', async ({ page }) => {
    await page.goto('/track-order')
    await waitForPageLoad(page)

    await expect(page).toHaveScreenshot('track-order-full.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })

  test('should match order tracking form @visual', async ({ page }) => {
    await page.goto('/track-order')
    await waitForPageLoad(page)

    // Focus on the form area
    const trackingForm = page.locator('form, [data-testid="tracking-form"]').first()
    if (await trackingForm.isVisible().catch(() => false)) {
      await expect(trackingForm).toHaveScreenshot('track-order-form.png')
    }
  })

  test('should match order tracking on mobile @visual', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/track-order')
    await waitForPageLoad(page)

    await expect(page).toHaveScreenshot('track-order-mobile.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })
})

test.describe('Static/Informational Pages - Visual Tests', () => {
  const waitForPageLoad = async (page) => {
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
  }

  test.describe('Legal Pages', () => {
    test('should match privacy policy page layout @visual', async ({ page }) => {
      await page.goto('/privacy')
      await waitForPageLoad(page)

      await expect(page).toHaveScreenshot('privacy-policy-full.png', {
        fullPage: true,
        animations: 'disabled',
      })
    })

    test('should match terms of service page layout @visual', async ({ page }) => {
      await page.goto('/terms')
      await waitForPageLoad(page)

      await expect(page).toHaveScreenshot('terms-of-service-full.png', {
        fullPage: true,
        animations: 'disabled',
      })
    })
  })

  test.describe('Customer Support Pages', () => {
    test('should match FAQ page layout @visual', async ({ page }) => {
      await page.goto('/faq')
      await waitForPageLoad(page)

      await expect(page).toHaveScreenshot('faq-page-full.png', {
        fullPage: true,
        animations: 'disabled',
      })
    })

    test('should match returns page layout @visual', async ({ page }) => {
      await page.goto('/returns')
      await waitForPageLoad(page)

      await expect(page).toHaveScreenshot('returns-page-full.png', {
        fullPage: true,
        animations: 'disabled',
      })
    })

    test('should match shipping info page layout @visual', async ({ page }) => {
      await page.goto('/shipping')
      await waitForPageLoad(page)

      await expect(page).toHaveScreenshot('shipping-page-full.png', {
        fullPage: true,
        animations: 'disabled',
      })
    })
  })

  test.describe('Static Pages - Mobile Views', () => {
    test('should match privacy policy on mobile @visual', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/privacy')
      await waitForPageLoad(page)

      await expect(page).toHaveScreenshot('privacy-policy-mobile.png', {
        fullPage: true,
        animations: 'disabled',
      })
    })

    test('should match FAQ on mobile @visual', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/faq')
      await waitForPageLoad(page)

      await expect(page).toHaveScreenshot('faq-page-mobile.png', {
        fullPage: true,
        animations: 'disabled',
      })
    })
  })
})

test.describe('Additional Auth Pages - Visual Tests', () => {
  const waitForPageLoad = async (page) => {
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
  }

  test.describe('Auth Flow Pages', () => {
    test('should match forgot password page layout @visual', async ({ page }) => {
      await page.goto('/auth/forgot-password')
      await waitForPageLoad(page)

      await expect(page).toHaveScreenshot('auth-forgot-password-full.png', {
        fullPage: true,
        animations: 'disabled',
      })
    })

    test('should match reset password page layout @visual', async ({ page }) => {
      await page.goto('/auth/reset-password?token=sample-token')
      await waitForPageLoad(page)

      await expect(page).toHaveScreenshot('auth-reset-password-full.png', {
        fullPage: true,
        animations: 'disabled',
      })
    })

    test('should match verify email page layout @visual', async ({ page }) => {
      await page.goto('/auth/verify-email?token=sample-token')
      await waitForPageLoad(page)

      await expect(page).toHaveScreenshot('auth-verify-email-full.png', {
        fullPage: true,
        animations: 'disabled',
      })
    })

    test('should match verification pending page layout @visual', async ({ page }) => {
      await page.goto('/auth/verification-pending?email=test@example.com')
      await waitForPageLoad(page)

      await expect(page).toHaveScreenshot('auth-verification-pending-full.png', {
        fullPage: true,
        animations: 'disabled',
        mask: [
          page.locator('text=/test@example\\.com/'),
        ],
      })
    })

    test('should match MFA verify page layout @visual', async ({ page }) => {
      await page.goto('/auth/mfa-verify')
      await waitForPageLoad(page)

      await expect(page).toHaveScreenshot('auth-mfa-verify-full.png', {
        fullPage: true,
        animations: 'disabled',
      })
    })

    test('should match confirm email page layout @visual', async ({ page }) => {
      await page.goto('/auth/confirm')
      await waitForPageLoad(page)

      await expect(page).toHaveScreenshot('auth-confirm-full.png', {
        fullPage: true,
        animations: 'disabled',
      })
    })
  })

  test.describe('Auth Pages - Mobile Views', () => {
    test('should match forgot password on mobile @visual', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/auth/forgot-password')
      await waitForPageLoad(page)

      await expect(page).toHaveScreenshot('auth-forgot-password-mobile.png', {
        fullPage: true,
        animations: 'disabled',
      })
    })

    test('should match MFA verify on mobile @visual', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/auth/mfa-verify')
      await waitForPageLoad(page)

      await expect(page).toHaveScreenshot('auth-mfa-verify-mobile.png', {
        fullPage: true,
        animations: 'disabled',
      })
    })
  })
})
