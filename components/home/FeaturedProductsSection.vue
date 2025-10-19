<template>
  <section class="bg-white py-16 dark:bg-gray-950 md:py-24">
    <div class="container">
      <div class="mx-auto max-w-3xl text-center">
        <h2 class="text-3xl font-bold md:text-4xl">{{ t('home.featuredProducts.title') }}</h2>
        <p class="mt-3 text-lg text-gray-600 dark:text-gray-400">{{ t('home.featuredProducts.subtitle') }}</p>
      </div>

      <div v-if="pending" class="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div v-for="i in 4" :key="i" class="rounded-2xl bg-gray-100/80 p-6 animate-pulse dark:bg-gray-900">
          <div class="h-40 rounded-xl bg-gray-200 dark:bg-gray-800"></div>
          <div class="mt-4 space-y-3">
            <div class="h-4 rounded bg-gray-200 dark:bg-gray-800"></div>
            <div class="h-4 w-2/3 rounded bg-gray-200 dark:bg-gray-800"></div>
            <div class="h-10 rounded bg-gray-200 dark:bg-gray-800"></div>
          </div>
        </div>
      </div>

      <div v-else-if="products.length" class="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <ProductCard
          v-for="product in products"
          :key="product.id"
          :product="product"
        />
      </div>

      <div v-else class="mt-12 text-center">
        <p class="text-gray-500 dark:text-gray-400">{{ t('home.featuredProducts.noProducts') }}</p>
        <NuxtLink
          :to="localePath('/products')"
          class="mt-6 inline-flex items-center gap-2 rounded-full bg-primary-600 px-6 py-3 font-semibold text-white transition hover:bg-primary-700"
        >
          {{ t('home.featuredProducts.viewAll') }}
          <Icon name="heroicons:arrow-right" class="h-5 w-5" />
        </NuxtLink>
      </div>

      <div v-if="error" class="mt-8 text-center">
        <p class="text-red-500 dark:text-red-400">{{ t('home.featuredProducts.error') }}</p>
        <button
          type="button"
          @click="emit('retry')"
          class="mt-4 inline-flex items-center gap-2 rounded-full bg-primary-600 px-6 py-3 font-semibold text-white transition hover:bg-primary-700"
        >
          <Icon name="heroicons:arrow-path" class="h-5 w-5" />
          {{ t('common.retry') }}
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { ProductWithRelations } from '~/types'

defineProps<{
  products: ProductWithRelations[]
  pending: boolean
  error: Error | null
}>()

const emit = defineEmits<{
  (e: 'retry'): void
}>()

const { t } = useI18n()
const localePath = useLocalePath()
</script>
