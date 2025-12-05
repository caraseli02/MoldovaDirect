import { test, expect } from '@playwright/test'

test('first product card opens a detail page', async ({ page }) => {
  await page.goto('/products')
  const firstCard = page.locator('[data-testid^="product-card"], [class*="product"], article').first()
  await expect(firstCard).toBeVisible()
  await firstCard.click()
  await expect(page).toHaveURL(/products\//i)
  await expect(page.locator('body')).toBeVisible()
})
