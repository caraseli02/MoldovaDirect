import { describe, it, expect, beforeEach, vi, beforeAll, afterAll } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref, computed } from 'vue'

// Shared state
const hasSelectedRef = ref(false)
const selectedCountRef = ref(0)
const selectedSubtotalRef = ref(0)
const operationInProgressRef = ref(false)
const mockRemoveSelected = vi.fn()
const mockMoveToSaved = vi.fn()
const mockToastSuccess = vi.fn()
const mockToastError = vi.fn()

describe('Cart BulkOperations', () => {
  let BulkOperations: any

  beforeAll(async () => {
    ;(global as any).useCart = () => ({
      hasSelectedItems: computed(() => hasSelectedRef.value),
      selectedItemsCount: computed(() => selectedCountRef.value),
      selectedItemsSubtotal: computed(() => selectedSubtotalRef.value),
      bulkOperationInProgress: computed(() => operationInProgressRef.value),
      removeSelectedItems: mockRemoveSelected,
      moveSelectedToSavedForLater: mockMoveToSaved,
    })
    ;(global as any).useToast = () => ({
      success: mockToastSuccess,
      error: mockToastError,
    })

    BulkOperations = (await import('~/components/cart/BulkOperations.vue')).default
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
        Button: {
          template: '<button :disabled="disabled" :class="[$attrs.class]" @click="$emit(\'click\')"><slot /></button>',
          props: ['variant', 'size', 'disabled'],
        },
      },
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
    hasSelectedRef.value = false
    selectedCountRef.value = 0
    selectedSubtotalRef.value = 0
    operationInProgressRef.value = false
    mockRemoveSelected.mockResolvedValue(undefined)
    mockMoveToSaved.mockResolvedValue(undefined)
  })

  describe('Rendering', () => {
    it('should not render when no items selected', () => {
      hasSelectedRef.value = false
      const wrapper = mount(BulkOperations, mountOptions)
      expect(wrapper.html()).toBe('<!--v-if-->')
    })

    it('should render when items selected', () => {
      hasSelectedRef.value = true
      selectedCountRef.value = 2
      const wrapper = mount(BulkOperations, mountOptions)
      expect(wrapper.find('.bg-blue-50').exists()).toBe(true)
    })

    it('should display selected count', () => {
      hasSelectedRef.value = true
      selectedCountRef.value = 3
      const wrapper = mount(BulkOperations, mountOptions)
      expect(wrapper.text()).toContain('3')
      expect(wrapper.text()).toContain('cart.itemsSelected')
    })

    it('should display subtotal', () => {
      hasSelectedRef.value = true
      selectedCountRef.value = 2
      selectedSubtotalRef.value = 51.98
      const wrapper = mount(BulkOperations, mountOptions)
      expect(wrapper.html()).toMatch(/51[.,]98/)
    })
  })

  describe('Action Buttons', () => {
    beforeEach(() => {
      hasSelectedRef.value = true
      selectedCountRef.value = 2
    })

    it('should render save for later button', () => {
      const wrapper = mount(BulkOperations, mountOptions)
      expect(wrapper.text()).toContain('cart.saveForLater')
    })

    it('should render remove button', () => {
      const wrapper = mount(BulkOperations, mountOptions)
      expect(wrapper.text()).toContain('cart.removeSelected')
    })

    it('should disable buttons when operation in progress', () => {
      operationInProgressRef.value = true
      const wrapper = mount(BulkOperations, mountOptions)
      const buttons = wrapper.findAll('button')
      buttons.forEach((btn) => {
        expect(btn.attributes('disabled')).toBeDefined()
      })
    })
  })

  describe('Save Action', () => {
    beforeEach(() => {
      hasSelectedRef.value = true
      selectedCountRef.value = 2
    })

    it('should call moveToSaved on click', async () => {
      const wrapper = mount(BulkOperations, mountOptions)
      const btn = wrapper.findAll('button').find(b => b.text().includes('cart.saveForLater'))
      await btn?.trigger('click')
      expect(mockMoveToSaved).toHaveBeenCalled()
    })

    it('should show success toast', async () => {
      const wrapper = mount(BulkOperations, mountOptions)
      const btn = wrapper.findAll('button').find(b => b.text().includes('cart.saveForLater'))
      await btn?.trigger('click')
      await wrapper.vm.$nextTick()
      expect(mockToastSuccess).toHaveBeenCalled()
    })

    it('should show error toast on failure', async () => {
      mockMoveToSaved.mockRejectedValue(new Error('Failed'))
      const wrapper = mount(BulkOperations, mountOptions)
      const btn = wrapper.findAll('button').find(b => b.text().includes('cart.saveForLater'))
      await btn?.trigger('click')
      await wrapper.vm.$nextTick()
      expect(mockToastError).toHaveBeenCalled()
    })
  })

  describe('Remove Action', () => {
    beforeEach(() => {
      hasSelectedRef.value = true
      selectedCountRef.value = 2
    })

    it('should call removeSelected on click', async () => {
      const wrapper = mount(BulkOperations, mountOptions)
      const btn = wrapper.findAll('button').find(b => b.text().includes('cart.removeSelected'))
      await btn?.trigger('click')
      expect(mockRemoveSelected).toHaveBeenCalled()
    })

    it('should show success toast', async () => {
      const wrapper = mount(BulkOperations, mountOptions)
      const btn = wrapper.findAll('button').find(b => b.text().includes('cart.removeSelected'))
      await btn?.trigger('click')
      await wrapper.vm.$nextTick()
      expect(mockToastSuccess).toHaveBeenCalled()
    })

    it('should show error toast on failure', async () => {
      mockRemoveSelected.mockRejectedValue(new Error('Failed'))
      const wrapper = mount(BulkOperations, mountOptions)
      const btn = wrapper.findAll('button').find(b => b.text().includes('cart.removeSelected'))
      await btn?.trigger('click')
      await wrapper.vm.$nextTick()
      expect(mockToastError).toHaveBeenCalled()
    })
  })

  describe('Loading State', () => {
    beforeEach(() => {
      hasSelectedRef.value = true
      selectedCountRef.value = 2
    })

    it('should show loading indicator when in progress', () => {
      operationInProgressRef.value = true
      const wrapper = mount(BulkOperations, mountOptions)
      expect(wrapper.text()).toContain('cart.processingBulkOperation')
      expect(wrapper.find('.animate-spin').exists()).toBe(true)
    })

    it('should not show loading when idle', () => {
      operationInProgressRef.value = false
      const wrapper = mount(BulkOperations, mountOptions)
      expect(wrapper.text()).not.toContain('cart.processingBulkOperation')
    })
  })

  describe('Styling', () => {
    beforeEach(() => {
      hasSelectedRef.value = true
      selectedCountRef.value = 2
    })

    it('should have container styling', () => {
      const wrapper = mount(BulkOperations, mountOptions)
      const container = wrapper.find('div')
      expect(container.classes()).toContain('bg-blue-50')
      expect(container.classes()).toContain('rounded-lg')
    })

    it('should have dark mode classes', () => {
      const wrapper = mount(BulkOperations, mountOptions)
      expect(wrapper.html()).toContain('dark:bg-blue-900/20')
    })

    it('should have icon', () => {
      const wrapper = mount(BulkOperations, mountOptions)
      const svg = wrapper.find('svg')
      expect(svg.exists()).toBe(true)
      expect(svg.classes()).toContain('text-blue-600')
    })
  })
})
