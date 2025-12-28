<template>
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
    <!-- Active Orders -->
    <div
      class="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800"
      role="region"
      :aria-label="$t('orders.metrics.activeOrders')"
    >
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-medium text-blue-700 dark:text-blue-300">
          {{ $t('orders.metrics.active') }}
        </span>
        <svg
          class="w-5 h-5 text-blue-600 dark:text-blue-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      </div>
      <p
        v-if="loading"
        class="text-2xl font-bold text-blue-600 dark:text-blue-400 animate-pulse"
      >
        ...
      </p>
      <p
        v-else
        class="text-2xl font-bold text-blue-700 dark:text-blue-300"
      >
        {{ metrics.activeOrders }}
      </p>
    </div>

    <!-- Delivered This Month -->
    <div
      class="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4 border border-green-200 dark:border-green-800"
      role="region"
      :aria-label="$t('orders.metrics.deliveredThisMonth')"
    >
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-medium text-green-700 dark:text-green-300">
          {{ $t('orders.metrics.delivered') }}
        </span>
        <svg
          class="w-5 h-5 text-green-600 dark:text-green-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <p
        v-if="loading"
        class="text-2xl font-bold text-green-600 dark:text-green-400 animate-pulse"
      >
        ...
      </p>
      <p
        v-else
        class="text-2xl font-bold text-green-700 dark:text-green-300"
      >
        {{ metrics.deliveredThisMonth }}
      </p>
    </div>

    <!-- Total Orders -->
    <div
      class="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800"
      role="region"
      :aria-label="$t('orders.metrics.totalOrders')"
    >
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-medium text-purple-700 dark:text-purple-300">
          {{ $t('orders.metrics.total') }}
        </span>
        <svg
          class="w-5 h-5 text-purple-600 dark:text-purple-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      </div>
      <p
        v-if="loading"
        class="text-2xl font-bold text-purple-600 dark:text-purple-400 animate-pulse"
      >
        ...
      </p>
      <p
        v-else
        class="text-2xl font-bold text-purple-700 dark:text-purple-300"
      >
        {{ metrics.totalOrders }}
      </p>
    </div>

    <!-- Total Spent This Month -->
    <div
      class="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800"
      role="region"
      :aria-label="$t('orders.metrics.spentThisMonth')"
    >
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-medium text-amber-700 dark:text-amber-300">
          {{ $t('orders.metrics.thisMonth') }}
        </span>
        <svg
          class="w-5 h-5 text-amber-600 dark:text-amber-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <p
        v-if="loading"
        class="text-2xl font-bold text-amber-600 dark:text-amber-400 animate-pulse"
      >
        ...
      </p>
      <p
        v-else
        class="text-2xl font-bold text-amber-700 dark:text-amber-300"
      >
        {{ formatPrice(metrics.totalSpentThisMonth) }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface OrderMetrics {
  activeOrders: number
  deliveredThisMonth: number
  totalOrders: number
  totalSpentThisMonth: number
}

interface Props {
  metrics: OrderMetrics
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const { locale } = useI18n()

// Helper function
const formatPrice = (price: number) => {
  if (price === null || price === undefined || isNaN(price)) {
    return '€0.00'
  }

  try {
    return new Intl.NumberFormat(locale.value, {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }
  catch (err: any) {
    console.warn('Error formatting price:', err)
    return `€${price.toFixed(0)}`
  }
}
</script>
