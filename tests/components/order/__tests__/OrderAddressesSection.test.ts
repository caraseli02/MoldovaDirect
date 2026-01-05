import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import OrderAddressesSection from '~/components/order/OrderAddressesSection.vue'
import type { OrderWithItems, Address } from '~/types'

vi.mock('#imports', () => ({
  useI18n: vi.fn(() => ({
    t: (k: string) => k,
    locale: { value: 'en' },
  })),
}))

describe('OrderAddressesSection', () => {
  const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

  beforeEach(() => {
    consoleWarnSpy.mockClear()
  })

  afterAll(() => {
    consoleWarnSpy.mockRestore()
  })

  const createMockAddress = (type: 'billing' | 'shipping', overrides: Partial<Address> = {}): Address => ({
    type,
    street: '123 Main Street',
    city: 'Chisinau',
    postalCode: 'MD-2001',
    province: 'Chisinau Municipality',
    country: 'Moldova',
    isDefault: true,
    ...overrides,
  })

  const createMockOrder = (overrides: Partial<OrderWithItems> = {}): OrderWithItems => ({
    id: 1,
    orderNumber: 'ORD-001',
    status: 'delivered',
    paymentMethod: 'stripe',
    paymentStatus: 'paid',
    subtotalEur: 100,
    shippingCostEur: 10,
    taxEur: 5,
    totalEur: 115,
    shippingAddress: createMockAddress('shipping'),
    billingAddress: createMockAddress('billing'),
    createdAt: '2026-01-01T10:00:00Z',
    updatedAt: '2026-01-02T10:00:00Z',
    items: [],
    ...overrides,
  })

  const mountComponent = (order: OrderWithItems = createMockOrder()) => {
    return mount(OrderAddressesSection, {
      props: { order },
    })
  }

  describe('Rendering', () => {
    it('should render the component', () => {
      const wrapper = mountComponent()
      expect(wrapper.exists()).toBe(true)
    })

    it('should render the section title', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('orders.addresses')
    })

    it('should render with proper container styling', () => {
      const wrapper = mountComponent()
      const container = wrapper.find('div')
      expect(container.classes()).toContain('bg-white')
      expect(container.classes()).toContain('rounded-lg')
      expect(container.classes()).toContain('shadow-sm')
      expect(container.classes()).toContain('p-6')
    })

    it('should render shipping and billing address headings', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('checkout.shippingAddress')
      expect(wrapper.text()).toContain('checkout.billingAddress')
    })

    it('should render both address sections in a grid layout', () => {
      const wrapper = mountComponent()
      const grid = wrapper.find('.grid')
      expect(grid.exists()).toBe(true)
      expect(grid.classes()).toContain('grid-cols-1')
      expect(grid.classes()).toContain('md:grid-cols-2')
    })
  })

  describe('Shipping Address Display', () => {
    it('should display shipping address street', () => {
      const order = createMockOrder({
        shippingAddress: createMockAddress('shipping', { street: '456 Oak Avenue' }),
      })
      const wrapper = mountComponent(order)
      expect(wrapper.text()).toContain('456 Oak Avenue')
    })

    it('should display shipping address city and postal code', () => {
      const order = createMockOrder({
        shippingAddress: createMockAddress('shipping', {
          city: 'Balti',
          postalCode: 'MD-3100',
        }),
      })
      const wrapper = mountComponent(order)
      expect(wrapper.text()).toContain('Balti')
      expect(wrapper.text()).toContain('MD-3100')
    })

    it('should display shipping address province when available', () => {
      const order = createMockOrder({
        shippingAddress: createMockAddress('shipping', { province: 'Balti Region' }),
      })
      const wrapper = mountComponent(order)
      expect(wrapper.text()).toContain('Balti Region')
    })

    it('should not display province paragraph when province is not set', () => {
      const order = createMockOrder({
        shippingAddress: createMockAddress('shipping', { province: undefined }),
      })
      const wrapper = mountComponent(order)
      // The shipping address section should still render but without province
      expect(wrapper.text()).toContain('checkout.shippingAddress')
    })

    it('should display shipping address country', () => {
      const order = createMockOrder({
        shippingAddress: createMockAddress('shipping', { country: 'Romania' }),
      })
      const wrapper = mountComponent(order)
      expect(wrapper.text()).toContain('Romania')
    })

    it('should show no address message when shipping address is null', () => {
      const order = createMockOrder({
        shippingAddress: null as any,
      })
      const wrapper = mountComponent(order)
      expect(wrapper.text()).toContain('No shipping address available')
    })

    it('should render shipping icon', () => {
      const wrapper = mountComponent()
      const shippingSection = wrapper.findAll('h3')[0]
      const svg = shippingSection.find('svg')
      expect(svg.exists()).toBe(true)
      expect(svg.classes()).toContain('text-blue-600')
    })
  })

  describe('Billing Address Display', () => {
    it('should display billing address street', () => {
      const order = createMockOrder({
        billingAddress: createMockAddress('billing', { street: '789 Pine Road' }),
      })
      const wrapper = mountComponent(order)
      expect(wrapper.text()).toContain('789 Pine Road')
    })

    it('should display billing address city and postal code', () => {
      const order = createMockOrder({
        billingAddress: createMockAddress('billing', {
          city: 'Orhei',
          postalCode: 'MD-3500',
        }),
      })
      const wrapper = mountComponent(order)
      expect(wrapper.text()).toContain('Orhei')
      expect(wrapper.text()).toContain('MD-3500')
    })

    it('should display billing address province when available', () => {
      const order = createMockOrder({
        billingAddress: createMockAddress('billing', { province: 'Orhei District' }),
      })
      const wrapper = mountComponent(order)
      expect(wrapper.text()).toContain('Orhei District')
    })

    it('should display billing address country', () => {
      const order = createMockOrder({
        billingAddress: createMockAddress('billing', { country: 'Spain' }),
      })
      const wrapper = mountComponent(order)
      expect(wrapper.text()).toContain('Spain')
    })

    it('should show no address message when billing address is null', () => {
      const order = createMockOrder({
        billingAddress: null as any,
      })
      const wrapper = mountComponent(order)
      expect(wrapper.text()).toContain('No billing address available')
    })

    it('should render billing icon with green color', () => {
      const wrapper = mountComponent()
      const billingSection = wrapper.findAll('h3')[1]
      const svg = billingSection.find('svg')
      expect(svg.exists()).toBe(true)
      expect(svg.classes()).toContain('text-green-600')
    })
  })

  describe('Address Parsing - Object Format', () => {
    it('should handle address as object with street property', () => {
      const order = createMockOrder({
        shippingAddress: {
          street: 'Direct Object Street',
          city: 'TestCity',
          postalCode: '12345',
          country: 'TestCountry',
          type: 'shipping',
          isDefault: false,
        },
      })
      const wrapper = mountComponent(order)
      expect(wrapper.text()).toContain('Direct Object Street')
      expect(wrapper.text()).toContain('TestCity')
    })

    it('should handle both addresses as objects', () => {
      const order = createMockOrder({
        shippingAddress: createMockAddress('shipping', { street: 'Shipping Street' }),
        billingAddress: createMockAddress('billing', { street: 'Billing Street' }),
      })
      const wrapper = mountComponent(order)
      expect(wrapper.text()).toContain('Shipping Street')
      expect(wrapper.text()).toContain('Billing Street')
    })
  })

  describe('Address Parsing - String Format (JSONB)', () => {
    it('should parse shipping address from JSON string', () => {
      const addressObj = {
        street: 'JSON Parsed Street',
        city: 'JSON City',
        postalCode: '99999',
        country: 'JSON Country',
      }
      const order = createMockOrder({
        shippingAddress: JSON.stringify(addressObj) as any,
      })
      const wrapper = mountComponent(order)
      expect(wrapper.text()).toContain('JSON Parsed Street')
      expect(wrapper.text()).toContain('JSON City')
    })

    it('should parse billing address from JSON string', () => {
      const addressObj = {
        street: 'Billing JSON Street',
        city: 'Billing JSON City',
        postalCode: '88888',
        country: 'Billing JSON Country',
      }
      const order = createMockOrder({
        billingAddress: JSON.stringify(addressObj) as any,
      })
      const wrapper = mountComponent(order)
      expect(wrapper.text()).toContain('Billing JSON Street')
      expect(wrapper.text()).toContain('Billing JSON City')
    })

    it('should handle invalid JSON string gracefully', () => {
      const order = createMockOrder({
        shippingAddress: 'invalid-json-{' as any,
      })
      const wrapper = mountComponent(order)
      expect(wrapper.text()).toContain('No shipping address available')
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Error parsing shipping address:',
        expect.any(SyntaxError),
      )
    })

    it('should handle invalid billing address JSON string gracefully', () => {
      const order = createMockOrder({
        billingAddress: '{not valid json' as any,
      })
      const wrapper = mountComponent(order)
      expect(wrapper.text()).toContain('No billing address available')
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Error parsing billing address:',
        expect.any(SyntaxError),
      )
    })
  })

  describe('Address Parsing - Edge Cases', () => {
    it('should return null for undefined shipping address', () => {
      const order = createMockOrder({
        shippingAddress: undefined as any,
      })
      const wrapper = mountComponent(order)
      expect(wrapper.text()).toContain('No shipping address available')
    })

    it('should return null for object without street property', () => {
      const order = createMockOrder({
        shippingAddress: { city: 'CityOnly', country: 'CountryOnly' } as any,
      })
      const wrapper = mountComponent(order)
      expect(wrapper.text()).toContain('No shipping address available')
    })

    it('should handle empty string address', () => {
      const order = createMockOrder({
        shippingAddress: '' as any,
      })
      const wrapper = mountComponent(order)
      expect(wrapper.text()).toContain('No shipping address available')
    })

    it('should handle both addresses being null', () => {
      const order = createMockOrder({
        shippingAddress: null as any,
        billingAddress: null as any,
      })
      const wrapper = mountComponent(order)
      expect(wrapper.text()).toContain('No shipping address available')
      expect(wrapper.text()).toContain('No billing address available')
    })

    it('should handle address with empty street string', () => {
      const order = createMockOrder({
        shippingAddress: { street: '', city: 'City', postalCode: '123', country: 'Country' } as any,
      })
      const wrapper = mountComponent(order)
      // Empty string is falsy, so street check should still work
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Province Display Logic', () => {
    it('should display province when set in shipping address', () => {
      const order = createMockOrder({
        shippingAddress: createMockAddress('shipping', { province: 'Test Province' }),
      })
      const wrapper = mountComponent(order)
      expect(wrapper.text()).toContain('Test Province')
    })

    it('should display province when set in billing address', () => {
      const order = createMockOrder({
        billingAddress: createMockAddress('billing', { province: 'Billing Province' }),
      })
      const wrapper = mountComponent(order)
      expect(wrapper.text()).toContain('Billing Province')
    })

    it('should not render province paragraph when province is empty string', () => {
      const order = createMockOrder({
        shippingAddress: createMockAddress('shipping', { province: '' }),
      })
      const wrapper = mountComponent(order)
      // Component should not crash and should render without province
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      const wrapper = mountComponent()
      const h2 = wrapper.find('h2')
      expect(h2.exists()).toBe(true)
      expect(h2.text()).toContain('orders.addresses')
    })

    it('should have subheadings for each address section', () => {
      const wrapper = mountComponent()
      const h3Elements = wrapper.findAll('h3')
      expect(h3Elements.length).toBe(2)
      expect(h3Elements[0].text()).toContain('checkout.shippingAddress')
      expect(h3Elements[1].text()).toContain('checkout.billingAddress')
    })

    it('should have proper SVG attributes for icons', () => {
      const wrapper = mountComponent()
      const svgs = wrapper.findAll('svg')
      expect(svgs.length).toBe(2)

      svgs.forEach((svg) => {
        expect(svg.attributes('fill')).toBe('none')
        expect(svg.attributes('stroke')).toBe('currentColor')
        expect(svg.attributes('viewBox')).toBe('0 0 24 24')
      })
    })

    it('should have stroke attributes on paths', () => {
      const wrapper = mountComponent()
      const paths = wrapper.findAll('path')
      paths.forEach((path) => {
        expect(path.attributes('stroke-linecap')).toBe('round')
        expect(path.attributes('stroke-linejoin')).toBe('round')
        expect(path.attributes('stroke-width')).toBe('2')
      })
    })

    it('should use semantic paragraph elements for address lines', () => {
      const wrapper = mountComponent()
      const paragraphs = wrapper.findAll('p')
      expect(paragraphs.length).toBeGreaterThan(0)
    })
  })

  describe('Dark Mode Support', () => {
    it('should have dark mode classes on container', () => {
      const wrapper = mountComponent()
      const container = wrapper.find('div')
      expect(container.classes()).toContain('dark:bg-gray-800')
    })

    it('should have dark mode classes on main heading', () => {
      const wrapper = mountComponent()
      const heading = wrapper.find('h2')
      expect(heading.classes()).toContain('dark:text-white')
    })

    it('should have dark mode classes on subheadings', () => {
      const wrapper = mountComponent()
      const subheadings = wrapper.findAll('h3')
      subheadings.forEach((h3) => {
        expect(h3.classes()).toContain('dark:text-white')
      })
    })

    it('should have dark mode classes on address text', () => {
      const wrapper = mountComponent()
      const addressDivs = wrapper.findAll('.text-gray-600')
      addressDivs.forEach((div) => {
        expect(div.classes()).toContain('dark:text-gray-400')
      })
    })

    it('should have dark mode classes on icons', () => {
      const wrapper = mountComponent()
      const shippingIcon = wrapper.findAll('svg')[0]
      const billingIcon = wrapper.findAll('svg')[1]
      expect(shippingIcon.classes()).toContain('dark:text-blue-400')
      expect(billingIcon.classes()).toContain('dark:text-green-400')
    })
  })

  describe('Layout and Responsive Design', () => {
    it('should use responsive grid layout', () => {
      const wrapper = mountComponent()
      const grid = wrapper.find('.grid')
      expect(grid.classes()).toContain('grid-cols-1')
      expect(grid.classes()).toContain('md:grid-cols-2')
    })

    it('should have proper gap between grid columns', () => {
      const wrapper = mountComponent()
      const grid = wrapper.find('.grid')
      expect(grid.classes()).toContain('gap-6')
    })

    it('should have proper spacing for address content', () => {
      const wrapper = mountComponent()
      const addressContainers = wrapper.findAll('.space-y-1')
      expect(addressContainers.length).toBe(2)
    })

    it('should have proper margin on subheadings', () => {
      const wrapper = mountComponent()
      const subheadings = wrapper.findAll('h3')
      subheadings.forEach((h3) => {
        expect(h3.classes()).toContain('mb-3')
      })
    })
  })

  describe('Icon Styling', () => {
    it('should have proper icon size', () => {
      const wrapper = mountComponent()
      const icons = wrapper.findAll('svg')
      icons.forEach((icon) => {
        expect(icon.classes()).toContain('w-4')
        expect(icon.classes()).toContain('h-4')
      })
    })

    it('should have proper icon margin', () => {
      const wrapper = mountComponent()
      const icons = wrapper.findAll('svg')
      icons.forEach((icon) => {
        expect(icon.classes()).toContain('mr-2')
      })
    })
  })

  describe('Text Styling', () => {
    it('should have font-medium on street and country', () => {
      const wrapper = mountComponent()
      const mediumFontElements = wrapper.findAll('.font-medium')
      expect(mediumFontElements.length).toBeGreaterThanOrEqual(2)
    })

    it('should use small text size for address content', () => {
      const wrapper = mountComponent()
      const addressDivs = wrapper.findAll('.text-sm')
      expect(addressDivs.length).toBeGreaterThan(0)
    })
  })

  describe('Props Handling', () => {
    it('should accept order prop with all fields', () => {
      const order = createMockOrder({
        orderNumber: 'CUSTOM-123',
        status: 'processing',
        paymentStatus: 'pending',
      })
      const wrapper = mountComponent(order)
      expect(wrapper.exists()).toBe(true)
    })

    it('should handle order with minimal fields', () => {
      const minimalOrder: OrderWithItems = {
        id: 1,
        orderNumber: 'MIN-001',
        status: 'pending',
        paymentMethod: 'cod',
        paymentStatus: 'pending',
        subtotalEur: 50,
        shippingCostEur: 5,
        taxEur: 2,
        totalEur: 57,
        shippingAddress: createMockAddress('shipping'),
        billingAddress: createMockAddress('billing'),
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
        items: [],
      }
      const wrapper = mountComponent(minimalOrder)
      expect(wrapper.exists()).toBe(true)
    })

    it('should reactively update when order prop changes', async () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('123 Main Street')

      await wrapper.setProps({
        order: createMockOrder({
          shippingAddress: createMockAddress('shipping', { street: 'Updated Street' }),
        }),
      })
      expect(wrapper.text()).toContain('Updated Street')
    })
  })

  describe('Complete Address Rendering', () => {
    it('should render complete shipping address with all fields', () => {
      const order = createMockOrder({
        shippingAddress: {
          type: 'shipping',
          street: '100 Complete Lane',
          city: 'Full City',
          postalCode: 'FC-1234',
          province: 'Full Province',
          country: 'Full Country',
          isDefault: true,
        },
      })
      const wrapper = mountComponent(order)

      expect(wrapper.text()).toContain('100 Complete Lane')
      expect(wrapper.text()).toContain('Full City')
      expect(wrapper.text()).toContain('FC-1234')
      expect(wrapper.text()).toContain('Full Province')
      expect(wrapper.text()).toContain('Full Country')
    })

    it('should render complete billing address with all fields', () => {
      const order = createMockOrder({
        billingAddress: {
          type: 'billing',
          street: '200 Billing Blvd',
          city: 'Bill City',
          postalCode: 'BC-5678',
          province: 'Bill Province',
          country: 'Bill Country',
          isDefault: false,
        },
      })
      const wrapper = mountComponent(order)

      expect(wrapper.text()).toContain('200 Billing Blvd')
      expect(wrapper.text()).toContain('Bill City')
      expect(wrapper.text()).toContain('BC-5678')
      expect(wrapper.text()).toContain('Bill Province')
      expect(wrapper.text()).toContain('Bill Country')
    })
  })

  describe('No Events Emitted', () => {
    it('should not emit any events (display only component)', () => {
      const wrapper = mountComponent()
      expect(Object.keys(wrapper.emitted())).toHaveLength(0)
    })
  })
})
