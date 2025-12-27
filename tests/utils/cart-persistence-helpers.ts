/**
 * Cart Persistence Helpers for Playwright Tests
 *
 * Utilities to ensure cart state persists reliably across page navigations
 * in test scenarios where cookie persistence timing is critical.
 *
 * The cart store uses a 1-second debounced save to avoid excessive cookie writes.
 * This creates race conditions in tests where navigation happens before the save completes.
 * These helpers provide methods to force immediate saves and verify cart state.
 */

import type { Page } from '@playwright/test'

const CART_COOKIE_NAME = 'moldova_direct_cart'

export class CartPersistenceHelpers {
  constructor(private page: Page) {}

  /**
   * Wait for Nuxt to be fully hydrated and ready
   * Polls until window.__nuxt__ is available with the Vue app
   */
  async waitForNuxtReady(timeout: number = 10000): Promise<boolean> {
    try {
      await this.page.waitForFunction(
        () => {
          // Try multiple ways to detect Nuxt/Vue readiness
          const nuxtApp = (window as any).__nuxt__ || (window as any).$nuxt
          if (nuxtApp && nuxtApp.vueApp) {
            const pinia = nuxtApp.vueApp.config?.globalProperties?.$pinia
            return !!pinia
          }
          // Fallback: check if Vue app exists on #__nuxt element
          const nuxtEl = document.getElementById('__nuxt')
          return nuxtEl && (nuxtEl as any).__vue_app__ !== undefined
        },
        { timeout },
      )
      return true
    }
    catch {
      console.warn('⚠️  Nuxt not ready after timeout')
      return false
    }
  }

  /**
   * Force immediate cart save before navigation
   * Uses multiple strategies to ensure cart state is persisted:
   * 1. Try to call forceImmediateSave() via Pinia store
   * 2. Fall back to waiting for debounced save to complete (1.5s)
   */
  async forceCartSave(): Promise<{ success: boolean, error?: string }> {
    // Strategy 1: Try to access Pinia store and call forceImmediateSave
    const result = await this.page.evaluate(async () => {
      try {
        // Try multiple ways to access Nuxt app
        const nuxtApp = (window as any).__nuxt__ || (window as any).$nuxt

        if (nuxtApp && nuxtApp.vueApp) {
          const pinia = nuxtApp.vueApp.config?.globalProperties?.$pinia
          if (pinia) {
            const cartStore = pinia._s?.get('cart')
            if (cartStore && typeof cartStore.forceImmediateSave === 'function') {
              return await cartStore.forceImmediateSave()
            }
            if (cartStore && typeof cartStore.forceSync === 'function') {
              return await cartStore.forceSync()
            }
          }
        }

        // Try accessing via #__nuxt element's Vue app
        const nuxtEl = document.getElementById('__nuxt')
        if (nuxtEl && (nuxtEl as any).__vue_app__) {
          const app = (nuxtEl as any).__vue_app__
          const pinia = app.config?.globalProperties?.$pinia
          if (pinia) {
            const cartStore = pinia._s?.get('cart')
            if (cartStore && typeof cartStore.forceImmediateSave === 'function') {
              return await cartStore.forceImmediateSave()
            }
          }
        }

        return { success: false, error: 'Could not access Pinia store' }
      }
      catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      }
    })

    if (result.success) {
      // Wait for Vue/Nuxt reactivity to flush cookie to browser
      // useCookie uses nextTick internally which may require a frame
      await this.page.waitForTimeout(500)
      console.log('✅ Cart force saved via Pinia store')
      return result
    }

    // Strategy 2: Fall back to waiting for debounced save to complete
    // Cart uses 1-second debounce, so wait 2s to be safe plus cookie flush time
    console.log('⏳ Pinia access failed, waiting for debounced save (2s)...')
    await this.page.waitForTimeout(2000)

