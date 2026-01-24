<template>
  <section class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
    <header class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        {{ $t('checkout.review.shippingInfo') }}
      </h3>
      <UiButton @click="$emit('edit')">
        {{ $t('checkout.review.editShipping') }}
      </UiButton>
    </header>

    <div
      v-if="shippingInfo"
      class="space-y-3"
    >
      <section>
        <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-2">
          {{ $t('checkout.review.shippingAddress') }}
        </h4>
        <div class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <p>
            {{ shippingInfo.address.firstName }} {{ shippingInfo.address.lastName }}
          </p>
          <p v-if="shippingInfo.address.company">
            {{ shippingInfo.address.company }}
          </p>
          <p>{{ shippingInfo.address.street }}</p>
          <p>
            {{ shippingInfo.address.city }}, {{ shippingInfo.address.postalCode }}
          </p>
          <p v-if="shippingInfo.address.province">
            {{ shippingInfo.address.province }}
          </p>
          <p>{{ shippingInfo.address.country }}</p>
          <p v-if="shippingInfo.address.phone">
            {{ shippingInfo.address.phone }}
          </p>
        </div>
      </section>

      <section>
        <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-2">
          {{ $t('checkout.review.shippingMethod') }}
        </h4>
        <div class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <p class="font-medium">
            {{ shippingInfo.method.name }}
          </p>
          <p>{{ shippingInfo.method.description }}</p>
          <p>{{ formatPrice(shippingInfo.method.price) }}</p>
        </div>
      </section>

      <section v-if="shippingInfo.instructions">
        <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-2">
          {{ $t('checkout.review.deliveryInstructions') }}
        </h4>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          {{ shippingInfo.instructions }}
        </p>
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { ShippingMethod } from '~/types/checkout'
import type { Address } from '~/types/address'

interface ShippingInformation {
  address: Address
  method: ShippingMethod
  instructions?: string
}

interface Props {
  shippingInfo: ShippingInformation | null
  formatPrice: (value: number) => string
}

defineProps<Props>()

defineEmits<{
  (e: 'edit'): void
}>()
</script>
