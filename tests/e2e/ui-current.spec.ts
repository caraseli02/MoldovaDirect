import { test, expect } from '@playwright/test'

test.describe('Current UI Validation', () => {
  test('should capture current homepage layout @visual', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000) // Wait for any animations
    
    // Capture full homepage
    await expect(page).toHaveScreenshot('homepage-current-full.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })

  test('should capture homepage viewport @visual', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    
    // Capture just the viewport
    await expect(page).toHaveScreenshot('homepage-current-viewport.png', {
      animations: 'disabled',
    })
  })

  test('should capture about page @visual', async ({ page }) => {
    await page.goto('/about')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
    
    await expect(page).toHaveScreenshot('about-page-current.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })

  test('should capture products page @visual', async ({ page }) => {
    await page.goto('/products')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
    
    await expect(page).toHaveScreenshot('products-page-current.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })

  test('should capture login page @visual', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
    
    await expect(page).toHaveScreenshot('login-page-current.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })

  test('should capture mobile homepage @visual', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    
    await expect(page).toHaveScreenshot('homepage-mobile-current.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })

  test('should capture English homepage @visual', async ({ page }) => {
    await page.goto('/en')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    
    await expect(page).toHaveScreenshot('homepage-en-current.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })

  test('should capture Romanian homepage @visual', async ({ page }) => {
    await page.goto('/ro')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    
    await expect(page).toHaveScreenshot('homepage-ro-current.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })
})