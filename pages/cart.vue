<template>
  <div class="py-4 md:py-12 pb-32 md:pb-12">
    <div class="container px-4 md:px-6">
      <h1 class="text-2xl md:text-4xl font-bold mb-4 md:mb-8 text-gray-900 dark:text-white">{{ $t('common.cart') }}</h1>
      
      <commonErrorBoundary
        :fallback-action="() => navigateTo(localePath('/products'))"
        fallback-action-text="Continuar comprando"
        @error="handleCartError"
      >
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-20">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p class="mt-4 text-gray-600 dark:text-gray-400">{{ $t('common.loading') }}</p>
        </div>
      
      <!-- Empty Cart -->
      <div v-else-if="isEmpty" class="text-center py-20" data-testid="empty-cart-message">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h2 class="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white mb-2">{{ $t('products.cartEmpty') }}</h2>
        <p class="text-gray-600 dark:text-gray-400 mb-6 px-4">{{ $t('products.cartEmptyDescription') }}</p>
        <NuxtLink 
          :to="localePath('/products')" 
          class="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
        >
          {{ $t('common.continueShopping') }}
        </NuxtLink>
      </div>

      <!-- Cart Items -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
        <!-- Cart Items List -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Bulk Operations -->
          <CartBulkOperations />

          <!-- Cart Items -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div class="p-4 md:p-6">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg font-semibold text-gray-900 dark:text-white">{{ $t('common.cart') }} ({{ itemCount }})</h2>
                
                <!-- Select All Toggle -->
                <div class="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    :checked="allItemsSelected"
                    @change="toggleSelectAll"
                    class="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 bg-white dark:bg-gray-700"
                  >
                  <label class="text-sm text-gray-600 dark:text-gray-400">
                    {{ allItemsSelected ? 'Deseleccionar todo' : 'Seleccionar todo' }}
                  </label>
                </div>
              </div>
              
              <div class="space-y-2 md:space-y-4">
                <CartItem
                  v-for="item in items" 
                  :key="item.id"
                  :item="item"
                  :loading="loading"
                  :data-testid="`cart-item-${item.product.id}`"
                  @update-quantity="safeUpdateQuantity"
                  @remove-item="safeRemoveItem"
                  @swipe-remove="handleSwipeRemove"
                  @save-for-later="handleSaveForLater"
                  @toggle-selection="handleToggleSelection"
                />
              </div>
            </div>
          </div>

          <!-- Saved for Later -->
          <CartSavedForLater />

          <!-- Recommendations -->
          <CartRecommendations />
        </div>

        <!-- Cart Summary - Desktop -->
        <div class="hidden lg:block lg:col-span-1">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 sticky top-4">
            <div class="p-6">
              <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{{ $t('common.orderSummary') }}</h2>
              
              <div class="space-y-3">
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600 dark:text-gray-400">{{ $t('common.subtotal') }}</span>
                  <span class="font-medium text-gray-900 dark:text-white">{{ formattedSubtotal }}</span>
                </div>
                
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600 dark:text-gray-400">{{ $t('common.shipping') }}</span>
                  <span class="font-medium text-gray-900 dark:text-white">{{ $t('common.checkout') }}</span>
                </div>
                
                <div class="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <div class="flex justify-between">
                    <span class="text-base font-semibold text-gray-900 dark:text-white">{{ $t('common.total') }}</span>
                    <span class="text-base font-semibold text-gray-900 dark:text-white">{{ formattedSubtotal }}</span>
                  </div>
                </div>
              </div>
              
              <div class="mt-6 space-y-3">
                <button 
                  class="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors font-medium"
                  :disabled="loading || isEmpty"
                >
                  {{ $t('common.checkout') }}
                </button>
                
                <NuxtLink 
                  :to="localePath('/products')" 
                  class="block w-full text-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white"
                >
                  {{ $t('common.continueShopping') }}
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>
      </commonErrorBoundary>
    </div>

    <!-- Mobile Sticky Cart Summary -->
    <div 
      v-if="!isEmpty" 
      class="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg z-50"
    >
      <div class="p-4">
        <!-- Expandable Summary -->
        <div class="mb-3">
          <button 
            @click="showMobileSummary = !showMobileSummary"
            class="w-full flex items-center justify-between text-sm text-gray-600 dark:text-gray-400"
          >
            <span>{{ $t('common.orderSummary') }}</span>
            <div class="flex items-center space-x-2">
              <span class="font-semibold text-gray-900 dark:text-white">{{ formattedSubtotal }}</span>
              <svg 
                :class="['w-4 h-4 transition-transform', showMobileSummary ? 'rotate-180' : '']"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>
          
          <!-- Expanded Summary -->
          <div 
            v-show="showMobileSummary"
            class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2"
          >
            <div class="flex justify-between text-sm">
              <span class="text-gray-600 dark:text-gray-400">{{ $t('common.subtotal') }}</span>
              <span class="font-medium text-gray-900 dark:text-white">{{ formattedSubtotal }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600 dark:text-gray-400">{{ $t('common.shipping') }}</span>
              <span class="font-medium text-gray-900 dark:text-white">{{ $t('common.checkout') }}</span>
            </div>
          </div>
        </div>
        
        <!-- Action Buttons -->
        <div class="space-y-2">
          <button 
            class="w-full bg-primary-600 text-white py-4 px-4 rounded-lg hover:bg-primary-700 transition-colors font-medium text-lg"
            :disabled="loading || isEmpty"
          >
            {{ $t('common.checkout') }}
          </button>
          
          <NuxtLink 
            :to="localePath('/products')" 
            class="block w-full text-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white"
          >
            {{ $t('common.continueShopping') }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Cart allows guest access - users can view cart without authentication
// Authentication is only required at checkout

// Import advanced cart components
import CartBulkOperations from '~/components/cart/BulkOperations.vue'
import CartSavedForLater from '~/components/cart/SavedForLater.vue'
import CartRecommendations from '~/components/cart/Recommendations.vue'

const localePath = useLocalePath()
const toast = useToast()

// Mobile UI state
const showMobileSummary = ref(false)

// Cart functionality
const {
  items,
  itemCount,
  subtotal,
  isEmpty,
  loading,
  error,
  updateQuantity,
  removeItem,
  validateCart,
  // Advanced features
  allItemsSelected,
  toggleItemSelection,
  toggleSelectAll: toggleSelectAllItems,
  addToSavedForLater,
  } = useCart()

// Utility functions
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(price)
}

const formattedSubtotal = computed(() => formatPrice(subtotal.value))

// Error handling for cart operations
const handleCartError = (error: Error) => {
  console.error('Cart page error:', error)
  toast.error('Error en el carrito', error.message)
}

// Enhanced cart operations with error handling
const safeUpdateQuantity = async (itemId: string, quantity: number) => {
  try {
    await updateQuantity(itemId, quantity)
  } catch (error) {
    // Error is already handled by the store with toast notifications
    console.error('Failed to update quantity:', error)
  }
}

const safeRemoveItem = async (itemId: string) => {
  try {
    await removeItem(itemId)
  } catch (error) {
    // Error is already handled by the store with toast notifications
    console.error('Failed to remove item:', error)
  }
}

// Handle swipe-to-remove functionality
const handleSwipeRemove = async (itemId: string) => {
  try {
    await removeItem(itemId)
    // Add haptic feedback if available
    if ('vibrate' in navigator) {
      navigator.vibrate(50)
    }
  } catch (error) {
    console.error('Failed to remove item via swipe:', error)
  }
}

// Handle save for later
const handleSaveForLater = async (itemId: string) => {
  try {
    // Find the item first
    const item = items.value.find(i => i.id === itemId)
    if (item) {
      await addToSavedForLater(item.product, item.quantity)
      await removeItem(itemId)
    }
  } catch (error) {
    console.error('Failed to save item for later:', error)
  }
}

// Handle item selection toggle
const handleToggleSelection = (itemId: string) => {
  toggleItemSelection(itemId)
}

// Handle select all toggle
const toggleSelectAll = () => {
  toggleSelectAllItems()
}

// Validate cart on page load with error handling
onMounted(async () => {
  try {
    await validateCart()
  } catch (error) {
    console.error('Failed to validate cart:', error)
    toast.error('Error de validación', 'No se pudo validar el carrito')
  }
})

// Component cleanup on unmount
onUnmounted(() => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Cart page unmounted')
  }
})

// SEO Meta
useHead({
  title: 'Shopping Cart - Moldova Direct',
  meta: [
    {
      name: 'description',
      content: 'Review your selected Moldovan products and proceed to checkout.'
    }
  ]
})
</script>