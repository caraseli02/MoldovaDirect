<template>
  <div class="min-h-screen bg-zinc-50 dark:bg-zinc-900 py-4 md:py-8 pb-48 md:pb-12">
    <div class="container px-4 md:px-6 max-w-6xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6 md:mb-8">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white">
            {{ $t('common.cart') }}
          </h1>
          <p class="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {{ $t('cart.itemCount', { count: itemCount }) }}
          </p>
        </div>
        <NuxtLink
          :to="localePath('/products')"
          class="hidden md:flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          {{ $t('common.continueShopping') }}
        </NuxtLink>
      </div>

      <CommonErrorBoundary
        :fallback-action="() => navigateTo(localePath('/products'))"
        :fallback-action-text="$t('common.continueShopping')"
        @error="handleCartError"
      >
        <!-- Loading State -->
        <div
          v-if="loading"
          class="text-center py-20"
          role="status"
          :aria-label="$t('common.loading')"
        >
          <div
            class="animate-spin rounded-full h-10 w-10 border-2 border-zinc-200 border-t-primary-600 mx-auto"
            aria-hidden="true"
          ></div>
          <p class="mt-4 text-zinc-500 dark:text-zinc-400">
            {{ $t('common.loading') }}
          </p>
        </div>

        <!-- Empty Cart -->
        <div
          v-else-if="isEmpty"
          class="text-center py-20 px-4"
          data-testid="empty-cart-message"
          role="status"
        >
          <div
            class="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <svg
              class="h-10 w-10 text-zinc-400 dark:text-zinc-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h2 class="text-xl md:text-2xl font-semibold text-zinc-900 dark:text-white mb-2">
            {{ $t('products.cartEmpty') }}
          </h2>
          <p class="text-zinc-500 dark:text-zinc-400 mb-8 max-w-md mx-auto">
            {{ $t('products.cartEmptyDescription') }}
          </p>
          <NuxtLink
            :to="localePath('/products')"
            :aria-label="$t('common.continueShopping')"
            class="inline-flex items-center justify-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl hover:bg-primary-700 transition-colors font-medium min-h-[44px] focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          >
            {{ $t('common.continueShopping') }}
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </NuxtLink>
        </div>

        <!-- Cart Content -->
        <div
          v-else
          class="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8"
        >
          <!-- Left Column: Cart Items -->
          <div class="lg:col-span-2 space-y-4">
            <!-- Shipping Progress -->
            <CartShippingProgress :subtotal="subtotal" />

            <!-- Cart Items -->
            <div class="space-y-3">
              <CartItem
                v-for="item in items"
                :key="item.id"
                :item="{
                  id: item.id,
                  product: {
                    id: item.product.id,
                    name: item.product.name,
                    price: item.product.price,
                    images: [...item.product.images],
                    stock: item.product.stock,
                  },
                  quantity: item.quantity,
                }"
                :loading="loading"
                :data-testid="`cart-item-${item.product.id}`"
                @update-quantity="safeUpdateQuantity"
                @remove-item="safeRemoveItem"
                @swipe-remove="handleSwipeRemove"
                @save-for-later="handleSaveForLater"
                @toggle-selection="handleToggleSelection"
              />
            </div>

            <!-- Saved for Later -->
            <CartSavedForLater />

            <!-- Recommendations (Mobile: horizontal scroll) -->
            <CartRecommendations />
          </div>

          <!-- Right Column: Order Summary (Desktop) -->
          <div class="hidden lg:block lg:col-span-1">
            <div
              class="bg-white dark:bg-zinc-800/60 rounded-2xl border border-zinc-200 dark:border-zinc-700/50 p-6 sticky top-24"
            >
              <h2 class="text-lg font-semibold text-zinc-900 dark:text-white mb-6">
                {{ $t('common.orderSummary') }}
              </h2>

              <!-- Summary Details -->
              <div class="space-y-4 pb-4">
                <div class="flex justify-between">
                  <span class="text-zinc-500 dark:text-zinc-400">{{ $t('common.subtotal') }}</span>
                  <span class="text-zinc-900 dark:text-white font-medium">{{ formattedSubtotal }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-zinc-500 dark:text-zinc-400">{{ $t('common.shipping') }}</span>
                  <span class="text-zinc-500 dark:text-zinc-400">{{ $t('cart.shippingCalculatedAtCheckout') }}</span>
                </div>
                <div
                  v-if="savings > 0"
                  class="flex justify-between text-emerald-600 dark:text-emerald-400"
                >
                  <span>{{ $t('cart.youSave') }}</span>
                  <span class="font-medium">-{{ formatPrice(savings) }}</span>
                </div>
              </div>

              <!-- Total -->
              <div class="border-t border-zinc-200 dark:border-zinc-700 pt-4 mb-6">
                <div class="flex justify-between items-center">
                  <span class="text-lg font-semibold text-zinc-900 dark:text-white">{{ $t('common.total') }}</span>
                  <span class="text-2xl font-bold text-zinc-900 dark:text-white">{{ formattedSubtotal }}</span>
                </div>
              </div>

              <!-- Checkout Button -->
              <button
                :aria-label="$t('common.proceedToCheckout')"
                :disabled="loading || isEmpty"
                class="w-full py-4 bg-primary-600 text-white text-base font-semibold rounded-xl hover:bg-primary-700 active:bg-primary-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[52px] focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                @click="goToCheckout"
              >
                <span>{{ $t('common.checkout') }}</span>
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </button>

              <!-- Continue Shopping -->
              <NuxtLink
                :to="localePath('/products')"
                class="block w-full text-center py-3 mt-3 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-zinc-700 dark:text-zinc-300 font-medium min-h-[48px] flex items-center justify-center"
              >
                {{ $t('common.continueShopping') }}
              </NuxtLink>

              <!-- Trust Signals -->
              <div class="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-700/50 space-y-3">
                <div class="flex items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
                  <svg
                    class="w-5 h-5 text-emerald-500 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  <span>{{ $t('cart.secureCheckout') }}</span>
                </div>
                <div class="flex items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
                  <svg
                    class="w-5 h-5 text-emerald-500 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                  <span>{{ $t('cart.allCardsAccepted') }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CommonErrorBoundary>
    </div>

    <!-- Mobile Sticky Bottom Bar -->
    <div
      v-if="!isEmpty && !loading"
      class="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 shadow-lg z-50"
    >
      <!-- Expand Handle -->
      <button
        class="w-full py-2 flex justify-center"
        :aria-label="showMobileSummary ? $t('common.hideOrderSummary') : $t('common.showOrderSummary')"
        :aria-expanded="showMobileSummary"
        @click="showMobileSummary = !showMobileSummary"
      >
        <div class="w-8 h-1 bg-zinc-300 dark:bg-zinc-700 rounded-full"></div>
      </button>

      <!-- Expandable Summary -->
      <div
        class="overflow-hidden transition-all duration-300 ease-out px-4"
        :class="showMobileSummary ? 'max-h-40 pb-4' : 'max-h-0'"
      >
        <div class="space-y-2 border-b border-zinc-100 dark:border-zinc-800 pb-4">
          <div class="flex justify-between text-sm">
            <span class="text-zinc-500 dark:text-zinc-400">{{ $t('common.subtotal') }}</span>
            <span class="text-zinc-900 dark:text-white">{{ formattedSubtotal }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-zinc-500 dark:text-zinc-400">{{ $t('common.shipping') }}</span>
            <span class="text-zinc-500 dark:text-zinc-400">{{ $t('cart.shippingCalculatedAtCheckout') }}</span>
          </div>
          <div
            v-if="savings > 0"
            class="flex justify-between text-sm text-emerald-600 dark:text-emerald-400"
          >
            <span>{{ $t('cart.youSave') }}</span>
            <span class="font-medium">-{{ formatPrice(savings) }}</span>
          </div>
        </div>
      </div>

      <!-- Total & CTA -->
      <div class="p-4 pt-2">
        <div class="flex items-center justify-between mb-4">
          <div>
            <p class="text-sm text-zinc-500 dark:text-zinc-400">
              {{ $t('common.total') }}
            </p>
            <p class="text-2xl font-bold text-zinc-900 dark:text-white">
              {{ formattedSubtotal }}
            </p>
          </div>
          <div
            class="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/20 px-2.5 py-1.5 rounded-full"
          >
            <svg
              class="w-3.5 h-3.5"
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
            <span class="font-medium">{{ $t('cart.secureCheckout') }}</span>
          </div>
        </div>

        <!-- Checkout Button -->
        <button
          :disabled="loading || isEmpty"
          :aria-label="$t('common.proceedToCheckout')"
          class="w-full py-4 bg-primary-600 text-white text-base font-semibold rounded-xl hover:bg-primary-700 active:bg-primary-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[52px] focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          @click="goToCheckout"
        >
          <span>{{ $t('common.checkout') }}</span>
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </button>

        <!-- Continue Shopping -->
        <NuxtLink
          :to="localePath('/products')"
          class="block w-full text-center py-3 mt-2 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
        >
          {{ $t('common.continueShopping') }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Import cart components
import CartShippingProgress from '~/components/cart/ShippingProgress.vue'
import CartSavedForLater from '~/components/cart/SavedForLater.vue'
import CartRecommendations from '~/components/cart/Recommendations.vue'
import CartItem from '~/components/cart/Item.vue'

const localePath = useLocalePath()
const toast = useToast()
const { t, locale } = useI18n()

// Mobile UI state
const showMobileSummary = ref(false)

// Undo deletion state
interface RemovedItem {
  id: string
  product: {
    id: string
    slug: string
    name: string
    price: number
    images: string[]
    stock: number
  }
  quantity: number
}
const lastRemovedItem = ref<RemovedItem | null>(null)
const undoTimeoutId = ref<NodeJS.Timeout | null>(null)

// Cart functionality
const {
  items,
  itemCount,
  subtotal,
  isEmpty,
  loading,
  updateQuantity,
  removeItem,
  validateCart,
  toggleItemSelection,
  addToSavedForLater,
} = useCart()

// Placeholder for savings calculation (can be connected to promo system)
const savings = computed(() => 0)

// Utility functions
const formatPrice = (price: number) => {
  return new Intl.NumberFormat(locale.value, {
    style: 'currency',
    currency: 'EUR',
  }).format(price)
}

const formattedSubtotal = computed(() => formatPrice(subtotal.value))

// Error handling
const handleCartError = (error: Error) => {
  console.error('Cart page error:', getErrorMessage(error))
  toast.error(t('common.cartError'), getErrorMessage(error))
}

// Cart operations with error handling
const safeUpdateQuantity = async (itemId: string, quantity: number) => {
  try {
    await updateQuantity(itemId, quantity)
  }
  catch (error: unknown) {
    console.error('Failed to update quantity for item:', itemId, 'to quantity:', quantity, error)
    toast.error(t('cart.error.updateFailed'), t('cart.error.updateFailedDetails'))
  }
}

// Undo the last removed item
const undoRemoveItem = async () => {
  if (!lastRemovedItem.value) return

  // Store the item reference before clearing
  const itemToRestore = lastRemovedItem.value

  // Clear the undo timeout
  if (undoTimeoutId.value) {
    clearTimeout(undoTimeoutId.value)
    undoTimeoutId.value = null
  }

  try {
    // Re-add the item to the cart
    const { addItem } = useCart()
    await addItem(itemToRestore.product, itemToRestore.quantity)

    // Only clear lastRemovedItem after successful restoration
    lastRemovedItem.value = null

    toast.success(
      t('cart.success.productRestored'),
      t('cart.success.productRestoredDetails', { product: getLocalizedText(itemToRestore.product.name) }),
    )
  }
  catch (error: unknown) {
    console.error('Failed to restore item:', getErrorMessage(error))
    // Keep lastRemovedItem so user can retry
    toast.error(t('cart.error.addFailed'), t('cart.error.addFailedDetails'))
  }
}

// Get localized text helper
const getLocalizedText = (text: any): string => {
  if (!text) return ''
  if (typeof text === 'string') return text
  const localeText = text[locale.value]
  if (localeText) return localeText
  const esText = text.es
  if (esText) return esText
  const values = Object.values(text).filter((v): v is string => typeof v === 'string')
  return values[0] || ''
}

const safeRemoveItem = async (itemId: string) => {
  // Store item data BEFORE attempting removal (for potential undo)
  const item = items.value.find(i => i.id === itemId)
  if (!item) {
    console.error('Item not found for removal:', itemId)
    return
  }

  // Create a backup of the item data before removal
  const itemBackup = {
    id: item.id,
    product: {
      id: item.product.id,
      slug: item.product.slug,
      name: item.product.name,
      price: item.product.price,
      images: [...item.product.images],
      stock: item.product.stock,
    },
    quantity: item.quantity,
  }

  try {
    // Wait for removal to succeed first
    await removeItem(itemId)

    // Only set up undo AFTER successful removal
    if (undoTimeoutId.value) {
      clearTimeout(undoTimeoutId.value)
    }

    lastRemovedItem.value = itemBackup
    undoTimeoutId.value = setTimeout(() => {
      lastRemovedItem.value = null
      undoTimeoutId.value = null
    }, 10000)

    // Show toast with undo action only after successful removal
    toast.success(
      t('cart.success.productRemoved'),
      t('cart.success.productRemovedDetails', { product: getLocalizedText(item.product.name) }),
      {
        actionText: t('common.undo'),
        actionHandler: undoRemoveItem,
        duration: 8000,
      },
    )
  }
  catch (error: unknown) {
    console.error('Failed to remove item:', itemId, error)
    // Item is still in cart on error, no cleanup needed
    toast.error(t('cart.error.removeFailed'), t('cart.error.removeFailedDetails'))
  }
}

const handleSwipeRemove = async (itemId: string) => {
  try {
    await removeItem(itemId)
    if ('vibrate' in navigator) {
      navigator.vibrate(50)
    }
  }
  catch (error: unknown) {
    console.error('Failed to remove item via swipe:', itemId, error)
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 50, 50]) // Error pattern
    }
    toast.error(t('cart.error.removeFailed'), t('cart.error.removeFailedDetails'))
  }
}

