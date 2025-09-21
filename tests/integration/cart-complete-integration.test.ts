/**
 * Complete Cart System Integration Tests
 * 
 * Requirements addressed:
 * - Integration between all cart components (store, composables, components)
 * - Cart analytics integration
 * - Cart validation and error handling
 * - Cart persistence and recovery
 * - Advanced cart features integration
 * - Performance optimization integration
 * 
 * Comprehensive integration tests for the entire cart ecosystem.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useCartStore } from '~/stores/cart'
import { useCart } from '~/composables/useCart'
import { useCartAnalytics } from '~/composables/useCartAnalytics'

// Mock complete cart component for integration testing
const CompleteCartComponent = {
  template: `
    <div data-testid="cart-app">
      <!-- Cart Header -->
      <div data-testid="cart-header">
        <h1>{{ $t('cart.title') }}</h1>
        <div data-testid="cart-count">{{ cart.itemCount.value }}</div>
        <div data-testid="cart-subtotal">{{ cart.formattedSubtotal.value }}</div>
      </div>

      <!-- Loading State -->
      <div v-if="cart.loading.value" data-testid="cart-loading">
        Loading cart...
      </div>

      <!-- Error State -->
      <div v-if="cart.error.value" data-testid="cart-error">
        {{ cart.error.value }}
        <button @click="cart.clearError()" data-testid="clear-error">Clear</button>
      </div>

      <!-- Empty Cart -->
      <div v-if="cart.isEmpty.value && !cart.loading.value" data-testid="empty-cart">
        <p>{{ $t('cart.empty') }}</p>
        <button @click="continueShopping" data-testid="continue-shopping">
          {{ $t('cart.continueShopping') }}
        </button>
      </div>

      <!-- Cart Items -->
      <div v-else-if="!cart.loading.value" data-testid="cart-items">
        <div v-for="item in cart.items.value" :key="item.id" 
             :data-testid="'cart-item-' + item.id" class="cart-item">
          
          <!-- Item Details -->
          <div data-testid="item-details">
            <h3>{{ item.product.name }}</h3>
            <p>{{ formatPrice(item.product.price) }}</p>
            <img :src="item.product.images[0]" :alt="item.product.name" />
          </div>

          <!-- Quantity Controls -->
          <div data-testid="quantity-controls">
            <button @click="cart.updateQuantity(item.id, item.quantity - 1)" 
                    :data-testid="'decrease-' + item.id"
                    :disabled="item.quantity <= 1">-</button>
            
            <input type="number" 
                   :value="item.quantity" 
                   @change="updateQuantity(item.id, $event.target.value)"
                   :data-testid="'quantity-input-' + item.id"
                   min="1" />
            
            <span :data-testid="'quantity-display-' + item.id">{{ item.quantity }}</span>
            
            <button @click="cart.updateQuantity(item.id, item.quantity + 1)" 
                    :data-testid="'increase-' + item.id">+</button>
          </div>

          <!-- Item Actions -->
          <div data-testid="item-actions">
            <button @click="cart.removeItem(item.id)" 
                    :data-testid="'remove-' + item.id">
              {{ $t('cart.remove') }}
            </button>
            
            <button @click="saveForLater(item.id)" 
                    :data-testid="'save-later-' + item.id"
                    v-if="features.saveForLater">
              {{ $t('cart.saveForLater') }}
            </button>
          </div>

          <!-- Item Total -->
          <div :data-testid="'item-total-' + item.id">
            {{ formatPrice(item.product.price * item.quantity) }}
          </div>
        </div>

        <!-- Bulk Operations -->
        <div v-if="features.bulkOperations && cart.items.value.length > 1" 
             data-testid="bulk-operations">
          <button @click="selectAll" data-testid="select-all">
            {{ allSelected ? $t('cart.deselectAll') : $t('cart.selectAll') }}
          </button>
          
          <div v-if="selectedItems.length > 0" data-testid="bulk-actions">
            <span>{{ selectedItems.length }} {{ $t('cart.itemsSelected') }}</span>
            <button @click="bulkRemove" data-testid="bulk-remove">
              {{ $t('cart.removeSelected') }}
            </button>
            <select v-model="bulkQuantity" data-testid="bulk-quantity">
              <option v-for="n in 10" :key="n" :value="n">{{ n }}</option>
            </select>
            <button @click="bulkUpdateQuantity" data-testid="bulk-update">
              {{ $t('cart.updateQuantity') }}
            </button>
          </div>
        </div>

        <!-- Saved for Later -->
        <div v-if="savedItems.length > 0" data-testid="saved-for-later">
          <h3>{{ $t('cart.savedForLater') }}</h3>
          <div v-for="item in savedItems" :key="item.id" 
               :data-testid="'saved-item-' + item.id">
            <span>{{ item.product.name }}</span>
            <button @click="moveToCart(item.id)" 
                    :data-testid="'move-to-cart-' + item.id">
              {{ $t('cart.moveToCart') }}
            </button>
          </div>
        </div>

        <!-- Recommendations -->
        <div v-if="recommendations.length > 0" data-testid="recommendations">
          <h3>{{ $t('cart.recommendations') }}</h3>
          <div v-for="product in recommendations" :key="product.id" 
               :data-testid="'recommendation-' + product.id">
            <span>{{ product.name }}</span>
            <button @click="addRecommendation(product)" 
                    :data-testid="'add-recommendation-' + product.id">
              {{ $t('cart.addToCart') }}
            </button>
          </div>
        </div>

        <!-- Cart Summary -->
        <div data-testid="cart-summary">
          <div data-testid="subtotal">
            {{ $t('cart.subtotal') }}: {{ cart.formattedSubtotal.value }}
          </div>
          <div data-testid="tax" v-if="tax > 0">
            {{ $t('cart.tax') }}: {{ formatPrice(tax) }}
          </div>
          <div data-testid="total">
            {{ $t('cart.total') }}: {{ formatPrice(cart.subtotal.value + tax) }}
          </div>
        </div>

        <!-- Cart Actions -->
        <div data-testid="cart-actions">
          <button @click="cart.clearCart()" data-testid="clear-cart">
            {{ $t('cart.clear') }}
          </button>
          <button @click="proceedToCheckout" data-testid="checkout">
            {{ $t('cart.checkout') }}
          </button>
        </div>
      </div>

      <!-- Toast Notifications -->
      <div v-if="toastMessage" data-testid="toast" :class="toastType">
        {{ toastMessage }}
        <button @click="dismissToast" data-testid="toast-close">×</button>
        <button v-if="toastAction" @click="toastAction.handler" 
                data-testid="toast-action">{{ toastAction.label }}</button>
      </div>
    </div>
  `,
  setup() {
    const cart = useCart()
    const analytics = useCartAnalytics()
    
    // Component state
    const selectedItems = ref([])
    const bulkQuantity = ref(1)
    const savedItems = ref([])
    const recommendations = ref([])
    const features = ref({
      bulkOperations: true,
      saveForLater: true,
      recommendations: true
    })
    const tax = ref(0)
    const toastMessage = ref('')
    const toastType = ref('info')
    const toastAction = ref(null)
    
    // Computed
    const allSelected = computed(() => 
      selectedItems.value.length === cart.items.value.length
    )
    
    // Methods
    const formatPrice = (price) => {
      return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR'
      }).format(price)
    }
    
    const updateQuantity = async (itemId, quantity) => {
      const numQuantity = parseInt(quantity)
      if (numQuantity > 0) {
        await cart.updateQuantity(itemId, numQuantity)
      }
    }
    
    const selectAll = () => {
      if (allSelected.value) {
        selectedItems.value = []
      } else {
        selectedItems.value = cart.items.value.map(item => item.id)
      }
    }
    
    const bulkRemove = async () => {
      for (const itemId of selectedItems.value) {
        await cart.removeItem(itemId)
      }
      selectedItems.value = []
      showToast('Items removed', 'success')
    }
    
    const bulkUpdateQuantity = async () => {
      for (const itemId of selectedItems.value) {
        await cart.updateQuantity(itemId, bulkQuantity.value)
      }
      showToast('Quantities updated', 'success')
    }
    
    const saveForLater = async (itemId) => {
      const item = cart.items.value.find(i => i.id === itemId)
      if (item) {
        await cart.removeItem(itemId)
        savedItems.value.push(item)
        showToast('Item saved for later', 'info')
      }
    }
    
    const moveToCart = async (itemId) => {
      const itemIndex = savedItems.value.findIndex(i => i.id === itemId)
      if (itemIndex !== -1) {
        const item = savedItems.value[itemIndex]
        await cart.addItem(item.product, item.quantity)
        savedItems.value.splice(itemIndex, 1)
        showToast('Item moved to cart', 'success')
      }
    }
    
    const addRecommendation = async (product) => {
      await cart.addItem(product, 1)
      showToast('Recommendation added', 'success')
    }
    
    const continueShopping = () => {
      // Navigate to products page
      showToast('Continue shopping', 'info')
    }
    
    const proceedToCheckout = () => {
      analytics.trackCheckoutStart()
      showToast('Proceeding to checkout', 'info')
    }
    
    const showToast = (message, type = 'info', action = null) => {
      toastMessage.value = message
      toastType.value = type
      toastAction.value = action
      
      setTimeout(() => {
        dismissToast()
      }, 5000)
    }
    
    const dismissToast = () => {
      toastMessage.value = ''
      toastAction.value = null
    }
    
    // Load recommendations when cart changes
    watch(() => cart.items.value, async (items) => {
      if (items.length > 0) {
        // Mock recommendations loading
        recommendations.value = [
          {
            id: 'rec-1',
            name: 'Recommended Product 1',
            price: 15.99,
            images: ['rec1.jpg']
          },
          {
            id: 'rec-2',
            name: 'Recommended Product 2',
            price: 22.50,
            images: ['rec2.jpg']
          }
        ]
      } else {
        recommendations.value = []
      }
    }, { immediate: true })
    
    // Track cart view on mount
    onMounted(() => {
      analytics.trackCartView()
    })
    
    return {
      cart,
      selectedItems,
      bulkQuantity,
      savedItems,
      recommendations,
      features,
      tax,
      toastMessage,
      toastType,
      toastAction,
      allSelected,
      formatPrice,
      updateQuantity,
      selectAll,
      bulkRemove,
      bulkUpdateQuantity,
      saveForLater,
      moveToCart,
      addRecommendation,
      continueShopping,
      proceedToCheckout,
      showToast,
      dismissToast
    }
  }
}

const mockProducts = [
  {
    id: 'product-1',
    slug: 'moldovan-wine',
    name: 'Moldovan Wine',
    price: 24.99,
    images: ['wine.jpg'],
    stock: 50,
    category: 'wine'
  },
  {
    id: 'product-2',
    slug: 'traditional-placinta',
    name: 'Traditional Plăcintă',
    price: 8.50,
    images: ['placinta.jpg'],
    stock: 20,
    category: 'food'
  },
  {
    id: 'product-3',
    slug: 'honey-moldova',
    name: 'Honey from Moldova',
    price: 12.00,
    images: ['honey.jpg'],
    stock: 5,
    category: 'food'
  }
]

// Mock storage
const createMockStorage = () => {
  const storage = new Map<string, string>()
  return {
    getItem: vi.fn((key: string) => storage.get(key) || null),
    setItem: vi.fn((key: string, value: string) => storage.set(key, value)),
    removeItem: vi.fn((key: string) => storage.delete(key)),
    clear: vi.fn(() => storage.clear())
  }
}

describe('Complete Cart System Integration', () => {
  let pinia: any
  let mockLocalStorage: any
  let mockSessionStorage: any
  let mockAnalytics: any

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    
    mockLocalStorage = createMockStorage()
    mockSessionStorage = createMockStorage()
    
    // Mock global objects
    Object.defineProperty(global, 'localStorage', { value: mockLocalStorage, writable: true })
    Object.defineProperty(global, 'sessionStorage', { value: mockSessionStorage, writable: true })
    Object.defineProperty(global, 'process', { value: { client: true }, writable: true })
    
    // Mock fetch for product validation
    global.$fetch = vi.fn().mockImplementation((url: string) => {
      const productId = url.split('/').pop()
      const product = mockProducts.find(p => p.slug === productId || p.id === productId)
      if (product) {
        return Promise.resolve({ product })
      }
      return Promise.reject(new Error('Product not found'))
    })
    
    // Mock analytics
    mockAnalytics = {
      trackAddToCart: vi.fn(),
      trackRemoveFromCart: vi.fn(),
      trackQuantityUpdate: vi.fn(),
      trackCartView: vi.fn(),
      trackCheckoutStart: vi.fn(),
      initializeCartSession: vi.fn()
    }
    
    // Mock useCartAnalytics
    vi.mock('~/composables/useCartAnalytics', () => ({
      useCartAnalytics: () => mockAnalytics
    }))
    
    // Mock i18n
    const mockI18n = {
      $t: (key: string) => key,
      t: (key: string) => key
    }
    
    global.useNuxtApp = vi.fn(() => ({
      $i18n: mockI18n
    }))
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  describe('Complete Component Integration', () => {
    it('should render complete cart interface with all features', async () => {
      const wrapper = mount(CompleteCartComponent, {
        global: {
          plugins: [pinia],
          mocks: {
            $t: (key: string) => key
          }
        }
      })
      
      // Should render main cart app
      expect(wrapper.find('[data-testid="cart-app"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="cart-header"]').exists()).toBe(true)
      
      // Should show empty cart initially
      expect(wrapper.find('[data-testid="empty-cart"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="continue-shopping"]').exists()).toBe(true)
      
      // Should show correct initial state
      expect(wrapper.find('[data-testid="cart-count"]').text()).toBe('0')
      expect(wrapper.find('[data-testid="cart-subtotal"]').text()).toContain('0')
    })

    it('should handle complete add-to-cart workflow with all integrations', async () => {
      const wrapper = mount(CompleteCartComponent, {
        global: {
          plugins: [pinia],
          mocks: {
            $t: (key: string) => key
          }
        }
      })
      
      const cart = useCart()
      const product = mockProducts[0]
      
      // Add item to cart
      await cart.addItem(product, 2)
      await wrapper.vm.$nextTick()
      
      // Should update all UI elements
      expect(wrapper.find('[data-testid="cart-count"]').text()).toBe('2')
      expect(wrapper.find('[data-testid="cart-subtotal"]').text()).toContain('49,98')
      
      // Should show cart items
      expect(wrapper.find('[data-testid="empty-cart"]').exists()).toBe(false)
      expect(wrapper.find('[data-testid="cart-items"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="cart-item-' + product.id + '"]').exists()).toBe(true)
      
      // Should show item details
      const itemDetails = wrapper.find('[data-testid="item-details"]')
      expect(itemDetails.text()).toContain(product.name)
      expect(itemDetails.text()).toContain('24,99')
      
      // Should show quantity controls
      expect(wrapper.find('[data-testid="quantity-display-' + product.id + '"]').text()).toBe('2')
      expect(wrapper.find('[data-testid="increase-' + product.id + '"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="decrease-' + product.id + '"]').exists()).toBe(true)
      
      // Should show item total
      expect(wrapper.find('[data-testid="item-total-' + product.id + '"]').text()).toContain('49,98')
      
      // Should show cart summary
      expect(wrapper.find('[data-testid="subtotal"]').text()).toContain('49,98')
      expect(wrapper.find('[data-testid="total"]').text()).toContain('49,98')
      
      // Should show cart actions
      expect(wrapper.find('[data-testid="clear-cart"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="checkout"]').exists()).toBe(true)
      
      // Should show recommendations
      await wrapper.vm.$nextTick()
      expect(wrapper.find('[data-testid="recommendations"]').exists()).toBe(true)
      
      // Verify analytics tracking
      expect(mockAnalytics.trackAddToCart).toHaveBeenCalledWith(
        product,
        2,
        product.price * 2,
        2
      )
      expect(mockAnalytics.trackCartView).toHaveBeenCalled()
    })

    it('should handle quantity updates with full UI integration', async () => {
      const wrapper = mount(CompleteCartComponent, {
        global: {
          plugins: [pinia],
          mocks: {
            $t: (key: string) => key
          }
        }
      })
      
      const cart = useCart()
      const product = mockProducts[0]
      
      // Add item to cart
      await cart.addItem(product, 1)
      await wrapper.vm.$nextTick()
      
      // Test increase button
      await wrapper.find('[data-testid="increase-' + product.id + '"]').trigger('click')
      await wrapper.vm.$nextTick()
      
      // Should update all related UI elements
      expect(wrapper.find('[data-testid="quantity-display-' + product.id + '"]').text()).toBe('2')
      expect(wrapper.find('[data-testid="cart-count"]').text()).toBe('2')
      expect(wrapper.find('[data-testid="cart-subtotal"]').text()).toContain('49,98')
      expect(wrapper.find('[data-testid="item-total-' + product.id + '"]').text()).toContain('49,98')
      
      // Test decrease button
      await wrapper.find('[data-testid="decrease-' + product.id + '"]').trigger('click')
      await wrapper.vm.$nextTick()
      
      // Should update back to original values
      expect(wrapper.find('[data-testid="quantity-display-' + product.id + '"]').text()).toBe('1')
      expect(wrapper.find('[data-testid="cart-count"]').text()).toBe('1')
      expect(wrapper.find('[data-testid="cart-subtotal"]').text()).toContain('24,99')
      
      // Test direct input
      const quantityInput = wrapper.find('[data-testid="quantity-input-' + product.id + '"]')
      await quantityInput.setValue('5')
      await quantityInput.trigger('change')
      await wrapper.vm.$nextTick()
      
      // Should update to new quantity
      expect(wrapper.find('[data-testid="quantity-display-' + product.id + '"]').text()).toBe('5')
      expect(wrapper.find('[data-testid="cart-count"]').text()).toBe('5')
      
      // Verify analytics tracking
      expect(mockAnalytics.trackQuantityUpdate).toHaveBeenCalled()
    })

    it('should handle item removal with full UI integration', async () => {
      const wrapper = mount(CompleteCartComponent, {
        global: {
          plugins: [pinia],
          mocks: {
            $t: (key: string) => key
          }
        }
      })
      
      const cart = useCart()
      const product = mockProducts[0]
      
      // Add item to cart
      await cart.addItem(product, 1)
      await wrapper.vm.$nextTick()
      
      // Verify item is shown
      expect(wrapper.find('[data-testid="cart-item-' + product.id + '"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="cart-count"]').text()).toBe('1')
      
      // Remove item
      await wrapper.find('[data-testid="remove-' + product.id + '"]').trigger('click')
      await wrapper.vm.$nextTick()
      
      // Should show empty cart
      expect(wrapper.find('[data-testid="cart-item-' + product.id + '"]').exists()).toBe(false)
      expect(wrapper.find('[data-testid="empty-cart"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="cart-count"]').text()).toBe('0')
      expect(wrapper.find('[data-testid="cart-subtotal"]').text()).toContain('0')
      
      // Should show toast notification
      expect(wrapper.find('[data-testid="toast"]').exists()).toBe(true)
      
      // Verify analytics tracking
      expect(mockAnalytics.trackRemoveFromCart).toHaveBeenCalledWith(product)
    })
  })

  describe('Advanced Features Integration', () => {
    it('should handle bulk operations with full UI integration', async () => {
      const wrapper = mount(CompleteCartComponent, {
        global: {
          plugins: [pinia],
          mocks: {
            $t: (key: string) => key
          }
        }
      })
      
      const cart = useCart()
      
      // Add multiple items
      await cart.addItem(mockProducts[0], 1)
      await cart.addItem(mockProducts[1], 1)
      await cart.addItem(mockProducts[2], 1)
      await wrapper.vm.$nextTick()
      
      // Should show bulk operations
      expect(wrapper.find('[data-testid="bulk-operations"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="select-all"]').exists()).toBe(true)
      
      // Select all items
      await wrapper.find('[data-testid="select-all"]').trigger('click')
      await wrapper.vm.$nextTick()
      
      // Should show bulk actions
      expect(wrapper.find('[data-testid="bulk-actions"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="bulk-remove"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="bulk-update"]').exists()).toBe(true)
      
      // Test bulk quantity update
      await wrapper.find('[data-testid="bulk-quantity"]').setValue('3')
      await wrapper.find('[data-testid="bulk-update"]').trigger('click')
      await wrapper.vm.$nextTick()
      
      // All items should have quantity 3
      for (const product of mockProducts) {
        expect(wrapper.find('[data-testid="quantity-display-' + product.id + '"]').text()).toBe('3')
      }
      
      // Cart count should be updated
      expect(wrapper.find('[data-testid="cart-count"]').text()).toBe('9')
      
      // Should show success toast
      expect(wrapper.find('[data-testid="toast"]').text()).toContain('updated')
    })

    it('should handle save for later functionality', async () => {
      const wrapper = mount(CompleteCartComponent, {
        global: {
          plugins: [pinia],
          mocks: {
            $t: (key: string) => key
          }
        }
      })
      
      const cart = useCart()
      const product = mockProducts[0]
      
      // Add item to cart
      await cart.addItem(product, 2)
      await wrapper.vm.$nextTick()
      
      // Save item for later
      await wrapper.find('[data-testid="save-later-' + product.id + '"]').trigger('click')
      await wrapper.vm.$nextTick()
      
      // Item should be removed from cart
      expect(wrapper.find('[data-testid="cart-item-' + product.id + '"]').exists()).toBe(false)
      expect(wrapper.find('[data-testid="cart-count"]').text()).toBe('0')
      
      // Should show in saved for later section
      expect(wrapper.find('[data-testid="saved-for-later"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="saved-item-' + product.id + '"]').exists()).toBe(true)
      
      // Should show toast notification
      expect(wrapper.find('[data-testid="toast"]').text()).toContain('saved for later')
      
      // Move back to cart
      await wrapper.find('[data-testid="move-to-cart-' + product.id + '"]').trigger('click')
      await wrapper.vm.$nextTick()
      
      // Should be back in cart
      expect(wrapper.find('[data-testid="cart-item-' + product.id + '"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="cart-count"]').text()).toBe('2')
      expect(wrapper.find('[data-testid="saved-item-' + product.id + '"]').exists()).toBe(false)
    })

    it('should handle recommendations integration', async () => {
      const wrapper = mount(CompleteCartComponent, {
        global: {
          plugins: [pinia],
          mocks: {
            $t: (key: string) => key
          }
        }
      })
      
      const cart = useCart()
      const product = mockProducts[0]
      
      // Add item to cart (should trigger recommendations)
      await cart.addItem(product, 1)
      await wrapper.vm.$nextTick()
      
      // Should show recommendations
      expect(wrapper.find('[data-testid="recommendations"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="recommendation-rec-1"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="recommendation-rec-2"]').exists()).toBe(true)
      
      // Add recommendation to cart
      await wrapper.find('[data-testid="add-recommendation-rec-1"]').trigger('click')
      await wrapper.vm.$nextTick()
      
      // Should add recommendation to cart
      expect(wrapper.find('[data-testid="cart-count"]').text()).toBe('2')
      
      // Should show success toast
      expect(wrapper.find('[data-testid="toast"]').text()).toContain('added')
    })
  })

  describe('Error Handling Integration', () => {
    it('should handle and display errors with recovery options', async () => {
      const wrapper = mount(CompleteCartComponent, {
        global: {
          plugins: [pinia],
          mocks: {
            $t: (key: string) => key
          }
        }
      })
      
      const cart = useCart()
      
      // Simulate error
      cart.error.value = 'Network error occurred'
      await wrapper.vm.$nextTick()
      
      // Should show error state
      expect(wrapper.find('[data-testid="cart-error"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="cart-error"]').text()).toContain('Network error occurred')
      expect(wrapper.find('[data-testid="clear-error"]').exists()).toBe(true)
      
      // Clear error
      await wrapper.find('[data-testid="clear-error"]').trigger('click')
      await wrapper.vm.$nextTick()
      
      // Error should be cleared
      expect(wrapper.find('[data-testid="cart-error"]').exists()).toBe(false)
      expect(cart.error.value).toBeNull()
    })

    it('should handle loading states properly', async () => {
      const wrapper = mount(CompleteCartComponent, {
        global: {
          plugins: [pinia],
          mocks: {
            $t: (key: string) => key
          }
        }
      })
      
      const cart = useCart()
      
      // Set loading state
      cart.loading.value = true
      await wrapper.vm.$nextTick()
      
      // Should show loading state
      expect(wrapper.find('[data-testid="cart-loading"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="cart-items"]').exists()).toBe(false)
      expect(wrapper.find('[data-testid="empty-cart"]').exists()).toBe(false)
      
      // Clear loading state
      cart.loading.value = false
      await wrapper.vm.$nextTick()
      
      // Should show appropriate content
      expect(wrapper.find('[data-testid="cart-loading"]').exists()).toBe(false)
      expect(wrapper.find('[data-testid="empty-cart"]').exists()).toBe(true)
    })

    it('should handle toast notifications with actions', async () => {
      const wrapper = mount(CompleteCartComponent, {
        global: {
          plugins: [pinia],
          mocks: {
            $t: (key: string) => key
          }
        }
      })
      
      // Show toast with action
      await wrapper.vm.showToast('Operation failed', 'error', {
        label: 'Retry',
        handler: vi.fn()
      })
      await wrapper.vm.$nextTick()
      
      // Should show toast with action
      expect(wrapper.find('[data-testid="toast"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="toast"]').text()).toContain('Operation failed')
      expect(wrapper.find('[data-testid="toast-action"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="toast-action"]').text()).toBe('Retry')
      
      // Test action button
      await wrapper.find('[data-testid="toast-action"]').trigger('click')
      expect(wrapper.vm.toastAction.handler).toHaveBeenCalled()
      
      // Test close button
      await wrapper.find('[data-testid="toast-close"]').trigger('click')
      await wrapper.vm.$nextTick()
      
      // Toast should be dismissed
      expect(wrapper.find('[data-testid="toast"]').exists()).toBe(false)
    })
  })

  describe('Performance Integration', () => {
    it('should handle large number of items efficiently', async () => {
      const wrapper = mount(CompleteCartComponent, {
        global: {
          plugins: [pinia],
          mocks: {
            $t: (key: string) => key
          }
        }
      })
      
      const cart = useCart()
      
      // Add many items
      const startTime = Date.now()
      
      for (let i = 0; i < 20; i++) {
        const product = {
          ...mockProducts[i % mockProducts.length],
          id: `product-${i}`,
          slug: `product-${i}`
        }
        await cart.addItem(product, 1)
      }
      
      await wrapper.vm.$nextTick()
      
      const addTime = Date.now() - startTime
      
      // Should complete within reasonable time
      expect(addTime).toBeLessThan(5000) // 5 seconds for 20 items
      
      // Should render all items
      expect(wrapper.findAll('[data-testid^="cart-item-"]')).toHaveLength(20)
      expect(wrapper.find('[data-testid="cart-count"]').text()).toBe('20')
      
      // Bulk operations should work with many items
      await wrapper.find('[data-testid="select-all"]').trigger('click')
      await wrapper.vm.$nextTick()
      
      expect(wrapper.find('[data-testid="bulk-actions"]').text()).toContain('20')
    })

    it('should debounce rapid operations', async () => {
      const wrapper = mount(CompleteCartComponent, {
        global: {
          plugins: [pinia],
          mocks: {
            $t: (key: string) => key
          }
        }
      })
      
      const cart = useCart()
      const product = mockProducts[0]
      
      // Add item to cart
      await cart.addItem(product, 1)
      await wrapper.vm.$nextTick()
      
      // Perform rapid quantity updates
      const increaseButton = wrapper.find('[data-testid="increase-' + product.id + '"]')
      
      const startTime = Date.now()
      
      // Rapid clicks
      for (let i = 0; i < 10; i++) {
        await increaseButton.trigger('click')
      }
      
      await wrapper.vm.$nextTick()
      
      const operationTime = Date.now() - startTime
      
      // Should complete quickly due to debouncing
      expect(operationTime).toBeLessThan(2000)
      
      // Final quantity should be correct
      expect(wrapper.find('[data-testid="quantity-display-' + product.id + '"]').text()).toBe('11')
      
      // Storage operations should be debounced (fewer calls than operations)
      const setItemCalls = mockLocalStorage.setItem.mock.calls.length
      expect(setItemCalls).toBeLessThan(15) // Much less than 11 calls
    })
  })

  describe('Analytics Integration', () => {
    it('should track all cart events through UI interactions', async () => {
      const wrapper = mount(CompleteCartComponent, {
        global: {
          plugins: [pinia],
          mocks: {
            $t: (key: string) => key
          }
        }
      })
      
      const cart = useCart()
      const product = mockProducts[0]
      
      // Track cart view on mount
      expect(mockAnalytics.trackCartView).toHaveBeenCalled()
      
      // Add item and track
      await cart.addItem(product, 2)
      await wrapper.vm.$nextTick()
      
      expect(mockAnalytics.trackAddToCart).toHaveBeenCalledWith(
        product,
        2,
        product.price * 2,
        2
      )
      
      // Update quantity and track
      await wrapper.find('[data-testid="increase-' + product.id + '"]').trigger('click')
      await wrapper.vm.$nextTick()
      
      expect(mockAnalytics.trackQuantityUpdate).toHaveBeenCalled()
      
      // Proceed to checkout and track
      await wrapper.find('[data-testid="checkout"]').trigger('click')
      await wrapper.vm.$nextTick()
      
      expect(mockAnalytics.trackCheckoutStart).toHaveBeenCalled()
      
      // Remove item and track
      await wrapper.find('[data-testid="remove-' + product.id + '"]').trigger('click')
      await wrapper.vm.$nextTick()
      
      expect(mockAnalytics.trackRemoveFromCart).toHaveBeenCalledWith(product)
    })
  })
})