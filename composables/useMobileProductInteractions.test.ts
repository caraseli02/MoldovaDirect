import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ref } from 'vue'
import type { Ref } from 'vue'
import type { PaginationHandler } from './useMobileProductInteractions'

/**
 * Comprehensive unit tests for useMobileProductInteractions composable
 * Tests lifecycle management, pull-to-refresh, swipe gestures, and mobile detection
 */

// Mock all dependencies BEFORE imports
const mockIsMobile = ref(false)
const mockVibrate = vi.fn()
const mockSetupPullToRefresh = vi.fn()
const mockCleanupPullToRefresh = vi.fn()
const mockTriggerRefresh = vi.fn()
const mockPullToRefreshState = {
  isRefreshing: ref(false),
  pullDistance: ref(0),
  isPulling: ref(false),
  canRefresh: ref(false),
  pullIndicatorStyle: { value: {} },
  pullStatusText: { value: '' },
}

const mockSetupSwipeListeners = vi.fn()
const mockCleanupSwipeListeners = vi.fn()
const mockSetSwipeHandlers = vi.fn()
const mockResetSwipe = vi.fn()
const mockSwipeState = {
  isSwipeActive: ref(false),
  swipeDirection: ref(null),
  swipeDistance: ref(0),
}

// Mock useDevice
vi.mock('./useDevice', () => ({
  useDevice: vi.fn(() => ({
    isMobile: mockIsMobile,
    isTablet: ref(false),
    isDesktop: ref(true),
    windowWidth: ref(1024),
    windowHeight: ref(768),
  })),
}))

// Mock useHapticFeedback
vi.mock('./useHapticFeedback', () => ({
  useHapticFeedback: vi.fn(() => ({
    vibrate: mockVibrate,
    isSupported: ref(true),
    isEnabled: ref(true),
  })),
}))

// Mock usePullToRefresh
vi.mock('./usePullToRefresh', () => ({
  usePullToRefresh: vi.fn((callback: () => Promise<void>) => ({
    ...mockPullToRefreshState,
    setupPullToRefresh: mockSetupPullToRefresh,
    cleanupPullToRefresh: mockCleanupPullToRefresh,
    triggerRefresh: mockTriggerRefresh,
    _callback: callback, // Store callback for testing
  })),
}))

// Mock useSwipeGestures
vi.mock('./useSwipeGestures', () => ({
  useSwipeGestures: vi.fn(() => ({
    ...mockSwipeState,
    setupSwipeListeners: mockSetupSwipeListeners,
    cleanupSwipeListeners: mockCleanupSwipeListeners,
    setSwipeHandlers: mockSetSwipeHandlers,
    resetSwipe: mockResetSwipe,
  })),
}))

// Store original module imports for testing
const mockUseDevice = vi.mocked((await import('./useDevice')).useDevice)
const mockUseHapticFeedback = vi.mocked((await import('./useHapticFeedback')).useHapticFeedback)
const mockUsePullToRefresh = vi.mocked((await import('./usePullToRefresh')).usePullToRefresh)
const mockUseSwipeGestures = vi.mocked((await import('./useSwipeGestures')).useSwipeGestures)

// Import AFTER mocks are set up
const { useMobileProductInteractions } = await import('./useMobileProductInteractions')

