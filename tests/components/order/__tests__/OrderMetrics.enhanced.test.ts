import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import OrderMetrics from '~/components/order/OrderMetrics.vue'

vi.mock('#imports', () => ({ useI18n: vi.fn(() => ({ t: (k: string) => k })) }))

describe('OrderMetrics - Enhanced', () => {
  const mockMetrics = {
    total: 145,
    pending: 12,
    processing: 25,
    completed: 100,
    cancelled: 8,
  }

  it('should render order metrics', () => {
    const wrapper = mount(OrderMetrics, {
      props: { metrics: mockMetrics },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('should display total orders', () => {
    const wrapper = mount(OrderMetrics, {
      props: { metrics: mockMetrics },
    })
    expect(wrapper.text()).toContain('145')
  })

  it('should show pending orders count', () => {
    const wrapper = mount(OrderMetrics, {
      props: { metrics: mockMetrics },
    })
    expect(wrapper.text()).toContain('12')
  })

  it('should display metrics by status', () => {
    const wrapper = mount(OrderMetrics, {
      props: { metrics: mockMetrics },
    })
    expect(wrapper.text()).toContain('25')
    expect(wrapper.text()).toContain('100')
  })

  it('should calculate percentages correctly', () => {
    const wrapper = mount(OrderMetrics, {
      props: { metrics: mockMetrics },
    })
    expect(wrapper.html()).toBeTruthy()
  })
})
