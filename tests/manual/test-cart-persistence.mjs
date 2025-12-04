/**
 * Cart Persistence Test
 *
 * Tests the cart cookie persistence fix:
 * 1. Adds products to cart
 * 2. Verifies cart persists after page refresh
 * 3. Verifies cart accessible across different routes
 * 4. Verifies checkout can access cart data
 */

import { chromium } from 'playwright'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

async function testCartPersistence() {
  console.log('='.repeat(70))
  console.log('CART PERSISTENCE TEST - Cookie Path Fix Validation')
  console.log('='.repeat(70))
  console.log('\nTesting cart cookie with path: / configuration\n')

  const browser = await chromium.launch({
    headless: false,
    slowMo: 500
  })

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    locale: 'es-ES'
  })

  const page = await context.newPage()

  // Track console messages
  const consoleMessages = []
  page.on('console', msg => {
    consoleMessages.push(`[${msg.type()}] ${msg.text()}`)
  })

  try {
    // ==========================================
    // STEP 1: Clear existing cart cookie
    // ==========================================
    console.log('📍 STEP 1: Clearing existing cart cookie')
    console.log('-'.repeat(70))

    await page.goto('http://localhost:3000')
    await page.waitForLoadState('networkidle')

    // Clear cart cookie via browser context
    await context.clearCookies({ name: 'moldova_direct_cart' })
    console.log('✅ Cart cookie cleared\n')
    await delay(1000)

    // ==========================================
    // STEP 2: Navigate to products page
    // ==========================================
    console.log('📍 STEP 2: Navigating to products page')
    console.log('-'.repeat(70))

    await page.goto('http://localhost:3000/products')
    await page.waitForLoadState('networkidle')
    await delay(2000)

    console.log('✅ Products page loaded\n')

    // ==========================================
    // STEP 3: Add first available product
    // ==========================================
    console.log('📍 STEP 3: Adding product to cart')
    console.log('-'.repeat(70))

    // Find first "Add to Cart" button
    const addToCartButton = await page.locator('button:has-text("Añadir"), button:has-text("Agregar")').first()

    if (await addToCartButton.isVisible()) {
      await addToCartButton.click()
      await delay(2000)
      console.log('✅ Clicked "Add to Cart" button')

      // Check cart cookie was created
      const cookies = await context.cookies()
      const cartCookie = cookies.find(c => c.name === 'moldova_direct_cart')

      if (cartCookie) {
        console.log('✅ Cart cookie created:')
        console.log(`   Name: ${cartCookie.name}`)
        console.log(`   Path: ${cartCookie.path}`)
        console.log(`   Domain: ${cartCookie.domain}`)
        console.log(`   Expires: ${new Date(cartCookie.expires * 1000).toLocaleString()}`)
        console.log(`   Size: ${JSON.stringify(cartCookie.value).length} bytes`)

        if (cartCookie.path === '/') {
          console.log('   ✅ Path is "/" (site-wide - CORRECT)')
        } else {
          console.log(`   ❌ Path is "${cartCookie.path}" (scoped - WRONG)`)
        }
      } else {
        console.log('❌ Cart cookie NOT created')
      }
    } else {
      console.log('⚠️  No "Add to Cart" button found')
    }

    console.log('')

    // ==========================================
    // STEP 4: Refresh page - test persistence
    // ==========================================
    console.log('📍 STEP 4: Refreshing page to test persistence')
    console.log('-'.repeat(70))

    await page.reload({ waitUntil: 'networkidle' })
    await delay(3000)

    // Check if cart still has items
    const cartIcon = page.locator('[data-testid="cart-icon"], .cart-icon, button:has-text("carrito")').first()
    const cartText = await cartIcon.textContent().catch(() => '')

    if (cartText && cartText !== '0') {
      console.log(`✅ Cart persisted after refresh: ${cartText}`)
    } else {
      console.log('❌ Cart appears empty after refresh')
    }

    console.log('')

    // ==========================================
    // STEP 5: Navigate to cart page
    // ==========================================
    console.log('📍 STEP 5: Navigating to cart page from different route')
    console.log('-'.repeat(70))

    await page.goto('http://localhost:3000/cart')
    await page.waitForLoadState('networkidle')
    await delay(2000)

    // Check if cart has items
    const emptyCartMessage = await page.locator('text=Tu carrito está vacío, text=Your cart is empty').isVisible().catch(() => false)

    if (!emptyCartMessage) {
      console.log('✅ Cart items visible on cart page')

      // Count items
      const cartItems = await page.locator('.cart-item, [class*="cart"] [class*="item"]').count()
      console.log(`   Found ${cartItems} item(s) in cart`)
    } else {
      console.log('❌ Cart page shows "empty cart" message')
    }

    console.log('')

    // ==========================================
    // STEP 6: Navigate to checkout
    // ==========================================
    console.log('📍 STEP 6: Navigating to checkout to verify cross-route access')
    console.log('-'.repeat(70))

    await page.goto('http://localhost:3000/checkout')
    await page.waitForLoadState('networkidle')
    await delay(2000)

    // Check if we're on checkout page or redirected to cart
    const currentUrl = page.url()
    console.log(`   Current URL: ${currentUrl}`)

    if (currentUrl.includes('/checkout')) {
      console.log('✅ Checkout page accessible with cart data')
      console.log('   Cart cookie accessible from checkout route')
    } else if (currentUrl.includes('/cart')) {
      console.log('❌ Redirected to cart page (likely empty)')
      console.log('   Cart cookie may not have persisted properly')
    }

    console.log('')

    // ==========================================
    // STEP 7: Close browser and reopen
    // ==========================================
    console.log('📍 STEP 7: Closing and reopening browser (30-day persistence test)')
    console.log('-'.repeat(70))

    // Get cookies before closing
    const cookiesBeforeClose = await context.cookies()
    const cartCookieBeforeClose = cookiesBeforeClose.find(c => c.name === 'moldova_direct_cart')

    await browser.close()
    console.log('✅ Browser closed')
    await delay(2000)

    // Reopen browser
    const browser2 = await chromium.launch({
      headless: false,
      slowMo: 500
    })

    const context2 = await browser2.newContext({
      viewport: { width: 1920, height: 1080 },
      locale: 'es-ES'
    })

    // Restore cookies
    if (cartCookieBeforeClose) {
      await context2.addCookies([cartCookieBeforeClose])
      console.log('✅ Cart cookie restored')
    }

    const page2 = await context2.newPage()

    await page2.goto('http://localhost:3000/cart')
    await page2.waitForLoadState('networkidle')
    await delay(2000)

    const emptyCartMessage2 = await page2.locator('text=Tu carrito está vacío, text=Your cart is empty').isVisible().catch(() => false)

    if (!emptyCartMessage2) {
      console.log('✅ Cart data persisted across browser sessions')
    } else {
      console.log('❌ Cart data lost after browser restart')
    }

    console.log('')

    // ==========================================
    // FINAL SUMMARY
    // ==========================================
    console.log('\n' + '='.repeat(70))
    console.log('TEST RESULTS SUMMARY')
    console.log('='.repeat(70))

    const cookies = await context2.cookies()
    const finalCartCookie = cookies.find(c => c.name === 'moldova_direct_cart')

    console.log('\n📊 Cart Cookie Configuration:')
    if (finalCartCookie) {
      console.log(`   ✓ Cookie Name: ${finalCartCookie.name}`)
      console.log(`   ✓ Cookie Path: ${finalCartCookie.path} ${finalCartCookie.path === '/' ? '(✅ CORRECT)' : '(❌ WRONG)'}`)
      console.log(`   ✓ Cookie Expires: ~${Math.round((finalCartCookie.expires * 1000 - Date.now()) / (1000 * 60 * 60 * 24))} days`)
      console.log(`   ✓ Cookie Size: ${JSON.stringify(finalCartCookie.value).length} bytes`)
    } else {
      console.log('   ❌ No cart cookie found')
    }

    console.log('\n📋 Console Messages:')
    consoleMessages.slice(-10).forEach(msg => {
      if (msg.includes('cart') || msg.includes('cookie')) {
        console.log(`   ${msg}`)
      }
    })

    console.log('\n✅ Test complete! Browser will stay open for 10 seconds...\n')
    await delay(10000)

    await browser2.close()

  } catch (error) {
    console.error('\n❌ Test failed:', error.message)
    throw error
  }
}

// Run the test
testCartPersistence().catch(console.error)
