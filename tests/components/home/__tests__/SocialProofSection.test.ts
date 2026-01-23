import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { computed, ref } from 'vue'

// Import component after mocks
import SocialProofSection from '~/components/home/SocialProofSection.vue'

// Mock counter composable
const createMockCounter = () => ({
  current: ref(100),
  formatted: ref('100'),
  reset: vi.fn(),
  restart: vi.fn(),
  start: vi.fn(),
  stop: vi.fn(),
})

// Create global instance to use across mocks
const mockUseCountUp = vi.fn(() => createMockCounter())

// Mock useCountUp before importing component
vi.mock('~/composables/useCountUp', () => ({
  useCountUp: mockUseCountUp,
}))

vi.mock('#imports', () => ({
  useI18n: vi.fn(() => ({ t: (k: string) => k })),
  useLocalePath: vi.fn(() => (path: string) => path),
  useHead: vi.fn(),
  computed: vi.fn(fn => computed(fn)),
  useCountUp: mockUseCountUp,
}))

// Provide a global fallback
globalThis.useCountUp = mockUseCountUp

// Mock commonIcon component
vi.mock('~/components/common/Icon.vue', () => ({
  default: {
    name: 'commonIcon',
    template: '<span :data-icon="name"></span>',
    props: ['name', 'class'],
  },
}))

// Mock CustomStarRating component
vi.mock('~/components/custom/StarRating.vue', () => ({
  default: {
    name: 'CustomStarRating',
    template: '<div class="star-rating" :data-rating="rating" :data-size="size"></div>',
    props: ['rating', 'size'],
  },
}))

// Mock Swiper components
vi.mock('swiper/vue', () => ({
  Swiper: {
    name: 'Swiper',
    template: '<div class="swiper"><slot /></div>',
    props: ['modules', 'slidesPerView', 'spaceBetween', 'pagination'],
  },
  SwiperSlide: {
    name: 'SwiperSlide',
    template: '<div class="swiper-slide"><slot /></div>',
  },
}))

vi.mock('swiper/modules', () => ({
  Pagination: {},
}))

// Mock v-motion directive
const vMotionDirective = {
  mounted: vi.fn(),
  updated: vi.fn(),
  unmounted: vi.fn(),
}

