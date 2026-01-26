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
export const useToast = () => {
  return {
    toast,
    success: (title: string, options?: any) => toast.success(title, options),
    error: (title: string, options?: any) => toast.error(title, options),
    info: (title: string, options?: any) => toast.info(title, options),
    warning: (title: string, options?: any) => toast.warning(title, options),
  }
}
