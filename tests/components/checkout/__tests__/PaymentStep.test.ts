import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import { defineAsyncComponent, defineComponent } from 'vue'
import PaymentStep from '~/components/checkout/PaymentStep.vue'

// Make defineAsyncComponent available globally before the component is imported
;

(global as Record<string, unknown>).defineAsyncComponent = defineAsyncComponent

// Mock the checkout and auth stores
vi.mock('~/stores/checkout', () => ({
  useCheckoutStore: vi.fn(() => ({
    paymentMethod: null,
    savedPaymentMethods: [],
    loading: false,
    errors: {},
    updatePaymentMethod: vi.fn(),
    proceedToNextStep: vi.fn(() => 'review'),
    goToPreviousStep: vi.fn(() => 'shipping'),
  })),
}))

vi.mock('~/stores/auth', () => ({
  useAuthStore: vi.fn(() => ({
    isAuthenticated: false,
    user: null,
  })),
}))

// Mock the PaymentForm component that is dynamically imported
vi.mock('~/components/checkout/PaymentForm.vue', () => ({
  default: defineComponent({
    name: 'PaymentForm',
    props: ['modelValue', 'loading', 'errors'],
    template: '<div class="payment-form-mock">Payment Form</div>',
  }),
}))

describe('PaymentStep', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render payment step', () => {
    const wrapper = shallowMount(PaymentStep, {
      global: {
        stubs: {
          Suspense: {
            template: '<div><slot /></div>',
          },
          PaymentForm: true,
        },
      },
    })
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.payment-step').exists()).toBe(true)
  })

  it('should display cash payment option', () => {
    const wrapper = shallowMount(PaymentStep, {
      global: {
        stubs: {
          Suspense: {
            template: '<div><slot /></div>',
          },
          PaymentForm: true,
        },
      },
    })
    // Cash payment is the only available option currently
    expect(wrapper.html()).toContain('cash')
  })

  it('should have radio input for cash payment', () => {
    const wrapper = shallowMount(PaymentStep, {
      global: {
        stubs: {
          Suspense: {
            template: '<div><slot /></div>',
          },
          PaymentForm: true,
        },
      },
    })
    const cashRadio = wrapper.find('input[value="cash"]')
    expect(cashRadio.exists()).toBe(true)
  })

  it('should show disabled payment methods', () => {
    const wrapper = shallowMount(PaymentStep, {
      global: {
        stubs: {
          Suspense: {
            template: '<div><slot /></div>',
          },
          PaymentForm: true,
        },
      },
    })
    // Component shows disabled methods with "Coming Soon" label
    expect(wrapper.html()).toContain('cursor-not-allowed')
  })

  it('should have navigation buttons', () => {
    const wrapper = shallowMount(PaymentStep, {
      global: {
        stubs: {
          Suspense: {
            template: '<div><slot /></div>',
          },
          PaymentForm: true,
        },
      },
    })
    // Should have back and continue buttons (using UiButton stub)
    const buttons = wrapper.findAll('button')
    expect(buttons.length).toBeGreaterThan(0)
  })
})
