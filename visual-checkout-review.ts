import { chromium } from '@playwright/test'
import type { Browser, Page } from '@playwright/test'
import * as path from 'node:path'
import * as fs from 'node:fs'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const LOCALES = ['es', 'en', 'ro', 'ru'] as const
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots/checkout-review')
const REGISTERED_USER = {
  email: 'customer@moldovadirect.com',
  password: 'Customer123!@#',
}

type Locale = typeof LOCALES[number]

// Ensure screenshot directory exists
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true })
}

const localeNames = {
  es: 'Spanish',
  en: 'English',
  ro: 'Romanian',
  ru: 'Russian',
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function testGuestCheckout(page: Page, locale: Locale) {
  console.log(`\n🧪 Testing ${localeNames[locale]} - GUEST USER`)
  console.log('='.repeat(60))

  // Step 1: Navigate to homepage first to avoid auth modals
  console.log('📍 Step 1: Navigate to homepage')
  await page.goto(`http://localhost:3000/${locale}`)
  await page.waitForLoadState('networkidle')
  await sleep(1000)

  // Step 2: Navigate to a specific product
  console.log('📍 Step 2: Navigate to product page')
  await page.goto(`http://localhost:3000/${locale}/products/WINE-MILESTII-001`)
  await page.waitForLoadState('networkidle')
  await sleep(1000)

  // Check for login modal and close it by clicking outside
  const modal = page.locator('[role="dialog"]').first()
  if (await modal.isVisible().catch(() => false)) {
    console.log('  ⚠️  Login modal detected, closing it...')
    // Click outside the modal (on the backdrop)
    await page.mouse.click(10, 10) // Click top-left corner
    await sleep(500)
  }
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, `${locale}-guest-01-product-page.png`),
    fullPage: true,
  })

  // Step 3: Click "Add to Cart" button
  console.log('🛒 Step 3: Add product to cart')
  const addButton = page.locator('button').filter({ hasText: /Añadir|Add to Cart|Adaugă|Добавить/ }).first()
  await addButton.scrollIntoViewIfNeeded()
  await addButton.click()
  await sleep(2000)
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, `${locale}-guest-02-product-added.png`),
    fullPage: true,
  })

  // Step 3: Go to cart
  console.log('🛒 Step 3: Navigate to cart')
  await page.goto(`http://localhost:3000/${locale}/cart`)
  await page.waitForLoadState('networkidle')
  await sleep(1000)
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, `${locale}-guest-03-cart.png`),
    fullPage: true,
  })

  // Step 4: Click checkout button
  console.log('💳 Step 4: Proceed to checkout')
  const checkoutBtn = page.locator('button').filter({ hasText: /Finalizar|Checkout|Finalizare|Оформить/ }).first()
  await checkoutBtn.click()
  await page.waitForURL(/checkout/)
  await page.waitForLoadState('networkidle')
  await sleep(1500)
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, `${locale}-guest-04-checkout-initial.png`),
    fullPage: true,
  })

  // Step 5: Fill shipping information
  console.log('📝 Step 5: Fill shipping information')

  // Fill full name (new field)
  const fullNameInput = page.locator('input[name="fullName"], input[id="fullName"]').first()
  await fullNameInput.scrollIntoViewIfNeeded()
  await fullNameInput.fill('Juan Test Usuario')
  await sleep(300)

  // Fill email
  const emailInput = page.locator('input[type="email"]').first()
  if (await emailInput.isVisible()) {
    await emailInput.fill('test-guest@example.com')
    await sleep(300)
  }

  // Fill street
  const streetInput = page.locator('input[name="street"], input[id="street"]').first()
  await streetInput.fill('Calle de Prueba 123')
  await sleep(300)

  // Fill city
  const cityInput = page.locator('input[name="city"], input[id="city"]').first()
  await cityInput.fill('Madrid')
  await sleep(300)

  // Fill postal code
  const postalInput = page.locator('input[name="postalCode"], input[id="postalCode"]').first()
  await postalInput.fill('28001')
  await sleep(300)

  // Fill phone
  const phoneInput = page.locator('input[name="phone"], input[id="phone"]').first()
  if (await phoneInput.isVisible()) {
    await phoneInput.fill('+34612345678')
    await sleep(300)
  }

  // Select country
  const countrySelect = page.locator('select[name="country"], select[id="country"]').first()
  if (await countrySelect.isVisible()) {
    await countrySelect.selectOption('ES')
    await sleep(300)
  }

  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, `${locale}-guest-05-shipping-filled.png`),
    fullPage: true,
  })

  console.log('✅ Guest checkout test completed for ' + localeNames[locale])
  console.log('   Screenshots saved to: ' + SCREENSHOT_DIR)
}

