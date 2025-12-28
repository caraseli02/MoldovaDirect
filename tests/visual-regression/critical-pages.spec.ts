/**
 * Visual Regression Tests - Critical Pages
 *
 * Tests visual consistency of critical pages to catch unintended UI changes.
 * Uses Playwright's toHaveScreenshot() for pixel-perfect comparisons.
 *
 * Usage:
 * - First run: Creates baseline screenshots
 * - Subsequent runs: Compares against baselines
 * - Update baselines: npx playwright test --update-snapshots
 *
 * @see https://playwright.dev/docs/test-snapshots
 */

import { test, expect } from '@playwright/test'

// Common options for screenshot comparison
const screenshotOptions = {
  maxDiffPixelRatio: 0.02, // Allow 2% pixel difference
  threshold: 0.2, // Per-pixel color threshold
  animations: 'disabled' as const,
}

// Mask selectors for dynamic content that should be ignored
const dynamicContentMasks = [
  '[data-testid="timestamp"]',
  '[data-testid="random-content"]',
  '.skeleton-loader',
  '.animate-pulse',
]

test.describe('Homepage Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Wait for page to fully load
    await page.waitForLoadState('networkidle')
    // Wait for any lazy-loaded images
    await page.waitForTimeout(1000)
  })

  test('homepage renders correctly on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })

    // Wait for hero section
    await expect(page.locator('main')).toBeVisible()

    await expect(page).toHaveScreenshot('homepage-desktop.png', {
      ...screenshotOptions,
      fullPage: true,
      mask: dynamicContentMasks.map(s => page.locator(s)),
    })
  })

  test('homepage renders correctly on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })

    await expect(page.locator('main')).toBeVisible()
    // Wait for page to stabilize (scrollbar/layout changes)
    await page.waitForTimeout(1000)

    await expect(page).toHaveScreenshot('homepage-tablet.png', {
      ...screenshotOptions,
      fullPage: true,
      mask: dynamicContentMasks.map(s => page.locator(s)),
    })
  })

  test('homepage renders correctly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    await expect(page.locator('main')).toBeVisible()

    await expect(page).toHaveScreenshot('homepage-mobile.png', {
      ...screenshotOptions,
      fullPage: true,
      mask: dynamicContentMasks.map(s => page.locator(s)),
    })
  })

  test('navigation header is consistent', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })

    const header = page.locator('header').first()
    await expect(header).toBeVisible()

    await expect(header).toHaveScreenshot('header-desktop.png', {
      ...screenshotOptions,
    })
  })

  test('footer is consistent', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })

    const footer = page.locator('footer').first()
    await expect(footer).toBeVisible()

    await expect(footer).toHaveScreenshot('footer-desktop.png', {
      ...screenshotOptions,
    })
  })
})

test.describe('Products Page Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/products')
    await page.waitForLoadState('networkidle')
    // Wait for products to load
    await page.waitForTimeout(1500)
  })

  test('products grid renders correctly on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })

    // Wait for product cards
    await expect(page.locator('[data-testid="product-card"], .product-card, [class*="product"]').first()).toBeVisible({ timeout: 10000 })

    await expect(page).toHaveScreenshot('products-desktop.png', {
      ...screenshotOptions,
      fullPage: true,
      mask: [
        ...dynamicContentMasks.map(s => page.locator(s)),
        page.locator('[data-testid="stock-count"]'), // Dynamic stock counts
      ],
    })
  })

  test('products grid renders correctly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    await expect(page.locator('[data-testid="product-card"], .product-card, [class*="product"]').first()).toBeVisible({ timeout: 10000 })

    await expect(page).toHaveScreenshot('products-mobile.png', {
      ...screenshotOptions,
      fullPage: true,
      mask: [
        ...dynamicContentMasks.map(s => page.locator(s)),
        page.locator('[data-testid="stock-count"]'),
      ],
    })
  })

  test('filter sidebar renders correctly', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })

    const sidebar = page.locator('[data-testid="filters"], aside, .filters, [class*="filter"]').first()

    if (await sidebar.isVisible()) {
      await expect(sidebar).toHaveScreenshot('products-filters.png', {
        ...screenshotOptions,
      })
    }
  })
})

