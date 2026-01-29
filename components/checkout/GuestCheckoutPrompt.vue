<template>
  <div
    v-if="show"
    class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-5 mb-6"
    data-testid="guest-checkout-prompt"
  >
    <div class="flex items-start space-x-4">
      <!-- User Icon -->
      <div class="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
        <svg
          class="w-5 h-5 text-blue-600 dark:text-blue-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      </div>

      <div class="flex-1">
        <h3 class="text-base font-semibold text-blue-900 dark:text-blue-100 mb-2">
          {{ $t('checkout.guestCheckout.title') }}
        </h3>

        <!-- Benefits List -->
        <ul class="space-y-1.5 mb-4">
          <li class="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
            <svg
              class="w-4 h-4 text-green-500 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clip-rule="evenodd"
              />
            </svg>
            {{ $t('checkout.guestCheckout.benefits.savedAddresses') }}
          </li>
          <li class="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
            <svg
              class="w-4 h-4 text-green-500 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clip-rule="evenodd"
              />
            </svg>
            {{ $t('checkout.guestCheckout.benefits.fasterCheckout') }}
          </li>
          <li class="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
            <svg
              class="w-4 h-4 text-green-500 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clip-rule="evenodd"
              />
            </svg>
            {{ $t('checkout.guestCheckout.benefits.orderHistory') }}
          </li>
        </ul>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-3">
          <NuxtLink
            :to="localePath('/auth/login?redirect=/checkout')"
            class="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
              />
            </svg>
            {{ $t('checkout.guestCheckout.loginButton') }}
          </NuxtLink>
          <UiButton
            variant="outline"
            class="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            data-testid="continue-as-guest"
            @click="$emit('continue-as-guest')"
          >
            {{ $t('checkout.guestCheckout.guestButton') }}
            <svg
              class="w-4 h-4"
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
          </UiButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  show: boolean
}

defineProps<Props>()

interface Emits {
  (e: 'continue-as-guest'): void
}

defineEmits<Emits>()

const localePath = useLocalePath()
</script>
