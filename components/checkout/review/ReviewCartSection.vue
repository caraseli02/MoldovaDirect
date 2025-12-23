<template>
  <section class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
    <header class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        {{ $t('checkout.review.cartItems') }}
      </h3>
      <button
        class="text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium"
        @click="$emit('edit')"
      >
        {{ $t('checkout.review.editCart') }}
      </button>
    </header>

    <div
      v-if="items.length > 0"
      class="space-y-4"
    >
      <article
        v-for="item in items"
        :key="item.productId"
        class="flex items-center space-x-4 py-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
      >
        <div class="flex-shrink-0">
          <img
            :src="getProductImage(item.productSnapshot)"
            :alt="getLocalizedText(item.productSnapshot.name)"
            class="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
          />
        </div>

        <div class="flex-1 min-w-0">
          <h4 class="text-sm font-medium text-gray-900 dark:text-white truncate">
            {{ getLocalizedText(item.productSnapshot.name) }}
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

    <p
      v-else
      class="text-sm text-gray-500 dark:text-gray-400"
    >
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
  (e: 'edit'): void
}>()

const { locale } = useI18n()

/**
 * Get localized text from a translation object or string
 * Handles both string values and translation objects like { en: "...", es: "..." }
 */
const getLocalizedText = (text: any): string => {
  if (!text) return ''
  if (typeof text === 'string') return text
  // Try current locale first
  const localeText = text[locale.value]
  if (localeText) return localeText
  // Fall back to Spanish (primary locale)
  const esText = text.es
  if (esText) return esText
  // Fall back to any available translation
  const values = Object.values(text).filter((v): v is string => typeof v === 'string')
  return values[0] || ''
}

/**
 * Get product image URL from snapshot
 * Handles both array of strings and array of image objects
 */
const getProductImage = (snapshot: Record<string, any>): string => {
  const images = snapshot.images
  if (!images || !images.length) return '/placeholder-product.svg'
  const firstImage = images[0]
  if (typeof firstImage === 'string') return firstImage
  if (typeof firstImage === 'object' && firstImage.url) return firstImage.url
  return '/placeholder-product.svg'
}
</script>
