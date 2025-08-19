import { useToastStore } from '~/stores/toast'
import type { Toast } from '~/stores/toast'

export const useToast = () => {
  const toastStore = useToastStore()

  return {
    // Direct access to store methods
    addToast: (toast: Omit<Toast, 'id'>) => toastStore.addToast(toast),
    removeToast: (id: string) => toastStore.removeToast(id),
    clearAll: () => toastStore.clearAll(),

    // Convenience methods
    success: (title: string, message?: string, options?: Partial<Toast>) => 
      toastStore.success(title, message, options),
    
    error: (title: string, message?: string, options?: Partial<Toast>) => 
      toastStore.error(title, message, options),
    
    warning: (title: string, message?: string, options?: Partial<Toast>) => 
      toastStore.warning(title, message, options),
    
    info: (title: string, message?: string, options?: Partial<Toast>) => 
      toastStore.info(title, message, options),

    // Cart-specific toast methods with i18n support
    cartSuccess: (key: string, productName?: string) => {
      const { t } = useI18n()
      const title = t(`cart.success.${key}`)
      const message = productName ? t('cart.success.productAdded', { product: productName }) : undefined
      return toastStore.success(title, message)
    },

    cartError: (key: string, details?: string, recoveryAction?: () => void) => {
      const { t } = useI18n()
      const title = t(`cart.error.${key}`)
      const message = details || t('cart.error.tryAgain')
      const actionText = recoveryAction ? t('common.retry') : undefined
      
      return toastStore.error(title, message, {
        actionText,
        actionHandler: recoveryAction,
        duration: 10000 // Longer duration for errors with actions
      })
    },

    cartWarning: (key: string, details?: string) => {
      const { t } = useI18n()
      const title = t(`cart.warning.${key}`)
      const message = details || undefined
      return toastStore.warning(title, message)
    }
  }
}