<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          Order Analytics
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">
          Comprehensive insights into order performance and trends
        </p>
      </div>
      <UiButton
        :disabled="loading || exporting"
        variant="outline"
        @click="exportToCSV"
      >
        <commonIcon
          :name="exporting ? 'lucide:loader-2' : 'lucide:download'"
          :class="['h-4 w-4 mr-2', exporting && 'animate-spin']"
        />
        Export CSV
      </UiButton>
    </div>

    <!-- Date Range Filter -->
    <UiCard class="rounded-2xl">
      <UiCardContent class="pt-6">
        <div class="flex items-center space-x-4">
          <div class="flex-1">
            <UiLabel>Date Range</UiLabel>
            <div class="flex items-center space-x-2">
              <UiInput
                v-model="dateFrom"
                type="date"
                :max="dateTo"
                class="w-48"
              />
              <span class="text-gray-500">to</span>
              <UiInput
                v-model="dateTo"
                type="date"
                :min="dateFrom"
                :max="today"
                class="w-48"
              />
            </div>
          </div>
          <div class="flex items-center space-x-2 pt-7">
            <UiButton
              v-for="preset in datePresets"
              :key="preset.label"
              variant="outline"
              size="sm"
              @click="applyDatePreset(preset.days)"
            >
              {{ preset.label }}
            </UiButton>
            <UiButton
              :disabled="loading"
              @click="fetchAnalytics"
            >
              <commonIcon
                :name="loading ? 'lucide:loader-2' : 'lucide:refresh-ccw'"
                :class="['h-4 w-4 mr-2', loading && 'animate-spin']"
              />
              Refresh
            </UiButton>
          </div>
        </div>
      </UiCardContent>
    </UiCard>

    <!-- Loading State -->
    <div
      v-if="loading && !analytics"
      class="flex items-center justify-center py-12"
    >
      <commonIcon
        name="lucide:loader-2"
        class="h-12 w-12 animate-spin text-primary"
      />
    </div>

    <!-- Analytics Content -->
    <div
      v-else-if="analytics"
      class="space-y-6"
    >
      <!-- Summary Metrics -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <UiCard class="rounded-2xl">
          <UiCardHeader class="pb-3">
            <UiCardDescription>Total Orders</UiCardDescription>
          </UiCardHeader>
          <UiCardContent>
            <div class="text-3xl font-bold text-gray-900 dark:text-white">
              {{ analytics.summary.totalOrders.toLocaleString() }}
            </div>
          </UiCardContent>
        </UiCard>

        <UiCard class="rounded-2xl">
          <UiCardHeader class="pb-3">
            <UiCardDescription>Total Revenue</UiCardDescription>
          </UiCardHeader>
          <UiCardContent>
            <div class="text-3xl font-bold text-gray-900 dark:text-white">
              {{ formatCurrency(analytics.summary.totalRevenue) }}
            </div>
          </UiCardContent>
        </UiCard>

        <UiCard class="rounded-2xl">
          <UiCardHeader class="pb-3">
            <UiCardDescription>Average Order Value</UiCardDescription>
          </UiCardHeader>
          <UiCardContent>
            <div class="text-3xl font-bold text-gray-900 dark:text-white">
              {{ formatCurrency(analytics.summary.averageOrderValue) }}
            </div>
          </UiCardContent>
        </UiCard>

        <UiCard class="rounded-2xl">
          <UiCardHeader class="pb-3">
            <UiCardDescription>Fulfillment Rate</UiCardDescription>
          </UiCardHeader>
          <UiCardContent>
            <div class="text-3xl font-bold text-gray-900 dark:text-white">
              {{ analytics.summary.fulfillmentRate.toFixed(1) }}%
            </div>
          </UiCardContent>
        </UiCard>
      </div>

      <!-- Performance Metrics -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UiCard class="rounded-2xl">
          <UiCardHeader class="pb-3">
            <UiCardDescription>Average Fulfillment Time</UiCardDescription>
          </UiCardHeader>
          <UiCardContent>
            <div class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ analytics.summary.averageFulfillmentTime.toFixed(1) }} days
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              From order creation to shipment
            </p>
          </UiCardContent>
        </UiCard>

        <UiCard class="rounded-2xl">
          <UiCardHeader class="pb-3">
            <UiCardDescription>Average Delivery Time</UiCardDescription>
          </UiCardHeader>
          <UiCardContent>
            <div class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ analytics.summary.averageDeliveryTime.toFixed(1) }} days
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              From shipment to delivery
            </p>
          </UiCardContent>
        </UiCard>
      </div>

      <!-- Status Breakdown -->
      <UiCard class="rounded-2xl">
        <UiCardHeader>
          <UiCardTitle>Order Status Breakdown</UiCardTitle>
          <UiCardDescription>Distribution of orders by current status</UiCardDescription>
        </UiCardHeader>
        <UiCardContent>
          <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div
              v-for="(count, status) in analytics.statusBreakdown"
              :key="status"
              class="p-4 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div class="flex items-center justify-between mb-2">
                <AdminOrdersStatusBadge :status="status as OrderStatus" />
              </div>
              <div class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ count }}
              </div>
              <div class="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {{ ((count / analytics.summary.totalOrders) * 100).toFixed(1) }}%
              </div>
            </div>
          </div>
        </UiCardContent>
      </UiCard>

      <!-- Payment Method Breakdown -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UiCard class="rounded-2xl">
          <UiCardHeader>
            <UiCardTitle>Payment Methods</UiCardTitle>
            <UiCardDescription>Orders by payment method</UiCardDescription>
          </UiCardHeader>
          <UiCardContent>
            <div class="space-y-3">
              <div
                v-for="(count, method) in analytics.paymentMethodBreakdown"
                :key="method"
                class="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
              >
                <span class="text-sm font-medium text-gray-900 dark:text-white capitalize">
                  {{ method }}
                </span>
                <div class="flex items-center space-x-3">
                  <span class="text-sm text-gray-600 dark:text-gray-400">
                    {{ count }} orders
                  </span>
                  <span class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ formatCurrency(analytics.revenueByPaymentMethod[method] || 0) }}
                  </span>
                </div>
              </div>
            </div>
          </UiCardContent>
        </UiCard>

        <UiCard class="rounded-2xl">
          <UiCardHeader>
            <UiCardTitle>Revenue Breakdown</UiCardTitle>
            <UiCardDescription>Components of total revenue</UiCardDescription>
          </UiCardHeader>
          <UiCardContent>
            <div class="space-y-3">
              <div class="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <span class="text-sm font-medium text-gray-900 dark:text-white">
                  Subtotal
                </span>
                <span class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ formatCurrency(analytics.revenueBreakdown.subtotal) }}
                </span>
              </div>
              <div class="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <span class="text-sm font-medium text-gray-900 dark:text-white">
                  Shipping
                </span>
                <span class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ formatCurrency(analytics.revenueBreakdown.shipping) }}
                </span>
              </div>
              <div class="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <span class="text-sm font-medium text-gray-900 dark:text-white">
                  Tax
                </span>
                <span class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ formatCurrency(analytics.revenueBreakdown.tax) }}
                </span>
              </div>
              <div class="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border-t-2 border-blue-500">
                <span class="text-sm font-bold text-gray-900 dark:text-white">
                  Total
                </span>
                <span class="text-sm font-bold text-gray-900 dark:text-white">
                  {{ formatCurrency(analytics.revenueBreakdown.total) }}
                </span>
              </div>
            </div>
          </UiCardContent>
        </UiCard>
      </div>

      <!-- Revenue Time Series Chart -->
      <UiCard class="rounded-2xl">
        <UiCardHeader>
          <UiCardTitle>Revenue Trend</UiCardTitle>
          <UiCardDescription>Daily revenue and order volume over time</UiCardDescription>
        </UiCardHeader>
        <UiCardContent>
          <div
            v-if="analytics.timeSeries.length > 0"
            class="h-64"
          >
            <!-- Simple bar chart visualization -->
            <div class="flex items-end justify-between h-full space-x-1">
              <div
                v-for="(dataPoint, index) in analytics.timeSeries"
                :key="index"
                class="flex-1 flex flex-col items-center"
              >
                <div
                  class="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                  :style="{ height: `${(dataPoint.revenue / maxRevenue) * 100}%` }"
                  :title="`${dataPoint.date}: ${formatCurrency(dataPoint.revenue)} (${dataPoint.orders} orders)`"
                ></div>
              </div>
            </div>
          </div>
          <div
            v-else
            class="text-center py-8 text-gray-500 dark:text-gray-400"
          >
            No data available for the selected date range
          </div>
        </UiCardContent>
      </UiCard>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="text-center py-12"
    >
      <commonIcon
        name="lucide:alert-circle"
        class="h-12 w-12 text-red-400 mx-auto mb-4"
      />
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
        Failed to load analytics
      </h3>
      <p class="text-gray-600 dark:text-gray-400 mb-4">
        {{ error }}
      </p>
      <UiButton>
        @click="fetchAnalytics">
        Try Again
      </UiButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { OrderStatus } from '~/types'

