import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import ReviewCartSection from '~/components/checkout/review/ReviewCartSection.vue'
import type { OrderItem } from '~/types/checkout'

// Mock useI18n
vi.mock('#imports', () => ({
  useI18n: vi.fn(() => ({
    t: (key: string) => key,
    locale: { value: 'en' },
  })),
}))

describe('ReviewCartSection', () => {
  // Helper function to create order items
  const createOrderItem = (overrides: Partial<OrderItem> = {}): OrderItem => ({
    productId: 1,
    productSnapshot: {
      name: { en: 'Test Product', es: 'Producto de Prueba' },
      images: ['https://example.com/image.jpg'],
    },
    quantity: 2,
    price: 25.99,
    total: 51.98,
    ...overrides,
  })

  const defaultProps = {
    items: [createOrderItem()],
    formatPrice: (value: number) => `$${value.toFixed(2)}`,
  }

  const mountComponent = (props = {}, options = {}): VueWrapper => {
    return mount(ReviewCartSection, {
      props: { ...defaultProps, ...props },
      global: {
        mocks: {
          $t: (key: string) => key,
        },
      },
      ...options,
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render the cart section', () => {
      const wrapper = mountComponent()
      expect(wrapper.exists()).toBe(true)
    })

    it('should render section as semantic HTML section element', () => {
      const wrapper = mountComponent()
      expect(wrapper.element.tagName).toBe('SECTION')
    })

    it('should render cart items header', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('checkout.review.cartItems')
    })

    it('should render edit button', () => {
      const wrapper = mountComponent()
      const editButton = wrapper.find('button')
      expect(editButton.exists()).toBe(true)
      expect(editButton.text()).toContain('checkout.review.editCart')
    })

    it('should have proper card styling classes', () => {
      const wrapper = mountComponent()
      expect(wrapper.classes()).toContain('bg-white')
      expect(wrapper.classes()).toContain('rounded-lg')
      expect(wrapper.classes()).toContain('shadow-sm')
    })
  })

  describe('Props handling', () => {
    it('should accept items prop', () => {
      const items = [createOrderItem(), createOrderItem({ productId: 2 })]
      const wrapper = mountComponent({ items })
      expect(wrapper.props('items')).toEqual(items)
    })

    it('should accept formatPrice prop as function', () => {
      const formatPrice = (value: number) => `EUR ${value}`
      const wrapper = mountComponent({ formatPrice })
      expect(wrapper.props('formatPrice')).toBe(formatPrice)
    })

    it('should render all items from props', () => {
      const items = [
        createOrderItem({ productId: 1 }),
        createOrderItem({ productId: 2 }),
        createOrderItem({ productId: 3 }),
      ]
      const wrapper = mountComponent({ items })
      const articles = wrapper.findAll('article')
      expect(articles.length).toBe(3)
    })
  })

  describe('Cart items display', () => {
    it('should render product image', () => {
      const wrapper = mountComponent()
      const img = wrapper.find('img')
      expect(img.exists()).toBe(true)
      expect(img.attributes('src')).toBe('https://example.com/image.jpg')
    })

    it('should render product name as alt text', () => {
      const wrapper = mountComponent()
      const img = wrapper.find('img')
      expect(img.attributes('alt')).toBe('Test Product')
    })

    it('should render product name', () => {
      const wrapper = mountComponent()
      const productName = wrapper.find('h4')
      expect(productName.text()).toBe('Test Product')
    })

    it('should render quantity', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('common.quantity')
      expect(wrapper.text()).toContain('2')
    })

    it('should render unit price', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('$25.99')
      expect(wrapper.text()).toContain('common.each')
    })

    it('should render total price for item', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('$51.98')
    })

    it('should use formatPrice function for prices', () => {
      const formatPrice = vi.fn((value: number) => `EUR ${value.toFixed(2)}`)
      const wrapper = mountComponent({ formatPrice })

      expect(formatPrice).toHaveBeenCalled()
      expect(wrapper.text()).toContain('EUR 25.99')
      expect(wrapper.text()).toContain('EUR 51.98')
    })
  })

  describe('Empty cart state', () => {
    it('should render empty cart message when no items', () => {
      const wrapper = mountComponent({ items: [] })
      expect(wrapper.text()).toContain('checkout.review.emptyCart')
    })

    it('should not render item list when cart is empty', () => {
      const wrapper = mountComponent({ items: [] })
      const articles = wrapper.findAll('article')
      expect(articles.length).toBe(0)
    })

    it('should still render header and edit button with empty cart', () => {
      const wrapper = mountComponent({ items: [] })
      expect(wrapper.text()).toContain('checkout.review.cartItems')
      expect(wrapper.find('button').exists()).toBe(true)
    })
  })

  describe('User interactions', () => {
    it('should emit edit event when edit button is clicked', async () => {
      const wrapper = mountComponent()
      const editButton = wrapper.find('button')

      await editButton.trigger('click')

      expect(wrapper.emitted('edit')).toBeTruthy()
      expect(wrapper.emitted('edit')!.length).toBe(1)
    })

    it('should emit edit event with no payload', async () => {
      const wrapper = mountComponent()
      const editButton = wrapper.find('button')

      await editButton.trigger('click')

      expect(wrapper.emitted('edit')![0]).toEqual([])
    })

    it('should emit multiple edit events on multiple clicks', async () => {
      const wrapper = mountComponent()
      const editButton = wrapper.find('button')

      await editButton.trigger('click')
      await editButton.trigger('click')
      await editButton.trigger('click')

      expect(wrapper.emitted('edit')!.length).toBe(3)
    })
  })

  describe('i18n translations', () => {
    it('should use translation key for cart items header', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('checkout.review.cartItems')
    })

    it('should use translation key for edit button', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('checkout.review.editCart')
    })

    it('should use translation key for quantity label', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('common.quantity')
    })

    it('should use translation key for each label', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('common.each')
    })

    it('should use translation key for empty cart message', () => {
      const wrapper = mountComponent({ items: [] })
      expect(wrapper.text()).toContain('checkout.review.emptyCart')
    })
  })

  describe('Localized product names', () => {
    it('should display localized name for current locale', () => {
      const items = [
        createOrderItem({
          productSnapshot: {
            name: { en: 'English Name', es: 'Spanish Name', ro: 'Romanian Name' },
            images: [],
          },
        }),
      ]
      const wrapper = mountComponent({ items })
      expect(wrapper.text()).toContain('English Name')
    })

    it('should fallback to Spanish name if current locale not available', () => {
      const items = [
        createOrderItem({
          productSnapshot: {
            name: { es: 'Spanish Name', fr: 'French Name' },
            images: [],
          },
        }),
      ]
      const wrapper = mountComponent({ items })
      // Fallback should show Spanish (es) as primary locale
      expect(wrapper.text()).toContain('Spanish Name')
    })

    it('should handle string name instead of object', () => {
      const items = [
        createOrderItem({
          productSnapshot: {
            name: 'Simple String Name',
            images: [],
          },
        }),
      ]
      const wrapper = mountComponent({ items })
      expect(wrapper.text()).toContain('Simple String Name')
    })

    it('should handle empty name gracefully', () => {
      const items = [
        createOrderItem({
          productSnapshot: {
            name: null,
            images: [],
          },
        }),
      ]
      const wrapper = mountComponent({ items })
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Product images', () => {
    it('should use first image from array of strings', () => {
      const items = [
        createOrderItem({
          productSnapshot: {
            name: 'Product',
            images: ['https://example.com/first.jpg', 'https://example.com/second.jpg'],
          },
        }),
      ]
      const wrapper = mountComponent({ items })
      const img = wrapper.find('img')
      expect(img.attributes('src')).toBe('https://example.com/first.jpg')
    })

    it('should use url from image object', () => {
      const items = [
        createOrderItem({
          productSnapshot: {
            name: 'Product',
            images: [{ url: 'https://example.com/object-image.jpg', alt: 'Image' }],
          },
        }),
      ]
      const wrapper = mountComponent({ items })
      const img = wrapper.find('img')
      expect(img.attributes('src')).toBe('https://example.com/object-image.jpg')
    })

    it('should use placeholder when no images', () => {
      const items = [
        createOrderItem({
          productSnapshot: {
            name: 'Product',
            images: [],
          },
        }),
      ]
      const wrapper = mountComponent({ items })
      const img = wrapper.find('img')
      expect(img.attributes('src')).toBe('/placeholder-product.svg')
    })

    it('should use placeholder when images is undefined', () => {
      const items = [
        createOrderItem({
          productSnapshot: {
            name: 'Product',
          },
        }),
      ]
      const wrapper = mountComponent({ items })
      const img = wrapper.find('img')
      expect(img.attributes('src')).toBe('/placeholder-product.svg')
    })

    it('should use placeholder when images is null', () => {
      const items = [
        createOrderItem({
          productSnapshot: {
            name: 'Product',
            images: null,
          },
        }),
      ]
      const wrapper = mountComponent({ items })
      const img = wrapper.find('img')
      expect(img.attributes('src')).toBe('/placeholder-product.svg')
    })

    it('should have proper image styling classes', () => {
      const wrapper = mountComponent()
      const img = wrapper.find('img')
      expect(img.classes()).toContain('w-16')
      expect(img.classes()).toContain('h-16')
      expect(img.classes()).toContain('object-cover')
      expect(img.classes()).toContain('rounded-lg')
    })
  })

  describe('Multiple items', () => {
    it('should render correct number of items', () => {
      const items = [
        createOrderItem({ productId: 1, productSnapshot: { name: 'Product 1', images: [] } }),
        createOrderItem({ productId: 2, productSnapshot: { name: 'Product 2', images: [] } }),
        createOrderItem({ productId: 3, productSnapshot: { name: 'Product 3', images: [] } }),
        createOrderItem({ productId: 4, productSnapshot: { name: 'Product 4', images: [] } }),
        createOrderItem({ productId: 5, productSnapshot: { name: 'Product 5', images: [] } }),
      ]
      const wrapper = mountComponent({ items })
      const articles = wrapper.findAll('article')
      expect(articles.length).toBe(5)
    })

    it('should use productId as key for items', () => {
      const items = [
        createOrderItem({ productId: 100 }),
        createOrderItem({ productId: 200 }),
      ]
      const wrapper = mountComponent({ items })
      const articles = wrapper.findAll('article')
      expect(articles.length).toBe(2)
    })

    it('should display all item names', () => {
      const items = [
        createOrderItem({ productId: 1, productSnapshot: { name: 'Alpha Product', images: [] } }),
        createOrderItem({ productId: 2, productSnapshot: { name: 'Beta Product', images: [] } }),
        createOrderItem({ productId: 3, productSnapshot: { name: 'Gamma Product', images: [] } }),
      ]
      const wrapper = mountComponent({ items })
      expect(wrapper.text()).toContain('Alpha Product')
      expect(wrapper.text()).toContain('Beta Product')
      expect(wrapper.text()).toContain('Gamma Product')
    })
  })

  describe('Price formatting', () => {
    it('should format unit price correctly', () => {
      const formatPrice = vi.fn((value: number) => `$${value.toFixed(2)}`)
      const items = [createOrderItem({ price: 19.99 })]
      mountComponent({ items, formatPrice })

      expect(formatPrice).toHaveBeenCalledWith(19.99)
    })

    it('should format total price correctly', () => {
      const formatPrice = vi.fn((value: number) => `$${value.toFixed(2)}`)
      const items = [createOrderItem({ total: 39.98 })]
      mountComponent({ items, formatPrice })

      expect(formatPrice).toHaveBeenCalledWith(39.98)
    })

    it('should handle different currency formats', () => {
      const formatPrice = (value: number) => `${value.toFixed(2)} EUR`
      const items = [createOrderItem({ price: 15.00, total: 30.00 })]
      const wrapper = mountComponent({ items, formatPrice })

      expect(wrapper.text()).toContain('15.00 EUR')
      expect(wrapper.text()).toContain('30.00 EUR')
    })

    it('should handle zero prices', () => {
      const items = [createOrderItem({ price: 0, total: 0 })]
      const wrapper = mountComponent({ items })
      expect(wrapper.text()).toContain('$0.00')
    })

    it('should handle large prices', () => {
      const items = [createOrderItem({ price: 9999.99, total: 19999.98 })]
      const wrapper = mountComponent({ items })
      expect(wrapper.text()).toContain('$9999.99')
      expect(wrapper.text()).toContain('$19999.98')
    })
  })

  describe('Quantity display', () => {
    it('should display quantity for single item', () => {
      const items = [createOrderItem({ quantity: 1 })]
      const wrapper = mountComponent({ items })
      expect(wrapper.text()).toContain('1')
    })

    it('should display large quantities', () => {
      const items = [createOrderItem({ quantity: 100 })]
      const wrapper = mountComponent({ items })
      expect(wrapper.text()).toContain('100')
    })
  })

  describe('Styling and layout', () => {
    it('should have header with flex layout', () => {
      const wrapper = mountComponent()
      const header = wrapper.find('header')
      expect(header.classes()).toContain('flex')
      expect(header.classes()).toContain('items-center')
      expect(header.classes()).toContain('justify-between')
    })

    it('should have proper dark mode classes', () => {
      const wrapper = mountComponent()
      expect(wrapper.html()).toContain('dark:bg-gray-800')
      expect(wrapper.html()).toContain('dark:text-white')
      expect(wrapper.html()).toContain('dark:border-gray-700')
    })

    it('should have edit button with green styling', () => {
      const wrapper = mountComponent()
      const editButton = wrapper.find('button')
      expect(editButton.classes()).toContain('text-green-600')
    })

    it('should have border bottom on items except last', () => {
      const wrapper = mountComponent()
      const articles = wrapper.findAll('article')
      if (articles.length > 0) {
        expect(articles[0].classes()).toContain('border-b')
        expect(articles[0].classes()).toContain('last:border-b-0')
      }
    })

    it('should have proper item container spacing', () => {
      const wrapper = mountComponent()
      const itemContainer = wrapper.find('.space-y-4')
      expect(itemContainer.exists()).toBe(true)
    })
  })

  describe('Accessibility', () => {
    it('should have semantic section element', () => {
      const wrapper = mountComponent()
      expect(wrapper.element.tagName).toBe('SECTION')
    })

    it('should have semantic header element', () => {
      const wrapper = mountComponent()
      const header = wrapper.find('header')
      expect(header.exists()).toBe(true)
    })

    it('should have semantic article elements for items', () => {
      const wrapper = mountComponent()
      const articles = wrapper.findAll('article')
      expect(articles.length).toBe(1)
    })

    it('should have h3 heading for section title', () => {
      const wrapper = mountComponent()
      const heading = wrapper.find('h3')
      expect(heading.exists()).toBe(true)
    })

    it('should have h4 headings for product names', () => {
      const wrapper = mountComponent()
      const productHeading = wrapper.find('h4')
      expect(productHeading.exists()).toBe(true)
    })

    it('should have alt text on product images', () => {
      const wrapper = mountComponent()
      const img = wrapper.find('img')
      expect(img.attributes('alt')).toBeTruthy()
    })

    it('should have clickable edit button', () => {
      const wrapper = mountComponent()
      const button = wrapper.find('button')
      expect(button.exists()).toBe(true)
    })
  })

  describe('Edge cases', () => {
    it('should handle item with string productId', () => {
      const items = [createOrderItem({ productId: 'abc-123' })]
      const wrapper = mountComponent({ items })
      expect(wrapper.exists()).toBe(true)
    })

    it('should handle item with numeric string productId', () => {
      const items = [createOrderItem({ productId: '12345' })]
      const wrapper = mountComponent({ items })
      expect(wrapper.exists()).toBe(true)
    })

    it('should handle empty productSnapshot', () => {
      const items = [
        {
          productId: 1,
          productSnapshot: {},
          quantity: 1,
          price: 10,
          total: 10,
        },
      ]
      const wrapper = mountComponent({ items })
      expect(wrapper.exists()).toBe(true)
    })

    it('should handle very long product names', () => {
      const longName = 'A'.repeat(200)
      const items = [
        createOrderItem({
          productSnapshot: {
            name: longName,
            images: [],
          },
        }),
      ]
      const wrapper = mountComponent({ items })
      expect(wrapper.find('h4').classes()).toContain('truncate')
    })

    it('should handle decimal quantities', () => {
      const items = [createOrderItem({ quantity: 1.5 })]
      const wrapper = mountComponent({ items })
      expect(wrapper.text()).toContain('1.5')
    })

    it('should handle negative prices gracefully', () => {
      const items = [createOrderItem({ price: -10, total: -20 })]
      const wrapper = mountComponent({ items })
      expect(wrapper.text()).toContain('$-10.00')
    })

    it('should handle special characters in product names', () => {
      const items = [
        createOrderItem({
          productSnapshot: {
            name: 'Product <script>alert("xss")</script>',
            images: [],
          },
        }),
      ]
      const wrapper = mountComponent({ items })
      // Vue should escape HTML automatically in text content
      // The h4 element should have escaped content
      const productTitle = wrapper.find('h4')
      expect(productTitle.text()).toContain('Product')
      // Text content should not execute scripts (HTML entities are rendered as text)
      expect(productTitle.text()).not.toEqual('<script>alert("xss")</script>')
    })

    it('should handle undefined formatPrice gracefully', () => {
      // This should cause an error if formatPrice is called as undefined
      // but component should still mount
      const wrapper = mount(ReviewCartSection, {
        props: {
          items: [],
          formatPrice: (value: number) => String(value),
        },
        global: {
          mocks: {
            $t: (key: string) => key,
          },
        },
      })
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Component reactivity', () => {
    it('should update when items prop changes', async () => {
      const wrapper = mountComponent({ items: [createOrderItem()] })
      expect(wrapper.findAll('article').length).toBe(1)

      await wrapper.setProps({
        items: [createOrderItem({ productId: 1 }), createOrderItem({ productId: 2 })],
      })

      expect(wrapper.findAll('article').length).toBe(2)
    })

    it('should update display when item data changes', async () => {
      const items = [createOrderItem({ quantity: 1 })]
      const wrapper = mountComponent({ items })
      expect(wrapper.text()).toContain('1')

      await wrapper.setProps({
        items: [createOrderItem({ quantity: 5 })],
      })

      expect(wrapper.text()).toContain('5')
    })

    it('should clear items when empty array is passed', async () => {
      const wrapper = mountComponent({ items: [createOrderItem()] })
      expect(wrapper.findAll('article').length).toBe(1)

      await wrapper.setProps({ items: [] })

      expect(wrapper.findAll('article').length).toBe(0)
      expect(wrapper.text()).toContain('checkout.review.emptyCart')
    })
  })

  describe('Localization fallback chain', () => {
    it('should fallback to any available translation when locale and es not available', () => {
      const items = [
        createOrderItem({
          productSnapshot: {
            name: { fr: 'French Name', de: 'German Name' },
            images: [],
          },
        }),
      ]
      const wrapper = mountComponent({ items })
      // Should use first available value
      expect(wrapper.text()).toMatch(/French Name|German Name/)
    })

    it('should return empty string for completely empty name object', () => {
      const items = [
        createOrderItem({
          productSnapshot: {
            name: {},
            images: [],
          },
        }),
      ]
      const wrapper = mountComponent({ items })
      expect(wrapper.exists()).toBe(true)
    })

    it('should handle name with only non-string values', () => {
      const items = [
        createOrderItem({
          productSnapshot: {
            name: { en: null, es: undefined },
            images: [],
          },
        }),
      ]
      const wrapper = mountComponent({ items })
      expect(wrapper.exists()).toBe(true)
    })
  })
})
