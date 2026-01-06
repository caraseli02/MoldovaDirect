import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { ref, computed } from 'vue'
import CardSection from '~/components/checkout/payment/CardSection.vue'

// Mock useCardValidation composable
const mockCreditCardData = ref({
  number: '',
  expiryMonth: '',
  expiryYear: '',
  cvv: '',
  holderName: '',
})

const mockCardBrand = ref('')
const mockValidationErrors = ref<Record<string, string>>({})
const mockExpiryDisplay = ref('')
const mockCvvMaxLength = computed(() => mockCardBrand.value === 'amex' ? 4 : 3)

const mockFormatCardNumber = vi.fn((event: Event) => {
  const input = event.target as HTMLInputElement
  mockCreditCardData.value.number = input.value
})
const mockFormatExpiry = vi.fn((event: Event) => {
  const input = event.target as HTMLInputElement
  mockExpiryDisplay.value = input.value
})
const mockFormatCVV = vi.fn((event: Event) => {
  const input = event.target as HTMLInputElement
  mockCreditCardData.value.cvv = input.value
})
const mockValidateCardNumber = vi.fn()
const mockValidateExpiry = vi.fn()
const mockValidateCVV = vi.fn()
const mockValidateHolderName = vi.fn()
const mockGetCardBrandIcon = vi.fn((brand: string) => `lucide:credit-card-${brand || 'default'}`)
const mockInitializeFromData = vi.fn()

vi.mock('~/composables/checkout/useCardValidation', () => ({
  useCardValidation: () => ({
    creditCardData: mockCreditCardData,
    cardBrand: mockCardBrand,
    validationErrors: mockValidationErrors,
    expiryDisplay: mockExpiryDisplay,
    cvvMaxLength: mockCvvMaxLength,
    formatCardNumber: mockFormatCardNumber,
    formatExpiry: mockFormatExpiry,
    formatCVV: mockFormatCVV,
    validateCardNumber: mockValidateCardNumber,
    validateExpiry: mockValidateExpiry,
    validateCVV: mockValidateCVV,
    validateHolderName: mockValidateHolderName,
    getCardBrandIcon: mockGetCardBrandIcon,
    initializeFromData: mockInitializeFromData,
  }),
}))