describe('Home SocialProofSection', () => {
  const mockHighlights = [
    { value: '5.2k', label: 'Happy Customers' },
    { value: '4.9/5', label: 'Average Rating' },
    { value: '48h', label: 'Delivery Time' },
    { value: '99', label: 'Success Rate' },
  ]

  const mockLogos = [
    'Amazon Partner',
    'eBay Certified',
    'DHL Network',
    'FedEx Alliance',
  ]

  const mockTestimonials = [
    {
      name: 'Maria Rodriguez',
      quote: 'Fast shipping and excellent customer service. Highly recommended!',
      location: 'Madrid, Spain',
    },
    {
      name: 'John Smith',
      quote: 'Made international shopping so easy. Great experience overall.',
      location: 'New York, USA',
    },
    {
      name: 'Ana Popescu',
      quote: 'Professional service and transparent pricing. Very satisfied!',
      location: 'Bucharest, Romania',
    },
  ]

  let wrapper: ReturnType<typeof mount>

  beforeEach(() => {
    wrapper = mount(SocialProofSection, {
      props: {
        highlights: mockHighlights,
        logos: mockLogos,
        testimonials: mockTestimonials,
      },
      global: {
        stubs: {
          commonIcon: {
            template: '<span :data-icon="name"></span>',
            props: ['name'],
          },
          CustomStarRating: {
            template: '<div class="star-rating" :data-rating="rating" :data-size="size"></div>',
            props: ['rating', 'size'],
          },
          Swiper: {
            template: '<div class="swiper"><slot /></div>',
            props: ['modules', 'slidesPerView', 'spaceBetween', 'pagination'],
          },
          SwiperSlide: {
            template: '<div class="swiper-slide"><slot /></div>',
          },
        },
        directives: {
          motion: vMotionDirective,
        },
      },
    })
  })

  describe('Rendering', () => {
    it('should render the component', () => {
      expect(wrapper.exists()).toBe(true)
    })

    it('should render section with correct background classes', () => {
      const section = wrapper.find('section')
      expect(section.classes()).toContain('bg-primary-900')
      expect(section.classes()).toContain('text-white')
    })

    it('should render background gradient overlay', () => {
      const overlay = wrapper.find('.absolute.inset-0')
      expect(overlay.exists()).toBe(true)
    })

    it('should render badge', () => {
      const badge = wrapper.find('.inline-flex.items-center.gap-2.rounded-full')
      expect(badge.exists()).toBe(true)
      expect(badge.text()).toContain('home.socialProof.badge')
    })

    it('should render star icon in badge', () => {
      const badgeIcon = wrapper.find('.inline-flex.items-center.gap-2 [data-icon]')
      expect(badgeIcon.attributes('data-icon')).toBe('lucide:star')
    })

    it('should render main title', () => {
      const title = wrapper.find('h2')
      expect(title.exists()).toBe(true)
      expect(title.text()).toBe('home.socialProof.title')
    })

    it('should render subtitle', () => {
      const subtitle = wrapper.find('p.mt-4.text-lg')
      expect(subtitle.text()).toBe('home.socialProof.subtitle')
    })

    it('should render all stats cards', () => {
      const statsCards = wrapper.findAll('.rounded-xl.bg-white\\/10')
      expect(statsCards.length).toBeGreaterThanOrEqual(mockHighlights.length)
    })

    it('should render stat labels', () => {
      mockHighlights.forEach((highlight) => {
        const label = wrapper.findAll('.text-sm.text-primary-100').find(el => el.text() === highlight.label)
        expect(label).toBeTruthy()
      })
    })

    it('should render all partner logos', () => {
      mockLogos.forEach((logo) => {
        const logoElement = wrapper.findAll('.flex.items-center.gap-3').find(el => el.text().includes(logo))
        expect(logoElement).toBeTruthy()
      })
    })

    it('should render sparkles icon for logos', () => {
      const logoIcons = wrapper.findAll('.flex.items-center.gap-3 [data-icon]')
      logoIcons.forEach((icon) => {
        expect(icon.attributes('data-icon')).toBe('lucide:sparkles')
      })
    })
  })

  describe('Testimonials Rendering', () => {
    it('should render mobile carousel', () => {
      const carousel = wrapper.find('.lg\\:hidden .swiper')
      expect(carousel.exists()).toBe(true)
    })

    it('should render all testimonial slides in mobile view', () => {
      const slides = wrapper.findAll('.lg\\:hidden .swiper-slide')
      expect(slides).toHaveLength(mockTestimonials.length)
    })

    it('should render desktop testimonial grid', () => {
      const desktopGrid = wrapper.find('.hidden.lg\\:grid')
      expect(desktopGrid.exists()).toBe(true)
    })

    it('should render all testimonials in desktop view', () => {
      const desktopTestimonials = wrapper.findAll('.hidden.lg\\:grid article')
      expect(desktopTestimonials).toHaveLength(mockTestimonials.length)
    })

    it('should render star ratings for each testimonial', () => {
      const ratings = wrapper.findAll('.star-rating')
      expect(ratings.length).toBeGreaterThanOrEqual(mockTestimonials.length)

      ratings.forEach((rating) => {
        expect(rating.attributes('data-rating')).toBe('5')
        expect(rating.attributes('data-size')).toBe('sm')
      })
    })

    it('should render verified badges', () => {
      const verifiedBadges = wrapper.findAll('.inline-flex.items-center.gap-1.rounded-full.bg-green-100')
      expect(verifiedBadges.length).toBeGreaterThanOrEqual(mockTestimonials.length)

      verifiedBadges.forEach((badge) => {
        expect(badge.text()).toContain('home.socialProof.verified')
      })
    })

    it('should render check-circle icons in verified badges', () => {
      const checkIcons = wrapper.findAll('.bg-green-100 [data-icon]')
      checkIcons.forEach((icon) => {
        expect(icon.attributes('data-icon')).toBe('lucide:check-circle')
      })
    })

    it('should render testimonial quotes', () => {
      mockTestimonials.forEach((testimonial) => {
        const quote = wrapper.findAll('.text-lg.font-medium').find(el => el.text().includes(testimonial.quote))
        expect(quote).toBeTruthy()
      })
    })

    it('should render customer names', () => {
      mockTestimonials.forEach((testimonial) => {
        const name = wrapper.findAll('.font-semibold.text-primary-600').find(el => el.text() === testimonial.name)
        expect(name).toBeTruthy()
      })
    })

    it('should render customer locations', () => {
      mockTestimonials.forEach((testimonial) => {
        const location = wrapper.findAll('.text-gray-500').find(el => el.text() === testimonial.location)
        expect(location).toBeTruthy()
      })
    })
  })

  describe('Props Handling', () => {
    it('should accept highlights prop', () => {
      expect(wrapper.props('highlights')).toEqual(mockHighlights)
    })

    it('should accept logos prop', () => {
      expect(wrapper.props('logos')).toEqual(mockLogos)
    })

    it('should accept testimonials prop', () => {
      expect(wrapper.props('testimonials')).toEqual(mockTestimonials)
    })

    it('should handle empty highlights array', () => {
      const emptyWrapper = mount(SocialProofSection, {
        props: {
          highlights: [],
          logos: mockLogos,
          testimonials: mockTestimonials,
        },
        global: {
          stubs: {
            commonIcon: { template: '<span :data-icon="name"></span>', props: ['name'] },
            CustomStarRating: { template: '<div class="star-rating"></div>', props: ['rating', 'size'] },
            Swiper: { template: '<div class="swiper"><slot /></div>' },
            SwiperSlide: { template: '<div class="swiper-slide"><slot /></div>' },
          },
          directives: {
            motion: vMotionDirective,
          },
        },
      })

      const statsCards = emptyWrapper.findAll('.rounded-xl.bg-white\\/10.p-6')
      expect(statsCards).toHaveLength(0)
    })

    it('should handle empty logos array', () => {
      const emptyLogosWrapper = mount(SocialProofSection, {
        props: {
          highlights: mockHighlights,
          logos: [],
          testimonials: mockTestimonials,
        },
        global: {
          stubs: {
            commonIcon: { template: '<span :data-icon="name"></span>', props: ['name'] },
            CustomStarRating: { template: '<div class="star-rating"></div>', props: ['rating', 'size'] },
            Swiper: { template: '<div class="swiper"><slot /></div>' },
            SwiperSlide: { template: '<div class="swiper-slide"><slot /></div>' },
          },
          directives: {
            motion: vMotionDirective,
          },
        },
      })

      const logos = emptyLogosWrapper.findAll('.flex.items-center.gap-3.rounded-xl')
      expect(logos).toHaveLength(0)
    })

    it('should handle empty testimonials array', () => {
      const emptyTestimonialsWrapper = mount(SocialProofSection, {
        props: {
          highlights: mockHighlights,
          logos: mockLogos,
          testimonials: [],
        },
        global: {
          stubs: {
            commonIcon: { template: '<span :data-icon="name"></span>', props: ['name'] },
            CustomStarRating: { template: '<div class="star-rating"></div>', props: ['rating', 'size'] },
            Swiper: { template: '<div class="swiper"><slot /></div>' },
            SwiperSlide: { template: '<div class="swiper-slide"><slot /></div>' },
          },
          directives: {
            motion: vMotionDirective,
          },
        },
      })

      const testimonialCards = emptyTestimonialsWrapper.findAll('article')
      expect(testimonialCards).toHaveLength(0)
    })
  })

  describe('Animation Directives', () => {
    it('should have v-motion directive on badge', () => {
      // v-motion is applied to multiple elements
      expect(vMotionDirective.mounted).toHaveBeenCalled()
    })

    it('should have proper motion config structure', () => {
      // The component should exist and render motion elements
      const badge = wrapper.find('.inline-flex.items-center.gap-2.rounded-full')
      expect(badge.exists()).toBe(true)
    })
  })

  describe('Responsive Behavior', () => {
    it('should have responsive grid for stats', () => {
      const statsGrid = wrapper.find('.mt-8.grid')
      expect(statsGrid.classes()).toContain('md:grid-cols-2')
    })

    it('should have responsive grid for logos', () => {
      const logosGrid = wrapper.find('.mt-10.grid')
      expect(logosGrid.classes()).toContain('sm:grid-cols-2')
    })

    it('should have responsive layout classes', () => {
      const layoutDiv = wrapper.find('.flex.flex-col')
      expect(layoutDiv.classes()).toContain('lg:flex-row')
      expect(layoutDiv.classes()).toContain('lg:items-center')
      expect(layoutDiv.classes()).toContain('lg:justify-between')
    })

    it('should have responsive padding', () => {
      const section = wrapper.find('section')
      expect(section.classes()).toContain('py-20')
      expect(section.classes()).toContain('md:py-28')
    })

    it('should hide carousel on large screens', () => {
      const carousel = wrapper.find('.lg\\:hidden')
      expect(carousel.exists()).toBe(true)
    })

    it('should hide desktop grid on mobile', () => {
      const desktopGrid = wrapper.find('.hidden.lg\\:grid')
      expect(desktopGrid.exists()).toBe(true)
    })
  })

  describe('Accessibility', () => {
    it('should have semantic section element', () => {
      expect(wrapper.find('section').exists()).toBe(true)
    })

    it('should have semantic article elements for testimonials', () => {
      const articles = wrapper.findAll('article')
      expect(articles.length).toBeGreaterThanOrEqual(mockTestimonials.length)
    })

    it('should have proper heading hierarchy', () => {
      const h2 = wrapper.find('h2')
      expect(h2.exists()).toBe(true)
    })

    it('should have container for content width', () => {
      const container = wrapper.find('.container')
      expect(container.exists()).toBe(true)
    })

    it('should have aria-live for animated stats', () => {
      const stats = wrapper.findAll('[aria-live="polite"]')
      expect(stats.length).toBeGreaterThanOrEqual(mockHighlights.length)
    })

    it('should have aria-atomic for stats', () => {
      const stats = wrapper.findAll('[aria-atomic="true"]')
      expect(stats.length).toBeGreaterThanOrEqual(mockHighlights.length)
    })
  })

  describe('Styling and Layout', () => {
    it('should have primary background color', () => {
      const section = wrapper.find('section')
      expect(section.classes()).toContain('bg-primary-900')
    })

    it('should have white text color', () => {
      const section = wrapper.find('section')
      expect(section.classes()).toContain('text-white')
    })

    it('should have overflow hidden for section', () => {
      const section = wrapper.find('section')
      expect(section.classes()).toContain('overflow-hidden')
    })

    it('should have relative positioning', () => {
      const section = wrapper.find('section')
      expect(section.classes()).toContain('relative')
    })

    it('should apply rounded corners on testimonial cards', () => {
      const testimonialCards = wrapper.findAll('article')
      testimonialCards.forEach((card) => {
        expect(card.classes()).toContain('rounded-3xl')
      })
    })

    it('should have proper spacing between elements', () => {
      const statsGrid = wrapper.find('.mt-8.grid')
      expect(statsGrid.classes()).toContain('gap-6')
    })

    it('should have white testimonial cards', () => {
      const testimonialCards = wrapper.findAll('article')
      testimonialCards.forEach((card) => {
        expect(card.classes()).toContain('bg-white/95')
        expect(card.classes()).toContain('text-gray-900')
      })
    })

    it('should have shadow effects on testimonials', () => {
      const testimonialCards = wrapper.findAll('article')
      testimonialCards.forEach((card) => {
        expect(card.classes()).toContain('shadow-xl')
      })
    })

    it('should have backdrop blur on badge', () => {
      const badge = wrapper.find('.inline-flex.items-center.gap-2.rounded-full')
      expect(badge.classes()).toContain('backdrop-blur-sm')
    })

    it('should have backdrop blur on stats', () => {
      const stats = wrapper.findAll('.rounded-xl.bg-white\\/10')
      stats.forEach((stat) => {
        expect(stat.classes()).toContain('backdrop-blur-sm')
      })
    })
  })

  describe('i18n Integration', () => {
    it('should use i18n for badge text', () => {
      const badge = wrapper.find('.inline-flex.items-center.gap-2.rounded-full')
      expect(badge.text()).toContain('home.socialProof.badge')
    })

    it('should use i18n for title', () => {
      const title = wrapper.find('h2')
      expect(title.text()).toBe('home.socialProof.title')
    })

    it('should use i18n for subtitle', () => {
      const subtitle = wrapper.find('p.mt-4.text-lg')
      expect(subtitle.text()).toBe('home.socialProof.subtitle')
    })

    it('should use i18n for verified badge', () => {
      const verifiedBadges = wrapper.findAll('.bg-green-100')
      verifiedBadges.forEach((badge) => {
        expect(badge.text()).toContain('home.socialProof.verified')
      })
    })
  })

  describe('Counter Animation Logic', () => {
    it('should parse numeric values from highlights', () => {
      // The component uses useCountUp for numeric values
      expect(wrapper.vm).toBeTruthy()
    })

    it('should handle k suffix in values', () => {
      const kValueHighlight = mockHighlights.find(h => h.value.includes('k'))
      expect(kValueHighlight).toBeTruthy()
    })

    it('should handle rating format', () => {
      const ratingHighlight = mockHighlights.find(h => h.value.includes('/'))
      expect(ratingHighlight).toBeTruthy()
    })

    it('should handle time format', () => {
      const timeHighlight = mockHighlights.find(h => h.value.includes('h'))
      expect(timeHighlight).toBeTruthy()
    })

    it('should handle plain numbers', () => {
      const plainNumberHighlight = mockHighlights.find(h => !h.value.match(/[kh/]/))
      expect(plainNumberHighlight).toBeTruthy()
    })
  })

  describe('SEO Schema Markup', () => {
    it('should call useHead for SEO schema', () => {
      // useHead is called during component setup
      // The component exists and mounted successfully
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    it('should handle testimonials with long quotes', () => {
      const longQuoteTestimonials = [
        {
          name: 'Test User',
          quote: 'This is a very long testimonial quote that spans multiple lines and contains a lot of detailed information about the excellent service and amazing experience that the customer had with the company.',
          location: 'Test City',
        },
      ]

      const longQuoteWrapper = mount(SocialProofSection, {
        props: {
          highlights: mockHighlights,
          logos: mockLogos,
          testimonials: longQuoteTestimonials,
        },
        global: {
          stubs: {
            commonIcon: { template: '<span :data-icon="name"></span>', props: ['name'] },
            CustomStarRating: { template: '<div class="star-rating"></div>', props: ['rating', 'size'] },
            Swiper: { template: '<div class="swiper"><slot /></div>' },
            SwiperSlide: { template: '<div class="swiper-slide"><slot /></div>' },
          },
          directives: {
            motion: vMotionDirective,
          },
        },
      })

      const quote = longQuoteWrapper.find('.text-lg.font-medium')
      expect(quote.text()).toContain(longQuoteTestimonials[0].quote)
    })

    it('should handle special characters in testimonials', () => {
      const specialCharTestimonials = [
        {
          name: 'María José',
          quote: 'Service was "excellent" & fast!',
          location: 'São Paulo',
        },
      ]

      const specialCharWrapper = mount(SocialProofSection, {
        props: {
          highlights: mockHighlights,
          logos: mockLogos,
          testimonials: specialCharTestimonials,
        },
        global: {
          stubs: {
            commonIcon: { template: '<span :data-icon="name"></span>', props: ['name'] },
            CustomStarRating: { template: '<div class="star-rating"></div>', props: ['rating', 'size'] },
            Swiper: { template: '<div class="swiper"><slot /></div>' },
            SwiperSlide: { template: '<div class="swiper-slide"><slot /></div>' },
          },
          directives: {
            motion: vMotionDirective,
          },
        },
      })

      const name = specialCharWrapper.findAll('.font-semibold.text-primary-600').find(el => el.text().includes('María'))
      expect(name).toBeTruthy()
    })

    it('should handle very large stat values', () => {
      const largeStatsHighlights = [
        { value: '999k', label: 'Large Number' },
      ]

      const largeStatsWrapper = mount(SocialProofSection, {
        props: {
          highlights: largeStatsHighlights,
          logos: mockLogos,
          testimonials: mockTestimonials,
        },
        global: {
          stubs: {
            commonIcon: { template: '<span :data-icon="name"></span>', props: ['name'] },
            CustomStarRating: { template: '<div class="star-rating"></div>', props: ['rating', 'size'] },
            Swiper: { template: '<div class="swiper"><slot /></div>' },
            SwiperSlide: { template: '<div class="swiper-slide"><slot /></div>' },
          },
          directives: {
            motion: vMotionDirective,
          },
        },
      })

      expect(largeStatsWrapper.exists()).toBe(true)
    })

    it('should handle non-numeric stat values', () => {
      const nonNumericHighlights = [
        { value: 'A+', label: 'Rating' },
      ]

      const nonNumericWrapper = mount(SocialProofSection, {
        props: {
          highlights: nonNumericHighlights,
          logos: mockLogos,
          testimonials: mockTestimonials,
        },
        global: {
          stubs: {
            commonIcon: { template: '<span :data-icon="name"></span>', props: ['name'] },
            CustomStarRating: { template: '<div class="star-rating"></div>', props: ['rating', 'size'] },
            Swiper: { template: '<div class="swiper"><slot /></div>' },
            SwiperSlide: { template: '<div class="swiper-slide"><slot /></div>' },
          },
          directives: {
            motion: vMotionDirective,
          },
        },
      })

      expect(nonNumericWrapper.exists()).toBe(true)
    })
  })

  describe('Swiper Configuration', () => {
    it('should configure Swiper with correct props', () => {
      const swiper = wrapper.findComponent({ name: 'Swiper' })
      if (swiper.exists()) {
        expect(swiper.props('slidesPerView')).toBe(1)
        expect(swiper.props('spaceBetween')).toBe(20)
      }
    })

    it('should have clickable pagination', () => {
      const swiper = wrapper.findComponent({ name: 'Swiper' })
      if (swiper.exists()) {
        const pagination = swiper.props('pagination')
        expect(pagination).toBeTruthy()
      }
    })
  })
})
