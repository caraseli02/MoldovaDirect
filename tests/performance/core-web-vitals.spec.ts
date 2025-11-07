import { test, expect } from '@playwright/test';

/**
 * Core Web Vitals Performance Tests
 * Tests real-world performance metrics that affect SEO and UX
 */

test.describe('Core Web Vitals', () => {
  test('should have good Largest Contentful Paint (LCP)', async ({ page }) => {
    await page.goto('/');

    const lcp = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          if (lastEntry) {
            observer.disconnect();
            resolve(lastEntry.renderTime || lastEntry.loadTime);
          }
        });

        observer.observe({ type: 'largest-contentful-paint', buffered: true });

        // Timeout after 5 seconds
        setTimeout(() => {
          observer.disconnect();
          resolve(0);
        }, 5000);
      });
    });

    console.log('LCP:', lcp, 'ms');

    // LCP should be under 2.5 seconds (2500ms) for "good" rating
    expect(lcp).toBeLessThan(2500);

    // Warning if over 4 seconds (4000ms) - "needs improvement"
    if (lcp > 4000) {
      console.warn('LCP is in "poor" range. Needs optimization.');
    }
  });

  test('should have low Cumulative Layout Shift (CLS)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Scroll through page to trigger any layout shifts
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });

    await page.waitForTimeout(1000);

    const cls = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let clsValue = 0;

        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if ('hadRecentInput' in entry && !(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
        });

        observer.observe({ type: 'layout-shift', buffered: true });

        setTimeout(() => {
          observer.disconnect();
          resolve(clsValue);
        }, 2000);
      });
    });

    console.log('CLS:', cls);

    // CLS should be under 0.1 for "good" rating
    expect(cls).toBeLessThan(0.1);

    // Warning if over 0.25 - "needs improvement"
    if (cls > 0.25) {
      console.warn('CLS is in "poor" range. Check for layout instability.');
    }
  });

  test('should have fast Time to First Byte (TTFB)', async ({ page }) => {
    const startTime = Date.now();
    const response = await page.goto('/');
    const ttfb = Date.now() - startTime;

    console.log('TTFB:', ttfb, 'ms');

    // TTFB should be under 800ms for "good" rating
    expect(ttfb).toBeLessThan(800);

    // Warning if over 1800ms - "needs improvement"
    if (ttfb > 1800) {
      console.warn('TTFB is in "poor" range. Server response is slow.');
    }

    expect(response?.status()).toBe(200);
  });

  test('should have fast First Contentful Paint (FCP)', async ({ page }) => {
    await page.goto('/');

    const fcp = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
              observer.disconnect();
              resolve(entry.startTime);
            }
          }
        });

        observer.observe({ type: 'paint', buffered: true });

        setTimeout(() => {
          observer.disconnect();
          resolve(0);
        }, 5000);
      });
    });

    console.log('FCP:', fcp, 'ms');

    // FCP should be under 1.8 seconds (1800ms) for "good" rating
    expect(fcp).toBeLessThan(1800);

    // Warning if over 3 seconds (3000ms) - "needs improvement"
    if (fcp > 3000) {
      console.warn('FCP is in "poor" range. Initial content is rendering slowly.');
    }
  });

  test('should have reasonable page weight', async ({ page }) => {
    const response = await page.goto('/');
    await page.waitForLoadState('networkidle');

    const resources = await page.evaluate(() => {
      const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

      return entries.reduce((acc, entry) => {
        const type = entry.initiatorType;
        const size = entry.transferSize || 0;

        acc.total += size;
        acc.byType[type] = (acc.byType[type] || 0) + size;
        acc.count++;

        return acc;
      }, {
        total: 0,
        byType: {} as Record<string, number>,
        count: 0,
      });
    });

    console.log('Total page weight:', Math.round(resources.total / 1024), 'KB');
    console.log('Total resources:', resources.count);
    console.log('Weight by type:',
      Object.entries(resources.byType)
        .map(([type, size]) => `${type}: ${Math.round(size / 1024)}KB`)
        .join(', ')
    );

    // Total page weight should be under 2MB (2097152 bytes)
    expect(resources.total).toBeLessThan(2097152);

    // Warning if over 3MB
    if (resources.total > 3145728) {
      console.warn('Page weight is very large. Consider optimization.');
    }
  });

  test('should have reasonable number of HTTP requests', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const requestCount = await page.evaluate(() => {
      return performance.getEntriesByType('resource').length;
    });

    console.log('HTTP requests:', requestCount);

    // Should have less than 100 requests
    expect(requestCount).toBeLessThan(100);

    // Warning if over 150 requests
    if (requestCount > 150) {
      console.warn('Too many HTTP requests. Consider bundling resources.');
    }
  });

  test('should use compression for text resources', async ({ page }) => {
    const response = await page.goto('/');

    const contentEncoding = response?.headers()['content-encoding'];
    const contentType = response?.headers()['content-type'];

    if (contentType?.includes('text') || contentType?.includes('javascript') || contentType?.includes('json')) {
      expect(['gzip', 'br', 'deflate'].some(enc => contentEncoding?.includes(enc))).toBeTruthy();
    }
  });

  test('should have proper caching headers', async ({ page }) => {
    const response = await page.goto('/');

    const cacheControl = response?.headers()['cache-control'];

    // Should have cache control headers
    expect(cacheControl).toBeTruthy();
  });

  test('should load images efficiently', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const imageMetrics = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));

      return images.map(img => ({
        src: img.src,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        displayWidth: img.clientWidth,
        displayHeight: img.clientHeight,
        loading: img.loading,
        hasAlt: !!img.alt,
      }));
    });

    console.log('Total images:', imageMetrics.length);

    for (const image of imageMetrics) {
      // Images should have alt text (accessibility)
      expect(image.hasAlt).toBeTruthy();

      // Images should use lazy loading if below fold
      if (image.displayWidth > 0) {
        // Images should not be significantly oversized
        const widthRatio = image.naturalWidth / image.displayWidth;
        expect(widthRatio).toBeLessThan(2);
      }
    }
  });

  test('should have fast Time to Interactive (TTI)', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Ensure page is interactive
    await page.waitForFunction(() => {
      return document.readyState === 'complete';
    });

    const tti = Date.now() - startTime;

    console.log('TTI:', tti, 'ms');

    // TTI should be under 3.8 seconds (3800ms) for "good" rating
    expect(tti).toBeLessThan(3800);

    // Warning if over 7.3 seconds - "needs improvement"
    if (tti > 7300) {
      console.warn('TTI is in "poor" range. Page takes too long to become interactive.');
    }
  });

  test('should not block main thread for too long', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const longTasks = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let taskCount = 0;

        const observer = new PerformanceObserver((list) => {
          taskCount += list.getEntries().length;
        });

        observer.observe({ type: 'longtask', buffered: true });

        setTimeout(() => {
          observer.disconnect();
          resolve(taskCount);
        }, 5000);
      });
    });

    console.log('Long tasks (>50ms):', longTasks);

    // Should have minimal long tasks
    expect(longTasks).toBeLessThan(5);
  });
});

