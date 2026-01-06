# Async Testing Guide for Vue/Nuxt

## Core Async Patterns

### 1. Using `await` with Component Updates

```typescript
import { mount, flushPromises } from '@vue/test-utils'
import { nextTick } from 'vue'

it('should update after async operation', async () => {
  const wrapper = mount(AsyncComponent)
  
  // Trigger async action
  await wrapper.find('button').trigger('click')
  
  // Wait for all promises to resolve
  await flushPromises()
  
  // Or wait for Vue's reactivity
  await nextTick()
  
  expect(wrapper.text()).toContain('Loaded')
})
```

### 2. Testing Composables with Async Operations

```typescript
import { ref } from 'vue'

describe('useAsyncData', () => {
  const mockFetch = vi.fn()
  
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('$fetch', mockFetch)
  })

  it('should fetch data on call', async () => {
    mockFetch.mockResolvedValue({ items: ['a', 'b'] })
    
    const { useAsyncData } = await import('~/composables/useAsyncData')
    const { data, pending, fetch } = useAsyncData()
    
    expect(pending.value).toBe(false)
    
    const fetchPromise = fetch()
    expect(pending.value).toBe(true)
    
    await fetchPromise
    
    expect(pending.value).toBe(false)
    expect(data.value).toEqual({ items: ['a', 'b'] })
  })

  it('should handle errors', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))
    
    const { useAsyncData } = await import('~/composables/useAsyncData')
    const { error, fetch } = useAsyncData()
    
    await fetch()
    
    expect(error.value).toBeTruthy()
    expect(error.value?.message).toBe('Network error')
  })
})
```

### 3. Testing useFetch / useAsyncData Patterns

```typescript
// Mock useFetch at module level
vi.mock('#imports', async () => {
  const actual = await vi.importActual('./tests/setup/nuxt-imports-mock.ts')
  return {
    ...actual,
    useFetch: vi.fn(),
  }
})

import { useFetch } from '#imports'

describe('Component with useFetch', () => {
  it('should display loading state', () => {
    vi.mocked(useFetch).mockReturnValue({
      data: ref(null),
      pending: ref(true),
      error: ref(null),
      refresh: vi.fn(),
    })
    
    const wrapper = mount(DataComponent)
    
    expect(wrapper.find('[data-testid="loading"]').exists()).toBe(true)
  })

  it('should display data on success', () => {
    vi.mocked(useFetch).mockReturnValue({
      data: ref({ items: ['Item 1', 'Item 2'] }),
      pending: ref(false),
      error: ref(null),
      refresh: vi.fn(),
    })
    
    const wrapper = mount(DataComponent)
    
    expect(wrapper.text()).toContain('Item 1')
    expect(wrapper.text()).toContain('Item 2')
  })

  it('should display error state', () => {
    vi.mocked(useFetch).mockReturnValue({
      data: ref(null),
      pending: ref(false),
      error: ref(new Error('Failed to fetch')),
      refresh: vi.fn(),
    })
    
    const wrapper = mount(DataComponent)
    
    expect(wrapper.find('[data-testid="error"]').exists()).toBe(true)
  })
})
```

## Fake Timers

### When to Use Fake Timers

- Testing debounce/throttle behavior
- Testing delayed transitions
- Testing polling or retry logic
- Testing timeout behavior

### Basic Fake Timer Setup

```typescript
describe('Debounced Search', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should debounce search input', async () => {
    const onSearch = vi.fn()
    const wrapper = mount(SearchInput, {
      props: { onSearch, debounceMs: 300 },
    })
    
    // Type in the input
    await wrapper.find('input').setValue('query')
    
    // Search not called immediately
    expect(onSearch).not.toHaveBeenCalled()
    
    // Advance timers
    vi.advanceTimersByTime(300)
    
    // Now search is called
    expect(onSearch).toHaveBeenCalledWith('query')
  })
})
```

### Fake Timers with Vue Reactivity

