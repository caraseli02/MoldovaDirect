import { test, expect } from '../fixtures/base'

test.describe('Product Browsing Experience', () => {
  test('user can view product catalog', async ({ page, locale }) => {
    await page.goto(`/${locale}/products`)

    // Wait for products to load
    await page.waitForSelector('[data-testid="product-card"], .product-item', { timeout: 10000 })

    // Verify multiple products are shown
    const products = await page.locator('[data-testid="product-card"], .product-item').count()
    expect(products).toBeGreaterThan(0)
  })

  test('user can view product details', async ({ page, locale }) => {
    await page.goto(`/${locale}/products`)
    await page.waitForSelector('[data-testid="product-card"], .product-item')

    // Click first product
    await page.locator('[data-testid="product-card"], .product-item').first().click()

    // Verify product details are shown
    await expect(page.locator('[data-testid="product-title"], h1, .product-name')).toBeVisible()
    await expect(page.locator('[data-testid="product-price"], .price')).toBeVisible()
    await expect(page.locator('[data-testid="product-description"], .description')).toBeVisible()
  })

  test('product images are loaded', async ({ page, locale }) => {
    await page.goto(`/${locale}/products`)
    await page.waitForSelector('[data-testid="product-card"], .product-item')

    // Check that product images are loaded
    const firstImage = page.locator('[data-testid="product-image"], img').first()
    await expect(firstImage).toBeVisible()

    // Verify image has src attribute
    const imageSrc = await firstImage.getAttribute('src')
    expect(imageSrc).toBeTruthy()
  })

  test('user can add product to cart from product page', async ({ page, locale }) => {
    await page.goto(`/${locale}/products`)
    await page.waitForSelector('[data-testid="product-card"], .product-item')

    // Click product
    await page.locator('[data-testid="product-card"], .product-item').first().click()

    // Get initial cart count (if visible)
    const cartBadge = page.locator('[data-testid="cart-count"], .cart-badge')
    const initialCount = await cartBadge.isVisible()
      ? parseInt(await cartBadge.textContent() || '0')
      : 0

    // Add to cart
    await page.click('[data-testid="add-to-cart"], button:has-text("Add to Cart")')

    // Wait for cart to update
    await page.waitForTimeout(1000)

    // Verify cart count increased
    await expect(cartBadge).toBeVisible()
    const newCount = parseInt(await cartBadge.textContent() || '0')
    expect(newCount).toBeGreaterThan(initialCount)
  })

  test('user can change product quantity before adding to cart', async ({ page, locale }) => {
    await page.goto(`/${locale}/products`)
    await page.waitForSelector('[data-testid="product-card"], .product-item')
    await page.locator('[data-testid="product-card"], .product-item').first().click()

    // Find quantity input
    const quantityInput = page.locator('[data-testid="quantity-input"], input[type="number"]')

    if (await quantityInput.isVisible()) {
      // Change quantity
      await quantityInput.fill('3')

      // Verify value changed
      await expect(quantityInput).toHaveValue('3')
    }
  })

  test('user can navigate between product pages', async ({ page, locale }) => {
    await page.goto(`/${locale}/products`)
    await page.waitForSelector('[data-testid="product-card"], .product-item')

    // Check if pagination exists
    const pagination = page.locator('[data-testid="pagination"], .pagination, button:has-text("Next")')

    if (await pagination.isVisible()) {
      // Click next page
      await pagination.click()

      // Verify products loaded
      await page.waitForSelector('[data-testid="product-card"], .product-item')
    }
  })
})
