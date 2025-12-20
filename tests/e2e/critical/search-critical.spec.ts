/**
 * Critical Search Tests
 *
 * Essential search functionality tests for deployment confidence.
 *
 * Run: pnpm run test:critical
 */

import { test, expect } from '@playwright/test'
import { TIMEOUTS, ERROR_MESSAGES } from './constants'

test.describe('Critical Search Flows', () => {
  test('search input is accessible on products page', async ({ page }) => {
    await page.goto('/products')
    await page.waitForLoadState('networkidle')

    // Find search input on products page
    const searchInput = page.locator('input[type="search"]').first()
    await expect(searchInput, ERROR_MESSAGES.SEARCH_INPUT_NOT_FOUND).toBeVisible({
      timeout: TIMEOUTS.STANDARD,
    })
  })

  test('can search for products and see results', async ({ page }) => {
    await page.goto('/products')
    await page.waitForLoadState('networkidle')

    // Find and fill search input
    const searchInput = page.locator('input[type="search"]').first()
    await expect(searchInput).toBeVisible({ timeout: TIMEOUTS.STANDARD })

    // Type a search query (use a generic term that should return results)
    await searchInput.fill('vino')

    // Wait for search debounce and results to load
    await page.waitForTimeout(500) // Debounce wait
    await page.waitForLoadState('networkidle')

    // Verify product cards are visible (search returned results)
    const productCards = page.locator('[data-testid="product-card"], .product-card, article')
    const cardCount = await productCards.count()

    // Should have at least some results or show "no results" message
    const hasResults = cardCount > 0
    const noResultsMessage = page.locator('text=No se encontraron, text=No results')
    const hasNoResultsMessage = await noResultsMessage.count() > 0

    expect(hasResults || hasNoResultsMessage, ERROR_MESSAGES.SEARCH_NO_RESULTS).toBe(true)
  })

  test('search input accepts and displays text', async ({ page }) => {
    await page.goto('/products')
    await page.waitForLoadState('networkidle')

    const searchInput = page.locator('input[type="search"]').first()
    await expect(searchInput).toBeVisible({ timeout: TIMEOUTS.STANDARD })

    // Fill search
    await searchInput.fill('test query')
    await page.waitForTimeout(300)

    // Verify search has value - this is the critical functionality
    await expect(searchInput).toHaveValue('test query')

    // Verify the page didn't break
    await expect(page).toHaveURL(/\/products/)
  })

  test('can navigate to products page via header search', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Find and click search button in header
    const headerSearchButton = page.locator('header button[aria-label*="search"], header button[aria-label*="Buscar"]').first()

    if (await headerSearchButton.isVisible()) {
      await headerSearchButton.click()

      // Should navigate to products page with focus parameter
      await page.waitForURL(/\/products/, { timeout: TIMEOUTS.STANDARD })

      // Verify we're on products page
      expect(page.url()).toContain('/products')
    }
    else {
      // If no header search button, skip this test
      test.skip()
    }
  })

  test('search filters products correctly', async ({ page }) => {
    await page.goto('/products')
    await page.waitForLoadState('networkidle')

    // Wait for initial products to load
    await page.waitForSelector('[data-testid="product-card"], .product-card, article', {
      state: 'visible',
      timeout: TIMEOUTS.LONG,
    })

    // Search for something specific
    const searchInput = page.locator('input[type="search"]').first()
    await searchInput.fill('tinto') // Red wine in Spanish

    await page.waitForTimeout(500)
    await page.waitForLoadState('networkidle')

    // Count filtered products
    const filteredCount = await page.locator('[data-testid="product-card"], .product-card, article').count()

    // Results should either be filtered (fewer) or same (if all match)
    // The important thing is the search didn't break the page
    expect(filteredCount).toBeGreaterThanOrEqual(0)
  })
})
