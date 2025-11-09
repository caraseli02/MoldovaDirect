import { Page, expect } from '@playwright/test';

/**
 * Mobile Testing Utilities
 */

export const MOBILE_VIEWPORTS = {
  iPhoneSE: { width: 320, height: 568, name: 'iPhone SE' },
  iPhone12Mini: { width: 375, height: 812, name: 'iPhone 12 Mini' },
  iPhone12: { width: 390, height: 844, name: 'iPhone 12' },
  iPhone12ProMax: { width: 414, height: 896, name: 'iPhone 12 Pro Max' },
  Pixel5: { width: 393, height: 851, name: 'Pixel 5' },
  GalaxyS21: { width: 360, height: 800, name: 'Galaxy S21' },
  tablet: { width: 768, height: 1024, name: 'iPad' },
  desktop: { width: 1024, height: 768, name: 'Desktop' },
} as const;

export const TEST_BREAKPOINTS = [320, 375, 390, 414, 640, 768, 1024] as const;

/**
 * Check if touch targets meet minimum size requirements (44x44px minimum)
 */
export async function checkTouchTargetSize(page: Page, selector: string, minSize = 44) {
  const elements = await page.locator(selector).all();
  const results: { element: string; width: number; height: number; passes: boolean }[] = [];

  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    const box = await element.boundingBox();

    if (box) {
      const passes = box.width >= minSize && box.height >= minSize;
      results.push({
        element: `${selector}[${i}]`,
        width: box.width,
        height: box.height,
        passes,
      });

      if (!passes) {
        console.warn(
          `Touch target too small: ${selector}[${i}] - ${box.width}x${box.height}px (min: ${minSize}px)`
        );
      }
    }
  }

  return results;
}

/**
 * Simulate swipe gesture on an element
 */
export async function swipeElement(
  page: Page,
  selector: string,
  direction: 'left' | 'right' | 'up' | 'down' = 'left',
  distance = 200
) {
  const element = page.locator(selector).first();
  const box = await element.boundingBox();

  if (!box) {
    throw new Error(`Element ${selector} not found or not visible`);
  }

  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;

  let startX = centerX;
  let startY = centerY;
  let endX = centerX;
  let endY = centerY;

  switch (direction) {
    case 'left':
      startX = centerX + distance / 2;
      endX = centerX - distance / 2;
      break;
    case 'right':
      startX = centerX - distance / 2;
      endX = centerX + distance / 2;
      break;
    case 'up':
      startY = centerY + distance / 2;
      endY = centerY - distance / 2;
      break;
    case 'down':
      startY = centerY - distance / 2;
      endY = centerY + distance / 2;
      break;
  }

  await page.touchscreen.tap(startX, startY);
  await page.touchscreen.swipe({ startX, startY, endX, endY, steps: 10 });
  await page.waitForTimeout(300);
}

/**
 * Check for horizontal overflow
 */
export async function checkHorizontalOverflow(page: Page): Promise<boolean> {
  return await page.evaluate(() => {
    const body = document.body;
    const html = document.documentElement;
    const bodyWidth = body.scrollWidth;
    const htmlWidth = html.scrollWidth;
    const viewportWidth = window.innerWidth;

    return bodyWidth > viewportWidth || htmlWidth > viewportWidth;
  });
}

/**
 * Check color contrast ratio for accessibility
 */
export async function checkColorContrast(
  page: Page,
  selector: string
): Promise<{ ratio: number; passes: boolean }> {
  return await page.locator(selector).first().evaluate((element) => {
    const styles = window.getComputedStyle(element);
    const color = styles.color;
    const backgroundColor = styles.backgroundColor;

    // Simple contrast calculation (simplified version)
    const getLuminance = (rgb: string) => {
      const match = rgb.match(/\d+/g);
      if (!match) return 0;

      const [r, g, b] = match.map(Number);
      const [rr, gg, bb] = [r, g, b].map((c) => {
        const s = c / 255;
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
      });

      return 0.2126 * rr + 0.7152 * gg + 0.0722 * bb;
    };

    const l1 = getLuminance(color);
    const l2 = getLuminance(backgroundColor);
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

    return {
      ratio,
      passes: ratio >= 4.5, // WCAG AA standard for normal text
    };
  });
}

/**
 * Measure layout shift
 */
export async function measureLayoutShift(page: Page): Promise<number> {
  return await page.evaluate(() => {
    return new Promise<number>((resolve) => {
      let clsScore = 0;

      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
            clsScore += (entry as any).value;
          }
        }
      });

      observer.observe({ type: 'layout-shift', buffered: true });

      setTimeout(() => {
        observer.disconnect();
        resolve(clsScore);
      }, 3000);
    });
  });
}

/**
 * Check if element is in viewport
 */
export async function isInViewport(page: Page, selector: string): Promise<boolean> {
  return await page.locator(selector).first().evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= window.innerHeight &&
      rect.right <= window.innerWidth
    );
  });
}

/**
 * Wait for images to load
 */
export async function waitForImages(page: Page, timeout = 10000) {
  await page.waitForFunction(
    () => {
      const images = Array.from(document.images);
      return images.every((img) => img.complete && img.naturalHeight !== 0);
    },
    { timeout }
  );
}

/**
 * Get first contentful paint time
 */
export async function getFirstContentfulPaint(page: Page): Promise<number> {
  return await page.evaluate(() => {
    return new Promise<number>((resolve) => {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            resolve(entry.startTime);
            observer.disconnect();
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
}

/**
 * Check for tap delay (should be minimal on mobile)
 */
export async function measureTapDelay(page: Page, selector: string): Promise<number> {
  const element = page.locator(selector).first();
  const startTime = Date.now();

  await element.tap();
  await page.waitForTimeout(100);

  return Date.now() - startTime;
}

/**
 * Check if font size is readable on mobile (minimum 16px)
 */
export async function checkFontSize(page: Page, selector: string, minSize = 16): Promise<boolean> {
  return await page.locator(selector).first().evaluate((element, min) => {
    const styles = window.getComputedStyle(element);
    const fontSize = parseFloat(styles.fontSize);
    return fontSize >= min;
  }, minSize);
}

/**
 * Screenshot comparison helper
 */
export async function takeResponsiveScreenshot(
  page: Page,
  name: string,
  options?: { fullPage?: boolean }
) {
  const viewport = page.viewportSize();
  const filename = `${name}-${viewport?.width}x${viewport?.height}.png`;

  await page.screenshot({
    path: `test-results/screenshots/${filename}`,
    fullPage: options?.fullPage ?? false,
  });

  return filename;
}
