<template>
  <div
    v-if="showComponent"
    class="mt-6"
  >
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <h3 class="font-semibold text-zinc-900 dark:text-white text-base">
        {{ $t('cart.recommendedProducts') }}
      </h3>
      <button
        v-if="!recommendationsLoading"
        class="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
        @click="handleLoadRecommendations"
      >
        {{ $t('common.refresh') }}
      </button>
      <div
        v-else
        class="w-4 h-4 animate-spin rounded-full border-2 border-zinc-300 border-t-primary-600"
      ></div>
    </div>

    <!-- Loading State (only show full loading on initial load when no cached data) -->
    <div
      v-if="recommendationsLoading && displayRecommendations.length === 0"
      class="flex items-center justify-center py-8"
    >
      <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
      <span class="ml-2 text-sm text-zinc-500 dark:text-zinc-400">{{ $t('common.loading') }}</span>
    </div>

    <!-- Error State -->
    <div
      v-else-if="hasError && displayRecommendations.length === 0"
      class="text-center py-6"
    >
      <p class="text-sm text-red-500 dark:text-red-400 mb-2">
        {{ $t('cart.recommendations.loadFailed') }}
      </p>
      <button
        class="text-sm text-primary-600 dark:text-primary-400 hover:underline"
        @click="handleLoadRecommendations"
      >
        {{ $t('actions.retry', 'Retry') }}
      </button>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!recommendationsLoading && displayRecommendations.length === 0"
      class="text-center py-6 text-zinc-500 dark:text-zinc-400"
    >
      <p class="text-sm">
        {{ $t('cart.recommendations.noRecommendations') }}
      </p>
    </div>

    <!-- Horizontal Scroll Recommendations (Mobile only) -->
    <div
      v-else
      class="lg:hidden flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide"
    >
      <div
        v-for="recommendation in displayRecommendations"
        :key="recommendation.id"
        class="flex-shrink-0 w-36 md:w-40 bg-white dark:bg-zinc-800/60 rounded-xl border border-zinc-200 dark:border-zinc-700/50 p-3 snap-start hover:shadow-md transition-shadow"
      >
        <!-- Product Image -->
        <div class="w-full aspect-square bg-zinc-100 dark:bg-zinc-700 rounded-lg mb-3 overflow-hidden">
          <NuxtImg
            :src="recommendation.product.images?.[0] || '/placeholder-product.svg'"
            :alt="getProductName(recommendation.product.name)"
            class="w-full h-full object-cover"
            loading="lazy"
          />
        </div>

        <!-- Product Details -->
        <h4 class="font-medium text-zinc-900 dark:text-white text-sm line-clamp-2 min-h-[2.5rem]">
          {{ getProductName(recommendation.product.name) }}
        </h4>

        <!-- Price & Add Button -->
        <div class="flex items-center justify-between mt-2">
          <span class="font-bold text-zinc-900 dark:text-white">
            {{ formatPrice(recommendation.product.price) }}
          </span>
          <button
            :disabled="isInCart(recommendation.product.id)"
            :aria-label="isInCart(recommendation.product.id) ? $t('cart.inCart') : $t('cart.addToCart')"
            class="w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            :class="isInCart(recommendation.product.id)
              ? 'bg-zinc-100 dark:bg-zinc-700 text-zinc-400'
              : 'bg-primary-600 text-white hover:bg-primary-700'"
            @click="handleAddToCart(recommendation.product)"
          >
            <svg
              v-if="isInCart(recommendation.product.id)"
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <svg
              v-else
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 6v12m6-6H6"
              />
            </svg>
          </button>
        </div>

        <!-- Reason Badge -->
        <span class="inline-block mt-2 text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-700/50 px-2 py-0.5 rounded">
          {{ getReasonText(recommendation.reason) }}
        </span>
      </div>
    </div>

    <!-- Desktop Grid View (hidden on mobile, only show when we have recommendations) -->
    <div
      v-if="displayRecommendations.length > 0"
      class="hidden lg:grid lg:grid-cols-3 gap-4"
    >
      <div
        v-for="recommendation in displayRecommendations.slice(0, 3)"
        :key="`desktop-${recommendation.id}`"
        class="bg-white dark:bg-zinc-800/60 rounded-xl border border-zinc-200 dark:border-zinc-700/50 p-4 hover:shadow-md transition-shadow"
      >
        <!-- Product Image -->
        <div class="aspect-square bg-zinc-100 dark:bg-zinc-700 rounded-lg mb-3 overflow-hidden">
          <NuxtImg
            :src="recommendation.product.images?.[0] || '/placeholder-product.svg'"
            :alt="getProductName(recommendation.product.name)"
            class="w-full h-full object-cover"
            loading="lazy"
          />
        </div>

        <!-- Product Details -->
        <h4 class="font-medium text-zinc-900 dark:text-white text-sm line-clamp-2">
          {{ getProductName(recommendation.product.name) }}
        </h4>
        <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          {{ getReasonText(recommendation.reason) }}
        </p>

        <!-- Price & Add Button -->
        <div class="flex items-center justify-between mt-3">
          <span class="font-bold text-zinc-900 dark:text-white text-lg">
            {{ formatPrice(recommendation.product.price) }}
          </span>
          <button
            :disabled="isInCart(recommendation.product.id)"
            class="px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            :class="isInCart(recommendation.product.id)
              ? 'bg-zinc-100 dark:bg-zinc-700 text-zinc-500'
              : 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100'"
            @click="handleAddToCart(recommendation.product)"
          >
            {{ isInCart(recommendation.product.id) ? $t('cart.inCart') : $t('cart.add') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/stores/cart/types'

const toast = useToast()
const { t, locale } = useI18n()

// Cart functionality - with null safety
const cart = useCart()
const recommendations = computed(() => cart.recommendations?.value ?? [])
const recommendationsLoading = computed(() => cart.recommendationsLoading?.value ?? false)
const loadRecommendations = cart.loadRecommendations
const addItem = cart.addItem
const isInCart = cart.isInCart

// Track if we've ever tried to load recommendations
const hasAttemptedLoad = ref(false)
const hasError = ref(false)

// Keep a local cache of recommendations to show while loading new ones
const cachedRecommendations = ref<any[]>([])

// Update cache when we have new recommendations
watch(recommendations, (newVal) => {
  if (newVal && newVal.length > 0) {
    cachedRecommendations.value = [...newVal]
    hasError.value = false
  }
}, { immediate: true })

// Display recommendations - prefer store data, fall back to cache while loading
const displayRecommendations = computed(() => {
  if (recommendations.value && recommendations.value.length > 0) {
    return recommendations.value
  }
  // While loading, show cached data if available
  if (recommendationsLoading.value && cachedRecommendations.value.length > 0) {
    return cachedRecommendations.value
  }
  return recommendations.value || []
})

// Show component if loading, has recommendations, has cached recommendations, or has attempted to load
const showComponent = computed(() => {
  return recommendationsLoading.value
    || displayRecommendations.value.length > 0
    || hasAttemptedLoad.value
})

// Load recommendations on mount
onMounted(async () => {
  if (!recommendations.value || recommendations.value.length === 0) {
    await handleLoadRecommendations()
  }
  else {
    hasAttemptedLoad.value = true
  }
})

// Get product name with locale support
const getProductName = (name: any): string => {
  if (!name) return ''
  if (typeof name === 'string') return name
  const localeText = name[locale.value]
  if (localeText) return localeText
  const esText = name.es
  if (esText) return esText
  const values = Object.values(name).filter((v): v is string => typeof v === 'string')
  return values[0] || ''
}

// Utility functions
const formatPrice = (price: number) => {
  return new Intl.NumberFormat(locale.value, {
    style: 'currency',
    currency: 'EUR',
  }).format(price)
}

const getReasonText = (reason: string) => {
  const reasonKey = `cart.recommendations.${reason}`
  const translated = t(reasonKey)
  // If translation key not found, return fallback
  if (translated === reasonKey) {
    const fallbackMap: Record<string, string> = {
      frequently_bought_together: t('cart.recommendations.boughtTogether'),
      similar_products: t('cart.recommendations.similar'),
      price_drop: t('cart.recommendations.priceDrop'),
      back_in_stock: t('cart.recommendations.backInStock'),
    }
    return fallbackMap[reason] || t('cart.recommendations.recommended')
  }
  return translated
}

// Handle recommendations operations
const handleLoadRecommendations = async () => {
  hasAttemptedLoad.value = true
  hasError.value = false
  try {
    await loadRecommendations()
  }
  catch (error: any) {
    hasError.value = true
    if (error.statusCode !== 404) {
      console.error('Failed to load recommendations:', error)
      toast.error(t('common.error'), t('cart.recommendations.loadFailed'))
    }
  }
}

const handleAddToCart = async (product: Product | { id: string, name: any, price: number, images?: string[], stock?: number }) => {
  try {
    await addItem(product as Product, 1)
    const productName = getProductName(product.name)
    toast.success(t('cart.success.added'), t('cart.success.productAdded', { product: productName }))
  }
  catch (error: any) {
    console.error('Failed to add recommended product to cart:', product.id, error)
    toast.error(t('common.error'), t('cart.error.addFailedDetails'))
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

/* Hide scrollbar but keep functionality */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