test.describe('Performance Budget', () => {
  test('should meet performance budget for key metrics', async ({ page }) => {
    const metrics = {
      lcp: 2500,      // ms
      fcp: 1800,      // ms
      cls: 0.1,       // score
      ttfb: 800,      // ms
      tti: 3800,      // ms
      pageWeight: 2,  // MB
      requests: 100,  // count
    };

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Get all metrics
    const performance = await page.evaluate(() => {
      return new Promise<any>((resolve) => {
        const metrics: any = {};

        // LCP
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          metrics.lcp = lastEntry.renderTime || lastEntry.loadTime;
          lcpObserver.disconnect();
        });
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

        // FCP
        const fcpObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
              metrics.fcp = entry.startTime;
              fcpObserver.disconnect();
            }
          }
        });
        fcpObserver.observe({ type: 'paint', buffered: true });

        // CLS
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if ('hadRecentInput' in entry && !(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
        });
        clsObserver.observe({ type: 'layout-shift', buffered: true });

        // Resources
        const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
        metrics.pageWeight = resources.reduce((acc, entry) => acc + (entry.transferSize || 0), 0) / 1048576; // MB
        metrics.requests = resources.length;

        // Navigation timing
        const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        metrics.ttfb = navEntry.responseStart - navEntry.requestStart;

        setTimeout(() => {
          metrics.cls = clsValue;
          resolve(metrics);
        }, 3000);
      });
    });

    console.log('Performance Metrics:');
    console.log('  LCP:', Math.round(performance.lcp), 'ms (budget:', metrics.lcp, 'ms)');
    console.log('  FCP:', Math.round(performance.fcp), 'ms (budget:', metrics.fcp, 'ms)');
    console.log('  CLS:', performance.cls.toFixed(3), '(budget:', metrics.cls, ')');
    console.log('  TTFB:', Math.round(performance.ttfb), 'ms (budget:', metrics.ttfb, 'ms)');
    console.log('  Page Weight:', performance.pageWeight.toFixed(2), 'MB (budget:', metrics.pageWeight, 'MB)');
    console.log('  Requests:', performance.requests, '(budget:', metrics.requests, ')');

    // Validate against budget
    expect(performance.lcp).toBeLessThan(metrics.lcp);
    expect(performance.fcp).toBeLessThan(metrics.fcp);
    expect(performance.cls).toBeLessThan(metrics.cls);
    expect(performance.ttfb).toBeLessThan(metrics.ttfb);
    expect(performance.pageWeight).toBeLessThan(metrics.pageWeight);
    expect(performance.requests).toBeLessThan(metrics.requests);
  });
});
