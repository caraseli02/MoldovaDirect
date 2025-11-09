import { test, expect } from '@playwright/test';
import {
  MOBILE_VIEWPORTS,
  TEST_BREAKPOINTS,
  checkTouchTargetSize,
  checkHorizontalOverflow,
  checkColorContrast,
  isInViewport,
  waitForImages,
  checkFontSize,
  takeResponsiveScreenshot,
} from './test-helpers';

test.describe('Landing Hero - Mobile Responsiveness', () => {
  // Test each breakpoint
  for (const width of TEST_BREAKPOINTS) {
    test.describe(`Viewport: ${width}px`, () => {
      test.use({
        viewport: { width, height: 844 },
      });

      test('should render hero section without horizontal overflow', async ({ page }) => {
        await page.goto('/landing-demo');
        await page.waitForLoadState('networkidle');

        // Check for horizontal overflow
        const hasOverflow = await checkHorizontalOverflow(page);
        expect(hasOverflow).toBe(false);
      });

      test('should display hero content correctly', async ({ page }) => {
        await page.goto('/landing-demo');
        await page.waitForLoadState('networkidle');

        // Check hero section exists and is visible
        const hero = page.locator('section.landing-hero');
        await expect(hero).toBeVisible();

        // Check headline
        const headline = hero.locator('h1');
        await expect(headline).toBeVisible();

        // Check subheadline
        const subheadline = hero.locator('p').first();
        await expect(subheadline).toBeVisible();

        // Check CTAs are visible
        const primaryCta = hero.locator('.btn-primary');
        await expect(primaryCta).toBeVisible();

        const secondaryCta = hero.locator('.btn-secondary');
        await expect(secondaryCta).toBeVisible();
      });

      test('should have appropriate font sizes for mobile', async ({ page }) => {
        await page.goto('/landing-demo');
        await page.waitForLoadState('networkidle');

        const hero = page.locator('section.landing-hero');

        // Check headline font size (should be readable)
        const headlineFontSize = await hero.locator('h1').evaluate((el) => {
          return parseFloat(window.getComputedStyle(el).fontSize);
        });

        // On mobile, minimum headline size should be ~32px
        if (width < 640) {
          expect(headlineFontSize).toBeGreaterThanOrEqual(28);
        }

        // Check body text size
        const bodyTextReadable = await checkFontSize(hero.locator('p').first(), 'p', 16);
        expect(bodyTextReadable).toBe(true);
      });

      test('should have touch-friendly button sizes', async ({ page }) => {
        await page.goto('/landing-demo');
        await page.waitForLoadState('networkidle');

        // Check primary CTA touch target
        const primaryResults = await checkTouchTargetSize(page, '.btn-primary', 44);
        expect(primaryResults.every((r) => r.passes)).toBe(true);

        // Check secondary CTA touch target
        const secondaryResults = await checkTouchTargetSize(page, '.btn-secondary', 44);
        expect(secondaryResults.every((r) => r.passes)).toBe(true);
      });

      test('should display video on desktop, image on mobile', async ({ page }) => {
        await page.goto('/landing-demo');
        await page.waitForLoadState('networkidle');

        const hero = page.locator('section.landing-hero');

        if (width < 768) {
          // Mobile should show image
          const image = hero.locator('img');
          await expect(image).toBeVisible();

          // Video should not be visible
          const video = hero.locator('video');
          const videoCount = await video.count();
          if (videoCount > 0) {
            await expect(video).not.toBeVisible();
          }
        } else {
          // Desktop may show video or image
          const hasVideo = (await hero.locator('video').count()) > 0;
          const hasImage = (await hero.locator('img').count()) > 0;

          expect(hasVideo || hasImage).toBe(true);
        }
      });

      test('should load images efficiently', async ({ page }) => {
        await page.goto('/landing-demo');

        // Wait for images to load
        await waitForImages(page, 10000);

        const hero = page.locator('section.landing-hero');
        const images = hero.locator('img');

        if ((await images.count()) > 0) {
          const img = images.first();

          // Check image has loaded
          const isLoaded = await img.evaluate((el: HTMLImageElement) => {
            return el.complete && el.naturalHeight !== 0;
          });

          expect(isLoaded).toBe(true);

          // Check image uses appropriate format (webp preferred)
          const src = await img.getAttribute('src');
          if (src) {
            // Should use optimized formats or image service
            expect(src).toMatch(/\.(webp|jpg|jpeg|png)|images\.unsplash\.com/);
          }
        }
      });

      test('should maintain text contrast for readability', async ({ page }) => {
        await page.goto('/landing-demo');
        await page.waitForLoadState('networkidle');

        const hero = page.locator('section.landing-hero');

        // Check headline contrast
        const headlineContrast = await checkColorContrast(page, 'section.landing-hero h1');
        expect(headlineContrast.ratio).toBeGreaterThanOrEqual(4.5);

        // Check body text contrast
        const bodyContrast = await checkColorContrast(page, 'section.landing-hero p');
        expect(bodyContrast.ratio).toBeGreaterThanOrEqual(4.5);
      });

      test('should handle CTA button interactions', async ({ page }) => {
        await page.goto('/landing-demo');
        await page.waitForLoadState('networkidle');

        const hero = page.locator('section.landing-hero');

        // Test primary CTA click
        const primaryCta = hero.locator('.btn-primary');
        await expect(primaryCta).toBeEnabled();
        await primaryCta.click();

        // Should navigate or trigger action
        await page.waitForTimeout(500);

        // Go back to test page
        await page.goto('/landing-demo');
        await page.waitForLoadState('networkidle');

        // Test secondary CTA click (quiz button)
        const secondaryCta = hero.locator('.btn-secondary');
        await expect(secondaryCta).toBeEnabled();
        await secondaryCta.click();

        // Should open quiz modal
        await page.waitForTimeout(500);

        // Modal should appear
        const modal = page.locator('[role="dialog"], .modal, [class*="quiz"]');
        const modalCount = await modal.count();
        expect(modalCount).toBeGreaterThan(0);
      });

      test('should display trust badges properly', async ({ page }) => {
        await page.goto('/landing-demo');
        await page.waitForLoadState('networkidle');

        const hero = page.locator('section.landing-hero');
        const trustBadges = hero.locator('[class*="trust"]').locator('div').first();

        if ((await trustBadges.count()) > 0) {
          await expect(trustBadges).toBeVisible();

          // Trust badges should be readable
          const badges = await trustBadges.locator('div, span').all();
          for (const badge of badges.slice(0, 3)) {
            const isVisible = await badge.isVisible();
            if (isVisible) {
              const fontSize = await badge.evaluate((el) =>
                parseFloat(window.getComputedStyle(el).fontSize)
              );
              expect(fontSize).toBeGreaterThanOrEqual(12);
            }
          }
        }
      });

      test('should show scroll indicator on mobile', async ({ page }) => {
        await page.goto('/landing-demo');
        await page.waitForLoadState('networkidle');

        const scrollIndicator = page.locator('section.landing-hero').locator('button').last();

        if ((await scrollIndicator.count()) > 0) {
          await expect(scrollIndicator).toBeVisible();

          // Should be in viewport
          const inView = await isInViewport(page, 'section.landing-hero button:last-child');
          expect(inView).toBe(true);
        }
      });

      test('should handle scroll to content functionality', async ({ page }) => {
        await page.goto('/landing-demo');
        await page.waitForLoadState('networkidle');

        const scrollButton = page.locator('section.landing-hero').locator('button').last();

        if ((await scrollButton.count()) > 0) {
          const initialScrollY = await page.evaluate(() => window.scrollY);

          await scrollButton.click();
          await page.waitForTimeout(1000);

          const finalScrollY = await page.evaluate(() => window.scrollY);

          // Should have scrolled down
          expect(finalScrollY).toBeGreaterThan(initialScrollY);
        }
      });

      test('should respect reduced motion preferences', async ({ page }) => {
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.goto('/landing-demo');
        await page.waitForLoadState('networkidle');

        // Check that animations are disabled or minimal
        const hero = page.locator('section.landing-hero');
        const animatedElements = hero.locator('[class*="animate"]');

        if ((await animatedElements.count()) > 0) {
          const animationDuration = await animatedElements.first().evaluate((el) => {
            return window.getComputedStyle(el).animationDuration;
          });

          // Animation should be instant or very short
          expect(animationDuration).toMatch(/0s|0\.01ms/);
        }
      });

      test('should take visual regression screenshot', async ({ page }) => {
        await page.goto('/landing-demo');
        await page.waitForLoadState('networkidle');

        const hero = page.locator('section.landing-hero');
        await expect(hero).toBeVisible();

        // Take screenshot for visual regression
        await takeResponsiveScreenshot(page, 'landing-hero', { fullPage: false });
      });
    });
  }

  // Mobile-specific gesture tests
  test.describe('Mobile Touch Interactions', () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test('should handle tap on CTAs', async ({ page }) => {
      await page.goto('/landing-demo');
      await page.waitForLoadState('networkidle');

      const hero = page.locator('section.landing-hero');
      const primaryCta = hero.locator('.btn-primary');

      // Get button position
      const box = await primaryCta.boundingBox();
      expect(box).toBeTruthy();

      if (box) {
        // Tap button
        await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
        await page.waitForTimeout(500);

        // Should have navigated or triggered action
        // (specific assertion depends on expected behavior)
      }
    });

    test('should handle double tap without zoom', async ({ page }) => {
      await page.goto('/landing-demo');
      await page.waitForLoadState('networkidle');

      const hero = page.locator('section.landing-hero');
      const box = await hero.boundingBox();

      if (box) {
        const centerX = box.x + box.width / 2;
        const centerY = box.y + box.height / 2;

        // Double tap
        await page.touchscreen.tap(centerX, centerY);
        await page.waitForTimeout(100);
        await page.touchscreen.tap(centerX, centerY);
        await page.waitForTimeout(300);

        // Page should not have zoomed
        const zoomLevel = await page.evaluate(() => {
          return window.visualViewport ? window.visualViewport.scale : 1;
        });

        expect(zoomLevel).toBe(1);
      }
    });
  });
});
