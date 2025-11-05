import { test, expect } from '../fixtures/base'

test.describe('User Checkout Flow', () => {
  test.beforeEach(async ({ page, locale }) => {
    // Start from home page
    await page.goto(`/${locale}`)
  })

  test('guest user can browse products and add to cart', async ({ page, locale }) => {
    // Navigate to products
    await page.click('[data-testid="products-link"], a[href*="products"]')

    // Wait for products to load
    await page.waitForSelector('[data-testid="product-card"], .product-item', { timeout: 10000 })

    // Click on first product
    await page.locator('[data-testid="product-card"], .product-item').first().click()

    // Add to cart
    await page.click('[data-testid="add-to-cart"], button:has-text("Add to Cart"), button:has-text("Agregar")')

    // Verify cart updated
    await expect(page.locator('[data-testid="cart-count"], .cart-badge')).toBeVisible()
  })

  test('user can view cart and proceed to checkout', async ({ page, locale }) => {
    // Add a product first (using helper if available)
    await page.goto(`/${locale}/products`)
    await page.waitForSelector('[data-testid="product-card"], .product-item')
    await page.locator('[data-testid="product-card"], .product-item').first().click()
    await page.click('[data-testid="add-to-cart"], button:has-text("Add to Cart"), button:has-text("Agregar")')

    // Go to cart
    await page.click('[data-testid="cart-icon"], a[href*="cart"]')

    // Verify we're on cart page
    await expect(page).toHaveURL(new RegExp(`/${locale}/cart`))

    // Verify cart has items
    await expect(page.locator('[data-testid="cart-item"], .cart-product')).toBeVisible()

    // Proceed to checkout
    await page.click('[data-testid="checkout-button"], button:has-text("Checkout"), button:has-text("Pagar")')

    // Should be on checkout page
    await expect(page).toHaveURL(new RegExp(`/${locale}/checkout`))
  })

  test('authenticated user can complete checkout', async ({ authenticatedPage: page, locale, testUser }) => {
    // User is already authenticated via fixture

    // Add product to cart
    await page.goto(`/${locale}/products`)
    await page.waitForSelector('[data-testid="product-card"], .product-item')
    await page.locator('[data-testid="product-card"], .product-item').first().click()
    await page.click('[data-testid="add-to-cart"], button:has-text("Add to Cart")')

    // Go to checkout
    await page.click('[data-testid="cart-icon"], a[href*="cart"]')
    await page.click('[data-testid="checkout-button"], button:has-text("Checkout")')

    // Fill shipping information
    await page.fill('[data-testid="shipping-name"], input[name="name"]', testUser.name || 'Test User')
    await page.fill('[data-testid="shipping-address"], input[name="address"]', '123 Test St')
    await page.fill('[data-testid="shipping-city"], input[name="city"]', 'Test City')
    await page.fill('[data-testid="shipping-zip"], input[name="zip"]', '12345')

    // Select shipping method
    await page.click('[data-testid="shipping-method"], input[type="radio"]')

    // Note: Actual payment would need Stripe test mode
    // For now, verify we reached payment step
    await expect(page.locator('[data-testid="payment-section"], .payment-info')).toBeVisible()
  })

  test('user can search for products', async ({ page, locale }) => {
    await page.goto(`/${locale}`)

    // Find and use search
    const searchInput = page.locator('[data-testid="search-input"], input[type="search"], input[placeholder*="Search"]')
    await searchInput.fill('wine')
    await searchInput.press('Enter')

    // Verify search results
    await expect(page.locator('[data-testid="search-results"], .search-result')).toBeVisible()
  })

  test('user can filter products by category', async ({ page, locale }) => {
    await page.goto(`/${locale}/products`)

    // Wait for products to load
    await page.waitForSelector('[data-testid="product-card"], .product-item')

    // Click a category filter
    await page.click('[data-testid="category-filter"], .category-button, a[href*="category"]')

    // Verify filtered results
    await expect(page.locator('[data-testid="product-card"], .product-item')).toBeVisible()
  })
})
