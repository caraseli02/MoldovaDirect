import { test, expect } from '@playwright/test'
import { SELECTORS, TIMEOUTS, URL_PATTERNS } from './critical/constants'

test.describe('Product Detail Page', () => {
  // Test data - using first product logic similar to critical tests

  test.beforeEach(async ({ page }) => {
    // Navigate to products page first to get a valid link
    await page.goto('/products')
    await page.waitForSelector(SELECTORS.PRODUCT_CARD, { state: 'visible', timeout: TIMEOUTS.LONG })
    // Click the first product
    await page.locator(SELECTORS.PRODUCT_CARD).first().click()
    await page.waitForURL(URL_PATTERNS.PRODUCT_DETAIL)
    await page.waitForLoadState('domcontentloaded')
  })

  test('should display product information correctly', async ({ page }) => {
    // Title
    const title = page.locator('h1, h2, h3, [data-testid="product-title"]').first()
    await expect(title).toBeVisible()

    // Price - checking for typical price formats like €10.00
    const price = page.locator('text=/€\\d+/').first()
    await expect(price).toBeVisible()

    // Description is present
    const description = page.locator('.prose, [data-testid="product-description"]').first()
    await expect(description).toBeVisible()
  })

  test('should allow quantity selection', async ({ page }) => {
    // Quantity stock status check first
    const addToCartBtn = page.locator(SELECTORS.ADD_TO_CART).or(page.locator('[data-testid="add-to-cart-button"]')).first()
    if (await addToCartBtn.isDisabled()) {
      console.log('Product out of stock, skipping quantity test')
      return
    }

    // Find quantity selector (Combobox/Select trigger) - shadcn select
    const trigger = page.locator('button[role="combobox"]').first()

    // Check if visible and enabled
    if (await trigger.isVisible() && await trigger.isEnabled()) {
      // Click trigger
      await trigger.click()

      // Wait for the popover content
      // ShadCN select content usually has role="listbox" or "dialog" or just inside a portal
      // We look for options
      const options = page.locator('[role="option"]')
      await options.first().waitFor({ state: 'visible', timeout: TIMEOUTS.SHORT })

      // Click the second option (quantity 2)
      await options.nth(1).click()

      // Verify value
      await expect(trigger).toContainText('2')
    }
    else {
      console.log('Quantity selector not visible or enabled')
    }
  })

  test('should allow adding to cart', async ({ page }) => {
    const addToCartBtn = page.locator(SELECTORS.ADD_TO_CART).or(page.locator('[data-testid="add-to-cart-button"]')).first()

    if (await addToCartBtn.isDisabled()) {
      console.log('Product out of stock, skipping add to cart test')
      return
    }

    await addToCartBtn.click()

    // Expect toast or cart count update
    // Checking for text "In Cart" or button state change if logic exists
    // OR check global cart counter

    // The current logic changes button text to "In Cart"
    await expect(addToCartBtn).toContainText(/In Cart|En el carrito/i, { timeout: TIMEOUTS.STANDARD })
  })

  test('should display related products', async ({ page }) => {
    // Scroll down to related products
    const relatedSection = page.locator('text=Related Products, Productos relacionados').first()
    if (await relatedSection.visible) { // might not exist for all products
      await relatedSection.scrollIntoViewIfNeeded()
      await expect(page.locator(SELECTORS.PRODUCT_CARD).filter({ hasText: 'Related' })).not.toHaveCount(0)
    }
  })

  test('should show sticky functionality on mobile', async ({ page }) => {
    // Set viewport to mobile
    await page.setViewportSize({ width: 375, height: 667 })

    // Scroll down a bit
    await page.evaluate(() => window.scrollTo(0, 500))

    // Check for sticky bar at bottom
    // Based on [slug].vue: class="fixed left-0 right-0 z-50 ... lg:hidden" style="bottom: 64px"
    const mobileBar = page.locator('.fixed.left-0.right-0.lg\\:hidden').first()
    await expect(mobileBar).toBeVisible()

    // Restore viewport
    await page.setViewportSize({ width: 1280, height: 720 })
  })

  test('should toggle accordion sections', async ({ page }) => {
    // Look for details/summary tags which are used currently in [slug].vue
    // <details v-for="item in faqItems" ...>
    const summary = page.locator('summary').first()
    if (await summary.count() > 0) {
      const details = page.locator('details').first()
      const isOpenInitial = await details.getAttribute('open')

      await summary.click()

      // Wait a bit or check attribute
      const isOpenAfter = await details.getAttribute('open')
      expect(isOpenAfter).not.toBe(isOpenInitial)
    }
  })
})
