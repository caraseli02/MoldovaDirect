<template>
  <div
    v-if="order && order.status === 'delivered'"
    class="mb-6 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl p-6 shadow-lg"
  >
    <div class="flex items-start space-x-4">
      <!-- Success icon with animation -->
      <div class="flex-shrink-0">
        <div class="relative">
          <div class="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-25"></div>
          <div class="relative w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
            <svg
              class="w-7 h-7 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="3"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="flex-1">
        <h3 class="text-xl font-bold text-green-900 dark:text-green-100 mb-2">
          {{ $t('orders.deliveryConfirmation.title') }}
        </h3>
        <p class="text-green-800 dark:text-green-200 mb-3">
          {{ $t('orders.deliveryConfirmation.message', { orderNumber: order.orderNumber }) }}
        </p>

        <!-- Delivery details -->
        <div class="space-y-2 text-sm">
          <div class="flex items-center text-green-700 dark:text-green-300">
            <svg
              class="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>
              <strong>{{ $t('orders.deliveryConfirmation.deliveredOn') }}:</strong>
              {{ formatDeliveryDate(order.deliveredAt) }}
            </span>
          </div>

          <div
            v-if="order.shippingAddress"
            class="flex items-start text-green-700 dark:text-green-300"
          >
            <svg
              class="w-4 h-4 mr-2 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span>
              <strong>{{ $t('orders.deliveryConfirmation.deliveredTo') }}:</strong>
              {{ formatAddress(order.shippingAddress) }}
            </span>
          </div>
        </div>

        <!-- Action buttons -->
        <div class="mt-4 flex flex-wrap gap-3">
          <UiButton>
            v-if="canReorder"
            class="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
            @click="handleReorder"
            >
            <svg
              class="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {{ $t('orders.actions.reorder') }}
          </UiButton>

          <UiButton>
            v-if="canReturn"
            variant="outline"
            class="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-green-700 dark:text-green-300 text-sm font-medium rounded-lg border-2 border-green-600 dark:border-green-500 transition-colors"
            @click="handleReturn"
            >
            <svg
              class="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
              />
            </svg>
            {{ $t('orders.actions.return') }}
          </UiButton>

          <UiButton>
            variant="outline"
            class="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-green-700 dark:text-green-300 text-sm font-medium rounded-lg border-2 border-green-600 dark:border-green-500 transition-colors"
            @click="handleContactSupport"
            >
            <svg
              class="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            {{ $t('orders.actions.support') }}
          </UiButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Order, Address } from '~/types'

interface Props {
  order: Order | null
  canReorder?: boolean
  canReturn?: boolean
}

const _props = withDefaults(defineProps<Props>(), {
  canReorder: true,
  canReturn: true,
})

const emit = defineEmits<{
  reorder: []
  return: []
  contactSupport: []
}>()

const { t: _t, d } = useI18n()

// Methods
const formatDeliveryDate = (dateString?: string): string => {
  if (!dateString) return ''

  try {
    const date = new Date(dateString)
    return d(date, 'long')
  }
  catch (_err: any) {
    return dateString
  }
}

const formatAddress = (address: Address): string => {
  const parts = [
    address.street,
    address.city,
    address.postalCode,
    address.province,
    address.country,
  ].filter(Boolean)

  return parts.join(', ')
}

const handleReorder = () => {
  emit('reorder')
}

const handleReturn = () => {
  emit('return')
}

const handleContactSupport = () => {
  emit('contactSupport')
}
</script>
