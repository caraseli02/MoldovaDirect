import { test } from '@playwright/test'
import {
  captureScreenshot,
  captureResponsiveScreenshots,
  VIEWPORTS,
  type ViewportName,
} from '../../../.visual-testing/utils'

// Products to test (3 different product types)
const TEST_PRODUCTS = [
  { slug: 'PROD-1763645506847-14', name: 'embroidered-shirt-15', category: 'clothing' },
  { slug: 'PROD-1763645506847-17', name: 'handwoven-carpet-18', category: 'home' },
  { slug: 'PROD-1763645506847-20', name: 'painted-easter-eggs-20', category: 'food' },
]

// Viewports to test
const VIEWPORT_NAMES: ViewportName[] = ['mobile', 'tablet', 'desktop']

test.describe('Product Detail Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to products page first
    await page.goto('http://localhost:3000/products')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000) // Allow animations to complete
  })

  TEST_PRODUCTS.forEach((product) => {
    test.describe(`Product: ${product.name}`, () => {
      VIEWPORT_NAMES.forEach((viewport) => {
        test(`Full page - ${viewport}`, async ({ page }) => {
          await page.setViewportSize(VIEWPORTS[viewport])

          // Navigate to product detail page
          await page.goto(`http://localhost:3000/products/${product.slug}`)
          await page.waitForLoadState('networkidle')
          await page.waitForTimeout(1500) // Wait for all content to load

          // Capture full page screenshot
          await captureScreenshot(page, {
            feature: 'product-detail',
            name: `${product.name}-full-page`,
            viewport,
            fullPage: true,
          })
        })

        test(`Product info section - ${viewport}`, async ({ page }) => {
          await page.setViewportSize(VIEWPORTS[viewport])

          await page.goto(`http://localhost:3000/products/${product.slug}`)
          await page.waitForLoadState('networkidle')
          await page.waitForTimeout(1500)

          // Capture product info section
          const productInfo = page.locator('[data-testid="product-info"]').first()
          if (await productInfo.count() > 0) {
            await captureScreenshot(page, {
              feature: 'product-detail',
              name: `${product.name}-product-info`,
              viewport,
              fullPage: false,
            })
          }
        })

        test(`Image gallery - ${viewport}`, async ({ page }) => {
          await page.setViewportSize(VIEWPORTS[viewport])

          await page.goto(`http://localhost:3000/products/${product.slug}`)
          await page.waitForLoadState('networkidle')
          await page.waitForTimeout(1500)

          // Capture image gallery section
          const gallery = page.locator('[data-testid="product-gallery"], .swiper').first()
          if (await gallery.count() > 0) {
            await captureScreenshot(page, {
              feature: 'product-detail',
              name: `${product.name}-image-gallery`,
              viewport,
              fullPage: false,
            })
          }
        })
      })

      test(`Mobile sticky bar - mobile only`, async ({ page }) => {
        await page.setViewportSize(VIEWPORTS['mobile'])

        await page.goto(`http://localhost:3000/products/${product.slug}`)
        await page.waitForLoadState('networkidle')
        await page.waitForTimeout(1500)

        // Scroll to bottom to trigger sticky bar
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
        await page.waitForTimeout(500)

        // Capture sticky bar if present
        const stickyBar = page.locator('[data-testid="mobile-sticky-bar"], .fixed.bottom-0').first()
        if (await stickyBar.count() > 0) {
          await captureScreenshot(page, {
            feature: 'product-detail',
            name: `${product.name}-mobile-sticky-bar`,
            viewport: 'mobile',
            fullPage: false,
          })
        }
      })

      test(`FAQ section - all viewports`, async ({ page }) => {
        await page.setViewportSize(VIEWPORTS['desktop'])

        await page.goto(`http://localhost:3000/products/${product.slug}`)
        await page.waitForLoadState('networkidle')
        await page.waitForTimeout(1500)

        // Scroll to FAQ section
        const faqSection = page.locator('[data-testid="faq-section"], section:has-text("FAQ")').first()
        if (await faqSection.count() > 0) {
          await faqSection.scrollIntoViewIfNeeded()
          await page.waitForTimeout(500)

          await captureScreenshot(page, {
            feature: 'product-detail',
            name: `${product.name}-faq-section`,
            viewport: 'desktop',
            fullPage: false,
          })
        }
      })

      test(`Related products section - all viewports`, async ({ page }) => {
        await page.setViewportSize(VIEWPORTS['desktop'])

        await page.goto(`http://localhost:3000/products/${product.slug}`)
        await page.waitForLoadState('networkidle')
        await page.waitForTimeout(1500)

        // Scroll to related products
        const relatedSection = page.locator('[data-testid="related-products"], section:has-text("Relacionados")').first()
        if (await relatedSection.count() > 0) {
          await relatedSection.scrollIntoViewIfNeeded()
          await page.waitForTimeout(500)

          await captureScreenshot(page, {
            feature: 'product-detail',
            name: `${product.name}-related-products`,
            viewport: 'desktop',
            fullPage: false,
          })
        }
      })

      test(`Add to cart sidebar interaction - desktop`, async ({ page }) => {
        await page.setViewportSize(VIEWPORTS['desktop'])

        await page.goto(`http://localhost:3000/products/${product.slug}`)
        await page.waitForLoadState('networkidle')
        await page.waitForTimeout(1500)

        // Click add to cart button
        const addToCartBtn = page.locator('button:has-text("Añadir al Carrito"), button:has-text("Add to Cart")').first()
        if (await addToCartBtn.count() > 0) {
          await addToCartBtn.click()
          await page.waitForTimeout(1000)

          // Capture with cart sidebar open
          await captureScreenshot(page, {
            feature: 'product-detail',
            name: `${product.name}-cart-sidebar-open`,
            viewport: 'desktop',
            fullPage: false,
          })
        }
      })
    })
  })

  test('Responsive screenshots for all products', async ({ page }) => {
    for (const product of TEST_PRODUCTS) {
      await page.goto(`http://localhost:3000/products/${product.slug}`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1500)

      await captureResponsiveScreenshots(page, {
        feature: 'product-detail',
        name: `${product.name}-responsive`,
      })
    }
  })
})
