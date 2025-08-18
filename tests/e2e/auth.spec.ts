import { test, expect } from '../fixtures/base'
import { AuthPage } from '../fixtures/pages'
import { TestHelpers } from '../fixtures/helpers'

test.describe('Authentication Flow', () => {
  let authPage: AuthPage
  let helpers: TestHelpers

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page)
    helpers = new TestHelpers(page)
  })

  test('should successfully register a new user', async ({ page, locale }) => {
    await authPage.gotoRegister()
    
    const uniqueEmail = `test-${Date.now()}@example.com`
    await authPage.register(uniqueEmail, 'Password123!', 'Test User')
    
    await page.waitForURL('**/dashboard')
    await helpers.checkHeading('Dashboard')
    
    const userMenu = page.locator('[data-testid="user-menu"]')
    await expect(userMenu).toContainText('Test User')
  })

  test('should successfully login with valid credentials', async ({ page, testUser }) => {
    await authPage.gotoLogin()
    await authPage.login(testUser.email, testUser.password)
    
    await page.waitForURL('**/dashboard')
    await helpers.checkHeading('Dashboard')
  })

  test('should show error with invalid credentials', async ({ page }) => {
    await authPage.gotoLogin()
    await authPage.login('invalid@example.com', 'wrongpassword')
    
    await expect(authPage.errorMessage).toBeVisible()
    await expect(authPage.errorMessage).toContainText('Invalid credentials')
  })

  test('should successfully logout', async ({ authenticatedPage }) => {
    await helpers.logout()
    
    await expect(authenticatedPage).toHaveURL('/')
    const loginButton = authenticatedPage.locator('[data-testid="login-link"]')
    await expect(loginButton).toBeVisible()
  })

  test('should redirect to login when accessing protected route', async ({ page }) => {
    await page.goto('/dashboard')
    
    await page.waitForURL('**/login')
    await expect(page.locator('[data-testid="redirect-message"]')).toContainText('Please login to continue')
  })

  test('should persist login across page refresh', async ({ page, testUser }) => {
    await authPage.gotoLogin()
    await authPage.login(testUser.email, testUser.password)
    await page.waitForURL('**/dashboard')
    
    await page.reload()
    
    await expect(page).toHaveURL('**/dashboard')
    const userMenu = page.locator('[data-testid="user-menu"]')
    await expect(userMenu).toBeVisible()
  })

  test('should handle password reset flow', async ({ page }) => {
    await authPage.gotoLogin()
    await authPage.forgotPasswordLink.click()
    
    await page.waitForURL('**/forgot-password')
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.click('[data-testid="reset-password-button"]')
    
    await helpers.checkToast('Password reset email sent')
  })

  test('should validate registration form fields', async ({ page }) => {
    await authPage.gotoRegister()
    
    await authPage.registerButton.click()
    
    const emailError = page.locator('[data-testid="email-error"]')
    const passwordError = page.locator('[data-testid="password-error"]')
    const nameError = page.locator('[data-testid="name-error"]')
    
    await expect(emailError).toContainText('Email is required')
    await expect(passwordError).toContainText('Password is required')
    await expect(nameError).toContainText('Name is required')
    
    await page.fill('[data-testid="email-input"]', 'invalid-email')
    await page.fill('[data-testid="password-input"]', '123')
    await authPage.registerButton.click()
    
    await expect(emailError).toContainText('Invalid email format')
    await expect(passwordError).toContainText('Password must be at least 8 characters')
  })

  test('should work with different locales', async ({ page, locale }) => {
    await authPage.gotoLogin()
    
    const loginButton = authPage.loginButton
    const expectedTexts = {
      es: 'Iniciar sesión',
      en: 'Login',
      ro: 'Autentificare',
      ru: 'Войти'
    }
    
    await expect(loginButton).toContainText(expectedTexts[locale] || expectedTexts.es)
  })
})