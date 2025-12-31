import { vi } from 'vitest'
import {
  ref,
  computed,
  watch,
  reactive,
  toRef,
  toRefs,
  unref,
  isRef,
  shallowRef,
  triggerRef,
  customRef,
  readonly,
  shallowReactive,
  shallowReadonly,
  toRaw,
  markRaw,
  effectScope,
  getCurrentScope,
  onScopeDispose,
  watchEffect,
  watchPostEffect,
  watchSyncEffect,
  onMounted,
  onUnmounted,
  onBeforeMount,
  onBeforeUnmount,
  onUpdated,
  onBeforeUpdate,
  nextTick,
  defineComponent,
  defineAsyncComponent,
  h,
  inject,
  provide,
} from 'vue'

// Re-export Vue reactivity and lifecycle APIs
export {
  ref,
  computed,
  watch,
  reactive,
  toRef,
  toRefs,
  unref,
  isRef,
  shallowRef,
  triggerRef,
  customRef,
  readonly,
  shallowReactive,
  shallowReadonly,
  toRaw,
  markRaw,
  effectScope,
  getCurrentScope,
  onScopeDispose,
  watchEffect,
  watchPostEffect,
  watchSyncEffect,
  onMounted,
  onUnmounted,
  onBeforeMount,
  onBeforeUnmount,
  onUpdated,
  onBeforeUpdate,
  nextTick,
  defineComponent,
  defineAsyncComponent,
  h,
  inject,
  provide,
}

// Mock Nuxt auto-imports for testing
export const useHead = global.useHead || vi.fn()
export const useRoute = global.useRoute || vi.fn()
export const useRouter = global.useRouter || vi.fn(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  currentRoute: { value: { query: {} } },
}))
export const navigateTo = global.navigateTo || vi.fn()
export const useI18n = global.useI18n || vi.fn()
export const useLocalePath = global.useLocalePath || vi.fn(() => (path: any) => {
  if (typeof path === 'string') return path
  return path?.path || '/'
})
export const useSupabaseClient = global.useSupabaseClient || vi.fn()
export const useSupabaseUser = global.useSupabaseUser || vi.fn()
export const createError = global.createError || vi.fn()

// Error utility functions (auto-imported from utils/errorUtils.ts)
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  if (error && typeof error === 'object') {
    if ('data' in error) {
      const data = (error as { data?: { message?: string } }).data
      if (data?.message) return data.message
    }
    if ('message' in error) {
      const msg = (error as { message?: unknown }).message
      if (typeof msg === 'string') return msg
    }
    if ('statusMessage' in error) {
      const msg = (error as { statusMessage?: unknown }).statusMessage
      if (typeof msg === 'string') return msg
    }
  }
  return 'An unknown error occurred'
}

export function getErrorCode(error: unknown): string | undefined {
  if (error && typeof error === 'object') {
    if ('code' in error) {
      const code = (error as { code?: unknown }).code
      if (typeof code === 'string') return code
    }
    if ('statusCode' in error) {
      const code = (error as { statusCode?: unknown }).statusCode
      if (typeof code === 'number') return String(code)
    }
  }
  return undefined
}

export function getErrorStatusCode(error: unknown): number | undefined {
  if (error && typeof error === 'object') {
    if ('statusCode' in error) {
      const code = (error as { statusCode?: unknown }).statusCode
      if (typeof code === 'number') return code
    }
    if ('status' in error) {
      const code = (error as { status?: unknown }).status
      if (typeof code === 'number') return code
    }
  }
  return undefined
}

export function isErrorWithMessage(error: unknown): error is { message: string } {
  return (
    typeof error === 'object'
    && error !== null
    && 'message' in error
    && typeof (error as { message: unknown }).message === 'string'
  )
}

export function isError(error: unknown): error is Error {
  return error instanceof Error
}
