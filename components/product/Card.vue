<template>
  <article
    ref="cardRef"
    class="group relative bg-white dark:bg-slate-800 rounded-2xl shadow-elevated-sm hover:shadow-elevated-lg border border-gray-200 dark:border-slate-700 transition-all duration-300 overflow-hidden"
    :class="{
      'active:scale-95': isMobile,
      'touch-manipulation': isMobile,
      'h-full': variant === 'hero' || variant === 'featured'
    }"
    :aria-label="$t('products.commonProduct')"
    role="article"
    @touchstart="handleTouchStart"
  >
    <!-- Screen reader announcements -->
    <div class="sr-only" role="status" aria-live="polite" aria-atomic="true">
      {{ cartStatusAnnouncement }}
    </div>

    <!-- Product Image -->
    <div
      class="relative overflow-hidden rounded-t-2xl bg-gray-100 dark:bg-slate-700"
      :class="{
        'aspect-square': variant === 'standard',
        'aspect-[4/3]': variant === 'hero',
        'aspect-[3/2]': variant === 'featured'
      }"
    >
      <nuxt-link :to="`/products/${product.slug}`">
        <NuxtImg
          v-if="primaryImage"
          preset="productThumbnail"
          :src="primaryImage.url"
          :alt="getLocalizedText(primaryImage.altText) || getLocalizedText(product.name)"
          sizes="100vw sm:50vw md:33vw lg:25vw"
          densities="x1 x2"
          loading="lazy"
          placeholder
          :placeholder-class="'blur-xl'"
          class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div v-else class="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900" role="img" :aria-label="$t('products.noImageAvailable')">
          <div class="relative">
            <div class="absolute inset-0 bg-blue-500/10 blur-2xl rounded-full"></div>
            <commonIcon name="wine" class="relative h-12 w-12 text-blue-400 dark:text-blue-500" aria-hidden="true" />
          </div>
        </div>
      </nuxt-link>

      <!-- Quick Actions Bottom Bar -->
      <div
        class="absolute bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 transition-all duration-300"
        :class="isMobile ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100'"
      >
        <div class="flex items-center justify-between px-3 py-2 gap-2">
          <!-- Quick View Button -->
          <nuxt-link
            :to="`/products/${product.slug}`"
            :aria-label="$t('products.quickViewProduct', { name: getLocalizedText(product.name) })"
            class="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors text-sm font-medium text-gray-900 dark:text-white focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
          >
            <commonIcon name="eye" class="h-4 w-4" />
            <span class="hidden sm:inline">{{ $t('products.quickView') }}</span>
          </nuxt-link>

        </div>
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
      <p class="text-sm text-gray-600 dark:text-slate-400 mb-2">
        {{ getLocalizedText(product.category?.name) }}
      </p>

      <!-- Product Name -->
      <h3 class="font-semibold text-gray-900 dark:text-slate-100 mb-2 line-clamp-2">
        <nuxt-link
          :to="`/products/${product.slug}`"
          class="hover:text-blue-700 dark:hover:text-blue-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 rounded"
          :aria-label="$t('products.viewDetails') + ': ' + getLocalizedText(product.name)"
        >
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
        <span v-if="product.tags.length > PRODUCTS.MAX_VISIBLE_TAGS" class="text-xs text-gray-600 dark:text-slate-400">
          +{{ product.tags.length - PRODUCTS.MAX_VISIBLE_TAGS }}
        </span>
      </div>

      <!-- Product Details -->
      <div class="flex flex-wrap gap-2 text-xs text-gray-600 dark:text-slate-400 mb-3">
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
          <span v-if="product.comparePrice && Number(product.comparePrice) > Number(product.price)" class="text-sm text-gray-600 dark:text-slate-400 line-through">
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
        :aria-label="getCartButtonAriaLabel()"
        :aria-live="cartLoading ? 'polite' : undefined"
        class="cta-button w-full mt-4 transition-all duration-200 flex items-center justify-center space-x-2 touch-manipulation rounded-full min-h-[44px] focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
        :class="[
          isInCart(product.id)
            ? 'bg-green-600 dark:bg-green-500 text-white hover:bg-green-700 dark:hover:bg-green-600'
            : 'bg-primary-600 dark:bg-primary-500 text-white hover:bg-primary-700 dark:hover:bg-primary-600'
        ]"
        @click="addToCart"
        @touchstart="isMobile && !cartLoading && vibrate('tap')"
      >
        <!-- Loading Spinner -->
        <svg v-if="cartLoading" class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true" role="status">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>

        <!-- Cart Icon -->
        <svg v-else-if="!isInCart(product.id)" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 21h13M7 13v4a1 1 0 001 1h9a1 1 0 001-1v-4M7 13L6 9" />
        </svg>

        <!-- Check Icon -->
        <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
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
  </article>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
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
  variant?: 'standard' | 'hero' | 'featured'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'standard'
})

// Composables
const { locale, t } = useI18n()
const { isMobile } = useDevice()
const { vibrate } = useHapticFeedback()
const touchEvents = useTouchEvents()
const { addItem, loading: cartLoading, isInCart } = useCart()

// Template refs
const cardRef = ref<HTMLElement>()

// Local state

// Computed properties
const primaryImage = computed(() => {
  return props.product.images?.find(img => img.isPrimary) || props.product.images?.[0]
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

// Accessibility: Cart status announcements
const cartStatusAnnouncement = computed(() => {
  if (cartLoading.value) {
    return t('products.adding')
  }
  if (isInCart(props.product.id)) {
    return t('products.inCart')
  }
  return ''
})

// Utility functions
const getLocalizedText = (text: Record<string, string> | null | undefined) => {
  if (!text) return ''
  return text[locale.value] || text.es || Object.values(text)[0] || ''
}

const formatPrice = (price: string | number) => {
  return Number(price).toFixed(2)
}

const getCartButtonAriaLabel = () => {
  const productName = getLocalizedText(props.product.name)
  if (cartLoading.value) {
    return t('products.addingToCart', { name: productName })
  }
  if (props.product.stockQuantity <= 0) {
    return t('products.productOutOfStock', { name: productName })
  }
  if (isInCart(props.product.id)) {
    return t('products.productInCart', { name: productName })
  }
  return t('products.addProductToCart', { name: productName })
}

// Touch event handlers
const handleTouchStart = (event: TouchEvent) => {
  if (isMobile.value) {
    vibrate('tap')
  }
}

// Actions
const addToCart = async () => {
  // Only run on client side (fix for Vercel SSR)
  if (process.server || typeof window === 'undefined') {
    console.warn('Add to Cart: Server-side render, skipping')
    return
  }

  // Debug logging
  console.log('🛒 ProductCard: Add to Cart', {
    productId: props.product.id,
    isClient: process.client,
    hasAddItem: typeof addItem === 'function'
  })

  try {
    // Verify cart is available
    if (typeof addItem !== 'function') {
      throw new Error('addItem function not available')
    }

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

    console.log('🛒 Calling addItem')
    await addItem(cartProduct, 1)
    console.log('✅ Item added successfully')

    // Success haptic feedback
    if (isMobile.value) {
      vibrate('success')
    }
  } catch (error) {
    console.error('❌ Failed to add item to cart:', error)

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