<template>
  <section class="space-y-6">
    <header class="flex items-center justify-between">
      <h2 class="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {{ statsSectionTitle }}
      </h2>
      <button
        @click="refresh"
        :disabled="isLoading"
        class="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 hover:text-gray-900 disabled:opacity-50"
      >
        <commonIcon
          name="heroicons:arrow-path"
          :class="['h-4 w-4', isLoading ? 'animate-spin text-blue-500' : 'text-gray-400']"
        />
        <span>{{ t('admin.dashboard.refresh') }}</span>
      </button>
    </header>

    <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <AdminDashboardMetricCard
        v-for="card in cards"
        :key="card.key"
        :label="card.label"
        :value="card.value"
        :subtext="card.subtext"
        :icon="card.icon"
        :trend="card.trend"
        :variant="card.variant"
      >
        <template #meta>
          <span :class="['text-sm font-medium', card.metaClass]">
            {{ card.meta }}
          </span>
        </template>
        <template #footer>
          <div class="text-xs text-gray-400">
            {{ card.footer }}
          </div>
        </template>
      </AdminDashboardMetricCard>
    </div>

    <footer class="flex flex-col gap-2 text-sm text-gray-400 md:flex-row md:items-center md:justify-between">
      <div class="flex items-center gap-2">
        <commonIcon name="heroicons:clock" class="h-4 w-4 text-blue-500" />
        <span>{{ t('admin.dashboard.lastUpdated', { time: timeSinceRefresh }) }}</span>
      </div>
      <p class="text-xs text-gray-400">
        {{ refreshHint }}
      </p>
    </footer>
  </section>
</template>

<script setup lang="ts">
import { useAdminDashboardStore } from '~/stores/adminDashboard'

interface MetricCardViewModel {
  key: string
  label: string
  value: string
  subtext: string
  icon: string
  trend: 'up' | 'down' | 'flat'
  variant: 'success' | 'warning' | 'error' | 'neutral' | 'info'
  meta: string
  metaClass: string
  footer: string
}

const { t } = useI18n()

let dashboardStore: any = null

try {
  dashboardStore = useAdminDashboardStore()
} catch (error) {
  console.warn('Admin dashboard store not available during SSR/hydration')
}

if (!dashboardStore) {
  dashboardStore = {
    stats: null,
    isLoading: false,
    formattedRevenue: '€0.00',
    formattedRevenueToday: '€0.00',
    formattedConversionRate: '0%',
    timeSinceRefresh: 'Never',
    refresh: () => Promise.resolve(),
    fetchStats: () => Promise.resolve()
  }
}

const stats = computed(() => dashboardStore.stats)
const isLoading = computed(() => dashboardStore.isLoading)
const timeSinceRefresh = computed(() => dashboardStore.timeSinceRefresh)
const statsSectionTitle = computed(() => {
  const translation = t('admin.dashboard.stats.sectionTitle')
  return translation === 'admin.dashboard.stats.sectionTitle' ? 'Operational Snapshot' : translation
})
const refreshHint = computed(() => {
  const translation = t('admin.dashboard.stats.refreshHint')
  return translation === 'admin.dashboard.stats.refreshHint'
    ? 'Metrics refresh automatically every five minutes.'
    : translation
})

const cards = computed<MetricCardViewModel[]>(() => {
  const data = stats.value

  const totalProducts = data?.totalProducts ?? 0
  const activeProducts = data?.activeProducts ?? 0
  const lowStockProducts = data?.lowStockProducts ?? 0
  const totalUsers = data?.totalUsers ?? 0
  const activeUsers = data?.activeUsers ?? 0
  const newUsersToday = data?.newUsersToday ?? 0
  const totalOrders = data?.totalOrders ?? 0
  const conversionRate = data?.conversionRate ?? 0
  const revenue = data?.revenue ?? 0
  const revenueToday = data?.revenueToday ?? 0

  return [
    {
      key: 'catalog',
      label: 'Catalog Health',
      value: formatNumber(totalProducts),
      subtext: `${formatNumber(activeProducts)} active listings · ${formatNumber(lowStockProducts)} low stock`,
      icon: 'lucide:boxes',
      trend: lowStockProducts > 0 ? 'down' : 'up',
      variant: lowStockProducts > 0 ? 'warning' : 'success',
      meta: lowStockProducts > 0 ? `${formatNumber(lowStockProducts)} SKUs flagged` : 'Fully stocked',
      metaClass: lowStockProducts > 0 ? 'text-yellow-400' : 'text-green-500',
      footer: lowStockProducts > 0
        ? 'Prioritize replenishment for flagged items.'
        : 'All stocked items above safety thresholds.'
    },
    {
      key: 'customers',
      label: 'Customer Growth',
      value: formatNumber(totalUsers),
      subtext: `${formatNumber(activeUsers)} active · ${formatNumber(newUsersToday)} joined today`,
      icon: 'lucide:users',
      trend: newUsersToday > 0 ? 'up' : 'flat',
      variant: newUsersToday > 0 ? 'info' : 'neutral',
      meta: newUsersToday > 0
        ? `${formatNumber(newUsersToday)} new registrations`
        : 'No new sign-ups',
      metaClass: newUsersToday > 0 ? 'text-blue-500' : 'text-gray-400',
      footer: newUsersToday > 0
        ? 'Keep momentum with onboarding journeys.'
        : 'Run a campaign to spark acquisition.'
    },
    {
      key: 'orders',
      label: 'Orders Pipeline',
      value: formatNumber(totalOrders),
      subtext: `${formatPercent(conversionRate)} conversion rate`,
      icon: 'lucide:shopping-cart',
      trend: conversionRate >= 2 ? 'up' : conversionRate > 0 ? 'flat' : 'down',
      variant: conversionRate >= 2 ? 'success' : conversionRate > 0 ? 'info' : 'warning',
      meta: conversionRate > 0
        ? `${formatPercent(conversionRate)} store conversion`
        : 'Conversion data pending',
      metaClass: conversionRate >= 2 ? 'text-green-500' : conversionRate > 0 ? 'text-blue-500' : 'text-yellow-400',
      footer: 'Review checkout steps to lift conversion.'
    },
    {
      key: 'revenue',
      label: 'Revenue Velocity',
      value: formatCurrency(revenue),
      subtext: `${formatCurrency(revenueToday)} booked today`,
      icon: 'lucide:bar-chart-2',
      trend: revenueToday > 0 ? 'up' : 'flat',
      variant: revenueToday > 0 ? 'success' : 'neutral',
      meta: revenueToday > 0
        ? `${formatPercentSafe(revenueToday, revenue)} of monthly`
        : 'Awaiting new sales',
      metaClass: revenueToday > 0 ? 'text-green-500' : 'text-gray-400',
      footer: revenueToday > 0
        ? 'Momentum is trending positive today.'
        : 'No sales logged yet — promote campaigns.'
    }
  ]
})

const refresh = () => {
  dashboardStore.refresh()
}

onMounted(() => {
  if (!stats.value) {
    dashboardStore.fetchStats()
  }
})

function formatNumber(value?: number | null) {
  if (!value && value !== 0) {
    return '0'
  }

  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0
  }).format(value)
}

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
</script>
