import { test, expect } from '@playwright/test'

test.describe('Landing hero video', () => {
  test('shows autoplaying video on desktop with sources and poster', async ({ page }) => {
    await page.goto('/')

    const video = page.locator('video').first()
    await expect(video).toBeVisible()
    await expect(video).toHaveAttribute('muted', /.*?/i)
    await expect(video).toHaveAttribute('autoplay', /.*?/i)
    await expect(video).toHaveAttribute('loop', /.*?/i)

    const webmSource = video.locator('source[type="video/webm"]')
    const mp4Source = video.locator('source[type="video/mp4"]')
    await expect(webmSource).toHaveAttribute('src', /hero-\d+\.webm/)
    await expect(mp4Source).toHaveAttribute('src', /hero-\d+\.mp4/)
    await expect(video).toHaveAttribute('poster', /hero-\d+-poster\.jpg/)
  })

  test.describe('mobile experience', () => {
    test.use({
      viewport: { width: 430, height: 900 },
    })

    test('falls back to non-video hero on mobile', async ({ page }) => {
      await page.goto('/')
      await expect(page.locator('video')).toHaveCount(0)
    })
  })
})
