import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import VideoHero from '~/components/home/VideoHero.vue'

vi.mock('#imports', () => ({
  useI18n: vi.fn(() => ({ t: (k: string) => k })),
  onMounted: vi.fn(cb => cb()),
}))

// Mock HTMLMediaElement.play for JSDOM
beforeEach(() => {
  window.HTMLMediaElement.prototype.play = vi.fn().mockImplementation(() => Promise.resolve())
  window.HTMLMediaElement.prototype.pause = vi.fn()
})

const mockI18n = {
  install(app: any) {
    app.config.globalProperties.$t = (key: string) => key
    app.config.globalProperties.$i18n = { locale: 'es' }
  },
}

const defaultStubs = {
  NuxtLink: { template: '<a :href="to"><slot /></a>', props: ['to'] },
  NuxtImg: { template: '<img :src="src" :alt="alt" />', props: ['src', 'alt', 'preset', 'loading', 'fetchpriority', 'sizes'] },
  commonIcon: { template: '<span :data-icon="name"></span>', props: ['name'] },
}

describe('VideoHero - Enhanced', () => {
  const mountOptions = {
    global: {
      plugins: [mockI18n],
      stubs: defaultStubs,
      directives: {
        motion: {},
      },
    },
  }

  const mockProps = {
    title: 'Welcome to Moldova Direct',
    subtitle: 'Premium wines delivered',
    primaryCta: {
      text: 'Shop Now',
      link: '/products',
      icon: 'lucide:arrow-right',
    },
  }

  it('should render video hero', () => {
    const wrapper = mount(VideoHero, {
      ...mountOptions,
      props: mockProps,
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('should display video element when showVideo is true', () => {
    const wrapper = mount(VideoHero, {
      ...mountOptions,
      props: {
        ...mockProps,
        showVideo: true,
        videoMp4: '/videos/hero.mp4',
      },
    })
    const video = wrapper.find('video')
    expect(video.exists()).toBe(true)
  })

  it('should show hero title', () => {
    const wrapper = mount(VideoHero, {
      ...mountOptions,
      props: mockProps,
    })
    expect(wrapper.text()).toContain('Welcome to Moldova Direct')
  })

  it('should display subtitle', () => {
    const wrapper = mount(VideoHero, {
      ...mountOptions,
      props: mockProps,
    })
    expect(wrapper.text()).toContain('Premium wines delivered')
  })

  it('should have CTA button', () => {
    const wrapper = mount(VideoHero, {
      ...mountOptions,
      props: mockProps,
    })
    expect(wrapper.text()).toContain('Shop Now')
  })

  it('should display badge when provided', () => {
    const wrapper = mount(VideoHero, {
      ...mountOptions,
      props: {
        ...mockProps,
        badge: 'Premium Quality',
        badgeIcon: 'lucide:shield-check',
      },
    })
    expect(wrapper.text()).toContain('Premium Quality')
  })

  it('should display highlights when provided', () => {
    const wrapper = mount(VideoHero, {
      ...mountOptions,
      props: {
        ...mockProps,
        highlights: [
          { value: '100+', label: 'Products' },
          { value: '50+', label: 'Partners' },
        ],
      },
    })
    expect(wrapper.text()).toContain('100+')
    expect(wrapper.text()).toContain('Products')
  })
})
