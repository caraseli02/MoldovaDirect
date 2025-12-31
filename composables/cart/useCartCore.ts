/**
 * Cart Core Composable
 *
 * Provides a clean interface for basic cart operations
 * This composable can be used independently of the Pinia store
 */

import { computed, type ComputedRef } from 'vue'
import { useCartCore as useCartCoreModule } from '~/stores/cart/core'
import type { Product, CartItem } from '~/stores/cart/types'

export interface UseCartCoreReturn {
  // State
  items: ComputedRef<readonly CartItem[]>
  sessionId: ComputedRef<string | null>
  loading: ComputedRef<boolean>
  error: ComputedRef<string | null>

  // Getters
  itemCount: ComputedRef<number>
  subtotal: ComputedRef<number>
  isEmpty: ComputedRef<boolean>

  // Actions
  addItem: (product: Product, quantity: number) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>

  // Utilities
  getItemByProductId: (productId: string) => CartItem | undefined
  isInCart: (productId: string) => boolean
  generateItemId: () => string
  generateSessionId: () => string
  initializeCart: () => void
}

/**
 * Cart core composable
 *
 * Provides access to basic cart functionality without requiring Pinia
 * This is useful for components that need cart functionality but want to
 * avoid direct store dependencies
 */
export function useCartCore(): UseCartCoreReturn {
  const cartCore = useCartCoreModule()

  return {
    // State
    items: computed(() => cartCore.state.value.items) as ComputedRef<readonly CartItem[]>,
    sessionId: computed(() => cartCore.state.value.sessionId),
    loading: computed(() => cartCore.state.value.loading),
    error: computed(() => cartCore.state.value.error),

    // Getters
    itemCount: cartCore.itemCount,
    subtotal: cartCore.subtotal,
    isEmpty: cartCore.isEmpty,

    // Actions
    addItem: cartCore.addItem,
    removeItem: cartCore.removeItem,
    updateQuantity: cartCore.updateQuantity,
    clearCart: cartCore.clearCart,

    // Utilities
    getItemByProductId: cartCore.getItemByProductId,
    isInCart: cartCore.isInCart,
    generateItemId: cartCore.generateItemId,
    generateSessionId: cartCore.generateSessionId,
    initializeCart: cartCore.initializeCart,
  }
}

/**
 * Cart core composable with Pinia availability check
 *
 * This version checks if Pinia is available before initializing
 * Provides graceful fallbacks for SSR and timing issues
 */
export function useCartCoreWithFallback(): UseCartCoreReturn | null {
  try {
    // Check if we're in a client environment
    if (typeof window === 'undefined') {
      return null
    }

    // Try to use the cart core
    return useCartCore()
  }
  catch (error: unknown) {
    console.warn('Cart core not available:', error)
    return null
  }
}

/**
 * Safe cart core composable
 *
 * Returns a minimal interface when the cart system is not available
 * Useful for components that need to handle cart unavailability gracefully
 */
export function useSafeCartCore(): UseCartCoreReturn {
  const cartCore = useCartCoreWithFallback()

  if (cartCore) {
    return cartCore
  }

  // Return minimal fallback interface
  return {
    // State
    items: computed(() => []),
    sessionId: computed(() => null),
    loading: computed(() => false),
    error: computed(() => null),

    // Getters
    itemCount: computed(() => 0),
    subtotal: computed(() => 0),
    isEmpty: computed(() => true),

    // Actions (no-op implementations)
    addItem: async () => {
      console.warn('Cart not available: addItem called')
    },
    removeItem: async () => {
      console.warn('Cart not available: removeItem called')
    },
    updateQuantity: async () => {
      console.warn('Cart not available: updateQuantity called')
    },
    clearCart: async () => {
      console.warn('Cart not available: clearCart called')
    },

    // Utilities
    getItemByProductId: () => undefined,
    isInCart: () => false,
    generateItemId: () => 'fallback_' + Date.now(),
    generateSessionId: () => 'fallback_session_' + Date.now(),
    initializeCart: () => {
      console.warn('Cart not available: initializeCart called')
    },
  }
}
