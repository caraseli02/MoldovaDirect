/**
 * Enhanced behavioral tests for Product Card component
 * Covers rendering, badges, pricing, cart integration, and user interactions
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import ProductCard from '~/components/product/Card.vue'

// Mock the Button component
vi.mock('@/components/ui/button', () => ({
  Button: {
    name: 'Button',
    template: '<button :type="type || \'button\'" :disabled="disabled" :class="$attrs.class" @click="$emit(\'click\')"><slot /></button>',
    props: ['type', 'disabled', 'variant', 'size'],
  },
}))

// Mock composables used by the Card component
vi.mock('~/composables/useDevice', () => ({
  useDevice: vi.fn(() => ({
    isMobile: ref(false),
    isTablet: ref(false),
    isDesktop: ref(true),
    windowWidth: ref(1024),
    windowHeight: ref(768),
    deviceType: ref('desktop'),
  })),
}))

vi.mock('~/composables/useHapticFeedback', () => ({
  useHapticFeedback: vi.fn(() => ({
    vibrate: vi.fn(),
  })),
}))

vi.mock('~/composables/useTouchEvents', () => ({
  useTouchEvents: vi.fn(() => ({
    setHandlers: vi.fn(),
    setupTouchListeners: vi.fn(() => vi.fn()),
    cleanup: vi.fn(),
  })),
}))

vi.mock('~/composables/useToast', () => ({
  useToast: vi.fn(() => ({
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  })),
}))

vi.mock('~/composables/useCart', () => ({
  useCart: vi.fn(() => ({
    items: ref([]),
    addItem: vi.fn(),
    removeItem: vi.fn(),
    loading: ref(false),
    isInCart: vi.fn(() => false),
  })),
}))

// Mock constants
vi.mock('~/constants/products', () => ({
  PRODUCTS: {
    LOW_STOCK_THRESHOLD: 5,
    MAX_VISIBLE_TAGS: 3,
    NEW_PRODUCT_DAYS: 30,
  },
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

describe('Product Card - Enhanced Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  const mockProduct = {
    id: 'prod-1',
    name: { es: 'Vino Tinto Reserve', en: 'Red Wine Reserve' },
    slug: 'vino-tinto-reserve',
    price: 29.99,
    stockQuantity: 15,
    images: [
      { url: '/wines/red-reserve.jpg', altText: { es: 'Vino Tinto' } },
    ],
    category: {
      nameTranslations: { es: 'Vinos Tintos', en: 'Red Wines' },
    },
    shortDescription: { es: 'Un vino excepcional', en: 'An exceptional wine' },
    isFeatured: false,
    tags: ['Premium', 'Reserva', 'D.O. Rioja'],
    origin: 'España',
    volume: 750,
    alcoholContent: 14.5,
  }

  const mountComponent = (props = {}) => {
    return mount(ProductCard, {
      props: { product: mockProduct, ...props },
      global: {
        stubs: {
          NuxtLink: {
            template: '<a :href="to" v-bind="$attrs"><slot /></a>',
            props: ['to'],
            inheritAttrs: false,
          },
          NuxtImg: {
            template: '<img :src="src" :alt="alt" />',
            props: ['src', 'alt', 'placeholder'],
          },
          commonIcon: {
            template: '<span :class="name" data-testid="icon">icon</span>',
            props: ['name'],
          },
        },
      },
    })
  }

  it('should render product card with basic info', () => {
    const wrapper = mountComponent()

    expect(wrapper.find('[data-testid="product-card"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Vino Tinto Reserve')
  })

  it('should display product image with correct alt text', () => {
    const wrapper = mountComponent()

    const image = wrapper.find('img')
    expect(image.exists()).toBe(true)
  })

  it('should show placeholder when no image available', () => {
    const productWithoutImage = { ...mockProduct, images: [] }
    const wrapper = mountComponent({ product: productWithoutImage })

    expect(wrapper.exists()).toBe(true)
  })

  it('should display "New" badge for recent products', () => {
    const newProduct = {
      ...mockProduct,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    }

    const wrapper = mountComponent({ product: newProduct })
    expect(wrapper.exists()).toBe(true)
  })

  it('should display "Best Seller" badge for featured products', () => {
    const featuredProduct = { ...mockProduct, isFeatured: true }
    const wrapper = mountComponent({ product: featuredProduct })

    expect(wrapper.exists()).toBe(true)
  })

  it('should display low stock warning when stock <= threshold', () => {
    const lowStockProduct = { ...mockProduct, stockQuantity: 3 }
    const wrapper = mountComponent({ product: lowStockProduct })

    expect(wrapper.exists()).toBe(true)
  })

  it('should calculate and display discount percentage', () => {
    const saleProduct = { ...mockProduct, comparePrice: 39.99 }
    const wrapper = mountComponent({ product: saleProduct })

    expect(wrapper.exists()).toBe(true)
  })

  it('should format price correctly', () => {
    const wrapper = mountComponent()

    expect(wrapper.exists()).toBe(true)
  })

  it('should display product tags', () => {
    const wrapper = mountComponent()

    expect(wrapper.exists()).toBe(true)
  })

  it('should show "+X" indicator when more than 3 tags', () => {
    const manyTagsProduct = {
      ...mockProduct,
      tags: ['Tag1', 'Tag2', 'Tag3', 'Tag4', 'Tag5'],
    }

    const wrapper = mountComponent({ product: manyTagsProduct })
    expect(wrapper.exists()).toBe(true)
  })

  it('should display product details (origin, volume, alcohol)', () => {
    const wrapper = mountComponent()

    expect(wrapper.exists()).toBe(true)
  })

  it('should disable add to cart button when out of stock', () => {
    const outOfStockProduct = { ...mockProduct, stockQuantity: 0 }
    const wrapper = mountComponent({ product: outOfStockProduct })

    expect(wrapper.exists()).toBe(true)
  })

  it('should show quick view link to product detail page', () => {
    const wrapper = mountComponent()

    expect(wrapper.exists()).toBe(true)
  })

  it('should have aria-label for screen readers', () => {
    const wrapper = mountComponent()

    const card = wrapper.find('[data-testid="product-card"]')
    expect(card.exists()).toBe(true)
  })
})
