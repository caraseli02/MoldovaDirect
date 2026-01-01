<template>
  <article
    ref="cardRef"
    data-testid="product-card"
    class="luxury-product-card group"
    :class="{
      'active:scale-[0.98]': isMobile,
      'touch-manipulation': isMobile,
    }"
    :aria-label="$t('products.commonProduct')"
    role="article"
    @touchstart="handleTouchStart"
  >
    <!-- Screen reader announcements -->
    <div
      class="sr-only"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {{ cartStatusAnnouncement }}
    </div>

    <!-- Product Image -->
    <div class="card-image-wrapper">
      <nuxt-link
        :to="productDetailPath"
        class="card-image-link"
      >
        <NuxtImg
          v-if="primaryImage"
          preset="productThumbnail"
          :src="primaryImage.url"
          :alt="(primaryImage.altText ? getLocalizedText(primaryImage.altText) : '') || getLocalizedText(product.name)"
          sizes="100vw sm:50vw md:33vw lg:25vw"
          densities="x1 x2"
          loading="lazy"
          placeholder
          :placeholder-class="'blur-xl'"
          class="card-image"
        />
        <div
          v-else
          class="card-image-placeholder"
          role="img"
          :aria-label="$t('products.noImageAvailable')"
        >
          <commonIcon
            name="wine"
            class="placeholder-icon"
            aria-hidden="true"
          />
        </div>
        <div class="card-overlay"></div>
      </nuxt-link>

      <!-- Badges -->
      <div class="card-badges-left">
        <span
          v-if="isNew"
          class="card-badge badge-new"
        >
          {{ $t('products.new') }}
        </span>
        <span
          v-if="product.isFeatured"
          class="card-badge badge-featured"
        >
          {{ $t('products.bestSeller') }}
        </span>
        <span
          v-if="product.stockQuantity > 0 && product.stockQuantity <= PRODUCTS.LOW_STOCK_THRESHOLD"
          class="card-badge badge-low-stock"
        >
          {{ $t('products.onlyLeft', { count: product.stockQuantity }) }}
        </span>
      </div>

      <div
        v-if="product.comparePrice && Number(product.comparePrice) > Number(product.price)"
        class="card-badges-right"
      >
        <span class="card-badge badge-sale">
          -{{ calculateDiscount }}%
        </span>
      </div>

      <!-- Quick View on Hover -->
      <div class="quick-view-overlay">
        <nuxt-link
          :to="productDetailPath"
          :aria-label="$t('products.quickViewProduct', { name: getLocalizedText(product.name) })"
          class="quick-view-btn"
        >
          <commonIcon
            name="eye"
            class="h-4 w-4"
          />
          <span>{{ $t('products.quickView') }}</span>
        </nuxt-link>
      </div>
    </div>

    <!-- Product Info -->
    <div class="card-content">
      <!-- Category -->
      <p class="card-category">
        {{ product.category?.nameTranslations ? getLocalizedText(product.category.nameTranslations) : '' }}
      </p>

      <!-- Product Name -->
      <h3 class="card-title">
        <nuxt-link
          :to="productDetailPath"
          class="card-title-link"
          :aria-label="$t('products.viewDetails') + ': ' + getLocalizedText(product.name)"
        >
          {{ getLocalizedText(product.name) }}
        </nuxt-link>
      </h3>

      <!-- Short Description -->
      <p
        v-if="product.shortDescription"
        class="card-description"
      >
        {{ getLocalizedText(product.shortDescription) }}
      </p>

      <!-- Product Details -->
      <div
        v-if="product.origin || product.volume || product.alcoholContent"
        class="card-details"
      >
        <span
          v-if="product.origin"
          class="detail-item"
        >
          <commonIcon
            name="globe-2"
            class="h-3.5 w-3.5"
            aria-hidden="true"
          />
          {{ product.origin }}
        </span>
        <span
          v-if="product.volume"
          class="detail-item"
        >
          <commonIcon
            name="flask-conical"
            class="h-3.5 w-3.5"
            aria-hidden="true"
          />
          {{ product.volume }}ml
        </span>
        <span
          v-if="product.alcoholContent"
          class="detail-item"
        >
          <commonIcon
            name="wine"
            class="h-3.5 w-3.5"
            aria-hidden="true"
          />
          {{ product.alcoholContent }}%
        </span>
      </div>

      <!-- Price Row -->
      <div class="card-price-row">
        <div class="price-group">
          <span class="current-price">
            €{{ formatPrice(product.price) }}
          </span>
          <span
            v-if="product.comparePrice && Number(product.comparePrice) > Number(product.price)"
            class="compare-price"
          >
            €{{ formatPrice(product.comparePrice) }}
          </span>
        </div>
        <span
          v-if="product.stockQuantity > 0"
          class="stock-status"
          :class="stockStatusClass"
        >
          {{ stockStatusText }}
        </span>
        <span
          v-else
          class="stock-status out-of-stock"
        >
          {{ $t('products.stockStatus.outOfStock') }}
        </span>
      </div>

      <!-- Add to Cart Button -->
      <button
        type="button"
        :disabled="product.stockQuantity <= 0 || cartLoading"
        :aria-label="getCartButtonAriaLabel()"
        :aria-live="cartLoading ? 'polite' : undefined"
        class="add-to-cart-btn"
        :class="{ 'in-cart': isInCart(String(product.id)) }"
        @click="addToCart"
        @touchstart="isMobile && !cartLoading && vibrate('tap')"
      >
        <!-- Loading Spinner -->
        <svg
          v-if="cartLoading"
          class="animate-spin h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
          role="status"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>

        <!-- Check Icon -->
        <svg
          v-else-if="isInCart(String(product.id))"
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 13l4 4L19 7"
          />
        </svg>

        <!-- Cart Icon (default) -->
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 21h13M7 13v4a1 1 0 001 1h9a1 1 0 001-1v-4M7 13L6 9"
          />
        </svg>

        <span>
          {{
            cartLoading ? $t('products.adding')
            : product.stockQuantity <= 0 ? $t('products.outOfStock')
              : isInCart(String(product.id)) ? $t('products.inCart')
                : $t('products.addToCart')
          }}
        </span>
      </button>
    </div>
  </article>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { ProductWithRelations } from '~/types'