const handleSaveForLater = async (itemId: string) => {
  try {
    const item = items.value.find(i => i.id === itemId)
    if (!item) {
      console.error('Item not found for save-for-later:', itemId)
      toast.error(t('cart.error.productNotFound'), t('cart.error.productNotFoundDetails'))
      return
    }
    const mutableProduct = {
      ...item.product,
      images: [...item.product.images],
    }
    await addToSavedForLater(mutableProduct, item.quantity)
    await removeItem(itemId)
    toast.success(t('cart.success.savedForLater'), t('cart.success.savedForLaterDetails', { product: item.product.name }))
  }
  catch (error: unknown) {
    console.error('Failed to save item for later:', itemId, error)
    toast.error(t('cart.error.saveFailed'), t('cart.error.saveFailedDetails'))
  }
}

const handleToggleSelection = (itemId: string) => {
  toggleItemSelection(itemId)
}

// Checkout navigation
const goToCheckout = async () => {
  try {
    await validateCart()
    await navigateTo(localePath('/checkout'))
  }
  catch (error: unknown) {
    console.error('Failed to proceed to checkout:', getErrorMessage(error))
    toast.error(t('common.cartError'), t('cart.error.checkoutFailed'))
  }
}

// Validate cart on mount
onMounted(async () => {
  try {
    await validateCart()
  }
  catch (error: unknown) {
    console.error('Failed to validate cart:', getErrorMessage(error))
    toast.error(t('common.cartValidationError'), t('cart.error.validationFailedDetails'))
  }
})

// Clean up undo timeout on unmount to prevent memory leaks
onBeforeUnmount(() => {
  if (undoTimeoutId.value) {
    clearTimeout(undoTimeoutId.value)
    undoTimeoutId.value = null
  }
})

// SEO Meta
useHead({
  title: t('seo.cart.title'),
  meta: [
    {
      name: 'description',
      content: t('seo.cart.description'),
    },
  ],
})
</script>