describe('useMobileProductInteractions', () => {
  let scrollContainer: Ref<HTMLElement | undefined>
  let refreshCallback: () => Promise<void>
  let paginationHandler: PaginationHandler
  let mockElement: HTMLElement

  beforeEach(() => {
    vi.clearAllMocks()

    // Reset mock states
    mockIsMobile.value = false
    mockPullToRefreshState.isRefreshing.value = false
    mockPullToRefreshState.pullDistance.value = 0
    mockPullToRefreshState.isPulling.value = false
    mockPullToRefreshState.canRefresh.value = false
    mockSwipeState.isSwipeActive.value = false
    mockSwipeState.swipeDirection.value = null
    mockSwipeState.swipeDistance.value = 0

    // Setup test fixtures
    mockElement = document.createElement('div')
    scrollContainer = ref(mockElement)
    refreshCallback = vi.fn().mockResolvedValue(undefined)
    paginationHandler = {
      currentPage: 1,
      totalPages: 5,
      goToPage: vi.fn(),
    }
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initialization', () => {
    it('returns correct API methods and state', () => {
      const api = useMobileProductInteractions(
        scrollContainer,
        refreshCallback,
        paginationHandler,
      )

      expect(api).toHaveProperty('pullToRefresh')
      expect(api).toHaveProperty('swipeGestures')
      expect(api).toHaveProperty('isMobile')
      expect(api).toHaveProperty('setup')
      expect(api).toHaveProperty('cleanup')
      expect(typeof api.setup).toBe('function')
      expect(typeof api.cleanup).toBe('function')
    })

    it('initializes pull-to-refresh with refresh callback', () => {
      const mockCallback = vi.fn().mockResolvedValue(undefined)

      useMobileProductInteractions(
        scrollContainer,
        mockCallback,
        paginationHandler,
      )

      // usePullToRefresh should have been called with the callback
      expect(mockUsePullToRefresh).toHaveBeenCalledWith(expect.any(Function))
    })

    it('initializes swipe gestures', () => {
      useMobileProductInteractions(
        scrollContainer,
        refreshCallback,
        paginationHandler,
      )

      expect(mockUseSwipeGestures).toHaveBeenCalled()
    })

    it('exposes isMobile state from useDevice', () => {
      mockIsMobile.value = true

      const { isMobile } = useMobileProductInteractions(
        scrollContainer,
        refreshCallback,
        paginationHandler,
      )

      expect(isMobile.value).toBe(true)
    })
  })

  describe('Lifecycle Management - Setup', () => {
    it('setup initializes interactions on mobile device', () => {
      mockIsMobile.value = true

      const { setup } = useMobileProductInteractions(
        scrollContainer,
        refreshCallback,
        paginationHandler,
      )

      setup()

      expect(mockSetupPullToRefresh).toHaveBeenCalledWith(mockElement)
      expect(mockSetupSwipeListeners).toHaveBeenCalledWith(mockElement)
      expect(mockSetSwipeHandlers).toHaveBeenCalled()
    })

    it('setup skips initialization on desktop device', () => {
      mockIsMobile.value = false

      const { setup } = useMobileProductInteractions(
        scrollContainer,
        refreshCallback,
        paginationHandler,
      )

      setup()

      expect(mockSetupPullToRefresh).not.toHaveBeenCalled()
      expect(mockSetupSwipeListeners).not.toHaveBeenCalled()
      expect(mockSetSwipeHandlers).not.toHaveBeenCalled()
    })

    it('setup skips initialization when container is undefined', () => {
      mockIsMobile.value = true
      scrollContainer.value = undefined

      const { setup } = useMobileProductInteractions(
        scrollContainer,
        refreshCallback,
        paginationHandler,
      )

      setup()

      expect(mockSetupPullToRefresh).not.toHaveBeenCalled()
      expect(mockSetupSwipeListeners).not.toHaveBeenCalled()
    })

    it('setup skips initialization when container is null', () => {
      mockIsMobile.value = true
      scrollContainer.value = null as unknown

      const { setup } = useMobileProductInteractions(
        scrollContainer,
        refreshCallback,
        paginationHandler,
      )

      setup()

      expect(mockSetupPullToRefresh).not.toHaveBeenCalled()
      expect(mockSetupSwipeListeners).not.toHaveBeenCalled()
    })

    it('setup can be called multiple times safely', () => {
      mockIsMobile.value = true

      const { setup } = useMobileProductInteractions(
        scrollContainer,
        refreshCallback,
        paginationHandler,
      )

      setup()
      setup()
      setup()

      expect(mockSetupPullToRefresh).toHaveBeenCalledTimes(3)
      expect(mockSetupSwipeListeners).toHaveBeenCalledTimes(3)
    })

    it('setup initializes pull-to-refresh before swipe gestures', () => {
      mockIsMobile.value = true
      const callOrder: string[] = []

      mockSetupPullToRefresh.mockImplementation(() => {
        callOrder.push('pullToRefresh')
      })
      mockSetupSwipeListeners.mockImplementation(() => {
        callOrder.push('swipeListeners')
      })

      const { setup } = useMobileProductInteractions(
        scrollContainer,
        refreshCallback,
        paginationHandler,
      )

      setup()

      expect(callOrder).toEqual(['pullToRefresh', 'swipeListeners'])
    })

    it('setup configures swipe handlers for pagination', () => {
      mockIsMobile.value = true

      const { setup } = useMobileProductInteractions(
        scrollContainer,
        refreshCallback,
        paginationHandler,
      )

      setup()

      expect(mockSetSwipeHandlers).toHaveBeenCalledWith({
        onLeft: expect.any(Function),
        onRight: expect.any(Function),
      })
    })

    it('setup works when container becomes available after initial call', () => {
      mockIsMobile.value = true
      scrollContainer.value = undefined

      const { setup } = useMobileProductInteractions(
        scrollContainer,
        refreshCallback,
        paginationHandler,
      )

      setup() // First call - no container
      expect(mockSetupPullToRefresh).not.toHaveBeenCalled()

      scrollContainer.value = mockElement
      setup() // Second call - container available
      expect(mockSetupPullToRefresh).toHaveBeenCalledWith(mockElement)
    })
  })

  describe('Lifecycle Management - Cleanup', () => {
    it('cleanup removes all event listeners', () => {
      const { cleanup } = useMobileProductInteractions(
        scrollContainer,
        refreshCallback,
        paginationHandler,
      )

      cleanup()

      expect(mockCleanupPullToRefresh).toHaveBeenCalled()
      expect(mockCleanupSwipeListeners).toHaveBeenCalled()
    })

    it('cleanup can be called without prior setup', () => {
      const { cleanup } = useMobileProductInteractions(
        scrollContainer,
        refreshCallback,
        paginationHandler,
      )

      expect(() => cleanup()).not.toThrow()
      expect(mockCleanupPullToRefresh).toHaveBeenCalled()
      expect(mockCleanupSwipeListeners).toHaveBeenCalled()
    })

    it('cleanup can be called multiple times safely', () => {
      const { cleanup } = useMobileProductInteractions(
        scrollContainer,
        refreshCallback,
        paginationHandler,
      )

      cleanup()
      cleanup()
      cleanup()

      expect(mockCleanupPullToRefresh).toHaveBeenCalledTimes(3)
      expect(mockCleanupSwipeListeners).toHaveBeenCalledTimes(3)
    })

    it('cleanup works on both mobile and desktop', () => {
      mockIsMobile.value = false

      const { cleanup } = useMobileProductInteractions(
        scrollContainer,
        refreshCallback,
        paginationHandler,
      )

      cleanup()

      expect(mockCleanupPullToRefresh).toHaveBeenCalled()
      expect(mockCleanupSwipeListeners).toHaveBeenCalled()
    })

    it('cleanup removes pull-to-refresh before swipe listeners', () => {
      const callOrder: string[] = []

      mockCleanupPullToRefresh.mockImplementation(() => {
        callOrder.push('pullToRefresh')
      })
      mockCleanupSwipeListeners.mockImplementation(() => {
        callOrder.push('swipeListeners')
      })

      const { cleanup } = useMobileProductInteractions(
        scrollContainer,
        refreshCallback,
        paginationHandler,
      )

      cleanup()

      expect(callOrder).toEqual(['pullToRefresh', 'swipeListeners'])
    })

    it('setup after cleanup re-initializes properly', () => {
      mockIsMobile.value = true

      const { setup, cleanup } = useMobileProductInteractions(
        scrollContainer,
        refreshCallback,
        paginationHandler,
      )

      setup()
      cleanup()

      vi.clearAllMocks()

      setup()

      expect(mockSetupPullToRefresh).toHaveBeenCalledWith(mockElement)
      expect(mockSetupSwipeListeners).toHaveBeenCalledWith(mockElement)
    })
  })

  describe('Pull-to-Refresh Integration', () => {
    it('pull-to-refresh triggers haptic feedback before callback', async () => {
      const mockCallback = vi.fn().mockResolvedValue(undefined)
      const callOrder: string[] = []

      mockVibrate.mockImplementation(() => {
        callOrder.push('vibrate')
      })
      mockCallback.mockImplementation(async () => {
        callOrder.push('callback')
      })

      useMobileProductInteractions(
        scrollContainer,
        mockCallback,
        paginationHandler,
      )

      // Get the wrapped callback that was passed to usePullToRefresh
      const wrappedCallback = mockUsePullToRefresh.mock.calls[0][0]

      await wrappedCallback()

      expect(callOrder).toEqual(['vibrate', 'callback'])
      expect(mockVibrate).toHaveBeenCalledWith('pullRefresh')
    })

    it('pull-to-refresh exposes isRefreshing state', () => {
      mockPullToRefreshState.isRefreshing.value = true

      const { pullToRefresh } = useMobileProductInteractions(
        scrollContainer,
        refreshCallback,
        paginationHandler,
      )

      expect(pullToRefresh.isRefreshing.value).toBe(true)
    })

    it('pull-to-refresh exposes pullDistance state', () => {
      mockPullToRefreshState.pullDistance.value = 50

      const { pullToRefresh } = useMobileProductInteractions(
        scrollContainer,
        refreshCallback,
        paginationHandler,
      )

      expect(pullToRefresh.pullDistance.value).toBe(50)
    })

    it('pull-to-refresh exposes isPulling state', () => {
      mockPullToRefreshState.isPulling.value = true

      const { pullToRefresh } = useMobileProductInteractions(
        scrollContainer,
        refreshCallback,
        paginationHandler,
      )

      expect(pullToRefresh.isPulling.value).toBe(true)
    })

    it('pull-to-refresh exposes canRefresh state', () => {
      mockPullToRefreshState.canRefresh.value = true

      const { pullToRefresh } = useMobileProductInteractions(
        scrollContainer,
        refreshCallback,
        paginationHandler,
      )

      expect(pullToRefresh.canRefresh.value).toBe(true)
    })

    it('pull-to-refresh callback handles async operations', async () => {
      const mockCallback = vi.fn().mockResolvedValue(undefined)

      useMobileProductInteractions(
        scrollContainer,
        mockCallback,
        paginationHandler,
      )

      const wrappedCallback = mockUsePullToRefresh.mock.calls[0][0]

      const promise = wrappedCallback()
      expect(promise).toBeInstanceOf(Promise)
      await promise

      expect(mockCallback).toHaveBeenCalled()
    })

    it('pull-to-refresh callback handles errors gracefully', async () => {
      const mockCallback = vi.fn().mockRejectedValue(new Error('Refresh failed'))

      useMobileProductInteractions(
        scrollContainer,
        mockCallback,
        paginationHandler,
      )

      const wrappedCallback = mockUsePullToRefresh.mock.calls[0][0]

      await expect(wrappedCallback()).rejects.toThrow('Refresh failed')
    })

    it('pull-to-refresh uses vibrate with pullRefresh pattern', async () => {
      const mockCallback = vi.fn().mockResolvedValue(undefined)

      useMobileProductInteractions(
        scrollContainer,
        mockCallback,
        paginationHandler,
      )

      const wrappedCallback = mockUsePullToRefresh.mock.calls[0][0]

      await wrappedCallback()

      expect(mockVibrate).toHaveBeenCalledWith('pullRefresh')
      expect(mockVibrate).toHaveBeenCalledTimes(1)
    })

    it('pull-to-refresh vibration occurs even if callback fails', async () => {
      const mockCallback = vi.fn().mockRejectedValue(new Error('Failed'))

      useMobileProductInteractions(
        scrollContainer,
        mockCallback,
        paginationHandler,
      )

      const wrappedCallback = mockUsePullToRefresh.mock.calls[0][0]

      try {
        await wrappedCallback()
      }
      catch {
        // Expected to fail
      }

      expect(mockVibrate).toHaveBeenCalledWith('pullRefresh')
    })

    it('pull-to-refresh exposes setupPullToRefresh method', () => {
      const { pullToRefresh } = useMobileProductInteractions(
        scrollContainer,
        refreshCallback,
        paginationHandler,
      )

      expect(pullToRefresh.setupPullToRefresh).toBe(mockSetupPullToRefresh)
    })

    it('pull-to-refresh exposes cleanupPullToRefresh method', () => {
      const { pullToRefresh } = useMobileProductInteractions(
        scrollContainer,
        refreshCallback,
        paginationHandler,
      )

      expect(pullToRefresh.cleanupPullToRefresh).toBe(mockCleanupPullToRefresh)
    })
  })

  describe('Swipe Gesture Handling - Left Swipe', () => {
    it('swipe left navigates to next page', () => {
      mockIsMobile.value = true
      paginationHandler.currentPage = 2
      paginationHandler.totalPages = 5

      const { setup } = useMobileProductInteractions(
        scrollContainer,
        refreshCallback,
        paginationHandler,
      )

      setup()

      // Get the onLeft handler that was registered
      const handlers = mockSetSwipeHandlers.mock.calls[0][0]
      handlers.onLeft()

      expect(paginationHandler.goToPage).toHaveBeenCalledWith(3)
    })

    it('swipe left does not navigate beyond last page', () => {
      mockIsMobile.value = true
      paginationHandler.currentPage = 5
      paginationHandler.totalPages = 5

      const { setup } = useMobileProductInteractions(
        scrollContainer,
        refreshCallback,
        paginationHandler,
      )

      setup()

      const handlers = mockSetSwipeHandlers.mock.calls[0][0]
      handlers.onLeft()

      expect(paginationHandler.goToPage).not.toHaveBeenCalled()
    })

    it('swipe left from first page navigates to second page', () => {
      mockIsMobile.value = true
      paginationHandler.currentPage = 1
      paginationHandler.totalPages = 5

      const { setup } = useMobileProductInteractions(
        scrollContainer,
        refreshCallback,
        paginationHandler,
      )

      setup()

      const handlers = mockSetSwipeHandlers.mock.calls[0][0]
      handlers.onLeft()

      expect(paginationHandler.goToPage).toHaveBeenCalledWith(2)
    })

    it('swipe left from second-to-last page navigates to last page', () => {
      mockIsMobile.value = true
      paginationHandler.currentPage = 4
      paginationHandler.totalPages = 5

      const { setup } = useMobileProductInteractions(
        scrollContainer,
        refreshCallback,
        paginationHandler,
      )

      setup()

      const handlers = mockSetSwipeHandlers.mock.calls[0][0]
      handlers.onLeft()

      expect(paginationHandler.goToPage).toHaveBeenCalledWith(5)
    })

    it('swipe left works with single page collection', () => {
      mockIsMobile.value = true
      paginationHandler.currentPage = 1
      paginationHandler.totalPages = 1

      const { setup } = useMobileProductInteractions(
        scrollContainer,
        refreshCallback,
        paginationHandler,
      )

      setup()

      const handlers = mockSetSwipeHandlers.mock.calls[0][0]
      handlers.onLeft()

      expect(paginationHandler.goToPage).not.toHaveBeenCalled()
    })
  })

  describe('Swipe Gesture Handling - Right Swipe', () => {
    it('swipe right navigates to previous page', () => {
      mockIsMobile.value = true
      paginationHandler.currentPage = 3
      paginationHandler.totalPages = 5

      const { setup } = useMobileProductInteractions(
        scrollContainer,
        refreshCallback,
        paginationHandler,
      )

      setup()

      const handlers = mockSetSwipeHandlers.mock.calls[0][0]
      handlers.onRight()

      expect(paginationHandler.goToPage).toHaveBeenCalledWith(2)
    })

    it('swipe right does not navigate before first page', () => {
      mockIsMobile.value = true
      paginationHandler.currentPage = 1
      paginationHandler.totalPages = 5

      const { setup } = useMobileProductInteractions(
        scrollContainer,
        refreshCallback,
        paginationHandler,
      )

      setup()

      const handlers = mockSetSwipeHandlers.mock.calls[0][0]
      handlers.onRight()

      expect(paginationHandler.goToPage).not.toHaveBeenCalled()
    })

    it('swipe right from last page navigates to second-to-last page', () => {
      mockIsMobile.value = true
      paginationHandler.currentPage = 5
      paginationHandler.totalPages = 5

      const { setup } = useMobileProductInteractions(
        scrollContainer,
        refreshCallback,
        paginationHandler,
      )

      setup()

      const handlers = mockSetSwipeHandlers.mock.calls[0][0]
      handlers.onRight()

      expect(paginationHandler.goToPage).toHaveBeenCalledWith(4)
    })

    it('swipe right from second page navigates to first page', () => {
      mockIsMobile.value = true
      paginationHandler.currentPage = 2
      paginationHandler.totalPages = 5

      const { setup } = useMobileProductInteractions(
        scrollContainer,
        refreshCallback,
        paginationHandler,
      )

      setup()

      const handlers = mockSetSwipeHandlers.mock.calls[0][0]
      handlers.onRight()

      expect(paginationHandler.goToPage).toHaveBeenCalledWith(1)
    })

    it('swipe right works with single page collection', () => {
      mockIsMobile.value = true
      paginationHandler.currentPage = 1
      paginationHandler.totalPages = 1

      const { setup } = useMobileProductInteractions(
        scrollContainer,
        refreshCallback,
        paginationHandler,
      )

      setup()

      const handlers = mockSetSwipeHandlers.mock.calls[0][0]
      handlers.onRight()

      expect(paginationHandler.goToPage).not.toHaveBeenCalled()
    })
  })

  describe('Swipe Gesture Handling - Edge Cases', () => {
    it('swipe handlers work with two-page collection', () => {
      mockIsMobile.value = true
      paginationHandler.currentPage = 1
      paginationHandler.totalPages = 2

      const { setup } = useMobileProductInteractions(
        scrollContainer,
        refreshCallback,
        paginationHandler,
      )

      setup()

      const handlers = mockSetSwipeHandlers.mock.calls[0][0]

      // Can go forward from page 1
      handlers.onLeft()
      expect(paginationHandler.goToPage).toHaveBeenCalledWith(2)

      vi.clearAllMocks()

      // Cannot go back from page 1
      handlers.onRight()
      expect(paginationHandler.goToPage).not.toHaveBeenCalled()
    })

    it('swipe handlers only register onLeft and onRight', () => {
      mockIsMobile.value = true

      const { setup } = useMobileProductInteractions(
        scrollContainer,
        refreshCallback,
        paginationHandler,
      )

      setup()

      const handlers = mockSetSwipeHandlers.mock.calls[0][0]

      expect(handlers.onLeft).toBeDefined()
      expect(handlers.onRight).toBeDefined()
      expect(handlers.onUp).toBeUndefined()
      expect(handlers.onDown).toBeUndefined()
    })

    it('swipe exposes state correctly', () => {
      mockSwipeState.isSwipeActive.value = true
      mockSwipeState.swipeDirection.value = 'left'
      mockSwipeState.swipeDistance.value = 100

      const { swipeGestures } = useMobileProductInteractions(
        scrollContainer,
        refreshCallback,
        paginationHandler,
      )

      expect(swipeGestures.isSwipeActive.value).toBe(true)
      expect(swipeGestures.swipeDirection.value).toBe('left')
      expect(swipeGestures.swipeDistance.value).toBe(100)
    })

    it('swipe exposes setupSwipeListeners method', () => {
      const { swipeGestures } = useMobileProductInteractions(
        scrollContainer,
        refreshCallback,
        paginationHandler,
      )

      expect(swipeGestures.setupSwipeListeners).toBe(mockSetupSwipeListeners)
    })

    it('swipe exposes cleanupSwipeListeners method', () => {
      const { swipeGestures } = useMobileProductInteractions(
        scrollContainer,
        refreshCallback,
        paginationHandler,
      )

      expect(swipeGestures.cleanupSwipeListeners).toBe(mockCleanupSwipeListeners)
    })
  })

  describe('Mobile Detection', () => {
    it('detects mobile device correctly', () => {
      mockIsMobile.value = true

      const { isMobile } = useMobileProductInteractions(
        scrollContainer,
        refreshCallback,
        paginationHandler,
      )

      expect(isMobile.value).toBe(true)
    })

    it('detects desktop device correctly', () => {
      mockIsMobile.value = false

      const { isMobile } = useMobileProductInteractions(
        scrollContainer,
        refreshCallback,
        paginationHandler,
      )

      expect(isMobile.value).toBe(false)
    })

    it('isMobile state is reactive', () => {
      mockIsMobile.value = false

      const { isMobile } = useMobileProductInteractions(
        scrollContainer,
        refreshCallback,
        paginationHandler,
      )

      expect(isMobile.value).toBe(false)

      mockIsMobile.value = true

      expect(isMobile.value).toBe(true)
    })

    it('setup respects mobile state changes', () => {
      mockIsMobile.value = false

      const { setup } = useMobileProductInteractions(
        scrollContainer,
        refreshCallback,
        paginationHandler,
      )

      setup()
      expect(mockSetupPullToRefresh).not.toHaveBeenCalled()

      mockIsMobile.value = true

      setup()
      expect(mockSetupPullToRefresh).toHaveBeenCalledWith(mockElement)
    })

    it('uses useDevice composable for mobile detection', () => {
      useMobileProductInteractions(
        scrollContainer,
        refreshCallback,
        paginationHandler,
      )

      expect(mockUseDevice).toHaveBeenCalled()
    })

    it('uses useHapticFeedback composable for vibration', () => {
      useMobileProductInteractions(
        scrollContainer,
        refreshCallback,
        paginationHandler,
      )

      expect(mockUseHapticFeedback).toHaveBeenCalled()
    })
  })

  describe('Facade Pattern Integration', () => {
    it('provides unified interface for mobile interactions', () => {
      const api = useMobileProductInteractions(
        scrollContainer,
        refreshCallback,
        paginationHandler,
      )

      // Exposes sub-composable APIs
      expect(api.pullToRefresh).toBeDefined()
      expect(api.swipeGestures).toBeDefined()

      // Exposes device detection
      expect(api.isMobile).toBeDefined()

      // Exposes lifecycle methods
      expect(api.setup).toBeDefined()
      expect(api.cleanup).toBeDefined()
    })

    it('coordinates multiple composables correctly', () => {
      mockIsMobile.value = true

      const { setup, cleanup } = useMobileProductInteractions(
        scrollContainer,
        refreshCallback,
        paginationHandler,
      )

      setup()

      // All sub-composables should be set up
      expect(mockSetupPullToRefresh).toHaveBeenCalled()
      expect(mockSetupSwipeListeners).toHaveBeenCalled()
      expect(mockSetSwipeHandlers).toHaveBeenCalled()

      cleanup()

      // All sub-composables should be cleaned up
      expect(mockCleanupPullToRefresh).toHaveBeenCalled()
      expect(mockCleanupSwipeListeners).toHaveBeenCalled()
    })

    it('maintains separation of concerns between sub-composables', () => {
      const { pullToRefresh, swipeGestures } = useMobileProductInteractions(
        scrollContainer,
        refreshCallback,
        paginationHandler,
      )

      // Pull-to-refresh has its own state and methods
      expect(pullToRefresh.isRefreshing).toBeDefined()
      expect(pullToRefresh.setupPullToRefresh).toBeDefined()

      // Swipe gestures has its own state and methods
      expect(swipeGestures.isSwipeActive).toBeDefined()
      expect(swipeGestures.setupSwipeListeners).toBeDefined()

      // They are independent objects
      expect(pullToRefresh).not.toBe(swipeGestures)
    })
  })
})
