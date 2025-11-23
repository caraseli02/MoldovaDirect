/**
 * Checkout middleware for protecting checkout routes and validating checkout state
 *
 * Requirements addressed:
 * - 1.1: Redirect to checkout from cart with items validation
 * - 1.2: Prevent access to checkout with empty cart
 * - 6.1: Mobile-responsive checkout protection
 * - 6.5: Clear progress indicators and navigation protection
 */

export default defineNuxtRouteMiddleware((to) => {
  const localePath = useLocalePath()
  const { items, itemCount } = useCart()
  const checkoutStore = useCheckoutStore()

  // Extract the checkout step from path first
  const stepFromPath = extractStepFromPath(to.path)

  // Skip ALL validation for confirmation page - order is done, cart is cleared
  // This allows users to reload the confirmation page after completing checkout
  // even though the cart has been cleared and session might be reset
  if (stepFromPath === 'confirmation') {
    return // Allow confirmation page access without any checks
  }

  // Check if cart has items (Requirement 1.1, 1.2)
  if (itemCount.value === 0) {
    // Redirect to cart page with message about empty cart
    return navigateTo({
      path: localePath('/cart'),
      query: {
        message: 'empty-cart-checkout'
      }
    })
  }

  // Initialize checkout if not already initialized
  if (!checkoutStore.sessionId) {
    try {
      // Initialize checkout with current cart items
      checkoutStore.initializeCheckout(items.value)
    } catch (error) {
      console.error('Failed to initialize checkout:', error)
      
      // Redirect to cart with error message
      return navigateTo({
        path: localePath('/cart'),
        query: {
          message: 'checkout-initialization-failed'
        }
      })
    }
  }

  // Validate checkout session hasn't expired
  if (checkoutStore.isSessionExpired) {
    // Clear expired session and redirect to cart
    checkoutStore.resetCheckout()
    
    return navigateTo({
      path: localePath('/cart'),
      query: {
        message: 'checkout-session-expired'
      }
    })
  }

  // Step-specific validations
  const currentPath = to.path
  
  if (stepFromPath) {
    // Validate that user can access the requested step
    if (!canAccessStep(stepFromPath, checkoutStore)) {
      // Redirect to the appropriate step
      const allowedStep = getHighestAllowedStep(checkoutStore)
      const redirectPath = getStepPath(allowedStep, localePath)

      return navigateTo({
        path: redirectPath,
        query: {
          message: 'step-access-denied'
        }
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
function canAccessStep(step: CheckoutStep, store: any): boolean {
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
      return store.currentStep === 'confirmation' ||
             store.currentStep === 'review' ||
             Boolean(store.orderData?.orderId)

    default:
      return false
  }
}

/**
 * Get the highest step the user can currently access
 */
function getHighestAllowedStep(store: any): CheckoutStep {
  if (store.canCompleteOrder && store.orderData?.orderId) {
    return 'confirmation'
  } else if (store.canProceedToReview) {
    return 'review'
  } else if (store.canProceedToPayment) {
    return 'payment'
  } else {
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