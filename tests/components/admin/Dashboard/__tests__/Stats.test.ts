import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Stats from '~/components/admin/Dashboard/Stats.vue'

vi.mock('#imports', () => ({
  useI18n: vi.fn(() => ({
    t: (k: string) => {
      if (k === 'admin.dashboard.refresh') return 'Refresh'
      if (k === 'admin.dashboard.stats.sectionTitle') return 'Operational Snapshot'
      return k
    },
  })),
}))

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

describe('Admin Dashboard Stats', () => {
  it('should render stats section', () => {
    const wrapper = mount(Stats)
    expect(wrapper.exists()).toBe(true)
  })

  it('should display section title', () => {
    const wrapper = mount(Stats)
    expect(wrapper.text()).toContain('Operational Snapshot')
  })

  it('should show refresh button', () => {
    const wrapper = mount(Stats)
    const refreshButton = wrapper.find('button')
    expect(refreshButton.exists()).toBe(true)
    expect(refreshButton.text()).toContain('Refresh')
  })

  it('should emit refresh event when button clicked', async () => {
    const wrapper = mount(Stats)
    const refreshButton = wrapper.find('button')
    await refreshButton.trigger('click')
    expect(wrapper.emitted('refresh')).toBeTruthy()
  })

  it('should display metric cards', () => {
    const wrapper = mount(Stats)
    expect(wrapper.text()).toContain('Catalog Health')
    expect(wrapper.text()).toContain('Customer Growth')
    expect(wrapper.text()).toContain('Orders Pipeline')
    expect(wrapper.text()).toContain('Revenue Velocity')
  })

  it('should show last updated time', () => {
    const wrapper = mount(Stats)
    expect(wrapper.text()).toContain('5 min ago')
  })
})
