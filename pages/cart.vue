<template>
  <div class="py-12">
    <div class="container">
      <h1 class="text-4xl font-bold mb-8">{{ $t('common.cart') }}</h1>
      
      <ErrorBoundary
        :fallback-action="() => navigateTo(localePath('/products'))"
        fallback-action-text="Continuar comprando"
        @error="handleCartError"
      >
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-20">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p class="mt-4 text-gray-600">{{ $t('common.loading') }}</p>
        </div>
      
      <!-- Empty Cart -->
      <div v-else-if="isEmpty" class="text-center py-20" data-testid="empty-cart-message">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h2 class="text-2xl font-semibold text-gray-900 mb-2">{{ $t('products.cartEmpty') }}</h2>
        <p class="text-gray-600 mb-6">{{ $t('products.cartEmptyDescription') }}</p>
        <NuxtLink 
          :to="localePath('/products')" 
          class="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
        >
          {{ $t('common.continueShopping') }}
        </NuxtLink>
      </div>

      <!-- Cart Items -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Cart Items List -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-lg shadow-sm border border-gray-200">
            <div class="p-6">
              <h2 class="text-lg font-semibold mb-4">{{ $t('common.cart') }} ({{ itemCount }})</h2>
              
              <div class="space-y-4">
                <div 
                  v-for="item in items" 
                  :key="item.id"
                  :data-testid="`cart-item-${item.product.id}`"
                  class="flex items-center space-x-4 p-4 border border-gray-100 rounded-lg"
                >
                  <!-- Product Image -->
                  <div class="flex-shrink-0">
                    <img 
                      :src="item.product.images[0] || '/placeholder-product.jpg'" 
                      :alt="item.product.name"
                      class="w-16 h-16 object-cover rounded-lg"
                    >
                  </div>
                  
                  <!-- Product Info -->
                  <div class="flex-1 min-w-0">
                    <h3 class="text-sm font-medium text-gray-900 truncate">
                      {{ item.product.name }}
                    </h3>
                    <p class="text-sm text-gray-500">
                      {{ formatPrice(item.product.price) }} each
                    </p>
                  </div>
                  
                  <!-- Quantity Controls -->
                  <div class="flex items-center space-x-2">
                    <button 
                      @click="safeUpdateQuantity(item.id, item.quantity - 1)"
                      :disabled="loading"
                      :data-testid="`decrease-quantity-${item.product.id}`"
                      class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                      </svg>
                    </button>
                    
                    <span class="w-8 text-center text-sm font-medium" :data-testid="`quantity-display-${item.product.id}`">{{ item.quantity }}</span>
                    
                    <button 
                      @click="safeUpdateQuantity(item.id, item.quantity + 1)"
                      :disabled="loading || item.quantity >= item.product.stock"
                      :data-testid="`increase-quantity-${item.product.id}`"
                      class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                  </div>
                  
                  <!-- Item Total -->
                  <div class="text-right">
                    <p class="text-sm font-medium text-gray-900">
                      {{ formatPrice(item.product.price * item.quantity) }}
                    </p>
                  </div>
                  
                  <!-- Remove Button -->
                  <button 
                    @click="safeRemoveItem(item.id)"
                    :disabled="loading"
                    :data-testid="`remove-item-${item.product.id}`"
                    class="text-red-500 hover:text-red-700 disabled:opacity-50"
                    :title="$t('common.remove')"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Cart Summary -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-4">
            <div class="p-6">
              <h2 class="text-lg font-semibold mb-4">{{ $t('common.orderSummary') }}</h2>
              
              <div class="space-y-3">
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">{{ $t('common.subtotal') }}</span>
                  <span class="font-medium">{{ formattedSubtotal }}</span>
                </div>
                
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">{{ $t('common.shipping') }}</span>
                  <span class="font-medium">{{ $t('common.checkout') }}</span>
                </div>
                
                <div class="border-t border-gray-200 pt-3">
                  <div class="flex justify-between">
                    <span class="text-base font-semibold">{{ $t('common.total') }}</span>
                    <span class="text-base font-semibold">{{ formattedSubtotal }}</span>
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
                  class="block w-full text-center py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {{ $t('common.continueShopping') }}
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>
      </ErrorBoundary>
    </div>
  </div>
</template>

<script setup lang="ts">
const localePath = useLocalePath()
const toast = useToast()

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
  formatPrice,
  formattedSubtotal,
  validateCart
} = useCart()

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

// Validate cart on page load with error handling
onMounted(async () => {
  try {
    await validateCart()
  } catch (error) {
    console.error('Failed to validate cart:', error)
    toast.error('Error de validación', 'No se pudo validar el carrito')
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