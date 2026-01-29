<template>
  <div
    class="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 pb-safe z-50 shadow-lg"
  >
    <div class="flex items-center justify-between mb-3">
      <span class="text-sm text-gray-600 dark:text-gray-400">{{ $t('common.total') }}</span>
      <span class="text-lg font-bold text-gray-900 dark:text-gray-100">{{ formattedTotal }}</span>
    </div>
    <UiButton
      class="bg-green-600 hover:bg-green-700 text-white w-full min-h-[48px]"
      type="button"
      :disabled="!canPlaceOrder || processingOrder"
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
      <span v-else>{{ $t('checkout.placeOrder') }} - {{ formattedTotal }}</span>
    </UiButton>
  </div>
</template>

<script setup lang="ts">
interface Props {
  canPlaceOrder: boolean
  processingOrder: boolean
  formattedTotal: string
}

interface Emits {
  (e: 'place-order'): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>
