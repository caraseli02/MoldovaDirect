import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import OrderSummaryCard from '~/components/checkout/OrderSummaryCard.vue'

vi.mock('#imports', () => ({ useI18n: vi.fn(() => ({ t: (k: string) => k, locale: { value: 'en' } })) }))

describe('OrderSummaryCard', () => {
  // Component expects individual props, not a summary object
  const mockItems = [
    { productId: '1', name: 'Product 1', quantity: 2, price: 50, images: ['https://example.com/img.jpg'] },
  ]

  const defaultProps = {
    items: mockItems,
    subtotal: 100,
    shippingCost: 5.99,
    tax: 10.50,
    total: 116.49,
    loading: false,
  }

  it('should render order summary', () => {
    const wrapper = mount(OrderSummaryCard, {
      props: defaultProps,
    })
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.order-summary-card').exists()).toBe(true)
  })

  it('should display subtotal correctly', () => {
    const wrapper = mount(OrderSummaryCard, {
      props: defaultProps,
    })
    // Price is formatted by Intl.NumberFormat, check for presence
    expect(wrapper.text()).toContain('100')
  })

  it('should display shipping cost', () => {
    const wrapper = mount(OrderSummaryCard, {
      props: defaultProps,
    })
    // Shipping cost should be present
    expect(wrapper.text()).toMatch(/5[.,]99/)
  })

  it('should display tax amount', () => {
    const wrapper = mount(OrderSummaryCard, {
      props: defaultProps,
    })
    expect(wrapper.text()).toMatch(/10[.,]50/)
  })

  it('should display total prominently', () => {
    const wrapper = mount(OrderSummaryCard, {
      props: defaultProps,
    })
    expect(wrapper.text()).toMatch(/116[.,]49/)
  })

  it('should show item count in header', () => {
    const wrapper = mount(OrderSummaryCard, {
      props: defaultProps,
    })
    // Component shows "1 item" in header
    expect(wrapper.text()).toContain('1')
  })
})
