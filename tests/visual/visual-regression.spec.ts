import { test, expect } from '../fixtures/base'
import { HomePage, ProductPage, CartPage, CheckoutPage } from '../fixtures/pages'
import { TestHelpers } from '../fixtures/helpers'

test.describe('Visual Regression Tests', () => {
  let homePage: HomePage
  let productPage: ProductPage
  let cartPage: CartPage
  let checkoutPage: CheckoutPage
  let helpers: TestHelpers

  test.beforeEach(async ({ page, seedDatabase }) => {
    await seedDatabase()
    homePage = new HomePage(page)
    productPage = new ProductPage(page)
    cartPage = new CartPage(page)
    checkoutPage = new CheckoutPage(page)
    helpers = new TestHelpers(page)
  })

  test.describe('Homepage Screenshots', () => {
    test('should match homepage layout @visual', async ({ page }) => {
      await homePage.goto()
      await helpers.waitForPageLoad()
      
      await expect(page).toHaveScreenshot('homepage-full.png', {
        fullPage: true,
        mask: [
          page.locator('[data-testid="dynamic-content"]'),
          page.locator('[data-testid="user-specific"]')
        ]
      })
    })

    test('should match hero section @visual', async ({ page }) => {
      await homePage.goto()
      await helpers.waitForPageLoad()
      
      await expect(homePage.heroSection).toHaveScreenshot('hero-section.png')
    })

    test('should match featured products section @visual', async ({ page }) => {
      await homePage.goto()
      await helpers.waitForPageLoad()
      
      await expect(homePage.featuredProducts).toHaveScreenshot('featured-products.png')
    })

    test('should match navigation @visual', async ({ page }) => {
      await homePage.goto()
      await helpers.waitForPageLoad()
      
      const navigation = page.locator('nav')
      await expect(navigation).toHaveScreenshot('navigation.png')
    })

    test('should match footer @visual', async ({ page }) => {
      await homePage.goto()
      await helpers.waitForPageLoad()
      
      const footer = page.locator('footer')
      await expect(footer).toHaveScreenshot('footer.png')
    })
  })

  test.describe('Product Pages Screenshots', () => {
    test('should match product detail page @visual', async ({ page, testProducts }) => {
      await productPage.goto(testProducts[0].id)
      await helpers.waitForPageLoad()
      
      await expect(page).toHaveScreenshot('product-detail-full.png', {
        fullPage: true,
        mask: [page.locator('[data-testid="dynamic-price"]')]
      })
    })

    test('should match product card layout @visual', async ({ page }) => {
      await page.goto('/products')
      await helpers.waitForPageLoad()
      
      const firstProductCard = page.locator('[data-testid^="product-card-"]').first()
      await expect(firstProductCard).toHaveScreenshot('product-card.png')
    })

    test('should match product search results @visual', async ({ page }) => {
      await homePage.goto()
      await homePage.searchProducts('wine')
      await helpers.waitForPageLoad()
      
      const searchResults = page.locator('[data-testid="search-results"]')
      await expect(searchResults).toHaveScreenshot('search-results.png')
    })

    test('should match product category page @visual', async ({ page }) => {
      await page.goto('/category/wine')
      await helpers.waitForPageLoad()
      
      await expect(page).toHaveScreenshot('category-page-full.png', {
        fullPage: true
      })
    })
  })

  test.describe('Cart and Checkout Screenshots', () => {
    test('should match empty cart @visual', async ({ page }) => {
      await cartPage.goto()
      await helpers.waitForPageLoad()
      
      await expect(page).toHaveScreenshot('empty-cart.png')
    })

    test('should match cart with items @visual', async ({ page, testProducts }) => {
      await productPage.goto(testProducts[0].id)
      await productPage.addToCart(1)
      
      await cartPage.goto()
      await helpers.waitForPageLoad()
      
      await expect(page).toHaveScreenshot('cart-with-items.png', {
        mask: [page.locator('[data-testid="cart-timestamp"]')]
      })
    })

    test('should match checkout form @visual', async ({ page, testProducts }) => {
      await productPage.goto(testProducts[0].id)
      await productPage.addToCart(1)
      
      await cartPage.goto()
      await cartPage.proceedToCheckout()
      await helpers.waitForPageLoad()
      
      await expect(page).toHaveScreenshot('checkout-form.png', {
        fullPage: true
      })
    })

    test('should match order confirmation @visual', async ({ page, testProducts }) => {
      await productPage.goto(testProducts[0].id)
      await productPage.addToCart(1)
      
      await cartPage.goto()
      await cartPage.proceedToCheckout()
      
      const shippingData = {
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '+34 612 345 678',
        address: 'Calle Mayor 123',
        city: 'Madrid',
        postalCode: '28001'
      }
      
      await checkoutPage.fillShippingInfo(shippingData)
      await checkoutPage.selectPaymentMethod('card')
      
      await page.fill('[data-testid="card-number"]', '4242 4242 4242 4242')
      await page.fill('[data-testid="card-expiry"]', '12/25')
      await page.fill('[data-testid="card-cvv"]', '123')
      
      await checkoutPage.submitOrder()
      await helpers.waitForPageLoad()
      
      await expect(page).toHaveScreenshot('order-confirmation.png', {
        mask: [
          page.locator('[data-testid="order-number"]'),
          page.locator('[data-testid="order-timestamp"]')
        ]
      })
    })
  })

  test.describe('Authentication Screenshots', () => {
    test('should match login page @visual', async ({ page }) => {
      await page.goto('/login')
      await helpers.waitForPageLoad()
      
      await expect(page).toHaveScreenshot('login-page.png')
    })

    test('should match register page @visual', async ({ page }) => {
      await page.goto('/register')
      await helpers.waitForPageLoad()
      
      await expect(page).toHaveScreenshot('register-page.png')
    })

    test('should match user account page @visual', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/account')
      await helpers.waitForPageLoad()

      await expect(authenticatedPage).toHaveScreenshot('user-account.png', {
        mask: [
          authenticatedPage.locator('[data-testid="last-login"]'),
          authenticatedPage.locator('[data-testid="user-stats"]')
        ]
      })
    })
  })

  test.describe('Responsive Screenshots', () => {
    test('should match mobile homepage @visual', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await homePage.goto()
      await helpers.waitForPageLoad()
      
      await expect(page).toHaveScreenshot('homepage-mobile.png', {
        fullPage: true
      })
    })

    test('should match tablet homepage @visual', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })
      await homePage.goto()
      await helpers.waitForPageLoad()
      
      await expect(page).toHaveScreenshot('homepage-tablet.png', {
        fullPage: true
      })
    })

    test('should match mobile navigation menu @visual', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await homePage.goto()
      await helpers.waitForPageLoad()
      
      await page.click('[data-testid="mobile-menu-toggle"]')
      
      const mobileMenu = page.locator('[data-testid="mobile-menu"]')
      await expect(mobileMenu).toHaveScreenshot('mobile-menu.png')
    })

    test('should match mobile cart @visual', async ({ page, testProducts }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      
      await productPage.goto(testProducts[0].id)
      await productPage.addToCart(1)
      
      await cartPage.goto()
      await helpers.waitForPageLoad()
      
      await expect(page).toHaveScreenshot('cart-mobile.png', {
        fullPage: true
      })
    })
  })

  test.describe('Locale-specific Screenshots', () => {
    test('should match Spanish homepage @visual', async ({ page }) => {
      await page.goto('/')
      await helpers.waitForPageLoad()
      
      await expect(page).toHaveScreenshot('homepage-es.png', {
        fullPage: true,
        mask: [page.locator('[data-testid="dynamic-content"]')]
      })
    })

    test('should match English homepage @visual', async ({ page }) => {
      await page.goto('/en')
      await helpers.waitForPageLoad()
      
      await expect(page).toHaveScreenshot('homepage-en.png', {
        fullPage: true,
        mask: [page.locator('[data-testid="dynamic-content"]')]
      })
    })

    test('should match Romanian product page @visual', async ({ page, testProducts }) => {
      await page.goto(`/ro/products/${testProducts[0].id}`)
      await helpers.waitForPageLoad()
      
      await expect(page).toHaveScreenshot('product-page-ro.png', {
        fullPage: true
      })
    })

    test('should match Russian cart page @visual', async ({ page, testProducts }) => {
      await productPage.goto(testProducts[0].id)
      await productPage.addToCart(1)
      
      await page.goto('/ru/cart')
      await helpers.waitForPageLoad()
      
      await expect(page).toHaveScreenshot('cart-page-ru.png')
    })
  })

  test.describe('Error Pages Screenshots', () => {
    test('should match 404 page @visual', async ({ page }) => {
      await page.goto('/non-existent-page')
      await helpers.waitForPageLoad()
      
      await expect(page).toHaveScreenshot('404-page.png')
    })

    test('should match error toast @visual', async ({ page }) => {
      await page.goto('/login')
      await page.click('[data-testid="login-button"]')
      
      const errorToast = page.locator('[data-testid="toast-error"]')
      await expect(errorToast).toHaveScreenshot('error-toast.png')
    })
  })

  test.describe('Loading States Screenshots', () => {
    test('should match loading skeleton @visual', async ({ page }) => {
      await page.route('**/api/products', route => {
        setTimeout(() => route.continue(), 2000)
      })
      
      await page.goto('/products')
      
      const loadingSkeleton = page.locator('[data-testid="loading-skeleton"]')
      await expect(loadingSkeleton).toHaveScreenshot('loading-skeleton.png')
    })

    test('should match search loading state @visual', async ({ page }) => {
      await homePage.goto()
      
      await page.route('**/api/search*', route => {
        setTimeout(() => route.continue(), 1500)
      })
      
      await homePage.searchProducts('wine')
      
      const searchLoader = page.locator('[data-testid="search-loading"]')
      await expect(searchLoader).toHaveScreenshot('search-loading.png')
    })
  })
})