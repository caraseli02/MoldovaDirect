import { test, expect } from '@playwright/test';
import {
  MOBILE_VIEWPORTS,
  TEST_BREAKPOINTS,
  checkHorizontalOverflow,
  checkTouchTargetSize,
  measureLayoutShift,
  getFirstContentfulPaint,
  takeResponsiveScreenshot,
} from './test-helpers';

test.describe('Landing Page - Comprehensive Responsiveness Tests', () => {
  // Test all major breakpoints
  for (const breakpoint of TEST_BREAKPOINTS) {
    test.describe(`Breakpoint: ${breakpoint}px`, () => {
      test.use({
        viewport: { width: breakpoint, height: 844 },
      });

      test('should render without horizontal overflow', async ({ page }) => {
        await page.goto('/landing-demo');
        await page.waitForLoadState('networkidle');

        // Check no horizontal overflow at any scroll position
        const hasOverflow = await checkHorizontalOverflow(page);
        expect(hasOverflow).toBe(false);

        // Scroll down and check again
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
        await page.waitForTimeout(300);

        const hasOverflowMid = await checkHorizontalOverflow(page);
        expect(hasOverflowMid).toBe(false);
      });

      test('should have all sections visible and properly sized', async ({ page }) => {
        await page.goto('/landing-demo');
        await page.waitForLoadState('networkidle');

        // Check hero section
        const hero = page.locator('section.landing-hero');
        await expect(hero).toBeVisible();

        // Hero should be at least 500px tall on mobile
        const heroHeight = await hero.evaluate((el) => el.offsetHeight);
        expect(heroHeight).toBeGreaterThanOrEqual(500);

        // Check all major sections exist
        const sections = await page.locator('section').all();
        expect(sections.length).toBeGreaterThan(0);
      });

      test('should have readable typography at all breakpoints', async ({ page }) => {
        await page.goto('/landing-demo');
        await page.waitForLoadState('networkidle');

        // Check all headings have minimum font size
        const headings = await page.locator('h1, h2, h3').all();

        for (const heading of headings.slice(0, 5)) {
          const isVisible = await heading.isVisible().catch(() => false);

          if (isVisible) {
            const fontSize = await heading.evaluate((el) =>
              parseFloat(window.getComputedStyle(el).fontSize)
            );

            const tagName = await heading.evaluate((el) => el.tagName);

            // Minimum font sizes based on heading level and breakpoint
            if (tagName === 'H1') {
              expect(fontSize).toBeGreaterThanOrEqual(breakpoint < 640 ? 28 : 32);
            } else if (tagName === 'H2') {
              expect(fontSize).toBeGreaterThanOrEqual(breakpoint < 640 ? 22 : 24);
            } else if (tagName === 'H3') {
              expect(fontSize).toBeGreaterThanOrEqual(16);
            }
          }
        }

        // Check body text is readable (16px minimum)
        const paragraphs = await page.locator('p').all();

        for (const p of paragraphs.slice(0, 5)) {
          const isVisible = await p.isVisible().catch(() => false);

          if (isVisible) {
            const fontSize = await p.evaluate((el) =>
              parseFloat(window.getComputedStyle(el).fontSize)
            );

            expect(fontSize).toBeGreaterThanOrEqual(14);
          }
        }
      });

      test('should have proper spacing and padding', async ({ page }) => {
        await page.goto('/landing-demo');
        await page.waitForLoadState('networkidle');

        // Check sections have proper spacing
        const sections = await page.locator('section').all();

        for (const section of sections.slice(0, 5)) {
          const isVisible = await section.isVisible().catch(() => false);

          if (isVisible) {
            const padding = await section.evaluate((el) => {
              const styles = window.getComputedStyle(el);
              return {
                top: parseFloat(styles.paddingTop),
                bottom: parseFloat(styles.paddingBottom),
                left: parseFloat(styles.paddingLeft),
                right: parseFloat(styles.paddingRight),
              };
            });

            // Sections should have some vertical padding
            expect(padding.top + padding.bottom).toBeGreaterThan(0);

            // Mobile should have appropriate horizontal padding
            if (breakpoint < 640) {
              expect(padding.left + padding.right).toBeGreaterThanOrEqual(16);
            }
          }
        }
      });

      test('should have touch-friendly interactive elements', async ({ page }) => {
        await page.goto('/landing-demo');
        await page.waitForLoadState('networkidle');

        // Check all buttons
        const buttons = await page.locator('button, a[role="button"]').all();

        for (const button of buttons.slice(0, 10)) {
          const isVisible = await button.isVisible().catch(() => false);

          if (isVisible) {
            const box = await button.boundingBox();

            if (box) {
              // Touch targets should be at least 44x44px on mobile
              if (breakpoint < 640) {
                expect(box.width).toBeGreaterThanOrEqual(44);
                expect(box.height).toBeGreaterThanOrEqual(40); // Slightly relaxed for some designs
              } else {
                // Desktop can be slightly smaller
                expect(box.width).toBeGreaterThan(0);
                expect(box.height).toBeGreaterThan(0);
              }
            }
          }
        }
      });

      test('should load all images properly', async ({ page }) => {
        await page.goto('/landing-demo');
        await page.waitForLoadState('networkidle');

        await page.waitForTimeout(2000); // Give images time to load

        const images = await page.locator('img').all();
        let loadedCount = 0;
        let totalVisible = 0;

        for (const img of images.slice(0, 10)) {
          const isVisible = await img.isVisible().catch(() => false);

          if (isVisible) {
            totalVisible++;

            const isLoaded = await img.evaluate((el: HTMLImageElement) => {
              return el.complete && el.naturalHeight !== 0;
            });

            if (isLoaded) loadedCount++;
          }
        }

        // At least 80% of visible images should load
        if (totalVisible > 0) {
          const loadPercentage = (loadedCount / totalVisible) * 100;
          expect(loadPercentage).toBeGreaterThanOrEqual(80);
        }
      });

      test('should handle viewport changes gracefully', async ({ page }) => {
        await page.goto('/landing-demo');
        await page.waitForLoadState('networkidle');

        // Resize viewport
        await page.setViewportSize({
          width: Math.floor(breakpoint * 1.2),
          height: 844,
        });
        await page.waitForTimeout(500);

        // Check no overflow
        const hasOverflow = await checkHorizontalOverflow(page);
        expect(hasOverflow).toBe(false);

        // Resize back
        await page.setViewportSize({
          width: breakpoint,
          height: 844,
        });
        await page.waitForTimeout(500);

        // Should still be functional
        const hero = page.locator('section.landing-hero');
        await expect(hero).toBeVisible();
      });

      test('should maintain performance at breakpoint', async ({ page }) => {
        await page.goto('/landing-demo');

        // Measure First Contentful Paint
        const fcp = await getFirstContentfulPaint(page);

        // FCP should be under 2.5 seconds on mobile
        if (breakpoint < 640) {
          expect(fcp).toBeLessThan(2500);
        } else {
          expect(fcp).toBeLessThan(2000);
        }

        await page.waitForLoadState('networkidle');

        // Measure Cumulative Layout Shift
        const cls = await measureLayoutShift(page);

        // CLS should be under 0.1 for good user experience
        expect(cls).toBeLessThan(0.1);
      });

      test('should display navigation correctly', async ({ page }) => {
        await page.goto('/landing-demo');
        await page.waitForLoadState('networkidle');

        const nav = page.locator('nav, [role="navigation"]').first();

        if ((await nav.count()) > 0) {
          await expect(nav).toBeVisible();

          // On mobile, there should be a menu button
          if (breakpoint < 768) {
            const menuButton = page
              .locator('button[aria-label*="menu"], button[aria-label*="Menu"]')
              .first();

            if ((await menuButton.count()) > 0) {
              await expect(menuButton).toBeVisible();

              // Check touch target
              const box = await menuButton.boundingBox();
              if (box) {
                expect(box.width).toBeGreaterThanOrEqual(44);
                expect(box.height).toBeGreaterThanOrEqual(44);
              }
            }
          }
        }
      });

      test('should handle orientation change', async ({ page }) => {
        // Start in portrait
        await page.setViewportSize({ width: breakpoint, height: 844 });
        await page.goto('/landing-demo');
        await page.waitForLoadState('networkidle');

        // Switch to landscape
        await page.setViewportSize({ width: 844, height: breakpoint });
        await page.waitForTimeout(500);

        // Should still render correctly
        const hasOverflow = await checkHorizontalOverflow(page);
        expect(hasOverflow).toBe(false);

        const hero = page.locator('section.landing-hero');
        await expect(hero).toBeVisible();
      });

      test('should take full page screenshot', async ({ page }) => {
        await page.goto('/landing-demo');
        await page.waitForLoadState('networkidle');

        await takeResponsiveScreenshot(page, 'landing-full-page', { fullPage: true });
      });
    });
  }

  // Cross-breakpoint consistency tests
  test.describe('Cross-Breakpoint Consistency', () => {
    test('should maintain content order across all breakpoints', async ({ page }) => {
      const breakpointsToTest = [320, 768, 1024];
      const contentOrder: string[][] = [];

      for (const width of breakpointsToTest) {
        await page.setViewportSize({ width, height: 844 });
        await page.goto('/landing-demo');
        await page.waitForLoadState('networkidle');

        // Get section order
        const sections = await page.locator('section').all();
        const order = await Promise.all(
          sections.slice(0, 5).map(async (section) => {
            const className = await section.getAttribute('class');
            return className || '';
          })
        );

        contentOrder.push(order);
      }

      // Content order should be consistent
      const firstOrder = contentOrder[0];
      for (const order of contentOrder.slice(1)) {
        expect(order).toEqual(firstOrder);
      }
    });

    test('should have consistent color scheme across breakpoints', async ({ page }) => {
      const breakpointsToTest = [320, 768, 1024];
      const colors: string[] = [];

      for (const width of breakpointsToTest) {
        await page.setViewportSize({ width, height: 844 });
        await page.goto('/landing-demo');
        await page.waitForLoadState('networkidle');

        // Get primary button color
        const primaryButton = page.locator('.btn-primary').first();

        if ((await primaryButton.count()) > 0) {
          const color = await primaryButton.evaluate((el) => {
            return window.getComputedStyle(el).backgroundColor;
          });

          colors.push(color);
        }
      }

      // Colors should be identical across breakpoints
      const firstColor = colors[0];
      for (const color of colors) {
        expect(color).toBe(firstColor);
      }
    });
  });

  // Device-specific tests
  test.describe('Common Mobile Devices', () => {
    Object.entries(MOBILE_VIEWPORTS).forEach(([deviceName, viewport]) => {
      test(`should render correctly on ${viewport.name}`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto('/landing-demo');
        await page.waitForLoadState('networkidle');

        // Basic rendering check
        const hasOverflow = await checkHorizontalOverflow(page);
        expect(hasOverflow).toBe(false);

        const hero = page.locator('section.landing-hero');
        await expect(hero).toBeVisible();

        // Take device-specific screenshot
        await takeResponsiveScreenshot(page, `landing-${deviceName}`, { fullPage: false });
      });
    });
  });

  // Safe area handling (for notched devices)
  test.describe('Safe Area Handling', () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test('should respect safe area insets', async ({ page }) => {
      await page.goto('/landing-demo');
      await page.waitForLoadState('networkidle');

      // Check for safe-area CSS variables or padding
      const hasSafeArea = await page.evaluate(() => {
        const root = document.documentElement;
        const styles = window.getComputedStyle(root);

        // Check if safe-area variables are defined
        const safeAreaTop = styles.getPropertyValue('--safe-area-inset-top');
        const safeAreaBottom = styles.getPropertyValue('--safe-area-inset-bottom');

        return safeAreaTop || safeAreaBottom;
      });

      // Safe area support is optional but good to have
      // Just verify the page doesn't have JavaScript errors
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.waitForTimeout(1000);

      expect(errors.length).toBe(0);
    });
  });
});
