<template>
  <UiCard>
    <UiCardHeader>
      <UiCardTitle>{{ $t('products.details') }}</UiCardTitle>
    </UiCardHeader>
    <UiCardContent>
      <dl class="mt-4 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
        <div v-if="origin">
          <dt class="font-medium text-gray-900 dark:text-white">
            {{ $t('products.origin') }}
          </dt>
          <dd class="text-gray-600 dark:text-gray-400">
            {{ origin }}
          </dd>
        </div>
        <div v-if="volume">
          <dt class="font-medium text-gray-900 dark:text-white">
            {{ $t('products.volume') }}
          </dt>
          <dd class="text-gray-600 dark:text-gray-400">
            {{ volume }}ml
          </dd>
        </div>
        <div v-if="alcoholContent">
          <dt class="font-medium text-gray-900 dark:text-white">
            {{ $t('products.alcoholContent') }}
          </dt>
          <dd class="text-gray-600 dark:text-gray-400">
            {{ alcoholContent }}%
          </dd>
        </div>
        <div v-if="weightKg">
          <dt class="font-medium text-gray-900 dark:text-white">
            {{ $t('products.weight') }}
          </dt>
          <dd class="text-gray-600 dark:text-gray-400">
            {{ weightKg }}kg
          </dd>
        </div>
        <div v-if="sku">
          <dt class="font-medium text-gray-900 dark:text-white">
            SKU
          </dt>
          <dd class="text-gray-600 dark:text-gray-400">
            {{ sku }}
          </dd>
        </div>
      </dl>

      <div
        v-if="tags?.length"
        class="mt-6 flex flex-wrap gap-2"
      >
        <span
          v-for="tag in tags"
          :key="tag"
          class="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300"
        >
          {{ tag }}
        </span>
      </div>
    </UiCardContent>
  </UiCard>
</template>

<script setup lang="ts">
defineProps<{
  origin?: string
  volume?: number | null
  alcoholContent?: number | null
  weightKg?: number | null
  sku?: string
  tags?: string[]
}>()
</script>
