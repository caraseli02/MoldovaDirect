<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <div class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Analytics Dashboard
            </h1>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Monitor user behavior and business performance
            </p>
          </div>
          <div class="flex items-center gap-4">
            <Button
              @click="refreshData"
              :disabled="loading"
              variant="outline"
            >
              <RefreshCcw
                :class="['w-4 h-4 mr-2', loading ? 'animate-spin' : '']"
              />
              Refresh
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Tab Navigation -->
      <div class="mb-8">
        <nav class="flex space-x-8" aria-label="Tabs">
          <Button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm border-0 rounded-none',
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-transparent shadow-none'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 bg-transparent shadow-none'
            ]"
            variant="ghost"
          >
            <component :is="tab.icon" class="w-5 h-5 mr-2 inline" />
            {{ tab.name }}
          </Button>
        </nav>
      </div>

      <!-- Tab Content -->
      <div class="space-y-8">
        <!-- Overview Tab -->
        <div v-if="activeTab === 'overview'">
          <AdminDashboardAnalyticsOverview
            :data="analyticsOverview"
            :loading="loading"
            :error="error"
            @date-range-change="handleDateRangeChange"
          />
        </div>

        <!-- Users Tab -->
        <div v-if="activeTab === 'users'" class="space-y-6">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <AdminUtilsDateRangePicker
              v-model="dateRange"
              @change="handleDateRangeChange"
            />
          </div>

          <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <AdminChartsUserRegistration
              :data="userAnalytics"
              :loading="loading"
              :error="error"
            />
            <AdminChartsUserActivity
              :data="userAnalytics"
              :loading="loading"
              :error="error"
            />
          </div>

          <!-- User Summary Stats -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div
              v-for="stat in userStats"
              :key="stat.label"
              class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <component :is="stat.icon" :class="['w-8 h-8', stat.iconColor]" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {{ stat.label }}
                  </p>
                  <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {{ stat.value }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Products Tab -->
        <div v-if="activeTab === 'products'" class="space-y-6">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <AdminUtilsDateRangePicker
              v-model="dateRange"
              @change="handleDateRangeChange"
            />
          </div>

          <!-- Conversion Funnel -->
          <AdminChartsConversionFunnel
            :data="productAnalytics"
            :loading="loading"
            :error="error"
          />

          <!-- Product Performance Chart and Top Products -->
          <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <AdminChartsProductPerformance
              :data="productAnalytics"
              :loading="loading"
              :error="error"
            />
            <AdminUtilsTopProductsTable
              :data="productAnalytics"
              :loading="loading"
              :error="error"
              title="Top Performing Products"
              :limit="5"
            />
          </div>

          <!-- Detailed Product Table -->
          <AdminUtilsTopProductsTable
            :data="productAnalytics"
            :loading="loading"
            :error="error"
            title="All Products Performance"
            :limit="20"
          />
        </div>
      </div>

      <!-- Loading Overlay -->
      <div
        v-if="loading && !analyticsOverview && !userAnalytics && !productAnalytics"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 flex items-center gap-4">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span class="text-gray-900 dark:text-gray-100">Loading analytics...</span>
        </div>
      </div>

      <!-- Error State -->
      <div
        v-if="error && !loading"
        class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
      >
        <div class="flex">
          <AlertTriangle class="w-5 h-5 text-red-400 mr-3 mt-0.5" />
          <div>
            <h3 class="text-sm font-medium text-red-800 dark:text-red-200">
              Failed to load analytics data
            </h3>
            <p class="text-sm text-red-700 dark:text-red-300 mt-1">
              {{ error }}
            </p>
            <Button
              @click="refreshData"
              variant="link"
              class="mt-2 text-sm text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300"
            >
              Try again
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
  AlertTriangle,
  BarChart2,
  RefreshCcw,
  ShoppingBag,
  Users
} from 'lucide-vue-next'
import AdminDashboardAnalyticsOverview from '~/components/admin/Dashboard/AnalyticsOverview.vue'
import AdminUtilsDateRangePicker from '~/components/admin/Utils/DateRangePicker.vue'
import AdminChartsUserRegistration from '~/components/admin/Charts/UserRegistration.vue'
import AdminChartsUserActivity from '~/components/admin/Charts/UserActivity.vue'
import AdminChartsConversionFunnel from '~/components/admin/Charts/ConversionFunnel.vue'
import AdminChartsProductPerformance from '~/components/admin/Charts/ProductPerformance.vue'
import AdminUtilsTopProductsTable from '~/components/admin/Utils/TopProductsTable.vue'

// Page metadata
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

// Composables
const { 
  analyticsOverview,
  userAnalytics,
  productAnalytics,
  loading,
  error,
  fetchAnalyticsOverview,
  fetchUserAnalytics,
  fetchProductAnalytics,
  refreshAllAnalytics
} = useAnalytics()

// State
const activeTab = ref('overview')
const dateRange = ref({
  startDate: '',
  endDate: ''
})

// Tab configuration
const tabs = [
  {
    id: 'overview',
    name: 'Overview',
    icon: BarChart2
  },
  {
    id: 'users',
    name: 'Users',
    icon: Users
  },
  {
    id: 'products',
    name: 'Products',
    icon: ShoppingBag
  }
]

// User stats
const userStats = computed(() => {
  if (!userAnalytics.value) return []

  const { summary } = userAnalytics.value

  return [
    {
      label: 'Total Users',
      value: summary.totalUsers.toLocaleString(),
      icon: Users,
      iconColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      label: 'Active Users (30d)',
      value: summary.activeUsersLast30Days.toLocaleString(),
      icon: Users,
      iconColor: 'text-green-600 dark:text-green-400'
    },
    {
      label: 'New Users (30d)',
      value: summary.newUsersLast30Days.toLocaleString(),
      icon: Users,
      iconColor: 'text-purple-600 dark:text-purple-400'
    },
    {
      label: 'Retention Rate',
      value: `${summary.userRetentionRate}%`,
      icon: BarChart2,
      iconColor: 'text-amber-600 dark:text-amber-400'
    }
  ]
})

// Handle date range changes
const handleDateRangeChange = async (newRange: { startDate: string; endDate: string }) => {
  dateRange.value = newRange
  await loadAnalyticsData(newRange)
}

// Load analytics data
const loadAnalyticsData = async (params?: { startDate?: string; endDate?: string }) => {
  try {
    await Promise.all([
      fetchAnalyticsOverview(params),
      fetchUserAnalytics(params),
      fetchProductAnalytics(params)
    ])
  } catch (err) {
    console.error('Failed to load analytics:', err)
  }
}

// Refresh all data
const refreshData = async () => {
  await loadAnalyticsData(dateRange.value.startDate ? dateRange.value : undefined)
}

// Initialize data on mount
onMounted(async () => {
  await loadAnalyticsData()
})

// Set page title
useHead({
  title: 'Analytics Dashboard - Admin'
})
</script>