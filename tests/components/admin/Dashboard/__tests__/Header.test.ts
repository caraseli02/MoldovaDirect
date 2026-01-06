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

  it('should emit select-range with correct value when Today clicked', async () => {
    const wrapper = mount(DashboardHeader, { props: mockProps })
    const buttons = wrapper.findAll('button')
    // First button is "Today"
    await buttons[0].trigger('click')
    const emitted = wrapper.emitted('select-range')
    expect(emitted).toBeTruthy()
    expect(emitted![0]).toEqual(['today'])
  })

  it('should emit select-range with correct value when Last 7 Days clicked', async () => {
    const wrapper = mount(DashboardHeader, { props: mockProps })
    const buttons = wrapper.findAll('button')
    // Second button is "Last 7 Days"
    await buttons[1].trigger('click')
    const emitted = wrapper.emitted('select-range')
    expect(emitted).toBeTruthy()
    expect(emitted![0]).toEqual(['7d'])
  })

  it('should emit select-range with correct value when Last 30 Days clicked', async () => {
    const wrapper = mount(DashboardHeader, { props: mockProps })
    const buttons = wrapper.findAll('button')
    // Third button is "Last 30 Days"
    await buttons[2].trigger('click')
    const emitted = wrapper.emitted('select-range')
    expect(emitted).toBeTruthy()
    expect(emitted![0]).toEqual(['30d'])
  })

  it('should show auto-refresh toggle', () => {
    const wrapper = mount(DashboardHeader, { props: mockProps })
    expect(wrapper.text()).toContain('admin.dashboard.autoRefresh')
  })

  it('should emit toggle-auto-refresh with no payload when toggled', async () => {
    const wrapper = mount(DashboardHeader, { props: mockProps })
    const toggle = wrapper.findAll('button')[3]
    await toggle.trigger('click')
    const emitted = wrapper.emitted('toggle-auto-refresh')
    expect(emitted).toBeTruthy()
    expect(emitted!.length).toBe(1)
    expect(emitted![0]).toEqual([])
  })

  it('should emit refresh event when refresh button clicked', async () => {
    const wrapper = mount(DashboardHeader, { props: mockProps })
    const buttons = wrapper.findAll('button')
    // Refresh button is the last one (index 4)
    const refreshButton = buttons[4]
    await refreshButton.trigger('click')
    const emitted = wrapper.emitted('refresh')
    expect(emitted).toBeTruthy()
    expect(emitted![0]).toEqual([])
  })

  it('should display time since refresh', () => {
    const wrapper = mount(DashboardHeader, { props: mockProps })
    expect(wrapper.text()).toContain('5 min ago')
  })

  it('should show health summary', () => {
    const wrapper = mount(DashboardHeader, { props: mockProps })
    expect(wrapper.text()).toContain('All systems operational')
  })

  // Computed property tests for rangeLabel
  describe('rangeLabel computed property', () => {
    it('should display selected range label in badge when Today selected', () => {
      const wrapper = mount(DashboardHeader, {
        props: { ...mockProps, selectedRange: 'today' as const },
      })
      const badge = wrapper.find('.bg-gray-100')
      expect(badge.exists()).toBe(true)
      expect(badge.text()).toBe('Today')
    })

    it('should display selected range label in badge when 7d selected', () => {
      const wrapper = mount(DashboardHeader, {
        props: { ...mockProps, selectedRange: '7d' as const },
      })
      const badge = wrapper.find('.bg-gray-100')
      expect(badge.exists()).toBe(true)
      expect(badge.text()).toBe('Last 7 Days')
    })

    it('should display selected range label in badge when 30d selected', () => {
      const wrapper = mount(DashboardHeader, {
        props: { ...mockProps, selectedRange: '30d' as const },
      })
      const badge = wrapper.find('.bg-gray-100')
      expect(badge.exists()).toBe(true)
      expect(badge.text()).toBe('Last 30 Days')
    })

    it('should fallback to Today when range option not found', () => {
      const wrapper = mount(DashboardHeader, {
        props: {
          ...mockProps,
          selectedRange: 'today' as const,
          rangeOptions: [], // Empty options to test fallback
        },
      })
      const badge = wrapper.find('.bg-gray-100')
      expect(badge.exists()).toBe(true)
      expect(badge.text()).toBe('Today')
    })
  })

  // Visual state tests
  describe('visual states', () => {
    it('should highlight selected range button', () => {
      const wrapper = mount(DashboardHeader, {
        props: { ...mockProps, selectedRange: '7d' as const },
      })
      const buttons = wrapper.findAll('button')
      // Second button (7d) should have selected styles
      expect(buttons[1].classes()).toContain('border-blue-500')
      expect(buttons[1].classes()).toContain('bg-blue-50')
      expect(buttons[1].classes()).toContain('text-blue-600')
    })

    it('should show auto-refresh active status when enabled', () => {
      const wrapper = mount(DashboardHeader, {
        props: { ...mockProps, autoRefreshEnabled: true },
      })
      expect(wrapper.text()).toContain('Auto-refresh active every 5 minutes')
      expect(wrapper.find('.bg-green-500').exists()).toBe(true)
    })

    it('should show auto-refresh paused status when disabled', () => {
      const wrapper = mount(DashboardHeader, {
        props: { ...mockProps, autoRefreshEnabled: false },
      })
      expect(wrapper.text()).toContain('Auto-refresh paused')
      expect(wrapper.find('.bg-gray-300').exists()).toBe(true)
    })

    it('should disable refresh button when refreshing', () => {
      const wrapper = mount(DashboardHeader, {
        props: { ...mockProps, refreshing: true },
      })
      const buttons = wrapper.findAll('button')
      const refreshButton = buttons[4]
      expect(refreshButton.attributes('disabled')).toBeDefined()
    })

    it('should disable refresh button when loading', () => {
      const wrapper = mount(DashboardHeader, {
        props: { ...mockProps, isLoading: true },
      })
      const buttons = wrapper.findAll('button')
      const refreshButton = buttons[4]
      expect(refreshButton.attributes('disabled')).toBeDefined()
    })
  })
})
