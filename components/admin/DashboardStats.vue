<!--
  Admin Dashboard Statistics Component
  
  Requirements addressed:
  - 3.1: Display key metrics including total products, users, and sales data
  - 6.4: Real-time data refresh functionality
  
  Displays:
  - Product metrics (total, active, low stock)
  - User metrics (total, active, new today)
  - Order and revenue metrics
  - Conversion rate
-->

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    <!-- Products Stats -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-600">{{ $t('admin.dashboard.stats.totalProducts') }}</p>
          <p class="text-2xl font-bold text-gray-900">
            {{ stats?.totalProducts || 0 }}
          </p>
          <p class="text-xs text-gray-500 mt-1">
            {{ $t('admin.dashboard.stats.activeProducts', { count: stats?.activeProducts || 0 }) }}
          </p>
        </div>
        <div class="p-3 bg-blue-50 rounded-full">
          <Icon name="heroicons:cube" class="w-6 h-6 text-blue-600" />
        </div>
      </div>
      
      <!-- Low Stock Alert -->
      <div v-if="stats?.lowStockProducts && stats.lowStockProducts > 0" 
           class="mt-4 p-2 bg-red-50 rounded-md">
        <p class="text-xs text-red-700">
          <Icon name="heroicons:exclamation-triangle" class="w-4 h-4 inline mr-1" />
          {{ $t('admin.dashboard.stats.lowStockProducts', { count: stats.lowStockProducts }) }}
        </p>
      </div>
    </div>

    <!-- Users Stats -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-600">{{ $t('admin.dashboard.stats.totalUsers') }}</p>
          <p class="text-2xl font-bold text-gray-900">
            {{ stats?.totalUsers || 0 }}
          </p>
          <p class="text-xs text-gray-500 mt-1">
            {{ $t('admin.dashboard.stats.activeUsers', { count: stats?.activeUsers || 0 }) }}
          </p>
        </div>
        <div class="p-3 bg-green-50 rounded-full">
          <Icon name="heroicons:users" class="w-6 h-6 text-green-600" />
        </div>
      </div>
      
      <!-- New Users Today -->
      <div v-if="stats?.newUsersToday && stats.newUsersToday > 0" 
           class="mt-4 p-2 bg-green-50 rounded-md">
        <p class="text-xs text-green-700">
          <Icon name="heroicons:arrow-trending-up" class="w-4 h-4 inline mr-1" />
          {{ $t('admin.dashboard.stats.newUsersToday', { count: stats.newUsersToday }) }}
        </p>
      </div>
    </div>

    <!-- Orders Stats -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-600">{{ $t('admin.dashboard.stats.totalOrders') }}</p>
          <p class="text-2xl font-bold text-gray-900">
            {{ stats?.totalOrders || 0 }}
          </p>
          <p class="text-xs text-gray-500 mt-1">
            {{ $t('admin.dashboard.stats.conversionRate', { rate: formattedConversionRate }) }}
          </p>
        </div>
        <div class="p-3 bg-purple-50 rounded-full">
          <Icon name="heroicons:shopping-bag" class="w-6 h-6 text-purple-600" />
        </div>
      </div>
    </div>

    <!-- Revenue Stats -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-600">{{ $t('admin.dashboard.stats.totalRevenue') }}</p>
          <p class="text-2xl font-bold text-gray-900">
            {{ formattedRevenue }}
          </p>
          <p class="text-xs text-gray-500 mt-1">
            {{ $t('admin.dashboard.stats.revenueToday', { amount: formattedRevenueToday }) }}
          </p>
        </div>
        <div class="p-3 bg-yellow-50 rounded-full">
          <Icon name="heroicons:currency-euro" class="w-6 h-6 text-yellow-600" />
        </div>
      </div>
    </div>
  </div>

  <!-- Refresh Info -->
  <div class="mt-4 flex items-center justify-between text-sm text-gray-500">
    <div class="flex items-center space-x-2">
      <Icon name="heroicons:clock" class="w-4 h-4" />
      <span>{{ $t('admin.dashboard.lastUpdated', { time: timeSinceRefresh }) }}</span>
    </div>
    
    <button
      @click="refresh"
      :disabled="isLoading"
      class="flex items-center space-x-1 px-3 py-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50"
    >
      <Icon 
        name="heroicons:arrow-path" 
        :class="`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`"
      />
      <span>{{ $t('admin.dashboard.refresh') }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useAdminDashboardStore } from '~/stores/adminDashboard'

// Store
const dashboardStore = useAdminDashboardStore()

// Computed properties
const stats = computed(() => dashboardStore.stats)
const isLoading = computed(() => dashboardStore.isLoading)
const formattedRevenue = computed(() => dashboardStore.formattedRevenue)
const formattedRevenueToday = computed(() => dashboardStore.formattedRevenueToday)
const formattedConversionRate = computed(() => dashboardStore.formattedConversionRate)
const timeSinceRefresh = computed(() => dashboardStore.timeSinceRefresh)

// Methods
const refresh = () => {
  dashboardStore.refresh()
}

// Initialize on mount
onMounted(() => {
  if (!stats.value) {
    dashboardStore.fetchStats()
  }
})
</script>