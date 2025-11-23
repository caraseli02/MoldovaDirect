import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SCREENSHOTS_DIR = join(__dirname, 'checkout-test-screenshots');
const BASE_URL = 'http://localhost:3000';

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('Starting Checkout Confirmation Test\n');
  
  const browser = await chromium.launch({ headless: false, slowMo: 1000 });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    locale: 'es-ES',
  });
  const page = await context.newPage();
  
  const consoleLogs = [];
  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push({ type: msg.type(), text, timestamp: new Date().toISOString() });
    
    // Log important checkout flow messages
    if (text.includes('processPayment') || text.includes('createOrderRecord') || 
        text.includes('completeCheckout') || text.includes('PERSIST') || 
        text.includes('RESTORE') || text.includes('orderData') ||
        text.includes('orderId') || text.includes('orderNumber')) {
      console.log(`[CONSOLE] ${text}`);
    }
  });
  
  page.on('pageerror', error => {
    console.error(`[ERROR] ${error.message}`);
  });
  
  try {
    console.log('Step 1: Navigate to products');
    await page.goto(`${BASE_URL}/products`, { waitUntil: 'networkidle', timeout: 30000 });
    await sleep(3000);
    await page.screenshot({ path: join(SCREENSHOTS_DIR, '01-products.png'), fullPage: true });
    console.log('  Screenshot: 01-products.png');
    
    console.log('\nStep 2: Add product to cart');
    // Try to click first product link
    await page.locator('a[href*="/products/"]').first().click({ timeout: 10000 });
    await page.waitForLoadState('networkidle');
    await sleep(2000);
    
    // Click add to cart button (try multiple selectors)
    const addButtons = [
      'button:has-text("Añadir al carrito")',
      'button:has-text("Add to cart")',
      'button:has-text("Añadir")',
    ];
    
    let added = false;
    for (const selector of addButtons) {
      try {
        if (await page.locator(selector).count() > 0) {
          await page.locator(selector).first().click();
          added = true;
          console.log(`  Clicked: ${selector}`);
          break;
        }
      } catch (e) {}
    }
    
    if (!added) {
      console.log('  WARNING: Could not find add to cart button');
    }
    
    await sleep(3000);
    await page.screenshot({ path: join(SCREENSHOTS_DIR, '02-added.png'), fullPage: true });
    console.log('  Screenshot: 02-added.png');
    
    console.log('\nStep 3: Go to cart');
    await page.goto(`${BASE_URL}/cart`, { waitUntil: 'networkidle', timeout: 30000 });
    await sleep(3000);
    await page.screenshot({ path: join(SCREENSHOTS_DIR, '03-cart.png'), fullPage: true });
    console.log('  Screenshot: 03-cart.png');
    
    console.log('\nStep 4: Proceed to checkout');
    const checkoutButtons = [
      'button:has-text("Procesar Pedido")',
      'button:has-text("Proceed to Checkout")',
      'a[href="/checkout"]',
    ];
    
    let proceeded = false;
    for (const selector of checkoutButtons) {
      try {
        if (await page.locator(selector).count() > 0) {
          await page.locator(selector).first().click();
          proceeded = true;
          console.log(`  Clicked: ${selector}`);
          break;
        }
      } catch (e) {}
    }
    
    if (!proceeded) {
      console.log('  Navigating directly to /checkout');
      await page.goto(`${BASE_URL}/checkout`, { waitUntil: 'networkidle', timeout: 30000 });
    }
    
    await sleep(3000);
    await page.screenshot({ path: join(SCREENSHOTS_DIR, '04-checkout.png'), fullPage: true });
    console.log('  Screenshot: 04-checkout.png');
    
    console.log('\nStep 5: Wait for form to be ready');
    await page.waitForSelector('input', { timeout: 10000 });
    await sleep(2000);
    
    // Try to fill form with flexible selectors
    console.log('  Filling form fields...');
    const inputs = await page.locator('input[type="text"], input:not([type])').all();
    console.log(`  Found ${inputs.length} text inputs`);
    
    // Fill inputs by position (common pattern: firstName, lastName, street, city, postalCode)
    if (inputs.length >= 5) {
      await inputs[0].fill('Test');
      await inputs[1].fill('User');
      await inputs[2].fill('123 Test St');
      await inputs[3].fill('Madrid');
      await inputs[4].fill('28001');
      console.log('  Filled name and address fields');
    }
    
    // Email
    const emailInputs = await page.locator('input[type="email"]').all();
    if (emailInputs.length > 0) {
      await emailInputs[0].fill('caraseli02@gmail.com');
      console.log('  Filled email');
    }
    
    // Phone
    const phoneInputs = await page.locator('input[type="tel"]').all();
    if (phoneInputs.length > 0) {
      await phoneInputs[0].fill('600123456');
      console.log('  Filled phone');
    }
    
    // Country
    const selects = await page.locator('select').all();
    if (selects.length > 0) {
      try {
        await selects[0].selectOption('ES');
        console.log('  Selected country');
      } catch (e) {}
    }
    
    await sleep(2000);
    await page.screenshot({ path: join(SCREENSHOTS_DIR, '05-filled.png'), fullPage: true });
    console.log('  Screenshot: 05-filled.png');
    
    console.log('\nStep 6: Continue to payment');
    await page.locator('button[type="submit"]').first().click();
    await page.waitForLoadState('networkidle');
    await sleep(3000);
    await page.screenshot({ path: join(SCREENSHOTS_DIR, '06-payment.png'), fullPage: true });
    console.log('  Screenshot: 06-payment.png');
    
    console.log('\nStep 7: Select cash payment');
    const cashOptions = [
      'input[value="cash"]',
      'label:has-text("Efectivo")',
      'label:has-text("Cash")',
    ];
    
    for (const selector of cashOptions) {
      try {
        if (await page.locator(selector).count() > 0) {
          await page.locator(selector).first().click();
          console.log(`  Selected cash: ${selector}`);
          break;
        }
      } catch (e) {}
    }
    
    await sleep(2000);
    await page.locator('button[type="submit"]').first().click();
    await page.waitForLoadState('networkidle');
    await sleep(3000);
    await page.screenshot({ path: join(SCREENSHOTS_DIR, '07-review.png'), fullPage: true });
    console.log('  Screenshot: 07-review.png');
    
    console.log('\nStep 8: Accept terms');
    const checkboxes = await page.locator('input[type="checkbox"]').all();
    console.log(`  Found ${checkboxes.length} checkboxes`);
    for (const cb of checkboxes) {
      try {
        await cb.check();
      } catch (e) {}
    }
    await sleep(2000);
    
    console.log('\n' + '='.repeat(60));
    console.log('CRITICAL TEST: Placing order and monitoring redirect');
    console.log('='.repeat(60));
    
    const beforeUrl = page.url();
    console.log(`URL before order: ${beforeUrl}`);
    
    // Click place order
    const orderButtons = [
      'button:has-text("Realizar Pedido")',
      'button:has-text("Place Order")',
      'button:has-text("Realizar")',
    ];
    
    let clicked = false;
    for (const selector of orderButtons) {
      try {
        if (await page.locator(selector).count() > 0) {
          console.log(`Clicking: ${selector}`);
          await page.locator(selector).click({ timeout: 5000 });
          clicked = true;
          break;
        }
      } catch (e) {}
    }
    
    if (!clicked) {
      console.log('WARNING: Could not find place order button');
      const allButtons = await page.locator('button').all();
      console.log(`Total buttons on page: ${allButtons.length}`);
    }
    
    // Wait for navigation
    console.log('Waiting for navigation...');
    await sleep(5000);
    
    const afterUrl = page.url();
    console.log(`URL after order: ${afterUrl}`);
    
    await page.screenshot({ path: join(SCREENSHOTS_DIR, '08-final.png'), fullPage: true });
    console.log('Screenshot: 08-final.png');
    
    // Check for order number on page
    const pageText = await page.textContent('body');
    const orderMatch = pageText.match(/ORD-[A-Z0-9]+-[A-Z0-9]+/);
    
    console.log('\n' + '='.repeat(60));
    console.log('TEST RESULTS');
    console.log('='.repeat(60));
    
    if (afterUrl.includes('/checkout/confirmation')) {
      console.log('✅ SUCCESS: Landed on /checkout/confirmation');
      console.log(`   URL: ${afterUrl}`);
      if (orderMatch) {
        console.log(`   Order Number: ${orderMatch[0]}`);
      } else {
        console.log('   ⚠️  Order number not found on page');
      }
    } else if (afterUrl.includes('/cart')) {
      console.log('❌ FAILURE: Redirected to /cart (BUG NOT FIXED)');
      console.log(`   URL: ${afterUrl}`);
    } else if (afterUrl === beforeUrl) {
      console.log('⚠️  UNKNOWN: Still on same page (order may have failed)');
      console.log(`   URL: ${afterUrl}`);
    } else {
      console.log('⚠️  UNEXPECTED: Landed on different page');
      console.log(`   URL: ${afterUrl}`);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('CONSOLE LOG ANALYSIS');
    console.log('='.repeat(60));
    
    const persistLogs = consoleLogs.filter(l => l.text.includes('PERSIST'));
    const restoreLogs = consoleLogs.filter(l => l.text.includes('RESTORE'));
    const orderDataLogs = consoleLogs.filter(l => l.text.includes('orderData'));
    
    console.log(`\nPERSIST logs: ${persistLogs.length}`);
    persistLogs.forEach(l => console.log(`  ${l.text}`));
    
    console.log(`\nRESTORE logs: ${restoreLogs.length}`);
    restoreLogs.forEach(l => console.log(`  ${l.text}`));
    
    console.log(`\norderData logs: ${orderDataLogs.length}`);
    orderDataLogs.forEach(l => console.log(`  ${l.text}`));
    
    fs.writeFileSync(join(SCREENSHOTS_DIR, 'logs.json'), JSON.stringify(consoleLogs, null, 2));
    console.log(`\nFull logs saved: ${SCREENSHOTS_DIR}/logs.json`);
    console.log('Screenshots: ' + SCREENSHOTS_DIR);
    console.log('='.repeat(60));
    
    console.log('\nBrowser will stay open for 30 seconds for inspection...');
    await sleep(30000);
    
  } catch (error) {
    console.error('\nTest Error:', error.message);
    console.error('Stack:', error.stack);
    await page.screenshot({ path: join(SCREENSHOTS_DIR, 'error.png'), fullPage: true });
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
