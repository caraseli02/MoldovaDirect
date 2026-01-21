// /tmp/playwright-test-shadcn-pages.js
const { chromium } = require('playwright');

const BASE_URL = 'http://localhost:3000';

const pages = [
  { path: '/', name: 'homepage' },
  { path: '/products', name: 'products' },
  { path: '/checkout', name: 'checkout' },
];

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 50
  });

  const page = await browser.newPage();

  // Listen for console messages
  const consoleMessages = [];
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error' || type === 'warning') {
      consoleMessages.push({ page: 'current', type, text });
    }
  });

  // Listen for page errors
  const pageErrors = [];
  page.on('pageerror', error => {
    pageErrors.push({ page: 'current', message: error.message, stack: error.stack });
  });

  for (const pageInfo of pages) {
    const url = `${BASE_URL}${pageInfo.path}`;
    console.log(`\n🔍 Testing: ${url}`);

    try {
      await page.goto(url, {
        waitUntil: 'networkidle',
        timeout: 15000
      });

      const title = await page.title();
      console.log(`   ✓ Page loaded: "${title}"}`);

      // Check for shadcn-vue components
      const uiButtons = await page.locator('[data-slot="root"], button[class*="rounded"]').count();
      const uiInputs = await page.locator('[data-slot="input"]').count();
      console.log(`   ✓ UI Components found: ${uiButtons} buttons, ${uiInputs} inputs`);

      // Take screenshot
      const screenshotPath = `/tmp/${pageInfo.name}.png`;
      await page.screenshot({
        path: screenshotPath,
        fullPage: true
      });
      console.log(`   📸 Screenshot: ${screenshotPath}`);

    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('SUMMARY');
  console.log('='.repeat(50));

  if (consoleMessages.length > 0) {
    console.log(`\n⚠️  Console Messages (${consoleMessages.length}):`);
    consoleMessages.forEach(msg => {
      console.log(`   [${msg.type}] ${msg.text.substring(0, 100)}`);
    });
  } else {
    console.log('\n✅ No console errors or warnings');
  }

  if (pageErrors.length > 0) {
    console.log(`\n❌ Page Errors (${pageErrors.length}):`);
    pageErrors.forEach(err => {
      console.log(`   ${err.message.substring(0, 100)}`);
    });
  } else {
    console.log('✅ No page errors');
  }

  console.log('\n✅ All tests complete!');

  await browser.close();
})();
