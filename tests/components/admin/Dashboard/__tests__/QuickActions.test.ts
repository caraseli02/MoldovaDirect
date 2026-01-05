import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import QuickActions from '~/components/admin/Dashboard/QuickActions.vue'

vi.mock('#imports', () => ({
  useI18n: vi.fn(() => ({
    t: (k: string) => k,
  })),
}))

describe('Admin Dashboard QuickActions', () => {
  const mockProps = {
    criticalAlerts: [],
    autoRefreshEnabled: true,
  }

  it('should render quick actions section', () => {
    const wrapper = mount(QuickActions, {
      props: mockProps,
    })
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.text()).toContain('Execution Center')
  })

  it('should display quick action links', () => {
    const wrapper = mount(QuickActions, {
      props: mockProps,
    })
    expect(wrapper.html()).toContain('/admin/products/new')
    expect(wrapper.html()).toContain('/admin/orders')
    expect(wrapper.html()).toContain('/admin/users')
  })

  it('should show system status indicators', () => {
    const wrapper = mount(QuickActions, {
      props: mockProps,
    })
    expect(wrapper.text()).toContain('Database')
    expect(wrapper.text()).toContain('Operational')
    expect(wrapper.text()).toContain('All systems nominal')
  })

  it('should display last backup time', () => {
    const wrapper = mount(QuickActions, {
      props: mockProps,
    })
    expect(wrapper.text()).toContain('Last backup')
    expect(wrapper.text()).toContain('2 hours ago')
  })

  it('should show critical alerts when present', () => {
    const alertsProps = {
      criticalAlerts: [
        {
          id: 'alert-1',
          title: 'Low Stock Warning',
          description: '5 products below threshold',
        },
      ],
      autoRefreshEnabled: true,
    }
    const wrapper = mount(QuickActions, {
      props: alertsProps,
    })
    expect(wrapper.text()).toContain('Critical alerts')
    expect(wrapper.text()).toContain('Low Stock Warning')
    expect(wrapper.text()).toContain('5 products below threshold')
  })

  it('should hide alerts section when no alerts', () => {
    const wrapper = mount(QuickActions, {
      props: mockProps,
    })
    const alertSection = wrapper.find('.border-red-200')
    expect(alertSection.exists()).toBe(false)
  })
})