import { useCart } from '~/composables/useCart'
import type { Translations } from '~/types/database'
import { useDevice } from '~/composables/useDevice'
import { useHapticFeedback } from '~/composables/useHapticFeedback'
import { useTouchEvents } from '~/composables/useTouchEvents'
import { useToast } from '~/composables/useToast'
import { useRouter, useI18n, useLocalePath } from '#imports'
import { PRODUCTS } from '~/constants/products'

interface Props {
  product: ProductWithRelations
  variant?: 'standard' | 'hero' | 'featured'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'standard',
})

// Composables
const { locale, t } = useI18n()
const { isMobile } = useDevice()
const { vibrate } = useHapticFeedback()
const touchEvents = useTouchEvents()
const toast = useToast()
const { addItem, loading: cartLoading, isInCart } = useCart()
const localePath = useLocalePath()

// Template refs
const cardRef = ref<HTMLElement>()

// Local state

// Computed properties
const primaryImage = computed(() => {
  return props.product.images?.find(img => img.isPrimary) || props.product.images?.[0]
})

const stockStatusClass = computed(() => {
  const stock = props.product.stockQuantity
  if (stock > 10) return 'in-stock'
  if (stock > 0) return 'low-stock'
  return 'out-of-stock'
})

const stockStatusText = computed(() => {
  const stock = props.product.stockQuantity
  if (stock > 10) return t('products.stockStatus.inStock')
  if (stock > 0) return t('products.stockStatus.onlyLeft', { count: stock })
  return t('products.stockStatus.outOfStock')
})

const productDetailPath = computed(() =>
  localePath(
    {
      name: 'products-slug',
      params: { slug: props.product.slug },
    },
    locale.value,
  ),
)

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
  if (isInCart(String(props.product.id))) {
    return t('products.inCart')
  }
  return ''
})

