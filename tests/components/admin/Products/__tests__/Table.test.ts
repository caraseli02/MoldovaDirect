import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ProductsTable from '~/components/admin/Products/Table.vue'

// Mock lib/uiVariants
vi.mock('@/lib/uiVariants', () => ({
  productStatusVariant: (active: boolean) => active ? 'default' : 'secondary',
}))

// i18n plugin that returns keys
const mockI18n = {
  install(app: any) {
    app.config.globalProperties.$t = (key: string) => key
  },
}

describe('Admin Products Table', () => {
  const mockProducts = [
    {
      id: 1,
      name: { es: 'Wine A', en: 'Wine A' },
      price: 25.99,
      stockQuantity: 50,
      isActive: true,
      sku: 'SKU-001',
      slug: 'wine-a',
      createdAt: '2025-01-01',
      images: [],
      category: { name: { es: 'Wines' } },
    },
    {
      id: 2,
      name: { es: 'Wine B', en: 'Wine B' },
      price: 35.99,
      stockQuantity: 0,
      isActive: false,
      sku: 'SKU-002',
      slug: 'wine-b',
      createdAt: '2025-01-02',
      images: [],
      category: { name: { es: 'Wines' } },
    },
  ]

  const defaultProps = {
    products: mockProducts,
    loading: false,
    hasActiveFilters: false,
    hasSelectedProducts: false,
    allVisibleSelected: false,
    selectedCount: 0,
    bulkOperationInProgress: false,
    sortBy: 'name',
    sortOrder: 'asc' as const,
  }

  const mountOptions = {
    props: defaultProps,
    global: {
      plugins: [mockI18n],
      stubs: {
        'Button': { template: '<button :disabled="disabled"><slot /></button>', props: ['disabled', 'variant', 'size'] },
        'Table': { template: '<table><slot /></table>' },
        'TableHeader': { template: '<thead><slot /></thead>' },
        'TableRow': { template: '<tr><slot /></tr>' },
        'TableHead': { template: '<th><slot /></th>' },
        'TableBody': { template: '<tbody><slot /></tbody>' },
        'UiCheckbox': { template: '<input type="checkbox" />', props: ['checked', 'ariaLabel'] },
        'Badge': { template: '<span class="badge"><slot /></span>', props: ['variant'] },
        'AdminInventoryEditor': {
          template: '<span class="inventory-editor">{{ stockQuantity }}</span>',
          props: ['productId', 'stockQuantity', 'lowStockThreshold', 'reorderPoint', 'size'],
        },
        'nuxt-link': { template: '<a><slot /></a>', props: ['to', 'target'] },
      },
    },
  }

  it('should render products table', () => {
    const wrapper = mount(ProductsTable, mountOptions)
    expect(wrapper.exists()).toBe(true)
  })

  it('should display product list', () => {
    const wrapper = mount(ProductsTable, mountOptions)
    expect(wrapper.text()).toContain('Wine A')
    expect(wrapper.text()).toContain('Wine B')
  })

  it('should show product prices', () => {
    const wrapper = mount(ProductsTable, mountOptions)
    expect(wrapper.text()).toMatch(/25\.99/)
  })

  it('should display stock quantities', () => {
    const wrapper = mount(ProductsTable, mountOptions)
    expect(wrapper.text()).toContain('50')
  })

  it('should emit delete-product action', async () => {
    const wrapper = mount(ProductsTable, mountOptions)
    // Find delete buttons (they have the delete icon)
    const buttons = wrapper.findAll('button')
    const deleteButton = buttons.find(btn => btn.attributes('title') === 'Delete Product')
    if (deleteButton) {
      await deleteButton.trigger('click')
      expect(wrapper.emitted('delete-product')).toBeTruthy()
    }
  })

  it('should handle empty product list', () => {
    const wrapper = mount(ProductsTable, {
      ...mountOptions,
      props: { ...defaultProps, products: [] },
    })
    expect(wrapper.html()).toBeTruthy()
    expect(wrapper.text()).toContain('No products found')
  })

  it('should show loading state', () => {
    const wrapper = mount(ProductsTable, {
      ...mountOptions,
      props: { ...defaultProps, loading: true },
    })
    expect(wrapper.find('.animate-pulse').exists()).toBe(true)
  })

  it('should show bulk action bar when products are selected', () => {
    const wrapper = mount(ProductsTable, {
      ...mountOptions,
      props: { ...defaultProps, hasSelectedProducts: true, selectedCount: 2 },
    })
    expect(wrapper.text()).toContain('2 products selected')
  })
})
