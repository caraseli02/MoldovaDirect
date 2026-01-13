import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, shallowMount } from '@vue/test-utils'
import { ref } from 'vue'
import PaymentSection from '~/components/checkout/hybrid/PaymentSection.vue'
import type { PaymentMethod } from '~/types/checkout'

// Mock i18n - return keys to test i18n integration
vi.mock('#imports', () => ({
  useI18n: vi.fn(() => ({
    t: (key: string) => key,
    locale: ref('en'),
  })),
  ref,
  computed: vi.fn(fn => ({ value: fn() })),
}))

describe('PaymentSection', () => {
  // Default payment method for tests
  const defaultPaymentMethod: PaymentMethod = {
    type: 'cash',
  }

  const creditCardPaymentMethod: PaymentMethod = {
    type: 'credit_card',
    creditCard: {
      number: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      holderName: '',
    },
  }

  const defaultProps = {
    modelValue: defaultPaymentMethod,
    sectionNumber: 3,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ==========================================
  // Rendering Tests
  // ==========================================
  describe('Rendering', () => {
    it('should render the payment section', () => {
      const wrapper = mount(PaymentSection, {
        props: defaultProps,
      })
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.checkout-section').exists()).toBe(true)
    })

    it('should render section header with title', () => {
      const wrapper = mount(PaymentSection, {
        props: defaultProps,
      })
      expect(wrapper.find('.section-header').exists()).toBe(true)
      expect(wrapper.find('.section-title').exists()).toBe(true)
      expect(wrapper.text()).toContain('checkout.hybrid.payment')
    })

    it('should render the section number', () => {
      const wrapper = mount(PaymentSection, {
        props: defaultProps,
      })
      expect(wrapper.find('.section-number').exists()).toBe(true)
      expect(wrapper.find('.section-number').text()).toBe('3')
    })

    it('should render section content area', () => {
      const wrapper = mount(PaymentSection, {
        props: defaultProps,
      })
      expect(wrapper.find('.section-content').exists()).toBe(true)
    })

    it('should apply fade-in animation class', () => {
      const wrapper = mount(PaymentSection, {
        props: defaultProps,
      })
      expect(wrapper.find('.fade-in').exists()).toBe(true)
    })
  })

  // ==========================================
  // Props Handling Tests
  // ==========================================
  describe('Props Handling', () => {
    it('should accept modelValue prop', () => {
      const wrapper = mount(PaymentSection, {
        props: defaultProps,
      })
      expect(wrapper.props('modelValue')).toEqual(defaultPaymentMethod)
    })

    it('should accept sectionNumber as a number', () => {
      const wrapper = mount(PaymentSection, {
        props: {
          ...defaultProps,
          sectionNumber: 5,
        },
      })
      expect(wrapper.find('.section-number').text()).toBe('5')
    })

    it('should accept sectionNumber as a string', () => {
      const wrapper = mount(PaymentSection, {
        props: {
          modelValue: defaultPaymentMethod,
          sectionNumber: '2',
        },
      })
      expect(wrapper.find('.section-number').text()).toBe('2')
    })

    it('should handle different payment types in modelValue', () => {
      const wrapper = mount(PaymentSection, {
        props: {
          modelValue: creditCardPaymentMethod,
          sectionNumber: 3,
        },
      })
      expect(wrapper.props('modelValue').type).toBe('credit_card')
    })
  })

  // ==========================================
  // Cash Payment Option Tests
  // ==========================================
  describe('Cash Payment Option', () => {
    it('should render cash payment option', () => {
      const wrapper = mount(PaymentSection, {
        props: defaultProps,
      })
      expect(wrapper.text()).toContain('checkout.payment.cash.label')
    })

    it('should render cash payment description', () => {
      const wrapper = mount(PaymentSection, {
        props: defaultProps,
      })
      expect(wrapper.text()).toContain('checkout.payment.cash.summary')
    })

    it('should render cash payment radio input', () => {
      const wrapper = mount(PaymentSection, {
        props: defaultProps,
      })
      const radioInput = wrapper.find('input[type="radio"][value="cash"]')
      expect(radioInput.exists()).toBe(true)
    })

    it('should have cash radio checked when payment type is cash', () => {
      const wrapper = mount(PaymentSection, {
        props: defaultProps,
      })
      const radioInput = wrapper.find('input[type="radio"][value="cash"]')
      expect((radioInput.element as HTMLInputElement).checked).toBe(true)
    })

    it('should have cash radio unchecked when payment type is not cash', () => {
      const wrapper = mount(PaymentSection, {
        props: {
          modelValue: creditCardPaymentMethod,
          sectionNumber: 3,
        },
      })
      const radioInput = wrapper.find('input[type="radio"][value="cash"]')
      expect((radioInput.element as HTMLInputElement).checked).toBe(false)
    })

    it('should display cash emoji icon', () => {
      const wrapper = mount(PaymentSection, {
        props: defaultProps,
      })
      expect(wrapper.text()).toContain('\uD83D\uDCB5') // Cash emoji
    })

    it('should have green background styling for cash option', () => {
      const wrapper = mount(PaymentSection, {
        props: defaultProps,
      })
      const cashSection = wrapper.find('.bg-green-50')
      expect(cashSection.exists()).toBe(true)
    })
  })

  // ==========================================
  // Coming Soon Methods Tests
  // ==========================================
  describe('Coming Soon Payment Methods', () => {
    it('should render coming soon section', () => {
      const wrapper = mount(PaymentSection, {
        props: defaultProps,
      })
      expect(wrapper.text()).toContain('checkout.payment.comingSoon')
    })

    it('should render credit card as coming soon', () => {
      const wrapper = mount(PaymentSection, {
        props: defaultProps,
      })
      expect(wrapper.text()).toContain('checkout.payment.creditCard.label')
    })

    it('should render PayPal as coming soon', () => {
      const wrapper = mount(PaymentSection, {
        props: defaultProps,
      })
      expect(wrapper.text()).toContain('checkout.payment.paypal.label')
    })

    it('should display credit card emoji', () => {
      const wrapper = mount(PaymentSection, {
        props: defaultProps,
      })
      expect(wrapper.text()).toContain('\uD83D\uDCB3') // Credit card emoji
    })

    it('should have disabled styling for coming soon methods', () => {
      const wrapper = mount(PaymentSection, {
        props: defaultProps,
      })
      const comingSoonSection = wrapper.findAll('.bg-gray-100')
      expect(comingSoonSection.length).toBeGreaterThan(0)
    })
  })

  // ==========================================
  // Validation Indicator Tests
  // ==========================================
  describe('Validation Indicator', () => {
    it('should show complete indicator when payment type is cash', () => {
      const wrapper = mount(PaymentSection, {
        props: defaultProps,
      })
      expect(wrapper.find('.section-complete').exists()).toBe(true)
    })

    it('should have checkmark SVG in complete indicator', () => {
      const wrapper = mount(PaymentSection, {
        props: defaultProps,
      })
      const completeIndicator = wrapper.find('.section-complete')
      expect(completeIndicator.find('svg').exists()).toBe(true)
    })

    it('should not show complete indicator when payment type is not cash', () => {
      const wrapper = mount(PaymentSection, {
        props: {
          modelValue: creditCardPaymentMethod,
          sectionNumber: 3,
        },
      })
      expect(wrapper.find('.section-complete').exists()).toBe(false)
    })

    it('should not show complete indicator for paypal payment type', () => {
      const wrapper = mount(PaymentSection, {
        props: {
          modelValue: { type: 'paypal' as const },
          sectionNumber: 3,
        },
      })
      expect(wrapper.find('.section-complete').exists()).toBe(false)
    })

    it('should not show complete indicator for bank_transfer payment type', () => {
      const wrapper = mount(PaymentSection, {
        props: {
          modelValue: { type: 'bank_transfer' as const },
          sectionNumber: 3,
        },
      })
      expect(wrapper.find('.section-complete').exists()).toBe(false)
    })
  })

  // ==========================================
  // User Interaction Tests
  // ==========================================
  describe('User Interactions', () => {
    it('should emit update:modelValue when cash radio is changed', async () => {
      const wrapper = mount(PaymentSection, {
        props: {
          modelValue: creditCardPaymentMethod,
          sectionNumber: 3,
        },
      })

      const radioInput = wrapper.find('input[type="radio"][value="cash"]')
      await radioInput.trigger('change')

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([
        {
          ...creditCardPaymentMethod,
          type: 'cash',
        },
      ])
    })

    it('should preserve other payment method properties when type changes', async () => {
      const paymentWithSaveOption: PaymentMethod = {
        type: 'credit_card',
        saveForFuture: true,
        creditCard: {
          number: '4111111111111111',
          expiryMonth: '12',
          expiryYear: '25',
          cvv: '123',
          holderName: 'John Doe',
        },
      }

      const wrapper = mount(PaymentSection, {
        props: {
          modelValue: paymentWithSaveOption,
          sectionNumber: 3,
        },
      })

      const radioInput = wrapper.find('input[type="radio"][value="cash"]')
      await radioInput.trigger('change')

      const emittedValue = wrapper.emitted('update:modelValue')?.[0]?.[0] as PaymentMethod
      expect(emittedValue.type).toBe('cash')
      expect(emittedValue.saveForFuture).toBe(true)
      expect(emittedValue.creditCard).toBeDefined()
    })

    it('should have clickable label for cash option', () => {
      const wrapper = mount(PaymentSection, {
        props: defaultProps,
      })
      const label = wrapper.find('label.cursor-pointer')
      expect(label.exists()).toBe(true)
    })

    it('should associate radio input with label', () => {
      const wrapper = mount(PaymentSection, {
        props: defaultProps,
      })
      const label = wrapper.find('label')
      const radio = label.find('input[type="radio"]')
      expect(radio.exists()).toBe(true)
    })
  })

  // ==========================================
  // Emitted Events Tests
  // ==========================================
  describe('Emitted Events', () => {
    it('should emit update:modelValue event with correct payload structure', async () => {
      const wrapper = mount(PaymentSection, {
        props: {
          modelValue: { type: 'paypal' as const },
          sectionNumber: 3,
        },
      })

      const radioInput = wrapper.find('input[type="radio"][value="cash"]')
      await radioInput.trigger('change')

      const emittedEvents = wrapper.emitted('update:modelValue')
      expect(emittedEvents).toHaveLength(1)

      const emittedPayload = emittedEvents?.[0]?.[0] as PaymentMethod
      expect(emittedPayload).toHaveProperty('type', 'cash')
    })

    it('should not emit any event on initial render', () => {
      const wrapper = mount(PaymentSection, {
        props: defaultProps,
      })

      expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    })

    it('should emit event each time radio is changed', async () => {
      const wrapper = mount(PaymentSection, {
        props: {
          modelValue: creditCardPaymentMethod,
          sectionNumber: 3,
        },
      })

      const radioInput = wrapper.find('input[type="radio"][value="cash"]')
      await radioInput.trigger('change')
      await radioInput.trigger('change')

      expect(wrapper.emitted('update:modelValue')).toHaveLength(2)
    })
  })

  // ==========================================
  // i18n Integration Tests
  // ==========================================
  describe('i18n Integration', () => {
    it('should use i18n key for payment section title', () => {
      const wrapper = mount(PaymentSection, {
        props: defaultProps,
      })
      expect(wrapper.text()).toContain('checkout.hybrid.payment')
    })

    it('should use i18n key for cash payment label', () => {
      const wrapper = mount(PaymentSection, {
        props: defaultProps,
      })
      expect(wrapper.text()).toContain('checkout.payment.cash.label')
    })

    it('should use i18n key for cash payment summary', () => {
      const wrapper = mount(PaymentSection, {
        props: defaultProps,
      })
      expect(wrapper.text()).toContain('checkout.payment.cash.summary')
    })

    it('should use i18n key for coming soon text', () => {
      const wrapper = mount(PaymentSection, {
        props: defaultProps,
      })
      expect(wrapper.text()).toContain('checkout.payment.comingSoon')
    })

    it('should use i18n key for credit card label', () => {
      const wrapper = mount(PaymentSection, {
        props: defaultProps,
      })
      expect(wrapper.text()).toContain('checkout.payment.creditCard.label')
    })

    it('should use i18n key for PayPal label', () => {
      const wrapper = mount(PaymentSection, {
        props: defaultProps,
      })
      expect(wrapper.text()).toContain('checkout.payment.paypal.label')
    })
  })

  // ==========================================
  // Edge Cases Tests
  // ==========================================
  describe('Edge Cases', () => {
    it('should handle empty payment method object', () => {
      const wrapper = mount(PaymentSection, {
        props: {
          modelValue: { type: 'cash' } as PaymentMethod,
          sectionNumber: 1,
        },
      })
      expect(wrapper.exists()).toBe(true)
    })

    it('should handle section number of 0', () => {
      const wrapper = mount(PaymentSection, {
        props: {
          modelValue: defaultPaymentMethod,
          sectionNumber: 0,
        },
      })
      expect(wrapper.find('.section-number').text()).toBe('0')
    })

    it('should handle large section numbers', () => {
      const wrapper = mount(PaymentSection, {
        props: {
          modelValue: defaultPaymentMethod,
          sectionNumber: 999,
        },
      })
      expect(wrapper.find('.section-number').text()).toBe('999')
    })

    it('should handle payment method with all optional fields', () => {
      const fullPaymentMethod: PaymentMethod = {
        type: 'cash',
        cash: { confirmed: true },
        saveForFuture: false,
        creditCard: {
          number: '',
          expiryMonth: '',
          expiryYear: '',
          cvv: '',
          holderName: '',
        },
        paypal: { email: '' },
        bankTransfer: { reference: '' },
      }

      const wrapper = mount(PaymentSection, {
        props: {
          modelValue: fullPaymentMethod,
          sectionNumber: 3,
        },
      })
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.section-complete').exists()).toBe(true)
    })

    it('should handle reactive prop updates', async () => {
      const wrapper = mount(PaymentSection, {
        props: defaultProps,
      })

      expect(wrapper.find('.section-complete').exists()).toBe(true)

      await wrapper.setProps({
        modelValue: creditCardPaymentMethod,
      })

      expect(wrapper.find('.section-complete').exists()).toBe(false)
    })

    it('should handle section number change', async () => {
      const wrapper = mount(PaymentSection, {
        props: defaultProps,
      })

      expect(wrapper.find('.section-number').text()).toBe('3')

      await wrapper.setProps({
        sectionNumber: 7,
      })

      expect(wrapper.find('.section-number').text()).toBe('7')
    })
  })

  // ==========================================
  // Accessibility Tests
  // ==========================================
  describe('Accessibility', () => {
    it('should have proper radio input type', () => {
      const wrapper = mount(PaymentSection, {
        props: defaultProps,
      })
      const radio = wrapper.find('input[type="radio"]')
      expect(radio.attributes('type')).toBe('radio')
    })

    it('should have accessible label wrapping the radio', () => {
      const wrapper = mount(PaymentSection, {
        props: defaultProps,
      })
      const label = wrapper.find('label')
      expect(label.exists()).toBe(true)
      expect(label.find('input[type="radio"]').exists()).toBe(true)
    })

    it('should have focus ring styles on radio input', () => {
      const wrapper = mount(PaymentSection, {
        props: defaultProps,
      })
      const radio = wrapper.find('input[type="radio"]')
      expect(radio.classes()).toContain('focus:ring-green-500')
    })

    it('should use semantic section element', () => {
      const wrapper = mount(PaymentSection, {
        props: defaultProps,
      })
      expect(wrapper.find('section.checkout-section').exists()).toBe(true)
    })

    it('should use h3 heading for section title', () => {
      const wrapper = mount(PaymentSection, {
        props: defaultProps,
      })
      expect(wrapper.find('h3.section-title').exists()).toBe(true)
    })
  })

  // ==========================================
  // Dark Mode Tests
  // ==========================================
  describe('Dark Mode Styling', () => {
    it('should have dark mode classes for cash section background', () => {
      const wrapper = mount(PaymentSection, {
        props: defaultProps,
      })
      const cashSection = wrapper.find('.dark\\:bg-green-900\\/20')
      expect(cashSection.exists()).toBe(true)
    })

    it('should have dark mode classes for coming soon items', () => {
      const wrapper = mount(PaymentSection, {
        props: defaultProps,
      })
      const html = wrapper.html()
      expect(html).toContain('dark:bg-gray-700')
    })

    it('should have dark mode text colors', () => {
      const wrapper = mount(PaymentSection, {
        props: defaultProps,
      })
      const html = wrapper.html()
      expect(html).toContain('dark:text-white')
      expect(html).toContain('dark:text-gray-400')
    })

    it('should have dark mode border colors for cash section', () => {
      const wrapper = mount(PaymentSection, {
        props: defaultProps,
      })
      const cashSection = wrapper.find('.dark\\:border-green-700')
      expect(cashSection.exists()).toBe(true)
    })
  })

  // ==========================================
  // Component Structure Tests
  // ==========================================
  describe('Component Structure', () => {
    it('should have correct DOM structure order', () => {
      const wrapper = mount(PaymentSection, {
        props: defaultProps,
      })

      const section = wrapper.find('.checkout-section')
      const header = section.find('.section-header')
      const content = section.find('.section-content')

      // Verify structure exists
      expect(header.exists()).toBe(true)
      expect(content.exists()).toBe(true)

      // Header should come before content in DOM
      const sectionHtml = section.html()
      const headerIndex = sectionHtml.indexOf('section-header')
      const contentIndex = sectionHtml.indexOf('section-content')
      expect(headerIndex).toBeLessThan(contentIndex)
    })

    it('should render SVG checkmark with correct path', () => {
      const wrapper = mount(PaymentSection, {
        props: defaultProps,
      })

      const svg = wrapper.find('.section-complete svg')
      expect(svg.exists()).toBe(true)
      expect(svg.attributes('viewBox')).toBe('0 0 20 20')

      const path = svg.find('path')
      expect(path.exists()).toBe(true)
      expect(path.attributes('fill-rule')).toBe('evenodd')
    })

    it('should have proper flex layout in header', () => {
      const wrapper = mount(PaymentSection, {
        props: defaultProps,
      })

      const headerContent = wrapper.find('.section-header .flex.items-center')
      expect(headerContent.exists()).toBe(true)
    })

    it('should have proper spacing in coming soon section', () => {
      const wrapper = mount(PaymentSection, {
        props: defaultProps,
      })

      const comingSoonContainer = wrapper.find('.mt-6.space-y-2')
      expect(comingSoonContainer.exists()).toBe(true)
    })

    it('should have flex wrap for coming soon items', () => {
      const wrapper = mount(PaymentSection, {
        props: defaultProps,
      })

      const flexWrap = wrapper.find('.flex.flex-wrap.gap-2')
      expect(flexWrap.exists()).toBe(true)
    })
  })

  // ==========================================
  // Shallow Mount Tests
  // ==========================================
  describe('Shallow Mount', () => {
    it('should render correctly with shallowMount', () => {
      const wrapper = shallowMount(PaymentSection, {
        props: defaultProps,
      })
      expect(wrapper.exists()).toBe(true)
    })

    it('should have all key elements with shallowMount', () => {
      const wrapper = shallowMount(PaymentSection, {
        props: defaultProps,
      })

      expect(wrapper.find('.checkout-section').exists()).toBe(true)
      expect(wrapper.find('.section-header').exists()).toBe(true)
      expect(wrapper.find('.section-content').exists()).toBe(true)
    })
  })
})
