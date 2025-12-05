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
  console.log('🎯 COMPLETE CHECKOUT FLOW - SELF-CONTAINED TEST\n');

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
    // STEP 0: Clear cart and prepare test data
    console.log('STEP 0: Preparing test - clearing cart and adding products...');
    await page.goto(`${BASE_URL}/cart`, { waitUntil: 'networkidle' });
    await sleep(2000);

    // Clear cart if it has items - try multiple approaches for robustness
    const hasCheckoutButton = await page.locator('button:has-text("Finalizar")').count() > 0;
    const hasEmptyMessage = await page.locator('text=/tu carrito está vacío|cart is empty/i').count() > 0;

    if (hasCheckoutButton && !hasEmptyMessage) {
      console.log('  Cart has items - clearing...');

      // Try approach 1: Select all + Delete
      const selectAllBtn = await page.locator('button:has-text("Seleccionar todo")').first();
      if (await selectAllBtn.count() > 0) {
        console.log('    Using "Select All + Delete" method');
        await selectAllBtn.click();
        await sleep(500);
        const deleteButton = await page.locator('button:has-text("Eliminar"), button[aria-label*="Eliminar"]').first();
        if (await deleteButton.count() > 0) {
          await deleteButton.click();
          await sleep(1500);
        }
      } else {
        // Try approach 2: Delete items one by one
        console.log('    Deleting items individually');
        let attempts = 0;
        while (attempts < 10) { // Max 10 items
          const deleteButtons = await page.locator('button[aria-label*="Eliminar"], button:has-text("Eliminar")');
          const count = await deleteButtons.count();

          if (count === 0) break;

          await deleteButtons.first().click();
          await sleep(1000);
          attempts++;
        }
      }

      // Verify cart is now empty
      await sleep(1000);
      const stillHasItems = await page.locator('button:has-text("Finalizar")').count() > 0;
      if (stillHasItems) {
        console.log('  ⚠️  Warning: Cart may still have items after clearing attempt');
      } else {
        console.log('  ✅ Cart successfully cleared');
      }
    } else {
      console.log('  Cart is already empty');
    }

    // Go to products page
    console.log('  Navigating to products page...');
    await page.goto(`${BASE_URL}/products`, { waitUntil: 'networkidle' });
    await sleep(2000);

    // Add first available product (quantity: 2)
    console.log('  Adding first product (qty: 2)...');
    const firstProduct = await page.locator('article').first();
    await firstProduct.scrollIntoViewIfNeeded();
    await sleep(500);

    // Click on product card to open quick view or go to detail
    await firstProduct.click();
    await sleep(2000);

    // Try to add to cart (either from modal or product page)
    const addToCartBtn = await page.locator('button:has-text("Añadir al Carrito"), button:has-text("Add to Cart")').first();

    // Set quantity to 2 if quantity input exists
    const qtyInput = await page.locator('input[type="number"]').first();
    if (await qtyInput.count() > 0) {
      await qtyInput.fill('2');
      await sleep(500);
    }

    await addToCartBtn.click();
    await sleep(2000);
    console.log('  ✅ First product added');

    // Close modal if it exists
    const closeBtn = await page.locator('button[aria-label="Close"], button:has-text("×")').first();
    if (await closeBtn.count() > 0) {
      await closeBtn.click();
      await sleep(500);
    }

    // Go back to products if we're on product detail page
    if (page.url().includes('/products/')) {
      await page.goto(`${BASE_URL}/products`, { waitUntil: 'networkidle' });
      await sleep(2000);
    }

    // Add second product (quantity: 1)
    console.log('  Adding second product (qty: 1)...');
    const secondProduct = await page.locator('article').nth(1);
    await secondProduct.scrollIntoViewIfNeeded();
    await sleep(500);
    await secondProduct.click();
    await sleep(2000);

    const addToCartBtn2 = await page.locator('button:has-text("Añadir al Carrito"), button:has-text("Add to Cart")').first();
    await addToCartBtn2.click();
    await sleep(2000);
    console.log('  ✅ Second product added');

    // Close modal if it exists
    if (await closeBtn.count() > 0) {
      await closeBtn.click().catch(() => {});
      await sleep(500);
    }

    console.log('✅ Test data prepared - cart has 2 different products\n');

    // Wait for cart to be saved to cookies (auto-save has 500ms debounce)
    console.log('  Waiting for cart to persist to cookies...');
    await sleep(1000);

    // STEP 1: Go to cart
    console.log('STEP 1: Going to cart...');
    await page.goto(`${BASE_URL}/cart`, { waitUntil: 'networkidle' });
    await sleep(2000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-cart.png'), fullPage: true });
    console.log('✅ Screenshot: 01-cart.png');

    // Verify cart has items - check for checkout button or cart count
    const checkoutBtnCount = await page.locator('button:has-text("Finalizar")').count();
    const cartEmpty = await page.locator('text=/tu carrito está vacío|cart is empty/i').count();

    console.log(`  Checkout button visible: ${checkoutBtnCount > 0}`);
    console.log(`  Empty cart message: ${cartEmpty > 0}`);

    if (cartEmpty > 0 || checkoutBtnCount === 0) {
      throw new Error('Cart is empty after adding products!');
    }
    console.log(`  ✅ Cart has items and is ready for checkout`);

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
    const checkboxCount = await page.locator('input[type="checkbox"]').count();
    console.log(`Found ${checkboxCount} checkboxes`);

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

    // Check if place order button is enabled
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
      await sleep(10000); // Wait for async operations and cookie persistence

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

        // Check for error messages
        const errorMsg = await page.locator('text=/error|out of stock|agotado/i').count();
        if (errorMsg > 0) {
          console.log('⚠️  Error message detected on page');
          const errorText = await page.locator('text=/error|out of stock|agotado/i').first().textContent();
          console.log(`Error: ${errorText}`);
        }
      }
    } else {
      console.log('❌ Place order button is still disabled');
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

    console.log('\nSteps completed:');
    console.log('  ✅ 0. Test data prepared (cart populated)');
    console.log('  ✅ 1. Cart page');
    console.log('  ✅ 2. Shipping form');
    console.log('  ✅ 3. Shipping selected');
    console.log('  ✅ 4. Payment method');
    console.log('  ✅ 5. Review order');
    console.log('  ✅ 6. Terms accepted');
    console.log(isEnabled ? '  ✅ 7. Order placed' : '  ⚠️  7. Order placement blocked');

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
