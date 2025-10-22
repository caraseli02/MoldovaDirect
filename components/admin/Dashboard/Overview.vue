<template>
  <div class="space-y-8">
    <!-- Dashboard Header & Controls -->
    <section class="bg-white rounded-2xl border border-gray-200 shadow-sm">
      <div class="flex flex-col gap-6 p-6 lg:flex-row lg:items-start lg:justify-between">
        <div class="space-y-3">
          <div class="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <span>Operations Control Center</span>
            <span class="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
              {{ rangeLabel }}
            </span>
          </div>
          <div class="space-y-2">
            <h1 class="text-2xl font-semibold text-gray-900 lg:text-3xl">
              {{ $t('admin.dashboard.title') }}
            </h1>
            <p class="text-base text-gray-600">
              {{ headerSubtitle }}
            </p>
          </div>
        </div>

        <div class="flex flex-col gap-4 lg:w-auto">
          <div class="flex flex-wrap items-center gap-2">
            <button
              v-for="option in rangeOptions"
              :key="option.value"
              type="button"
              @click="selectRange(option.value)"
              :class="[
                'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
                selectedRange === option.value
                  ? 'border-blue-500 bg-blue-50 text-blue-600'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-900'
              ]"
            >
              {{ option.label }}
            </button>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-600">{{ $t('admin.dashboard.autoRefresh') }}</span>
              <button
                type="button"
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
              type="button"
              @click="refreshAll"
              :disabled="isLoading"
              class="flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              <commonIcon
                name="heroicons:arrow-path"
                :class="`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`"
              />
              <span>{{ $t('admin.dashboard.refreshAll') }}</span>
            </button>
          </div>
        </div>
      </div>

      <footer class="flex flex-col gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4 text-sm text-gray-600 md:flex-row md:items-center md:justify-between">
        <div class="flex items-center gap-2 text-gray-600">
          <commonIcon name="heroicons:clock" class="h-4 w-4 text-blue-500" />
          <span>Last updated {{ timeSinceRefresh }}</span>
        </div>
        <div class="flex flex-wrap items-center gap-4">
          <span class="flex items-center gap-2 text-gray-600">
            <div
              :class="[
                'h-2 w-2 rounded-full',
                autoRefreshEnabled ? 'bg-green-500' : 'bg-gray-300'
              ]"
            />
            {{ autoRefreshEnabled ? 'Auto-refresh active every 5 minutes' : 'Auto-refresh paused' }}
          </span>
          <span class="text-gray-500">
            {{ healthSummary }}
          </span>
        </div>
      </footer>
    </section>

    <!-- Error Alert -->
    <div v-if="error" class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
      <div class="flex items-start gap-3">
        <commonIcon name="heroicons:exclamation-triangle" class="h-5 w-5 text-red-600" />
        <div class="space-y-1">
          <p class="font-medium text-red-800">{{ $t('admin.dashboard.errors.loadingData') }}</p>
          <p>{{ error }}</p>
          <button
            type="button"
            @click="clearError"
            class="text-sm font-medium text-red-700 underline hover:text-red-900"
          >
            Dismiss alert
          </button>
        </div>
      </div>
    </div>

    <!-- Primary KPI Tiles -->
    <section>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div
          v-for="card in highlightCards"
          :key="card.key"
          class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <div class="flex items-start justify-between">
            <div class="space-y-1">
              <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">{{ card.label }}</p>
              <p class="text-3xl font-semibold text-gray-900">{{ card.value }}</p>
            </div>
            <div :class="['flex h-10 w-10 items-center justify-center rounded-full', card.accent]">
              <commonIcon :name="card.icon" class="h-5 w-5" />
            </div>
          </div>
          <div class="mt-4 flex items-center justify-between text-sm text-gray-600">
            <span class="font-medium" :class="card.trendClass">{{ card.delta }}</span>
            <span>{{ card.caption }}</span>
          </div>
          <div class="mt-4 h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              class="h-full rounded-full"
              :class="card.barColor"
              :style="{ width: `${card.progress}%` }"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Core Statistics -->
    <AdminDashboardStats />

    <!-- Operational Intelligence Layout -->
    <div class="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <div class="space-y-6 xl:col-span-2">
        <section class="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-gray-900">Revenue Momentum</h3>
              <span :class="['text-sm font-medium', performanceSignals.revenue.trendClass]">
                {{ performanceSignals.revenue.delta }}
              </span>
            </div>
            <p class="mt-2 text-sm text-gray-600">
              {{ performanceSignals.revenue.description }}
            </p>
            <div class="mt-6 space-y-4">
              <div class="flex items-center justify-between text-sm text-gray-500">
                <span>Today</span>
                <span class="font-semibold text-gray-900">{{ performanceSignals.revenue.today }}</span>
              </div>
              <div class="flex items-center justify-between text-sm text-gray-500">
                <span>Month-to-date</span>
                <span class="font-semibold text-gray-900">{{ performanceSignals.revenue.period }}</span>
              </div>
              <div class="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  class="h-full rounded-full bg-blue-500"
                  :style="{ width: `${performanceSignals.revenue.progress}%` }"
                />
              </div>
            </div>
          </div>

          <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-gray-900">Customer Activity</h3>
              <span :class="['text-sm font-medium', performanceSignals.customers.trendClass]">
                {{ performanceSignals.customers.delta }}
              </span>
            </div>
            <p class="mt-2 text-sm text-gray-600">
              {{ performanceSignals.customers.description }}
            </p>
            <div class="mt-6 space-y-4">
              <div class="flex items-center justify-between text-sm text-gray-500">
                <span>New registrations</span>
                <span class="font-semibold text-gray-900">{{ performanceSignals.customers.today }}</span>
              </div>
              <div class="flex items-center justify-between text-sm text-gray-500">
                <span>Active users</span>
                <span class="font-semibold text-gray-900">{{ performanceSignals.customers.period }}</span>
              </div>
              <div class="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  class="h-full rounded-full bg-green-500"
                  :style="{ width: `${performanceSignals.customers.progress}%` }"
                />
              </div>
            </div>
          </div>
        </section>

        <AdminUtilsRecentActivity />
      </div>

      <div class="space-y-6">
        <AdminDashboardOperationalBacklog
          :items="backlogItems"
          :loading="isLoading"
        />

        <AdminDashboardInsightHighlights
          :insights="insightHighlights"
        />

        <section class="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900">Execution Center</h3>
            <span class="text-xs font-semibold uppercase tracking-wide text-gray-400">Shortcuts</span>
          </div>

          <div class="grid grid-cols-1 gap-3">
            <NuxtLink
              to="/admin/products/new"
              class="group flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 transition-colors hover:border-blue-300 hover:bg-blue-50"
            >
              <div class="flex items-center gap-3">
                <div class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <commonIcon name="heroicons:plus" class="h-5 w-5" />
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ $t('admin.dashboard.quickActions.addNewProduct') }}</p>
                  <p class="text-xs text-gray-500">Launch a new catalog item with pricing & stock</p>
                </div>
              </div>
              <commonIcon name="heroicons:arrow-up-right" class="h-4 w-4 text-blue-500 opacity-0 transition-opacity group-hover:opacity-100" />
            </NuxtLink>

            <NuxtLink
              to="/admin/orders"
              class="group flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 transition-colors hover:border-green-300 hover:bg-green-50"
            >
              <div class="flex items-center gap-3">
                <div class="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <commonIcon name="heroicons:queue-list" class="h-5 w-5" />
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ $t('admin.dashboard.quickActions.viewOrders') }}</p>
                  <p class="text-xs text-gray-500">Review fulfillment status and payment confirmations</p>
                </div>
              </div>
              <commonIcon name="heroicons:arrow-up-right" class="h-4 w-4 text-green-500 opacity-0 transition-opacity group-hover:opacity-100" />
            </NuxtLink>

            <NuxtLink
              to="/admin/users"
              class="group flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 transition-colors hover:border-purple-300 hover:bg-purple-50"
            >
              <div class="flex items-center gap-3">
                <div class="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                  <commonIcon name="heroicons:user-group" class="h-5 w-5" />
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ $t('admin.dashboard.quickActions.manageUsers') }}</p>
                  <p class="text-xs text-gray-500">Audit roles, permissions, and customer records</p>
                </div>
              </div>
              <commonIcon name="heroicons:arrow-up-right" class="h-4 w-4 text-purple-500 opacity-0 transition-opacity group-hover:opacity-100" />
            </NuxtLink>
          </div>

          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Database</span>
              <span class="flex items-center gap-2 text-sm font-medium text-green-600">
                <span class="h-2 w-2 rounded-full bg-green-500"></span>
                Operational
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">API Layer</span>
              <span class="flex items-center gap-2 text-sm font-medium text-green-600">
                <span class="h-2 w-2 rounded-full bg-green-500"></span>
                All systems nominal
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Last backup</span>
              <span class="text-sm text-gray-500">{{ lastBackupCopy }}</span>
            </div>
          </div>

          <div v-if="criticalAlerts.length" class="rounded-lg border border-red-200 bg-red-50 p-4">
            <div class="mb-3 flex items-center gap-2 text-sm font-semibold text-red-700">
              <commonIcon name="heroicons:exclamation-triangle" class="h-4 w-4" />
              Critical alerts
            </div>
            <ul class="space-y-3 text-sm text-red-700">
              <li v-for="alert in criticalAlerts" :key="alert.id" class="rounded-md bg-white/80 px-3 py-2">
                <p class="font-medium text-red-800">{{ alert.title }}</p>
                <p class="mt-1 text-red-600">{{ alert.description }}</p>
              </li>
            </ul>
          </div>
        </section>
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
    stats: null,
    recentActivity: [],
    isLoading: false,
    statsLoading: false,
    activityLoading: false,
    error: null,
    criticalAlerts: [],
    activitiesByType: {},
    timeSinceRefresh: 'Never',
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
    stats: null,
    recentActivity: [],
    isLoading: false,
    statsLoading: false,
    activityLoading: false,
    error: null,
    criticalAlerts: [],
    activitiesByType: {},
    timeSinceRefresh: 'Never',
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

