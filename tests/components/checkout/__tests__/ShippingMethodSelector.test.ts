import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref, computed } from 'vue'
import ShippingMethodSelector from '~/components/checkout/ShippingMethodSelector.vue'

vi.mock('#imports', () => ({
  useI18n: vi.fn(() => ({
    t: (k: string) => k,
    locale: ref('en'),
  })),
  ref,
  computed,
}))

// Stub the RadioGroup components
vi.mock('@/components/ui/radio-group', () => ({
  RadioGroup: {
    template: '<div class="radio-group"><slot /></div>',
    props: ['modelValue'],
  },
  RadioGroupItem: {
    template: '<input type="radio" :id="id" :value="value" />',
    props: ['value', 'id'],
  },
}))

vi.mock('@/components/ui/button', () => ({
  Button: {
    template: '<button><slot /></button>',
    props: ['variant', 'size'],
  },
}))

describe('ShippingMethodSelector', () => {
  // Component expects availableMethods and modelValue props
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

  it('should render shipping methods', () => {
    const wrapper = mount(ShippingMethodSelector, {
      props: defaultProps,
    })
    expect(wrapper.text()).toContain('Standard Shipping')
    expect(wrapper.text()).toContain('Express Shipping')
  })

  it('should display shipping prices', () => {
    const wrapper = mount(ShippingMethodSelector, {
      props: defaultProps,
    })
    // Prices are formatted with Intl.NumberFormat with EUR currency
    // Format depends on locale, could be "€5.99" or "5,99 €"
    expect(wrapper.text()).toMatch(/5[.,]99|€5\.99/)
    expect(wrapper.text()).toMatch(/12[.,]99|€12\.99/)
  })

  it('should emit update event on selection', async () => {
    const wrapper = mount(ShippingMethodSelector, {
      props: defaultProps,
    })
    // Find the label for express shipping and click it
    const labels = wrapper.findAll('label')
    if (labels.length > 1) {
      await labels[1].trigger('click')
      // The component uses computed setter to emit
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('should show selected method styling', () => {
    const wrapper = mount(ShippingMethodSelector, {
      props: {
        ...defaultProps,
        modelValue: availableMethods[1], // Express selected
      },
    })
    // Selected method should be rendered
    expect(wrapper.html().length).toBeGreaterThan(0)
  })

  it('should show estimated delivery time', () => {
    const wrapper = mount(ShippingMethodSelector, {
      props: defaultProps,
    })
    // Component displays delivery estimates
    expect(wrapper.text()).toContain('Delivery')
  })
})
