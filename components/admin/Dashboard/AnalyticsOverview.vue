<template>
  <div class="space-y-6">
    <!-- Date Range Picker -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <AdminUtilsDateRangePicker
        v-model="dateRange"
        @change="handleDateRangeChange"
      />
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div
        v-for="kpi in kpiCards"
        :key="kpi.key"
        class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
              {{ kpi.label }}
            </p>
            <p class="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
              {{ kpi.value }}
            </p>
          </div>
          <div
            :class="[
              'p-3 rounded-full',
              kpi.bgColor,
            ]"
          >
            <component
              :is="kpi.icon"
              :class="['w-6 h-6', kpi.iconColor]"
            />
          </div>
        </div>
        <div class="mt-4 flex items-center">
          <div
            :class="[
              'flex items-center text-sm',
              kpi.trend === 'up' ? 'text-green-600 dark:text-green-400'
              : kpi.trend === 'down' ? 'text-red-600 dark:text-red-400'
                : 'text-gray-600 dark:text-gray-400',
            ]"
          >
            <component
              :is="getTrendIcon(kpi.trend)"
              class="w-4 h-4 mr-1"
            />
            <span>{{ kpi.changeText }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Revenue Trend Chart -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Revenue Trend
        </h3>
        <div class="h-80">
          <AdminChartsBase
            type="line"
            :data="revenueChartData"
            :options="revenueChartOptions"
            :loading="loading"
            :error="error"
          />
        </div>
      </div>

      <!-- User Growth Chart -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          User Growth
        </h3>
        <div class="h-80">
          <AdminChartsBase
            type="bar"
            :data="userGrowthChartData"
            :options="userGrowthChartOptions"
            :loading="loading"
            :error="error"
          />
        </div>
      </div>
    </div>

    <!-- Detailed Analytics -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <!-- Conversion Funnel -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Conversion Funnel
        </h3>
        <div class="space-y-4">
          <div
            v-for="(step, index) in conversionSteps"
            :key="step.label"
            class="relative"
          >
            <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div class="flex items-center gap-3">
                <div
                  :class="[
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                    step.color,
                  ]"
                >
                  {{ index + 1 }}
                </div>
                <span class="font-medium text-gray-900 dark:text-gray-100">
                  {{ step.label }}
                </span>
              </div>
              <div class="text-right">
                <div class="font-bold text-gray-900 dark:text-gray-100">
                  {{ step.value.toLocaleString() }}
                </div>
                <div class="text-sm text-gray-600 dark:text-gray-400">
                  {{ step.percentage }}%
                </div>
              </div>
            </div>
            <div
              v-if="index < conversionSteps.length - 1"
              class="absolute left-4 top-full w-0.5 h-4 bg-gray-300 dark:bg-gray-600"
            ></div>
          </div>
        </div>
      </div>

      <!-- Top Metrics -->
      <div class="xl:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Key Performance Indicators
        </h3>
        <div class="grid grid-cols-2 gap-4">
          <div
            v-for="metric in detailedMetrics"
            :key="metric.label"
            class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
          >
            <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">
              {{ metric.label }}
            </div>
            <div class="text-xl font-bold text-gray-900 dark:text-gray-100">
              {{ metric.value }}
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {{ metric.description }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AnalyticsOverview } from '~/types/analytics'
import {
  ArrowDown,
  ArrowUp,
  BarChart2,
  Euro,
  Minus,
  ShoppingCart,
  Users,
} from 'lucide-vue-next'

// Simple chart types (chart.js removed in MVP simplification)
interface ChartData {
  labels: string[]
  datasets: Array<{
    label?: string
    data: number[]
    borderColor?: string
    backgroundColor?: string | string[]
    borderWidth?: number
    fill?: boolean
    tension?: number
  }>
}

interface ChartOptions {
  responsive?: boolean
  maintainAspectRatio?: boolean
  plugins?: {
    legend?: { display?: boolean }
    tooltip?: {
      callbacks?: {
        label?: (context: any) => string
      }
    }
  }
  scales?: {
    y?: {
      beginAtZero?: boolean
      ticks?: {
        callback?: (value: any) => string
      }
    }
  }
}

interface Props {
  data?: AnalyticsOverview | null
  loading?: boolean
  error?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  data: null,
  loading: false,
  error: null,
})

const emit = defineEmits<{
  (e: 'dateRangeChange', value: { startDate: string, endDate: string }): void
}>()

// Date range state
const dateRange = ref({
  startDate: '',
  endDate: '',
})

// Handle date range changes
const handleDateRangeChange = (newRange: { startDate: string, endDate: string }) => {
  dateRange.value = newRange
  emit('dateRangeChange', newRange)
}

