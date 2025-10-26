import { test, expect } from '@playwright/test'

test.describe('Admin Orders - Debug', () => {
  test('should load admin orders page', async ({ page }) => {
    await page.goto('/admin/orders')
    await page.waitForLoadState('networkidle')
    
    // Take a screenshot
    await page.screenshot({ path: 'test-results/admin-orders-debug.png', fullPage: true })
    
    // Get page title
    const title = await page.title()
    console.log('Page title:', title)
    
    // Get page content
    const content = await page.content()
    console.log('Page has content:', content.length, 'characters')
    
    // Check for h1
    const h1 = await page.locator('h1').textContent().catch(() => 'No h1 found')
    console.log('H1 text:', h1)
    
    // Check for any text
    const bodyText = await page.locator('body').textContent()
    console.log('Body text (first 500 chars):', bodyText?.substring(0, 500))
    
    // Check URL
    console.log('Current URL:', page.url())
  })
})
