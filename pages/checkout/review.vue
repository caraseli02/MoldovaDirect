<template>
  <div class="checkout-page">
    <div class="p-6 md:p-8">
      <div class="max-w-4xl mx-auto">
        <header class="mb-8">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {{ $t('checkout.steps.review.title') }}
          </h2>
          <p class="text-gray-600 dark:text-gray-400">
            {{ $t('checkout.steps.review.subtitle') }}
          </p>
        </header>

        <div v-if="loading" class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span class="ml-3 text-gray-600 dark:text-gray-400">
            {{ $t('common.loading') }}
          </span>
        </div>

        <div
          v-else-if="error"
          class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6"
        >
          <div class="flex">
            <svg class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800 dark:text-red-200">
                {{ $t('common.error') }}
              </h3>
              <p class="mt-1 text-sm text-red-700 dark:text-red-300">
                {{ error.message }}
              </p>
            </div>
          </div>
        </div>

        <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="lg:col-span-2 space-y-6">
            <ReviewCartSection
              :items="orderData?.items ?? []"
              :format-price="formatPrice"
              @edit="editCart"
            />

            <ReviewShippingSection
              :shipping-info="shippingInfo"
              :format-price="formatPrice"
              @edit="editShipping"
            />

            <ReviewPaymentSection
              :payment-method="paymentMethod"
              @edit="editPayment"
            />
          </div>

          <div class="lg:col-span-1">
            <ReviewSummaryCard
              :order-data="orderData"
              :format-price="formatPrice"
            />
          </div>
        </div>

        <ReviewTermsSection
          v-model:termsAccepted="termsAccepted"
          v-model:privacyAccepted="privacyAccepted"
          v-model:marketingConsent="marketingConsent"
          :show-terms-error="showTermsError"
          :show-privacy-error="showPrivacyError"
          class="mt-8"
        />

        <footer class="flex flex-col sm:flex-row justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700 space-y-3 sm:space-y-0 mt-8">
          <button
            @click="goBack"
            :disabled="processing"
            class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            {{ $t('checkout.backToPayment') }}
          </button>

          <button
            @click="handlePlaceOrder"
            :disabled="!canProceed || processing"
            class="inline-flex items-center px-6 py-2 text-sm font-medium text-white bg-green-600 dark:bg-green-500 border border-transparent rounded-md hover:bg-green-700 dark:hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="processing" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
            {{ processing ? $t('checkout.processing') : $t('checkout.placeOrder') }}
            <svg v-if="!processing" class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ReviewCartSection from '~/components/checkout/review/ReviewCartSection.vue'
import ReviewPaymentSection from '~/components/checkout/review/ReviewPaymentSection.vue'
import ReviewShippingSection from '~/components/checkout/review/ReviewShippingSection.vue'
import ReviewSummaryCard from '~/components/checkout/review/ReviewSummaryCard.vue'
import ReviewTermsSection from '~/components/checkout/review/ReviewTermsSection.vue'
import { useCheckoutReview } from '~/composables/checkout/useCheckoutReview'

definePageMeta({
  layout: 'checkout',
  middleware: ['checkout']
})

const {
  orderData,
  shippingInfo,
  paymentMethod,
  loading,
  error,
  processing,
  baseCanProceed,
  initializeReview,
  formatPrice,
  goBack,
  editCart,
  editShipping,
  editPayment,
  processOrder
} = useCheckoutReview()

const localePath = useLocalePath()

const termsAccepted = ref(false)
const privacyAccepted = ref(false)
const marketingConsent = ref(false)
const showTermsError = ref(false)
const showPrivacyError = ref(false)

const canProceed = computed(() => {
  return baseCanProceed.value &&
    termsAccepted.value &&
    privacyAccepted.value
})

const scrollToTerms = () => {
  const termsSection = document.querySelector('#accept-terms')
  if (termsSection) {
    termsSection.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

const handlePlaceOrder = async () => {
  showTermsError.value = !termsAccepted.value
  showPrivacyError.value = !privacyAccepted.value

  if (!termsAccepted.value || !privacyAccepted.value) {
    scrollToTerms()
    return
  }

  const { nextStep, success } = await processOrder({
    termsAccepted: termsAccepted.value,
    privacyAccepted: privacyAccepted.value,
    marketingConsent: marketingConsent.value
  })

  if (!success || !nextStep) {
    return
  }

  const stepPath = nextStep === 'shipping' ? '/checkout' : `/checkout/${nextStep}`
  await navigateTo(localePath(stepPath))
}

onMounted(async () => {
  await initializeReview()
})

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
