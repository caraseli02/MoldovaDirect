import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import StockIndicator from '~/components/admin/Inventory/StockIndicator.vue'

vi.mock('#imports', () => ({ useI18n: vi.fn(() => ({ t: (k: string) => k })) }))

describe('Admin Inventory StockIndicator', () => {
  it('should render stock indicator', () => {
    const wrapper = mount(StockIndicator, {
      props: { stock: 50, threshold: 10 },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('should show green for high stock', () => {
    const wrapper = mount(StockIndicator, {
      props: { stock: 100, threshold: 10 },
    })
    expect(wrapper.html()).toContain('green')
  })

  it('should show yellow for low stock', () => {
    const wrapper = mount(StockIndicator, {
      props: { stock: 5, threshold: 10 },
    })
    expect(wrapper.html()).toContain('yellow' || 'amber')
  })

  it('should show red for out of stock', () => {
    const wrapper = mount(StockIndicator, {
      props: { stock: 0, threshold: 10 },
    })
    expect(wrapper.html()).toContain('red')
  })

  it('should display stock quantity', () => {
    const wrapper = mount(StockIndicator, {
      props: { stock: 25, threshold: 10 },
    })
    expect(wrapper.text()).toContain('25')
  })
})
