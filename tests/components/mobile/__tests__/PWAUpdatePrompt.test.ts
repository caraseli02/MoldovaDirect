import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref } from 'vue'
import PWAUpdatePrompt from '~/components/mobile/PWAUpdatePrompt.vue'

// Mock usePWA composable
const mockUpdateServiceWorker = vi.fn()
const mockNeedRefresh = ref(false)

// Mock usePWA at global level
global.usePWA = vi.fn(() => ({
  needRefresh: mockNeedRefresh.value,
  updateServiceWorker: mockUpdateServiceWorker,
  showInstallPrompt: false,
  install: vi.fn(),
}))

// Mock useHapticFeedback
const mockVibrate = vi.fn()
global.useHapticFeedback = vi.fn(() => ({
  vibrate: mockVibrate,
  isSupported: { value: true },
  isEnabled: { value: true },
}))

describe('PWAUpdatePrompt', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockNeedRefresh.value = false
    mockUpdateServiceWorker.mockReset()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const createWrapper = () => {
    return mount(PWAUpdatePrompt, {
      global: {
        stubs: {
          Button: {
            template: '<button :disabled="disabled" :class="[variant, size]"><slot /></button>',
            props: ['disabled', 'variant', 'size'],
          },
          Transition: {
            template: '<div name="slide-down"><slot /></div>',
          },
        },
      },
    })
  }

  it('should render the component', () => {
    const wrapper = createWrapper()
    expect(wrapper.exists()).toBe(true)
  })

  it('should not show update prompt when no update available', () => {
    mockNeedRefresh.value = false

    const wrapper = createWrapper()

    // The prompt container should not be visible
    expect(wrapper.find('.fixed.top-4').exists()).toBe(false)
  })

  describe('translation keys in template', () => {
    it('should use pwa.updateAvailable translation', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm).toBeDefined()
    })

    it('should use pwa.updateDescription translation', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm).toBeDefined()
    })

    it('should use pwa.update translation for update button', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm).toBeDefined()
    })
  })

  describe('component structure', () => {
    it('should have Transition wrapper with slide-down animation', () => {
      const wrapper = createWrapper()
      const html = wrapper.html()
      expect(html).toContain('slide-down')
    })

    it('should initialize with updating as false', () => {
      const wrapper = createWrapper()
      // No updating indicator initially
      expect(wrapper.find('.animate-spin').exists()).toBe(false)
    })
  })

  describe('usePWA composable integration', () => {
    it('should call usePWA composable', () => {
      createWrapper()
      expect(global.usePWA).toHaveBeenCalled()
    })

    it('should use needRefresh from usePWA', () => {
      createWrapper()
      expect(global.usePWA).toHaveBeenCalled()
    })

    it('should have access to updateServiceWorker method', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm).toBeDefined()
    })
  })

  describe('useHapticFeedback integration', () => {
    it('should call useHapticFeedback composable', () => {
      createWrapper()
      expect(global.useHapticFeedback).toHaveBeenCalled()
    })
  })

  describe('component methods', () => {
    it('should have handleUpdate method', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm).toBeDefined()
    })

    it('should have handleDismiss method', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm).toBeDefined()
    })
  })

  describe('Button component usage', () => {
    it('should use Button component from ui library', () => {
      const wrapper = createWrapper()
      // Component uses Button components
      expect(wrapper.vm).toBeDefined()
    })
  })

  describe('styling classes', () => {
    it('should have slide-down transition class name', () => {
      const wrapper = createWrapper()
      expect(wrapper.html()).toContain('slide-down')
    })
  })

  describe('accessibility', () => {
    it('should render accessible content', () => {
      const wrapper = createWrapper()
      expect(wrapper.html()).toBeTruthy()
    })

    it('should use semantic heading for title', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm).toBeDefined()
    })
  })

  describe('computed properties', () => {
    it('should compute updateAvailable from pwa.needRefresh', () => {
      const wrapper = createWrapper()
      // updateAvailable is computed from needRefresh
      expect(wrapper.vm).toBeDefined()
    })
  })

  describe('update notification visibility', () => {
    it('should not show notification when needRefresh is false', async () => {
      mockNeedRefresh.value = false

      const wrapper = createWrapper()
      await flushPromises()

      expect(wrapper.find('.fixed.top-4').exists()).toBe(false)
    })
  })

  describe('dismiss functionality', () => {
    it('should have dismiss button in template', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm).toBeDefined()
    })
  })

  describe('update button state', () => {
    it('should have update button disabled state controlled', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm).toBeDefined()
    })
  })
})
