<template>
  <section
    v-if="products.length"
    class="space-y-6"
  >
    <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
          {{ t('products.recentlyViewed.title') }}
        </h3>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          {{ t('products.recentlyViewed.subtitle') }}
        </p>
      </div>
    </div>
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <ProductCard
        v-for="item in products"
        :key="`recent-${item.id}`"
        :product="item"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
/**
 * Recently Viewed Products Section Component
 *
 * Displays recently viewed products.
 * Extracted from pages/products/index.vue to reduce component size.
 */
import type { ProductWithRelations } from '~/types'
import ProductCard from '~/components/product/Card.vue'

interface Props {
  products: ProductWithRelations[]
}

defineProps<Props>()

const { t } = useI18n()
</script>
