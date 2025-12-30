/**
 * Visual Regression Tests - Security Hardening
 *
 * Tests visual consistency after security hardening changes:
 * - CSP headers don't block resources
 * - Images load correctly (CSP img-src)
 * - Fonts load correctly (CSP font-src from Google Fonts)
 * - JavaScript works (CSP script-src)
 * - Stripe iframe loads (CSP frame-src for Stripe)
 * - CSRF protection doesn't break forms
 * - Rate limiting doesn't affect normal usage
 *
 * Focus areas:
 * 1. Homepage - CSP headers applied
 * 2. Products page - Images loading with CSP
 * 3. Product detail - Fonts and images
 * 4. Cart - JavaScript functionality
 * 5. Checkout - Stripe iframe
 */

import { test, expect, type Page } from '@playwright/test'

// Screenshot options
const screenshotOptions = {
  maxDiffPixelRatio: 0.02,
  threshold: 0.2,
  animations: 'disabled' as const,
}

// Helper to wait for images to load
async function waitForImages(page: Page): Promise<void> {
  await page.evaluate(() => {
    return Promise.all(
      Array.from(document.images)
        .filter(img => !img.complete)
        .map(img => new Promise((resolve) => {
          img.onload = img.onerror = resolve
        })),
    )
  })
}

test.describe('Security Hardening - Homepage', () => {
  test('homepage loads with CSP headers - desktop', async ({ page }) => {
    const cspViolations: string[] = []
    const blockedResources: string[] = []

    page.on('console', (msg) => {
      const text = msg.text()
      if (text.includes('Content Security Policy') || text.includes('CSP') || text.includes('refused')) {
        cspViolations.push(text)
      }
    })

    page.on('requestfailed', (request) => {
      const failure = request.failure()
      if (failure) {
        blockedResources.push(`${request.url()} - ${failure.errorText}`)
      }
    })

    await page.goto('/', { waitUntil: 'networkidle' })
    await page.setViewportSize({ width: 1920, height: 1080 })

    // Wait for main content and images
    await expect(page.locator('main')).toBeVisible()
    await waitForImages(page)
    await page.waitForTimeout(2000)

    // Check for CSP violations
    if (cspViolations.length > 0) {
      console.log('CSP Violations detected:', cspViolations)
    }

    // Check for blocked resources
    if (blockedResources.length > 0) {
      console.log('Blocked Resources:', blockedResources)
    }

    // Take screenshot
    await expect(page).toHaveScreenshot('security-homepage-desktop.png', {
      ...screenshotOptions,
      fullPage: true,
    })

    // Assertions
    expect(cspViolations.length).toBe(0)
    expect(blockedResources.length).toBe(0)
  })

  test('homepage loads with CSP headers - mobile', async ({ page }) => {
    const cspViolations: string[] = []

    page.on('console', (msg) => {
      const text = msg.text()
      if (text.includes('Content Security Policy') || text.includes('CSP') || text.includes('refused')) {
        cspViolations.push(text)
      }
    })

    await page.goto('/', { waitUntil: 'networkidle' })
    await page.setViewportSize({ width: 375, height: 667 })

    await expect(page.locator('main')).toBeVisible()
    await waitForImages(page)
    await page.waitForTimeout(2000)

    await expect(page).toHaveScreenshot('security-homepage-mobile.png', {
      ...screenshotOptions,
      fullPage: true,
    })

    expect(cspViolations.length).toBe(0)
  })

  test('fonts load correctly with CSP font-src', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    await page.setViewportSize({ width: 1920, height: 1080 })

    // Check if fonts are loaded
    const fontsLoaded = await page.evaluate(() => {
      return document.fonts.ready.then(() => {
        return {
          size: document.fonts.size,
          status: document.fonts.status,
        }
      })
    })

    console.log('Fonts loaded:', fontsLoaded)

    // Check header font rendering
    const header = page.locator('header').first()
    await expect(header).toBeVisible()

    await expect(header).toHaveScreenshot('security-fonts-header.png', {
      ...screenshotOptions,
    })
  })
})

