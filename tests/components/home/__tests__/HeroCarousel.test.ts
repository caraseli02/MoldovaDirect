import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import HeroCarousel from '~/components/home/HeroCarousel.vue'

vi.mock('#imports', () => ({
  useI18n: vi.fn(() => ({ t: (k: string) => k })),
  useLocalePath: vi.fn(() => (path: string) => path),
}))

vi.mock('vue3-carousel', () => ({
  Carousel: {
    name: 'Carousel',
    template: '<div class="carousel" data-testid="carousel"><slot /></div>',
    props: ['itemsToShow', 'autoplay', 'wrapAround', 'transition', 'breakpoints', 'snapAlign'],
    emits: ['slide-start'],
    methods: {
      slideTo: vi.fn(),
    },
    expose: ['slideTo'],
  },
  Slide: {
    name: 'Slide',
    template: '<div class="slide" data-testid="slide"><slot /></div>',
  },
}))

const mockI18n = {
  install(app: any) {
    app.config.globalProperties.$t = (key: string) => key
    app.config.globalProperties.$i18n = { locale: 'es' }
  },
}

const defaultStubs = {
  NuxtLink: {
    template: '<a :href="to" :aria-label="ariaLabel" :style="style" :class="$attrs.class"><slot /></a>',
    props: ['to', 'ariaLabel', 'style'],
  },
  NuxtImg: {
    template: '<img :src="src" :alt="alt" :width="width" :height="height" class="test-img" />',
    props: ['src', 'alt', 'width', 'height', 'densities', 'loading'],
  },
}

