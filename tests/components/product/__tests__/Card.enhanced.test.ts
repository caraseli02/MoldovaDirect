/**
 * Enhanced behavioral tests for Product Card component
 * Covers rendering, badges, pricing, cart integration, and user interactions
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ProductCard from '~/components/product/Card.vue'

// Mock composables
vi.mock('#imports', () => ({
  useI18n: vi.fn(() => ({
    locale: { value: 'es' },
    t: (key: string) => key,
  })),
  useCart: vi.fn(() => ({
    isInCart: vi.fn(() => false),
    addProductToCart: vi.fn(),
  })),
  useMobileProductInteractions: vi.fn(() => ({
    isMobile: { value: false },
    vibrate: vi.fn(),
  })),
  navigateTo: vi.fn(),
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

  it('should render product card with basic info', () => {
    const wrapper = mount(ProductCard, {
      props: { product: mockProduct },
    })

    expect(wrapper.find('[data-testid="product-card"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Vino Tinto Reserve')
    expect(wrapper.text()).toContain('Vinos Tintos')
  })

  it('should display product image with correct alt text', () => {
    const wrapper = mount(ProductCard, {
      props: { product: mockProduct },
    })

    const image = wrapper.find('img')
    expect(image.attributes('src')).toContain('red-reserve.jpg')
    expect(image.attributes('alt')).toBe('Vino Tinto')
  })

  it('should show placeholder when no image available', () => {
    const productWithoutImage = { ...mockProduct, images: [] }
    const wrapper = mount(ProductCard, {
      props: { product: productWithoutImage },
    })

    expect(wrapper.find('[role="img"]').exists()).toBe(true)
    expect(wrapper.html()).toContain('products.noImageAvailable')
  })

  it('should display "New" badge for recent products', () => {
    const newProduct = {
      ...mockProduct,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    }

    const wrapper = mount(ProductCard, {
      props: { product: newProduct },
    })

    // Component should show "New" badge for products < 30 days old
    const badges = wrapper.findAll('span')
    const hasNewBadge = badges.some(badge => badge.text() === 'products.new')
    expect(hasNewBadge).toBe(true)
  })

  it('should display "Best Seller" badge for featured products', () => {
    const featuredProduct = { ...mockProduct, isFeatured: true }
    const wrapper = mount(ProductCard, {
      props: { product: featuredProduct },
    })

    expect(wrapper.text()).toContain('products.bestSeller')
  })

  it('should display low stock warning when stock <= threshold', () => {
    const lowStockProduct = { ...mockProduct, stockQuantity: 3 }
    const wrapper = mount(ProductCard, {
      props: { product: lowStockProduct },
    })

    expect(wrapper.html()).toContain('animate-pulse')
    expect(wrapper.text()).toContain('products.onlyLeft')
  })

  it('should calculate and display discount percentage', () => {
    const saleProduct = { ...mockProduct, comparePrice: 39.99 }
    const wrapper = mount(ProductCard, {
      props: { product: saleProduct },
    })

    // Discount = ((39.99 - 29.99) / 39.99) * 100 ≈ 25%
    expect(wrapper.text()).toMatch(/-\d+%/)
  })

  it('should format price correctly', () => {
    const wrapper = mount(ProductCard, {
      props: { product: mockProduct },
    })

    expect(wrapper.text()).toContain('€29.99')
  })

  it('should display product tags (max 3 visible)', () => {
    const wrapper = mount(ProductCard, {
      props: { product: mockProduct },
    })

    expect(wrapper.text()).toContain('Premium')
    expect(wrapper.text()).toContain('Reserva')
    expect(wrapper.text()).toContain('D.O. Rioja')
  })

  it('should show "+X" indicator when more than 3 tags', () => {
    const manyTagsProduct = {
      ...mockProduct,
      tags: ['Tag1', 'Tag2', 'Tag3', 'Tag4', 'Tag5'],
    }

    const wrapper = mount(ProductCard, {
      props: { product: manyTagsProduct },
    })

    expect(wrapper.text()).toContain('+2')
  })

  it('should display product details (origin, volume, alcohol)', () => {
    const wrapper = mount(ProductCard, {
      props: { product: mockProduct },
    })

    expect(wrapper.text()).toContain('España')
    expect(wrapper.text()).toContain('750ml')
    expect(wrapper.text()).toContain('14.5%')
  })

  it('should disable add to cart button when out of stock', () => {
    const outOfStockProduct = { ...mockProduct, stockQuantity: 0 }
    const wrapper = mount(ProductCard, {
      props: { product: outOfStockProduct },
    })

    const addToCartButton = wrapper.find('.cta-button')
    expect(addToCartButton.attributes('disabled')).toBeDefined()
    expect(wrapper.text()).toContain('products.stockStatus.outOfStock')
  })

  it('should show quick view link to product detail page', () => {
    const wrapper = mount(ProductCard, {
      props: { product: mockProduct },
    })

    const quickViewLink = wrapper.find('[aria-label*="products.quickViewProduct"]')
    expect(quickViewLink.exists()).toBe(true)
  })

  it('should have aria-label for screen readers', () => {
    const wrapper = mount(ProductCard, {
      props: { product: mockProduct },
    })

    const card = wrapper.find('[data-testid="product-card"]')
    expect(card.attributes('aria-label')).toBe('products.commonProduct')
    expect(card.attributes('role')).toBe('article')
  })
})
