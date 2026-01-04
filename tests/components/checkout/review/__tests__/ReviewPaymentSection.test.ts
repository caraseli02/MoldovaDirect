import { describe, it, expect, vi } from 'vitest'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import ReviewPaymentSection from '~/components/checkout/review/ReviewPaymentSection.vue'
import type { PaymentMethod } from '~/types/checkout'

// Mock i18n
vi.mock('#imports', () => ({
  useI18n: vi.fn(() => ({ t: (k: string) => k })),
}))

describe('ReviewPaymentSection', () => {
  const createPaymentMethod = (type: PaymentMethod['type'], overrides = {}): PaymentMethod => {
    const base: PaymentMethod = { type }

    if (type === 'credit_card') {
      return {
        ...base,
        creditCard: {
          number: '4111111111111111',
          expiryMonth: '12',
          expiryYear: '25',
          cvv: '123',
          holderName: 'John Doe',
        },
        ...overrides,
      }
    }

    if (type === 'paypal') {
      return {
        ...base,
        paypal: {
          email: 'john.doe@example.com',
        },
        ...overrides,
      }
    }

    if (type === 'bank_transfer') {
      return {
        ...base,
        bankTransfer: {
          reference: 'REF123456',
        },
        ...overrides,
      }
    }

    if (type === 'cash') {
      return {
        ...base,
        cash: {
          confirmed: true,
        },
        ...overrides,
      }
    }

    return { ...base, ...overrides }
  }

  const mountComponent = (props = {}, options = {}): VueWrapper => {
    return mount(ReviewPaymentSection, {
      props: {
        paymentMethod: null,
        ...props,
      },
      global: {
        stubs: {
          // No external component stubs needed for this component
        },
      },
      ...options,
    })
  }

  describe('Rendering', () => {
    it('should render the payment section', () => {
      const wrapper = mountComponent()
      expect(wrapper.exists()).toBe(true)
    })

    it('should render as a section element', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('section').exists()).toBe(true)
    })

    it('should render with correct base styling', () => {
      const wrapper = mountComponent()
      const section = wrapper.find('section')
      expect(section.classes()).toContain('bg-white')
      expect(section.classes()).toContain('rounded-lg')
      expect(section.classes()).toContain('shadow-sm')
    })

    it('should render payment method title', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('checkout.review.paymentMethod')
    })

    it('should render title in h3 element', () => {
      const wrapper = mountComponent()
      const h3 = wrapper.find('h3')
      expect(h3.exists()).toBe(true)
      expect(h3.text()).toContain('checkout.review.paymentMethod')
    })

    it('should render edit payment button', () => {
      const wrapper = mountComponent()
      const editButton = wrapper.find('button')
      expect(editButton.exists()).toBe(true)
      expect(editButton.text()).toContain('checkout.review.editPayment')
    })

    it('should render header with flex layout', () => {
      const wrapper = mountComponent()
      const header = wrapper.find('header')
      expect(header.exists()).toBe(true)
      expect(header.classes()).toContain('flex')
      expect(header.classes()).toContain('items-center')
      expect(header.classes()).toContain('justify-between')
    })
  })

  describe('Props handling', () => {
    it('should accept null paymentMethod prop', () => {
      const wrapper = mountComponent({ paymentMethod: null })
      expect(wrapper.exists()).toBe(true)
    })

    it('should accept cash payment method', () => {
      const paymentMethod = createPaymentMethod('cash')
      const wrapper = mountComponent({ paymentMethod })
      expect(wrapper.text()).toContain('checkout.payment.cash.title')
    })

    it('should accept credit_card payment method', () => {
      const paymentMethod = createPaymentMethod('credit_card')
      const wrapper = mountComponent({ paymentMethod })
      expect(wrapper.text()).toContain('checkout.payment.creditCard.title')
    })

    it('should accept paypal payment method', () => {
      const paymentMethod = createPaymentMethod('paypal')
      const wrapper = mountComponent({ paymentMethod })
      expect(wrapper.text()).toContain('checkout.payment.paypal.title')
    })

    it('should accept bank_transfer payment method', () => {
      const paymentMethod = createPaymentMethod('bank_transfer')
      const wrapper = mountComponent({ paymentMethod })
      expect(wrapper.text()).toContain('checkout.payment.bankTransfer.title')
    })
  })

  describe('Cash payment display', () => {
    it('should render cash payment title', () => {
      const paymentMethod = createPaymentMethod('cash')
      const wrapper = mountComponent({ paymentMethod })
      expect(wrapper.text()).toContain('checkout.payment.cash.title')
    })

    it('should render cash payment description', () => {
      const paymentMethod = createPaymentMethod('cash')
      const wrapper = mountComponent({ paymentMethod })
      expect(wrapper.text()).toContain('checkout.payment.cash.description')
    })

    it('should render cash payment icon (SVG)', () => {
      const paymentMethod = createPaymentMethod('cash')
      const wrapper = mountComponent({ paymentMethod })
      const svg = wrapper.find('svg.text-green-600')
      expect(svg.exists()).toBe(true)
    })

    it('should have flex layout for cash payment display', () => {
      const paymentMethod = createPaymentMethod('cash')
      const wrapper = mountComponent({ paymentMethod })
      const container = wrapper.find('.flex.items-center.space-x-3')
      expect(container.exists()).toBe(true)
    })
  })

  describe('Credit card payment display', () => {
    it('should render credit card title', () => {
      const paymentMethod = createPaymentMethod('credit_card')
      const wrapper = mountComponent({ paymentMethod })
      expect(wrapper.text()).toContain('checkout.payment.creditCard.title')
    })

    it('should render masked card number with last 4 digits', () => {
      const paymentMethod = createPaymentMethod('credit_card', {
        creditCard: {
          number: '4111111111111234',
          expiryMonth: '12',
          expiryYear: '25',
          cvv: '123',
          holderName: 'John Doe',
        },
      })
      const wrapper = mountComponent({ paymentMethod })
      expect(wrapper.text()).toContain('**** **** **** 1234')
    })

    it('should render masked card number with fallback when number is missing', () => {
      const paymentMethod: PaymentMethod = {
        type: 'credit_card',
        creditCard: {
          number: '',
          expiryMonth: '12',
          expiryYear: '25',
          cvv: '123',
          holderName: 'John Doe',
        },
      }
      const wrapper = mountComponent({ paymentMethod })
      expect(wrapper.text()).toContain('**** **** **** ****')
    })

    it('should render masked card number with fallback when creditCard is undefined', () => {
      const paymentMethod: PaymentMethod = {
        type: 'credit_card',
      }
      const wrapper = mountComponent({ paymentMethod })
      expect(wrapper.text()).toContain('**** **** **** ****')
    })

    it('should render credit card icon (SVG with blue color)', () => {
      const paymentMethod = createPaymentMethod('credit_card')
      const wrapper = mountComponent({ paymentMethod })
      const svg = wrapper.find('svg.text-blue-600')
      expect(svg.exists()).toBe(true)
    })

    it('should correctly slice last 4 digits from long card number', () => {
      const paymentMethod = createPaymentMethod('credit_card', {
        creditCard: {
          number: '4111222233339999',
          expiryMonth: '12',
          expiryYear: '25',
          cvv: '123',
          holderName: 'John Doe',
        },
      })
      const wrapper = mountComponent({ paymentMethod })
      expect(wrapper.text()).toContain('9999')
    })
  })

  describe('PayPal payment display', () => {
    it('should render paypal title', () => {
      const paymentMethod = createPaymentMethod('paypal')
      const wrapper = mountComponent({ paymentMethod })
      expect(wrapper.text()).toContain('checkout.payment.paypal.title')
    })

    it('should render paypal email', () => {
      const paymentMethod = createPaymentMethod('paypal', {
        paypal: { email: 'user@paypal.com' },
      })
      const wrapper = mountComponent({ paymentMethod })
      expect(wrapper.text()).toContain('user@paypal.com')
    })

    it('should render empty string when paypal email is missing', () => {
      const paymentMethod: PaymentMethod = {
        type: 'paypal',
      }
      const wrapper = mountComponent({ paymentMethod })
      expect(wrapper.text()).toContain('checkout.payment.paypal.title')
    })

    it('should render paypal icon (SVG with blue-500 color)', () => {
      const paymentMethod = createPaymentMethod('paypal')
      const wrapper = mountComponent({ paymentMethod })
      const svg = wrapper.find('svg.text-blue-500')
      expect(svg.exists()).toBe(true)
    })
  })

  describe('Bank transfer payment display', () => {
    it('should render bank transfer title', () => {
      const paymentMethod = createPaymentMethod('bank_transfer')
      const wrapper = mountComponent({ paymentMethod })
      expect(wrapper.text()).toContain('checkout.payment.bankTransfer.title')
    })

    it('should render bank transfer description', () => {
      const paymentMethod = createPaymentMethod('bank_transfer')
      const wrapper = mountComponent({ paymentMethod })
      expect(wrapper.text()).toContain('checkout.payment.bankTransfer.description')
    })

    it('should render bank transfer icon (SVG with gray color)', () => {
      const paymentMethod = createPaymentMethod('bank_transfer')
      const wrapper = mountComponent({ paymentMethod })
      const svg = wrapper.find('svg.text-gray-600')
      expect(svg.exists()).toBe(true)
    })
  })

  describe('User interactions', () => {
    it('should emit lucide:square-pen event when edit button is clicked', async () => {
      const wrapper = mountComponent()
      const editButton = wrapper.find('button')

      await editButton.trigger('click')

      expect(wrapper.emitted('lucide:square-pen')).toBeTruthy()
      expect(wrapper.emitted('lucide:square-pen')?.length).toBe(1)
    })

    it('should emit event on each click', async () => {
      const wrapper = mountComponent()
      const editButton = wrapper.find('button')

      await editButton.trigger('click')
      await editButton.trigger('click')
      await editButton.trigger('click')

      expect(wrapper.emitted('lucide:square-pen')?.length).toBe(3)
    })
  })

  describe('Conditional rendering', () => {
    it('should not render payment details when paymentMethod is null', () => {
      const wrapper = mountComponent({ paymentMethod: null })
      expect(wrapper.find('.space-y-3').exists()).toBe(false)
    })

    it('should render payment details container when paymentMethod exists', () => {
      const paymentMethod = createPaymentMethod('cash')
      const wrapper = mountComponent({ paymentMethod })
      expect(wrapper.find('.space-y-3').exists()).toBe(true)
    })

    it('should only render cash section when type is cash', () => {
      const paymentMethod = createPaymentMethod('cash')
      const wrapper = mountComponent({ paymentMethod })

      expect(wrapper.text()).toContain('checkout.payment.cash.title')
      expect(wrapper.text()).not.toContain('checkout.payment.creditCard.title')
      expect(wrapper.text()).not.toContain('checkout.payment.paypal.title')
      expect(wrapper.text()).not.toContain('checkout.payment.bankTransfer.title')
    })

    it('should only render credit card section when type is credit_card', () => {
      const paymentMethod = createPaymentMethod('credit_card')
      const wrapper = mountComponent({ paymentMethod })

      expect(wrapper.text()).toContain('checkout.payment.creditCard.title')
      expect(wrapper.text()).not.toContain('checkout.payment.cash.title')
      expect(wrapper.text()).not.toContain('checkout.payment.paypal.title')
      expect(wrapper.text()).not.toContain('checkout.payment.bankTransfer.title')
    })

    it('should only render paypal section when type is paypal', () => {
      const paymentMethod = createPaymentMethod('paypal')
      const wrapper = mountComponent({ paymentMethod })

      expect(wrapper.text()).toContain('checkout.payment.paypal.title')
      expect(wrapper.text()).not.toContain('checkout.payment.cash.title')
      expect(wrapper.text()).not.toContain('checkout.payment.creditCard.title')
      expect(wrapper.text()).not.toContain('checkout.payment.bankTransfer.title')
    })

    it('should only render bank transfer section when type is bank_transfer', () => {
      const paymentMethod = createPaymentMethod('bank_transfer')
      const wrapper = mountComponent({ paymentMethod })

      expect(wrapper.text()).toContain('checkout.payment.bankTransfer.title')
      expect(wrapper.text()).not.toContain('checkout.payment.cash.title')
      expect(wrapper.text()).not.toContain('checkout.payment.creditCard.title')
      expect(wrapper.text()).not.toContain('checkout.payment.paypal.title')
    })
  })

  describe('i18n translations', () => {
    it('should use correct translation key for section title', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('checkout.review.paymentMethod')
    })

    it('should use correct translation key for edit button', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('checkout.review.editPayment')
    })

    it('should use correct translation keys for cash payment', () => {
      const paymentMethod = createPaymentMethod('cash')
      const wrapper = mountComponent({ paymentMethod })
      expect(wrapper.text()).toContain('checkout.payment.cash.title')
      expect(wrapper.text()).toContain('checkout.payment.cash.description')
    })

    it('should use correct translation key for credit card title', () => {
      const paymentMethod = createPaymentMethod('credit_card')
      const wrapper = mountComponent({ paymentMethod })
      expect(wrapper.text()).toContain('checkout.payment.creditCard.title')
    })

    it('should use correct translation key for paypal title', () => {
      const paymentMethod = createPaymentMethod('paypal')
      const wrapper = mountComponent({ paymentMethod })
      expect(wrapper.text()).toContain('checkout.payment.paypal.title')
    })

    it('should use correct translation keys for bank transfer', () => {
      const paymentMethod = createPaymentMethod('bank_transfer')
      const wrapper = mountComponent({ paymentMethod })
      expect(wrapper.text()).toContain('checkout.payment.bankTransfer.title')
      expect(wrapper.text()).toContain('checkout.payment.bankTransfer.description')
    })
  })

  describe('Edge cases', () => {
    it('should handle payment method with empty creditCard object', () => {
      const paymentMethod: PaymentMethod = {
        type: 'credit_card',
        creditCard: {
          number: '',
          expiryMonth: '',
          expiryYear: '',
          cvv: '',
          holderName: '',
        },
      }
      const wrapper = mountComponent({ paymentMethod })
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.text()).toContain('**** **** **** ****')
    })

    it('should handle payment method with null-like creditCard values', () => {
      const paymentMethod: PaymentMethod = {
        type: 'credit_card',
        creditCard: undefined,
      }
      const wrapper = mountComponent({ paymentMethod })
      expect(wrapper.exists()).toBe(true)
    })

    it('should handle paypal with empty email', () => {
      const paymentMethod: PaymentMethod = {
        type: 'paypal',
        paypal: { email: '' },
      }
      const wrapper = mountComponent({ paymentMethod })
      expect(wrapper.exists()).toBe(true)
    })

    it('should handle paypal with undefined paypal object', () => {
      const paymentMethod: PaymentMethod = {
        type: 'paypal',
        paypal: undefined,
      }
      const wrapper = mountComponent({ paymentMethod })
      expect(wrapper.exists()).toBe(true)
    })

    it('should handle card number with spaces', () => {
      const paymentMethod = createPaymentMethod('credit_card', {
        creditCard: {
          number: '4111 1111 1111 1111',
          expiryMonth: '12',
          expiryYear: '25',
          cvv: '123',
          holderName: 'John Doe',
        },
      })
      const wrapper = mountComponent({ paymentMethod })
      // slice(-4) should get '1111' from the end
      expect(wrapper.text()).toContain('1111')
    })

    it('should handle very short card number', () => {
      const paymentMethod = createPaymentMethod('credit_card', {
        creditCard: {
          number: '12',
          expiryMonth: '12',
          expiryYear: '25',
          cvv: '123',
          holderName: 'John Doe',
        },
      })
      const wrapper = mountComponent({ paymentMethod })
      // slice(-4) on '12' returns '12'
      expect(wrapper.text()).toContain('12')
    })
  })

  describe('SVG icons', () => {
    it('should render SVG icon for cash payment with correct viewBox', () => {
      const paymentMethod = createPaymentMethod('cash')
      const wrapper = mountComponent({ paymentMethod })
      const svg = wrapper.find('svg.text-green-600')
      expect(svg.attributes('viewBox')).toBe('0 0 24 24')
    })

    it('should render SVG icon for credit card with correct viewBox', () => {
      const paymentMethod = createPaymentMethod('credit_card')
      const wrapper = mountComponent({ paymentMethod })
      const svg = wrapper.find('svg.text-blue-600')
      expect(svg.attributes('viewBox')).toBe('0 0 24 24')
    })

    it('should render SVG icon for paypal with correct viewBox', () => {
      const paymentMethod = createPaymentMethod('paypal')
      const wrapper = mountComponent({ paymentMethod })
      const svg = wrapper.find('svg.text-blue-500')
      expect(svg.attributes('viewBox')).toBe('0 0 24 24')
    })

    it('should render SVG icon for bank transfer with correct viewBox', () => {
      const paymentMethod = createPaymentMethod('bank_transfer')
      const wrapper = mountComponent({ paymentMethod })
      const svg = wrapper.find('svg.text-gray-600')
      expect(svg.attributes('viewBox')).toBe('0 0 24 24')
    })

    it('should render SVG icons with correct dimensions', () => {
      const paymentMethod = createPaymentMethod('cash')
      const wrapper = mountComponent({ paymentMethod })
      const svg = wrapper.find('svg')
      expect(svg.classes()).toContain('w-6')
      expect(svg.classes()).toContain('h-6')
    })
  })

  describe('Styling and structure', () => {
    it('should have dark mode support classes', () => {
      const wrapper = mountComponent()
      const section = wrapper.find('section')
      expect(section.classes()).toContain('dark:bg-gray-800')
      expect(section.classes()).toContain('dark:border-gray-700')
    })

    it('should have proper text colors for light mode', () => {
      const wrapper = mountComponent()
      const h3 = wrapper.find('h3')
      expect(h3.classes()).toContain('text-gray-900')
    })

    it('should have proper text colors for dark mode on title', () => {
      const wrapper = mountComponent()
      const h3 = wrapper.find('h3')
      expect(h3.classes()).toContain('dark:text-white')
    })

    it('should have proper padding on section', () => {
      const wrapper = mountComponent()
      const section = wrapper.find('section')
      expect(section.classes()).toContain('p-6')
    })

    it('should have border styling', () => {
      const wrapper = mountComponent()
      const section = wrapper.find('section')
      expect(section.classes()).toContain('border')
      expect(section.classes()).toContain('border-gray-200')
    })

    it('should have edit button with green hover styling', () => {
      const wrapper = mountComponent()
      const button = wrapper.find('button')
      expect(button.classes()).toContain('text-green-600')
      expect(button.classes()).toContain('hover:text-green-700')
    })

    it('should have margin between header and content', () => {
      const wrapper = mountComponent()
      const header = wrapper.find('header')
      expect(header.classes()).toContain('mb-4')
    })
  })

  describe('Accessibility', () => {
    it('should use semantic section element', () => {
      const wrapper = mountComponent()
      expect(wrapper.element.tagName.toLowerCase()).toBe('section')
    })

    it('should use proper heading hierarchy with h3', () => {
      const wrapper = mountComponent()
      const headings = wrapper.findAll('h3')
      expect(headings.length).toBe(1)
    })

    it('should have button element for edit action', () => {
      const wrapper = mountComponent()
      const button = wrapper.find('button')
      expect(button.exists()).toBe(true)
    })

    it('should have semantic header element', () => {
      const wrapper = mountComponent()
      const header = wrapper.find('header')
      expect(header.exists()).toBe(true)
    })

    it('should have proper text hierarchy for payment details', () => {
      const paymentMethod = createPaymentMethod('cash')
      const wrapper = mountComponent({ paymentMethod })

      // Title should be in a p element with font-medium
      const title = wrapper.find('.text-sm.font-medium')
      expect(title.exists()).toBe(true)

      // Description should be in a p element with lighter color
      const description = wrapper.find('.text-sm.text-gray-600')
      expect(description.exists()).toBe(true)
    })
  })

  describe('Component behavior', () => {
    it('should be a display-only component with single event', () => {
      const wrapper = mountComponent()

      // Component should not emit any form-related events
      expect(wrapper.emitted('update:modelValue')).toBeFalsy()
      expect(wrapper.emitted('submit')).toBeFalsy()
      expect(wrapper.emitted('change')).toBeFalsy()
    })

    it('should not have any input elements', () => {
      const wrapper = mountComponent()
      const inputs = wrapper.findAll('input')
      expect(inputs.length).toBe(0)
    })

    it('should have exactly one button element', () => {
      const wrapper = mountComponent()
      const buttons = wrapper.findAll('button')
      expect(buttons.length).toBe(1)
    })

    it('should update display when paymentMethod prop changes', async () => {
      const wrapper = mountComponent({ paymentMethod: createPaymentMethod('cash') })
      expect(wrapper.text()).toContain('checkout.payment.cash.title')

      await wrapper.setProps({ paymentMethod: createPaymentMethod('credit_card') })
      expect(wrapper.text()).toContain('checkout.payment.creditCard.title')
      expect(wrapper.text()).not.toContain('checkout.payment.cash.title')
    })

    it('should hide payment details when paymentMethod becomes null', async () => {
      const wrapper = mountComponent({ paymentMethod: createPaymentMethod('cash') })
      expect(wrapper.find('.space-y-3').exists()).toBe(true)

      await wrapper.setProps({ paymentMethod: null })
      expect(wrapper.find('.space-y-3').exists()).toBe(false)
    })
  })
})
