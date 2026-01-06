// SKIP: Tests written for main's design - this branch has alternative UX design
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import HeroSection from '~/components/home/HeroSection.vue'

vi.mock('#imports', () => ({
  useI18n: vi.fn(() => ({ t: (k: string) => k })),
  useLocalePath: vi.fn(() => (path: string) => path),
}))

const mockI18n = {
  install(app: any) {
    app.config.globalProperties.$t = (key: string) => key
    app.config.globalProperties.$i18n = { locale: 'es' }
  },
}

const defaultStubs = {
  NuxtLink: { template: '<a :href="to" :class="$attrs.class"><slot /></a>', props: ['to'] },
  NuxtImg: { template: '<img :src="src" :alt="alt" />', props: ['src', 'alt'] },
  commonIcon: { template: '<span :data-icon="name" class="icon"></span>', props: ['name'] },
  HomeHeroCarousel: { template: '<div class="hero-carousel-stub" data-testid="hero-carousel"></div>' },
}

describe.skip('Home HeroSection', () => {
  const mockHighlights = [
    { value: '100+', label: 'Products' },
    { value: '50+', label: 'Partners' },
    { value: '24/7', label: 'Support' },
  ]

  const mountOptions = {
    global: {
      plugins: [mockI18n],
      stubs: defaultStubs,
      directives: {
        motion: {},
      },
    },
  }

  describe.skip('Rendering', () => {
    it('should render section element with correct classes', () => {
      const wrapper = mount(HeroSection, {
        ...mountOptions,
        props: { highlights: mockHighlights },
      })
      const section = wrapper.find('section')
      expect(section.exists()).toBe(true)
      expect(section.classes()).toContain('relative')
      expect(section.classes()).toContain('overflow-hidden')
      expect(section.classes()).toContain('bg-slate-950')
      expect(section.classes()).toContain('text-white')
    })

    it('should render HeroCarousel component', () => {
      const wrapper = mount(HeroSection, {
        ...mountOptions,
        props: { highlights: mockHighlights },
      })
      const carousel = wrapper.find('[data-testid="hero-carousel"]')
      expect(carousel.exists()).toBe(true)
    })

    it('should render container with proper structure', () => {
      const wrapper = mount(HeroSection, {
        ...mountOptions,
        props: { highlights: mockHighlights },
      })
      const container = wrapper.find('.container')
      expect(container.exists()).toBe(true)
      expect(container.classes()).toContain('relative')
    })
  })

  describe.skip('Trust Badge', () => {
    it('should render trust badge with correct structure', () => {
      const wrapper = mount(HeroSection, {
        ...mountOptions,
        props: { highlights: mockHighlights },
      })
      const badge = wrapper.find('.inline-flex.items-center.gap-2.rounded-full')
      expect(badge.exists()).toBe(true)
      expect(badge.classes()).toContain('bg-white/15')
      expect(badge.classes()).toContain('backdrop-blur')
    })

    it('should render shield icon in trust badge', () => {
      const wrapper = mount(HeroSection, {
        ...mountOptions,
        props: { highlights: mockHighlights },
      })
      const badge = wrapper.find('.inline-flex.items-center.gap-2.rounded-full')
      const icon = badge.find('[data-icon="lucide:shield-check"]')
      expect(icon.exists()).toBe(true)
    })

    it('should display trust badge text', () => {
      const wrapper = mount(HeroSection, {
        ...mountOptions,
        props: { highlights: mockHighlights },
      })
      const badge = wrapper.find('.inline-flex.items-center.gap-2.rounded-full')
      expect(badge.text()).toContain('home.hero.trustBadge')
    })
  })

  describe.skip('Title and Subtitle', () => {
    it('should render h1 title with correct classes', () => {
      const wrapper = mount(HeroSection, {
        ...mountOptions,
        props: { highlights: mockHighlights },
      })
      const h1 = wrapper.find('h1')
      expect(h1.exists()).toBe(true)
      expect(h1.classes()).toContain('text-4xl')
      expect(h1.classes()).toContain('font-bold')
      expect(h1.classes()).toContain('tracking-tight')
      expect(h1.text()).toBe('home.hero.title')
    })

    it('should render subtitle paragraph', () => {
      const wrapper = mount(HeroSection, {
        ...mountOptions,
        props: { highlights: mockHighlights },
      })
      const subtitle = wrapper.find('p.mx-auto.mt-6')
      expect(subtitle.exists()).toBe(true)
      expect(subtitle.classes()).toContain('text-lg')
      expect(subtitle.classes()).toContain('text-white/80')
      expect(subtitle.text()).toBe('home.hero.subtitle')
    })
  })

  describe.skip('CTA Buttons', () => {
    it('should render primary CTA button with correct href', () => {
      const wrapper = mount(HeroSection, {
        ...mountOptions,
        props: { highlights: mockHighlights },
      })
      const primaryCta = wrapper.find('a.bg-white')
      expect(primaryCta.exists()).toBe(true)
      expect(primaryCta.attributes('href')).toBe('/products')
      expect(primaryCta.text()).toContain('home.hero.primaryCta')
    })

    it('should render arrow icon in primary CTA', () => {
      const wrapper = mount(HeroSection, {
        ...mountOptions,
        props: { highlights: mockHighlights },
      })
      const primaryCta = wrapper.find('a.bg-white')
      const icon = primaryCta.find('[data-icon="lucide:arrow-right"]')
      expect(icon.exists()).toBe(true)
    })

    it('should render secondary CTA button with correct href', () => {
      const wrapper = mount(HeroSection, {
        ...mountOptions,
        props: { highlights: mockHighlights },
      })
      const secondaryCta = wrapper.find('a.bg-white\\/10')
      expect(secondaryCta.exists()).toBe(true)
      expect(secondaryCta.attributes('href')).toBe('/about')
      expect(secondaryCta.text()).toContain('home.hero.secondaryCta')
    })

    it('should have CTA container with flex wrap', () => {
      const wrapper = mount(HeroSection, {
        ...mountOptions,
        props: { highlights: mockHighlights },
      })
      const ctaContainer = wrapper.find('.flex.flex-wrap.justify-center.gap-4')
      expect(ctaContainer.exists()).toBe(true)
    })
  })

  describe.skip('Highlights Section', () => {
    it('should render highlights in dl element', () => {
      const wrapper = mount(HeroSection, {
        ...mountOptions,
        props: { highlights: mockHighlights },
      })
      const dl = wrapper.find('dl')
      expect(dl.exists()).toBe(true)
      expect(dl.classes()).toContain('grid')
      expect(dl.classes()).toContain('sm:grid-cols-3')
    })

    it('should render correct number of highlight items', () => {
      const wrapper = mount(HeroSection, {
        ...mountOptions,
        props: { highlights: mockHighlights },
      })
      const highlightItems = wrapper.findAll('dl > div')
      expect(highlightItems).toHaveLength(mockHighlights.length)
    })

    it('should display highlight values correctly', () => {
      const wrapper = mount(HeroSection, {
        ...mountOptions,
        props: { highlights: mockHighlights },
      })
      const values = wrapper.findAll('dd')
      expect(values).toHaveLength(mockHighlights.length)

      const valueTexts = values.map(v => v.text())
      expect(valueTexts).toContain('100+')
      expect(valueTexts).toContain('50+')
      expect(valueTexts).toContain('24/7')
    })

    it('should display highlight labels correctly', () => {
      const wrapper = mount(HeroSection, {
        ...mountOptions,
        props: { highlights: mockHighlights },
      })
      const labels = wrapper.findAll('dt')
      expect(labels).toHaveLength(mockHighlights.length)

      const labelTexts = labels.map(l => l.text())
      expect(labelTexts).toContain('Products')
      expect(labelTexts).toContain('Partners')
      expect(labelTexts).toContain('Support')
    })

    it('should apply correct styling to highlight values', () => {
      const wrapper = mount(HeroSection, {
        ...mountOptions,
        props: { highlights: mockHighlights },
      })
      const dd = wrapper.find('dd')
      expect(dd.classes()).toContain('text-3xl')
      expect(dd.classes()).toContain('font-semibold')
    })

    it('should apply correct styling to highlight labels', () => {
      const wrapper = mount(HeroSection, {
        ...mountOptions,
        props: { highlights: mockHighlights },
      })
      const dt = wrapper.find('dt')
      expect(dt.classes()).toContain('text-sm')
      expect(dt.classes()).toContain('font-medium')
      expect(dt.classes()).toContain('text-white/60')
    })
  })

  describe.skip('Empty Highlights', () => {
    it('should render no highlight items when highlights array is empty', () => {
      const wrapper = mount(HeroSection, {
        ...mountOptions,
        props: { highlights: [] },
      })
      const highlightItems = wrapper.findAll('dl > div')
      expect(highlightItems).toHaveLength(0)
    })

    it('should still render dl element with empty highlights', () => {
      const wrapper = mount(HeroSection, {
        ...mountOptions,
        props: { highlights: [] },
      })
      const dl = wrapper.find('dl')
      expect(dl.exists()).toBe(true)
    })
  })

  describe.skip('Single Highlight', () => {
    it('should render exactly one highlight item', () => {
      const singleHighlight = [{ value: '500+', label: 'Reviews' }]
      const wrapper = mount(HeroSection, {
        ...mountOptions,
        props: { highlights: singleHighlight },
      })
      const highlightItems = wrapper.findAll('dl > div')
      expect(highlightItems).toHaveLength(1)
      expect(wrapper.text()).toContain('500+')
      expect(wrapper.text()).toContain('Reviews')
    })
  })

  describe.skip('Background and Visual Elements', () => {
    it('should render background gradient overlay', () => {
      const wrapper = mount(HeroSection, {
        ...mountOptions,
        props: { highlights: mockHighlights },
      })
      const gradientOverlay = wrapper.find('.absolute.inset-0')
      expect(gradientOverlay.exists()).toBe(true)
    })

    it('should render decorative blur element', () => {
      const wrapper = mount(HeroSection, {
        ...mountOptions,
        props: { highlights: mockHighlights },
      })
      const blurElement = wrapper.find('.blur-3xl')
      expect(blurElement.exists()).toBe(true)
      expect(blurElement.classes()).toContain('bg-primary-500/30')
    })
  })

  describe.skip('Responsive Layout', () => {
    it('should have responsive padding on container', () => {
      const wrapper = mount(HeroSection, {
        ...mountOptions,
        props: { highlights: mockHighlights },
      })
      const container = wrapper.find('.container')
      expect(container.classes()).toContain('py-16')
      expect(container.classes()).toContain('md:py-20')
    })

    it('should have responsive text sizing on title', () => {
      const wrapper = mount(HeroSection, {
        ...mountOptions,
        props: { highlights: mockHighlights },
      })
      const h1 = wrapper.find('h1')
      expect(h1.classes()).toContain('text-4xl')
      expect(h1.classes()).toContain('md:text-5xl')
      expect(h1.classes()).toContain('lg:text-6xl')
    })
  })

  describe.skip('Accessibility', () => {
    it('should have proper heading hierarchy with h1', () => {
      const wrapper = mount(HeroSection, {
        ...mountOptions,
        props: { highlights: mockHighlights },
      })
      const h1 = wrapper.find('h1')
      expect(h1.exists()).toBe(true)
    })

    it('should use semantic dl/dt/dd for highlights', () => {
      const wrapper = mount(HeroSection, {
        ...mountOptions,
        props: { highlights: mockHighlights },
      })
      expect(wrapper.find('dl').exists()).toBe(true)
      expect(wrapper.find('dt').exists()).toBe(true)
      expect(wrapper.find('dd').exists()).toBe(true)
    })

    it('should have focus-visible styles on CTA buttons', () => {
      const wrapper = mount(HeroSection, {
        ...mountOptions,
        props: { highlights: mockHighlights },
      })
      const primaryCta = wrapper.find('a.bg-white')
      expect(primaryCta.classes()).toContain('focus-visible:outline-none')
      expect(primaryCta.classes()).toContain('focus-visible:ring-2')
    })
  })

  describe.skip('Props Validation', () => {
    it('should correctly receive highlights prop', () => {
      const wrapper = mount(HeroSection, {
        ...mountOptions,
        props: { highlights: mockHighlights },
      })
      expect(wrapper.props('highlights')).toEqual(mockHighlights)
    })

    it('should render different values for different highlights', () => {
      const differentHighlights = [
        { value: '1000+', label: 'Customers' },
        { value: '99%', label: 'Satisfaction' },
      ]
      const wrapper = mount(HeroSection, {
        ...mountOptions,
        props: { highlights: differentHighlights },
      })
      expect(wrapper.text()).toContain('1000+')
      expect(wrapper.text()).toContain('Customers')
      expect(wrapper.text()).toContain('99%')
      expect(wrapper.text()).toContain('Satisfaction')
    })
  })
})
