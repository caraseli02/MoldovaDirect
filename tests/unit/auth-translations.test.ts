/**
 * Authentication translations test suite
 * 
 * Requirements addressed:
 * - 6.1, 6.2, 6.3: Multi-language support validation
 * - 9.1, 9.2: Error message display system testing
 * - Ensure all translation keys are properly defined across all languages
 */

import { describe, it, expect } from 'vitest'
import enTranslations from '../../i18n/locales/en.json'
import esTranslations from '../../i18n/locales/es.json'
import roTranslations from '../../i18n/locales/ro.json'
import ruTranslations from '../../i18n/locales/ru.json'

const languages = {
  en: enTranslations,
  es: esTranslations,
  ro: roTranslations,
  ru: ruTranslations
}

/**
 * Recursively get all translation keys from an object
 */
function getTranslationKeys(obj: any, prefix = ''): string[] {
  const keys: string[] = []
  
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    
    if (typeof value === 'object' && value !== null) {
      keys.push(...getTranslationKeys(value, fullKey))
    } else {
      keys.push(fullKey)
    }
  }
  
  return keys
}

/**
 * Get value from nested object using dot notation
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

describe('Authentication Translations', () => {
  describe('Translation Key Consistency', () => {
    it('should have consistent auth translation keys across all languages', () => {
      const enAuthKeys = getTranslationKeys(enTranslations.auth, 'auth')
      
      Object.entries(languages).forEach(([lang, translations]) => {
        const langAuthKeys = getTranslationKeys(translations.auth, 'auth')
        
        // Check that all English keys exist in other languages
        enAuthKeys.forEach(key => {
          expect(langAuthKeys).toContain(key)
          
          // Check that the value is not empty
          const value = getNestedValue(translations, key)
          expect(value).toBeTruthy()
          expect(typeof value).toBe('string')
          expect(value.trim()).not.toBe('')
        })
      })
    })

    it('should have all required error message keys', () => {
      const requiredErrorKeys = [
        'auth.errors.invalidCredentials',
        'auth.errors.emailRequired',
        'auth.errors.passwordRequired',
        'auth.errors.accountLocked',
        'auth.errors.emailNotVerified',
        'auth.errors.emailExists',
        'auth.errors.weakPassword',
        'auth.errors.passwordMismatch',
        'auth.errors.termsRequired',
        'auth.errors.sessionExpired',
        'auth.errors.rateLimitExceeded',
        'auth.errors.tokenExpired',
        'auth.errors.tokenInvalid',
        'auth.errors.userNotFound',
        'auth.errors.emailInvalid',
        'auth.errors.passwordWeak',
        'auth.errors.networkError',
        'auth.errors.serverError',
        'auth.errors.unknownError'
      ]

      Object.entries(languages).forEach(([lang, translations]) => {
        requiredErrorKeys.forEach(key => {
          const value = getNestedValue(translations, key)
          expect(value, `Missing key ${key} in ${lang}`).toBeTruthy()
          expect(typeof value).toBe('string')
        })
      })
    })

    it('should have all required validation message keys', () => {
      const requiredValidationKeys = [
        'auth.validation.email.required',
        'auth.validation.email.invalid',
        'auth.validation.email.exists',
        'auth.validation.email.notFound',
        'auth.validation.password.required',
        'auth.validation.password.minLength',
        'auth.validation.password.uppercase',
        'auth.validation.password.lowercase',
        'auth.validation.password.number',
        'auth.validation.password.mismatch',
        'auth.validation.password.weak',
        'auth.validation.password.current',
        'auth.validation.name.required',
        'auth.validation.name.minLength',
        'auth.validation.name.invalid',
        'auth.validation.phone.invalid',
        'auth.validation.terms.required',
        'auth.validation.token.required',
        'auth.validation.token.invalid',
        'auth.validation.token.expired'
      ]

      Object.entries(languages).forEach(([lang, translations]) => {
        requiredValidationKeys.forEach(key => {
          const value = getNestedValue(translations, key)
          expect(value, `Missing key ${key} in ${lang}`).toBeTruthy()
          expect(typeof value).toBe('string')
        })
      })
    })

    it('should have all required success message keys', () => {
      const requiredSuccessKeys = [
        'auth.success.loginSuccess',
        'auth.success.registrationSuccess',
        'auth.success.emailVerified',
        'auth.success.passwordResetSent',
        'auth.success.passwordResetSuccess',
        'auth.success.verificationResent',
        'auth.success.logoutSuccess',
        'auth.success.accountCreated',
        'auth.success.profileUpdated',
        'auth.success.emailUpdated',
        'auth.success.passwordUpdated'
      ]

      Object.entries(languages).forEach(([lang, translations]) => {
        requiredSuccessKeys.forEach(key => {
          const value = getNestedValue(translations, key)
          expect(value, `Missing key ${key} in ${lang}`).toBeTruthy()
          expect(typeof value).toBe('string')
        })
      })
    })

    it('should have all required message keys', () => {
      const requiredMessageKeys = [
        'auth.messages.loginRequired',
        'auth.messages.emailVerificationRequired',
        'auth.messages.checkEmail',
        'auth.messages.redirecting',
        'auth.messages.processing',
        'auth.messages.loading',
        'auth.messages.welcomeBack',
        'auth.messages.accountLocked',
        'auth.messages.sessionExpired',
        'auth.messages.verificationPending',
        'auth.messages.passwordResetInstructions',
        'auth.messages.newPasswordInstructions',
        'auth.messages.alreadyVerified',
        'auth.messages.resendAvailable',
        'auth.messages.securityNotice'
      ]

      Object.entries(languages).forEach(([lang, translations]) => {
        requiredMessageKeys.forEach(key => {
          const value = getNestedValue(translations, key)
          expect(value, `Missing key ${key} in ${lang}`).toBeTruthy()
          expect(typeof value).toBe('string')
        })
      })
    })

    it('should have all required button keys', () => {
      const requiredButtonKeys = [
        'auth.buttons.signIn',
        'auth.buttons.signUp',
        'auth.buttons.signOut',
        'auth.buttons.createAccount',
        'auth.buttons.resetPassword',
        'auth.buttons.sendResetEmail',
        'auth.buttons.verifyEmail',
        'auth.buttons.resendVerification',
        'auth.buttons.backToLogin',
        'auth.buttons.continueToAccount',
        'auth.buttons.tryAgain',
        'auth.buttons.cancel',
        'auth.buttons.confirm',
        'auth.buttons.save',
        'auth.buttons.update'
      ]

      Object.entries(languages).forEach(([lang, translations]) => {
        requiredButtonKeys.forEach(key => {
          const value = getNestedValue(translations, key)
          expect(value, `Missing key ${key} in ${lang}`).toBeTruthy()
          expect(typeof value).toBe('string')
        })
      })
    })

    it('should have all required label keys', () => {
      const requiredLabelKeys = [
        'auth.labels.email',
        'auth.labels.password',
        'auth.labels.newPassword',
        'auth.labels.currentPassword',
        'auth.labels.confirmPassword',
        'auth.labels.fullName',
        'auth.labels.firstName',
        'auth.labels.lastName',
        'auth.labels.phone',
        'auth.labels.rememberMe',
        'auth.labels.acceptTerms',
        'auth.labels.language',
        'auth.labels.notifications'
      ]

      Object.entries(languages).forEach(([lang, translations]) => {
        requiredLabelKeys.forEach(key => {
          const value = getNestedValue(translations, key)
          expect(value, `Missing key ${key} in ${lang}`).toBeTruthy()
          expect(typeof value).toBe('string')
        })
      })
    })

    it('should have all required placeholder keys', () => {
      const requiredPlaceholderKeys = [
        'auth.placeholders.email',
        'auth.placeholders.password',
        'auth.placeholders.newPassword',
        'auth.placeholders.confirmPassword',
        'auth.placeholders.fullName',
        'auth.placeholders.phone'
      ]

      Object.entries(languages).forEach(([lang, translations]) => {
        requiredPlaceholderKeys.forEach(key => {
          const value = getNestedValue(translations, key)
          expect(value, `Missing key ${key} in ${lang}`).toBeTruthy()
          expect(typeof value).toBe('string')
        })
      })
    })
  })

  describe('Translation Quality', () => {
    it('should not have placeholder values or empty strings', () => {
      Object.entries(languages).forEach(([lang, translations]) => {
        const authKeys = getTranslationKeys(translations.auth, 'auth')
        
        authKeys.forEach(key => {
          const value = getNestedValue(translations, key)
          
          // Check for common placeholder patterns (whole words only)
          expect(value).not.toMatch(/\bTODO\b|\bFIXME\b|\bXXX\b/i)
          expect(value).not.toBe('TODO')
          expect(value).not.toBe('')
          expect(value.trim()).not.toBe('')
          
          // Check that it's not just the key name (allow some exceptions for common words)
          const keyPart = key.split('.').pop()
          const allowedExceptions = ['password', 'email', 'phone', 'name', 'cancel', 'confirm', 'save', 'update', 'processing', 'loading', 'redirecting']
          if (keyPart && !allowedExceptions.includes(keyPart.toLowerCase())) {
            expect(value.toLowerCase()).not.toBe(keyPart.toLowerCase())
          }
        })
      })
    })

    it('should have consistent parameter placeholders', () => {
      const keysWithParams = [
        'auth.errors.accountLocked',
        'auth.errors.rateLimitExceeded',
        'auth.messages.accountLocked'
      ]

      Object.entries(languages).forEach(([lang, translations]) => {
        keysWithParams.forEach(key => {
          const value = getNestedValue(translations, key)
          
          // Check that parameter placeholders are present
          expect(value).toMatch(/\{minutes\}/)
        })
      })
    })

    it('should have appropriate capitalization for different contexts', () => {
      Object.entries(languages).forEach(([lang, translations]) => {
        // Button texts should be properly capitalized
        const buttonKeys = getTranslationKeys(translations.auth.buttons, 'auth.buttons')
        buttonKeys.forEach(key => {
          const value = getNestedValue(translations, key)
          // Should not be all lowercase (unless it's a single word like "cancel")
          if (value.includes(' ')) {
            expect(value).not.toMatch(/^[a-z]/)
          }
        })

        // Error messages should be sentence case
        const errorKeys = getTranslationKeys(translations.auth.errors, 'auth.errors')
        errorKeys.forEach(key => {
          const value = getNestedValue(translations, key)
          // Should start with uppercase (including Cyrillic and other Unicode uppercase letters)
          expect(value.charAt(0)).toMatch(/[\p{Lu}]/u)
        })
      })
    })
  })

  describe('Language-Specific Validation', () => {
    it('should have proper Spanish translations', () => {
      const spanishAuth = esTranslations.auth
      
      // Check some key Spanish translations
      expect(spanishAuth.signIn).toBe('Iniciar Sesión')
      expect(spanishAuth.signUp).toBe('Registrarse')
      expect(spanishAuth.email).toBe('Correo Electrónico')
      expect(spanishAuth.password).toBe('Contraseña')
      expect(spanishAuth.errors.invalidCredentials).toBe('Correo o contraseña incorrectos')
    })

    it('should have proper Romanian translations', () => {
      const romanianAuth = roTranslations.auth
      
      // Check some key Romanian translations
      expect(romanianAuth.signIn).toBe('Autentificare')
      expect(romanianAuth.signUp).toBe('Înregistrare')
      expect(romanianAuth.email).toBe('Adresă Email')
      expect(romanianAuth.password).toBe('Parolă')
    })

    it('should have proper Russian translations', () => {
      const russianAuth = ruTranslations.auth
      
      // Check some key Russian translations
      expect(russianAuth.signIn).toBe('Войти')
      expect(russianAuth.signUp).toBe('Регистрация')
      expect(russianAuth.email).toBe('Адрес электронной почты')
      expect(russianAuth.password).toBe('Пароль')
    })
  })
})