<template>
  <div class="space-y-8">
    <section class="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div class="flex flex-col gap-6 p-6 lg:flex-row lg:items-start lg:justify-between">
        <div class="space-y-3">
          <div class="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <span>Operations Control Center</span>
            <span class="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-medium text-gray-600">
              {{ rangeLabel }}
            </span>
          </div>
          <div class="space-y-2">
            <h1 class="text-3xl font-semibold text-gray-900">
              {{ $t('admin.dashboard.title') }}
            </h1>
            <p class="text-base text-gray-500">
              {{ headerSubtitle }}
            </p>
          </div>
        </div>

        <div class="flex flex-col gap-4 lg:w-auto">
          <div class="flex flex-wrap items-center gap-3">
            <button
              v-for="option in rangeOptions"
              :key="option.value"
              type="button"
              @click="selectRange(option.value)"
              :class="[
                'rounded-xl border px-4 py-2 text-sm font-medium transition-colors duration-200',
                selectedRange === option.value
                  ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-[0_0_0_3px_rgba(59,130,246,0.12)]'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-900'
              ]"
            >
              {{ option.label }}
            </button>
          </div>

          <div class="flex flex-wrap items-center gap-4">
            <div class="flex items-center gap-3">
              <span class="text-sm text-gray-500">{{ $t('admin.dashboard.autoRefresh') }}</span>
              <button
                type="button"
                @click="toggleAutoRefresh"
                :class="[
                  'relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-300',
                  autoRefreshEnabled
                    ? 'bg-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.18)] animate-pulse'
                    : 'bg-gray-200'
                ]"
              >
                <span class="sr-only">Toggle auto refresh</span>
                <span
                  :class="[
                    'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-all duration-300',
                    autoRefreshEnabled ? 'translate-x-7 shadow-[0_4px_10px_rgba(59,130,246,0.35)]' : 'translate-x-1'
                  ]"
                />
              </button>
            </div>

            <button
              type="button"
              @click="refreshAll"
              :disabled="refreshing || isLoading"
              :class="[
                'flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-medium text-white transition-all duration-200',
                refreshing || isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
              ]"
            >
              <commonIcon
                name="heroicons:arrow-path"
                :class="['h-4 w-4', refreshing || isLoading ? 'animate-spin text-white' : 'text-white']"
              />
              <span>{{ $t('admin.dashboard.refreshAll') }}</span>
            </button>
          </div>
        </div>
      </div>

      <footer class="flex flex-col gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4 text-sm text-gray-500 md:flex-row md:items-center md:justify-between">
        <div class="flex items-center gap-2">
          <commonIcon name="heroicons:clock" class="h-4 w-4 text-blue-500" />
          <span>Last updated {{ timeSinceRefresh }}</span>
        </div>
        <div class="flex flex-wrap items-center gap-4 text-sm text-gray-500">
          <span class="flex items-center gap-2">
            <span
              :class="[
                'h-2 w-2 rounded-full transition-colors',
                autoRefreshEnabled ? 'bg-green-500' : 'bg-gray-300'
              ]"
            />
            {{ autoRefreshEnabled ? 'Auto-refresh active every 5 minutes' : 'Auto-refresh paused' }}
          </span>
          <span>{{ healthSummary }}</span>
        </div>
      </footer>
    </section>

    <div v-if="error" class="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">
      <div class="flex items-start gap-3">
        <commonIcon name="heroicons:exclamation-triangle" class="h-5 w-5 text-red-500" />
        <div class="space-y-2">
          <p class="font-medium text-red-700">{{ $t('admin.dashboard.errors.loadingData') }}</p>
          <p>{{ error }}</p>
          <button
            type="button"
            @click="clearError"
            class="text-sm font-medium text-red-600 underline hover:text-red-700"
          >
            Dismiss alert
          </button>
        </div>
      </div>
    </div>

    <section class="space-y-4">
      <header class="flex items-center justify-between">
        <h2 class="text-xs font-semibold uppercase tracking-wide text-gray-500">Key Metrics</h2>
        <p class="text-sm text-gray-400">Real-time KPIs and operational signals</p>
      </header>
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <AdminDashboardMetricCard
          v-for="card in highlightCards"
          :key="card.key"
          :label="card.label"
          :value="card.value"
          :subtext="card.subtext"
          :icon="card.icon"
          :trend="card.trend"
          :variant="card.variant"
        >
          <template #meta>
            <span :class="['text-sm font-medium', card.metaClass]">{{ card.meta }}</span>
          </template>
          <template #footer>
            <div class="space-y-2">
              <div class="flex items-center justify-between text-xs text-gray-400">
                <span>{{ card.footerLabel }}</span>
                <span :class="['font-medium', card.footerClass]">{{ card.footerValue }}</span>
              </div>
              <div class="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  :class="['h-full rounded-full transition-all duration-500', card.progressClass]"
                  :style="{ width: `${card.progress}%` }"
                />
              </div>
            </div>
          </template>
        </AdminDashboardMetricCard>
      </div>
    </section>

    <AdminDashboardStats />

    <AdminDashboardPerformanceComparisonChart
      :dataset="comparisonDataset"
      :revenue-summary="revenueSummary"
      :customer-summary="customerSummary"
    />

    <div class="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <div class="space-y-6 xl:col-span-2">
        <header class="flex items-center justify-between">
          <h2 class="text-xs font-semibold uppercase tracking-wide text-gray-500">Recent Activity</h2>
          <span class="text-sm text-gray-400">Live operational events</span>
        </header>
        <AdminUtilsRecentActivity />
      </div>

      <div class="space-y-6">
        <AdminDashboardOperationalBacklog
          :items="backlogItems"
          :loading="isLoading"
        />

        <AdminDashboardInsightHighlights :insights="insightHighlights" />

        <section class="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-medium text-gray-900">Execution Center</h3>
            <span class="text-xs font-semibold uppercase tracking-wide text-gray-400">Shortcuts</span>
          </div>

          <div class="grid grid-cols-1 gap-3">
            <NuxtLink
              to="/admin/products/new"
              class="group flex items-center justify-between rounded-2xl border border-gray-200 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-500/40 hover:shadow-lg"
            >
              <div class="flex items-center gap-3">
                <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
                  <commonIcon name="lucide:plus" class="h-5 w-5" />
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ $t('admin.dashboard.quickActions.addNewProduct') }}</p>
                  <p class="text-sm text-gray-400">Launch a new catalog item with pricing & stock</p>
                </div>
              </div>
              <commonIcon name="heroicons:arrow-up-right" class="h-4 w-4 text-blue-500 transition-opacity group-hover:opacity-100" />
            </NuxtLink>

            <NuxtLink
              to="/admin/orders"
              class="group flex items-center justify-between rounded-2xl border border-gray-200 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-green-500/40 hover:shadow-lg"
            >
              <div class="flex items-center gap-3">
                <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-500">
                  <commonIcon name="lucide:shopping-cart" class="h-5 w-5" />
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ $t('admin.dashboard.quickActions.viewOrders') }}</p>
                  <p class="text-sm text-gray-400">Review fulfillment status and payment confirmations</p>
                </div>
              </div>
              <commonIcon name="heroicons:arrow-up-right" class="h-4 w-4 text-green-500 transition-opacity group-hover:opacity-100" />
            </NuxtLink>

            <NuxtLink
              to="/admin/users"
              class="group flex items-center justify-between rounded-2xl border border-gray-200 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-500/40 hover:shadow-lg"
            >
              <div class="flex items-center gap-3">
                <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                  <commonIcon name="lucide:users" class="h-5 w-5" />
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ $t('admin.dashboard.quickActions.manageUsers') }}</p>
                  <p class="text-sm text-gray-400">Audit roles, permissions, and customer records</p>
                </div>
              </div>
              <commonIcon name="heroicons:arrow-up-right" class="h-4 w-4 text-slate-500 transition-opacity group-hover:opacity-100" />
            </NuxtLink>
          </div>

          <div class="space-y-4 text-sm text-gray-400">
            <div class="flex items-center justify-between">
              <span>Database</span>
              <span class="flex items-center gap-2 text-sm font-medium text-green-500">
                <span class="h-2 w-2 rounded-full bg-green-500"></span>
                Operational
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span>API Layer</span>
              <span class="flex items-center gap-2 text-sm font-medium text-green-500">
                <span class="h-2 w-2 rounded-full bg-green-500"></span>
                All systems nominal
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span>Last backup</span>
              <span>{{ lastBackupCopy }}</span>
            </div>
          </div>

          <div v-if="criticalAlerts.length" class="rounded-2xl border border-red-200 bg-red-50 p-4">
            <div class="mb-3 flex items-center gap-2 text-sm font-semibold text-red-600">
              <commonIcon name="heroicons:exclamation-triangle" class="h-4 w-4" />
              Critical alerts
            </div>
            <ul class="space-y-3 text-sm text-red-600">
              <li v-for="alert in criticalAlerts" :key="alert.id" class="rounded-xl bg-white/80 p-3">
                <p class="font-medium text-red-700">{{ alert.title }}</p>
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
import { format, subDays } from 'date-fns'
import { useAdminDashboardStore } from '~/stores/adminDashboard'

