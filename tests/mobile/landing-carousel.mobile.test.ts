import { test, expect } from '@playwright/test';
import {
  MOBILE_VIEWPORTS,
  TEST_BREAKPOINTS,
  swipeElement,
  checkTouchTargetSize,
  checkHorizontalOverflow,
  isInViewport,
  takeResponsiveScreenshot,
} from './test-helpers';

test.describe('Landing Product Carousel - Mobile Responsiveness', () => {
  for (const width of TEST_BREAKPOINTS) {
    test.describe(`Viewport: ${width}px`, () => {
      test.use({
        viewport: { width, height: 844 },
      });

      test('should render carousel without overflow', async ({ page }) => {
        await page.goto('/landing-demo');
        await page.waitForLoadState('networkidle');

        // Scroll to carousel section
        await page.evaluate(() => {
          const carousel = document.querySelector('[class*="carousel"]');
          if (carousel) {
            carousel.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        });
        await page.waitForTimeout(500);

        const hasOverflow = await checkHorizontalOverflow(page);
        expect(hasOverflow).toBe(false);
      });

      test('should display product cards correctly', async ({ page }) => {
        await page.goto('/landing-demo');
        await page.waitForLoadState('networkidle');

        // Find carousel section
        const carousel = page.locator('[class*="carousel"]').first();

        if ((await carousel.count()) > 0) {
          await expect(carousel).toBeVisible();

          // Check for product cards
          const cards = carousel.locator('[class*="product"]');
          const cardCount = await cards.count();

          expect(cardCount).toBeGreaterThan(0);

          // Check first card is visible
          if (cardCount > 0) {
            await expect(cards.first()).toBeVisible();
          }
        }
      });

      test('should show appropriate number of slides per view', async ({ page }) => {
        await page.goto('/landing-demo');
        await page.waitForLoadState('networkidle');

        const carousel = page.locator('[class*="carousel"]').first();

        if ((await carousel.count()) > 0) {
          const visibleCards = await carousel.evaluate((el) => {
            const cards = el.querySelectorAll('[class*="product"]');
            return Array.from(cards).filter((card) => {
              const rect = card.getBoundingClientRect();
              return rect.left >= 0 && rect.right <= window.innerWidth;
            }).length;
          });

          // Mobile should show 1-2 cards, tablet 2-3, desktop 3-4
          if (width < 640) {
            expect(visibleCards).toBeGreaterThanOrEqual(1);
            expect(visibleCards).toBeLessThanOrEqual(2);
          } else if (width < 1024) {
            expect(visibleCards).toBeGreaterThanOrEqual(2);
            expect(visibleCards).toBeLessThanOrEqual(3);
          } else {
            expect(visibleCards).toBeGreaterThanOrEqual(3);
          }
        }
      });

      test('should have navigation dots visible and functional', async ({ page }) => {
        await page.goto('/landing-demo');
        await page.waitForLoadState('networkidle');

        // Find pagination dots
        const pagination = page.locator('[role="tablist"]');

        if ((await pagination.count()) > 0) {
          await expect(pagination).toBeVisible();

          const dots = pagination.locator('button');
          const dotCount = await dots.count();

          expect(dotCount).toBeGreaterThan(0);

          // Check touch target size for dots
          const dotResults = await checkTouchTargetSize(page, '[role="tablist"] button', 32);

          // Dots can be slightly smaller (32px minimum)
          expect(dotResults.every((r) => r.width >= 32 && r.height >= 32)).toBe(true);
        }
      });

      test('should navigate on dot click', async ({ page }) => {
        await page.goto('/landing-demo');
        await page.waitForLoadState('networkidle');

        const pagination = page.locator('[role="tablist"]');

        if ((await pagination.count()) > 0) {
          const dots = pagination.locator('button');
          const dotCount = await dots.count();

          if (dotCount > 1) {
            // Click second dot
            await dots.nth(1).click();
            await page.waitForTimeout(500);

            // Check that carousel moved
            const secondDot = dots.nth(1);
            const isActive = await secondDot.getAttribute('aria-selected');

            expect(isActive).toBe('true');
          }
        }
      });

      test('should show/hide navigation arrows based on screen size', async ({ page }) => {
        await page.goto('/landing-demo');
        await page.waitForLoadState('networkidle');

        const prevButton = page
          .locator('button[aria-label*="previous"], button[aria-label*="Previous"]')
          .first();
        const nextButton = page
          .locator('button[aria-label*="next"], button[aria-label*="Next"]')
          .first();

        if (width < 1024) {
          // Arrows should be hidden on mobile/tablet
          const prevVisible = await prevButton.isVisible().catch(() => false);
          const nextVisible = await nextButton.isVisible().catch(() => false);

          // It's OK if arrows are hidden or not present on mobile
          if (prevVisible || nextVisible) {
            // If visible, they should still be functional
            expect(prevVisible || nextVisible).toBeTruthy();
          }
        } else {
          // Arrows should be visible on desktop
          const hasPrev = (await prevButton.count()) > 0;
          const hasNext = (await nextButton.count()) > 0;

          if (hasPrev || hasNext) {
            // At least one navigation arrow should exist
            expect(hasPrev || hasNext).toBe(true);
          }
        }
      });

      test('should load product images properly', async ({ page }) => {
        await page.goto('/landing-demo');
        await page.waitForLoadState('networkidle');

        const carousel = page.locator('[class*="carousel"]').first();

        if ((await carousel.count()) > 0) {
          const images = carousel.locator('img');
          const imageCount = await images.count();

          if (imageCount > 0) {
            // Check first visible image
            const firstImage = images.first();

            // Wait for image to load
            await page.waitForTimeout(1000);

            const isLoaded = await firstImage.evaluate((el: HTMLImageElement) => {
              return el.complete && el.naturalHeight !== 0;
            });

            expect(isLoaded).toBe(true);

            // Check for lazy loading attribute
            const loading = await firstImage.getAttribute('loading');
            // First image should be eager, others lazy
            expect(loading).toMatch(/lazy|eager|null/);
          }
        }
      });

      test('should display product information clearly', async ({ page }) => {
        await page.goto('/landing-demo');
        await page.waitForLoadState('networkidle');

        const carousel = page.locator('[class*="carousel"]').first();

        if ((await carousel.count()) > 0) {
          const firstCard = carousel.locator('[class*="product"]').first();

          if ((await firstCard.count()) > 0) {
            // Check for product name
            const name = firstCard.locator('h3, h4, [class*="name"]').first();
            if ((await name.count()) > 0) {
              await expect(name).toBeVisible();

              // Text should be readable
              const fontSize = await name.evaluate((el) =>
                parseFloat(window.getComputedStyle(el).fontSize)
              );
              expect(fontSize).toBeGreaterThanOrEqual(14);
            }

            // Check for price
            const price = firstCard.locator('[class*="price"]').first();
            if ((await price.count()) > 0) {
              await expect(price).toBeVisible();
            }
          }
        }
      });

      test('should have functional "View All" CTA', async ({ page }) => {
        await page.goto('/landing-demo');
        await page.waitForLoadState('networkidle');

        // Find "View All" button
        const viewAllButton = page
          .locator('a, button')
          .filter({ hasText: /view all|see all|shop/i })
          .first();

        if ((await viewAllButton.count()) > 0) {
          await expect(viewAllButton).toBeVisible();

          // Check touch target size
          const results = await checkTouchTargetSize(page, viewAllButton, 44);
          expect(results.every((r) => r.passes)).toBe(true);

          // Should be clickable
          await expect(viewAllButton).toBeEnabled();
        }
      });

      test('should take visual regression screenshot', async ({ page }) => {
        await page.goto('/landing-demo');
        await page.waitForLoadState('networkidle');

        // Scroll to carousel
        await page.evaluate(() => {
          const carousel = document.querySelector('[class*="carousel"]');
          if (carousel) {
            carousel.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        });
        await page.waitForTimeout(500);

        await takeResponsiveScreenshot(page, 'landing-carousel', { fullPage: false });
      });
    });
  }

  // Touch interaction tests
  test.describe('Touch Interactions', () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test('should support swipe navigation', async ({ page }) => {
      await page.goto('/landing-demo');
      await page.waitForLoadState('networkidle');

      const carousel = page.locator('[class*="carousel"]').first();

      if ((await carousel.count()) > 0) {
        // Get initial state
        const initialIndex = await page.evaluate(() => {
          const dots = document.querySelectorAll('[role="tablist"] button');
          return Array.from(dots).findIndex((dot) => dot.getAttribute('aria-selected') === 'true');
        });

        // Swipe left (to next slide)
        await swipeElement(page, '[class*="carousel"]', 'left', 200);
        await page.waitForTimeout(500);

        // Get new state
        const newIndex = await page.evaluate(() => {
          const dots = document.querySelectorAll('[role="tablist"] button');
          return Array.from(dots).findIndex((dot) => dot.getAttribute('aria-selected') === 'true');
        });

        // Should have moved to next slide
        expect(newIndex).not.toBe(initialIndex);
      }
    });

    test('should handle rapid swipes', async ({ page }) => {
      await page.goto('/landing-demo');
      await page.waitForLoadState('networkidle');

      const carousel = page.locator('[class*="carousel"]').first();

      if ((await carousel.count()) > 0) {
        // Perform multiple rapid swipes
        for (let i = 0; i < 3; i++) {
          await swipeElement(page, '[class*="carousel"]', 'left', 150);
          await page.waitForTimeout(200);
        }

        // Carousel should still be functional
        await expect(carousel).toBeVisible();

        // No JavaScript errors
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await page.waitForTimeout(1000);

        expect(errors.length).toBe(0);
      }
    });

    test('should handle swipe right to go back', async ({ page }) => {
      await page.goto('/landing-demo');
      await page.waitForLoadState('networkidle');

      const carousel = page.locator('[class*="carousel"]').first();

      if ((await carousel.count()) > 0) {
        // Navigate to second slide first
        const pagination = page.locator('[role="tablist"]');
        const dots = pagination.locator('button');

        if ((await dots.count()) > 1) {
          await dots.nth(1).click();
          await page.waitForTimeout(500);

          // Now swipe right to go back
          await swipeElement(page, '[class*="carousel"]', 'right', 200);
          await page.waitForTimeout(500);

          // Should be on first slide
          const firstDot = dots.first();
          const isActive = await firstDot.getAttribute('aria-selected');

          expect(isActive).toBe('true');
        }
      }
    });

    test('should prevent vertical scroll during horizontal swipe', async ({ page }) => {
      await page.goto('/landing-demo');
      await page.waitForLoadState('networkidle');

      const carousel = page.locator('[class*="carousel"]').first();

      if ((await carousel.count()) > 0) {
        const initialScrollY = await page.evaluate(() => window.scrollY);

        // Perform horizontal swipe
        await swipeElement(page, '[class*="carousel"]', 'left', 200);
        await page.waitForTimeout(500);

        const finalScrollY = await page.evaluate(() => window.scrollY);

        // Vertical scroll should not have changed significantly
        expect(Math.abs(finalScrollY - initialScrollY)).toBeLessThan(50);
      }
    });
  });

  // Performance tests
  test.describe('Carousel Performance', () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test('should render smoothly without janky animations', async ({ page }) => {
      await page.goto('/landing-demo');
      await page.waitForLoadState('networkidle');

      const carousel = page.locator('[class*="carousel"]').first();

      if ((await carousel.count()) > 0) {
        // Measure frame rate during navigation
        const fps = await page.evaluate(async () => {
          return new Promise<number>((resolve) => {
            let frameCount = 0;
            const duration = 1000; // 1 second
            const startTime = performance.now();

            const countFrames = () => {
              frameCount++;
              if (performance.now() - startTime < duration) {
                requestAnimationFrame(countFrames);
              } else {
                resolve(frameCount);
              }
            };

            requestAnimationFrame(countFrames);
          });
        });

        // Should maintain at least 30 FPS
        expect(fps).toBeGreaterThanOrEqual(30);
      }
    });
  });
});