import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { subDays } from 'date-fns'

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin'],
})

interface AnalyticsData {
  summary: {
    totalOrders: number
    totalRevenue: number
    averageOrderValue: number
    fulfillmentRate: number
    averageFulfillmentTime: number
    averageDeliveryTime: number
  }
  statusBreakdown: Record<string, number>
  paymentStatusBreakdown: Record<string, number>
  paymentMethodBreakdown: Record<string, number>
  revenueByPaymentMethod: Record<string, number>
  revenueBreakdown: {
    subtotal: number
    shipping: number
    tax: number
    total: number
  }
  timeSeries: Array<{
    date: string
    revenue: number
    orders: number
  }>
  dateRange: {
    start: string
    end: string
  }
}

// State
const loading = ref(false)
const exporting = ref(false)
const error = ref<string | null>(null)
const analytics = ref<AnalyticsData | null>(null)

// Helper function to format date as yyyy-MM-dd (native alternative to date-fns format)
const formatDateISO = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Date range
const today = formatDateISO(new Date())
const dateFrom = ref(formatDateISO(subDays(new Date(), 30)))
const dateTo = ref(today)

// Date presets
const datePresets = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
]

// Computed
const maxRevenue = computed(() => {
  if (!analytics.value || analytics.value.timeSeries.length === 0) return 0
  return Math.max(...analytics.value.timeSeries.map(d => d.revenue))
})

