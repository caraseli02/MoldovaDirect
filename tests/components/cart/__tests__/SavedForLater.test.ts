import { describe, it, expect, beforeEach, vi, beforeAll, afterAll } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref, computed } from 'vue'

// Mock data
const mockItem = {
  id: 'saved-1',
  product: {
    id: 'prod-1',
    name: 'Red Wine',
    price: 25.99,
    images: ['/wine.jpg'],
  },
  quantity: 2,
  savedAt: new Date('2024-01-15'),
}

const mockItem2 = {
  id: 'saved-2',
  product: {
    id: 'prod-2',
    name: 'White Wine',
    price: 22.50,
    images: [],
  },
  quantity: 1,
  savedAt: new Date('2024-01-10'),
}

// Shared state
const itemsRef = ref<any[]>([])
const mockMoveToCart = vi.fn()
const mockRemoveFromSaved = vi.fn()
const mockToastSuccess = vi.fn()
const mockToastError = vi.fn()

describe('Cart SavedForLater', () => {
  let SavedForLater: any

  // Set up global mocks before loading component
  beforeAll(async () => {
    // Set up useCart mock on global
    ;(global as any).useCart = () => ({
      savedForLater: computed(() => itemsRef.value),
      savedForLaterCount: computed(() => itemsRef.value.length),
      moveToCartFromSavedForLater: mockMoveToCart,
      removeFromSavedForLater: mockRemoveFromSaved,
    })

    // Set up useToast mock on global
    ;(global as any).useToast = () => ({
      success: mockToastSuccess,
      error: mockToastError,
    })

    // Now import the component (it will use our mocks)
    SavedForLater = (await import('~/components/cart/SavedForLater.vue')).default
  })

  afterAll(() => {
    delete (global as any).useCart
    delete (global as any).useToast
  })

  const mockI18n = {
    install(app: any) {
      app.config.globalProperties.$t = (key: string) => key
    },
  }

  const mountOptions = {
    global: {
      plugins: [mockI18n],
      stubs: {
        NuxtImg: {
          template: '<img :src="src" :alt="alt" :loading="loading" />',
          props: ['src', 'alt', 'loading'],
        },
        Button: {
          template: '<button :class="[$attrs.class]" @click="$emit(\'click\')"><slot /></button>',
          props: ['variant', 'size'],
        },
      },
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
    itemsRef.value = []
    mockMoveToCart.mockResolvedValue(undefined)
    mockRemoveFromSaved.mockResolvedValue(undefined)
  })

  describe('Rendering', () => {
    it('should not render when no saved items', () => {
      itemsRef.value = []
      const wrapper = mount(SavedForLater, mountOptions)
      expect(wrapper.html()).toBe('<!--v-if-->')
    })

    it('should render when there are saved items', () => {
      itemsRef.value = [mockItem]
      const wrapper = mount(SavedForLater, mountOptions)
      expect(wrapper.find('.bg-white').exists()).toBe(true)
    })

    it('should display count in header', () => {
      itemsRef.value = [mockItem, mockItem2]
      const wrapper = mount(SavedForLater, mountOptions)
      expect(wrapper.text()).toContain('(2)')
    })

    it('should display all items', () => {
      itemsRef.value = [mockItem, mockItem2]
      const wrapper = mount(SavedForLater, mountOptions)
      expect(wrapper.text()).toContain('Red Wine')
      expect(wrapper.text()).toContain('White Wine')
    })
  })

  describe('Product Display', () => {
    it('should display product image', () => {
      itemsRef.value = [mockItem]
      const wrapper = mount(SavedForLater, mountOptions)
      const img = wrapper.find('img')
      expect(img.attributes('src')).toBe('/wine.jpg')
    })

    it('should display placeholder for missing images', () => {
      itemsRef.value = [mockItem2]
      const wrapper = mount(SavedForLater, mountOptions)
      const img = wrapper.find('img')
      expect(img.attributes('src')).toBe('/placeholder-product.svg')
    })

    it('should display product name', () => {
      itemsRef.value = [mockItem]
      const wrapper = mount(SavedForLater, mountOptions)
      expect(wrapper.text()).toContain('Red Wine')
    })

    it('should display quantity', () => {
      itemsRef.value = [mockItem]
      const wrapper = mount(SavedForLater, mountOptions)
      expect(wrapper.text()).toContain('× 2')
    })

    it('should use lazy loading', () => {
      itemsRef.value = [mockItem]
      const wrapper = mount(SavedForLater, mountOptions)
      const img = wrapper.find('img')
      expect(img.attributes('loading')).toBe('lazy')
    })
  })

  describe('Move to Cart', () => {
    it('should call moveToCart on button click', async () => {
      itemsRef.value = [mockItem]
      const wrapper = mount(SavedForLater, mountOptions)
      const btn = wrapper.findAll('button').find(b => b.text().includes('cart.moveToCart'))
      await btn?.trigger('click')
      expect(mockMoveToCart).toHaveBeenCalledWith('saved-1')
    })

    it('should show success toast', async () => {
      itemsRef.value = [mockItem]
      const wrapper = mount(SavedForLater, mountOptions)
      const btn = wrapper.findAll('button').find(b => b.text().includes('cart.moveToCart'))
      await btn?.trigger('click')
      await wrapper.vm.$nextTick()
      expect(mockToastSuccess).toHaveBeenCalled()
    })

    it('should show error toast on failure', async () => {
      mockMoveToCart.mockRejectedValue(new Error('Failed'))
      itemsRef.value = [mockItem]
      const wrapper = mount(SavedForLater, mountOptions)
      const btn = wrapper.findAll('button').find(b => b.text().includes('cart.moveToCart'))
      await btn?.trigger('click')
      await wrapper.vm.$nextTick()
      expect(mockToastError).toHaveBeenCalled()
    })
  })

  describe('Remove Item', () => {
    it('should call remove on button click', async () => {
      itemsRef.value = [mockItem]
      const wrapper = mount(SavedForLater, mountOptions)
      const btn = wrapper.findAll('button').find(b => b.text().includes('common.remove'))
      await btn?.trigger('click')
      expect(mockRemoveFromSaved).toHaveBeenCalledWith('saved-1')
    })

    it('should show success toast', async () => {
      itemsRef.value = [mockItem]
      const wrapper = mount(SavedForLater, mountOptions)
      const btn = wrapper.findAll('button').find(b => b.text().includes('common.remove'))
      await btn?.trigger('click')
      await wrapper.vm.$nextTick()
      expect(mockToastSuccess).toHaveBeenCalled()
    })

    it('should show error toast on failure', async () => {
      mockRemoveFromSaved.mockRejectedValue(new Error('Failed'))
      itemsRef.value = [mockItem]
      const wrapper = mount(SavedForLater, mountOptions)
      const btn = wrapper.findAll('button').find(b => b.text().includes('common.remove'))
      await btn?.trigger('click')
      await wrapper.vm.$nextTick()
      expect(mockToastError).toHaveBeenCalled()
    })
  })

  describe('Styling', () => {
    it('should have container styling', () => {
      itemsRef.value = [mockItem]
      const wrapper = mount(SavedForLater, mountOptions)
      expect(wrapper.find('.bg-white').exists()).toBe(true)
      expect(wrapper.find('.rounded-lg').exists()).toBe(true)
    })

    it('should have dark mode classes', () => {
      itemsRef.value = [mockItem]
      const wrapper = mount(SavedForLater, mountOptions)
      expect(wrapper.html()).toContain('dark:bg-gray-800')
    })
  })

  describe('Accessibility', () => {
    it('should have h3 heading', () => {
      itemsRef.value = [mockItem]
      const wrapper = mount(SavedForLater, mountOptions)
      expect(wrapper.find('h3').exists()).toBe(true)
    })

    it('should have alt text on images', () => {
      itemsRef.value = [mockItem]
      const wrapper = mount(SavedForLater, mountOptions)
      const img = wrapper.find('img')
      expect(img.attributes('alt')).toBe('Red Wine')
    })
  })

  describe('Edge Cases', () => {
    it('should handle long names', () => {
      itemsRef.value = [{ ...mockItem, product: { ...mockItem.product, name: 'Very Long Product Name Here' } }]
      const wrapper = mount(SavedForLater, mountOptions)
      expect(wrapper.text()).toContain('Very Long Product Name')
    })

    it('should handle high quantities', () => {
      itemsRef.value = [{ ...mockItem, quantity: 999 }]
      const wrapper = mount(SavedForLater, mountOptions)
      expect(wrapper.text()).toContain('999')
    })

    it('should handle empty images array', () => {
      itemsRef.value = [{ ...mockItem, product: { ...mockItem.product, images: [] } }]
      const wrapper = mount(SavedForLater, mountOptions)
      const img = wrapper.find('img')
      expect(img.attributes('src')).toBe('/placeholder-product.svg')
    })
  })
})
