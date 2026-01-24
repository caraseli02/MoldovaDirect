const { chromium } = require('playwright');

const TARGET_URL = 'http://localhost:3000/checkout';

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 50 });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  // Listen for console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('🔴 Console Error:', msg.text());
    }
  });

  console.log('🌐 Navigating to:', TARGET_URL);
  await page.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: 15000 });

  // Wait a bit for any animations
  await page.waitForTimeout(2000);

  // Take full page screenshot
  await page.screenshot({ path: '/tmp/checkout-full.png', fullPage: true });
  console.log('📸 Screenshot saved: /tmp/checkout-full.png');

  // Inspect all radio buttons/radio groups
  console.log('\n🔍 Inspecting Radio Button Components...');

  const radioGroups = await page.locator('[data-radix-view-name], [data-shadcn], [role="radiogroup"]').all();
  console.log(`Found ${radioGroups.length} potential radio group containers`);

  // Get all elements with role="radio" or radio inputs
  const radioElements = await page.locator('input[type="radio"], [role="radio"]').all();
  console.log(`Found ${radioElements.length} radio elements`);

  for (let i = 0; i < Math.min(radioElements.length, 10); i++) {
    const el = radioElements[i];
    try {
      const isVisible = await el.isVisible();
      const boundingBox = await el.boundingBox();
      const computedStyles = await el.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return {
          width: styles.width,
          height: styles.height,
          display: styles.display,
          fontSize: styles.fontSize,
          padding: styles.padding,
          margin: styles.margin
        };
      });
      console.log(`  Radio ${i + 1}: visible=${isVisible}, size=${boundingBox?.width}x${boundingBox?.height}, styles:`, computedStyles);
    } catch (e) {
      console.log(`  Radio ${i + 1}: Error inspecting - ${e.message}`);
    }
  }

  // Check for oversized elements (potential bug)
  console.log('\n🔍 Checking for oversized elements...');
  const allElements = await page.locator('*').all();
  const oversized = [];

  for (const el of allElements) {
    try {
      const box = await el.boundingBox();
      if (box && box.width > 500 && box.height > 200) {
        const tagName = await el.evaluate(e => e.tagName);
        const className = await el.evaluate(e => e.className);
        if (tagName !== 'BODY' && tagName !== 'HTML' && !className.includes('grid')) {
          oversized.push({ tag: tagName, class: className, width: box.width, height: box.height });
        }
      }
    } catch (e) {}
  }

  console.log(`Found ${oversized.length} potentially oversized elements:`);
  oversized.slice(0, 5).forEach(o => {
    console.log(`  ${o.tag} (class="${o.class.substring(0, 50)}..."): ${o.width}x${o.height}`);
  });

  // Get page title and URL
  console.log('\n📄 Page Info:');
  console.log('  Title:', await page.title());
  console.log('  URL:', page.url());

  // Test responsive viewports
  const viewports = [
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Mobile', width: 375, height: 667 }
  ];

  for (const viewport of viewports) {
    console.log(`\n📱 Testing ${viewport.name} (${viewport.width}x${viewport.height})...`);
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.waitForTimeout(500);
    await page.screenshot({ path: `/tmp/checkout-${viewport.name.toLowerCase()}.png`, fullPage: true });
    console.log(`  📸 Screenshot saved: /tmp/checkout-${viewport.name.toLowerCase()}.png`);
  }

  console.log('\n✅ Test complete. Check /tmp/ for screenshots.');
  await browser.close();
})();
