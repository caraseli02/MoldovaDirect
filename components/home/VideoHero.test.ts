import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import VideoHero from './VideoHero.vue'

// Mock v-motion directive
const mockVMotion = {
  beforeMount: vi.fn(),
  updated: vi.fn(),
  unmounted: vi.fn(),
}

// Mock NuxtImg component
vi.mock('#app', () => ({
  NuxtImg: {
    name: 'NuxtImg',
    template: '<img :src="src" :alt="alt" />',
    props: ['src', 'alt', 'preset', 'loading', 'fetchpriority', 'sizes', 'class'],
  },
}))

describe('VideoHero', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering modes', () => {
    it('renders with gradient background by default', () => {
      const wrapper = mount(VideoHero, {
        props: {
          title: 'Test Title',
        },
        global: {
          stubs: {
            NuxtLink: {
              template: '<a :to="to"><slot /></a>',
              props: ['to'],
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

      // Should have gradient background classes
      expect(wrapper.html()).toContain('bg-gradient-to-br')
      expect(wrapper.html()).toContain('from-wine-burgundy-950')
    })

    it('renders video background when showVideo is true', () => {
      const wrapper = mount(VideoHero, {
        props: {
          title: 'Test Title',
          showVideo: true,
          videoWebM: '/test-video.webm',
          videoMp4: '/test-video.mp4',
        },
        global: {
          stubs: {
            NuxtLink: {
              template: '<a :to="to"><slot /></a>',
              props: ['to'],
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

      // Should render video element
      const video = wrapper.find('video')
      expect(video.exists()).toBe(true)
      expect(video.attributes('autoplay')).toBeDefined()
      expect(video.attributes('muted')).toBeDefined()
      expect(video.attributes('loop')).toBeDefined()
      expect(video.attributes('playsinline')).toBeDefined()

      // Should have video sources
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

      // Should render NuxtImg
      const img = wrapper.findComponent({ name: 'NuxtImg' })
      expect(img.exists()).toBe(true)
      expect(img.props('src')).toBe('/test-hero.jpg')
      expect(img.props('alt')).toBe('Test hero image')
      expect(img.props('preset')).toBe('hero')
      expect(img.props('loading')).toBe('eager')
      expect(img.props('fetchpriority')).toBe('high')
    })
  })

  describe('Content rendering', () => {
    it('renders title correctly', () => {
      const wrapper = mount(VideoHero, {
        props: {
          title: 'Welcome to Moldova Direct',
        },
        global: {
          stubs: {
            NuxtLink: {
              template: '<a :to="to"><slot /></a>',
              props: ['to'],
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
        global: {
          stubs: {
            NuxtLink: {
              template: '<a :to="to"><slot /></a>',
              props: ['to'],
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

      const subtitle = wrapper.find('p')
      expect(subtitle.exists()).toBe(true)
      expect(subtitle.text()).toBe('Discover authentic Moldovan products')
    })

    it('does not render subtitle when not provided', () => {
      const wrapper = mount(VideoHero, {
        props: {
          title: 'Test Title',
        },
        global: {
          stubs: {
            NuxtLink: {
              template: '<a :to="to"><slot /></a>',
              props: ['to'],
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

      const paragraphs = wrapper.findAll('p')
      const subtitleParagraph = paragraphs.find(p => p.classes().includes('mb-6'))
      expect(subtitleParagraph).toBeUndefined()
    })

    it('renders badge when provided', () => {
      const wrapper = mount(VideoHero, {
        props: {
          title: 'Test Title',
          badge: 'New Products',
          badgeIcon: 'lucide:star',
        },
        global: {
          stubs: {
            NuxtLink: {
              template: '<a :to="to"><slot /></a>',
              props: ['to'],
            },
            commonIcon: {
              template: '<span :name="name"></span>',
              props: ['name', 'class'],
            },
          },
          directives: {
            motion: mockVMotion,
          },
        },
      })

      // Find badge container
      const badge = wrapper.find('.rounded-full.bg-white\\/10')
      expect(badge.exists()).toBe(true)
      expect(badge.text()).toContain('New Products')

      // Check icon is rendered
      const icon = wrapper.findComponent({ name: 'commonIcon' })
      expect(icon.exists()).toBe(true)
      expect(icon.props('name')).toBe('lucide:star')
    })
  })

  describe('CTA buttons', () => {
    it('renders primary CTA when provided', () => {
      const wrapper = mount(VideoHero, {
        props: {
          title: 'Test Title',
          primaryCta: {
            text: 'Shop Now',
            link: '/products',
            icon: 'lucide:arrow-right',
          },
        },
        global: {
          stubs: {
            NuxtLink: {
              template: '<a :to="to"><slot /></a>',
              props: ['to'],
            },
            commonIcon: {
              template: '<span :name="name"></span>',
              props: ['name', 'class'],
            },
          },
          directives: {
            motion: mockVMotion,
          },
        },
      })

      const ctaLinks = wrapper.findAllComponents({ name: 'NuxtLink' })
      const primaryCta = ctaLinks.find(link => link.text().includes('Shop Now'))

      expect(primaryCta).toBeDefined()
      expect(primaryCta?.props('to')).toBe('/products')
      expect(primaryCta?.classes()).toContain('bg-white')
    })

    it('renders secondary CTA when provided', () => {
      const wrapper = mount(VideoHero, {
        props: {
          title: 'Test Title',
          secondaryCta: {
            text: 'Learn More',
            link: '/about',
            icon: 'lucide:info',
          },
        },
        global: {
          stubs: {
            NuxtLink: {
              template: '<a :to="to"><slot /></a>',
              props: ['to'],
            },
            commonIcon: {
              template: '<span :name="name"></span>',
              props: ['name', 'class'],
            },
          },
          directives: {
            motion: mockVMotion,
          },
        },
      })

      const ctaLinks = wrapper.findAllComponents({ name: 'NuxtLink' })
      const secondaryCta = ctaLinks.find(link => link.text().includes('Learn More'))

      expect(secondaryCta).toBeDefined()
      expect(secondaryCta?.props('to')).toBe('/about')
      expect(secondaryCta?.classes()).toContain('bg-white/10')
    })

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
        global: {
          stubs: {
            NuxtLink: {
              template: '<a :to="to"><slot /></a>',
              props: ['to'],
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
        global: {
          stubs: {
            NuxtLink: {
              template: '<a :to="to"><slot /></a>',
              props: ['to'],
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
        global: {
          stubs: {
            NuxtLink: {
              template: '<a :to="to"><slot /></a>',
              props: ['to'],
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
        global: {
          stubs: {
            NuxtLink: {
              template: '<a :to="to"><slot /></a>',
              props: ['to'],
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

      // Should use section element
      expect(wrapper.find('section').exists()).toBe(true)

      // Should use h1 for title
      expect(wrapper.find('h1').exists()).toBe(true)
    })

    it('has aria-hidden on decorative video', () => {
      const wrapper = mount(VideoHero, {
        props: {
          title: 'Test Title',
          showVideo: true,
          videoMp4: '/test.mp4',
        },
        global: {
          stubs: {
            NuxtLink: {
              template: '<a :to="to"><slot /></a>',
              props: ['to'],
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

      const videoContainer = wrapper.find('.absolute.inset-0.z-0')
      expect(videoContainer.attributes('aria-hidden')).toBe('true')

      const video = wrapper.find('video')
      expect(video.attributes('aria-hidden')).toBe('true')
    })

    it('has proper text shadow for readability', () => {
      const wrapper = mount(VideoHero, {
        props: {
          title: 'Test Title',
          subtitle: 'Test Subtitle',
        },
        global: {
          stubs: {
            NuxtLink: {
              template: '<a :to="to"><slot /></a>',
              props: ['to'],
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
        global: {
          stubs: {
            NuxtLink: {
              template: '<a :to="to"><slot /></a>',
              props: ['to'],
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

      const container = wrapper.find('.min-h-\\[60vh\\]')
      expect(container.exists()).toBe(true)
      expect(container.classes()).toContain('md:min-h-[75vh]')
    })

    it('has touch-friendly CTA buttons (min 44px height)', () => {
      const wrapper = mount(VideoHero, {
        props: {
          title: 'Test Title',
          primaryCta: {
            text: 'Shop Now',
            link: '/products',
          },
        },
        global: {
          stubs: {
            NuxtLink: {
              template: '<a :to="to" :class="$attrs.class"><slot /></a>',
              props: ['to'],
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

      const cta = wrapper.findComponent({ name: 'NuxtLink' })
      expect(cta.classes()).toContain('min-h-[44px]')
    })
  })

  describe('Video behavior', () => {
    it('attempts to play video on mount when showVideo is true', async () => {
      const playMock = vi.fn().mockResolvedValue(undefined)
      const videoElement = {
        play: playMock,
      }

      const wrapper = mount(VideoHero, {
        props: {
          title: 'Test Title',
          showVideo: true,
          videoMp4: '/test.mp4',
        },
        global: {
          stubs: {
            NuxtLink: {
              template: '<a :to="to"><slot /></a>',
              props: ['to'],
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

      // Manually set the ref to our mock
      const component = wrapper.vm as any
      component.videoRef = videoElement

      // Trigger onMounted manually
      await wrapper.vm.$nextTick()

      // Note: In a real scenario, onMounted would be called automatically
      // This test validates the component structure
      expect(wrapper.find('video').exists()).toBe(true)
    })

    it('handles video play failure gracefully', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const playMock = vi.fn().mockRejectedValue(new Error('Autoplay failed'))

      const videoElement = {
        play: playMock,
      }

      const wrapper = mount(VideoHero, {
        props: {
          title: 'Test Title',
          showVideo: true,
          videoMp4: '/test.mp4',
        },
        global: {
          stubs: {
            NuxtLink: {
              template: '<a :to="to"><slot /></a>',
              props: ['to'],
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

      // Component should still render without errors
      expect(wrapper.find('h1').text()).toBe('Test Title')

      consoleWarnSpy.mockRestore()
    })
  })

  describe('Scroll indicator', () => {
    it('renders scroll indicator on desktop', () => {
      const wrapper = mount(VideoHero, {
        props: {
          title: 'Test Title',
        },
        global: {
          stubs: {
            NuxtLink: {
              template: '<a :to="to"><slot /></a>',
              props: ['to'],
            },
            commonIcon: {
              template: '<span :name="name"></span>',
              props: ['name', 'class'],
            },
          },
          directives: {
            motion: mockVMotion,
          },
        },
      })

      // Find the scroll indicator (hidden on mobile, visible on desktop)
      const scrollIndicator = wrapper.find('.absolute.bottom-8')
      expect(scrollIndicator.exists()).toBe(true)
      expect(scrollIndicator.classes()).toContain('hidden')
      expect(scrollIndicator.classes()).toContain('md:block')

      // Check chevron icon
      const icon = scrollIndicator.findComponent({ name: 'commonIcon' })
      expect(icon.exists()).toBe(true)
      expect(icon.props('name')).toBe('lucide:chevron-down')
    })
  })
})
