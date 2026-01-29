const { chromium } = require('playwright');
const fs = require('fs');

const TARGET_URL = 'http://localhost:3000';
const OUTPUT_DIR = '/tmp/checkout-review-full';

// Comprehensive checkout page review with populated cart
(async () => {
  console.log('🔍 Starting comprehensive checkout review with cart...\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 50,
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });

  const page = await context.newPage();

  const issues = [];
  const successes = [];

  try {
    // === STEP 1: Add item to cart ===
    console.log('🛒 Step 1: Adding item to cart...');
    await page.goto(`${TARGET_URL}/products`, { waitUntil: 'networkidle' });

    // Look for any product and add to cart
    const addToCartButton = await page.$('button:has-text("Add"), button:has-text("Añadir"), button:has-text("Comprar")');
    if (addToCartButton) {
      await addToCartButton.click();
      await page.waitForTimeout(1000);
      successes.push('✓ Item added to cart');
    }

    // === STEP 2: Navigate to checkout ===
    console.log('\n📄 Step 2: Navigating to checkout...');
    await page.goto(`${TARGET_URL}/checkout`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);

    // Check if we're on checkout or cart
    const pageTitle = await page.title();
    console.log(`   Page title: ${pageTitle}`);

    // === STEP 3: Take screenshots ===
    console.log('\n📸 Taking screenshots...');
    await page.screenshot({ path: `${OUTPUT_DIR}/01-checkout-desktop.png`, fullPage: true });
    successes.push('✓ Desktop screenshot captured');

    // === STEP 4: Accessibility checks ===
    console.log('\n🔍 Accessibility checks...');

    // Skip links
    const skipLinks = await page.$$eval('a[href^="#"]', links =>
      links.map(l => ({ href: l.getAttribute('href'), text: l.textContent }))
    );
    console.log(`   Skip links: ${skipLinks.length}`);
    skipLinks.forEach(l => console.log(`     - ${l.text?.trim()} -> ${l.href}`));
    if (skipLinks.length > 0) {
      successes.push('✓ Skip navigation links found');
    } else {
      issues.push('⚠️  No skip navigation links (minor)');
    }

    // ARIA live regions
    const ariaLive = await page.$$('[aria-live]');
    console.log(`   aria-live regions: ${ariaLive.length}`);
    if (ariaLive.length > 0) successes.push(`✓ ${ariaLive.length} aria-live regions`);

    // Required field indicators
    const requiredIndicators = await page.$$('[aria-required="true"]');
    console.log(`   Required fields marked: ${requiredIndicators.length}`);

    // === STEP 5: Form structure ===
    console.log('\n🔍 Form structure...');

    // Check for fieldset/legend groups
    const fieldsets = await page.$$('fieldset');
    console.log(`   Fieldset groups: ${fieldsets.length}`);
    if (fieldsets.length > 0) successes.push('✓ Form uses fieldset/legend grouping');

    // Check for checkboxes with proper ARIA
    const checkboxes = await page.$$eval('input[type="checkbox"]', checkboxes =>
      checkboxes.map(cb => ({
        hasAriaInvalid: cb.getAttribute('aria-invalid') !== null,
        hasAriaDescribedby: cb.getAttribute('aria-describedby') !== null,
        hasAriaRequired: cb.getAttribute('aria-required') !== null
      }))
    );
    const wellLabeledCheckboxes = checkboxes.filter(cb => cb.hasAriaInvalid || cb.hasAriaDescribedby);
    console.log(`   Checkboxes with ARIA: ${wellLabeledCheckboxes.length}/${checkboxes.length}`);

    // === STEP 6: Place Order button ===
    console.log('\n🔍 Place Order button...');
    const placeOrderBtns = await page.$$eval('button', buttons =>
      buttons
        .filter(b => b.textContent && (b.textContent.includes('Order') || b.textContent.includes('Pedido')))
        .map(b => ({ text: b.textContent, disabled: b.disabled }))
    );
    console.log(`   Place Order buttons: ${placeOrderBtns.length}`);
    placeOrderBtns.forEach(btn => console.log(`     - "${btn.text.trim()}" (disabled: ${btn.disabled})`));

    const btnWithTotal = placeOrderBtns.find(b => b.text.includes('€') || b.text.includes('$'));
    if (btnWithTotal) successes.push('✓ Place Order button shows total');

    // === STEP 7: Mobile view ===
    console.log('\n📱 Mobile view...');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({ path: `${OUTPUT_DIR}/02-mobile.png`, fullPage: true });

    const mobileFooter = await page.$('.lg\\:hidden.fixed');
    if (mobileFooter) successes.push('✓ Mobile sticky footer present');
    await page.waitForTimeout(500);

    // === STEP 8: Tablet view ===
    console.log('\n📱 Tablet view...');
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.screenshot({ path: `${OUTPUT_DIR}/03-tablet.png`, fullPage: true });

    // === STEP 9: Final desktop view ===
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.screenshot({ path: `${OUTPUT_DIR}/04-final-desktop.png`, fullPage: true });

  } catch (error) {
    console.error('❌ Error:', error.message);
    issues.push(`❌ Error: ${error.message}`);
  } finally {
    await context.close();
    await browser.close();

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📋 REVIEW SUMMARY');
    console.log('='.repeat(60));

    console.log('\n✅ SUCCESSES:');
    successes.forEach(s => console.log(`   ${s}`));

    if (issues.length > 0) {
      console.log('\n⚠️  REMAINING ISSUES:');
      issues.forEach(i => console.log(`   ${i}`));
    }

    console.log(`\n📁 Screenshots: ${OUTPUT_DIR}`);
    console.log('\n🏁 Review complete!');
  }
})();
