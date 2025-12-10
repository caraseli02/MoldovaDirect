import { test, expect } from '@playwright/test'

/**
 * E2E Test: Products Page Pagination
 *
 * Purpose: Validate that pagination works correctly across all pages
 * Critical for: Ensuring users can browse products without seeing duplicate/missing items
 *
 * What this test validates:
 * 1. API returns exactly 12 products per page
 * 2. UI displays exactly 12 product cards per page
 * 3. Pagination controls show correct page numbers
 * 4. Direct navigation to pages works (e.g., /products?page=5)
 * 5. All pages 1-11 render correctly
 */

test.describe('Products Page Pagination', () => {
  const PRODUCTS_PER_PAGE = 12
  const TOTAL_PRODUCTS = 132
  const TOTAL_PAGES = Math.ceil(TOTAL_PRODUCTS / PRODUCTS_PER_PAGE)

  test('should display exactly 12 products on page 1', async ({ page }) => {
    await page.goto('/products?page=1&limit=12')

    // Wait for products to load by waiting for "Add to Cart" buttons
    await page.waitForSelector('button:has-text("Añadir al Carrito")', { timeout: 10000 })

    // Count products by their "Add to Cart" buttons (each product has one)
    const productCards = page.locator('button:has-text("Añadir al Carrito")')
    await expect(productCards).toHaveCount(PRODUCTS_PER_PAGE)

    // Verify pagination text shows correct range
    await expect(page.locator('text=/1-12/')).toBeVisible()
  })

  test('should display exactly 12 products on page 2', async ({ page }) => {
    await page.goto('/products?page=2&limit=12')

    // Wait for products to load
    await page.waitForSelector('button:has-text("Añadir al Carrito")', { timeout: 10000 })

    const productCards = page.locator('button:has-text("Añadir al Carrito")')
    await expect(productCards).toHaveCount(PRODUCTS_PER_PAGE)

    // Verify pagination text shows correct range
    await expect(page.locator('text=/13-24/')).toBeVisible()
  })

  test('should display exactly 12 products on middle pages', async ({ page }) => {
    const pagesToTest = [3, 5, 7]

    for (const pageNum of pagesToTest) {
      await page.goto(`/products?page=${pageNum}&limit=12`)

      // Wait for products to load
      await page.waitForSelector('button:has-text("Añadir al Carrito")', { timeout: 10000 })

      const productCards = page.locator('button:has-text("Añadir al Carrito")')
      await expect(productCards).toHaveCount(PRODUCTS_PER_PAGE, {
        message: `Page ${pageNum} should show exactly ${PRODUCTS_PER_PAGE} products`,
      })

      // Verify page indicator
      const start = (pageNum - 1) * PRODUCTS_PER_PAGE + 1
      const end = pageNum * PRODUCTS_PER_PAGE
      await expect(page.locator(`text=/${start}-${end}/`)).toBeVisible()
    }
  })

  test('should display products on last page', async ({ page }) => {
    await page.goto(`/products?page=${TOTAL_PAGES}&limit=12`)

    // Wait for products to load
    await page.waitForSelector('button:has-text("Añadir al Carrito")', { timeout: 10000 })

    const productCards = page.locator('button:has-text("Añadir al Carrito")')
    const count = await productCards.count()

    // Last page might have fewer products if some are out of stock
    // Should have at least 10 products (allowing for some out of stock)
    expect(count).toBeGreaterThanOrEqual(10)
    expect(count).toBeLessThanOrEqual(PRODUCTS_PER_PAGE)

    // Last page shows items 121-132
    await expect(page.locator('text=/121-132/')).toBeVisible()
  })

  test('should have functional pagination controls', async ({ page }) => {
    await page.goto('/products?page=1&limit=12')

    // Wait for products to load
    await page.waitForSelector('button:has-text("Añadir al Carrito")', { timeout: 10000 })

    // Verify we're on page 1
    await expect(page.locator('text=/1-12/')).toBeVisible()

    // Verify pagination controls exist and are properly configured
    const prevButton = page.getByRole('button', { name: /previous|anterior|‹/i }).first()
    const nextButton = page.getByRole('button', { name: /next|siguiente|›/i }).first()

    // Previous button should be disabled on page 1
    await expect(prevButton).toBeVisible()
    await expect(prevButton).toBeDisabled()

    // Next button should be enabled (there are more pages)
    await expect(nextButton).toBeVisible()
    await expect(nextButton).toBeEnabled()

    // Navigate to last page to verify next button gets disabled
    await page.goto(`/products?page=${TOTAL_PAGES}&limit=12`)
    await page.waitForSelector('button:has-text("Añadir al Carrito")', { timeout: 10000 })

    // On last page, next should be disabled and previous should be enabled
    await expect(nextButton).toBeDisabled()
    await expect(prevButton).toBeEnabled()
  })

  test('API should return exactly 12 products for each page', async ({ request }) => {
    const pagesToTest = [1, 2, 3, 5, 8, 11]

    for (const pageNum of pagesToTest) {
      const response = await request.get(`/api/products?sort=created&page=${pageNum}&limit=12`)
      expect(response.ok()).toBeTruthy()

      const data = await response.json()
      expect(data.products).toHaveLength(PRODUCTS_PER_PAGE, {
        message: `API should return ${PRODUCTS_PER_PAGE} products for page ${pageNum}`,
      })

      // Verify pagination metadata (accept both string and number types)
      expect(data.pagination.total).toBe(TOTAL_PRODUCTS)
      expect(data.pagination.totalPages).toBe(TOTAL_PAGES)

      // Page and limit might be strings from query params
      const actualPage = typeof data.pagination.page === 'string'
        ? parseInt(data.pagination.page)
        : data.pagination.page
      const actualLimit = typeof data.pagination.limit === 'string'
        ? parseInt(data.pagination.limit)
        : data.pagination.limit

      expect(actualPage).toBe(pageNum)
      expect(actualLimit).toBe(PRODUCTS_PER_PAGE)
    }
  })

  test('API should parse pagination params as integers, not strings', async ({ request }) => {
    // Regression test for the type coercion bug fix
    // This test would have FAILED before adding parseInt() to the API
    const response = await request.get('/api/products?page=2&limit=12')
    const data = await response.json()

    // CRITICAL: Strict type checking - pagination values must be numbers, not strings
    expect(typeof data.pagination.page).toBe('number')
    expect(typeof data.pagination.limit).toBe('number')
    expect(typeof data.pagination.total).toBe('number')
    expect(typeof data.pagination.totalPages).toBe('number')

    // Verify correct values (not string "2")
    expect(data.pagination.page).toBe(2)
    expect(data.pagination.limit).toBe(12)

    // Verify correct products returned (offset calculation worked correctly)
    expect(data.products.length).toBe(12)

    // Page 2 should NOT contain the first product (ID would be lower)
    // This verifies the offset calculation used numbers, not strings
    const productIds = data.products.map(p => p.id)
    const page1Response = await request.get('/api/products?page=1&limit=12')
    const page1Data = await page1Response.json()
    const page1Ids = page1Data.products.map(p => p.id)

    // No overlap between page 1 and page 2
    const overlap = productIds.filter(id => page1Ids.includes(id))
    expect(overlap).toHaveLength(0)
  })

  test('API should enforce bounds on pagination parameters', async ({ request }) => {
    // Test excessive limit (should clamp to MAX_LIMIT)
    const excessiveLimitResponse = await request.get('/api/products?page=1&limit=999999')
    const excessiveLimitData = await excessiveLimitResponse.json()
    expect(excessiveLimitData.pagination.limit).toBeLessThanOrEqual(100)
    expect(excessiveLimitData.products.length).toBeLessThanOrEqual(100)

    // Test negative values (should use safe defaults)
    const negativeResponse = await request.get('/api/products?page=-5&limit=-10')
    const negativeData = await negativeResponse.json()
    expect(negativeData.pagination.page).toBeGreaterThanOrEqual(1)
    expect(negativeData.pagination.limit).toBeGreaterThanOrEqual(1)

    // Test zero values (should use safe defaults)
    const zeroResponse = await request.get('/api/products?page=0&limit=0')
    const zeroData = await zeroResponse.json()
    expect(zeroData.pagination.page).toBeGreaterThanOrEqual(1)
    expect(zeroData.pagination.limit).toBeGreaterThanOrEqual(1)
  })

  test('should load correct page during SSR without client re-fetch', async ({ page }) => {
    // Regression test for SSR initial page load bug fix
    // Before fix: Always loaded page 1 during SSR, then client re-fetched correct page
    // After fix: Loads correct page from URL params during SSR

    const requests: string[] = []
    page.on('request', (req) => {
      if (req.url().includes('/api/products')) {
        requests.push(req.url())
      }
    })

    // Navigate directly to page 5
    await page.goto('/products?page=5&limit=12')
    await page.waitForLoadState('networkidle')

    // Verify correct content is displayed (items 49-60)
    await page.waitForSelector('button:has-text("Añadir al Carrito")', { timeout: 10000 })
    await expect(page.locator('text=/49-60/')).toBeVisible()

    // CRITICAL: First API request should be for page 5, not page 1
    // This verifies SSR used URL params correctly
    expect(requests.length).toBeGreaterThan(0)
    expect(requests[0]).toContain('page=5')

    // Should NOT have fetched page 1 at all (no hydration mismatch)
    const page1Requests = requests.filter(r => r.includes('page=1'))
    expect(page1Requests).toHaveLength(0)
  })

  test('should show correct page indicator for all pages', async ({ page }) => {
    const pagesToTest = [1, 2, 5, 11]

    for (const pageNum of pagesToTest) {
      await page.goto(`/products?page=${pageNum}&limit=12`)

      // Wait for products to load
      await page.waitForSelector('button:has-text("Añadir al Carrito")', { timeout: 10000 })

      // Check page indicator text using specific selector for the aria-live paragraph
      const pageIndicator = page.locator('p[aria-live="polite"]')
      await expect(pageIndicator).toBeVisible({
        message: `Page ${pageNum} should show correct page indicator`,
      })

      // Verify it contains the correct page number and total
      await expect(pageIndicator).toContainText(new RegExp(`${pageNum}.*${TOTAL_PAGES}`))
    }
  })

  test('should not show duplicate products across pages', async ({ page }) => {
    // Get products from page 1
    await page.goto('/products?page=1&limit=12')
    await page.waitForSelector('button:has-text("Añadir al Carrito")', { timeout: 10000 })

    const page1Products = await page.locator('a[href*="/products/"]').evaluateAll(links =>
      links.map(l => l.getAttribute('href')).filter(href => href && !href.includes('#')),
    )

    // Get products from page 2
    await page.goto('/products?page=2&limit=12')
    await page.waitForSelector('button:has-text("Añadir al Carrito")', { timeout: 10000 })

    const page2Products = await page.locator('a[href*="/products/"]').evaluateAll(links =>
      links.map(l => l.getAttribute('href')).filter(href => href && !href.includes('#')),
    )

    // Ensure no duplicates between pages
    const duplicates = page1Products.filter(href => page2Products.includes(href))
    expect(duplicates).toHaveLength(0, {
      message: 'Pages 1 and 2 should not contain duplicate products',
    })
  })
})
