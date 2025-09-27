<template>
  <div v-if="shouldShowRecommendations" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mt-6">
    <div class="p-4 md:p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
          También te puede interesar
        </h2>
        <button
          @click="refreshRecommendations"
          :disabled="recommendationsLoading"
          class="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline disabled:opacity-50"
        >
          <span v-if="recommendationsLoading">Cargando...</span>
          <span v-else>Actualizar</span>
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="recommendationsLoading" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>

      <!-- Recommendations Grid -->
      <div v-else-if="recommendations.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="product in recommendations"
          :key="product.id"
          class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow bg-white dark:bg-gray-900"
        >
          <!-- Product Image -->
          <div class="aspect-square mb-3">
            <img 
              :src="product.primaryImage || product.images?.[0]?.url || '/placeholder-product.jpg'" 
              :alt="getLocalizedText(product.name)"
              class="w-full h-full object-cover rounded-lg"
            >
          </div>
          
          <!-- Product Info -->
          <div class="space-y-2">
            <h3 class="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
              {{ getLocalizedText(product.name) }}
            </h3>
            
            <div class="flex items-center justify-between">
              <span class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ formatPrice(product.price) }}
              </span>
              
              <div class="flex items-center space-x-1">
                <button
                  @click="quickAdd(product, 1)"
                  :disabled="isInCart(product.id) || product.stockQuantity === 0"
                  class="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg v-if="isInCart(product.id)" class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <svg v-else class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  
                  <span v-if="isInCart(product.id)">En carrito</span>
                  <span v-else-if="product.stockQuantity === 0">Agotado</span>
                  <span v-else>Añadir</span>
                </button>
              </div>
            </div>
            
            <!-- Stock indicator -->
            <div v-if="product.stockQuantity > 0 && product.stockQuantity <= 5" class="text-xs text-orange-600 dark:text-orange-400">
              Solo {{ product.stockQuantity }} disponibles
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-8 text-gray-500 dark:text-gray-400">
        <svg class="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <p>No hay recomendaciones disponibles en este momento</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { locale } = useI18n()

import { formatPrice } from '~/types/guards'

const {
  recommendations,
  recommendationsLoading,
  loadRecommendations,
  addRecommendedProduct,
  isInCart,
  itemCount
} = useCart()

const toast = useToast()

// Helper function to get localized text from translation objects
const getLocalizedText = (translationObj: any): string => {
  if (!translationObj) return ''
  
  if (typeof translationObj === 'string') {
    return translationObj
  }
  
  if (typeof translationObj === 'object') {
    const currentLocale = locale.value || 'es'
    return translationObj[currentLocale] || translationObj.es || translationObj.en || ''
  }
  
  return String(translationObj)
}

// Only show recommendations if cart has items
const shouldShowRecommendations = computed(() => {
  return itemCount.value > 0
})

const quickAdd = async (product: any, quantity: number = 1) => {
  try {
    await addRecommendedProduct(product, quantity)
  } catch (error) {
    // Error is already handled by the store
    console.error('Failed to add recommended product:', error)
  }
}

const refreshRecommendations = async () => {
  await loadRecommendations()
}

// Load recommendations when component mounts and cart has items
onMounted(() => {
  if (shouldShowRecommendations.value) {
    loadRecommendations()
  }
})

// Watch for cart changes to reload recommendations
watch(() => itemCount.value, (newCount, oldCount) => {
  // Load recommendations when items are added to an empty cart
  if (oldCount === 0 && newCount > 0) {
    loadRecommendations()
  }
  // Clear recommendations when cart becomes empty
  else if (newCount === 0 && oldCount > 0) {
    // Clear recommendations handled by store
  }
})
</script>

