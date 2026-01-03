import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import TrustBadges from '~/components/home/TrustBadges.vue'

vi.mock('#imports', () => ({
  useI18n: vi.fn(() => ({ t: (k: string) => k })),
  useLocalePath: vi.fn(() => (path: string) => path),
}))

describe('Home TrustBadges', () => {
  it('should render trust badges section', () => {
    const wrapper = mount(TrustBadges)
    expect(wrapper.exists()).toBe(true)
  })

  it('should display default trust badges', () => {
    const wrapper = mount(TrustBadges)
    expect(wrapper.text()).toContain('Free Shipping')
    expect(wrapper.text()).toContain('30-Day Returns')
    expect(wrapper.text()).toContain('Secure Payment')
    expect(wrapper.text()).toContain('24/7 Support')
  })

  it('should show payment methods', () => {
    const wrapper = mount(TrustBadges)
    const paymentIcons = wrapper.findAll('[aria-label^="We accept"]')
    expect(paymentIcons.length).toBeGreaterThan(0)
  })

  it('should display security badges', () => {
    const wrapper = mount(TrustBadges)
    expect(wrapper.text()).toContain('SSL Secure')
    expect(wrapper.text()).toContain('PCI Compliant')
    expect(wrapper.text()).toContain('GDPR Protected')
  })

  it('should show support CTA when enabled', () => {
    const wrapper = mount(TrustBadges, {
      props: { showSupportCta: true },
    })
    expect(wrapper.text()).toContain('home.trustBadges.contactUs')
  })

  it('should hide support CTA when disabled', () => {
    const wrapper = mount(TrustBadges, {
      props: { showSupportCta: false },
    })
    const contactLink = wrapper.find('a[href="/contact"]')
    expect(contactLink.exists()).toBe(false)
  })

  it('should accept custom badges', () => {
    const customBadges = [
      {
        title: 'Custom Badge',
        description: 'Custom description',
        icon: 'lucide:star',
      },
    ]
    const wrapper = mount(TrustBadges, {
      props: { badges: customBadges },
    })
    expect(wrapper.text()).toContain('Custom Badge')
  })
})
