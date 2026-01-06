import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import TrustBadges from '~/components/checkout/TrustBadges.vue'

// Default support email fallback used by the component
const DEFAULT_SUPPORT_EMAIL = 'support@moldovadirect.com'

vi.mock('#imports', () => ({
  useI18n: vi.fn(() => ({
    t: (k: string) => k,
    locale: { value: 'en' },
  })),
  useRuntimeConfig: vi.fn(() => ({
    public: {
      supportEmail: '', // Empty to trigger fallback
    },
  })),
  computed: (fn: () => unknown) => ({ value: fn() }),
}))

describe('TrustBadges', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const createWrapper = (props: { variant?: 'compact' | 'full' } = {}) => {
    return mount(TrustBadges, {
      props,
    })
  }

  describe('Rendering', () => {
    it('should render the trust badges component', () => {
      const wrapper = createWrapper()
      expect(wrapper.exists()).toBe(true)
    })

    it('should render with trust-badges class', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.trust-badges').exists()).toBe(true)
    })

    it('should default to full variant when no prop provided', () => {
      const wrapper = createWrapper()
      // Full variant has the bg-gray-50 container
      expect(wrapper.find('.bg-gray-50').exists()).toBe(true)
    })
  })

  describe('Compact Variant', () => {
    it('should render compact variant when specified', () => {
      const wrapper = createWrapper({ variant: 'compact' })
      // Compact variant has flex layout with gap-4
      const compactContainer = wrapper.find('.flex.items-center.gap-4')
      expect(compactContainer.exists()).toBe(true)
    })

    it('should display secure checkout text in compact mode', () => {
      const wrapper = createWrapper({ variant: 'compact' })
      expect(wrapper.text()).toContain('checkout.trust.secureCheckout')
    })

    it('should display SSL encrypted text in compact mode', () => {
      const wrapper = createWrapper({ variant: 'compact' })
      expect(wrapper.text()).toContain('checkout.trust.sslEncrypted')
    })

    it('should render two trust indicators in compact mode', () => {
      const wrapper = createWrapper({ variant: 'compact' })
      const indicators = wrapper.findAll('.flex.items-center.gap-1\\.5')
      expect(indicators.length).toBe(2)
    })

    it('should have green colored icons in compact mode', () => {
      const wrapper = createWrapper({ variant: 'compact' })
      const greenIcons = wrapper.findAll('.text-green-600')
      expect(greenIcons.length).toBe(2)
    })

    it('should have small text styling in compact mode', () => {
      const wrapper = createWrapper({ variant: 'compact' })
      const compactContainer = wrapper.find('.text-sm')
      expect(compactContainer.exists()).toBe(true)
    })

    it('should not show the full trust items list in compact mode', () => {
      const wrapper = createWrapper({ variant: 'compact' })
      expect(wrapper.find('ul').exists()).toBe(false)
    })

    it('should not show customer service section in compact mode', () => {
      const wrapper = createWrapper({ variant: 'compact' })
      expect(wrapper.text()).not.toContain('checkout.trust.needHelp')
    })
  })

  describe('Full Variant', () => {
    it('should render full variant when specified', () => {
      const wrapper = createWrapper({ variant: 'full' })
      expect(wrapper.find('.bg-gray-50').exists()).toBe(true)
    })

    it('should have rounded container in full mode', () => {
      const wrapper = createWrapper({ variant: 'full' })
      expect(wrapper.find('.rounded-lg').exists()).toBe(true)
    })

    it('should have border in full mode', () => {
      const wrapper = createWrapper({ variant: 'full' })
      expect(wrapper.find('.border').exists()).toBe(true)
    })

    it('should have padding in full mode', () => {
      const wrapper = createWrapper({ variant: 'full' })
      expect(wrapper.find('.p-4').exists()).toBe(true)
    })

    it('should display secure checkout title in full mode', () => {
      const wrapper = createWrapper({ variant: 'full' })
      expect(wrapper.text()).toContain('checkout.trust.secureCheckout')
    })

    it('should display trust items list in full mode', () => {
      const wrapper = createWrapper({ variant: 'full' })
      const list = wrapper.find('ul')
      expect(list.exists()).toBe(true)
    })

    it('should display all three trust items', () => {
      const wrapper = createWrapper({ variant: 'full' })
      expect(wrapper.text()).toContain('checkout.trust.sslEncrypted')
      expect(wrapper.text()).toContain('checkout.trust.dataProtected')
      expect(wrapper.text()).toContain('checkout.trust.moneyBackGuarantee')
    })

    it('should render three list items', () => {
      const wrapper = createWrapper({ variant: 'full' })
      const listItems = wrapper.findAll('li')
      expect(listItems.length).toBe(3)
    })

    it('should have checkmark icons for list items', () => {
      const wrapper = createWrapper({ variant: 'full' })
      const checkIcons = wrapper.findAll('li svg')
      expect(checkIcons.length).toBe(3)
    })

    it('should have green checkmark icons', () => {
      const wrapper = createWrapper({ variant: 'full' })
      const greenCheckIcons = wrapper.findAll('li .text-green-500')
      expect(greenCheckIcons.length).toBe(3)
    })
  })

  describe('Customer Service Section', () => {
    it('should display need help text in full mode', () => {
      const wrapper = createWrapper({ variant: 'full' })
      expect(wrapper.text()).toContain('checkout.trust.needHelp')
    })

    it('should display support email link', () => {
      const wrapper = createWrapper({ variant: 'full' })
      const emailLink = wrapper.find('a[href^="mailto:"]')
      expect(emailLink.exists()).toBe(true)
    })

    it('should have correct mailto href', () => {
      const wrapper = createWrapper({ variant: 'full' })
      const emailLink = wrapper.find('a[href^="mailto:"]')
      expect(emailLink.attributes('href')).toBe(`mailto:${DEFAULT_SUPPORT_EMAIL}`)
    })

    it('should display the support email text', () => {
      const wrapper = createWrapper({ variant: 'full' })
      expect(wrapper.text()).toContain(DEFAULT_SUPPORT_EMAIL)
    })

    it('should have hover styling on email link', () => {
      const wrapper = createWrapper({ variant: 'full' })
      const emailLink = wrapper.find('a[href^="mailto:"]')
      expect(emailLink.classes()).toContain('hover:underline')
    })

    it('should have primary color styling on email link', () => {
      const wrapper = createWrapper({ variant: 'full' })
      const emailLink = wrapper.find('a[href^="mailto:"]')
      expect(emailLink.classes()).toContain('text-primary-600')
    })

    it('should have border separator above customer service section', () => {
      const wrapper = createWrapper({ variant: 'full' })
      const separator = wrapper.find('.border-t')
      expect(separator.exists()).toBe(true)
    })

    it('should have margin top on customer service section', () => {
      const wrapper = createWrapper({ variant: 'full' })
      const section = wrapper.find('.mt-4')
      expect(section.exists()).toBe(true)
    })
  })

  describe('Props Handling', () => {
    it('should accept variant prop', () => {
      const wrapper = createWrapper({ variant: 'compact' })
      expect(wrapper.props('variant')).toBe('compact')
    })

    it('should default variant to full', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('variant')).toBe('full')
    })

    it('should switch between variants correctly', async () => {
      const wrapper = createWrapper({ variant: 'full' })
      expect(wrapper.find('.bg-gray-50').exists()).toBe(true)

      await wrapper.setProps({ variant: 'compact' })
      expect(wrapper.find('.bg-gray-50').exists()).toBe(false)
      expect(wrapper.find('.flex.items-center.gap-4').exists()).toBe(true)
    })
  })

  describe('i18n Translations', () => {
    it('should use i18n for secure checkout text', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('checkout.trust.secureCheckout')
    })

    it('should use i18n for SSL encrypted text', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('checkout.trust.sslEncrypted')
    })

    it('should use i18n for data protected text', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('checkout.trust.dataProtected')
    })

    it('should use i18n for money back guarantee text', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('checkout.trust.moneyBackGuarantee')
    })

    it('should use i18n for need help text', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('checkout.trust.needHelp')
    })
  })

  describe('Accessibility', () => {
    it('should have aria-hidden on decorative icons in compact mode', () => {
      const wrapper = createWrapper({ variant: 'compact' })
      const icons = wrapper.findAll('svg')
      icons.forEach((icon) => {
        expect(icon.attributes('aria-hidden')).toBe('true')
      })
    })

    it('should have aria-hidden on decorative icons in full mode', () => {
      const wrapper = createWrapper({ variant: 'full' })
      const icons = wrapper.findAll('svg')
      icons.forEach((icon) => {
        expect(icon.attributes('aria-hidden')).toBe('true')
      })
    })

    it('should have semantic list structure in full mode', () => {
      const wrapper = createWrapper({ variant: 'full' })
      expect(wrapper.find('ul').exists()).toBe(true)
      expect(wrapper.findAll('li').length).toBe(3)
    })

    it('should have clickable email link for keyboard navigation', () => {
      const wrapper = createWrapper({ variant: 'full' })
      const emailLink = wrapper.find('a')
      expect(emailLink.exists()).toBe(true)
    })
  })

  describe('Dark Mode Support', () => {
    it('should have dark mode classes for container in full mode', () => {
      const wrapper = createWrapper({ variant: 'full' })
      const container = wrapper.find('.dark\\:bg-gray-800')
      expect(container.exists()).toBe(true)
    })

    it('should have dark mode border color in full mode', () => {
      const wrapper = createWrapper({ variant: 'full' })
      const container = wrapper.find('.dark\\:border-gray-700')
      expect(container.exists()).toBe(true)
    })

    it('should have dark mode text color in compact mode', () => {
      const wrapper = createWrapper({ variant: 'compact' })
      const container = wrapper.find('.dark\\:text-gray-400')
      expect(container.exists()).toBe(true)
    })

    it('should have dark mode text color for title in full mode', () => {
      const wrapper = createWrapper({ variant: 'full' })
      const title = wrapper.find('.dark\\:text-white')
      expect(title.exists()).toBe(true)
    })

    it('should have dark mode border for separator', () => {
      const wrapper = createWrapper({ variant: 'full' })
      const separator = wrapper.find('.dark\\:border-gray-600')
      expect(separator.exists()).toBe(true)
    })
  })

  describe('Icon Structure', () => {
    it('should have shield icon in header', () => {
      const wrapper = createWrapper({ variant: 'full' })
      const headerIcon = wrapper.find('.mb-3 svg')
      expect(headerIcon.exists()).toBe(true)
      expect(headerIcon.attributes('viewBox')).toBe('0 0 24 24')
    })

    it('should have icons with stroke style in compact mode', () => {
      const wrapper = createWrapper({ variant: 'compact' })
      const icons = wrapper.findAll('svg')
      icons.forEach((icon) => {
        expect(icon.attributes('fill')).toBe('none')
        expect(icon.attributes('stroke')).toBe('currentColor')
      })
    })

    it('should have checkmark icons with fill style for list items', () => {
      const wrapper = createWrapper({ variant: 'full' })
      const listIcons = wrapper.findAll('li svg')
      listIcons.forEach((icon) => {
        expect(icon.attributes('fill')).toBe('currentColor')
      })
    })

    it('should have correct viewBox for checkmark icons', () => {
      const wrapper = createWrapper({ variant: 'full' })
      const listIcons = wrapper.findAll('li svg')
      listIcons.forEach((icon) => {
        expect(icon.attributes('viewBox')).toBe('0 0 20 20')
      })
    })

    it('should have w-4 h-4 size for compact icons', () => {
      const wrapper = createWrapper({ variant: 'compact' })
      const icons = wrapper.findAll('svg.w-4.h-4')
      expect(icons.length).toBe(2)
    })

    it('should have w-5 h-5 size for header icon in full mode', () => {
      const wrapper = createWrapper({ variant: 'full' })
      const headerIcon = wrapper.find('.mb-3 svg.w-5.h-5')
      expect(headerIcon.exists()).toBe(true)
    })

    it('should have flex-shrink-0 on list item icons', () => {
      const wrapper = createWrapper({ variant: 'full' })
      const listIcons = wrapper.findAll('li svg.flex-shrink-0')
      expect(listIcons.length).toBe(3)
    })
  })

  describe('Layout Structure', () => {
    it('should have flex layout for header in full mode', () => {
      const wrapper = createWrapper({ variant: 'full' })
      const header = wrapper.find('.flex.items-center.gap-2')
      expect(header.exists()).toBe(true)
    })

    it('should have spaced list items', () => {
      const wrapper = createWrapper({ variant: 'full' })
      const list = wrapper.find('ul.space-y-2')
      expect(list.exists()).toBe(true)
    })

    it('should have flex layout for list items', () => {
      const wrapper = createWrapper({ variant: 'full' })
      const listItems = wrapper.findAll('li.flex.items-center')
      expect(listItems.length).toBe(3)
    })

    it('should have gap between icon and text in list items', () => {
      const wrapper = createWrapper({ variant: 'full' })
      const listItems = wrapper.findAll('li.gap-2')
      expect(listItems.length).toBe(3)
    })
  })

  describe('Text Styling', () => {
    it('should have font-medium on title in full mode', () => {
      const wrapper = createWrapper({ variant: 'full' })
      const title = wrapper.find('.font-medium')
      expect(title.exists()).toBe(true)
    })

    it('should have text-sm for list items in full mode', () => {
      const wrapper = createWrapper({ variant: 'full' })
      const list = wrapper.find('ul.text-sm')
      expect(list.exists()).toBe(true)
    })

    it('should have text-xs for customer service text', () => {
      const wrapper = createWrapper({ variant: 'full' })
      const helpText = wrapper.find('p.text-xs')
      expect(helpText.exists()).toBe(true)
    })

    it('should have gray text color for compact mode', () => {
      const wrapper = createWrapper({ variant: 'compact' })
      const container = wrapper.find('.text-gray-600')
      expect(container.exists()).toBe(true)
    })

    it('should have gray text color for list items', () => {
      const wrapper = createWrapper({ variant: 'full' })
      const list = wrapper.find('ul.text-gray-600')
      expect(list.exists()).toBe(true)
    })
  })

  describe('Fallback Email', () => {
    it('should use fallback email when config is empty', () => {
      const wrapper = createWrapper({ variant: 'full' })
      expect(wrapper.text()).toContain(DEFAULT_SUPPORT_EMAIL)
    })

    it('should display default email in mailto link', () => {
      const wrapper = createWrapper({ variant: 'full' })
      const emailLink = wrapper.find('a[href^="mailto:"]')
      expect(emailLink.attributes('href')).toContain(DEFAULT_SUPPORT_EMAIL)
    })
  })

  describe('Edge Cases', () => {
    it('should handle undefined variant gracefully', () => {
      const wrapper = mount(TrustBadges, {
        props: { variant: undefined },
      })
      // Should default to full variant
      expect(wrapper.find('.bg-gray-50').exists()).toBe(true)
    })

    it('should not have email link in compact mode', () => {
      const wrapper = createWrapper({ variant: 'compact' })
      const emailLink = wrapper.find('a[href^="mailto:"]')
      expect(emailLink.exists()).toBe(false)
    })

    it('should render correctly with no props at all', () => {
      const wrapper = mount(TrustBadges)
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.trust-badges').exists()).toBe(true)
    })
  })
})
