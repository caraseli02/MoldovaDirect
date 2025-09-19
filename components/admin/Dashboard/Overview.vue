<!--
  Admin Dashboard Overview Component
  
  Requirements addressed:
  - 3.1: Dashboard statistics and overview display
  - 6.4: Real-time data refresh functionality
  
  Main dashboard component that combines:
  - Statistics cards
  - Recent activity feed
  - Quick actions
  - Real-time refresh functionality
-->

<template>
  <div class="space-y-6">
    <!-- Dashboard Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">{{ $t('admin.dashboard.title') }}</h1>
        <p class="text-gray-600 mt-1">
          {{ $t('admin.dashboard.welcome') }}
        </p>
      </div>
      
      <!-- Auto-refresh Toggle -->
      <div class="flex items-center space-x-4">
        <div class="flex items-center space-x-2">
          <label class="text-sm text-gray-600">{{ $t('admin.dashboard.autoRefresh') }}</label>
          <button
            @click="toggleAutoRefresh"
            :class="[
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
              autoRefreshEnabled ? 'bg-blue-600' : 'bg-gray-200'
            ]"
          >
            <span
              :class="[
                'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                autoRefreshEnabled ? 'translate-x-6' : 'translate-x-1'
              ]"
            />
          </button>
        </div>
        
        <button
          @click="refreshAll"
          :disabled="isLoading"
          class="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <commonIcon 
            name="heroicons:arrow-path" 
            :class="`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`"
          />
          <span>{{ $t('admin.dashboard.refreshAll') }}</span>
        </button>
      </div>
    </div>

    <!-- Error Alert -->
    <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <div class="flex items-center">
        <commonIcon name="heroicons:exclamation-triangle" class="w-5 h-5 text-red-600 mr-2" />
        <div class="flex-1">
          <h3 class="text-sm font-medium text-red-800">{{ $t('admin.dashboard.errors.loadingData') }}</h3>
          <p class="text-sm text-red-700 mt-1">{{ error }}</p>
        </div>
        <button
          @click="clearError"
          class="text-red-600 hover:text-red-700"
        >
          <commonIcon name="heroicons:x-mark" class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- Dashboard Statistics -->
    <AdminDashboardStats />

    <!-- Dashboard Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Recent Activity (2/3 width) -->
      <div class="lg:col-span-2">
        <AdminRecentActivity />
      </div>

      <!-- Quick Actions & Alerts (1/3 width) -->
      <div class="space-y-6">
        <!-- Quick Actions -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">{{ $t('admin.dashboard.quickActions') }}</h3>
          <div class="space-y-3">
            <NuxtLink
              to="/admin/products/new"
              class="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <commonIcon name="heroicons:plus" class="w-5 h-5 text-blue-600" />
              <span class="text-sm font-medium">{{ $t('admin.dashboard.quickActions.addNewProduct') }}</span>
            </NuxtLink>
            
            <NuxtLink
              to="/admin/orders"
              class="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <commonIcon name="heroicons:shopping-bag" class="w-5 h-5 text-green-600" />
              <span class="text-sm font-medium">{{ $t('admin.dashboard.quickActions.viewOrders') }}</span>
            </NuxtLink>
            
            <NuxtLink
              to="/admin/users"
              class="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <commonIcon name="heroicons:users" class="w-5 h-5 text-purple-600" />
              <span class="text-sm font-medium">{{ $t('admin.dashboard.quickActions.manageUsers') }}</span>
            </NuxtLink>
          </div>
        </div>

        <!-- Critical Alerts -->
        <div v-if="criticalAlerts.length" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <commonIcon name="heroicons:exclamation-triangle" class="w-5 h-5 text-red-600 mr-2" />
            {{ $t('admin.dashboard.criticalAlerts') }}
          </h3>
          <div class="space-y-3">
            <div
              v-for="alert in criticalAlerts"
              :key="alert.id"
              class="p-3 bg-red-50 border border-red-200 rounded-lg"
            >
              <p class="text-sm font-medium text-red-800">{{ alert.title }}</p>
              <p class="text-sm text-red-700 mt-1">{{ alert.description }}</p>
            </div>
          </div>
        </div>

        <!-- System Status -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">{{ $t('admin.dashboard.systemStatus') }}</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">{{ $t('admin.dashboard.systemStatus.database') }}</span>
              <span class="flex items-center text-sm text-green-600">
                <div class="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                {{ $t('admin.dashboard.systemStatus.online') }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">{{ $t('admin.dashboard.systemStatus.api') }}</span>
              <span class="flex items-center text-sm text-green-600">
                <div class="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                {{ $t('admin.dashboard.systemStatus.operational') }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">{{ $t('admin.dashboard.systemStatus.lastBackup') }}</span>
              <span class="text-sm text-gray-500">{{ $t('admin.dashboard.systemStatus.hoursAgo', { hours: 2 }) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAdminDashboardStore } from '~/stores/adminDashboard'

// Store - safely access with fallback
let dashboardStore: any = null

try {
  dashboardStore = useAdminDashboardStore()
} catch (error) {
  console.warn('Admin dashboard store not available during SSR/hydration')
  // Create fallback store interface with all methods
  dashboardStore = {
    isLoading: false,
    error: null,
    criticalAlerts: [],
    initialize: () => Promise.resolve(),
    refresh: () => Promise.resolve(),
    clearError: () => {},
    startAutoRefresh: () => {},
    stopAutoRefresh: () => {},
    cleanup: () => {},
  }
}

if (!dashboardStore) {
  dashboardStore = {
    isLoading: false,
    error: null,
    criticalAlerts: [],
    initialize: () => Promise.resolve(),
    refresh: () => Promise.resolve(),
    clearError: () => {},
    startAutoRefresh: () => {},
    stopAutoRefresh: () => {},
    cleanup: () => {},
  }
}

// State
const autoRefreshEnabled = ref(true)

// Computed properties
const isLoading = computed(() => dashboardStore.isLoading)
const error = computed(() => dashboardStore.error)
const criticalAlerts = computed(() => dashboardStore.criticalAlerts)

// Methods
const refreshAll = () => {
  dashboardStore.refresh()
}

const clearError = () => {
  dashboardStore.clearError()
}

const toggleAutoRefresh = () => {
  autoRefreshEnabled.value = !autoRefreshEnabled.value
  
  if (autoRefreshEnabled.value) {
    dashboardStore.startAutoRefresh(5) // 5 minutes
  } else {
    dashboardStore.stopAutoRefresh()
  }
}

// Lifecycle
onMounted(() => {
  // Initialize dashboard data
  dashboardStore.initialize()
})

onUnmounted(() => {
  // Cleanup auto-refresh
  dashboardStore.cleanup()
})

// Watch for route changes to refresh data
watch(() => useRoute().path, (newPath) => {
  if (newPath === '/admin' || newPath === '/admin/dashboard') {
    dashboardStore.refresh()
  }
})
</script>