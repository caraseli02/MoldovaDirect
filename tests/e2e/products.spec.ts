import { test, expect } from '../fixtures/base'
import { HomePage, ProductPage } from '../fixtures/pages'
import { TestHelpers } from '../fixtures/helpers'

test.describe('Product Browsing', () => {
  let homePage: HomePage
  let productPage: ProductPage
  let helpers: TestHelpers

  test.beforeEach(async ({ page, seedDatabase }) => {
    await seedDatabase()
    homePage = new HomePage(page)
    productPage = new ProductPage(page)
    helpers = new TestHelpers(page)
  })

  test('should display featured products on homepage', async ({ page, testProducts }) => {
    await homePage.goto()
    
    const featuredSection = homePage.featuredProducts
    await expect(featuredSection).toBeVisible()
    
    for (const product of testProducts.slice(0, 2)) {
      const productCard = page.locator(`[data-testid="product-card-${product.id}"]`)
      await expect(productCard).toBeVisible()
      await expect(productCard).toContainText(product.name)
      await expect(productCard).toContainText(`€${product.price}`)
    }
  })

  test('should search for products', async ({ page }) => {
    await homePage.goto()
    await homePage.searchProducts('wine')
    
    await page.waitForURL('**/search?q=wine')
    
    const searchResults = page.locator('[data-testid="search-results"]')
    await expect(searchResults).toBeVisible()
    
    const productCards = page.locator('[data-testid^="product-card-"]')
    await expect(productCards).toHaveCount(1)
    await expect(productCards.first()).toContainText('Moldovan Wine')
  })

  test('should filter products by category', async ({ page }) => {
    await homePage.goto()
    await homePage.selectCategory('wine')
    
    await page.waitForURL('**/category/wine')
    
    const categoryTitle = page.locator('h1')
    await expect(categoryTitle).toContainText('Wine')
    
    const productCards = page.locator('[data-testid^="product-card-"]')
    const count = await productCards.count()
    
    for (let i = 0; i < count; i++) {
      const card = productCards.nth(i)
      const category = await card.locator('[data-testid="product-category"]').textContent()
      expect(category?.toLowerCase()).toBe('wine')
    }
  })

  test('should view product details', async ({ page, testProducts }) => {
    const product = testProducts[0]
    await productPage.goto(product.id)
    
    await expect(productPage.productTitle).toContainText(product.name)
    await expect(productPage.productPrice).toContainText(`€${product.price}`)
    await expect(productPage.productDescription).toBeVisible()
    await expect(productPage.productImages).toBeVisible()
    await expect(productPage.addToCartButton).toBeEnabled()
  })

  test('should display related products', async ({ page, testProducts }) => {
    await productPage.goto(testProducts[0].id)
    
    const relatedProducts = productPage.relatedProducts
    await expect(relatedProducts).toBeVisible()
    
    const relatedCards = relatedProducts.locator('[data-testid^="product-card-"]')
    const count = await relatedCards.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should handle product not found', async ({ page }) => {
    await page.goto('/products/non-existent-id')
    
    await expect(page.locator('h1')).toContainText('Product Not Found')
    const backButton = page.locator('[data-testid="back-to-products"]')
    await expect(backButton).toBeVisible()
  })

  test('should paginate product list', async ({ page }) => {
    await page.goto('/products')
    
    const pagination = page.locator('[data-testid="pagination"]')
    await expect(pagination).toBeVisible()
    
    const nextButton = pagination.locator('[data-testid="next-page"]')
    await nextButton.click()
    
    await page.waitForURL('**/products?page=2')
    const pageIndicator = pagination.locator('[data-testid="current-page"]')
    await expect(pageIndicator).toContainText('2')
  })

  test('should sort products', async ({ page }) => {
    await page.goto('/products')
    
    const sortDropdown = page.locator('[data-testid="sort-dropdown"]')
    await sortDropdown.selectOption('price-asc')
    
    await page.waitForURL('**/products?sort=price-asc')
    
    const prices = await page.locator('[data-testid^="product-price-"]').allTextContents()
    const numericPrices = prices.map(p => parseFloat(p.replace('€', '')))
    
    for (let i = 1; i < numericPrices.length; i++) {
      expect(numericPrices[i]).toBeGreaterThanOrEqual(numericPrices[i - 1])
    }
  })

  test('should display product ratings and reviews', async ({ page, testProducts }) => {
    await productPage.goto(testProducts[0].id)
    
    const rating = page.locator('[data-testid="product-rating"]')
    const reviewsSection = page.locator('[data-testid="product-reviews"]')
    
    await expect(rating).toBeVisible()
    await expect(reviewsSection).toBeVisible()
    
    const reviewCount = page.locator('[data-testid="review-count"]')
    await expect(reviewCount).toContainText(/\d+ reviews?/)
  })

  test('should filter by price range', async ({ page }) => {
    await page.goto('/products')
    
    const minPrice = page.locator('[data-testid="min-price-input"]')
    const maxPrice = page.locator('[data-testid="max-price-input"]')
    const applyFilter = page.locator('[data-testid="apply-price-filter"]')
    
    await minPrice.fill('10')
    await maxPrice.fill('25')
    await applyFilter.click()
    
    await page.waitForURL('**/products?min=10&max=25')
    
    const prices = await page.locator('[data-testid^="product-price-"]').allTextContents()
    const numericPrices = prices.map(p => parseFloat(p.replace('€', '')))
    
    for (const price of numericPrices) {
      expect(price).toBeGreaterThanOrEqual(10)
      expect(price).toBeLessThanOrEqual(25)
    }
  })
})