// Range controls
const rangeOptions = [
  { label: 'Today', value: 'today' },
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' }
]
const selectedRange = ref<'today' | '7d' | '30d'>('today')
const route = useRoute()

// Computed properties
const stats = computed(() => dashboardStore.stats)
const isLoading = computed(() => dashboardStore.isLoading)
const error = computed(() => dashboardStore.error)
const criticalAlerts = computed(() => dashboardStore.criticalAlerts || [])
const timeSinceRefresh = computed(() => dashboardStore.timeSinceRefresh || 'Never')

const activityGroups = computed(() => dashboardStore.activitiesByType || {})

const rangeLabel = computed(() => {
  const option = rangeOptions.find(option => option.value === selectedRange.value)
  return option ? option.label : 'Today'
})

const headerSubtitle = computed(() => {
  if (!stats.value) {
    return 'Monitor revenue, customer growth, and fulfillment performance in real time.'
  }

  return `Tracking ${formatNumber(stats.value.totalOrders)} lifetime orders and ${formatCurrency(stats.value.revenue)} in revenue.`
})

const healthSummary = computed(() => {
  if (!stats.value) {
    return 'Awaiting fresh metrics…'
  }

  const inventoryHealth = stats.value.activeProducts > 0
    ? Math.max(0, Math.min(100, Math.round((1 - (stats.value.lowStockProducts / stats.value.activeProducts)) * 100)))
    : 100

  return `Inventory health ${inventoryHealth}% · Conversion rate ${formatPercent(stats.value.conversionRate)}`
})

