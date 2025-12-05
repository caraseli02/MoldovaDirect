import { test, expect } from '@playwright/test'

test('homepage loads key content', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL(/\/?$/)
  await expect(page.locator('body')).toBeVisible()
})