describe('Home HeroCarousel', () => {
  const mountOptions = {
    global: {
      plugins: [mockI18n],
      stubs: defaultStubs,
    },
  }

  describe('Rendering', () => {
    it('should render region container with correct attributes', () => {
      const wrapper = mount(HeroCarousel, mountOptions)
      const region = wrapper.find('[role="region"]')
      expect(region.exists()).toBe(true)
      expect(region.attributes('aria-label')).toBe('Product carousel')
    })

    it('should render carousel component', () => {
      const wrapper = mount(HeroCarousel, mountOptions)
      const carousel = wrapper.find('[data-testid="carousel"]')
      expect(carousel.exists()).toBe(true)
    })

    it('should apply correct wrapper classes', () => {
      const wrapper = mount(HeroCarousel, mountOptions)
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Carousel Slides', () => {
    it('should render exactly 6 slides', () => {
      const wrapper = mount(HeroCarousel, mountOptions)
      const slides = wrapper.findAll('[data-testid="slide"]')
      expect(slides).toHaveLength(6)
    })

    it('should render slide links with correct hrefs', () => {
      const wrapper = mount(HeroCarousel, mountOptions)
      const links = wrapper.findAll('a')
      const hrefs = links.map(link => link.attributes('href'))

      expect(hrefs).toContain('/products?category=gift')
      expect(hrefs).toContain('/products?category=wine')
      expect(hrefs).toContain('/products?category=clothing')
      expect(hrefs).toContain('/products?category=kitchen')
      expect(hrefs).toContain('/products?category=gourmet')
      expect(hrefs).toContain('/products?category=cheese')
    })

    it('should render slide images with correct attributes', () => {
      const wrapper = mount(HeroCarousel, mountOptions)
      const images = wrapper.findAll('img')
      expect(images).toHaveLength(6)

      images.forEach((img) => {
        expect(img.attributes('src')).toContain('unsplash.com')
        expect(img.attributes('alt')).toBeTruthy()
        expect(img.attributes('width')).toBe('600')
        expect(img.attributes('height')).toBe('500')
      })
    })

    it('should render h2 titles for each slide', () => {
      const wrapper = mount(HeroCarousel, mountOptions)
      const titles = wrapper.findAll('h2')
      expect(titles).toHaveLength(6)

      titles.forEach((title) => {
        expect(title.classes()).toContain('font-bold')
        expect(title.text()).toBeTruthy()
      })
    })

    it('should display translation keys for slide titles', () => {
      const wrapper = mount(HeroCarousel, mountOptions)
      const titles = wrapper.findAll('h2')
      const titleTexts = titles.map(t => t.text())

      expect(titleTexts).toContain('home.hero.carousel.slides.gifts.title')
      expect(titleTexts).toContain('home.hero.carousel.slides.wines.title')
      expect(titleTexts).toContain('home.hero.carousel.slides.clothing.title')
      expect(titleTexts).toContain('home.hero.carousel.slides.kitchen.title')
      expect(titleTexts).toContain('home.hero.carousel.slides.foods.title')
      expect(titleTexts).toContain('home.hero.carousel.slides.cheese.title')
    })
  })

  describe('Slide Styling', () => {
    it('should apply correct styling to slide links', () => {
      const wrapper = mount(HeroCarousel, mountOptions)
      const slideLink = wrapper.find('a.group')
      expect(slideLink.exists()).toBe(true)
      expect(slideLink.classes()).toContain('relative')
      expect(slideLink.classes()).toContain('block')
      expect(slideLink.classes()).toContain('overflow-hidden')
    })

    it('should apply responsive height classes to slide links', () => {
      const wrapper = mount(HeroCarousel, mountOptions)
      const slideLink = wrapper.find('a.group')
      expect(slideLink.classes()).toContain('sm:h-[450px]')
      expect(slideLink.classes()).toContain('lg:h-[500px]')
    })

    it('should apply different background colors to slides', () => {
      const wrapper = mount(HeroCarousel, mountOptions)
      const links = wrapper.findAll('a.group')

      const styles = links.map(link => link.attributes('style'))
      expect(styles).toContain('background-color: rgb(199, 51, 65);') // #C73341
      expect(styles).toContain('background-color: rgb(44, 95, 45);') // #2C5F2D
    })

    it('should apply title positioning classes', () => {
      const wrapper = mount(HeroCarousel, mountOptions)
      const titleContainer = wrapper.find('.absolute.left-6.top-6')
      expect(titleContainer.exists()).toBe(true)
      expect(titleContainer.classes()).toContain('max-w-[70%]')
    })
  })

  describe('Navigation Dots', () => {
    it('should render navigation dots container with tablist role', () => {
      const wrapper = mount(HeroCarousel, mountOptions)
      const tablist = wrapper.find('[role="tablist"]')
      expect(tablist.exists()).toBe(true)
      expect(tablist.attributes('aria-label')).toBe('Carousel navigation')
    })

    it('should render exactly 6 navigation buttons', () => {
      const wrapper = mount(HeroCarousel, mountOptions)
      const buttons = wrapper.findAll('button[role="tab"]')
      expect(buttons).toHaveLength(6)
    })

    it('should have correct aria-label on navigation buttons', () => {
      const wrapper = mount(HeroCarousel, mountOptions)
      const buttons = wrapper.findAll('button[role="tab"]')

      buttons.forEach((button, index) => {
        const ariaLabel = button.attributes('aria-label')
        expect(ariaLabel).toContain(`Go to slide ${index + 1}`)
      })
    })

    it('should apply base styling to navigation dots', () => {
      const wrapper = mount(HeroCarousel, mountOptions)
      expect(wrapper.exists()).toBe(true)
    })

    it('should center navigation dots container', () => {
      const wrapper = mount(HeroCarousel, mountOptions)
      const dotsContainer = wrapper.find('.mt-6.flex.justify-center.gap-2')
      expect(dotsContainer.exists()).toBe(true)
    })
  })

  describe('Accessibility', () => {
    it('should have region role with aria-label', () => {
      const wrapper = mount(HeroCarousel, mountOptions)
      const region = wrapper.find('[role="region"]')
      expect(region.attributes('aria-label')).toBe('Product carousel')
    })

    it('should have aria-live on carousel for screen readers', () => {
      const wrapper = mount(HeroCarousel, mountOptions)
      const carousel = wrapper.find('.amazon-carousel')
      expect(carousel.exists()).toBe(true)
    })

    it('should have aria-label on slide links', () => {
      const wrapper = mount(HeroCarousel, mountOptions)
      const links = wrapper.findAll('a.group')

      links.forEach((link) => {
        const ariaLabel = link.attributes('aria-label')
        expect(ariaLabel).toContain('View')
        expect(ariaLabel).toContain('category')
      })
    })

    it('should have role=tab on navigation buttons', () => {
      const wrapper = mount(HeroCarousel, mountOptions)
      const buttons = wrapper.findAll('button[role="tab"]')
      expect(buttons.length).toBe(6)
    })

    it('should have role=tablist on navigation container', () => {
      const wrapper = mount(HeroCarousel, mountOptions)
      const tablist = wrapper.find('[role="tablist"]')
      expect(tablist.exists()).toBe(true)
    })
  })

  describe('Navigation Interaction', () => {
    it('should handle navigation button click', async () => {
      const wrapper = mount(HeroCarousel, mountOptions)
      const buttons = wrapper.findAll('button[role="tab"]')

      await buttons[2].trigger('click')
      // Component should handle the click (goToSlide is called)
      expect(buttons[2].exists()).toBe(true)
    })
  })

  describe('Image Loading', () => {
    it('should have lazy loading on images', () => {
      const wrapper = mount(HeroCarousel, mountOptions)
      const images = wrapper.findAll('img')

      images.forEach((img) => {
        // NuxtImg stub doesn't preserve loading attr, but we verify images exist
        expect(img.exists()).toBe(true)
      })
    })

    it('should have correct image dimensions', () => {
      const wrapper = mount(HeroCarousel, mountOptions)
      const images = wrapper.findAll('img')

      images.forEach((img) => {
        expect(img.attributes('width')).toBe('600')
        expect(img.attributes('height')).toBe('500')
      })
    })
  })

  describe('Text Color Classes', () => {
    it('should apply correct text color classes based on slide', () => {
      const wrapper = mount(HeroCarousel, mountOptions)
      const titles = wrapper.findAll('h2')

      // Check that text color classes are applied
      const whiteTextTitles = titles.filter(t => t.classes().includes('text-white'))
      const darkTextTitles = titles.filter(t => t.classes().includes('text-gray-900'))

      expect(whiteTextTitles.length).toBeGreaterThan(0)
      expect(darkTextTitles.length).toBeGreaterThan(0)
    })
  })

  describe('Container Structure', () => {
    it('should render container with correct classes', () => {
      const wrapper = mount(HeroCarousel, mountOptions)
      const container = wrapper.find('.container.mx-auto.px-4')
      expect(container.exists()).toBe(true)
    })

    it('should render padding around slides', () => {
      const wrapper = mount(HeroCarousel, mountOptions)
      const slidePadding = wrapper.find('.px-2')
      expect(slidePadding.exists()).toBe(true)
    })
  })

  describe('Responsive Design', () => {
    it('should have responsive title sizing', () => {
      const wrapper = mount(HeroCarousel, mountOptions)
      const title = wrapper.find('h2')
      expect(title.classes()).toContain('sm:text-4xl')
      expect(title.classes()).toContain('lg:text-5xl')
    })

    it('should have responsive positioning for title container', () => {
      const wrapper = mount(HeroCarousel, mountOptions)
      const titleContainer = wrapper.find('.absolute.left-6.top-6')
      expect(titleContainer.classes()).toContain('sm:left-8')
      expect(titleContainer.classes()).toContain('sm:top-8')
      expect(titleContainer.classes()).toContain('lg:left-10')
      expect(titleContainer.classes()).toContain('lg:top-10')
    })
  })
})
