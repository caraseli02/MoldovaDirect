<template>
  <article
    class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 bg-white dark:bg-gray-800"
    role="button"
    tabindex="0"
    :aria-label="$t('orders.accessibility.orderCard', { orderNumber: order.orderNumber })"
    @click="handleClick"
    @keydown.enter="handleClick"
    @keydown.space.prevent="handleClick"
  >
    <!-- Header: Order Number, Date and Status -->
    <div class="flex justify-between items-start mb-3">
      <div>
        <h3 class="text-sm font-semibold text-gray-900 dark:text-white">
          {{ $t('orders.orderNumber') }}: {{ order.orderNumber }}
        </h3>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
          <time
            :datetime="order.createdAt"
            :aria-label="$t('orders.accessibility.orderDate', { date: formatDate(order.createdAt) })"
          >
            {{ formatDate(order.createdAt) }} • {{ formatPrice(order.totalEur) }}
          </time>
        </p>
      </div>
      <OrderStatus :status="order.status" />
    </div>

    <!-- Progress Bar for Active Orders -->
    <div
      v-if="showProgress && isActiveOrder"
      class="mb-4"
    >
      <div class="flex items-center justify-between mb-2">
        <p class="text-xs text-gray-600 dark:text-gray-400 font-medium">
          {{ $t('orders.progress.deliveryProgress') }}
        </p>
        <p class="text-xs text-blue-600 dark:text-blue-400 font-semibold">
          {{ progressPercentage }}%
        </p>
      </div>
      <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          class="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
          :style="{ width: `${progressPercentage}%` }"
          role="progressbar"
          :aria-valuenow="progressPercentage"
          aria-valuemin="0"
          aria-valuemax="100"
        ></div>
      </div>
      <p
        v-if="estimatedDelivery"
        class="text-xs text-gray-500 dark:text-gray-400 mt-1"
      >
        {{ $t('orders.progress.estimatedArrival') }}: {{ formatDate(estimatedDelivery) }}
      </p>
    </div>

    <!-- Delivered Success Message -->
    <div
      v-if="order.status === 'delivered'"
      class="mb-3 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
    >
      <div class="flex items-start">
        <svg
          class="w-4 h-4 text-green-600 dark:text-green-400 mr-2 mt-0.5 flex-shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clip-rule="evenodd"
          />
        </svg>
        <div>
          <p class="text-xs font-semibold text-green-900 dark:text-green-100">
            {{ $t('orders.progress.deliveredSuccessfully') }}
          </p>
          <p
            v-if="order.deliveredAt"
            class="text-xs text-green-700 dark:text-green-300"
          >
            {{ formatDate(order.deliveredAt) }}
          </p>
        </div>
      </div>
    </div>

    <!-- Order Items Preview -->
    <div
      class="mb-3"
      role="region"
      :aria-label="$t('orders.items')"
    >
      <div
        v-if="previewItems.length > 0"
        class="flex items-center space-x-2"
      >
        <div
          v-for="(item, index) in previewItems"
          :key="item.id || index"
          class="flex-shrink-0"
        >
          <img
            v-if="getProductImage(item)"
            :src="getProductImage(item)"
            :alt="getLocalizedName(item.productSnapshot)"
            class="w-12 h-12 object-cover rounded bg-gray-100 dark:bg-gray-700"
            loading="lazy"
          />
          <div
            v-else
            class="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center"
          >
            <svg
              class="w-6 h-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>
        <div
          v-if="remainingItemsCount > 0"
          class="text-xs text-gray-500 dark:text-gray-400"
          aria-live="polite"
        >
          +{{ remainingItemsCount }} {{ $t('orders.moreItems') }}
        </div>
      </div>
    </div>

    <!-- Order Summary -->
    <div
      class="flex justify-between items-center mb-3 pb-3 border-b border-gray-100 dark:border-gray-700"
      role="region"
      :aria-label="$t('common.orderSummary')"
    >
      <span
        class="text-sm text-gray-600 dark:text-gray-400"
        :aria-label="$t('orders.accessibility.itemQuantity', { quantity: totalItems })"
      >
        {{ $t('orders.totalItems') }}: {{ totalItems }}
      </span>
      <span
        class="text-base font-bold text-gray-900 dark:text-white"
        :aria-label="$t('orders.accessibility.orderTotal', { amount: formatPrice(order.totalEur) })"
      >
        {{ formatPrice(order.totalEur) }}
      </span>
    </div>

    <!-- Quick Actions -->
    <div
      v-if="showActions"
      class="flex space-x-2"
      role="group"
      :aria-label="$t('orders.accessibility.orderActions')"
    >
      <!-- Track Button for Active Orders -->
      <Button
        v-if="isActiveOrder"
        variant="default"
        :aria-label="$t('orders.accessibility.trackButton')"
        class="flex-1 px-3 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        @click.stop="handleViewDetails"
      >
        <svg
          class="w-4 h-4 mr-1.5 inline"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
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
        {{ $t('orders.track') }}
      </Button>

      <!-- Reorder Button -->
      <Button
        v-if="canReorder"
        variant="outline"
        :aria-label="$t('orders.accessibility.reorderButton')"
        class="flex-1 px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        @click.stop="handleReorder"
      >
        <svg
          class="w-4 h-4 mr-1.5 inline"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        {{ $t('orders.reorder') }}
      </Button>

      <!-- View Details Button -->
      <Button
        v-if="!isActiveOrder"
        variant="outline"
        :aria-label="$t('orders.accessibility.viewDetailsButton')"
        class="flex-1 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        @click.stop="handleViewDetails"
      >
        {{ $t('orders.viewDetails') }}
      </Button>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