// Utility functions
const getLocalizedText = (text: Translations | Record<string, string> | null | undefined): string => {
  if (!text) return ''
  const localeText = text[locale.value]
  if (localeText) return localeText
  const esText = (text as Record<string, any>).es
  if (esText) return esText
  const values = Object.values(text).filter((v): v is string => typeof v === 'string')
  return values[0] || ''
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
  if (isInCart(String(props.product.id))) {
    return t('products.productInCart', { name: productName })
  }
  return t('products.addProductToCart', { name: productName })
}

// Touch event handlers
const handleTouchStart = (_event: TouchEvent) => {
  if (isMobile.value) {
    vibrate('tap')
  }
}

// Actions
const addToCart = async () => {
  // CRITICAL SSR Guard: Cart operations require browser APIs
  //
  // Context: This guard prevents SSR hydration mismatches on Vercel deployment
  // Root causes:
  // - Cart store uses localStorage which is undefined during SSR
  // - Haptic feedback APIs (vibrate) only exist in browser context
  // - User session state unavailable during server render
  //
  // Behavior: Server-rendered buttons appear but don't execute cart logic
  // until hydration completes. This prevents hydration mismatches and runtime errors.
  if (import.meta.server || typeof window === 'undefined') {
    return
  }

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
      id: String(props.product.id),
      slug: props.product.slug,
      name: getLocalizedText(props.product.name),
      price: Number(props.product.price),
      images: props.product.images?.map(img => img.url) || [],
      stock: props.product.stockQuantity,
    }

    await addItem(cartProduct, 1)

    // Success haptic feedback
    if (isMobile.value) {
      vibrate('success')
    }
  }
  catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error('❌ Failed to add item to cart:', errorMsg, error)

    // Show error toast to user
    toast.error(
      t('cart.error.addFailed'),
      t('cart.error.addFailedDetails'),
    )

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
      router.push(productDetailPath.value)
    },
  })

  const cleanup = touchEvents.setupTouchListeners(cardRef.value, {
    passive: true,
  })

  // Cleanup on unmount
  onUnmounted(() => {
    cleanup()
    touchEvents.cleanup()
  })
}

onMounted(setupMobileTouch)
</script>

<style scoped>
/* ============================================
 * LUXURY PRODUCT CARD STYLES
 * Moldova Direct - Premium Design System
 * ============================================ */

.luxury-product-card {
  --card-cream: #F8F5EE;
  --card-black: #0A0A0A;
  --card-charcoal: #151515;
  --card-gold: #C9A227;
  --card-gold-light: #DDB93D;
  --card-wine: #8B2E3B;
  --font-serif: 'Cormorant Garamond', Georgia, serif;
  --font-sans: 'Inter', -apple-system, sans-serif;
  --transition-smooth: cubic-bezier(0.25, 0.46, 0.45, 0.94);

  position: relative;
  background: white;
  transition: all 0.4s var(--transition-smooth);
}

.luxury-product-card:hover {
  box-shadow: 0 20px 40px -12px rgba(10, 10, 10, 0.15);
}

/* Image Wrapper */
.card-image-wrapper {
  position: relative;
  overflow: hidden;
  aspect-ratio: 3/4;
  background: var(--card-cream);
}

.card-image-link {
  display: block;
  width: 100%;
  height: 100%;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.8s var(--transition-smooth);
}

.luxury-product-card:hover .card-image {
  transform: scale(1.08);
}

.card-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(201, 162, 39, 0.1), rgba(139, 46, 59, 0.1));
}

.placeholder-icon {
  width: 3rem;
  height: 3rem;
  color: var(--card-gold);
  opacity: 0.5;
}

.card-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(10, 10, 10, 0.4) 0%,
    transparent 50%
  );
  opacity: 0;
  transition: opacity 0.4s ease;
}

.luxury-product-card:hover .card-overlay {
  opacity: 1;
}

/* Badges */
.card-badges-left {
  position: absolute;
  top: 1rem;
  left: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: 2;
}

