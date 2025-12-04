import { chromium } from '@playwright/test';
(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();
  const results = { modalOpen: false, fieldsVisible: false, formSubmit: false, addressFound: false, editWorks: false };
  try {
    await page.goto('http://localhost:3000/auth/login');
    await page.waitForLoadState('networkidle');
    await page.locator('input[data-testid="email-input"]').fill('customer@moldovadirect.com');
    await page.locator('input[type="password"]').fill('Customer123\!@#');
    await page.locator('button[data-testid="login-button"]').click();
    await page.waitForTimeout(3000);
    await page.goto('http://localhost:3000/account/profile');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: '/tmp/s1-profile.png', fullPage: true });
    console.log('[1] Profile loaded');
    const addBtn = page.locator('button').filter({ hasText: 'Añadir' }).first();
    await addBtn.click();
    await page.waitForTimeout(2000);
    const dialog = page.locator('[role="dialog"]').first();
    results.modalOpen = await dialog.isVisible();
    await page.screenshot({ path: '/tmp/s2-modal.png', fullPage: true });
    console.log('[2] Modal opened:', results.modalOpen);
    const fields = ['first_name', 'last_name', 'street', 'city', 'postal_code', 'country'];
    results.fieldsVisible = true;
    for (const f of fields) {
      const vis = await page.locator(`input[name="${f}"]`).isVisible();
      if (\!vis) results.fieldsVisible = false;
    }
    console.log('[3] Fields visible:', results.fieldsVisible);
    await page.locator('input[value="shipping"]').click();
    await page.locator('input[name="first_name"]').fill('Juan');
    await page.locator('input[name="last_name"]').fill('García');
    await page.locator('input[name="street"]').fill('Calle Gran Vía 123');
    await page.locator('input[name="city"]').fill('Madrid');
    await page.locator('input[name="postal_code"]').fill('28013');
    await page.locator('input[name="country"]').fill('ES');
    await page.locator('input[name="phone"]').fill('+34612345678');
    await page.locator('input[name="is_default"]').click();
    await page.screenshot({ path: '/tmp/s3-filled.png', fullPage: true });
    console.log('[4] Form filled');
    await page.locator('button').filter({ hasText: 'Guardar' }).first().click();
    await page.waitForTimeout(3000);
    results.formSubmit = true;
    await page.screenshot({ path: '/tmp/s4-submitted.png', fullPage: true });
    console.log('[5] Form submitted');
    results.addressFound = await page.locator('text=Juan García').first().isVisible().catch(() => false);
    await page.screenshot({ path: '/tmp/s5-list.png', fullPage: true });
    console.log('[6] Address in list:', results.addressFound);
    if (results.addressFound) {
      const editBtn = page.locator('button').filter({ hasText: 'Editar' }).or(page.locator('button[aria-label*="Edit"]')).first();
      if (await editBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await editBtn.click();
        await page.waitForTimeout(1500);
        await page.screenshot({ path: '/tmp/s6-edit.png', fullPage: true });
        const fname = page.locator('input[name="first_name"]');
        await fname.clear();
        await fname.fill('Pedro');
        await page.screenshot({ path: '/tmp/s7-edited.png', fullPage: true });
        await page.locator('button').filter({ hasText: 'Guardar' }).first().click();
        await page.waitForTimeout(3000);
        results.editWorks = await page.locator('text=Pedro García').first().isVisible().catch(() => false);
        await page.screenshot({ path: '/tmp/s8-updated.png', fullPage: true });
        console.log('[7] Edit works:', results.editWorks);
      }
    }
    console.log('\nRESULTS:', JSON.stringify(results));
    await page.waitForTimeout(5000);
  } finally {
    await context.close();
    await browser.close();
  }
})();
