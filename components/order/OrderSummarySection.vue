<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
    <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
      {{ $t('common.orderSummary') }}
    </h2>

    <!-- Payment Method -->
    <div class="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm text-gray-600 dark:text-gray-400">
          {{ $t('checkout.paymentMethod', 'Payment Method') }}
        </span>
        <span class="text-sm font-medium text-gray-900 dark:text-white">
          {{ formatPaymentMethod(order.paymentMethod) }}
        </span>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-sm text-gray-600 dark:text-gray-400">
          {{ $t('orders.paymentStatus', 'Payment Status') }}
        </span>
        <span 
          class="text-xs font-medium px-2 py-1 rounded-full"
          :class="paymentStatusClasses"
        >
          {{ formatPaymentStatus(order.paymentStatus) }}
        </span>
      </div>
    </div>

    <!-- Order Totals -->
    <div class="space-y-3">
      <div class="flex justify-between text-sm">
        <span class="text-gray-600 dark:text-gray-400">{{ $t('common.subtotal') }}</span>
        <span class="text-gray-900 dark:text-white">{{ formatPrice(order.subtotalEur) }}</span>
      </div>
      <div class="flex justify-between text-sm">
        <span class="text-gray-600 dark:text-gray-400">{{ $t('common.shipping') }}</span>
        <span class="text-gray-900 dark:text-white">{{ formatPrice(order.shippingCostEur) }}</span>
      </div>
      <div class="flex justify-between text-sm">
        <span class="text-gray-600 dark:text-gray-400">{{ $t('common.tax') }}</span>
        <span class="text-gray-900 dark:text-white">{{ formatPrice(order.taxEur) }}</span>
      </div>
      <div class="pt-3 border-t border-gray-200 dark:border-gray-700">
        <div class="flex justify-between">
          <span class="text-base font-semibold text-gray-900 dark:text-white">{{ $t('common.total') }}</span>
          <span class="text-lg font-bold text-gray-900 dark:text-white">{{ formatPrice(order.totalEur) }}</span>
        </div>
      </div>
    </div>

    <!-- Order Timeline -->
    <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
      <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-3">
        {{ $t('orders.orderTimeline', 'Order Timeline') }}
      </h3>
      <div class="space-y-2 text-xs text-gray-600 dark:text-gray-400">
        <div class="flex justify-between">
          <span>{{ $t('orders.placed', 'Placed') }}</span>
          <span>{{ formatDateTime(order.createdAt) }}</span>
        </div>
        <div v-if="order.shippedAt" class="flex justify-between">
          <span>{{ $t('orders.shipped', 'Shipped') }}</span>
          <span>{{ formatDateTime(order.shippedAt) }}</span>
        </div>
        <div v-if="order.deliveredAt" class="flex justify-between">
          <span>{{ $t('orders.delivered', 'Delivered') }}</span>
          <span>{{ formatDateTime(order.deliveredAt) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { OrderWithItems, PaymentMethod, PaymentStatus } from '~/types'

interface Props {
  order: OrderWithItems
}

const props = defineProps<Props>()

const { t, locale } = useI18n()

// Payment status classes
const paymentStatusClasses = computed(() => {
  const status = props.order.paymentStatus
  const classes = {
    pending: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300',
    paid: 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300',
    failed: 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300',
    refunded: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
  }
  return classes[status] || classes.pending
})

// Format helpers
const formatPrice = (price: number) => {
  if (price === null || price === undefined || isNaN(price)) {
    return '€0.00'
  }
  
  try {
    return new Intl.NumberFormat(locale.value, {
      style: 'currency',
      currency: 'EUR'
    }).format(price)
  } catch (err) {
    console.warn('Error formatting price:', err)
    return `€${price.toFixed(2)}`
  }
}

const formatPaymentMethod = (method: PaymentMethod) => {
  const methods = {
    stripe: 'Credit Card (Stripe)',
    paypal: 'PayPal',
    cod: 'Cash on Delivery'
  }
  return methods[method] || method
}

const formatPaymentStatus = (status: PaymentStatus) => {
  const statuses = {
    pending: t('orders.paymentPending', 'Pending'),
    paid: t('orders.paymentPaid', 'Paid'),
    failed: t('orders.paymentFailed', 'Failed'),
    refunded: t('orders.paymentRefunded', 'Refunded')
  }
  return statuses[status] || status
}

const formatDateTime = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString
  return new Intl.DateTimeFormat(locale.value, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}
</script>
