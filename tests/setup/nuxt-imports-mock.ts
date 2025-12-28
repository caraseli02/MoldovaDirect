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
