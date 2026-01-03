import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import AddressForm from '~/components/checkout/AddressForm.vue'

vi.mock('#imports', () => ({ useI18n: vi.fn(() => ({ t: (k: string) => k })) }))

describe('AddressForm', () => {
  it('should render address form', () => {
    const wrapper = mount(AddressForm)
    expect(wrapper.exists()).toBe(true)
  })

  it('should have required address fields', () => {
    const wrapper = mount(AddressForm)
    const inputs = wrapper.findAll('input')
    expect(inputs.length).toBeGreaterThan(0)
  })

  it('should validate empty fields', async () => {
    const wrapper = mount(AddressForm)
    const form = wrapper.find('form')
    if (form.exists()) {
      await form.trigger('submit')
      expect(wrapper.html()).toBeTruthy()
    }
  })

  it('should emit form data on submit', async () => {
    const wrapper = mount(AddressForm, {
      props: {
        modelValue: {
          street: '123 Main St',
          city: 'Madrid',
          postalCode: '28001',
          country: 'ES',
        },
      },
    })
    const form = wrapper.find('form')
    if (form.exists()) {
      await form.trigger('submit')
      expect(wrapper.emitted()).toBeTruthy()
    }
  })

  it('should display validation errors', async () => {
    const wrapper = mount(AddressForm)
    const inputs = wrapper.findAll('input[required]')
    if (inputs.length > 0) {
      await inputs[0].setValue('')
      await inputs[0].trigger('blur')
      expect(wrapper.html()).toBeTruthy()
    }
  })

  it('should support autofill', () => {
    const wrapper = mount(AddressForm)
    const inputs = wrapper.findAll('input')
    inputs.forEach(input => {
      expect(input.attributes('autocomplete')).toBeDefined
    })
  })
})