```typescript
it('should show toast for 3 seconds', async () => {
  vi.useFakeTimers()
  
  const wrapper = mount(ToastComponent)
  
  // Trigger toast
  await wrapper.vm.showToast('Success!')
  expect(wrapper.find('.toast').exists()).toBe(true)
  
  // Advance 2 seconds - toast still visible
  vi.advanceTimersByTime(2000)
  await nextTick()
  expect(wrapper.find('.toast').exists()).toBe(true)
  
  // Advance 1 more second - toast hidden
  vi.advanceTimersByTime(1000)
  await nextTick()
  expect(wrapper.find('.toast').exists()).toBe(false)
  
  vi.useRealTimers()
})
```

## API Testing Patterns

### Loading → Success → Error States

```typescript
describe('ProductList', () => {
  const mockFetch = vi.fn()
  
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('$fetch', mockFetch)
  })

  it('should show loading state', async () => {
    // Never-resolving promise keeps loading state
    mockFetch.mockImplementation(() => new Promise(() => {}))
    
    const wrapper = mount(ProductList)
    
    expect(wrapper.find('[data-testid="loading"]').exists()).toBe(true)
  })

  it('should show products on success', async () => {
    mockFetch.mockResolvedValue({
      products: [
        { id: '1', name: 'Wine' },
        { id: '2', name: 'Cheese' },
      ],
    })
    
    const wrapper = mount(ProductList)
    await flushPromises()
    
    expect(wrapper.findAll('.product-item')).toHaveLength(2)
    expect(wrapper.text()).toContain('Wine')
  })

  it('should show error on failure', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))
    
    const wrapper = mount(ProductList)
    await flushPromises()
    
    expect(wrapper.find('[data-testid="error"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Network error')
  })

  it('should retry on error', async () => {
    mockFetch
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({ products: [{ id: '1', name: 'Wine' }] })
    
    const wrapper = mount(ProductList)
    await flushPromises()
    
    // Click retry button
    await wrapper.find('[data-testid="retry"]').trigger('click')
    await flushPromises()
    
    expect(wrapper.text()).toContain('Wine')
  })
})
```

## Watch/WatchEffect Testing

### Testing Watch Execution

```typescript
describe('useWatcher', () => {
  it('should react to dependency changes', async () => {
    const callback = vi.fn()
    
    const { useWatcher } = await import('~/composables/useWatcher')
    const { value, setCallback } = useWatcher()
    
    setCallback(callback)
    
    // Change value
    value.value = 'new'
    
    // Wait for watch to trigger
    await nextTick()
    
    expect(callback).toHaveBeenCalledWith('new', undefined)
  })
})
```

### Testing Watch with Immediate

```typescript
it('should call immediately when immediate is true', async () => {
  const callback = vi.fn()
  
  const wrapper = mount(WatchComponent, {
    props: { onValueChange: callback, immediate: true },
  })
  
  // Should be called immediately on mount
  expect(callback).toHaveBeenCalledTimes(1)
})
```

## Testing onMounted / Lifecycle

```typescript
describe('Component with onMounted', () => {
  it('should fetch data on mount', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ data: 'test' })
    vi.stubGlobal('$fetch', mockFetch)
    
    mount(DataComponent)
    
    // onMounted runs synchronously during mount
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it('should setup event listeners on mount', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener')
    
    mount(KeyboardComponent)
    
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'keydown',
      expect.any(Function)
    )
  })

  it('should cleanup on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
    
    const wrapper = mount(KeyboardComponent)
    wrapper.unmount()
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'keydown',
      expect.any(Function)
    )
  })
})
```

## Common Async Pitfalls

### ❌ Don't: Forget to await

```typescript
// Bad - test may pass even if assertion fails
it('should load data', () => {
  const wrapper = mount(Component)
  wrapper.find('button').trigger('click')
  expect(wrapper.text()).toContain('Loaded') // May fail intermittently!
})

// Good - properly awaited
it('should load data', async () => {
  const wrapper = mount(Component)
  await wrapper.find('button').trigger('click')
  await flushPromises()
  expect(wrapper.text()).toContain('Loaded')
})
```

