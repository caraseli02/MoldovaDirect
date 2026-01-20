/**
 * Profile Validation Constants
 *
 * Validation patterns and limits used across profile-related composables and components.
 */

export const PROFILE_VALIDATION = {
  /** Minimum length for user name */
  NAME_MIN_LENGTH: 2,

  /** Phone number validation pattern - allows optional +, digits, spaces, hyphens, parentheses, min 9 chars */
  PHONE_REGEX: /^[+]?[0-9\s\-()]{9,}$/,

  /** Maximum file size for avatar upload (5MB) */
  AVATAR_MAX_SIZE: 5 * 1024 * 1024,

  /** Accepted MIME types for avatar upload */
  AVATAR_ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],

  /** Supabase storage bucket name for avatars */
  AVATAR_STORAGE_BUCKET: 'avatars',

  /** Total number of completion checkpoints for profile completion percentage */
  COMPLETION_TOTAL_CHECKPOINTS: 5,
} as const

/**
 * Save status states for profile updates
 */
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

/**
 * Duration constants for auto-save behavior
 */
export const SAVE_TIMING = {
  /** Delay before triggering auto-save (milliseconds) */
  AUTO_SAVE_DELAY: 1000,

  /** How long to show "saved" status before hiding (milliseconds) */
  SAVED_STATUS_DURATION: 2000,

  /** How long to show "error" status before hiding (milliseconds) */
  ERROR_STATUS_DURATION: 5000,
} as const

/**
 * Form field identifiers for testing
 */
export const PROFILE_TESTIDS = {
  nameInput: 'profile-name-input',
  nameError: 'profile-name-error',
  emailInput: 'profile-email-input',
  phoneInput: 'profile-phone-input',
  phoneError: 'profile-phone-error',
  languageSelect: 'profile-language-select',
  currencySelect: 'profile-currency-select',
  completion: 'profile-completion',
  completionPercentage: 'profile-completion-percentage',
  completionBar: 'profile-completion-bar',
  avatarSection: 'profile-avatar-section',
  avatarUpload: 'profile-avatar-upload',
  avatarImage: 'profile-avatar-image',
  avatarInitials: 'profile-avatar-initials',
  avatarCameraBtn: 'profile-avatar-camera-btn',
  avatarRemoveBtn: 'profile-avatar-remove-btn',
  avatarFileInput: 'profile-avatar-file-input',
  personalSection: 'profile-personal-section',
  preferencesSection: 'profile-preferences-section',
  addressesSection: 'profile-addresses-section',
  addAddressBtn: 'profile-add-address-btn',
  securitySection: 'profile-security-section',
  changePasswordBtn: 'profile-change-password-btn',
  enable2FABtn: 'profile-enable-2fa-btn',
  deleteAccountBtn: 'profile-delete-account-btn',
} as const
