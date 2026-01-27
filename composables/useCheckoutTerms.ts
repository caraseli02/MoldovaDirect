/**
 * Checkout Terms Composable
 *
 * Manages terms acceptance, privacy consent, and marketing opt-in.
 * Handles validation errors for terms acceptance.
 *
 * @see {CODE_DESIGN_PRINCIPLES.md} Three-layer separation
 */

import { ref, computed } from 'vue'

export function useCheckoutTerms() {
  // State
  const termsAccepted = ref(false)
  const privacyAccepted = ref(false)
  const marketingConsent = ref(false)
  const showTermsError = ref(false)
  const showPrivacyError = ref(false)

  /**
   * Check if both required terms are accepted
   */
  const areRequiredTermsAccepted = computed(() => {
    return termsAccepted.value && privacyAccepted.value
  })

  /**
   * Validate terms acceptance
   * Shows error if required terms are not accepted
   */
  const validateTerms = (): boolean => {
    showTermsError.value = !termsAccepted.value
    showPrivacyError.value = !privacyAccepted.value
    return areRequiredTermsAccepted.value
  }

  /**
   * Reset all terms state
   */
  const reset = () => {
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
