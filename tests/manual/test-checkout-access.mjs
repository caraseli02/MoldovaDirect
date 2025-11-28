/**
 * Minimal Checkout Access Test - SSR Error Verification
 *
 * Tests that checkout page loads without SSR errors
 */

import { chromium } from 'playwright'

async function testCheckoutAccess() {
  console.log('🧪 Checkout Access Test - SSR Error Verification\n')

  const browser = await chromium.launch({
    headless: false,
    slowMo: 300
  })

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    locale: 'es-ES'
  })

  const page = await context.newPage()

  // Track console errors
  const errors = []
  page.on('console', msg => {
    const type = msg.type()
    const text = msg.text()
    if (type === 'error' || text.includes('useCartStore') || text.includes('H3Error')) {
      errors.push({ type, text })
      console.log(`[${type}] ${text}`)
    }
  })

  try {
    // Step 1: Login
    console.log('📍 Step 1: Login')
    await page.goto('http://localhost:3000/login')
    await page.waitForLoadState('networkidle')
    await page.fill('input[type="email"]', 'customer@moldovadirect.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('http://localhost:3000/')
    await page.waitForTimeout(2000)
    console.log('✅ Logged in')

    // Step 2: Add product to cart
    console.log('\n📍 Step 2: Add product to cart')
    await page.goto('http://localhost:3000/products')
    await page.waitForLoadState('networkidle')
    const addButton = await page.locator('button:has-text("Añadir al Carrito")').first()
    await addButton.click()
    await page.waitForTimeout(3000)
    console.log('✅ Product added to cart')

    // Step 3: Navigate to checkout
    console.log('\n📍 Step 3: Navigate to checkout')
    await page.goto('http://localhost:3000/checkout')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000)

    // Check for errors
    const hasSSRError = errors.some(e => e.text.includes('useCartStore'))
    const has500Error = await page.locator('text=500').isVisible().catch(() => false)

    console.log('\n' + '='.repeat(70))
    console.log('TEST RESULTS')
    console.log('='.repeat(70))

    if (hasSSRError) {
      console.log('❌ SSR Error: useCartStore is not defined')
      console.log('   Errors found:', errors.length)
      errors.forEach(e => console.log(`   - ${e.text.substring(0, 100)}`))
    } else if (has500Error) {
      console.log('❌ 500 Error Page Displayed')
    } else {
      console.log('✅ PASS: Checkout page loaded without SSR errors!')
      console.log(`   Console errors: ${errors.length}`)
      if (errors.length > 0) {
        console.log('   Other errors:')
        errors.forEach(e => console.log(`   - ${e.text.substring(0, 100)}`))
      }
    }

    console.log('='.repeat(70))

    console.log('\n⏸️  Browser will stay open for 15 seconds...')
    await page.waitForTimeout(15000)

  } catch (error) {
    console.error('❌ Test error:', error.message)
    await page.waitForTimeout(10000)
  }

  await browser.close()
}

testCheckoutAccess().catch(console.error)
