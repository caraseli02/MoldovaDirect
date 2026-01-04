import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import DashboardHeader from '~/components/admin/Dashboard/Header.vue'

vi.mock('#imports', () => ({
  useI18n: vi.fn(() => ({ t: (k: string) => k })),
}))

describe('Admin Dashboard Header', () => {
  const mockProps = {
    selectedRange: '7d' as const,
    rangeOptions: [
      { label: 'Today', value: 'today' as const },
      { label: 'Last 7 Days', value: '7d' as const },
      { label: 'Last 30 Days', value: '30d' as const },
    ],
    autoRefreshEnabled: false,
    refreshing: false,
    isLoading: false,
    timeSinceRefresh: '5 min ago',
    subtitle: 'Welcome back',
    healthSummary: 'All systems operational',
  }

  it('should render dashboard header', () => {
    const wrapper = mount(DashboardHeader, { props: mockProps })
    expect(wrapper.exists()).toBe(true)
  })

  it('should display range options', () => {
    const wrapper = mount(DashboardHeader, { props: mockProps })
    expect(wrapper.text()).toContain('Today')
    expect(wrapper.text()).toContain('Last 7 Days')
    expect(wrapper.text()).toContain('Last 30 Days')
  })

  it('should emit select-range when option clicked', async () => {
    const wrapper = mount(DashboardHeader, { props: mockProps })
    const buttons = wrapper.findAll('button')
    await buttons[0].trigger('click')
    expect(wrapper.emitted('select-range')).toBeTruthy()
  })

  it('should show auto-refresh toggle', () => {
    const wrapper = mount(DashboardHeader, { props: mockProps })
    expect(wrapper.text()).toContain('admin.dashboard.autoRefresh')
  })

  it('should emit toggle-auto-refresh when toggled', async () => {
    const wrapper = mount(DashboardHeader, { props: mockProps })
    const toggle = wrapper.findAll('button')[3]
    await toggle.trigger('click')
    expect(wrapper.emitted('toggle-auto-refresh')).toBeTruthy()
  })

  it('should display time since refresh', () => {
    const wrapper = mount(DashboardHeader, { props: mockProps })
    expect(wrapper.text()).toContain('5 min ago')
  })

  it('should show health summary', () => {
    const wrapper = mount(DashboardHeader, { props: mockProps })
    expect(wrapper.text()).toContain('All systems operational')
  })
})
