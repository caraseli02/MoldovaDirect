<template>
  <section class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4">
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
      {{ $t('checkout.terms.title') }}
    </h3>

    <div class="space-y-4">
      <label class="flex items-start space-x-3">
        <input
          id="accept-terms"
          type="checkbox"
          :checked="termsAccepted"
          class="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          @change="updateTermsAccepted(($event.target as HTMLInputElement)?.checked ?? false)"
        />
        <div class="text-sm">
          <p class="text-gray-700 dark:text-gray-300">
            {{ $t('checkout.terms.acceptTerms') }}
            <NuxtLink
              :to="localePath('/terms')"
              class="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium"
            >
              {{ $t('checkout.terms.termsAndConditions') }}
            </NuxtLink>
            {{ $t('common.and') }}
            <NuxtLink
              :to="localePath('/privacy')"
              class="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium"
            >
              {{ $t('checkout.terms.privacyPolicy') }}
            </NuxtLink>
          </p>
          <p
            v-if="showTermsError"
            class="mt-1 text-sm text-red-600 dark:text-red-400"
          >
            {{ $t('checkout.terms.termsRequired') }}
          </p>
        </div>
      </label>

      <label class="flex items-start space-x-3">
        <input
          id="accept-privacy"
          type="checkbox"
          :checked="privacyAccepted"
          class="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          @change="updatePrivacyAccepted(($event.target as HTMLInputElement)?.checked ?? false)"
        />
        <div class="text-sm">
          <p class="text-gray-700 dark:text-gray-300">
            {{ $t('checkout.terms.acceptPrivacy') }}
          </p>
          <p
            v-if="showPrivacyError"
            class="mt-1 text-sm text-red-600 dark:text-red-400"
          >
            {{ $t('checkout.terms.privacyRequired') }}
          </p>
        </div>
      </label>

      <label class="flex items-start space-x-3">
        <input
          id="marketing-consent"
          type="checkbox"
          :checked="marketingConsent"
          class="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          @change="updateMarketingConsent(($event.target as HTMLInputElement)?.checked ?? false)"
        />
        <div class="text-sm">
          <p class="text-gray-700 dark:text-gray-300">
            {{ $t('checkout.terms.marketingConsent') }}
            <span class="text-gray-500 dark:text-gray-400">({{ $t('common.optional') }})</span>
          </p>
          <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {{ $t('checkout.terms.marketingDescription') }}
          </p>
        </div>
      </label>
    </div>
  </section>
</template>

<script setup lang="ts">
interface Props {
  termsAccepted: boolean
  privacyAccepted: boolean
  marketingConsent: boolean
  showTermsError: boolean
  showPrivacyError: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:termsAccepted', value: boolean): void
  (e: 'update:privacyAccepted', value: boolean): void
  (e: 'update:marketingConsent', value: boolean): void
}>()

const localePath = useLocalePath()

const updateTermsAccepted = (value: boolean) => emit('update:termsAccepted', value)
const updatePrivacyAccepted = (value: boolean) => emit('update:privacyAccepted', value)
const updateMarketingConsent = (value: boolean) => emit('update:marketingConsent', value)
</script>
