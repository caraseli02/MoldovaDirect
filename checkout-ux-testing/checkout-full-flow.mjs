import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:3000';
const SCREENSHOT_DIR = '/Users/vladislavcaraseli/Documents/MoldovaDirect/checkout-ux-testing/screenshots';

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function completeAllSteps() {
  console.log('🎯 COMPLETE CHECKOUT FLOW - ALL STEPS INCLUDING CONFIRMATION\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  // Listen for console messages and errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`❌ Browser console error: ${msg.text()}`);
    }
  });

  page.on('pageerror', error => {
    console.log(`❌ Page error: ${error.message}`);
  });

  try {
    // Start from cart
    console.log('STEP 1: Going to cart...');
    await page.goto(`${BASE_URL}/cart`, { waitUntil: 'networkidle' });
    await sleep(2000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-cart.png'), fullPage: true });
    console.log('✅ Screenshot: 01-cart.png');

    // Click checkout
    console.log('\nSTEP 2: Clicking checkout button...');
    const checkoutBtn = await page.locator('button:has-text("Finalizar")').first();
    await checkoutBtn.click();
    await page.waitForLoadState('networkidle');
    await sleep(3000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02-shipping-form.png'), fullPage: true });
    console.log('✅ Screenshot: 02-shipping-form.png');

    // Select shipping method
    console.log('\nSTEP 3: Selecting shipping method...');
    const shippingOption = await page.locator('text=Envío Estándar').first();
    await shippingOption.click();
    await sleep(1000);

    // Ensure selection with JavaScript
    await page.evaluate(() => {
      const radios = document.querySelectorAll('input[type="radio"]');
      if (radios.length > 0) {
        const radio = radios[0];
        radio.checked = true;
        radio.dispatchEvent(new Event('change', { bubbles: true }));
        radio.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });

    await sleep(2000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03-shipping-selected.png'), fullPage: true });
    console.log('✅ Screenshot: 03-shipping-selected.png');

    // Continue to payment
    console.log('\nSTEP 4: Continuing to payment...');
    const continueBtn = await page.locator('button:has-text("Continuar al Pago"), button:has-text("Continuar")').first();
    await continueBtn.click({ force: true });
    await page.waitForLoadState('networkidle');
    await sleep(3000);

    console.log(`Current URL: ${page.url()}`);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04-payment-page.png'), fullPage: true });
    console.log('✅ Screenshot: 04-payment-page.png');

    // Continue to review
    console.log('\nSTEP 5: Continuing to review...');
    const reviewBtn = await page.locator('button:has-text("Revisar"), button:has-text("Review"), button:has-text("Siguiente")').first();
    await reviewBtn.click();
    await page.waitForLoadState('networkidle');
    await sleep(3000);

    console.log(`Current URL: ${page.url()}`);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05-review-page.png'), fullPage: true });
    console.log('✅ Screenshot: 05-review-page.png');

    // Check Terms and Conditions checkboxes
    console.log('\nSTEP 6: Accepting Terms and Conditions...');

    // Find all checkboxes on the page
    const checkboxCount = await page.locator('input[type="checkbox"]').count();
    console.log(`Found ${checkboxCount} checkboxes`);

    // Check all checkboxes (terms and conditions)
    for (let i = 0; i < checkboxCount; i++) {
      try {
        const checkbox = page.locator('input[type="checkbox"]').nth(i);
        const isChecked = await checkbox.isChecked();

        if (!isChecked) {
          console.log(`  Checking checkbox ${i + 1}...`);
          await checkbox.check({ force: true });
          await sleep(500);
        }
      } catch (e) {
        console.log(`  ⚠️  Could not check checkbox ${i + 1}: ${e.message}`);
      }
    }

    await sleep(2000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05b-terms-accepted.png'), fullPage: true });
    console.log('✅ Screenshot: 05b-terms-accepted.png');

    // Check if place order button is now enabled
    const placeOrderBtn = await page.locator('button:has-text("Realizar Pedido"), button:has-text("Place Order"), button:has-text("Confirmar")').first();
    const isEnabled = await placeOrderBtn.evaluate(btn => !btn.disabled);
    console.log(`Place order button enabled: ${isEnabled}`);

    // Place the order
    console.log('\nSTEP 7: PLACING THE ORDER...');

    if (isEnabled) {
      console.log('🚀 Clicking "Realizar Pedido" button...');
      await placeOrderBtn.click();

      // Wait for navigation to confirmation page
      console.log('⏳ Waiting for confirmation page...');
      await page.waitForLoadState('networkidle', { timeout: 30000 });
      await sleep(10000); // Wait longer for async operations to complete

      console.log(`Current URL: ${page.url()}`);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06-confirmation-page.png'), fullPage: true });
      console.log('✅ Screenshot: 06-confirmation-page.png');

      // Check for confirmation elements
      const confirmationText = await page.locator('text=/confirmación|confirmed|gracias|thank you|pedido realizado|order placed/i').count();
      if (confirmationText > 0) {
        console.log('✅ ORDER CONFIRMATION DETECTED!');
      } else {
        console.log('⚠️  Checking what page we landed on...');
        const pageTitle = await page.title();
        console.log(`Page title: ${pageTitle}`);
      }
    } else {
      console.log('❌ Place order button is still disabled');

      // Debug: check what's preventing the button from being enabled
      await page.evaluate(() => {
        const btn = document.querySelector('button:has-text("Realizar Pedido")');
        console.log('Button state:', btn);
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach((cb, i) => {
          console.log(`Checkbox ${i}:`, cb.checked, cb.required);
        });
      });
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '99-final-state.png'), fullPage: true });
    console.log('\n✅ Screenshot: 99-final-state.png');

    console.log('\n' + '='.repeat(70));
    console.log('CHECKOUT FLOW COMPLETE');
    console.log('='.repeat(70));

    const screenshots = fs.readdirSync(SCREENSHOT_DIR).filter(f => f.endsWith('.png') && !f.startsWith('ERROR'));
    console.log(`\nTotal screenshots: ${screenshots.length}`);
    screenshots.forEach((s, i) => console.log(`  ${i+1}. ${s}`));

    console.log(`\n📁 Location: ${SCREENSHOT_DIR}`);

    console.log('\nKeeping browser open for 30 seconds for inspection...');
    await sleep(30000);

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'ERROR.png'), fullPage: true });
  } finally {
    await browser.close();
    console.log('\n✅ Test complete!');
  }
}

completeAllSteps();
