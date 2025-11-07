import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Landing Page Accessibility Tests (WCAG 2.1 AA)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
  });

  test('should not have any automatically detectable accessibility issues', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper page title and meta description', async ({ page }) => {
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(10);
    expect(title.length).toBeLessThan(60);

    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description).toBeTruthy();
    expect(description!.length).toBeGreaterThan(50);
    expect(description!.length).toBeLessThan(160);
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    // Should have exactly one h1
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);

    // All headings should be in order
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    const headingLevels = await Promise.all(
      headings.map(async (h) => {
        const tagName = await h.evaluate((el) => el.tagName.toLowerCase());
        return parseInt(tagName.substring(1));
      })
    );

    // Check that headings don't skip levels
    for (let i = 1; i < headingLevels.length; i++) {
      const diff = headingLevels[i] - headingLevels[i - 1];
      expect(diff).toBeLessThanOrEqual(1);
    }
  });

  test('should have all images with alt text', async ({ page }) => {
    const images = await page.locator('img').all();

    for (const img of images) {
      const alt = await img.getAttribute('alt');
      const ariaLabel = await img.getAttribute('aria-label');
      const ariaHidden = await img.getAttribute('aria-hidden');

      // Images should have alt text OR be decorative (aria-hidden="true")
      if (ariaHidden !== 'true') {
        expect(alt !== null || ariaLabel !== null).toBeTruthy();
      }
    }
  });

  test('should have proper color contrast ratios', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .disableRules(['color-contrast']) // We'll check this separately
      .analyze();

    const colorContrastResults = await new AxeBuilder({ page })
      .include('body')
      .withRules(['color-contrast'])
      .analyze();

    expect(colorContrastResults.violations).toEqual([]);
  });

  test('should have proper form labels and associations', async ({ page }) => {
    const inputs = await page.locator('input:not([type="hidden"])').all();

    for (const input of inputs) {
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');
      const placeholder = await input.getAttribute('placeholder');

      // Input should have a label (via for attribute), aria-label, or aria-labelledby
      if (id) {
        const label = await page.locator(`label[for="${id}"]`).count();
        expect(label > 0 || ariaLabel !== null || ariaLabelledBy !== null).toBeTruthy();
      } else {
        expect(ariaLabel !== null || ariaLabelledBy !== null).toBeTruthy();
      }

      // Placeholder should not be the only label
      if (placeholder && !ariaLabel && !ariaLabelledBy) {
        expect(id).toBeTruthy();
      }
    }
  });

  test('should have ARIA landmarks', async ({ page }) => {
    // Check for main landmark
    const mainCount = await page.locator('main, [role="main"]').count();
    expect(mainCount).toBeGreaterThan(0);

    // Check for navigation landmark
    const navCount = await page.locator('nav, [role="navigation"]').count();
    expect(navCount).toBeGreaterThan(0);

    // Check for banner (header) landmark
    const bannerCount = await page.locator('header, [role="banner"]').count();
    expect(bannerCount).toBeGreaterThan(0);

    // Check for contentinfo (footer) landmark
    const footerCount = await page.locator('footer, [role="contentinfo"]').count();
    expect(footerCount).toBeGreaterThan(0);
  });

  test('should have skip to main content link', async ({ page }) => {
    // Check for skip link
    const skipLink = page.locator('a[href="#main"], a[href="#content"]').first();
    await expect(skipLink).toHaveCount(1);

    // Skip link should be the first focusable element
    await page.keyboard.press('Tab');
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBe('A');
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Get all focusable elements
    const focusableElements = await page.locator(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    ).all();

    expect(focusableElements.length).toBeGreaterThan(0);

    // Tab through first 5 elements and check focus visibility
    for (let i = 0; i < Math.min(5, focusableElements.length); i++) {
      await page.keyboard.press('Tab');

      const focusedElement = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el) return null;
        const styles = window.getComputedStyle(el);
        return {
          outline: styles.outline,
          outlineWidth: styles.outlineWidth,
          outlineStyle: styles.outlineStyle,
          boxShadow: styles.boxShadow,
        };
      });

      // Element should have visible focus indicator
      expect(
        focusedElement?.outline !== 'none' ||
        focusedElement?.outlineWidth !== '0px' ||
        focusedElement?.boxShadow !== 'none'
      ).toBeTruthy();
    }
  });

  test('should not have keyboard traps', async ({ page }) => {
    let previousElement = '';
    let sameElementCount = 0;

    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab');
      const currentElement = await page.evaluate(() => {
        const el = document.activeElement;
        return el?.tagName + (el?.id ? `#${el.id}` : '') + (el?.className ? `.${el.className}` : '');
      });

      if (currentElement === previousElement) {
        sameElementCount++;
      } else {
        sameElementCount = 0;
      }

      // If focus is stuck on the same element for 3+ tabs, it's a keyboard trap
      expect(sameElementCount).toBeLessThan(3);
      previousElement = currentElement || '';
    }
  });

  test('should respect prefers-reduced-motion', async ({ page }) => {
    // Enable reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });

    // Check that animations are disabled or significantly reduced
    const animatedElements = await page.locator('[class*="animate"], [class*="transition"]').all();

    for (const element of animatedElements) {
      const styles = await element.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          animationDuration: computed.animationDuration,
          transitionDuration: computed.transitionDuration,
        };
      });

      // Animations should be instant or very short
      if (styles.animationDuration !== 'none' && styles.animationDuration !== '0s') {
        const duration = parseFloat(styles.animationDuration);
        expect(duration).toBeLessThan(0.1); // Less than 100ms
      }
    }
  });

  test('should have proper button and link semantics', async ({ page }) => {
    // All clickable elements should be buttons or links
    const clickableElements = await page.locator('[onclick], [ng-click], [v-on\\:click]').all();

    for (const element of clickableElements) {
      const role = await element.getAttribute('role');
      const tagName = await element.evaluate((el) => el.tagName.toLowerCase());

      expect(['button', 'a', 'input'].includes(tagName) || role === 'button' || role === 'link').toBeTruthy();
    }
  });

  test('should have valid language attribute', async ({ page }) => {
    const htmlLang = await page.locator('html').getAttribute('lang');
    expect(htmlLang).toBeTruthy();
    expect(['es', 'en', 'ro', 'ru', 'es-ES', 'en-US'].some(lang => htmlLang?.startsWith(lang))).toBeTruthy();
  });

  test('should have proper link text (no "click here" or "read more")', async ({ page }) => {
    const links = await page.locator('a').all();

    for (const link of links) {
      const text = await link.textContent();
      const ariaLabel = await link.getAttribute('aria-label');
      const linkText = text?.trim().toLowerCase() || ariaLabel?.toLowerCase() || '';

      // Links should have descriptive text
      expect(linkText.length).toBeGreaterThan(0);
      expect(['click here', 'read more', 'more', 'here'].includes(linkText)).toBeFalsy();
    }
  });

  test('should have proper autocomplete attributes on form fields', async ({ page }) => {
    const emailInputs = await page.locator('input[type="email"]').all();
    const nameInputs = await page.locator('input[name*="name"], input[id*="name"]').all();

    // Email inputs should have autocomplete="email"
    for (const input of emailInputs) {
      const autocomplete = await input.getAttribute('autocomplete');
      expect(autocomplete).toContain('email');
    }

    // Name inputs should have appropriate autocomplete
    for (const input of nameInputs) {
      const autocomplete = await input.getAttribute('autocomplete');
      expect(autocomplete).toBeTruthy();
    }
  });

  test('should have proper video/audio controls', async ({ page }) => {
    const videos = await page.locator('video').all();
    const audios = await page.locator('audio').all();

    for (const media of [...videos, ...audios]) {
      const controls = await media.getAttribute('controls');
      const ariaLabel = await media.getAttribute('aria-label');

      // Media elements should have controls and labels
      expect(controls !== null).toBeTruthy();
      expect(ariaLabel).toBeTruthy();
    }
  });
});

