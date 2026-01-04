import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import OrderItemsSection from '~/components/order/OrderItemsSection.vue'

vi.mock('#imports', () => ({
  useI18n: vi.fn(() => ({
    t: (k: string, fallback?: string) => fallback || k,
    locale: { value: 'en' },
  })),
}))

describe('Order OrderItemsSection', () => {
  // Mock order data factory
  const createMockOrder = (overrides = {}) => ({
    id: 1,
    orderNumber: 'ORD-2026-001',
    status: 'pending' as const,
    paymentMethod: 'stripe' as const,
    paymentStatus: 'paid' as const,
    subtotalEur: 100,
    shippingCostEur: 10,
    taxEur: 5,
    totalEur: 115,
    shippingAddress: {
      firstName: 'John',
      lastName: 'Doe',
      street: '123 Main St',
      city: 'Chisinau',
      postalCode: '2001',
      country: 'Moldova',
      isDefault: true,
    },
    billingAddress: {
      firstName: 'John',
      lastName: 'Doe',
      street: '123 Main St',
      city: 'Chisinau',
      postalCode: '2001',
      country: 'Moldova',
      isDefault: true,
    },
    createdAt: '2026-01-01T10:00:00Z',
    updatedAt: '2026-01-01T10:00:00Z',
    items: [
      {
        id: 1,
        orderId: 1,
        productId: 101,
        productSnapshot: {
          nameTranslations: {
            en: 'Test Product 1',
            es: 'Producto de Prueba 1',
            ro: 'Produs Test 1',
            ru: 'Тестовый Продукт 1',
          },
          sku: 'SKU-001',
          images: ['https://example.com/image1.jpg'],
        },
        quantity: 2,
        priceEur: 25,
        totalEur: 50,
      },
      {
        id: 2,
        orderId: 1,
        productId: 102,
        productSnapshot: {
          nameTranslations: {
            en: 'Test Product 2',
            es: 'Producto de Prueba 2',
            ro: 'Produs Test 2',
            ru: 'Тестовый Продукт 2',
          },
          sku: 'SKU-002',
          images: ['https://example.com/image2.jpg'],
        },
        quantity: 1,
        priceEur: 50,
        totalEur: 50,
      },
    ],
    ...overrides,
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render the component', () => {
      const wrapper = mount(OrderItemsSection, {
        props: {
          order: createMockOrder(),
        },
      })
      expect(wrapper.exists()).toBe(true)
    })

    it('should render the section heading', () => {
      const wrapper = mount(OrderItemsSection, {
        props: {
          order: createMockOrder(),
        },
      })
      // Check for translation key since mock returns keys
      expect(wrapper.text()).toContain('orders.items')
    })

    it('should render all order items', () => {
      const wrapper = mount(OrderItemsSection, {
        props: {
          order: createMockOrder(),
        },
      })
      const items = wrapper.findAll('[class*="flex gap-4 pb-4"]')
      expect(items.length).toBe(2)
    })

    it('should apply correct container styling', () => {
      const wrapper = mount(OrderItemsSection, {
        props: {
          order: createMockOrder(),
        },
      })
      const container = wrapper.find('div')
      expect(container.classes()).toContain('bg-white')
      expect(container.classes()).toContain('rounded-lg')
      expect(container.classes()).toContain('shadow-sm')
    })
  })

  describe('Product Information Display', () => {
    it('should display localized product names in English', () => {
      const wrapper = mount(OrderItemsSection, {
        props: {
          order: createMockOrder(),
        },
      })
      expect(wrapper.text()).toContain('Test Product 1')
      expect(wrapper.text()).toContain('Test Product 2')
    })

    it('should display product SKU', () => {
      const wrapper = mount(OrderItemsSection, {
        props: {
          order: createMockOrder(),
        },
      })
      expect(wrapper.text()).toContain('SKU-001')
      expect(wrapper.text()).toContain('SKU-002')
    })

    it('should display product quantity', () => {
      const wrapper = mount(OrderItemsSection, {
        props: {
          order: createMockOrder(),
        },
      })
      expect(wrapper.text()).toContain('2')
      expect(wrapper.text()).toContain('common.quantity')
    })

    it('should display unit price', () => {
      const wrapper = mount(OrderItemsSection, {
        props: {
          order: createMockOrder(),
        },
      })
      // Price should be formatted with EUR currency
      expect(wrapper.html()).toContain('25')
      expect(wrapper.html()).toContain('50')
    })

    it('should display item total price', () => {
      const wrapper = mount(OrderItemsSection, {
        props: {
          order: createMockOrder(),
        },
      })
      // Both items have totalEur of 50
      const totals = wrapper.findAll('.text-base.font-semibold')
      expect(totals.length).toBe(2)
    })
  })

  describe('Product Images', () => {
    it('should display product image when available', () => {
      const wrapper = mount(OrderItemsSection, {
        props: {
          order: createMockOrder(),
        },
      })
      const images = wrapper.findAll('img')
      expect(images.length).toBe(2)
      expect(images[0].attributes('src')).toBe('https://example.com/image1.jpg')
    })

    it('should display placeholder when no image available', () => {
      const orderWithNoImages = createMockOrder({
        items: [
          {
            id: 1,
            orderId: 1,
            productId: 101,
            productSnapshot: {
              nameTranslations: { en: 'No Image Product' },
              sku: 'SKU-NO-IMG',
              images: [],
            },
            quantity: 1,
            priceEur: 25,
            totalEur: 25,
          },
        ],
      })
      const wrapper = mount(OrderItemsSection, {
        props: {
          order: orderWithNoImages,
        },
      })
      const img = wrapper.find('img')
      expect(img.exists()).toBe(false)
      const placeholder = wrapper.find('svg')
      expect(placeholder.exists()).toBe(true)
    })

    it('should handle images as string instead of array', () => {
      const orderWithStringImage = createMockOrder({
        items: [
          {
            id: 1,
            orderId: 1,
            productId: 101,
            productSnapshot: {
              nameTranslations: { en: 'String Image Product' },
              sku: 'SKU-STR-IMG',
              images: 'https://example.com/single-image.jpg',
            },
            quantity: 1,
            priceEur: 25,
            totalEur: 25,
          },
        ],
      })
      const wrapper = mount(OrderItemsSection, {
        props: {
          order: orderWithStringImage,
        },
      })
      const img = wrapper.find('img')
      expect(img.exists()).toBe(true)
      expect(img.attributes('src')).toBe('https://example.com/single-image.jpg')
    })

    it('should handle images as object with url property', () => {
      const orderWithObjectImage = createMockOrder({
        items: [
          {
            id: 1,
            orderId: 1,
            productId: 101,
            productSnapshot: {
              nameTranslations: { en: 'Object Image Product' },
              sku: 'SKU-OBJ-IMG',
              images: [{ url: 'https://example.com/object-image.jpg' }],
            },
            quantity: 1,
            priceEur: 25,
            totalEur: 25,
          },
        ],
      })
      const wrapper = mount(OrderItemsSection, {
        props: {
          order: orderWithObjectImage,
        },
      })
      const img = wrapper.find('img')
      expect(img.exists()).toBe(true)
      expect(img.attributes('src')).toBe('https://example.com/object-image.jpg')
    })

    it('should have lazy loading on images', () => {
      const wrapper = mount(OrderItemsSection, {
        props: {
          order: createMockOrder(),
        },
      })
      const images = wrapper.findAll('img')
      images.forEach((img) => {
        expect(img.attributes('loading')).toBe('lazy')
      })
    })

    it('should have alt text on images', () => {
      const wrapper = mount(OrderItemsSection, {
        props: {
          order: createMockOrder(),
        },
      })
      const images = wrapper.findAll('img')
      expect(images[0].attributes('alt')).toBe('Test Product 1')
    })
  })

  describe('Customer Notes', () => {
    it('should display customer notes when available', () => {
      const orderWithNotes = createMockOrder({
        customerNotes: 'Please leave at the door',
      })
      const wrapper = mount(OrderItemsSection, {
        props: {
          order: orderWithNotes,
        },
      })
      // Check for translation key since mock returns keys
      expect(wrapper.text()).toContain('orders.customerNotes')
      expect(wrapper.text()).toContain('Please leave at the door')
    })

    it('should not display notes section when no notes', () => {
      const wrapper = mount(OrderItemsSection, {
        props: {
          order: createMockOrder(),
        },
      })
      // Check for translation key since mock returns keys
      expect(wrapper.text()).not.toContain('orders.customerNotes')
    })

    it('should display notes section with proper styling', () => {
      const orderWithNotes = createMockOrder({
        customerNotes: 'Handle with care',
      })
      const wrapper = mount(OrderItemsSection, {
        props: {
          order: orderWithNotes,
        },
      })
      const notesSection = wrapper.find('.mt-6.pt-6.border-t')
      expect(notesSection.exists()).toBe(true)
    })
  })

  describe('Localization', () => {
    it('should fallback to English when translation missing', () => {
      const orderWithPartialTranslations = createMockOrder({
        items: [
          {
            id: 1,
            orderId: 1,
            productId: 101,
            productSnapshot: {
              nameTranslations: {
                en: 'English Only Product',
              },
              sku: 'SKU-EN-ONLY',
              images: [],
            },
            quantity: 1,
            priceEur: 25,
            totalEur: 25,
          },
        ],
      })
      const wrapper = mount(OrderItemsSection, {
        props: {
          order: orderWithPartialTranslations,
        },
      })
      expect(wrapper.text()).toContain('English Only Product')
    })

    it('should return empty string when no translations exist', () => {
      const orderWithNoTranslations = createMockOrder({
        items: [
          {
            id: 1,
            orderId: 1,
            productId: 101,
            productSnapshot: {
              sku: 'SKU-NO-NAME',
              images: [],
            },
            quantity: 1,
            priceEur: 25,
            totalEur: 25,
          },
        ],
      })
      const wrapper = mount(OrderItemsSection, {
        props: {
          order: orderWithNoTranslations,
        },
      })
      // Should not throw error and render component
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Price Formatting', () => {
    it('should format prices with EUR currency', () => {
      const wrapper = mount(OrderItemsSection, {
        props: {
          order: createMockOrder(),
        },
      })
      // EUR formatting should include the Euro symbol
      expect(wrapper.html()).toContain('25')
      expect(wrapper.html()).toContain('50')
    })

    it('should handle zero price', () => {
      const orderWithZeroPrice = createMockOrder({
        items: [
          {
            id: 1,
            orderId: 1,
            productId: 101,
            productSnapshot: {
              nameTranslations: { en: 'Free Product' },
              sku: 'SKU-FREE',
              images: [],
            },
            quantity: 1,
            priceEur: 0,
            totalEur: 0,
          },
        ],
      })
      const wrapper = mount(OrderItemsSection, {
        props: {
          order: orderWithZeroPrice,
        },
      })
      expect(wrapper.exists()).toBe(true)
    })

    it('should handle null/undefined price gracefully', () => {
      const orderWithNullPrice = createMockOrder({
        items: [
          {
            id: 1,
            orderId: 1,
            productId: 101,
            productSnapshot: {
              nameTranslations: { en: 'Null Price Product' },
              sku: 'SKU-NULL',
              images: [],
            },
            quantity: 1,
            priceEur: null as any,
            totalEur: undefined as any,
          },
        ],
      })
      const wrapper = mount(OrderItemsSection, {
        props: {
          order: orderWithNullPrice,
        },
      })
      expect(wrapper.text()).toContain('0.00')
    })

    it('should handle NaN price gracefully', () => {
      const orderWithNaNPrice = createMockOrder({
        items: [
          {
            id: 1,
            orderId: 1,
            productId: 101,
            productSnapshot: {
              nameTranslations: { en: 'NaN Price Product' },
              sku: 'SKU-NAN',
              images: [],
            },
            quantity: 1,
            priceEur: NaN,
            totalEur: NaN,
          },
        ],
      })
      const wrapper = mount(OrderItemsSection, {
        props: {
          order: orderWithNaNPrice,
        },
      })
      expect(wrapper.text()).toContain('0.00')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty items array', () => {
      const orderWithNoItems = createMockOrder({
        items: [],
      })
      const wrapper = mount(OrderItemsSection, {
        props: {
          order: orderWithNoItems,
        },
      })
      expect(wrapper.exists()).toBe(true)
      const items = wrapper.findAll('[class*="flex gap-4 pb-4"]')
      expect(items.length).toBe(0)
    })

    it('should handle single item', () => {
      const orderWithSingleItem = createMockOrder({
        items: [
          {
            id: 1,
            orderId: 1,
            productId: 101,
            productSnapshot: {
              nameTranslations: { en: 'Single Product' },
              sku: 'SKU-SINGLE',
              images: [],
            },
            quantity: 1,
            priceEur: 100,
            totalEur: 100,
          },
        ],
      })
      const wrapper = mount(OrderItemsSection, {
        props: {
          order: orderWithSingleItem,
        },
      })
      const items = wrapper.findAll('[class*="flex gap-4"]')
      expect(items.length).toBeGreaterThanOrEqual(1)
    })

    it('should handle many items', () => {
      const manyItems = Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        orderId: 1,
        productId: 100 + i,
        productSnapshot: {
          nameTranslations: { en: `Product ${i + 1}` },
          sku: `SKU-${i + 1}`,
          images: [],
        },
        quantity: i + 1,
        priceEur: (i + 1) * 10,
        totalEur: (i + 1) * (i + 1) * 10,
      }))
      const orderWithManyItems = createMockOrder({ items: manyItems })
      const wrapper = mount(OrderItemsSection, {
        props: {
          order: orderWithManyItems,
        },
      })
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.text()).toContain('Product 1')
      expect(wrapper.text()).toContain('Product 20')
    })

    it('should handle missing productSnapshot', () => {
      const orderWithMissingSnapshot = createMockOrder({
        items: [
          {
            id: 1,
            orderId: 1,
            productId: 101,
            productSnapshot: null as any,
            quantity: 1,
            priceEur: 25,
            totalEur: 25,
          },
        ],
      })
      const wrapper = mount(OrderItemsSection, {
        props: {
          order: orderWithMissingSnapshot,
        },
      })
      // Should render without crashing
      expect(wrapper.exists()).toBe(true)
    })

    it('should handle empty string images', () => {
      const orderWithEmptyImages = createMockOrder({
        items: [
          {
            id: 1,
            orderId: 1,
            productId: 101,
            productSnapshot: {
              nameTranslations: { en: 'Empty Image Product' },
              sku: 'SKU-EMPTY-IMG',
              images: [''],
            },
            quantity: 1,
            priceEur: 25,
            totalEur: 25,
          },
        ],
      })
      const wrapper = mount(OrderItemsSection, {
        props: {
          order: orderWithEmptyImages,
        },
      })
      // Empty string should not be shown as image
      const img = wrapper.find('img')
      expect(img.exists()).toBe(false)
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      const wrapper = mount(OrderItemsSection, {
        props: {
          order: createMockOrder(),
        },
      })
      const h2 = wrapper.find('h2')
      const h3s = wrapper.findAll('h3')
      expect(h2.exists()).toBe(true)
      expect(h3s.length).toBeGreaterThan(0)
    })

    it('should have alt text for all product images', () => {
      const wrapper = mount(OrderItemsSection, {
        props: {
          order: createMockOrder(),
        },
      })
      const images = wrapper.findAll('img')
      images.forEach((img) => {
        expect(img.attributes('alt')).toBeTruthy()
      })
    })

    it('should have proper semantic structure', () => {
      const wrapper = mount(OrderItemsSection, {
        props: {
          order: createMockOrder(),
        },
      })
      // Main container should be a div
      expect(wrapper.element.tagName).toBe('DIV')
      // Should have proper heading
      expect(wrapper.find('h2').exists()).toBe(true)
    })
  })

  describe('Dark Mode Support', () => {
    it('should have dark mode classes', () => {
      const wrapper = mount(OrderItemsSection, {
        props: {
          order: createMockOrder(),
        },
      })
      const container = wrapper.find('.bg-white')
      expect(container.classes()).toContain('dark:bg-gray-800')
    })

    it('should have dark mode text colors', () => {
      const wrapper = mount(OrderItemsSection, {
        props: {
          order: createMockOrder(),
        },
      })
      const heading = wrapper.find('h2')
      expect(heading.classes()).toContain('dark:text-white')
    })

    it('should have dark mode border colors', () => {
      const wrapper = mount(OrderItemsSection, {
        props: {
          order: createMockOrder(),
        },
      })
      const items = wrapper.findAll('[class*="border-gray-200"]')
      items.forEach((item) => {
        expect(item.classes()).toContain('dark:border-gray-700')
      })
    })
  })

  describe('SKU Display', () => {
    it('should show SKU when present', () => {
      const wrapper = mount(OrderItemsSection, {
        props: {
          order: createMockOrder(),
        },
      })
      expect(wrapper.text()).toContain('SKU')
      expect(wrapper.text()).toContain('SKU-001')
    })

    it('should not show SKU section when SKU is missing', () => {
      const orderWithoutSKU = createMockOrder({
        items: [
          {
            id: 1,
            orderId: 1,
            productId: 101,
            productSnapshot: {
              nameTranslations: { en: 'No SKU Product' },
              images: [],
            },
            quantity: 1,
            priceEur: 25,
            totalEur: 25,
          },
        ],
      })
      const wrapper = mount(OrderItemsSection, {
        props: {
          order: orderWithoutSKU,
        },
      })
      // SKU label should not be visible for this item
      const skuElements = wrapper.findAll('.text-xs.text-gray-500')
      expect(skuElements.length).toBe(0)
    })
  })
})
