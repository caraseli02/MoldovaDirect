import { toast } from 'vue-sonner'

/**
 * Toast notification composable wrapping vue-sonner
 *
 * Provides a consistent interface for showing notifications:
 * - success: For successful operations
 * - error: For errors and failures
 * - info: For informational messages
 * - warning: For warnings
 *
 * @example
 * const toast = useToast()
 * toast.success('Item added', { description: 'Added to cart' })
 */
const buildOpts = (descriptionOrOptions?: string | any, options?: any) => {
  const opts: any = { description: undefined }

  // Case 1: First argument is description string
  if (typeof descriptionOrOptions === 'string') {
    opts.description = descriptionOrOptions
    // Merge options if provided as third argument
    if (options && typeof options === 'object') {
      Object.assign(opts, options)
    }
  }
  // Case 2: First argument is options object
  else if (descriptionOrOptions && typeof descriptionOrOptions === 'object') {
    Object.assign(opts, descriptionOrOptions)
  }

  // Handle action transformation
  if (opts.actionText || opts.actionHandler) {
    opts.action = {
      label: opts.actionText,
      onClick: opts.actionHandler,
    }
    delete opts.actionText
    delete opts.actionHandler
  }
  else {
    opts.action = undefined
  }

  return opts
}

export const useToast = () => {
  return {
    toast,
    success: (title: string, descriptionOrOptions?: string | any, options?: any) => {
      toast.success(title, buildOpts(descriptionOrOptions, options))
    },
    error: (title: string, descriptionOrOptions?: string | any, options?: any) => {
      toast.error(title, buildOpts(descriptionOrOptions, options))
    },
    info: (title: string, descriptionOrOptions?: string | any, options?: any) => {
      toast.info(title, buildOpts(descriptionOrOptions, options))
    },
    warning: (title: string, descriptionOrOptions?: string | any, options?: any) => {
      toast.warning(title, buildOpts(descriptionOrOptions, options))
    },
    // Deprecated methods
    addToast: () => console.warn('addToast is deprecated'),
    removeToast: () => console.warn('removeToast is deprecated'),
    clearAll: () => console.warn('clearAll is deprecated'),
    // Cart helpers
    cartSuccess: (title: string, description?: string) => {
      toast.success(title, { description })
    },
    cartError: (title: string, description?: string) => {
      toast.error(title, { description, duration: 10000 })
    },
    cartWarning: (title: string, description?: string) => {
      toast.warning(title, { description })
    },
  }
}
