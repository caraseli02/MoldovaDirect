<template>
  <div v-if="showBanner" class="express-checkout-banner mb-6 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg border border-indigo-200 dark:border-indigo-700">
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <div class="flex items-center mb-2">
          <svg class="w-5 h-5 text-indigo-600 dark:text-indigo-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ $t('checkout.expressCheckout.title', 'Express Checkout Available') }}
          </h3>
        </div>
        <p class="text-sm text-gray-600 dark:text-gray-300 mb-4">
          {{ $t('checkout.expressCheckout.description', 'Use your saved address and preferences for a faster checkout experience.') }}
        </p>

        <!-- Saved Address Summary -->
        <div class="bg-white dark:bg-gray-800 rounded-md p-4 mb-4">
          <div class="text-sm">
            <div class="font-medium text-gray-900 dark:text-white mb-1">
              {{ defaultAddress?.full_name }}
            </div>
            <div class="text-gray-600 dark:text-gray-400">
              {{ defaultAddress?.address }}<br>
              {{ defaultAddress?.city }}, {{ defaultAddress?.postal_code }}<br>
              {{ defaultAddress?.country }}
            </div>
            <div v-if="preferredShippingMethod" class="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              <span class="text-gray-600 dark:text-gray-400">
                {{ $t('checkout.expressCheckout.preferredShipping', 'Preferred shipping') }}:
              </span>
              <span class="ml-1 font-medium text-gray-900 dark:text-white">
                {{ preferredShippingMethod }}
              </span>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-wrap gap-3">
          <button
            @click="useExpressCheckout"
            :disabled="loading"
            class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span v-if="!loading">
              {{ $t('checkout.expressCheckout.useButton', 'Use Express Checkout') }}
            </span>
            <span v-else class="flex items-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ $t('common.loading', 'Loading...') }}
            </span>
          </button>
          <button
            @click="dismissBanner"
            class="px-4 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
          >
            {{ $t('checkout.expressCheckout.editButton', 'Edit Details') }}
          </button>
        </div>
      </div>

      <!-- Close Button -->
      <button
        @click="dismissBanner"
        class="ml-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        :aria-label="$t('common.close', 'Close')"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Address } from '~/types/checkout'

const props = defineProps<{
  defaultAddress: Address | null
  preferredShippingMethod?: string | null
}>()

const emit = defineEmits<{
  (e: 'use-express'): void
  (e: 'dismiss'): void
}>()

const checkoutStore = useCheckoutStore()
const { t } = useI18n()
const localePath = useLocalePath()
const toast = useToast()

// State
const showBanner = ref(true)
const loading = ref(false)

// Methods
const useExpressCheckout = async () => {
  if (!props.defaultAddress) return

  loading.value = true

  try {
    // Pre-populate checkout with saved data
    const shippingInfo = {
      address: props.defaultAddress,
      method: props.preferredShippingMethod ? {
        id: props.preferredShippingMethod,
        name: props.preferredShippingMethod,
        price: 0 // Will be updated when shipping methods load
      } : null,
      instructions: undefined
    }

    if (shippingInfo.method) {
      await checkoutStore.updateShippingInfo(shippingInfo as any)

      toast.success(
        t('checkout.expressCheckout.success', 'Express checkout activated'),
        t('checkout.expressCheckout.successDetails', 'Your saved details have been loaded')
      )

      // Navigate directly to payment if we have shipping method
      await navigateTo(localePath('/checkout/payment'))
    } else {
      // Just load the address, user needs to select shipping method
      await checkoutStore.updateShippingInfo({ address: props.defaultAddress } as any)

      toast.info(
        t('checkout.expressCheckout.addressLoaded', 'Address loaded'),
        t('checkout.expressCheckout.selectShipping', 'Please select a shipping method')
      )
    }

    emit('use-express')
  } catch (error) {
    console.error('Express checkout failed:', error)
    toast.error(
      t('checkout.errors.expressCheckoutFailed', 'Express checkout failed'),
      t('checkout.errors.pleaseTryAgain', 'Please try again or edit your details manually')
    )
  } finally {
    loading.value = false
  }
}

const dismissBanner = () => {
  showBanner.value = false
  emit('dismiss')
}

// Show banner only if we have a default address
watchEffect(() => {
  if (!props.defaultAddress) {
    showBanner.value = false
  }
})
</script>

<style scoped>
.express-checkout-banner {
  animation: slideInDown 0.3s ease-out;
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
