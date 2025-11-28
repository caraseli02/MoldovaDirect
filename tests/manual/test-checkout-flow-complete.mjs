import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BASE_URL = 'http://localhost:3000';
const SCREENSHOTS_DIR = join(__dirname, 'test-results', 'checkout-flow');

// Ensure screenshots directory exists
import { mkdirSync } from 'fs';
mkdirSync(SCREENSHOTS_DIR, { recursive: true });

async function testCheckoutFlow() {
  console.log('\n🧪 Starting Complete Checkout Flow Test...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    locale: 'es-ES'
  });
  
  const page = await context.newPage();
  
  const consoleMessages = [];
  const errors = [];
  
  page.on('console', msg => {
    const msgType = msg.type();
    const text = msg.text();
    consoleMessages.push({ type: msgType, text });
    console.log('  [CONSOLE ' + msgType + '] ' + text);
  });
  
  page.on('pageerror', error => {
    errors.push(error.message);
    console.error('  [PAGE ERROR] ' + error.message);
  });
  
  try {
    console.log('📍 Step 1: Navigating to homepage...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ 
      path: join(SCREENSHOTS_DIR, '01-homepage.png'),
      fullPage: true 
    });
    console.log('✅ Homepage loaded\n');
    
    console.log('📍 Step 2: Navigating to products page...');
    
    const productsSelectors = [
      'a[href="/products"]',
      'a[href="/es/products"]',
      'nav a:has-text("Productos")',
      'nav a:has-text("Products")',
      'a:has-text("Ver Catálogo")',
      'a:has-text("Ver todos")'
    ];
    
    let productsNavigated = false;
    for (const selector of productsSelectors) {
      try {
        const link = await page.$(selector);
        if (link) {
          await link.click();
          await page.waitForURL(/\/products/, { timeout: 5000 });
          productsNavigated = true;
          break;
        }
      } catch (e) {
        // Try next
      }
    }
    
    if (!productsNavigated) {
      console.log('  ℹ️  Navigating directly to products...');
      await page.goto(BASE_URL + '/products', { waitUntil: 'networkidle' });
    }
    
    await page.waitForTimeout(1000);
    await page.screenshot({ 
      path: join(SCREENSHOTS_DIR, '02-products-page.png'),
      fullPage: true 
    });
    console.log('✅ Products page loaded\n');
    
    console.log('📍 Step 3: Adding product to cart...');
    
    await page.waitForSelector('[data-testid="product-card"], .product-card, article', { timeout: 10000 });
    
    const addToCartSelectors = [
      'button:has-text("Añadir al carrito")',
      'button:has-text("Add to cart")',
      'button:has-text("Agregar")',
      '[data-testid="add-to-cart"]',
      'button[type="button"]:has-text("carrito")'
    ];
    
    let cartButtonClicked = false;
    for (const selector of addToCartSelectors) {
      try {
        const button = await page.$(selector);
        if (button && await button.isVisible()) {
          await button.click();
          cartButtonClicked = true;
          console.log('  ✓ Clicked: ' + selector);
          break;
        }
      } catch (e) {
        // Next
      }
    }
    
    if (!cartButtonClicked) {
      console.log('  ⚠️  Trying first product...');
      const firstProduct = await page.$('[data-testid="product-card"], .product-card, article');
      if (firstProduct) {
        await firstProduct.click();
        await page.waitForTimeout(2000);
        
        for (const selector of addToCartSelectors) {
          try {
            const button = await page.$(selector);
            if (button && await button.isVisible()) {
              await button.click();
              cartButtonClicked = true;
              console.log('  ✓ Clicked on detail page: ' + selector);
              break;
            }
          } catch (e) {
            // Continue
          }
        }
      }
    }
    
    if (!cartButtonClicked) {
      throw new Error('Could not add product to cart');
    }
    
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: join(SCREENSHOTS_DIR, '03-product-added.png'),
      fullPage: true 
    });
    console.log('✅ Product added to cart\n');
    
    console.log('📍 Step 4: Navigating to cart page...');
    
    const cartSelectors = [
      'a[href="/cart"]',
      'a[href="/es/cart"]',
      '[data-testid="cart-link"]',
      'a:has-text("Carrito")',
      'a:has-text("Cart")',
      'button:has-text("Ver carrito")',
      'nav [class*="cart"]'
    ];
    
    let cartNavigated = false;
    for (const selector of cartSelectors) {
      try {
        const link = await page.$(selector);
        if (link && await link.isVisible()) {
          await link.click();
          await page.waitForURL(/\/cart/, { timeout: 5000 });
          cartNavigated = true;
          console.log('  ✓ Clicked: ' + selector);
          break;
        }
      } catch (e) {
        // Next
      }
    }
    
    if (!cartNavigated) {
      console.log('  ℹ️  Navigating directly to cart...');
      await page.goto(BASE_URL + '/cart', { waitUntil: 'networkidle' });
    }
    
    await page.waitForTimeout(1000);
    await page.screenshot({ 
      path: join(SCREENSHOTS_DIR, '04-cart-page.png'),
      fullPage: true 
    });
    console.log('✅ Cart page loaded\n');
    
    console.log('📍 Step 5: Clicking checkout button...');
    console.log('  🔍 Looking for checkout button...\n');
    
    await page.waitForTimeout(1500);
    
    const checkoutSelectors = [
      'button:has-text("Proceder al Pago")',
      'a:has-text("Proceder al Pago")',
      'button:has-text("Checkout")',
      'a:has-text("Checkout")',
      '[data-testid="checkout-button"]',
      'button[type="button"]:has-text("Pago")',
      'a[href*="checkout"]'
    ];
    
    let checkoutButton = null;
    let usedSelector = '';
    
    for (const selector of checkoutSelectors) {
      try {
        const button = await page.$(selector);
        if (button) {
          const isVisible = await button.isVisible();
          const isEnabled = await button.isEnabled();
          console.log('  Selector: ' + selector + ' - Visible: ' + isVisible + ', Enabled: ' + isEnabled);
          
          if (isVisible && isEnabled) {
            checkoutButton = button;
            usedSelector = selector;
            break;
          }
        }
      } catch (e) {
        console.log('  Selector: ' + selector + ' - Not found');
      }
    }
    
    if (!checkoutButton) {
      await page.screenshot({ 
        path: join(SCREENSHOTS_DIR, '05-no-checkout-button.png'),
        fullPage: true 
      });
      throw new Error('Could not find checkout button');
    }
    
    console.log('\n  ✓ Found checkout button: ' + usedSelector);
    console.log('  🖱️  Clicking checkout button...\n');
    
    errors.length = 0;
    consoleMessages.length = 0;
    
    await checkoutButton.click();
    
    await page.waitForTimeout(2000);
    
    console.log('📍 Step 6: Verifying navigation to /checkout...');
    
    try {
      await page.waitForURL(/\/checkout/, { timeout: 5000 });
      console.log('✅ Successfully navigated to /checkout\n');
    } catch (e) {
      const currentUrl = page.url();
      console.log('❌ Navigation failed. Current URL: ' + currentUrl + '\n');
      await page.screenshot({ 
        path: join(SCREENSHOTS_DIR, '06-navigation-failed.png'),
        fullPage: true 
      });
      throw new Error('Failed to navigate to checkout. Current URL: ' + currentUrl);
    }
    
    await page.waitForTimeout(1000);
    await page.screenshot({ 
      path: join(SCREENSHOTS_DIR, '07-checkout-page.png'),
      fullPage: true 
    });
    
    console.log('📍 Step 7: Checking for console errors...\n');
    
    const useCartStoreErrors = errors.filter(err => 
      err.includes('useCartStore') || 
      err.includes('is not defined') ||
      err.includes('ReferenceError')
    );
    
    if (useCartStoreErrors.length > 0) {
      console.log('❌ FOUND useCartStore ERRORS:\n');
      useCartStoreErrors.forEach((err, i) => {
        console.log('  Error ' + (i + 1) + ': ' + err + '\n');
      });
    } else {
      console.log('✅ No useCartStore errors found!\n');
    }
    
    if (errors.length > 0) {
      console.log('⚠️  Other Errors:\n');
      errors.forEach((err, i) => {
        if (!useCartStoreErrors.includes(err)) {
          console.log('  Error ' + (i + 1) + ': ' + err + '\n');
        }
      });
    } else {
      console.log('✅ No console errors!\n');
    }
    
    const warnings = consoleMessages.filter(msg => msg.type === 'warning');
    if (warnings.length > 0) {
      console.log('⚠️  Console Warnings:\n');
      warnings.forEach((warn, i) => {
        console.log('  Warning ' + (i + 1) + ': ' + warn.text + '\n');
      });
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log('✅ Homepage: Loaded');
    console.log('✅ Products Page: Loaded');
    console.log('✅ Add to Cart: Success');
    console.log('✅ Cart Page: Loaded');
    console.log((errors.length === 0 ? '✅' : '❌') + ' Checkout Navigation: ' + (errors.length === 0 ? 'Success' : 'Failed'));
    console.log((useCartStoreErrors.length === 0 ? '✅' : '❌') + ' useCartStore Error: ' + (useCartStoreErrors.length === 0 ? 'NOT FOUND (FIXED)' : 'STILL EXISTS'));
    console.log('📊 Total Errors: ' + errors.length);
    console.log('📊 Total Warnings: ' + warnings.length);
    console.log('='.repeat(60) + '\n');
    
    console.log('📸 Screenshots saved to: ' + SCREENSHOTS_DIR + '\n');
    
    console.log('⏳ Keeping browser open for 5 seconds...\n');
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('\n❌ TEST FAILED: ' + error.message);
    
    try {
      await page.screenshot({ 
        path: join(SCREENSHOTS_DIR, 'error-final.png'),
        fullPage: true 
      });
    } catch (e) {
      // Ignore
    }
    
    throw error;
  } finally {
    await browser.close();
  }
}

testCheckoutFlow()
  .then(() => {
    console.log('✅ Test completed successfully!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
