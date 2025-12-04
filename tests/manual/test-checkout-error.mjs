/**
 * Test: Reproduce "useCartStore is not defined" error
 */

import { chromium } from '@playwright/test'
import { mkdir } from 'fs/promises'

async function testCheckoutError() {
  console.log('🧪 Starting checkout error reproduction test...\n')
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500
  })
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  })
  
  const page = await context.newPage()
  
  const consoleMessages = []
  const errors = []
  
  page.on('console', msg => {
    const msgType = msg.type()
    const text = msg.text()
    consoleMessages.push({
      type: msgType,
      text: text,
      timestamp: new Date().toISOString()
    })
    console.log('[CONSOLE-' + msgType.toUpperCase() + '] ' + text)
  })
  
  page.on('pageerror', error => {
    errors.push({
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    })
    console.error('PAGE-ERROR: ' + error.message)
  })
  
  try {
    console.log('\nStep 1: Homepage...')
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)
    await page.screenshot({ path: 'test-results/01-homepage.png' })
    
    console.log('\nStep 2: Products page...')
    await page.goto('http://localhost:3000/products', { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)
    await page.screenshot({ path: 'test-results/02-products.png' })
    
    console.log('\nStep 3: Add to cart...')
    await page.waitForSelector('[data-testid^="product-card-"]', { timeout: 10000 })
    const addBtn = await page.locator('button:has-text("Añadir al carrito")').first()
    await addBtn.waitFor({ state: 'visible' })
    await addBtn.click()
    await page.waitForTimeout(2000)
    await page.screenshot({ path: 'test-results/03-added.png' })
    
    console.log('\nStep 4: Cart page...')
    await page.goto('http://localhost:3000/cart', { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)
    await page.screenshot({ path: 'test-results/04-cart.png' })
    
    console.log('\nStep 5: Click checkout...')
    const navPromise = page.waitForURL('**/checkout**', { timeout: 5000 }).catch(() => null)
    const checkoutBtn = await page.locator('button:has-text("Proceder al Pago")').first()
    await checkoutBtn.waitFor({ state: 'visible' })
    await checkoutBtn.click()
    await page.waitForTimeout(3000)
    
    const didNavigate = await navPromise
    
    if (didNavigate) {
      console.log('SUCCESS: Navigated to checkout')
      await page.screenshot({ path: 'test-results/05-success.png' })
    } else {
      console.log('FAILED: Did not navigate')
      await page.screenshot({ path: 'test-results/05-failed.png' })
    }
    
    const hasCartStoreError = consoleMessages.some(m => m.text.includes('useCartStore is not defined'))
    const hasCheckoutError = consoleMessages.some(m => m.text.includes('Failed to proceed to checkout'))
    
    console.log('\n' + '='.repeat(60))
    console.log('RESULTS')
    console.log('='.repeat(60))
    console.log('Navigation: ' + (didNavigate ? 'SUCCESS' : 'FAILED'))
    console.log('useCartStore error: ' + (hasCartStoreError ? 'YES' : 'NO'))
    console.log('Checkout error: ' + (hasCheckoutError ? 'YES' : 'NO'))
    console.log('Console messages: ' + consoleMessages.length)
    console.log('Page errors: ' + errors.length)
    
    if (hasCartStoreError || hasCheckoutError) {
      console.log('\nRELEVANT ERRORS:')
      consoleMessages.filter(m => 
        m.text.includes('useCartStore') || m.text.includes('checkout')
      ).forEach(m => {
        console.log('\n' + m.type.toUpperCase() + ': ' + m.text)
      })
    }
    
    if (errors.length > 0) {
      console.log('\nPAGE ERRORS:')
      errors.forEach(e => console.log(e.message))
    }
    
    console.log('\n' + '='.repeat(60))
    console.log('\nKeeping browser open for 30s...')
    await page.waitForTimeout(30000)
    
  } catch (error) {
    console.error('Test error:', error.message)
    await page.screenshot({ path: 'test-results/error.png' })
    throw error
  } finally {
    await browser.close()
  }
}

await mkdir('test-results', { recursive: true })
testCheckoutError().catch(error => {
  console.error('Fatal:', error)
  process.exit(1)
})
