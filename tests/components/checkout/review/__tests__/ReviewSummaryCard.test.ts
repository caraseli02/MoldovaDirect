import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import ReviewSummaryCard from '~/components/checkout/review/ReviewSummaryCard.vue'
import type { OrderData } from '~/types/checkout'

// Mock useI18n composable
vi.mock('#imports', () => ({
  useI18n: vi.fn(() => ({
    t: (key: string) => key,
  })),
}))

describe('ReviewSummaryCard', () => {
  const mockFormatPrice = vi.fn((value: number) => `$${value.toFixed(2)}`)

  const createOrderData = (overrides: Partial<OrderData> = {}): OrderData => ({
    subtotal: 100,
    shippingCost: 10,
    tax: 8,
    total: 118,
    currency: 'USD',
    items: [],
    ...overrides,
  })

  const defaultProps = {
    orderData: createOrderData(),
    formatPrice: mockFormatPrice,
  }

  const mountComponent = (props = {}, options = {}): VueWrapper => {
    return mount(ReviewSummaryCard, {
      props: { ...defaultProps, ...props },
      global: {
        stubs: {},
      },
      ...options,
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockFormatPrice.mockImplementation((value: number) => `$${value.toFixed(2)}`)
  })

  describe('Rendering', () => {
    it('should render the review summary card', () => {
      const wrapper = mountComponent()
      expect(wrapper.exists()).toBe(true)
    })

    it('should render as an aside element', () => {
      const wrapper = mountComponent()
      expect(wrapper.element.tagName).toBe('ASIDE')
    })

    it('should render the order summary heading', () => {
      const wrapper = mountComponent()
      const heading = wrapper.find('h3')
      expect(heading.exists()).toBe(true)
      expect(heading.text()).toBe('common.orderSummary')
    })

    it('should apply sticky positioning class', () => {
      const wrapper = mountComponent()
      expect(wrapper.classes()).toContain('sticky')
    })

    it('should apply proper styling classes', () => {
      const wrapper = mountComponent()
      expect(wrapper.classes()).toContain('bg-white')
      expect(wrapper.classes()).toContain('rounded-lg')
      expect(wrapper.classes()).toContain('shadow-sm')
    })

    it('should render all price rows', () => {
      const wrapper = mountComponent()
      const priceRows = wrapper.findAll('.flex.justify-between')
      // Subtotal, Shipping, Tax, Total = 4 rows
      expect(priceRows.length).toBe(4)
    })
  })

  describe('Props handling', () => {
    describe('orderData prop', () => {
      it('should display subtotal from orderData', () => {
        const orderData = createOrderData({ subtotal: 150 })
        const wrapper = mountComponent({ orderData })

        expect(mockFormatPrice).toHaveBeenCalledWith(150)
        expect(wrapper.text()).toContain('$150.00')
      })

      it('should display tax from orderData', () => {
        const orderData = createOrderData({ tax: 15 })
        const wrapper = mountComponent({ orderData })

        expect(mockFormatPrice).toHaveBeenCalledWith(15)
        expect(wrapper.text()).toContain('$15.00')
      })

      it('should display total from orderData', () => {
        const orderData = createOrderData({ total: 200 })
        const wrapper = mountComponent({ orderData })

        expect(mockFormatPrice).toHaveBeenCalledWith(200)
        expect(wrapper.text()).toContain('$200.00')
      })

      it('should display shipping cost from orderData', () => {
        const orderData = createOrderData({ shippingCost: 25 })
        const wrapper = mountComponent({ orderData })

        expect(mockFormatPrice).toHaveBeenCalledWith(25)
        expect(wrapper.text()).toContain('$25.00')
      })
    })

    describe('formatPrice prop', () => {
      it('should use custom formatPrice function', () => {
        const customFormatPrice = vi.fn((value: number) => `EUR ${value}`)
        const wrapper = mountComponent({ formatPrice: customFormatPrice })

        expect(customFormatPrice).toHaveBeenCalled()
        expect(wrapper.text()).toContain('EUR')
      })

      it('should call formatPrice for subtotal, tax, and total', () => {
        const orderData = createOrderData({
          subtotal: 100,
          shippingCost: 10,
          tax: 8,
          total: 118,
        })
        mountComponent({ orderData })

        expect(mockFormatPrice).toHaveBeenCalledWith(100) // subtotal
        expect(mockFormatPrice).toHaveBeenCalledWith(8) // tax
        expect(mockFormatPrice).toHaveBeenCalledWith(118) // total
      })
    })

    describe('null orderData', () => {
      it('should handle null orderData gracefully', () => {
        const wrapper = mountComponent({ orderData: null })
        expect(wrapper.exists()).toBe(true)
      })

      it('should display zero values when orderData is null', () => {
        mountComponent({ orderData: null })

        expect(mockFormatPrice).toHaveBeenCalledWith(0)
      })

      it('should render all price labels even with null orderData', () => {
        const wrapper = mountComponent({ orderData: null })

        expect(wrapper.text()).toContain('common.subtotal')
        expect(wrapper.text()).toContain('common.shipping')
        expect(wrapper.text()).toContain('common.tax')
        expect(wrapper.text()).toContain('common.total')
      })
    })
  })

  describe('Shipping cost display', () => {
    it('should display "free shipping" text when shipping cost is zero', () => {
      const orderData = createOrderData({ shippingCost: 0 })
      const wrapper = mountComponent({ orderData })

      expect(wrapper.text()).toContain('checkout.freeShipping')
    })

    it('should display formatted shipping cost when cost is greater than zero', () => {
      const orderData = createOrderData({ shippingCost: 15 })
      const wrapper = mountComponent({ orderData })

      expect(mockFormatPrice).toHaveBeenCalledWith(15)
      expect(wrapper.text()).toContain('$15.00')
    })

    it('should format shipping cost with formatPrice when orderData is null', () => {
      mountComponent({ orderData: null })

      // When orderData is null, formatPrice(0) should be called for shipping
      expect(mockFormatPrice).toHaveBeenCalledWith(0)
    })

    it('should not show free shipping label when shipping has a cost', () => {
      const orderData = createOrderData({ shippingCost: 5.99 })
      const wrapper = mountComponent({ orderData })

      expect(wrapper.text()).not.toContain('checkout.freeShipping')
      expect(wrapper.text()).toContain('$5.99')
    })
  })

  describe('i18n translations', () => {
    it('should display translated order summary heading', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('common.orderSummary')
    })

    it('should display translated subtotal label', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('common.subtotal')
    })

    it('should display translated shipping label', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('common.shipping')
    })

    it('should display translated tax label', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('common.tax')
    })

    it('should display translated total label', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('common.total')
    })

    it('should display translated free shipping label when applicable', () => {
      const orderData = createOrderData({ shippingCost: 0 })
      const wrapper = mountComponent({ orderData })

      expect(wrapper.text()).toContain('checkout.freeShipping')
    })
  })

  describe('Price formatting', () => {
    it('should format subtotal correctly', () => {
      const orderData = createOrderData({ subtotal: 99.99 })
      mountComponent({ orderData })

      expect(mockFormatPrice).toHaveBeenCalledWith(99.99)
    })

    it('should format tax correctly', () => {
      const orderData = createOrderData({ tax: 7.5 })
      mountComponent({ orderData })

      expect(mockFormatPrice).toHaveBeenCalledWith(7.5)
    })

    it('should format total correctly', () => {
      const orderData = createOrderData({ total: 149.99 })
      mountComponent({ orderData })

      expect(mockFormatPrice).toHaveBeenCalledWith(149.99)
    })

    it('should handle zero values in formatting', () => {
      const orderData = createOrderData({
        subtotal: 0,
        tax: 0,
        total: 0,
        shippingCost: 0,
      })
      mountComponent({ orderData })

      expect(mockFormatPrice).toHaveBeenCalledWith(0)
    })

    it('should handle large values in formatting', () => {
      const orderData = createOrderData({
        subtotal: 10000,
        tax: 800,
        total: 10800,
        shippingCost: 0,
      })
      mountComponent({ orderData })

      expect(mockFormatPrice).toHaveBeenCalledWith(10000)
      expect(mockFormatPrice).toHaveBeenCalledWith(800)
      expect(mockFormatPrice).toHaveBeenCalledWith(10800)
    })

    it('should handle decimal values correctly', () => {
      const orderData = createOrderData({
        subtotal: 123.45,
        tax: 9.88,
        total: 133.33,
        shippingCost: 0,
      })
      mountComponent({ orderData })

      expect(mockFormatPrice).toHaveBeenCalledWith(123.45)
      expect(mockFormatPrice).toHaveBeenCalledWith(9.88)
      expect(mockFormatPrice).toHaveBeenCalledWith(133.33)
    })
  })

  describe('Edge cases', () => {
    it('should handle orderData with zero subtotal', () => {
      const orderData = createOrderData({ subtotal: 0 })
      const wrapper = mountComponent({ orderData })

      expect(wrapper.exists()).toBe(true)
      expect(mockFormatPrice).toHaveBeenCalledWith(0)
    })

    it('should handle orderData with zero tax', () => {
      const orderData = createOrderData({ tax: 0 })
      const wrapper = mountComponent({ orderData })

      expect(wrapper.exists()).toBe(true)
      expect(mockFormatPrice).toHaveBeenCalledWith(0)
    })

    it('should handle orderData with very small shipping cost', () => {
      const orderData = createOrderData({ shippingCost: 0.01 })
      const wrapper = mountComponent({ orderData })

      expect(mockFormatPrice).toHaveBeenCalledWith(0.01)
      expect(wrapper.text()).not.toContain('checkout.freeShipping')
    })

    it('should handle orderData with negative values gracefully', () => {
      const orderData = createOrderData({
        subtotal: -10,
        tax: -1,
        total: -11,
      })
      const wrapper = mountComponent({ orderData })

      expect(wrapper.exists()).toBe(true)
      expect(mockFormatPrice).toHaveBeenCalledWith(-10)
    })

    it('should handle missing optional fields in orderData', () => {
      const orderData: OrderData = {
        subtotal: 100,
        shippingCost: 10,
        tax: 8,
        total: 118,
        currency: 'USD',
        items: [],
      }
      const wrapper = mountComponent({ orderData })

      expect(wrapper.exists()).toBe(true)
    })

    it('should handle orderData with items array', () => {
      const orderData = createOrderData({
        items: [
          { productId: 1, productSnapshot: {}, quantity: 2, price: 50, total: 100 },
        ],
      })
      const wrapper = mountComponent({ orderData })

      expect(wrapper.exists()).toBe(true)
    })

    it('should handle formatPrice returning empty string', () => {
      const emptyFormatPrice = vi.fn(() => '')
      const wrapper = mountComponent({ formatPrice: emptyFormatPrice })

      expect(wrapper.exists()).toBe(true)
    })

    it('should handle formatPrice with special characters', () => {
      const specialFormatPrice = vi.fn((value: number) => `${value.toFixed(2)} EUR`)
      const wrapper = mountComponent({ formatPrice: specialFormatPrice })

      expect(wrapper.exists()).toBe(true)
      expect(wrapper.text()).toContain('EUR')
    })
  })

  describe('Visual structure', () => {
    it('should have border separator before total', () => {
      const wrapper = mountComponent()
      const borderElement = wrapper.find('.border-t')
      expect(borderElement.exists()).toBe(true)
    })

    it('should apply semibold font to total row', () => {
      const wrapper = mountComponent()
      const totalSection = wrapper.find('.border-t')
      const totalLabels = totalSection.findAll('.font-semibold')
      expect(totalLabels.length).toBeGreaterThan(0)
    })

    it('should have proper spacing between rows', () => {
      const wrapper = mountComponent()
      const spacingContainer = wrapper.find('.space-y-3')
      expect(spacingContainer.exists()).toBe(true)
    })

    it('should have heading styled correctly', () => {
      const wrapper = mountComponent()
      const heading = wrapper.find('h3')
      expect(heading.classes()).toContain('text-lg')
      expect(heading.classes()).toContain('font-semibold')
    })
  })

  describe('Dark mode support', () => {
    it('should have dark mode classes for background', () => {
      const wrapper = mountComponent()
      expect(wrapper.classes()).toContain('dark:bg-gray-800')
    })

    it('should have dark mode classes for border', () => {
      const wrapper = mountComponent()
      expect(wrapper.classes()).toContain('dark:border-gray-700')
    })

    it('should have dark mode classes for heading text', () => {
      const wrapper = mountComponent()
      const heading = wrapper.find('h3')
      expect(heading.classes()).toContain('dark:text-white')
    })
  })

  describe('Computed properties', () => {
    it('should recompute shippingLabel when orderData changes', async () => {
      const orderData = createOrderData({ shippingCost: 10 })
      const wrapper = mountComponent({ orderData })

      expect(wrapper.text()).toContain('$10.00')

      await wrapper.setProps({
        orderData: createOrderData({ shippingCost: 0 }),
      })

      expect(wrapper.text()).toContain('checkout.freeShipping')
    })

    it('should recompute shippingLabel when orderData becomes null', async () => {
      const orderData = createOrderData({ shippingCost: 10 })
      const wrapper = mountComponent({ orderData })

      expect(wrapper.text()).toContain('$10.00')

      await wrapper.setProps({ orderData: null })

      // When null, formatPrice(0) is called
      expect(mockFormatPrice).toHaveBeenCalledWith(0)
    })
  })

  describe('Accessibility', () => {
    it('should use semantic heading element', () => {
      const wrapper = mountComponent()
      const heading = wrapper.find('h3')
      expect(heading.exists()).toBe(true)
    })

    it('should use aside element for complementary content', () => {
      const wrapper = mountComponent()
      expect(wrapper.element.tagName).toBe('ASIDE')
    })

    it('should have readable text contrast classes', () => {
      const wrapper = mountComponent()
      const grayText = wrapper.findAll('.text-gray-600')
      expect(grayText.length).toBeGreaterThan(0)
    })

    it('should have proper heading hierarchy', () => {
      const wrapper = mountComponent()
      const h1 = wrapper.findAll('h1')
      const h2 = wrapper.findAll('h2')
      const h3 = wrapper.findAll('h3')

      // Should only have h3, no h1 or h2 (those would be in parent)
      expect(h1.length).toBe(0)
      expect(h2.length).toBe(0)
      expect(h3.length).toBe(1)
    })
  })

  describe('Responsive design', () => {
    it('should have sticky positioning for scroll behavior', () => {
      const wrapper = mountComponent()
      expect(wrapper.classes()).toContain('sticky')
      expect(wrapper.classes()).toContain('top-6')
    })

    it('should have padding for proper spacing', () => {
      const wrapper = mountComponent()
      expect(wrapper.classes()).toContain('p-6')
    })
  })
})
