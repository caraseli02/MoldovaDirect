import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import LandingHeroSection from '~/components/landing/LandingHeroSection.vue'

// Mock Nuxt composables
vi.mock('#app', () => ({
  useI18n: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'landing.hero.urgency': 'Free Shipping on Orders Over $75',
        'landing.hero.headline': 'Authentic Moldova, Delivered to Your Door',
        'landing.hero.subheadline': 'Discover 5,000 years of winemaking tradition',
        'landing.hero.primaryCta': 'Explore Collection',
        'landing.hero.secondaryCta': 'Take Our Wine Quiz',
        'landing.hero.trustBadge1': 'Authentic & Certified',
        'landing.hero.trustBadge2': 'Free Shipping',
        'landing.hero.trustBadge3': '4.9/5 Stars (2,400+ Reviews)',
        'landing.hero.scrollHint': 'Discover More'
      }
      return translations[key] || key
    }
  }),
  useLocalePath: () => (path: string) => path
}))

// Mock NuxtImg component
const NuxtImgStub = {
  name: 'NuxtImg',
  template: '<img v-bind="$attrs" />',
  props: ['src', 'alt', 'width', 'height', 'format', 'quality', 'loading', 'fetchpriority']
}

// Mock NuxtLink component
const NuxtLinkStub = {
  name: 'NuxtLink',
  template: '<a v-bind="$attrs"><slot /></a>',
  props: ['to']
}

// Mock commonIcon component
const CommonIconStub = {
  name: 'commonIcon',
  template: '<span class="icon" />',
  props: ['name']
}

describe('LandingHeroSection', () => {
  let wrapper: any

  beforeEach(() => {
    // Reset window size
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024
    })

    // Mock matchMedia for reduced motion
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
      }))
    })

    wrapper = mount(LandingHeroSection, {
      global: {
        stubs: {
          NuxtImg: NuxtImgStub,
          NuxtLink: NuxtLinkStub,
          commonIcon: CommonIconStub
        },
        directives: {
          motion: {
            mounted() {
              // Mock motion directive
            }
          }
        }
      }
    })
  })

  it('renders the hero section', () => {
    expect(wrapper.find('.landing-hero').exists()).toBe(true)
  })

  it('displays the headline', () => {
    expect(wrapper.text()).toContain('Authentic Moldova, Delivered to Your Door')
  })

  it('displays the subheadline', () => {
    expect(wrapper.text()).toContain('Discover 5,000 years of winemaking tradition')
  })

  it('displays urgency badge', () => {
    expect(wrapper.text()).toContain('Free Shipping on Orders Over $75')
  })

  it('renders primary CTA button', () => {
    const primaryCta = wrapper.findAll('a').find((link: any) =>
      link.text().includes('Explore Collection')
    )
    expect(primaryCta).toBeDefined()
    expect(primaryCta?.attributes('href')).toBe('/products')
  })

  it('renders secondary CTA button', () => {
    const secondaryCta = wrapper.findAll('button').find((btn: any) =>
      btn.text().includes('Take Our Wine Quiz')
    )
    expect(secondaryCta).toBeDefined()
  })

  it('emits open-quiz event when secondary CTA is clicked', async () => {
    const secondaryCta = wrapper.findAll('button').find((btn: any) =>
      btn.text().includes('Take Our Wine Quiz')
    )
    await secondaryCta?.trigger('click')
    expect(wrapper.emitted('open-quiz')).toBeTruthy()
  })

  it('displays trust indicators', () => {
    expect(wrapper.text()).toContain('Authentic & Certified')
    expect(wrapper.text()).toContain('Free Shipping')
    expect(wrapper.text()).toContain('4.9/5 Stars (2,400+ Reviews)')
  })

  it('renders scroll indicator', () => {
    const scrollButton = wrapper.findAll('button').find((btn: any) =>
      btn.attributes('aria-label')?.includes('Discover More')
    )
    expect(scrollButton).toBeDefined()
  })

  it('calls scrollToContent when scroll indicator is clicked', async () => {
    const scrollToSpy = vi.spyOn(window, 'scrollTo')
    const scrollButton = wrapper.findAll('button').find((btn: any) =>
      btn.attributes('aria-label')?.includes('Discover More')
    )
    await scrollButton?.trigger('click')
    expect(scrollToSpy).toHaveBeenCalledWith({
      top: window.innerHeight,
      behavior: 'smooth'
    })
  })

  it('shows image background on mobile', async () => {
    // Set mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 375
    })

    // Remount component
    wrapper.unmount()
    wrapper = mount(LandingHeroSection, {
      global: {
        stubs: {
          NuxtImg: NuxtImgStub,
          NuxtLink: NuxtLinkStub,
          commonIcon: CommonIconStub
        },
        directives: {
          motion: {
            mounted() {}
          }
        }
      }
    })

    await wrapper.vm.$nextTick()
    expect(wrapper.vm.isMobile).toBe(true)
  })

  it('has proper accessibility attributes', () => {
    const scrollButton = wrapper.findAll('button').find((btn: any) =>
      btn.attributes('aria-label')
    )
    expect(scrollButton?.attributes('aria-label')).toBeDefined()
  })

  it('renders with proper semantic HTML', () => {
    expect(wrapper.find('section').exists()).toBe(true)
    expect(wrapper.find('h1').exists()).toBe(true)
  })

  it('has minimum touch target size for mobile buttons', () => {
    const buttons = wrapper.findAll('button, a')
    buttons.forEach((button: any) => {
      // Check for min-h-[48px] class (48px is minimum touch target)
      const classes = button.attributes('class') || ''
      expect(
        classes.includes('min-h-[48px]') ||
        classes.includes('py-4') // padding gives enough height
      ).toBe(true)
    })
  })
})
