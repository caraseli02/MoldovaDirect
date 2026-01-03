import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import OrderSummaryCard from '~/components/checkout/OrderSummaryCard.vue'

vi.mock('#imports', () => ({ useI18n: vi.fn(() => ({ t: (k: string) => k })) }))

describe('OrderSummaryCard', () => {
  const mockSummary = {
    subtotal: 100,
    shipping: 5.99,
    tax: 10.50,
    total: 116.49,
    items: [
      { id: '1', name: 'Product 1', quantity: 2, price: 50 },
    ],
  }

  it('should render order summary', () => {
    const wrapper = mount(OrderSummaryCard, {
      props: { summary: mockSummary },
    })
    expect(wrapper.text()).toContain('Product 1')
  })

  it('should display subtotal correctly', () => {
    const wrapper = mount(OrderSummaryCard, {
      props: { summary: mockSummary },
    })
    expect(wrapper.text()).toMatch(/100/)
  })

  it('should display shipping cost', () => {
    const wrapper = mount(OrderSummaryCard, {
      props: { summary: mockSummary },
    })
    expect(wrapper.text()).toMatch(/5\.99/)
  })

  it('should display tax amount', () => {
    const wrapper = mount(OrderSummaryCard, {
      props: { summary: mockSummary },
    })
    expect(wrapper.text()).toMatch(/10\.50/)
  })

  it('should display total prominently', () => {
    const wrapper = mount(OrderSummaryCard, {
      props: { summary: mockSummary },
    })
    expect(wrapper.text()).toMatch(/116\.49/)
  })

  it('should show item quantities', () => {
    const wrapper = mount(OrderSummaryCard, {
      props: { summary: mockSummary },
    })
    expect(wrapper.text()).toContain('2')
  })
})
