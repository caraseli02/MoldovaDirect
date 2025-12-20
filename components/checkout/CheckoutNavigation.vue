<template>
  <div
    class="flex flex-col sm:flex-row justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700 space-y-3 sm:space-y-0"
  >
    <NuxtLink
      v-if="backTo"
      :to="localePath(backTo)"
      class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
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
          d="M15 19l-7-7 7-7"
        />
      </svg>
      {{ backLabel || $t('checkout.backToCart') }}
    </NuxtLink>
    <div v-else></div>

    <Button
      :disabled="!canProceed || processing"
      class="inline-flex items-center px-6 py-2 text-sm font-medium"
      @click="$emit('proceed')"
    >
      <span
        v-if="processing"
        class="inline-flex items-center"
      >
        <svg
          class="animate-spin -ml-1 mr-2 h-4 w-4"
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
        class="inline-flex items-center"
      >
        {{ nextLabel || $t('checkout.continueToPayment') }}
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
            d="M9 5l7 7-7 7"
          />
        </svg>
      </span>
    </Button>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'

interface Props {
  canProceed: boolean
  processing: boolean
  backLabel?: string
  nextLabel?: string
  backTo?: string
}

withDefaults(defineProps<Props>(), {
  backTo: '/cart',
})

interface Emits {
  (e: 'proceed'): void
}

defineEmits<Emits>()

const localePath = useLocalePath()
</script>

<style scoped>
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