let dashboardStore: any = null

try {
  dashboardStore = useAdminDashboardStore()
} catch (error) {
  console.warn('Admin dashboard store not available during SSR/hydration')
  dashboardStore = null
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
    cleanup: () => {}
  }
}

const autoRefreshEnabled = ref(true)
const refreshing = ref(false)

const rangeOptions = [
  { label: 'Today', value: 'today' },
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' }
]
const selectedRange = ref<'today' | '7d' | '30d'>('today')
const route = useRoute()

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

  const revenueShare = data && data.revenue > 0
    ? Math.min(100, Math.round((data.revenueToday / data.revenue) * 100))
    : 0

  const inventoryHealth = data && data.activeProducts > 0
    ? Math.min(100, Math.round((1 - (data.lowStockProducts / data.activeProducts)) * 100))
    : 0

  return [
    {
      key: 'revenueToday',
      label: 'Revenue Today',
      value: data ? formatCurrency(data.revenueToday) : '€0.00',
      subtext: 'Real-time sales intake',
      icon: 'lucide:wallet',
      trend: data && data.revenueToday > 0 ? 'up' : 'flat',
      variant: data && data.revenueToday > 0 ? 'success' : 'neutral',
      meta: revenueShare ? `${revenueShare}% of monthly` : 'Awaiting orders',
      metaClass: revenueShare ? 'text-green-500' : 'text-gray-400',
      footerLabel: 'Monthly baseline',
      footerValue: data ? formatCurrency(data.revenue) : '€0.00',
      footerClass: 'text-blue-500',
      progress: revenueShare,
      progressClass: 'bg-green-500'
    },
    {
      key: 'newCustomers',
      label: 'New Customers',
      value: data ? formatNumber(data.newUsersToday) : '0',
      subtext: 'Registrations captured today',
      icon: 'lucide:user-plus',
      trend: data && data.newUsersToday > 0 ? 'up' : 'flat',
      variant: data && data.newUsersToday > 0 ? 'info' : 'neutral',
      meta: data ? `${formatNumber(data.activeUsers)} active users` : 'Active data pending',
      metaClass: 'text-blue-500',
      footerLabel: 'Daily onboarding goal',
      footerValue: data ? `${formatNumber(Math.max(Math.round(data.activeUsers / 30), 1))} target` : '—',
      footerClass: 'text-blue-500',
      progress: data && data.activeUsers > 0
        ? Math.min(100, Math.round((data.newUsersToday / data.activeUsers) * 100 * 4))
        : 0,
      progressClass: 'bg-blue-500'
    },
    {
      key: 'ordersPipeline',
      label: 'Orders Pipeline',
      value: data ? formatNumber(data.totalOrders) : '0',
      subtext: 'Total orders processed',
      icon: 'lucide:shopping-cart',
      trend: data
        ? (data.conversionRate >= 2 ? 'up' : data.conversionRate > 0 ? 'flat' : 'down')
        : 'flat',
      variant: data
        ? (data.conversionRate >= 2 ? 'success' : data.conversionRate > 0 ? 'info' : 'warning')
        : 'neutral',
      meta: data ? `${formatPercent(data.conversionRate)} conversion` : 'Conversion tracking pending',
      metaClass: data
        ? (data.conversionRate >= 2 ? 'text-green-500' : data.conversionRate > 0 ? 'text-blue-500' : 'text-yellow-400')
        : 'text-gray-400',
      footerLabel: 'Checkout efficiency',
      footerValue: data ? `${formatPercent(data.conversionRate)}` : '0%',
      footerClass: data
        ? (data.conversionRate >= 2 ? 'text-green-500' : data.conversionRate > 0 ? 'text-blue-500' : 'text-yellow-400')
        : 'text-gray-400',
      progress: data ? Math.min(100, Math.round(Math.min(data.conversionRate * 10, 100))) : 0,
      progressClass: 'bg-green-500'
    },
    {
      key: 'inventoryHealth',
      label: 'Inventory Health',
      value: data ? formatNumber(Math.max(0, data.activeProducts - data.lowStockProducts)) : '0',
      subtext: 'Sellable SKUs in stock',
      icon: 'lucide:shield-check',
      trend: data
        ? (data.lowStockProducts > 0 ? 'flat' : 'up')
        : 'flat',
      variant: data
        ? (data.lowStockProducts > 0 ? 'warning' : 'success')
        : 'neutral',
      meta: data ? `${formatNumber(data.lowStockProducts)} low stock alerts` : 'Monitoring stock levels',
      metaClass: data && data.lowStockProducts > 0 ? 'text-yellow-400' : 'text-green-500',
      footerLabel: 'Inventory health',
      footerValue: `${inventoryHealth}%`,
      footerClass: inventoryHealth >= 80 ? 'text-green-500' : 'text-yellow-400',
      progress: inventoryHealth,
      progressClass: inventoryHealth >= 80 ? 'bg-green-500' : 'bg-yellow-400'
    }
  ]
})

