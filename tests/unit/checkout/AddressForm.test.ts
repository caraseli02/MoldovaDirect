import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import AddressForm from '~/components/checkout/AddressForm.vue'
import type { Address } from '~/types/checkout'

// Mock i18n
const mockT = (key: string) => key

// Mock Vue composables
vi.mock('vue', async () => {
  const actual = await vi.importActual('vue')
  return {
    ...actual,
    onMounted: vi.fn()
  }
})

// Mock Nuxt composables
vi.mock('#app', () => ({
  useSupabaseUser: () => ref(null)
}))

describe('AddressForm', () => {
  let wrapper: any
  const mockAddress: Address = {
    type: 'shipping',
    firstName: '',
    lastName: '',
    company: '',
    street: '',
    city: '',
    postalCode: '',
    province: '',
    country: '',
    phone: ''
  }

  beforeEach(() => {
    wrapper = mount(AddressForm, {
      props: {
        modelValue: mockAddress,
        type: 'shipping'
      },
      global: {
        mocks: {
          $t: mockT
        }
      }
    })
  })

  it('renders the form fields correctly', () => {
    expect(wrapper.find('#firstName').exists()).toBe(true)
    expect(wrapper.find('#lastName').exists()).toBe(true)
    expect(wrapper.find('#street').exists()).toBe(true)
    expect(wrapper.find('#city').exists()).toBe(true)
    expect(wrapper.find('#postalCode').exists()).toBe(true)
    expect(wrapper.find('#country').exists()).toBe(true)
  })

  it('validates required fields', async () => {
    const form = wrapper.vm
    
    // Test validation with empty fields
    const isValid = form.validateForm()
    expect(isValid).toBe(false)
  })

  it('emits update:modelValue when form data changes', async () => {
    const firstNameInput = wrapper.find('#firstName')
    await firstNameInput.setValue('John')
    
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
  })

  it('shows saved addresses when provided', async () => {
    const savedAddresses = [
      {
        id: 1,
        type: 'shipping' as const,
        firstName: 'John',
        lastName: 'Doe',
        street: '123 Main St',
        city: 'Madrid',
        postalCode: '28001',
        country: 'ES',
        isDefault: true
      }
    ]

    await wrapper.setProps({ savedAddresses })
    
    expect(wrapper.text()).toContain('John Doe')
    expect(wrapper.text()).toContain('123 Main St')
  })
})
