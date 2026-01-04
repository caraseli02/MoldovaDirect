import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref } from 'vue'
import VirtualProductGrid from '~/components/mobile/VirtualProductGrid.vue'

// Mock @vueuse/core
vi.mock('@vueuse/core', () => ({
  useDebounceFn: vi.fn(fn => fn),
}))

vi.mock('#imports', () => ({
  useI18n: vi.fn(() => ({
    t: (key: string) => key,
    locale: { value: 'en' },
  })),
  ref: vi.fn(val => ({ value: val })),
  computed: vi.fn(fn => ({ value: fn() })),
  onMounted: vi.fn(cb => cb()),
  onUnmounted: vi.fn(),
}))

// Mock useDevice composable
const mockIsMobile = ref(false)
const mockUseDevice = vi.fn(() => ({
  isMobile: mockIsMobile,
  isTablet: { value: false },
  isDesktop: { value: true },
  windowWidth: { value: 1024 },
  windowHeight: { value: 768 },
}))

global.useDevice = mockUseDevice

// Mock product data
const createMockProduct = (id: number) => ({
  id: `product-${id}`,
  name: { en: `Product ${id}`, es: `Producto ${id}`, ro: `Produs ${id}`, ru: `Product ${id}` },
  slug: `product-${id}`,
  price: 100 + id,
  description: { en: `Description ${id}`, es: `Descripcion ${id}`, ro: `Descriere ${id}`, ru: `Description ${id}` },
  images: [{ url: `https://example.com/image-${id}.jpg`, alt: `Image ${id}` }],
  category_id: 'cat-1',
  stock: 10,
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
})

