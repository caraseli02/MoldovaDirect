<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
        {{ $t('orders.tracking', 'Order Tracking') }}
      </h2>
      <UiButton>
        variant="ghost"
        size="icon"
        class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        :aria-label="$t('common.refresh')"
        @click="$emit('refresh')"
        >
        <svg
          class="w-5 h-5"
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
      </UiButton>
    </div>

    <!-- Tracking Information Available -->
    <div v-if="tracking.has_tracking">
      <!-- Tracking Number and Carrier -->
      <div class="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div v-if="tracking.tracking_number">
            <p class="text-xs text-gray-600 dark:text-gray-400 mb-1">
              {{ $t('orders.trackingNumber', 'Tracking Number') }}
            </p>
            <p class="text-sm font-mono font-semibold text-gray-900 dark:text-white">
              {{ tracking.tracking_number }}
            </p>
          </div>
          <div v-if="tracking.carrier">
            <p class="text-xs text-gray-600 dark:text-gray-400 mb-1">
              {{ $t('orders.carrier', 'Carrier') }}
            </p>
            <p class="text-sm font-semibold text-gray-900 dark:text-white">
              {{ tracking.carrier }}
            </p>
          </div>
        </div>
      </div>

      <!-- Estimated Delivery -->
      <div
        v-if="tracking.estimated_delivery"
        class="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg"
      >
        <div class="flex items-center">
          <svg
            class="w-5 h-5 text-green-600 dark:text-green-400 mr-2"
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
          <div>
            <p class="text-xs text-gray-600 dark:text-gray-400">
              {{ $t('orders.estimatedDelivery', 'Estimated Delivery') }}
            </p>
            <p class="text-sm font-semibold text-gray-900 dark:text-white">
              {{ formatDate(tracking.estimated_delivery) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Tracking Timeline -->
      <div v-if="tracking.events && tracking.events.length > 0">
        <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-4">
          {{ $t('orders.trackingHistory', 'Tracking History') }}
        </h3>
        <OrderStatus
          :status="order.status"
          :timeline="timelineEvents"
          :show-timeline="true"
          :estimated-delivery="tracking.estimated_delivery"
        />
      </div>
    </div>

    <!-- No Tracking Information -->
    <div
      v-else
      class="text-center py-8"
    >
      <svg
        class="w-12 h-12 text-gray-400 mx-auto mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        {{ $t('orders.noTrackingInfo', 'Tracking information is not yet available for this order.') }}
      </p>
      <p class="text-xs text-gray-500 dark:text-gray-500 mt-2">
        {{ $t('orders.trackingInfoNote', 'Tracking details will appear here once your order has been shipped.') }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { OrderWithItems } from '~/types'
import type { TrackingInfo } from '~/composables/useOrderDetail'

interface Props {
  tracking: TrackingInfo
  order: OrderWithItems
}

const props = defineProps<Props>()

defineEmits<{
  refresh: []
}>()

const { locale } = useI18n()

// Convert tracking events to timeline format
const timelineEvents = computed(() => {
  if (!props.tracking.events || props.tracking.events.length === 0) {
    return []
  }

  return props.tracking.events.map(event => ({
    label: event.status,
    timestamp: event.timestamp,
    description: event.description + (event.location ? ` - ${event.location}` : ''),
    completed: true,
  }))
})

// Format date helper
const formatDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString
  return new Intl.DateTimeFormat(locale.value, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}
</script>
