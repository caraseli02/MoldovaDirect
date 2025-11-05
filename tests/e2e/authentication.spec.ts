import { test, expect } from '../fixtures/base'

test.describe('User Authentication', () => {
  test('user can view login page', async ({ page, locale }) => {
    await page.goto(`/${locale}`)

    // Click login link
    await page.click('[data-testid="login-link"], a[href*="login"], button:has-text("Login"), button:has-text("Iniciar")')

    // Verify login form is visible
    await expect(page.locator('[data-testid="login-form"], form, input[type="email"]')).toBeVisible()
  })

  test('user can navigate to signup page', async ({ page, locale }) => {
    await page.goto(`/${locale}/login`)

    // Click signup link
    await page.click('[data-testid="signup-link"], a:has-text("Sign up"), a:has-text("Registrarse")')

    // Verify on signup page
    await expect(page).toHaveURL(new RegExp(`/${locale}/(signup|register)`))
  })

  test('login form validates empty fields', async ({ page, locale }) => {
    await page.goto(`/${locale}/login`)

    // Try to submit empty form
    await page.click('[data-testid="login-submit"], button[type="submit"]')

    // Should show validation errors
    await expect(page.locator('[data-testid="error-message"], .error, .alert')).toBeVisible()
  })

  test('authenticated user can access account page', async ({ authenticatedPage: page, locale }) => {
    // Navigate to account
    await page.goto(`/${locale}`)
    await page.click('[data-testid="account-link"], a[href*="account"], button:has-text("Account")')

    // Verify on account page
    await expect(page).toHaveURL(new RegExp(`/${locale}/(account|profile)`))
  })

  test('user can logout', async ({ authenticatedPage: page, locale }) => {
    await page.goto(`/${locale}`)

    // Click logout
    await page.click('[data-testid="logout-button"], button:has-text("Logout"), button:has-text("Cerrar")')

    // Verify logged out (login link should be visible again)
    await expect(page.locator('[data-testid="login-link"], a[href*="login"]')).toBeVisible()
  })
})
