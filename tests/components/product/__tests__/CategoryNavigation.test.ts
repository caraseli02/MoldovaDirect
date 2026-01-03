import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import CategoryNavigation from '~/components/product/CategoryNavigation.vue'

vi.mock('#imports', () => ({
  useI18n: vi.fn(() => ({
    t: (key: string) => key,
  })),
}))

describe('Product CategoryNavigation', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  const mockCategories = [
    {
      id: 'cat-1',
      name: 'Vinos Tintos',
      slug: 'vinos-tintos',
      icon: 'wine',
      productCount: 45,
      children: [
        { id: 'cat-1-1', name: 'Reserva', slug: 'reserva', productCount: 20 },
        { id: 'cat-1-2', name: 'Gran Reserva', slug: 'gran-reserva', productCount: 15 },
      ],
    },
    {
      id: 'cat-2',
      name: 'Vinos Blancos',
      slug: 'vinos-blancos',
      productCount: 30,
      children: [],
    },
  ]

  it('should render category navigation', () => {
    const wrapper = mount(CategoryNavigation, {
      props: { rootCategories: mockCategories },
    })

    expect(wrapper.find('.category-navigation').exists()).toBe(true)
  })

  it('should display all categories link', () => {
    const wrapper = mount(CategoryNavigation, {
      props: { rootCategories: mockCategories },
    })

    expect(wrapper.text()).toContain('products.categories.all')
  })

  it('should render root categories', () => {
    const wrapper = mount(CategoryNavigation, {
      props: { rootCategories: mockCategories },
    })

    expect(wrapper.text()).toContain('Vinos Tintos')
    expect(wrapper.text()).toContain('Vinos Blancos')
  })

  it('should display product counts when enabled', () => {
    const wrapper = mount(CategoryNavigation, {
      props: {
        rootCategories: mockCategories,
        showProductCount: true,
      },
    })

    expect(wrapper.text()).toContain('(45)')
    expect(wrapper.text()).toContain('(30)')
  })

  it('should not display product counts when disabled', () => {
    const wrapper = mount(CategoryNavigation, {
      props: {
        rootCategories: mockCategories,
        showProductCount: false,
      },
    })

    expect(wrapper.text()).not.toContain('(45)')
  })

  it('should show chevron icon for categories with children', () => {
    const wrapper = mount(CategoryNavigation, {
      props: { rootCategories: mockCategories },
    })

    const chevrons = wrapper.findAll('[name="lucide:chevron-down"]')
    expect(chevrons.length).toBeGreaterThan(0)
  })

  it('should show dropdown on category hover', async () => {
    const wrapper = mount(CategoryNavigation, {
      props: { rootCategories: mockCategories, isMobile: false },
    })

    const categoryButton = wrapper.find('button')
    await categoryButton.trigger('mouseenter')

    // Dropdown should appear with subcategories
    expect(wrapper.text()).toContain('Reserva')
    expect(wrapper.text()).toContain('Gran Reserva')
  })

  it('should highlight current category', () => {
    const wrapper = mount(CategoryNavigation, {
      props: {
        rootCategories: mockCategories,
        currentCategory: 'cat-1',
      },
    })

    const activeLink = wrapper.find('.text-blue-700')
    expect(activeLink.exists()).toBe(true)
  })

  it('should render mobile view when isMobile is true', () => {
    const wrapper = mount(CategoryNavigation, {
      props: {
        rootCategories: mockCategories,
        isMobile: true,
      },
    })

    expect(wrapper.find('.lg\\:hidden').exists()).toBe(true)
  })

  it('should render desktop view when isMobile is false', () => {
    const wrapper = mount(CategoryNavigation, {
      props: {
        rootCategories: mockCategories,
        isMobile: false,
      },
    })

    expect(wrapper.find('.hidden.lg\\:block').exists()).toBe(true)
  })
})
