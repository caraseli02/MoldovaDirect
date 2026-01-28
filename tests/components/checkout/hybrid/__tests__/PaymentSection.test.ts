import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, shallowMount } from '@vue/test-utils'
import PaymentSection from '~/components/checkout/hybrid/PaymentSection.vue'
import type { PaymentMethod } from '~/types/checkout'

// Use global mocks from vitest.setup.ts - local mock removed to avoid conflicts

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

  // Helper to find radio button containers
  const findRadioContainers = (wrapper: ReturnType<typeof mount>) => {
    return wrapper.findAll('.size-4.rounded-full.border-2')
  }

  // Helper to check if radio has the "checked" inner div
  const isRadioChecked = (radioEl: any) => {
    return radioEl.find('.size-2.rounded-full').exists()
  }

  // Helper to click a payment option by index
  const clickPaymentOption = async (wrapper: ReturnType<typeof mount>, index: number) => {
    const clickableDivs = wrapper.findAll('.p-4.border.rounded-lg.cursor-pointer')
    if (clickableDivs[index]) {
      await clickableDivs[index].trigger('click')
    }
  }

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

    it('should render cash payment radio button (custom)', () => {
      const wrapper = mount(PaymentSection, {
        props: defaultProps,
      })
      const radios = findRadioContainers(wrapper)
      expect(radios.length).toBeGreaterThanOrEqual(1)
    })

    it('should have cash radio checked when payment type is cash', () => {
      const wrapper = mount(PaymentSection, {
        props: defaultProps,
      })
      const radios = findRadioContainers(wrapper)
      expect(isRadioChecked(radios[0])).toBe(true)
    })

    it('should have cash radio unchecked when payment type is not cash', () => {
      const wrapper = mount(PaymentSection, {
        props: {
          modelValue: creditCardPaymentMethod,
          sectionNumber: 3,
        },
      })
      const radios = findRadioContainers(wrapper)
      expect(isRadioChecked(radios[0])).toBe(false)
    })

    it('should display cash emoji icon', () => {
      const wrapper = mount(PaymentSection, {
        props: defaultProps,
      })
      expect(wrapper.text()).toContain('\uD83D\uDCB5') // Cash emoji
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
    it('should emit update:modelValue when cash option is clicked', async () => {
      const wrapper = mount(PaymentSection, {
        props: {
          modelValue: creditCardPaymentMethod,
          sectionNumber: 3,
        },
      })

      await clickPaymentOption(wrapper, 0) // Click cash option

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

      await clickPaymentOption(wrapper, 0) // Click cash option

      const emittedValue = wrapper.emitted('update:modelValue')?.[0]?.[0] as PaymentMethod
      expect(emittedValue.type).toBe('cash')
      expect(emittedValue.saveForFuture).toBe(true)
      expect(emittedValue.creditCard).toBeDefined()
    })

    it('should have clickable div for cash option', () => {
      const wrapper = mount(PaymentSection, {
        props: defaultProps,
      })
      const clickableDiv = wrapper.find('.p-4.border.rounded-lg.cursor-pointer')
      expect(clickableDiv.exists()).toBe(true)
    })

    it('should render two payment option containers', () => {
      const wrapper = mount(PaymentSection, {
        props: defaultProps,
      })
      const clickableDivs = wrapper.findAll('.p-4.border.rounded-lg.cursor-pointer')
      expect(clickableDivs.length).toBe(2) // Cash and Credit Card
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

      await clickPaymentOption(wrapper, 0) // Click cash option

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

    it('should emit event each time option is clicked', async () => {
      const wrapper = mount(PaymentSection, {
        props: {
          modelValue: creditCardPaymentMethod,
          sectionNumber: 3,
        },
      })

      await clickPaymentOption(wrapper, 0) // Click cash option
      await clickPaymentOption(wrapper, 0) // Click again

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
    it('should have clickable payment options', () => {
      const wrapper = mount(PaymentSection, {
        props: defaultProps,
      })
      const clickableDivs = wrapper.findAll('.p-4.border.rounded-lg.cursor-pointer')
      expect(clickableDivs.length).toBeGreaterThanOrEqual(1)
    })

    it('should have proper radio button styling', () => {
      const wrapper = mount(PaymentSection, {
        props: defaultProps,
      })
      const radios = findRadioContainers(wrapper)
      expect(radios.length).toBeGreaterThanOrEqual(1)
      radios.forEach((radio) => {
        expect(radio.classes()).toContain('border-2')
        expect(radio.classes()).toContain('rounded-full')
      })
    })

    it('should show checked indicator for selected option', () => {
      const wrapper = mount(PaymentSection, {
        props: defaultProps,
      })
      const radios = findRadioContainers(wrapper)
      expect(isRadioChecked(radios[0])).toBe(true)
    })
  })

  // ==========================================
  // Dark Mode Tests
  // ==========================================
  describe('Dark Mode Styling', () => {
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

    it('should have dark mode text colors', () => {
      const wrapper = mount(PaymentSection, {
        props: defaultProps,
      })
      const html = wrapper.html()
      expect(html).toContain('dark:text-white')
      expect(html).toContain('dark:text-gray-400')
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

      expect(header.exists()).toBe(true)
      expect(content.exists()).toBe(true)

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
