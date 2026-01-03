import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import OrderTrackingSection from '~/components/order/OrderTrackingSection.vue'

vi.mock('#imports', () => ({
  useI18n: vi.fn(() => ({
    t: (k: string) => k,
    locale: { value: 'en' },
  })),
}))

describe('Order OrderTrackingSection', () => {
  const mockOrder = {
    id: 'order-1',
    status: 'shipped' as const,
    items: [],
    total: 100,
    created_at: '2026-01-01',
  }

  const mockTrackingWithInfo = {
    has_tracking: true,
    tracking_number: 'TRK123456789',
    carrier: 'DHL',
    estimated_delivery: '2026-01-10',
    events: [
      {
        status: 'Shipped',
        timestamp: '2026-01-02',
        description: 'Package shipped',
        location: 'Chisinau',
      },
    ],
  }

  const mockTrackingNoInfo = {
    has_tracking: false,
  }

  it('should render tracking section', () => {
    const wrapper = mount(OrderTrackingSection, {
      props: {
        tracking: mockTrackingNoInfo,
        order: mockOrder,
      },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('should display tracking number when available', () => {
    const wrapper = mount(OrderTrackingSection, {
      props: {
        tracking: mockTrackingWithInfo,
        order: mockOrder,
      },
    })
    expect(wrapper.text()).toContain('TRK123456789')
  })

  it('should display carrier name', () => {
    const wrapper = mount(OrderTrackingSection, {
      props: {
        tracking: mockTrackingWithInfo,
        order: mockOrder,
      },
    })
    expect(wrapper.text()).toContain('DHL')
  })

  it('should show estimated delivery date', () => {
    const wrapper = mount(OrderTrackingSection, {
      props: {
        tracking: mockTrackingWithInfo,
        order: mockOrder,
      },
    })
    expect(wrapper.html()).toContain('2026-01-10')
  })

  it('should show no tracking message when unavailable', () => {
    const wrapper = mount(OrderTrackingSection, {
      props: {
        tracking: mockTrackingNoInfo,
        order: mockOrder,
      },
    })
    expect(wrapper.text()).toContain('orders.noTrackingInfo')
  })

  it('should emit refresh event when button clicked', async () => {
    const wrapper = mount(OrderTrackingSection, {
      props: {
        tracking: mockTrackingWithInfo,
        order: mockOrder,
      },
    })
    const refreshButton = wrapper.find('[aria-label="common.refresh"]')
    await refreshButton.trigger('click')
    expect(wrapper.emitted('refresh')).toBeTruthy()
  })

  it('should display tracking events timeline', () => {
    const wrapper = mount(OrderTrackingSection, {
      props: {
        tracking: mockTrackingWithInfo,
        order: mockOrder,
      },
    })
    expect(wrapper.text()).toContain('Shipped')
    expect(wrapper.text()).toContain('Chisinau')
  })
})