async function testRegisteredCheckout(page: Page, locale: Locale) {
  console.log(`\n🧪 Testing ${localeNames[locale]} - REGISTERED USER`)
  console.log('='.repeat(60))

  // Step 1: Login
  console.log('🔐 Step 1: Login as registered user')
  await page.goto(`http://localhost:3000/${locale}/auth/login`)
  await page.waitForLoadState('networkidle')

  const emailInput = page.locator('input[type="email"]').first()
  await emailInput.fill(REGISTERED_USER.email)
  await sleep(300)

  const passwordInput = page.locator('input[type="password"]').first()
  await passwordInput.fill(REGISTERED_USER.password)
  await sleep(300)

  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, `${locale}-registered-01-login.png`),
    fullPage: true,
  })

  const loginBtn = page.locator('button[type="submit"]').first()
  await loginBtn.click()
  await sleep(2000)
  await page.waitForLoadState('networkidle')

  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, `${locale}-registered-02-logged-in.png`),
    fullPage: true,
  })

  // Step 2: Navigate to products
  console.log('📍 Step 2: Navigate to products')
  await page.goto(`http://localhost:3000/${locale}/products`)
  await page.waitForLoadState('networkidle')
  await sleep(1000)

  // Step 3: Add product
  console.log('🛒 Step 3: Add product to cart')
  const addButton = page.locator('button').filter({ hasText: /Añadir|Add|Adaugă|Добавить/ }).first()
  await addButton.scrollIntoViewIfNeeded()
  await addButton.click()
  await sleep(2000)

  // Step 4: Go to cart
  console.log('🛒 Step 4: Navigate to cart')
  await page.goto(`http://localhost:3000/${locale}/cart`)
  await page.waitForLoadState('networkidle')
  await sleep(1000)
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, `${locale}-registered-03-cart.png`),
    fullPage: true,
  })

  // Step 5: Checkout
  console.log('💳 Step 5: Proceed to checkout')
  const checkoutBtn = page.locator('button').filter({ hasText: /Finalizar|Checkout|Finalizare|Оформить/ }).first()
  await checkoutBtn.click()
  await page.waitForURL(/checkout/)
  await page.waitForLoadState('networkidle')
  await sleep(1500)
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, `${locale}-registered-04-checkout-initial.png`),
    fullPage: true,
  })

  // Step 6: Check if address is pre-filled or fill it
  console.log('📝 Step 6: Verify/fill shipping information')

  const fullNameInput = page.locator('input[name="fullName"], input[id="fullName"]').first()
  if (await fullNameInput.isVisible()) {
    const currentValue = await fullNameInput.inputValue()
    if (!currentValue) {
      await fullNameInput.fill('Customer Test')
      await sleep(300)

      const streetInput = page.locator('input[name="street"], input[id="street"]').first()
      await streetInput.fill('Test Street 456')
      await sleep(300)

      const cityInput = page.locator('input[name="city"], input[id="city"]').first()
      await cityInput.fill('Barcelona')
      await sleep(300)

      const postalInput = page.locator('input[name="postalCode"], input[id="postalCode"]').first()
      await postalInput.fill('08001')
      await sleep(300)

      const phoneInput = page.locator('input[name="phone"], input[id="phone"]').first()
      if (await phoneInput.isVisible()) {
        await phoneInput.fill('+34612345679')
        await sleep(300)
      }
    }
  }

  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, `${locale}-registered-05-checkout-filled.png`),
    fullPage: true,
  })

  console.log('✅ Registered checkout test completed for ' + localeNames[locale])
  console.log('   Screenshots saved to: ' + SCREENSHOT_DIR)
}

async function main() {
  console.log('\n🚀 Starting Checkout Flow Visual Review')
  console.log('='.repeat(60))
  console.log('Testing all 4 locales: Spanish, English, Romanian, Russian')
  console.log('Testing both Guest and Registered user flows')
  console.log('Screenshots will be saved to:', SCREENSHOT_DIR)
  console.log('='.repeat(60))

  const browser = await chromium.launch({
    headless: false, // Show browser for visual review
    slowMo: 500, // Slow down for better visibility
  })

  try {
    // Test each locale
    for (const locale of LOCALES) {
      // Guest user test
      const guestContext = await browser.newContext({
        viewport: { width: 1280, height: 720 },
      })
      const guestPage = await guestContext.newPage()
      await testGuestCheckout(guestPage, locale)
      await guestContext.close()

      // Wait between tests
      await sleep(2000)

      // Registered user test
      const registeredContext = await browser.newContext({
        viewport: { width: 1280, height: 720 },
      })
      const registeredPage = await registeredContext.newPage()
      await testRegisteredCheckout(registeredPage, locale)
      await registeredContext.close()

      // Wait between locales
      await sleep(2000)
    }

    console.log('\n✅ All tests completed successfully!')
    console.log('📸 Screenshots saved to:', SCREENSHOT_DIR)
    console.log('\n📊 Summary:')
    console.log('  - 4 locales tested: Spanish, English, Romanian, Russian')
    console.log('  - 2 user types: Guest and Registered')
    console.log('  - Total scenarios: 8')
    console.log('  - Screenshots captured at each step')
  }
  catch (error) {
    console.error('❌ Error during testing:', error)
    throw error
  }
  finally {
    await browser.close()
  }
}

// Run the tests
main()
  .then(() => {
    console.log('\n✅ Visual review completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Visual review failed:', error)
    process.exit(1)
  })
