<template>
  <div
    ref="cardRef"
    class="group relative bg-white dark:bg-slate-800 rounded-2xl shadow-elevated-sm hover:shadow-elevated-lg border border-gray-200 dark:border-slate-700 transition-all duration-300 overflow-hidden"
    :class="{
      'active:scale-95': isMobile,
      'touch-manipulation': isMobile
    }"
    @touchstart="handleTouchStart"
  >
    <!-- Product Image -->
    <div class="relative aspect-square overflow-hidden rounded-t-2xl bg-gray-100 dark:bg-slate-700">
      <nuxt-link :to="`/products/${product.slug}`">
        <NuxtImg
          v-if="!shouldShowFallback"
          preset="productThumbnail"
          :src="primaryImage.url"
          :alt="getLocalizedText(primaryImage.altText) || getLocalizedText(product.name)"
          sizes="100vw sm:50vw md:33vw lg:25vw"
          densities="x1 x2"
          loading="lazy"
          class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          @error="handleImageError"
        />
        <div v-else class="w-full h-full flex items-center justify-center text-gray-400 dark:text-slate-500">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </nuxt-link>

      <!-- Quick View Overlay (Gymshark pattern) -->
      <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
        <nuxt-link
          :to="`/products/${product.slug}`"
          class="px-6 py-3 bg-white text-gray-900 rounded-full font-semibold text-sm hover:bg-gray-100 transition-colors transform translate-y-4 group-hover:translate-y-0 duration-300"
        >
          {{ $t('products.quickView') }}
        </nuxt-link>
      </div>

      <!-- Product Labels/Badges (top-left corner) -->
      <div class="absolute top-3 left-3 flex flex-col gap-2">
        <!-- New Badge -->
        <span v-if="isNew" class="inline-flex items-center gap-1 bg-primary-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">
          <commonIcon name="lucide:sparkles" class="h-3 w-3" />
          {{ $t('products.new') }}
        </span>

        <!-- Best Seller Badge -->
        <span v-if="product.isFeatured" class="inline-flex items-center gap-1 bg-amber-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">
          <commonIcon name="lucide:trending-up" class="h-3 w-3" />
          {{ $t('products.bestSeller') }}
        </span>

        <!-- Low Stock Badge (urgency) -->
        <span v-if="product.stockQuantity > 0 && product.stockQuantity <= PRODUCTS.LOW_STOCK_THRESHOLD" class="inline-flex items-center gap-1 bg-red-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg animate-pulse">
          <commonIcon name="lucide:alert-circle" class="h-3 w-3" />
          {{ $t('products.onlyLeft', { count: product.stockQuantity }) }}
        </span>
      </div>

      <!-- Sale Badge (top-right corner) -->
      <div v-if="product.comparePrice && Number(product.comparePrice) > Number(product.price)" class="absolute top-3 right-3">
        <span class="inline-flex items-center gap-1 bg-red-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">
          <commonIcon name="lucide:tag" class="h-3 w-3" />
          -{{ calculateDiscount }}%
        </span>
      </div>
    </div>

    <!-- Product Info -->
    <div class="p-4">
      <!-- Category -->
      <p class="text-sm text-gray-500 dark:text-slate-400 mb-2">
        {{ getLocalizedText(product.category?.name) }}
      </p>

      <!-- Product Name -->
      <h3 class="font-semibold text-gray-900 dark:text-slate-100 mb-2 line-clamp-2">
        <nuxt-link :to="`/products/${product.slug}`" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          {{ getLocalizedText(product.name) }}
        </nuxt-link>
      </h3>

      <!-- Short Description -->
      <p v-if="product.shortDescription" class="text-sm text-gray-600 dark:text-slate-300 mb-3 line-clamp-2">
        {{ getLocalizedText(product.shortDescription) }}
      </p>

      <!-- Tags -->
      <div v-if="product.tags?.length" class="flex flex-wrap gap-1 mb-3">
        <span
          v-for="tag in product.tags.slice(0, PRODUCTS.MAX_VISIBLE_TAGS)"
          :key="tag"
          class="inline-block bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 text-xs px-2 py-1 rounded-full"
        >
          {{ tag }}
        </span>
        <span v-if="product.tags.length > PRODUCTS.MAX_VISIBLE_TAGS" class="text-xs text-gray-500 dark:text-slate-400">
          +{{ product.tags.length - PRODUCTS.MAX_VISIBLE_TAGS }}
        </span>
      </div>

      <!-- Product Details -->
      <div class="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-slate-400 mb-3">
        <span v-if="product.origin" class="flex items-center">
          🌍 {{ product.origin }}
        </span>
        <span v-if="product.volume" class="flex items-center">
          📏 {{ product.volume }}ml
        </span>
        <span v-if="product.alcoholContent" class="flex items-center">
          🍷 {{ product.alcoholContent }}%
        </span>
      </div>

      <!-- Price and Stock -->
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <!-- Current Price -->
          <span class="font-bold text-lg text-gray-900 dark:text-slate-100">
            €{{ formatPrice(product.price) }}
          </span>

          <!-- Compare Price (if on sale) -->
          <span v-if="product.comparePrice && Number(product.comparePrice) > Number(product.price)" class="text-sm text-gray-500 dark:text-slate-400 line-through">
            €{{ formatPrice(product.comparePrice) }}
          </span>
        </div>

        <!-- Stock Status -->
        <div class="text-right">
          <span
            v-if="product.stockQuantity > 0"
            class="inline-flex items-center px-2 py-1 rounded-full text-xs"
            :class="stockStatusClass"
          >
            {{ stockStatusText }}
          </span>
          <span v-else class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
            {{ $t('products.stockStatus.outOfStock') }}
          </span>
        </div>
      </div>

      <!-- Add to Cart Button -->
      <Button
        :disabled="product.stockQuantity <= 0 || cartLoading"
        class="cta-button w-full mt-4 transition-all duration-200 flex items-center justify-center space-x-2 touch-manipulation rounded-full"
        :class="[
          isInCart(product.id)
            ? 'bg-green-600 dark:bg-green-500 text-white hover:bg-green-700 dark:hover:bg-green-600'
            : 'bg-primary-600 dark:bg-primary-500 text-white hover:bg-primary-700 dark:hover:bg-primary-600',
          isMobile ? `min-h-[${PRODUCTS.MIN_TOUCH_TARGET_SIZE}px]` : '' // Ensure minimum touch target size
        ]"
        @click="addToCart"
        @touchstart="isMobile && !cartLoading && vibrate('tap')"
      >
        <!-- Loading Spinner -->
        <svg v-if="cartLoading" class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>

        <!-- Cart Icon -->
        <svg v-else-if="!isInCart(product.id)" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 21h13M7 13v4a1 1 0 001 1h9a1 1 0 001-1v-4M7 13L6 9" />
        </svg>

        <!-- Check Icon -->
        <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>

        <span>
          {{
            cartLoading ? $t('products.adding') :
            product.stockQuantity <= 0 ? $t('products.outOfStock') :
            isInCart(product.id) ? $t('products.inCart') :
            $t('products.addToCart')
          }}
        </span>
      </Button>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { Button } from '@/components/ui/button'
