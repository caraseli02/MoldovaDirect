import type { Page, Locator } from '@playwright/test'

export class HomePage {
  readonly page: Page
  readonly heroSection: Locator
  readonly featuredProducts: Locator
  readonly searchBar: Locator
  readonly categoryNav: Locator
  readonly cartIcon: Locator
  readonly userMenu: Locator
  readonly localeSwitcher: Locator

  constructor(page: Page) {
    this.page = page
    this.heroSection = page.locator('[data-testid="hero-section"]')
    this.featuredProducts = page.locator('[data-testid="featured-products"]')
    this.searchBar = page.locator('[data-testid="search-input"]')
    this.categoryNav = page.locator('[data-testid="category-nav"]')
    this.cartIcon = page.locator('[data-testid="cart-icon"]')
    this.userMenu = page.locator('[data-testid="user-menu"]')
    this.localeSwitcher = page.locator('[data-testid="locale-switcher"]')
  }

  async goto() {
    await this.page.goto('/')
  }

  async searchProducts(query: string) {
    await this.searchBar.fill(query)
    await this.searchBar.press('Enter')
  }

  async selectCategory(category: string) {
    await this.page.click(`[data-testid="category-${category}"]`)
  }

  async changeLocale(locale: string) {
    await this.localeSwitcher.click()
    await this.page.click(`[data-testid="locale-${locale}"]`)
  }
}

export class ProductPage {
  readonly page: Page
  readonly productTitle: Locator
  readonly productPrice: Locator
  readonly productDescription: Locator
  readonly productImages: Locator
  readonly addToCartButton: Locator
  readonly quantityInput: Locator
  readonly relatedProducts: Locator

  constructor(page: Page) {
    this.page = page
    this.productTitle = page.locator('[data-testid="product-title"]')
    this.productPrice = page.locator('[data-testid="product-price"]')
    this.productDescription = page.locator('[data-testid="product-description"]')
    this.productImages = page.locator('[data-testid="product-images"]')
    this.addToCartButton = page.locator('[data-testid="add-to-cart-button"]')
    this.quantityInput = page.locator('[data-testid="quantity-input"]')
    this.relatedProducts = page.locator('[data-testid="related-products"]')
  }

  async goto(productId: string) {
    await this.page.goto(`/products/${productId}`)
  }

  async addToCart(quantity: number = 1) {
    await this.quantityInput.fill(quantity.toString())
    await this.addToCartButton.click()
  }
}

export class CartPage {
  readonly page: Page
  readonly cartItems: Locator
  readonly subtotal: Locator
  readonly total: Locator
  readonly checkoutButton: Locator
  readonly continueShoppingButton: Locator
  readonly emptyCartMessage: Locator

  constructor(page: Page) {
    this.page = page
    this.cartItems = page.locator('[data-testid="cart-items"]')
    this.subtotal = page.locator('[data-testid="cart-subtotal"]')
    this.total = page.locator('[data-testid="cart-total"]')
    this.checkoutButton = page.locator('[data-testid="checkout-button"]')
    this.continueShoppingButton = page.locator('[data-testid="continue-shopping"]')
    this.emptyCartMessage = page.locator('[data-testid="empty-cart-message"]')
  }

  async goto() {
    await this.page.goto('/cart')
  }

  async updateQuantity(productId: string, quantity: number) {
    const quantityInput = this.page.locator(`[data-testid="quantity-${productId}"]`)
    await quantityInput.fill(quantity.toString())
  }

  async increaseQuantity(productId: string) {
    await this.page.click(`[data-testid="increase-quantity-${productId}"]`)
  }

  async decreaseQuantity(productId: string) {
    await this.page.click(`[data-testid="decrease-quantity-${productId}"]`)
  }

  async removeItem(productId: string) {
    await this.page.click(`[data-testid="remove-item-${productId}"]`)
  }

  async proceedToCheckout() {
    await this.checkoutButton.click()
  }

  getCartItem(productId: string) {
    return this.page.locator(`[data-testid="cart-item-${productId}"]`)
  }

  getQuantityDisplay(productId: string) {
    return this.page.locator(`[data-testid="quantity-display-${productId}"]`)
  }
}

export class CheckoutPage {
  readonly page: Page
  readonly shippingForm: Locator
  readonly paymentForm: Locator
  readonly orderSummary: Locator
  readonly submitOrderButton: Locator
  readonly backToCartButton: Locator

  constructor(page: Page) {
    this.page = page
    this.shippingForm = page.locator('[data-testid="shipping-form"]')
    this.paymentForm = page.locator('[data-testid="payment-form"]')
    this.orderSummary = page.locator('[data-testid="order-summary"]')
    this.submitOrderButton = page.locator('[data-testid="submit-order-button"]')
    this.backToCartButton = page.locator('[data-testid="back-to-cart"]')
  }

  async goto() {
    await this.page.goto('/checkout')
  }

  async fillShippingInfo(data: {
    fullName: string
    email: string
    phone: string
    address: string
    city: string
    postalCode: string
  }) {
    await this.page.fill('[data-testid="fullname-input"]', data.fullName)
    await this.page.fill('[data-testid="email-input"]', data.email)
    await this.page.fill('[data-testid="phone-input"]', data.phone)
    await this.page.fill('[data-testid="address-input"]', data.address)
    await this.page.fill('[data-testid="city-input"]', data.city)
    await this.page.fill('[data-testid="postal-input"]', data.postalCode)
  }

  async selectPaymentMethod(method: 'card' | 'paypal' | 'transfer') {
    await this.page.click(`[data-testid="payment-${method}"]`)
  }

  async submitOrder() {
    await this.submitOrderButton.click()
  }
}

export class AuthPage {
  readonly page: Page
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly loginButton: Locator
  readonly registerButton: Locator
  readonly forgotPasswordLink: Locator
  readonly errorMessage: Locator

  constructor(page: Page) {
    this.page = page
    this.emailInput = page.locator('[data-testid="email-input"]')
    this.passwordInput = page.locator('[data-testid="password-input"]')
    this.loginButton = page.locator('[data-testid="login-button"]')
    this.registerButton = page.locator('[data-testid="register-button"]')
    this.forgotPasswordLink = page.locator('[data-testid="forgot-password"]')
    this.errorMessage = page.locator('[data-testid="auth-error"]')
  }

  async gotoLogin() {
    await this.page.goto('/login')
  }

  async gotoRegister() {
    await this.page.goto('/register')
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.loginButton.click()
  }

  async register(email: string, password: string, name: string) {
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.page.fill('[data-testid="name-input"]', name)
    await this.registerButton.click()
  }
}
