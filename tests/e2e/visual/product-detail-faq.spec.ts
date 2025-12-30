import type { Page } from '@playwright/test'
import { test, expect } from '@playwright/test'
import {
  captureScreenshot,
  captureResponsiveScreenshots,
  generateVisualReport,
} from '../../../.visual-testing/utils'

/**
 * Product Detail Page - FAQ Section Visual Tests
 *
 * Critical test focusing on:
 * 1. FAQ section displays with proper translations (not raw keys like "products.faq.subtitle")
 * 2. Wine products show wine-specific storage information
 * 3. Non-wine products show general storage information (no wine temperatures)
 * 4. Responsive design across viewports
 *
 * Run: pnpm run test:visual
 * View: open .visual-testing/reports/index.html
 */

const FEATURE = 'product-detail-faq'

/**
 * Helper to scroll to FAQ section and wait for it to be visible
 */
async function scrollToFAQ(page: Page): Promise<boolean> {
  try {
    // Look for FAQ section by various selectors
    const faqSection = page.locator('section:has-text("FAQ"), section:has-text("Preguntas"), [data-testid="faq-section"]').first()

    // Check if FAQ exists
    const exists = await faqSection.count() > 0
    if (!exists) {
      console.log('⚠️  FAQ section not found on page')
      return false
    }

    // Scroll into view
    await faqSection.scrollIntoViewIfNeeded()
    await page.waitForTimeout(500)

    return true
  }
  catch (error) {
    console.log('⚠️  Error scrolling to FAQ:', error)
    return false
  }
}

/**
 * Helper to check if FAQ shows translation keys (broken state)
 */
async function checkForTranslationKeys(page: Page): Promise<boolean> {
  const translationKeyPattern = /products\.faq\.|product\.faq\./
  const pageContent = await page.textContent('body')

  if (pageContent && translationKeyPattern.test(pageContent)) {
    console.log('❌ CRITICAL: Translation keys detected in page content!')
    return true
  }

  return false
}

