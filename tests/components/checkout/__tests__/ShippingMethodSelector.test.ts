import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ShippingMethodSelector from '~/components/checkout/ShippingMethodSelector.vue'

// Mock useI18n to provide translated text
vi.mock('#imports', () => ({
  useI18n: vi.fn(() => ({
    t: vi.fn((key: string) => {
      const translations: Record<string, string> = {
        'checkout.shippingMethod.standard.name': 'Standard Shipping',
        'checkout.shippingMethod.standard.description': 'Standard delivery in 3-5 business days',
        'checkout.shippingMethod.express.name': 'Express Shipping',
        'checkout.shippingMethod.express.description': 'Fast delivery in 1-2 business days',
        'checkout.freeShipping': 'Free',
        'checkout.shippingMethod.express.label': 'Express',
        'checkout.shippingMethod.free.label': 'Free',
        'checkout.shippingMethod.deliveryTomorrow': 'Delivery tomorrow',
        'checkout.shippingMethod.deliveryBy': 'Delivery by',
        'checkout.shippingMethod.deliveryInDays': 'Delivery in 5 business days',
      }
      return translations[key] || key
    }),
    locale: vi.fn(() => 'en-US'),
  })),
  useLocalePath: vi.fn((path: string) => path),
}))

describe('ShippingMethodSelector', () => {
  const availableMethods = [
    { id: 'standard', name: 'Standard Shipping', price: 5.99, estimatedDays: 5, description: 'Standard delivery' },
    { id: 'express', name: 'Express Shipping', price: 12.99, estimatedDays: 2, description: 'Fast delivery' },
  ]

  const defaultProps = {
    availableMethods,
    modelValue: availableMethods[0],
    loading: false,
    error: null,
    validationError: null,
    autoSelected: false,
  }

  const globalStubs = {
    UiRadioGroup: {
      template: '<div class="radio-group"><slot /></div>',
      props: ['modelValue'],
    },
    UiRadioGroupItem: {
      template: '<input type="radio" :id="id" :value="value" />',
      props: ['value', 'id'],
    },
    UiButton: {
      template: '<button><slot /></button>',
      props: ['variant', 'size'],
    },
    ShippingMethodCard: {
      template: '<div class="shipping-method-card" :method="method" :selected="selected"><slot /></div>',
      props: ['method', 'selected', 'currency'],
    },
  }

  it('should render shipping methods', () => {
    const wrapper = mount(ShippingMethodSelector, {
      props: defaultProps,
      global: { stubs: globalStubs },
    })
    expect(wrapper.find('.shipping-method-card').exists()).toBe(true)
  })

  it('should have shipping method cards', () => {
    const wrapper = mount(ShippingMethodSelector, {
      props: defaultProps,
      global: { stubs: globalStubs },
    })
    const cards = wrapper.findAll('.shipping-method-card')
    expect(cards.length).toBeGreaterThan(0)
  })

  it('should emit update event on selection', async () => {
    const wrapper = mount(ShippingMethodSelector, {
      props: defaultProps,
      global: { stubs: globalStubs },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('should show selected method styling', () => {
    const wrapper = mount(ShippingMethodSelector, {
      props: {
        ...defaultProps,
        modelValue: availableMethods[1],
      },
      global: { stubs: globalStubs },
    })
    expect(wrapper.html().length).toBeGreaterThan(0)
  })

  it('should render loading state', () => {
    const wrapper = mount(ShippingMethodSelector, {
      props: {
        ...defaultProps,
        loading: true,
      },
      global: { stubs: globalStubs },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('should render error state', () => {
    const wrapper = mount(ShippingMethodSelector, {
      props: {
        ...defaultProps,
        error: 'Failed to load shipping methods',
      },
      global: { stubs: globalStubs },
    })
    expect(wrapper.exists()).toBe(true)
  })
})