import type { ProductWithRelations } from '~/types'
import { useCart } from '~/composables/useCart'
import { useDevice } from '~/composables/useDevice'
import { useHapticFeedback } from '~/composables/useHapticFeedback'
import { useTouchEvents } from '~/composables/useTouchEvents'
import { useRouter } from '#imports'
import { useI18n } from '#imports'
import { PRODUCTS } from '~/constants/products'

interface Props {
  product: ProductWithRelations
}

const props = defineProps<Props>()

// Composables
const { locale, t } = useI18n()
const { isMobile } = useDevice()
const { vibrate } = useHapticFeedback()
const touchEvents = useTouchEvents()
const { addItem, loading: cartLoading, isInCart } = useCart()

// Template refs
const cardRef = ref<HTMLElement>()

// State
const imageError = ref(false)

// Computed properties
const primaryImage = computed(() => {
  return props.product.images?.find(img => img.isPrimary) || props.product.images?.[0]
})

const isValidImageUrl = computed(() => {
  if (!primaryImage.value?.url) return false
  const url = primaryImage.value.url.trim()
  // Consider empty strings, placeholder paths, or very short URLs as invalid
  if (!url || url.length < 4) return false
  // Check if it's the placeholder (which might fail with NuxtImg)
  if (url.includes('placeholder')) return false
  return true
})

