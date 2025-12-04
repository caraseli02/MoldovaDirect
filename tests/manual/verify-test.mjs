import { chromium } from '@playwright/test';
console.log('Starting address form verification...');
(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 400 });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();
  console.log('Browser launched');
  try {
    console.log('Logging in...');
    await page.goto('http://localhost:3000/auth/login');
    await page.waitForLoadState('networkidle');
    await page.locator('input[data-testid="email-input"]').fill('customer@moldovadirect.com');
    await page.locator('input[type="password"]').fill('Customer123\!@#');
    await page.locator('button[data-testid="login-button"]').click();
    await page.waitForTimeout(3000);
    console.log('Login complete');
    console.log('Navigating to profile...');
    await page.goto('http://localhost:3000/account/profile');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: '/tmp/01-profile.png', fullPage: true });
    console.log('Screenshot saved: /tmp/01-profile.png');
    console.log('Opening modal...');
    const addBtn = page.locator('button').filter({ hasText: 'Añadir' }).first();
    await addBtn.click();
    await page.waitForTimeout(2000);
    const dialog = page.locator('[role="dialog"]').first();
    const isVisible = await dialog.isVisible();
    console.log('Modal visible:', isVisible);
    await page.screenshot({ path: '/tmp/02-modal.png', fullPage: true });
    console.log('Screenshot saved: /tmp/02-modal.png');
    console.log('Test complete - check screenshots');
    await page.waitForTimeout(10000);
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await context.close();
    await browser.close();
    console.log('Browser closed');
  }
})();
