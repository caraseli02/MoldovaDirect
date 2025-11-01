/**
 * Composable Test Template
 *
 * This template provides a standard structure for testing Vue composables.
 * Use setActivePinia before each test to ensure clean state.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { ref } from 'vue'
import { useComposableName } from './useComposableName'

describe('useComposableName', () => {
  beforeEach(() => {
    // Setup: Create fresh Pinia instance for each test
    setActivePinia(createPinia())

    // Reset any mocks
    vi.clearAllMocks()
  })

  describe('Initialization', () => {
    it('initializes with correct default values', () => {
      // Arrange & Act
      const { state, isLoading, error } = useComposableName()

      // Assert
      expect(state.value).toEqual(/* expected initial state */)
      expect(isLoading.value).toBe(false)
      expect(error.value).toBeNull()
    })

    it('accepts initial configuration', () => {
      // Arrange
      const config = { option: 'value' }

      // Act
      const { state } = useComposableName(config)

      // Assert
      expect(state.value).toMatchObject(config)
    })
  })

  describe('Reactive State', () => {
    it('updates state when method is called', async () => {
      // Arrange
      const { state, updateState } = useComposableName()

      // Act
      await updateState({ newValue: 'test' })

      // Assert
      expect(state.value.newValue).toBe('test')
    })

    it('triggers computed values to recalculate', () => {
      // Arrange
      const { state, computedValue, updateState } = useComposableName()

      // Act
      updateState({ value: 10 })

      // Assert
      expect(computedValue.value).toBe(20) // Example: value * 2
    })
  })

  describe('Async Operations', () => {
    it('sets loading state during async operation', async () => {
      // Arrange
      const { isLoading, fetchData } = useComposableName()

      // Act
      const promise = fetchData()

      // Assert: Loading state
      expect(isLoading.value).toBe(true)

      await promise

      // Assert: Completed state
      expect(isLoading.value).toBe(false)
    })

    it('handles successful data fetch', async () => {
      // Arrange
      const { data, fetchData } = useComposableName()
      const mockData = { id: 1, name: 'Test' }

      // Mock API call
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockData,
      })

      // Act
      await fetchData()

      // Assert
      expect(data.value).toEqual(mockData)
    })

    it('handles fetch errors correctly', async () => {
      // Arrange
      const { error, fetchData } = useComposableName()
      const errorMessage = 'Network error'

      // Mock API failure
      global.fetch = vi.fn().mockRejectedValue(new Error(errorMessage))

      // Act
      await fetchData()

      // Assert
      expect(error.value).toBeTruthy()
      expect(error.value?.message).toContain(errorMessage)
    })
  })

  describe('Event Handlers', () => {
    it('executes callback when event occurs', async () => {
      // Arrange
      const callback = vi.fn()
      const { onEvent, triggerEvent } = useComposableName()

      onEvent(callback)

      // Act
      await triggerEvent({ data: 'test' })

      // Assert
      expect(callback).toHaveBeenCalledTimes(1)
      expect(callback).toHaveBeenCalledWith({ data: 'test' })
    })
  })

  describe('Cleanup', () => {
    it('cleans up resources when disposed', () => {
      // Arrange
      const { cleanup } = useComposableName()
      const mockUnsubscribe = vi.fn()

      // Simulate subscription
      vi.spyOn(window, 'addEventListener')
      vi.spyOn(window, 'removeEventListener')

      // Act
      cleanup()

      // Assert
      expect(window.removeEventListener).toHaveBeenCalled()
    })
  })

  describe('Edge Cases', () => {
    it('handles multiple simultaneous calls', async () => {
      // Arrange
      const { fetchData } = useComposableName()

      // Act
      const promises = [
        fetchData(),
        fetchData(),
        fetchData(),
      ]

      await Promise.all(promises)

      // Assert: Should handle concurrent calls gracefully
      expect(promises).toHaveLength(3)
    })

    it('handles invalid input gracefully', async () => {
      // Arrange
      const { processInput } = useComposableName()

      // Act & Assert
      await expect(processInput(null as any)).rejects.toThrow()
    })
  })
})
