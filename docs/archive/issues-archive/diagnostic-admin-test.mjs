import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

const BASE_URL = 'http://localhost:3000';
const ADMIN_EMAIL = 'vadikcaraseli@gmail.com';
const ADMIN_PASSWORD = 'NewPassword123!';

async function diagnosticTest() {
  console.log('Starting diagnostic admin test...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 100
  });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  const results = [];

  page.on('response', async response => {
    const url = response.url();
    if (url.includes('/api/admin') || url.includes('/api/auth')) {
      console.log(`API Call: ${response.request().method()} ${url} - Status: ${response.status()}`);
      if (response.status() >= 400) {
        try {
          const body = await response.text();
          console.log(`  Error body: ${body.substring(0, 200)}`);
        } catch (e) {}
      }
    }
  });

  try {
    console.log('Step 1: Going to login page...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    const loginScreenshot = '/Users/vladislavcaraseli/Documents/MoldovaDirect.worktrees/products-improvments/test-screenshots/01-login-page.png';
    await page.screenshot({ path: loginScreenshot, fullPage: true });
    console.log(`Login page screenshot: ${loginScreenshot}`);
    
    console.log('\nStep 2: Finding login form elements...');
    const emailInput = await page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = await page.locator('input[type="password"], input[name="password"]').first();
    const submitButton = await page.locator('button[type="submit"]').first();
    
    console.log('Email input exists:', await emailInput.count() > 0);
    console.log('Password input exists:', await passwordInput.count() > 0);
    console.log('Submit button exists:', await submitButton.count() > 0);
    
    console.log('\nStep 3: Filling login form...');
    await emailInput.fill(ADMIN_EMAIL);
    await passwordInput.fill(ADMIN_PASSWORD);
    
    const filledScreenshot = '/Users/vladislavcaraseli/Documents/MoldovaDirect.worktrees/products-improvments/test-screenshots/02-login-filled.png';
    await page.screenshot({ path: filledScreenshot, fullPage: true });
    console.log(`Form filled screenshot: ${filledScreenshot}`);
    
    console.log('\nStep 4: Submitting login...');
    await submitButton.click();
    await page.waitForTimeout(5000);
    
    const currentUrl = page.url();
    console.log(`Current URL after login: ${currentUrl}`);
    
    const afterLoginScreenshot = '/Users/vladislavcaraseli/Documents/MoldovaDirect.worktrees/products-improvments/test-screenshots/03-after-login.png';
    await page.screenshot({ path: afterLoginScreenshot, fullPage: true });
    console.log(`After login screenshot: ${afterLoginScreenshot}`);
    
    const pageContent = await page.content();
    writeFileSync('/Users/vladislavcaraseli/Documents/MoldovaDirect.worktrees/products-improvments/test-screenshots/03-after-login.html', pageContent);
    
    if (pageContent.includes('error') || pageContent.includes('Error')) {
      console.log('WARNING: Page content contains error text');
      const errors = pageContent.match(/error[^<]*/gi);
      if (errors) console.log('Errors found:', errors.slice(0, 5));
    }
    
    console.log('\nStep 5: Checking authentication cookies...');
    const cookies = await context.cookies();
    console.log('Cookies:', cookies.map(c => `${c.name}=${c.value.substring(0, 20)}...`).join(', '));
    
    console.log('\nStep 6: Navigating to admin dashboard...');
    await page.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);
    
    const dashboardUrl = page.url();
    console.log(`Dashboard URL: ${dashboardUrl}`);
    
    const dashboardScreenshot = '/Users/vladislavcaraseli/Documents/MoldovaDirect.worktrees/products-improvments/test-screenshots/04-dashboard.png';
    await page.screenshot({ path: dashboardScreenshot, fullPage: true });
    console.log(`Dashboard screenshot: ${dashboardScreenshot}`);
    
    const dashboardContent = await page.content();
    writeFileSync('/Users/vladislavcaraseli/Documents/MoldovaDirect.worktrees/products-improvments/test-screenshots/04-dashboard.html', dashboardContent);
    
    console.log('\nChecking dashboard content:');
    console.log('  Contains "Dashboard":', dashboardContent.includes('Dashboard'));
    console.log('  Contains "Users":', dashboardContent.includes('Users'));
    console.log('  Contains "Orders":', dashboardContent.includes('Orders'));
    console.log('  Contains "Revenue":', dashboardContent.includes('Revenue'));
    console.log('  Contains "401":', dashboardContent.includes('401'));
    console.log('  Contains "500":', dashboardContent.includes('500'));
    console.log('  Contains "Unauthorized":', dashboardContent.includes('Unauthorized'));
    
    console.log('\nStep 7: Testing all admin pages...');
    const pages = [
      { name: 'Users', url: '/admin/users' },
      { name: 'Products', url: '/admin/products' },
      { name: 'Orders', url: '/admin/orders' },
      { name: 'Analytics', url: '/admin/analytics' }
    ];
    
    for (const pageConfig of pages) {
      console.log(`\nTesting ${pageConfig.name} page...`);
      await page.goto(`${BASE_URL}${pageConfig.url}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(3000);
      
      const pageUrl = page.url();
      console.log(`  URL: ${pageUrl}`);
      console.log(`  Redirected to login?: ${pageUrl.includes('/login')}`);
      
      const screenshotPath = `/Users/vladislavcaraseli/Documents/MoldovaDirect.worktrees/products-improvments/test-screenshots/05-${pageConfig.name.toLowerCase()}.png`;
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`  Screenshot: ${screenshotPath}`);
      
      const content = await page.content();
      console.log(`  Contains page name: ${content.includes(pageConfig.name)}`);
      console.log(`  Contains 401: ${content.includes('401')}`);
      console.log(`  Contains 500: ${content.includes('500')}`);
    }

  } catch (error) {
    console.error('Diagnostic test error:', error);
  } finally {
    console.log('\nTest complete. Check screenshots in test-screenshots/ directory');
    await browser.close();
  }
}

diagnosticTest().catch(console.error);