// Methods
const fetchAnalytics = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await $fetch<{
      success: boolean
      data: AnalyticsData
    }>('/api/admin/orders/analytics', {
      query: {
        date_from: dateFrom.value,
        date_to: dateTo.value,
      },
    })

    if (response.success) {
      analytics.value = response.data
    }
    else {
      error.value = 'Failed to fetch analytics data'
    }
  }
  catch (err: unknown) {
    console.error('Error fetching analytics:', getErrorMessage(err))
    error.value = 'An error occurred while fetching analytics'
  }
  finally {
    loading.value = false
  }
}

const applyDatePreset = (days: number) => {
  dateTo.value = today
  dateFrom.value = formatDateISO(subDays(new Date(), days))
  fetchAnalytics()
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

const exportToCSV = async () => {
  if (!analytics.value) return

  exporting.value = true

  try {
    // Create CSV content
    const headers = ['Date', 'Revenue (EUR)', 'Orders']
    const rows = analytics.value.timeSeries.map(d => [
      d.date,
      d.revenue.toFixed(2),
      d.orders.toString(),
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n')

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `order-analytics-${dateFrom.value}-to-${dateTo.value}.csv`
    link.click()
    window.URL.revokeObjectURL(url)

    const { success } = useToast()
    success('Success', 'Analytics exported successfully')
  }
  catch (err: unknown) {
    console.error('Error exporting CSV:', getErrorMessage(err))
    const { error: showError } = useToast()
    showError('Error', 'Failed to export analytics')
  }
  finally {
    exporting.value = false
  }
}

// Lifecycle
onMounted(() => {
  fetchAnalytics()
})

// SEO
useHead({
  title: 'Order Analytics - Admin - Moldova Direct',
  meta: [
    {
      name: 'robots',
      content: 'noindex, nofollow',
    },
  ],
})
</script>
