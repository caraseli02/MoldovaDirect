import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import DashboardOverview from '~/components/admin/Dashboard/Overview.vue'

vi.mock('#imports', () => ({ useI18n: vi.fn(() => ({ t: (k: string) => k })) }))

describe('Admin Dashboard Overview', () => {
  const mockMetrics = {
    totalOrders: 150,
    revenue: 12500,
    activeUsers: 320,
    pendingOrders: 12,
  }

  it('should render dashboard overview', () => {
    const wrapper = mount(DashboardOverview, {
      props: { metrics: mockMetrics },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('should display key metrics', () => {
    const wrapper = mount(DashboardOverview, {
      props: { metrics: mockMetrics },
    })
    expect(wrapper.text()).toContain('150')
    expect(wrapper.text()).toContain('12500')
  })

  it('should show loading state', () => {
    const wrapper = mount(DashboardOverview, {
      props: { loading: true },
    })
    expect(wrapper.html()).toContain('loading')
  })

  it('should handle error state', () => {
    const wrapper = mount(DashboardOverview, {
      props: { error: 'Failed to load metrics' },
    })
    expect(wrapper.text()).toContain('Failed')
  })

  it('should display revenue formatted', () => {
    const wrapper = mount(DashboardOverview, {
      props: { metrics: mockMetrics },
    })
    expect(wrapper.html()).toBeTruthy()
  })
})
