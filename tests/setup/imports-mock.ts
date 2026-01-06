import { vi } from 'vitest'
import {
  ref,
  computed,
  reactive,
  readonly,
  shallowRef,
  toRef,
  toRefs,
  watch,
  watchEffect,
  onMounted,
  onUnmounted,
  onBeforeMount,
  onBeforeUnmount,
  nextTick,
  defineComponent,
  h,
  markRaw,
  toRaw,
  isRef,
  unref,
  triggerRef,
  customRef,
  shallowReactive,
  shallowReadonly,
  isReactive,
  isReadonly,
  isProxy,
  provide,
  inject,
  useTemplateRef,
} from 'vue'

/**
 * Complete mock for #imports that covers all commonly used Nuxt composables.
 * Use this in tests that need #imports mocking:
 *
 * ```ts
 * vi.mock('#imports', () => importsMock)
 * ```
 */
export const importsMock = {
  // i18n
  useI18n: vi.fn(() => ({
    t: (key: string, params?: Record<string, unknown>) => {
      if (params) {
        let result = key
        Object.entries(params).forEach(([param, value]) => {
          result = result.replace(`{${param}}`, String(value))
        })
        return result
      }
      return key
    },
    locale: { value: 'en' },
    locales: { value: ['en', 'es', 'ro', 'ru'] },
    setLocale: vi.fn(),
  })),

  useLocalePath: vi.fn(() => (path: string | { name: string, params?: Record<string, unknown> }) => {
    if (typeof path === 'string') return path
    if (path?.name === 'products-slug') return `/products/${path.params?.slug || ''}`
    return '/'
  }),

  useSwitchLocalePath: vi.fn(() => (_locale: string) => '/'),

  // Router
  useRoute: vi.fn(() => ({
    path: '/',
    params: {},
    query: {},
    fullPath: '/',
    name: 'index',
    meta: {},
  })),

  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    go: vi.fn(),
    currentRoute: { value: { path: '/', query: {} } },
  })),

  navigateTo: vi.fn(),

  // Nuxt app
  useNuxtApp: vi.fn(() => ({
    $i18n: {
      t: vi.fn((key: string) => key),
      locale: { value: 'en' },
    },
  })),

  // Runtime config
  useRuntimeConfig: vi.fn(() => ({
    public: {
      siteUrl: 'http://localhost:3000',
      supabaseUrl: 'http://localhost:54321',
    },
  })),

  // Theme
  useTheme: vi.fn(() => ({
    theme: ref('light'),
    toggleTheme: vi.fn(),
    isDark: computed(() => false),
  })),

  // Cookie
  useCookie: vi.fn((_name: string) => ref(null)),

  // Head
  useHead: vi.fn(),
  useSeoMeta: vi.fn(),

  // Async data
  useAsyncData: vi.fn(() => ({
    data: ref(null),
    pending: ref(false),
    error: ref(null),
    refresh: vi.fn(),
  })),

  useFetch: vi.fn(() => ({
    data: ref(null),
    pending: ref(false),
    error: ref(null),
    refresh: vi.fn(),
  })),

  useLazyFetch: vi.fn(() => ({
    data: ref(null),
    pending: ref(false),
    error: ref(null),
    refresh: vi.fn(),
  })),

  // Supabase
  useSupabaseClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
    })),
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
    },
  })),

  useSupabaseUser: vi.fn(() => ref(null)),

  // Vue utilities that are auto-imported in Nuxt
  ref,
  computed,
  reactive,
  readonly,
  shallowRef,
  toRef,
  toRefs,
  watch,
  watchEffect,
  onMounted,
  onUnmounted,
  onBeforeMount,
  onBeforeUnmount,
  nextTick,
  defineComponent,
  h,
  markRaw,
  toRaw,
  isRef,
  unref,
  triggerRef,
  customRef,
  shallowReactive,
  shallowReadonly,
  isReactive,
  isReadonly,
  isProxy,
  provide,
  inject,
  useTemplateRef,
}

/**
 * Create a customized imports mock with overrides
 */
export function createImportsMock(overrides: Partial<typeof importsMock> = {}) {
  return { ...importsMock, ...overrides }
}
