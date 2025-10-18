<template>
  <aside class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-6">
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
      {{ $t('common.orderSummary') }}
    </h3>

    <div class="space-y-3">
      <div class="flex justify-between text-sm">
        <span class="text-gray-600 dark:text-gray-400">{{ $t('common.subtotal') }}</span>
        <span class="text-gray-900 dark:text-white">{{ formatPrice(orderData?.subtotal || 0) }}</span>
      </div>

      <div class="flex justify-between text-sm">
        <span class="text-gray-600 dark:text-gray-400">{{ $t('common.shipping') }}</span>
        <span class="text-gray-900 dark:text-white">
          {{ shippingLabel }}
        </span>
      </div>

      <div class="flex justify-between text-sm">
        <span class="text-gray-600 dark:text-gray-400">{{ $t('common.tax') }}</span>
        <span class="text-gray-900 dark:text-white">{{ formatPrice(orderData?.tax || 0) }}</span>
      </div>

      <div class="border-t border-gray-200 dark:border-gray-700 pt-3">
        <div class="flex justify-between">
          <span class="text-base font-semibold text-gray-900 dark:text-white">
            {{ $t('common.total') }}
          </span>
          <span class="text-base font-semibold text-gray-900 dark:text-white">
            {{ formatPrice(orderData?.total || 0) }}
          </span>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import type { OrderData } from '~/types/checkout'

interface Props {
  orderData: OrderData | null
  formatPrice: (value: number) => string
}

const props = defineProps<Props>()
const { t } = useI18n()

const shippingLabel = computed(() => {
  if (!props.orderData) {
    return props.formatPrice(0)
  }

  if (props.orderData.shippingCost === 0) {
    return t('checkout.freeShipping')
  }

  return props.formatPrice(props.orderData.shippingCost)
})
</script>
