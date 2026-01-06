import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import OrderStatus from '~/components/order/OrderStatus.vue'

vi.mock('#imports', () => ({
  useI18n: vi.fn(() => ({
    t: (k: string) => k,
    locale: { value: 'en' },
  })),
}))

describe('Order OrderStatus', () => {
  it('should render order status badge', () => {
    const wrapper = mount(OrderStatus, {
      props: {
        status: 'pending',
      },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('should display correct status label', () => {
    const wrapper = mount(OrderStatus, {
      props: {
        status: 'processing',
      },
    })
    expect(wrapper.text()).toContain('orders.status.processing')
  })

  it('should apply correct status colors for pending', () => {
    const wrapper = mount(OrderStatus, {
      props: {
        status: 'pending',
      },
    })
    const badge = wrapper.find('[role="status"]')
    expect(badge.classes()).toContain('bg-yellow-100')
  })

  it('should apply correct status colors for delivered', () => {
    const wrapper = mount(OrderStatus, {
      props: {
        status: 'delivered',
      },
    })
    const badge = wrapper.find('[role="status"]')
    expect(badge.classes()).toContain('bg-green-100')
  })

  it('should show timeline when enabled', () => {
    const mockTimeline = [
      { label: 'Order Placed', timestamp: '2026-01-01', completed: true },
      { label: 'Processing', timestamp: '2026-01-02', completed: false },
    ]
    const wrapper = mount(OrderStatus, {
      props: {
        status: 'pending',
        showTimeline: true,
        timeline: mockTimeline,
      },
    })
    expect(wrapper.text()).toContain('Order Placed')
    expect(wrapper.text()).toContain('Processing')
  })

  it('should hide timeline when disabled', () => {
    const wrapper = mount(OrderStatus, {
      props: {
        status: 'pending',
        showTimeline: false,
      },
    })
    const timeline = wrapper.find('nav')
    expect(timeline.exists()).toBe(false)
  })

  it('should display estimated delivery date', () => {
    const wrapper = mount(OrderStatus, {
      props: {
        status: 'shipped',
        showTimeline: true,
        timeline: [],
        estimatedDelivery: '2026-01-10',
      },
    })
    expect(wrapper.html()).toContain('2026-01-10')
  })
})
