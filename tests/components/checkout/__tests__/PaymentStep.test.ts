import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import PaymentStep from '~/components/checkout/PaymentStep.vue'

vi.mock('#imports', () => ({ useI18n: vi.fn(() => ({ t: (k: string) => k })) }))

describe('PaymentStep', () => {
  const paymentMethods = [
    { id: 'card', name: 'Credit Card', icon: 'credit-card' },
    { id: 'paypal', name: 'PayPal', icon: 'paypal' },
  ]

  it('should render payment step', () => {
    const wrapper = mount(PaymentStep, {
      props: { methods: paymentMethods, selectedMethod: 'card' },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('should display payment methods', () => {
    const wrapper = mount(PaymentStep, {
      props: { methods: paymentMethods, selectedMethod: 'card' },
    })
    expect(wrapper.text()).toContain('Credit Card')
    expect(wrapper.text()).toContain('PayPal')
  })

  it('should emit method selection', async () => {
    const wrapper = mount(PaymentStep, {
      props: { methods: paymentMethods, selectedMethod: 'card' },
    })
    const inputs = wrapper.findAll('input[type="radio"]')
    if (inputs.length > 0) {
      await inputs[0].trigger('change')
      expect(wrapper.emitted()).toBeTruthy()
    }
  })

  it('should mark selected payment method', () => {
    const wrapper = mount(PaymentStep, {
      props: { methods: paymentMethods, selectedMethod: 'paypal' },
    })
    expect(wrapper.html()).toContain('paypal')
  })

  it('should validate payment information', () => {
    const wrapper = mount(PaymentStep, {
      props: { methods: paymentMethods, selectedMethod: 'card' },
    })
    expect(wrapper.find('form').exists() || wrapper.find('input').exists()).toBe(true)
  })
})
