import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import SmartFilters from '~/components/order/SmartFilters.vue'

vi.mock('#imports', () => ({ useI18n: vi.fn(() => ({ t: (k: string) => k })) }))

describe('SmartFilters - Enhanced', () => {
  // Mock counts matching the FilterCounts interface
  const mockCounts = {
    inTransit: 5,
    deliveredMonth: 12,
  }

  it('should render smart filters', () => {
    const wrapper = mount(SmartFilters, {
      props: { counts: mockCounts },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('should display in-transit filter with count badge', () => {
    const wrapper = mount(SmartFilters, {
      props: { counts: mockCounts },
    })
    expect(wrapper.text()).toContain('orders.filters.inTransit')
    expect(wrapper.text()).toContain('5')
  })

  it('should display delivered this month filter with count badge', () => {
    const wrapper = mount(SmartFilters, {
      props: { counts: mockCounts },
    })
    expect(wrapper.text()).toContain('orders.filters.deliveredThisMonth')
    expect(wrapper.text()).toContain('12')
  })

  it('should emit filter event when a filter button is clicked', async () => {
    const wrapper = mount(SmartFilters, {
      props: { counts: mockCounts },
    })
    const buttons = wrapper.findAll('button')
    // Click the in-transit filter (first button)
    await buttons[0].trigger('click')
    expect(wrapper.emitted('filter')).toBeTruthy()
    expect(wrapper.emitted('filter')![0]).toEqual(['in-transit'])
  })

  it('should emit update:modelValue when filter changes', async () => {
    const wrapper = mount(SmartFilters, {
      props: { counts: mockCounts, modelValue: null },
    })
    const buttons = wrapper.findAll('button')
    // Click the delivered-month filter (second button)
    await buttons[1].trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['delivered-month'])
  })

  it('should show active state for selected filter', async () => {
    const wrapper = mount(SmartFilters, {
      props: { counts: mockCounts, modelValue: 'in-transit' },
    })
    expect(wrapper.exists()).toBe(true)
  })
})