import type { OrderWithItems } from '~/types'

interface Props {
  order: OrderWithItems
  compact?: boolean
  showActions?: boolean
  showProgress?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  compact: false,
  showActions: true,
  showProgress: true,
})

const emit = defineEmits<{
  click: [order: OrderWithItems]
  reorder: [order: OrderWithItems]
  viewDetails: [order: OrderWithItems]
}>()

const { locale } = useI18n()

// Computed properties
const previewItems = computed(() => {
  try {
    const maxPreview = props.compact ? 2 : 3
    const items = props.order.items

    if (!items || !Array.isArray(items)) {
      return []
    }

    return items.slice(0, maxPreview)
  }
  catch (err: unknown) {
    console.warn('Error computing preview items:', err)
    return []
  }
})

const remainingItemsCount = computed(() => {
  const maxPreview = props.compact ? 2 : 3
  const total = props.order.items?.length || 0
  return Math.max(0, total - maxPreview)
})

const totalItems = computed(() => {
  try {
    const items = props.order.items
    if (!items || !Array.isArray(items)) {
      return 0
    }
    return items.reduce((sum, item) => sum + (item?.quantity || 0), 0)
  }
  catch (err: unknown) {
    console.warn('Error computing total items:', err)
    return 0
  }
})

const canReorder = computed(() => {
  return ['delivered', 'cancelled'].includes(props.order.status)
})

const isActiveOrder = computed(() => {
  return ['pending', 'processing', 'shipped'].includes(props.order.status)
})

const progressPercentage = computed(() => {
  const status = props.order.status
  const progressMap: Record<string, number> = {
    pending: 25,
    processing: 50,
    shipped: 75,
    delivered: 100,
  }
  return progressMap[status] || 0
})

const estimatedDelivery = computed(() => {
  // Uses estimatedShipDate from the order as the estimated delivery date
  return props.order.estimatedShipDate || null
})

// Helper functions
const getLocalizedName = (productSnapshot: Record<string, any>) => {
  if (!productSnapshot?.nameTranslations) return ''
  return productSnapshot.nameTranslations[locale.value] || productSnapshot.nameTranslations.en || ''
}

const getProductImage = (item: Record<string, any>) => {
  try {
    const snapshot = item?.productSnapshot
    if (!snapshot) return null

    if (snapshot.images) {
      if (Array.isArray(snapshot.images) && snapshot.images.length > 0) {
        return snapshot.images[0]
      }
      if (typeof snapshot.images === 'string') {
        return snapshot.images
      }
    }

    return null
  }
  catch (err: unknown) {
    console.warn('Error getting product image:', err)
    return null
  }
}

const formatPrice = (price: number) => {
  if (price === null || price === undefined || isNaN(price)) {
    return '€0.00'
  }

  try {
    return new Intl.NumberFormat(locale.value, {
      style: 'currency',
      currency: 'EUR',
    }).format(price)
  }
  catch (err: unknown) {
    console.warn('Error formatting price:', err)
    return `€${price.toFixed(2)}`
  }
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''

  const date = new Date(dateString)

  if (isNaN(date.getTime())) {
    return dateString
  }

  return new Intl.DateTimeFormat(locale.value, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

// Event handlers
const handleClick = () => {
  emit('click', props.order)
}

const handleReorder = () => {
  emit('reorder', props.order)
}

const handleViewDetails = () => {
  emit('viewDetails', props.order)
}
</script>
