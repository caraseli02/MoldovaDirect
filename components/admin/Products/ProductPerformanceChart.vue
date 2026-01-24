<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Product Performance
      </h3>
      <div class="flex items-center gap-2">
        <UiSelect v-model="selectedMetric">
          <UiSelectTrigger>
            <UiSelectValue />
          </UiSelectTrigger>
          <UiSelectContent>
            <UiSelectItem value="views">
              Views
            </UiSelectItem>
            <UiSelectItem value="cartAdditions">
              Cart Additions
            </UiSelectItem>
            <UiSelectItem value="purchases">
              Purchases
            </UiSelectItem>
            <UiSelectItem value="revenue">
              Revenue
            </UiSelectItem>
          </UiSelectContent>
        </UiSelect>
      </div>
    </div>

    <div class="h-80">
      <AdminChartsBase
        type="bar"
        :data="chartData"
        :options="chartOptions"
        :loading="loading"
        :error="error"
      />
    </div>

    <div class="mt-4 grid grid-cols-2 gap-4 text-center">
      <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
        <div class="text-xl font-bold text-blue-600 dark:text-blue-400">
          {{ topProduct?.productName || 'N/A' }}
        </div>
        <div class="text-sm text-gray-600 dark:text-gray-400">
          Top Performing Product
        </div>
      </div>
      <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
        <div class="text-xl font-bold text-green-600 dark:text-green-400">
          {{ averagePerformance }}
        </div>
        <div class="text-sm text-gray-600 dark:text-gray-400">
          Average {{ metricLabels[selectedMetric] }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ChartData, ChartOptions } from 'chart.js'
import type { ProductAnalyticsData } from '~/types/analytics'

interface Props {
  data?: ProductAnalyticsData | null
  loading?: boolean
  error?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  data: null,
  loading: false,
  error: null,
})

// Selected metric
const selectedMetric = ref<'views' | 'cartAdditions' | 'purchases' | 'revenue'>('views')

// Metric labels and colors
const metricLabels = {
  views: 'Views',
  cartAdditions: 'Cart Additions',
  purchases: 'Purchases',
  revenue: 'Revenue',
}

const metricColors = {
  views: '#3b82f6', // blue-500
  cartAdditions: '#f59e0b', // amber-500
  purchases: '#10b981', // green-500
  revenue: '#8b5cf6', // violet-500
}

// Chart data
const chartData = computed((): ChartData => {
  if (!props.data?.productPerformance) {
    return {
      labels: [],
      datasets: [],
    }
  }

  const products = props.data.productPerformance.slice(0, 10) // Top 10 products
  const labels = products.map((product) => {
    // Truncate long product names
    const name = product.productName
    return name.length > 20 ? name.substring(0, 20) + '...' : name
  })

  const color = metricColors[selectedMetric.value]
  const data = products.map((product) => {
    switch (selectedMetric.value) {
      case 'views': return product.views
      case 'cartAdditions': return product.cartAdditions
      case 'purchases': return product.purchases
      case 'revenue': return product.revenue
      default: return 0
    }
  })

  return {
    labels,
    datasets: [
      {
        label: metricLabels[selectedMetric.value],
        data,
        backgroundColor: color + '80', // Add transparency
        borderColor: color,
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  }
})

// Chart options
const chartOptions: ChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y', // Horizontal bar chart
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        title: (context) => {
          const dataIndex = context[0]?.dataIndex
          const product = props.data?.productPerformance?.[dataIndex ?? 0]
          return product?.productName || ''
        },
        label: (context) => {
          const value = context.parsed.x ?? 0
          const label = metricLabels[selectedMetric.value]

          if (selectedMetric.value === 'revenue') {
            return `${label}: €${value.toLocaleString()}`
          }
          return `${label}: ${value.toLocaleString()}`
        },
      },
    },
  },
  scales: {
    x: {
      beginAtZero: true,
      ticks: {
        callback: (value) => {
          if (selectedMetric.value === 'revenue') {
            return `€${value}`
          }
          return typeof value === 'number' ? value.toLocaleString() : value
        },
      },
    },
    y: {
      ticks: {
        maxTicksLimit: 10,
      },
    },
  },
}

// Computed properties
const topProduct = computed(() => {
  if (!props.data?.productPerformance || props.data.productPerformance.length === 0) {
    return null
  }

  const products = props.data.productPerformance
  let topProductItem = products[0]

  if (!topProductItem) return null

  for (const product of products) {
    const currentValue = product[selectedMetric.value]
    const topValue = topProductItem[selectedMetric.value]

    if (currentValue > topValue) {
      topProductItem = product
    }
  }

  return topProductItem
})

const averagePerformance = computed(() => {
  if (!props.data?.productPerformance || props.data.productPerformance.length === 0) {
    return '0'
  }

  const products = props.data.productPerformance
  const total = products.reduce((sum, product) => sum + product[selectedMetric.value], 0)
  const average = total / products.length

  if (selectedMetric.value === 'revenue') {
    return `€${Math.round(average).toLocaleString()}`
  }

  return Math.round(average).toLocaleString()
})
</script>
