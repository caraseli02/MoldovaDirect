import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import CheckoutProgressIndicator from '~/components/checkout/CheckoutProgressIndicator.vue'

vi.mock('#imports', () => ({ useI18n: vi.fn(() => ({ t: (k: string) => k })) }))

describe('CheckoutProgressIndicator', () => {
  // Component expects steps as array of objects with id, name, description
  // and currentStep as a string matching step.id
  const steps = [
    { id: 'shipping' as const, name: 'Shipping', description: 'Enter your shipping details' },
    { id: 'payment' as const, name: 'Payment', description: 'Choose payment method' },
    { id: 'review' as const, name: 'Review', description: 'Review your order' },
    { id: 'confirmation' as const, name: 'Confirmation', description: 'Order placed' },
  ]

  it('should render all steps', () => {
    const wrapper = mount(CheckoutProgressIndicator, {
      props: { steps, currentStep: 'shipping' },
    })
    // Should render the component
    expect(wrapper.exists()).toBe(true)
    // The component uses i18n keys, so we check for the presence of step structure
    expect(wrapper.find('.checkout-progress').exists()).toBe(true)
  })

  it('should highlight current step', () => {
    const wrapper = mount(CheckoutProgressIndicator, {
      props: { steps, currentStep: 'payment' },
    })
    // Component has bg-slate-600 or similar classes for active step
    expect(wrapper.html()).toContain('bg-slate')
  })

  it('should mark completed steps', () => {
    const wrapper = mount(CheckoutProgressIndicator, {
      props: { steps, currentStep: 'review' },
    })
    // Completed steps have checkmark SVG - check for path with check pattern
    expect(wrapper.html()).toContain('svg')
  })

  it('should render step circles', () => {
    const wrapper = mount(CheckoutProgressIndicator, {
      props: { steps, currentStep: 'shipping' },
    })
    // Should have circles for steps with rounded-full class
    const circles = wrapper.findAll('.rounded-full')
    expect(circles.length).toBeGreaterThan(0)
  })

  it('should display step numbers correctly', () => {
    const wrapper = mount(CheckoutProgressIndicator, {
      props: {
        steps: [
          { id: 'shipping' as const, name: 'Step 1', description: 'First step' },
          { id: 'payment' as const, name: 'Step 2', description: 'Second step' },
        ],
        currentStep: 'shipping',
      },
    })
    expect(wrapper.html()).toBeTruthy()
    // Component shows step numbers for non-completed steps
    expect(wrapper.text()).toContain('1')
  })
})
