/**
 * Guided Checkout Test
 * Opens browser and provides step-by-step guidance through the checkout flow
 */

import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const SCREENSHOTS_DIR = join(__dirname, 'checkout-guided-test')
const BASE_URL = 'http://localhost:3000'

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true })
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function printBanner(text) {
  const width = 70
  console.log('\n' + '='.repeat(width))
  console.log(text.padStart((width + text.length) / 2))
  console.log('='.repeat(width) + '\n')
}

function printStep(number, title, instructions) {
  console.log(`\nSTEP ${number}: ${title}`)
  console.log('-'.repeat(70))
  instructions.forEach(inst => console.log(`  ${inst}`))
  console.log('-'.repeat(70))
}

async function main() {
  printBanner('GUIDED CHECKOUT CONFIRMATION REDIRECT TEST')

  console.log('This script will open a browser and guide you through testing')
  console.log('the checkout confirmation page redirect fix.')
  console.log('\nThe browser will stay open so you can manually complete each step.')
  console.log('Watch the console for important logs!')

  const browser = await chromium.launch({
    headless: false,
    slowMo: 500,
  })

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    locale: 'es-ES',
  })

  const page = await context.newPage()

  // Set up console logging
  const consoleLogs = []
  page.on('console', (msg) => {
    const text = msg.text()
    consoleLogs.push({ type: msg.type(), text, timestamp: new Date().toISOString() })

    // Highlight important logs
    if (text.includes('PERSIST') || text.includes('RESTORE')
      || text.includes('orderData') || text.includes('orderNumber')) {
      const emoji = text.includes('PERSIST COMPLETED')
        ? '✅'
        : text.includes('PERSIST')
          ? '💾'
          : text.includes('RESTORE') ? '📥' : '📋'
      console.log(`  ${emoji} [CONSOLE] ${text}`)
    }
  })

  try {
    printStep(1, 'Navigate to Products', [
      'Opening products page...',
      'You should see a list of available products',
    ])

    await page.goto(`${BASE_URL}/products`, { waitUntil: 'networkidle' })
    await sleep(2000)
    await page.screenshot({ path: join(SCREENSHOTS_DIR, 'step-1-products.png'), fullPage: true })
    console.log('✓ Products page loaded')
    console.log('✓ Screenshot saved: step-1-products.png\n')
    console.log('ACTION NEEDED: Manually click on a product and add it to cart')
    console.log('Then press Enter to continue...')
    await new Promise((resolve) => {
      process.stdin.once('data', () => resolve())
    })

    printStep(2, 'Go to Cart', [
      'Navigating to cart page...',
      'Verify your product appears in the cart',
    ])

    await page.goto(`${BASE_URL}/cart`, { waitUntil: 'networkidle' })
    await sleep(2000)
    await page.screenshot({ path: join(SCREENSHOTS_DIR, 'step-2-cart.png'), fullPage: true })
    console.log('✓ Cart page loaded')
    console.log('✓ Screenshot saved: step-2-cart.png\n')
    console.log('ACTION NEEDED: Click "Procesar Pedido" button')
    console.log('Then press Enter to continue...')
    await new Promise((resolve) => {
      process.stdin.once('data', () => resolve())
    })

    printStep(3, 'Fill Shipping Information', [
      'You should now be on the checkout page',
      'Fill in the following information:',
      '  Email: caraseli02@gmail.com',
      '  First Name: Test',
      '  Last Name: User',
      '  Street: 123 Test St',
      '  City: Madrid',
      '  Postal Code: 28001',
      '  Phone: 600123456',
      '  Country: ES',
      'Then click "Continuar" (Continue)',
    ])

    console.log('\nWaiting for you to fill the form and click Continue...')
    console.log('Press Enter after clicking Continue...')
    await new Promise((resolve) => {
      process.stdin.once('data', () => resolve())
    })

    await sleep(2000)
    await page.screenshot({ path: join(SCREENSHOTS_DIR, 'step-3-shipping-done.png'), fullPage: true })
    console.log('✓ Screenshot saved: step-3-shipping-done.png')

    printStep(4, 'Select Payment Method', [
      'You should now be on the payment page',
      'Select "Efectivo" (Cash) as payment method',
      'Then click "Continuar" (Continue)',
    ])

    console.log('\nPress Enter after selecting Cash and clicking Continue...')
    await new Promise((resolve) => {
      process.stdin.once('data', () => resolve())
    })

    await sleep(2000)
    await page.screenshot({ path: join(SCREENSHOTS_DIR, 'step-4-payment-done.png'), fullPage: true })
    console.log('✓ Screenshot saved: step-4-payment-done.png')

    printStep(5, 'Review Order', [
      'You should now be on the review page',
      'Check the "Terms and Conditions" checkbox',
      'Check the "Privacy Policy" checkbox',
      'Review your order details',
    ])

    console.log('\nPress Enter after checking the boxes...')
    await new Promise((resolve) => {
      process.stdin.once('data', () => resolve())
    })

    await sleep(1000)
    await page.screenshot({ path: join(SCREENSHOTS_DIR, 'step-5-review-ready.png'), fullPage: true })
    console.log('✓ Screenshot saved: step-5-review-ready.png')

    printBanner('CRITICAL TEST MOMENT')

    console.log('🎯 This is the critical moment to verify the fix!')
    console.log('\nBefore clicking "Realizar Pedido":')
    console.log('  1. Keep this console visible')
    console.log('  2. Note the current URL (should be /checkout/review)')
    console.log('  3. Watch for console logs appearing below')
    console.log('\nYou should see logs like:')
    console.log('  💾 PERSIST with orderData: {...}')
    console.log('  ✅ PERSIST COMPLETED')
    console.log('  📥 RESTORE orderData from cookie: {...}')
    console.log('\nAfter clicking:')
    console.log('  - URL should change to: /checkout/confirmation ✅')
    console.log('  - URL should NOT be: /cart ❌')
    console.log('\n' + '='.repeat(70))
    console.log('\nReady? Click "Realizar Pedido" (Place Order) now!')
    console.log('Then press Enter after the page redirects...')

    const urlBefore = page.url()

    await new Promise((resolve) => {
      process.stdin.once('data', () => resolve())
    })

    await sleep(3000)
    const urlAfter = page.url()

    await page.screenshot({ path: join(SCREENSHOTS_DIR, 'step-6-final-page.png'), fullPage: true })
    console.log('\n✓ Screenshot saved: step-6-final-page.png')

    // Analyze result
    printBanner('TEST RESULTS')

    console.log(`URL before order: ${urlBefore}`)
    console.log(`URL after order:  ${urlAfter}\n`)

    const success = urlAfter.includes('/checkout/confirmation')
    const failure = urlAfter.includes('/cart')

    if (success) {
      console.log('✅ SUCCESS! Redirected to /checkout/confirmation')
      console.log('✅ The fix is working correctly!')

      // Check for order number
      try {
        const bodyText = await page.textContent('body')
        const orderMatch = bodyText.match(/ORD-[A-Z0-9]+-[A-Z0-9]+/)
        if (orderMatch) {
          console.log(`✅ Order number visible: ${orderMatch[0]}`)
        }
        else {
          console.log('⚠️  Order number not found on page (check visually)')
        }
      }
      catch (e) {
        console.log('⚠️  Could not check for order number automatically')
      }
    }
    else if (failure) {
      console.log('❌ FAILED! Redirected to /cart instead')
      console.log('❌ The bug is NOT fixed')
      console.log('\nPossible issues:')
      console.log('  - persist() not awaited properly')
      console.log('  - Cookie path not set to "/"')
      console.log('  - nextTick() not awaited in persist()')
    }
    else {
      console.log('⚠️  UNEXPECTED! Redirected to a different page')
      console.log('Check the URL manually to understand what happened')
    }

    // Log analysis
    console.log('\n' + '='.repeat(70))
    console.log('CONSOLE LOG ANALYSIS')
    console.log('='.repeat(70))

    const persistLogs = consoleLogs.filter(l => l.text.includes('PERSIST'))
    const restoreLogs = consoleLogs.filter(l => l.text.includes('RESTORE'))

    console.log(`\nFound ${persistLogs.length} PERSIST logs:`)
    persistLogs.forEach(l => console.log(`  ${l.text}`))

    console.log(`\nFound ${restoreLogs.length} RESTORE logs:`)
    restoreLogs.forEach(l => console.log(`  ${l.text}`))

    // Save logs
    const logFile = join(SCREENSHOTS_DIR, 'console-logs.json')
    fs.writeFileSync(logFile, JSON.stringify(consoleLogs, null, 2))
    console.log(`\n📄 Full console logs saved to: ${logFile}`)
    console.log(`📸 All screenshots saved to: ${SCREENSHOTS_DIR}`)

    printBanner('TEST COMPLETE')

    console.log('Browser will remain open for 30 seconds for your inspection.')
    console.log('You can review the confirmation page and console logs.')
    console.log('\nPress Ctrl+C to close immediately, or wait...')

    await sleep(30000)
  }
  catch (error) {
    console.error('\n❌ Test error:', error.message)
    await page.screenshot({ path: join(SCREENSHOTS_DIR, 'error.png'), fullPage: true })
  }
  finally {
    await browser.close()
    console.log('\nBrowser closed. Test finished.')
  }
}

main().catch(console.error)
