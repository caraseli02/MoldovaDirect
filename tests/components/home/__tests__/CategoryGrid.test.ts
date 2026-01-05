import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import CategoryGrid from '~/components/home/CategoryGrid.vue'

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
  commonIcon: { template: '<span :data-icon="name" class="icon"></span>', props: ['name'] },
}

describe('Home CategoryGrid', () => {
  const mockCategories = [
    {
      key: 'wines',
      title: 'Premium Wines',
      description: 'Discover our selection',
      cta: 'Explore Wines',
      href: '/products/wines',
      icon: 'lucide:wine',
      accentBackground: 'bg-red-600',
      image: '/images/wines.jpg',
      imageAlt: 'Wine bottles',
    },
    {
      key: 'cheese',
      title: 'Artisan Cheese',
      description: 'From local producers',
      cta: 'Browse Cheese',
      href: '/products/cheese',
      icon: 'lucide:cheese',
      accentBackground: 'bg-yellow-500',
      image: '/images/cheese.jpg',
      imageAlt: 'Cheese selection',
    },
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

  describe('Rendering', () => {
    it('should render section element with proper structure', () => {
      const wrapper = mount(CategoryGrid, {
        ...mountOptions,
        props: { categories: mockCategories },
      })
      const section = wrapper.find('section')
      expect(section.exists()).toBe(true)
      expect(section.classes()).toContain('py-20')
      expect(section.classes()).toContain('md:py-28')
    })

    it('should render container inside section', () => {
      const wrapper = mount(CategoryGrid, {
        ...mountOptions,
        props: { categories: mockCategories },
      })
      const container = wrapper.find('.container')
      expect(container.exists()).toBe(true)
    })

    it('should render section header with title', () => {
      const wrapper = mount(CategoryGrid, {
        ...mountOptions,
        props: { categories: mockCategories },
      })
      const h2 = wrapper.find('h2')
      expect(h2.exists()).toBe(true)
      expect(h2.classes()).toContain('text-4xl')
      expect(h2.classes()).toContain('font-bold')
      expect(h2.text()).toBe('home.categories.title')
    })

    it('should render section subtitle paragraph', () => {
      const wrapper = mount(CategoryGrid, {
        ...mountOptions,
        props: { categories: mockCategories },
      })
      const subtitle = wrapper.find('p.mt-4')
      expect(subtitle.exists()).toBe(true)
      expect(subtitle.text()).toBe('home.categories.subtitle')
      expect(subtitle.classes()).toContain('text-gray-600')
    })
  })

  describe('Category Cards', () => {
    it('should render correct number of category cards in desktop grid', () => {
      const wrapper = mount(CategoryGrid, {
        ...mountOptions,
        props: { categories: mockCategories },
      })
      // Desktop grid articles
      const desktopArticles = wrapper.findAll('.hidden.gap-6 article')
      expect(desktopArticles).toHaveLength(mockCategories.length)
    })

    it('should render correct number of category cards in mobile carousel', () => {
      const wrapper = mount(CategoryGrid, {
        ...mountOptions,
        props: { categories: mockCategories },
      })
      // Mobile carousel articles
      const mobileArticles = wrapper.findAll('.md\\:hidden article')
      expect(mobileArticles).toHaveLength(mockCategories.length)
    })

    it('should display each category title correctly', () => {
      const wrapper = mount(CategoryGrid, {
        ...mountOptions,
        props: { categories: mockCategories },
      })
      const h3Elements = wrapper.findAll('h3')
      // Should have titles in both mobile and desktop views
      const titles = h3Elements.map(el => el.text())
      expect(titles).toContain('Premium Wines')
      expect(titles).toContain('Artisan Cheese')
    })

    it('should display each category description correctly', () => {
      const wrapper = mount(CategoryGrid, {
        ...mountOptions,
        props: { categories: mockCategories },
      })
      const descriptions = wrapper.findAll('.text-sm.text-white\\/85')
      const descTexts = descriptions.map(el => el.text())
      expect(descTexts).toContain('Discover our selection')
      expect(descTexts).toContain('From local producers')
    })

    it('should display each category CTA text', () => {
      const wrapper = mount(CategoryGrid, {
        ...mountOptions,
        props: { categories: mockCategories },
      })
      expect(wrapper.text()).toContain('Explore Wines')
      expect(wrapper.text()).toContain('Browse Cheese')
    })

    it('should render category images with correct src and alt', () => {
      const wrapper = mount(CategoryGrid, {
        ...mountOptions,
        props: { categories: mockCategories },
      })
      const images = wrapper.findAll('img')
      expect(images.length).toBeGreaterThanOrEqual(mockCategories.length)

      const imgSrcs = images.map(img => img.attributes('src'))
      const imgAlts = images.map(img => img.attributes('alt'))

      expect(imgSrcs).toContain('/images/wines.jpg')
      expect(imgSrcs).toContain('/images/cheese.jpg')
      expect(imgAlts).toContain('Wine bottles')
      expect(imgAlts).toContain('Cheese selection')
    })

    it('should render category icons with correct names', () => {
      const wrapper = mount(CategoryGrid, {
        ...mountOptions,
        props: { categories: mockCategories },
      })
      const icons = wrapper.findAll('[data-icon]')
      const iconNames = icons.map(icon => icon.attributes('data-icon'))
      expect(iconNames).toContain('lucide:wine')
      expect(iconNames).toContain('lucide:cheese')
    })

    it('should apply accent background class to overlay', () => {
      const wrapper = mount(CategoryGrid, {
        ...mountOptions,
        props: { categories: mockCategories },
      })
      const html = wrapper.html()
      expect(html).toContain('bg-red-600')
      expect(html).toContain('bg-yellow-500')
    })
  })

  describe('Links and Navigation', () => {
    it('should render view all link with correct href', () => {
      const wrapper = mount(CategoryGrid, {
        ...mountOptions,
        props: { categories: mockCategories },
      })
      const viewAllLink = wrapper.find('.cta-button')
      expect(viewAllLink.exists()).toBe(true)
      expect(viewAllLink.attributes('href')).toBe('/products')
      expect(viewAllLink.text()).toContain('home.categories.viewAll')
    })

    it('should render arrow icon in view all link', () => {
      const wrapper = mount(CategoryGrid, {
        ...mountOptions,
        props: { categories: mockCategories },
      })
      const viewAllLink = wrapper.find('.cta-button')
      const icon = viewAllLink.find('[data-icon="lucide:arrow-right"]')
      expect(icon.exists()).toBe(true)
    })

    it('should render category links with correct hrefs', () => {
      const wrapper = mount(CategoryGrid, {
        ...mountOptions,
        props: { categories: mockCategories },
      })
      const links = wrapper.findAll('a')
      const hrefs = links.map(link => link.attributes('href'))
      expect(hrefs).toContain('/products/wines')
      expect(hrefs).toContain('/products/cheese')
    })
  })

  describe('Empty State', () => {
    it('should render no category cards when categories array is empty', () => {
      const wrapper = mount(CategoryGrid, {
        ...mountOptions,
        props: { categories: [] },
      })
      const articles = wrapper.findAll('article')
      expect(articles).toHaveLength(0)
    })

    it('should still render header when categories are empty', () => {
      const wrapper = mount(CategoryGrid, {
        ...mountOptions,
        props: { categories: [] },
      })
      const h2 = wrapper.find('h2')
      expect(h2.exists()).toBe(true)
      expect(h2.text()).toBe('home.categories.title')
    })
  })

  describe('Single Category', () => {
    it('should render exactly one card for single category', () => {
      const singleCategory = [mockCategories[0]]
      const wrapper = mount(CategoryGrid, {
        ...mountOptions,
        props: { categories: singleCategory },
      })
      const desktopArticles = wrapper.findAll('.hidden.gap-6 article')
      expect(desktopArticles).toHaveLength(1)
    })
  })

  describe('Responsive Layout', () => {
    it('should have mobile carousel hidden on md screens', () => {
      const wrapper = mount(CategoryGrid, {
        ...mountOptions,
        props: { categories: mockCategories },
      })
      const mobileCarousel = wrapper.find('.mt-12.md\\:hidden')
      expect(mobileCarousel.exists()).toBe(true)
    })

    it('should have desktop grid hidden on small screens', () => {
      const wrapper = mount(CategoryGrid, {
        ...mountOptions,
        props: { categories: mockCategories },
      })
      const desktopGrid = wrapper.find('.hidden.gap-6.md\\:grid')
      expect(desktopGrid.exists()).toBe(true)
    })

    it('should have responsive grid columns on desktop', () => {
      const wrapper = mount(CategoryGrid, {
        ...mountOptions,
        props: { categories: mockCategories },
      })
      const desktopGrid = wrapper.find('.md\\:grid-cols-2')
      expect(desktopGrid.exists()).toBe(true)
      expect(desktopGrid.classes()).toContain('xl:grid-cols-4')
    })
  })

  describe('Styling', () => {
    it('should apply card styling classes', () => {
      const wrapper = mount(CategoryGrid, {
        ...mountOptions,
        props: { categories: mockCategories },
      })
      const cardLink = wrapper.find('.hover-lift')
      expect(cardLink.exists()).toBe(true)
      expect(cardLink.classes()).toContain('group')
      expect(cardLink.classes()).toContain('rounded-3xl')
      expect(cardLink.classes()).toContain('overflow-hidden')
    })

    it('should apply gradient overlay to cards', () => {
      const wrapper = mount(CategoryGrid, {
        ...mountOptions,
        props: { categories: mockCategories },
      })
      const gradient = wrapper.find('.bg-gradient-to-t')
      expect(gradient.exists()).toBe(true)
    })

    it('should apply min-height to card content', () => {
      const wrapper = mount(CategoryGrid, {
        ...mountOptions,
        props: { categories: mockCategories },
      })
      const content = wrapper.find('.min-h-\\[22rem\\]')
      expect(content.exists()).toBe(true)
    })
  })

  describe('Accessibility', () => {
    it('should have semantic section element', () => {
      const wrapper = mount(CategoryGrid, {
        ...mountOptions,
        props: { categories: mockCategories },
      })
      expect(wrapper.find('section').exists()).toBe(true)
    })

    it('should have proper heading hierarchy', () => {
      const wrapper = mount(CategoryGrid, {
        ...mountOptions,
        props: { categories: mockCategories },
      })
      const h2 = wrapper.find('h2')
      const h3s = wrapper.findAll('h3')
      expect(h2.exists()).toBe(true)
      expect(h3s.length).toBeGreaterThan(0)
    })

    it('should have article elements for categories', () => {
      const wrapper = mount(CategoryGrid, {
        ...mountOptions,
        props: { categories: mockCategories },
      })
      const articles = wrapper.findAll('article')
      expect(articles.length).toBeGreaterThanOrEqual(mockCategories.length)
    })
  })

  describe('Props Validation', () => {
    it('should correctly receive categories prop', () => {
      const wrapper = mount(CategoryGrid, {
        ...mountOptions,
        props: { categories: mockCategories },
      })
      expect(wrapper.props('categories')).toEqual(mockCategories)
    })

    it('should render different content for different categories', () => {
      const differentCategories = [
        {
          key: 'honey',
          title: 'Organic Honey',
          description: 'Pure and natural',
          cta: 'Shop Honey',
          href: '/products/honey',
          icon: 'lucide:droplet',
          accentBackground: 'bg-amber-500',
          image: '/images/honey.jpg',
          imageAlt: 'Honey jars',
        },
      ]
      const wrapper = mount(CategoryGrid, {
        ...mountOptions,
        props: { categories: differentCategories },
      })
      expect(wrapper.text()).toContain('Organic Honey')
      expect(wrapper.text()).toContain('Pure and natural')
      expect(wrapper.text()).toContain('Shop Honey')
    })
  })
})
