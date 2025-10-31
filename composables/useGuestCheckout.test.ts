import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useGuestCheckout } from './useGuestCheckout'

// Mock i18n
const mockT = vi.fn((key: string) => {
  const translations: Record<string, string> = {
    'checkout.validation.emailRequired': 'Email is required',
    'checkout.validation.emailInvalid': 'Please enter a valid email address',
  }
  return translations[key] || key
})

vi.mock('#app', () => ({
  useI18n: () => ({ t: mockT }),
}))

describe('useGuestCheckout', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()

    // Set NODE_ENV to test to avoid dev mode defaults
    process.env.NODE_ENV = 'test'
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initialization', () => {
    it('initializes with empty state in test environment', () => {
      const { showGuestForm, guestInfo, guestErrors } = useGuestCheckout()

      expect(showGuestForm.value).toBe(false)
      expect(guestInfo.value).toEqual({
        email: '',
        emailUpdates: false,
      })
      expect(guestErrors.value).toEqual({})
    })

    it('initializes with development defaults when in development mode', () => {
      process.env.NODE_ENV = 'development'

      const { showGuestForm, guestInfo } = useGuestCheckout()

      expect(showGuestForm.value).toBe(true)
      expect(guestInfo.value.email).toBe('john.doe@example.com')
      expect(guestInfo.value.emailUpdates).toBe(true)
    })
  })

  describe('Email Validation', () => {
    it('validates correct email format', () => {
      const { guestInfo, validateGuestField, guestErrors } = useGuestCheckout()

      guestInfo.value.email = 'test@example.com'
      validateGuestField('email')

      expect(guestErrors.value.email).toBeUndefined()
    })

    it('validates email with subdomain', () => {
      const { guestInfo, validateGuestField, guestErrors } = useGuestCheckout()

      guestInfo.value.email = 'user@mail.example.com'
      validateGuestField('email')

      expect(guestErrors.value.email).toBeUndefined()
    })

    it('validates email with plus addressing', () => {
      const { guestInfo, validateGuestField, guestErrors } = useGuestCheckout()

      guestInfo.value.email = 'user+tag@example.com'
      validateGuestField('email')

      expect(guestErrors.value.email).toBeUndefined()
    })

    it('validates email with numbers', () => {
      const { guestInfo, validateGuestField, guestErrors } = useGuestCheckout()

      guestInfo.value.email = 'user123@example123.com'
      validateGuestField('email')

      expect(guestErrors.value.email).toBeUndefined()
    })

    it('invalidates empty email', () => {
      const { guestInfo, validateGuestField, guestErrors } = useGuestCheckout()

      guestInfo.value.email = ''
      validateGuestField('email')

      expect(guestErrors.value.email).toBe('Email is required')
      expect(mockT).toHaveBeenCalledWith('checkout.validation.emailRequired')
    })

    it('invalidates whitespace-only email', () => {
      const { guestInfo, validateGuestField, guestErrors } = useGuestCheckout()

      guestInfo.value.email = '   '
      validateGuestField('email')

      expect(guestErrors.value.email).toBe('Email is required')
    })

    it('invalidates email without @ symbol', () => {
      const { guestInfo, validateGuestField, guestErrors } = useGuestCheckout()

      guestInfo.value.email = 'testexample.com'
      validateGuestField('email')

      expect(guestErrors.value.email).toBe('Please enter a valid email address')
      expect(mockT).toHaveBeenCalledWith('checkout.validation.emailInvalid')
    })

    it('invalidates email without domain', () => {
      const { guestInfo, validateGuestField, guestErrors } = useGuestCheckout()

      guestInfo.value.email = 'test@'
      validateGuestField('email')

      expect(guestErrors.value.email).toBe('Please enter a valid email address')
    })

    it('invalidates email without TLD', () => {
      const { guestInfo, validateGuestField, guestErrors } = useGuestCheckout()

      guestInfo.value.email = 'test@example'
      validateGuestField('email')

      expect(guestErrors.value.email).toBe('Please enter a valid email address')
    })

    it('invalidates email with spaces', () => {
      const { guestInfo, validateGuestField, guestErrors } = useGuestCheckout()

      guestInfo.value.email = 'test @example.com'
      validateGuestField('email')

      expect(guestErrors.value.email).toBe('Please enter a valid email address')
    })

    it('invalidates email with multiple @ symbols', () => {
      const { guestInfo, validateGuestField, guestErrors } = useGuestCheckout()

      guestInfo.value.email = 'test@@example.com'
      validateGuestField('email')

      expect(guestErrors.value.email).toBe('Please enter a valid email address')
    })

    it('invalidates email starting with @', () => {
      const { guestInfo, validateGuestField, guestErrors } = useGuestCheckout()

      guestInfo.value.email = '@example.com'
      validateGuestField('email')

      expect(guestErrors.value.email).toBe('Please enter a valid email address')
    })
  })

  describe('Guest Info Validation', () => {
    it('validates guest info as valid with correct email', () => {
      const { guestInfo, isGuestInfoValid } = useGuestCheckout()

      guestInfo.value.email = 'test@example.com'

      expect(isGuestInfoValid.value).toBe(true)
    })

    it('validates guest info as invalid with empty email', () => {
      const { guestInfo, isGuestInfoValid } = useGuestCheckout()

      guestInfo.value.email = ''

      expect(isGuestInfoValid.value).toBe(false)
    })

    it('validates guest info as invalid when there are email errors', () => {
      const { guestInfo, guestErrors, isGuestInfoValid } = useGuestCheckout()

      guestInfo.value.email = 'test@example.com'
      guestErrors.value.email = 'Some error'

      expect(isGuestInfoValid.value).toBe(false)
    })

    it('validates guest info after field validation', () => {
      const { guestInfo, validateGuestField, isGuestInfoValid } = useGuestCheckout()

      guestInfo.value.email = 'invalid-email'
      validateGuestField('email')

      expect(isGuestInfoValid.value).toBe(false)

      guestInfo.value.email = 'valid@example.com'
      validateGuestField('email')

      expect(isGuestInfoValid.value).toBe(true)
    })
  })

  describe('Guest Form Visibility', () => {
    it('shows guest form when continueAsGuest is called', () => {
      const { showGuestForm, continueAsGuest } = useGuestCheckout()

      expect(showGuestForm.value).toBe(false)

      continueAsGuest()

      expect(showGuestForm.value).toBe(true)
    })

    it('does not toggle guest form on multiple calls', () => {
      const { showGuestForm, continueAsGuest } = useGuestCheckout()

      continueAsGuest()
      expect(showGuestForm.value).toBe(true)

      continueAsGuest()
      expect(showGuestForm.value).toBe(true)
    })
  })

  describe('Field Error Management', () => {
    it('clears error for a specific field', () => {
      const { guestInfo, validateGuestField, clearGuestFieldError, guestErrors } = useGuestCheckout()

      guestInfo.value.email = 'invalid'
      validateGuestField('email')

      expect(guestErrors.value.email).toBeTruthy()

      clearGuestFieldError('email')

      expect(guestErrors.value.email).toBeUndefined()
    })

    it('does not throw error when clearing non-existent field error', () => {
      const { clearGuestFieldError, guestErrors } = useGuestCheckout()

      expect(() => {
        clearGuestFieldError('email')
      }).not.toThrow()

      expect(guestErrors.value.email).toBeUndefined()
    })

    it('only clears specified field error', () => {
      const { guestErrors, clearGuestFieldError } = useGuestCheckout()

      guestErrors.value = {
        email: 'Email error',
        otherField: 'Other error',
      }

      clearGuestFieldError('email')

      expect(guestErrors.value.email).toBeUndefined()
      expect(guestErrors.value.otherField).toBe('Other error')
    })
  })

  describe('CSS Class Generation', () => {
    it('generates error classes when field has error', () => {
      const { guestErrors, getGuestFieldClasses } = useGuestCheckout()

      guestErrors.value.email = 'Some error'

      const classes = getGuestFieldClasses('email')

      expect(classes['border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500']).toBe(true)
      expect(classes['border-gray-300 dark:border-gray-600']).toBe(false)
      expect(classes['bg-white dark:bg-gray-700 text-gray-900 dark:text-white']).toBe(true)
    })

    it('generates normal classes when field has no error', () => {
      const { getGuestFieldClasses } = useGuestCheckout()

      const classes = getGuestFieldClasses('email')

      expect(classes['border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500']).toBe(false)
      expect(classes['border-gray-300 dark:border-gray-600']).toBe(true)
      expect(classes['bg-white dark:bg-gray-700 text-gray-900 dark:text-white']).toBe(true)
    })

    it('always includes base styling classes', () => {
      const { guestErrors, getGuestFieldClasses } = useGuestCheckout()

      const classesWithError = getGuestFieldClasses('email')
      expect(classesWithError['bg-white dark:bg-gray-700 text-gray-900 dark:text-white']).toBe(true)

      guestErrors.value.email = 'Error'
      const classesWithoutError = getGuestFieldClasses('email')
      expect(classesWithoutError['bg-white dark:bg-gray-700 text-gray-900 dark:text-white']).toBe(true)
    })
  })

  describe('Validate All Functionality', () => {
    it('validates all fields and returns true when valid', () => {
      const { guestInfo, validateAll } = useGuestCheckout()

      guestInfo.value.email = 'test@example.com'

      const isValid = validateAll()

      expect(isValid).toBe(true)
      expect(mockT).toHaveBeenCalled()
    })

    it('validates all fields and returns false when invalid', () => {
      const { guestInfo, validateAll } = useGuestCheckout()

      guestInfo.value.email = ''

      const isValid = validateAll()

      expect(isValid).toBe(false)
    })

    it('sets error messages for invalid fields', () => {
      const { guestInfo, validateAll, guestErrors } = useGuestCheckout()

      guestInfo.value.email = 'invalid-email'

      validateAll()

      expect(guestErrors.value.email).toBe('Please enter a valid email address')
    })

    it('clears errors for valid fields', () => {
      const { guestInfo, validateAll, guestErrors } = useGuestCheckout()

      guestInfo.value.email = 'invalid'
      validateAll()
      expect(guestErrors.value.email).toBeTruthy()

      guestInfo.value.email = 'valid@example.com'
      validateAll()
      expect(guestErrors.value.email).toBeUndefined()
    })
  })

  describe('Reset Functionality', () => {
    it('resets all state to initial values', () => {
      const { showGuestForm, guestInfo, guestErrors, continueAsGuest, validateGuestField, reset } = useGuestCheckout()

      // Modify state
      continueAsGuest()
      guestInfo.value.email = 'test@example.com'
      guestInfo.value.emailUpdates = true
      validateGuestField('email')

      // Reset
      reset()

      expect(showGuestForm.value).toBe(false)
      expect(guestInfo.value).toEqual({
        email: '',
        emailUpdates: false,
      })
      expect(guestErrors.value).toEqual({})
    })

    it('allows reuse after reset', () => {
      const { showGuestForm, guestInfo, continueAsGuest, reset } = useGuestCheckout()

      // Use, then reset
      continueAsGuest()
      guestInfo.value.email = 'test@example.com'
      reset()

      // Use again
      continueAsGuest()
      guestInfo.value.email = 'new@example.com'

      expect(showGuestForm.value).toBe(true)
      expect(guestInfo.value.email).toBe('new@example.com')
    })
  })

  describe('Edge Cases', () => {
    it('handles validateGuestField with non-email field', () => {
      const { validateGuestField, guestErrors } = useGuestCheckout()

      // Should not throw or modify errors for unknown fields
      expect(() => {
        validateGuestField('emailUpdates' as any)
      }).not.toThrow()

      expect(guestErrors.value.emailUpdates).toBeUndefined()
    })

    it('handles special characters in email local part', () => {
      const { guestInfo, validateGuestField, guestErrors } = useGuestCheckout()

      guestInfo.value.email = 'user.name+tag@example.com'
      validateGuestField('email')

      expect(guestErrors.value.email).toBeUndefined()
    })

    it('handles email with dash in domain', () => {
      const { guestInfo, validateGuestField, guestErrors } = useGuestCheckout()

      guestInfo.value.email = 'user@my-domain.com'
      validateGuestField('email')

      expect(guestErrors.value.email).toBeUndefined()
    })

    it('handles very long valid email', () => {
      const { guestInfo, validateGuestField, guestErrors } = useGuestCheckout()

      const longEmail = 'a'.repeat(50) + '@' + 'b'.repeat(50) + '.com'
      guestInfo.value.email = longEmail
      validateGuestField('email')

      expect(guestErrors.value.email).toBeUndefined()
    })

    it('preserves emailUpdates checkbox state through validation', () => {
      const { guestInfo, validateGuestField } = useGuestCheckout()

      guestInfo.value.email = 'test@example.com'
      guestInfo.value.emailUpdates = true

      validateGuestField('email')

      expect(guestInfo.value.emailUpdates).toBe(true)
    })

    it('handles rapid validation calls', () => {
      const { guestInfo, validateGuestField, guestErrors } = useGuestCheckout()

      guestInfo.value.email = 'invalid'
      validateGuestField('email')
      validateGuestField('email')
      validateGuestField('email')

      expect(guestErrors.value.email).toBe('Please enter a valid email address')

      guestInfo.value.email = 'valid@example.com'
      validateGuestField('email')
      validateGuestField('email')

      expect(guestErrors.value.email).toBeUndefined()
    })
  })

  describe('Readonly Properties', () => {
    it('exposes guestErrors as readonly', () => {
      const { guestErrors } = useGuestCheckout()

      expect(() => {
        // @ts-ignore - intentionally testing readonly
        guestErrors.value = {}
      }).toThrow()
    })

    it('exposes isGuestInfoValid as readonly', () => {
      const { isGuestInfoValid } = useGuestCheckout()

      expect(() => {
        // @ts-ignore - intentionally testing readonly
        isGuestInfoValid.value = true
      }).toThrow()
    })
  })

  describe('Integration Scenarios', () => {
    it('supports complete guest checkout flow', () => {
      const { showGuestForm, guestInfo, continueAsGuest, validateAll, isGuestInfoValid } = useGuestCheckout()

      // User clicks "Continue as guest"
      expect(showGuestForm.value).toBe(false)
      continueAsGuest()
      expect(showGuestForm.value).toBe(true)

      // User enters email
      guestInfo.value.email = 'customer@example.com'
      guestInfo.value.emailUpdates = true

      // Form validation
      const isValid = validateAll()
      expect(isValid).toBe(true)
      expect(isGuestInfoValid.value).toBe(true)
    })

    it('supports error correction flow', () => {
      const { guestInfo, validateAll, isGuestInfoValid, guestErrors } = useGuestCheckout()

      // User enters invalid email
      guestInfo.value.email = 'invalid'
      validateAll()
      expect(isGuestInfoValid.value).toBe(false)
      expect(guestErrors.value.email).toBeTruthy()

      // User corrects email
      guestInfo.value.email = 'valid@example.com'
      validateAll()
      expect(isGuestInfoValid.value).toBe(true)
      expect(guestErrors.value.email).toBeUndefined()
    })

    it('handles validation before showing guest form', () => {
      const { showGuestForm, guestInfo, validateAll } = useGuestCheckout()

      // Try to validate before showing form
      guestInfo.value.email = 'test@example.com'
      const isValid = validateAll()

      expect(isValid).toBe(true)
      expect(showGuestForm.value).toBe(false) // Form visibility independent of validation
    })
  })

  describe('Localization Integration', () => {
    it('uses i18n for validation messages', () => {
      const { guestInfo, validateGuestField } = useGuestCheckout()

      guestInfo.value.email = ''
      validateGuestField('email')

      expect(mockT).toHaveBeenCalledWith('checkout.validation.emailRequired')

      guestInfo.value.email = 'invalid'
      validateGuestField('email')

      expect(mockT).toHaveBeenCalledWith('checkout.validation.emailInvalid')
    })

    it('calls i18n function for each validation', () => {
      const { guestInfo, validateGuestField } = useGuestCheckout()

      mockT.mockClear()

      guestInfo.value.email = ''
      validateGuestField('email')

      expect(mockT).toHaveBeenCalledTimes(1)
    })
  })
})
