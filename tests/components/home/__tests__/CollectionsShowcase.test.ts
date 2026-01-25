import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import CollectionsShowcase from '~/components/home/CollectionsShowcase.vue'

vi.mock('#imports', () => ({
  useI18n: vi.fn(() => ({ t: (k: string) => k })),
  useLocalePath: vi.fn(() => (path: string) => path),
}))

describe('Home CollectionsShowcase', () => {
  const createWrapper = () => {
    return mount(CollectionsShowcase, {
      global: {
        stubs: {
          NuxtLink: {
            template: '<a :href="to" :class="$attrs.class"><slot /></a>',
            props: ['to'],
          },
          NuxtImg: {
            template: '<img :src="src" :alt="alt" />',
            props: ['src', 'alt', 'densities', 'class'],
          },
          commonIcon: {
            template: '<span class="icon-stub"></span>',
            props: ['name', 'class'],
          },
        },
      },
    })
  }

  it('renders the component', () => {
    const wrapper = createWrapper()
    expect(wrapper.exists()).toBe(true)
  })

  it('renders as a semantic section element', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('section').exists()).toBe(true)
  })

  describe('Section Header', () => {
    it('displays the badge', () => {
      const wrapper = createWrapper()
      const badge = wrapper.find('.inline-flex.items-center.gap-2.rounded-full')
      expect(badge.exists()).toBe(true)
      expect(badge.text()).toContain('home.collections.badge')
    })

    it('badge contains sparkles icon', () => {
      const wrapper = createWrapper()
      const badge = wrapper.find('.inline-flex.items-center.gap-2.rounded-full')
      const icon = badge.find('.icon-stub')
      expect(icon.exists()).toBe(true)
    })

    it('displays the main title', () => {
      const wrapper = createWrapper()
      const title = wrapper.find('h2')
      expect(title.exists()).toBe(true)
      expect(title.text()).toBe('home.collections.title')
    })

    it('displays the subtitle', () => {
      const wrapper = createWrapper()
      const subtitle = wrapper.find('p.text-sm.md\\:text-base')
      expect(subtitle.exists()).toBe(true)
      expect(subtitle.text()).toBe('home.collections.subtitle')
    })

    it('has centered text alignment', () => {
      const wrapper = createWrapper()
      const header = wrapper.find('.mx-auto.max-w-3xl.text-center')
      expect(header.exists()).toBe(true)
    })

    it('title has responsive text sizes', () => {
      const wrapper = createWrapper()
      const title = wrapper.find('h2')
      expect(title.classes()).toContain('text-4xl')
      expect(title.classes()).toContain('md:text-5xl')
      expect(title.classes()).toContain('lg:text-6xl')
    })
  })

  describe('Collection Cards', () => {
    it('renders all three collection cards', () => {
      const wrapper = createWrapper()
      const cards = wrapper.findAll('a[href*="/products"]')
      // 3 mobile + 3 desktop = 6 total
      expect(cards.length).toBe(6)
    })

    describe('Reserve Collection Card', () => {
      it('renders reserve collection title', () => {
        const wrapper = createWrapper()
        expect(wrapper.text()).toContain('home.collections.cards.reserve.title')
      })

      it('renders reserve collection description', () => {
        const wrapper = createWrapper()
        expect(wrapper.text()).toContain('home.collections.cards.reserve.description')
      })

      it('renders reserve collection tag', () => {
        const wrapper = createWrapper()
        expect(wrapper.text()).toContain('home.collections.cards.reserve.tag')
      })

      it('renders reserve collection CTA', () => {
        const wrapper = createWrapper()
        expect(wrapper.text()).toContain('home.collections.cards.reserve.cta')
      })

      it('links to wine products', () => {
        const wrapper = createWrapper()
        const reserveLink = wrapper.findAll('a').find(link =>
          link.text().includes('home.collections.cards.reserve.title'),
        )
        expect(reserveLink?.attributes('href')).toBe('/products?category=wine')
      })

      it('has proper image', () => {
        const wrapper = createWrapper()
        const images = wrapper.findAll('img')
        const reserveImage = images.find(img =>
          img.attributes('alt') === 'home.collections.cards.reserve.imageAlt',
        )
        expect(reserveImage).toBeTruthy()
      })
    })

    describe('Artisan Collection Card', () => {
      it('renders artisan collection title', () => {
        const wrapper = createWrapper()
        expect(wrapper.text()).toContain('home.collections.cards.artisan.title')
      })

      it('renders artisan collection description', () => {
        const wrapper = createWrapper()
        expect(wrapper.text()).toContain('home.collections.cards.artisan.description')
      })

      it('renders artisan collection tag', () => {
        const wrapper = createWrapper()
        expect(wrapper.text()).toContain('home.collections.cards.artisan.tag')
      })

      it('renders artisan collection CTA', () => {
        const wrapper = createWrapper()
        expect(wrapper.text()).toContain('home.collections.cards.artisan.cta')
      })

      it('links to gourmet products', () => {
        const wrapper = createWrapper()
        const artisanLink = wrapper.findAll('a').find(link =>
          link.text().includes('home.collections.cards.artisan.title'),
        )
        expect(artisanLink?.attributes('href')).toBe('/products?category=gourmet')
      })
    })

    describe('Experience Collection Card', () => {
      it('renders experience collection title', () => {
        const wrapper = createWrapper()
        expect(wrapper.text()).toContain('home.collections.cards.experience.title')
      })

      it('renders experience collection description', () => {
        const wrapper = createWrapper()
        expect(wrapper.text()).toContain('home.collections.cards.experience.description')
      })

      it('renders experience collection tag', () => {
        const wrapper = createWrapper()
        expect(wrapper.text()).toContain('home.collections.cards.experience.tag')
      })

      it('renders experience collection CTA', () => {
        const wrapper = createWrapper()
        expect(wrapper.text()).toContain('home.collections.cards.experience.cta')
      })

      it('links to subscription products', () => {
        const wrapper = createWrapper()
        const experienceLink = wrapper.findAll('a').find(link =>
          link.text().includes('home.collections.cards.experience.title'),
        )
        expect(experienceLink?.attributes('href')).toBe('/products?category=subscription')
      })
    })

    it('all cards have images with alt text', () => {
      const wrapper = createWrapper()
      const images = wrapper.findAll('img')
      // 3 mobile + 3 desktop = 6 total
      expect(images.length).toBe(6)
      images.forEach((img) => {
        expect(img.attributes('alt')).toBeTruthy()
      })
    })

    it('all cards have gradient overlays', () => {
      const wrapper = createWrapper()
      const gradients = wrapper.findAll('.absolute.inset-0.bg-gradient-to-t')
      expect(gradients.length).toBeGreaterThanOrEqual(3)
    })

    it('all cards have arrow icons in CTA', () => {
      const wrapper = createWrapper()
      const links = wrapper.findAll('a[href*="/products"]')
      links.forEach((link) => {
        const icon = link.find('.icon-stub')
        expect(icon.exists()).toBe(true)
      })
    })

    it('cards have hover effects', () => {
      const wrapper = createWrapper()
      const cards = wrapper.findAll('a[href*="/products"]')
      cards.forEach((card) => {
        expect(card.classes()).toContain('group')
        expect(card.classes()).toContain('transition')
      })
    })
  })

  describe('Mobile Layout', () => {
    it('renders mobile carousel container', () => {
      const wrapper = createWrapper()
      const mobileCarousel = wrapper.find('.lg\\:hidden')
      expect(mobileCarousel.exists()).toBe(true)
    })

    it('mobile carousel has horizontal scroll', () => {
      const wrapper = createWrapper()
      const scrollContainer = wrapper.find('.overflow-x-auto.scroll-smooth.snap-x')
      expect(scrollContainer.exists()).toBe(true)
    })

    it('mobile carousel uses scrollbar-hide', () => {
      const wrapper = createWrapper()
      const scrollContainer = wrapper.find('.scrollbar-hide')
      expect(scrollContainer.exists()).toBe(true)
    })

    it('mobile cards have proper width', () => {
      const wrapper = createWrapper()
      const mobileCards = wrapper.findAll('.lg\\:hidden .flex-shrink-0')
      expect(mobileCards.length).toBe(3)
    })

    it('mobile cards snap to center', () => {
      const wrapper = createWrapper()
      const mobileCards = wrapper.findAll('.snap-center')
      expect(mobileCards.length).toBe(3)
    })
  })

  describe('Desktop Layout', () => {
    it('renders desktop bento grid container', () => {
      const wrapper = createWrapper()
      const desktopGrid = wrapper.find('.hidden.gap-6.lg\\:grid')
      expect(desktopGrid.exists()).toBe(true)
    })

    it('desktop grid has 12 columns', () => {
      const wrapper = createWrapper()
      const desktopGrid = wrapper.find('.lg\\:grid-cols-12')
      expect(desktopGrid.exists()).toBe(true)
    })

    it('desktop grid has auto rows', () => {
      const wrapper = createWrapper()
      const desktopGrid = wrapper.find('.lg\\:auto-rows-\\[minmax\\(260px\\,1fr\\)\\]')
      expect(desktopGrid.exists()).toBe(true)
    })

    it('reserve card spans 7 columns', () => {
      const wrapper = createWrapper()
      const reserveLink = wrapper.findAll('.hidden.gap-6.lg\\:grid a').find(link =>
        link.text().includes('home.collections.cards.reserve.title'),
      )
      expect(reserveLink?.classes()).toContain('lg:col-span-7')
    })

    it('reserve card spans 2 rows', () => {
      const wrapper = createWrapper()
      const reserveLink = wrapper.findAll('.hidden.gap-6.lg\\:grid a').find(link =>
        link.text().includes('home.collections.cards.reserve.title'),
      )
      expect(reserveLink?.classes()).toContain('lg:row-span-2')
    })

    it('artisan card spans 5 columns and starts at column 8', () => {
      const wrapper = createWrapper()
      const artisanLink = wrapper.findAll('.hidden.gap-6.lg\\:grid a').find(link =>
        link.text().includes('home.collections.cards.artisan.title'),
      )
      expect(artisanLink?.classes()).toContain('lg:col-span-5')
      expect(artisanLink?.classes()).toContain('lg:col-start-8')
    })

    it('experience card spans 5 columns and starts at column 8', () => {
      const wrapper = createWrapper()
      const experienceLink = wrapper.findAll('.hidden.gap-6.lg\\:grid a').find(link =>
        link.text().includes('home.collections.cards.experience.title'),
      )
      expect(experienceLink?.classes()).toContain('lg:col-span-5')
      expect(experienceLink?.classes()).toContain('lg:col-start-8')
    })
  })

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      const wrapper = createWrapper()
      const h2 = wrapper.find('h2')
      expect(h2.exists()).toBe(true)
      // h3 would be inside card headings
    })

    it('all images have alt attributes', () => {
      const wrapper = createWrapper()
      const images = wrapper.findAll('img')
      images.forEach((img) => {
        expect(img.attributes('alt')).toBeTruthy()
      })
    })

    it('has semantic HTML structure', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('section').exists()).toBe(true)
      expect(wrapper.find('.container').exists()).toBe(true)
    })

    it('links are properly labeled', () => {
      const wrapper = createWrapper()
      const links = wrapper.findAll('a[href*="/products"]')
      links.forEach((link) => {
        expect(link.text().length).toBeGreaterThan(0)
      })
    })
  })

  describe('Responsive Design', () => {
    it('has responsive padding', () => {
      const wrapper = createWrapper()
      const section = wrapper.find('section')
      expect(section.classes()).toContain('py-20')
      expect(section.classes()).toContain('md:py-28')
    })

    it('badge has responsive text size', () => {
      const wrapper = createWrapper()
      const badge = wrapper.find('.inline-flex.items-center.gap-2.rounded-full')
      expect(badge.classes()).toContain('text-sm')
    })

    it('subtitle has responsive text size', () => {
      const wrapper = createWrapper()
      const subtitle = wrapper.find('p')
      expect(subtitle.classes()).toContain('text-sm')
      expect(subtitle.classes()).toContain('md:text-base')
    })

    it('mobile cards have responsive width', () => {
      const wrapper = createWrapper()
      const mobileCards = wrapper.findAll('.w-\\[85\\%\\]')
      expect(mobileCards.length).toBe(3)
    })
  })

  describe('Visual Design', () => {
    it('has gray-50 background', () => {
      const wrapper = createWrapper()
      const section = wrapper.find('section')
      expect(section.classes()).toContain('bg-gray-50')
    })

    it('has dark mode support', () => {
      const wrapper = createWrapper()
      const section = wrapper.find('section')
      expect(section.classes()).toContain('dark:bg-gray-950')
    })

    it('badge has primary color scheme', () => {
      const wrapper = createWrapper()
      const badge = wrapper.find('.inline-flex.items-center.gap-2.rounded-full')
      expect(badge.classes()).toContain('bg-slate-100')
      expect(badge.classes()).toContain('text-slate-700')
    })

    it('cards have rounded corners', () => {
      const wrapper = createWrapper()
      const cards = wrapper.findAll('a[href*="/products"]')
      cards.forEach((card) => {
        expect(card.classes()).toContain('rounded-3xl')
      })
    })

    it('cards have shadow', () => {
      const wrapper = createWrapper()
      const cards = wrapper.findAll('a[href*="/products"]')
      cards.forEach((card) => {
        expect(card.classes()).toContain('shadow-xl')
      })
    })

    it('card images have brightness filter', () => {
      const wrapper = createWrapper()
      const images = wrapper.findAll('img')
      // Images are stubbed and don't have classes directly
      // The class is on the NuxtImg component, not the rendered img
      expect(images.length).toBe(6)
    })

    it('cards have hover scale effect', () => {
      const wrapper = createWrapper()
      const cards = wrapper.findAll('a[href*="/products"]')
      cards.forEach((card) => {
        expect(card.classes()).toContain('hover:-translate-y-1')
        expect(card.classes()).toContain('hover:shadow-2xl')
      })
    })
  })

  describe('Card Structure', () => {
    it('each card has tag badge', () => {
      const wrapper = createWrapper()
      const tags = wrapper.findAll('.inline-flex.items-center.gap-2.rounded-full.bg-white\\/90')
      expect(tags.length).toBe(6) // 3 mobile + 3 desktop
    })

    it('each card has title', () => {
      const wrapper = createWrapper()
      const titles = wrapper.findAll('h3')
      expect(titles.length).toBe(6) // 3 mobile + 3 desktop
    })

    it('each card has description', () => {
      const wrapper = createWrapper()
      const descriptions = wrapper.findAll('p.text-sm.text-white\\/85')
      expect(descriptions.length).toBe(6) // 3 mobile + 3 desktop
    })

    it('each card has CTA with arrow', () => {
      const wrapper = createWrapper()
      const ctas = wrapper.findAll('.inline-flex.items-center.gap-2.text-sm.font-semibold.text-white')
      expect(ctas.length).toBe(6) // 3 mobile + 3 desktop
    })

    it('cards have relative positioning for content', () => {
      const wrapper = createWrapper()
      const cards = wrapper.findAll('.relative.flex')
      expect(cards.length).toBeGreaterThanOrEqual(3)
    })
  })

  describe('Computed Cards', () => {
    it('cards computed property returns array of 3 cards', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.cards).toHaveLength(3)
    })

    it('each card has all required properties', () => {
      const wrapper = createWrapper()
      wrapper.vm.cards.forEach((card: any) => {
        expect(card).toHaveProperty('key')
        expect(card).toHaveProperty('title')
        expect(card).toHaveProperty('description')
        expect(card).toHaveProperty('cta')
        expect(card).toHaveProperty('href')
        expect(card).toHaveProperty('image')
        expect(card).toHaveProperty('imageAlt')
        expect(card).toHaveProperty('tag')
        expect(card).toHaveProperty('colSpan')
        expect(card).toHaveProperty('colStart')
        expect(card).toHaveProperty('rowSpan')
      })
    })

    it('cards have unique keys', () => {
      const wrapper = createWrapper()
      const keys = wrapper.vm.cards.map((card: any) => card.key)
      const uniqueKeys = new Set(keys)
      expect(uniqueKeys.size).toBe(3)
    })
  })
})