// Get trend icon
const getTrendIcon = (trend: string) => {
  switch (trend) {
    case 'up':
      return ArrowUp
    case 'down':
      return ArrowDown
    default:
      return Minus
  }
}

// KPI Cards
const kpiCards = computed(() => {
  if (!props.data) return []

  const { kpis, trends } = props.data

  return [
    {
      key: 'totalUsers',
      label: 'Total Users',
      value: kpis.totalUsers.toLocaleString(),
      icon: Users,
      bgColor: 'bg-blue-100 dark:bg-blue-900',
      iconColor: 'text-blue-600 dark:text-blue-400',
      trend: trends.userGrowth,
      changeText: `${Math.abs(kpis.userGrowthRate)}% vs last period`,
    },
    {
      key: 'totalRevenue',
      label: 'Total Revenue',
      value: `€${kpis.totalRevenue.toLocaleString()}`,
      icon: Euro,
      bgColor: 'bg-green-100 dark:bg-green-900',
      iconColor: 'text-green-600 dark:text-green-400',
      trend: trends.revenueGrowth,
      changeText: `${Math.abs(kpis.revenueGrowthRate)}% vs last period`,
    },
    {
      key: 'conversionRate',
      label: 'Conversion Rate',
      value: `${kpis.conversionRate}%`,
      icon: ShoppingCart,
      bgColor: 'bg-purple-100 dark:bg-purple-900',
      iconColor: 'text-purple-600 dark:text-purple-400',
      trend: 'stable',
      changeText: 'Stable performance',
    },
    {
      key: 'avgOrderValue',
      label: 'Avg Order Value',
      value: `€${kpis.avgOrderValue.toFixed(2)}`,
      icon: BarChart2,
      bgColor: 'bg-amber-100 dark:bg-amber-900',
      iconColor: 'text-amber-600 dark:text-amber-400',
      trend: 'stable',
      changeText: 'Per order average',
    },
  ]
})

// Revenue chart data
const revenueChartData = computed((): ChartData => {
  if (!props.data?.dailyAnalytics) {
    return { labels: [], datasets: [] }
  }

  const analytics = props.data.dailyAnalytics
  const labels = analytics.map((item) => {
    const date = new Date(item.date)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  })

  return {
    labels,
    datasets: [
      {
        label: 'Revenue',
        data: analytics.map(item => item.revenue),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
    ],
  }
})

// User growth chart data
const userGrowthChartData = computed((): ChartData => {
  if (!props.data?.dailyAnalytics) {
    return { labels: [], datasets: [] }
  }

  const analytics = props.data.dailyAnalytics
  const labels = analytics.map((item) => {
    const date = new Date(item.date)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  })

  return {
    labels,
    datasets: [
      {
        label: 'New Users',
        data: analytics.map(item => item.newRegistrations),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: '#3b82f6',
        borderWidth: 1,
      },
    ],
  }
})

// Chart options
const revenueChartOptions: ChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: context => `Revenue: €${(context.parsed.y ?? 0).toLocaleString()}`,
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: value => `€${value}`,
      },
    },
  },
}

const userGrowthChartOptions: ChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
  },
  scales: {
    y: {
      beginAtZero: true,
    },
  },
}

// Conversion steps
const conversionSteps = computed(() => {
  if (!props.data) return []

  const totalUsers = props.data.kpis.totalUsers
  const activeUsers = props.data.kpis.activeUsers
  const orders = props.data.dailyAnalytics.reduce((sum, day) => sum + day.ordersCount, 0)

  return [
    {
      label: 'Total Users',
      value: totalUsers,
      percentage: 100,
      color: 'bg-blue-500 text-white',
    },
    {
      label: 'Active Users',
      value: activeUsers,
      percentage: totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0,
      color: 'bg-green-500 text-white',
    },
    {
      label: 'Orders',
      value: orders,
      percentage: totalUsers > 0 ? Math.round((orders / totalUsers) * 100) : 0,
      color: 'bg-purple-500 text-white',
    },
  ]
})

// Detailed metrics
const detailedMetrics = computed(() => {
  if (!props.data) return []

  return [
    {
      label: 'Active Users',
      value: props.data.kpis.activeUsers.toLocaleString(),
      description: 'Daily average',
    },
    {
      label: 'User Growth',
      value: `${props.data.kpis.userGrowthRate}%`,
      description: 'Period over period',
    },
    {
      label: 'Revenue Growth',
      value: `${props.data.kpis.revenueGrowthRate}%`,
      description: 'Period over period',
    },
    {
      label: 'Total Days',
      value: props.data.dateRange.totalDays.toString(),
      description: 'Analysis period',
    },
  ]
})
</script>
