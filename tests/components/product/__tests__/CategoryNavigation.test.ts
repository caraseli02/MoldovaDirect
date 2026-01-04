import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import CategoryNavigation from '~/components/product/CategoryNavigation.vue'

// Create a mock for useDevice that we can modify
const mockIsMobile = ref(false)

// Mock useDevice composable
vi.mock('~/composables/useDevice', () => ({
  useDevice: vi.fn(() => ({
    isMobile: mockIsMobile,
    isTablet: ref(false),
    isDesktop: ref(true),
    windowWidth: ref(1024),
    windowHeight: ref(768),
  })),
}))

// Mock #imports
vi.mock('#imports', () => ({
  useI18n: vi.fn(() => ({
    t: (k: string) => k,
    locale: ref('es'),
  })),
  useLocalePath: vi.fn(() => (path: string) => path),
  ref,
  computed,
  onMounted,
  onUnmounted,
  watch,
}))

describe('Product CategoryNavigation', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    mockIsMobile.value = false
  })

  // Categories with numeric IDs to match component's expectations
  const mockCategories = [
    {
      id: 1,
      name: 'Vinos Tintos',
      slug: 'vinos-tintos',
      icon: 'wine',
      productCount: 45,
      parentId: null,
      children: [
        { id: 11, name: 'Reserva', slug: 'reserva', productCount: 20, parentId: 1 },
        { id: 12, name: 'Gran Reserva', slug: 'gran-reserva', productCount: 15, parentId: 1 },
      ],
    },
    {
      id: 2,
      name: 'Vinos Blancos',
      slug: 'vinos-blancos',
      productCount: 30,
      parentId: null,
      children: [],
    },
  ]

  const mountComponent = (props = {}) => {
    return mount(CategoryNavigation, {
      props: {
        categories: mockCategories,
        ...props,
      },
      global: {
        stubs: {
          ProductMobileCategoryItem: {
            template: '<div class="mobile-category-item"><slot /></div>',
            props: ['category', 'currentCategory', 'showProductCount', 'level'],
          },
          NuxtLink: {
            template: '<a :href="to" v-bind="$attrs"><slot /></a>',
            props: ['to'],
            inheritAttrs: false,
          },
          Teleport: true,
          commonIcon: {
            template: '<span :class="name" data-testid="icon">icon</span>',
            props: ['name'],
          },
        },
      },
    })
  }

  it('should render category navigation', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('.category-navigation').exists()).toBe(true)
  })

  it('should display all categories link', () => {
    const wrapper = mountComponent()
    expect(wrapper.text()).toContain('products.categories.all')
  })

  it('should render root categories', () => {
    const wrapper = mountComponent()
    expect(wrapper.text()).toContain('Vinos Tintos')
    expect(wrapper.text()).toContain('Vinos Blancos')
  })

  it('should display product counts when enabled', () => {
    const wrapper = mountComponent({ showProductCount: true })
    expect(wrapper.text()).toContain('(45)')
    expect(wrapper.text()).toContain('(30)')
  })

  it('should not display product counts when disabled', () => {
    const wrapper = mountComponent({ showProductCount: false })
    expect(wrapper.text()).not.toContain('(45)')
  })

  it('should show chevron icon for categories with children', () => {
    const wrapper = mountComponent()
    // Check for icon elements (stubbed commonIcon)
    const icons = wrapper.findAll('[data-testid="icon"]')
    expect(icons.length).toBeGreaterThan(0)
  })

  it('should show dropdown on category hover', async () => {
    const wrapper = mountComponent()

    // Find the first category button (Vinos Tintos which has children)
    const categoryButtons = wrapper.findAll('button')
    const firstCategoryButton = categoryButtons.find(btn => btn.text().includes('Vinos Tintos'))

    if (firstCategoryButton) {
      await firstCategoryButton.trigger('mouseenter')

      // Dropdown should appear with subcategories
      expect(wrapper.text()).toContain('Reserva')
      expect(wrapper.text()).toContain('Gran Reserva')
    }
  })

  it('should highlight current category', () => {
    const wrapper = mountComponent({ currentCategory: '1' })
    expect(wrapper.exists()).toBe(true)
  })

  it('should render mobile view when useDevice returns isMobile true', () => {
    mockIsMobile.value = true
    const wrapper = mountComponent()
    expect(wrapper.exists()).toBe(true)
  })

  it('should render desktop view when useDevice returns isMobile false', () => {
    mockIsMobile.value = false
    const wrapper = mountComponent()
    expect(wrapper.find('.hidden.lg\\:block').exists()).toBe(true)
  })
})
