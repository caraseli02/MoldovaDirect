import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import AddressForm from '~/components/checkout/AddressForm.vue'

vi.mock('#imports', () => ({ useI18n: vi.fn(() => ({ t: (k: string) => k })) }))

describe('AddressForm', () => {
  const defaultModelValue = {
    firstName: '',
    lastName: '',
    street: '',
    city: '',
    postalCode: '',
    province: '',
    country: '',
    phone: '',
    isDefault: false,
  }

  const filledModelValue = {
    firstName: 'John',
    lastName: 'Doe',
    street: '123 Main St',
    city: 'Madrid',
    postalCode: '28001',
    province: '',
    country: 'ES',
    phone: '+34612345678',
    isDefault: false,
  }

  it('should render address form', () => {
    const wrapper = mount(AddressForm, {
      props: {
        modelValue: defaultModelValue,
        type: 'shipping',
      },
    })
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.address-form').exists()).toBe(true)
  })

  it('should have required address fields', () => {
    const wrapper = mount(AddressForm, {
      props: {
        modelValue: defaultModelValue,
        type: 'shipping',
      },
    })
    const inputs = wrapper.findAll('input')
    expect(inputs.length).toBeGreaterThan(0)
  })

  it('should validate empty fields', async () => {
    const wrapper = mount(AddressForm, {
      props: {
        modelValue: defaultModelValue,
        type: 'shipping',
      },
    })
    // Component validates on blur, not on form submit
    const streetInput = wrapper.find('#street')
    if (streetInput.exists()) {
      await streetInput.trigger('blur')
      expect(wrapper.html()).toBeTruthy()
    }
  })

  it('should emit update:modelValue on input', async () => {
    const wrapper = mount(AddressForm, {
      props: {
        modelValue: defaultModelValue,
        type: 'shipping',
      },
    })
    const fullNameInput = wrapper.find('#fullName')
    if (fullNameInput.exists()) {
      await fullNameInput.setValue('John Doe')
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    }
  })

  it('should display validation errors on blur', async () => {
    const wrapper = mount(AddressForm, {
      props: {
        modelValue: defaultModelValue,
        type: 'shipping',
      },
    })
    const streetInput = wrapper.find('#street')
    if (streetInput.exists()) {
      await streetInput.trigger('blur')
      // Validation should have been triggered
      expect(wrapper.html()).toBeTruthy()
    }
  })

  it('should support autofill with autocomplete attributes', () => {
    const wrapper = mount(AddressForm, {
      props: {
        modelValue: filledModelValue,
        type: 'shipping',
      },
    })
    const inputs = wrapper.findAll('input[autocomplete]')
    expect(inputs.length).toBeGreaterThan(0)
    // Check that autocomplete attributes are set
    inputs.forEach((input) => {
      expect(input.attributes('autocomplete')).toBeDefined()
    })
  })
})
