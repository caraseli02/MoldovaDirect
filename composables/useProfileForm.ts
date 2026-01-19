/**
 * Profile Form Composable
 *
 * Manages profile form state, validation, and change tracking.
 * Auto-save logic (debouncing, handleSave) stays in the page component.
 *
 * @example
 * ```ts
 * const { form, errors, hasUnsavedChanges, validateForm, initializeForm } = useProfileForm()
 * ```
 */

import type { Ref } from 'vue'
import { computed, reactive, ref, watch } from 'vue'
import type { SupabaseClient } from '@supabase/supabase-js'

import { PROFILE_VALIDATION } from './profile/validation-constants'

interface ToastPlugin {
  success: (message: string) => void
  error: (message: string) => void
}

interface UserMetadata {
  name?: string
  full_name?: string
  phone?: string
  preferred_language?: 'es' | 'en' | 'ro' | 'ru'
  preferred_currency?: 'EUR' | 'USD' | 'MDL'
}

interface SupabaseUser {
  email?: string | null
  user_metadata?: UserMetadata
}

interface ProfileForm {
  name: string
  email: string
  phone: string
  preferredLanguage: 'es' | 'en' | 'ro' | 'ru'
  preferredCurrency: 'EUR' | 'USD' | 'MDL'
}

interface ProfileFormErrors {
  name: string
  phone: string
}

interface UseProfileFormOptions {
  /** Supabase client instance */
  supabase: SupabaseClient
  /** Current authenticated user */
  user: Ref<SupabaseUser | null>
  /** Toast notification plugin */
  $toast: ToastPlugin
  /** i18n t function */
  t: (key: string) => string
}

interface UseProfileFormReturn {
  /** Current form values (reactive) */
  form: ProfileForm
  /** Original form values for change detection */
  originalForm: Ref<ProfileForm>
  /** Form validation errors */
  errors: ProfileFormErrors
  /** Whether there are unsaved changes */
  hasUnsavedChanges: ComputedRef<boolean>
  /**
   * Initialize form with user data
   * Call this when component mounts or user data changes
   */
  initializeForm(): void
  /**
   * Validate the current form values
   * @returns true if valid, false otherwise
   */
  validateForm(): boolean
  /**
   * Clear all validation errors
   */
  clearErrors(): void
  /**
   * Update a specific field value
   * @param field - The field to update
   * @param value - The new value
   */
  updateField<K extends keyof ProfileForm>(field: K, value: ProfileForm[K]): void
  /**
   * Reset form to original values
   */
  resetForm(): void
  /**
   * Get the ID of the first field with an error
   * @returns Field ID or null if no errors
   */
  getFirstErrorField(): 'name' | 'phone' | null
}

export function useProfileForm(options: UseProfileFormOptions): UseProfileFormReturn {
  const { user, t } = options

  // Default values
  const defaultForm: ProfileForm = {
    name: '',
    email: '',
    phone: '',
    preferredLanguage: 'es',
    preferredCurrency: 'EUR',
  }

  // Form state
  const form = reactive<ProfileForm>({ ...defaultForm })
  const originalForm = ref<ProfileForm>({ ...defaultForm })
  const errors = reactive<ProfileFormErrors>({
    name: '',
    phone: '',
  })

  /**
   * Whether there are unsaved changes
   */
  const hasUnsavedChanges = computed(() => {
    return (
      form.name !== originalForm.value.name
      || form.phone !== originalForm.value.phone
      || form.preferredLanguage !== originalForm.value.preferredLanguage
      || form.preferredCurrency !== originalForm.value.preferredCurrency
    )
  })

  /**
   * Initialize form with user data from Supabase
   */
  function initializeForm(): void {
    if (!user.value) return

    const userData: ProfileForm = {
      name: user.value.user_metadata?.name || user.value.user_metadata?.full_name || '',
      email: user.value.email || '',
      phone: user.value.user_metadata?.phone || '',
      preferredLanguage: (user.value.user_metadata?.preferred_language || 'es') as 'es' | 'en' | 'ro' | 'ru',
      preferredCurrency: (user.value.user_metadata?.preferred_currency || 'EUR') as 'EUR' | 'USD' | 'MDL',
    }

    Object.assign(form, userData)
    originalForm.value = { ...userData }
  }

  /**
   * Validate the current form values
   */
  function validateForm(): boolean {
    clearErrors()

    // Validate name
    if (!form.name.trim()) {
      errors.name = t('auth.validation.name.required')
      return false
    }

    if (form.name.trim().length < PROFILE_VALIDATION.NAME_MIN_LENGTH) {
      errors.name = t('auth.validation.name.minLength')
      return false
    }

    // Validate phone (only if provided)
    if (form.phone && !PROFILE_VALIDATION.PHONE_REGEX.test(form.phone)) {
      errors.phone = t('auth.validation.phone.invalid')
      return false
    }

    return true
  }

  /**
   * Clear all validation errors
   */
  function clearErrors(): void {
    errors.name = ''
    errors.phone = ''
  }

  /**
   * Update a specific field value
   */
  function updateField<K extends keyof ProfileForm>(field: K, value: ProfileForm[K]): void {
    form[field] = value
  }

  /**
   * Reset form to original values
   */
  function resetForm(): void {
    Object.assign(form, originalForm.value)
    clearErrors()
  }

  /**
   * Get the ID of the first field with an error
   */
  function getFirstErrorField(): 'name' | 'phone' | null {
    if (errors.name) return 'name'
    if (errors.phone) return 'phone'
    return null
  }

  // Auto-initialize when user changes
  watch(
    user,
    () => {
      if (user.value) {
        initializeForm()
      }
    },
    { immediate: true },
  )

  return {
    form,
    originalForm,
    errors,
    hasUnsavedChanges,
    initializeForm,
    validateForm,
    clearErrors,
    updateField,
    resetForm,
    getFirstErrorField,
  }
}

/**
 * Export types for use in components
 */
export type { ProfileForm, ProfileFormErrors }