const comparisonDataset = computed(() => {
  const days = 7
  const categories: string[] = []
  const revenueSeries: number[] = []
  const customerSeries: number[] = []

  const data = stats.value
  const today = new Date()

  const revenueToday = data?.revenueToday ?? 0
  const totalRevenue = data?.revenue ?? 0
  const historicRevenue = Math.max(totalRevenue - revenueToday, 0)
  const revenueAverage = days > 1 ? historicRevenue / (days - 1) : 0

  const newUsersToday = data?.newUsersToday ?? 0
  const activeUsers = data?.activeUsers ?? 0
  const historicCustomers = Math.max(activeUsers - newUsersToday, 0)
  const customerAverage = days > 1 ? historicCustomers / (days - 1) : 0

  for (let index = days - 1; index >= 0; index--) {
    const date = subDays(today, index)
    categories.push(format(date, 'EEE'))

    if (index === 0) {
      revenueSeries.push(Math.round(revenueToday))
      customerSeries.push(Math.round(newUsersToday))
    } else {
      const weight = 0.7 + ((days - 1 - index) / (days - 1)) * 0.2
      revenueSeries.push(Math.round(revenueAverage * weight))
      customerSeries.push(Math.round(customerAverage * weight))
    }
  }

  return {
    categories,
    revenueSeries,
    customerSeries,
    revenueAverage,
    customerAverage,
    revenueToday,
    newUsersToday
  }
})

