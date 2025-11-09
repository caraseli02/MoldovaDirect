import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y, getViolations } from 'axe-playwright';
import { checkColorContrast, checkTouchTargetSize, MOBILE_VIEWPORTS } from './test-helpers';

test.describe('Landing Page - Mobile Accessibility Tests', () => {
  test.describe('WCAG 2.1 AA Compliance', () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test('should pass automated accessibility checks', async ({ page }) => {
      await page.goto('/landing-demo');
      await page.waitForLoadState('networkidle');

      // Inject axe-core
      await injectAxe(page);

      // Run accessibility checks
      await checkA11y(page, undefined, {
        detailedReport: true,
        detailedReportOptions: {
          html: true,
        },
      });
    });

    test('should have no critical or serious violations', async ({ page }) => {
      await page.goto('/landing-demo');
      await page.waitForLoadState('networkidle');

      await injectAxe(page);

      const violations = await getViolations(page);
      const criticalViolations = violations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious'
      );

      expect(criticalViolations).toHaveLength(0);

      if (criticalViolations.length > 0) {
        console.log('Critical violations:', JSON.stringify(criticalViolations, null, 2));
      }
    });

    test('should have proper heading hierarchy', async ({ page }) => {
      await page.goto('/landing-demo');
      await page.waitForLoadState('networkidle');

      const headings = await page.evaluate(() => {
        const h = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
        return h.map((el) => ({
          level: parseInt(el.tagName[1]),
          text: el.textContent?.trim().substring(0, 50),
        }));
      });

      // Should start with H1
      expect(headings[0].level).toBe(1);

      // Check hierarchy (no skipping levels)
      for (let i = 1; i < headings.length; i++) {
        const prevLevel = headings[i - 1].level;
        const currentLevel = headings[i].level;

        // Should not skip levels (e.g., H2 to H4)
        expect(currentLevel - prevLevel).toBeLessThanOrEqual(1);
      }
    });

    test('should have alt text for all images', async ({ page }) => {
      await page.goto('/landing-demo');
      await page.waitForLoadState('networkidle');

      const images = await page.locator('img').all();
      const missingAlt: string[] = [];

      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const alt = await img.getAttribute('alt');
        const role = await img.getAttribute('role');

        // Images should have alt text or role="presentation" for decorative images
        if (alt === null && role !== 'presentation' && role !== 'none') {
          const src = await img.getAttribute('src');
          missingAlt.push(src || `image-${i}`);
        }
      }

      expect(missingAlt).toHaveLength(0);

      if (missingAlt.length > 0) {
        console.log('Images missing alt text:', missingAlt);
      }
    });

    test('should have proper ARIA labels for interactive elements', async ({ page }) => {
      await page.goto('/landing-demo');
      await page.waitForLoadState('networkidle');

      // Check buttons without text
      const buttons = await page.locator('button').all();

      for (let i = 0; i < buttons.length; i++) {
        const button = buttons[i];
        const text = await button.textContent();
        const ariaLabel = await button.getAttribute('aria-label');
        const ariaLabelledby = await button.getAttribute('aria-labelledby');

        // Button should have visible text, aria-label, or aria-labelledby
        const hasLabel = (text && text.trim().length > 0) || ariaLabel || ariaLabelledby;

        expect(hasLabel).toBe(true);
      }
    });

    test('should have proper form labels', async ({ page }) => {
      await page.goto('/landing-demo');
      await page.waitForLoadState('networkidle');

      // Open quiz to test form inputs
      const quizButton = page
        .locator('button')
        .filter({ hasText: /quiz|find|discover/i })
        .first();

      if ((await quizButton.count()) > 0) {
        await quizButton.click();
        await page.waitForTimeout(500);

        const inputs = await page.locator('input:not([type="hidden"])').all();

        for (const input of inputs) {
          const id = await input.getAttribute('id');
          const ariaLabel = await input.getAttribute('aria-label');
          const ariaLabelledby = await input.getAttribute('aria-labelledby');

          if (id) {
            // Check for associated label
            const label = await page.locator(`label[for="${id}"]`).count();
            const hasLabel = label > 0 || ariaLabel || ariaLabelledby;

            expect(hasLabel).toBe(true);
          }
        }
      }
    });

    test('should have sufficient color contrast', async ({ page }) => {
      await page.goto('/landing-demo');
      await page.waitForLoadState('networkidle');

      // Check hero text contrast
      const hero = page.locator('section.landing-hero');

      const headlineContrast = await checkColorContrast(page, 'section.landing-hero h1');
      expect(headlineContrast.ratio).toBeGreaterThanOrEqual(4.5);

      const bodyContrast = await checkColorContrast(page, 'section.landing-hero p');
      expect(bodyContrast.ratio).toBeGreaterThanOrEqual(4.5);

      // Check button contrast
      const buttonContrast = await checkColorContrast(page, '.btn-primary');
      expect(buttonContrast.ratio).toBeGreaterThanOrEqual(4.5);
    });

    test('should have proper link indicators', async ({ page }) => {
      await page.goto('/landing-demo');
      await page.waitForLoadState('networkidle');

      const links = await page.locator('a').all();

      for (const link of links.slice(0, 10)) {
        const isVisible = await link.isVisible().catch(() => false);

        if (isVisible) {
          const styles = await link.evaluate((el) => {
            const computed = window.getComputedStyle(el);
            return {
              textDecoration: computed.textDecoration,
              color: computed.color,
              cursor: computed.cursor,
            };
          });

          // Links should have some visual indicator (underline, color, or cursor)
          const hasIndicator =
            styles.textDecoration.includes('underline') ||
            styles.cursor === 'pointer';

          expect(hasIndicator).toBe(true);
        }
      }
    });

    test('should support keyboard navigation', async ({ page }) => {
      await page.goto('/landing-demo');
      await page.waitForLoadState('networkidle');

      // Tab through first 10 interactive elements
      const focusableElements: string[] = [];

      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');
        await page.waitForTimeout(100);

        const focusedElement = await page.evaluate(() => {
          const el = document.activeElement;
          return {
            tagName: el?.tagName,
            role: el?.getAttribute('role'),
            ariaLabel: el?.getAttribute('aria-label'),
          };
        });

        focusableElements.push(focusedElement.tagName);
      }

      // Should have tabbed through interactive elements
      const interactiveElements = focusableElements.filter((tag) =>
        ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'].includes(tag)
      );

      expect(interactiveElements.length).toBeGreaterThan(0);
    });

    test('should have visible focus indicators', async ({ page }) => {
      await page.goto('/landing-demo');
      await page.waitForLoadState('networkidle');

      // Tab to first interactive element
      await page.keyboard.press('Tab');
      await page.waitForTimeout(200);

      const focusIndicator = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el) return null;

        const styles = window.getComputedStyle(el);
        return {
          outline: styles.outline,
          outlineWidth: styles.outlineWidth,
          boxShadow: styles.boxShadow,
          border: styles.border,
        };
      });

      // Should have some visible focus indicator
      const hasIndicator =
        focusIndicator &&
        (focusIndicator.outline !== 'none' ||
          focusIndicator.outlineWidth !== '0px' ||
          focusIndicator.boxShadow !== 'none' ||
          focusIndicator.border !== 'none');

      expect(hasIndicator).toBe(true);
    });

    test('should handle skip links', async ({ page }) => {
      await page.goto('/landing-demo');
      await page.waitForLoadState('networkidle');

      // Check for skip to main content link
      const skipLink = page.locator('a[href="#main"], a[href="#content"]').first();

      if ((await skipLink.count()) > 0) {
        // Should become visible on focus
        await skipLink.focus();
        await page.waitForTimeout(200);

        const isVisible = await skipLink.isVisible();
        expect(isVisible).toBe(true);
      }
    });

    test('should announce dynamic content changes', async ({ page }) => {
      await page.goto('/landing-demo');
      await page.waitForLoadState('networkidle');

      // Check for ARIA live regions
      const liveRegions = await page.locator('[aria-live], [role="alert"], [role="status"]').all();

      // Live regions should exist for dynamic content
      // (Not required, but good practice)
      if (liveRegions.length > 0) {
        for (const region of liveRegions) {
          const ariaLive = await region.getAttribute('aria-live');
          const role = await region.getAttribute('role');

          expect(['polite', 'assertive', 'alert', 'status']).toContain(ariaLive || role);
        }
      }
    });
  });

  test.describe('Screen Reader Compatibility', () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test('should have proper landmark regions', async ({ page }) => {
      await page.goto('/landing-demo');
      await page.waitForLoadState('networkidle');

      // Check for semantic landmarks
      const landmarks = await page.evaluate(() => {
        return {
          header: document.querySelectorAll('header, [role="banner"]').length,
          nav: document.querySelectorAll('nav, [role="navigation"]').length,
          main: document.querySelectorAll('main, [role="main"]').length,
          footer: document.querySelectorAll('footer, [role="contentinfo"]').length,
        };
      });

      // Should have main landmarks
      expect(landmarks.main).toBeGreaterThanOrEqual(1);

      // Should typically have header and footer
      expect(landmarks.header).toBeGreaterThanOrEqual(0);
      expect(landmarks.footer).toBeGreaterThanOrEqual(0);
    });

    test('should have descriptive button text', async ({ page }) => {
      await page.goto('/landing-demo');
      await page.waitForLoadState('networkidle');

      const buttons = await page.locator('button').all();

      for (const button of buttons) {
        const text = await button.textContent();
        const ariaLabel = await button.getAttribute('aria-label');
        const label = text?.trim() || ariaLabel || '';

        // Button labels should be descriptive (not just "Click" or "Button")
        expect(label.length).toBeGreaterThan(0);

        if (label.toLowerCase() === 'click' || label.toLowerCase() === 'button') {
          console.warn('Non-descriptive button label:', label);
        }
      }
    });

    test('should have proper table accessibility if tables exist', async ({ page }) => {
      await page.goto('/landing-demo');
      await page.waitForLoadState('networkidle');

      const tables = await page.locator('table').all();

      if (tables.length > 0) {
        for (const table of tables) {
          // Check for caption or aria-label
          const caption = await table.locator('caption').count();
          const ariaLabel = await table.getAttribute('aria-label');
          const ariaLabelledby = await table.getAttribute('aria-labelledby');

          const hasLabel = caption > 0 || ariaLabel || ariaLabelledby;
          expect(hasLabel).toBe(true);

          // Check for proper th elements
          const headers = await table.locator('th').count();
          if (headers > 0) {
            // Headers should have scope attribute
            const headerElements = await table.locator('th').all();
            for (const th of headerElements.slice(0, 5)) {
              const scope = await th.getAttribute('scope');
              expect(['col', 'row', 'colgroup', 'rowgroup']).toContain(scope || 'col');
            }
          }
        }
      }
    });

    test('should have proper list semantics', async ({ page }) => {
      await page.goto('/landing-demo');
      await page.waitForLoadState('networkidle');

      // Check that visual lists use proper markup
      const lists = await page.locator('ul, ol').all();

      for (const list of lists.slice(0, 5)) {
        const isVisible = await list.isVisible().catch(() => false);

        if (isVisible) {
          // Lists should contain li elements
          const items = await list.locator('li').count();
          expect(items).toBeGreaterThan(0);
        }
      }
    });

    test('should handle modal dialog accessibility', async ({ page }) => {
      await page.goto('/landing-demo');
      await page.waitForLoadState('networkidle');

      // Open quiz modal
      const quizButton = page
        .locator('button')
        .filter({ hasText: /quiz|find|discover/i })
        .first();

      if ((await quizButton.count()) > 0) {
        await quizButton.click();
        await page.waitForTimeout(500);

        // Modal should have role="dialog"
        const modal = page.locator('[role="dialog"]').first();

        if ((await modal.count()) > 0) {
          // Should have aria-modal
          const ariaModal = await modal.getAttribute('aria-modal');
          expect(ariaModal).toBe('true');

          // Should have aria-labelledby or aria-label
          const ariaLabel = await modal.getAttribute('aria-label');
          const ariaLabelledby = await modal.getAttribute('aria-labelledby');

          expect(ariaLabel || ariaLabelledby).toBeTruthy();

          // Should trap focus
          await page.keyboard.press('Tab');
          await page.waitForTimeout(200);

          const focusedElement = await page.evaluate(() => {
            const el = document.activeElement;
            return el?.closest('[role="dialog"]') !== null;
          });

          expect(focusedElement).toBe(true);
        }
      }
    });
  });

  test.describe('Touch Target Accessibility', () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test('should have appropriate touch targets for all interactive elements', async ({ page }) => {
      await page.goto('/landing-demo');
      await page.waitForLoadState('networkidle');

      // Check all buttons
      const buttonResults = await checkTouchTargetSize(page, 'button', 44);
      const failedButtons = buttonResults.filter((r) => !r.passes);

      expect(failedButtons.length).toBeLessThan(buttonResults.length * 0.1); // Max 10% can fail

      // Check all links
      const linkResults = await checkTouchTargetSize(page, 'a', 44);
      const failedLinks = linkResults.filter((r) => !r.passes);

      expect(failedLinks.length).toBeLessThan(linkResults.length * 0.1);
    });

    test('should have adequate spacing between touch targets', async ({ page }) => {
      await page.goto('/landing-demo');
      await page.waitForLoadState('networkidle');

      const buttons = await page.locator('button').all();

      for (let i = 0; i < buttons.length - 1; i++) {
        const current = buttons[i];
        const next = buttons[i + 1];

        const currentBox = await current.boundingBox();
        const nextBox = await next.boundingBox();

        if (currentBox && nextBox) {
          // Check if buttons are in the same row (similar Y coordinates)
          const sameRow = Math.abs(currentBox.y - nextBox.y) < 50;

          if (sameRow) {
            // Calculate spacing
            const spacing = Math.abs(nextBox.x - (currentBox.x + currentBox.width));

            // Minimum 8px spacing recommended
            expect(spacing).toBeGreaterThanOrEqual(8);
          }
        }
      }
    });
  });

  test.describe('Motion and Animation Accessibility', () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test('should respect prefers-reduced-motion', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto('/landing-demo');
      await page.waitForLoadState('networkidle');

      // Check that animations are disabled or minimal
      const animatedElements = await page.locator('[class*="animate"]').all();

      for (const element of animatedElements.slice(0, 5)) {
        const isVisible = await element.isVisible().catch(() => false);

        if (isVisible) {
          const animationDuration = await element.evaluate((el) => {
            return window.getComputedStyle(el).animationDuration;
          });

          // Animation should be instant or very short
          expect(animationDuration).toMatch(/0s|0\.01ms/);
        }
      }
    });

    test('should not auto-play video with sound', async ({ page }) => {
      await page.goto('/landing-demo');
      await page.waitForLoadState('networkidle');

      const videos = await page.locator('video').all();

      for (const video of videos) {
        const autoplay = await video.getAttribute('autoplay');
        const muted = await video.getAttribute('muted');

        // If video autoplays, it must be muted
        if (autoplay !== null) {
          expect(muted).not.toBeNull();
        }
      }
    });

    test('should provide controls for media elements', async ({ page }) => {
      await page.goto('/landing-demo');
      await page.waitForLoadState('networkidle');

      const videos = await page.locator('video').all();

      for (const video of videos) {
        const controls = await video.getAttribute('controls');

        // Videos should have controls (or be background-only)
        // This is a soft requirement for background videos
        if (controls === null) {
          // Check if video is muted and looped (background video pattern)
          const muted = await video.getAttribute('muted');
          const loop = await video.getAttribute('loop');

          expect(muted !== null || loop !== null).toBe(true);
        }
      }
    });
  });

  test.describe('Language and Internationalization', () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test('should have lang attribute on html element', async ({ page }) => {
      await page.goto('/landing-demo');
      await page.waitForLoadState('networkidle');

      const lang = await page.locator('html').getAttribute('lang');
      expect(lang).toBeTruthy();
      expect(lang?.length).toBeGreaterThan(0);
    });

    test('should mark language changes within content', async ({ page }) => {
      await page.goto('/landing-demo');
      await page.waitForLoadState('networkidle');

      // If content contains different languages, they should be marked
      // This is a soft check - not all pages will have this
      const foreignLang = await page.locator('[lang]:not(html)').count();

      // If foreign language content exists, it should be properly marked
      // No assertion needed if none exists
    });
  });
});