    console.log('✅ Cart should be saved via debounced save')
    return { success: true }
  }

  /**
   * Verify cart has items by checking cookie directly
   * More reliable than checking UI state since it verifies persistence
   * Tries multiple methods: Playwright cookies API and document.cookie
   */
  async verifyCartCookie(): Promise<{ hasItems: boolean, itemCount: number, subtotal?: number }> {
    // Method 1: Try Playwright's cookies API
    const cookies = await this.page.context().cookies()
    let cartCookie = cookies.find(c => c.name === CART_COOKIE_NAME)

    // Method 2: If not found via Playwright API, try reading document.cookie directly
    if (!cartCookie || !cartCookie.value) {
      const documentCookieValue = await this.page.evaluate((cookieName) => {
        const cookies = document.cookie.split('; ')
        for (const cookie of cookies) {
          const [name, ...valueParts] = cookie.split('=')
          if (name === cookieName) {
            return valueParts.join('=')
          }
        }
        return null
      }, CART_COOKIE_NAME)

      if (documentCookieValue) {
        cartCookie = { name: CART_COOKIE_NAME, value: documentCookieValue } as any
      }
    }

    if (!cartCookie || !cartCookie.value) {
      console.warn('⚠️  Cart cookie not found or empty')
      return { hasItems: false, itemCount: 0 }
    }

    try {
      const decodedValue = decodeURIComponent(cartCookie.value)
      const cartData = JSON.parse(decodedValue)
      const itemCount = cartData.items?.length || 0
      const subtotal = cartData.items?.reduce((sum: number, item: any) => {
        const price = item.product?.price || 0
        const quantity = item.quantity || 1
        return sum + (price * quantity)
      }, 0) || 0

      console.log(`🍪 Cart cookie verified: ${itemCount} items, subtotal: ${subtotal.toFixed(2)}€`)
      return { hasItems: itemCount > 0, itemCount, subtotal }
    }
    catch (e) {
      console.error('Failed to parse cart cookie:', e)
      return { hasItems: false, itemCount: 0 }
    }
  }

  /**
   * Get current cart item count - checks cookie first, then tries Pinia store
   */
  async getCurrentItemCount(): Promise<number> {
    // Primary method: check cookie directly (most reliable)
    const cookieState = await this.verifyCartCookie()
    if (cookieState.itemCount > 0) {
      return cookieState.itemCount
    }

    // Fallback: try to access Pinia store
    return await this.page.evaluate(() => {
      try {
        const nuxtApp = (window as any).__nuxt__ || (window as any).$nuxt
        if (nuxtApp && nuxtApp.vueApp) {
          const pinia = nuxtApp.vueApp.config?.globalProperties?.$pinia
          if (pinia) {
            const cartStore = pinia._s?.get('cart')
            return cartStore?.items?.length || 0
          }
        }
        return 0
      }
      catch {
        return 0
      }
    })
  }

  /**
   * Get current cart subtotal - checks cookie first, then tries Pinia store
   */
  async getCurrentSubtotal(): Promise<number> {
    // Primary method: check cookie directly (most reliable)
    const cookieState = await this.verifyCartCookie()
    if (cookieState.subtotal && cookieState.subtotal > 0) {
      return cookieState.subtotal
    }

    // Fallback: try to access Pinia store
    return await this.page.evaluate(() => {
      try {
        const nuxtApp = (window as any).__nuxt__ || (window as any).$nuxt
        if (nuxtApp && nuxtApp.vueApp) {
          const pinia = nuxtApp.vueApp.config?.globalProperties?.$pinia
          if (pinia) {
            const cartStore = pinia._s?.get('cart')
            return cartStore?.subtotal || 0
          }
        }
        return 0
      }
      catch {
        return 0
      }
    })
  }

  /**
   * Wait for cart to be loaded/hydrated after page navigation
   * Polls the Pinia store until items appear or timeout
   */
  async waitForCartHydration(expectedItemCount: number = 1, timeout: number = 5000): Promise<boolean> {
    const startTime = Date.now()

    while (Date.now() - startTime < timeout) {
      const currentItemCount = await this.getCurrentItemCount()

      if (currentItemCount >= expectedItemCount) {
        console.log(`✅ Cart hydrated with ${currentItemCount} items`)
        return true
      }

      await this.page.waitForTimeout(100)
    }

    const finalCount = await this.getCurrentItemCount()
    console.warn(`⚠️  Cart hydration timeout: expected ${expectedItemCount} items, got ${finalCount}`)
    return false
  }

  /**
   * Wait for order summary to show non-zero values
   * Useful after navigation to ensure prices have loaded
   */
  async waitForOrderSummaryPrices(timeout: number = 10000): Promise<boolean> {
    try {
      await this.page.waitForFunction(
        () => {
          // Check for order summary elements with non-zero values
          const priceElements = document.querySelectorAll('[data-testid="order-subtotal"], [data-testid="order-total"], .order-total, .subtotal')
          for (const el of priceElements) {
            const text = el.textContent || ''
            // Check if it contains a non-zero price (handles €, $, etc.)
            if (/[1-9]\d*[.,]\d{2}/.test(text)) {
              return true
            }
          }

          // Fallback: check for any element with currency and non-zero value
          const allText = document.body.innerText
          return /(?:subtotal|total|€|EUR).*[1-9]\d*[.,]\d{2}/i.test(allText)
        },
        { timeout },
      )
      console.log('✅ Order summary prices loaded')
      return true
    }
    catch {
      console.warn('⚠️  Order summary still shows 0,00€ after timeout')
      return false
    }
  }

  /**
   * Inject cart data directly into cookie (for test setup)
   * Use this to seed cart state before navigation without going through UI
   */
  async setCartCookie(items: CartItem[]): Promise<void> {
    const cartData = {
      items,
      sessionId: `test_cart_${Date.now()}`,
      lastSyncAt: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      version: '1.0',
    }

    const url = new URL(this.page.url())
    await this.page.context().addCookies([{
      name: CART_COOKIE_NAME,
      value: encodeURIComponent(JSON.stringify(cartData)),
      domain: url.hostname,
      path: '/',
      expires: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 30), // 30 days
      sameSite: 'Lax',
      secure: url.protocol === 'https:',
    }])

    console.log(`🍪 Cart cookie set with ${items.length} items`)
  }

  /**
   * Clear cart cookie (for test cleanup)
   */
  async clearCartCookie(): Promise<void> {
    const url = new URL(this.page.url())
    await this.page.context().clearCookies({ name: CART_COOKIE_NAME, domain: url.hostname })
    console.log('🍪 Cart cookie cleared')
  }
}

// Type for cart items when injecting cookie directly
export interface CartItem {
  id: string
  product: {
    id: string
    name: string
    price: number
    image?: string
  }
  quantity: number
}
