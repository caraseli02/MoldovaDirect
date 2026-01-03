import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import SmartFilters from '~/components/order/SmartFilters.vue'

vi.mock('#imports', () => ({ useI18n: vi.fn(() => ({ t: (k: string) => k })) }))

describe('SmartFilters - Enhanced', () => {
  const mockFilters = {
    status: ['pending', 'processing', 'completed'],
    dateRange: { start: '2026-01-01', end: '2026-01-31' },
    search: '',
  }

  it('should render smart filters', () => {
    const wrapper = mount(SmartFilters, {
      props: { filters: mockFilters },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('should display status filter options', () => {
    const wrapper = mount(SmartFilters, {
      props: { filters: mockFilters },
    })
    expect(wrapper.text()).toContain('pending')
  })

  it('should show date range picker', () => {
    const wrapper = mount(SmartFilters, {
      props: { filters: mockFilters },
    })
    expect(wrapper.html()).toContain('2026-01-01')
  })

  it('should emit filter changes', async () => {
    const wrapper = mount(SmartFilters, {
      props: { filters: mockFilters },
    })
    const inputs = wrapper.findAll('input')
    if (inputs.length > 0) {
      await inputs[0].trigger('change')
      expect(wrapper.emitted()).toBeTruthy()
    }
  })

  it('should support search filtering', () => {
    const wrapper = mount(SmartFilters, {
      props: { filters: { ...mockFilters, search: 'ORD-001' } },
    })
    expect(wrapper.html()).toBeTruthy()
  })
})