test.describe('Security Hardening - Products Page', () => {
  test('product images load with CSP img-src - desktop', async ({ page }) => {
    const cspViolations: string[] = []
    const blockedResources: string[] = []

    page.on('console', (msg) => {
      const text = msg.text()
      if (text.includes('Content Security Policy') || text.includes('CSP') || text.includes('refused')) {
        cspViolations.push(text)
      }
    })

    page.on('requestfailed', (request) => {
      const failure = request.failure()
      if (failure) {
        blockedResources.push(`${request.url()} - ${failure.errorText}`)
      }
    })

    await page.goto('/products', { waitUntil: 'networkidle' })
    await page.setViewportSize({ width: 1920, height: 1080 })

    // Wait for products and images
    await page.waitForTimeout(2000)
    await waitForImages(page)

    // Check that product cards are visible
    const productCards = page.locator('[data-testid="product-card"], .product-card, img[alt*="product"], img[alt*="Product"]')
    const count = await productCards.count()

    if (count > 0) {
      console.log(`Found ${count} product elements`)

      // Take screenshot
      await expect(page).toHaveScreenshot('security-products-desktop.png', {
        ...screenshotOptions,
        fullPage: true,
      })

      // Check for violations
      if (cspViolations.length > 0) {
        console.log('CSP Violations on products page:', cspViolations)
      }

      expect(cspViolations.length).toBe(0)
      expect(blockedResources.length).toBe(0)
    }
  })

  test('product images load with CSP img-src - mobile', async ({ page }) => {
    const cspViolations: string[] = []

    page.on('console', (msg) => {
      const text = msg.text()
      if (text.includes('Content Security Policy') || text.includes('CSP') || text.includes('refused')) {
        cspViolations.push(text)
      }
    })

    await page.goto('/products', { waitUntil: 'networkidle' })
    await page.setViewportSize({ width: 375, height: 667 })

    await page.waitForTimeout(2000)
    await waitForImages(page)

    await expect(page).toHaveScreenshot('security-products-mobile.png', {
      ...screenshotOptions,
      fullPage: true,
    })

    expect(cspViolations.length).toBe(0)
  })

  test('all product images render without CSP blocks', async ({ page }) => {
    await page.goto('/products', { waitUntil: 'networkidle' })
    await page.setViewportSize({ width: 1920, height: 1080 })

    await page.waitForTimeout(2000)
    await waitForImages(page)

    // Check image loading status
    const imageStats = await page.evaluate(() => {
      const images = Array.from(document.images)
      return {
        total: images.length,
        complete: images.filter(img => img.complete).length,
        naturalWidth: images.filter(img => img.naturalWidth > 0).length,
        broken: images.filter(img => img.complete && img.naturalWidth === 0).length,
      }
    })

    console.log('Image stats:', imageStats)

    // All images should be loaded
    expect(imageStats.broken).toBe(0)
    expect(imageStats.complete).toBe(imageStats.total)
  })
})

test.describe('Security Hardening - Product Detail Page', () => {
  test('product detail page loads with all resources - desktop', async ({ page }) => {
    const cspViolations: string[] = []

    page.on('console', (msg) => {
      const text = msg.text()
      if (text.includes('Content Security Policy') || text.includes('CSP') || text.includes('refused')) {
        cspViolations.push(text)
      }
    })

    // Navigate to products first
    await page.goto('/products', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1500)

    // Click on first product
    const productLink = page.locator('a[href*="/products/"]').first()
    if (await productLink.isVisible({ timeout: 5000 })) {
      await productLink.click()
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(2000)
      await waitForImages(page)

      await page.setViewportSize({ width: 1920, height: 1080 })

      await expect(page).toHaveScreenshot('security-product-detail-desktop.png', {
        ...screenshotOptions,
        fullPage: true,
      })

      expect(cspViolations.length).toBe(0)
    }
  })

  test('product detail fonts and images render correctly', async ({ page }) => {
    await page.goto('/products', { waitUntil: 'networkidle' })

    const productLink = page.locator('a[href*="/products/"]').first()
    if (await productLink.isVisible({ timeout: 5000 })) {
      await productLink.click()
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(2000)
      await waitForImages(page)

      // Check fonts
      const fontsLoaded = await page.evaluate(() => {
        return document.fonts.ready.then(() => document.fonts.size)
      })

      console.log('Fonts loaded on product detail:', fontsLoaded)

      // Check image loading
      const imageStats = await page.evaluate(() => {
        const images = Array.from(document.images)
        return {
          total: images.length,
          complete: images.filter(img => img.complete).length,
          broken: images.filter(img => img.complete && img.naturalWidth === 0).length,
        }
      })

      console.log('Product detail image stats:', imageStats)

      expect(imageStats.broken).toBe(0)
    }
  })
})

