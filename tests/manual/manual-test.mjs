import { chromium } from '@playwright/test'

async function manualTest() {
  console.log('Manual Checkout Test\n')
  console.log('Instructions:')
  console.log('1. Browser will open')
  console.log('2. Add product to cart manually')
  console.log('3. Go to cart and click checkout')
  console.log('4. Watch for errors\n')
  
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true
  })
  
  const context = await browser.newContext()
  const page = await context.newPage()
  
  page.on('console', msg => {
    const text = msg.text()
    if (text.includes('useCartStore') || text.includes('checkout')) {
      console.log('RELEVANT:', text)
    }
  })
  
  page.on('pageerror', error => {
    console.error('ERROR:', error.message)
  })
  
  await page.goto('http://localhost:3000')
  console.log('Browser ready. Press Ctrl+C to exit\n')
  
  await new Promise(() => {})
}

manualTest()
