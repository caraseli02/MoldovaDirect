/**
 * Checkout middleware for protecting checkout routes and validating checkout state
 *
 * Requirements addressed:
 * - 1.1: Redirect to checkout from cart with items validation
 * - 1.2: Prevent access to checkout with empty cart
 * - 6.1: Mobile-responsive checkout protection
 * - 6.5: Clear progress indicators and navigation protection
 */

import { useCartStore } from '~/stores/cart'
import { useCheckoutStore } from '~/stores/checkout'
import { useCart } from '~/composables/useCart'

export default defineNuxtRouteMiddleware(async (to) => {
  const localePath = useLocalePath()

  // Extract the checkout step from path first
  const stepFromPath = extractStepFromPath(to.path)

  // Skip ALL validation for confirmation page - order is done, cart is cleared
  // This allows users to reload the confirmation page after completing checkout
  // even though the cart has been cleared and session might be reset
  if (stepFromPath === 'confirmation') {
    return // Allow confirmation page access without any checks
  }

  // CRITICAL FIX v2: ALL store access must be client-side only
  // During SSR, stores are not initialized yet, so we allow the navigation
  // and perform all validations on the client side after hydration
  if (!import.meta.client) {
    return // Allow SSR to continue, validations happen on client
  }

  // === CLIENT-SIDE ONLY FROM HERE ===

  // 1. Initialize cart first to fix race condition
  // Ensure cart is loaded from cookie before checking item count
  const cartStore = useCartStore()
  if (!cartStore.sessionId) {
    console.log('🛒 [Checkout Middleware] Initializing cart before validation')
    await cartStore.initializeCart()
  }

  // 2. Now safely get cart data after ensuring it's initialized
  const { items, itemCount } = useCart()

  // 3. Check if cart has items (Requirement 1.1, 1.2)
  if (itemCount.value === 0) {
    console.log('🛒 [Checkout Middleware] Cart is empty, redirecting to cart')
    return navigateTo({
      path: localePath('/cart'),
      query: {
        message: 'empty-cart-checkout',
      },
    })
  }

  // 4. Now it's safe to access checkout store (cart is initialized)
  const checkoutStore = useCheckoutStore() as ReturnType<typeof useCheckoutStore> & Record<string, any>

  // 5. Initialize checkout if not already initialized
  if (!checkoutStore.sessionId) {
    try {
      console.log('🛒 [Checkout Middleware] Initializing checkout session')
      await checkoutStore.initializeCheckout(items.value)
    }
    catch (error) {
      console.error('Failed to initialize checkout:', error)
      return navigateTo({
        path: localePath('/cart'),
        query: {
          message: 'checkout-initialization-failed',
        },
      })
    }
  }

  // 6. Prefetch all checkout data in parallel (only once per session)
  if (!checkoutStore.dataPrefetched) {
    try {
      console.log('📥 [Checkout Middleware] Prefetching user data (addresses, preferences)...')
      await checkoutStore.prefetchCheckoutData()
      console.log('✅ [Checkout Middleware] Prefetch complete')
    }
    catch (error) {
      console.error('❌ [Checkout Middleware] Failed to prefetch checkout data:', error)
    }
  }

  // 6.5. Auto-routing for express checkout (Hybrid approach)
  // Only auto-route if:
  // - Data is prefetched (user preferences loaded)
  // - User has complete shipping info (address + method)
  // - User has a saved preferred shipping method
  // - User is landing on base /checkout path (not already on a specific step)
  if (checkoutStore.dataPrefetched) {
    const hasCompleteShipping = checkoutStore.canProceedToPayment
    const preferredMethod = checkoutStore.preferences?.preferred_shipping_method

    // Auto-route to payment if all conditions met
    if (hasCompleteShipping && preferredMethod && to.path === localePath('/checkout')) {
      console.log('🚀 [Checkout Middleware] Express checkout: Auto-routing to payment step')
      console.log('   - Complete shipping info: ✓')
      console.log('   - Preferred method saved: ✓')
      console.log('   - Landing on base checkout: ✓')

      return navigateTo({
        path: localePath('/checkout/payment'),
        query: { express: '1' }, // Flag for showing countdown banner
      })
    }
  }

  // 7. Validate checkout session hasn't expired
  if (checkoutStore.isSessionExpired) {
    console.log('🛒 [Checkout Middleware] Session expired, redirecting to cart')
    checkoutStore.resetCheckout()
    return navigateTo({
      path: localePath('/cart'),
      query: {
        message: 'checkout-session-expired',
      },
    })
  }

  // 8. Step-specific validations
  if (stepFromPath) {
    // Validate that user can access the requested step
    if (!canAccessStep(stepFromPath, checkoutStore)) {
      const allowedStep = getHighestAllowedStep(checkoutStore)
      const redirectPath = getStepPath(allowedStep, localePath)
      console.log(`🛒 [Checkout Middleware] Access denied to ${stepFromPath}, redirecting to ${allowedStep}`)

      return navigateTo({
        path: redirectPath,
        query: {
          message: 'step-access-denied',
        },
      })
    }

    // Update checkout store with current step
    if (checkoutStore.currentStep !== stepFromPath) {
      checkoutStore.goToStep(stepFromPath)
    }
  }
})

/**
 * Extract checkout step from the current path
 */
function extractStepFromPath(path: string): CheckoutStep | null {
  if (path.includes('/checkout/shipping')) return 'shipping'
  if (path.includes('/checkout/payment')) return 'payment'
  if (path.includes('/checkout/review')) return 'review'
  if (path.includes('/checkout/confirmation')) return 'confirmation'
  if (path.includes('/checkout')) return 'shipping' // Default to shipping for base checkout path
  return null
}

/**
 * Check if user can access a specific checkout step
 */
function canAccessStep(step: CheckoutStep, store: ReturnType<typeof useCheckoutStore> & Record<string, any>): boolean {
  switch (step) {
    case 'shipping':
      return true // Always accessible

    case 'payment':
      return store.canProceedToPayment

    case 'review':
      return store.canProceedToReview

    case 'confirmation':
      // Allow if already on confirmation page (order completed)
      // OR if coming from review page (order just placed - navigation happens before store updates)
      // OR if we have orderId set (order was created)
      return store.currentStep === 'confirmation'
        || store.currentStep === 'review'
        || Boolean(store.orderData?.orderId)

    default:
      return false
  }
}

/**
 * Get the highest step the user can currently access
 */
function getHighestAllowedStep(store: ReturnType<typeof useCheckoutStore> & Record<string, any>): CheckoutStep {
  if (store.canCompleteOrder && store.orderData?.orderId) {
    return 'confirmation'
  }
  else if (store.canProceedToReview) {
    return 'review'
  }
  else if (store.canProceedToPayment) {
    return 'payment'
  }
  else {
    return 'shipping'
  }
}

/**
 * Get the path for a specific checkout step
 */
function getStepPath(step: CheckoutStep, localePath: (path: string) => string): string {
  switch (step) {
    case 'shipping':
      return localePath('/checkout')
    case 'payment':
      return localePath('/checkout/payment')
    case 'review':
      return localePath('/checkout/review')
    case 'confirmation':
      return localePath('/checkout/confirmation')
    default:
      return localePath('/checkout')
  }
}

// Type definition for checkout steps
type CheckoutStep = 'shipping' | 'payment' | 'review' | 'confirmation'
