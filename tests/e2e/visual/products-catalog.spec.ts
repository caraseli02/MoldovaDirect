import { test, expect } from '@playwright/test'
import {
  captureScreenshot,
  captureResponsiveScreenshots,
  generateVisualReport,
} from '../../../.visual-testing/utils'

/**
 * Products Catalog Visual Tests
 *
 * Comprehensive visual tests for:
 * - Language switcher functionality (all 4 locales)
 * - Search functionality
 * - Filter functionality
 * - Search + Filter combination
 *
 * Run: pnpm run test:visual:products
 * View: open .visual-testing/reports/index.html
 */

const FEATURE = 'products-catalog'

test.describe('Products Catalog Visual Review', () => {
  test.describe.configure({ mode: 'serial' })

  // ============================================
  // LANGUAGE SWITCHER TESTS
  // ============================================

  test.describe('Language Switcher', () => {
    test('Language switcher visible in header', async ({ page }) => {
      await page.goto('/products')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000)

      // Verify language switcher is visible (use first() as there's one for desktop and one for mobile)
      const localeSwitcher = page.locator('[data-testid="locale-switcher"]').first()
      await expect(localeSwitcher).toBeVisible({ timeout: 5000 })

      await captureResponsiveScreenshots(page, {
        feature: FEATURE,
        name: '01-header-with-locale-switcher',
        viewports: ['mobile', 'desktop'],
      })
    })

    test('Language dropdown shows all 4 locales', async ({ page }) => {
      await page.goto('/products')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000)

      // Click to open language dropdown (use first() for desktop)
      const trigger = page.locator('[data-testid="locale-switcher-trigger"]').first()
      await expect(trigger).toBeVisible({ timeout: 5000 })
      await trigger.click()
      await page.waitForTimeout(500)

      // Verify all 4 locale options are visible
      const locales = ['es', 'en', 'ro', 'ru']
      for (const locale of locales) {
        const option = page.locator(`[data-testid="locale-${locale}"]`)
        await expect(option, `Locale ${locale} should be visible`).toBeVisible({ timeout: 3000 })
      }

      // Capture dropdown open state
      await captureScreenshot(page, {
        feature: FEATURE,
        name: '02-locale-dropdown-open',
        viewport: 'desktop',
        fullPage: false,
      })
    })

    test('Switch to English and verify URL', async ({ page }) => {
      await page.goto('/products')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000)

      // Open dropdown and switch to English
      const trigger = page.locator('[data-testid="locale-switcher-trigger"]').first()
      await trigger.click()
      await page.waitForTimeout(300)

      const enOption = page.locator('[data-testid="locale-en"]')
      await enOption.click()

      // Wait for navigation
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000)

      // Verify URL contains /en/
      expect(page.url()).toContain('/en/')

      // Verify HTML lang attribute
      const htmlLang = await page.getAttribute('html', 'lang')
      expect(htmlLang).toBe('en')

      await captureScreenshot(page, {
        feature: FEATURE,
        name: '03-locale-english',
        viewport: 'desktop',
      })
    })

    test('Switch to Romanian and verify URL', async ({ page }) => {
      await page.goto('/products')
      await page.waitForLoadState('networkidle')

      const trigger = page.locator('[data-testid="locale-switcher-trigger"]').first()
      await trigger.click()
      await page.waitForTimeout(300)

      const roOption = page.locator('[data-testid="locale-ro"]')
      await roOption.click()

      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000)

      expect(page.url()).toContain('/ro/')

      const htmlLang = await page.getAttribute('html', 'lang')
      expect(htmlLang).toBe('ro')

      await captureScreenshot(page, {
        feature: FEATURE,
        name: '04-locale-romanian',
        viewport: 'desktop',
      })
    })

    test('Switch to Russian and verify URL', async ({ page }) => {
      await page.goto('/products')
      await page.waitForLoadState('networkidle')

      const trigger = page.locator('[data-testid="locale-switcher-trigger"]').first()
      await trigger.click()
      await page.waitForTimeout(300)

      const ruOption = page.locator('[data-testid="locale-ru"]')
      await ruOption.click()

      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000)

      expect(page.url()).toContain('/ru/')

      const htmlLang = await page.getAttribute('html', 'lang')
      expect(htmlLang).toBe('ru')

      await captureScreenshot(page, {
        feature: FEATURE,
        name: '05-locale-russian',
        viewport: 'desktop',
      })
    })
  })

  // ============================================
  // SEARCH FUNCTIONALITY TESTS
  // ============================================

  test.describe('Search Functionality', () => {
    test('Search input visible and functional', async ({ page }) => {
      await page.goto('/products')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1500)

      // Find search input
      const searchInput = page.locator('input[type="search"]').first()
      await expect(searchInput).toBeVisible({ timeout: 5000 })

      await captureScreenshot(page, {
        feature: FEATURE,
        name: '06-search-input-empty',
        viewport: 'desktop',
      })
    })

    test('Search for "wine" shows filtered results', async ({ page }) => {
      await page.goto('/products')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1500)

      // Get initial product count
      const initialProducts = await page.locator('article, [data-testid="product-card"]').count()

      // Search for wine
      const searchInput = page.locator('input[type="search"]').first()
      await searchInput.fill('wine')
      await page.waitForTimeout(500) // Debounce
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000)

      // Verify search results or no results message
      const searchResults = await page.locator('article, [data-testid="product-card"]').count()
      const noResultsMessage = page.locator('text=No se encontraron, text=No results, text=no results')

      // Either we have results or a no-results message
      const hasResults = searchResults > 0
      const hasNoResultsMessage = await noResultsMessage.count() > 0

      expect(hasResults || hasNoResultsMessage, 'Search should show results or no-results message').toBe(true)

      await captureScreenshot(page, {
        feature: FEATURE,
        name: '07-search-wine-results',
        viewport: 'desktop',
      })

      // Log for debugging
      console.log(`  Search "wine": ${searchResults} results (was ${initialProducts})`)
    })

    test('Search for "vino" (Spanish) shows results', async ({ page }) => {
      await page.goto('/products')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1500)

      const searchInput = page.locator('input[type="search"]').first()
      await searchInput.fill('vino')
      await page.waitForTimeout(500)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000)

      const searchResults = await page.locator('article, [data-testid="product-card"]').count()
      console.log(`  Search "vino": ${searchResults} results`)

      await captureScreenshot(page, {
        feature: FEATURE,
        name: '08-search-vino-results',
        viewport: 'desktop',
      })
    })

    test('Clear search restores all products', async ({ page }) => {
      await page.goto('/products')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1500)

      // Search first
      const searchInput = page.locator('input[type="search"]').first()
      await searchInput.fill('wine')
      await page.waitForTimeout(500)
      await page.waitForLoadState('networkidle')

      // Clear search
      await searchInput.clear()
      await page.waitForTimeout(500)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000)

      // Verify products are restored
      const products = await page.locator('article, [data-testid="product-card"]').count()
      expect(products).toBeGreaterThan(0)

      await captureScreenshot(page, {
        feature: FEATURE,
        name: '09-search-cleared',
        viewport: 'desktop',
      })
    })
  })

  // ============================================
  // FILTER FUNCTIONALITY TESTS
  // ============================================

  test.describe('Filter Functionality', () => {
    test('Filter button visible', async ({ page }) => {
      await page.goto('/products')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1500)

      // Find filter button
      const filterButton = page.locator('button:has-text("Filtros"), button:has-text("Filters"), button[aria-label*="filter"]').first()
      await expect(filterButton).toBeVisible({ timeout: 5000 })

      await captureScreenshot(page, {
        feature: FEATURE,
        name: '10-filter-button-visible',
        viewport: 'desktop',
      })
    })

    test('Open filter panel', async ({ page }) => {
      await page.goto('/products')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1500)

      // Click filter button
      const filterButton = page.locator('button:has-text("Filtros"), button:has-text("Filters"), button[aria-label*="filter"]').first()
      await filterButton.click()
      await page.waitForTimeout(500)

      await captureScreenshot(page, {
        feature: FEATURE,
        name: '11-filter-panel-open',
        viewport: 'desktop',
      })
    })

    test('Apply price filter', async ({ page }) => {
      await page.goto('/products')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1500)

      // Get initial count
      const initialCount = await page.locator('article, [data-testid="product-card"]').count()

      // Open filter panel
      const filterButton = page.locator('button:has-text("Filtros"), button:has-text("Filters"), button[aria-label*="filter"]').first()
      await filterButton.click()
      await page.waitForTimeout(500)

      // Look for price inputs
      const minPriceInput = page.locator('input[name="priceMin"], input[placeholder*="Min"], input[aria-label*="minimum"]').first()
      const maxPriceInput = page.locator('input[name="priceMax"], input[placeholder*="Max"], input[aria-label*="maximum"]').first()

      if (await minPriceInput.isVisible({ timeout: 3000 })) {
        await minPriceInput.fill('10')

        if (await maxPriceInput.isVisible()) {
          await maxPriceInput.fill('50')
        }

        // Apply filter
        const applyButton = page.locator('button:has-text("Aplicar"), button:has-text("Apply")').first()
        if (await applyButton.isVisible({ timeout: 2000 })) {
          await applyButton.click()
        }

        await page.waitForTimeout(500)
        await page.waitForLoadState('networkidle')
        await page.waitForTimeout(1000)

        const filteredCount = await page.locator('article, [data-testid="product-card"]').count()
        console.log(`  Price filter: ${filteredCount} results (was ${initialCount})`)
      }

      await captureScreenshot(page, {
        feature: FEATURE,
        name: '12-filter-price-applied',
        viewport: 'desktop',
      })
    })
  })

  // ============================================
  // SEARCH + FILTER COMBINATION TESTS
  // ============================================

  test.describe('Search + Filter Combination', () => {
    test('Search then filter combination works', async ({ page }) => {
      await page.goto('/products')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1500)

      // Step 1: Search for "vino"
      const searchInput = page.locator('input[type="search"]').first()
      await searchInput.fill('vino')
      await page.waitForTimeout(500)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(500)

      const afterSearchCount = await page.locator('article, [data-testid="product-card"]').count()
      console.log(`  After search "vino": ${afterSearchCount} products`)

      // Step 2: Open filter panel
      const filterButton = page.locator('button:has-text("Filtros"), button:has-text("Filters"), button[aria-label*="filter"]').first()

      if (await filterButton.isVisible({ timeout: 3000 })) {
        await filterButton.click()
        await page.waitForTimeout(500)

        // Step 3: Set price filter
        const minPriceInput = page.locator('input[name="priceMin"], input[placeholder*="Min"], input[aria-label*="minimum"]').first()

        if (await minPriceInput.isVisible({ timeout: 3000 })) {
          await minPriceInput.fill('10')

          const maxPriceInput = page.locator('input[name="priceMax"], input[placeholder*="Max"], input[aria-label*="maximum"]').first()
          if (await maxPriceInput.isVisible()) {
            await maxPriceInput.fill('100')
          }

          // Apply filter
          const applyButton = page.locator('button:has-text("Aplicar"), button:has-text("Apply")').first()
          if (await applyButton.isVisible({ timeout: 2000 })) {
            await applyButton.click()
          }

          await page.waitForTimeout(500)
          await page.waitForLoadState('networkidle')
          await page.waitForTimeout(1000)

          const afterComboCount = await page.locator('article, [data-testid="product-card"]').count()
          console.log(`  After search + filter: ${afterComboCount} products`)

          // Page should not be blank (either results or no-results message)
          const noResultsMessage = page.locator('text=No se encontraron, text=No results')
          const hasContent = afterComboCount > 0 || (await noResultsMessage.count()) > 0

          expect(hasContent, 'Page should show results or no-results message, not be blank').toBe(true)
        }
      }

      await captureScreenshot(page, {
        feature: FEATURE,
        name: '13-search-plus-filter-combo',
        viewport: 'desktop',
      })
    })

    test('Clear all filters restores products', async ({ page }) => {
      await page.goto('/products')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1500)

      // Search first
      const searchInput = page.locator('input[type="search"]').first()
      await searchInput.fill('vino')
      await page.waitForTimeout(500)
      await page.waitForLoadState('networkidle')

      // Look for clear filters button
      const clearButton = page.locator('button:has-text("Limpiar"), button:has-text("Clear"), button:has-text("Reset")').first()

      if (await clearButton.isVisible({ timeout: 3000 })) {
        await clearButton.click()
        await page.waitForTimeout(500)
        await page.waitForLoadState('networkidle')
        await page.waitForTimeout(1000)
      }
      else {
        // Manually clear search
        await searchInput.clear()
        await page.waitForTimeout(500)
        await page.waitForLoadState('networkidle')
        await page.waitForTimeout(1000)
      }

      const finalCount = await page.locator('article, [data-testid="product-card"]').count()
      console.log(`  After clear: ${finalCount} products`)

      await captureScreenshot(page, {
        feature: FEATURE,
        name: '14-filters-cleared',
        viewport: 'desktop',
      })
    })
  })

  // ============================================
  // RESPONSIVE TESTS
  // ============================================

  test.describe('Responsive Views', () => {
    test('Products page - mobile view', async ({ page }) => {
      await page.goto('/products')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1500)

      await captureScreenshot(page, {
        feature: FEATURE,
        name: '15-products-mobile',
        viewport: 'mobile',
      })
    })

    test('Products page - tablet view', async ({ page }) => {
      await page.goto('/products')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1500)

      await captureScreenshot(page, {
        feature: FEATURE,
        name: '16-products-tablet',
        viewport: 'tablet',
      })
    })

    test('Language switcher - mobile interaction', async ({ page }) => {
      await page.goto('/products')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000)

      await page.setViewportSize({ width: 375, height: 812 })

      // On mobile, we want the mobile version (which may be visible when viewport is small)
      const trigger = page.locator('[data-testid="locale-switcher-trigger"]').first()
      if (await trigger.isVisible({ timeout: 3000 })) {
        await trigger.click()
        await page.waitForTimeout(500)

        await captureScreenshot(page, {
          feature: FEATURE,
          name: '17-locale-dropdown-mobile',
          viewport: 'mobile',
          fullPage: false,
        })
      }
    })
  })
})

// Generate report after all tests
test.afterAll(async () => {
  const reportPath = generateVisualReport(FEATURE)
  console.log(`\n✅ Visual tests complete!`)
  console.log(`   View report: open ${reportPath}`)
})
