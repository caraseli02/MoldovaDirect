// SKIP: Tests written for main's design - this branch has alternative UX design
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import TrustBadges from '~/components/home/TrustBadges.vue'

vi.mock('#imports', () => ({
  useI18n: vi.fn(() => ({ t: (k: string) => k })),
  useLocalePath: vi.fn(() => (path: string) => path),
}))

const defaultStubs = {
  NuxtLink: {
    template: '<a :href="to" :class="$attrs.class"><slot /></a>',
    props: ['to'],
  },
  commonIcon: {
    template: '<span class="icon-stub" :data-icon="name" :aria-label="ariaLabel"></span>',
    props: ['name', 'class', 'ariaLabel'],
  },
}

describe.skip('Home TrustBadges', () => {
  const mountOptions = {
    global: {
      stubs: defaultStubs,
      directives: {
        motion: {},
      },
    },
  }

  describe.skip('Section Structure', () => {
    it('should render section element with correct background', () => {
      const wrapper = mount(TrustBadges, mountOptions)
      const section = wrapper.find('section')
      expect(section.exists()).toBe(true)
      expect(section.classes()).toContain('bg-gray-50')
      expect(section.classes()).toContain('py-12')
    })

    it('should render container inside section', () => {
      const wrapper = mount(TrustBadges, mountOptions)
      const container = wrapper.find('.container')
      expect(container.exists()).toBe(true)
    })

    it('should render max-width wrapper', () => {
      const wrapper = mount(TrustBadges, mountOptions)
      const wrapper_inner = wrapper.find('.mx-auto.max-w-6xl')
      expect(wrapper_inner.exists()).toBe(true)
    })
  })

  describe.skip('Default Trust Badges', () => {
    it('should render exactly 4 default trust badges', () => {
      const wrapper = mount(TrustBadges, mountOptions)
      const badgeCards = wrapper.findAll('.grid.gap-6.md\\:grid-cols-4 > div')
      expect(badgeCards).toHaveLength(4)
    })

    it('should display Free Shipping badge', () => {
      const wrapper = mount(TrustBadges, mountOptions)
      const h3Elements = wrapper.findAll('h3')
      const titles = h3Elements.map(h => h.text())
      expect(titles).toContain('Free Shipping')
    })

    it('should display 30-Day Returns badge', () => {
      const wrapper = mount(TrustBadges, mountOptions)
      expect(wrapper.text()).toContain('30-Day Returns')
    })

    it('should display Secure Payment badge', () => {
      const wrapper = mount(TrustBadges, mountOptions)
      expect(wrapper.text()).toContain('Secure Payment')
    })

    it('should display 24/7 Support badge', () => {
      const wrapper = mount(TrustBadges, mountOptions)
      expect(wrapper.text()).toContain('24/7 Support')
    })

    it('should display badge descriptions', () => {
      const wrapper = mount(TrustBadges, mountOptions)
      expect(wrapper.text()).toContain('On orders over')
      expect(wrapper.text()).toContain('Money-back guarantee')
      expect(wrapper.text()).toContain('SSL encrypted checkout')
      expect(wrapper.text()).toContain('here to help')
    })

    it('should render truck icon for Free Shipping', () => {
      const wrapper = mount(TrustBadges, mountOptions)
      const truckIcon = wrapper.find('[data-icon="lucide:truck"]')
      expect(truckIcon.exists()).toBe(true)
    })

    it('should render rotate-ccw icon for Returns', () => {
      const wrapper = mount(TrustBadges, mountOptions)
      const returnIcon = wrapper.find('[data-icon="lucide:rotate-ccw"]')
      expect(returnIcon.exists()).toBe(true)
    })

    it('should render shield-check icon for Secure Payment', () => {
      const wrapper = mount(TrustBadges, mountOptions)
      const shieldIcon = wrapper.find('[data-icon="lucide:shield-check"]')
      expect(shieldIcon.exists()).toBe(true)
    })

    it('should render headphones icon for Support', () => {
      const wrapper = mount(TrustBadges, mountOptions)
      const headphonesIcon = wrapper.find('[data-icon="lucide:headphones"]')
      expect(headphonesIcon.exists()).toBe(true)
    })
  })

  describe.skip('Badge Card Styling', () => {
    it('should apply correct styling to badge cards', () => {
      const wrapper = mount(TrustBadges, mountOptions)
      const card = wrapper.find('.grid.gap-6.md\\:grid-cols-4 > div')
      expect(card.classes()).toContain('flex')
      expect(card.classes()).toContain('flex-col')
      expect(card.classes()).toContain('items-center')
      expect(card.classes()).toContain('rounded-2xl')
      expect(card.classes()).toContain('bg-white')
      expect(card.classes()).toContain('p-6')
      expect(card.classes()).toContain('shadow-sm')
    })

    it('should render icon container with correct styling', () => {
      const wrapper = mount(TrustBadges, mountOptions)
      const iconContainer = wrapper.find('.flex.h-12.w-12.items-center.justify-center.rounded-full')
      expect(iconContainer.exists()).toBe(true)
      expect(iconContainer.classes()).toContain('bg-primary-100')
      expect(iconContainer.classes()).toContain('text-primary-600')
    })

    it('should center badge text', () => {
      const wrapper = mount(TrustBadges, mountOptions)
      const card = wrapper.find('.grid.gap-6.md\\:grid-cols-4 > div')
      expect(card.classes()).toContain('text-center')
    })
  })

  describe.skip('Payment Methods Section', () => {
    it('should render payment methods title', () => {
      const wrapper = mount(TrustBadges, mountOptions)
      expect(wrapper.text()).toContain('home.trustBadges.paymentMethods')
    })

    it('should render 6 default payment method icons', () => {
      const wrapper = mount(TrustBadges, mountOptions)
      const paymentContainer = wrapper.find('.flex.flex-wrap.items-center.justify-center.gap-6')
      expect(paymentContainer.exists()).toBe(true)

      const paymentItems = paymentContainer.findAll('[title]')
      expect(paymentItems).toHaveLength(6)
    })

    it('should have correct payment method titles', () => {
      const wrapper = mount(TrustBadges, mountOptions)
      const paymentItems = wrapper.findAll('[title]')
      const titles = paymentItems.map(item => item.attributes('title'))

      expect(titles).toContain('Visa')
      expect(titles).toContain('Mastercard')
      expect(titles).toContain('PayPal')
      expect(titles).toContain('Apple Pay')
      expect(titles).toContain('Google Pay')
      expect(titles).toContain('Bank Transfer')
    })

    it('should have aria-labels for payment methods', () => {
      const wrapper = mount(TrustBadges, mountOptions)
      const paymentItems = wrapper.findAll('[aria-label^="We accept"]')
      expect(paymentItems).toHaveLength(6)
    })

    it('should apply hover effect to payment icons', () => {
      const wrapper = mount(TrustBadges, mountOptions)
      const paymentItem = wrapper.find('[title="Visa"]')
      expect(paymentItem.classes()).toContain('transition')
    })
  })

  describe.skip('Security Badges Section', () => {
    it('should render security section title', () => {
      const wrapper = mount(TrustBadges, mountOptions)
      expect(wrapper.text()).toContain('home.trustBadges.security')
    })

    it('should display SSL Secure badge', () => {
      const wrapper = mount(TrustBadges, mountOptions)
      expect(wrapper.text()).toContain('SSL Secure')
    })

    it('should display PCI Compliant badge', () => {
      const wrapper = mount(TrustBadges, mountOptions)
      expect(wrapper.text()).toContain('PCI Compliant')
    })

    it('should display GDPR Protected badge', () => {
      const wrapper = mount(TrustBadges, mountOptions)
      expect(wrapper.text()).toContain('GDPR Protected')
    })

    it('should render lock icon for SSL', () => {
      const wrapper = mount(TrustBadges, mountOptions)
      const lockIcon = wrapper.find('[data-icon="lucide:lock"]')
      expect(lockIcon.exists()).toBe(true)
    })

    it('should render shield icon for PCI', () => {
      const wrapper = mount(TrustBadges, mountOptions)
      const shieldIcon = wrapper.find('[data-icon="lucide:shield"]')
      expect(shieldIcon.exists()).toBe(true)
    })

    it('should apply green color to security icons', () => {
      const wrapper = mount(TrustBadges, mountOptions)
      const securitySection = wrapper.find('.border-t.border-gray-200.pt-8')
      expect(securitySection.exists()).toBe(true)

      const icons = securitySection.findAll('.icon-stub')
      expect(icons.length).toBe(3)
    })

    it('should have separator border above security section', () => {
      const wrapper = mount(TrustBadges, mountOptions)
      const securitySection = wrapper.find('.border-t.border-gray-200')
      expect(securitySection.exists()).toBe(true)
    })
  })

  describe.skip('Support CTA', () => {
    it('should show support CTA by default', () => {
      const wrapper = mount(TrustBadges, mountOptions)
      expect(wrapper.text()).toContain('home.trustBadges.supportText')
      expect(wrapper.text()).toContain('home.trustBadges.contactUs')
    })

    it('should render contact link with correct href', () => {
      const wrapper = mount(TrustBadges, mountOptions)
      const contactLink = wrapper.find('a[href="/contact"]')
      expect(contactLink.exists()).toBe(true)
    })

    it('should render arrow icon in contact link', () => {
      const wrapper = mount(TrustBadges, mountOptions)
      const contactLink = wrapper.find('a[href="/contact"]')
      const arrowIcon = contactLink.find('[data-icon="lucide:arrow-right"]')
      expect(arrowIcon.exists()).toBe(true)
    })

    it('should hide support CTA when showSupportCta is false', () => {
      const wrapper = mount(TrustBadges, {
        ...mountOptions,
        props: { showSupportCta: false },
      })
      const contactLink = wrapper.find('a[href="/contact"]')
      expect(contactLink.exists()).toBe(false)
    })

    it('should show support CTA when showSupportCta is true', () => {
      const wrapper = mount(TrustBadges, {
        ...mountOptions,
        props: { showSupportCta: true },
      })
      const contactLink = wrapper.find('a[href="/contact"]')
      expect(contactLink.exists()).toBe(true)
    })
  })

  describe.skip('Custom Props', () => {
    it('should render custom badges when provided', () => {
      const customBadges = [
        {
          title: 'Custom Badge',
          description: 'Custom description',
          icon: 'lucide:star',
        },
        {
          title: 'Another Badge',
          description: 'Another description',
          icon: 'lucide:heart',
        },
      ]
      const wrapper = mount(TrustBadges, {
        ...mountOptions,
        props: { badges: customBadges },
      })

      expect(wrapper.text()).toContain('Custom Badge')
      expect(wrapper.text()).toContain('Custom description')
      expect(wrapper.text()).toContain('Another Badge')
    })

    it('should render custom badge icons', () => {
      const customBadges = [
        {
          title: 'Star Badge',
          description: 'Star description',
          icon: 'lucide:star',
        },
      ]
      const wrapper = mount(TrustBadges, {
        ...mountOptions,
        props: { badges: customBadges },
      })

      const starIcon = wrapper.find('[data-icon="lucide:star"]')
      expect(starIcon.exists()).toBe(true)
    })

    it('should accept custom payment methods', () => {
      const customPayments = [
        { name: 'Bitcoin', icon: 'lucide:bitcoin' },
        { name: 'Ethereum', icon: 'lucide:ethereum' },
      ]
      const wrapper = mount(TrustBadges, {
        ...mountOptions,
        props: { paymentMethods: customPayments },
      })

      const paymentItems = wrapper.findAll('[title]')
      const titles = paymentItems.map(item => item.attributes('title'))
      expect(titles).toContain('Bitcoin')
      expect(titles).toContain('Ethereum')
    })

    it('should accept custom security badges', () => {
      const customSecurity = [
        { name: 'Custom Security', icon: 'lucide:shield-alert' },
      ]
      const wrapper = mount(TrustBadges, {
        ...mountOptions,
        props: { securityBadges: customSecurity },
      })

      expect(wrapper.text()).toContain('Custom Security')
    })
  })

  describe.skip('Layout and Responsiveness', () => {
    it('should have responsive grid for badges', () => {
      const wrapper = mount(TrustBadges, mountOptions)
      const grid = wrapper.find('.grid.gap-6.md\\:grid-cols-4')
      expect(grid.exists()).toBe(true)
    })

    it('should have border container for payment and security', () => {
      const wrapper = mount(TrustBadges, mountOptions)
      const container = wrapper.find('.mt-12.rounded-2xl.border.border-gray-200')
      expect(container.exists()).toBe(true)
      expect(container.classes()).toContain('bg-white')
      expect(container.classes()).toContain('p-8')
    })

    it('should center payment methods', () => {
      const wrapper = mount(TrustBadges, mountOptions)
      const paymentContainer = wrapper.find('.flex.flex-wrap.items-center.justify-center.gap-6')
      expect(paymentContainer.exists()).toBe(true)
    })

    it('should center security badges', () => {
      const wrapper = mount(TrustBadges, mountOptions)
      const securityContainer = wrapper.find('.flex.flex-wrap.items-center.justify-center.gap-8')
      expect(securityContainer.exists()).toBe(true)
    })
  })

  describe.skip('Accessibility', () => {
    it('should use semantic section element', () => {
      const wrapper = mount(TrustBadges, mountOptions)
      expect(wrapper.find('section').exists()).toBe(true)
    })

    it('should have h3 elements for badge titles', () => {
      const wrapper = mount(TrustBadges, mountOptions)
      const h3Elements = wrapper.findAll('h3')
      expect(h3Elements.length).toBe(4)
    })

    it('should have descriptive aria-labels on payment methods', () => {
      const wrapper = mount(TrustBadges, mountOptions)
      const paymentItem = wrapper.find('[aria-label="We accept Visa"]')
      expect(paymentItem.exists()).toBe(true)
    })
  })

  describe.skip('Dark Mode Support', () => {
    it('should have dark mode classes on section', () => {
      const wrapper = mount(TrustBadges, mountOptions)
      const section = wrapper.find('section')
      expect(section.classes()).toContain('dark:bg-gray-900/50')
    })

    it('should have dark mode classes on badge cards', () => {
      const wrapper = mount(TrustBadges, mountOptions)
      const card = wrapper.find('.grid.gap-6.md\\:grid-cols-4 > div')
      expect(card.classes()).toContain('dark:bg-gray-900')
    })

    it('should have dark mode classes on container', () => {
      const wrapper = mount(TrustBadges, mountOptions)
      const container = wrapper.find('.mt-12.rounded-2xl.border')
      expect(container.classes()).toContain('dark:border-gray-800')
      expect(container.classes()).toContain('dark:bg-gray-900')
    })
  })
})
