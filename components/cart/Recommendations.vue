<template>
  <div
    v-if="recommendations && recommendations.length > 0"
    class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
  >
    <div class="p-4 md:p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ $t('cart.recommendedProducts') }}
        </h3>

        <Button
          v-if="!recommendationsLoading"
          variant="link"
          size="sm"
          class="text-sm text-blue-600 dark:text-blue-400 hover:underline p-0 h-auto"
          @click="handleLoadRecommendations"
        >
          {{ $t('common.refresh') }}
        </Button>
      </div>

      <!-- Loading State -->
      <div
        v-if="recommendationsLoading"
        class="flex items-center justify-center py-8"
      >
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span class="ml-2 text-sm text-gray-600 dark:text-gray-400">{{ $t('common.loading') }}</span>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="recommendations.length === 0"
        class="text-center py-8"
      >
        <svg
          class="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {{ $t('cart.recommendations.noRecommendations') }}
        </p>
      </div>

      <!-- Recommendations Grid -->
      <div
        v-else
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <div
          v-for="recommendation in recommendations"
          :key="recommendation.id"
          class="border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:shadow-md transition-shadow"
        >
          <!-- Product Image -->
          <div class="aspect-square mb-3">
            <NuxtImg
              :src="recommendation.product.images?.[0] || '/placeholder-product.svg'"
              :alt="recommendation.product.name"
              class="w-full h-full object-cover rounded-lg"
              loading="lazy"
            />
          </div>

          <!-- Product Details -->
          <div class="space-y-2">
            <h4 class="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
              {{ recommendation.product.name }}
            </h4>

            <div class="flex items-center justify-between">
              <span class="text-sm font-semibold text-gray-900 dark:text-white">
                {{ formatPrice(recommendation.product.price) }}
              </span>

              <span class="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                {{ getReasonText(recommendation.reason) }}
              </span>
            </div>

            <!-- Add to Cart Button -->
            <Button
              :disabled="isInCart(recommendation.product.id)"
              size="sm"
              class="w-full text-xs bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              @click="handleAddToCart(recommendation.product as any)"
            >
              {{ isInCart(recommendation.product.id) ? $t('cart.inCart') : $t('cart.addToCart') }}
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import type { Product } from '~/stores/cart/types'

const toast = useToast()

// Cart functionality
const {
  recommendations,
  recommendationsLoading,
  loadRecommendations,
  addItem,
  isInCart,
} = useCart()

// Load recommendations on mount
onMounted(async () => {
  if (!recommendations.value || recommendations.value.length === 0) {
    try {
      await handleLoadRecommendations()
    }
    catch {
      // Silently handle recommendation loading errors
    }
  }
})

// Utility functions
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(price)
}

const getReasonText = (reason: string) => {
  const reasonMap: Record<string, string> = {
    frequently_bought_together: 'Comprados juntos',
    similar_products: 'Productos similares',
    price_drop: 'Precio rebajado',
    back_in_stock: 'Disponible otra vez',
  }
  return reasonMap[reason] || 'Recomendado'
}

// Handle recommendations operations
const handleLoadRecommendations = async () => {
  try {
    await loadRecommendations()
  }
  catch (error: any) {
    // Only show error toast for non-404 errors
    if (error.statusCode !== 404) {
      console.error('Failed to load recommendations:', error)
      toast.error('Error', 'No se pudieron cargar las recomendaciones')
    }
    // API not available (404)
  }
}

const handleAddToCart = async (product: Product) => {
  try {
    await addItem(product, 1)
    toast.success('Producto añadido', `${product.name} ha sido añadido al carrito`)
  }
  catch (error: any) {
    console.error('Failed to add recommended product to cart:', error)
    toast.error('Error', 'No se pudo añadir el producto al carrito')
  }
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
