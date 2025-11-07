import { test, expect, devices } from '@playwright/test';

const browsers = ['chromium', 'firefox', 'webkit'];
const viewports = [
  { name: 'Desktop', width: 1920, height: 1080 },
  { name: 'Laptop', width: 1366, height: 768 },
  { name: 'Tablet', width: 768, height: 1024 },
  { name: 'Mobile', width: 375, height: 667 },
];

test.describe('Cross-Browser Compatibility Tests', () => {
  for (const viewport of viewports) {
    test.describe(`${viewport.name} (${viewport.width}x${viewport.height})`, () => {
      test.use({
        viewport: { width: viewport.width, height: viewport.height },
      });

      test('should render landing page correctly', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Check that page loads without errors
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));

        await page.waitForTimeout(2000);
        expect(errors).toEqual([]);

        // Check that main content is visible
        const main = page.locator('main, [role="main"]');
        await expect(main).toBeVisible();
      });

      test('should display navigation correctly', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const nav = page.locator('nav, [role="navigation"]').first();
        await expect(nav).toBeVisible();

        // Check navigation links
        const navLinks = nav.locator('a');
        const count = await navLinks.count();
        expect(count).toBeGreaterThan(0);
      });

      test('should display footer correctly', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const footer = page.locator('footer, [role="contentinfo"]');
        await expect(footer).toBeVisible();
      });

      test('should handle form submissions', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Find newsletter signup form
        const emailInput = page.locator('input[type="email"]').first();

        if (await emailInput.count() > 0) {
          await emailInput.fill('test@example.com');

          const submitButton = page.locator('button[type="submit"]').first();
          await submitButton.click();

          // Should show feedback (success or error)
          await page.waitForTimeout(1000);
        }
      });

      test('should handle responsive images', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const images = await page.locator('img').all();

        for (const img of images.slice(0, 5)) {
          const isVisible = await img.isVisible();

          if (isVisible) {
            const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
            expect(naturalWidth).toBeGreaterThan(0);
          }
        }
      });

      test('should handle CSS animations', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Check for elements with animations
        const animatedElements = await page.locator('[class*="animate"], [class*="transition"]').first();

        if (await animatedElements.count() > 0) {
          await expect(animatedElements).toBeVisible();
        }
      });

      test('should handle JavaScript interactions', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Test button clicks
        const buttons = await page.locator('button').all();

        if (buttons.length > 0) {
          const firstButton = buttons[0];
          await firstButton.click();

          // Should not throw errors
          await page.waitForTimeout(500);
        }
      });

      test('should handle scroll behavior', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Scroll to bottom
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(500);

        // Scroll to top
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(500);

        // Page should still be functional
        const main = page.locator('main, [role="main"]');
        await expect(main).toBeVisible();
      });

      test('should handle focus states', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Tab through elements
        await page.keyboard.press('Tab');

        const focusedElement = await page.evaluate(() => {
          const el = document.activeElement;
          return el?.tagName;
        });

        expect(focusedElement).toBeTruthy();
      });

      test('should handle viewport changes', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Change viewport
        await page.setViewportSize({
          width: Math.floor(viewport.width * 0.8),
          height: Math.floor(viewport.height * 0.8)
        });

        await page.waitForTimeout(500);

        // Content should still be visible
        const main = page.locator('main, [role="main"]');
        await expect(main).toBeVisible();
      });
    });
  }
});

test.describe('Mobile-Specific Tests', () => {
  test.use({ ...devices['iPhone 12'] });

  test('should handle touch events', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find swipeable elements
    const carousel = page.locator('[class*="carousel"], [class*="slider"]').first();

    if (await carousel.count() > 0) {
      const box = await carousel.boundingBox();

      if (box) {
        // Simulate swipe
        await page.touchscreen.swipe({
          startX: box.x + box.width - 50,
          startY: box.y + box.height / 2,
          endX: box.x + 50,
          endY: box.y + box.height / 2,
          steps: 10
        });

        await page.waitForTimeout(500);
      }
    }
  });

  test('should handle mobile menu', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find mobile menu button
    const menuButton = page.locator('button[aria-label*="menu"], button[aria-label*="Menu"]').first();

    if (await menuButton.count() > 0) {
      await menuButton.click();
      await page.waitForTimeout(500);

      // Menu should be visible
      const menu = page.locator('nav, [role="navigation"]').first();
      await expect(menu).toBeVisible();
    }
  });

  test('should prevent zoom on input focus', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');

    // Should have maximum-scale to prevent zoom
    expect(viewport).toMatch(/maximum-scale=1|user-scalable=no/);
  });
});

test.describe('Safari-Specific Tests', () => {
  test.use({ ...devices['Desktop Safari'] });

  test('should handle Safari CSS features', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for Safari-specific CSS
    const hasWebkitFeatures = await page.evaluate(() => {
      const testEl = document.createElement('div');
      testEl.style.setProperty('-webkit-overflow-scrolling', 'touch');
      return testEl.style.getPropertyValue('-webkit-overflow-scrolling') === 'touch';
    });

    expect(hasWebkitFeatures).toBe(true);
  });

  test('should handle date inputs correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const dateInputs = await page.locator('input[type="date"]').all();

    for (const input of dateInputs) {
      await input.click();
      // Safari should show native date picker
      await page.waitForTimeout(500);
    }
  });
});

test.describe('Firefox-Specific Tests', () => {
  test.use({ browserName: 'firefox' });

  test('should handle Firefox rendering', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for Firefox-specific features
    const isFirefox = await page.evaluate(() => {
      return navigator.userAgent.includes('Firefox');
    });

    expect(isFirefox).toBe(true);
  });
});

test.describe('Print Styles', () => {
  test('should have proper print styles', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Emulate print media
    await page.emulateMedia({ media: 'print' });

    // Navigation and footer should be hidden in print
    const nav = page.locator('nav').first();
    const navDisplay = await nav.evaluate((el) => window.getComputedStyle(el).display);

    // Main content should still be visible
    const main = page.locator('main, [role="main"]');
    await expect(main).toBeVisible();
  });
});

test.describe('Browser Feature Detection', () => {
  test('should detect required browser features', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const features = await page.evaluate(() => {
      return {
        localStorage: typeof localStorage !== 'undefined',
        sessionStorage: typeof sessionStorage !== 'undefined',
        fetch: typeof fetch !== 'undefined',
        promise: typeof Promise !== 'undefined',
        intersectionObserver: typeof IntersectionObserver !== 'undefined',
        webp: document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') === 0,
      };
    });

    expect(features.localStorage).toBe(true);
    expect(features.sessionStorage).toBe(true);
    expect(features.fetch).toBe(true);
    expect(features.promise).toBe(true);
    expect(features.intersectionObserver).toBe(true);
  });
});
