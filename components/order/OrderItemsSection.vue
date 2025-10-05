<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
    <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
      {{ $t('orders.items', 'Order Items') }}
    </h2>
    
    <div class="space-y-4">
      <div 
        v-for="item in order.items" 
        :key="item.id"
        class="flex gap-4 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0 last:pb-0"
      >
        <!-- Product Image -->
        <div class="flex-shrink-0">
          <NuxtImg
            :src="item.productSnapshot?.images?.[0] || '/placeholder-product.svg'"
            :alt="getLocalizedName(item.productSnapshot)"
            class="w-20 h-20 object-cover rounded-lg"
            loading="lazy"
          />
        </div>

        <!-- Product Details -->
        <div class="flex-1 min-w-0">
          <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-1">
            {{ getLocalizedName(item.productSnapshot) }}
          </h3>
          <p v-if="item.productSnapshot?.sku" class="text-xs text-gray-500 dark:text-gray-400 mb-2">
            {{ $t('products.sku', 'SKU') }}: {{ item.productSnapshot.sku }}
          </p>
          <div class="flex items-center gap-4 text-sm">
            <span class="text-gray-600 dark:text-gray-400">
              {{ $t('common.quantity') }}: {{ item.quantity }}
            </span>
            <span class="text-gray-600 dark:text-gray-400">
              {{ formatPrice(item.priceEur) }} {{ $t('common.each') }}
            </span>
          </div>
        </div>

        <!-- Item Total -->
        <div class="flex-shrink-0 text-right">
          <p class="text-base font-semibold text-gray-900 dark:text-white">
            {{ formatPrice(item.totalEur) }}
          </p>
        </div>
      </div>
    </div>

    <!-- Order Notes -->
    <div v-if="order.customerNotes" class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
      <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-2">
        {{ $t('orders.customerNotes', 'Order Notes') }}
      </h3>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        {{ order.customerNotes }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { OrderWithItems } from '~/types'

interface Props {
  order: OrderWithItems
}

const props = defineProps<Props>()

const { locale } = useI18n()

// Helper functions
const getLocalizedName = (productSnapshot: any) => {
  if (!productSnapshot?.nameTranslations) return ''
  return productSnapshot.nameTranslations[locale.value] || productSnapshot.nameTranslations.en || ''
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat(locale.value, {
    style: 'currency',
    currency: 'EUR'
  }).format(price)
}
</script>