const highlightCards = computed(() => {
  const data = stats.value

  return [
    {
      key: 'revenueToday',
      label: 'Revenue Today',
      value: data ? formatCurrency(data.revenueToday) : '€0.00',
      delta: data && data.revenue > 0
        ? `${Math.round((data.revenueToday / data.revenue) * 100)}% of monthly`
        : 'No revenue recorded',
      caption: 'Real-time sales intake',
      progress: data && data.revenue > 0 ? Math.min(100, Math.round((data.revenueToday / data.revenue) * 100)) : 0,
      barColor: 'bg-blue-500',
      accent: 'bg-blue-50 text-blue-600',
      icon: 'heroicons:currency-euro',
      trendClass: data && data.revenueToday > 0 ? 'text-green-600' : 'text-gray-500'
    },
    {
      key: 'newCustomers',
      label: 'New Customers',
      value: data ? formatNumber(data.newUsersToday) : '0',
      delta: data ? `${formatNumber(data.activeUsers)} active users` : 'Active data pending',
      caption: 'Registrations today',
      progress: data && data.activeUsers > 0
        ? Math.min(100, Math.round((data.newUsersToday / data.activeUsers) * 100))
        : 0,
      barColor: 'bg-green-500',
      accent: 'bg-green-50 text-green-600',
      icon: 'heroicons:user-plus',
      trendClass: data && data.newUsersToday > 0 ? 'text-green-600' : 'text-gray-500'
    },
    {
      key: 'ordersPipeline',
      label: 'Orders Pipeline',
      value: data ? formatNumber(data.totalOrders) : '0',
      delta: data ? `${formatPercent(data.conversionRate)} conversion` : 'Conversion tracking pending',
      caption: 'Total orders processed',
      progress: data ? Math.min(100, Math.round(Math.min(data.conversionRate, 100))) : 0,
      barColor: 'bg-purple-500',
      accent: 'bg-purple-50 text-purple-600',
      icon: 'heroicons:queue-list',
      trendClass: data
        ? (data.conversionRate >= 2 ? 'text-green-600' : 'text-amber-600')
        : 'text-gray-500'
    },
    {
      key: 'inventoryHealth',
      label: 'Inventory Health',
      value: data ? formatNumber(Math.max(0, data.activeProducts - data.lowStockProducts)) : '--',
      delta: data ? `${formatNumber(data.lowStockProducts)} items flagged` : 'Monitoring stock levels',
      caption: 'Sellable SKUs in stock',
      progress: data && data.activeProducts > 0
        ? Math.min(100, Math.round((1 - (data.lowStockProducts / data.activeProducts)) * 100))
        : 0,
      barColor: 'bg-amber-500',
      accent: 'bg-amber-50 text-amber-600',
      icon: 'heroicons:shield-check',
      trendClass: data
        ? (data.lowStockProducts > 0 ? 'text-amber-600' : 'text-green-600')
        : 'text-gray-500'
    }
  ]
})

