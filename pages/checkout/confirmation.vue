<template>
  <div class="checkout-page">
    <div class="p-6 md:p-8">
      <div class="max-w-4xl mx-auto">
        <!-- Success Icon -->
        <div class="mb-8 text-center">
          <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/20">
            <svg
              class="h-8 w-8 text-green-600 dark:text-green-400"
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
          </div>
        </div>

        <!-- Success Message -->
        <div class="mb-8 text-center">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {{ $t('checkout.steps.confirmation.title') }}
          </h2>
          <p class="text-lg text-gray-600 dark:text-gray-400 mb-2">
            {{ $t('checkout.steps.confirmation.subtitle') }}
          </p>
          <p class="text-sm text-gray-500 dark:text-gray-500">
            {{ $t('checkout.steps.confirmation.emailSent') }}
          </p>
        </div>

        <!-- Order Number -->
        <div
          v-if="orderData"
          class="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg p-6 mb-6 text-center"
        >
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">
            {{ $t('checkout.confirmation.orderNumber') }}
          </p>
          <p class="text-2xl font-bold text-green-600 dark:text-green-400">
            {{ orderData.orderNumber || 'N/A' }}
          </p>
        </div>

        <!-- Order Status Timeline -->
        <div
          v-if="orderData"
          class="mb-6"
        >
          <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <!-- Header with Step Indicator -->
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ $t('checkout.confirmation.orderStatus') }}
              </h3>
              <span class="text-sm text-gray-500 dark:text-gray-400">
                {{ $t('checkout.confirmation.stepIndicator', { current: 2, total: 3 }) }}
              </span>
            </div>

            <!-- Progress Bar -->
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-6">
              <div class="bg-green-600 h-2 rounded-full transition-all duration-300" style="width: 66%"></div>
            </div>

            <!-- Status Steps -->
            <div class="flex items-center justify-between mb-4">
              <!-- Step 1: Confirmed -->
              <div class="flex flex-col items-center flex-1">
                <div class="w-12 h-12 rounded-full bg-green-600 dark:bg-green-500 flex items-center justify-center mb-2">
                  <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </div>
                <p class="text-sm font-medium text-green-600 dark:text-green-400 text-center">
                  {{ $t('checkout.confirmation.status.confirmed') }}
                </p>
              </div>

              <!-- Step 2: Preparing (Current) -->
              <div class="flex flex-col items-center flex-1">
                <div class="w-12 h-12 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center mb-2">
                  <div class="w-3 h-3 rounded-full bg-white dark:bg-gray-900"></div>
                </div>
                <p class="text-sm font-medium text-gray-900 dark:text-white text-center">
                  {{ $t('checkout.confirmation.status.preparing') }}
                </p>
              </div>

              <!-- Step 3: Shipped (Pending) -->
              <div class="flex flex-col items-center flex-1">
                <div class="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-2">
                  <div class="w-3 h-3 rounded-full bg-gray-400 dark:bg-gray-500"></div>
                </div>
                <p class="text-sm font-medium text-gray-400 dark:text-gray-500 text-center">
                  {{ $t('checkout.confirmation.status.shipped') }}
                </p>
              </div>
            </div>

            <!-- Status Description -->
            <div class="text-center">
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ $t('checkout.confirmation.preparingOrder', { days: '2-3' }) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Quick Info Cards -->
        <div
          v-if="orderData"
          class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8"
        >
          <!-- Delivery Card -->
          <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h4 class="text-base font-medium text-gray-900 dark:text-white mb-2">
              {{ $t('checkout.confirmation.delivery') }}
            </h4>
            <p
              v-if="estimatedDeliveryDate"
              class="text-2xl font-bold text-gray-900 dark:text-white mb-1"
            >
              {{ formatShortDate(estimatedDeliveryDate) }}
            </p>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ shippingInfo?.method?.description || $t('checkout.confirmation.businessDays', { days: '3-5' }) }}
            </p>
          </div>

          <!-- Total Paid Card -->
          <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h4 class="text-base font-medium text-gray-900 dark:text-white mb-2">
              {{ $t('checkout.confirmation.totalPaid') }}
            </h4>
            <p class="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {{ formatPrice(orderData.total || 0) }}
            </p>
            <NuxtLink
              :to="localePath('#order-details')"
              class="text-sm text-green-600 dark:text-green-400 hover:underline inline-flex items-center"
            >
              {{ $t('checkout.confirmation.viewDetails') }}
              <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </NuxtLink>
          </div>
        </div>

        <!-- Trust Badges -->
        <div
          v-if="orderData"
          class="grid grid-cols-3 gap-4 mb-8"
        >
          <!-- Secure -->
          <div class="flex flex-col items-center text-center p-4">
            <svg class="w-8 h-8 text-gray-600 dark:text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <p class="text-sm font-medium text-gray-900 dark:text-white">
              {{ $t('checkout.trust.secure') }}
            </p>
          </div>

          <!-- Easy Returns -->
          <div class="flex flex-col items-center text-center p-4">
            <svg class="w-8 h-8 text-gray-600 dark:text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
            <p class="text-sm font-medium text-gray-900 dark:text-white">
              {{ $t('checkout.trust.easyReturns') }}
            </p>
          </div>

          <!-- 24/7 Support -->
          <div class="flex flex-col items-center text-center p-4">
            <svg class="w-8 h-8 text-gray-600 dark:text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p class="text-sm font-medium text-gray-900 dark:text-white">
              {{ $t('checkout.trust.support247') }}
            </p>
          </div>
        </div>

        <!-- Order Details -->
        <div
          v-if="orderData"
          class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8"
        >
          <!-- Order Items -->
          <div class="lg:col-span-2">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {{ $t('checkout.confirmation.orderItems') }}
              </h3>

              <div class="space-y-4">
                <div
                  v-for="item in orderData.items || []"
                  :key="item.productId"
                  class="flex items-center space-x-4 py-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                >
                  <!-- Product Image -->
                  <div class="flex-shrink-0">
                    <img
                      :src="getProductImage(item.productSnapshot)"
                      :alt="getLocalizedText(item.productSnapshot.name)"
                      class="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                    />
                  </div>

                  <!-- Product Details -->
                  <div class="flex-1 min-w-0">
                    <h4 class="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {{ getLocalizedText(item.productSnapshot.name) }}
                    </h4>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      {{ $t('common.quantity') }}: {{ item.quantity }}
                    </p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      {{ formatPrice(item.price) }} {{ $t('common.each') }}
                    </p>
                  </div>

                  <!-- Item Total -->
                  <div class="text-right">
                    <p class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ formatPrice(item.total) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Shipping Information -->
            <div
              v-if="shippingInfo"
              class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mt-6"
            >
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {{ $t('checkout.confirmation.shippingInfo') }}
              </h3>

              <div class="space-y-3">
                <!-- Shipping Address -->
                <div>
                  <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    {{ $t('checkout.confirmation.shippingAddress') }}
                  </h4>
                  <div class="text-sm text-gray-600 dark:text-gray-400">
                    <p>{{ shippingInfo.address.firstName }} {{ shippingInfo.address.lastName }}</p>
                    <p v-if="shippingInfo.address.company">
                      {{ shippingInfo.address.company }}
                    </p>
                    <p>{{ shippingInfo.address.street }}</p>
                    <p>{{ shippingInfo.address.city }}, {{ shippingInfo.address.postalCode }}</p>
                    <p v-if="shippingInfo.address.province">
                      {{ shippingInfo.address.province }}
                    </p>
                    <p>{{ shippingInfo.address.country }}</p>
                    <p v-if="shippingInfo.address.phone">
                      {{ shippingInfo.address.phone }}
                    </p>
                  </div>
                </div>

                <!-- Shipping Method -->
                <div>
                  <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    {{ $t('checkout.confirmation.shippingMethod') }}
                  </h4>
                  <div class="text-sm text-gray-600 dark:text-gray-400">
                    <p class="font-medium">
                      {{ shippingInfo.method.name }}
                    </p>
                    <p>{{ shippingInfo.method.description }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Order Summary Sidebar -->
          <div class="lg:col-span-1">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-6">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {{ $t('common.orderSummary') }}
              </h3>

              <div class="space-y-3">
                <!-- Subtotal -->
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600 dark:text-gray-400">{{ $t('common.subtotal') }}</span>
                  <span class="text-gray-900 dark:text-white">{{ formatPrice(orderData.subtotal || 0) }}</span>
                </div>

                <!-- Shipping -->
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600 dark:text-gray-400">{{ $t('common.shipping') }}</span>
                  <span class="text-gray-900 dark:text-white">
                    {{ orderData.shippingCost === 0 ? $t('checkout.freeShipping') : formatPrice(orderData.shippingCost || 0) }}
                  </span>
                </div>

                <!-- Tax -->
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600 dark:text-gray-400">{{ $t('common.tax') }}</span>
                  <span class="text-gray-900 dark:text-white">{{ formatPrice(orderData.tax || 0) }}</span>
                </div>

                <!-- Total -->
                <div class="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <div class="flex justify-between">
                    <span class="text-base font-semibold text-gray-900 dark:text-white">{{ $t('common.total') }}</span>
                    <span class="text-base font-semibold text-gray-900 dark:text-white">{{ formatPrice(orderData.total || 0) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div
          v-else
          class="flex justify-center items-center py-12"
        >
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span class="ml-3 text-gray-600 dark:text-gray-400">{{ $t('common.loading') }}</span>
        </div>

        <!-- Order Tracking Information -->
        <div
          v-if="orderData"
          class="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8"
        >
          <div class="flex items-start space-x-3">
            <div class="flex-shrink-0">
              <svg
                class="w-6 h-6 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div class="flex-1">
              <h3 class="text-sm font-medium text-blue-900 dark:text-blue-200 mb-1">
                {{ $t('checkout.confirmation.trackOrder') }}
              </h3>
              <p class="text-sm text-blue-700 dark:text-blue-300">
                {{ $t('checkout.confirmation.trackingAvailable') }}
              </p>
              <div
                v-if="isAuthenticated"
                class="mt-3"
              >
                <NuxtLink
                  :to="localePath(`/account/orders`)"
                  class="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline"
                >
                  {{ $t('checkout.steps.confirmation.viewOrders') }} →
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <NuxtLink
            v-if="isAuthenticated"
            :to="localePath('/account/orders')"
            class="inline-flex items-center px-6 py-2 text-sm font-medium text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
          >
            <svg
              class="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            {{ $t('checkout.steps.confirmation.viewOrders') }}
          </NuxtLink>

          <NuxtLink
            :to="localePath('/products')"
            class="inline-flex items-center px-6 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <svg
              class="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            {{ $t('checkout.steps.confirmation.continueShopping') }}
          </NuxtLink>

          <NuxtLink
            :to="localePath('/')"
            class="inline-flex items-center px-6 py-2 text-sm font-medium text-white bg-green-600 dark:bg-green-500 border border-transparent rounded-md hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
          >
            {{ $t('common.home') }}
            <svg
              class="w-4 h-4 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick } from 'vue'
import { useCheckoutStore } from '~/stores/checkout'
import { useCheckoutSessionStore } from '~/stores/checkout/session'
import { useAuthStore } from '~/stores/auth'
import { useCartStore } from '~/stores/cart'

// Layout
definePageMeta({
  layout: 'checkout',
  middleware: ['checkout'],
})

// Stores
const checkoutStore = useCheckoutStore()
const sessionStore = useCheckoutSessionStore()
const authStore = useAuthStore()
const cartStore = useCartStore()

// Composables
const localePath = useLocalePath()
const { t, locale } = useI18n()
const toast = useToast()

/**
 * Get localized text from a translation object or string
 * Handles both string values and translation objects like { en: "...", es: "..." }
 */
const getLocalizedText = (text: any): string => {
  if (!text) return ''
  if (typeof text === 'string') return text
  // Try current locale first
  const localeText = text[locale.value]
  if (localeText) return localeText
  // Fall back to Spanish (primary locale)
  const esText = text.es
  if (esText) return esText
  // Fall back to any available translation
  const values = Object.values(text).filter((v): v is string => typeof v === 'string')
  return values[0] || ''
}

/**
 * Get product image URL from snapshot
 * Handles both array of strings and array of image objects
 */
const getProductImage = (snapshot: Record<string, any> | null | undefined): string => {
  if (!snapshot) return '/placeholder-product.svg'
  const images = snapshot.images
  if (!images || !images.length) return '/placeholder-product.svg'
  const firstImage = images[0]
  if (typeof firstImage === 'string') return firstImage
  return firstImage?.url ?? '/placeholder-product.svg'
}

// Computed properties
// Access data directly from session store to bypass the checkout store proxy
// The proxy can return stale refs after restore(), so we use the source directly
const orderData = computed(() => sessionStore.orderData)
const shippingInfo = computed(() => sessionStore.shippingInfo)
const isAuthenticated = computed(() => authStore.isAuthenticated)

const estimatedDeliveryDate = computed(() => {
  if (!shippingInfo.value?.method?.estimatedDays) return null

  const today = new Date()
  const deliveryDate = new Date(today)
  deliveryDate.setDate(today.getDate() + shippingInfo.value.method.estimatedDays)

  return deliveryDate
})

// Methods
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(price)
}

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat(locale.value, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

const formatShortDate = (date: Date): string => {
  return new Intl.DateTimeFormat(locale.value, {
    month: 'short',
    day: 'numeric',
  }).format(date)
}

// Initialize on mount
onMounted(async () => {
  // Restore checkout data from cookies ONLY if we don't already have it
  // This handles fresh navigation (data in memory) after successful checkout.
  // NOTE: Page refresh after cart clearing will redirect to /cart via middleware
  // because cart validation runs before this code executes.
  if (!orderData.value) {
    try {
      await (checkoutStore.restore as any)()
      // Wait for Vue's reactivity system to propagate the state changes
      await nextTick()

      // Verify restore succeeded
      if (!sessionStore.orderData) {
        console.error('[ERROR] Session restore completed but orderData is still empty')
        toast.error(
          t('checkout.confirmation.sessionRestoreFailed'),
          t('checkout.confirmation.checkEmailForOrder'),
        )
      }
    }
    catch (error: any) {
      console.error('[CRITICAL] Exception during session restore:', error)
      toast.error(
        t('checkout.confirmation.errorLoadingOrder'),
        t('checkout.confirmation.contactSupport'),
      )
    }
  }

  // Ensure we're on the confirmation step
  checkoutStore.currentStep = 'confirmation'

  // Access orderData directly from session store to bypass the checkout store proxy
  // The proxy can return stale refs, so we need to access the source directly
  const currentOrderData = sessionStore.orderData

  // If still no order data after restore attempt, show error and redirect
  if (!currentOrderData || !currentOrderData.orderId || !currentOrderData.orderNumber) {
    console.error('[ERROR] Missing order data on confirmation page', {
      hasOrderData: !!currentOrderData,
      hasOrderId: !!currentOrderData?.orderId,
      hasOrderNumber: !!currentOrderData?.orderNumber,
    })

    // Show error message BEFORE redirecting
    toast.error(
      t('checkout.confirmation.orderDataMissing'),
      t('checkout.confirmation.checkYourEmail'),
    )

    // Delay redirect so user sees the message
    setTimeout(() => {
      navigateTo(localePath('/cart'))
    }, 2000)

    return
  }

  // Clear cart after successfully landing on confirmation page
  // This prevents race condition where cart is cleared before navigation completes
  try {
    await cartStore.clearCart()
  }
  catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('[ERROR] Failed to clear cart on confirmation page:', {
      error: errorMessage,
      orderId: currentOrderData.orderId,
      orderNumber: currentOrderData.orderNumber,
    })

    // Show user-friendly warning (non-blocking since order succeeded)
    toast.warning(
      t('checkout.confirmation.cartClearFailed'),
      t('checkout.confirmation.cartClearFailedDetails'),
    )
  }
})

// Clean up checkout session after user has viewed confirmation
onBeforeUnmount(() => {
  // Clear checkout session when leaving confirmation page
  // This allows user to start a fresh checkout next time
  setTimeout(() => {
    (checkoutStore.resetCheckout as any)()
  }, 1000)
})

// Page meta
useHead({
  title: 'Order Confirmation - Checkout',
  meta: [
    { name: 'description', content: 'Your order has been successfully placed' },
  ],
})
</script>

<style scoped>
.checkout-page {
  min-height: 60vh;
}
</style>
