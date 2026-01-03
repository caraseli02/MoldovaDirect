import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import CategoryGrid from '~/components/home/CategoryGrid.vue'

vi.mock('#imports', () => ({
  useI18n: vi.fn(() => ({ t: (k: string) => k })),
  useLocalePath: vi.fn(() => (path: string) => path),
}))

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

  it('should render category grid', () => {
    const wrapper = mount(CategoryGrid, {
      props: { categories: mockCategories },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('should display all categories', () => {
    const wrapper = mount(CategoryGrid, {
      props: { categories: mockCategories },
    })
    expect(wrapper.text()).toContain('Premium Wines')
    expect(wrapper.text()).toContain('Artisan Cheese')
  })

  it('should render category images', () => {
    const wrapper = mount(CategoryGrid, {
      props: { categories: mockCategories },
    })
    const images = wrapper.findAll('img')
    expect(images.length).toBeGreaterThan(0)
  })

  it('should show category descriptions', () => {
    const wrapper = mount(CategoryGrid, {
      props: { categories: mockCategories },
    })
    expect(wrapper.text()).toContain('Discover our selection')
    expect(wrapper.text()).toContain('From local producers')
  })

  it('should render view all link', () => {
    const wrapper = mount(CategoryGrid, {
      props: { categories: mockCategories },
    })
    const links = wrapper.findAll('a')
    expect(links.length).toBeGreaterThan(0)
  })

  it('should display category icons', () => {
    const wrapper = mount(CategoryGrid, {
      props: { categories: mockCategories },
    })
    expect(wrapper.html()).toContain('lucide:wine')
  })
})