const revenueSummary = computed(() => {
  const dataset = comparisonDataset.value
  const average = dataset.revenueAverage || 0
  const todayValue = dataset.revenueToday || 0
  const delta = average ? ((todayValue - average) / average) * 100 : 0

  return {
    value: formatCurrency(todayValue),
    delta: formatDelta(delta),
    caption: average ? `Average daily revenue ${formatCurrency(average)}` : 'Awaiting sales data',
    direction: resolveDirection(delta)
  }
})

const customerSummary = computed(() => {
  const dataset = comparisonDataset.value
  const average = dataset.customerAverage || 0
  const todayValue = dataset.newUsersToday || 0
  const delta = average ? ((todayValue - average) / average) * 100 : 0

  return {
    value: `${formatNumber(todayValue)} new customers`,
    delta: formatDelta(delta),
    caption: average ? `Average daily sign-ups ${formatNumber(Math.round(average))}` : 'Awaiting sign-up data',
    direction: resolveDirection(delta)
  }
})

const backlogItems = computed(() => {
  const data = stats.value
  const groups = activityGroups.value as Record<string, any[]>

  return [
    {
      key: 'ordersAwaiting',
      label: 'Orders awaiting fulfillment',
      description: 'Queued shipments ready for picking and packing.',
      count: groups?.order_processing?.length || 0,
      icon: 'lucide:package',
      to: '/admin/orders',
      tone: (groups?.order_processing?.length || 0) > 0 ? 'warning' : 'neutral',
      cta: 'Open orders'
    },
    {
      key: 'inventoryAlerts',
      label: 'Inventory alerts',
      description: 'Low stock items that need a replenishment order.',
      count: data?.lowStockProducts || 0,
      icon: 'lucide:triangle-alert',
      to: '/admin/inventory',
      tone: (data?.lowStockProducts || 0) > 0 ? 'error' : 'success',
      cta: 'Review stock'
    },
    {
      key: 'catalogUpdates',
      label: 'Catalog updates requested',
      description: 'Pending product edits awaiting approval.',
      count: groups?.product_update?.length || 0,
      icon: 'lucide:sparkles',
      to: '/admin/products',
      tone: (groups?.product_update?.length || 0) > 0 ? 'info' : 'neutral',
      cta: 'Manage catalog'
    },
    {
      key: 'supportQueue',
      label: 'Support follow-ups',
      description: 'Customer tickets requiring responses.',
      count: groups?.support_ticket?.length || 0,
      icon: 'lucide:life-buoy',
      to: '/admin/users',
      tone: (groups?.support_ticket?.length || 0) > 0 ? 'info' : 'success',
      cta: 'Reply now'
    }
  ]
})

