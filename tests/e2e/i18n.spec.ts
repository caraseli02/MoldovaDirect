import { test, expect } from '../fixtures/base'
import { HomePage } from '../fixtures/pages'
import { TestHelpers } from '../fixtures/helpers'

test.describe('Internationalization', () => {
  let homePage: HomePage
  let helpers: TestHelpers

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page)
    helpers = new TestHelpers(page)
  })

  test('should display content in Spanish by default', async ({ page }) => {
    await homePage.goto()
    
    await helpers.checkLocale('es')
    
    const heading = page.locator('h1')
    await expect(heading).toContainText('Productos Auténticos de Moldavia')
    
    const cartButton = page.locator('[data-testid="cart-icon"]')
    await expect(cartButton).toHaveAttribute('aria-label', 'Carrito')
  })

  test('should switch to English', async ({ page }) => {
    await homePage.goto()
    await homePage.changeLocale('en')
    
    await page.waitForURL('**/en')
    await helpers.checkLocale('en')
    
    const heading = page.locator('h1')
    await expect(heading).toContainText('Authentic Moldovan Products')
    
    const cartButton = page.locator('[data-testid="cart-icon"]')
    await expect(cartButton).toHaveAttribute('aria-label', 'Cart')
  })

  test('should switch to Romanian', async ({ page }) => {
    await homePage.goto()
    await homePage.changeLocale('ro')
    
    await page.waitForURL('**/ro')
    await helpers.checkLocale('ro')
    
    const heading = page.locator('h1')
    await expect(heading).toContainText('Produse Autentice din Moldova')
    
    const cartButton = page.locator('[data-testid="cart-icon"]')
    await expect(cartButton).toHaveAttribute('aria-label', 'Coș')
  })

  test('should switch to Russian', async ({ page }) => {
    await homePage.goto()
    await homePage.changeLocale('ru')
    
    await page.waitForURL('**/ru')
    await helpers.checkLocale('ru')
    
    const heading = page.locator('h1')
    await expect(heading).toContainText('Аутентичные Молдавские Продукты')
    
    const cartButton = page.locator('[data-testid="cart-icon"]')
    await expect(cartButton).toHaveAttribute('aria-label', 'Корзина')
  })

  test('should persist locale preference', async ({ page }) => {
    await homePage.goto()
    await homePage.changeLocale('en')
    
    await page.reload()
    
    await helpers.checkLocale('en')
    await expect(page).toHaveURL('**/en')
  })

  test('should handle locale in URLs correctly', async ({ page }) => {
    await page.goto('/en/products')
    await helpers.checkLocale('en')
    
    await page.goto('/ro/about')
    await helpers.checkLocale('ro')
    
    await page.goto('/ru/contact')
    await helpers.checkLocale('ru')
  })

  test('should format prices according to locale', async ({ page }) => {
    const testPrice = 1234.56
    
    await homePage.goto()
    let priceElement = page.locator('[data-testid="test-price"]').first()
    await expect(priceElement).toContainText('1.234,56 €')
    
    await homePage.changeLocale('en')
    priceElement = page.locator('[data-testid="test-price"]').first()
    await expect(priceElement).toContainText('€1,234.56')
  })

  test('should format dates according to locale', async ({ page }) => {
    const testDate = '2024-03-15'
    
    await homePage.goto()
    let dateElement = page.locator('[data-testid="test-date"]').first()
    await expect(dateElement).toContainText('15/03/2024')
    
    await homePage.changeLocale('en')
    dateElement = page.locator('[data-testid="test-date"]').first()
    await expect(dateElement).toContainText('03/15/2024')
    
    await homePage.changeLocale('ro')
    dateElement = page.locator('[data-testid="test-date"]').first()
    await expect(dateElement).toContainText('15.03.2024')
  })

  test('should handle RTL languages if added', async ({ page }) => {
    await page.addInitScript(() => {
      window.testRTL = true
    })
    
    await homePage.goto()
    
    const html = page.locator('html')
    const dir = await html.getAttribute('dir')
    expect(dir).toBe('ltr')
  })

  test('should translate error messages', async ({ page }) => {
    await page.goto('/en/login')
    await page.click('[data-testid="login-button"]')
    
    const errorMessage = page.locator('[data-testid="auth-error"]')
    await expect(errorMessage).toContainText('Email is required')
    
    await homePage.changeLocale('es')
    await page.click('[data-testid="login-button"]')
    await expect(errorMessage).toContainText('El correo electrónico es obligatorio')
    
    await homePage.changeLocale('ro')
    await page.click('[data-testid="login-button"]')
    await expect(errorMessage).toContainText('Email-ul este obligatoriu')
    
    await homePage.changeLocale('ru')
    await page.click('[data-testid="login-button"]')
    await expect(errorMessage).toContainText('Email обязателен')
  })

  test('should handle locale-specific content', async ({ page }) => {
    await page.goto('/en/shipping')
    
    let shippingInfo = page.locator('[data-testid="shipping-info"]')
    await expect(shippingInfo).toContainText('Free shipping on orders over €50')
    
    await homePage.changeLocale('es')
    shippingInfo = page.locator('[data-testid="shipping-info"]')
    await expect(shippingInfo).toContainText('Envío gratis en pedidos superiores a 50€')
  })

  test('should update meta tags for SEO', async ({ page }) => {
    await homePage.goto()
    
    let description = await page.getAttribute('meta[name="description"]', 'content')
    expect(description).toContain('Descubre productos auténticos de Moldavia')
    
    await homePage.changeLocale('en')
    description = await page.getAttribute('meta[name="description"]', 'content')
    expect(description).toContain('Discover authentic Moldovan products')
  })
})