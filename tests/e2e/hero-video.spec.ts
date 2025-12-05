import { test, expect } from '@playwright/test'

test.describe('Landing hero video', () => {
  test('shows autoplaying video on desktop with sources and poster', async ({ page }) => {
    await page.goto('/')

    const video = page.locator('video').first()
    await expect(video).toBeVisible()
    await expect(video).toHaveJSProperty('muted', true)
    await expect(video).toHaveJSProperty('autoplay', true)
    await expect(video).toHaveJSProperty('loop', false)

    const webmSource = video.locator('source[type="video/webm"]')
    const mp4Source = video.locator('source[type="video/mp4"]')
    await expect(webmSource).toHaveAttribute('src', /hero-\d+\.webm/)
    await expect(mp4Source).toHaveAttribute('src', /hero-\d+\.mp4/)
    await expect(video).toHaveAttribute('poster', /hero-\d+-poster\.jpg/)
  })

  test('falls back to poster when video fails to load', async ({ page }) => {
    await page.goto('/')

    const video = page.locator('video').first()
    await expect(video).toBeVisible()

    // Simulate a load error to trigger fallback
    await video.evaluate((el: HTMLVideoElement) => {
      el.dispatchEvent(new Event('error'))
    })

    await expect(page.locator('video')).toHaveCount(0)
    await expect(page.locator('img[src*=\"hero-\"][src*=\"-poster\"]')).toHaveCount(1)
  })

  test.describe('mobile experience', () => {
    test.use({
      viewport: { width: 430, height: 900 },
    })

    test('visual: desktop hero matches snapshot', async ({ page }) => {
      await page.goto('/')
      const hero = page.locator('section.relative.flex').first()
      await expect(hero).toBeVisible()

      // Mask video to avoid flakiness
      await expect(hero).toHaveScreenshot('desktop-hero.png', {
        mask: [page.locator('video')],
        maxDiffPixelRatio: 0.05
      })
    })

    test('falls back to poster/gradient (no video) on mobile', async ({ page }) => {
      await page.goto('/')
      const hero = page.locator('section.relative.flex').first()
      await expect(page.locator('video')).toHaveCount(0)
      await expect(page.locator('img[src*=\"hero-\"][src*=\"-poster\"]')).toHaveCount(1)

      await expect(hero).toHaveScreenshot('mobile-hero.png', {
        maxDiffPixelRatio: 0.05
      })
    })
  })
})