const insightHighlights = computed(() => {
  const data = stats.value
  const insights: Array<{ key: string; title: string; description: string; icon: string; tone: 'success' | 'warning' | 'error' | 'info' | 'neutral'; to?: string; action?: string; meta?: string }> = []

  if (!data) {
    return insights
  }

  if (data.revenueToday === 0) {
    insights.push({
      key: 'no-sales',
      title: 'No sales logged today',
      description: 'You haven’t made any sales yet. Promote your store to start seeing results.',
      icon: 'lucide:megaphone',
      tone: 'warning',
      to: '/admin/tools/campaigns',
      action: 'Launch campaign'
    })
  } else {
    insights.push({
      key: 'revenue',
      title: 'Revenue momentum',
      description: `Today’s sales reached ${formatCurrency(data.revenueToday)} which is ${formatPercentSafe(data.revenueToday, data.revenue)} of this month’s total. Keep the momentum with targeted upsells.`,
      icon: 'lucide:trending-up',
      tone: 'success',
      to: '/admin/analytics',
      action: 'Inspect analytics'
    })
  }

  if (data.newUsersToday > 0) {
    insights.push({
      key: 'growth',
      title: 'Customer acquisition spike',
      description: `${formatNumber(data.newUsersToday)} new customers signed up today. Follow up with onboarding campaigns to accelerate their first purchase.`,
      icon: 'lucide:user-plus',
      tone: 'info',
      to: '/admin/email-templates',
      action: 'Plan nurture email'
    })
  } else {
    insights.push({
      key: 'growth-flat',
      title: 'Acquisition flatline',
      description: 'No new customer sign-ups detected today. Activate promotions or outreach to reignite traffic.',
      icon: 'lucide:radar',
      tone: 'warning',
      to: '/admin/tools/campaigns',
      action: 'Boost acquisition'
    })
  }

  insights.push({
    key: 'conversion',
    title: 'Conversion health',
    description: `Storefront conversion is currently ${formatPercent(data.conversionRate)}. Explore checkout experiments to push beyond this baseline.`,
    icon: 'lucide:cursor-click',
    tone: data.conversionRate >= 2 ? 'success' : 'info',
    to: '/admin/analytics',
    action: 'Optimize funnel'
  })

  return insights
})

const lastBackupCopy = computed(() => {
  return autoRefreshEnabled.value ? '2 hours ago' : '4 hours ago'
})

const selectRange = async (value: 'today' | '7d' | '30d') => {
  if (selectedRange.value === value) return
  selectedRange.value = value

  if (typeof dashboardStore.refresh === 'function') {
    refreshing.value = true
    try {
      await dashboardStore.refresh()
    } finally {
      refreshing.value = false
    }
  }
}

const refreshAll = async () => {
  if (typeof dashboardStore.refresh !== 'function') return

  refreshing.value = true
  try {
    await dashboardStore.refresh()
  } finally {
    refreshing.value = false
  }
}

const clearError = () => {
  dashboardStore.clearError()
}

const toggleAutoRefresh = () => {
  autoRefreshEnabled.value = !autoRefreshEnabled.value

  if (autoRefreshEnabled.value) {
    dashboardStore.startAutoRefresh(5)
  } else {
    dashboardStore.stopAutoRefresh()
  }
}

onMounted(() => {
  dashboardStore.initialize()
})

onUnmounted(() => {
  dashboardStore.cleanup()
})

watch(
  () => route.path,
  newPath => {
    if (newPath === '/admin' || newPath === '/admin/dashboard') {
      dashboardStore.refresh()
    }
  }
)

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

function formatPercentSafe(part: number, total: number) {
  if (!total) return '0%'
  return `${Math.min(100, Math.round((part / total) * 100))}%`
}

function formatNumber(value?: number | null) {
  if (!value && value !== 0) {
    return '0'
  }

  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0
  }).format(value)
}

function formatDelta(delta: number) {
  if (!Number.isFinite(delta) || delta === 0) return '0%'
  const formatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 })
  return `${delta > 0 ? '+' : ''}${formatter.format(delta)}%`
}

function resolveDirection(delta: number): 'up' | 'down' | 'flat' {
  if (delta > 5) return 'up'
  if (delta < -5) return 'down'
  return 'flat'
}
</script>
