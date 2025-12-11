<template>
  <article
    class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    role="button"
    tabindex="0"
    :aria-label="$t('orders.accessibility.orderCard', { orderNumber: order.orderNumber })"
    @click="handleClick"
    @keydown.enter="handleClick"
    @keydown.space.prevent="handleClick"
  >
    <!-- Header: Order Number and Date -->
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
            {{ formatDate(order.createdAt) }}
          </time>
        </p>
      </div>
      <OrderStatus :status="order.status" />
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
      aria-label="Order actions"
    >
      <Button
        v-if="canReorder"
        variant="outline"
        :aria-label="$t('orders.accessibility.reorderButton')"
        class="flex-1 px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        @click.stop="handleReorder"
      >
        {{ $t('orders.reorder') }}
      </Button>
      <Button
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
import { Button } from '@/components/ui/button'
import type { OrderWithItems } from '~/types'

interface Props {
  order: OrderWithItems
  compact?: boolean
  showActions?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  compact: false,
  showActions: true,
})

const emit = defineEmits<{
  click: [order: OrderWithItems]
  reorder: [order: OrderWithItems]
  viewDetails: [order: OrderWithItems]
}>()

const { locale } = useI18n()
const _router = useRouter()

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
  catch (err) {
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
  catch (err) {
    console.warn('Error computing total items:', err)
    return 0
  }
})

const canReorder = computed(() => {
  return ['delivered', 'cancelled'].includes(props.order.status)
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

    // Handle different image formats
    if (snapshot.images) {
      // If images is an array
      if (Array.isArray(snapshot.images) && snapshot.images.length > 0) {
        return snapshot.images[0]
      }
      // If images is a string (shouldn't happen but just in case)
      if (typeof snapshot.images === 'string') {
        return snapshot.images
      }
    }

    return null
  }
  catch (err) {
    console.warn('Error getting product image:', err)
    return null
  }
}

const formatPrice = (price: number) => {
  // Validate price
  if (price === null || price === undefined || isNaN(price)) {
    return '€0.00'
  }

  try {
    return new Intl.NumberFormat(locale.value, {
      style: 'currency',
      currency: 'EUR',
    }).format(price)
  }
  catch (err) {
    console.warn('Error formatting price:', err)
    return `€${price.toFixed(2)}`
  }
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''

  const date = new Date(dateString)

  // Check if date is valid
  if (isNaN(date.getTime())) {
    return dateString // Return original string if invalid
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
