<template>
  <section
    v-if="relatedProducts.length"
    class="space-y-6"
  >
    <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">
          {{ title }}
        </h2>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          {{ subtitle }}
        </p>
      </div>
    </div>
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <ProductCard
        v-for="related in relatedProducts"
        :key="`related-${related.id}`"
        :product="related"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import ProductCard from '~/components/product/Card.vue'
import type { ProductWithRelations } from '~/types/database'

defineProps<{
  relatedProducts: ProductWithRelations[]
  title: string
  subtitle: string
}>()
</script>
