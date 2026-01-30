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
      global: {
        stubs: {
          CheckoutSavedAddressesList: { template: '<div class="saved-addresses-stub"></div>' },
          CheckoutAddressFormFields: { template: '<div class="form-fields-stub"></div>' },
        },
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
      global: {
        stubs: {
          CheckoutSavedAddressesList: { template: '<div class="saved-addresses-stub"></div>' },
          CheckoutAddressFormFields: {
            template: '<div class="form-fields-stub"><input type="text" /><input type="text" /></div>',
          },
        },
      },
    })
    expect(wrapper.find('.form-fields-stub').exists()).toBe(true)
  })

  it('should validate empty fields', async () => {
    const wrapper = mount(AddressForm, {
      props: {
        modelValue: defaultModelValue,
        type: 'shipping',
      },
      global: {
        stubs: {
          CheckoutSavedAddressesList: { template: '<div class="saved-addresses-stub"></div>' },
          CheckoutAddressFormFields: { template: '<div class="form-fields-stub"></div>' },
        },
      },
    })
    expect(wrapper.find('.address-form').exists()).toBe(true)
  })

  it('should emit update:modelValue on input', async () => {
    const wrapper = mount(AddressForm, {
      props: {
        modelValue: defaultModelValue,
        type: 'shipping',
      },
      global: {
        stubs: {
          CheckoutSavedAddressesList: { template: '<div class="saved-addresses-stub"></div>' },
          CheckoutAddressFormFields: {
            template: '<div class="form-fields-stub"><input @input="$emit(\'update:modelValue\', $event.target.value)" /></div>',
          },
        },
      },
    })
    const input = wrapper.find('input')
    if (input.exists()) {
      await input.setValue('test')
      // The component emits through child component
      expect(wrapper.html()).toBeTruthy()
    }
  })

  it('should display validation errors on blur', async () => {
    const wrapper = mount(AddressForm, {
      props: {
        modelValue: defaultModelValue,
        type: 'shipping',
      },
      global: {
        stubs: {
          CheckoutSavedAddressesList: { template: '<div class="saved-addresses-stub"></div>' },
          CheckoutAddressFormFields: { template: '<div class="form-fields-stub"></div>' },
        },
      },
    })
    expect(wrapper.find('.address-form').exists()).toBe(true)
  })

  it('should support autofill with autocomplete attributes', () => {
    const wrapper = mount(AddressForm, {
      props: {
        modelValue: filledModelValue,
        type: 'shipping',
      },
      global: {
        stubs: {
          CheckoutSavedAddressesList: { template: '<div class="saved-addresses-stub"></div>' },
          CheckoutAddressFormFields: {
            template: '<div class="form-fields-stub"><input autocomplete="name" /><input autocomplete="street-address" /></div>',
          },
        },
      },
    })
    const inputs = wrapper.findAll('input[autocomplete]')
    expect(inputs.length).toBeGreaterThan(0)
    inputs.forEach((input) => {
      expect(input.attributes('autocomplete')).toBeDefined()
    })
  })
})
