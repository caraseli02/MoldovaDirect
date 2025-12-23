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

        <div
          v-if="loading"
          class="flex justify-center items-center py-12"
        >
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
            <svg
              class="h-5 w-5 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
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

        <div
          v-else
          class="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          <div class="lg:col-span-2 space-y-6">
            <Suspense>
              <template #default>
                <ReviewCartSection
                  :items="orderData?.items ?? []"
                  :format-price="formatPrice"
                  @edit="editCart"
                />
              </template>
              <template #fallback>
                <div class="h-32 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"></div>
              </template>
            </Suspense>

            <Suspense>
              <template #default>
                <ReviewShippingSection
                  :shipping-info="shippingInfo"
                  :format-price="formatPrice"
                  @edit="editShipping"
                />
              </template>
              <template #fallback>
                <div class="h-32 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"></div>
              </template>
            </Suspense>

            <Suspense>
              <template #default>
                <ReviewPaymentSection
                  :payment-method="paymentMethod"
                  @edit="editPayment"
                />
              </template>
              <template #fallback>
                <div class="h-32 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"></div>
              </template>
            </Suspense>
          </div>

          <div class="lg:col-span-1">
            <Suspense>
              <template #default>
                <ReviewSummaryCard
                  :order-data="orderData"
                  :format-price="formatPrice"
                />
              </template>
              <template #fallback>
                <div class="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"></div>
              </template>
            </Suspense>
          </div>
        </div>

        <Suspense>
          <template #default>
            <ReviewTermsSection
              v-model:terms-accepted="termsAccepted"
              v-model:privacy-accepted="privacyAccepted"
              v-model:marketing-consent="marketingConsent"
              :show-terms-error="showTermsError"
              :show-privacy-error="showPrivacyError"
              class="mt-8"
            />
          </template>
          <template #fallback>
            <div class="h-24 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse mt-8"></div>
          </template>
        </Suspense>

        <footer class="flex flex-col sm:flex-row justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700 space-y-3 sm:space-y-0 mt-8">
          <UiButton
            :disabled="processing"
            variant="outline"
            @click="goBack"
          >
            <commonIcon
              name="lucide:chevron-left"
              class="mr-2 h-4 w-4"
            />
            {{ $t('checkout.backToPayment') }}
          </UiButton>

          <div class="flex flex-col items-end gap-2">
            <UiButton
              :disabled="!canProceed || processing"
              size="lg"
              class="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 h-12 px-8 text-base font-semibold"
              @click="handlePlaceOrder"
            >
              <commonIcon
                v-if="processing"
                name="lucide:loader-2"
                class="mr-2 h-5 w-5 animate-spin"
              />
              <commonIcon
                v-else
                name="lucide:lock"
                class="mr-2 h-4 w-4"
              />
              {{ processing ? $t('checkout.processing') : $t('checkout.placeOrderSecure') }}
              <commonIcon
                v-if="!processing"
                name="lucide:chevron-right"
                class="ml-2 h-5 w-5"
              />
            </UiButton>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{ $t('checkout.notChargedYet') }}
            </p>
          </div>
        </footer>

        <!-- Trust Badges -->
        <CheckoutTrustBadges class="mt-8" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCheckoutReview } from '~/composables/checkout/useCheckoutReview'
import ReviewCartSection from '~/components/checkout/review/ReviewCartSection.vue'
import ReviewPaymentSection from '~/components/checkout/review/ReviewPaymentSection.vue'
import ReviewShippingSection from '~/components/checkout/review/ReviewShippingSection.vue'
import ReviewSummaryCard from '~/components/checkout/review/ReviewSummaryCard.vue'
import ReviewTermsSection from '~/components/checkout/review/ReviewTermsSection.vue'

definePageMeta({
  layout: 'checkout',
  middleware: ['checkout'],
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
  processOrder,
} = useCheckoutReview()

const localePath = useLocalePath()

const termsAccepted = ref(false)
const privacyAccepted = ref(false)
const marketingConsent = ref(false)
const showTermsError = ref(false)
const showPrivacyError = ref(false)

const canProceed = computed(() => {
  return baseCanProceed.value
    && termsAccepted.value
    && privacyAccepted.value
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
    marketingConsent: marketingConsent.value,
  })

  if (!success || !nextStep) {
    return
  }

  // Navigate immediately - orderData is now persisted atomically
  const stepPath = nextStep === 'shipping' ? '/checkout' : `/checkout/${nextStep}`
  await navigateTo(localePath(stepPath))
}

onMounted(async () => {
  await initializeReview()
})

useHead({
  title: 'Review Order - Checkout',
  meta: [
    { name: 'description', content: 'Review your order details before completing your purchase' },
  ],
})
</script>

<style scoped>
.checkout-page {
  min-height: 60vh;
}
</style>
