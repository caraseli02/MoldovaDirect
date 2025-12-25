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

  describe('Error handling', () => {
    it('logs and flags load error', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const wrapper = mount(VideoHero, {
        props: {
          title: 'Test Title',
          showVideo: true,
          videoMp4: '/broken.mp4',
          posterImage: '/test-poster.jpg',
        },
        ...createGlobalStubs(),
      })

      wrapper.find('video').trigger('error')
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Video loading error:'),
        expect.objectContaining({ webmSrc: undefined, mp4Src: '/broken.mp4' }),
      )
      expect(wrapper.vm.videoLoadError).toBe(true)
    })

    it('logs source errors without crashing', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const wrapper = mount(VideoHero, {
        props: {
          title: 'Test Title',
          showVideo: true,
          videoWebm: '/broken.webm',
          videoMp4: '/test.mp4',
        },
        ...createGlobalStubs(),
      })

      const sources = wrapper.findAll('source')
      sources[0].trigger('error')
      expect(consoleWarnSpy).toHaveBeenCalled()
    })

    it('handles autoplay rejection gracefully', async () => {
      const playSpy = vi.fn().mockRejectedValue(new Error('Autoplay blocked'))
      Object.defineProperty(HTMLMediaElement.prototype, 'play', {
        configurable: true,
        value: playSpy,
      })
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const wrapper = mount(VideoHero, {
        props: {
          title: 'Test Title',
          showVideo: true,
          videoMp4: '/test-video.mp4',
          posterImage: '/test-poster.jpg',
        },
        ...createGlobalStubs(),
      })

      await wrapper.vm.$nextTick()
      expect(playSpy).toHaveBeenCalled()
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Video autoplay failed'),
        expect.objectContaining({ error: 'Autoplay blocked' }),
      )
    })
  })

  describe('Rendering modes', () => {
    it('renders video background when showVideo is true', () => {
      const wrapper = mount(VideoHero, {
        props: {
          title: 'Test Title',
          showVideo: true,
          videoWebm: '/test-video.webm',
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

      // Check stats layout (luxury design uses .hero-stats)
      const stats = wrapper.find('.hero-stats')
      expect(stats.exists()).toBe(true)
    })

    it('does not render highlights section when array is empty', () => {
      const wrapper = mount(VideoHero, {
        props: {
          title: 'Test Title',
          highlights: [],
        },
        ...createGlobalStubs(),
      })

      const stats = wrapper.find('.hero-stats')
      expect(stats.exists()).toBe(false)
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

    it('has proper styling classes for readability', () => {
      const wrapper = mount(VideoHero, {
        props: {
          title: 'Test Title',
          subtitle: 'Test Subtitle',
        },
        ...createGlobalStubs(),
      })

      // Luxury design applies text-shadow via CSS classes
      const title = wrapper.find('h1')
      const subtitle = wrapper.find('p')

      // Check elements exist and have proper classes
      expect(title.exists()).toBe(true)
      expect(title.classes()).toContain('hero-title')
      expect(subtitle.exists()).toBe(true)
      expect(subtitle.classes()).toContain('hero-subtitle')
    })
  })

  describe('Responsive design', () => {
    it('has full viewport height hero layout', () => {
      const wrapper = mount(VideoHero, {
        props: {
          title: 'Test Title',
        },
        ...createGlobalStubs(),
      })

      // Luxury design uses full viewport height (100vh)
      const container = wrapper.find('.min-h-\\[100vh\\]')
      expect(container.exists()).toBe(true)
    })
  })
})
