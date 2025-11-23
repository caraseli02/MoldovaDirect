import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BASE_URL = 'http://localhost:3001';
const SCREENSHOT_DIR = join(__dirname, 'test-screenshots', 'checkout-flow');

const config = {
  viewport: { width: 1280, height: 800 },
  slowMo: 500,
  timeout: 30000
};

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function captureScreenshot(page, name, fullPage = false) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = name + '-' + timestamp + '.png';
  const path = join(SCREENSHOT_DIR, filename);
  
  await page.screenshot({ 
    path, 
    fullPage,
    animations: 'disabled'
  });
  
  console.log('✓ Screenshot saved: ' + filename);
  return filename;
}

async function testCheckoutFlow() {
  console.log('='.repeat(60));
  console.log('CHECKOUT SMART PRE-POPULATION VISUAL REGRESSION TEST');
  console.log('='.repeat(60));
  console.log('');

  const browser = await chromium.launch({ 
    headless: false,
    slowMo: config.slowMo
  });
  
  const context = await browser.newContext({
    viewport: config.viewport,
    locale: 'en-US'
  });
  
  const page = await context.newPage();
  
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  try {
    console.log('\n📍 PHASE 1: Homepage Navigation');
    console.log('-'.repeat(60));
    
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await sleep(2000);
    await captureScreenshot(page, '01-homepage', true);
    
    const productLink = page.locator('a[href*="/products/"]').first();
    
    if (await productLink.count() > 0) {
      await productLink.click();
      await page.waitForLoadState('networkidle');
      await sleep(2000);
      await captureScreenshot(page, '02-product-detail', true);
      
      const addToCartBtn = page.locator('button').filter({ hasText: /add to cart|añadir al carrito|agregar/i }).first();
      
      if (await addToCartBtn.count() > 0) {
        await addToCartBtn.click();
        await sleep(2000);
        await captureScreenshot(page, '03-after-add-to-cart', true);
      } else {
        console.log('⚠ Could not find Add to Cart button');
      }
    } else {
      console.log('⚠ No products found on homepage');
    }

    console.log('\n📍 PHASE 2: Guest Checkout (Baseline Test)');
    console.log('-'.repeat(60));
    
    await page.goto(BASE_URL + '/checkout', { waitUntil: 'networkidle' });
    await sleep(2000);
    await captureScreenshot(page, '04-checkout-initial-guest', true);
    
    const continueAsGuestBtn = page.locator('button').filter({ hasText: /continue as guest|continuar como invitado/i }).first();
    
    if (await continueAsGuestBtn.count() > 0) {
      console.log('✓ Guest checkout option found');
      await continueAsGuestBtn.click();
      await sleep(2000);
      await captureScreenshot(page, '05-guest-checkout-form', true);
    } else {
      console.log('ℹ No guest checkout prompt');
    }

    console.log('\n📍 PHASE 3: User Authentication');
    console.log('-'.repeat(60));
    
    await page.goto(BASE_URL + '/auth/signin', { waitUntil: 'networkidle' });
    await sleep(2000);
    await captureScreenshot(page, '06-signin-page', true);
    
    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    
    if (await emailInput.count() > 0 && await passwordInput.count() > 0) {
      console.log('ℹ Sign-in form found - Manual sign-in required');
      console.log('ℹ Please sign in manually in the browser window...');
      console.log('ℹ Waiting 30 seconds for manual authentication...');
      
      await sleep(30000);
      
      await captureScreenshot(page, '07-after-signin', true);
    } else {
      console.log('⚠ Could not find sign-in form');
    }

    console.log('\n📍 PHASE 4: First Authenticated Checkout (Create Baseline)');
    console.log('-'.repeat(60));
    
    await page.goto(BASE_URL + '/checkout', { waitUntil: 'networkidle' });
    await sleep(3000);
    await captureScreenshot(page, '08-checkout-authenticated-first-time', true);
    
    const fullNameInput = page.locator('input[name="full_name"], input#full_name').first();
    
    if (await fullNameInput.count() > 0) {
      console.log('Filling shipping address form...');
      
      await fullNameInput.fill('Test User');
      await page.locator('input[name="address"], input#address').first().fill('123 Test Street');
      await page.locator('input[name="city"], input#city').first().fill('Test City');
      await page.locator('input[name="postal_code"], input#postal_code').first().fill('12345');
      
      const countrySelect = page.locator('select[name="country"], select#country').first();
      if (await countrySelect.count() > 0) {
        await countrySelect.selectOption('United States');
      }
      
      await sleep(2000);
      await captureScreenshot(page, '09-address-filled', true);
      
      const saveAddressCheckbox = page.locator('input[type="checkbox"]').filter({ 
        hasText: /save|guardar/i 
      }).first();
      
      if (await saveAddressCheckbox.count() > 0) {
        await saveAddressCheckbox.check();
        console.log('✓ Save Address checkbox checked');
        await sleep(1000);
        await captureScreenshot(page, '10-address-save-checked', true);
      }
    }
    
    await sleep(3000);
    await captureScreenshot(page, '11-shipping-methods-loaded', true);
    
    const shippingMethodRadio = page.locator('input[type="radio"][name*="shipping"]').first();
    if (await shippingMethodRadio.count() > 0) {
      await shippingMethodRadio.check();
      console.log('✓ Shipping method selected');
      await sleep(1000);
      await captureScreenshot(page, '12-shipping-method-selected', true);
    }

    console.log('\n📍 PHASE 5: Return Visit - Express Checkout Banner Test');
    console.log('-'.repeat(60));
    
    await page.goto(BASE_URL + '/checkout', { waitUntil: 'networkidle' });
    await sleep(3000);
    await captureScreenshot(page, '13-express-checkout-banner-visible', true);
    
    const expressBanner = page.locator('.express-checkout-banner, [class*="express"]').first();
    
    if (await expressBanner.count() > 0) {
      console.log('✅ EXPRESS CHECKOUT BANNER FOUND!');
      await sleep(1000);
      
      await expressBanner.screenshot({
        path: join(SCREENSHOT_DIR, '14-express-banner-closeup.png')
      });
      console.log('✓ Screenshot saved: 14-express-banner-closeup.png');
      
      const useExpressBtn = page.locator('button').filter({ 
        hasText: /use express|usar express/i 
      }).first();
      
      if (await useExpressBtn.count() > 0) {
        console.log('✓ Use Express Checkout button found');
        await sleep(2000);
        
        await useExpressBtn.click();
        console.log('✓ Use Express Checkout button clicked');
        
        await sleep(3000);
        await captureScreenshot(page, '15-after-express-checkout-click', true);
        
        const currentUrl = page.url();
        console.log('Current URL: ' + currentUrl);
        
        if (currentUrl.includes('/payment')) {
          console.log('✅ Redirected to payment step!');
        } else {
          console.log('ℹ Staying on shipping step (form should be pre-populated)');
        }
      } else {
        console.log('⚠ Use Express Checkout button not found');
      }
    } else {
      console.log('❌ EXPRESS CHECKOUT BANNER NOT FOUND!');
      console.log('⚠ This indicates the feature may not be working correctly');
    }
    
    await sleep(2000);
    const prePopulatedName = await fullNameInput.inputValue();
    if (prePopulatedName) {
      console.log('✓ Address pre-populated with: ' + prePopulatedName);
    }
    
    await captureScreenshot(page, '16-final-state', true);

    console.log('\n' + '='.repeat(60));
    console.log('TEST RESULTS SUMMARY');
    console.log('='.repeat(60));
    
    if (consoleErrors.length > 0) {
      console.log('\n⚠ CONSOLE ERRORS DETECTED:');
      consoleErrors.forEach((error, idx) => {
        console.log('  ' + (idx + 1) + '. ' + error);
      });
    } else {
      console.log('\n✅ No console errors detected');
    }
    
    console.log('\n📁 Screenshots saved to:');
    console.log('   ' + SCREENSHOT_DIR);
    console.log('');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    await captureScreenshot(page, 'ERROR-state', true);
  } finally {
    console.log('\nTest completed. Browser will close in 5 seconds...');
    await sleep(5000);
    await browser.close();
  }
}

testCheckoutFlow().catch(console.error);
