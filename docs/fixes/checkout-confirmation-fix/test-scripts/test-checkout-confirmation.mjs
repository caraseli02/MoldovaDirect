/**
 * Checkout Confirmation Page Redirect Test
 */

import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const SCREENSHOTS_DIR = join(__dirname, 'checkout-test-screenshots')
const BASE_URL = 'http://localhost:3000'

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true })
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function main() {
  console.log('Starting Checkout Test\n')

  const browser = await chromium.launch({ headless: false, slowMo: 500 })
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    locale: 'es-ES',
  })
  const page = await context.newPage()

  const consoleLogs = []
  page.on('console', (msg) => {
    const text = msg.text()
    consoleLogs.push({ type: msg.type(), text, timestamp: new Date().toISOString() })
    if (text.includes('PERSIST') || text.includes('RESTORE') || text.includes('orderData')) {
      console.log(`[${msg.type()}] ${text}`)
    }
  })

  try {
    console.log('Step 1: Products page')
    await page.goto(`${BASE_URL}/products`, { waitUntil: 'networkidle' })
    await sleep(2000)
    await page.screenshot({ path: join(SCREENSHOTS_DIR, '01-products.png'), fullPage: true })

    console.log('Step 2: Add to cart')
    try {
      await page.locator('a[href*="/products/"]').first().click()
      await sleep(1000)
      await page.locator('button:has-text("Añadir")').first().click()
    }
    catch (e) {
      await page.locator('button:has-text("Añadir")').first().click()
    }
    await sleep(2000)
    await page.screenshot({ path: join(SCREENSHOTS_DIR, '02-added.png'), fullPage: true })

    console.log('Step 3: Cart page')
    await page.goto(`${BASE_URL}/cart`, { waitUntil: 'networkidle' })
    await sleep(2000)
    await page.screenshot({ path: join(SCREENSHOTS_DIR, '03-cart.png'), fullPage: true })

    console.log('Step 4: Checkout')
    try {
      await page.locator('button:has-text("Procesar")').first().click()
    }
    catch (e) {
      await page.goto(`${BASE_URL}/checkout`, { waitUntil: 'networkidle' })
    }
    await sleep(2000)
    await page.screenshot({ path: join(SCREENSHOTS_DIR, '04-shipping.png'), fullPage: true })

    console.log('Step 5: Fill form')
    await page.fill('input[name="firstName"]', 'Test')
    await page.fill('input[name="lastName"]', 'User')
    await page.fill('input[type="email"]', 'caraseli02@gmail.com')
    await page.fill('input[name="street"]', '123 Test St')
    await page.fill('input[name="city"]', 'Madrid')
    await page.fill('input[name="postalCode"]', '28001')
    await page.fill('input[type="tel"]', '600123456')
    try {
      await page.selectOption('select[name="country"]', 'ES')
    }
    catch (_e) {
      // Suppress errors
    }
    await sleep(1000)
    await page.screenshot({ path: join(SCREENSHOTS_DIR, '05-filled.png'), fullPage: true })

    console.log('Step 6: Payment')
    await page.locator('button[type="submit"]').first().click()
    await sleep(2000)
    await page.screenshot({ path: join(SCREENSHOTS_DIR, '06-payment.png'), fullPage: true })

    console.log('Step 7: Cash')
    try {
      await page.locator('input[value="cash"]').click()
    }
    catch (e) {
      await page.locator('label:has-text("Efectivo")').click()
    }
    await sleep(1000)
    await page.locator('button[type="submit"]').first().click()
    await sleep(2000)
    await page.screenshot({ path: join(SCREENSHOTS_DIR, '07-review.png'), fullPage: true })

    console.log('Step 8: Terms')
    const checkboxes = await page.locator('input[type="checkbox"]').all()
    for (const cb of checkboxes) {
      try {
        await cb.check()
      }
      catch (_e) {
      // Suppress errors
      }
    }
    await sleep(1000)

    console.log('Step 9: PLACE ORDER - CRITICAL')
    const navPromise = page.waitForNavigation({ timeout: 10000 }).catch(() => null)
    try {
      await page.locator('button:has-text("Realizar")').click()
    }
    catch (e) {
      await page.locator('button:has-text("Place Order")').click()
    }
    await navPromise
    await sleep(3000)

    const finalUrl = page.url()
    console.log(`Final URL: ${finalUrl}`)

    await page.screenshot({ path: join(SCREENSHOTS_DIR, '08-final.png'), fullPage: true })

    console.log('\n' + '='.repeat(60))
    if (finalUrl.includes('/checkout/confirmation')) {
      console.log('SUCCESS: On confirmation page')
    }
    else if (finalUrl.includes('/cart')) {
      console.log('FAILURE: Back to cart (BUG NOT FIXED)')
    }
    else {
      console.log('UNEXPECTED: Different page')
    }
    console.log('='.repeat(60))

    fs.writeFileSync(join(SCREENSHOTS_DIR, 'logs.json'), JSON.stringify(consoleLogs, null, 2))
    console.log(`Logs: ${SCREENSHOTS_DIR}/logs.json`)

    await sleep(30000)
  }
  catch (error) {
    console.error('Error:', error.message)
    await page.screenshot({ path: join(SCREENSHOTS_DIR, 'error.png'), fullPage: true })
  }
  finally {
    await browser.close()
  }
}

main().catch(console.error)
