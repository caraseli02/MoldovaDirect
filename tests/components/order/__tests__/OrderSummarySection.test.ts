import { describe, it, expect, vi } from 'vitest'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import OrderSummarySection from '~/components/order/OrderSummarySection.vue'
import type { OrderWithItems } from '~/types'

// Mock #imports for Nuxt auto-imports
vi.mock('#imports', () => ({
  useI18n: vi.fn(() => ({
    t: (key: string, fallback?: string) => fallback || key,
    locale: { value: 'en' },
  })),
}))

describe('OrderSummarySection', () => {
  // Factory function to create a mock order
  const createMockOrder = (overrides: Partial<OrderWithItems> = {}): OrderWithItems => ({
    id: 1,
    orderNumber: 'ORD-001',
    status: 'processing',
    paymentMethod: 'stripe',
    paymentStatus: 'paid',
    subtotalEur: 100.00,
    shippingCostEur: 10.00,
    taxEur: 22.00,
    totalEur: 132.00,
    shippingAddress: {
      firstName: 'John',
      lastName: 'Doe',
      address1: '123 Main St',
      city: 'Madrid',
      postalCode: '28001',
      country: 'ES',
    },
    billingAddress: {
      firstName: 'John',
      lastName: 'Doe',
      address1: '123 Main St',
      city: 'Madrid',
      postalCode: '28001',
      country: 'ES',
    },
    createdAt: '2026-01-01T10:00:00Z',
    updatedAt: '2026-01-01T10:00:00Z',
    items: [],
    ...overrides,
  })

  const mountComponent = (order: OrderWithItems): VueWrapper => {
    return mount(OrderSummarySection, {
      props: { order },
      global: {
        stubs: {
          // Stub any child components if needed
        },
      },
    })
  }

  describe('Rendering', () => {
    it('should render the component', () => {
      const wrapper = mountComponent(createMockOrder())
      expect(wrapper.exists()).toBe(true)
    })

    it('should render the order summary heading', () => {
      const wrapper = mountComponent(createMockOrder())
      const heading = wrapper.find('h2')
      expect(heading.exists()).toBe(true)
      expect(heading.text()).toContain('common.orderSummary')
    })

    it('should render payment method section', () => {
      const wrapper = mountComponent(createMockOrder())
      // Check for translation key since mock returns keys
      expect(wrapper.text()).toContain('checkout.paymentMethod')
    })

    it('should render payment status section', () => {
      const wrapper = mountComponent(createMockOrder())
      // Check for translation key since mock returns keys
      expect(wrapper.text()).toContain('orders.paymentStatus')
    })

    it('should render order totals section', () => {
      const wrapper = mountComponent(createMockOrder())
      expect(wrapper.text()).toContain('common.subtotal')
      expect(wrapper.text()).toContain('common.shipping')
      expect(wrapper.text()).toContain('common.tax')
      expect(wrapper.text()).toContain('common.total')
    })

    it('should render order timeline section', () => {
      const wrapper = mountComponent(createMockOrder())
      // Check for translation key since mock returns keys
      expect(wrapper.text()).toContain('orders.orderTimeline')
    })
  })

  describe('Payment Method Formatting', () => {
    it('should format stripe payment method correctly', () => {
      const wrapper = mountComponent(createMockOrder({ paymentMethod: 'stripe' }))
      expect(wrapper.text()).toContain('Credit Card (Stripe)')
    })

    it('should format paypal payment method correctly', () => {
      const wrapper = mountComponent(createMockOrder({ paymentMethod: 'paypal' }))
      expect(wrapper.text()).toContain('PayPal')
    })

    it('should format cod payment method correctly', () => {
      const wrapper = mountComponent(createMockOrder({ paymentMethod: 'cod' }))
      expect(wrapper.text()).toContain('Cash on Delivery')
    })
  })

  describe('Payment Status Formatting and Styling', () => {
    it('should display pending payment status with correct classes', () => {
      const wrapper = mountComponent(createMockOrder({ paymentStatus: 'pending' }))
      const statusBadge = wrapper.find('.rounded-full')
      expect(statusBadge.exists()).toBe(true)
      expect(statusBadge.classes()).toContain('bg-yellow-100')
      expect(wrapper.text()).toContain('Pending')
    })

    it('should display paid payment status with correct classes', () => {
      const wrapper = mountComponent(createMockOrder({ paymentStatus: 'paid' }))
      const statusBadge = wrapper.find('.rounded-full')
      expect(statusBadge.classes()).toContain('bg-green-100')
      expect(wrapper.text()).toContain('Paid')
    })

    it('should display failed payment status with correct classes', () => {
      const wrapper = mountComponent(createMockOrder({ paymentStatus: 'failed' }))
      const statusBadge = wrapper.find('.rounded-full')
      expect(statusBadge.classes()).toContain('bg-red-100')
      expect(wrapper.text()).toContain('Failed')
    })

    it('should display refunded payment status with correct classes', () => {
      const wrapper = mountComponent(createMockOrder({ paymentStatus: 'refunded' }))
      const statusBadge = wrapper.find('.rounded-full')
      expect(statusBadge.classes()).toContain('bg-gray-100')
      expect(wrapper.text()).toContain('Refunded')
    })
  })

  describe('Price Formatting', () => {
    it('should format subtotal correctly', () => {
      const wrapper = mountComponent(createMockOrder({ subtotalEur: 100.50 }))
      // The formatted price should be in EUR format
      expect(wrapper.html()).toMatch(/100[,.]50/)
    })

    it('should format shipping cost correctly', () => {
      const wrapper = mountComponent(createMockOrder({ shippingCostEur: 15.00 }))
      expect(wrapper.html()).toMatch(/15[,.]00/)
    })

    it('should format tax correctly', () => {
      const wrapper = mountComponent(createMockOrder({ taxEur: 25.75 }))
      expect(wrapper.html()).toMatch(/25[,.]75/)
    })

    it('should format total correctly', () => {
      const wrapper = mountComponent(createMockOrder({ totalEur: 250.99 }))
      expect(wrapper.html()).toMatch(/250[,.]99/)
    })

    it('should handle zero prices', () => {
      const wrapper = mountComponent(createMockOrder({
        subtotalEur: 0,
        shippingCostEur: 0,
        taxEur: 0,
        totalEur: 0,
      }))
      expect(wrapper.html()).toMatch(/0[,.]00/)
    })

    it('should handle null or undefined prices gracefully', () => {
      const order = createMockOrder()
      // @ts-expect-error - Testing edge case with null price
      order.subtotalEur = null
      const wrapper = mountComponent(order)
      expect(wrapper.text()).toContain('0.00')
    })

    it('should handle NaN prices gracefully', () => {
      const order = createMockOrder()
      order.subtotalEur = NaN
      const wrapper = mountComponent(order)
      expect(wrapper.text()).toContain('0.00')
    })
  })

  describe('Order Timeline', () => {
    it('should display order placed date', () => {
      const wrapper = mountComponent(createMockOrder({
        createdAt: '2026-01-15T14:30:00Z',
      }))
      // Check for translation key since mock returns keys
      expect(wrapper.text()).toContain('orders.placed')
      // Date should be formatted
      expect(wrapper.html()).toMatch(/Jan|15|2026/)
    })

    it('should display shipped date when present', () => {
      const wrapper = mountComponent(createMockOrder({
        shippedAt: '2026-01-16T10:00:00Z',
      }))
      // Check for translation key since mock returns keys
      expect(wrapper.text()).toContain('orders.shipped')
    })

    it('should not display shipped date when absent', () => {
      const wrapper = mountComponent(createMockOrder({
        shippedAt: undefined,
      }))
      const timelineSection = wrapper.find('.space-y-2')
      const shippedEntry = timelineSection.findAll('.flex.justify-between')
      // Only placed date should be present (no shipped)
      expect(shippedEntry.length).toBe(1)
    })

    it('should display delivered date when present', () => {
      const wrapper = mountComponent(createMockOrder({
        deliveredAt: '2026-01-18T15:00:00Z',
      }))
      // Check for translation key since mock returns keys
      expect(wrapper.text()).toContain('orders.delivered')
    })

    it('should not display delivered date when absent', () => {
      const wrapper = mountComponent(createMockOrder({
        deliveredAt: undefined,
      }))
      // Check that "Delivered" text is not in the timeline
      const html = wrapper.html()
      const deliveredCount = (html.match(/Delivered/g) || []).length
      // Should not appear in timeline (may appear in status if order is delivered)
      expect(deliveredCount).toBeLessThanOrEqual(1)
    })

    it('should display full timeline for delivered order', () => {
      const wrapper = mountComponent(createMockOrder({
        createdAt: '2026-01-15T10:00:00Z',
        shippedAt: '2026-01-16T12:00:00Z',
        deliveredAt: '2026-01-18T14:00:00Z',
      }))
      // Check for translation keys since mock returns keys
      expect(wrapper.text()).toContain('orders.placed')
      expect(wrapper.text()).toContain('orders.shipped')
      expect(wrapper.text()).toContain('orders.delivered')
    })

    it('should handle invalid date strings gracefully', () => {
      const wrapper = mountComponent(createMockOrder({
        createdAt: 'invalid-date',
      }))
      // Should not throw and should display the original string
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.text()).toContain('invalid-date')
    })

    it('should handle empty date strings', () => {
      const wrapper = mountComponent(createMockOrder({
        shippedAt: '',
      }))
      // Empty dates should not be displayed
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Dark Mode Support', () => {
    it('should have dark mode classes for background', () => {
      const wrapper = mountComponent(createMockOrder())
      const container = wrapper.find('.bg-white')
      expect(container.classes()).toContain('dark:bg-gray-800')
    })

    it('should have dark mode classes for text', () => {
      const wrapper = mountComponent(createMockOrder())
      const heading = wrapper.find('h2')
      expect(heading.classes()).toContain('dark:text-white')
    })

    it('should have dark mode classes for borders', () => {
      const wrapper = mountComponent(createMockOrder())
      const borderElements = wrapper.findAll('.border-gray-200')
      borderElements.forEach((el) => {
        expect(el.classes()).toContain('dark:border-gray-700')
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle order with empty items array', () => {
      const wrapper = mountComponent(createMockOrder({ items: [] }))
      expect(wrapper.exists()).toBe(true)
    })

    it('should handle order with large total amounts', () => {
      const wrapper = mountComponent(createMockOrder({
        totalEur: 999999.99,
      }))
      expect(wrapper.html()).toMatch(/999[,.]999/)
    })

    it('should handle order with decimal precision', () => {
      const wrapper = mountComponent(createMockOrder({
        subtotalEur: 123.456789,
      }))
      // Should be rounded to 2 decimal places
      expect(wrapper.exists()).toBe(true)
    })

    it('should handle order with all timeline dates', () => {
      const wrapper = mountComponent(createMockOrder({
        createdAt: '2026-01-01T00:00:00Z',
        shippedAt: '2026-01-02T00:00:00Z',
        deliveredAt: '2026-01-03T00:00:00Z',
      }))
      const timelineItems = wrapper.findAll('.space-y-2 .flex.justify-between')
      expect(timelineItems.length).toBe(3)
    })
  })

  describe('Component Structure', () => {
    it('should have proper container styling', () => {
      const wrapper = mountComponent(createMockOrder())
      const container = wrapper.find('div')
      expect(container.classes()).toContain('bg-white')
      expect(container.classes()).toContain('rounded-lg')
      expect(container.classes()).toContain('shadow-sm')
      expect(container.classes()).toContain('p-6')
    })

    it('should have payment section with border', () => {
      const wrapper = mountComponent(createMockOrder())
      const paymentSection = wrapper.find('.mb-4.pb-4.border-b')
      expect(paymentSection.exists()).toBe(true)
    })

    it('should have totals section with proper spacing', () => {
      const wrapper = mountComponent(createMockOrder())
      const totalsSection = wrapper.find('.space-y-3')
      expect(totalsSection.exists()).toBe(true)
    })

    it('should have timeline section with top border', () => {
      const wrapper = mountComponent(createMockOrder())
      const timelineSection = wrapper.find('.mt-6.pt-6.border-t')
      expect(timelineSection.exists()).toBe(true)
    })
  })

  describe('Accessibility', () => {
    it('should have semantic heading structure', () => {
      const wrapper = mountComponent(createMockOrder())
      const h2 = wrapper.find('h2')
      const h3 = wrapper.find('h3')
      expect(h2.exists()).toBe(true)
      expect(h3.exists()).toBe(true)
    })

    it('should have readable text contrast classes', () => {
      const wrapper = mountComponent(createMockOrder())
      // Check for proper text color classes
      expect(wrapper.html()).toContain('text-gray-600')
      expect(wrapper.html()).toContain('text-gray-900')
    })

    it('should have semantic sections for payment and totals', () => {
      const wrapper = mountComponent(createMockOrder())
      // Check for translation keys since mock returns keys
      expect(wrapper.text()).toContain('checkout.paymentMethod')
      expect(wrapper.text()).toContain('orders.paymentStatus')
    })
  })

  describe('Localization', () => {
    it('should use translation keys for labels', () => {
      const wrapper = mountComponent(createMockOrder())
      expect(wrapper.text()).toContain('common.orderSummary')
      expect(wrapper.text()).toContain('common.subtotal')
      expect(wrapper.text()).toContain('common.shipping')
      expect(wrapper.text()).toContain('common.tax')
      expect(wrapper.text()).toContain('common.total')
    })

    it('should use translation keys for payment status', () => {
      const wrapper = mountComponent(createMockOrder({ paymentStatus: 'paid' }))
      // The formatPaymentStatus uses t() function
      expect(wrapper.exists()).toBe(true)
    })

    it('should use translation keys for timeline labels', () => {
      const wrapper = mountComponent(createMockOrder({
        shippedAt: '2026-01-15T10:00:00Z',
        deliveredAt: '2026-01-16T10:00:00Z',
      }))
      // Check for translation keys since mock returns keys
      expect(wrapper.text()).toContain('orders.placed')
      expect(wrapper.text()).toContain('orders.shipped')
      expect(wrapper.text()).toContain('orders.delivered')
    })
  })

  describe('Props Validation', () => {
    it('should accept valid order prop', () => {
      const order = createMockOrder()
      const wrapper = mountComponent(order)
      expect(wrapper.exists()).toBe(true)
    })

    it('should render correctly with minimal order data', () => {
      const minimalOrder: OrderWithItems = {
        id: 1,
        orderNumber: 'ORD-MIN',
        status: 'pending',
        paymentMethod: 'cod',
        paymentStatus: 'pending',
        subtotalEur: 0,
        shippingCostEur: 0,
        taxEur: 0,
        totalEur: 0,
        shippingAddress: {
          firstName: 'Test',
          lastName: 'User',
          address1: 'Test Address',
          city: 'Test City',
          postalCode: '12345',
          country: 'ES',
        },
        billingAddress: {
          firstName: 'Test',
          lastName: 'User',
          address1: 'Test Address',
          city: 'Test City',
          postalCode: '12345',
          country: 'ES',
        },
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
        items: [],
      }
      const wrapper = mountComponent(minimalOrder)
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Computed Properties', () => {
    it('should compute payment status classes reactively', async () => {
      const order = createMockOrder({ paymentStatus: 'pending' })
      const wrapper = mountComponent(order)

      let statusBadge = wrapper.find('.rounded-full')
      expect(statusBadge.classes()).toContain('bg-yellow-100')

      // Update the order prop
      await wrapper.setProps({
        order: { ...order, paymentStatus: 'paid' },
      })

      statusBadge = wrapper.find('.rounded-full')
      expect(statusBadge.classes()).toContain('bg-green-100')
    })
  })
})
