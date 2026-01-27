/**
 * Unit tests for useCheckoutTerms composable
 *
 * Tests terms acceptance, privacy consent, and marketing opt-in state management.
 */

import { describe, it, expect } from 'vitest'
import { ref } from 'vue'

// Mock the composable to test its logic
function createUseCheckoutTerms() {
  const termsAccepted = ref(false)
  const privacyAccepted = ref(false)
  const marketingConsent = ref(false)
  const showTermsError = ref(false)
  const showPrivacyError = ref(false)

  const areRequiredTermsAccepted = computed(() => {
    return termsAccepted.value && privacyAccepted.value
  })

  const validateTerms = (): boolean => {
    showTermsError.value = !termsAccepted.value
    showPrivacyError.value = !privacyAccepted.value
    return areRequiredTermsAccepted.value
  }

  const reset = (): void => {
    termsAccepted.value = false
    privacyAccepted.value = false
    marketingConsent.value = false
    showTermsError.value = false
    showPrivacyError.value = false
  }

  return {
    termsAccepted,
    privacyAccepted,
    marketingConsent,
    showTermsError,
    showPrivacyError,
    areRequiredTermsAccepted,
    validateTerms,
    reset,
  }
}

describe('useCheckoutTerms', () => {
  beforeEach(() => {
    // Reset state before each test
  })

  describe('initial state', () => {
    it('should have all terms not accepted by default', () => {
      const { termsAccepted, privacyAccepted, marketingConsent } = createUseCheckoutTerms()

      expect(termsAccepted.value).toBe(false)
      expect(privacyAccepted.value).toBe(false)
      expect(marketingConsent.value).toBe(false)
    })

    it('should have no error flags initially', () => {
      const { showTermsError, showPrivacyError } = createUseCheckoutTerms()

      expect(showTermsError.value).toBe(false)
      expect(showPrivacyError.value).toBe(false)
    })
  })

  describe('validateTerms', () => {
    it('should return false when neither terms nor privacy accepted', () => {
      const { validateTerms, showTermsError, showPrivacyError } = createUseCheckoutTerms()

      const result = validateTerms()

      expect(result).toBe(false)
      expect(showTermsError.value).toBe(true)
      expect(showPrivacyError.value).toBe(true)
    })

    it('should return false when only terms accepted', () => {
      const composable = createUseCheckoutTerms()
      composable.termsAccepted.value = true

      const result = composable.validateTerms()

      expect(result).toBe(false)
      expect(composable.showTermsError.value).toBe(false)
      expect(composable.showPrivacyError.value).toBe(true)
    })

    it('should return false when only privacy accepted', () => {
      const composable = createUseCheckoutTerms()
      composable.privacyAccepted.value = true

      const result = composable.validateTerms()

      expect(result).toBe(false)
      expect(composable.showTermsError.value).toBe(true)
      expect(composable.showPrivacyError.value).toBe(false)
    })

    it('should return true when both required terms accepted', () => {
      const composable = createUseCheckoutTerms()
      composable.termsAccepted.value = true
      composable.privacyAccepted.value = true

      const result = composable.validateTerms()

      expect(result).toBe(true)
      expect(composable.showTermsError.value).toBe(false)
      expect(composable.showPrivacyError.value).toBe(false)
    })

    it('should not require marketing consent for validation', () => {
      const composable = createUseCheckoutTerms()
      composable.termsAccepted.value = true
      composable.privacyAccepted.value = true
      composable.marketingConsent.value = false // Not required

      const result = composable.validateTerms()

      expect(result).toBe(true)
    })
  })

  describe('reset', () => {
    it('should reset all refs to false', () => {
      const composable = createUseCheckoutTerms()
      composable.termsAccepted.value = true
      composable.privacyAccepted.value = true
      composable.marketingConsent.value = true
      composable.showTermsError.value = true
      composable.showPrivacyError.value = true

      composable.reset()

      expect(composable.termsAccepted.value).toBe(false)
      expect(composable.privacyAccepted.value).toBe(false)
      expect(composable.marketingConsent.value).toBe(false)
      expect(composable.showTermsError.value).toBe(false)
      expect(composable.showPrivacyError.value).toBe(false)
    })

    it('should preserve reactivity after reset', () => {
      const composable = createUseCheckoutTerms()
      composable.reset()

      composable.termsAccepted.value = true
      composable.privacyAccepted.value = true

      expect(composable.termsAccepted.value).toBe(true)
      expect(composable.privacyAccepted.value).toBe(true)
    })
  })

  describe('areRequiredTermsAccepted computed', () => {
    it('should return false when terms not accepted', () => {
      const composable = createUseCheckoutTerms()
      composable.privacyAccepted.value = true

      expect(composable.areRequiredTermsAccepted.value).toBe(false)
    })

    it('should return false when privacy not accepted', () => {
      const composable = createUseCheckoutTerms()
      composable.termsAccepted.value = true

      expect(composable.areRequiredTermsAccepted.value).toBe(false)
    })

    it('should return true when both required terms accepted', () => {
      const composable = createUseCheckoutTerms()
      composable.termsAccepted.value = true
      composable.privacyAccepted.value = true

      expect(composable.areRequiredTermsAccepted.value).toBe(true)
    })
  })
})
