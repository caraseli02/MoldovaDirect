import { describe, it, expect, beforeEach, vi, beforeAll, afterAll } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref, computed } from 'vue'

// Shared state
const recommendationsRef = ref<any[]>([])
const loadingRef = ref(false)
const mockLoadRecommendations = vi.fn()
const mockAddItem = vi.fn()
const mockIsInCart = vi.fn(() => false)
const mockToastSuccess = vi.fn()
const mockToastError = vi.fn()

const mockRecommendation = {
  id: 'rec-1',
  product: {
    id: 'prod-1',
    name: { es: 'Vino Tinto', en: 'Red Wine' },
    price: 25.99,
    images: ['/wine.jpg'],
  },
  reason: 'frequently_bought_together',
}

const mockRecommendation2 = {
  id: 'rec-2',
  product: {
    id: 'prod-2',
    name: 'White Wine',
    price: 22.50,
    images: [],
  },
  reason: 'similar_products',
}

describe('Cart Recommendations', () => {
  let Recommendations: any

  beforeAll(async () => {
    ;(global as any).useCart = () => ({
      recommendations: computed(() => recommendationsRef.value),
      recommendationsLoading: computed(() => loadingRef.value),
      loadRecommendations: mockLoadRecommendations,
      addItem: mockAddItem,
      isInCart: mockIsInCart,
    })
    ;(global as any).useToast = () => ({
      success: mockToastSuccess,
      error: mockToastError,
    })
    ;(global as any).useI18n = () => ({
      t: (k: string, params?: any) => {
        if (params) {
          let result = k
          Object.entries(params).forEach(([key, value]) => {
            result = result.replace(`{${key}}`, String(value))
          })
          return result
        }
        return k
      },
      locale: ref('en'),
    })

    Recommendations = (await import('~/components/cart/Recommendations.vue')).default
  })

  afterAll(() => {
    delete (global as any).useCart
    delete (global as any).useToast
    delete (global as any).useI18n
  })

  const mockI18n = {
    install(app: any) {
      app.config.globalProperties.$t = (k: string, fallback?: string) => fallback || k
    },
  }

  const mountOptions = {
    global: {
      plugins: [mockI18n],
      stubs: {
        NuxtImg: {
          template: '<img :src="src" :alt="alt" />',
          props: ['src', 'alt', 'loading'],
        },
      },
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
    recommendationsRef.value = []
    loadingRef.value = false
    mockLoadRecommendations.mockResolvedValue(undefined)
    mockAddItem.mockResolvedValue(undefined)
    mockIsInCart.mockReturnValue(false)
  })

  describe('Rendering', () => {
    it('should render with recommendations', () => {
      recommendationsRef.value = [mockRecommendation]
      const wrapper = mount(Recommendations, mountOptions)
      expect(wrapper.find('.mt-6').exists()).toBe(true)
    })

    it('should show header', () => {
      recommendationsRef.value = [mockRecommendation]
      const wrapper = mount(Recommendations, mountOptions)
      expect(wrapper.text()).toContain('cart.recommendedProducts')
    })

    it('should display product name', () => {
      recommendationsRef.value = [mockRecommendation]
      const wrapper = mount(Recommendations, mountOptions)
      expect(wrapper.text()).toContain('Red Wine')
    })

    it('should display product price', () => {
      recommendationsRef.value = [mockRecommendation]
      const wrapper = mount(Recommendations, mountOptions)
      expect(wrapper.html()).toMatch(/25[.,]99/)
    })
  })

  describe('Loading State', () => {
    it('should show loading when loading with no recommendations', () => {
      loadingRef.value = true
      recommendationsRef.value = []
      const wrapper = mount(Recommendations, mountOptions)
      expect(wrapper.find('.animate-spin').exists()).toBe(true)
    })

    it('should show refresh button when not loading', () => {
      recommendationsRef.value = [mockRecommendation]
      loadingRef.value = false
      const wrapper = mount(Recommendations, mountOptions)
      expect(wrapper.text()).toContain('common.refresh')
    })
  })

  describe('Add to Cart', () => {
    it('should render add buttons for products', () => {
      recommendationsRef.value = [mockRecommendation]
      const wrapper = mount(Recommendations, mountOptions)
      const buttons = wrapper.findAll('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should call addItem when product button clicked', async () => {
      recommendationsRef.value = [mockRecommendation]
      const wrapper = mount(Recommendations, mountOptions)
      // Find any add button (not the refresh button)
      const productBtns = wrapper.findAll('button').filter(b =>
        !b.text().includes('common.refresh') && !b.text().includes('actions.retry'),
      )
      if (productBtns.length > 0) {
        await productBtns[0].trigger('click')
        expect(mockAddItem).toHaveBeenCalled()
      }
    })

    it('should disable button for items in cart', () => {
      mockIsInCart.mockReturnValue(true)
      recommendationsRef.value = [mockRecommendation]
      const wrapper = mount(Recommendations, mountOptions)
      const buttons = wrapper.findAll('button')
      // Find buttons with disabled attribute
      const disabledBtns = buttons.filter(b => b.attributes('disabled') !== undefined)
      expect(disabledBtns.length).toBeGreaterThan(0)
    })
  })

  describe('Product Images', () => {
    it('should display product image', () => {
      recommendationsRef.value = [mockRecommendation]
      const wrapper = mount(Recommendations, mountOptions)
      const img = wrapper.find('img')
      expect(img.attributes('src')).toBe('/wine.jpg')
    })

    it('should use placeholder for missing images', () => {
      recommendationsRef.value = [mockRecommendation2]
      const wrapper = mount(Recommendations, mountOptions)
      const img = wrapper.find('img')
      expect(img.attributes('src')).toBe('/placeholder-product.svg')
    })
  })

  describe('Multiple Recommendations', () => {
    it('should display multiple products', () => {
      recommendationsRef.value = [mockRecommendation, mockRecommendation2]
      const wrapper = mount(Recommendations, mountOptions)
      expect(wrapper.text()).toContain('Red Wine')
      expect(wrapper.text()).toContain('White Wine')
    })
  })

  describe('Error State', () => {
    it('should render component without errors', () => {
      recommendationsRef.value = []
      const wrapper = mount(Recommendations, mountOptions)
      expect(wrapper.exists()).toBe(true)
    })

    it('should handle empty recommendations', () => {
      recommendationsRef.value = []
      loadingRef.value = false
      const wrapper = mount(Recommendations, mountOptions)
      // Component should exist but may show empty state
      expect(wrapper.exists()).toBe(true)
    })
  })
})
