import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const BASE_URL = 'http://localhost:3000';
const SCREENSHOTS_DIR = './visual-regression-screenshots/checkout-test';

try {
  mkdirSync(SCREENSHOTS_DIR, { recursive: true });
} catch (e) {}

async function testCheckoutFlow() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1
  });

  const page = await context.newPage();
  
  const consoleLogs = [];
  page.on('console', msg => {
    const text = msg.text();
    const type = msg.type();
    consoleLogs.push({ type, text, timestamp: new Date().toISOString() });
    console.log('[CONSOLE ' + type + '] ' + text);
  });

  const errors = [];
  page.on('pageerror', error => {
    errors.push({ message: error.message, stack: error.stack });
    console.error('PAGE ERROR:', error.message);
  });

  const report = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    steps: [],
    consoleLogs: [],
    errors: [],
    success: false,
    finalUrl: null,
    testResult: null
  };

  try {
    console.log('\n🛒 Starting Checkout Flow Test');
    console.log('================================\n');

    console.log('Step 1: Navigate to products page...');
    await page.goto(BASE_URL + '/products', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: join(SCREENSHOTS_DIR, '01-products-page.png'), fullPage: true });
    report.steps.push({ step: 1, name: 'Products page loaded', url: page.url(), success: true });
    console.log('Products page loaded\n');

    console.log('Step 2: Get first product href...');
    const productHref = await page.getAttribute('a[href^="/products/"]', 'href');
    if (!productHref) {
      throw new Error('No product links found');
    }
    console.log('Found product: ' + productHref + '\n');

    console.log('Step 3: Navigate to product...');
    await page.goto(BASE_URL + productHref, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: join(SCREENSHOTS_DIR, '02-product-page.png'), fullPage: true });
    report.steps.push({ step: 2, name: 'Product page loaded', url: page.url(), success: true });
    console.log('Product page loaded\n');

    console.log('Step 4: Look for Add to Cart button...');
    const pageContent = await page.content();
    console.log('Page has "Add to Cart": ' + pageContent.includes('Add to Cart'));
    console.log('Page has "Añadir": ' + pageContent.includes('Añadir'));
    
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      buttons.forEach((btn, idx) => {
        console.log('Button ' + idx + ': ' + btn.textContent + ' | disabled: ' + btn.disabled);
      });
    });
    
    await page.waitForSelector('button', { timeout: 5000 });
    const addButton = page.locator('button').filter({ hasText: /Add to Cart|Añadir/i }).first();
    await addButton.waitFor({ state: 'visible', timeout: 5000 });
    await addButton.click();
    console.log('Clicked Add to Cart\n');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: join(SCREENSHOTS_DIR, '03-after-add-to-cart.png'), fullPage: true });
    report.steps.push({ step: 3, name: 'Added to cart', success: true });

    console.log('Step 5: Navigate to cart...');
    await page.goto(BASE_URL + '/cart', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: join(SCREENSHOTS_DIR, '04-cart-page.png'), fullPage: true });
    report.steps.push({ step: 4, name: 'Cart page loaded', url: page.url(), success: true });
    
    console.log('Looking for checkout button...');
    const cartContent = await page.content();
    console.log('Cart has "checkout": ' + cartContent.toLowerCase().includes('checkout'));
    console.log('Cart has "Proceder": ' + cartContent.includes('Proceder'));
    console.log('Cart has empty cart message: ' + cartContent.includes('cartEmpty'));
    
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, a'));
      buttons.forEach((btn, idx) => {
        const text = btn.textContent || '';
        if (text.toLowerCase().includes('checkout') || text.toLowerCase().includes('proceder')) {
          console.log('Checkout button ' + idx + ': ' + text + ' | disabled: ' + btn.disabled + ' | tag: ' + btn.tagName);
        }
      });
    });
    
    console.log('\nStep 6: Click checkout button...');
    const checkoutButton = page.locator('button, a').filter({ hasText: /checkout|proceder/i }).first();
    await checkoutButton.waitFor({ state: 'visible', timeout: 10000 });
    await checkoutButton.click();
    console.log('Clicked checkout button\n');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: join(SCREENSHOTS_DIR, '05-checkout-page.png'), fullPage: true });
    report.steps.push({ step: 5, name: 'Checkout page loaded', url: page.url(), success: true });
    
    console.log('Current URL: ' + page.url());
    console.log('\n================================');
    console.log('Test paused - waiting for manual completion');
    console.log('================================');
    console.log('Please manually complete the checkout:');
    console.log('1. Fill shipping info');
    console.log('2. Select payment method');
    console.log('3. Review order');
    console.log('4. Place order');
    console.log('\nWaiting 120 seconds before closing...\n');
    
    await page.waitForTimeout(120000);
    
    const finalUrl = page.url();
    report.finalUrl = finalUrl;
    await page.screenshot({ path: join(SCREENSHOTS_DIR, '06-final-page.png'), fullPage: true });
    
    console.log('\n================================');
    console.log('FINAL RESULT:');
    console.log('================================');
    console.log('Final URL: ' + finalUrl + '\n');
    
    if (finalUrl.includes('/checkout/confirmation')) {
      console.log('SUCCESS: Landed on confirmation page');
      report.success = true;
      report.testResult = 'PASSED - User redirected to confirmation page correctly';
    } else if (finalUrl.includes('/cart')) {
      console.log('FAILURE: Back on cart page');
      report.success = false;
      report.testResult = 'FAILED - User redirected to cart instead of confirmation';
    } else {
      console.log('Other page: ' + finalUrl);
      report.testResult = 'Manual completion - ended on ' + finalUrl;
    }

  } catch (error) {
    console.error('\nTest Error:', error.message);
    errors.push({ message: error.message, stack: error.stack });
    report.success = false;
    report.testResult = 'ERROR: ' + error.message;
  }

  report.consoleLogs = consoleLogs;
  report.errors = errors;

  const reportPath = join(SCREENSHOTS_DIR, 'checkout-test-report.json');
  writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log('\n================================');
  console.log('TEST COMPLETE');
  console.log('================================');
  console.log('Result: ' + report.testResult);
  console.log('Screenshots: ' + SCREENSHOTS_DIR + '/');
  console.log('Report: ' + reportPath + '\n');

  await browser.close();

  return report;
}

testCheckoutFlow()
  .then(report => {
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
