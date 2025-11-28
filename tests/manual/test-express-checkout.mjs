import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BASE_URL = 'http://localhost:3001';
const SCREENSHOT_DIR = join(__dirname, 'test-screenshots', 'checkout-flow');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function captureScreenshot(page, name, fullPage = true) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
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

async function manualCheckoutTest() {
  console.log('\n='.repeat(70));
  console.log('EXPRESS CHECKOUT BANNER - MANUAL VISUAL REGRESSION TEST');
  console.log('='.repeat(70));
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 300
  });
  
  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 },
    locale: 'en-US'
  });
  
  const page = await context.newPage();
  
  const consoleErrors = [];
  const consoleWarnings = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    } else if (msg.type() === 'warning') {
      consoleWarnings.push(msg.text());
    }
  });

  try {
    console.log('\n📸 STEP 1: Navigating to Homepage');
    console.log('-'.repeat(70));
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 15000 });
    await sleep(2000);
    await captureScreenshot(page, 'step-01-homepage');
    console.log('✓ Homepage loaded');
    
    console.log('\n📸 STEP 2: Navigating directly to Checkout (Guest)');
    console.log('-'.repeat(70));
    await page.goto(BASE_URL + '/checkout', { waitUntil: 'networkidle', timeout: 15000 });
    await sleep(3000);
    await captureScreenshot(page, 'step-02-checkout-guest');
    console.log('✓ Checkout page loaded (guest mode)');
    
    console.log('\n📸 STEP 3: Navigating to Sign In page');
    console.log('-'.repeat(70));
    await page.goto(BASE_URL + '/auth/signin', { waitUntil: 'networkidle', timeout: 15000 });
    await sleep(2000);
    await captureScreenshot(page, 'step-03-signin-page');
    console.log('✓ Sign in page loaded');
    
    console.log('\n⏸️  MANUAL STEP REQUIRED:');
    console.log('   Please sign in with an authenticated user account');
    console.log('   You have 45 seconds to complete sign-in...');
    console.log('   After signing in, the test will continue automatically.');
    
    await sleep(45000);
    
    await captureScreenshot(page, 'step-04-after-signin');
    console.log('✓ Post-signin screenshot captured');
    
    console.log('\n📸 STEP 5: Navigating to Checkout (Authenticated - First Visit)');
    console.log('-'.repeat(70));
    await page.goto(BASE_URL + '/checkout', { waitUntil: 'networkidle', timeout: 15000 });
    await sleep(4000);
    await captureScreenshot(page, 'step-05-checkout-authenticated-initial');
    console.log('✓ Checkout page loaded (authenticated user)');
    
    const expressBanner1 = page.locator('.express-checkout-banner');
    const bannerCount1 = await expressBanner1.count();
    
    if (bannerCount1 > 0) {
      console.log('⚠️  Express banner detected on first visit (unexpected)');
    } else {
      console.log('✓ No express banner on first visit (expected)');
    }
    
    console.log('\n⏸️  MANUAL STEP REQUIRED:');
    console.log('   Please fill out the shipping form:');
    console.log('   1. Enter full name, address, city, postal code, country');
    console.log('   2. Check "Save this address" checkbox if available');
    console.log('   3. Select a shipping method when options appear');
    console.log('   4. DO NOT proceed to payment - just fill the form');
    console.log('   You have 60 seconds...');
    
    await sleep(60000);
    
    await captureScreenshot(page, 'step-06-form-filled');
    console.log('✓ Form filled screenshot captured');
    
    console.log('\n📸 STEP 7: Reloading Checkout to Test Express Banner');
    console.log('-'.repeat(70));
    await page.goto(BASE_URL + '/checkout', { waitUntil: 'networkidle', timeout: 15000 });
    await sleep(4000);
    await captureScreenshot(page, 'step-07-checkout-reload-express-test');
    console.log('✓ Checkout reloaded');
    
    const expressBanner2 = page.locator('.express-checkout-banner');
    const bannerCount2 = await expressBanner2.count();
    
    if (bannerCount2 > 0) {
      console.log('✅ EXPRESS CHECKOUT BANNER DETECTED!');
      console.log('✓ Banner element count: ' + bannerCount2);
      
      await expressBanner2.screenshot({
        path: join(SCREENSHOT_DIR, 'step-08-express-banner-closeup.png')
      });
      console.log('✓ Close-up screenshot of banner saved');
      
      const bannerText = await expressBanner2.textContent();
      console.log('✓ Banner text preview: ' + bannerText.substring(0, 100) + '...');
      
      const useExpressBtn = page.locator('button').filter({ 
        hasText: /use express|usar express/i 
      });
      
      if (await useExpressBtn.count() > 0) {
        console.log('✅ "Use Express Checkout" button found');
        
        console.log('\n⏸️  Testing Express Checkout button click...');
        await sleep(2000);
        
        await useExpressBtn.click();
        console.log('✓ Express Checkout button clicked');
        
        await sleep(4000);
        await captureScreenshot(page, 'step-09-after-express-click');
        
        const currentUrl = page.url();
        console.log('✓ Current URL after click: ' + currentUrl);
        
        if (currentUrl.includes('/payment')) {
          console.log('✅ Successfully redirected to payment step!');
        } else if (currentUrl.includes('/checkout')) {
          console.log('✓ Remained on checkout page (form should be pre-populated)');
          
          const nameInput = page.locator('input[name="full_name"], input#full_name').first();
          if (await nameInput.count() > 0) {
            const nameValue = await nameInput.inputValue();
            if (nameValue) {
              console.log('✅ Form pre-populated! Name field: ' + nameValue);
            } else {
              console.log('⚠️  Name field is empty (form may not be pre-populated)');
            }
          }
        }
      } else {
        console.log('❌ "Use Express Checkout" button NOT found');
      }
      
    } else {
      console.log('❌ EXPRESS CHECKOUT BANNER NOT DETECTED');
      console.log('⚠️  The feature may not be working as expected');
      
      console.log('\nDebugging information:');
      const pageContent = await page.content();
      if (pageContent.includes('express')) {
        console.log('✓ Word "express" found in page HTML');
      } else {
        console.log('⚠️  Word "express" NOT found in page HTML');
      }
    }
    
    await sleep(2000);
    await captureScreenshot(page, 'step-10-final-state');
    
    console.log('\n' + '='.repeat(70));
    console.log('CONSOLE OUTPUT SUMMARY');
    console.log('='.repeat(70));
    
    if (consoleErrors.length > 0) {
      console.log('\n⚠️  CONSOLE ERRORS (' + consoleErrors.length + '):');
      consoleErrors.forEach((error, idx) => {
        console.log('  ' + (idx + 1) + '. ' + error.substring(0, 200));
      });
    } else {
      console.log('\n✅ No console errors detected');
    }
    
    if (consoleWarnings.length > 0) {
      console.log('\n⚠️  CONSOLE WARNINGS (' + consoleWarnings.length + '):');
      consoleWarnings.slice(0, 5).forEach((warning, idx) => {
        console.log('  ' + (idx + 1) + '. ' + warning.substring(0, 200));
      });
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('TEST COMPLETE');
    console.log('='.repeat(70));
    console.log('\n📁 All screenshots saved to:');
    console.log('   ' + SCREENSHOT_DIR);
    console.log('\nBrowser will remain open for 10 seconds for manual inspection...');
    
    await sleep(10000);

  } catch (error) {
    console.error('\n❌ TEST ERROR:', error.message);
    console.error('\nStack trace:', error.stack);
    await captureScreenshot(page, 'ERROR-final-state');
  } finally {
    await browser.close();
    console.log('\n✓ Browser closed. Test session ended.\n');
  }
}

manualCheckoutTest().catch(console.error);