describe('CardSection', () => {
  const defaultProps = {
    modelValue: {
      number: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      holderName: '',
    },
    errors: {},
  }

  const mountComponent = (props = {}, options = {}): VueWrapper => {
    return mount(CardSection, {
      props: { ...defaultProps, ...props },
      global: {
        stubs: {
          UiInput: {
            template: '<input :id="$attrs.id" :value="$attrs.value" :placeholder="$attrs.placeholder" :maxlength="$attrs.maxlength" :autocomplete="$attrs.autocomplete" :aria-invalid="$attrs[\'aria-invalid\']" :aria-describedby="$attrs[\'aria-describedby\']" @input="$emit(\'input\', $event)" @blur="$emit(\'blur\', $event)" />',
            inheritAttrs: false,
          },
          UiLabel: {
            template: '<label :for="$attrs.for"><slot /></label>',
            inheritAttrs: false,
          },
          Button: {
            template: '<button type="button" :aria-label="$attrs[\'aria-label\']" :aria-expanded="$attrs[\'aria-expanded\']" @click="$emit(\'click\', $event)"><slot /></button>',
            inheritAttrs: false,
          },
          commonIcon: {
            template: '<span :class="name" data-testid="icon"></span>',
            props: ['name'],
          },
        },
      },
      ...options,
    })
  }

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks()
    mockCreditCardData.value = {
      number: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      holderName: '',
    }
    mockCardBrand.value = ''
    mockValidationErrors.value = {}
    mockExpiryDisplay.value = ''
  })

  describe('Rendering', () => {
    it('should render the card section', () => {
      const wrapper = mountComponent()
      expect(wrapper.exists()).toBe(true)
    })

    it('should render card number input field', () => {
      const wrapper = mountComponent()
      const cardNumberInput = wrapper.find('#card-number')
      expect(cardNumberInput.exists()).toBe(true)
    })

    it('should render expiry date input field', () => {
      const wrapper = mountComponent()
      const expiryInput = wrapper.find('#expiry-date')
      expect(expiryInput.exists()).toBe(true)
    })

    it('should render CVV input field', () => {
      const wrapper = mountComponent()
      const cvvInput = wrapper.find('#cvv')
      expect(cvvInput.exists()).toBe(true)
    })

    it('should render cardholder name input field', () => {
      const wrapper = mountComponent()
      const holderNameInput = wrapper.find('#cardholder-name')
      expect(holderNameInput.exists()).toBe(true)
    })

    it('should render all form labels', () => {
      const wrapper = mountComponent()
      const labels = wrapper.findAll('label')
      expect(labels.length).toBe(4)
    })

    it('should have proper autocomplete attributes', () => {
      const wrapper = mountComponent()

      const cardNumberInput = wrapper.find('#card-number')
      expect(cardNumberInput.attributes('autocomplete')).toBe('cc-number')

      const expiryInput = wrapper.find('#expiry-date')
      expect(expiryInput.attributes('autocomplete')).toBe('cc-exp')

      const cvvInput = wrapper.find('#cvv')
      expect(cvvInput.attributes('autocomplete')).toBe('cc-csc')

      const holderNameInput = wrapper.find('#cardholder-name')
      expect(holderNameInput.attributes('autocomplete')).toBe('cc-name')
    })
  })

  describe('v-model binding', () => {
    it('should emit update:modelValue when card number changes', async () => {
      const wrapper = mountComponent()
      const cardNumberInput = wrapper.find('#card-number')

      // Use setValue which is the proper way to trigger input with a value
      await cardNumberInput.setValue('4111111111111111')

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    })

    it('should emit update:modelValue when expiry date changes', async () => {
      const wrapper = mountComponent()
      const expiryInput = wrapper.find('#expiry-date')

      await expiryInput.setValue('12/25')

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    })

    it('should emit update:modelValue when CVV changes', async () => {
      const wrapper = mountComponent()
      const cvvInput = wrapper.find('#cvv')

      await cvvInput.setValue('123')

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    })

    it('should emit update:modelValue when holder name changes', async () => {
      const wrapper = mountComponent()
      const holderNameInput = wrapper.find('#cardholder-name')

      await holderNameInput.setValue('John Doe')

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    })

    it('should initialize from modelValue prop', async () => {
      const initialData = {
        number: '4111 1111 1111 1111',
        expiryMonth: '12',
        expiryYear: '25',
        cvv: '123',
        holderName: 'John Doe',
      }

      mountComponent({ modelValue: initialData })

      expect(mockInitializeFromData).toHaveBeenCalled()
    })
  })

  describe('Card brand detection icon', () => {
    it('should not show card brand icon when no brand detected', () => {
      mockCardBrand.value = ''
      const wrapper = mountComponent()

      wrapper.find('[aria-hidden="true"]')
      // First icon should be hidden card brand area (not shown when no brand)
      expect(wrapper.find('.absolute.inset-y-0.right-0.pr-3.flex.items-center').exists()).toBe(false)
    })

    it('should show card brand icon when brand is detected', () => {
      mockCardBrand.value = 'visa'
      const wrapper = mountComponent()

      // Card brand display area should exist
      const iconContainer = wrapper.find('.absolute.inset-y-0.right-0.pr-3.flex.items-center')
      expect(iconContainer.exists()).toBe(true)
    })

    it('should call getCardBrandIcon with detected brand', () => {
      mockCardBrand.value = 'mastercard'
      mountComponent()

      expect(mockGetCardBrandIcon).toHaveBeenCalledWith('mastercard')
    })
  })

  describe('CVV help toggle', () => {
    it('should not show CVV help by default', () => {
      const wrapper = mountComponent()
      const cvvHelp = wrapper.find('#cvv-help')
      expect(cvvHelp.exists()).toBe(false)
    })

    it('should show CVV help when toggle button is clicked', async () => {
      const wrapper = mountComponent()
      const helpButton = wrapper.find('button[aria-expanded]')

      await helpButton.trigger('click')

      const cvvHelp = wrapper.find('#cvv-help')
      expect(cvvHelp.exists()).toBe(true)
    })

    it('should hide CVV help when toggle button is clicked again', async () => {
      const wrapper = mountComponent()
      const helpButton = wrapper.find('button[aria-expanded]')

      await helpButton.trigger('click')
      await helpButton.trigger('click')

      const cvvHelp = wrapper.find('#cvv-help')
      expect(cvvHelp.exists()).toBe(false)
    })

    it('should have correct aria-expanded attribute on help button', async () => {
      const wrapper = mountComponent()
      const helpButton = wrapper.find('button[aria-expanded]')

      expect(helpButton.attributes('aria-expanded')).toBe('false')

      await helpButton.trigger('click')

      expect(helpButton.attributes('aria-expanded')).toBe('true')
    })

    it('should display CVV help text content', async () => {
      const wrapper = mountComponent()
      const helpButton = wrapper.find('button[aria-expanded]')

      await helpButton.trigger('click')

      const cvvHelp = wrapper.find('#cvv-help')
      expect(cvvHelp.text()).toContain('checkout.payment.cvvHelp')
    })
  })

  describe('Error display', () => {
    it('should display card number error from external errors', () => {
      const wrapper = mountComponent({
        errors: { cardNumber: 'Invalid card number' },
      })

      const errorElement = wrapper.find('#card-number-error')
      expect(errorElement.exists()).toBe(true)
      expect(errorElement.text()).toBe('Invalid card number')
    })

    it('should display card number error from validation errors', () => {
      mockValidationErrors.value = { cardNumber: 'Card number is required' }
      const wrapper = mountComponent()

      const errorElement = wrapper.find('#card-number-error')
      expect(errorElement.exists()).toBe(true)
      expect(errorElement.text()).toBe('Card number is required')
    })

    it('should display expiry error', () => {
      mockValidationErrors.value = { expiry: 'Invalid expiry date' }
      const wrapper = mountComponent()

      const errorElement = wrapper.find('#expiry-error')
      expect(errorElement.exists()).toBe(true)
      expect(errorElement.text()).toBe('Invalid expiry date')
    })

    it('should display CVV error', () => {
      mockValidationErrors.value = { cvv: 'CVV is required' }
      const wrapper = mountComponent()

      const errorElement = wrapper.find('#cvv-error')
      expect(errorElement.exists()).toBe(true)
      expect(errorElement.text()).toBe('CVV is required')
    })

    it('should display holder name error', () => {
      mockValidationErrors.value = { holderName: 'Name is required' }
      const wrapper = mountComponent()

      const errorElement = wrapper.find('#holder-name-error')
      expect(errorElement.exists()).toBe(true)
      expect(errorElement.text()).toBe('Name is required')
    })

    it('should set aria-invalid on input when error exists', () => {
      mockValidationErrors.value = { cardNumber: 'Error' }
      const wrapper = mountComponent()

      const cardNumberInput = wrapper.find('#card-number')
      expect(cardNumberInput.attributes('aria-invalid')).toBe('true')
    })

    it('should set aria-describedby to error element when error exists', () => {
      mockValidationErrors.value = { cardNumber: 'Error' }
      const wrapper = mountComponent()

      const cardNumberInput = wrapper.find('#card-number')
      expect(cardNumberInput.attributes('aria-describedby')).toBe('card-number-error')
    })

    it('should have role="alert" on error messages', () => {
      mockValidationErrors.value = { cardNumber: 'Error' }
      const wrapper = mountComponent()

      const errorElement = wrapper.find('#card-number-error')
      expect(errorElement.attributes('role')).toBe('alert')
    })

    it('should prioritize external errors over validation errors', () => {
      mockValidationErrors.value = { cardNumber: 'Internal error' }
      const wrapper = mountComponent({
        errors: { cardNumber: 'External error' },
      })

      const errorElement = wrapper.find('#card-number-error')
      expect(errorElement.text()).toBe('External error')
    })
  })

  describe('Security notice section', () => {
    it('should render security notice', () => {
      const wrapper = mountComponent()
      const securityNotice = wrapper.find('[role="status"]')
      expect(securityNotice.exists()).toBe(true)
    })

    it('should display secure payment title', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('checkout.payment.securePayment')
    })

    it('should display security notice text', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('checkout.payment.securityNotice')
    })

    it('should render shield icon in security notice', () => {
      const wrapper = mountComponent()
      const securityNotice = wrapper.find('[role="status"]')
      const icon = securityNotice.find('[data-testid="icon"]')
      expect(icon.exists()).toBe(true)
    })
  })

  describe('Input validation on blur', () => {
    it('should validate card number on blur', async () => {
      const wrapper = mountComponent()
      const cardNumberInput = wrapper.find('#card-number')

      await cardNumberInput.trigger('blur')

      expect(mockValidateCardNumber).toHaveBeenCalled()
    })

    it('should validate expiry on blur', async () => {
      const wrapper = mountComponent()
      const expiryInput = wrapper.find('#expiry-date')

      await expiryInput.trigger('blur')

      expect(mockValidateExpiry).toHaveBeenCalled()
    })

    it('should validate CVV on blur', async () => {
      const wrapper = mountComponent()
      const cvvInput = wrapper.find('#cvv')

      await cvvInput.trigger('blur')

      expect(mockValidateCVV).toHaveBeenCalled()
    })

    it('should validate holder name on blur', async () => {
      const wrapper = mountComponent()
      const holderNameInput = wrapper.find('#cardholder-name')

      await holderNameInput.trigger('blur')

      expect(mockValidateHolderName).toHaveBeenCalled()
    })
  })

  describe('Input formatting', () => {
    it('should call formatCardNumber on card number input', async () => {
      const wrapper = mountComponent()
      const cardNumberInput = wrapper.find('#card-number')

      await cardNumberInput.setValue('4111')

      expect(mockFormatCardNumber).toHaveBeenCalled()
    })

    it('should call formatExpiry on expiry input', async () => {
      const wrapper = mountComponent()
      const expiryInput = wrapper.find('#expiry-date')

      await expiryInput.setValue('1225')

      expect(mockFormatExpiry).toHaveBeenCalled()
    })

    it('should call formatCVV on CVV input', async () => {
      const wrapper = mountComponent()
      const cvvInput = wrapper.find('#cvv')

      await cvvInput.setValue('123')

      expect(mockFormatCVV).toHaveBeenCalled()
    })
  })

  describe('CVV max length', () => {
    it('should have maxlength of 3 for non-Amex cards', () => {
      mockCardBrand.value = 'visa'
      const wrapper = mountComponent()
      const cvvInput = wrapper.find('#cvv')
      expect(cvvInput.attributes('maxlength')).toBe('3')
    })

    it('should have maxlength of 4 for Amex cards', () => {
      mockCardBrand.value = 'amex'
      const wrapper = mountComponent()
      const cvvInput = wrapper.find('#cvv')
      expect(cvvInput.attributes('maxlength')).toBe('4')
    })
  })

  describe('Accessibility', () => {
    it('should have proper label associations', () => {
      const wrapper = mountComponent()

      const cardNumberLabel = wrapper.find('label[for="card-number"]')
      expect(cardNumberLabel.exists()).toBe(true)

      const expiryLabel = wrapper.find('label[for="expiry-date"]')
      expect(expiryLabel.exists()).toBe(true)

      const cvvLabel = wrapper.find('label[for="cvv"]')
      expect(cvvLabel.exists()).toBe(true)

      const holderNameLabel = wrapper.find('label[for="cardholder-name"]')
      expect(holderNameLabel.exists()).toBe(true)
    })

    it('should have aria-label on CVV help button', () => {
      const wrapper = mountComponent()
      const helpButton = wrapper.find('button[aria-expanded]')
      expect(helpButton.attributes('aria-label')).toBe('checkout.payment.cvvHelpLabel')
    })
  })
})
