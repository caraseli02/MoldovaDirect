<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
    <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
      {{ $t('orders.addresses', 'Addresses') }}
    </h2>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Shipping Address -->
      <div>
        <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
          <svg
            class="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          {{ $t('checkout.shippingAddress', 'Shipping Address') }}
        </h3>
        <div
          v-if="shippingAddress"
          class="text-sm text-gray-600 dark:text-gray-400 space-y-1"
        >
          <p class="font-medium text-gray-900 dark:text-white">
            {{ shippingAddress.street }}
          </p>
          <p>{{ shippingAddress.city }}, {{ shippingAddress.postalCode }}</p>
          <p v-if="shippingAddress.province">
            {{ shippingAddress.province }}
          </p>
          <p class="font-medium">
            {{ shippingAddress.country }}
          </p>
        </div>
        <p
          v-else
          class="text-sm text-gray-500 dark:text-gray-400"
        >
          No shipping address available
        </p>
      </div>

      <!-- Billing Address -->
      <div>
        <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
          <svg
            class="w-4 h-4 mr-2 text-green-600 dark:text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
          {{ $t('checkout.billingAddress', 'Billing Address') }}
        </h3>
        <div
          v-if="billingAddress"
          class="text-sm text-gray-600 dark:text-gray-400 space-y-1"
        >
          <p class="font-medium text-gray-900 dark:text-white">
            {{ billingAddress.street }}
          </p>
          <p>{{ billingAddress.city }}, {{ billingAddress.postalCode }}</p>
          <p v-if="billingAddress.province">
            {{ billingAddress.province }}
          </p>
          <p class="font-medium">
            {{ billingAddress.country }}
          </p>
        </div>
        <p
          v-else
          class="text-sm text-gray-500 dark:text-gray-400"
        >
          No billing address available
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { OrderWithItems } from '~/types'

interface Props {
  order: OrderWithItems
}

const props = defineProps<Props>()

// Parse addresses safely (they might be JSONB strings)
const shippingAddress = computed(() => {
  try {
    const addr = props.order.shippingAddress
    if (!addr) return null

    // If it's already an object, return it
    if (typeof addr === 'object' && addr.street) {
      return addr
    }

    // If it's a string, try to parse it
    if (typeof addr === 'string') {
      return JSON.parse(addr)
    }

    return null
  }
  catch (err: any) {
    console.warn('Error parsing shipping address:', err)
    return null
  }
})

const billingAddress = computed(() => {
  try {
    const addr = props.order.billingAddress
    if (!addr) return null

    // If it's already an object, return it
    if (typeof addr === 'object' && addr.street) {
      return addr
    }

    // If it's a string, try to parse it
    if (typeof addr === 'string') {
      return JSON.parse(addr)
    }

    return null
  }
  catch (err: any) {
    console.warn('Error parsing billing address:', err)
    return null
  }
})
</script>