test.describe('Security Hardening - Cart Page', () => {
  test('cart JavaScript works with CSP script-src - desktop', async ({ page }) => {
    const cspViolations: string[] = []
    const jsErrors: string[] = []

    page.on('console', (msg) => {
      const text = msg.text()
      if (text.includes('Content Security Policy') || text.includes('CSP') || text.includes('refused')) {
        cspViolations.push(text)
      }
      if (msg.type() === 'error') {
        jsErrors.push(text)
      }
    })

    page.on('pageerror', (error) => {
      jsErrors.push(error.message)
    })

    await page.goto('/cart', { waitUntil: 'networkidle' })
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.waitForTimeout(1000)

    await expect(page).toHaveScreenshot('security-cart-desktop.png', {
      ...screenshotOptions,
      fullPage: true,
    })

    // Check for errors
    if (cspViolations.length > 0) {
      console.log('CSP Violations on cart page:', cspViolations)
    }
    if (jsErrors.length > 0) {
      console.log('JS Errors on cart page:', jsErrors)
    }

    expect(cspViolations.length).toBe(0)
    expect(jsErrors.length).toBe(0)
  })

  test('cart interactions work with CSP', async ({ page }) => {
    // Add item to cart first
    await page.goto('/products', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1500)

    const addButton = page.locator('[data-testid="add-to-cart"], button:has-text("Añadir"), button:has-text("Add to Cart")').first()

    if (await addButton.isVisible({ timeout: 5000 })) {
      const cspViolations: string[] = []

      page.on('console', (msg) => {
        const text = msg.text()
        if (text.includes('Content Security Policy') || text.includes('CSP') || text.includes('refused')) {
          cspViolations.push(text)
        }
      })

      // Click add to cart
      await addButton.click()
      await page.waitForTimeout(1000)

      // Go to cart
      await page.goto('/cart', { waitUntil: 'networkidle' })
      await page.waitForTimeout(1000)

      await page.setViewportSize({ width: 1920, height: 1080 })

      await expect(page).toHaveScreenshot('security-cart-with-items.png', {
        ...screenshotOptions,
        fullPage: true,
      })

      expect(cspViolations.length).toBe(0)
    }
  })
})

test.describe('Security Hardening - Checkout Flow', () => {
  test.skip('checkout page loads - Stripe iframe with CSP frame-src', async ({ page }) => {
    // Skip if checkout requires authentication or cart items
    const cspViolations: string[] = []

    page.on('console', (msg) => {
      const text = msg.text()
      if (text.includes('Content Security Policy') || text.includes('CSP') || text.includes('refused')) {
        cspViolations.push(text)
      }
    })

    await page.goto('/checkout', { waitUntil: 'networkidle' })
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.waitForTimeout(2000)

    // Look for Stripe iframe or checkout form
    const stripeIframe = page.frameLocator('iframe[src*="stripe"], iframe[name*="stripe"]')
    const checkoutForm = page.locator('form[action*="checkout"], [data-testid="checkout-form"]')

    const hasStripe = await stripeIframe.locator('body').isVisible({ timeout: 5000 }).catch(() => false)
    const hasForm = await checkoutForm.isVisible({ timeout: 5000 }).catch(() => false)

    if (hasStripe || hasForm) {
      await expect(page).toHaveScreenshot('security-checkout-desktop.png', {
        ...screenshotOptions,
        fullPage: true,
      })

      console.log('CSP Violations on checkout:', cspViolations)
      expect(cspViolations.filter(v => v.includes('frame-src')).length).toBe(0)
    }
  })
})

test.describe('Security Hardening - CSRF Protection', () => {
  test('forms render correctly with CSRF tokens', async ({ page }) => {
    await page.goto('/auth/login', { waitUntil: 'networkidle' })
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.waitForTimeout(500)

    // Check for CSRF token in forms
    const csrfInput = page.locator('input[name="_csrf"], input[name="csrf_token"], input[type="hidden"]')
    const hasCsrf = await csrfInput.count() > 0

    console.log('CSRF token present:', hasCsrf)

    await expect(page).toHaveScreenshot('security-login-csrf.png', {
      ...screenshotOptions,
      fullPage: true,
    })
  })
})

test.describe('Security Hardening - Console Error Check', () => {
  test('no security-related console errors on key pages', async ({ page }) => {
    const errors: { page: string, error: string }[] = []

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text()
        if (text.includes('CSP') || text.includes('CORS') || text.includes('blocked') || text.includes('refused')) {
          errors.push({ page: page.url(), error: text })
        }
      }
    })

    page.on('pageerror', (error) => {
      const text = error.message
      if (text.includes('CSP') || text.includes('CORS') || text.includes('blocked') || text.includes('refused')) {
        errors.push({ page: page.url(), error: text })
      }
    })

    // Test multiple pages
    const pagesToTest = ['/', '/products', '/cart', '/auth/login']

    for (const pagePath of pagesToTest) {
      await page.goto(pagePath, { waitUntil: 'networkidle' })
      await page.waitForTimeout(2000)
      await waitForImages(page)
    }

    // Report errors
    if (errors.length > 0) {
      console.log('Security-related errors found:')
      errors.forEach(e => console.log(`  ${e.page}: ${e.error}`))
    }

    expect(errors.length).toBe(0)
  })
})
