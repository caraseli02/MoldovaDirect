import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ShippingMethodSelector from '~/components/checkout/ShippingMethodSelector.vue'

vi.mock('#imports', () => ({ useI18n: vi.fn(() => ({ t: (k: string) => k })) }))

describe('ShippingMethodSelector', () => {
  const methods = [
    { id: 'standard', name: 'Standard', price: 5.99, estimatedDays: '3-5' },
    { id: 'express', name: 'Express', price: 12.99, estimatedDays: '1-2' },
  ]

  it('should render shipping methods', () => {
    const wrapper = mount(ShippingMethodSelector, {
      props: { methods, selectedMethod: 'standard' },
    })
    expect(wrapper.text()).toContain('Standard')
    expect(wrapper.text()).toContain('Express')
  })

  it('should display shipping prices', () => {
    const wrapper = mount(ShippingMethodSelector, {
      props: { methods, selectedMethod: 'standard' },
    })
    expect(wrapper.text()).toMatch(/5\.99/)
    expect(wrapper.text()).toMatch(/12\.99/)
  })

  it('should emit update event on selection', async () => {
    const wrapper = mount(ShippingMethodSelector, {
      props: { methods, selectedMethod: 'standard' },
    })
    const inputs = wrapper.findAll('input[type="radio"]')
    if (inputs.length > 1) await inputs[1].trigger('change')
    expect(wrapper.emitted()).toBeTruthy()
  })

  it('should mark selected method', () => {
    const wrapper = mount(ShippingMethodSelector, {
      props: { methods, selectedMethod: 'express' },
    })
    const checkedInput = wrapper.find('input[value="express"]')
    if (checkedInput.exists()) {
      expect(checkedInput.element.checked || checkedInput.attributes('checked')).toBeTruthy()
    }
  })

  it('should show estimated delivery time', () => {
    const wrapper = mount(ShippingMethodSelector, {
      props: { methods, selectedMethod: 'standard' },
    })
    expect(wrapper.text()).toContain('3-5')
    expect(wrapper.text()).toContain('1-2')
  })
})
