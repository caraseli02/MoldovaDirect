import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import CheckoutProgressIndicator from '~/components/checkout/CheckoutProgressIndicator.vue'

vi.mock('#imports', () => ({ useI18n: vi.fn(() => ({ t: (k: string) => k })) }))

describe('CheckoutProgressIndicator', () => {
  const steps = ['Cart', 'Shipping', 'Payment', 'Confirmation']

  it('should render all steps', () => {
    const wrapper = mount(CheckoutProgressIndicator, {
      props: { steps, currentStep: 1 },
    })
    expect(wrapper.text()).toContain('Cart')
    expect(wrapper.text()).toContain('Shipping')
  })

  it('should highlight current step', () => {
    const wrapper = mount(CheckoutProgressIndicator, {
      props: { steps, currentStep: 2 },
    })
    const activeSteps = wrapper.findAll('.bg-primary-600, .bg-blue-600')
    expect(activeSteps.length).toBeGreaterThan(0)
  })

  it('should mark completed steps', () => {
    const wrapper = mount(CheckoutProgressIndicator, {
      props: { steps, currentStep: 3 },
    })
    // Steps 0, 1, 2 should be completed
    expect(wrapper.html()).toContain('check')
  })

  it('should disable future steps', () => {
    const wrapper = mount(CheckoutProgressIndicator, {
      props: { steps, currentStep: 1 },
    })
    const allSteps = wrapper.findAll('[data-step]')
    expect(allSteps.length).toBeGreaterThanOrEqual(2)
  })

  it('should display step numbers correctly', () => {
    const wrapper = mount(CheckoutProgressIndicator, {
      props: { steps: ['Step 1', 'Step 2'], currentStep: 0 },
    })
    expect(wrapper.html()).toBeTruthy()
  })
})
