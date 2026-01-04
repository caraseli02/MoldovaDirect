import { describe, it, expect} from 'vitest'
import { mount } from '@vue/test-utils'
import Filters from '~/components/admin/Orders/Filters.vue'

describe('Admin Orders Filters', () => {
  const mockProps = {
    search: '',
    total: 50,
    loading: false,
  }

  it('should render filters component', () => {
    const wrapper = mount(Filters, {
      props: mockProps,
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('should display search input', () => {
    const wrapper = mount(Filters, {
      props: mockProps,
    })
    const searchInput = wrapper.find('input[type="text"]')
    expect(searchInput.exists()).toBe(true)
  })

  it('should show status filter dropdown', () => {
    const wrapper = mount(Filters, {
      props: mockProps,
    })
    expect(wrapper.text()).toContain('Order Status')
  })

  it('should display total orders count', () => {
    const wrapper = mount(Filters, {
      props: mockProps,
    })
    expect(wrapper.text()).toContain('50')
    expect(wrapper.text()).toContain('orders found')
  })

  it('should show clear all button when filters active', () => {
    const wrapper = mount(Filters, {
      props: {
        ...mockProps,
        search: 'test search',
      },
    })
    expect(wrapper.text()).toContain('Clear all')
  })

  it('should display date range inputs', () => {
    const wrapper = mount(Filters, {
      props: mockProps,
    })
    expect(wrapper.text()).toContain('Start Date')
    expect(wrapper.text()).toContain('End Date')
  })

  it('should show quick date preset buttons', () => {
    const wrapper = mount(Filters, {
      props: mockProps,
    })
    expect(wrapper.text()).toContain('Today')
    expect(wrapper.text()).toContain('Last 7 days')
    expect(wrapper.text()).toContain('Last 30 days')
  })
})
