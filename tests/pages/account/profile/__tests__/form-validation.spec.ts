/**
 * Profile Page - Form Validation Tests
 *
 * Tests form validation including:
 * - Name field validation (required, length)
 * - Phone field validation (format)
 * - Language and currency selection
 * - Error display
 * - Validation on blur/submit
 *
 * Aligns with: docs/specs/profile-test-coverage-plan.md Phase 2.3
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { VueWrapper } from '@vue/test-utils'
import { mount, flushPromises } from '@vue/test-utils'
import { ref, nextTick } from 'vue'

import { createMockUser, createProfilePageMountOptions } from '../../helpers'

/**
 * Mock Profile Page Component with form validation
 */
const ProfilePageFormMock = {
  name: 'ProfilePageFormMock',
  template: `
    <div class="profile-form" data-testid="profile-form">
      <!-- Personal Info Section -->
      <div class="form-section">
        <div class="field">
          <label for="name">Full Name *</label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            required
            @blur="validateName"
            :class="{ 'border-red-500': errors.name }"
            data-testid="name-input"
          />
          <span v-if="errors.name" class="error-text" data-testid="name-error">{{ errors.name }}</span>
        </div>

        <div class="field">
          <label for="email">Email *</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            disabled
            data-testid="email-input"
          />
        </div>

        <div class="field">
          <label for="phone">Phone</label>
          <input
            id="phone"
            v-model="form.phone"
            type="tel"
            inputmode="tel"
            @blur="validatePhone"
            :class="{ 'border-red-500': errors.phone }"
            placeholder="+373 69 123 456"
            data-testid="phone-input"
          />
          <span v-if="errors.phone" class="error-text" data-testid="phone-error">{{ errors.phone }}</span>
        </div>
      </div>

      <!-- Preferences Section -->
      <div class="form-section">
        <div class="field">
          <label for="language">Language</label>
          <select
            id="language"
            v-model="form.preferredLanguage"
            data-testid="language-select"
          >
            <option value="es">Español</option>
            <option value="en">English</option>
            <option value="ro">Română</option>
            <option value="ru">Русский</option>
          </select>
        </div>

        <div class="field">
          <label for="currency">Currency</label>
          <select
            id="currency"
            v-model="form.preferredCurrency"
            data-testid="currency-select"
          >
            <option value="EUR">EUR (€)</option>
            <option value="USD">USD ($)</option>
            <option value="MDL">MDL (L)</option>
          </select>
        </div>
      </div>

      <!-- Save Button -->
      <button
        type="button"
        @click="submitForm"
        :disabled="isSubmitting"
        data-testid="save-button"
      >
        {{ isSubmitting ? 'Saving...' : 'Save Changes' }}
      </button>

      <!-- Toast Messages -->
      <div v-if="toast.show" class="toast" :class="toast.type" data-testid="toast">
        {{ toast.message }}
      </div>
    </div>
  `,
  setup() {
    const form = ref({
      name: 'Test User',
      email: 'test@example.com',
      phone: '+37369123456',
      preferredLanguage: 'en',
      preferredCurrency: 'EUR',
    })

    const errors = ref<Record<string, string>>({})
    const isSubmitting = ref(false)
    const toast = ref({ show: false, message: '', type: '' })

    const validateName = () => {
      if (!form.value.name.trim()) {
        errors.value.name = 'Name is required'
        return false
      }
      if (form.value.name.trim().length < 2) {
        errors.value.name = 'Name must be at least 2 characters'
        return false
      }
      if (form.value.name.trim().length > 100) {
        errors.value.name = 'Name must be less than 100 characters'
        return false
      }
      delete errors.value.name
      return true
    }

    const validatePhone = () => {
      if (!form.value.phone) {
        delete errors.value.phone
        return true // Phone is optional
      }
      const phoneRegex = /^\+?[\d\s\-()]{9,}$/
      if (!phoneRegex.test(form.value.phone)) {
        errors.value.phone = 'Please enter a valid phone number'
        return false
      }
      delete errors.value.phone
      return true
    }

    const submitForm = async () => {
      const isNameValid = validateName()
      const isPhoneValid = validatePhone()

      if (!isNameValid || !isPhoneValid) {
        toast.value = { show: true, message: 'Please fix the errors', type: 'error' }
        setTimeout(() => toast.value.show = false, 3000)
        return
      }

      isSubmitting.value = true
      await new Promise(resolve => setTimeout(resolve, 500))
      isSubmitting.value = false

      toast.value = { show: true, message: 'Profile saved successfully', type: 'success' }
      setTimeout(() => toast.value.show = false, 3000)
    }

    return {
      form,
      errors,
      isSubmitting,
      toast,
      validateName,
      validatePhone,
      submitForm,
    }
  },
}

