import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StockIndicator from '~/components/admin/Inventory/StockIndicator.vue'

describe('Admin Inventory StockIndicator', () => {
  const createWrapper = (props = {}) => {
    return mount(StockIndicator, {
      props: {
        stockQuantity: 50,
        lowStockThreshold: 10,
        ...props,
      },
    })
  }

  it('should render stock indicator', () => {
    const wrapper = createWrapper()
    expect(wrapper.exists()).toBe(true)
  })

  it('should show green for high stock', () => {
    const wrapper = createWrapper({ stockQuantity: 100 })
    expect(wrapper.html()).toContain('green')
  })

  it('should show yellow for low stock', () => {
    const wrapper = createWrapper({ stockQuantity: 5 })
    expect(wrapper.html()).toContain('yellow')
  })

  it('should show red for out of stock', () => {
    const wrapper = createWrapper({ stockQuantity: 0 })
    expect(wrapper.html()).toContain('red')
  })

  it('should display stock quantity', () => {
    const wrapper = createWrapper({ stockQuantity: 25 })
    expect(wrapper.text()).toContain('25')
  })
})
