import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3000';

async function checkPage(url, pageName) {
  console.log('\n' + '='.repeat(60));
  console.log('Checking: ' + pageName);
  console.log('URL: ' + url);
  console.log('='.repeat(60));

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    // Get page title
    const title = await page.title();
    console.log('\nPage Title: ' + title);

    // Get page URL (might have redirected)
    const currentUrl = page.url();
    console.log('Current URL: ' + currentUrl);

    // Check if redirected to login
    if (currentUrl.includes('/login')) {
      console.log('❌ REDIRECTED TO LOGIN - Authentication required!');
    }

    // Get visible text on page (first 500 chars)
    const bodyText = await page.evaluate(() => {
      return document.body.innerText.substring(0, 500);
    });
    console.log('\nPage Content (first 500 chars):');
    console.log(bodyText);

    // Check for specific elements
    const hasLoginForm = await page.locator('input[type="email"], input[type="password"]').count() > 0;
    const hasTable = await page.locator('table').count() > 0;
    const hasNav = await page.locator('nav, [role="navigation"]').count() > 0;
    const hasDashboard = await page.locator('text=Dashboard').count() > 0;
    
    console.log('\nElement Detection:');
    console.log('- Login Form: ' + (hasLoginForm ? 'YES' : 'NO'));
    console.log('- Table: ' + (hasTable ? 'YES' : 'NO'));
    console.log('- Navigation: ' + (hasNav ? 'YES' : 'NO'));
    console.log('- Dashboard Text: ' + (hasDashboard ? 'YES' : 'NO'));

    // Check for error messages
    const errorMessages = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        authError: text.includes('Auth session missing'),
        failedToLoad: text.includes('Failed to load'),
        error500: text.includes('500'),
        unauthorized: text.includes('Unauthorized')
      };
    });

    console.log('\nError Detection:');
    console.log('- Auth Session Missing: ' + (errorMessages.authError ? 'YES ❌' : 'NO ✅'));
    console.log('- Failed to Load: ' + (errorMessages.failedToLoad ? 'YES ❌' : 'NO ✅'));
    console.log('- Error 500: ' + (errorMessages.error500 ? 'YES ❌' : 'NO ✅'));
    console.log('- Unauthorized: ' + (errorMessages.unauthorized ? 'YES ❌' : 'NO ✅'));

  } catch (error) {
    console.error('❌ Error: ' + error.message);
  } finally {
    await browser.close();
  }
}

async function runChecks() {
  console.log('\n🔍 DETAILED PAGE CONTENT ANALYSIS');
  console.log('==================================\n');

  await checkPage(BASE_URL + '/admin', 'Admin Page');
  await checkPage(BASE_URL + '/admin/users', 'Admin Users Page');
  await checkPage(BASE_URL + '/admin/products', 'Admin Products Page');
  await checkPage(BASE_URL + '/admin/orders', 'Admin Orders Page');
  await checkPage(BASE_URL + '/admin/testing', 'Admin Testing Page');

  console.log('\n\n✅ Analysis Complete\n');
}

runChecks().catch(console.error);
