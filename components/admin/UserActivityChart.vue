<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
        User Activity Trends
      </h3>
      <div class="flex items-center gap-4">
        <select
          v-model="selectedMetric"
          class="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value="activeUsers">Active Users</option>
          <option value="logins">Logins</option>
          <option value="pageViews">Page Views</option>
          <option value="productViews">Product Views</option>
          <option value="cartAdditions">Cart Additions</option>
        </select>
      </div>
    </div>
    
    <div class="h-80">
      <BaseChart
        type="bar"
        :data="chartData"
        :options="chartOptions"
        :loading="loading"
        :error="error"
      />
    </div>
    
    <div class="mt-4 grid grid-cols-3 gap-4 text-center">
      <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
        <div class="text-xl font-bold text-blue-600 dark:text-blue-400">
          {{ averageDaily }}
        </div>
        <div class="text-sm text-gray-600 dark:text-gray-400">
          Daily Average
        </div>
      </div>
      <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
        <div class="text-xl font-bold text-green-600 dark:text-green-400">
          {{ peakDay }}
        </div>
        <div class="text-sm text-gray-600 dark:text-gray-400">
          Peak Day
        </div>
      </div>
      <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
        <div class="text-xl font-bold text-purple-600 dark:text-purple-400">
          {{ totalActivity }}
        </div>
        <div class="text-sm text-gray-600 dark:text-gray-400">
          Total (Period)
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ChartData, ChartOptions } from 'chart.js'
import type { UserAnalyticsData } from '~/types/analytics'

interface Props {
  data?: UserAnalyticsData | null
  loading?: boolean
  error?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  data: null,
  loading: false,
  error: null
})

// Selected metric
const selectedMetric = ref<keyof UserAnalyticsData['activityTrends'][0]>('activeUsers')

// Metric configurations
const metricConfig = {
  activeUsers: {
    label: 'Active Users',
    color: '#3b82f6', // blue-500
    backgroundColor: 'rgba(59, 130, 246, 0.8)'
  },
  logins: {
    label: 'Logins',
    color: '#10b981', // green-500
    backgroundColor: 'rgba(16, 185, 129, 0.8)'
  },
  pageViews: {
    label: 'Page Views',
    color: '#f59e0b', // amber-500
    backgroundColor: 'rgba(245, 158, 11, 0.8)'
  },
  productViews: {
    label: 'Product Views',
    color: '#8b5cf6', // violet-500
    backgroundColor: 'rgba(139, 92, 246, 0.8)'
  },
  cartAdditions: {
    label: 'Cart Additions',
    color: '#ef4444', // red-500
    backgroundColor: 'rgba(239, 68, 68, 0.8)'
  }
}

// Chart data
const chartData = computed((): ChartData => {
  if (!props.data?.activityTrends) {
    return {
      labels: [],
      datasets: []
    }
  }

  const trends = props.data.activityTrends
  const config = metricConfig[selectedMetric.value]
  
  const labels = trends.map(item => {
    const date = new Date(item.date)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })
  })

  return {
    labels,
    datasets: [
      {
        label: config.label,
        data: trends.map(item => item[selectedMetric.value] || 0),
        backgroundColor: config.backgroundColor,
        borderColor: config.color,
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false
      }
    ]
  }
})

// Chart options
const chartOptions: ChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      callbacks: {
        title: (context) => {
          const date = new Date(props.data?.activityTrends[context[0].dataIndex]?.date || '')
          return date.toLocaleDateString('en-US', { 
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        },
        label: (context) => {
          const value = context.parsed.y
          const config = metricConfig[selectedMetric.value]
          return `${config.label}: ${value.toLocaleString()}`
        }
      }
    }
  },
  scales: {
    x: {
      grid: {
        display: false
      },
      ticks: {
        maxTicksLimit: 8
      }
    },
    y: {
      beginAtZero: true,
      ticks: {
        callback: (value) => {
          return typeof value === 'number' ? value.toLocaleString() : value
        }
      }
    }
  }
}

// Computed metrics
const averageDaily = computed(() => {
  if (!props.data?.activityTrends) return 0
  
  const trends = props.data.activityTrends
  const total = trends.reduce((sum, item) => sum + (item[selectedMetric.value] || 0), 0)
  const average = trends.length > 0 ? total / trends.length : 0
  
  return Math.round(average)
})

const peakDay = computed(() => {
  if (!props.data?.activityTrends) return 0
  
  const trends = props.data.activityTrends
  const maxValue = Math.max(...trends.map(item => item[selectedMetric.value] || 0))
  
  return maxValue
})

const totalActivity = computed(() => {
  if (!props.data?.activityTrends) return 0
  
  const trends = props.data.activityTrends
  return trends.reduce((sum, item) => sum + (item[selectedMetric.value] || 0), 0)
})
</script>