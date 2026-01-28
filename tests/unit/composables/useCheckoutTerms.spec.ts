/**
 * Unit tests for useCheckoutTerms composable
 *
 * Tests terms acceptance, privacy consent, and marketing opt-in state management.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { useCheckoutTerms } from '~/composables/useCheckoutTerms'

describe('useCheckoutTerms', () => {
  beforeEach(() => {
    // Each test gets a fresh composable instance
  })

  describe('initial state', () => {
    it('should have all terms not accepted by default', () => {
      const { termsAccepted, privacyAccepted, marketingConsent } = useCheckoutTerms()

      expect(termsAccepted.value).toBe(false)
      expect(privacyAccepted.value).toBe(false)
      expect(marketingConsent.value).toBe(false)
    })

    it('should have no error flags initially', () => {
      const { showTermsError, showPrivacyError } = useCheckoutTerms()

      expect(showTermsError.value).toBe(false)
      expect(showPrivacyError.value).toBe(false)
    })
  })

  describe('validateTerms', () => {
    it('should return false when neither terms nor privacy accepted', () => {
      const { validateTerms, showTermsError, showPrivacyError } = useCheckoutTerms()

      const result = validateTerms()

      expect(result).toBe(false)
      expect(showTermsError.value).toBe(true)
      expect(showPrivacyError.value).toBe(true)
    })

    it('should return false when only terms accepted', () => {
      const composable = useCheckoutTerms()
      composable.termsAccepted.value = true

      const result = composable.validateTerms()

      expect(result).toBe(false)
      expect(composable.showTermsError.value).toBe(false)
      expect(composable.showPrivacyError.value).toBe(true)
    })

    it('should return false when only privacy accepted', () => {
      const composable = useCheckoutTerms()
      composable.privacyAccepted.value = true

      const result = composable.validateTerms()

      expect(result).toBe(false)
      expect(composable.showTermsError.value).toBe(true)
      expect(composable.showPrivacyError.value).toBe(false)
    })

    it('should return true when both required terms accepted', () => {
      const composable = useCheckoutTerms()
      composable.termsAccepted.value = true
      composable.privacyAccepted.value = true

      const result = composable.validateTerms()

      expect(result).toBe(true)
      expect(composable.showTermsError.value).toBe(false)
      expect(composable.showPrivacyError.value).toBe(false)
    })

    it('should not require marketing consent for validation', () => {
      const composable = useCheckoutTerms()
      composable.termsAccepted.value = true
      composable.privacyAccepted.value = true
      composable.marketingConsent.value = false // Not required

      const result = composable.validateTerms()

      expect(result).toBe(true)
    })
  })

  describe('reset', () => {
    it('should reset all refs to false', () => {
      const composable = useCheckoutTerms()
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
      const composable = useCheckoutTerms()
      composable.reset()

      composable.termsAccepted.value = true
      composable.privacyAccepted.value = true

      expect(composable.termsAccepted.value).toBe(true)
      expect(composable.privacyAccepted.value).toBe(true)
    })
  })

  describe('areRequiredTermsAccepted computed', () => {
    it('should return false when terms not accepted', () => {
      const composable = useCheckoutTerms()
      composable.privacyAccepted.value = true

      expect(composable.areRequiredTermsAccepted.value).toBe(false)
    })

    it('should return false when privacy not accepted', () => {
      const composable = useCheckoutTerms()
      composable.termsAccepted.value = true

      expect(composable.areRequiredTermsAccepted.value).toBe(false)
    })

    it('should return true when both required terms accepted', () => {
      const composable = useCheckoutTerms()
      composable.termsAccepted.value = true
      composable.privacyAccepted.value = true

      expect(composable.areRequiredTermsAccepted.value).toBe(true)
    })
  })
})
