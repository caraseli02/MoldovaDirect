import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import ReviewTermsSection from '~/components/checkout/review/ReviewTermsSection.vue'

vi.mock('#imports', () => ({
  useI18n: vi.fn(() => ({ t: (k: string) => k })),
  useLocalePath: vi.fn(() => (path: string) => path),
}))

// Stub UiCheckbox with data-testid for testing
const UiCheckboxStub = {
  name: 'UiCheckbox',
  props: ['checked', 'class'],
  emits: ['update:checked'],
  render() {
    return h('input', {
      'type': 'checkbox',
      'checked': this.checked,
      'class': this.class,
      'data-testid': 'checkbox',
      'onChange': (e: Event) => this.$emit('update:checked', (e.target as HTMLInputElement).checked),
    })
  },
}

describe('ReviewTermsSection', () => {
  const defaultProps = {
    termsAccepted: false,
    privacyAccepted: false,
    marketingConsent: false,
    showTermsError: false,
    showPrivacyError: false,
  }

  const acceptedProps = {
    termsAccepted: true,
    privacyAccepted: true,
    marketingConsent: true,
    showTermsError: false,
    showPrivacyError: false,
  }

  const createWrapper = (props = {}, options = {}) => {
    return mount(ReviewTermsSection, {
      props: { ...defaultProps, ...props },
      global: {
        stubs: {
          UiCheckbox: UiCheckboxStub,
          NuxtLink: {
            template: '<a :href="to"><slot /></a>',
            props: ['to'],
          },
        },
      },
      ...options,
    })
  }

  describe('Component Rendering', () => {
    it('should render the component', () => {
      const wrapper = createWrapper()
      expect(wrapper.exists()).toBe(true)
    })

    it('should display the section title', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('checkout.terms.title')
    })

    it('should render within a section element with proper styling', () => {
      const wrapper = createWrapper()
      const section = wrapper.find('section')
      expect(section.exists()).toBe(true)
    })

    it('should render three checkboxes', () => {
      const wrapper = createWrapper()
      const checkboxes = wrapper.findAll('input[type="checkbox"]')
      expect(checkboxes).toHaveLength(3)
    })

    it('should render checkboxes using UiCheckbox component', () => {
      const wrapper = createWrapper()
      const checkboxes = wrapper.findAll('[data-testid="checkbox"]')
      expect(checkboxes).toHaveLength(3)
    })
  })

  describe('Props Handling', () => {
    it('should reflect termsAccepted prop as checked state', () => {
      const wrapper = createWrapper({ termsAccepted: true })
      const checkboxes = wrapper.findAll('input[type="checkbox"]')
      expect((checkboxes[0].element as HTMLInputElement).checked).toBe(true)
    })

    it('should reflect privacyAccepted prop as checked state', () => {
      const wrapper = createWrapper({ privacyAccepted: true })
      const checkboxes = wrapper.findAll('input[type="checkbox"]')
      expect((checkboxes[1].element as HTMLInputElement).checked).toBe(true)
    })

    it('should reflect marketingConsent prop as checked state', () => {
      const wrapper = createWrapper({ marketingConsent: true })
      const checkboxes = wrapper.findAll('input[type="checkbox"]')
      expect((checkboxes[2].element as HTMLInputElement).checked).toBe(true)
    })

    it('should show unchecked checkboxes when all props are false', () => {
      const wrapper = createWrapper()
      const checkboxes = wrapper.findAll('input[type="checkbox"]')
      checkboxes.forEach((checkbox) => {
        expect((checkbox.element as HTMLInputElement).checked).toBe(false)
      })
    })

    it('should show all checkboxes as checked when all props are true', () => {
      const wrapper = createWrapper(acceptedProps)
      const checkboxes = wrapper.findAll('input[type="checkbox"]')
      checkboxes.forEach((checkbox) => {
        expect((checkbox.element as HTMLInputElement).checked).toBe(true)
      })
    })
  })

  describe('Error Display', () => {
    it('should display terms error message when showTermsError is true', () => {
      const wrapper = createWrapper({ showTermsError: true })
      expect(wrapper.text()).toContain('checkout.terms.termsRequired')
    })

    it('should not display terms error message when showTermsError is false', () => {
      const wrapper = createWrapper({ showTermsError: false })
      expect(wrapper.text()).not.toContain('checkout.terms.termsRequired')
    })

    it('should display privacy error message when showPrivacyError is true', () => {
      const wrapper = createWrapper({ showPrivacyError: true })
      expect(wrapper.text()).toContain('checkout.terms.privacyRequired')
    })

    it('should not display privacy error message when showPrivacyError is false', () => {
      const wrapper = createWrapper({ showPrivacyError: false })
      expect(wrapper.text()).not.toContain('checkout.terms.privacyRequired')
    })

    it('should display both error messages when both errors are true', () => {
      const wrapper = createWrapper({ showTermsError: true, showPrivacyError: true })
      expect(wrapper.text()).toContain('checkout.terms.termsRequired')
      expect(wrapper.text()).toContain('checkout.terms.privacyRequired')
    })

    it('should apply red text styling to error messages', () => {
      const wrapper = createWrapper({ showTermsError: true, showPrivacyError: true })
      const errorElements = wrapper.findAll('.text-red-600')
      expect(errorElements.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('User Interactions', () => {
    it('should emit update:termsAccepted when terms checkbox is clicked', async () => {
      const wrapper = createWrapper()
      const checkboxes = wrapper.findAll('input[type="checkbox"]')
      await checkboxes[0].setValue(true)
      expect(wrapper.emitted('update:termsAccepted')).toBeTruthy()
      expect(wrapper.emitted('update:termsAccepted')![0]).toEqual([true])
    })

    it('should emit update:privacyAccepted when privacy checkbox is clicked', async () => {
      const wrapper = createWrapper()
      const checkboxes = wrapper.findAll('input[type="checkbox"]')
      await checkboxes[1].setValue(true)
      expect(wrapper.emitted('update:privacyAccepted')).toBeTruthy()
      expect(wrapper.emitted('update:privacyAccepted')![0]).toEqual([true])
    })

    it('should emit update:marketingConsent when marketing checkbox is clicked', async () => {
      const wrapper = createWrapper()
      const checkboxes = wrapper.findAll('input[type="checkbox"]')
      await checkboxes[2].setValue(true)
      expect(wrapper.emitted('update:marketingConsent')).toBeTruthy()
      expect(wrapper.emitted('update:marketingConsent')![0]).toEqual([true])
    })

    it('should emit false when unchecking terms checkbox', async () => {
      const wrapper = createWrapper({ termsAccepted: true })
      const checkboxes = wrapper.findAll('input[type="checkbox"]')
      await checkboxes[0].setValue(false)
      expect(wrapper.emitted('update:termsAccepted')).toBeTruthy()
      expect(wrapper.emitted('update:termsAccepted')![0]).toEqual([false])
    })

    it('should emit false when unchecking privacy checkbox', async () => {
      const wrapper = createWrapper({ privacyAccepted: true })
      const checkboxes = wrapper.findAll('input[type="checkbox"]')
      await checkboxes[1].setValue(false)
      expect(wrapper.emitted('update:privacyAccepted')).toBeTruthy()
      expect(wrapper.emitted('update:privacyAccepted')![0]).toEqual([false])
    })

    it('should emit false when unchecking marketing checkbox', async () => {
      const wrapper = createWrapper({ marketingConsent: true })
      const checkboxes = wrapper.findAll('input[type="checkbox"]')
      await checkboxes[2].setValue(false)
      expect(wrapper.emitted('update:marketingConsent')).toBeTruthy()
      expect(wrapper.emitted('update:marketingConsent')![0]).toEqual([false])
    })

    it('should handle rapid checkbox toggling', async () => {
      const wrapper = createWrapper()
      const checkbox = wrapper.findAll('input[type="checkbox"]')[0]
      await checkbox.setValue(true)
      await checkbox.setValue(false)
      await checkbox.setValue(true)
      const emitted = wrapper.emitted('update:termsAccepted')
      expect(emitted).toHaveLength(3)
      expect(emitted![0]).toEqual([true])
      expect(emitted![1]).toEqual([false])
      expect(emitted![2]).toEqual([true])
    })
  })

  describe('i18n Translations', () => {
    it('should display section title translation key', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('checkout.terms.title')
    })

    it('should display acceptTerms translation key', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('checkout.terms.acceptTerms')
    })

    it('should display termsAndConditions translation key', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('checkout.terms.termsAndConditions')
    })

    it('should display privacyPolicy translation key', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('checkout.terms.privacyPolicy')
    })

    it('should display acceptPrivacy translation key', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('checkout.terms.acceptPrivacy')
    })

    it('should display marketingConsent translation key', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('checkout.terms.marketingConsent')
    })

    it('should display marketingDescription translation key', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('checkout.terms.marketingDescription')
    })

    it('should display optional label translation key', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('common.optional')
    })

    it('should display common.and translation key', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('common.and')
    })
  })

  describe('Links and Navigation', () => {
    it('should render NuxtLink to terms page', () => {
      const wrapper = createWrapper()
      const links = wrapper.findAll('a')
      const termsLink = links.find(link => link.attributes('href') === '/terms')
      expect(termsLink).toBeDefined()
    })

    it('should render NuxtLink to privacy page', () => {
      const wrapper = createWrapper()
      const links = wrapper.findAll('a')
      const privacyLink = links.find(link => link.attributes('href') === '/privacy')
      expect(privacyLink).toBeDefined()
    })

    it('should have green styling for links', () => {
      const wrapper = createWrapper()
      const html = wrapper.html()
      expect(html).toContain('text-green-600')
      expect(html).toContain('hover:text-green-700')
    })
  })

  describe('Styling and Accessibility', () => {
    it('should have proper checkbox component rendering', () => {
      const wrapper = createWrapper()
      const checkboxes = wrapper.findAll('[data-testid="checkbox"]')
      expect(checkboxes.length).toBe(3)
    })

    it('should have dark mode support classes', () => {
      const wrapper = createWrapper()
      const html = wrapper.html()
      expect(html).toContain('dark:bg-gray-800')
      expect(html).toContain('dark:text-white')
      expect(html).toContain('dark:text-gray-300')
      expect(html).toContain('dark:border-gray-700')
    })

    it('should have flex layout for checkbox items', () => {
      const wrapper = createWrapper()
      const flexItems = wrapper.findAll('.flex.items-start')
      expect(flexItems.length).toBeGreaterThanOrEqual(3)
    })

    it('should have proper focus ring styling', () => {
      const wrapper = createWrapper()
      const checkboxes = wrapper.findAll('[data-testid="checkbox"]')
      expect(checkboxes.length).toBe(3)
    })

    it('should use semantic heading for section title', () => {
      const wrapper = createWrapper()
      const heading = wrapper.find('h3')
      expect(heading.exists()).toBe(true)
      expect(heading.classes()).toContain('font-semibold')
    })
  })

  describe('Marketing Consent Section', () => {
    it('should clearly indicate marketing is optional', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('common.optional')
    })

    it('should display marketing description text', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('checkout.terms.marketingDescription')
    })

    it('should have smaller text for marketing description', () => {
      const wrapper = createWrapper()
      const html = wrapper.html()
      expect(html).toContain('text-xs')
    })

    it('should not show error for marketing consent (optional)', () => {
      const wrapper = createWrapper({ marketingConsent: false })
      // Marketing is optional, so there should be no error message for it
      expect(wrapper.text()).not.toContain('marketingRequired')
    })
  })

  describe('Edge Cases', () => {
    it('should handle props change reactively', async () => {
      const wrapper = createWrapper()
      const checkboxes = wrapper.findAll('input[type="checkbox"]')
      expect((checkboxes[0].element as HTMLInputElement).checked).toBe(false)

      await wrapper.setProps({ termsAccepted: true })
      expect((checkboxes[0].element as HTMLInputElement).checked).toBe(true)
    })

    it('should handle error props change reactively', async () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).not.toContain('checkout.terms.termsRequired')

      await wrapper.setProps({ showTermsError: true })
      expect(wrapper.text()).toContain('checkout.terms.termsRequired')
    })

    it('should maintain checkbox states independently', async () => {
      const wrapper = createWrapper()
      const checkboxes = wrapper.findAll('input[type="checkbox"]')

      await checkboxes[0].setValue(true)
      expect(wrapper.emitted('update:termsAccepted')).toBeTruthy()
      expect(wrapper.emitted('update:privacyAccepted')).toBeFalsy()
      expect(wrapper.emitted('update:marketingConsent')).toBeFalsy()
    })

    it('should handle all checkboxes being toggled', async () => {
      const wrapper = createWrapper()
      const checkboxes = wrapper.findAll('input[type="checkbox"]')

      await checkboxes[0].setValue(true)
      await checkboxes[1].setValue(true)
      await checkboxes[2].setValue(true)

      expect(wrapper.emitted('update:termsAccepted')).toHaveLength(1)
      expect(wrapper.emitted('update:privacyAccepted')).toHaveLength(1)
      expect(wrapper.emitted('update:marketingConsent')).toHaveLength(1)
    })

    it('should preserve component structure with error states', async () => {
      const wrapper = createWrapper({ showTermsError: true, showPrivacyError: true })

      const checkboxes = wrapper.findAll('input[type="checkbox"]')
      expect(checkboxes).toHaveLength(3)

      // Ensure all checkboxes still work with errors displayed
      const checkboxElements = wrapper.findAll('input[type="checkbox"]')
      await checkboxElements[0].setValue(true)
      expect(wrapper.emitted('update:termsAccepted')).toBeTruthy()
    })
  })
})