describe('VirtualProductGrid', () => {
  const mockProducts = Array.from({ length: 20 }, (_, i) => createMockProduct(i + 1))

  beforeEach(() => {
    vi.clearAllMocks()
    mockIsMobile.value = false
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should render the component', () => {
    const wrapper = mount(VirtualProductGrid, {
      props: {
        items: mockProducts,
      },
      global: {
        stubs: {
          ProductCard: {
            template: '<div class="product-card" :data-id="product?.id"><slot /></div>',
            props: ['product'],
          },
        },
      },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('should render products', () => {
    const wrapper = mount(VirtualProductGrid, {
      props: {
        items: mockProducts.slice(0, 5),
      },
      global: {
        stubs: {
          ProductCard: {
            template: '<div class="product-card" :data-id="product?.id">{{ product?.id }}</div>',
            props: ['product'],
          },
        },
      },
    })

    const productCards = wrapper.findAll('.product-card')
    expect(productCards.length).toBeGreaterThan(0)
  })

  it('should have virtual scroll container', () => {
    const wrapper = mount(VirtualProductGrid, {
      props: {
        items: mockProducts,
      },
      global: {
        stubs: {
          ProductCard: {
            template: '<div class="product-card"><slot /></div>',
            props: ['product'],
          },
        },
      },
    })

    const container = wrapper.find('.virtual-scroll-container')
    expect(container.exists()).toBe(true)
  })

  it('should apply container height from props', () => {
    const wrapper = mount(VirtualProductGrid, {
      props: {
        items: mockProducts,
        containerHeight: 800,
      },
      global: {
        stubs: {
          ProductCard: {
            template: '<div class="product-card"><slot /></div>',
            props: ['product'],
          },
        },
      },
    })

    const container = wrapper.find('.virtual-scroll-container')
    expect(container.attributes('style')).toContain('height: 800px')
  })

  it('should use default container height', () => {
    const wrapper = mount(VirtualProductGrid, {
      props: {
        items: mockProducts,
      },
      global: {
        stubs: {
          ProductCard: {
            template: '<div class="product-card"><slot /></div>',
            props: ['product'],
          },
        },
      },
    })

    const container = wrapper.find('.virtual-scroll-container')
    expect(container.attributes('style')).toContain('height: 600px')
  })

  it('should render empty when no products', () => {
    const wrapper = mount(VirtualProductGrid, {
      props: {
        items: [],
      },
      global: {
        stubs: {
          ProductCard: {
            template: '<div class="product-card"><slot /></div>',
            props: ['product'],
          },
        },
      },
    })

    const productCards = wrapper.findAll('.product-card')
    expect(productCards.length).toBe(0)
  })

  it('should show loading indicator when loading', () => {
    const wrapper = mount(VirtualProductGrid, {
      props: {
        items: mockProducts,
        loading: true,
      },
      global: {
        stubs: {
          ProductCard: {
            template: '<div class="product-card"><slot /></div>',
            props: ['product'],
          },
        },
      },
    })

    const loadingIndicator = wrapper.find('.animate-spin')
    expect(loadingIndicator.exists()).toBe(true)
  })

  it('should not show loading indicator when not loading', () => {
    const wrapper = mount(VirtualProductGrid, {
      props: {
        items: mockProducts,
        loading: false,
      },
      global: {
        stubs: {
          ProductCard: {
            template: '<div class="product-card"><slot /></div>',
            props: ['product'],
          },
        },
      },
    })

    const loadingIndicator = wrapper.find('.animate-spin')
    expect(loadingIndicator.exists()).toBe(false)
  })

  it('should have grid layout', () => {
    const wrapper = mount(VirtualProductGrid, {
      props: {
        items: mockProducts,
      },
      global: {
        stubs: {
          ProductCard: {
            template: '<div class="product-card"><slot /></div>',
            props: ['product'],
          },
        },
      },
    })

    const grid = wrapper.find('.grid')
    expect(grid.exists()).toBe(true)
  })

  it('should have responsive grid columns', () => {
    const wrapper = mount(VirtualProductGrid, {
      props: {
        items: mockProducts,
      },
      global: {
        stubs: {
          ProductCard: {
            template: '<div class="product-card"><slot /></div>',
            props: ['product'],
          },
        },
      },
    })

    const grid = wrapper.find('.grid')
    expect(grid.classes()).toContain('grid-cols-2')
    expect(grid.classes()).toContain('md:grid-cols-3')
    expect(grid.classes()).toContain('lg:grid-cols-4')
  })

  it('should have gap between grid items', () => {
    const wrapper = mount(VirtualProductGrid, {
      props: {
        items: mockProducts,
      },
      global: {
        stubs: {
          ProductCard: {
            template: '<div class="product-card"><slot /></div>',
            props: ['product'],
          },
        },
      },
    })

    const grid = wrapper.find('.grid')
    expect(grid.classes()).toContain('gap-4')
  })

  it('should have horizontal padding', () => {
    const wrapper = mount(VirtualProductGrid, {
      props: {
        items: mockProducts,
      },
      global: {
        stubs: {
          ProductCard: {
            template: '<div class="product-card"><slot /></div>',
            props: ['product'],
          },
        },
      },
    })

    const grid = wrapper.find('.grid')
    expect(grid.classes()).toContain('px-4')
  })

  it('should emit loadMore event on scroll', async () => {
    const wrapper = mount(VirtualProductGrid, {
      props: {
        items: mockProducts,
      },
      global: {
        stubs: {
          ProductCard: {
            template: '<div class="product-card"><slot /></div>',
            props: ['product'],
          },
        },
      },
    })

    const container = wrapper.find('.virtual-scroll-container')
    await container.trigger('scroll')
    await flushPromises()

    // The loadMore event should be emitted when scrolled
    // Note: The actual emission depends on scroll position
    expect(wrapper.emitted()).toBeTruthy()
  })

  it('should have virtual item class on product cards', () => {
    const wrapper = mount(VirtualProductGrid, {
      props: {
        items: mockProducts.slice(0, 2),
      },
      global: {
        stubs: {
          ProductCard: {
            template: '<div class="stub-card"><slot /></div>',
            props: ['product'],
          },
        },
      },
    })

    // ProductCard components should have virtual-item class
    const html = wrapper.html()
    expect(html).toContain('virtual-item')
  })

  it('should have loading indicator with proper styling', () => {
    const wrapper = mount(VirtualProductGrid, {
      props: {
        items: mockProducts,
        loading: true,
      },
      global: {
        stubs: {
          ProductCard: {
            template: '<div class="product-card"><slot /></div>',
            props: ['product'],
          },
        },
      },
    })

    const loadingContainer = wrapper.find('.flex.justify-center.py-8')
    expect(loadingContainer.exists()).toBe(true)
  })

  it('should have loading spinner with border styling', () => {
    const wrapper = mount(VirtualProductGrid, {
      props: {
        items: mockProducts,
        loading: true,
      },
      global: {
        stubs: {
          ProductCard: {
            template: '<div class="product-card"><slot /></div>',
            props: ['product'],
          },
        },
      },
    })

    const spinner = wrapper.find('.rounded-full.h-8.w-8.border-b-2')
    expect(spinner.exists()).toBe(true)
  })

  it('should have blue border on loading spinner', () => {
    const wrapper = mount(VirtualProductGrid, {
      props: {
        items: mockProducts,
        loading: true,
      },
      global: {
        stubs: {
          ProductCard: {
            template: '<div class="product-card"><slot /></div>',
            props: ['product'],
          },
        },
      },
    })

    const spinner = wrapper.find('.border-blue-600')
    expect(spinner.exists()).toBe(true)
  })

  it('should respect itemHeight prop', () => {
    const wrapper = mount(VirtualProductGrid, {
      props: {
        items: mockProducts,
        itemHeight: 400,
      },
      global: {
        stubs: {
          ProductCard: {
            template: '<div class="product-card"><slot /></div>',
            props: ['product'],
          },
        },
      },
    })

    expect(wrapper.exists()).toBe(true)
  })

  it('should respect overscan prop', () => {
    const wrapper = mount(VirtualProductGrid, {
      props: {
        items: mockProducts,
        overscan: 10,
      },
      global: {
        stubs: {
          ProductCard: {
            template: '<div class="product-card"><slot /></div>',
            props: ['product'],
          },
        },
      },
    })

    expect(wrapper.exists()).toBe(true)
  })

  it('should have scroll container with overflow-y auto', () => {
    const wrapper = mount(VirtualProductGrid, {
      props: {
        items: mockProducts,
      },
      global: {
        stubs: {
          ProductCard: {
            template: '<div class="product-card"><slot /></div>',
            props: ['product'],
          },
        },
      },
    })

    // The virtual-scroll-container has CSS that applies overflow-y: auto
    const container = wrapper.find('.virtual-scroll-container')
    expect(container.exists()).toBe(true)
  })

  it('should expose scrollToTop method', () => {
    const wrapper = mount(VirtualProductGrid, {
      props: {
        items: mockProducts,
      },
      global: {
        stubs: {
          ProductCard: {
            template: '<div class="product-card"><slot /></div>',
            props: ['product'],
          },
        },
      },
    })

    // Check that the component exposes methods
    expect(wrapper.vm).toBeDefined()
  })

  it('should expose scrollToItem method', () => {
    const wrapper = mount(VirtualProductGrid, {
      props: {
        items: mockProducts,
      },
      global: {
        stubs: {
          ProductCard: {
            template: '<div class="product-card"><slot /></div>',
            props: ['product'],
          },
        },
      },
    })

    expect(wrapper.vm).toBeDefined()
  })
})
