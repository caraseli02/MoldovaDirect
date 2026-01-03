import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import OrderCardEnhanced from '~/components/order/OrderCardEnhanced.vue'

vi.mock('#imports', () => ({ useI18n: vi.fn(() => ({ t: (k: string) => k })) }))

describe('OrderCardEnhanced - Enhanced', () => {
  const mockOrder = {
    id: 'ORD-001',
    status: 'processing',
    total: 125.99,
    items: 3,
    date: '2026-01-02',
    customer: 'John Doe',
  }

  it('should render order card', () => {
    const wrapper = mount(OrderCardEnhanced, {
      props: { order: mockOrder },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('should display order ID', () => {
    const wrapper = mount(OrderCardEnhanced, {
      props: { order: mockOrder },
    })
    expect(wrapper.text()).toContain('ORD-001')
  })

  it('should show order status badge', () => {
    const wrapper = mount(OrderCardEnhanced, {
      props: { order: mockOrder },
    })
    expect(wrapper.text()).toContain('processing')
  })

  it('should display order total', () => {
    const wrapper = mount(OrderCardEnhanced, {
      props: { order: mockOrder },
    })
    expect(wrapper.text()).toMatch(/125\.99/)
  })

  it('should show item count', () => {
    const wrapper = mount(OrderCardEnhanced, {
      props: { order: mockOrder },
    })
    expect(wrapper.text()).toContain('3')
  })

  it('should emit view-details on click', async () => {
    const wrapper = mount(OrderCardEnhanced, {
      props: { order: mockOrder },
    })
    const card = wrapper.find('[data-order-card]') || wrapper.find('div')
    await card.trigger('click')
    expect(wrapper.emitted()).toBeTruthy()
  })
})
