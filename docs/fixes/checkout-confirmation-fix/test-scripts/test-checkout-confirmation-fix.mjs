import { chromium } from 'playwright'
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

const BASE_URL = 'http://localhost:3000'
const SCREENSHOTS_DIR = './visual-regression-screenshots/checkout-test'

try {
  mkdirSync(SCREENSHOTS_DIR, { recursive: true })
}
catch (e) {}

async function testCheckoutFlow() {
  const browser = await chromium.launch({ headless: false })
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  })

  const page = await context.newPage()

  const consoleLogs = []
  page.on('console', (msg) => {
    const text = msg.text()
    const type = msg.type()
    consoleLogs.push({ type, text, timestamp: new Date().toISOString() })

    if (text.includes('orderData') || text.includes('persist') || text.includes('confirmation') || text.includes('redirect')) {
      console.log('[' + type + '] ' + text)
    }
  })

  const errors = []
  page.on('pageerror', (error) => {
    errors.push({ message: error.message, stack: error.stack })
    console.error('Page Error:', error.message)
  })

  const report = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    steps: [],
    consoleLogs: [],
    errors: [],
    success: false,
    finalUrl: null,
    testResult: null,
  }

  try {
    console.log('\n🛒 Starting Checkout Flow Test')
    console.log('================================\n')

    console.log('Step 1: Navigate to homepage...')
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(2000)
    await page.screenshot({ path: join(SCREENSHOTS_DIR, '01-homepage.png'), fullPage: true })
    report.steps.push({ step: 1, name: 'Homepage loaded', url: page.url(), success: true })
    console.log('Homepage loaded\n')

    console.log('Step 2: Navigate to products page...')
    await page.goto(BASE_URL + '/products', { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(2000)
    await page.screenshot({ path: join(SCREENSHOTS_DIR, '02-products-page.png'), fullPage: true })
    report.steps.push({ step: 2, name: 'Products page loaded', url: page.url(), success: true })
    console.log('Products page loaded\n')

    console.log('Step 3: Get first product link and navigate directly...')
    const productHref = await page.locator('a[href^="/products/"]').first().getAttribute('href')
    if (!productHref) {
      throw new Error('No product links found on products page')
    }
    const productUrl = BASE_URL + productHref
    await page.goto(productUrl, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(2000)
    await page.screenshot({ path: join(SCREENSHOTS_DIR, '03-product-details.png'), fullPage: true })
    report.steps.push({ step: 3, name: 'Product details page', url: page.url(), success: true })
    console.log('Product details page loaded\n')

    console.log('Step 4: Add product to cart...')
    const addToCartSelectors = [
      'button:has-text("Add to Cart")',
      'button:has-text("Añadir al Carrito")',
      'button:has-text("Agregar al Carrito")',
      'button[type="button"]:has-text("Añadir")',
    ]

    let addToCartButton = null
    for (const selector of addToCartSelectors) {
      const button = page.locator(selector).first()
      if (await button.count() > 0) {
        addToCartButton = button
        break
      }
    }

    if (!addToCartButton) {
      throw new Error('Add to Cart button not found')
    }

    await addToCartButton.click()
    await page.waitForTimeout(3000)
    await page.screenshot({ path: join(SCREENSHOTS_DIR, '04-added-to-cart.png'), fullPage: true })
    report.steps.push({ step: 4, name: 'Added to cart', success: true })
    console.log('Product added to cart\n')

    console.log('Step 5: Navigate to cart...')
    await page.goto(BASE_URL + '/cart', { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(2000)
    await page.screenshot({ path: join(SCREENSHOTS_DIR, '05-cart-page.png'), fullPage: true })
    report.steps.push({ step: 5, name: 'Cart page', url: page.url(), success: true })
    console.log('Cart page loaded\n')

    console.log('Step 6: Click Proceed to Checkout...')
    const checkoutSelectors = [
      'button:has-text("Proceed to Checkout")',
      'button:has-text("Proceder al Pago")',
      'a:has-text("Proceed to Checkout")',
      'a:has-text("Proceder al Pago")',
      'button:has-text("Checkout")',
      'a[href="/checkout"]',
    ]

    let checkoutButton = null
    for (const selector of checkoutSelectors) {
      const button = page.locator(selector).first()
      if (await button.count() > 0) {
        checkoutButton = button
        console.log('Found checkout button with selector: ' + selector)
        break
      }
    }

    if (!checkoutButton) {
      throw new Error('Checkout button not found')
    }

    await checkoutButton.click()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    await page.screenshot({ path: join(SCREENSHOTS_DIR, '06-checkout-shipping.png'), fullPage: true })
    report.steps.push({ step: 6, name: 'Checkout shipping step', url: page.url(), success: true })
    console.log('Checkout shipping step loaded\n')

    console.log('Step 7: Fill shipping information...')
    await page.fill('input[name="firstName"]', 'Test')
    await page.fill('input[name="lastName"]', 'User')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="tel"]', '+1234567890')
    await page.fill('input[name="address"]', '123 Test Street')
    await page.fill('input[name="city"]', 'Test City')
    await page.fill('input[name="postalCode"]', '12345')
    await page.waitForTimeout(1000)
    await page.screenshot({ path: join(SCREENSHOTS_DIR, '07-shipping-filled.png'), fullPage: true })
    report.steps.push({ step: 7, name: 'Shipping info filled', success: true })
    console.log('Shipping information filled\n')

    console.log('Step 8: Continue to payment...')
    const continueSelectors = [
      'button:has-text("Continue")',
      'button:has-text("Continuar")',
      'button:has-text("Next")',
      'button:has-text("Siguiente")',
      'button[type="submit"]',
    ]

    let continueButton = null
    for (const selector of continueSelectors) {
      const button = page.locator(selector).first()
      if (await button.count() > 0) {
        continueButton = button
        break
      }
    }

    await continueButton.click()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    await page.screenshot({ path: join(SCREENSHOTS_DIR, '08-checkout-payment.png'), fullPage: true })
    report.steps.push({ step: 8, name: 'Payment step', url: page.url(), success: true })
    console.log('Payment step loaded\n')

    console.log('Step 9: Select Cash on Delivery...')
    const codSelectors = [
      'input[value="cash_on_delivery"]',
      'label:has-text("Cash on Delivery")',
      'label:has-text("Efectivo")',
      'input[type="radio"][value="cod"]',
    ]

    for (const selector of codSelectors) {
      const option = page.locator(selector).first()
      if (await option.count() > 0) {
        await option.click()
        break
      }
    }

    await page.waitForTimeout(1000)
    await page.screenshot({ path: join(SCREENSHOTS_DIR, '09-payment-selected.png'), fullPage: true })
    report.steps.push({ step: 9, name: 'Payment method selected', success: true })
    console.log('Payment method selected\n')

    console.log('Step 10: Continue to review...')
    for (const selector of continueSelectors) {
      const button = page.locator(selector).first()
      if (await button.count() > 0) {
        await button.click()
        break
      }
    }

    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    await page.screenshot({ path: join(SCREENSHOTS_DIR, '10-checkout-review.png'), fullPage: true })
    report.steps.push({ step: 10, name: 'Review step', url: page.url(), success: true })
    console.log('Review step loaded\n')

    console.log('Step 11: Place Order (CRITICAL - Testing fix)...')
    console.log('Watching for console logs about orderData and redirect...\n')

    const placeOrderSelectors = [
      'button:has-text("Place Order")',
      'button:has-text("Realizar Pedido")',
      'button:has-text("Confirm Order")',
      'button:has-text("Confirmar Pedido")',
      'button[type="submit"]',
    ]

    let placeOrderButton = null
    for (const selector of placeOrderSelectors) {
      const button = page.locator(selector).first()
      if (await button.count() > 0) {
        placeOrderButton = button
        console.log('Found place order button with selector: ' + selector)
        break
      }
    }

    if (!placeOrderButton) {
      throw new Error('Place Order button not found')
    }

    await placeOrderButton.click()
    await page.waitForLoadState('networkidle', { timeout: 30000 })
    await page.waitForTimeout(3000)

    const finalUrl = page.url()
    report.finalUrl = finalUrl

    await page.screenshot({ path: join(SCREENSHOTS_DIR, '11-final-page.png'), fullPage: true })

    console.log('\n================================')
    console.log('FINAL RESULT:')
    console.log('================================')
    console.log('Final URL: ' + finalUrl + '\n')

    if (finalUrl.includes('/checkout/confirmation')) {
      console.log('SUCCESS: Landed on confirmation page')
      report.success = true
      report.testResult = 'PASSED - User redirected to confirmation page correctly'

      const hasOrderNumber = await page.locator('text=/Order.*#|Pedido.*#/i').count() > 0
      if (hasOrderNumber) {
        console.log('Order number visible on confirmation page')
        report.testResult += ' | Order number displayed'
      }
      else {
        console.log('Order number not immediately visible')
        report.testResult += ' | Order number not found'
      }
    }
    else if (finalUrl.includes('/cart')) {
      console.log('FAILURE: Redirected to cart page (BUG NOT FIXED)')
      report.success = false
      report.testResult = 'FAILED - User redirected to cart instead of confirmation'
    }
    else {
      console.log('UNEXPECTED: Landed on ' + finalUrl)
      report.success = false
      report.testResult = 'UNEXPECTED - User landed on ' + finalUrl
    }

    report.steps.push({ step: 11, name: 'Place Order clicked', url: finalUrl, success: report.success })
  }
  catch (error) {
    console.error('\nTest Error:', error.message)
    errors.push({ message: error.message, stack: error.stack })
    report.success = false
    report.testResult = 'ERROR: ' + error.message
  }

  report.consoleLogs = consoleLogs.filter(log =>
    log.text.toLowerCase().includes('orderdata')
    || log.text.toLowerCase().includes('persist')
    || log.text.toLowerCase().includes('confirmation')
    || log.text.toLowerCase().includes('redirect')
    || log.text.toLowerCase().includes('cookie')
    || log.text.toLowerCase().includes('haspayloadorderdata')
    || log.text.toLowerCase().includes('orderid')
    || log.text.toLowerCase().includes('ordernumber'),
  )

  report.errors = errors

  const reportPath = join(SCREENSHOTS_DIR, 'checkout-test-report.json')
  writeFileSync(reportPath, JSON.stringify(report, null, 2))

  const logsPath = join(SCREENSHOTS_DIR, 'console-logs.json')
  writeFileSync(logsPath, JSON.stringify(report.consoleLogs, null, 2))

  console.log('\n================================')
  console.log('TEST COMPLETE')
  console.log('================================')
  console.log('Result: ' + report.testResult)
  console.log('Screenshots: ' + SCREENSHOTS_DIR + '/')
  console.log('Full report: ' + reportPath)
  console.log('Console logs: ' + logsPath + '\n')

  await browser.close()

  return report
}

testCheckoutFlow()
  .then((report) => {
    process.exit(report.success ? 0 : 1)
  })
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
