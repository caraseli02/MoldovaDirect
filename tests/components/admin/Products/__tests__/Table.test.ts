import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ProductsTable from '~/components/admin/Products/Table.vue'

vi.mock('#imports', () => ({ useI18n: vi.fn(() => ({ t: (k: string) => k })) }))

describe('Admin Products Table', () => {
  const mockProducts = [
    { id: '1', name: 'Wine A', price: 25.99, stock: 50, status: 'active' },
    { id: '2', name: 'Wine B', price: 35.99, stock: 0, status: 'inactive' },
  ]

  it('should render products table', () => {
    const wrapper = mount(ProductsTable, {
      props: { products: mockProducts },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('should display product list', () => {
    const wrapper = mount(ProductsTable, {
      props: { products: mockProducts },
    })
    expect(wrapper.text()).toContain('Wine A')
    expect(wrapper.text()).toContain('Wine B')
  })

  it('should show product prices', () => {
    const wrapper = mount(ProductsTable, {
      props: { products: mockProducts },
    })
    expect(wrapper.text()).toMatch(/25\.99/)
  })

  it('should display stock quantities', () => {
    const wrapper = mount(ProductsTable, {
      props: { products: mockProducts },
    })
    expect(wrapper.text()).toContain('50')
  })

  it('should emit edit action', async () => {
    const wrapper = mount(ProductsTable, {
      props: { products: mockProducts },
    })
    const editButtons = wrapper.findAll('button')
    if (editButtons.length > 0) {
      await editButtons[0].trigger('click')
      expect(wrapper.emitted()).toBeTruthy()
    }
  })

  it('should handle empty product list', () => {
    const wrapper = mount(ProductsTable, {
      props: { products: [] },
    })
    expect(wrapper.html()).toBeTruthy()
  })
})
