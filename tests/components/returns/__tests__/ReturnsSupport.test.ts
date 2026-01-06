import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ReturnsSupport from '~/components/returns/ReturnsSupport.vue'

// The component uses fallback email 'support@moldovadirect.com' when config is not set
const DEFAULT_SUPPORT_EMAIL = 'support@moldovadirect.com'

vi.mock('#imports', () => ({
  useI18n: vi.fn(() => ({
    t: (k: string) => k,
    locale: { value: 'en' },
  })),
  useLocalePath: vi.fn(() => (path: string) => path),
  useRuntimeConfig: vi.fn(() => ({
    public: {
      supportEmail: '', // Empty to trigger fallback
    },
  })),
  computed: (fn: () => unknown) => ({ value: fn() }),
}))

describe('ReturnsSupport', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const createWrapper = () => {
    return mount(ReturnsSupport, {
      global: {
        stubs: {
          NuxtLink: {
            template: '<a :href="to"><slot /></a>',
            props: ['to'],
          },
        },
      },
    })
  }

  describe('Rendering', () => {
    it('should render the support component', () => {
      const wrapper = createWrapper()
      expect(wrapper.exists()).toBe(true)
    })

    it('should render the main container with correct styling', () => {
      const wrapper = createWrapper()
      const container = wrapper.find('div')
      expect(container.classes()).toContain('rounded-2xl')
      expect(container.classes()).toContain('border')
      expect(container.classes()).toContain('bg-white')
    })

    it('should display the support title', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('returns.support.title')
    })

    it('should display the support description', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('returns.support.description')
    })

    it('should display the support badge', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('returns.support.badge')
    })

    it('should display the response time text', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('returns.support.responseTime')
    })
  })

  describe('Contact Information Display', () => {
    it('should display the support email', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain(DEFAULT_SUPPORT_EMAIL)
    })

    it('should display the contact link text', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('returns.support.contactLink')
    })
  })

  describe('Email Link', () => {
    it('should render email as a link', () => {
      const wrapper = createWrapper()
      const emailLink = wrapper.find('a[href^="mailto:"]')
      expect(emailLink.exists()).toBe(true)
    })

    it('should have correct mailto href', () => {
      const wrapper = createWrapper()
      const emailLink = wrapper.find('a[href^="mailto:"]')
      expect(emailLink.attributes('href')).toContain(`mailto:${DEFAULT_SUPPORT_EMAIL}`)
    })

    it('should include email subject in href', () => {
      const wrapper = createWrapper()
      const emailLink = wrapper.find('a[href^="mailto:"]')
      expect(emailLink.attributes('href')).toContain('subject=')
    })

    it('should have aria-label for email link', () => {
      const wrapper = createWrapper()
      const emailLink = wrapper.find('a[href^="mailto:"]')
      expect(emailLink.attributes('aria-label')).toBe('Email customer support for return assistance')
    })
  })

  describe('Contact Page Link', () => {
    it('should render contact page link', () => {
      const wrapper = createWrapper()
      const contactLink = wrapper.find('a[href="/contact"]')
      expect(contactLink.exists()).toBe(true)
    })

    it('should have aria-label for contact link', () => {
      const wrapper = createWrapper()
      const contactLink = wrapper.find('a[href="/contact"]')
      expect(contactLink.attributes('aria-label')).toBe('Navigate to contact form for return inquiries')
    })
  })

  describe('Visual Elements', () => {
    it('should have a badge with emerald styling', () => {
      const wrapper = createWrapper()
      const badge = wrapper.find('.bg-emerald-50')
      expect(badge.exists()).toBe(true)
    })

    it('should have arrow icons on links', () => {
      const wrapper = createWrapper()
      const icons = wrapper.findAll('svg')
      expect(icons.length).toBe(2) // Two arrow icons for the two links
    })

    it('should have icons marked as aria-hidden', () => {
      const wrapper = createWrapper()
      const icons = wrapper.findAll('svg[aria-hidden="true"]')
      expect(icons.length).toBe(2)
    })

    it('should have hover states on email link', () => {
      const wrapper = createWrapper()
      const emailLink = wrapper.find('a[href^="mailto:"]')
      expect(emailLink.classes()).toContain('hover:bg-primary-50')
    })

    it('should have hover states on contact link', () => {
      const wrapper = createWrapper()
      const contactLink = wrapper.find('a[href="/contact"]')
      expect(contactLink.classes()).toContain('hover:bg-primary-100')
    })
  })

  describe('Accessibility', () => {
    it('should have aria-label on email link', () => {
      const wrapper = createWrapper()
      const emailLink = wrapper.find('a[href^="mailto:"]')
      expect(emailLink.attributes('aria-label')).toBeTruthy()
    })

    it('should have aria-label on contact link', () => {
      const wrapper = createWrapper()
      const contactLink = wrapper.find('a[href="/contact"]')
      expect(contactLink.attributes('aria-label')).toBeTruthy()
    })

    it('should have aria-hidden on decorative icons', () => {
      const wrapper = createWrapper()
      const icons = wrapper.findAll('svg')
      icons.forEach((icon) => {
        expect(icon.attributes('aria-hidden')).toBe('true')
      })
    })

    it('should have proper text hierarchy', () => {
      const wrapper = createWrapper()
      const semiboldTexts = wrapper.findAll('.font-semibold')
      expect(semiboldTexts.length).toBeGreaterThan(0)
    })

    it('should have transition effects for keyboard focus', () => {
      const wrapper = createWrapper()
      const links = wrapper.findAll('.transition')
      expect(links.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('Dark Mode Support', () => {
    it('should have dark mode classes for container', () => {
      const wrapper = createWrapper()
      const container = wrapper.find('.dark\\:bg-gray-900')
      expect(container.exists()).toBe(true)
    })

    it('should have dark mode classes for email link', () => {
      const wrapper = createWrapper()
      const emailLink = wrapper.find('a[href^="mailto:"]')
      expect(emailLink.classes()).toContain('dark:bg-gray-950')
    })

    it('should have dark mode classes for contact link', () => {
      const wrapper = createWrapper()
      const contactLink = wrapper.find('a[href="/contact"]')
      expect(contactLink.classes()).toContain('dark:bg-primary-900/20')
    })

    it('should have dark mode classes for badge', () => {
      const wrapper = createWrapper()
      const badge = wrapper.find('.dark\\:bg-emerald-900\\/30')
      expect(badge.exists()).toBe(true)
    })

    it('should have dark mode text colors', () => {
      const wrapper = createWrapper()
      const darkText = wrapper.findAll('.dark\\:text-white')
      expect(darkText.length).toBeGreaterThan(0)
    })
  })

  describe('Link Styling', () => {
    it('should have rounded corners on links', () => {
      const wrapper = createWrapper()
      const links = wrapper.findAll('.rounded-lg')
      expect(links.length).toBeGreaterThanOrEqual(2)
    })

    it('should have ring styling on links', () => {
      const wrapper = createWrapper()
      const emailLink = wrapper.find('a[href^="mailto:"]')
      expect(emailLink.classes()).toContain('ring-1')
    })

    it('should have proper padding on links', () => {
      const wrapper = createWrapper()
      const links = wrapper.findAll('.p-3')
      expect(links.length).toBeGreaterThanOrEqual(2)
    })

    it('should have flex layout on links', () => {
      const wrapper = createWrapper()
      const emailLink = wrapper.find('a[href^="mailto:"]')
      expect(emailLink.classes()).toContain('flex')
      expect(emailLink.classes()).toContain('items-center')
      expect(emailLink.classes()).toContain('justify-between')
    })
  })

  describe('Layout Structure', () => {
    it('should have header with title and badge', () => {
      const wrapper = createWrapper()
      const header = wrapper.find('.flex.items-start.justify-between')
      expect(header.exists()).toBe(true)
    })

    it('should have links container with proper spacing', () => {
      const wrapper = createWrapper()
      const linksContainer = wrapper.find('.space-y-3')
      expect(linksContainer.exists()).toBe(true)
    })

    it('should have gap between header elements', () => {
      const wrapper = createWrapper()
      const header = wrapper.find('.gap-3')
      expect(header.exists()).toBe(true)
    })
  })

  describe('Fallback Email', () => {
    it('should use fallback email when config is empty', () => {
      // The mock already returns empty supportEmail, triggering fallback
      const wrapper = createWrapper()
      // The component should fall back to default email
      expect(wrapper.text()).toContain(DEFAULT_SUPPORT_EMAIL)
    })

    it('should display default email in mailto link', () => {
      const wrapper = createWrapper()
      const emailLink = wrapper.find('a[href^="mailto:"]')
      expect(emailLink.attributes('href')).toContain(DEFAULT_SUPPORT_EMAIL)
    })
  })

  describe('Icon Structure', () => {
    it('should have arrow icons with correct viewBox', () => {
      const wrapper = createWrapper()
      const icons = wrapper.findAll('svg')
      icons.forEach((icon) => {
        expect(icon.attributes('viewBox')).toBe('0 0 24 24')
      })
    })

    it('should have icons with h-4 w-4 size', () => {
      const wrapper = createWrapper()
      const icons = wrapper.findAll('svg.h-4.w-4')
      expect(icons.length).toBe(2)
    })

    it('should have icons with no fill', () => {
      const wrapper = createWrapper()
      const icons = wrapper.findAll('svg')
      icons.forEach((icon) => {
        expect(icon.attributes('fill')).toBe('none')
      })
    })
  })
})
