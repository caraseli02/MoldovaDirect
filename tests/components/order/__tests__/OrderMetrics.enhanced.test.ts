import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import OrderMetrics from '~/components/order/OrderMetrics.vue'

vi.mock('#imports', () => ({ useI18n: vi.fn(() => ({ t: (k: string) => k, locale: { value: 'en' } })) }))

describe('OrderMetrics - Enhanced', () => {
  // Mock metrics matching the OrderMetrics interface (activeOrders, deliveredThisMonth, totalOrders, totalSpentThisMonth)
  const mockMetrics = {
    activeOrders: 12,
    deliveredThisMonth: 25,
    totalOrders: 145,
    totalSpentThisMonth: 2500,
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

  it('should show active orders count', () => {
    const wrapper = mount(OrderMetrics, {
      props: { metrics: mockMetrics },
    })
    expect(wrapper.text()).toContain('12')
  })

  it('should display delivered this month count', () => {
    const wrapper = mount(OrderMetrics, {
      props: { metrics: mockMetrics },
    })
    expect(wrapper.text()).toContain('25')
  })

  it('should display total spent this month formatted as currency', () => {
    const wrapper = mount(OrderMetrics, {
      props: { metrics: mockMetrics },
    })
    // Total spent is formatted as EUR currency (€2,500 or 2.500 € depending on locale)
    expect(wrapper.text()).toMatch(/2[,.]?500/)
  })
})
