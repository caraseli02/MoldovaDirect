import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';
import { join } from 'path';

const ADMIN_EMAIL = 'admin@moldovadirect.com';
const ADMIN_PASSWORD = 'Admin123!@#';
const BASE_URL = 'http://localhost:3001';
const SCREENSHOTS_DIR = './visual-review-results/screenshots';

async function takeAdminScreenshots() {
  // Ensure screenshots directory exists
  await mkdir(SCREENSHOTS_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();

  try {
    console.log('🔐 Navigating to admin login...');
    await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'networkidle' });

    console.log('📝 Filling login form...');
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);

    console.log('🚀 Submitting login...');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/account', { timeout: 10000 });

    console.log('✅ Login successful! Now navigating to admin...');
    await page.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Define all admin pages to screenshot
    const adminPages = [
      { name: 'dashboard', path: '/admin', },
      { name: 'users', path: '/admin/users' },
      { name: 'products', path: '/admin/products' },
      { name: 'new-product', path: '/admin/products/new' },
      { name: 'orders', path: '/admin/orders' },
      { name: 'analytics', path: '/admin/analytics' },
      { name: 'inventory', path: '/admin/inventory' },
      { name: 'email-templates', path: '/admin/email-templates' },
      { name: 'email-logs', path: '/admin/email-logs' },
      { name: 'settings', path: '/admin/settings' },
    ];

    for (const { name, path } of adminPages) {
      try {
        console.log(`\n📸 Taking screenshot: ${name}...`);
        await page.goto(`${BASE_URL}${path}`, { waitUntil: 'networkidle', timeout: 10000 });

        // Wait a bit for any animations or lazy loading
        await page.waitForTimeout(1000);

        const screenshotPath = join(SCREENSHOTS_DIR, `admin-${name}-fullpage.png`);
        await page.screenshot({
          path: screenshotPath,
          fullPage: true
        });

        console.log(`✅ Screenshot saved: ${screenshotPath}`);
      } catch (error) {
        console.error(`❌ Failed to capture ${name}:`, error.message);
      }
    }

    console.log('\n✅ All screenshots completed!');
  } catch (error) {
    console.error('❌ Error during screenshot process:', error);
  } finally {
    await browser.close();
  }
}

takeAdminScreenshots();
