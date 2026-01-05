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
        'Button': { template: '<button :disabled="disabled" :title="title"><slot /></button>', props: ['disabled', 'variant', 'size', 'title'] },
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

  it('should emit delete-product with correct product id for first product', async () => {
    const wrapper = mount(ProductsTable, mountOptions)
    // Find delete buttons (they have the delete icon)
    const buttons = wrapper.findAll('button')
    const deleteButton = buttons.find(btn => btn.attributes('title') === 'Delete Product')
    expect(deleteButton).toBeDefined()
    await deleteButton!.trigger('click')
    const emitted = wrapper.emitted('delete-product')
    expect(emitted).toBeTruthy()
    expect(emitted![0]).toEqual([1]) // First product id is 1
  })

  it('should emit delete-product with correct product id for second product', async () => {
    const wrapper = mount(ProductsTable, mountOptions)
    // Find all delete buttons
    const buttons = wrapper.findAll('button')
    const deleteButtons = buttons.filter(btn => btn.attributes('title') === 'Delete Product')
    expect(deleteButtons.length).toBeGreaterThan(1)
    await deleteButtons[1].trigger('click')
    const emitted = wrapper.emitted('delete-product')
    expect(emitted).toBeTruthy()
    expect(emitted![0]).toEqual([2]) // Second product id is 2
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

  // Event emission tests with payload validation
  describe('event emissions with payloads', () => {
    it('should emit bulk-activate when bulk activate button clicked', async () => {
      const wrapper = mount(ProductsTable, {
        ...mountOptions,
        props: { ...defaultProps, hasSelectedProducts: true, selectedCount: 2 },
      })
      const activateButton = wrapper.findAll('button').find(b => b.text().includes('Activate'))
      expect(activateButton).toBeDefined()
      await activateButton!.trigger('click')
      const emitted = wrapper.emitted('bulk-activate')
      expect(emitted).toBeTruthy()
      expect(emitted!.length).toBe(1)
      expect(emitted![0]).toEqual([]) // No payload expected
    })

    it('should emit bulk-deactivate when bulk deactivate button clicked', async () => {
      const wrapper = mount(ProductsTable, {
        ...mountOptions,
        props: { ...defaultProps, hasSelectedProducts: true, selectedCount: 2 },
      })
      const deactivateButton = wrapper.findAll('button').find(b => b.text().includes('Deactivate'))
      expect(deactivateButton).toBeDefined()
      await deactivateButton!.trigger('click')
      const emitted = wrapper.emitted('bulk-deactivate')
      expect(emitted).toBeTruthy()
      expect(emitted!.length).toBe(1)
      expect(emitted![0]).toEqual([]) // No payload expected
    })

    it('should emit bulk-delete when bulk delete button clicked', async () => {
      const wrapper = mount(ProductsTable, {
        ...mountOptions,
        props: { ...defaultProps, hasSelectedProducts: true, selectedCount: 2 },
      })
      const deleteButton = wrapper.findAll('button').find(b => b.text().includes('Delete'))
      expect(deleteButton).toBeDefined()
      await deleteButton!.trigger('click')
      const emitted = wrapper.emitted('bulk-delete')
      expect(emitted).toBeTruthy()
      expect(emitted!.length).toBe(1)
      expect(emitted![0]).toEqual([]) // No payload expected
    })

    it('should emit clear-selection when clear selection link clicked', async () => {
      const wrapper = mount(ProductsTable, {
        ...mountOptions,
        props: { ...defaultProps, hasSelectedProducts: true, selectedCount: 2 },
      })
      const clearButton = wrapper.findAll('button').find(b => b.text().includes('Clear selection'))
      expect(clearButton).toBeDefined()
      await clearButton!.trigger('click')
      const emitted = wrapper.emitted('clear-selection')
      expect(emitted).toBeTruthy()
      expect(emitted!.length).toBe(1)
      expect(emitted![0]).toEqual([]) // No payload expected
    })
  })

  // Product count display tests
  describe('product count display', () => {
    it('should display singular "product" when selectedCount is 1', () => {
      const wrapper = mount(ProductsTable, {
        ...mountOptions,
        props: { ...defaultProps, hasSelectedProducts: true, selectedCount: 1 },
      })
      expect(wrapper.text()).toContain('1 product selected')
      expect(wrapper.text()).not.toContain('1 products selected')
    })

    it('should display plural "products" when selectedCount is greater than 1', () => {
      const wrapper = mount(ProductsTable, {
        ...mountOptions,
        props: { ...defaultProps, hasSelectedProducts: true, selectedCount: 5 },
      })
      expect(wrapper.text()).toContain('5 products selected')
    })
  })

  // Status display tests
  describe('product status display', () => {
    it('should display Active status for active product', () => {
      const wrapper = mount(ProductsTable, mountOptions)
      expect(wrapper.text()).toContain('Active')
    })

    it('should display Inactive status for inactive product', () => {
      const wrapper = mount(ProductsTable, mountOptions)
      expect(wrapper.text()).toContain('Inactive')
    })
  })

  // Empty state tests
  describe('empty state variations', () => {
    it('should show "Try adjusting your filters" when hasActiveFilters is true', () => {
      const wrapper = mount(ProductsTable, {
        ...mountOptions,
        props: { ...defaultProps, products: [], hasActiveFilters: true },
      })
      expect(wrapper.text()).toContain('Try adjusting your filters')
    })

    it('should show "Get started by creating" when hasActiveFilters is false', () => {
      const wrapper = mount(ProductsTable, {
        ...mountOptions,
        props: { ...defaultProps, products: [], hasActiveFilters: false },
      })
      expect(wrapper.text()).toContain('Get started by creating your first product')
    })
  })

  // Bulk action button state tests
  describe('bulk action buttons', () => {
    it('should disable bulk action buttons when bulkOperationInProgress is true', () => {
      const wrapper = mount(ProductsTable, {
        ...mountOptions,
        props: { ...defaultProps, hasSelectedProducts: true, selectedCount: 2, bulkOperationInProgress: true },
      })
      const activateButton = wrapper.findAll('button').find(b => b.text().includes('Activate'))
      const deactivateButton = wrapper.findAll('button').find(b => b.text().includes('Deactivate'))
      const deleteButton = wrapper.findAll('button').find(b => b.text().includes('Delete'))

      expect(activateButton!.attributes('disabled')).toBeDefined()
      expect(deactivateButton!.attributes('disabled')).toBeDefined()
      expect(deleteButton!.attributes('disabled')).toBeDefined()
    })

    it('should enable bulk action buttons when bulkOperationInProgress is false', () => {
      const wrapper = mount(ProductsTable, {
        ...mountOptions,
        props: { ...defaultProps, hasSelectedProducts: true, selectedCount: 2, bulkOperationInProgress: false },
      })
      const activateButton = wrapper.findAll('button').find(b => b.text().includes('Activate'))
      const deactivateButton = wrapper.findAll('button').find(b => b.text().includes('Deactivate'))
      const deleteButton = wrapper.findAll('button').find(b => b.text().includes('Delete'))

      expect(activateButton!.attributes('disabled')).toBeUndefined()
      expect(deactivateButton!.attributes('disabled')).toBeUndefined()
      expect(deleteButton!.attributes('disabled')).toBeUndefined()
    })
  })
})
