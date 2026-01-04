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
  NuxtLink: { template: '<a :href="to"><slot /></a>', props: ['to'] },
  NuxtImg: { template: '<img :src="src" :alt="alt" />', props: ['src', 'alt'] },
  commonIcon: { template: '<span :data-icon="name"></span>', props: ['name'] },
  HomeHeroCarousel: { template: '<div class="hero-carousel-stub"></div>' },
}

describe('Home HeroSection', () => {
  const mountOptions = {
    global: {
      plugins: [mockI18n],
      stubs: defaultStubs,
      directives: {
        motion: {},
      },
    },
  }

  it('should render hero section', () => {
    const wrapper = mount(HeroSection, {
      ...mountOptions,
      props: {
        highlights: [],
      },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('should display hero title i18n key', () => {
    const wrapper = mount(HeroSection, {
      ...mountOptions,
      props: {
        highlights: [],
      },
    })
    expect(wrapper.text()).toContain('home.hero.title')
  })

  it('should show primary CTA button with i18n key', () => {
    const wrapper = mount(HeroSection, {
      ...mountOptions,
      props: {
        highlights: [],
      },
    })
    expect(wrapper.text()).toContain('home.hero.primaryCta')
  })

  it('should render hero carousel', () => {
    const wrapper = mount(HeroSection, {
      ...mountOptions,
      props: {
        highlights: [],
      },
    })
    expect(wrapper.find('.hero-carousel-stub').exists()).toBe(true)
  })

  it('should display highlights', () => {
    const wrapper = mount(HeroSection, {
      ...mountOptions,
      props: {
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
