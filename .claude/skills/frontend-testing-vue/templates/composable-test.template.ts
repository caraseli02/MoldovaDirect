/**
 * Test Template for Vue Composables
 *
 * INSTRUCTIONS:
 * 1. Replace `useComposableName` with your composable name
 * 2. Update import path
 * 3. Add/remove test sections based on composable features
 *
 * CRITICAL: Always use dynamic imports AFTER setting up mocks
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { nextTick, ref } from 'vue'
import { setActivePinia, createPinia } from 'pinia'

// ============================================================================
// Mocks (MUST be before dynamic imports)
// ============================================================================

// Router mock (if composable uses useRoute/useRouter)
const mockPush = vi.fn()
const mockRoute = {
  params: {},
  query: {},
  path: '/',
}

vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => ({
    push: mockPush,
    replace: vi.fn(),
  })),
  useRoute: vi.fn(() => mockRoute),
}))

// API mock
const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)

// ============================================================================
// Tests
// ============================================================================

describe('useComposableName', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    
    // Reset route mock
    Object.assign(mockRoute, {
      params: {},
      query: {},
      path: '/',
    })
  })

  // --------------------------------------------------------------------------
  // Initial State
  // --------------------------------------------------------------------------
  describe('Initial State', () => {
    it('should return initial values', async () => {
      // const { useComposableName } = await import('./useComposableName')
      // const { value, loading, error } = useComposableName()
      //
      // expect(value.value).toBe(null)
      // expect(loading.value).toBe(false)
      // expect(error.value).toBe(null)
    })

    it('should accept initial config', async () => {
      // const { useComposableName } = await import('./useComposableName')
      // const { value } = useComposableName({ initialValue: 'custom' })
      //
      // expect(value.value).toBe('custom')
    })
  })

  // --------------------------------------------------------------------------
  // State Updates
  // --------------------------------------------------------------------------
  describe('State Updates', () => {
    it('should update value', async () => {
      // const { useComposableName } = await import('./useComposableName')
      // const { value, setValue } = useComposableName()
      //
      // setValue('new value')
      //
      // expect(value.value).toBe('new value')
    })

    it('should reset to initial state', async () => {
      // const { useComposableName } = await import('./useComposableName')
      // const { value, setValue, reset } = useComposableName({ initialValue: 'initial' })
      //
      // setValue('changed')
      // expect(value.value).toBe('changed')
      //
      // reset()
      // expect(value.value).toBe('initial')
    })
  })

  // --------------------------------------------------------------------------
  // Computed Values
  // --------------------------------------------------------------------------
  describe('Computed Values', () => {
    it('should compute derived value', async () => {
      // const { useComposableName } = await import('./useComposableName')
      // const { items, totalCount } = useComposableName()
      //
      // items.value = [1, 2, 3]
      // await nextTick()
      //
      // expect(totalCount.value).toBe(3)
    })

    it('should update computed when dependencies change', async () => {
      // const { useComposableName } = await import('./useComposableName')
      // const { items, isEmpty } = useComposableName()
      //
      // expect(isEmpty.value).toBe(true)
      //
      // items.value = [1]
      // await nextTick()
      //
      // expect(isEmpty.value).toBe(false)
    })
  })

  // --------------------------------------------------------------------------
  // Async Operations
  // --------------------------------------------------------------------------
  describe('Async Operations', () => {
    it('should fetch data', async () => {
      // mockFetch.mockResolvedValue({ data: [{ id: '1' }] })
      //
      // const { useComposableName } = await import('./useComposableName')
      // const { data, loading, fetchData } = useComposableName()
      //
      // expect(loading.value).toBe(false)
      //
      // const fetchPromise = fetchData()
      // expect(loading.value).toBe(true)
      //
      // await fetchPromise
      //
      // expect(loading.value).toBe(false)
      // expect(data.value).toEqual([{ id: '1' }])
    })

    it('should handle fetch error', async () => {
      // mockFetch.mockRejectedValue(new Error('Network error'))
      //
      // const { useComposableName } = await import('./useComposableName')
      // const { error, fetchData } = useComposableName()
      //
      // await fetchData()
      //
      // expect(error.value?.message).toBe('Network error')
    })
  })

  // --------------------------------------------------------------------------
  // Watch Effects (if composable uses watch/watchEffect)
  // --------------------------------------------------------------------------
  describe('Watch Effects', () => {
    it('should react to dependency changes', async () => {
      // const { useComposableName } = await import('./useComposableName')
      // const { query, results } = useComposableName()
      //
      // mockFetch.mockResolvedValue({ results: [{ id: '1' }] })
      //
      // query.value = 'search term'
      // await nextTick()
      //
      // // Wait for debounce if applicable
      // // vi.advanceTimersByTime(300)
      //
      // expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('search term'))
    })
  })

  // --------------------------------------------------------------------------
  // Router Integration (if composable uses router)
  // --------------------------------------------------------------------------
  describe('Router Integration', () => {
    it('should read from route query', async () => {
      // mockRoute.query = { filter: 'active' }
      //
      // const { useComposableName } = await import('./useComposableName')
      // const { filter } = useComposableName()
      //
      // expect(filter.value).toBe('active')
    })

    it('should update route on change', async () => {
      // const { useComposableName } = await import('./useComposableName')
      // const { setFilter } = useComposableName()
      //
      // setFilter('completed')
      //
      // expect(mockPush).toHaveBeenCalledWith({
      //   query: expect.objectContaining({ filter: 'completed' }),
      // })
    })
  })

  // --------------------------------------------------------------------------
  // Store Integration (if composable uses Pinia store)
  // --------------------------------------------------------------------------
  describe('Store Integration', () => {
    it('should interact with store', async () => {
      // const { useComposableName } = await import('./useComposableName')
      // const { useMyStore } = await import('~/stores/myStore')
      //
      // const store = useMyStore()
      // store.items = [{ id: '1' }]
      //
      // const { storeItems } = useComposableName()
      //
      // expect(storeItems.value).toHaveLength(1)
    })
  })

  // --------------------------------------------------------------------------
  // Edge Cases
  // --------------------------------------------------------------------------
  describe('Edge Cases', () => {
    it('should handle null input', async () => {
      // const { useComposableName } = await import('./useComposableName')
      // const { process, result } = useComposableName()
      //
      // process(null)
      //
      // expect(result.value).toBe(null)
    })

    it('should handle empty array', async () => {
      // const { useComposableName } = await import('./useComposableName')
      // const { items, isEmpty } = useComposableName()
      //
      // items.value = []
      //
      // expect(isEmpty.value).toBe(true)
    })

    it('should handle rapid updates', async () => {
      // const { useComposableName } = await import('./useComposableName')
      // const { setValue, value } = useComposableName()
      //
      // setValue('1')
      // setValue('2')
      // setValue('3')
      //
      // expect(value.value).toBe('3')
    })
  })

  // --------------------------------------------------------------------------
  // Cleanup (if composable has side effects)
  // --------------------------------------------------------------------------
  describe('Cleanup', () => {
    it('should cleanup on unmount', async () => {
      // const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
      //
      // const { useComposableName } = await import('./useComposableName')
      // const scope = effectScope()
      //
      // scope.run(() => {
      //   useComposableName()
      // })
      //
      // scope.stop()
      //
      // expect(removeEventListenerSpy).toHaveBeenCalled()
    })
  })
})

// ============================================================================
// Fake Timers Template (if testing debounce/throttle)
// ============================================================================

describe('useComposableName with timers', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should debounce calls', async () => {
    // const { useComposableName } = await import('./useComposableName')
    // const { search, debouncedSearch } = useComposableName()
    //
    // search('query')
    //
    // // Not called immediately
    // expect(debouncedSearch.value).toBe('')
    //
    // vi.advanceTimersByTime(300)
    // await nextTick()
    //
    // expect(debouncedSearch.value).toBe('query')
  })
})