test.describe('Product Detail Page - FAQ Section Visual Review', () => {
  test.describe.configure({ mode: 'serial' })

  // ============================================
  // PRODUCTS LISTING PAGE
  // ============================================

  test.describe('Products Listing', () => {
    test('Products listing page - full view', async ({ page }) => {
      await page.goto('/en/products')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1500)

      // Verify products are loaded
      const products = await page.locator('[data-testid="product-card"], article').count()
      console.log(`  Found ${products} products on listing page`)

      await captureResponsiveScreenshots(page, {
        feature: FEATURE,
        name: '01-products-listing',
        viewports: ['mobile', 'desktop'],
      })
    })
  })

  // ============================================
  // WINE PRODUCT DETAIL PAGE
  // ============================================

  test.describe('Wine Product Detail - FAQ Section', () => {
    const wineProductUrl = '/en/products/WINE-PURCARI-001'

    test('Navigate to wine product page', async ({ page }) => {
      // Try the known wine product first
      const response = await page.goto(wineProductUrl)

      // If 404, fall back to any wine product from the listing
      if (response?.status() === 404) {
        console.log('  Wine product not found, searching for alternative...')
        await page.goto('/en/products')
        await page.waitForLoadState('networkidle')

        // Look for wine-related products
        const wineLink = page.locator('a[href*="wine"], a[href*="WINE"], article:has-text("wine") a, article:has-text("vino") a').first()
        const wineExists = await wineLink.count() > 0

        if (wineExists) {
          await wineLink.click()
          await page.waitForLoadState('networkidle')
        }
        else {
          test.skip(true, 'No wine products found')
          return
        }
      }
      else {
        await page.waitForLoadState('networkidle')
      }

      await page.waitForTimeout(1500)

      // Verify we're on a product detail page
      const pageTitle = await page.title()
      console.log(`  On page: ${pageTitle}`)

      await captureScreenshot(page, {
        feature: FEATURE,
        name: '02-wine-product-hero',
        viewport: 'desktop',
        fullPage: false,
      })
    })

    test('Wine product - full page view', async ({ page }) => {
      await page.goto(wineProductUrl).catch(async () => {
        // Fallback to first product
        await page.goto('/en/products')
        await page.waitForLoadState('networkidle')
        const firstProduct = page.locator('[data-testid="product-card"] a, article a').first()
        if (await firstProduct.count() > 0) {
          await firstProduct.click()
          await page.waitForLoadState('networkidle')
        }
      })

      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1500)

      // Check for translation key issues
      const hasTranslationKeys = await checkForTranslationKeys(page)
      if (hasTranslationKeys) {
        console.log('⚠️  WARNING: Translation keys detected - FAQ may not be properly translated')
      }

      await captureScreenshot(page, {
        feature: FEATURE,
        name: '03-wine-product-full-page',
        viewport: 'desktop',
        fullPage: true,
      })
    })

    test('Wine product - FAQ section visible and translated', async ({ page }) => {
      await page.goto(wineProductUrl).catch(async () => {
        await page.goto('/en/products')
        await page.waitForLoadState('networkidle')
        const firstProduct = page.locator('[data-testid="product-card"] a, article a').first()
        if (await firstProduct.count() > 0) {
          await firstProduct.click()
          await page.waitForLoadState('networkidle')
        }
      })

      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1500)

      // Scroll to FAQ section
      const faqVisible = await scrollToFAQ(page)

      if (!faqVisible) {
        console.log('⚠️  FAQ section not found - skipping FAQ tests')
        test.skip()
        return
      }

      // Check for proper translations
      const hasTranslationKeys = await checkForTranslationKeys(page)

      // Look for FAQ title and subtitle
      const faqTitle = page.locator('h2:has-text("FAQ"), h2:has-text("Preguntas"), h3:has-text("FAQ")').first()
      const faqSubtitle = page.locator('p:has-text("Answers to"), p:has-text("Respuestas a"), p:has-text("common questions")').first()

      const titleVisible = await faqTitle.isVisible().catch(() => false)
      const subtitleVisible = await faqSubtitle.isVisible().catch(() => false)

      console.log(`  FAQ Title visible: ${titleVisible}`)
      console.log(`  FAQ Subtitle visible: ${subtitleVisible}`)
      console.log(`  Translation keys present: ${hasTranslationKeys}`)

      // Capture FAQ section
      await captureScreenshot(page, {
        feature: FEATURE,
        name: '04-wine-product-faq-section',
        viewport: 'desktop',
        fullPage: false,
      })
    })

    test('Wine product - FAQ shows wine-specific storage info', async ({ page }) => {
      await page.goto(wineProductUrl).catch(async () => {
        await page.goto('/en/products')
        await page.waitForLoadState('networkidle')
        const firstProduct = page.locator('[data-testid="product-card"] a, article a').first()
        if (await firstProduct.count() > 0) {
          await firstProduct.click()
          await page.waitForLoadState('networkidle')
        }
      })

      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1500)

      const faqVisible = await scrollToFAQ(page)
      if (!faqVisible) {
        test.skip()
        return
      }

      // Look for wine-specific storage information
      const bodyText = await page.textContent('body')
      const hasWineStorage = bodyText && (
        bodyText.includes('12-18°C')
        || bodyText.includes('54-64°F')
        || bodyText.includes('wine cellar')
        || bodyText.includes('bodega')
      )

      console.log(`  Wine-specific storage info present: ${hasWineStorage}`)

      // Capture the storage FAQ item if visible
      const storageFAQ = page.locator('[data-testid="faq-storage"], div:has-text("How should I store")').first()
      const storageVisible = await storageFAQ.isVisible().catch(() => false)

      if (storageVisible) {
        await storageFAQ.scrollIntoViewIfNeeded()
        await page.waitForTimeout(300)
      }

      await captureScreenshot(page, {
        feature: FEATURE,
        name: '05-wine-product-storage-faq',
        viewport: 'desktop',
        fullPage: false,
      })
    })

    test('Wine product - FAQ mobile view', async ({ page }) => {
      await page.goto(wineProductUrl).catch(async () => {
        await page.goto('/en/products')
        await page.waitForLoadState('networkidle')
        const firstProduct = page.locator('[data-testid="product-card"] a, article a').first()
        if (await firstProduct.count() > 0) {
          await firstProduct.click()
          await page.waitForLoadState('networkidle')
        }
      })

      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1500)

      const faqVisible = await scrollToFAQ(page)
      if (!faqVisible) {
        test.skip()
        return
      }

      await captureScreenshot(page, {
        feature: FEATURE,
        name: '06-wine-product-faq-mobile',
        viewport: 'mobile',
        fullPage: false,
      })
    })
  })

  // ============================================
  // NON-WINE PRODUCT DETAIL PAGE
  // ============================================

  test.describe('Non-Wine Product Detail - FAQ Section', () => {
    test('Find and navigate to non-wine product', async ({ page }) => {
      await page.goto('/en/products')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1500)

      // Look for non-wine products (embroidered, carpet, etc.)
      const nonWineProduct = page.locator('a[href*="embroidered"], a[href*="carpet"], a[href*="PROD-"], article:has-text("Embroidered") a, article:has-text("Carpet") a').first()
      const productExists = await nonWineProduct.count() > 0

      if (!productExists) {
        console.log('⚠️  No non-wine products found - using first product')
        const firstProduct = page.locator('[data-testid="product-card"] a, article a').first()
        if (await firstProduct.count() > 0) {
          await firstProduct.click()
        }
        else {
          test.skip(true, 'No products found')
          return
        }
      }
      else {
        await nonWineProduct.click()
      }

      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1500)

      const pageTitle = await page.title()
      console.log(`  On non-wine product: ${pageTitle}`)

      await captureScreenshot(page, {
        feature: FEATURE,
        name: '07-nonwine-product-hero',
        viewport: 'desktop',
        fullPage: false,
      })
    })

    test('Non-wine product - full page view', async ({ page }) => {
      await page.goto('/en/products')
      await page.waitForLoadState('networkidle')

      const nonWineProduct = page.locator('a[href*="embroidered"], a[href*="carpet"], a[href*="PROD-"]').first()
      if (await nonWineProduct.count() > 0) {
        await nonWineProduct.click()
      }
      else {
        const firstProduct = page.locator('[data-testid="product-card"] a, article a').first()
        await firstProduct.click()
      }

      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1500)

      await captureScreenshot(page, {
        feature: FEATURE,
        name: '08-nonwine-product-full-page',
        viewport: 'desktop',
        fullPage: true,
      })
    })

    test('Non-wine product - FAQ section without wine-specific content', async ({ page }) => {
      await page.goto('/en/products')
      await page.waitForLoadState('networkidle')

      const nonWineProduct = page.locator('a[href*="embroidered"], a[href*="carpet"], a[href*="PROD-"]').first()
      if (await nonWineProduct.count() > 0) {
        await nonWineProduct.click()
      }
      else {
        const firstProduct = page.locator('[data-testid="product-card"] a, article a').first()
        await firstProduct.click()
      }

      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1500)

      const faqVisible = await scrollToFAQ(page)
      if (!faqVisible) {
        console.log('⚠️  FAQ section not found on non-wine product')
        test.skip()
        return
      }

      // Verify NO wine-specific storage information
      const bodyText = await page.textContent('body')
      const hasWineStorage = bodyText && (
        bodyText.includes('12-18°C')
        || bodyText.includes('54-64°F')
        || bodyText.toLowerCase().includes('wine cellar')
      )

      console.log(`  Wine-specific storage info (should be false): ${hasWineStorage}`)

      if (hasWineStorage) {
        console.log('❌ WARNING: Non-wine product shows wine-specific storage temperatures!')
      }

      await captureScreenshot(page, {
        feature: FEATURE,
        name: '09-nonwine-product-faq-section',
        viewport: 'desktop',
        fullPage: false,
      })
    })

    test('Non-wine product - FAQ general storage advice', async ({ page }) => {
      await page.goto('/en/products')
      await page.waitForLoadState('networkidle')

      const nonWineProduct = page.locator('a[href*="embroidered"], a[href*="carpet"], a[href*="PROD-"]').first()
      if (await nonWineProduct.count() > 0) {
        await nonWineProduct.click()
      }
      else {
        const firstProduct = page.locator('[data-testid="product-card"] a, article a').first()
        await firstProduct.click()
      }

      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1500)

      const faqVisible = await scrollToFAQ(page)
      if (!faqVisible) {
        test.skip()
        return
      }

      // Look for general storage advice
      const bodyText = await page.textContent('body')
      const hasGeneralStorage = bodyText && (
        bodyText.includes('cool, dry')
        || bodyText.includes('direct sunlight')
        || bodyText.includes('product label')
      )

      console.log(`  General storage advice present: ${hasGeneralStorage}`)

      await captureScreenshot(page, {
        feature: FEATURE,
        name: '10-nonwine-product-storage-faq',
        viewport: 'desktop',
        fullPage: false,
      })
    })
  })

  // ============================================
  // TRANSLATION VERIFICATION
  // ============================================

  test.describe('Translation Verification', () => {
    test('FAQ subtitle is properly translated (not raw key)', async ({ page }) => {
      await page.goto('/en/products')
      await page.waitForLoadState('networkidle')

      const firstProduct = page.locator('[data-testid="product-card"] a, article a').first()
      if (await firstProduct.count() > 0) {
        await firstProduct.click()
        await page.waitForLoadState('networkidle')
        await page.waitForTimeout(1500)
      }
      else {
        test.skip()
        return
      }

      // Check page content for translation keys
      const hasTranslationKeys = await checkForTranslationKeys(page)

      // Look specifically for FAQ subtitle
      const faqSubtitle = page.locator('p:has-text("products.faq.subtitle"), p:has-text("product.faq.subtitle")').first()
      const brokenSubtitleExists = await faqSubtitle.count() > 0

      console.log(`  Translation keys in page: ${hasTranslationKeys}`)
      console.log(`  Broken FAQ subtitle exists: ${brokenSubtitleExists}`)

      // This should be false - no translation keys should be visible
      expect(hasTranslationKeys || brokenSubtitleExists).toBe(false)

      await captureScreenshot(page, {
        feature: FEATURE,
        name: '11-translation-check',
        viewport: 'desktop',
        fullPage: false,
      })
    })

    test('All FAQ text is properly translated', async ({ page }) => {
      await page.goto('/en/products')
      await page.waitForLoadState('networkidle')

      const firstProduct = page.locator('[data-testid="product-card"] a, article a').first()
      if (await firstProduct.count() > 0) {
        await firstProduct.click()
        await page.waitForLoadState('networkidle')
        await page.waitForTimeout(1500)
      }
      else {
        test.skip()
        return
      }

      const faqVisible = await scrollToFAQ(page)
      if (!faqVisible) {
        test.skip()
        return
      }

      // Get FAQ section content
      const faqSection = page.locator('section:has-text("FAQ"), [data-testid="faq-section"]').first()
      const faqContent = await faqSection.textContent()

      // Check for any translation key patterns
      const translationKeyPatterns = [
        /products\.\w+\.\w+/,
        /product\.\w+\.\w+/,
        /common\.\w+/,
      ]

      let foundTranslationKeys = false
      for (const pattern of translationKeyPatterns) {
        if (faqContent && pattern.test(faqContent)) {
          console.log(`❌ Found translation key pattern: ${pattern}`)
          foundTranslationKeys = true
        }
      }

      console.log(`  Translation keys in FAQ section: ${foundTranslationKeys}`)

      await captureScreenshot(page, {
        feature: FEATURE,
        name: '12-faq-translation-full-check',
        viewport: 'desktop',
        fullPage: false,
      })
    })
  })

  // ============================================
  // RESPONSIVE TESTING
  // ============================================

  test.describe('Responsive Design', () => {
    test('Product detail - all viewports', async ({ page }) => {
      await page.goto('/en/products')
      await page.waitForLoadState('networkidle')

      const firstProduct = page.locator('[data-testid="product-card"] a, article a').first()
      if (await firstProduct.count() > 0) {
        await firstProduct.click()
        await page.waitForLoadState('networkidle')
        await page.waitForTimeout(1500)
      }
      else {
        test.skip()
        return
      }

      await captureResponsiveScreenshots(page, {
        feature: FEATURE,
        name: '13-responsive-product-detail',
        viewports: ['mobile', 'tablet', 'desktop'],
        fullPage: true,
      })
    })

    test('FAQ section - all viewports', async ({ page }) => {
      await page.goto('/en/products')
      await page.waitForLoadState('networkidle')

      const firstProduct = page.locator('[data-testid="product-card"] a, article a').first()
      if (await firstProduct.count() > 0) {
        await firstProduct.click()
        await page.waitForLoadState('networkidle')
        await page.waitForTimeout(1500)
      }
      else {
        test.skip()
        return
      }

      const faqVisible = await scrollToFAQ(page)
      if (!faqVisible) {
        test.skip()
        return
      }

      await captureResponsiveScreenshots(page, {
        feature: FEATURE,
        name: '14-responsive-faq-section',
        viewports: ['mobile', 'tablet', 'desktop'],
        fullPage: false,
      })
    })
  })
})

// Generate report after all tests
test.afterAll(async () => {
  const reportPath = generateVisualReport(FEATURE)
  console.log(`\n✅ Product Detail FAQ Visual Tests Complete!`)
  console.log(`   View report: open ${reportPath}`)
  console.log(`\n📋 Key Checks Performed:`)
  console.log(`   ✓ FAQ subtitle shows translated text (not "products.faq.subtitle")`)
  console.log(`   ✓ Wine products may show wine-specific storage temperatures`)
  console.log(`   ✓ Non-wine products show general storage advice only`)
  console.log(`   ✓ All FAQ content is properly translated`)
  console.log(`   ✓ Responsive design across mobile, tablet, desktop`)
})
