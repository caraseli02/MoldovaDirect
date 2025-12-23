// Checkout validation utilities
// Provides comprehensive validation for checkout flow data

import type { Address, PaymentMethod, ShippingInformation } from '~/types/checkout'

// =============================================
// VALIDATION RESULT TYPES
// =============================================

export interface CheckoutValidationResult {
  isValid: boolean
  errors: CheckoutValidationError[]
  warnings?: ValidationWarning[]
}

export interface CheckoutValidationError {
  field: string
  code: string
  message: string
  severity: 'error' | 'warning'
}

export interface ValidationWarning {
  field: string
  code: string
  message: string
}

// =============================================
// ADDRESS VALIDATION
// =============================================

export function validateAddress(address: Partial<Address>, type: 'shipping' | 'billing' = 'shipping'): CheckoutValidationResult {
  const errors: CheckoutValidationError[] = []
  const warnings: ValidationWarning[] = []

  // Required field validation
  if (!address.firstName?.trim()) {
    errors.push({
      field: 'firstName',
      code: 'REQUIRED',
      message: 'First name is required',
      severity: 'error',
    })
  }
  else if (address.firstName.length < 2) {
    errors.push({
      field: 'firstName',
      code: 'TOO_SHORT',
      message: 'First name must be at least 2 characters',
      severity: 'error',
    })
  }
  else if (address.firstName.length > 50) {
    errors.push({
      field: 'firstName',
      code: 'TOO_LONG',
      message: 'First name must be less than 50 characters',
      severity: 'error',
    })
  }

  if (!address.lastName?.trim()) {
    errors.push({
      field: 'lastName',
      code: 'REQUIRED',
      message: 'Last name is required',
      severity: 'error',
    })
  }
  else if (address.lastName.length < 2) {
    errors.push({
      field: 'lastName',
      code: 'TOO_SHORT',
      message: 'Last name must be at least 2 characters',
      severity: 'error',
    })
  }
  else if (address.lastName.length > 50) {
    errors.push({
      field: 'lastName',
      code: 'TOO_LONG',
      message: 'Last name must be less than 50 characters',
      severity: 'error',
    })
  }

  if (!address.street?.trim()) {
    errors.push({
      field: 'street',
      code: 'REQUIRED',
      message: 'Street address is required',
      severity: 'error',
    })
  }
  else if (address.street.length < 5) {
    errors.push({
      field: 'street',
      code: 'TOO_SHORT',
      message: 'Street address must be at least 5 characters',
      severity: 'error',
    })
  }
  else if (address.street.length > 100) {
    errors.push({
      field: 'street',
      code: 'TOO_LONG',
      message: 'Street address must be less than 100 characters',
      severity: 'error',
    })
  }

  if (!address.city?.trim()) {
    errors.push({
      field: 'city',
      code: 'REQUIRED',
      message: 'City is required',
      severity: 'error',
    })
  }
  else if (address.city.length < 2) {
    errors.push({
      field: 'city',
      code: 'TOO_SHORT',
      message: 'City must be at least 2 characters',
      severity: 'error',
    })
  }
  else if (address.city.length > 50) {
    errors.push({
      field: 'city',
      code: 'TOO_LONG',
      message: 'City must be less than 50 characters',
      severity: 'error',
    })
  }

  if (!address.postalCode?.trim()) {
    errors.push({
      field: 'postalCode',
      code: 'REQUIRED',
      message: 'Postal code is required',
      severity: 'error',
    })
  }
  else if (!isValidPostalCode(address.postalCode, address.country)) {
    errors.push({
      field: 'postalCode',
      code: 'INVALID_FORMAT',
      message: 'Invalid postal code format for the selected country',
      severity: 'error',
    })
  }

  if (!address.country?.trim()) {
    errors.push({
      field: 'country',
      code: 'REQUIRED',
      message: 'Country is required',
      severity: 'error',
    })
  }
  else if (!isValidCountryCode(address.country)) {
    errors.push({
      field: 'country',
      code: 'INVALID_COUNTRY',
      message: 'Invalid country code',
      severity: 'error',
    })
  }

  // Optional field validation
  if (address.company && address.company.length > 100) {
    errors.push({
      field: 'company',
      code: 'TOO_LONG',
      message: 'Company name must be less than 100 characters',
      severity: 'error',
    })
  }

  if (address.province && address.province.length > 50) {
    errors.push({
      field: 'province',
      code: 'TOO_LONG',
      message: 'Province must be less than 50 characters',
      severity: 'error',
    })
  }

  if (address.phone) {
    if (!isValidPhoneNumber(address.phone)) {
      errors.push({
        field: 'phone',
        code: 'INVALID_FORMAT',
        message: 'Invalid phone number format',
        severity: 'error',
      })
    }
  }
  else if (type === 'shipping') {
    warnings.push({
      field: 'phone',
      code: 'RECOMMENDED',
      message: 'Phone number is recommended for shipping notifications',
    })
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

// =============================================
// PAYMENT METHOD VALIDATION
// =============================================

export function validatePaymentMethod(paymentMethod: Partial<PaymentMethod>): CheckoutValidationResult {
  const errors: CheckoutValidationError[] = []
  const warnings: ValidationWarning[] = []

  if (!paymentMethod.type) {
    errors.push({
      field: 'type',
      code: 'REQUIRED',
      message: 'Payment method type is required',
      severity: 'error',
    })
    return { isValid: false, errors, warnings }
  }

  switch (paymentMethod.type) {
    case 'cash':
      return { isValid: true, errors, warnings }
    case 'credit_card':
      return validateCreditCard(paymentMethod.creditCard)
    case 'paypal':
      return validatePayPal(paymentMethod.paypal)
    case 'bank_transfer':
      return validateBankTransfer(paymentMethod.bankTransfer)
    default:
      errors.push({
        field: 'type',
        code: 'INVALID_TYPE',
        message: 'Invalid payment method type',
        severity: 'error',
      })
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

function validateCreditCard(creditCard?: PaymentMethod['creditCard']): CheckoutValidationResult {
  const errors: CheckoutValidationError[] = []
  const warnings: ValidationWarning[] = []

  if (!creditCard) {
    errors.push({
      field: 'creditCard',
      code: 'REQUIRED',
      message: 'Credit card information is required',
      severity: 'error',
    })
    return { isValid: false, errors, warnings }
  }

  // Card number validation
  if (!creditCard.number?.trim()) {
    errors.push({
      field: 'number',
      code: 'REQUIRED',
      message: 'Card number is required',
      severity: 'error',
    })
  }
  else {
    const cardNumber = creditCard.number.replace(/\s/g, '')
    if (!isValidCardNumber(cardNumber)) {
      errors.push({
        field: 'number',
        code: 'INVALID_FORMAT',
        message: 'Invalid card number format',
        severity: 'error',
      })
    }
    else if (!isValidLuhn(cardNumber)) {
      errors.push({
        field: 'number',
        code: 'INVALID_CHECKSUM',
        message: 'Invalid card number',
        severity: 'error',
      })
    }
  }

  // Expiry validation
  if (!creditCard.expiryMonth || !creditCard.expiryYear) {
    errors.push({
      field: 'expiry',
      code: 'REQUIRED',
      message: 'Expiry date is required',
      severity: 'error',
    })
  }
  else {
    const month = parseInt(creditCard.expiryMonth)
    const year = parseInt(creditCard.expiryYear)
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.getMonth() + 1

    if (month < 1 || month > 12) {
      errors.push({
        field: 'expiryMonth',
        code: 'INVALID_MONTH',
        message: 'Invalid expiry month',
        severity: 'error',
      })
    }

    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      errors.push({
        field: 'expiry',
        code: 'EXPIRED',
        message: 'Card has expired',
        severity: 'error',
      })
    }
    else if (year === currentYear && month === currentMonth) {
      warnings.push({
        field: 'expiry',
        code: 'EXPIRES_SOON',
        message: 'Card expires this month',
      })
    }
  }

  // CVV validation
  if (!creditCard.cvv?.trim()) {
    errors.push({
      field: 'cvv',
      code: 'REQUIRED',
      message: 'CVV is required',
      severity: 'error',
    })
  }
  else if (!/^\d{3,4}$/.test(creditCard.cvv)) {
    errors.push({
      field: 'cvv',
      code: 'INVALID_FORMAT',
      message: 'CVV must be 3 or 4 digits',
      severity: 'error',
    })
  }

  // Cardholder name validation
  if (!creditCard.holderName?.trim()) {
    errors.push({
      field: 'holderName',
      code: 'REQUIRED',
      message: 'Cardholder name is required',
      severity: 'error',
    })
  }
  else if (creditCard.holderName.length < 2) {
    errors.push({
      field: 'holderName',
      code: 'TOO_SHORT',
      message: 'Cardholder name must be at least 2 characters',
      severity: 'error',
    })
  }
  else if (creditCard.holderName.length > 50) {
    errors.push({
      field: 'holderName',
      code: 'TOO_LONG',
      message: 'Cardholder name must be less than 50 characters',
      severity: 'error',
    })
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

function validatePayPal(paypal?: PaymentMethod['paypal']): CheckoutValidationResult {
  const errors: CheckoutValidationError[] = []
  const warnings: ValidationWarning[] = []

  if (!paypal) {
    errors.push({
      field: 'paypal',
      code: 'REQUIRED',
      message: 'PayPal information is required',
      severity: 'error',
    })
    return { isValid: false, errors, warnings }
  }

  if (!paypal.email?.trim()) {
    errors.push({
      field: 'email',
      code: 'REQUIRED',
      message: 'PayPal email is required',
      severity: 'error',
    })
  }
  else if (!isValidEmail(paypal.email)) {
    errors.push({
      field: 'email',
      code: 'INVALID_FORMAT',
      message: 'Invalid email format',
      severity: 'error',
    })
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

function validateBankTransfer(bankTransfer?: PaymentMethod['bankTransfer']): CheckoutValidationResult {
  const errors: CheckoutValidationError[] = []
  const warnings: ValidationWarning[] = []

  // Bank transfer validation is minimal as it's processed manually
  if (!bankTransfer) {
    errors.push({
      field: 'bankTransfer',
      code: 'REQUIRED',
      message: 'Bank transfer information is required',
      severity: 'error',
    })
    return { isValid: false, errors, warnings }
  }

  // Reference is optional but if provided should be valid
  if (bankTransfer.reference && bankTransfer.reference.length > 50) {
    errors.push({
      field: 'reference',
      code: 'TOO_LONG',
      message: 'Reference must be less than 50 characters',
      severity: 'error',
    })
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

// =============================================
// SHIPPING INFORMATION VALIDATION
// =============================================

export function validateShippingInformation(shippingInfo: Partial<ShippingInformation>): CheckoutValidationResult {
  const errors: CheckoutValidationError[] = []
  const warnings: ValidationWarning[] = []

  // Validate address
  if (!shippingInfo.address) {
    errors.push({
      field: 'address',
      code: 'REQUIRED',
      message: 'Shipping address is required',
      severity: 'error',
    })
  }
  else {
    const addressValidation = validateAddress(shippingInfo.address, 'shipping')
    errors.push(...addressValidation.errors)
    if (addressValidation.warnings) {
      warnings.push(...addressValidation.warnings)
    }
  }

  // Validate shipping method
  if (!shippingInfo.method) {
    errors.push({
      field: 'method',
      code: 'REQUIRED',
      message: 'Shipping method is required',
      severity: 'error',
    })
  }
  else {
    if (!shippingInfo.method.id) {
      errors.push({
        field: 'method.id',
        code: 'REQUIRED',
        message: 'Shipping method ID is required',
        severity: 'error',
      })
    }
    if (typeof shippingInfo.method.price !== 'number' || shippingInfo.method.price < 0) {
      errors.push({
        field: 'method.price',
        code: 'INVALID_PRICE',
        message: 'Invalid shipping method price',
        severity: 'error',
      })
    }
  }

  // Validate instructions (optional)
  if (shippingInfo.instructions && shippingInfo.instructions.length > 500) {
    errors.push({
      field: 'instructions',
      code: 'TOO_LONG',
      message: 'Shipping instructions must be less than 500 characters',
      severity: 'error',
    })
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

// =============================================
// UTILITY VALIDATION FUNCTIONS
// =============================================

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidPhoneNumber(phone: string): boolean {
  // Basic international phone number validation
  const phoneRegex = /^\+?[\d\s\-()]{7,15}$/
  return phoneRegex.test(phone)
}

export function isValidPostalCode(postalCode: string, country?: string): boolean {
  if (!country) return true // Skip validation if country not provided

  const patterns: Record<string, RegExp> = {
    ES: /^\d{5}$/, // Spain
    RO: /^\d{6}$/, // Romania
    MD: /^MD-?\d{4}$/, // Moldova
    FR: /^\d{5}$/, // France
    DE: /^\d{5}$/, // Germany
    IT: /^\d{5}$/, // Italy
    US: /^\d{5}(-\d{4})?$/, // United States
    GB: /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i, // United Kingdom
  }

  const pattern = patterns[country.toUpperCase()]
  return pattern ? pattern.test(postalCode) : true
}

export function isValidCountryCode(country: string): boolean {
  const validCountries = ['ES', 'RO', 'MD', 'FR', 'DE', 'IT', 'US', 'GB']
  return validCountries.includes(country.toUpperCase())
}

export function isValidCardNumber(cardNumber: string): boolean {
  // Remove spaces and check if it's all digits
  const cleaned = cardNumber.replace(/\s/g, '')
  return /^\d{13,19}$/.test(cleaned)
}

export function isValidLuhn(cardNumber: string): boolean {
  // Luhn algorithm for credit card validation
  const digits = cardNumber.replace(/\s/g, '').split('').map(Number)
  let sum = 0
  let isEven = false

  for (let i = digits.length - 1; i >= 0; i--) {
    const digit = digits[i]

    // Handle undefined case (should never happen with valid array access)
    if (digit === undefined) {
      continue
    }

    let processedDigit = digit
    if (isEven) {
      processedDigit *= 2
      if (processedDigit > 9) {
        processedDigit -= 9
      }
    }

    sum += processedDigit
    isEven = !isEven
  }

  return sum % 10 === 0
}

export function getCardBrand(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\s/g, '')

  if (/^4/.test(cleaned)) return 'visa'
  if (/^5[1-5]/.test(cleaned)) return 'mastercard'
  if (/^3[47]/.test(cleaned)) return 'amex'
  if (/^6(?:011|5)/.test(cleaned)) return 'discover'

  return 'unknown'
}

// =============================================
// BATCH VALIDATION
// =============================================

export function validateCheckoutData(data: {
  shippingInfo?: Partial<ShippingInformation>
  paymentMethod?: Partial<PaymentMethod>
}): CheckoutValidationResult {
  const errors: CheckoutValidationError[] = []
  const warnings: ValidationWarning[] = []

  if (data.shippingInfo) {
    const shippingValidation = validateShippingInformation(data.shippingInfo)
    errors.push(...shippingValidation.errors)
    if (shippingValidation.warnings) {
      warnings.push(...shippingValidation.warnings)
    }
  }

  if (data.paymentMethod) {
    const paymentValidation = validatePaymentMethod(data.paymentMethod)
    errors.push(...paymentValidation.errors)
    if (paymentValidation.warnings) {
      warnings.push(...paymentValidation.warnings)
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

// =============================================
// SANITIZATION FUNCTIONS
// =============================================

export function sanitizeAddress(address: Partial<Address>): Partial<Address> {
  return {
    ...address,
    firstName: address.firstName?.trim(),
    lastName: address.lastName?.trim(),
    company: address.company?.trim() || undefined,
    street: address.street?.trim(),
    city: address.city?.trim(),
    postalCode: address.postalCode?.trim().toUpperCase(),
    province: address.province?.trim() || undefined,
    country: address.country?.trim().toUpperCase(),
    phone: address.phone?.trim() || undefined,
  }
}

export function sanitizePaymentMethod(paymentMethod: Partial<PaymentMethod>): Partial<PaymentMethod> {
  const sanitized = { ...paymentMethod }

  if (sanitized.creditCard) {
    sanitized.creditCard = {
      ...sanitized.creditCard,
      number: sanitized.creditCard.number?.replace(/\s/g, ''),
      holderName: sanitized.creditCard.holderName?.trim(),
      cvv: sanitized.creditCard.cvv?.trim(),
    }
  }

  if (sanitized.paypal) {
    sanitized.paypal = {
      ...sanitized.paypal,
      email: sanitized.paypal.email?.trim().toLowerCase(),
    }
  }

  if (sanitized.bankTransfer) {
    const trimmedRef = sanitized.bankTransfer.reference?.trim()
    sanitized.bankTransfer = {
      ...sanitized.bankTransfer,
      reference: trimmedRef || '',
    }
  }

  return sanitized
}