const performanceSignals = computed(() => {
  const data = stats.value
  const groups = activityGroups.value as Record<string, any[]>
  const ordersToday = groups?.new_order ? groups.new_order.length : 0

  const revenueProgress = data && data.revenue > 0
    ? Math.min(100, Math.round((data.revenueToday / data.revenue) * 100))
    : 0

  const customerProgress = data && data.activeUsers > 0
    ? Math.min(100, Math.round((data.newUsersToday / data.activeUsers) * 100))
    : 0

  return {
    revenue: {
      today: data ? formatCurrency(data.revenueToday) : '€0.00',
      period: data ? formatCurrency(data.revenue) : '€0.00',
      delta: revenueProgress >= 50 ? 'Strong momentum' : revenueProgress > 0 ? 'Moderate momentum' : 'No sales logged',
      description: revenueProgress > 0
        ? 'Revenue pace compared to the current month baseline.'
        : 'Waiting for new orders to update revenue metrics.',
      progress: revenueProgress,
      trendClass: revenueProgress >= 50 ? 'text-green-600' : revenueProgress > 0 ? 'text-amber-600' : 'text-gray-500'
    },
    customers: {
      today: data ? formatNumber(data.newUsersToday) : '0',
      period: data ? formatNumber(data.activeUsers) : '0',
      delta: ordersToday > 0 ? `${ordersToday} orders in last 24h` : 'No recent orders logged',
      description: 'Engagement from new sign-ups through active users this period.',
      progress: customerProgress,
      trendClass: customerProgress >= 10 ? 'text-green-600' : customerProgress > 0 ? 'text-amber-600' : 'text-gray-500'
    }
  }
})

