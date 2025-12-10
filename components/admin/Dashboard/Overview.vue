<template>
  <div class="space-y-8">
    <!-- Dashboard Header -->
    <AdminDashboardHeader
      :selected-range="selectedRange"
      :range-options="rangeOptions"
      :auto-refresh-enabled="autoRefreshEnabled"
      :refreshing="refreshing"
      :is-loading="isLoading"
      :time-since-refresh="timeSinceRefresh"
      :subtitle="headerSubtitle"
      :health-summary="healthSummary"
      @select-range="selectRange"
      @toggle-auto-refresh="toggleAutoRefresh"
      @refresh="refreshAll"
    />

    <!-- Error Alert -->
    <div
      v-if="error"
      class="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-600"
    >
      <div class="flex items-start gap-3">
        <commonIcon
          name="lucide:alert-triangle"
          class="h-5 w-5 text-red-500"
        />
        <div class="space-y-2">
          <p class="font-medium text-red-700">
            {{ $t('admin.dashboard.errors.loadingData') }}
          </p>
          <p>{{ error }}</p>
          <button
            type="button"
            class="text-sm font-medium text-red-600 underline hover:text-red-700"
            @click="clearError"
          >
            Dismiss alert
          </button>
        </div>
      </div>
    </div>

    <!-- Key Metrics Section -->
    <section class="space-y-4">
      <header class="flex items-center justify-between">
        <h2 class="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Key Metrics
        </h2>
        <p class="text-sm text-gray-400">
          Real-time KPIs and operational signals
        </p>
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
                ></div>
              </div>
            </div>
          </template>
        </AdminDashboardMetricCard>
      </div>
    </section>

    <!-- Stats Section -->
    <AdminDashboardStats />

    <!-- Performance Comparison Chart -->
    <AdminDashboardPerformanceComparisonChart
      :dataset="comparisonDataset"
      :revenue-summary="revenueSummary"
      :customer-summary="customerSummary"
    />

    <!-- Activity and Sidebar Grid -->
    <div class="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <div class="space-y-6 xl:col-span-2">
        <header class="flex items-center justify-between">
          <h2 class="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Recent Activity
          </h2>
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

        <AdminDashboardQuickActions
          :critical-alerts="criticalAlerts"
          :auto-refresh-enabled="autoRefreshEnabled"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAdminDashboardStore } from '~/stores/adminDashboard'
import { useDashboardMetrics } from '~/composables/useDashboardMetrics'
import { useDashboardCharts } from '~/composables/useDashboardCharts'
import { useDashboardInsights } from '~/composables/useDashboardInsights'
import { useDashboardRefresh } from '~/composables/useDashboardRefresh'
import { formatCurrency, formatNumber, formatPercent } from '~/utils/formatters'

// Initialize store with fallback for SSR
let dashboardStore: ReturnType<typeof useAdminDashboardStore> | null = null

try {
  dashboardStore = useAdminDashboardStore()
}
catch (error) {
  console.warn('Admin dashboard store not available during SSR/hydration')
}

// Create fallback store if needed
const store = dashboardStore ?? {
  stats: null,
  recentActivity: [],
  isLoading: false,
  statsLoading: false,
  activityLoading: false,
  error: null,
  criticalAlerts: [],
  activitiesByType: {},
  timeSinceRefresh: 'Never',
  setStats: () => {},
  setActivity: () => {},
  setError: () => {},
  setLoading: () => {},
  setStatsLoading: () => {},
  setActivityLoading: () => {},
  clearError: () => {},
  clearData: () => {},
  updateStat: () => {},
  addActivity: () => {},
}

// Range options for date filtering
const rangeOptions = [
  { label: 'Today', value: 'today' as const },
  { label: 'Last 7 days', value: '7d' as const },
  { label: 'Last 30 days', value: '30d' as const },
]
const selectedRange = ref<'today' | '7d' | '30d'>('today')
const route = useRoute()

// Store-derived state
const stats = computed(() => store.stats)
const isLoading = computed(() => store.isLoading)
const error = computed(() => store.error)
const criticalAlerts = computed(() => store.criticalAlerts || [])
const timeSinceRefresh = computed(() => store.timeSinceRefresh || 'Never')
const activityGroups = computed(() => store.activitiesByType || {})

// Initialize composables
const { highlightCards, inventoryHealth } = useDashboardMetrics(stats)
const { comparisonDataset, revenueSummary, customerSummary } = useDashboardCharts(stats)
const { backlogItems, insightHighlights } = useDashboardInsights(stats, activityGroups)

// Get Supabase client in setup context
const supabase = useSupabaseClient()

const {
  refreshing,
  autoRefreshEnabled,
  fetchDashboardData,
  toggleAutoRefresh,
  refreshAll,
  initAutoRefresh,
  cleanupAutoRefresh,
} = useDashboardRefresh(supabase, store)

// Header subtitle
const headerSubtitle = computed(() => {
  if (!stats.value) {
    return 'Monitor revenue, customer growth, and fulfillment performance in real time.'
  }
  return `Tracking ${formatNumber(stats.value.totalOrders)} lifetime orders and ${formatCurrency(stats.value.revenue)} in revenue.`
})

// Health summary
const healthSummary = computed(() => {
  if (!stats.value) {
    return 'Awaiting fresh metrics…'
  }
  return `Inventory health ${inventoryHealth.value}% · Conversion rate ${formatPercent(stats.value.conversionRate)}`
})

// Range selection handler
const selectRange = async (value: 'today' | '7d' | '30d') => {
  if (selectedRange.value === value) return
  selectedRange.value = value
  await refreshAll()
}

// Clear error handler
const clearError = () => {
  store.clearError()
}

// Lifecycle hooks
onMounted(() => {
  fetchDashboardData()
  initAutoRefresh()
})

onUnmounted(() => {
  cleanupAutoRefresh()
})

// Route watcher for refreshing data
watch(
  () => route.path,
  (newPath) => {
    if (newPath === '/admin' || newPath === '/admin/dashboard') {
      fetchDashboardData()
    }
  },
)
</script>
