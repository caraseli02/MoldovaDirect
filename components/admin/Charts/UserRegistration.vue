<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
        User Registration Trends
      </h3>
      <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <div class="flex items-center gap-1">
          <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span>New Users</span>
        </div>
        <div class="flex items-center gap-1">
          <div class="w-3 h-3 bg-green-500 rounded-full"></div>
          <span>Total Users</span>
        </div>
      </div>
    </div>
    
    <div class="h-80">
      <AdminChartsBase
        type="line"
        :data="chartData"
        :options="chartOptions"
        :loading="loading"
        :error="error"
      />
    </div>
    
    <div class="mt-4 grid grid-cols-2 gap-4 text-center">
      <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
        <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
          {{ totalNewUsers }}
        </div>
        <div class="text-sm text-gray-600 dark:text-gray-400">
          New Users (Period)
        </div>
      </div>
      <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
        <div class="text-2xl font-bold text-green-600 dark:text-green-400">
          {{ growthRate }}%
        </div>
        <div class="text-sm text-gray-600 dark:text-gray-400">
          Growth Rate
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

// Chart data
const chartData = computed((): ChartData => {
  if (!props.data?.registrationTrends) {
    return {
      labels: [],
      datasets: []
    }
  }

  const trends = props.data.registrationTrends
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
        label: 'New Users',
        data: trends.map(item => item.registrations),
        borderColor: '#3b82f6', // blue-500
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      },
      {
        label: 'Total Users',
        data: trends.map(item => item.cumulativeUsers),
        borderColor: '#10b981', // green-500
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  }
})

// Chart options
const chartOptions: ChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    intersect: false,
    mode: 'index'
  },
  plugins: {
    legend: {
      display: false // We have custom legend
    },
    tooltip: {
      callbacks: {
        title: (context) => {
          const date = new Date(props.data?.registrationTrends[context[0].dataIndex]?.date || '')
          return date.toLocaleDateString('en-US', { 
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        },
        label: (context) => {
          const value = context.parsed.y
          const label = context.dataset.label
          return `${label}: ${value.toLocaleString()}`
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
const totalNewUsers = computed(() => {
  if (!props.data?.registrationTrends) return 0
  return props.data.registrationTrends.reduce((sum, item) => sum + item.registrations, 0)
})

const growthRate = computed(() => {
  if (!props.data?.registrationTrends || props.data.registrationTrends.length < 2) return 0
  
  const trends = props.data.registrationTrends
  const midPoint = Math.floor(trends.length / 2)
  const firstHalf = trends.slice(0, midPoint)
  const secondHalf = trends.slice(midPoint)
  
  const firstHalfTotal = firstHalf.reduce((sum, item) => sum + item.registrations, 0)
  const secondHalfTotal = secondHalf.reduce((sum, item) => sum + item.registrations, 0)
  
  if (firstHalfTotal === 0) return 0
  
  const growth = ((secondHalfTotal - firstHalfTotal) / firstHalfTotal) * 100
  return Math.round(growth * 10) / 10 // Round to 1 decimal place
})
</script>