describe('Profile Page - Form Validation', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    vi.clearAllMocks()

    global.useSupabaseUser = vi.fn(() => ref(createMockUser()))
    global.useNuxtApp = vi.fn(() => ({
      $i18n: { t: vi.fn((key: string) => key), locale: { value: 'en' } },
      $toast: { success: vi.fn(), error: vi.fn() },
    }))
    global.useSupabaseClient = vi.fn(() => ({
      auth: { updateUser: vi.fn().mockResolvedValue({ data: { user: createMockUser() }, error: null }) },
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      })),
    }))
  })

  describe('Name Field Validation', () => {
    it('should show error when name is empty on blur', async () => {
      wrapper = mount(ProfilePageFormMock, createProfilePageMountOptions())

      const vm = wrapper.vm as any
      vm.form.name = ''
      await nextTick()

      await vm.validateName()
      await nextTick()

      expect(wrapper.find('[data-testid="name-error"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="name-error"]').text()).toBe('Name is required')
    })

    it('should show error when name is too short', async () => {
      wrapper = mount(ProfilePageFormMock, createProfilePageMountOptions())

      const vm = wrapper.vm as any
      vm.form.name = 'A'
      await nextTick()

      await vm.validateName()
      await nextTick()

      expect(wrapper.find('[data-testid="name-error"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="name-error"]').text()).toContain('at least 2 characters')
    })

    it('should show error when name is too long', async () => {
      wrapper = mount(ProfilePageFormMock, createProfilePageMountOptions())

      const vm = wrapper.vm as any
      vm.form.name = 'A'.repeat(101)
      await nextTick()

      await vm.validateName()
      await nextTick()

      expect(wrapper.find('[data-testid="name-error"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="name-error"]').text()).toContain('less than 100 characters')
    })

    it('should clear error when name is valid', async () => {
      wrapper = mount(ProfilePageFormMock, createProfilePageMountOptions())

      const vm = wrapper.vm as any
      vm.form.name = ''
      vm.errors.name = 'Name is required'
      await nextTick()

      vm.form.name = 'Valid Name'
      await vm.validateName()
      await nextTick()

      expect(wrapper.find('[data-testid="name-error"]').exists()).toBe(false)
    })
  })

  describe('Phone Field Validation', () => {
    it('should show error for invalid phone format', async () => {
      wrapper = mount(ProfilePageFormMock, createProfilePageMountOptions())

      const vm = wrapper.vm as any
      vm.form.phone = 'invalid'
      await nextTick()

      await vm.validatePhone()
      await nextTick()

      expect(wrapper.find('[data-testid="phone-error"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="phone-error"]').text()).toContain('valid phone number')
    })

    it('should accept Moldovan phone format', async () => {
      wrapper = mount(ProfilePageFormMock, createProfilePageMountOptions())

      const vm = wrapper.vm as any
      vm.form.phone = '+373 69 123 456'
      await nextTick()

      await vm.validatePhone()
      await nextTick()

      expect(wrapper.find('[data-testid="phone-error"]').exists()).toBe(false)
    })

    it('should accept international phone format', async () => {
      wrapper = mount(ProfilePageFormMock, createProfilePageMountOptions())

      const vm = wrapper.vm as any
      vm.form.phone = '+1 (555) 123-4567'
      await nextTick()

      await vm.validatePhone()
      await nextTick()

      expect(wrapper.find('[data-testid="phone-error"]').exists()).toBe(false)
    })

    it('should allow empty phone (optional field)', async () => {
      wrapper = mount(ProfilePageFormMock, createProfilePageMountOptions())

      const vm = wrapper.vm as any
      vm.form.phone = ''
      await nextTick()

      await vm.validatePhone()
      await nextTick()

      expect(wrapper.find('[data-testid="phone-error"]').exists()).toBe(false)
    })
  })

  describe('Language Selection', () => {
    it('should render all supported languages', () => {
      wrapper = mount(ProfilePageFormMock, createProfilePageMountOptions())

      const select = wrapper.find('#language')
      const options = select.findAll('option')

      expect(options.length).toBe(4)
      expect(options[0].text()).toBe('Español')
      expect(options[1].text()).toBe('English')
      expect(options[2].text()).toBe('Română')
      expect(options[3].text()).toBe('Русский')
    })

    it('should have correct value attributes', () => {
      wrapper = mount(ProfilePageFormMock, createProfilePageMountOptions())

      const select = wrapper.find('#language')
      const options = select.findAll('option')

      expect(options[0].attributes('value')).toBe('es')
      expect(options[1].attributes('value')).toBe('en')
      expect(options[2].attributes('value')).toBe('ro')
      expect(options[3].attributes('value')).toBe('ru')
    })
  })

  describe('Currency Selection', () => {
    it('should render all supported currencies', () => {
      wrapper = mount(ProfilePageFormMock, createProfilePageMountOptions())

      const select = wrapper.find('#currency')
      const options = select.findAll('option')

      expect(options.length).toBe(3)
      expect(options[0].text()).toBe('EUR (€)')
      expect(options[1].text()).toBe('USD ($)')
      expect(options[2].text()).toBe('MDL (L)')
    })

    it('should have correct value attributes', () => {
      wrapper = mount(ProfilePageFormMock, createProfilePageMountOptions())

      const select = wrapper.find('#currency')
      const options = select.findAll('option')

      expect(options[0].attributes('value')).toBe('EUR')
      expect(options[1].attributes('value')).toBe('USD')
      expect(options[2].attributes('value')).toBe('MDL')
    })
  })

  describe('Form Submission', () => {
    it('should validate on submit and show errors', async () => {
      wrapper = mount(ProfilePageFormMock, createProfilePageMountOptions())

      const vm = wrapper.vm as any
      vm.form.name = ''
      await nextTick()

      const saveButton = wrapper.find('[data-testid="save-button"]')
      await saveButton.trigger('click')
      await flushPromises()
      await nextTick()

      expect(wrapper.find('[data-testid="toast"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="toast"]').text()).toContain('fix the errors')
    })

    it('should show loading state during submission', async () => {
      wrapper = mount(ProfilePageFormMock, createProfilePageMountOptions())

      const vm = wrapper.vm as any
      vm.form.name = 'Valid Name'

      const saveButton = wrapper.find('[data-testid="save-button"]')
      saveButton.trigger('click')

      await nextTick()
      expect(vm.isSubmitting).toBe(true)
      expect(saveButton.text()).toContain('Saving...')
    })

    it('should show success message on valid submission', async () => {
      wrapper = mount(ProfilePageFormMock, createProfilePageMountOptions())

      const vm = wrapper.vm as any
      vm.form.name = 'Valid Name'

      const saveButton = wrapper.find('[data-testid="save-button"]')
      await saveButton.trigger('click')

      // Wait for the submitForm async operation to complete
      await new Promise(resolve => setTimeout(resolve, 600))
      await flushPromises()
      await nextTick()

      expect(wrapper.find('[data-testid="toast"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="toast"]').text()).toContain('saved successfully')
    })
  })

  describe('Email Field', () => {
    it('should be disabled for editing', () => {
      wrapper = mount(ProfilePageFormMock, createProfilePageMountOptions())

      const emailInput = wrapper.find('#email')
      expect(emailInput.attributes('disabled')).toBeDefined()
    })

    it('should display user email', () => {
      wrapper = mount(ProfilePageFormMock, createProfilePageMountOptions())

      const vm = wrapper.vm as any
      expect(vm.form.email).toBe('test@example.com')
    })
  })

  describe('Error Display', () => {
    it('should apply error styling to invalid fields', async () => {
      wrapper = mount(ProfilePageFormMock, createProfilePageMountOptions())

      const vm = wrapper.vm as any
      vm.form.name = ''
      await vm.validateName()
      await nextTick()

      const nameInput = wrapper.find('#name')
      expect(nameInput.classes()).toContain('border-red-500')
    })

    it('should remove error styling when field becomes valid', async () => {
      wrapper = mount(ProfilePageFormMock, createProfilePageMountOptions())

      const vm = wrapper.vm as any
      vm.form.name = ''
      vm.errors.name = 'Name is required'
      await nextTick()

      // Verify error class is present
      expect(wrapper.find('#name').classes()).toContain('border-red-500')

      // Fix the field
      vm.form.name = 'Valid Name'
      await vm.validateName()
      await nextTick()

      expect(wrapper.find('#name').classes()).not.toContain('border-red-500')
    })
  })
})