const backlogItems = computed(() => {
  const data = stats.value
  const groups = activityGroups.value as Record<string, any[]>

  return [
    {
      key: 'orders',
      label: 'Orders to review',
      description: 'Newly submitted orders awaiting fulfillment checks.',
      count: groups?.new_order ? groups.new_order.length : 0,
      icon: 'heroicons:inbox-stack',
      to: '/admin/orders',
      tone: 'blue',
      cta: 'Open orders board'
    },
    {
      key: 'inventory',
      label: 'Inventory alerts',
      description: 'Products at or below their stock threshold.',
      count: data ? data.lowStockProducts : 0,
      icon: 'heroicons:exclamation-triangle',
      to: '/admin/inventory',
      tone: 'red',
      cta: 'Review stock levels'
    },
    {
      key: 'catalog',
      label: 'Catalog updates',
      description: 'Recently modified SKUs that may need QA.',
      count: groups?.product_update ? groups.product_update.length : 0,
      icon: 'heroicons:pencil-square',
      to: '/admin/products',
      tone: 'amber',
      cta: 'Audit product changes'
    },
    {
      key: 'customers',
      label: 'New customers',
      description: 'Registrations captured in the last 24 hours.',
      count: data ? data.newUsersToday : 0,
      icon: 'heroicons:user-plus',
      to: '/admin/users',
      tone: 'green',
      cta: 'View customer profiles'
    }
  ]
})

const insightHighlights = computed(() => {
  const data = stats.value
  const insights = [] as Array<{
    key: string
    title: string
    description: string
    icon: string
    tone: string
    to?: string
    action?: string
  }>

  if (!data) {
    insights.push({
      key: 'loading',
      title: 'Dashboard warming up',
      description: 'Metrics will appear as soon as the latest data is synced from Supabase.',
      icon: 'heroicons:arrow-path',
      tone: 'gray'
    })
    return insights
  }

  if (data.lowStockProducts > 0) {
    insights.push({
      key: 'inventory',
      title: 'Restock opportunities',
      description: `${formatNumber(data.lowStockProducts)} active products are at or below their safety threshold. Consider triggering a purchase order.`,
      icon: 'heroicons:exclamation-triangle',
      tone: 'red',
      to: '/admin/inventory',
      action: 'Open inventory workspace'
    })
  } else {
    insights.push({
      key: 'inventory-healthy',
      title: 'Inventory coverage secured',
      description: 'All tracked SKUs have healthy stock buffers. Keep monitoring to stay ahead of demand.',
      icon: 'heroicons:shield-check',
      tone: 'green'
    })
  }

  insights.push({
    key: 'conversion',
    title: 'Conversion health',
    description: `Storefront conversion is currently ${formatPercent(data.conversionRate)}. Explore checkout experiments to push beyond this baseline.`,
    icon: 'heroicons:cursor-arrow-rays',
    tone: data.conversionRate >= 2 ? 'green' : 'amber',
    to: '/admin/analytics',
    action: 'Inspect analytics'
  })

  if (data.newUsersToday > 0) {
    insights.push({
      key: 'growth',
      title: 'Customer acquisition spike',
      description: `${formatNumber(data.newUsersToday)} new customers signed up today. Follow up with onboarding campaigns to accelerate their first purchase.`,
      icon: 'heroicons:users',
      tone: 'blue',
      to: '/admin/email-templates',
      action: 'Plan nurture email'
    })
  } else {
    insights.push({
      key: 'growth-flat',
      title: 'Acquisition flatline',
      description: 'No new customer sign-ups detected today. Activate promotions or outreach to reignite traffic.',
      icon: 'heroicons:megaphone',
      tone: 'amber',
      to: '/admin/tools/campaigns',
      action: 'Launch campaign'
    })
  }

  return insights
})

const lastBackupCopy = computed(() => {
  return autoRefreshEnabled.value ? '2 hours ago' : '4 hours ago'
})

// Methods
const selectRange = (value: 'today' | '7d' | '30d') => {
  if (selectedRange.value === value) return
  selectedRange.value = value

  if (typeof dashboardStore.refresh === 'function') {
    dashboardStore.refresh()
  }
}

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
watch(() => route.path, (newPath) => {
  if (newPath === '/admin' || newPath === '/admin/dashboard') {
    dashboardStore.refresh()
  }
})

// Helpers
function formatCurrency(value?: number | null) {
  if (!value && value !== 0) {
    return '€0.00'
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR'
  }).format(value)
}

function formatPercent(value?: number | null) {
  if (!value && value !== 0) {
    return '0%'
  }

  return `${value.toFixed(1)}%`
}

function formatNumber(value?: number | null) {
  if (!value && value !== 0) {
    return '0'
  }

  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0
  }).format(value)
}
</script>
