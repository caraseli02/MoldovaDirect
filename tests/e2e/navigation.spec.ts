import { test, expect } from '@playwright/test'

test('navigation to products page works', async ({ page }) => {
  await page.goto('/')
  const productsLink = page.getByRole('link', { name: /products|shop/i })
  await expect(productsLink).toBeVisible()
  await productsLink.click()
  await expect(page).toHaveURL(/products/i)
})
