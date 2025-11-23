import { chromium } from 'playwright';

async function testAddressForm() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();
  
  // Log console messages
  page.on('console', msg => console.log('CONSOLE:', msg.text()));
  
  // Log errors
  page.on('pageerror', err => console.error('PAGE ERROR:', err.message));
  
  try {
    console.log('\n=== Step 1: Navigate to homepage ===');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.screenshot({ path: '/tmp/step1-homepage.png', fullPage: true });
    console.log('Screenshot saved: /tmp/step1-homepage.png');
    
    console.log('\n=== Step 2: Navigate to login page ===');
    await page.goto('http://localhost:3000/auth/login', { waitUntil: 'networkidle' });
    await page.screenshot({ path: '/tmp/step2-login-page.png', fullPage: true });
    console.log('Screenshot saved: /tmp/step2-login-page.png');
    
    console.log('\n=== Step 3: Login with test credentials ===');
    // Fill in login form
    await page.fill('input[type="email"]', 'customer@moldovadirect.com');
    await page.fill('input[type="password"]', 'Customer123!@#');
    await page.screenshot({ path: '/tmp/step3-login-filled.png', fullPage: true });
    console.log('Screenshot saved: /tmp/step3-login-filled.png');
    
    // Click login button
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: '/tmp/step4-after-login.png', fullPage: true });
    console.log('Screenshot saved: /tmp/step4-after-login.png');
    
    console.log('\n=== Step 4: Navigate to profile page ===');
    await page.goto('http://localhost:3000/account/profile', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: '/tmp/step5-profile-page.png', fullPage: true });
    console.log('Screenshot saved: /tmp/step5-profile-page.png');
    
    // Check for any visible errors
    const errorElements = await page.$$('.error, .alert-error, [role="alert"]');
    if (errorElements.length > 0) {
      console.log('WARNING: Found error elements on page');
    }
    
    console.log('\n=== Step 5: Look for Add Address button ===');
    const addButtonSelectors = [
      'button:has-text("Add Address")',
      'button:has-text("Añadir dirección")',
      'button:has-text("Agregar")',
      'button:has-text("Add")',
      '[data-test="add-address"]',
      '.add-address-button'
    ];
    
    let addButton = null;
    for (const selector of addButtonSelectors) {
      try {
        addButton = await page.$(selector);
        if (addButton) {
          console.log('Found Add Address button with selector:', selector);
          break;
        }
      } catch (e) {
        // Selector not found, try next
      }
    }
    
    if (!addButton) {
      console.log('WARNING: Could not find Add Address button. Listing all buttons:');
      const buttons = await page.$$('button');
      for (let i = 0; i < buttons.length; i++) {
        const text = await buttons[i].textContent();
        console.log(`Button ${i}: "${text}"`);
      }
      await page.screenshot({ path: '/tmp/step6-no-add-button.png', fullPage: true });
      throw new Error('Add Address button not found');
    }
    
    console.log('\n=== Step 6: Click Add Address button ===');
    await addButton.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: '/tmp/step7-modal-opened.png', fullPage: true });
    console.log('Screenshot saved: /tmp/step7-modal-opened.png');
    
    console.log('\n=== Step 7: Verify form fields ===');
    const formFields = {
      'Address Type (radio)': ['input[type="radio"][value="shipping"]', 'input[type="radio"][value="billing"]'],
      'First Name': ['input[name="first_name"]', 'input[placeholder*="First"]', 'input[id*="first"]'],
      'Last Name': ['input[name="last_name"]', 'input[placeholder*="Last"]', 'input[id*="last"]'],
      'Company': ['input[name="company"]', 'input[placeholder*="Company"]'],
      'Street': ['input[name="street"]', 'input[placeholder*="Street"]', 'textarea[name="street"]'],
      'City': ['input[name="city"]', 'input[placeholder*="City"]'],
      'Postal Code': ['input[name="postal_code"]', 'input[placeholder*="Postal"]'],
      'Province': ['input[name="province"]', 'select[name="province"]', 'input[placeholder*="Province"]'],
      'Country': ['select[name="country"]', 'input[name="country"]'],
      'Phone': ['input[name="phone"]', 'input[placeholder*="Phone"]'],
      'Default checkbox': ['input[type="checkbox"][name*="default"]', 'input[type="checkbox"][id*="default"]']
    };
    
    const missingFields = [];
    for (const [fieldName, selectors] of Object.entries(formFields)) {
      let found = false;
      for (const selector of selectors) {
        try {
          const element = await page.$(selector);
          if (element) {
            console.log(`✓ Found: ${fieldName}`);
            found = true;
            break;
          }
        } catch (e) {}
      }
      if (!found) {
        console.log(`✗ Missing: ${fieldName}`);
        missingFields.push(fieldName);
      }
    }
    
    if (missingFields.length > 0) {
      console.log('\nWARNING: Missing fields:', missingFields.join(', '));
    }
    
    console.log('\n=== Step 8: Fill out the form ===');
    // Try to fill each field
    await page.fill('input[name="first_name"], input[placeholder*="First"]', 'John');
    await page.fill('input[name="last_name"], input[placeholder*="Last"]', 'Doe');
    await page.fill('input[name="street"], textarea[name="street"]', '123 Test Street');
    await page.fill('input[name="city"]', 'Madrid');
    await page.fill('input[name="postal_code"]', '28001');
    
    // Select country
    try {
      await page.selectOption('select[name="country"]', 'ES');
    } catch (e) {
      console.log('Could not select country via select element');
    }
    
    // Click shipping radio
    try {
      await page.click('input[type="radio"][value="shipping"]');
    } catch (e) {
      console.log('Could not click shipping radio button');
    }
    
    // Check default checkbox
    try {
      await page.check('input[type="checkbox"][name*="default"]');
    } catch (e) {
      console.log('Could not check default checkbox');
    }
    
    await page.screenshot({ path: '/tmp/step8-form-filled.png', fullPage: true });
    console.log('Screenshot saved: /tmp/step8-form-filled.png');
    
    console.log('\n=== Step 9: Submit the form ===');
    const submitButton = await page.$('button[type="submit"]');
    if (submitButton) {
      await submitButton.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: '/tmp/step9-after-submit.png', fullPage: true });
      console.log('Screenshot saved: /tmp/step9-after-submit.png');
    } else {
      console.log('WARNING: Submit button not found');
    }
    
    console.log('\n=== Test Complete ===');
    
  } catch (error) {
    console.error('ERROR:', error.message);
    await page.screenshot({ path: '/tmp/error-screenshot.png', fullPage: true });
    console.log('Error screenshot saved: /tmp/error-screenshot.png');
  } finally {
    await browser.close();
  }
}

testAddressForm().catch(console.error);
