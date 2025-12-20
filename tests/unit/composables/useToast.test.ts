/**
 * useToast Composable Tests
 * Tests for toast notification functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'

import { useToast } from '~/composables/useToast'
import { toast as mockToast } from 'vue-sonner'

// Must declare mock INSIDE vi.mock factory to avoid hoisting issues
vi.mock('vue-sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}))

// Mock useI18n globally
vi.stubGlobal('useI18n', () => ({
  t: (key: string, params?: unknown) => params ? `${key}:${JSON.stringify(params)}` : key,
}))

describe('useToast', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Toast Methods', () => {
    it('should show success toast', () => {
      const { success } = useToast()

      success('Title', 'Message')

      expect(mockToast.success).toHaveBeenCalledWith('Title', expect.objectContaining({
        description: 'Message',
      }))
    })

    it('should show error toast', () => {
      const { error } = useToast()

      error('Error Title', 'Error Message')

      expect(mockToast.error).toHaveBeenCalledWith('Error Title', expect.objectContaining({
        description: 'Error Message',
      }))
    })

    it('should show warning toast', () => {
      const { warning } = useToast()

      warning('Warning Title', 'Warning Message')

      expect(mockToast.warning).toHaveBeenCalledWith('Warning Title', expect.objectContaining({
        description: 'Warning Message',
      }))
    })

    it('should show info toast', () => {
      const { info } = useToast()

      info('Info Title', 'Info Message')

      expect(mockToast.info).toHaveBeenCalledWith('Info Title', expect.objectContaining({
        description: 'Info Message',
      }))
    })
  })

  describe('Toast Options', () => {
    it('should pass duration option', () => {
      const { success } = useToast()

      success('Title', 'Message', { duration: 5000 })

      expect(mockToast.success).toHaveBeenCalledWith('Title', expect.objectContaining({
        duration: 5000,
      }))
    })

    it('should pass action when provided', () => {
      const { success } = useToast()
      const actionHandler = vi.fn()

      success('Title', 'Message', {
        actionText: 'Undo',
        actionHandler,
      })

      expect(mockToast.success).toHaveBeenCalledWith('Title', expect.objectContaining({
        action: expect.objectContaining({
          label: 'Undo',
          onClick: actionHandler,
        }),
      }))
    })

    it('should not include action when not provided', () => {
      const { success } = useToast()

      success('Title', 'Message')

      expect(mockToast.success).toHaveBeenCalledWith('Title', expect.objectContaining({
        action: undefined,
      }))
    })

    it('should handle message-only toast', () => {
      const { info } = useToast()

      info('Title Only')

      expect(mockToast.info).toHaveBeenCalledWith('Title Only', expect.objectContaining({
        description: undefined,
      }))
    })
  })

  describe('Legacy API Deprecation', () => {
    it('should warn on addToast usage', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const { addToast } = useToast()

      addToast()

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('deprecated'))
      consoleSpy.mockRestore()
    })

    it('should warn on removeToast usage', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const { removeToast } = useToast()

      removeToast()

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('deprecated'))
      consoleSpy.mockRestore()
    })

    it('should warn on clearAll usage', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const { clearAll } = useToast()

      clearAll()

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('deprecated'))
      consoleSpy.mockRestore()
    })
  })

  describe('Cart-specific Helpers', () => {
    it('should show cart success toast', () => {
      const { cartSuccess } = useToast()

      cartSuccess('itemAdded')

      expect(mockToast.success).toHaveBeenCalled()
    })

    it('should show cart success with product name', () => {
      const { cartSuccess } = useToast()

      cartSuccess('itemAdded', 'Wine')

      expect(mockToast.success).toHaveBeenCalled()
    })

    it('should show cart error toast', () => {
      const { cartError } = useToast()

      cartError('outOfStock', 'Product unavailable')

      expect(mockToast.error).toHaveBeenCalled()
    })

    it('should show cart error with long duration', () => {
      const { cartError } = useToast()

      cartError('networkError', 'Connection failed')

      expect(mockToast.error).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          duration: 10000,
        }),
      )
    })

    it('should show cart warning toast', () => {
      const { cartWarning } = useToast()

      cartWarning('lowStock', 'Only 2 items left')

      expect(mockToast.warning).toHaveBeenCalled()
    })

    it('should show cart warning without details', () => {
      const { cartWarning } = useToast()

      cartWarning('limitReached')

      expect(mockToast.warning).toHaveBeenCalled()
    })
  })

  describe('Return Value Structure', () => {
    it('should return all expected methods', () => {
      const toast = useToast()

      expect(toast).toHaveProperty('success')
      expect(toast).toHaveProperty('error')
      expect(toast).toHaveProperty('warning')
      expect(toast).toHaveProperty('info')
      expect(toast).toHaveProperty('addToast')
      expect(toast).toHaveProperty('removeToast')
      expect(toast).toHaveProperty('clearAll')
      expect(toast).toHaveProperty('cartSuccess')
      expect(toast).toHaveProperty('cartError')
      expect(toast).toHaveProperty('cartWarning')
    })

    it('should return functions', () => {
      const toast = useToast()

      expect(typeof toast.success).toBe('function')
      expect(typeof toast.error).toBe('function')
      expect(typeof toast.warning).toBe('function')
      expect(typeof toast.info).toBe('function')
    })
  })
})