### ❌ Don't: Forget flushPromises

```typescript
// Bad - checking before promises resolve
it('should display fetched data', async () => {
  mockFetch.mockResolvedValue({ name: 'Test' })
  const wrapper = mount(Component)
  expect(wrapper.text()).toContain('Test') // Fails! Data not loaded yet
})

// Good - wait for promises
it('should display fetched data', async () => {
  mockFetch.mockResolvedValue({ name: 'Test' })
  const wrapper = mount(Component)
  await flushPromises()
  expect(wrapper.text()).toContain('Test')
})
```

### ❌ Don't: Mix fake timers with real async

```typescript
// Bad - fake timers don't work well with real Promises
vi.useFakeTimers()
await flushPromises() // May timeout or behave unexpectedly!

// Good - use runAllTimers for timer-based code
vi.useFakeTimers()
vi.runAllTimers()
await nextTick() // For Vue reactivity updates
```

### ❌ Don't: Forget nextTick for reactivity

```typescript
// Bad - not waiting for Vue to update
it('should update display', () => {
  const wrapper = mount(Counter)
  wrapper.vm.count = 5
  expect(wrapper.text()).toContain('5') // May fail!
})

// Good - wait for reactivity
it('should update display', async () => {
  const wrapper = mount(Counter)
  wrapper.vm.count = 5
  await nextTick()
  expect(wrapper.text()).toContain('5')
})
```

## Vitest vi.waitFor (Official Pattern)

Vitest 3.x provides `vi.waitFor()` for waiting on async conditions. This is cleaner than manual polling:

```typescript
import { vi, expect, it } from 'vitest'

it('should wait for async condition', async () => {
  const mockFetch = vi.fn()
  mockFetch.mockResolvedValue({ results: [{ id: '1' }] })

  const { useSearch } = await import('./useSearch')
  const { query, results } = useSearch()

  query.value = 'test'
  vi.advanceTimersByTime(300)

  // vi.waitFor retries until condition passes or timeout
  await vi.waitFor(() => {
    expect(mockFetch).toHaveBeenCalledWith('/api/search?q=test')
  })

  expect(results.value).toHaveLength(1)
})
```

### vi.waitFor Options

```typescript
await vi.waitFor(
  () => {
    expect(someCondition).toBe(true)
  },
  {
    timeout: 1000,     // Max wait time (default: 1000ms)
    interval: 50,      // Check interval (default: 50ms)
  }
)
```

### When to Use vi.waitFor vs flushPromises

| Scenario | Use |
|----------|-----|
| Single promise resolution | `await flushPromises()` |
| Multiple async steps | `vi.waitFor()` |
| Waiting for DOM updates | `await nextTick()` |
| Polling-based assertions | `vi.waitFor()` |
| Debounced/throttled code | `vi.waitFor()` with fake timers |

### Example: Testing Debounced Search

```typescript
it('should debounce and fetch', async () => {
  vi.useFakeTimers()

  const mockFetch = vi.fn().mockResolvedValue({ items: ['result'] })
  vi.stubGlobal('$fetch', mockFetch)

  const { useSearch } = await import('./useSearch')
  const { query } = useSearch()

  // Type quickly
  query.value = 't'
  query.value = 'te'
  query.value = 'tes'
  query.value = 'test'

  // Advance past debounce delay
  vi.advanceTimersByTime(300)

  // Wait for the async fetch to complete
  await vi.waitFor(() => {
    expect(mockFetch).toHaveBeenCalledTimes(1) // Only one call due to debounce
  })

  vi.useRealTimers()
})
```

## Utility Functions

```typescript
// tests/utils/async-helpers.ts
import { flushPromises } from '@vue/test-utils'
import { nextTick } from 'vue'

/**
 * Wait for all pending promises and Vue updates
 */
export async function waitForUpdates() {
  await flushPromises()
  await nextTick()
}

// Note: For waiting on conditions, use the built-in vi.waitFor() instead:
// await vi.waitFor(() => expect(element).toBeVisible())
```
