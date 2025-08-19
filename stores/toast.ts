import { defineStore } from 'pinia'

export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  actionText?: string
  actionHandler?: () => void
}

interface ToastState {
  toasts: Toast[]
}

export const useToastStore = defineStore('toast', {
  state: (): ToastState => ({
    toasts: []
  }),

  actions: {
    // Add a new toast
    addToast(toast: Omit<Toast, 'id'>) {
      const id = this.generateId()
      const newToast: Toast = {
        id,
        duration: 5000, // Default 5 seconds
        ...toast
      }
      
      this.toasts.push(newToast)
      return id
    },

    // Remove a toast by ID
    removeToast(id: string) {
      const index = this.toasts.findIndex(toast => toast.id === id)
      if (index > -1) {
        this.toasts.splice(index, 1)
      }
    },

    // Clear all toasts
    clearAll() {
      this.toasts = []
    },

    // Convenience methods for different toast types
    success(title: string, message?: string, options?: Partial<Toast>) {
      return this.addToast({
        type: 'success',
        title,
        message,
        ...options
      })
    },

    error(title: string, message?: string, options?: Partial<Toast>) {
      return this.addToast({
        type: 'error',
        title,
        message,
        duration: 8000, // Longer duration for errors
        ...options
      })
    },

    warning(title: string, message?: string, options?: Partial<Toast>) {
      return this.addToast({
        type: 'warning',
        title,
        message,
        duration: 6000,
        ...options
      })
    },

    info(title: string, message?: string, options?: Partial<Toast>) {
      return this.addToast({
        type: 'info',
        title,
        message,
        ...options
      })
    },

    // Generate unique ID for toasts
    generateId(): string {
      return 'toast_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    }
  }
})