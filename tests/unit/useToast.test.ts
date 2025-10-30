import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useToast } from '@/composables/useToast'
import { toast } from 'vue-sonner'

// Mock vue-sonner
vi.mock('vue-sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    dismiss: vi.fn(),
  },
}))

// Mock useI18n
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, unknown>) => {
      // Simple mock i18n that returns the key with params
      if (params) {
        return `${key}:${JSON.stringify(params)}`
      }
      return key
    },
  }),
}))

describe('useToast composable', () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.clearAllMocks()
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleWarnSpy.mockRestore()
  })

  describe('convenience methods', () => {
    it('calls toast.success with correct parameters', () => {
      const { success } = useToast()
      success('Test Title', 'Test Message')

      expect(toast.success).toHaveBeenCalledWith('Test Title', {
        description: 'Test Message',
        duration: undefined,
        action: undefined,
      })
    })

    it('calls toast.error with correct parameters', () => {
      const { error } = useToast()
      error('Error Title', 'Error Message')

      expect(toast.error).toHaveBeenCalledWith('Error Title', {
        description: 'Error Message',
        duration: undefined,
        action: undefined,
      })
    })

    it('calls toast.warning with correct parameters', () => {
      const { warning } = useToast()
      warning('Warning Title', 'Warning Message')

      expect(toast.warning).toHaveBeenCalledWith('Warning Title', {
        description: 'Warning Message',
        duration: undefined,
        action: undefined,
      })
    })

    it('calls toast.info with correct parameters', () => {
      const { info } = useToast()
      info('Info Title', 'Info Message')

      expect(toast.info).toHaveBeenCalledWith('Info Title', {
        description: 'Info Message',
        duration: undefined,
        action: undefined,
      })
    })

    it('supports custom duration option', () => {
      const { success } = useToast()
      success('Test', 'Message', { duration: 5000 })

      expect(toast.success).toHaveBeenCalledWith('Test', expect.objectContaining({
        duration: 5000,
      }))
    })

    it('supports action option', () => {
      const { success } = useToast()
      const actionHandler = vi.fn()
      success('Test', 'Message', { actionText: 'Undo', actionHandler })

      expect(toast.success).toHaveBeenCalledWith('Test', expect.objectContaining({
        action: { label: 'Undo', onClick: actionHandler },
      }))
    })
  })

  describe('cart-specific helpers', () => {
    it('cartSuccess calls toast with i18n key', () => {
      const { cartSuccess } = useToast()
      cartSuccess('added')

      expect(toast.success).toHaveBeenCalledWith('cart.success.added', expect.any(Object))
    })

    it('cartSuccess includes product name when provided', () => {
      const { cartSuccess } = useToast()
      cartSuccess('added', 'Test Product')

      expect(toast.success).toHaveBeenCalledWith(
        'cart.success.added',
        expect.objectContaining({
          description: expect.stringContaining('cart.success.productAdded'),
        })
      )
    })

    it('cartError calls toast.error with i18n key', () => {
      const { cartError } = useToast()
      cartError('addFailed')

      expect(toast.error).toHaveBeenCalledWith(
        'cart.error.addFailed',
        expect.objectContaining({
          description: 'cart.error.tryAgain',
          duration: 10000,
        })
      )
    })

    it('cartError includes custom details when provided', () => {
      const { cartError } = useToast()
      cartError('addFailed', 'Custom error details')

      expect(toast.error).toHaveBeenCalledWith(
        'cart.error.addFailed',
        expect.objectContaining({
          description: 'Custom error details',
        })
      )
    })

    it('cartError includes recovery action when provided', () => {
      const { cartError } = useToast()
      const recoveryAction = vi.fn()
      cartError('addFailed', undefined, recoveryAction)

      expect(toast.error).toHaveBeenCalledWith(
        'cart.error.addFailed',
        expect.objectContaining({
          action: { label: 'common.retry', onClick: recoveryAction },
        })
      )
    })

    it('cartWarning calls toast.warning with i18n key', () => {
      const { cartWarning } = useToast()
      cartWarning('stockLimited')

      expect(toast.warning).toHaveBeenCalledWith('cart.warning.stockLimited', expect.any(Object))
    })

    it('cartWarning includes details when provided', () => {
      const { cartWarning } = useToast()
      cartWarning('stockLimited', 'Only 2 left')

      expect(toast.warning).toHaveBeenCalledWith(
        'cart.warning.stockLimited',
        expect.objectContaining({
          description: 'Only 2 left',
        })
      )
    })
  })

  describe('legacy API methods', () => {
    it('addToast logs deprecation warning', () => {
      const { addToast } = useToast()
      addToast()

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[Deprecated] useToast().addToast is deprecated. Use success/error/warning/info instead.'
      )
    })

    it('removeToast logs deprecation warning', () => {
      const { removeToast } = useToast()
      removeToast()

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[Deprecated] useToast().removeToast is deprecated. Toast dismissal is now automatic.'
      )
    })

    it('clearAll logs deprecation warning', () => {
      const { clearAll } = useToast()
      clearAll()

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[Deprecated] useToast().clearAll is deprecated. Use toast.dismiss() from vue-sonner instead.'
      )
    })
  })

  describe('edge cases', () => {
    it('handles missing message parameter', () => {
      const { success } = useToast()
      success('Title only')

      expect(toast.success).toHaveBeenCalledWith('Title only', expect.objectContaining({
        description: undefined,
      }))
    })

    it('handles empty options object', () => {
      const { success } = useToast()
      success('Title', 'Message', {})

      expect(toast.success).toHaveBeenCalledWith('Title', expect.objectContaining({
        duration: undefined,
        action: undefined,
      }))
    })

    it('does not create action when actionText is provided without actionHandler', () => {
      const { success } = useToast()
      success('Title', 'Message', { actionText: 'Undo' })

      expect(toast.success).toHaveBeenCalledWith('Title', expect.objectContaining({
        action: undefined,
      }))
    })

    it('does not create action when actionHandler is provided without actionText', () => {
      const { success } = useToast()
      const actionHandler = vi.fn()
      success('Title', 'Message', { actionHandler })

      expect(toast.success).toHaveBeenCalledWith('Title', expect.objectContaining({
        action: undefined,
      }))
    })
  })
})
