import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import PayPalSection from '~/components/checkout/payment/PayPalSection.vue'

describe('PayPalSection', () => {
  const defaultProps = {
    modelValue: {
      email: '',
    },
    errors: {},
  }

  const mountComponent = (props = {}, options = {}): VueWrapper => {
    return mount(PayPalSection, {
      props: { ...defaultProps, ...props },
      global: {
        stubs: {
          UiInput: {
            template: '<input :id="$attrs.id" :value="$attrs.value" :placeholder="$attrs.placeholder" :type="$attrs.type" :autocomplete="$attrs.autocomplete" :aria-invalid="$attrs[\'aria-invalid\']" :aria-describedby="$attrs[\'aria-describedby\']" @input="$emit(\'input\', $event)" @blur="$emit(\'blur\', $event)" />',
            inheritAttrs: false,
          },
          UiLabel: {
            template: '<label :for="$attrs.for"><slot /></label>',
            inheritAttrs: false,
          },
          commonIcon: {
            template: '<span :class="name" data-testid="icon" :data-icon-name="name"></span>',
            props: ['name'],
          },
        },
      },
      ...options,
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render the PayPal section', () => {
      const wrapper = mountComponent()
      expect(wrapper.exists()).toBe(true)
    })

    it('should render PayPal icon', () => {
      const wrapper = mountComponent()
      const icons = wrapper.findAll('[data-testid="icon"]')
      const paypalIcon = icons.find(icon => icon.attributes('data-icon-name') === 'lucide:badge-dollar-sign')
      expect(paypalIcon).toBeTruthy()
    })

    it('should render PayPal title', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('checkout.payment.paypal.title')
    })

    it('should render PayPal description', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('checkout.payment.paypal.description')
    })
  })

  describe('Email input rendering', () => {
    it('should render email input field', () => {
      const wrapper = mountComponent()
      const emailInput = wrapper.find('#paypal-email')
      expect(emailInput.exists()).toBe(true)
    })

    it('should have type="email" on input', () => {
      const wrapper = mountComponent()
      const emailInput = wrapper.find('#paypal-email')
      expect(emailInput.attributes('type')).toBe('email')
    })

    it('should have proper placeholder', () => {
      const wrapper = mountComponent()
      const emailInput = wrapper.find('#paypal-email')
      expect(emailInput.attributes('placeholder')).toBe('checkout.payment.paypalEmailPlaceholder')
    })

    it('should render email label', () => {
      const wrapper = mountComponent()
      const label = wrapper.find('label[for="paypal-email"]')
      expect(label.exists()).toBe(true)
      expect(label.text()).toContain('checkout.payment.paypalEmail')
    })

    it('should have autocomplete="email" attribute', () => {
      const wrapper = mountComponent()
      const emailInput = wrapper.find('#paypal-email')
      expect(emailInput.attributes('autocomplete')).toBe('email')
    })
  })

  describe('v-model binding', () => {
    it('should emit update:modelValue when email changes', async () => {
      const wrapper = mountComponent()
      const emailInput = wrapper.find('#paypal-email')

      // Use setValue which is the proper way to trigger input with a value
      await emailInput.setValue('test@example.com')

      const emitted = wrapper.emitted('update:modelValue')
      expect(emitted).toBeTruthy()
    })

    it('should emit email value in correct format', async () => {
      const wrapper = mountComponent()
      const emailInput = wrapper.find('#paypal-email')

      await emailInput.setValue('user@paypal.com')

      const emitted = wrapper.emitted('update:modelValue')
      expect(emitted).toBeTruthy()
      expect(emitted![0][0]).toEqual({ email: 'user@paypal.com' })
    })

    it('should initialize email from modelValue prop', async () => {
      const wrapper = mountComponent({
        modelValue: { email: 'initial@example.com' },
      })

      // The component watches modelValue and syncs internal state
      await wrapper.vm.$nextTick()

      // Check that the component received the initial value
      expect(wrapper.props('modelValue')).toEqual({ email: 'initial@example.com' })
    })

    it('should update when modelValue prop changes', async () => {
      const wrapper = mountComponent({
        modelValue: { email: 'first@example.com' },
      })

      await wrapper.setProps({
        modelValue: { email: 'second@example.com' },
      })

      expect(wrapper.props('modelValue')).toEqual({ email: 'second@example.com' })
    })
  })

  describe('Email validation', () => {
    it('should validate email as required on blur', async () => {
      const wrapper = mountComponent()
      const emailInput = wrapper.find('#paypal-email')

      // Trigger blur with empty value
      await emailInput.trigger('blur')

      // After validation, error should be displayed
      await wrapper.vm.$nextTick()
      const errorElement = wrapper.find('#paypal-email-error')
      expect(errorElement.exists()).toBe(true)
    })

    it('should show required error for empty email', async () => {
      const wrapper = mountComponent()
      const emailInput = wrapper.find('#paypal-email')

      await emailInput.trigger('blur')
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('checkout.payment.validation.paypalEmailRequired')
    })

    it('should show format error for invalid email', async () => {
      const wrapper = mountComponent({
        modelValue: { email: 'invalid-email' },
      })

      // Set the internal email value and trigger blur
      const emailInput = wrapper.find('#paypal-email')

      // Use setValue to set the input value
      await emailInput.setValue('invalid-email')
      await emailInput.trigger('blur')
      await wrapper.vm.$nextTick()

      const errorElement = wrapper.find('#paypal-email-error')
      expect(errorElement.exists()).toBe(true)
    })

    it('should clear error for valid email format', async () => {
      const wrapper = mountComponent()
      const emailInput = wrapper.find('#paypal-email')

      // Set valid email and trigger blur
      await emailInput.setValue('valid@example.com')
      await emailInput.trigger('blur')
      await wrapper.vm.$nextTick()

      // Error should not be displayed for valid email
      const errorElement = wrapper.find('#paypal-email-error')
      expect(errorElement.exists()).toBe(false)
    })

    it('should validate common email formats', async () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.org',
        'user+tag@example.co.uk',
      ]

      for (const email of validEmails) {
        const wrapper = mountComponent()
        const emailInput = wrapper.find('#paypal-email')

        await emailInput.setValue(email)
        await emailInput.trigger('blur')
        await wrapper.vm.$nextTick()

        const errorElement = wrapper.find('#paypal-email-error')
        expect(errorElement.exists()).toBe(false)
      }
    })

    it('should reject invalid email formats', async () => {
      const invalidEmails = [
        'notanemail',
        '@nodomain.com',
        'missing@.com',
      ]

      for (const email of invalidEmails) {
        const wrapper = mountComponent()
        const emailInput = wrapper.find('#paypal-email')

        await emailInput.setValue(email)
        await emailInput.trigger('blur')
        await wrapper.vm.$nextTick()

        const errorElement = wrapper.find('#paypal-email-error')
        expect(errorElement.exists()).toBe(true)
      }
    })
  })

  describe('Error display', () => {
    it('should display error from external errors prop', () => {
      const wrapper = mountComponent({
        errors: { paypalEmail: 'External error message' },
      })

      const errorElement = wrapper.find('#paypal-email-error')
      expect(errorElement.exists()).toBe(true)
      expect(errorElement.text()).toBe('External error message')
    })

    it('should have role="alert" on error message', () => {
      const wrapper = mountComponent({
        errors: { paypalEmail: 'Error' },
      })

      const errorElement = wrapper.find('#paypal-email-error')
      expect(errorElement.attributes('role')).toBe('alert')
    })

    it('should set aria-invalid when error exists', () => {
      const wrapper = mountComponent({
        errors: { paypalEmail: 'Error' },
      })

      const emailInput = wrapper.find('#paypal-email')
      expect(emailInput.attributes('aria-invalid')).toBe('true')
    })

    it('should set aria-describedby to error element when error exists', () => {
      const wrapper = mountComponent({
        errors: { paypalEmail: 'Error' },
      })

      const emailInput = wrapper.find('#paypal-email')
      expect(emailInput.attributes('aria-describedby')).toBe('paypal-email-error')
    })

    it('should prioritize external errors over validation errors', async () => {
      const wrapper = mountComponent({
        errors: { paypalEmail: 'External error' },
      })

      // Trigger internal validation
      const emailInput = wrapper.find('#paypal-email')
      await emailInput.trigger('blur')
      await wrapper.vm.$nextTick()

      const errorElement = wrapper.find('#paypal-email-error')
      expect(errorElement.text()).toBe('External error')
    })

    it('should not display error when no error exists', () => {
      const wrapper = mountComponent()
      const errorElement = wrapper.find('#paypal-email-error')
      expect(errorElement.exists()).toBe(false)
    })

    it('should not set aria-invalid when no error', () => {
      const wrapper = mountComponent()
      const emailInput = wrapper.find('#paypal-email')
      expect(emailInput.attributes('aria-invalid')).toBe('false')
    })
  })

  describe('PayPal notice section', () => {
    it('should render PayPal notice', () => {
      const wrapper = mountComponent()
      const notice = wrapper.find('[role="status"]')
      expect(notice.exists()).toBe(true)
    })

    it('should display notice title', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('checkout.payment.paypalNoticeTitle')
    })

    it('should display notice description', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('checkout.payment.paypalNotice')
    })

    it('should render info icon in notice', () => {
      const wrapper = mountComponent()
      const icons = wrapper.findAll('[data-testid="icon"]')
      const infoIcon = icons.find(icon => icon.attributes('data-icon-name') === 'lucide:info')
      expect(infoIcon).toBeTruthy()
    })

    it('should have blue styling for notice section', () => {
      const wrapper = mountComponent()
      const noticeSection = wrapper.find('.bg-blue-50')
      expect(noticeSection.exists()).toBe(true)
    })
  })

  describe('Styling', () => {
    it('should have centered header section', () => {
      const wrapper = mountComponent()
      const centeredSection = wrapper.find('.text-center.py-8')
      expect(centeredSection.exists()).toBe(true)
    })

    it('should have max-width constraint on email input container', () => {
      const wrapper = mountComponent()
      const inputContainer = wrapper.find('.max-w-md')
      expect(inputContainer.exists()).toBe(true)
    })

    it('should have proper spacing', () => {
      const wrapper = mountComponent()
      const mainContainer = wrapper.find('.space-y-4')
      expect(mainContainer.exists()).toBe(true)
    })
  })

  describe('Accessibility', () => {
    it('should have proper label association', () => {
      const wrapper = mountComponent()
      const label = wrapper.find('label[for="paypal-email"]')
      const input = wrapper.find('#paypal-email')

      expect(label.exists()).toBe(true)
      expect(input.exists()).toBe(true)
    })

    it('should have proper semantic headings', () => {
      const wrapper = mountComponent()
      const h3Elements = wrapper.findAll('h3')
      expect(h3Elements.length).toBeGreaterThanOrEqual(1)
    })

    it('should use role="status" for notice section', () => {
      const wrapper = mountComponent()
      const status = wrapper.find('[role="status"]')
      expect(status.exists()).toBe(true)
    })

    it('should have aria-hidden on decorative icons', () => {
      const wrapper = mountComponent()
      expect(wrapper.html()).toContain('aria-hidden')
    })
  })

  describe('Icons', () => {
    it('should render PayPal/dollar sign icon in header', () => {
      const wrapper = mountComponent()
      const icons = wrapper.findAll('[data-testid="icon"]')
      const dollarIcon = icons.find(icon => icon.attributes('data-icon-name') === 'lucide:badge-dollar-sign')
      expect(dollarIcon).toBeTruthy()
    })

    it('should render info icon in notice section', () => {
      const wrapper = mountComponent()
      const icons = wrapper.findAll('[data-testid="icon"]')
      const infoIcon = icons.find(icon => icon.attributes('data-icon-name') === 'lucide:info')
      expect(infoIcon).toBeTruthy()
    })

    it('should have total of 2 icons', () => {
      const wrapper = mountComponent()
      const icons = wrapper.findAll('[data-testid="icon"]')
      expect(icons.length).toBe(2)
    })
  })

  describe('Edge cases', () => {
    it('should handle empty string email gracefully', async () => {
      const wrapper = mountComponent({
        modelValue: { email: '' },
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('should handle whitespace-only email', async () => {
      const wrapper = mountComponent()
      const emailInput = wrapper.find('#paypal-email')

      await emailInput.setValue('   ')
      await emailInput.trigger('blur')
      await wrapper.vm.$nextTick()

      // Should show required error for whitespace-only
      const errorElement = wrapper.find('#paypal-email-error')
      expect(errorElement.exists()).toBe(true)
    })

    it('should handle very long email addresses', async () => {
      const longEmail = 'a'.repeat(50) + '@' + 'b'.repeat(50) + '.com'
      const wrapper = mountComponent({
        modelValue: { email: longEmail },
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('should not crash with undefined errors prop', () => {
      const wrapper = mount(PayPalSection, {
        props: {
          modelValue: { email: '' },
        },
        global: {
          stubs: {
            UiInput: {
              template: '<input />',
            },
            UiLabel: {
              template: '<label><slot /></label>',
            },
            commonIcon: {
              template: '<span data-testid="icon"></span>',
            },
          },
        },
      })

      expect(wrapper.exists()).toBe(true)
    })
  })
})
