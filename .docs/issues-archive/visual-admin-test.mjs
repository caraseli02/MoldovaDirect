import { chromium } from 'playwright';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';

const BASE_URL = 'http://localhost:3000';
const SCREENSHOTS_DIR = './test-results/visual-admin-screenshots';

// Admin test credentials
const ADMIN_EMAIL = 'admin@moldovadirect.com';
const ADMIN_PASSWORD = 'Admin123!@#';

async function captureAdminPages() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: { dir: join(SCREENSHOTS_DIR, 'videos') }
  });
  const page = await context.newPage();

  // Create screenshots directory
  await mkdir(SCREENSHOTS_DIR, { recursive: true });

  const report = {
    timestamp: new Date().toISOString(),
    pages: [],
    errors: []
  };

  console.log('🚀 Starting visual admin testing...\n');

  try {
    // Step 1: Navigate to login
    console.log('📍 Step 1: Navigating to login page...');
    await page.goto(`${BASE_URL}/auth/login`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: join(SCREENSHOTS_DIR, '01-login-page.png'), fullPage: true });
    console.log('✅ Login page captured\n');

    // Step 2: Login as admin
    console.log('📍 Step 2: Logging in as admin...');
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);

    // Capture console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push({ text: msg.text(), location: msg.location() });
      }
    });

    // Capture network errors
    const networkErrors = [];
    page.on('response', response => {
      if (response.status() >= 400) {
        networkErrors.push({
          url: response.url(),
          status: response.status(),
          statusText: response.statusText()
        });
      }
    });

    // Click login and wait for navigation to complete
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 }),
      page.click('button[type="submit"]')
    ]);

    // Wait for session to be fully established
    await page.waitForTimeout(5000);

    // Reload page to ensure session is recognized by SSR
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Verify we're no longer on login page
    const currentUrl = page.url();
    console.log(`   Current URL after login: ${currentUrl}`);

    // Verify session is established by checking localStorage
    const storageDebug = await page.evaluate(() => {
      const keys = Object.keys(localStorage);
      const authKeys = keys.filter(k => k.includes('sb-') || k.includes('supabase') || k.includes('auth'));
      return {
        allKeys: keys,
        authKeys: authKeys,
        hasSession: authKeys.length > 0
      };
    });

    console.log(`   Session established: ${storageDebug.hasSession ? '✅ YES' : '❌ NO'}`);
    console.log(`   LocalStorage auth keys: ${storageDebug.authKeys.join(', ')}`);

    // Get all cookies to debug
    const cookies = await context.cookies();
    const authCookies = cookies.filter(c =>
      c.name.includes('sb-') || c.name.includes('auth') || c.name.includes('supabase')
    );
    console.log(`   Auth cookies found: ${authCookies.length}`);
    if (authCookies.length > 0) {
      authCookies.forEach(c => console.log(`     - ${c.name}: ${c.value.substring(0, 20)}...`));
    }

    await page.screenshot({ path: join(SCREENSHOTS_DIR, '02-after-login.png'), fullPage: true });
    console.log('✅ Login submitted\n');

    // Step 3: Admin Dashboard
    console.log('📍 Step 3: Testing Admin Dashboard...');
    await page.goto(`${BASE_URL}/admin`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Wait for API calls

    const dashboardConsoleErrors = [...consoleErrors];
    const dashboardNetworkErrors = [...networkErrors];
    consoleErrors.length = 0;
    networkErrors.length = 0;

    await page.screenshot({ path: join(SCREENSHOTS_DIR, '03-admin-dashboard.png'), fullPage: true });

    // Get page content for analysis
    const dashboardContent = await page.content();
    const hasAuthError = dashboardContent.includes('Auth session missing') ||
                        dashboardContent.includes('500') ||
                        dashboardNetworkErrors.some(e => e.status === 500);

    report.pages.push({
      name: 'Admin Dashboard',
      url: `${BASE_URL}/admin`,
      screenshot: '03-admin-dashboard.png',
      consoleErrors: dashboardConsoleErrors,
      networkErrors: dashboardNetworkErrors,
      hasAuthError,
      status: hasAuthError ? 'FAILED' : 'PASSED'
    });

    console.log(`${hasAuthError ? '❌' : '✅'} Dashboard - ${hasAuthError ? 'Has auth errors' : 'OK'}`);
    console.log(`   Console errors: ${dashboardConsoleErrors.length}`);
    console.log(`   Network errors: ${dashboardNetworkErrors.length}\n`);

    // Step 4: Admin Users
    console.log('📍 Step 4: Testing Admin Users page...');
    await page.goto(`${BASE_URL}/admin/users`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    const usersConsoleErrors = [...consoleErrors];
    const usersNetworkErrors = [...networkErrors];
    consoleErrors.length = 0;
    networkErrors.length = 0;

    await page.screenshot({ path: join(SCREENSHOTS_DIR, '04-admin-users.png'), fullPage: true });

    // Check if table has data
    const usersTableRows = await page.$$('table tbody tr');
    const userCount = usersTableRows.length;

    const usersContent = await page.content();
    const usersHasAuthError = usersContent.includes('Auth session missing') ||
                             usersNetworkErrors.some(e => e.status === 500);

    report.pages.push({
      name: 'Admin Users',
      url: `${BASE_URL}/admin/users`,
      screenshot: '04-admin-users.png',
      consoleErrors: usersConsoleErrors,
      networkErrors: usersNetworkErrors,
      hasAuthError: usersHasAuthError,
      dataCount: userCount,
      expectedCount: 67,
      status: (usersHasAuthError || userCount === 0) ? 'FAILED' : 'PASSED'
    });

    console.log(`${usersHasAuthError || userCount === 0 ? '❌' : '✅'} Users - Found ${userCount} users (expected 67)`);
    console.log(`   Console errors: ${usersConsoleErrors.length}`);
    console.log(`   Network errors: ${usersNetworkErrors.length}\n`);

    // Step 5: Admin Products
    console.log('📍 Step 5: Testing Admin Products page...');
    await page.goto(`${BASE_URL}/admin/products`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    const productsConsoleErrors = [...consoleErrors];
    const productsNetworkErrors = [...networkErrors];
    consoleErrors.length = 0;
    networkErrors.length = 0;

    await page.screenshot({ path: join(SCREENSHOTS_DIR, '05-admin-products.png'), fullPage: true });

    const productsTableRows = await page.$$('table tbody tr');
    const productCount = productsTableRows.length;

    const productsContent = await page.content();
    const productsHasAuthError = productsContent.includes('Auth session missing') ||
                                productsNetworkErrors.some(e => e.status === 500);

    report.pages.push({
      name: 'Admin Products',
      url: `${BASE_URL}/admin/products`,
      screenshot: '05-admin-products.png',
      consoleErrors: productsConsoleErrors,
      networkErrors: productsNetworkErrors,
      hasAuthError: productsHasAuthError,
      dataCount: productCount,
      expectedCount: 112,
      status: (productsHasAuthError || productCount === 0) ? 'FAILED' : 'PASSED'
    });

    console.log(`${productsHasAuthError || productCount === 0 ? '❌' : '✅'} Products - Found ${productCount} products (expected 112)`);
    console.log(`   Console errors: ${productsConsoleErrors.length}`);
    console.log(`   Network errors: ${productsNetworkErrors.length}\n`);

    // Step 6: Admin Orders
    console.log('📍 Step 6: Testing Admin Orders page...');
    await page.goto(`${BASE_URL}/admin/orders`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    const ordersConsoleErrors = [...consoleErrors];
    const ordersNetworkErrors = [...networkErrors];
    consoleErrors.length = 0;
    networkErrors.length = 0;

    await page.screenshot({ path: join(SCREENSHOTS_DIR, '06-admin-orders.png'), fullPage: true });

    const ordersTableRows = await page.$$('table tbody tr');
    const orderCount = ordersTableRows.length;

    const ordersContent = await page.content();
    const ordersHasAuthError = ordersContent.includes('Auth session missing') ||
                              ordersNetworkErrors.some(e => e.status === 500);

    report.pages.push({
      name: 'Admin Orders',
      url: `${BASE_URL}/admin/orders`,
      screenshot: '06-admin-orders.png',
      consoleErrors: ordersConsoleErrors,
      networkErrors: ordersNetworkErrors,
      hasAuthError: ordersHasAuthError,
      dataCount: orderCount,
      expectedCount: 360,
      status: (ordersHasAuthError || orderCount === 0) ? 'FAILED' : 'PASSED'
    });

    console.log(`${ordersHasAuthError || orderCount === 0 ? '❌' : '✅'} Orders - Found ${orderCount} orders (expected 360)`);
    console.log(`   Console errors: ${ordersConsoleErrors.length}`);
    console.log(`   Network errors: ${ordersNetworkErrors.length}\n`);

    // Step 7: Admin Testing Page (Baseline)
    console.log('📍 Step 7: Testing Admin Testing page (baseline)...');
    await page.goto(`${BASE_URL}/admin/testing`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const testingConsoleErrors = [...consoleErrors];
    const testingNetworkErrors = [...networkErrors];

    await page.screenshot({ path: join(SCREENSHOTS_DIR, '07-admin-testing.png'), fullPage: true });

    // Extract stats from testing page
    const testingPageText = await page.textContent('body');
    const usersMatch = testingPageText.match(/(\d+)\s+Total Users/);
    const productsMatch = testingPageText.match(/(\d+)\s+Products/);
    const ordersMatch = testingPageText.match(/(\d+)\s+Total Orders/);

    report.pages.push({
      name: 'Admin Testing (Baseline)',
      url: `${BASE_URL}/admin/testing`,
      screenshot: '07-admin-testing.png',
      consoleErrors: testingConsoleErrors,
      networkErrors: testingNetworkErrors,
      stats: {
        users: usersMatch ? parseInt(usersMatch[1]) : 0,
        products: productsMatch ? parseInt(productsMatch[1]) : 0,
        orders: ordersMatch ? parseInt(ordersMatch[1]) : 0
      },
      status: 'PASSED'
    });

    console.log('✅ Testing page - Baseline captured');
    console.log(`   Users: ${usersMatch ? usersMatch[1] : 'N/A'}`);
    console.log(`   Products: ${productsMatch ? productsMatch[1] : 'N/A'}`);
    console.log(`   Orders: ${ordersMatch ? ordersMatch[1] : 'N/A'}\n`);

    // Generate summary
    const passedCount = report.pages.filter(p => p.status === 'PASSED').length;
    const failedCount = report.pages.filter(p => p.status === 'FAILED').length;

    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Pages Tested: ${report.pages.length}`);
    console.log(`✅ Passed: ${passedCount}`);
    console.log(`❌ Failed: ${failedCount}`);
    console.log('='.repeat(60) + '\n');

    // Save detailed report
    await writeFile(
      join(SCREENSHOTS_DIR, 'test-report.json'),
      JSON.stringify(report, null, 2)
    );

    // Generate human-readable report
    let markdownReport = `# Admin Visual Test Report\n\n`;
    markdownReport += `**Generated:** ${report.timestamp}\n\n`;
    markdownReport += `## Summary\n\n`;
    markdownReport += `- Total Pages: ${report.pages.length}\n`;
    markdownReport += `- ✅ Passed: ${passedCount}\n`;
    markdownReport += `- ❌ Failed: ${failedCount}\n\n`;
    markdownReport += `## Detailed Results\n\n`;

    for (const page of report.pages) {
      markdownReport += `### ${page.status === 'PASSED' ? '✅' : '❌'} ${page.name}\n\n`;
      markdownReport += `- **URL:** ${page.url}\n`;
      markdownReport += `- **Screenshot:** ${page.screenshot}\n`;

      if (page.dataCount !== undefined) {
        markdownReport += `- **Data Found:** ${page.dataCount} (expected: ${page.expectedCount})\n`;
      }

      if (page.stats) {
        markdownReport += `- **Stats:** ${page.stats.users} users, ${page.stats.products} products, ${page.stats.orders} orders\n`;
      }

      markdownReport += `- **Console Errors:** ${page.consoleErrors.length}\n`;
      markdownReport += `- **Network Errors:** ${page.networkErrors.length}\n`;

      if (page.hasAuthError) {
        markdownReport += `- **⚠️ AUTH ERROR DETECTED**\n`;
      }

      if (page.networkErrors.length > 0) {
        markdownReport += `\n**Network Errors:**\n`;
        page.networkErrors.forEach(err => {
          markdownReport += `- ${err.status} ${err.statusText}: ${err.url}\n`;
        });
      }

      markdownReport += `\n`;
    }

    await writeFile(
      join(SCREENSHOTS_DIR, 'TEST-REPORT.md'),
      markdownReport
    );

    console.log(`\n✅ Test complete! Results saved to: ${SCREENSHOTS_DIR}\n`);
    console.log(`   - test-report.json (detailed machine-readable)`);
    console.log(`   - TEST-REPORT.md (human-readable)`);
    console.log(`   - 7 screenshots captured\n`);

  } catch (error) {
    console.error('❌ Test failed:', error);
    report.errors.push({ message: error.message, stack: error.stack });
  } finally {
    await browser.close();
  }

  return report;
}

// Run the tests
captureAdminPages();
