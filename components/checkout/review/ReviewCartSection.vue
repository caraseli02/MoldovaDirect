<template>
  <section class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
    <header class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        {{ $t('checkout.review.cartItems') }}
      </h3>
      <button
        @click="$emit('lucide:square-pen')"
        class="text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium"
      >
        {{ $t('checkout.review.editCart') }}
      </button>
    </header>

    <div v-if="items.length > 0" class="space-y-4">
      <article
        v-for="item in items"
        :key="item.productId"
        class="flex items-center space-x-4 py-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
      >
        <div class="flex-shrink-0">
          <img
            :src="item.productSnapshot.images?.[0] || '/placeholder-product.svg'"
            :alt="item.productSnapshot.name"
            class="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
          />
        </div>

        <div class="flex-1 min-w-0">
          <h4 class="text-sm font-medium text-gray-900 dark:text-white truncate">
            {{ item.productSnapshot.name }}
          </h4>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ $t('common.quantity') }}: {{ item.quantity }}
          </p>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ formatPrice(item.price) }} {{ $t('common.each') }}
          </p>
        </div>

        <div class="text-right">
          <p class="text-sm font-medium text-gray-900 dark:text-white">
            {{ formatPrice(item.total) }}
          </p>
        </div>
      </article>
    </div>

    <p v-else class="text-sm text-gray-500 dark:text-gray-400">
      {{ $t('checkout.review.emptyCart') }}
    </p>
  </section>
</template>

<script setup lang="ts">
import type { OrderItem } from '~/types/checkout'

interface Props {
  items: OrderItem[]
  formatPrice: (value: number) => string
}

defineProps<Props>()

defineEmits<{
  (e: 'lucide:square-pen'): void
}>()
</script>
