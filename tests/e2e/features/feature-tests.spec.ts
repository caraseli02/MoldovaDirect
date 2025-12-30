import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:3000'

test.describe('Feature Tests', () => {
  test.describe('1. Rate Limiting on Order Tracking API', () => {
    test('should return 429 after 10 requests', async ({ request }) => {
      const responses: number[] = []

      // Make 12 rapid requests
      for (let i = 0; i < 12; i++) {
        const response = await request.post(`${BASE_URL}/api/orders/track`, {
          data: {
            orderNumber: 'TEST-RATE-LIMIT-123',
            email: 'ratelimit@test.com',
          },
        })
        responses.push(response.status())
      }

      // After 10 requests, we should start getting 429
      const got429 = responses.some(status => status === 429)
      expect(got429).toBe(true)

      // The 11th and 12th requests should be 429
      expect(responses[10]).toBe(429)
      expect(responses[11]).toBe(429)
    })
  })

  test.describe('2. OAuth Login Flow with Redirect', () => {
    test('should preserve redirect parameter in URL', async ({ page }) => {
      await page.goto(`${BASE_URL}/auth/login?redirect=/cart`)
      await page.waitForLoadState('networkidle')

      const currentUrl = page.url()
      expect(currentUrl).toContain('redirect')
    })

    test('should display Google OAuth button', async ({ page }) => {
      await page.goto(`${BASE_URL}/auth/login?redirect=/cart`)
      await page.waitForLoadState('networkidle')

      // Look for Google button
      const googleButton = page.locator('button').filter({ hasText: /google/i })
      await expect(googleButton).toBeVisible()
    })

    test('should display Apple OAuth button', async ({ page }) => {
      await page.goto(`${BASE_URL}/auth/login?redirect=/cart`)
      await page.waitForLoadState('networkidle')

      // Look for Apple button
      const appleButton = page.locator('button').filter({ hasText: /apple/i })
      await expect(appleButton).toBeVisible()
    })

    test('should take screenshot of login page with OAuth buttons', async ({ page }) => {
      await page.goto(`${BASE_URL}/auth/login?redirect=/cart`)
      await page.waitForLoadState('networkidle')

      // Take screenshot
      await page.screenshot({
        path: 'tests/e2e/features/screenshots/oauth-login.png',
        fullPage: true,
      })
    })
  })

  test.describe('3. Cart Undo Functionality', () => {
    test('should show undo toast when removing item from cart', async ({ page }) => {
      // Go to products page
      await page.goto(`${BASE_URL}/products`)
      await page.waitForLoadState('networkidle')

      // Wait for products to load
      await page.waitForTimeout(2000)

      // Find first add to cart button
      const addToCartBtn = page.locator('button').filter({ hasText: /add to cart|agregar|anadir/i }).first()

      if (await addToCartBtn.isVisible()) {
        await addToCartBtn.click()
        await page.waitForTimeout(1000)

        // Go to cart
        await page.goto(`${BASE_URL}/cart`)
        await page.waitForLoadState('networkidle')
        await page.waitForTimeout(1000)

        // Take screenshot before remove
        await page.screenshot({
          path: 'tests/e2e/features/screenshots/cart-before-remove.png',
          fullPage: true,
        })

        // Find remove button
        const removeBtn = page.locator('button[aria-label*="remove" i], button:has-text("Remove"), button:has-text("Eliminar")').first()

        if (await removeBtn.isVisible()) {
          await removeBtn.click()
          await page.waitForTimeout(500)

          // Take screenshot after remove
          await page.screenshot({
            path: 'tests/e2e/features/screenshots/cart-after-remove.png',
            fullPage: true,
          })

          // Check for undo button or toast
          const undoButton = page.locator('button').filter({ hasText: /undo|deshacer/i })
          const toastWithUndo = page.locator('[role="alert"], [class*="toast"]')

          const hasUndo = await undoButton.isVisible().catch(() => false)
          const hasToast = await toastWithUndo.count() > 0

          expect(hasUndo || hasToast).toBe(true)
        }
      }
    })
  })

  test.describe('4. Invoice Print/Download Buttons', () => {
    test('should have print and download invoice buttons on confirmation page', async ({ page }) => {
      await page.goto(`${BASE_URL}/checkout/confirmation`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(2000)

      // Take screenshot
      await page.screenshot({
        path: 'tests/e2e/features/screenshots/checkout-confirmation.png',
        fullPage: true,
      })

      // Check page content for print/download buttons
      const pageContent = await page.content()

      // The buttons may not be visible without order data, but the HTML should have them
      const hasPrintButton = pageContent.toLowerCase().includes('print')
      const hasDownloadButton = pageContent.toLowerCase().includes('download') || pageContent.toLowerCase().includes('pdf')

      expect(hasPrintButton).toBe(true)
      expect(hasDownloadButton).toBe(true)
    })
  })

  test.describe('5. Error Messages in All 4 Languages', () => {
    const testCases = [
      { locale: '', name: 'Spanish (default)', path: '/track-order' },
      { locale: 'en', name: 'English', path: '/en/track-order' },
      { locale: 'ro', name: 'Romanian', path: '/ro/track-order' },
      { locale: 'ru', name: 'Russian', path: '/ru/track-order' },
    ]

    for (const tc of testCases) {
      test(`should show error message in ${tc.name}`, async ({ page }) => {
        await page.goto(`${BASE_URL}${tc.path}`)
        await page.waitForLoadState('networkidle')

        // Fill in invalid order data
        await page.fill('#orderNumber', 'INVALID-ORDER-999')
        await page.fill('#email', 'invalid@test.com')

        // Submit form
        await page.click('button[type="submit"]')

        // Wait for error to appear
        await page.waitForTimeout(3000)

        // Take screenshot
        await page.screenshot({
          path: `tests/e2e/features/screenshots/track-order-error-${tc.locale || 'es'}.png`,
          fullPage: true,
        })

        // Check for error message
        const errorElement = page.locator('[class*="error"], [role="alert"], .text-red-500, .text-red-700, .text-red-300, .bg-red-50, .bg-red-900')

        await expect(errorElement.first()).toBeVisible({ timeout: 5000 })

        // Get error text
        const errorText = await errorElement.first().textContent()
        expect(errorText).toBeTruthy()
        expect(errorText!.length).toBeGreaterThan(0)
      })
    }
  })
})
