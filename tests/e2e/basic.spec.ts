import { test, expect } from '@playwright/test'

test.describe('Basic Tests', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/')
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Check that we get a successful page load
    await expect(page).toHaveTitle(/Moldova Direct/)
    
    // Check for basic page elements
    const body = page.locator('body')
    await expect(body).toBeVisible()
  })

  test('should navigate to different pages', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Check that navigation works
    await page.goto('/products')
    await expect(page).toHaveURL(/\/products/)
    
    await page.goto('/about')
    await expect(page).toHaveURL(/\/about/)
  })

  test('should handle locale switching', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Check default locale (Spanish)
    await expect(page).toHaveURL(/^http:\/\/localhost:3000\/$/)
    
    // Navigate to English version
    await page.goto('/en')
    await expect(page).toHaveURL(/\/en/)
  })
})