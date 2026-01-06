import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Stats from '~/components/admin/Dashboard/Stats.vue'

// Mock the dashboard store
vi.mock('~/stores/adminDashboard', () => ({
  useAdminDashboardStore: vi.fn(() => ({
    stats: {
      totalProducts: 150,
      activeProducts: 140,
      lowStockProducts: 5,
      totalUsers: 1200,
      activeUsers: 850,
      newUsersToday: 12,
      totalOrders: 320,
      conversionRate: 2.5,
      revenue: 45000,
      revenueToday: 1200,
    },
    isLoading: false,
    timeSinceRefresh: '5 min ago',
  })),
}))

// i18n plugin that returns keys
const mockI18n = {
  install(app: any) {
    app.config.globalProperties.$t = (key: string) => key
  },
}

describe('Admin Dashboard Stats', () => {
  const mountOptions = {
    global: {
      plugins: [mockI18n],
      stubs: {
        commonIcon: { template: '<span class="icon-stub"></span>' },
        AdminDashboardMetricCard: {
          template: `<div class="metric-card-stub">
            <span>{{ label }}</span>
            <slot name="meta"></slot>
            <slot name="footer"></slot>
          </div>`,
          props: ['label', 'value', 'subtext', 'icon', 'trend', 'variant'],
        },
      },
    },
  }

  it('should render stats section', () => {
    const wrapper = mount(Stats, mountOptions)
    expect(wrapper.exists()).toBe(true)
  })

  it('should display section title', () => {
    const wrapper = mount(Stats, mountOptions)
    // The component has fallback logic for translated section title
    expect(wrapper.text()).toContain('Operational Snapshot')
  })

  it('should show refresh button with i18n key', () => {
    const wrapper = mount(Stats, mountOptions)
    const refreshButton = wrapper.find('button')
    expect(refreshButton.exists()).toBe(true)
    expect(refreshButton.text()).toContain('admin.dashboard.refresh')
  })

  it('should emit refresh event when button clicked', async () => {
    const wrapper = mount(Stats, mountOptions)
    const refreshButton = wrapper.find('button')
    await refreshButton.trigger('click')
    expect(wrapper.emitted('refresh')).toBeTruthy()
  })

  it('should display metric cards', () => {
    const wrapper = mount(Stats, mountOptions)
    const metricCards = wrapper.findAll('.metric-card-stub')
    expect(metricCards.length).toBe(4)
    expect(wrapper.text()).toContain('Catalog Health')
    expect(wrapper.text()).toContain('Customer Growth')
    expect(wrapper.text()).toContain('Orders Pipeline')
    expect(wrapper.text()).toContain('Revenue Velocity')
  })

  it('should show last updated time i18n key', () => {
    const wrapper = mount(Stats, mountOptions)
    // The mock returns the i18n key, not the interpolated value
    expect(wrapper.text()).toContain('admin.dashboard.lastUpdated')
  })
})