const shouldShowFallback = computed(() => {
  return !primaryImage.value || !isValidImageUrl.value || imageError.value
})

const stockStatusClass = computed(() => {
  const stock = props.product.stockQuantity
  if (stock > 10) return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
  if (stock > 0) return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
  return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
})

const stockStatusText = computed(() => {
  const stock = props.product.stockQuantity
  if (stock > 10) return t('products.stockStatus.inStock')
  if (stock > 0) return t('products.stockStatus.onlyLeft', { count: stock })
  return t('products.stockStatus.outOfStock')
})

const isNew = computed(() => {
  // Consider product "new" if created within threshold days
  if (!props.product.createdAt) return false
  const createdDate = new Date(props.product.createdAt)
  const now = new Date()
  const daysSinceCreation = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
  return daysSinceCreation <= PRODUCTS.NEW_PRODUCT_DAYS
})

const calculateDiscount = computed(() => {
  if (!props.product.comparePrice || Number(props.product.comparePrice) <= Number(props.product.price)) {
    return 0
  }
  const discount = ((Number(props.product.comparePrice) - Number(props.product.price)) / Number(props.product.comparePrice)) * 100
  return Math.round(discount)
})

// Utility functions
const getLocalizedText = (text: Record<string, string> | null | undefined) => {
  if (!text) return ''
  return text[locale.value] || text.es || Object.values(text)[0] || ''
}

const formatPrice = (price: string | number) => {
  return Number(price).toFixed(2)
}


// Image error handler
const handleImageError = () => {
  imageError.value = true
}

// Reset image error when product changes
watch(() => props.product.id, () => {
  imageError.value = false
})

// Touch event handlers
const handleTouchStart = (event: TouchEvent) => {
  if (isMobile.value) {
    vibrate('tap')
  }
}

// Actions
const addToCart = async () => {
  try {
    // Haptic feedback for mobile users
    if (isMobile.value) {
      vibrate('buttonPress')
    }

    // Convert the product to the format expected by the cart
    const cartProduct = {
      id: props.product.id,
      slug: props.product.slug,
      name: getLocalizedText(props.product.name),
      price: Number(props.product.price),
      images: props.product.images?.map(img => img.url) || [],
      stock: props.product.stockQuantity
    }

    await addItem(cartProduct, 1)

    // Success haptic feedback
    if (isMobile.value) {
      vibrate('success')
    }
  } catch (error) {
    console.error('Failed to add item to cart:', error)

    // Error haptic feedback
    if (isMobile.value) {
      vibrate('error')
    }
  }
}

// Setup touch optimizations for mobile
const setupMobileTouch = () => {
  if (!isMobile.value || !cardRef.value) return

  // Setup efficient touch event handling
  touchEvents.setHandlers({
    onTap: () => {
      // Navigate to product detail on tap (if not button)
      const router = useRouter()
      const productPath = `/products/${props.product.slug}`
      router.push(productPath)
    }
  })

  const cleanup = touchEvents.setupTouchListeners(cardRef.value, {
    passive: true
  })

  // Cleanup on unmount
  onUnmounted(() => {
    cleanup()
    touchEvents.cleanup()
  })
}

onMounted(setupMobileTouch)
</script>