test.describe('Product Detail Page Visual Regression', () => {
  test('product detail renders correctly on desktop', async ({ page }) => {
    // Navigate to products and click first product
    await page.goto('/products')
    await page.waitForLoadState('networkidle')

    const productLink = page.locator('[data-testid="product-card"] a, .product-card a, a[href*="/products/"]').first()

    if (await productLink.isVisible({ timeout: 5000 })) {
      await productLink.click()
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000)

      await page.setViewportSize({ width: 1920, height: 1080 })

      await expect(page).toHaveScreenshot('product-detail-desktop.png', {
        ...screenshotOptions,
        fullPage: true,
        mask: [
          ...dynamicContentMasks.map(s => page.locator(s)),
          page.locator('[data-testid="stock-status"]'),
          page.locator('[data-testid="price"]'), // Prices may change
        ],
      })
    }
  })

  test('product detail renders correctly on mobile', async ({ page }) => {
    await page.goto('/products')
    await page.waitForLoadState('networkidle')

    const productLink = page.locator('[data-testid="product-card"] a, .product-card a, a[href*="/products/"]').first()

    if (await productLink.isVisible({ timeout: 5000 })) {
      await productLink.click()
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000)

      await page.setViewportSize({ width: 375, height: 667 })

      await expect(page).toHaveScreenshot('product-detail-mobile.png', {
        ...screenshotOptions,
        fullPage: true,
        mask: [
          ...dynamicContentMasks.map(s => page.locator(s)),
          page.locator('[data-testid="stock-status"]'),
          page.locator('[data-testid="price"]'),
        ],
      })
    }
  })
})

test.describe('Cart Page Visual Regression', () => {
  test('empty cart renders correctly', async ({ page }) => {
    await page.goto('/cart')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    await page.setViewportSize({ width: 1920, height: 1080 })

    await expect(page).toHaveScreenshot('cart-empty-desktop.png', {
      ...screenshotOptions,
      fullPage: true,
    })
  })

  test('cart with items renders correctly', async ({ page }) => {
    // Add item to cart first
    await page.goto('/products')
    await page.waitForLoadState('networkidle')

    const addToCartButton = page.locator('[data-testid="add-to-cart"], button:has-text("Añadir"), button:has-text("Add")').first()

    if (await addToCartButton.isVisible({ timeout: 5000 })) {
      await addToCartButton.click()
      await page.waitForTimeout(1000)

      // Navigate to cart
      await page.goto('/cart')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(500)

      await page.setViewportSize({ width: 1920, height: 1080 })

      await expect(page).toHaveScreenshot('cart-with-items-desktop.png', {
        ...screenshotOptions,
        fullPage: true,
        mask: [
          ...dynamicContentMasks.map(s => page.locator(s)),
          page.locator('[data-testid="cart-total"]'),
          page.locator('[data-testid="item-price"]'),
        ],
      })
    }
  })
})

test.describe('Search Functionality Visual Regression', () => {
  test('search results page renders correctly', async ({ page }) => {
    await page.goto('/products?search=vino')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)

    await page.setViewportSize({ width: 1920, height: 1080 })

    await expect(page).toHaveScreenshot('search-results-desktop.png', {
      ...screenshotOptions,
      fullPage: true,
      mask: [
        ...dynamicContentMasks.map(s => page.locator(s)),
        page.locator('[data-testid="result-count"]'),
      ],
    })
  })
})

test.describe('Category Pages Visual Regression', () => {
  test('category page renders correctly', async ({ page }) => {
    // Try to find a category link
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const categoryLink = page.locator('a[href*="/products?category"], a[href*="/categories/"]').first()

    if (await categoryLink.isVisible({ timeout: 5000 })) {
      await categoryLink.click()
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1500)

      await page.setViewportSize({ width: 1920, height: 1080 })

      await expect(page).toHaveScreenshot('category-page-desktop.png', {
        ...screenshotOptions,
        fullPage: true,
        mask: dynamicContentMasks.map(s => page.locator(s)),
      })
    }
  })
})

test.describe('Authentication Pages Visual Regression', () => {
  test('login page renders correctly', async ({ page }) => {
    await page.goto('/auth/login')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    await page.setViewportSize({ width: 1920, height: 1080 })

    await expect(page).toHaveScreenshot('login-desktop.png', {
      ...screenshotOptions,
      fullPage: true,
    })
  })

  test('login page renders correctly on mobile', async ({ page }) => {
    await page.goto('/auth/login')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    await page.setViewportSize({ width: 375, height: 667 })

    await expect(page).toHaveScreenshot('login-mobile.png', {
      ...screenshotOptions,
      fullPage: true,
    })
  })

  test('register page renders correctly', async ({ page }) => {
    await page.goto('/auth/register')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    await page.setViewportSize({ width: 1920, height: 1080 })

    await expect(page).toHaveScreenshot('register-desktop.png', {
      ...screenshotOptions,
      fullPage: true,
    })
  })
})

test.describe('Error Pages Visual Regression', () => {
  test('404 page renders correctly', async ({ page }) => {
    await page.goto('/this-page-does-not-exist-404')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    await page.setViewportSize({ width: 1920, height: 1080 })

    // Check for error page or redirect
    const errorIndicator = page.locator('text=404, text=not found, text=página no encontrada').first()

    if (await errorIndicator.isVisible({ timeout: 3000 })) {
      await expect(page).toHaveScreenshot('404-page-desktop.png', {
        ...screenshotOptions,
        fullPage: true,
      })
    }
  })
})
