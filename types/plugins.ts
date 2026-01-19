/**
 * Shared Plugin Type Definitions
 */

export interface ToastPlugin {
  /** Show success toast notification */
  success: (message: string) => void
  /** Show error toast notification */
  error: (message: string) => void
  /** Show warning toast notification (optional) */
  warning?: (message: string) => void
  /** Show info toast notification (optional) */
  info?: (message: string) => void
}
