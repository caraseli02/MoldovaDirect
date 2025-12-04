/**
 * Manual Cart Test - Simple Verification
 *
 * Opens browser to manually verify:
 * 1. Can add product to cart
 * 2. Cart cookie is created
 * 3. Cart persists across routes
 */

import { chromium } from 'playwright'

async function manualTest() {
  console.log('🧪 Manual Cart Test - Browser will stay open for inspection\n')

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
    console.log(`[${type}] ${text}`)
  })

  // Capture errors
  page.on('pageerror', error => {
    console.error(`[PAGE ERROR] ${error.message}`)
  })

  try {
    console.log('📍 Navigating to products page...')
    await page.goto('http://localhost:3000/products')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000)

    console.log('\n📍 Looking for "Add to Cart" buttons...')

    // Get all cart buttons
    const buttons = await page.locator('button').all()
    let addToCartButton = null

    for (const btn of buttons) {
      const text = await btn.textContent().catch(() => '')
      if (text && (text.includes('Añadir') || text.includes('Agregar') || text.includes('Add'))) {
        console.log(`   Found button: "${text.trim()}"`)
        if (!addToCartButton) {
          addToCartButton = btn
        }
      }
    }

    if (!addToCartButton) {
      console.log('❌ No Add to Cart button found')
      console.log('\n⏸️  Browser will stay open for 30 seconds for manual inspection...')
      await page.waitForTimeout(30000)
      await browser.close()
      return
    }

    console.log('\n📍 Clicking first "Add to Cart" button...')
    await addToCartButton.click()
    await page.waitForTimeout(3000)

    console.log('\n📍 Checking cart cookie...')
    const cookies = await context.cookies()
    const cartCookie = cookies.find(c => c.name === 'moldova_direct_cart')

    if (cartCookie) {
      console.log('✅ Cart cookie found:')
      console.log(`   Name: ${cartCookie.name}`)
      console.log(`   Path: ${cartCookie.path}`)
      console.log(`   Domain: ${cartCookie.domain}`)
      console.log(`   Value length: ${JSON.stringify(cartCookie.value).length} bytes`)
    } else {
      console.log('❌ Cart cookie NOT found')
      console.log('\n📋 All cookies:')
      cookies.forEach(c => console.log(`   - ${c.name}`))
    }

    console.log('\n⏸️  Browser will stay open for 60 seconds for manual inspection...')
    console.log('   Try manually adding products and checking browser DevTools')
    await page.waitForTimeout(60000)

  } catch (error) {
    console.error('❌ Test error:', error.message)
    await page.waitForTimeout(10000)
  }

  await browser.close()
}

manualTest().catch(console.error)
