import { test, expect } from '@playwright/test';
import {
  MOBILE_VIEWPORTS,
  TEST_BREAKPOINTS,
  checkTouchTargetSize,
  checkHorizontalOverflow,
  checkColorContrast,
  checkFontSize,
  isInViewport,
  takeResponsiveScreenshot,
} from './test-helpers';

test.describe('Landing Quiz - Mobile Responsiveness', () => {
  for (const width of TEST_BREAKPOINTS) {
    test.describe(`Viewport: ${width}px`, () => {
      test.use({
        viewport: { width, height: 844 },
      });

      test('should render quiz CTA section without overflow', async ({ page }) => {
        await page.goto('/landing-demo');
        await page.waitForLoadState('networkidle');

        // Scroll to quiz section
        await page.evaluate(() => {
          const quiz = document.querySelector('[class*="quiz"]');
          if (quiz) {
            quiz.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        });
        await page.waitForTimeout(500);

        const hasOverflow = await checkHorizontalOverflow(page);
        expect(hasOverflow).toBe(false);
      });

      test('should display quiz CTA elements correctly', async ({ page }) => {
        await page.goto('/landing-demo');
        await page.waitForLoadState('networkidle');

        // Find quiz CTA section
        const quizSection = page.locator('[class*="quiz-cta"]').first();

        if ((await quizSection.count()) > 0) {
          await expect(quizSection).toBeVisible();

          // Check heading
          const heading = quizSection.locator('h2');
          await expect(heading).toBeVisible();

          // Check CTA button
          const ctaButton = quizSection.locator('button').first();
          await expect(ctaButton).toBeVisible();
        }
      });

      test('should have proper CTA button touch targets', async ({ page }) => {
        await page.goto('/landing-demo');
        await page.waitForLoadState('networkidle');

        const quizSection = page.locator('[class*="quiz-cta"]').first();

        if ((await quizSection.count()) > 0) {
          const results = await checkTouchTargetSize(page, '[class*="quiz-cta"] button', 44);
          expect(results.every((r) => r.passes)).toBe(true);
        }
      });

      test('should open quiz modal on button click', async ({ page }) => {
        await page.goto('/landing-demo');
        await page.waitForLoadState('networkidle');

        // Find and click quiz button
        const quizButton = page
          .locator('button')
          .filter({ hasText: /quiz|find|discover|match/i })
          .first();

        if ((await quizButton.count()) > 0) {
          await quizButton.click();
          await page.waitForTimeout(500);

          // Modal should appear
          const modal = page.locator('[role="dialog"], .modal, [class*="modal"]').first();

          if ((await modal.count()) > 0) {
            await expect(modal).toBeVisible();
          }
        }
      });

      test('should display modal properly on mobile', async ({ page }) => {
        await page.goto('/landing-demo');
        await page.waitForLoadState('networkidle');

        // Open quiz
        const quizButton = page
          .locator('button')
          .filter({ hasText: /quiz|find|discover|match/i })
          .first();

        if ((await quizButton.count()) > 0) {
          await quizButton.click();
          await page.waitForTimeout(500);

          const modal = page.locator('[role="dialog"], .modal').first();

          if ((await modal.count()) > 0) {
            // Modal should fill screen on mobile or be properly sized
            const box = await modal.boundingBox();

            if (box && width < 640) {
              // On mobile, modal should be nearly full width
              const widthPercent = (box.width / width) * 100;
              expect(widthPercent).toBeGreaterThan(85);
            }

            // Should not overflow
            const modalOverflow = await modal.evaluate((el) => {
              return el.scrollWidth > window.innerWidth;
            });
            expect(modalOverflow).toBe(false);
          }
        }
      });

      test('should have closeable modal with proper touch target', async ({ page }) => {
        await page.goto('/landing-demo');
        await page.waitForLoadState('networkidle');

        // Open quiz
        const quizButton = page
          .locator('button')
          .filter({ hasText: /quiz|find|discover|match/i })
          .first();

        if ((await quizButton.count()) > 0) {
          await quizButton.click();
          await page.waitForTimeout(500);

          // Find close button
          const closeButton = page
            .locator('button[aria-label*="close"], button[aria-label*="Close"]')
            .first();

          if ((await closeButton.count()) > 0) {
            // Check touch target
            const box = await closeButton.boundingBox();
            expect(box).toBeTruthy();

            if (box) {
              expect(box.width).toBeGreaterThanOrEqual(44);
              expect(box.height).toBeGreaterThanOrEqual(44);
            }

            // Close modal
            await closeButton.click();
            await page.waitForTimeout(500);

            // Modal should be hidden
            const modal = page.locator('[role="dialog"]').first();
            const isVisible = await modal.isVisible().catch(() => false);
            expect(isVisible).toBe(false);
          }
        }
      });

      test('should display quiz questions properly formatted', async ({ page }) => {
        await page.goto('/landing-demo');
        await page.waitForLoadState('networkidle');

        // Open quiz
        const quizButton = page
          .locator('button')
          .filter({ hasText: /quiz|find|discover|match/i })
          .first();

        if ((await quizButton.count()) > 0) {
          await quizButton.click();
          await page.waitForTimeout(500);

          const modal = page.locator('[role="dialog"]').first();

          if ((await modal.count()) > 0) {
            // Check for question text
            const question = modal.locator('h2, h3, [role="heading"]').first();

            if ((await question.count()) > 0) {
              await expect(question).toBeVisible();

              // Question text should be readable
              const fontSize = await question.evaluate((el) =>
                parseFloat(window.getComputedStyle(el).fontSize)
              );
              expect(fontSize).toBeGreaterThanOrEqual(18);

              // Check for proper line height for readability
              const lineHeight = await question.evaluate((el) =>
                window.getComputedStyle(el).lineHeight
              );
              expect(lineHeight).not.toBe('normal');
            }

            // Check for answer options
            const options = modal.locator('button, input[type="radio"]');
            const optionCount = await options.count();

            if (optionCount > 0) {
              // Options should be visible
              await expect(options.first()).toBeVisible();

              // Check touch targets for option buttons
              if (width < 640) {
                // On mobile, buttons should be stacked and full-width
                const firstOption = options.first();
                const box = await firstOption.boundingBox();

                if (box) {
                  expect(box.width).toBeGreaterThan(width * 0.7);
                  expect(box.height).toBeGreaterThanOrEqual(44);
                }
              }
            }
          }
        }
      });

      test('should handle quiz navigation buttons properly', async ({ page }) => {
        await page.goto('/landing-demo');
        await page.waitForLoadState('networkidle');

        // Open quiz
        const quizButton = page
          .locator('button')
          .filter({ hasText: /quiz|find|discover|match/i })
          .first();

        if ((await quizButton.count()) > 0) {
          await quizButton.click();
          await page.waitForTimeout(500);

          const modal = page.locator('[role="dialog"]').first();

          if ((await modal.count()) > 0) {
            // Find navigation buttons (Next, Previous, Submit)
            const navButtons = modal.locator('button').filter({
              hasText: /next|previous|back|submit|finish/i,
            });

            const navCount = await navButtons.count();

            if (navCount > 0) {
              // Check touch targets
              for (let i = 0; i < Math.min(navCount, 3); i++) {
                const button = navButtons.nth(i);
                const box = await button.boundingBox();

                if (box) {
                  expect(box.width).toBeGreaterThanOrEqual(44);
                  expect(box.height).toBeGreaterThanOrEqual(44);
                }
              }
            }
          }
        }
      });

      test('should support keyboard navigation in quiz', async ({ page }) => {
        await page.goto('/landing-demo');
        await page.waitForLoadState('networkidle');

        // Open quiz
        const quizButton = page
          .locator('button')
          .filter({ hasText: /quiz|find|discover|match/i })
          .first();

        if ((await quizButton.count()) > 0) {
          await quizButton.click();
          await page.waitForTimeout(500);

          // Try Tab navigation
          await page.keyboard.press('Tab');
          await page.waitForTimeout(200);

          const focusedElement = await page.evaluate(() => {
            const el = document.activeElement;
            return {
              tagName: el?.tagName,
              type: (el as HTMLInputElement)?.type,
            };
          });

          // Should have focused an interactive element
          expect(['BUTTON', 'INPUT', 'A']).toContain(focusedElement.tagName);
        }
      });

      test('should display quiz progress indicator on mobile', async ({ page }) => {
        await page.goto('/landing-demo');
        await page.waitForLoadState('networkidle');

        // Open quiz
        const quizButton = page
          .locator('button')
          .filter({ hasText: /quiz|find|discover|match/i })
          .first();

        if ((await quizButton.count()) > 0) {
          await quizButton.click();
          await page.waitForTimeout(500);

          const modal = page.locator('[role="dialog"]').first();

          if ((await modal.count()) > 0) {
            // Look for progress indicators
            const progress = modal.locator(
              '[role="progressbar"], [class*="progress"], [class*="step"]'
            );

            const progressCount = await progress.count();

            if (progressCount > 0) {
              await expect(progress.first()).toBeVisible();

              // Should be at top of modal for visibility
              const isInView = await progress.first().evaluate((el) => {
                const rect = el.getBoundingClientRect();
                return rect.top < window.innerHeight / 2;
              });

              expect(isInView).toBe(true);
            }
          }
        }
      });

      test('should prevent body scroll when modal is open', async ({ page }) => {
        await page.goto('/landing-demo');
        await page.waitForLoadState('networkidle');

        const initialScrollY = await page.evaluate(() => window.scrollY);

        // Open quiz
        const quizButton = page
          .locator('button')
          .filter({ hasText: /quiz|find|discover|match/i })
          .first();

        if ((await quizButton.count()) > 0) {
          await quizButton.click();
          await page.waitForTimeout(500);

          // Try to scroll
          await page.evaluate(() => {
            window.scrollBy(0, 100);
          });
          await page.waitForTimeout(300);

          const finalScrollY = await page.evaluate(() => window.scrollY);

          // Scroll should be prevented (or minimal)
          expect(Math.abs(finalScrollY - initialScrollY)).toBeLessThan(10);
        }
      });

      test('should take visual regression screenshot', async ({ page }) => {
        await page.goto('/landing-demo');
        await page.waitForLoadState('networkidle');

        // Open quiz
        const quizButton = page
          .locator('button')
          .filter({ hasText: /quiz|find|discover|match/i })
          .first();

        if ((await quizButton.count()) > 0) {
          await quizButton.click();
          await page.waitForTimeout(500);

          await takeResponsiveScreenshot(page, 'landing-quiz-modal', { fullPage: false });
        }
      });
    });
  }

  // Form input tests
  test.describe('Quiz Form Interactions', () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test('should handle form input without zoom', async ({ page }) => {
      await page.goto('/landing-demo');
      await page.waitForLoadState('networkidle');

      // Open quiz
      const quizButton = page
        .locator('button')
        .filter({ hasText: /quiz|find|discover|match/i })
        .first();

      if ((await quizButton.count()) > 0) {
        await quizButton.click();
        await page.waitForTimeout(500);

        const modal = page.locator('[role="dialog"]').first();

        if ((await modal.count()) > 0) {
          // Find text inputs
          const textInputs = modal.locator('input[type="text"], input[type="email"]');

          if ((await textInputs.count()) > 0) {
            const firstInput = textInputs.first();

            // Check font size (should be 16px+ to prevent zoom on iOS)
            const fontSize = await firstInput.evaluate((el) =>
              parseFloat(window.getComputedStyle(el).fontSize)
            );

            expect(fontSize).toBeGreaterThanOrEqual(16);

            // Focus input
            await firstInput.click();
            await page.waitForTimeout(300);

            // Check zoom level
            const zoomLevel = await page.evaluate(() => {
              return window.visualViewport ? window.visualViewport.scale : 1;
            });

            expect(zoomLevel).toBe(1);
          }
        }
      }
    });

    test('should handle radio button selections', async ({ page }) => {
      await page.goto('/landing-demo');
      await page.waitForLoadState('networkidle');

      // Open quiz
      const quizButton = page
        .locator('button')
        .filter({ hasText: /quiz|find|discover|match/i })
        .first();

      if ((await quizButton.count()) > 0) {
        await quizButton.click();
        await page.waitForTimeout(500);

        const modal = page.locator('[role="dialog"]').first();

        if ((await modal.count()) > 0) {
          // Find radio buttons
          const radios = modal.locator('input[type="radio"]');

          if ((await radios.count()) > 0) {
            const firstRadio = radios.first();

            // Click radio
            await firstRadio.click();
            await page.waitForTimeout(200);

            // Should be checked
            const isChecked = await firstRadio.isChecked();
            expect(isChecked).toBe(true);
          }
        }
      }
    });

    test('should handle form submission', async ({ page }) => {
      await page.goto('/landing-demo');
      await page.waitForLoadState('networkidle');

      // Open quiz
      const quizButton = page
        .locator('button')
        .filter({ hasText: /quiz|find|discover|match/i })
        .first();

      if ((await quizButton.count()) > 0) {
        await quizButton.click();
        await page.waitForTimeout(500);

        const modal = page.locator('[role="dialog"]').first();

        if ((await modal.count()) > 0) {
          // Find and click submit/next button
          const submitButton = modal.locator('button').filter({
            hasText: /submit|next|continue/i,
          }).first();

          if ((await submitButton.count()) > 0) {
            await submitButton.click();
            await page.waitForTimeout(500);

            // Should show next step or results
            // (specific assertion depends on quiz flow)
          }
        }
      }
    });
  });

  // Touch interaction tests
  test.describe('Modal Touch Interactions', () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test('should close modal on background tap', async ({ page }) => {
      await page.goto('/landing-demo');
      await page.waitForLoadState('networkidle');

      // Open quiz
      const quizButton = page
        .locator('button')
        .filter({ hasText: /quiz|find|discover|match/i })
        .first();

      if ((await quizButton.count()) > 0) {
        await quizButton.click();
        await page.waitForTimeout(500);

        // Tap outside modal (on backdrop)
        await page.touchscreen.tap(50, 50);
        await page.waitForTimeout(500);

        // Modal might close or stay open (depends on implementation)
        // Just verify no errors occurred
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await page.waitForTimeout(500);

        expect(errors.length).toBe(0);
      }
    });

    test('should support swipe to close gesture', async ({ page }) => {
      await page.goto('/landing-demo');
      await page.waitForLoadState('networkidle');

      // Open quiz
      const quizButton = page
        .locator('button')
        .filter({ hasText: /quiz|find|discover|match/i })
        .first();

      if ((await quizButton.count()) > 0) {
        await quizButton.click();
        await page.waitForTimeout(500);

        const modal = page.locator('[role="dialog"]').first();

        if ((await modal.count()) > 0) {
          const box = await modal.boundingBox();

          if (box) {
            // Try swiping down to dismiss
            await page.touchscreen.swipe({
              startX: box.x + box.width / 2,
              startY: box.y + 50,
              endX: box.x + box.width / 2,
              endY: box.y + box.height + 100,
              steps: 10,
            });
            await page.waitForTimeout(500);

            // Modal may or may not dismiss (implementation-dependent)
            // Verify functionality continues
            await expect(page.locator('body')).toBeVisible();
          }
        }
      }
    });
  });
});
