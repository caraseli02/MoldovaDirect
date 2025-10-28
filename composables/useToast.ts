import { toast } from 'vue-sonner'
import type { ToasterProps } from 'vue-sonner'

type ToastKind = 'success' | 'error' | 'warning' | 'info'

export interface LegacyToastOptions {
  duration?: number
  actionText?: string
  actionHandler?: () => void
}

const show = (
  kind: ToastKind,
  title: string,
  message?: string,
  options?: LegacyToastOptions,
) => {
  const common = {
    description: message,
    duration: options?.duration,
    action: options?.actionText && options?.actionHandler
      ? { label: options.actionText, onClick: options.actionHandler }
      : undefined,
  } as ToasterProps & { description?: string; action?: { label: string; onClick: () => void } }

  switch (kind) {
    case 'success':
      return toast.success(title, common)
    case 'error':
      return toast.error(title, common)
    case 'warning':
      return toast.warning(title, common)
    case 'info':
    default:
      return toast.info(title, common)
  }
}

export const useToast = () => {
  return {
    // Legacy API shims (no-ops, kept for compatibility)
    addToast: () => {},
    removeToast: () => {},
    clearAll: () => {},

    // Convenience methods routed to vue-sonner
    success: (title: string, message?: string, options?: LegacyToastOptions) =>
      show('success', title, message, options),
    error: (title: string, message?: string, options?: LegacyToastOptions) =>
      show('error', title, message, options),
    warning: (title: string, message?: string, options?: LegacyToastOptions) =>
      show('warning', title, message, options),
    info: (title: string, message?: string, options?: LegacyToastOptions) =>
      show('info', title, message, options),

    // Cart-specific helpers with i18n
    cartSuccess: (key: string, productName?: string) => {
      const { t } = useI18n()
      const title = t(`cart.success.${key}`)
      const message = productName
        ? t('cart.success.productAdded', { product: productName })
        : undefined
      return show('success', title, message)
    },
    cartError: (key: string, details?: string, recoveryAction?: () => void) => {
      const { t } = useI18n()
      const title = t(`cart.error.${key}`)
      const message = details || t('cart.error.tryAgain')
      const actionText = recoveryAction ? t('common.retry') : undefined
      return show('error', title, message, {
        actionText,
        actionHandler: recoveryAction,
        duration: 10000,
      })
    },
    cartWarning: (key: string, details?: string) => {
      const { t } = useI18n()
      const title = t(`cart.warning.${key}`)
      const message = details || undefined
      return show('warning', title, message)
    },
  }
}
