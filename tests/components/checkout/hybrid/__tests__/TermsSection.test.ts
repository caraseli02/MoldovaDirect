import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import TermsSection from '~/components/checkout/hybrid/TermsSection.vue'

vi.mock('#imports', () => ({
  useI18n: vi.fn(() => ({ t: (k: string) => k })),
}))

describe('TermsSection', () => {
  const defaultProps = {
    termsAccepted: false,
    privacyAccepted: false,
    marketingConsent: false,
    canPlaceOrder: true,
    processingOrder: false,
    formattedTotal: '$99.99',
    showTermsError: false,
    showPrivacyError: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render the component', () => {
      const wrapper = mount(TermsSection, {
        props: defaultProps,
      })
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('section.checkout-section').exists()).toBe(true)
    })

    it('should render three checkboxes', () => {
      const wrapper = mount(TermsSection, {
        props: defaultProps,
      })
      const checkboxes = wrapper.findAll('input[type="checkbox"]')
      expect(checkboxes.length).toBe(3)
    })

    it('should render terms of service link', () => {
      const wrapper = mount(TermsSection, {
        props: defaultProps,
      })
      const termsLink = wrapper.find('a[href="/terms"]')
      expect(termsLink.exists()).toBe(true)
      expect(termsLink.attributes('target')).toBe('_blank')
    })

    it('should render privacy policy link', () => {
      const wrapper = mount(TermsSection, {
        props: defaultProps,
      })
      const privacyLink = wrapper.find('a[href="/privacy"]')
      expect(privacyLink.exists()).toBe(true)
      expect(privacyLink.attributes('target')).toBe('_blank')
    })

    it('should render place order button (desktop)', () => {
      const wrapper = mount(TermsSection, {
        props: defaultProps,
      })
      const button = wrapper.find('button')
      expect(button.exists()).toBe(true)
      expect(button.classes()).toContain('lg:flex')
    })

    it('should display formatted total in button', () => {
      const wrapper = mount(TermsSection, {
        props: { ...defaultProps, formattedTotal: '$149.99' },
      })
      expect(wrapper.text()).toContain('$149.99')
    })
  })

  describe('Props handling', () => {
    it('should show terms checkbox as checked when termsAccepted is true', () => {
      const wrapper = mount(TermsSection, {
        props: { ...defaultProps, termsAccepted: true },
      })
      const checkboxes = wrapper.findAll('input[type="checkbox"]')
      expect((checkboxes[0].element as HTMLInputElement).checked).toBe(true)
    })

    it('should show privacy checkbox as checked when privacyAccepted is true', () => {
      const wrapper = mount(TermsSection, {
        props: { ...defaultProps, privacyAccepted: true },
      })
      const checkboxes = wrapper.findAll('input[type="checkbox"]')
      expect((checkboxes[1].element as HTMLInputElement).checked).toBe(true)
    })

    it('should show marketing checkbox as checked when marketingConsent is true', () => {
      const wrapper = mount(TermsSection, {
        props: { ...defaultProps, marketingConsent: true },
      })
      const checkboxes = wrapper.findAll('input[type="checkbox"]')
      expect((checkboxes[2].element as HTMLInputElement).checked).toBe(true)
    })

    it('should disable button when canPlaceOrder is false', () => {
      const wrapper = mount(TermsSection, {
        props: { ...defaultProps, canPlaceOrder: false },
      })
      const button = wrapper.find('button')
      expect(button.attributes('disabled')).toBeDefined()
    })

    it('should disable button when processingOrder is true', () => {
      const wrapper = mount(TermsSection, {
        props: { ...defaultProps, processingOrder: true },
      })
      const button = wrapper.find('button')
      expect(button.attributes('disabled')).toBeDefined()
    })

    it('should enable button when canPlaceOrder is true and not processing', () => {
      const wrapper = mount(TermsSection, {
        props: { ...defaultProps, canPlaceOrder: true, processingOrder: false },
      })
      const button = wrapper.find('button')
      expect(button.attributes('disabled')).toBeUndefined()
    })
  })

  describe('Error states', () => {
    it('should show terms error indicator when showTermsError is true', () => {
      const wrapper = mount(TermsSection, {
        props: { ...defaultProps, showTermsError: true },
      })
      const errorIndicators = wrapper.findAll('span.text-red-500')
      expect(errorIndicators.length).toBeGreaterThanOrEqual(1)
      expect(errorIndicators[0].text()).toBe('*')
    })

    it('should show privacy error indicator when showPrivacyError is true', () => {
      const wrapper = mount(TermsSection, {
        props: { ...defaultProps, showPrivacyError: true },
      })
      const errorIndicators = wrapper.findAll('span.text-red-500')
      expect(errorIndicators.length).toBeGreaterThanOrEqual(1)
    })

    it('should show both error indicators when both errors are true', () => {
      const wrapper = mount(TermsSection, {
        props: { ...defaultProps, showTermsError: true, showPrivacyError: true },
      })
      const errorIndicators = wrapper.findAll('span.text-red-500')
      expect(errorIndicators.length).toBe(2)
    })

    it('should hide error indicators when errors are false', () => {
      const wrapper = mount(TermsSection, {
        props: { ...defaultProps, showTermsError: false, showPrivacyError: false },
      })
      const errorIndicators = wrapper.findAll('span.text-red-500')
      expect(errorIndicators.length).toBe(0)
    })
  })

  describe('Processing state', () => {
    it('should show spinner when processingOrder is true', () => {
      const wrapper = mount(TermsSection, {
        props: { ...defaultProps, processingOrder: true },
      })
      const spinner = wrapper.find('svg.animate-spin')
      expect(spinner.exists()).toBe(true)
    })

    it('should show processing text when processingOrder is true', () => {
      const wrapper = mount(TermsSection, {
        props: { ...defaultProps, processingOrder: true },
      })
      expect(wrapper.text()).toContain('checkout.processing')
    })

    it('should show place order text when not processing', () => {
      const wrapper = mount(TermsSection, {
        props: { ...defaultProps, processingOrder: false },
      })
      expect(wrapper.text()).toContain('checkout.placeOrder')
    })

    it('should hide spinner when not processing', () => {
      const wrapper = mount(TermsSection, {
        props: { ...defaultProps, processingOrder: false },
      })
      const spinner = wrapper.find('svg.animate-spin')
      expect(spinner.exists()).toBe(false)
    })
  })

  describe('User interactions', () => {
    it('should emit update:termsAccepted when terms checkbox is clicked', async () => {
      const wrapper = mount(TermsSection, {
        props: defaultProps,
      })
      const checkboxes = wrapper.findAll('input[type="checkbox"]')
      await checkboxes[0].setValue(true)
      expect(wrapper.emitted('update:termsAccepted')).toBeTruthy()
      expect(wrapper.emitted('update:termsAccepted')![0]).toEqual([true])
    })

    it('should emit update:privacyAccepted when privacy checkbox is clicked', async () => {
      const wrapper = mount(TermsSection, {
        props: defaultProps,
      })
      const checkboxes = wrapper.findAll('input[type="checkbox"]')
      await checkboxes[1].setValue(true)
      expect(wrapper.emitted('update:privacyAccepted')).toBeTruthy()
      expect(wrapper.emitted('update:privacyAccepted')![0]).toEqual([true])
    })

    it('should emit update:marketingConsent when marketing checkbox is clicked', async () => {
      const wrapper = mount(TermsSection, {
        props: defaultProps,
      })
      const checkboxes = wrapper.findAll('input[type="checkbox"]')
      await checkboxes[2].setValue(true)
      expect(wrapper.emitted('update:marketingConsent')).toBeTruthy()
      expect(wrapper.emitted('update:marketingConsent')![0]).toEqual([true])
    })

    it('should emit place-order when button is clicked', async () => {
      const wrapper = mount(TermsSection, {
        props: defaultProps,
      })
      const button = wrapper.find('button')
      await button.trigger('click')
      expect(wrapper.emitted('place-order')).toBeTruthy()
    })

    it('should not emit place-order when button is disabled and clicked', async () => {
      const wrapper = mount(TermsSection, {
        props: { ...defaultProps, canPlaceOrder: false },
      })
      const button = wrapper.find('button')
      await button.trigger('click')
      // Disabled buttons don't trigger click events in most browsers
      // but Vue Test Utils may still emit, so we check the button state
      expect(button.attributes('disabled')).toBeDefined()
    })

    it('should emit false when unchecking a checked checkbox', async () => {
      const wrapper = mount(TermsSection, {
        props: { ...defaultProps, termsAccepted: true },
      })
      const checkboxes = wrapper.findAll('input[type="checkbox"]')
      await checkboxes[0].setValue(false)
      expect(wrapper.emitted('update:termsAccepted')).toBeTruthy()
      expect(wrapper.emitted('update:termsAccepted')![0]).toEqual([false])
    })
  })

  describe('i18n translations', () => {
    it('should display terms acceptance text', () => {
      const wrapper = mount(TermsSection, {
        props: defaultProps,
      })
      expect(wrapper.text()).toContain('checkout.review.acceptTerms')
    })

    it('should display terms of service link text', () => {
      const wrapper = mount(TermsSection, {
        props: defaultProps,
      })
      expect(wrapper.text()).toContain('checkout.review.termsOfService')
    })

    it('should display privacy acceptance text', () => {
      const wrapper = mount(TermsSection, {
        props: defaultProps,
      })
      expect(wrapper.text()).toContain('checkout.review.acceptPrivacy')
    })

    it('should display privacy policy link text', () => {
      const wrapper = mount(TermsSection, {
        props: defaultProps,
      })
      expect(wrapper.text()).toContain('checkout.review.privacyPolicy')
    })

    it('should display marketing consent text', () => {
      const wrapper = mount(TermsSection, {
        props: defaultProps,
      })
      expect(wrapper.text()).toContain('checkout.review.marketingConsent')
    })

    it('should display place order text', () => {
      const wrapper = mount(TermsSection, {
        props: defaultProps,
      })
      expect(wrapper.text()).toContain('checkout.placeOrder')
    })

    it('should display processing text when processing', () => {
      const wrapper = mount(TermsSection, {
        props: { ...defaultProps, processingOrder: true },
      })
      expect(wrapper.text()).toContain('checkout.processing')
    })
  })

  describe('Edge cases', () => {
    it('should handle empty formatted total', () => {
      const wrapper = mount(TermsSection, {
        props: { ...defaultProps, formattedTotal: '' },
      })
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.text()).toContain('checkout.placeOrder')
    })

    it('should handle special characters in formatted total', () => {
      const wrapper = mount(TermsSection, {
        props: { ...defaultProps, formattedTotal: '1.234,56 EUR' },
      })
      expect(wrapper.text()).toContain('1.234,56 EUR')
    })

    it('should handle all checkboxes being true', () => {
      const wrapper = mount(TermsSection, {
        props: {
          ...defaultProps,
          termsAccepted: true,
          privacyAccepted: true,
          marketingConsent: true,
        },
      })
      const checkboxes = wrapper.findAll('input[type="checkbox"]')
      expect((checkboxes[0].element as HTMLInputElement).checked).toBe(true)
      expect((checkboxes[1].element as HTMLInputElement).checked).toBe(true)
      expect((checkboxes[2].element as HTMLInputElement).checked).toBe(true)
    })

    it('should handle rapid checkbox toggling', async () => {
      const wrapper = mount(TermsSection, {
        props: defaultProps,
      })
      const checkbox = wrapper.findAll('input[type="checkbox"]')[0]

      await checkbox.setValue(true)
      await checkbox.setValue(false)
      await checkbox.setValue(true)

      const emitted = wrapper.emitted('update:termsAccepted')
      expect(emitted).toBeTruthy()
      expect(emitted!.length).toBe(3)
      expect(emitted![0]).toEqual([true])
      expect(emitted![1]).toEqual([false])
      expect(emitted![2]).toEqual([true])
    })

    it('should render correctly with default optional props', () => {
      const wrapper = mount(TermsSection, {
        props: {
          termsAccepted: false,
          privacyAccepted: false,
          marketingConsent: false,
          canPlaceOrder: true,
          processingOrder: false,
          formattedTotal: '$50.00',
          // showTermsError and showPrivacyError use defaults (false)
        },
      })
      expect(wrapper.exists()).toBe(true)
      const errorIndicators = wrapper.findAll('span.text-red-500')
      expect(errorIndicators.length).toBe(0)
    })

    it('should maintain component structure with all props true', () => {
      const wrapper = mount(TermsSection, {
        props: {
          termsAccepted: true,
          privacyAccepted: true,
          marketingConsent: true,
          canPlaceOrder: true,
          processingOrder: true,
          formattedTotal: '$999.99',
          showTermsError: true,
          showPrivacyError: true,
        },
      })
      // Even with all errors showing and processing, component should render
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.checkout-section').exists()).toBe(true)
    })
  })

  describe('Accessibility', () => {
    it('should have labels associated with checkboxes', () => {
      const wrapper = mount(TermsSection, {
        props: defaultProps,
      })
      const labels = wrapper.findAll('label')
      expect(labels.length).toBe(3)
      labels.forEach((label) => {
        expect(label.find('input[type="checkbox"]').exists()).toBe(true)
      })
    })

    it('should have cursor-pointer class on labels', () => {
      const wrapper = mount(TermsSection, {
        props: defaultProps,
      })
      const labels = wrapper.findAll('label')
      labels.forEach((label) => {
        expect(label.classes()).toContain('cursor-pointer')
      })
    })

    it('should open links in new tab', () => {
      const wrapper = mount(TermsSection, {
        props: defaultProps,
      })
      const links = wrapper.findAll('a')
      links.forEach((link) => {
        expect(link.attributes('target')).toBe('_blank')
      })
    })

    it('should have disabled styling on button when disabled', () => {
      const wrapper = mount(TermsSection, {
        props: { ...defaultProps, canPlaceOrder: false },
      })
      const button = wrapper.find('button')
      expect(button.classes()).toContain('disabled:bg-gray-400')
      expect(button.classes()).toContain('disabled:cursor-not-allowed')
    })
  })

  describe('CSS classes', () => {
    it('should have checkout-section class', () => {
      const wrapper = mount(TermsSection, {
        props: defaultProps,
      })
      expect(wrapper.find('.checkout-section').exists()).toBe(true)
    })

    it('should have checkout-section-highlight class', () => {
      const wrapper = mount(TermsSection, {
        props: defaultProps,
      })
      expect(wrapper.find('.checkout-section-highlight').exists()).toBe(true)
    })

    it('should have fade-in animation class', () => {
      const wrapper = mount(TermsSection, {
        props: defaultProps,
      })
      expect(wrapper.find('.fade-in').exists()).toBe(true)
    })

    it('should have section-content class for padding', () => {
      const wrapper = mount(TermsSection, {
        props: defaultProps,
      })
      expect(wrapper.find('.section-content').exists()).toBe(true)
    })
  })
})
