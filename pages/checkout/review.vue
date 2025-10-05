<template>
  <div class="checkout-page">
    <div class="p-6 md:p-8">
      <div class="max-w-4xl mx-auto">
        <!-- Step Header -->
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {{ $t('checkout.steps.review.title') }}
          </h2>
          <p class="text-gray-600 dark:text-gray-400">
            {{ $t('checkout.steps.review.subtitle') }}
          </p>
        </div>

        <!-- Loading State -->
        <div v-if="checkoutStore.loading" class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span class="ml-3 text-gray-600 dark:text-gray-400">{{ $t('common.loading') }}</span>
        </div>

        <!-- Error State -->
        <div v-else-if="checkoutStore.lastError" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <div class="flex">
            <svg class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800 dark:text-red-200">
                {{ $t('common.error') }}
              </h3>
              <p class="mt-1 text-sm text-red-700 dark:text-red-300">
                {{ checkoutStore.lastError.message }}
              </p>
            </div>
          </div>
        </div>

        <!-- Order Review Content -->
        <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Main Content -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Cart Items Section -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                  {{ $t('checkout.review.cartItems') }}
                </h3>
                <button 
                  @click="editCart"
                  class="text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium"
                >
                  {{ $t('checkout.review.editCart') }}
                </button>
              </div>
              
              <div class="space-y-4">
                <div 
                  v-for="item in orderData?.items || []" 
                  :key="item.productId"
                  class="flex items-center space-x-4 py-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                >
                  <!-- Product Image -->
                  <div class="flex-shrink-0">
                    <img 
                      :src="item.productSnapshot.images?.[0] || '/placeholder-product.svg'"
                      :alt="item.productSnapshot.name"
                      class="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                    />
                  </div>
                  
                  <!-- Product Details -->
                  <div class="flex-1 min-w-0">
                    <h4 class="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {{ item.productSnapshot.name }}
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

            <!-- Shipping Information Section -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                  {{ $t('checkout.review.shippingInfo') }}
                </h3>
                <button 
                  @click="editShipping"
                  class="text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium"
                >
                  {{ $t('checkout.review.editShipping') }}
                </button>
              </div>
              
              <div v-if="shippingInfo" class="space-y-3">
                <!-- Shipping Address -->
                <div>
                  <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    {{ $t('checkout.review.shippingAddress') }}
                  </h4>
                  <div class="text-sm text-gray-600 dark:text-gray-400">
                    <p>{{ shippingInfo.address.firstName }} {{ shippingInfo.address.lastName }}</p>
                    <p v-if="shippingInfo.address.company">{{ shippingInfo.address.company }}</p>
                    <p>{{ shippingInfo.address.street }}</p>
                    <p>{{ shippingInfo.address.city }}, {{ shippingInfo.address.postalCode }}</p>
                    <p v-if="shippingInfo.address.province">{{ shippingInfo.address.province }}</p>
                    <p>{{ shippingInfo.address.country }}</p>
                    <p v-if="shippingInfo.address.phone">{{ shippingInfo.address.phone }}</p>
                  </div>
                </div>
                
                <!-- Shipping Method -->
                <div>
                  <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    {{ $t('checkout.review.shippingMethod') }}
                  </h4>
                  <div class="text-sm text-gray-600 dark:text-gray-400">
                    <p class="font-medium">{{ shippingInfo.method.name }}</p>
                    <p>{{ shippingInfo.method.description }}</p>
                    <p>{{ formatPrice(shippingInfo.method.price) }}</p>
                  </div>
                </div>
                
                <!-- Delivery Instructions -->
                <div v-if="shippingInfo.instructions">
                  <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    {{ $t('checkout.review.deliveryInstructions') }}
                  </h4>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    {{ shippingInfo.instructions }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Payment Method Section -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                  {{ $t('checkout.review.paymentMethod') }}
                </h3>
                <button 
                  @click="editPayment"
                  class="text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium"
                >
                  {{ $t('checkout.review.editPayment') }}
                </button>
              </div>
              
              <div v-if="paymentMethod" class="space-y-3">
                <!-- Cash Payment -->
                <div v-if="paymentMethod.type === 'cash'" class="flex items-center space-x-3">
                  <div class="flex-shrink-0">
                    <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ $t('checkout.payment.cash.title') }}
                    </p>
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                      {{ $t('checkout.payment.cash.description') }}
                    </p>
                  </div>
                </div>
                
                <!-- Credit Card Payment -->
                <div v-else-if="paymentMethod.type === 'credit_card'" class="flex items-center space-x-3">
                  <div class="flex-shrink-0">
                    <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ $t('checkout.payment.creditCard.title') }}
                    </p>
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                      **** **** **** {{ paymentMethod.creditCard?.number?.slice(-4) || '****' }}
                    </p>
                  </div>
                </div>
                
                <!-- PayPal Payment -->
                <div v-else-if="paymentMethod.type === 'paypal'" class="flex items-center space-x-3">
                  <div class="flex-shrink-0">
                    <svg class="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.26-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81.394.45.67.96.824 1.507z"/>
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ $t('checkout.payment.paypal.title') }}
                    </p>
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                      {{ paymentMethod.paypal?.email || '' }}
                    </p>
                  </div>
                </div>
                
                <!-- Bank Transfer Payment -->
                <div v-else-if="paymentMethod.type === 'bank_transfer'" class="flex items-center space-x-3">
                  <div class="flex-shrink-0">
                    <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ $t('checkout.payment.bankTransfer.title') }}
                    </p>
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                      {{ $t('checkout.payment.bankTransfer.description') }}
                    </p>
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
                  <span class="text-gray-900 dark:text-white">{{ formatPrice(orderData?.subtotal || 0) }}</span>
                </div>
                
                <!-- Shipping -->
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600 dark:text-gray-400">{{ $t('common.shipping') }}</span>
                  <span class="text-gray-900 dark:text-white">
                    {{ orderData?.shippingCost === 0 ? $t('checkout.freeShipping') : formatPrice(orderData?.shippingCost || 0) }}
                  </span>
                </div>
                
                <!-- Tax -->
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600 dark:text-gray-400">{{ $t('common.tax') }}</span>
                  <span class="text-gray-900 dark:text-white">{{ formatPrice(orderData?.tax || 0) }}</span>
                </div>
                
                <!-- Total -->
                <div class="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <div class="flex justify-between">
                    <span class="text-base font-semibold text-gray-900 dark:text-white">{{ $t('common.total') }}</span>
                    <span class="text-base font-semibold text-gray-900 dark:text-white">{{ formatPrice(orderData?.total || 0) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Terms and Conditions -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mt-8">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {{ $t('checkout.terms.title') }}
          </h3>
          
          <div class="space-y-4">
            <!-- Terms Acceptance -->
            <div class="flex items-start space-x-3">
              <div class="flex items-center h-5">
                <input
                  id="accept-terms"
                  v-model="termsAccepted"
                  type="checkbox"
                  class="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  :class="{ 'border-red-500': showTermsError }"
                />
              </div>
              <div class="text-sm">
                <label for="accept-terms" class="text-gray-700 dark:text-gray-300">
                  {{ $t('checkout.terms.acceptTerms') }}
                  <a 
                    :href="localePath('/terms')" 
                    target="_blank"
                    class="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 underline"
                  >
                    {{ $t('checkout.terms.termsAndConditions') }}
                  </a>
                  {{ $t('common.and') }}
                  <a 
                    :href="localePath('/privacy')" 
                    target="_blank"
                    class="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 underline"
                  >
                    {{ $t('checkout.terms.privacyPolicy') }}
                  </a>
                </label>
                <p v-if="showTermsError" class="mt-1 text-sm text-red-600 dark:text-red-400">
                  {{ $t('checkout.terms.termsRequired') }}
                </p>
              </div>
            </div>
            
            <!-- Privacy Policy Acceptance -->
            <div class="flex items-start space-x-3">
              <div class="flex items-center h-5">
                <input
                  id="accept-privacy"
                  v-model="privacyAccepted"
                  type="checkbox"
                  class="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  :class="{ 'border-red-500': showPrivacyError }"
                />
              </div>
              <div class="text-sm">
                <label for="accept-privacy" class="text-gray-700 dark:text-gray-300">
                  {{ $t('checkout.terms.acceptPrivacy') }}
                </label>
                <p v-if="showPrivacyError" class="mt-1 text-sm text-red-600 dark:text-red-400">
                  {{ $t('checkout.terms.privacyRequired') }}
                </p>
              </div>
            </div>
            
            <!-- Marketing Consent (Optional) -->
            <div class="flex items-start space-x-3">
              <div class="flex items-center h-5">
                <input
                  id="marketing-consent"
                  v-model="marketingConsent"
                  type="checkbox"
                  class="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div class="text-sm">
                <label for="marketing-consent" class="text-gray-700 dark:text-gray-300">
                  {{ $t('checkout.terms.marketingConsent') }}
                  <span class="text-gray-500 dark:text-gray-400">({{ $t('common.optional') }})</span>
                </label>
                <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {{ $t('checkout.terms.marketingDescription') }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Navigation Buttons -->
        <div class="flex flex-col sm:flex-row justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700 space-y-3 sm:space-y-0 mt-8">
          <button 
            @click="goBack"
            :disabled="checkoutStore.processing"
            class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            {{ $t('checkout.backToPayment') }}
          </button>

          <button 
            @click="proceedToPlaceOrder"
            :disabled="!canProceed || checkoutStore.processing"
            class="inline-flex items-center px-6 py-2 text-sm font-medium text-white bg-green-600 dark:bg-green-500 border border-transparent rounded-md hover:bg-green-700 dark:hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="checkoutStore.processing" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
            {{ checkoutStore.processing ? $t('checkout.processing') : $t('checkout.placeOrder') }}
            <svg v-if="!checkoutStore.processing" class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCheckoutStore } from '~/stores/checkout'
import { useCartStore } from '~/stores/cart'

// Layout
definePageMeta({
  layout: 'checkout',
  middleware: ['checkout']
})

// Stores
const checkoutStore = useCheckoutStore()
const cartStore = useCartStore()

// Composables
const localePath = useLocalePath()
const { t } = useI18n()

// Reactive data
const termsAccepted = ref(false)
const privacyAccepted = ref(false)
const marketingConsent = ref(false)
const showTermsError = ref(false)
const showPrivacyError = ref(false)

// Computed properties
const orderData = computed(() => checkoutStore.orderData)
const shippingInfo = computed(() => checkoutStore.shippingInfo)
const paymentMethod = computed(() => checkoutStore.paymentMethod)

const canProceed = computed(() => {
  return checkoutStore.canCompleteOrder && 
         orderData.value && 
         shippingInfo.value && 
         paymentMethod.value &&
         termsAccepted.value &&
         privacyAccepted.value
})

// Methods
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(price)
}

const validateOrder = (): boolean => {
  // Check if we have all required data
  if (!orderData.value) {
    console.error('Order data is missing')
    return false
  }
  
  if (!shippingInfo.value) {
    console.error('Shipping information is missing')
    return false
  }
  
  if (!paymentMethod.value) {
    console.error('Payment method is missing')
    return false
  }
  
  // Check if cart has items
  if (!orderData.value.items || orderData.value.items.length === 0) {
    console.error('Cart is empty')
    return false
  }
  
  // Validate order total
  if (orderData.value.total <= 0) {
    console.error('Invalid order total')
    return false
  }
  
  return true
}

const goBack = async () => {
  const previousStep = checkoutStore.goToPreviousStep()
  if (previousStep) {
    const stepPath = previousStep === 'shipping' ? '/checkout' : `/checkout/${previousStep}`
    await navigateTo(localePath(stepPath))
  }
}

const editCart = async () => {
  await navigateTo(localePath('/cart'))
}

const editShipping = async () => {
  checkoutStore.goToStep('shipping')
  await navigateTo(localePath('/checkout'))
}

const editPayment = async () => {
  checkoutStore.goToStep('payment')
  await navigateTo(localePath('/checkout/payment'))
}

const proceedToPlaceOrder = async () => {
  // Validate terms and conditions
  showTermsError.value = !termsAccepted.value
  showPrivacyError.value = !privacyAccepted.value
  
  if (!termsAccepted.value || !privacyAccepted.value) {
    // Scroll to terms section to show errors
    const termsSection = document.querySelector('#accept-terms')
    if (termsSection) {
      termsSection.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
    return
  }
  
  // Clear any previous errors
  showTermsError.value = false
  showPrivacyError.value = false
  
  try {
    // Validate order before processing
    if (!validateOrder()) {
      return
    }
    
    // Store terms acceptance in checkout store
    checkoutStore.termsAccepted = termsAccepted.value
    checkoutStore.privacyAccepted = privacyAccepted.value
    checkoutStore.marketingConsent = marketingConsent.value
    
    // Process the order through checkout store
    const nextStep = await checkoutStore.proceedToNextStep()
    
    // Navigate to confirmation page
    if (nextStep) {
      const stepPath = nextStep === 'shipping' ? '/checkout' : `/checkout/${nextStep}`
      await navigateTo(localePath(stepPath))
    }
    
  } catch (error) {
    console.error('Failed to place order:', error)
    // Error handling is done by the checkout store
  }
}

// Initialize checkout data on mount
onMounted(async () => {
  try {
    // Ensure we have cart items
    if (cartStore.isEmpty) {
      await navigateTo(localePath('/cart'))
      return
    }

    // Initialize checkout if not already done
    if (!checkoutStore.sessionId) {
      await checkoutStore.initializeCheckout(cartStore.items)
    }

    // Validate that we have required data for review step
    if (!checkoutStore.canProceedToReview) {
      // Redirect to appropriate step based on what's missing
      if (!checkoutStore.shippingInfo) {
        await navigateTo(localePath('/checkout'))
      } else if (!checkoutStore.paymentMethod) {
        await navigateTo(localePath('/checkout/payment'))
      }
      return
    }

    // Set current step to review
    checkoutStore.currentStep = 'review'
  } catch (error) {
    console.error('Failed to initialize checkout review:', error)
  }
})

// Page meta
useHead({
  title: 'Review Order - Checkout',
  meta: [
    { name: 'description', content: 'Review your order details before completing your purchase' }
  ]
})
</script>

<style scoped>
.checkout-page {
  min-height: 60vh;
}
</style>