import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DetailsCard from '~/components/admin/Orders/DetailsCard.vue'

describe('Admin Orders DetailsCard', () => {
  const mockOrder = {
    id: 1,
    order_number: 'ORD-12345',
    created_at: '2026-01-01T10:00:00Z',
    updated_at: '2026-01-02T10:00:00Z',
    subtotal_eur: 100,
    shipping_cost_eur: 10,
    tax_eur: 15,
    total_eur: 125,
    order_items: [{ id: 1 }, { id: 2 }],
    status: 'pending' as const,
    payment_status: 'paid',
    priority_level: 2,
    fulfillment_progress: 50,
  }

  it('should render details card', () => {
    const wrapper = mount(DetailsCard, {
      props: { order: mockOrder },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('should display order totals', () => {
    const wrapper = mount(DetailsCard, {
      props: { order: mockOrder },
    })
    expect(wrapper.text()).toContain('€100.00')
    expect(wrapper.text()).toContain('€10.00')
    expect(wrapper.text()).toContain('€15.00')
    expect(wrapper.text()).toContain('€125.00')
  })

  it('should show order number', () => {
    const wrapper = mount(DetailsCard, {
      props: { order: mockOrder },
    })
    expect(wrapper.text()).toContain('ORD-12345')
  })

  it('should display item count', () => {
    const wrapper = mount(DetailsCard, {
      props: { order: mockOrder },
    })
    expect(wrapper.text()).toContain('2 items')
  })

  it('should show priority level badge', () => {
    const wrapper = mount(DetailsCard, {
      props: { order: mockOrder },
    })
    expect(wrapper.text()).toContain('Medium Priority')
  })

  it('should display fulfillment progress', () => {
    const wrapper = mount(DetailsCard, {
      props: { order: mockOrder },
    })
    expect(wrapper.text()).toContain('50%')
    const progressBar = wrapper.find('.bg-blue-600')
    expect(progressBar.attributes('style')).toContain('width: 50%')
  })
})
