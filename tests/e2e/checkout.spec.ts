import { test, expect } from '../fixtures/base'
import { ProductPage, CartPage, CheckoutPage } from '../fixtures/pages'
import { TestHelpers } from '../fixtures/helpers'

test.describe('Checkout Flow', () => {
  let productPage: ProductPage
  let cartPage: CartPage
  let checkoutPage: CheckoutPage
  let helpers: TestHelpers

  test.beforeEach(async ({ page, seedDatabase }) => {
    await seedDatabase()
    productPage = new ProductPage(page)
    cartPage = new CartPage(page)
    checkoutPage = new CheckoutPage(page)
    helpers = new TestHelpers(page)
  })

  test('should add products to cart', async ({ page, testProducts }) => {
    const product = testProducts[0]
    await productPage.goto(product.id)
    
    await productPage.addToCart(2)
    
    await helpers.checkToast('Product added to cart')
    
    const cartBadge = page.locator('[data-testid="cart-badge"]')
    await expect(cartBadge).toContainText('2')
  })

  test('should view and update cart', async ({ page, testProducts }) => {
    const product = testProducts[0]
    await productPage.goto(product.id)
    await productPage.addToCart(1)
    
    await cartPage.goto()
    
    const cartItem = page.locator(`[data-testid="cart-item-${product.id}"]`)
    await expect(cartItem).toBeVisible()
    await expect(cartItem).toContainText(product.name)
    await expect(cartItem).toContainText(`€${product.price}`)
    
    await cartPage.updateQuantity(product.id, 3)
    
    const quantity = page.locator(`[data-testid="quantity-${product.id}"]`)
    await expect(quantity).toHaveValue('3')
    
    const itemTotal = cartItem.locator('[data-testid="item-total"]')
    await expect(itemTotal).toContainText(`€${(product.price * 3).toFixed(2)}`)
  })

  test('should remove items from cart', async ({ page, testProducts }) => {
    const product = testProducts[0]
    await productPage.goto(product.id)
    await productPage.addToCart(1)
    
    await cartPage.goto()
    await cartPage.removeItem(product.id)
    
    await helpers.checkToast('Item removed from cart')
    await expect(cartPage.emptyCartMessage).toBeVisible()
  })

  test('should calculate cart totals correctly', async ({ page, testProducts }) => {
    for (const product of testProducts.slice(0, 2)) {
      await productPage.goto(product.id)
      await productPage.addToCart(1)
    }
    
    await cartPage.goto()
    
    const subtotal = testProducts[0].price + testProducts[1].price
    await expect(cartPage.subtotal).toContainText(`€${subtotal.toFixed(2)}`)
    
    const shipping = page.locator('[data-testid="shipping-cost"]')
    const shippingText = await shipping.textContent()
    const shippingCost = parseFloat(shippingText?.replace('€', '') || '0')
    
    const total = subtotal + shippingCost
    await expect(cartPage.total).toContainText(`€${total.toFixed(2)}`)
  })

  test('should complete checkout as guest', async ({ page, testProducts }) => {
    const product = testProducts[0]
    await productPage.goto(product.id)
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
    
    await page.waitForURL('**/order-confirmation')
    const orderNumber = page.locator('[data-testid="order-number"]')
    await expect(orderNumber).toBeVisible()
    await expect(orderNumber).toContainText(/Order #\d+/)
  })

  test('should complete checkout as authenticated user', async ({ authenticatedPage, testProducts }) => {
    const product = testProducts[0]
    await productPage.goto(product.id)
    await productPage.addToCart(1)
    
    await cartPage.goto()
    await cartPage.proceedToCheckout()
    
    const savedAddress = authenticatedPage.locator('[data-testid="saved-address-0"]')
    await expect(savedAddress).toBeVisible()
    await savedAddress.click()
    
    await checkoutPage.selectPaymentMethod('card')
    
    const savedCard = authenticatedPage.locator('[data-testid="saved-card-0"]')
    await expect(savedCard).toBeVisible()
    await savedCard.click()
    
    await checkoutPage.submitOrder()
    
    await authenticatedPage.waitForURL('**/order-confirmation')
    await helpers.checkHeading('Order Confirmed')
  })

  test('should validate checkout form', async ({ page, testProducts }) => {
    const product = testProducts[0]
    await productPage.goto(product.id)
    await productPage.addToCart(1)
    
    await cartPage.goto()
    await cartPage.proceedToCheckout()
    
    await checkoutPage.submitOrder()
    
    const errors = page.locator('[data-testid$="-error"]')
    const errorCount = await errors.count()
    expect(errorCount).toBeGreaterThan(0)
    
    await page.fill('[data-testid="email-input"]', 'invalid-email')
    await page.fill('[data-testid="phone-input"]', '123')
    
    await checkoutPage.submitOrder()
    
    const emailError = page.locator('[data-testid="email-error"]')
    const phoneError = page.locator('[data-testid="phone-error"]')
    
    await expect(emailError).toContainText('Invalid email')
    await expect(phoneError).toContainText('Invalid phone')
  })

  test('should apply discount code', async ({ page, testProducts }) => {
    const product = testProducts[0]
    await productPage.goto(product.id)
    await productPage.addToCart(1)
    
    await cartPage.goto()
    
    const discountInput = page.locator('[data-testid="discount-code-input"]')
    const applyButton = page.locator('[data-testid="apply-discount"]')
    
    await discountInput.fill('SAVE10')
    await applyButton.click()
    
    await helpers.checkToast('Discount applied')
    
    const discount = page.locator('[data-testid="discount-amount"]')
    await expect(discount).toBeVisible()
    await expect(discount).toContainText('-10%')
    
    const originalPrice = product.price
    const discountedTotal = originalPrice * 0.9
    await expect(cartPage.total).toContainText(`€${discountedTotal.toFixed(2)}`)
  })

  test('should handle out of stock items', async ({ page, testProducts }) => {
    const product = testProducts[0]
    
    await page.route(`**/api/products/${product.id}`, route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ ...product, stock: 0 })
      })
    })
    
    await productPage.goto(product.id)
    
    await expect(productPage.addToCartButton).toBeDisabled()
    await expect(page.locator('[data-testid="out-of-stock"]')).toBeVisible()
  })

  test('should save cart for later', async ({ authenticatedPage, testProducts }) => {
    const product = testProducts[0]
    await productPage.goto(product.id)
    await productPage.addToCart(1)
    
    await cartPage.goto()
    
    const saveForLater = authenticatedPage.locator('[data-testid="save-for-later"]')
    await saveForLater.click()
    
    await helpers.checkToast('Cart saved')
    
    await authenticatedPage.reload()
    await cartPage.goto()
    
    const cartItem = authenticatedPage.locator(`[data-testid="cart-item-${product.id}"]`)
    await expect(cartItem).toBeVisible()
  })
})