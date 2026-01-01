import { ref, computed } from 'vue'

// Translation function type for i18n
type TranslateFunction = (key: string, params?: Record<string, unknown>) => string

export interface CreditCardData {
  number: string
  expiryMonth: string | undefined
  expiryYear: string | undefined
  cvv: string
  holderName: string
}

export function useCardValidation(t?: TranslateFunction) {
  // Use provided translation function or fallback to identity
  const translate = t || ((key: string) => key.split('.').pop() || key)

  const cardBrand = ref<string>('')
  const validationErrors = ref<Record<string, string>>({})
  const expiryDisplay = ref('')

  const creditCardData = ref<CreditCardData>({
    number: '',
    expiryMonth: undefined,
    expiryYear: undefined,
    cvv: '',
    holderName: '',
  })

  /**
   * Detect card brand from number prefix
   */
  const detectCardBrand = (number: string): string => {
    const patterns: Record<string, RegExp> = {
      visa: /^4/,
      mastercard: /^5[1-5]|^2[2-7]/,
      amex: /^3[47]/,
      discover: /^6(?:011|5)/,
      diners: /^3[0689]/,
      jcb: /^35/,
    }

    for (const [brand, pattern] of Object.entries(patterns)) {
      if (pattern.test(number)) {
        return brand
      }
    }

    return ''
  }

  /**
   * Luhn algorithm for card number validation
   */
  const luhnCheck = (number: string): boolean => {
    let sum = 0
    let alternate = false

    for (let i = number.length - 1; i >= 0; i--) {
      let n = parseInt(number.charAt(i), 10)

      if (alternate) {
        n *= 2
        if (n > 9) {
          n = (n % 10) + 1
        }
      }

      sum += n
      alternate = !alternate
    }

    return sum % 10 === 0
  }

  /**
   * Format card number with spaces
   */
  const formatCardNumber = (event: Event): void => {
    const input = event.target as HTMLInputElement
    const value = input.value.replace(/\s/g, '').replace(/[^0-9]/gi, '')

    cardBrand.value = detectCardBrand(value)
    const formattedValue = value.match(/.{1,4}/g)?.join(' ') || value

    creditCardData.value.number = formattedValue
  }

  /**
   * Format expiry date as MM/YY
   */
  const formatExpiry = (event: Event): void => {
    const input = event.target as HTMLInputElement
    let value = input.value.replace(/\D/g, '')

    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4)
    }

    expiryDisplay.value = value

    const parts = value.split('/')
    if (parts.length === 2) {
      creditCardData.value.expiryMonth = parts[0] || undefined
      creditCardData.value.expiryYear = parts[1] || undefined
    }
  }

  /**
   * Format CVV (3 or 4 digits for Amex)
   */
  const formatCVV = (event: Event): void => {
    const input = event.target as HTMLInputElement
    const value = input.value.replace(/[^0-9]/gi, '')
    const maxLength = cardBrand.value === 'amex' ? 4 : 3

    creditCardData.value.cvv = value.substring(0, maxLength)
  }

  /**
   * Validate card number
   */
  const validateCardNumber = (): void => {
    const number = creditCardData.value.number.replace(/\s/g, '')

    if (!number) {
      validationErrors.value.cardNumber = translate('checkout.payment.validation.cardNumberRequired')
    }
    else if (!/^\d{13,19}$/.test(number)) {
      validationErrors.value.cardNumber = translate('checkout.payment.validation.cardNumberInvalid')
    }
    else if (!luhnCheck(number)) {
      validationErrors.value.cardNumber = translate('checkout.payment.validation.cardNumberInvalid')
    }
    else {
      delete validationErrors.value.cardNumber
    }
  }

  /**
   * Validate expiry date
   */
  const validateExpiry = (): void => {
    const month = parseInt(creditCardData.value.expiryMonth || '')
    const year = parseInt(creditCardData.value.expiryYear || '')

    if (!month || !year) {
      validationErrors.value.expiry = translate('checkout.payment.validation.expiryRequired')
    }
    else if (month < 1 || month > 12) {
      validationErrors.value.expiry = translate('checkout.payment.validation.expiryInvalid')
    }
    else {
      const currentDate = new Date()
      const currentYear = currentDate.getFullYear() % 100
      const currentMonth = currentDate.getMonth() + 1

      if (year < currentYear || (year === currentYear && month < currentMonth)) {
        validationErrors.value.expiry = translate('checkout.payment.validation.expiryExpired')
      }
      else {
        delete validationErrors.value.expiry
      }
    }
  }

  /**
   * Validate CVV
   */
  const validateCVV = (): void => {
    const cvv = creditCardData.value.cvv
    const expectedLength = cardBrand.value === 'amex' ? 4 : 3

    if (!cvv) {
      validationErrors.value.cvv = translate('checkout.payment.validation.cvvRequired')
    }
    else if (!/^\d+$/.test(cvv)) {
      validationErrors.value.cvv = translate('checkout.payment.validation.cvvInvalid')
    }
    else if (cvv.length !== expectedLength) {
      validationErrors.value.cvv = translate('checkout.payment.validation.cvvLength', { length: expectedLength })
    }
    else {
      delete validationErrors.value.cvv
    }
  }

  /**
   * Validate cardholder name
   */
  const validateHolderName = (): void => {
    const name = creditCardData.value.holderName.trim()

    if (!name) {
      validationErrors.value.holderName = translate('checkout.payment.validation.holderNameRequired')
    }
    else if (name.length < 2) {
      validationErrors.value.holderName = translate('checkout.payment.validation.holderNameRequired')
    }
    else {
      delete validationErrors.value.holderName
    }
  }

  /**
   * Check if a field has an error
   */
  const hasError = (field: string, externalErrors?: Record<string, string>): boolean => {
    return !!((externalErrors?.[field]) || validationErrors.value[field])
  }

  /**
   * Get error message for a field
   */
  const getError = (field: string, externalErrors?: Record<string, string>): string => {
    return externalErrors?.[field] || validationErrors.value[field] || ''
  }

  /**
   * Get icon for card brand
   */
  const getCardBrandIcon = (_brand: string): string => 'lucide:credit-card'

  /**
   * CVV max length based on card brand
   */
  const cvvMaxLength = computed(() => cardBrand.value === 'amex' ? 4 : 3)

  /**
   * Reset all data
   */
  const reset = (): void => {
    creditCardData.value = {
      number: '',
      expiryMonth: undefined,
      expiryYear: undefined,
      cvv: '',
      holderName: '',
    }
    cardBrand.value = ''
    validationErrors.value = {}
    expiryDisplay.value = ''
  }

  /**
   * Initialize from external data
   */
  const initializeFromData = (data: Partial<CreditCardData>): void => {
    if (data.number) {
      creditCardData.value.number = data.number
      cardBrand.value = detectCardBrand(data.number.replace(/\s/g, ''))
    }
    if (data.expiryMonth) creditCardData.value.expiryMonth = data.expiryMonth
    if (data.expiryYear) creditCardData.value.expiryYear = data.expiryYear
    if (data.cvv) creditCardData.value.cvv = data.cvv
    if (data.holderName) creditCardData.value.holderName = data.holderName

    if (data.expiryMonth && data.expiryYear) {
      expiryDisplay.value = `${data.expiryMonth}/${data.expiryYear}`
    }
  }

  return {
    // State
    creditCardData,
    cardBrand,
    validationErrors,
    expiryDisplay,

    // Computed
    cvvMaxLength,

    // Methods
    formatCardNumber,
    formatExpiry,
    formatCVV,
    validateCardNumber,
    validateExpiry,
    validateCVV,
    validateHolderName,
    hasError,
    getError,
    getCardBrandIcon,
    detectCardBrand,
    reset,
    initializeFromData,
  }
}
