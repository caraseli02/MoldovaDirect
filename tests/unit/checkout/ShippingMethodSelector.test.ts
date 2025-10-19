import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ShippingMethodSelector from '~/components/checkout/ShippingMethodSelector.vue'
import type { ShippingMethod } from '~/types/checkout'

// Mock i18n
const mockT = (key: string) => key

describe('ShippingMethodSelector', () => {
  let wrapper: any
  const mockMethods: ShippingMethod[] = [
    {
      id: 'standard',
      name: 'Standard Shipping',
      description: 'Delivery in 3-5 business days',
      price: 5.99,
      estimatedDays: 4
    },
    {
      id: 'express',
      name: 'Express Shipping',
      description: 'Delivery in 1-2 business days',
      price: 12.99,
      estimatedDays: 1
    },
    {
      id: 'free',
      name: 'Free Shipping',
      description: 'Delivery in 5-7 business days',
      price: 0,
      estimatedDays: 6
    }
  ]

  beforeEach(() => {
    wrapper = mount(ShippingMethodSelector, {
      props: {
        modelValue: null,
        availableMethods: mockMethods
      },
      global: {
        mocks: {
          $t: mockT
        }
      }
    })
  })

  it('renders shipping methods correctly', () => {
    expect(wrapper.text()).toContain('Standard Shipping')
    expect(wrapper.text()).toContain('Express Shipping')
    expect(wrapper.text()).toContain('Free Shipping')
  })

  it('shows free badge for free shipping', () => {
    expect(wrapper.text()).toContain('Free')
  })

  it('shows express badge for fast shipping', () => {
    expect(wrapper.text()).toContain('Express')
  })

  it('emits update:modelValue when method is selected', async () => {
    const radioInput = wrapper.find('input[value="standard"]')
    await radioInput.setChecked()
    
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')[0][0]).toEqual(mockMethods[0])
  })

  it('shows loading state', async () => {
    await wrapper.setProps({ loading: true, availableMethods: [] })
    
    expect(wrapper.find('.animate-pulse').exists()).toBe(true)
  })

  it('shows error state', async () => {
    await wrapper.setProps({ error: 'Failed to load methods' })
    
    expect(wrapper.text()).toContain('Failed to load methods')
  })

  it('shows no methods available message', async () => {
    await wrapper.setProps({ availableMethods: [] })
    
    expect(wrapper.text()).toContain('checkout.shippingMethod.noMethods')
  })
})
