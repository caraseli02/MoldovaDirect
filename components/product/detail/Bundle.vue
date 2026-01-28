<template>
  <UiCard>
    <UiCardHeader>
      <UiCardTitle class="text-lg">
        {{ $t('products.bundle.title') }}
      </UiCardTitle>
      <UiCardDescription>{{ $t('products.bundle.description') }}</UiCardDescription>
    </UiCardHeader>
    <UiCardContent class="space-y-3">
      <div
        v-for="item in bundleItems"
        :key="`bundle-${item.id}`"
        class="flex items-center justify-between py-2 text-sm border-b border-gray-200 dark:border-gray-800 last:border-0"
      >
        <span class="font-medium text-gray-800 dark:text-gray-200">{{ item.title }}</span>
        <span class="text-gray-600 dark:text-gray-400">€{{ formatPrice(item.price) }}</span>
      </div>
    </UiCardContent>
    <UiCardFooter>
      <UiButton class="w-full justify-center rounded-xl border border-blue-200 bg-blue-50 px-5 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-100 dark:border-blue-900/40 dark:bg-blue-900/20 dark:text-blue-200">
        {{ $t('products.bundle.cta') }}
      </UiButton>
    </UiCardFooter>
  </UiCard>
</template>

<script setup lang="ts">
import { useProductUtils } from '~/composables/useProductUtils'

interface BundleItem {
  id: string | number
  title: string
  price: number
}

defineProps<{
  bundleItems: BundleItem[]
}>()

const { formatPrice } = useProductUtils()
</script>
