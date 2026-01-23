<template>
  <section class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4">
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
      {{ $t('checkout.terms.title') }}
    </h3>

    <div class="space-y-4">
      <div class="flex items-start gap-3">
        <UiCheckbox
          :checked="termsAccepted"
          class="mt-0.5 shrink-0"
          @update:checked="updateTermsAccepted($event)"
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
      </div>

      <div class="flex items-start gap-3">
        <UiCheckbox
          :checked="privacyAccepted"
          class="mt-0.5 shrink-0"
          @update:checked="updatePrivacyAccepted($event)"
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
      </div>

      <div class="flex items-start gap-3">
        <UiCheckbox
          :checked="marketingConsent"
          class="mt-0.5 shrink-0"
          @update:checked="updateMarketingConsent($event)"
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
      </div>
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
