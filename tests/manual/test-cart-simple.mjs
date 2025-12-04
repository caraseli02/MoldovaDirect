/**
 * Simple Cart Test - Add Product and Navigate to Cart
 *
 * This test verifies:
 * 1. Product can be added to cart
 * 2. Cart persists when navigating to cart page
 */

import { chromium } from 'playwright'

async function testCartNavigation() {
  console.log('🧪 Simple Cart Navigation Test\n')

  const browser = await chromium.launch({
    headless: false,
    slowMo: 300
  })

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    locale: 'es-ES'
  })

  const page = await context.newPage()

  // Capture ALL console messages
  page.on('console', msg => {
    const type = msg.type()
    const text = msg.text()
    // Show cart-related logs and errors
    if (text.includes('📥') || text.includes('💾') || text.includes('🔄') || text.includes('🛒') ||
        text.includes('splice') || text.includes('Attempting') || text.includes('Current items') ||
        text.includes('After splice') || text.includes('❌') || type === 'error') {
      console.log(`[${type}] ${text}`)
    }
  })

  try {
    console.log('📍 Step 1: Navigate to products page')
    await page.goto('http://localhost:3000/products')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    console.log('\n📍 Step 2: Add product to cart')
    const addToCartButton = await page.locator('button:has-text("Añadir al Carrito")').first()
    await addToCartButton.click()
    await page.waitForTimeout(4000) // Wait for debounced save (1 second) + buffer

    console.log('\n📍 Step 3: Navigate to cart page (triggers reload)')
    await page.goto('http://localhost:3000/cart')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000)

    // Check if cart has items
    const emptyMessage = await page.locator('text=Tu carrito está vacío').isVisible().catch(() => false)

    if (emptyMessage) {
      console.log('\n❌ FAIL: Cart shows as empty after navigation')
    } else {
      console.log('\n✅ PASS: Cart has items after navigation')
    }

    console.log('\n⏸️  Browser will stay open for 30 seconds...')
    await page.waitForTimeout(30000)

  } catch (error) {
    console.error('❌ Test error:', error.message)
    await page.waitForTimeout(10000)
  }

  await browser.close()
}

testCartNavigation().catch(console.error)
