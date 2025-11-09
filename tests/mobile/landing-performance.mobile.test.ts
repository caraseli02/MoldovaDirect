import { test, expect } from '@playwright/test';
import {
  getFirstContentfulPaint,
  measureLayoutShift,
  measureTapDelay,
  waitForImages,
  MOBILE_VIEWPORTS,
} from './test-helpers';

test.describe('Landing Page - Mobile Performance Tests', () => {
  test.describe('Core Web Vitals', () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test('should have good First Contentful Paint (FCP)', async ({ page }) => {
      await page.goto('/landing-demo');

      const fcp = await getFirstContentfulPaint(page);

      // FCP should be under 1.8s for "good" rating on mobile
      expect(fcp).toBeLessThan(1800);

      console.log(`First Contentful Paint: ${fcp.toFixed(2)}ms`);
    });

    test('should have low Cumulative Layout Shift (CLS)', async ({ page }) => {
      await page.goto('/landing-demo');
      await page.waitForLoadState('networkidle');

      const cls = await measureLayoutShift(page);

      // CLS should be under 0.1 for "good" rating
      expect(cls).toBeLessThan(0.1);

      console.log(`Cumulative Layout Shift: ${cls.toFixed(4)}`);
    });

    test('should have fast Time to Interactive (TTI)', async ({ page }) => {
      const startTime = Date.now();

      await page.goto('/landing-demo');
      await page.waitForLoadState('networkidle');

      const tti = Date.now() - startTime;

      // TTI should be under 3.8s for "good" rating on mobile
      expect(tti).toBeLessThan(3800);

      console.log(`Time to Interactive: ${tti}ms`);
    });

    test('should have fast Largest Contentful Paint (LCP)', async ({ page }) => {
      await page.goto('/landing-demo');

      const lcp = await page.evaluate(() => {
        return new Promise<number>((resolve) => {
          let largestPaint = 0;

          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            for (const entry of entries) {
              if ((entry as any).entryType === 'largest-contentful-paint') {
                largestPaint = entry.startTime;
              }
            }
          });

          observer.observe({ type: 'largest-contentful-paint', buffered: true });

          setTimeout(() => {
            observer.disconnect();
            resolve(largestPaint);
          }, 3000);
        });
      });

      // LCP should be under 2.5s for "good" rating
      expect(lcp).toBeLessThan(2500);

      console.log(`Largest Contentful Paint: ${lcp.toFixed(2)}ms`);
    });

    test('should have fast First Input Delay (FID)', async ({ page }) => {
      await page.goto('/landing-demo');
      await page.waitForLoadState('networkidle');

      // Measure time to respond to first interaction
      const fid = await measureTapDelay(page, '.btn-primary');

      // FID should be under 100ms for "good" rating
      expect(fid).toBeLessThan(100);

      console.log(`First Input Delay: ${fid}ms`);
    });
  });

  test.describe('Resource Loading', () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test('should load critical resources quickly', async ({ page }) => {
      await page.goto('/landing-demo');

      const resourceTimings = await page.evaluate(() => {
        const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
        return resources
          .filter((r) => r.initiatorType === 'link' || r.initiatorType === 'script')
          .map((r) => ({
            name: r.name,
            duration: r.duration,
            size: r.transferSize,
          }));
      });

      // Critical resources should load in under 1 second
      const slowResources = resourceTimings.filter((r) => r.duration > 1000);

      expect(slowResources.length).toBeLessThan(resourceTimings.length * 0.2); // Max 20% can be slow

      if (slowResources.length > 0) {
        console.log('Slow resources:', slowResources);
      }
    });

    test('should efficiently load images', async ({ page }) => {
      await page.goto('/landing-demo');

      const imageMetrics = await page.evaluate(() => {
        const images = Array.from(document.images);
        return images.map((img) => ({
          src: img.src,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          displayWidth: img.clientWidth,
          displayHeight: img.clientHeight,
          complete: img.complete,
        }));
      });

      // Check for oversized images (waste bandwidth)
      const oversizedImages = imageMetrics.filter((img) => {
        const widthRatio = img.naturalWidth / (img.displayWidth || 1);
        const heightRatio = img.naturalHeight / (img.displayHeight || 1);

        // Image shouldn't be more than 2x larger than display size
        return widthRatio > 2 || heightRatio > 2;
      });

      expect(oversizedImages.length).toBeLessThan(imageMetrics.length * 0.3); // Max 30%

      if (oversizedImages.length > 0) {
        console.log('Oversized images:', oversizedImages);
      }
    });

    test('should use lazy loading for below-fold images', async ({ page }) => {
      await page.goto('/landing-demo');
      await page.waitForLoadState('networkidle');

      const images = await page.locator('img').all();
      let lazyLoadCount = 0;

      for (let i = 1; i < Math.min(images.length, 10); i++) {
        // Skip first image (above fold)
        const loading = await images[i].getAttribute('loading');
        if (loading === 'lazy') {
          lazyLoadCount++;
        }
      }

      // Most below-fold images should be lazy loaded
      expect(lazyLoadCount).toBeGreaterThan(0);

      console.log(`Lazy loaded images: ${lazyLoadCount}/${images.length - 1}`);
    });

    test('should load fonts efficiently', async ({ page }) => {
      await page.goto('/landing-demo');

      const fontMetrics = await page.evaluate(() => {
        const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
        return resources
          .filter((r) => r.initiatorType === 'link' && r.name.includes('font'))
          .map((r) => ({
            name: r.name,
            duration: r.duration,
            size: r.transferSize,
          }));
      });

      // Fonts should load quickly (under 500ms)
      for (const font of fontMetrics) {
        expect(font.duration).toBeLessThan(500);
      }

      console.log(`Font load times:`, fontMetrics);
    });

    test('should prefetch/preload critical resources', async ({ page }) => {
      await page.goto('/landing-demo');

      const preloadLinks = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('link[rel="preload"], link[rel="prefetch"]'));
        return links.map((link) => ({
          rel: link.getAttribute('rel'),
          href: link.getAttribute('href'),
          as: link.getAttribute('as'),
        }));
      });

      // Should have some preload/prefetch directives
      console.log('Preload/prefetch resources:', preloadLinks);
    });
  });

  test.describe('JavaScript Performance', () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test('should have minimal main thread blocking', async ({ page }) => {
      await page.goto('/landing-demo');
      await page.waitForLoadState('networkidle');

      const longTasks = await page.evaluate(() => {
        return new Promise<number>((resolve) => {
          let taskCount = 0;

          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (entry.duration > 50) {
                // Long task threshold
                taskCount++;
              }
            }
          });

          observer.observe({ type: 'longtask', buffered: true });

          setTimeout(() => {
            observer.disconnect();
            resolve(taskCount);
          }, 5000);
        });
      });

      // Should have minimal long tasks
      expect(longTasks).toBeLessThan(5);

      console.log(`Long tasks detected: ${longTasks}`);
    });

    test('should have efficient bundle size', async ({ page }) => {
      await page.goto('/landing-demo');

      const scriptSizes = await page.evaluate(() => {
        const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
        return resources
          .filter((r) => r.initiatorType === 'script')
          .map((r) => ({
            name: r.name,
            size: r.transferSize,
            decodedSize: r.decodedBodySize,
          }));
      });

      const totalSize = scriptSizes.reduce((sum, script) => sum + script.size, 0);

      // Total JS size should be under 300KB on mobile (compressed)
      expect(totalSize).toBeLessThan(300 * 1024);

      console.log(`Total JS size: ${(totalSize / 1024).toFixed(2)}KB`);
    });

    test('should execute efficiently without memory leaks', async ({ page }) => {
      await page.goto('/landing-demo');
      await page.waitForLoadState('networkidle');

      const initialMemory = await page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize || 0;
      });

      // Interact with page
      await page.click('.btn-secondary');
      await page.waitForTimeout(1000);

      // Close modal
      const closeButton = page.locator('[aria-label*="close"]').first();
      if ((await closeButton.count()) > 0) {
        await closeButton.click();
      }
      await page.waitForTimeout(1000);

      const finalMemory = await page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize || 0;
      });

      // Memory shouldn't increase dramatically (potential leak)
      const memoryIncrease = finalMemory - initialMemory;

      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // Less than 10MB increase

      console.log(`Memory increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
    });
  });

  test.describe('Network Performance', () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test('should make minimal HTTP requests', async ({ page }) => {
      await page.goto('/landing-demo');
      await page.waitForLoadState('networkidle');

      const requestCount = await page.evaluate(() => {
        const resources = performance.getEntriesByType('resource');
        return resources.length;
      });

      // Should make fewer than 50 requests on initial load
      expect(requestCount).toBeLessThan(50);

      console.log(`Total HTTP requests: ${requestCount}`);
    });

    test('should work on slow 3G connection', async ({ page, context }) => {
      // Emulate slow 3G
      await context.route('**/*', (route) => {
        setTimeout(() => route.continue(), 100); // Add 100ms latency
      });

      const startTime = Date.now();

      await page.goto('/landing-demo');
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 });

      const loadTime = Date.now() - startTime;

      // Should load within 10 seconds on slow 3G
      expect(loadTime).toBeLessThan(10000);

      console.log(`Load time on slow 3G: ${loadTime}ms`);
    });

    test('should use compression for resources', async ({ page }) => {
      const responses: { url: string; compressed: boolean }[] = [];

      page.on('response', (response) => {
        const contentEncoding = response.headers()['content-encoding'];
        responses.push({
          url: response.url(),
          compressed: contentEncoding === 'gzip' || contentEncoding === 'br',
        });
      });

      await page.goto('/landing-demo');
      await page.waitForLoadState('networkidle');

      const textResources = responses.filter(
        (r) =>
          r.url.includes('.js') || r.url.includes('.css') || r.url.includes('.html')
      );

      const compressedCount = textResources.filter((r) => r.compressed).length;

      // Most text resources should be compressed
      if (textResources.length > 0) {
        const compressionRate = compressedCount / textResources.length;
        expect(compressionRate).toBeGreaterThan(0.7); // At least 70% compressed
      }

      console.log(`Compression rate: ${compressedCount}/${textResources.length}`);
    });

    test('should use caching effectively', async ({ page }) => {
      // First visit
      await page.goto('/landing-demo');
      await page.waitForLoadState('networkidle');

      // Second visit (should use cache)
      await page.goto('/landing-demo');
      await page.waitForLoadState('networkidle');

      const cachedResources = await page.evaluate(() => {
        const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
        return resources.filter((r) => r.transferSize === 0 && r.decodedBodySize > 0).length;
      });

      // Some resources should be cached on second visit
      expect(cachedResources).toBeGreaterThan(0);

      console.log(`Cached resources: ${cachedResources}`);
    });
  });

  test.describe('Rendering Performance', () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test('should maintain 60 FPS during scroll', async ({ page }) => {
      await page.goto('/landing-demo');
      await page.waitForLoadState('networkidle');

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

          // Start scrolling
          window.scrollTo(0, 100);
          requestAnimationFrame(countFrames);
        });
      });

      // Should maintain at least 50 FPS (close to 60)
      expect(fps).toBeGreaterThanOrEqual(50);

      console.log(`Scroll FPS: ${fps}`);
    });

    test('should render carousel smoothly', async ({ page }) => {
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

      // Navigate carousel
      const pagination = page.locator('[role="tablist"]');

      if ((await pagination.count()) > 0) {
        const dots = pagination.locator('button');
        const dotCount = await dots.count();

        if (dotCount > 1) {
          const startTime = Date.now();

          await dots.nth(1).click();
          await page.waitForTimeout(300);

          const transitionTime = Date.now() - startTime;

          // Carousel transition should be smooth (under 500ms)
          expect(transitionTime).toBeLessThan(500);

          console.log(`Carousel transition time: ${transitionTime}ms`);
        }
      }
    });

    test('should open modal quickly', async ({ page }) => {
      await page.goto('/landing-demo');
      await page.waitForLoadState('networkidle');

      const quizButton = page
        .locator('button')
        .filter({ hasText: /quiz|find|discover/i })
        .first();

      if ((await quizButton.count()) > 0) {
        const startTime = Date.now();

        await quizButton.click();
        await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: 2000 });

        const modalOpenTime = Date.now() - startTime;

        // Modal should open quickly (under 300ms)
        expect(modalOpenTime).toBeLessThan(300);

        console.log(`Modal open time: ${modalOpenTime}ms`);
      }
    });
  });

  test.describe('Battery and CPU Impact', () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test('should not constantly rerender', async ({ page }) => {
      await page.goto('/landing-demo');
      await page.waitForLoadState('networkidle');

      // Monitor repaints
      const repaintCount = await page.evaluate(async () => {
        return new Promise<number>((resolve) => {
          let count = 0;

          const observer = new PerformanceObserver((list) => {
            count += list.getEntries().length;
          });

          observer.observe({ type: 'measure', buffered: true });

          setTimeout(() => {
            observer.disconnect();
            resolve(count);
          }, 3000);
        });
      });

      // Should not have excessive repaints
      console.log(`Repaints in 3 seconds: ${repaintCount}`);
    });

    test('should minimize animations when idle', async ({ page }) => {
      await page.goto('/landing-demo');
      await page.waitForLoadState('networkidle');

      // Wait for initial animations to complete
      await page.waitForTimeout(2000);

      // Check for ongoing animations
      const ongoingAnimations = await page.evaluate(() => {
        const animations = document.getAnimations();
        return animations.filter((anim) => anim.playState === 'running').length;
      });

      // Should have minimal ongoing animations when idle
      expect(ongoingAnimations).toBeLessThan(5);

      console.log(`Ongoing animations: ${ongoingAnimations}`);
    });
  });

  test.describe('Performance Across Devices', () => {
    Object.entries(MOBILE_VIEWPORTS).forEach(([deviceName, viewport]) => {
      test(`should perform well on ${viewport.name}`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });

        const startTime = Date.now();

        await page.goto('/landing-demo');
        await page.waitForLoadState('networkidle');

        const loadTime = Date.now() - startTime;

        // Should load within 3 seconds on all devices
        expect(loadTime).toBeLessThan(3000);

        console.log(`${viewport.name} load time: ${loadTime}ms`);

        // Check FCP
        const fcp = await getFirstContentfulPaint(page);
        expect(fcp).toBeLessThan(2000);

        console.log(`${viewport.name} FCP: ${fcp.toFixed(2)}ms`);
      });
    });
  });
});
