<template>
  <section class="checkout-section checkout-section-highlight fade-in">
    <div class="section-content">
      <!-- Terms Checkboxes -->
      <div class="space-y-3 mb-6">
        <div class="flex items-start">
          <div class="flex items-center h-5">
            <UiCheckbox
              id="terms-privacy-check"
              :checked="termsAccepted && privacyAccepted"
              class="mt-0.5"
              data-testid="terms-checkbox"
              aria-label="Terms and Privacy"
              @update:checked="(val: boolean) => { $emit('update:termsAccepted', val); $emit('update:privacyAccepted', val); }"
            />
          </div>
          <UiLabel
            for="terms-privacy-check"
            class="ml-2 text-sm text-gray-700 dark:text-gray-200 cursor-pointer select-none"
          >
            {{ $t('checkout.review.accept') }}
            <a
              href="/terms"
              target="_blank"
              class="font-medium text-rose-600 dark:text-rose-400 hover:text-rose-500 dark:hover:text-rose-300 underline"
            >
              {{ $t('checkout.review.termsOfService') }}
            </a>
            &
            <a
              href="/privacy"
              target="_blank"
              class="font-medium text-rose-600 dark:text-rose-400 hover:text-rose-500 dark:hover:text-rose-300 underline"
            >
              {{ $t('checkout.review.privacyPolicy') }}
            </a>
            <span
              v-if="showTermsError || showPrivacyError"
              class="text-red-500 text-xs ml-1 font-bold"
            >*</span>
          </UiLabel>
        </div>

        <div class="flex items-start">
          <div class="flex items-center h-5">
            <UiCheckbox
              id="marketing-check"
              :checked="marketingConsent"
              class="mt-0.5"
              data-testid="marketing-checkbox"
              aria-label="Marketing Consent"
              @update:checked="$emit('update:marketingConsent', $event)"
            />
          </div>
          <UiLabel
            for="marketing-check"
            class="ml-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer select-none"
          >
            {{ $t('checkout.review.marketingConsent') }}
          </UiLabel>
        </div>
      </div>

      <!-- Place Order Button (Visible on All Devices) -->
      <UiButton
        :disabled="processingOrder"
        class="flex w-full bg-rose-600 hover:bg-rose-700 text-white"
        size="lg"
        data-testid="place-order-button"
        type="submit"
        @click="$emit('place-order')"
      >
        <span
          v-if="processingOrder"
          class="flex items-center"
        >
          <svg
            class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            fill="none"
            viewBox="0 0 24 24"
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
          {{ $t('checkout.processing') }}
        </span>
        <span
          v-else
          class="flex items-center font-bold text-lg"
        >
          {{ $t('checkout.placeOrder') }} - {{ formattedTotal }}
          <svg
            class="ml-2 w-5 h-5"
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
        </span>
      </UiButton>
    </div>
  </section>
</template>

<script setup lang="ts">
interface Props {
  termsAccepted: boolean
  privacyAccepted: boolean
  marketingConsent: boolean
  canPlaceOrder: boolean
  processingOrder: boolean
  formattedTotal: string
  showTermsError?: boolean
  showPrivacyError?: boolean
}

interface Emits {
  (e: 'update:termsAccepted', value: boolean): void
  (e: 'update:privacyAccepted', value: boolean): void
  (e: 'update:marketingConsent', value: boolean): void
  (e: 'place-order'): void
}

withDefaults(defineProps<Props>(), {
  showTermsError: false,
  showPrivacyError: false,
})

defineEmits<Emits>()
</script>

<style scoped>
.checkout-section {
  background-color: white;
  border-radius: 0.5rem;
  border: 1px solid rgb(229 231 235);
  overflow: hidden;
}

:root.dark .checkout-section,
.dark .checkout-section {
  background-color: rgb(31 41 55);
  border-color: rgb(55 65 81);
}

.checkout-section-highlight {
  border-color: rgb(191 219 254);
  background-color: rgb(239 246 255 / 0.5);
}

:root.dark .checkout-section-highlight,
.dark .checkout-section-highlight {
  border-color: rgb(30 64 175);
  background-color: rgb(30 58 138 / 0.1);
}

.section-content {
  padding: 1.5rem;
}

.fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
