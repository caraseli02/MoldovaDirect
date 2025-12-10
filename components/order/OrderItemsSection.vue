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
          <img
            v-if="getProductImage(item)"
            :src="getProductImage(item)"
            :alt="getLocalizedName(item.productSnapshot)"
            class="w-20 h-20 object-cover rounded-lg bg-gray-100 dark:bg-gray-700"
            loading="lazy"
          />
          <div
            v-else
            class="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center"
          >
            <svg
              class="w-10 h-10 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>

        <!-- Product Details -->
        <div class="flex-1 min-w-0">
          <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-1">
            {{ getLocalizedName(item.productSnapshot) }}
          </h3>
          <p
            v-if="item.productSnapshot?.sku"
            class="text-xs text-gray-500 dark:text-gray-400 mb-2"
          >
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
    <div
      v-if="order.customerNotes"
      class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700"
    >
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

const _props = defineProps<Props>()

const { locale } = useI18n()

// Helper functions
const getLocalizedName = (productSnapshot: any) => {
  if (!productSnapshot?.nameTranslations) return ''
  return productSnapshot.nameTranslations[locale.value] || productSnapshot.nameTranslations.en || ''
}

const getProductImage = (item: any) => {
  try {
    const snapshot = item?.productSnapshot
    if (!snapshot) return null

    // Handle different image formats
    if (snapshot.images) {
      // If images is an array
      if (Array.isArray(snapshot.images)) {
        if (snapshot.images.length > 0) {
          const firstImage = snapshot.images[0]

          // Make sure it's a string
          if (typeof firstImage === 'string' && firstImage.length > 0) {
            return firstImage
          }
          // If it's an object with url property
          if (firstImage && typeof firstImage === 'object' && firstImage.url) {
            return firstImage.url
          }
        }
      }
      // If images is a string
      if (typeof snapshot.images === 'string' && snapshot.images.length > 0) {
        return snapshot.images
      }
    }

    return null
  }
  catch (err) {
    console.warn('Error getting product image:', err)
    return null
  }
}

const formatPrice = (price: number) => {
  if (price === null || price === undefined || isNaN(price)) {
    return '€0.00'
  }

  try {
    return new Intl.NumberFormat(locale.value, {
      style: 'currency',
      currency: 'EUR',
    }).format(price)
  }
  catch (err) {
    console.warn('Error formatting price:', err)
    return `€${price.toFixed(2)}`
  }
}
</script>
