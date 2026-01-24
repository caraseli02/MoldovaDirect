<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
    <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
      {{ $t('orders.actions', 'Actions') }}
    </h2>

    <div class="space-y-3">
      <!-- Reorder Button -->
      <UiButton
        v-if="canReorder"
        class="w-full inline-flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        @click="$emit('reorder')"
      >
        <svg
          class="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        {{ $t('orders.actions.reorder', 'Reorder') }}
      </UiButton>

      <!-- Return Button -->
      <UiButton
        v-if="canReturn"
        variant="outline"
        class="w-full inline-flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        @click="$emit('return')"
      >
        <svg
          class="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
          />
        </svg>
        {{ $t('orders.actions.return', 'Return Items') }}
      </UiButton>

      <!-- Contact Support Button -->
      <UiButton
        variant="outline"
        class="w-full inline-flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        @click="$emit('support')"
      >
        <svg
          class="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
        {{ $t('orders.actions.support', 'Contact Support') }}
      </UiButton>

      <!-- Print Invoice Button -->
      <UiButton
        variant="outline"
        class="w-full inline-flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        @click="handlePrint"
      >
        <svg
          class="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
          />
        </svg>
        {{ $t('orders.actions.printInvoice', 'Print Invoice') }}
      </UiButton>
    </div>

    <!-- Help Text -->
    <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
      <p class="text-xs text-gray-500 dark:text-gray-400">
        {{ $t('orders.needHelp', 'Need help with your order?') }}
        <UiButton
          variant="link"
          size="sm"
          class="text-blue-600 dark:text-blue-400 hover:underline p-0 h-auto"
          @click="$emit('support')"
        >
          {{ $t('orders.contactUs', 'Contact us') }}
        </UiButton>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { OrderWithItems } from '~/types'

interface Props {
  order: OrderWithItems
  canReorder: boolean
  canReturn: boolean
}

const _props = defineProps<Props>()

defineEmits<{
  reorder: []
  return: []
  support: []
}>()

// Print handler
const handlePrint = () => {
  window.print()
}
</script>
