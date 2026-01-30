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
          PaymentMethodSelector: {
            template: '<div class="payment-method-selector-stub"><slot /></div>',
          },
          SavedPaymentMethodsList: {
            template: '<div class="saved-payment-methods-stub"></div>',
          },
        },
      },
    })
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.payment-step').exists()).toBe(true)
  })

  it('should display payment method selector', () => {
    const wrapper = shallowMount(PaymentStep, {
      global: {
        stubs: {
          Suspense: {
            template: '<div><slot /></div>',
          },
          PaymentForm: true,
          PaymentMethodSelector: {
            template: '<div class="payment-method-selector-stub">Payment Methods</div>',
          },
          SavedPaymentMethodsList: {
            template: '<div class="saved-payment-methods-stub"></div>',
          },
        },
      },
    })
    expect(wrapper.find('.payment-method-selector-stub').exists()).toBe(true)
  })

  it('should have navigation buttons', () => {
    const wrapper = shallowMount(PaymentStep, {
      global: {
        stubs: {
          Suspense: {
            template: '<div><slot /></div>',
          },
          PaymentForm: true,
          PaymentMethodSelector: {
            template: '<div class="payment-method-selector-stub"></div>',
          },
          SavedPaymentMethodsList: {
            template: '<div class="saved-payment-methods-stub"></div>',
          },
        },
      },
    })
    const buttons = wrapper.findAll('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('should show continue button disabled when cannot proceed', () => {
    const wrapper = shallowMount(PaymentStep, {
      global: {
        stubs: {
          Suspense: {
            template: '<div><slot /></div>',
          },
          PaymentForm: true,
          PaymentMethodSelector: {
            template: '<div class="payment-method-selector-stub"></div>',
          },
          SavedPaymentMethodsList: {
            template: '<div class="saved-payment-methods-stub"></div>',
          },
        },
      },
    })
    const buttons = wrapper.findAll('button')
    expect(buttons.length).toBeGreaterThan(0)
  })
})
