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
  console.log('=== CHECKOUT CONFIRMATION REDIRECT TEST ===\n')

  const browser = await chromium.launch({ headless: false, slowMo: 800 })
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    locale: 'es-ES',
  })
  const page = await context.newPage()

  const consoleLogs = []
  page.on('console', (msg) => {
    const text = msg.text()
    consoleLogs.push({ type: msg.type(), text, timestamp: new Date().toISOString() })

    // Highlight critical logs
    if (text.includes('processPayment') || text.includes('createOrderRecord')
      || text.includes('completeCheckout') || text.includes('PERSIST')
      || text.includes('RESTORE') || text.includes('orderData')
      || text.includes('orderId') || text.includes('orderNumber')) {
      console.log(`  [CONSOLE] ${text}`)
    }
  })

  page.on('pageerror', (error) => {
    console.error(`  [ERROR] ${error.message}`)
  })

  try {
    console.log('Step 1: Navigate directly to a product detail page')
    // Navigate directly to a specific product
    await page.goto(`${BASE_URL}/products`, { waitUntil: 'networkidle', timeout: 30000 })
    await sleep(2000)

    // Get first product href
    const firstProductHref = await page.getAttribute('a[href*="/products/PROD-"]', 'href')
    console.log(`  Product URL: ${firstProductHref}`)

    await page.goto(`${BASE_URL}${firstProductHref}`, { waitUntil: 'networkidle' })
    await sleep(2000)
    await page.screenshot({ path: join(SCREENSHOTS_DIR, '01-product-detail.png'), fullPage: true })
    console.log('  Screenshot: 01-product-detail.png\n')

    console.log('Step 2: Add product to cart')
    await page.locator('button:has-text("Añadir")').first().click()
    await sleep(3000)
    await page.screenshot({ path: join(SCREENSHOTS_DIR, '02-added.png'), fullPage: true })
    console.log('  Screenshot: 02-added.png\n')

    console.log('Step 3: Navigate to cart')
    await page.goto(`${BASE_URL}/cart`, { waitUntil: 'networkidle' })
    await sleep(2000)
    await page.screenshot({ path: join(SCREENSHOTS_DIR, '03-cart.png'), fullPage: true })
    console.log('  Screenshot: 03-cart.png\n')

    console.log('Step 4: Navigate to checkout')
    await page.goto(`${BASE_URL}/checkout`, { waitUntil: 'networkidle' })
    await sleep(3000)
    await page.screenshot({ path: join(SCREENSHOTS_DIR, '04-checkout-initial.png'), fullPage: true })
    console.log('  Screenshot: 04-checkout-initial.png\n')

    console.log('Step 5: Fill checkout form')
    // Wait for inputs to be available
    await page.waitForSelector('input', { timeout: 10000 })
    await sleep(1000)

    // Get all text/email/tel inputs
    const textInputs = await page.locator('input[type="text"], input:not([type])').all()
    const emailInput = await page.locator('input[type="email"]').first()
    const phoneInput = await page.locator('input[type="tel"]').first()

    console.log(`  Found ${textInputs.length} text inputs`)

    // Fill by index
    if (textInputs.length >= 5) {
      await textInputs[0].fill('Test')
      await textInputs[1].fill('User')
      await textInputs[2].fill('123 Test St')
      await textInputs[3].fill('Madrid')
      await textInputs[4].fill('28001')
    }

    await emailInput.fill('caraseli02@gmail.com')
    await phoneInput.fill('600123456')

    // Select country if available
    const countrySelect = await page.locator('select').first()
    try {
      await countrySelect.selectOption('ES')
    }
    catch (e) {
      // Ignore if select fails
    }

    console.log('  Form filled')
    await sleep(2000)
    await page.screenshot({ path: join(SCREENSHOTS_DIR, '05-form-filled.png'), fullPage: true })
    console.log('  Screenshot: 05-form-filled.png\n')

    console.log('Step 6: Continue to payment')
    await page.locator('button[type="submit"]').first().click()
    await page.waitForLoadState('networkidle')
    await sleep(2000)
    await page.screenshot({ path: join(SCREENSHOTS_DIR, '06-payment.png'), fullPage: true })
    console.log('  Screenshot: 06-payment.png\n')

    console.log('Step 7: Select cash payment method')
    try {
      await page.locator('input[value="cash"]').click()
    }
    catch (e) {
      await page.locator('label:has-text("Efectivo")').click()
    }
    await sleep(2000)
    console.log('  Cash selected')

    await page.locator('button[type="submit"]').first().click()
    await page.waitForLoadState('networkidle')
    await sleep(2000)
    await page.screenshot({ path: join(SCREENSHOTS_DIR, '07-review.png'), fullPage: true })
    console.log('  Screenshot: 07-review.png\n')

    console.log('Step 8: Accept terms and conditions')
    const checkboxes = await page.locator('input[type="checkbox"]').all()
    console.log(`  Checking ${checkboxes.length} checkboxes`)
    for (const cb of checkboxes) {
      try {
        await cb.check()
      }
      catch (_e) {
      // Suppress errors
      }
    }
    await sleep(2000)

    console.log('\n' + '='.repeat(70))
    console.log('CRITICAL TEST: PLACE ORDER AND MONITOR REDIRECT')
    console.log('='.repeat(70))

    const urlBeforeOrder = page.url()
    console.log(`URL before placing order: ${urlBeforeOrder}`)
    console.log('\nClicking Place Order button...')

    // Find and click the place order button
    const placeOrderButton = page.locator('button').filter({ hasText: /Realizar Pedido|Place Order|Realizar/ }).first()
    await placeOrderButton.click()

    console.log('Button clicked. Waiting for navigation...\n')
    await sleep(6000) // Give time for async operations

    const urlAfterOrder = page.url()
    console.log(`URL after placing order: ${urlAfterOrder}`)

    await page.screenshot({ path: join(SCREENSHOTS_DIR, '08-final-page.png'), fullPage: true })
    console.log('Screenshot: 08-final-page.png')

    // Check for order number
    const bodyText = await page.textContent('body')
    const orderNumberMatch = bodyText.match(/ORD-[A-Z0-9]+-[A-Z0-9]+/)

    console.log('\n' + '='.repeat(70))
    console.log('TEST RESULTS')
    console.log('='.repeat(70))

    const isConfirmation = urlAfterOrder.includes('/checkout/confirmation')
    const isCart = urlAfterOrder.includes('/cart')
    const isSamePage = urlAfterOrder === urlBeforeOrder

    if (isConfirmation) {
      console.log('✅ SUCCESS: Redirected to /checkout/confirmation')
      console.log(`   Final URL: ${urlAfterOrder}`)
      if (orderNumberMatch) {
        console.log(`   Order Number: ${orderNumberMatch[0]}`)
        console.log('   ✅ Order number is visible on page')
      }
      else {
        console.log('   ⚠️  Order number NOT found on page')
      }
    }
    else if (isCart) {
      console.log('❌ FAILED: Redirected to /cart page')
      console.log('   This indicates the bug is NOT fixed')
      console.log(`   Final URL: ${urlAfterOrder}`)
    }
    else if (isSamePage) {
      console.log('⚠️  NO REDIRECT: Still on review page')
      console.log('   Order submission may have failed')
      console.log(`   Final URL: ${urlAfterOrder}`)
    }
    else {
      console.log('⚠️  UNEXPECTED: Redirected to unexpected page')
      console.log(`   Final URL: ${urlAfterOrder}`)
    }

    console.log('\n' + '='.repeat(70))
    console.log('CONSOLE LOG ANALYSIS')
    console.log('='.repeat(70))

    const criticalLogs = consoleLogs.filter(l =>
      l.text.includes('processPayment') || l.text.includes('createOrderRecord')
      || l.text.includes('completeCheckout') || l.text.includes('PERSIST')
      || l.text.includes('RESTORE') || l.text.includes('orderData'),
    )

    console.log(`\nFound ${criticalLogs.length} critical console logs:`)
    if (criticalLogs.length > 0) {
      criticalLogs.forEach((log) => {
        console.log(`  [${log.type}] ${log.text}`)
      })
    }
    else {
      console.log('  (No critical logs found - this may indicate an issue)')
    }

    // Save logs
    const logFile = join(SCREENSHOTS_DIR, 'console-logs.json')
    fs.writeFileSync(logFile, JSON.stringify(consoleLogs, null, 2))
    console.log(`\nFull console logs saved to: ${logFile}`)
    console.log(`Screenshots directory: ${SCREENSHOTS_DIR}`)

    console.log('\n' + '='.repeat(70))
    console.log('TEST COMPLETE')
    console.log('='.repeat(70))

    console.log('\nBrowser will remain open for 30 seconds for manual inspection...')
    await sleep(30000)
  }
  catch (error) {
    console.error('\n❌ Test failed with error:', error.message)
    console.error('Stack trace:', error.stack)
    try {
      await page.screenshot({ path: join(SCREENSHOTS_DIR, '99-error.png'), fullPage: true })
      console.log('Error screenshot saved: 99-error.png')
    }
    catch (_e) {
      // Suppress errors
    }
  }
  finally {
    await browser.close()
    console.log('\nBrowser closed. Test finished.')
  }
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
