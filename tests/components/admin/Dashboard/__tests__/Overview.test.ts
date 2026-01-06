import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import DashboardOverview from '~/components/admin/Dashboard/Overview.vue'

// Mock the store
const mockStore = {
  stats: ref({
    totalOrders: 150,
    revenue: 12500,
    activeUsers: 320,
    pendingOrders: 12,
    conversionRate: 3.5,
  }),
  recentActivity: ref([]),
  isLoading: ref(false),
  error: ref(null as string | null),
  criticalAlerts: ref([]),
  activitiesByType: ref({}),
  timeSinceRefresh: ref('Just now'),
  clearError: vi.fn(),
}

vi.mock('~/stores/adminDashboard', () => ({
  useAdminDashboardStore: vi.fn(() => mockStore),
}))

// Mock composables
vi.mock('~/composables/useDashboardMetrics', () => ({
  useDashboardMetrics: vi.fn(() => ({
    highlightCards: ref([]),
    inventoryHealth: ref(85),
  })),
}))

vi.mock('~/composables/useDashboardCharts', () => ({
  useDashboardCharts: vi.fn(() => ({
    comparisonDataset: ref([]),
    revenueSummary: ref({}),
    customerSummary: ref({}),
  })),
}))

vi.mock('~/composables/useDashboardInsights', () => ({
  useDashboardInsights: vi.fn(() => ({
    backlogItems: ref([]),
    insightHighlights: ref([]),
  })),
}))

vi.mock('~/composables/useDashboardRefresh', () => ({
  useDashboardRefresh: vi.fn(() => ({
    refreshing: ref(false),
    autoRefreshEnabled: ref(true),
    fetchDashboardData: vi.fn(),
    toggleAutoRefresh: vi.fn(),
    refreshAll: vi.fn(),
    initAutoRefresh: vi.fn(),
    cleanupAutoRefresh: vi.fn(),
  })),
}))

vi.mock('~/utils/formatters', () => ({
  formatCurrency: vi.fn(val => val !== null && val !== undefined ? `$${val}` : '$0'),
  formatNumber: vi.fn(val => val !== null && val !== undefined ? val.toString() : '0'),
  formatPercent: vi.fn(val => val !== null && val !== undefined ? `${val}%` : '0%'),
}))

vi.mock('#imports', () => ({
  useI18n: vi.fn(() => ({ t: (k: string) => k })),
  useSupabaseClient: vi.fn(() => ({})),
  useRoute: vi.fn(() => ({ path: '/admin' })),
  ref,
  computed,
  onMounted,
  onUnmounted,
  watch,
}))

describe('Admin Dashboard Overview', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockStore.stats.value = {
      totalOrders: 150,
      revenue: 12500,
      activeUsers: 320,
      pendingOrders: 12,
      conversionRate: 3.5,
    }
    mockStore.isLoading.value = false
    mockStore.error.value = null
  })

  const mountComponent = () => {
    return mount(DashboardOverview, {
      global: {
        stubs: {
          AdminDashboardHeader: {
            template: '<div data-testid="dashboard-header"><slot /></div>',
            props: ['selectedRange', 'rangeOptions', 'autoRefreshEnabled', 'refreshing', 'isLoading', 'timeSinceRefresh', 'subtitle', 'healthSummary'],
          },
          AdminDashboardMetricCard: {
            template: '<div class="metric-card"><slot /><slot name="meta" /><slot name="footer" /></div>',
            props: ['label', 'value', 'subtext', 'icon', 'trend', 'variant'],
          },
          AdminDashboardStats: {
            template: '<div data-testid="stats-section">Stats</div>',
          },
          AdminDashboardPerformanceComparisonChart: {
            template: '<div data-testid="chart">Chart</div>',
            props: ['dataset', 'revenueSummary', 'customerSummary'],
          },
          AdminUtilsRecentActivity: {
            template: '<div data-testid="activity">Activity</div>',
          },
          AdminDashboardOperationalBacklog: {
            template: '<div data-testid="backlog">Backlog</div>',
            props: ['items', 'loading'],
          },
          AdminDashboardInsightHighlights: {
            template: '<div data-testid="insights">Insights</div>',
            props: ['insights'],
          },
          AdminDashboardQuickActions: {
            template: '<div data-testid="quick-actions">Quick Actions</div>',
            props: ['criticalAlerts', 'autoRefreshEnabled'],
          },
          commonIcon: {
            template: '<span class="icon" data-testid="icon"></span>',
            props: ['name'],
          },
        },
      },
    })
  }

  it('should render dashboard overview', () => {
    const wrapper = mountComponent()
    expect(wrapper.exists()).toBe(true)
  })

  it('should display key metrics section', () => {
    const wrapper = mountComponent()
    expect(wrapper.text()).toContain('Key Metrics')
  })

  it('should show recent activity section', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('[data-testid="activity"]').exists()).toBe(true)
  })

  it('should handle error state', () => {
    mockStore.error.value = 'Failed to load metrics'
    const wrapper = mountComponent()
    expect(wrapper.text()).toContain('admin.dashboard.errors.loadingData')
  })

  it('should display dashboard header', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('[data-testid="dashboard-header"]').exists()).toBe(true)
  })
})