.card-badges-right {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 2;
}

.card-badge {
  font-family: var(--font-sans);
  font-size: 0.625rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 0.5rem 0.75rem;
}

.badge-new {
  background: var(--card-black);
  color: var(--card-cream);
}

.badge-featured {
  background: var(--card-gold);
  color: var(--card-black);
}

.badge-low-stock {
  background: var(--card-wine);
  color: white;
}

.badge-sale {
  background: var(--card-wine);
  color: white;
}

/* Quick View */
.quick-view-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem;
  transform: translateY(100%);
  opacity: 0;
  transition: all 0.4s var(--transition-smooth);
  z-index: 2;
}

.luxury-product-card:hover .quick-view-overlay {
  transform: translateY(0);
  opacity: 1;
}

.quick-view-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.875rem;
  background: white;
  color: var(--card-black);
  font-family: var(--font-sans);
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-decoration: none;
  transition: all 0.3s ease;
}

.quick-view-btn:hover {
  background: var(--card-black);
  color: white;
}

/* Card Content */
.card-content {
  padding: 1.5rem;
}

.card-category {
  font-family: var(--font-sans);
  font-size: 0.6875rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--card-gold);
  margin-bottom: 0.5rem;
}

.card-title {
  font-family: var(--font-serif);
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.3;
  color: var(--card-black);
  margin-bottom: 0.5rem;
}

.card-title-link {
  text-decoration: none;
  color: inherit;
  transition: color 0.3s ease;
}

.card-title-link:hover {
  color: var(--card-gold);
}

.card-description {
  font-family: var(--font-sans);
  font-size: 0.8125rem;
  color: #5E5E5E;
  line-height: 1.6;
  margin-bottom: 0.75rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-details {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-family: var(--font-sans);
  font-size: 0.75rem;
  color: #5E5E5E;
}

/* Price Row */
.card-price-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(10, 10, 10, 0.08);
}

.price-group {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.current-price {
  font-family: var(--font-serif);
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--card-black);
}

.compare-price {
  font-family: var(--font-sans);
  font-size: 0.8125rem;
  color: #999;
  text-decoration: line-through;
}

.stock-status {
  font-family: var(--font-sans);
  font-size: 0.6875rem;
  font-weight: 500;
  letter-spacing: 0.05em;
}

.stock-status.in-stock {
  color: #2D6A4F;
}

.stock-status.low-stock {
  color: var(--card-wine);
}

.stock-status.out-of-stock {
  color: #999;
}

/* Add to Cart Button */
.add-to-cart-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  background: var(--card-black);
  color: var(--card-cream);
  font-family: var(--font-sans);
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border: none;
  cursor: pointer;
  transition: all 0.4s var(--transition-smooth);
}

.add-to-cart-btn:hover:not(:disabled) {
  background: var(--card-gold);
  color: var(--card-black);
}

.add-to-cart-btn.in-cart {
  background: var(--card-gold);
  color: var(--card-black);
}

.add-to-cart-btn:disabled {
  background: #E5E5E5;
  color: #999;
  cursor: not-allowed;
}

/* Dark Mode */
.dark .luxury-product-card {
  background: var(--card-charcoal);
}

.dark .card-title {
  color: var(--card-cream);
}

.dark .card-description {
  color: rgba(248, 245, 238, 0.6);
}

.dark .detail-item {
  color: rgba(248, 245, 238, 0.6);
}

.dark .card-price-row {
  border-top-color: rgba(248, 245, 238, 0.1);
}

.dark .current-price {
  color: var(--card-cream);
}

.dark .add-to-cart-btn {
  background: var(--card-cream);
  color: var(--card-black);
}

.dark .add-to-cart-btn:hover:not(:disabled) {
  background: var(--card-gold);
}

/* Mobile Responsive */
@media (max-width: 640px) {
  .card-content {
    padding: 1rem;
  }

  .card-title {
    font-size: 1.125rem;
  }

  .current-price {
    font-size: 1.25rem;
  }

  .quick-view-overlay {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
