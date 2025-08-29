/**
 * Unit tests for Authentication Composables
 * 
 * Tests all authentication-related composables
 * Requirements addressed:
 * - 6.1, 6.2, 6.3: Multi-language support validation
 * - 7.1: Password strength validation
 * - 9.1, 9.2: Error message handling and user feedback
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAuthMessages } from '~/composables/useAuthMessages'
import { useAuthValidation } from '~/composables/useAuthValidation'

// Mock i18n
const mockT = vi.fn((key: string, params?: any) => {
  const translations: Record<string, string> = {
    'auth.errors.invalidCredentials': 'Invalid email or password',
    'auth.errors.emailRequired': 'Email is required',
    'auth.errors.passwordRequired': 'Password is required',
    'auth.errors.accountLocked': 'Account locked for {minutes} minutes',
    'auth.errors.emailNotVerified': 'Please verify your email address',
    'auth.errors.emailExists': 'Email already registered',
    'auth.errors.weakPassword': 'Password is too weak',
    'auth.errors.passwordMismatch': 'Passwords do not match',
    'auth.errors.termsRequired': 'You must accept the terms and conditions',
    'auth.errors.sessionExpired': 'Your session has expired',
    'auth.errors.rateLimitExceeded': 'Too many attempts. Try again in {minutes} minutes',
    'auth.errors.tokenExpired': 'Verification link has expired',
    'auth.errors.tokenInvalid': 'Invalid verification link',
    'auth.errors.userNotFound': 'User not found',
    'auth.errors.emailInvalid': 'Please enter a valid email address',
    'auth.errors.networkError': 'Network error occurred',
    'auth.errors.serverError': 'Server error occurred',
    'auth.errors.unknownError': 'An unknown error occurred',
    'auth.validation.email.required': 'Email is required',
    'auth.validation.email.invalid': 'Please enter a valid email address',
    'auth.validation.password.required': 'Password is required',
    'auth.validation.password.minLength': 'Password must be at least 8 characters',
    'auth.validation.password.uppercase': 'Password must contain an uppercase letter',
    'auth.validation.password.lowercase': 'Password must contain a lowercase letter',
    'auth.validation.password.number': 'Password must contain a number',
    'auth.validation.password.mismatch': 'Passwords do not match',
    'auth.validation.name.required': 'Name is required',
    'auth.validation.name.minLength': 'Name must be at least 2 characters',
    'auth.validation.phone.invalid': 'Please enter a valid phone number',
    'auth.validation.terms.required': 'You must accept the terms and conditions',
    'auth.success.loginSuccess': 'Successfully logged in',
    'auth.success.registrationSuccess': 'Account created successfully',
    'auth.success.emailVerified': 'Email verified successfully',
    'auth.success.passwordResetSent': 'Password reset email sent'
  }
  
  let result = translations[key] || key
  if (params) {
    Object.entries(params).forEach(([param, value]) => {
      result = result.replace(`{${param}}`, String(value))
    })
  }
  return result
})

vi.mock('#app', () => ({
  useI18n: () => ({
    t: mockT,
    locale: { value: 'en' }
  })
}))

describe('useAuthMessages Composable', () => {
  let authMessages: ReturnType<typeof useAuthMessages>

  beforeEach(() => {
    vi.clearAllMocks()
    authMessages = useAuthMessages()
  })

  describe('Error Message Translation', () => {
    it('should translate authentication errors correctly', () => {
      const error = authMessages.translateAuthError('Invalid login credentials', 'login')
      expect(error).toBe('Invalid email or password')
      expect(mockT).toHaveBeenCalledWith('auth.errors.invalidCredentials')
    })

    it('should handle rate limiting errors with parameters', () => {
      const error = authMessages.translateAuthError('Too many requests', 'login', { minutes: 15 })
      expect(error).toBe('Too many attempts. Try again in 15 minutes')
      expect(mockT).toHaveBeenCalledWith('auth.errors.rateLimitExceeded', { minutes: 15 })
    })

    it('should handle account lockout errors with time remaining', () => {
      const error = authMessages.translateAuthError('Account locked', 'login', { minutes: 10 })
      expect(error).toBe('Account locked for 10 minutes')
      expect(mockT).toHaveBeenCalledWith('auth.errors.accountLocked', { minutes: 10 })
    })

    it('should handle email verification errors', () => {
      const error = authMessages.translateAuthError('Email not confirmed', 'login')
      expect(error).toBe('Please verify your email address')
      expect(mockT).toHaveBeenCalledWith('auth.errors.emailNotVerified')
    })

    it('should handle network errors gracefully', () => {
      const error = authMessages.translateAuthError('Network Error', 'general')
      expect(error).toBe('Network error occurred')
      expect(mockT).toHaveBeenCalledWith('auth.errors.networkError')
    })

    it('should handle unknown errors with fallback', () => {
      const error = authMessages.translateAuthError('Some unknown error', 'general')
      expect(error).toBe('An unknown error occurred')
      expect(mockT).toHaveBeenCalledWith('auth.errors.unknownError')
    })
  })

  describe('Error Message Creation', () => {
    it('should create error message objects with correct structure', () => {
      const errorMessage = authMessages.createErrorMessage('Invalid credentials', 'validation')
      
      expect(errorMessage).toEqual({
        type: 'error',
        category: 'validation',
        message: 'Invalid credentials',
        timestamp: expect.any(Date),
        dismissible: true
      })
    })

    it('should create non-dismissible error messages when specified', () => {
      const errorMessage = authMessages.createErrorMessage('Critical error', 'system', false)
      
      expect(errorMessage.dismissible).toBe(false)
    })

    it('should include context information when provided', () => {
      const errorMessage = authMessages.createErrorMessage(
        'Validation failed', 
        'validation', 
        true, 
        { field: 'email', code: 'INVALID_FORMAT' }
      )
      
      expect(errorMessage.context).toEqual({
        field: 'email',
        code: 'INVALID_FORMAT'
      })
    })
  })

  describe('Success Message Creation', () => {
    it('should create success message objects with correct structure', () => {
      const successMessage = authMessages.createSuccessMessage('Login successful', 'login')
      
      expect(successMessage).toEqual({
        type: 'success',
        category: 'login',
        message: 'Login successful',
        timestamp: expect.any(Date),
        autoDismiss: true,
        duration: 5000
      })
    })

    it('should create persistent success messages when specified', () => {
      const successMessage = authMessages.createSuccessMessage('Account created', 'registration', false)
      
      expect(successMessage.autoDismiss).toBe(false)
    })

    it('should allow custom duration for success messages', () => {
      const successMessage = authMessages.createSuccessMessage('Quick message', 'general', true, 3000)
      
      expect(successMessage.duration).toBe(3000)
    })
  })

  describe('Message Formatting', () => {
    it('should format messages with parameters correctly', () => {
      const formatted = authMessages.formatMessage('Account locked for {minutes} minutes', { minutes: 15 })
      expect(formatted).toBe('Account locked for 15 minutes')
    })

    it('should handle multiple parameters', () => {
      const formatted = authMessages.formatMessage(
        'Step {current} of {total}', 
        { current: 2, total: 3 }
      )
      expect(formatted).toBe('Step 2 of 3')
    })

    it('should handle missing parameters gracefully', () => {
      const formatted = authMessages.formatMessage('Hello {name}', {})
      expect(formatted).toBe('Hello {name}') // Should leave placeholder if no value
    })
  })

  describe('Context-Aware Error Handling', () => {
    it('should provide different messages based on context', () => {
      const loginError = authMessages.translateAuthError('Invalid credentials', 'login')
      const registerError = authMessages.translateAuthError('User already exists', 'registration')
      
      expect(loginError).toBe('Invalid email or password')
      expect(registerError).toBe('Email already registered')
    })

    it('should handle validation context appropriately', () => {
      const emailError = authMessages.translateAuthError('Invalid email', 'validation', { field: 'email' })
      expect(emailError).toBe('Please enter a valid email address')
    })
  })
})

describe('useAuthValidation Composable', () => {
  let authValidation: ReturnType<typeof useAuthValidation>

  beforeEach(() => {
    vi.clearAllMocks()
    authValidation = useAuthValidation()
  })

  describe('Email Validation', () => {
    it('should validate correct email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        'user123@test-domain.com'
      ]

      validEmails.forEach(email => {
        const result = authValidation.validateEmail(email)
        expect(result.isValid).toBe(true)
        expect(result.errors).toHaveLength(0)
      })
    })

    it('should reject invalid email addresses', () => {
      const invalidEmails = [
        '',
        'invalid-email',
        '@domain.com',
        'user@',
        'user..name@domain.com',
        'user@domain',
        'user name@domain.com'
      ]

      invalidEmails.forEach(email => {
        const result = authValidation.validateEmail(email)
        expect(result.isValid).toBe(false)
        expect(result.errors.length).toBeGreaterThan(0)
      })
    })

    it('should provide specific error messages for email validation', () => {
      const emptyResult = authValidation.validateEmail('')
      expect(emptyResult.errors[0]).toBe('Email is required')

      const invalidResult = authValidation.validateEmail('invalid-email')
      expect(invalidResult.errors[0]).toBe('Please enter a valid email address')
    })
  })

  describe('Password Validation', () => {
    it('should validate strong passwords', () => {
      const strongPasswords = [
        'StrongPass123!',
        'MySecure@Password1',
        'Complex#Pass2024',
        'Secure$123Password'
      ]

      strongPasswords.forEach(password => {
        const result = authValidation.validatePassword(password)
        expect(result.isValid).toBe(true)
        expect(result.errors).toHaveLength(0)
        expect(result.strength).toBeGreaterThanOrEqual(3)
      })
    })

    it('should reject weak passwords', () => {
      const weakPasswords = [
        '',
        '123',
        'password',
        'PASSWORD',
        '12345678',
        'weakpass'
      ]

      weakPasswords.forEach(password => {
        const result = authValidation.validatePassword(password)
        expect(result.isValid).toBe(false)
        expect(result.errors.length).toBeGreaterThan(0)
      })
    })

    it('should check password requirements individually', () => {
      const result = authValidation.validatePassword('short')
      expect(result.requirements).toEqual({
        length: false,
        uppercase: false,
        lowercase: true,
        number: false,
        special: false
      })
    })

    it('should calculate password strength correctly', () => {
      expect(authValidation.validatePassword('weak').strength).toBe(1)
      expect(authValidation.validatePassword('Weak123').strength).toBe(3)
      expect(authValidation.validatePassword('Strong@Pass123').strength).toBe(4)
    })

    it('should provide specific error messages for password requirements', () => {
      const result = authValidation.validatePassword('short')
      expect(result.errors).toContain('Password must be at least 8 characters')
      expect(result.errors).toContain('Password must contain an uppercase letter')
      expect(result.errors).toContain('Password must contain a number')
    })
  })

  describe('Name Validation', () => {
    it('should validate correct names', () => {
      const validNames = [
        'John Doe',
        'María García',
        'Jean-Pierre',
        'O\'Connor',
        '李小明'
      ]

      validNames.forEach(name => {
        const result = authValidation.validateName(name)
        expect(result.isValid).toBe(true)
        expect(result.errors).toHaveLength(0)
      })
    })

    it('should reject invalid names', () => {
      const invalidNames = [
        '',
        'A',
        '123',
        'Name123',
        'name@domain.com'
      ]

      invalidNames.forEach(name => {
        const result = authValidation.validateName(name)
        expect(result.isValid).toBe(false)
        expect(result.errors.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Phone Validation', () => {
    it('should validate correct phone numbers', () => {
      const validPhones = [
        '+1234567890',
        '+34612345678',
        '+373123456789',
        '+7123456789'
      ]

      validPhones.forEach(phone => {
        const result = authValidation.validatePhone(phone)
        expect(result.isValid).toBe(true)
        expect(result.errors).toHaveLength(0)
      })
    })

    it('should reject invalid phone numbers', () => {
      const invalidPhones = [
        '',
        '123',
        'not-a-phone',
        '123456789012345', // too long
        '+' // just plus sign
      ]

      invalidPhones.forEach(phone => {
        const result = authValidation.validatePhone(phone)
        expect(result.isValid).toBe(false)
        expect(result.errors.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Form Validation', () => {
    it('should validate complete login form', () => {
      const validLoginData = {
        email: 'test@example.com',
        password: 'ValidPass123!'
      }

      const result = authValidation.validateLogin(validLoginData)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should validate complete registration form', () => {
      const validRegistrationData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        acceptTerms: true,
        language: 'en' as const
      }

      const result = authValidation.validateRegistration(validRegistrationData)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should catch password mismatch in registration', () => {
      const registrationData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        password: 'SecurePass123!',
        confirmPassword: 'DifferentPass123!',
        acceptTerms: true,
        language: 'en' as const
      }

      const result = authValidation.validateRegistration(registrationData)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Passwords do not match')
    })

    it('should require terms acceptance in registration', () => {
      const registrationData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        acceptTerms: false,
        language: 'en' as const
      }

      const result = authValidation.validateRegistration(registrationData)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('You must accept the terms and conditions')
    })
  })

  describe('Real-time Validation', () => {
    it('should provide immediate feedback for email fields', () => {
      const result = authValidation.validateEmailRealTime('test@')
      expect(result.isValid).toBe(false)
      expect(result.isPartiallyValid).toBe(true) // Partially typed email
    })

    it('should provide immediate feedback for password fields', () => {
      const result = authValidation.validatePasswordRealTime('Test')
      expect(result.isValid).toBe(false)
      expect(result.strength).toBe(1)
      expect(result.requirements.length).toBe(true) // Has some length
    })
  })

  describe('Validation Utilities', () => {
    it('should sanitize input data', () => {
      const dirtyData = {
        email: '  TEST@EXAMPLE.COM  ',
        name: '  John Doe  '
      }

      const sanitized = authValidation.sanitizeInput(dirtyData)
      expect(sanitized.email).toBe('test@example.com')
      expect(sanitized.name).toBe('John Doe')
    })

    it('should check for common password patterns', () => {
      const commonPasswords = [
        'password',
        '123456',
        'qwerty',
        'admin',
        'letmein'
      ]

      commonPasswords.forEach(password => {
        const isCommon = authValidation.isCommonPassword(password)
        expect(isCommon).toBe(true)
      })
    })

    it('should validate password complexity beyond basic requirements', () => {
      const complexity = authValidation.calculatePasswordComplexity('MySecure@Password123')
      expect(complexity.score).toBeGreaterThan(80)
      expect(complexity.hasVariety).toBe(true)
      expect(complexity.hasNoCommonPatterns).toBe(true)
    })
  })
})