test.describe('Mobile Accessibility Tests', () => {
  test.use({
    viewport: { width: 375, height: 667 },
    hasTouch: true,
  });

  test('should have proper touch target sizes', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const interactiveElements = await page.locator('a, button, input, select, textarea').all();

    for (const element of interactiveElements) {
      const box = await element.boundingBox();

      if (box) {
        // Touch targets should be at least 44x44 pixels (WCAG 2.1 AA)
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
  });

  test('should have proper spacing between interactive elements', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const buttons = await page.locator('button, a').all();

    for (let i = 0; i < buttons.length - 1; i++) {
      const box1 = await buttons[i].boundingBox();
      const box2 = await buttons[i + 1].boundingBox();

      if (box1 && box2) {
        // Adjacent interactive elements should have at least 8px spacing
        const horizontalGap = Math.abs(box2.x - (box1.x + box1.width));
        const verticalGap = Math.abs(box2.y - (box1.y + box1.height));

        if (horizontalGap < 100 && verticalGap < 100) {
          expect(Math.min(horizontalGap, verticalGap)).toBeGreaterThanOrEqual(8);
        }
      }
    }
  });
});

test.describe('Screen Reader Tests', () => {
  test('should have proper ARIA roles for interactive widgets', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check custom widgets have proper roles
    const customWidgets = await page.locator('[class*="carousel"], [class*="modal"], [class*="dropdown"]').all();

    for (const widget of customWidgets) {
      const role = await widget.getAttribute('role');
      expect(role).toBeTruthy();
    }
  });

  test('should have proper aria-live regions for dynamic content', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for live regions
    const liveRegions = await page.locator('[aria-live], [role="alert"], [role="status"]').all();
    expect(liveRegions.length).toBeGreaterThan(0);
  });

  test('should have proper aria-expanded for expandable elements', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const expandableElements = await page.locator('[aria-expanded]').all();

    for (const element of expandableElements) {
      const expanded = await element.getAttribute('aria-expanded');
      expect(['true', 'false'].includes(expanded || '')).toBeTruthy();
    }
  });
});
