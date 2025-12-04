import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3000';
const SCREENSHOT_DIR = '/Users/vladislavcaraseli/Documents/MoldovaDirect.worktrees/products-improvments/test-screenshots';

const ADMIN_PAGES = [
  { name: 'Dashboard', url: '/admin', slug: 'dashboard' },
  { name: 'Users', url: '/admin/users', slug: 'users' },
  { name: 'Products', url: '/admin/products', slug: 'products' },
  { name: 'Orders', url: '/admin/orders', slug: 'orders' },
  { name: 'Analytics', url: '/admin/analytics', slug: 'analytics' }
];

async function runTest() {
  console.log('\n==========================================');
  console.log('   ADMIN PAGES VERIFICATION TEST');
  console.log('==========================================\n');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  const results = { passed: 0, failed: 0, pages: [] };

  try {
    console.log('Step 1: Logging in...');
    await page.goto(BASE_URL + '/auth/login', { waitUntil: 'load', timeout: 60000 });
    await page.waitForTimeout(3000);
    
    await page.fill('input[type="email"]', 'admin@moldovadirect.com');
    await page.fill('input[type="password"]', 'Admin123!@#');
    await page.waitForTimeout(1000);
    
    // Click the first submit button (the login button)
    await page.click('button[type="submit"]', { force: true });
    
    await page.waitForTimeout(5000);
    console.log('Login complete!\n');

    for (const adminPage of ADMIN_PAGES) {
      console.log('Testing: ' + adminPage.name + ' (' + adminPage.url + ')');
      
      try {
        const response = await page.goto(BASE_URL + adminPage.url, { 
          waitUntil: 'load',
          timeout: 60000 
        });
        
        await page.waitForTimeout(3000);
        
        const status = response.status();
        const success = status === 200;
        
        console.log('  HTTP Status: ' + status + ' - ' + (success ? 'SUCCESS' : 'FAILURE'));
        
        await page.screenshot({ 
          path: SCREENSHOT_DIR + '/success-admin-' + adminPage.slug + '.png',
          fullPage: true 
        });
        
        results.pages.push({ name: adminPage.name, url: adminPage.url, status, success });
        
        if (success) {
          results.passed++;
        } else {
          results.failed++;
        }
        
      } catch (error) {
        console.log('  ERROR: ' + error.message);
        results.pages.push({ name: adminPage.name, url: adminPage.url, status: 'ERROR', success: false });
        results.failed++;
      }
      
      console.log('');
    }

  } catch (error) {
    console.error('Test failed:', error.message);
  } finally {
    await browser.close();
  }

  console.log('\n==========================================');
  console.log('   TEST SUMMARY');
  console.log('==========================================');
  console.log('Total: ' + (results.passed + results.failed));
  console.log('Passed: ' + results.passed);
  console.log('Failed: ' + results.failed);
  console.log('Success Rate: ' + results.passed + '/' + (results.passed + results.failed));
  
  console.log('\n==========================================');
  console.log('   RESULTS BY PAGE');
  console.log('==========================================');
  
  results.pages.forEach((p, idx) => {
    const icon = p.success ? '[PASS]' : '[FAIL]';
    console.log((idx + 1) + '. ' + icon + ' ' + p.name + ' - HTTP ' + p.status);
  });
  
  console.log('\n==========================================');
  console.log('   FINAL VERDICT');
  console.log('==========================================');
  if (results.passed === 5) {
    console.log('\n   ALL TESTS PASSED! FIX IS COMPLETE!\n');
  } else if (results.passed > 0) {
    console.log('\n   PARTIAL SUCCESS - Some issues remain\n');
  } else {
    console.log('\n   ALL TESTS FAILED - Critical issues detected\n');
  }
  console.log('==========================================\n');
}

runTest().catch(console.error);
