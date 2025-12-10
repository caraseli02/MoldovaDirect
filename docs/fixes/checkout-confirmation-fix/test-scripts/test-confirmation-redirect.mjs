import { chromium } from 'playwright'

async function testCheckoutConfirmation() {
  const browser = await chromium.launch({ headless: false })
  const context = await browser.newContext()
  const page = await context.newPage()

  try {
    console.log('🎯 Testing Checkout Confirmation Page Redirect\n')

    // Step 1: Go to products page
    console.log('Step 1: Loading products page...')
    await page.goto('http://localhost:3000/products')
    await page.waitForLoadState('networkidle')

    // Step 2: Add product to cart
    console.log('Step 2: Adding product to cart...')
    const addToCartBtn = page.locator('button:has-text("Añadir al Carrito"), button:has-text("Add to Cart")').first()
    await addToCartBtn.waitFor({ state: 'visible', timeout: 10000 })
    await addToCartBtn.click()
    await page.waitForTimeout(2000)

    // Step 3: Go to cart
    console.log('Step 3: Navigating to cart...')
    await page.goto('http://localhost:3000/cart')
    await page.waitForLoadState('networkidle')

    // Verify cart has items
    const checkoutBtn = page.locator('button:has-text("Procesar Pedido"), button:has-text("Proceed to Checkout")')
    const hasCheckoutBtn = await checkoutBtn.count() > 0
    if (!hasCheckoutBtn) {
      console.error('❌ Cart is empty!')
      await page.screenshot({ path: 'debug-empty-cart.png' })
      throw new Error('Cart is empty')
    }

    // Step 4: Go to checkout
    console.log('Step 4: Starting checkout...')
    await checkoutBtn.click()
    await page.waitForURL('**/checkout**')
    await page.waitForLoadState('networkidle')

    // Step 5: Fill shipping info
    console.log('Step 5: Filling shipping information...')
    await page.fill('input[name="firstName"], input[id*="firstName"]', 'Test')
    await page.fill('input[name="lastName"], input[id*="lastName"]', 'User')
    await page.fill('input[name="email"], input[type="email"]', 'test@example.com')
    await page.fill('input[name="street"], input[id*="street"]', '123 Test St')
    await page.fill('input[name="city"], input[id*="city"]', 'Madrid')
    await page.fill('input[name="postalCode"], input[id*="postalCode"]', '28001')
    await page.fill('input[name="phone"], input[type="tel"]', '600123456')

    // Select country
    const countrySelect = page.locator('select[name="country"], select[id*="country"]')
    if (await countrySelect.count() > 0) {
      await countrySelect.selectOption('ES')
    }

    // Continue to payment
    const continueBtn = page.locator('button:has-text("Continuar"), button:has-text("Continue")').last()
    await continueBtn.click()
    await page.waitForTimeout(2000)

    // Step 6: Select payment method
    console.log('Step 6: Selecting payment method...')
    const cashOption = page.locator('input[value="cash"], label:has-text("Efectivo"), label:has-text("Cash")')
    if (await cashOption.count() > 0) {
      await cashOption.first().click()
    }
    await page.waitForTimeout(1000)

    // Continue to review
    const continuePaymentBtn = page.locator('button:has-text("Continuar"), button:has-text("Continue")').last()
    await continuePaymentBtn.click()
    await page.waitForTimeout(2000)

    // Step 7: Review and place order
    console.log('Step 7: Reviewing order and placing...')

    // Accept terms
    const termsCheckbox = page.locator('input[type="checkbox"]:near(:text("términos"), :text("terms"))').first()
    const privacyCheckbox = page.locator('input[type="checkbox"]:near(:text("privacidad"), :text("privacy"))').first()

    if (await termsCheckbox.count() > 0) {
      await termsCheckbox.check()
    }
    if (await privacyCheckbox.count() > 0) {
      await privacyCheckbox.check()
    }

    // Monitor console logs
    const consoleMessages = []
    page.on('console', (msg) => {
      const text = msg.text()
      if (text.includes('PERSIST DEBUG') || text.includes('orderData') || text.includes('confirmation')) {
        consoleMessages.push(text)
        console.log('  📝', text)
      }
    })

    // Click Place Order
    console.log('Step 8: Clicking Place Order...')
    const placeOrderBtn = page.locator('button:has-text("Realizar Pedido"), button:has-text("Place Order")')
    await placeOrderBtn.click()

    // Wait for navigation
    console.log('Step 9: Waiting for page redirect...')
    await page.waitForTimeout(5000)

    // Check current URL
    const currentURL = page.url()
    console.log('\n📍 Current URL:', currentURL)

    // Check if we're on confirmation page
    if (currentURL.includes('/checkout/confirmation')) {
      console.log('✅ SUCCESS: Redirected to confirmation page!')

      // Check if order details are visible
      const orderNumber = page.locator('text=/ORD-.*?/')
      const hasOrderNumber = await orderNumber.count() > 0

      if (hasOrderNumber) {
        const orderNumberText = await orderNumber.first().textContent()
        console.log('✅ Order number found:', orderNumberText)
      }
      else {
        console.log('⚠️  Order number not found on page')
      }

      // Take screenshot
      await page.screenshot({ path: 'success-confirmation.png' })
      console.log('📸 Screenshot saved: success-confirmation.png')

      return true
    }
    else {
      console.log('❌ FAILED: Not on confirmation page')
      console.log('   Current URL:', currentURL)

      // Take screenshot
      await page.screenshot({ path: 'failed-redirect.png' })
      console.log('📸 Screenshot saved: failed-redirect.png')

      // Print console logs
      console.log('\n📋 Console logs:')
      consoleMessages.forEach(msg => console.log('  ', msg))

      return false
    }
  }
  catch (error) {
    console.error('❌ Test failed with error:', error.message)
    await page.screenshot({ path: 'error-screenshot.png' })
    return false
  }
  finally {
    await browser.close()
  }
}

// Run test
testCheckoutConfirmation()
  .then((success) => {
    console.log(success ? '\n✅ Test PASSED' : '\n❌ Test FAILED')
    process.exit(success ? 0 : 1)
  })
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
