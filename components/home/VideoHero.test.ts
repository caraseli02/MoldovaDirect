import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import VideoHero from './VideoHero.vue'

// Mock v-motion directive
const mockVMotion = {
  beforeMount: vi.fn(),
  updated: vi.fn(),
  unmounted: vi.fn(),
}

// Mock HTMLMediaElement.prototype.play for jsdom compatibility
beforeAll(() => {
  Object.defineProperty(HTMLMediaElement.prototype, 'play', {
    configurable: true,
    value: vi.fn().mockResolvedValue(undefined),
  })
})

// Common stubs configuration for all tests
const createGlobalStubs = () => ({
  global: {
    stubs: {
      NuxtLink: {
        template: '<a :to="to"><slot /></a>',
        props: ['to'],
      },
      NuxtImg: {
        template: '<img :src="src" :alt="alt" />',
        props: ['src', 'alt', 'preset', 'loading', 'fetchpriority', 'sizes', 'class'],
      },
      commonIcon: {
        template: '<span></span>',
        props: ['name', 'class'],
      },
    },
    directives: {
      motion: mockVMotion,
    },
  },
})

describe('VideoHero', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering modes', () => {
    it('renders video background when showVideo is true', () => {
      const wrapper = mount(VideoHero, {
        props: {
          title: 'Test Title',
          showVideo: true,
          videoWebM: '/test-video.webm',
          videoMp4: '/test-video.mp4',
        },
        ...createGlobalStubs(),
      })

      // Should render video element
      const video = wrapper.find('video')
      expect(video.exists()).toBe(true)

      // Should have correct video sources
      const sources = video.findAll('source')
      expect(sources.length).toBe(2)
      expect(sources[0].attributes('src')).toBe('/test-video.webm')
      expect(sources[0].attributes('type')).toBe('video/webm')
      expect(sources[1].attributes('src')).toBe('/test-video.mp4')
      expect(sources[1].attributes('type')).toBe('video/mp4')
    })

    it('renders background image when provided and video is disabled', () => {
      const wrapper = mount(VideoHero, {
        props: {
          title: 'Test Title',
          showVideo: false,
          backgroundImage: '/test-hero.jpg',
          backgroundImageAlt: 'Test hero image',
        },
        ...createGlobalStubs(),
      })

      // Should render background image (via stubbed NuxtImg)
      const img = wrapper.find('img')
      expect(img.exists()).toBe(true)
      expect(img.attributes('src')).toBe('/test-hero.jpg')
      expect(img.attributes('alt')).toBe('Test hero image')

      // Should not render video element
      const video = wrapper.find('video')
      expect(video.exists()).toBe(false)
    })
  })

  describe('Content rendering', () => {
    it('renders title correctly', () => {
      const wrapper = mount(VideoHero, {
        props: {
          title: 'Welcome to Moldova Direct',
        },
        ...createGlobalStubs(),
      })

      const title = wrapper.find('h1')
      expect(title.exists()).toBe(true)
      expect(title.text()).toBe('Welcome to Moldova Direct')
    })

    it('renders subtitle when provided', () => {
      const wrapper = mount(VideoHero, {
        props: {
          title: 'Test Title',
          subtitle: 'Discover authentic Moldovan products',
        },
        ...createGlobalStubs(),
      })

      const subtitle = wrapper.find('p')
      expect(subtitle.exists()).toBe(true)
      expect(subtitle.text()).toBe('Discover authentic Moldovan products')
    })

    it('does not render subtitle when not provided', () => {
      const wrapper = mount(VideoHero, {
        props: {
          title: 'Test Title',
        },
        ...createGlobalStubs(),
      })

      const paragraphs = wrapper.findAll('p')
      const subtitleParagraph = paragraphs.find(p => p.classes().includes('mb-6'))
      expect(subtitleParagraph).toBeUndefined()
    })
  })

  describe('CTA buttons', () => {
    it('renders both CTAs when both are provided', () => {
      const wrapper = mount(VideoHero, {
        props: {
          title: 'Test Title',
          primaryCta: {
            text: 'Shop Now',
            link: '/products',
          },
          secondaryCta: {
            text: 'Learn More',
            link: '/about',
          },
        },
        ...createGlobalStubs(),
      })

      expect(wrapper.text()).toContain('Shop Now')
      expect(wrapper.text()).toContain('Learn More')
    })
  })

  describe('Highlights/Stats', () => {
    it('renders highlights when provided', () => {
      const wrapper = mount(VideoHero, {
        props: {
          title: 'Test Title',
          highlights: [
            { value: '5,000+', label: 'Happy Customers' },
            { value: '200+', label: 'Products' },
            { value: '4.9/5', label: 'Rating' },
          ],
        },
        ...createGlobalStubs(),
      })

      // Check all highlights are rendered
      expect(wrapper.text()).toContain('5,000+')
      expect(wrapper.text()).toContain('Happy Customers')
      expect(wrapper.text()).toContain('200+')
      expect(wrapper.text()).toContain('Products')
      expect(wrapper.text()).toContain('4.9/5')
      expect(wrapper.text()).toContain('Rating')

      // Check grid layout
      const grid = wrapper.find('.grid.grid-cols-3')
      expect(grid.exists()).toBe(true)
    })

    it('does not render highlights section when array is empty', () => {
      const wrapper = mount(VideoHero, {
        props: {
          title: 'Test Title',
          highlights: [],
        },
        ...createGlobalStubs(),
      })

      const grid = wrapper.find('.grid.grid-cols-3')
      expect(grid.exists()).toBe(false)
    })
  })

  describe('Accessibility', () => {
    it('has semantic HTML structure', () => {
      const wrapper = mount(VideoHero, {
        props: {
          title: 'Test Title',
        },
        ...createGlobalStubs(),
      })

      // Should use section element
      expect(wrapper.find('section').exists()).toBe(true)

      // Should use h1 for title
      expect(wrapper.find('h1').exists()).toBe(true)
    })

    it('has proper text shadow for readability', () => {
      const wrapper = mount(VideoHero, {
        props: {
          title: 'Test Title',
          subtitle: 'Test Subtitle',
        },
        ...createGlobalStubs(),
      })

      const title = wrapper.find('h1')
      const subtitle = wrapper.find('p')

      expect(title.attributes('style')).toContain('text-shadow')
      expect(subtitle.attributes('style')).toContain('text-shadow')
    })
  })

  describe('Responsive design', () => {
    it('has mobile-first responsive classes', () => {
      const wrapper = mount(VideoHero, {
        props: {
          title: 'Test Title',
        },
        ...createGlobalStubs(),
      })

      const container = wrapper.find('.min-h-\\[60vh\\]')
      expect(container.exists()).toBe(true)
      expect(container.classes()).toContain('md:min-h-[75vh]')
    })
  })
})
