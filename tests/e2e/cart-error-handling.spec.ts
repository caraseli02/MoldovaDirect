import { test, expect } from '../fixtures/base'
import { ProductPage, CartPage } from '../fixtures/pages'
import { TestHelpers } from '../fixtures/helpers'
import { seedDatabase } from '../setup/seed'

test.describe('Cart Error Handling and User Feedback', () => {
  let productPage: ProductPage
  let cartPage: CartPage
  let helpers: TestHelpers

  test.beforeEach(async ({ page }) => {
    await seedDatabase()
    productPage = new ProductPage(page)
    cartPage = new CartPage(page)
    helpers = new TestHelpers(page)
  })

  test.describe('Toast Notifications', () => {
    test('should show success toast when adding product to cart', async ({ page, testProducts }) => {
      const product = testProducts[0]
      await productPage.goto(product.slug)
      
      await productPage.addToCart(1)
      
      // Check for success toast
      const toast = page.locator('[data-testid="toast"]').first()
      await expect(toast).toBeVisible()
      await expect(toast).toContainText('Producto añadido')
      await expect(toast.locator('[data-testid="toast-type-success"]')).toBeVisible()
    })

    test('should show success toast when updating quantity', async ({ page, testProducts }) => {
      const product = testProducts[0]
      await productPage.goto(product.slug)
      await productPage.addToCart(1)
      
      await cartPage.goto()
      
      // Update quantity
      const increaseButton = page.locator(`[data-testid="increase-quantity-${product.id}"]`)
      await increaseButton.click()
      
      // Check for success toast
      const toast = page.locator('[data-testid="toast"]').first()
      await expect(toast).toBeVisible()
      await expect(toast).toContainText('Cantidad actualizada')
    })

    test('should show success toast with undo action when removing item', async ({ page, testProducts }) => {
      const product = testProducts[0]
      await productPage.goto(product.slug)
      await productPage.addToCart(1)
      
      await cartPage.goto()
      
      // Remove item
      const removeButton = page.locator(`[data-testid="remove-item-${product.id}"]`)
      await removeButton.click()
      
      // Check for success toast with undo action
      const toast = page.locator('[data-testid="toast"]').first()
      await expect(toast).toBeVisible()
      await expect(toast).toContainText('Producto eliminado')
      
      const undoButton = toast.locator('[data-testid="toast-action-button"]')
      await expect(undoButton).toBeVisible()
      await expect(undoButton).toContainText('Deshacer')
    })

    test('should restore item when clicking undo after removal', async ({ page, testProducts }) => {
      const product = testProducts[0]
      await productPage.goto(product.slug)
      await productPage.addToCart(1)
      
      await cartPage.goto()
      
      // Remove item
      const removeButton = page.locator(`[data-testid="remove-item-${product.id}"]`)
      await removeButton.click()
      
      // Click undo
      const toast = page.locator('[data-testid="toast"]').first()
      const undoButton = toast.locator('[data-testid="toast-action-button"]')
      await undoButton.click()
      
      // Check item is restored
      const cartItem = page.locator(`[data-testid="cart-item-${product.id}"]`)
      await expect(cartItem).toBeVisible()
      
      // Check for restoration toast
      const restorationToast = page.locator('[data-testid="toast"]').first()
      await expect(restorationToast).toContainText('Producto restaurado')
    })

    test('should show error toast when trying to add more than available stock', async ({ page, testProducts }) => {
      // Find a product with limited stock
      const product = testProducts.find(p => p.stock <= 5) || testProducts[0]
      await productPage.goto(product.slug)
      
      // Try to add more than available stock
      await productPage.addToCart(product.stock + 1)
      
      // Check for error toast
      const toast = page.locator('[data-testid="toast"]').first()
      await expect(toast).toBeVisible()
      await expect(toast).toContainText('Stock insuficiente')
      await expect(toast.locator('[data-testid="toast-type-error"]')).toBeVisible()
      
      // Check for action button
      const actionButton = toast.locator('[data-testid="toast-action-button"]')
      await expect(actionButton).toBeVisible()
    })

    test('should auto-dismiss toasts after specified duration', async ({ page, testProducts }) => {
      const product = testProducts[0]
      await productPage.goto(product.slug)
      
      await productPage.addToCart(1)
      
      const toast = page.locator('[data-testid="toast"]').first()
      await expect(toast).toBeVisible()
      
      // Wait for auto-dismiss (default 5 seconds)
      await page.waitForTimeout(6000)
      await expect(toast).not.toBeVisible()
    })

    test('should allow manual dismissal of toasts', async ({ page, testProducts }) => {
      const product = testProducts[0]
      await productPage.goto(product.slug)
      
      await productPage.addToCart(1)
      
      const toast = page.locator('[data-testid="toast"]').first()
      await expect(toast).toBeVisible()
      
      // Click close button
      const closeButton = toast.locator('[data-testid="toast-close-button"]')
      await closeButton.click()
      
      await expect(toast).not.toBeVisible()
    })
  })

  test.describe('Error Boundary', () => {
    test('should display error boundary when cart encounters an error', async ({ page }) => {
      await cartPage.goto()
      
      // Simulate an error by corrupting localStorage
      await page.evaluate(() => {
        localStorage.setItem('moldova-direct-cart', 'invalid-json')
      })
      
      // Reload page to trigger error
      await page.reload()
      
      // Check for error boundary
      const errorBoundary = page.locator('[data-testid="error-boundary"]')
      await expect(errorBoundary).toBeVisible()
      await expect(errorBoundary).toContainText('Error en el carrito')
    })

    test('should provide retry functionality in error boundary', async ({ page }) => {
      await cartPage.goto()
      
      // Simulate error
      await page.evaluate(() => {
        localStorage.setItem('moldova-direct-cart', 'invalid-json')
      })
      await page.reload()
      
      const errorBoundary = page.locator('[data-testid="error-boundary"]')
      await expect(errorBoundary).toBeVisible()
      
      // Click retry button
      const retryButton = errorBoundary.locator('[data-testid="error-retry-button"]')
      await retryButton.click()
      
      // Error boundary should disappear
      await expect(errorBoundary).not.toBeVisible()
    })

    test('should provide fallback action in error boundary', async ({ page }) => {
      await cartPage.goto()
      
      // Simulate error
      await page.evaluate(() => {
        localStorage.setItem('moldova-direct-cart', 'invalid-json')
      })
      await page.reload()
      
      const errorBoundary = page.locator('[data-testid="error-boundary"]')
      await expect(errorBoundary).toBeVisible()
      
      // Click fallback action (continue shopping)
      const fallbackButton = errorBoundary.locator('[data-testid="error-fallback-button"]')
      await fallbackButton.click()
      
      // Should navigate to products page
      await expect(page).toHaveURL(/.*\/products/)
    })

    test('should show/hide error details', async ({ page }) => {
      await cartPage.goto()
      
      // Simulate error
      await page.evaluate(() => {
        localStorage.setItem('moldova-direct-cart', 'invalid-json')
      })
      await page.reload()
      
      const errorBoundary = page.locator('[data-testid="error-boundary"]')
      await expect(errorBoundary).toBeVisible()
      
      // Check details are hidden initially
      const errorDetails = errorBoundary.locator('[data-testid="error-details"]')
      await expect(errorDetails).not.toBeVisible()
      
      // Click show details
      const showDetailsButton = errorBoundary.locator('[data-testid="show-details-button"]')
      await showDetailsButton.click()
      
      // Details should be visible
      await expect(errorDetails).toBeVisible()
      
      // Click hide details
      const hideDetailsButton = errorBoundary.locator('[data-testid="hide-details-button"]')
      await hideDetailsButton.click()
      
      // Details should be hidden
      await expect(errorDetails).not.toBeVisible()
    })
  })

  test.describe('Storage Error Handling', () => {
    test('should handle localStorage unavailability gracefully', async ({ page, testProducts }) => {
      // Disable localStorage
      await page.addInitScript(() => {
        Object.defineProperty(window, 'localStorage', {
          value: {
            getItem: () => { throw new Error('localStorage disabled') },
            setItem: () => { throw new Error('localStorage disabled') },
            removeItem: () => { throw new Error('localStorage disabled') }
          }
        })
      })
      
      const product = testProducts[0]
      await productPage.goto(product.slug)
      
      await productPage.addToCart(1)
      
      // Should show warning toast about limited storage
      const toast = page.locator('[data-testid="toast"]').first()
      await expect(toast).toBeVisible()
      await expect(toast).toContainText('Almacenamiento limitado')
    })

    test('should fallback to sessionStorage when localStorage fails', async ({ page, testProducts }) => {
      // Mock localStorage to fail but sessionStorage to work
      await page.addInitScript(() => {
        const originalSetItem = localStorage.setItem
        localStorage.setItem = function() {
          throw new Error('localStorage full')
        }
      })
      
      const product = testProducts[0]
      await productPage.goto(product.slug)
      
      await productPage.addToCart(1)
      
      // Should show warning about session storage
      const toast = page.locator('[data-testid="toast"]').first()
      await expect(toast).toContainText('Almacenamiento limitado')
    })
  })

  test.describe('Cart Validation', () => {
    test('should validate cart items and show warnings for price changes', async ({ page, testProducts }) => {
      const product = testProducts[0]
      await productPage.goto(product.slug)
      await productPage.addToCart(1)
      
      // Simulate price change in backend
      await page.evaluate((productId, newPrice) => {
        // Mock API response with new price
        window.fetch = async (url) => {
          if (url.includes(`/api/products/${productId}`)) {
            return {
              ok: true,
              json: async () => ({
                product: { ...product, price: newPrice }
              })
            }
          }
          return originalFetch(url)
        }
      }, product.id, product.price + 5)
      
      await cartPage.goto()
      
      // Trigger validation
      await page.reload()
      
      // Should show price change warning
      const toast = page.locator('[data-testid="toast"]').first()
      await expect(toast).toContainText('Precio actualizado')
    })

    test('should remove unavailable products from cart', async ({ page, testProducts }) => {
      const product = testProducts[0]
      await productPage.goto(product.slug)
      await productPage.addToCart(1)
      
      // Simulate product becoming unavailable
      await page.route(`**/api/products/${product.slug}`, route => {
        route.fulfill({
          status: 404,
          body: JSON.stringify({ error: 'Product not found' })
        })
      })
      
      await cartPage.goto()
      await page.reload()
      
      // Should show warning about removed product
      const toast = page.locator('[data-testid="toast"]').first()
      await expect(toast).toContainText('Productos no disponibles')
      
      // Cart should be empty
      const emptyMessage = page.locator('[data-testid="empty-cart-message"]')
      await expect(emptyMessage).toBeVisible()
    })

    test('should adjust quantities when stock is reduced', async ({ page, testProducts }) => {
      const product = testProducts[0]
      await productPage.goto(product.slug)
      await productPage.addToCart(3)
      
      // Simulate stock reduction
      await page.route(`**/api/products/${product.slug}`, route => {
        route.fulfill({
          status: 200,
          body: JSON.stringify({
            product: { ...product, stock: 1 }
          })
        })
      })
      
      await cartPage.goto()
      await page.reload()
      
      // Should show quantity adjustment warning
      const toast = page.locator('[data-testid="toast"]').first()
      await expect(toast).toContainText('Cantidades ajustadas')
      
      // Quantity should be adjusted to 1
      const quantityDisplay = page.locator(`[data-testid="quantity-display-${product.id}"]`)
      await expect(quantityDisplay).toContainText('1')
    })
  })

  test.describe('Network Error Handling', () => {
    test('should handle network errors gracefully', async ({ page, testProducts }) => {
      const product = testProducts[0]
      await productPage.goto(product.slug)
      
      // Simulate network error
      await page.route('**/api/**', route => {
        route.abort('failed')
      })
      
      await productPage.addToCart(1)
      
      // Should show network error toast
      const toast = page.locator('[data-testid="toast"]').first()
      await expect(toast).toBeVisible()
      await expect(toast).toContainText('Error de conexión')
      
      // Should provide retry action
      const retryButton = toast.locator('[data-testid="toast-action-button"]')
      await expect(retryButton).toBeVisible()
      await expect(retryButton).toContainText('Reintentar')
    })

    test('should retry failed operations', async ({ page, testProducts }) => {
      const product = testProducts[0]
      await productPage.goto(product.slug)
      
      let requestCount = 0
      await page.route('**/api/**', route => {
        requestCount++
        if (requestCount === 1) {
          route.abort('failed')
        } else {
          route.continue()
        }
      })
      
      await productPage.addToCart(1)
      
      // Click retry on error toast
      const toast = page.locator('[data-testid="toast"]').first()
      const retryButton = toast.locator('[data-testid="toast-action-button"]')
      await retryButton.click()
      
      // Should succeed on retry
      const successToast = page.locator('[data-testid="toast"]').first()
      await expect(successToast).toContainText('Producto añadido')
    })
  })

  test.describe('Multilingual Error Messages', () => {
    test('should show error messages in Spanish', async ({ page, testProducts }) => {
      await helpers.changeLocale('es')
      
      const product = testProducts[0]
      await productPage.goto(product.slug)
      
      // Try to add more than stock
      await productPage.addToCart(product.stock + 1)
      
      const toast = page.locator('[data-testid="toast"]').first()
      await expect(toast).toContainText('Stock insuficiente')
    })

    test('should show error messages in English', async ({ page, testProducts }) => {
      await helpers.changeLocale('en')
      
      const product = testProducts[0]
      await productPage.goto(product.slug)
      
      // Try to add more than stock
      await productPage.addToCart(product.stock + 1)
      
      const toast = page.locator('[data-testid="toast"]').first()
      await expect(toast).toContainText('Insufficient stock')
    })

    test('should show error messages in Romanian', async ({ page, testProducts }) => {
      await helpers.changeLocale('ro')
      
      const product = testProducts[0]
      await productPage.goto(product.slug)
      
      // Try to add more than stock
      await productPage.addToCart(product.stock + 1)
      
      const toast = page.locator('[data-testid="toast"]').first()
      await expect(toast).toContainText('Stoc insuficient')
    })

    test('should show error messages in Russian', async ({ page, testProducts }) => {
      await helpers.changeLocale('ru')
      
      const product = testProducts[0]
      await productPage.goto(product.slug)
      
      // Try to add more than stock
      await productPage.addToCart(product.stock + 1)
      
      const toast = page.locator('[data-testid="toast"]').first()
      await expect(toast).toContainText('Недостаточно товара')
    })
  })

  test.describe('Accessibility', () => {
    test('should have proper ARIA labels for toast notifications', async ({ page, testProducts }) => {
      const product = testProducts[0]
      await productPage.goto(product.slug)
      
      await productPage.addToCart(1)
      
      const toast = page.locator('[data-testid="toast"]').first()
      await expect(toast).toHaveAttribute('role', 'alert')
      await expect(toast).toHaveAttribute('aria-live', 'polite')
    })

    test('should have keyboard navigation for toast actions', async ({ page, testProducts }) => {
      const product = testProducts[0]
      await productPage.goto(product.slug)
      await productPage.addToCart(1)
      
      await cartPage.goto()
      
      // Remove item to get toast with action
      const removeButton = page.locator(`[data-testid="remove-item-${product.id}"]`)
      await removeButton.click()
      
      const toast = page.locator('[data-testid="toast"]').first()
      const undoButton = toast.locator('[data-testid="toast-action-button"]')
      
      // Should be focusable
      await undoButton.focus()
      await expect(undoButton).toBeFocused()
      
      // Should work with Enter key
      await undoButton.press('Enter')
      
      // Item should be restored
      const cartItem = page.locator(`[data-testid="cart-item-${product.id}"]`)
      await expect(cartItem).toBeVisible()
    })

    test('should have proper focus management in error boundary', async ({ page }) => {
      await cartPage.goto()
      
      // Simulate error
      await page.evaluate(() => {
        localStorage.setItem('moldova-direct-cart', 'invalid-json')
      })
      await page.reload()
      
      const errorBoundary = page.locator('[data-testid="error-boundary"]')
      const retryButton = errorBoundary.locator('[data-testid="error-retry-button"]')
      
      // Should be focusable
      await retryButton.focus()
      await expect(retryButton).toBeFocused()
    })
  })
})