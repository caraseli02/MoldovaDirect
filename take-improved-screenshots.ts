import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';
import { join } from 'path';

const ADMIN_EMAIL = 'admin@moldovadirect.com';
const ADMIN_PASSWORD = 'Admin123!@#';
const BASE_URL = 'http://localhost:3001';
const SCREENSHOTS_DIR = './visual-review-results/screenshots-improved';

async function takeImprovedScreenshots() {
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

    // Focus on improved pages
    const improvedPages = [
      { name: 'dashboard', path: '/admin' },
      { name: 'analytics-overview', path: '/admin/analytics' },
      { name: 'analytics-users', path: '/admin/analytics', action: async () => {
        await page.click('button:has-text("Users")');
        await page.waitForTimeout(1000);
      }},
      { name: 'analytics-products', path: '/admin/analytics', action: async () => {
        await page.click('button:has-text("Products")');
        await page.waitForTimeout(1000);
      }}
    ];

    for (const { name, path, action } of improvedPages) {
      try {
        console.log(`\n📸 Taking screenshot: ${name}...`);
        await page.goto(`${BASE_URL}${path}`, { waitUntil: 'networkidle', timeout: 10000 });
        await page.waitForTimeout(1000);

        if (action) {
          await action();
        }

        const screenshotPath = join(SCREENSHOTS_DIR, `${name}-improved.png`);
        await page.screenshot({
          path: screenshotPath,
          fullPage: true
        });

        console.log(`✅ Screenshot saved: ${screenshotPath}`);
      } catch (error) {
        console.error(`❌ Failed to capture ${name}:`, error.message);
      }
    }

    console.log('\n✅ All improved screenshots completed!');
  } catch (error) {
    console.error('❌ Error during screenshot process:', error);
  } finally {
    await browser.close();
  }
}

takeImprovedScreenshots();
