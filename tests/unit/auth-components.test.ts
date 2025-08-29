/**
 * Unit tests for Authentication Components
 * 
 * Tests all authentication-related Vue components
 * Requirements addressed:
 * - 8.6: Show/hide password toggle functionality
 * - 9.1: Proper error handling and loading states
 * - 9.2: User feedback and confirmation messages
 * - 7.1: Password strength validation with visual indicator
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import AuthErrorMessage from '~/components/auth/AuthErrorMessage.vue'
import AuthSuccessMessage from '~/components/auth/AuthSuccessMessage.vue'
import AuthProgressIndicator from '~/components/auth/AuthProgressIndicator.vue'
import PasswordStrengthMeter from '~/components/auth/PasswordStrengthMeter.vue'

// Mock translations
const mockTranslations = {
  en: {
    auth: {
      errors: {
        invalidCredentials: 'Invalid email or password',
        emailRequired: 'Email is required',
        passwordRequired: 'Password is required',
        accountLocked: 'Account locked for {minutes} minutes',
        emailNotVerified: 'Please verify your email address',
        networkError: 'Network error occurred'
      },
      success: {
        loginSuccess: 'Successfully logged in',
        registrationSuccess: 'Account created successfully',
        emailVerified: 'Email verified successfully',
        passwordResetSent: 'Password reset email sent'
      },
      validation: {
        password: {
          weak: 'Weak password',
          fair: 'Fair password',
          good: 'Good password',
          strong: 'Strong password',
          requirements: {
            length: 'At least 8 characters',
            uppercase: 'One uppercase letter',
            lowercase: 'One lowercase letter',
            number: 'One number',
            special: 'One special character'
          }
        }
      },
      progress: {
        step: 'Step {current} of {total}',
        registration: 'Creating your account',
        verification: 'Verifying your email',
        completion: 'Setting up your profile'
      }
    }
  }
}

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: mockTranslations
})

// Mock composables
vi.mock('#app', () => ({
  useI18n: () => ({
    t: (key: string, params?: any) => {
      let result = key
      if (params) {
        Object.entries(params).forEach(([param, value]) => {
          result = result.replace(`{${param}}`, String(value))
        })
      }
      return result
    },
    locale: { value: 'en' }
  })
}))

describe('Authentication Components', () => {
  describe('AuthErrorMessage Component', () => {
    it('should render error message correctly', () => {
      const wrapper = mount(AuthErrorMessage, {
        props: {
          error: 'Invalid email or password',
          type: 'validation'
        },
        global: {
          plugins: [i18n]
        }
      })

      expect(wrapper.text()).toContain('Invalid email or password')
      expect(wrapper.find('[role="alert"]').exists()).toBe(true)
      expect(wrapper.classes()).toContain('text-red-600')
    })

    it('should not render when no error provided', () => {
      const wrapper = mount(AuthErrorMessage, {
        props: {
          error: null
        },
        global: {
          plugins: [i18n]
        }
      })

      expect(wrapper.html()).toBe('<!--v-if-->')
    })

    it('should handle different error types with appropriate styling', () => {
      const networkWrapper = mount(AuthErrorMessage, {
        props: {
          error: 'Network error occurred',
          type: 'network'
        },
        global: {
          plugins: [i18n]
        }
      })

      const validationWrapper = mount(AuthErrorMessage, {
        props: {
          error: 'Email is required',
          type: 'validation'
        },
        global: {
          plugins: [i18n]
        }
      })

      expect(networkWrapper.classes()).toContain('border-orange-200')
      expect(validationWrapper.classes()).toContain('border-red-200')
    })

    it('should be accessible with proper ARIA attributes', () => {
      const wrapper = mount(AuthErrorMessage, {
        props: {
          error: 'Test error message',
          fieldId: 'email-input'
        },
        global: {
          plugins: [i18n]
        }
      })

      const alertElement = wrapper.find('[role="alert"]')
      expect(alertElement.exists()).toBe(true)
      expect(alertElement.attributes('id')).toBe('email-input-error')
      expect(alertElement.attributes('aria-live')).toBe('polite')
    })

    it('should support dismissible errors', async () => {
      const wrapper = mount(AuthErrorMessage, {
        props: {
          error: 'Dismissible error',
          dismissible: true
        },
        global: {
          plugins: [i18n]
        }
      })

      const dismissButton = wrapper.find('button[aria-label="Dismiss error"]')
      expect(dismissButton.exists()).toBe(true)

      await dismissButton.trigger('click')
      expect(wrapper.emitted('dismiss')).toBeTruthy()
    })
  })

  describe('AuthSuccessMessage Component', () => {
    it('should render success message correctly', () => {
      const wrapper = mount(AuthSuccessMessage, {
        props: {
          message: 'Account created successfully',
          type: 'registration'
        },
        global: {
          plugins: [i18n]
        }
      })

      expect(wrapper.text()).toContain('Account created successfully')
      expect(wrapper.find('[role="status"]').exists()).toBe(true)
      expect(wrapper.classes()).toContain('text-green-600')
    })

    it('should auto-dismiss after specified duration', async () => {
      vi.useFakeTimers()
      
      const wrapper = mount(AuthSuccessMessage, {
        props: {
          message: 'Success message',
          autoDismiss: true,
          duration: 3000
        },
        global: {
          plugins: [i18n]
        }
      })

      expect(wrapper.isVisible()).toBe(true)

      vi.advanceTimersByTime(3000)
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('dismiss')).toBeTruthy()
      
      vi.useRealTimers()
    })

    it('should include action button when provided', () => {
      const wrapper = mount(AuthSuccessMessage, {
        props: {
          message: 'Email verified successfully',
          actionText: 'Continue to Dashboard',
          actionPath: '/dashboard'
        },
        global: {
          plugins: [i18n]
        }
      })

      const actionButton = wrapper.find('button')
      expect(actionButton.exists()).toBe(true)
      expect(actionButton.text()).toBe('Continue to Dashboard')
    })

    it('should emit action event when action button clicked', async () => {
      const wrapper = mount(AuthSuccessMessage, {
        props: {
          message: 'Success',
          actionText: 'Continue',
          actionPath: '/dashboard'
        },
        global: {
          plugins: [i18n]
        }
      })

      const actionButton = wrapper.find('button')
      await actionButton.trigger('click')

      expect(wrapper.emitted('action')).toBeTruthy()
      expect(wrapper.emitted('action')?.[0]).toEqual(['/dashboard'])
    })
  })

  describe('AuthProgressIndicator Component', () => {
    it('should render progress indicator with correct steps', () => {
      const wrapper = mount(AuthProgressIndicator, {
        props: {
          currentStep: 2,
          totalSteps: 3,
          steps: [
            { id: 'register', label: 'Create Account', completed: true },
            { id: 'verify', label: 'Verify Email', active: true },
            { id: 'complete', label: 'Complete Profile', completed: false }
          ]
        },
        global: {
          plugins: [i18n]
        }
      })

      const progressBar = wrapper.find('[role="progressbar"]')
      expect(progressBar.exists()).toBe(true)
      expect(progressBar.attributes('aria-valuenow')).toBe('2')
      expect(progressBar.attributes('aria-valuemax')).toBe('3')
      expect(progressBar.attributes('aria-valuemin')).toBe('1')
    })

    it('should show correct visual progress', () => {
      const wrapper = mount(AuthProgressIndicator, {
        props: {
          currentStep: 2,
          totalSteps: 3
        },
        global: {
          plugins: [i18n]
        }
      })

      const progressFill = wrapper.find('.progress-fill')
      expect(progressFill.attributes('style')).toContain('width: 66.67%')
    })

    it('should be accessible with proper ARIA labels', () => {
      const wrapper = mount(AuthProgressIndicator, {
        props: {
          currentStep: 1,
          totalSteps: 3,
          label: 'Account creation progress'
        },
        global: {
          plugins: [i18n]
        }
      })

      const progressBar = wrapper.find('[role="progressbar"]')
      expect(progressBar.attributes('aria-label')).toBe('Account creation progress')
    })

    it('should announce step changes to screen readers', () => {
      const wrapper = mount(AuthProgressIndicator, {
        props: {
          currentStep: 2,
          totalSteps: 3,
          announceChanges: true
        },
        global: {
          plugins: [i18n]
        }
      })

      const liveRegion = wrapper.find('[aria-live="polite"]')
      expect(liveRegion.exists()).toBe(true)
    })
  })

  describe('PasswordStrengthMeter Component', () => {
    it('should calculate password strength correctly', async () => {
      const wrapper = mount(PasswordStrengthMeter, {
        props: {
          password: ''
        },
        global: {
          plugins: [i18n]
        }
      })

      // Test weak password
      await wrapper.setProps({ password: 'weak' })
      expect(wrapper.vm.strength).toBe(1)
      expect(wrapper.vm.strengthLabel).toBe('Weak')

      // Test strong password
      await wrapper.setProps({ password: 'StrongPass123!' })
      expect(wrapper.vm.strength).toBe(4)
      expect(wrapper.vm.strengthLabel).toBe('Strong')
    })

    it('should show password requirements checklist', () => {
      const wrapper = mount(PasswordStrengthMeter, {
        props: {
          password: 'TestPass1',
          showRequirements: true
        },
        global: {
          plugins: [i18n]
        }
      })

      const requirements = wrapper.findAll('.requirement-item')
      expect(requirements.length).toBeGreaterThan(0)

      // Check that some requirements are met
      const metRequirements = wrapper.findAll('.requirement-met')
      expect(metRequirements.length).toBeGreaterThan(0)
    })

    it('should update visual strength indicator', async () => {
      const wrapper = mount(PasswordStrengthMeter, {
        props: {
          password: 'weak'
        },
        global: {
          plugins: [i18n]
        }
      })

      const strengthBar = wrapper.find('.strength-bar')
      expect(strengthBar.classes()).toContain('strength-1')

      await wrapper.setProps({ password: 'StrongPassword123!' })
      expect(strengthBar.classes()).toContain('strength-4')
    })

    it('should be accessible with proper ARIA attributes', () => {
      const wrapper = mount(PasswordStrengthMeter, {
        props: {
          password: 'TestPassword123',
          fieldId: 'password-input'
        },
        global: {
          plugins: [i18n]
        }
      })

      const strengthMeter = wrapper.find('[role="progressbar"]')
      expect(strengthMeter.exists()).toBe(true)
      expect(strengthMeter.attributes('aria-label')).toContain('Password strength')
      expect(strengthMeter.attributes('id')).toBe('password-input-strength')
    })

    it('should provide real-time feedback', async () => {
      const wrapper = mount(PasswordStrengthMeter, {
        props: {
          password: '',
          realTime: true
        },
        global: {
          plugins: [i18n]
        }
      })

      // Simulate typing
      await wrapper.setProps({ password: 'T' })
      expect(wrapper.vm.strength).toBe(1)

      await wrapper.setProps({ password: 'Test' })
      expect(wrapper.vm.strength).toBe(1)

      await wrapper.setProps({ password: 'Test123' })
      expect(wrapper.vm.strength).toBe(2)

      await wrapper.setProps({ password: 'Test123!' })
      expect(wrapper.vm.strength).toBe(3)
    })

    it('should emit strength change events', async () => {
      const wrapper = mount(PasswordStrengthMeter, {
        props: {
          password: 'weak'
        },
        global: {
          plugins: [i18n]
        }
      })

      await wrapper.setProps({ password: 'StrongPassword123!' })

      expect(wrapper.emitted('strengthChange')).toBeTruthy()
      expect(wrapper.emitted('strengthChange')?.[0]).toEqual([4, 'Strong'])
    })
  })
})

describe('Component Integration', () => {
  it('should work together in authentication forms', () => {
    // Test that components can be used together without conflicts
    const errorMessage = mount(AuthErrorMessage, {
      props: { error: 'Test error' },
      global: { plugins: [i18n] }
    })

    const successMessage = mount(AuthSuccessMessage, {
      props: { message: 'Test success' },
      global: { plugins: [i18n] }
    })

    const progressIndicator = mount(AuthProgressIndicator, {
      props: { currentStep: 1, totalSteps: 3 },
      global: { plugins: [i18n] }
    })

    const passwordStrength = mount(PasswordStrengthMeter, {
      props: { password: 'test123' },
      global: { plugins: [i18n] }
    })

    expect(errorMessage.exists()).toBe(true)
    expect(successMessage.exists()).toBe(true)
    expect(progressIndicator.exists()).toBe(true)
    expect(passwordStrength.exists()).toBe(true)
  })

  it('should maintain consistent styling across components', () => {
    const components = [
      mount(AuthErrorMessage, {
        props: { error: 'Test' },
        global: { plugins: [i18n] }
      }),
      mount(AuthSuccessMessage, {
        props: { message: 'Test' },
        global: { plugins: [i18n] }
      })
    ]

    components.forEach(wrapper => {
      // Check for consistent spacing classes
      expect(wrapper.html()).toMatch(/p-[0-9]|px-[0-9]|py-[0-9]/)
      // Check for consistent border radius
      expect(wrapper.html()).toMatch(/rounded/)
    })
  })
})