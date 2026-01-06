import { vi } from 'vitest'
import { config, flushPromises } from '@vue/test-utils'
import {
  computed,
  reactive,
  readonly,
  ref,
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

// Re-export flushPromises for convenience in tests
export { flushPromises }

// Mock import.meta.client to true for client-side code paths
Object.defineProperty(import.meta, 'client', { value: true, writable: true })

// Mock Chart.js to prevent "Chart.register is not a function" errors
vi.mock('chart.js', () => ({
  Chart: class MockChart {
    static readonly register = vi.fn()
    data: unknown
    options: unknown
    constructor(ctx: unknown, config: { data?: unknown, options?: unknown } = {}) {
      this.data = config.data
      this.options = config.options
    }

    destroy = vi.fn()
    update = vi.fn()
  },
  registerables: [],
  CategoryScale: {},
  LinearScale: {},
  PointElement: {},
  LineElement: {},
  BarElement: {},
  ArcElement: {},
  Title: {},
  Tooltip: {},
  Legend: {},
  Filler: {},
}))

// Mock chartjs-adapter-date-fns
vi.mock('chartjs-adapter-date-fns', () => ({}))

// Mock #imports module for Nuxt auto-imports
// Note: vi.mock is hoisted, so we define the mock inline rather than importing it
vi.mock('#imports', async () => {
  const vue = await import('vue')
  return {
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
      locale: vue.ref('en'),
      locales: vue.ref([
        { code: 'en', name: 'English' },
        { code: 'es', name: 'Español' },
        { code: 'ro', name: 'Română' },
        { code: 'ru', name: 'Русский' },
      ]),
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
    useRuntimeConfig: vi.fn(() => ({
      public: {
        siteUrl: 'http://localhost:3000',
        supabaseUrl: 'http://localhost:54321',
      },
    })),

    // Head
    useHead: vi.fn(),
    useSeoMeta: vi.fn(),

    // Async data
    useAsyncData: vi.fn(() => ({
      data: vue.ref(null),
      pending: vue.ref(false),
      error: vue.ref(null),
      refresh: vi.fn(),
    })),
    useFetch: vi.fn(() => ({
      data: vue.ref(null),
      pending: vue.ref(false),
      error: vue.ref(null),
      refresh: vi.fn(),
    })),
    useLazyFetch: vi.fn(() => ({
      data: vue.ref(null),
      pending: vue.ref(false),
      error: vue.ref(null),
      refresh: vi.fn(),
    })),

    // Cookie
    useCookie: vi.fn((_name: string) => vue.ref(null)),

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
    useSupabaseUser: vi.fn(() => vue.ref(null)),

    // Custom composables
    useAuthValidation: vi.fn(() => ({
      calculatePasswordStrength: (password: string) => {
        if (!password) return 0
        let strength = 0
        if (password.length >= 8) strength++
        if (password.length >= 12) strength++
        if (/[a-z]/.test(password)) strength++
        if (/[A-Z]/.test(password)) strength++
        if (/[0-9]/.test(password)) strength++
        if (/[^a-zA-Z0-9]/.test(password)) strength++
        if (password.length >= 16) strength++
        return Math.min(strength, 4)
      },
      getPasswordStrengthLabel: (strength: number) => {
        const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong']
        return labels[strength] ?? 'Very Weak'
      },
      getPasswordStrengthColor: (strength: number) => {
        const colors = ['red', 'orange', 'yellow', 'blue', 'green']
        return colors[strength] ?? 'red'
      },
      validateEmail: vi.fn(() => ({ isValid: true, errors: [], fieldErrors: {} })),
      validatePassword: vi.fn(() => ({ isValid: true, errors: [], fieldErrors: {} })),
      validateRegistration: vi.fn(() => ({ isValid: true, errors: [], fieldErrors: {} })),
      validateLogin: vi.fn(() => ({ isValid: true, errors: [], fieldErrors: {} })),
      validatePasswordMatch: vi.fn((p1: string, p2: string) => p1 === p2),
    })),
    useToast: vi.fn(() => ({
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      warning: vi.fn(),
      dismiss: vi.fn(),
      toast: vi.fn(),
    })),
    useCardValidation: vi.fn(() => {
      return {
        creditCardData: ref({
          number: '',
          expiryMonth: '',
          expiryYear: '',
          cvv: '',
          holderName: '',
        }),
        cardBrand: ref(''),
        validationErrors: ref({}),
        expiryDisplay: computed(() => ''),
        cvvMaxLength: computed(() => 3),
        formatCardNumber: vi.fn(),
        formatExpiry: vi.fn(),
        formatCVV: vi.fn(),
        validateCardNumber: vi.fn(),
        validateExpiry: vi.fn(),
        validateCVV: vi.fn(),
        validateHolderName: vi.fn(),
        getCardBrandIcon: vi.fn((brand: string) => `card-${brand}`),
        initializeFromData: vi.fn(),
      }
    }),
    useCart: vi.fn(() => ({
      items: vue.ref([]),
      itemCount: vue.ref(0),
      totalItems: vue.computed(() => 0),
      totalPrice: vue.computed(() => 0),
      addItem: vi.fn(),
      removeItem: vi.fn(),
      updateQuantity: vi.fn(),
      clearCart: vi.fn(),
      isItemSelected: vi.fn(() => false),
      toggleItemSelection: vi.fn(),
      selectedItems: vue.computed(() => []),
    })),
    useTheme: vi.fn(() => ({
      theme: vue.ref('light'),
      toggleTheme: vi.fn(),
      isDark: vue.computed(() => false),
    })),
    useKeyboardShortcuts: vi.fn(() => ({
      getShortcutDisplay: vi.fn((_key: string, _options?: unknown) => 'Ctrl+K'),
      registerShortcut: vi.fn(),
      unregisterShortcut: vi.fn(),
    })),
    useDevice: vi.fn(() => ({
      isMobile: vue.ref(false),
      isTablet: vue.ref(false),
      isDesktop: vue.ref(true),
      windowWidth: vue.ref(1024),
      windowHeight: vue.ref(768),
      deviceType: vue.ref('desktop'),
    })),

    // Vue utilities
    ref: vue.ref,
    computed: vue.computed,
    reactive: vue.reactive,
    readonly: vue.readonly,
    shallowRef: vue.shallowRef,
    toRef: vue.toRef,
    toRefs: vue.toRefs,
    watch: vue.watch,
    watchEffect: vue.watchEffect,
    onMounted: vue.onMounted,
    onUnmounted: vue.onUnmounted,
    onBeforeMount: vue.onBeforeMount,
    onBeforeUnmount: vue.onBeforeUnmount,
    nextTick: vue.nextTick,
    defineComponent: vue.defineComponent,
    h: vue.h,
    markRaw: vue.markRaw,
    toRaw: vue.toRaw,
    isRef: vue.isRef,
    unref: vue.unref,
    triggerRef: vue.triggerRef,
    customRef: vue.customRef,
    shallowReactive: vue.shallowReactive,
    shallowReadonly: vue.shallowReadonly,
    isReactive: vue.isReactive,
    isReadonly: vue.isReadonly,
    isProxy: vue.isProxy,
    provide: vue.provide,
    inject: vue.inject,
    useTemplateRef: vue.useTemplateRef,
  }
})

// Mock h3 module
interface H3ErrorInput {
  statusCode?: number
  statusMessage?: string
  message?: string
}

interface H3Error extends Error {
  statusCode?: number
  statusMessage?: string
}

vi.mock('h3', () => ({
  getQuery: vi.fn(() => ({})),
  getCookie: vi.fn(),
  getHeader: vi.fn(),
  getRequestIP: vi.fn(() => '127.0.0.1'),
  createError: vi.fn((error: H3ErrorInput): H3Error => {
    const err = new Error(error.statusMessage || error.message) as H3Error
    err.statusCode = error.statusCode
    err.statusMessage = error.statusMessage
    return err
  }),
}))

// Make Vue reactivity functions available globally (for Nuxt auto-import compatibility)
global.ref = ref
global.reactive = reactive
global.computed = computed
global.readonly = readonly
global.shallowRef = shallowRef
global.toRef = toRef
global.toRefs = toRefs
global.watch = watch
global.watchEffect = watchEffect
global.onMounted = onMounted
global.onUnmounted = onUnmounted
global.onBeforeMount = onBeforeMount
global.onBeforeUnmount = onBeforeUnmount
global.nextTick = nextTick
global.defineComponent = defineComponent
global.h = h
global.markRaw = markRaw
global.toRaw = toRaw
global.isRef = isRef
global.unref = unref
global.triggerRef = triggerRef
global.customRef = customRef
global.shallowReactive = shallowReactive
global.shallowReadonly = shallowReadonly
global.isReactive = isReactive
global.isReadonly = isReadonly
global.isProxy = isProxy
global.provide = provide
global.inject = inject
global.useTemplateRef = useTemplateRef

// Mock Nuxt composables
global.useI18n = vi.fn(() => ({
  t: vi.fn((key: string, params?: unknown) => {
    // Simple mock that returns the key for testing
    if (params) {
      let result = key
      Object.entries(params as Record<string, unknown>).forEach(([param, value]) => {
        result = result.replace(`{${param}}`, String(value))
      })
      return result
    }
    return key
  }),
  locale: ref('en'),
  locales: ref([
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'ro', name: 'Română' },
    { code: 'ru', name: 'Русский' },
  ]),
  setLocale: vi.fn(),
}))

global.useRoute = vi.fn(() => ({
  query: {},
}))

global.useRouter = vi.fn(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  currentRoute: { value: { query: {} } },
}))

global.useLocalePath = vi.fn(() => (path: string | { name?: string, path?: string, params?: Record<string, string> }) => {
  if (typeof path === 'string') return path
  if (path?.name === 'products-slug') return `/products/${path.params?.slug || ''}`
  return path?.path || '/'
})

global.navigateTo = vi.fn()

// Mock other Nuxt utilities as needed
global.defineNuxtRouteMiddleware = vi.fn(middleware => middleware)
global.useSupabaseClient = vi.fn()
global.useSupabaseUser = vi.fn()
global.createError = vi.fn((error: H3ErrorInput) => {
  const err = new Error(error.statusMessage) as H3Error
  err.statusCode = error.statusCode
  throw err
})

// Mock Nuxt app
global.useNuxtApp = vi.fn(() => ({
  $i18n: {
    t: vi.fn((key: string) => key),
    locale: { value: 'en' },
  },
}))

// Mock useCart composable (custom composable for cart functionality)
global.useCart = vi.fn(() => ({
  items: ref([]),
  itemCount: ref(0),
  totalItems: computed(() => 0),
  totalPrice: computed(() => 0),
  addItem: vi.fn(),
  removeItem: vi.fn(),
  updateQuantity: vi.fn(),
  clearCart: vi.fn(),
  isItemSelected: vi.fn(() => false),
  toggleItemSelection: vi.fn(),
  selectedItems: computed(() => []),
}))

// Mock useTheme composable
global.useTheme = vi.fn(() => ({
  theme: ref('light'),
  toggleTheme: vi.fn(),
  isDark: computed(() => false),
}))

// Mock useKeyboardShortcuts composable
global.useKeyboardShortcuts = vi.fn(() => ({
  getShortcutDisplay: vi.fn((_key: string, _options?: unknown) => 'Ctrl+K'),
  registerShortcut: vi.fn(),
  unregisterShortcut: vi.fn(),
}))

// Mock useDevice composable
global.useDevice = vi.fn(() => ({
  isMobile: ref(false),
  isTablet: ref(false),
  isDesktop: ref(true),
  windowWidth: ref(1024),
  windowHeight: ref(768),
  deviceType: ref('desktop'),
}))

// Mock useSwitchLocalePath
global.useSwitchLocalePath = vi.fn(() => (_locale: string) => '/')

// Mock useAuthValidation composable
global.useAuthValidation = vi.fn(() => ({
  calculatePasswordStrength: (password: string) => {
    if (!password) return 0
    let strength = 0
    if (password.length >= 8) strength++
    if (password.length >= 12) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^a-zA-Z0-9]/.test(password)) strength++
    if (password.length >= 16) strength++
    return Math.min(strength, 4)
  },
  getPasswordStrengthLabel: (strength: number) => {
    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong']
    return labels[strength] ?? 'Very Weak'
  },
  getPasswordStrengthColor: (strength: number) => {
    const colors = ['red', 'orange', 'yellow', 'blue', 'green']
    return colors[strength] ?? 'red'
  },
  validateEmail: vi.fn(() => ({ isValid: true, errors: [], fieldErrors: {} })),
  validatePassword: vi.fn(() => ({ isValid: true, errors: [], fieldErrors: {} })),
  validateRegistration: vi.fn(() => ({ isValid: true, errors: [], fieldErrors: {} })),
  validateLogin: vi.fn(() => ({ isValid: true, errors: [], fieldErrors: {} })),
  validateForgotPassword: vi.fn(() => ({ isValid: true, errors: [], fieldErrors: {} })),
  validateResetPassword: vi.fn(() => ({ isValid: true, errors: [], fieldErrors: {} })),
  validateEmailVerification: vi.fn(() => ({ isValid: true, errors: [], fieldErrors: {} })),
  validatePasswordMatch: vi.fn((p1: string, p2: string) => p1 === p2),
  validateTermsAcceptance: vi.fn((accepted: boolean) => ({
    isValid: accepted,
    errors: accepted ? [] : [{ field: 'acceptTerms', message: 'Required', code: 'required' }],
    fieldErrors: accepted ? {} : { acceptTerms: 'Required' },
  })),
  validateMFACode: vi.fn(() => ({ isValid: true, errors: [], fieldErrors: {} })),
  validateMFAFriendlyName: vi.fn(() => ({ isValid: true, errors: [], fieldErrors: {} })),
}))

// Mock useToast composable
global.useToast = vi.fn(() => ({
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
  dismiss: vi.fn(),
  toast: vi.fn(),
}))

// Mock useCardValidation composable
global.useCardValidation = vi.fn(() => ({
  creditCardData: ref({
    number: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    holderName: '',
  }),
  cardBrand: ref(''),
  validationErrors: ref({}),
  expiryDisplay: computed(() => ''),
  cvvMaxLength: computed(() => 3),
  formatCardNumber: vi.fn(),
  formatExpiry: vi.fn(),
  formatCVV: vi.fn(),
  validateCardNumber: vi.fn(),
  validateExpiry: vi.fn(),
  validateCVV: vi.fn(),
  validateHolderName: vi.fn(),
  getCardBrandIcon: vi.fn((brand: string) => `card-${brand}`),
  initializeFromData: vi.fn(),
}))

// Mock useHead and useSeoMeta
global.useHead = vi.fn()
global.useSeoMeta = vi.fn()

// Mock useAsyncData and useFetch
global.useAsyncData = vi.fn(() => ({
  data: ref(null),
  pending: ref(false),
  error: ref(null),
  refresh: vi.fn(),
}))

global.useFetch = vi.fn(() => ({
  data: ref(null),
  pending: ref(false),
  error: ref(null),
  refresh: vi.fn(),
}))

// Mock useRuntimeConfig
global.useRuntimeConfig = vi.fn(() => ({
  public: {
    siteUrl: 'http://localhost:3000',
    supabaseUrl: 'http://localhost:54321',
  },
}))

// Mock admin stores
global.useAdminUsersStore = vi.fn(() => ({
  users: [],
  currentUser: null,
  loading: false,
  userDetailLoading: false,
  error: null,
  totalUsers: 0,
  fetchUsers: vi.fn(),
  fetchUserDetail: vi.fn(),
  updateUser: vi.fn(),
  deleteUser: vi.fn(),
}))

global.useAdminOrdersStore = vi.fn(() => ({
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,
  totalOrders: 0,
  fetchOrders: vi.fn(),
  fetchOrderDetail: vi.fn(),
  updateOrderStatus: vi.fn(),
}))

global.useAdminProductsStore = vi.fn(() => ({
  products: [],
  currentProduct: null,
  loading: false,
  error: null,
  totalProducts: 0,
  fetchProducts: vi.fn(),
  fetchProductDetail: vi.fn(),
  createProduct: vi.fn(),
  updateProduct: vi.fn(),
  deleteProduct: vi.fn(),
}))

// Mock storeToRefs
global.storeToRefs = vi.fn((store: Record<string, unknown>) => {
  const refs: Record<string, unknown> = {}
  for (const key in store) {
    if (typeof store[key] !== 'function') {
      refs[key] = ref(store[key])
    }
  }
  return refs
})

// Error utility functions (auto-imported from utils/errorUtils.ts)
global.getErrorMessage = (error: unknown): string => {
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

global.getErrorCode = (error: unknown): string | undefined => {
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

global.getErrorStatusCode = (error: unknown): number | undefined => {
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

global.isErrorWithMessage = (error: unknown): boolean => {
  return (
    typeof error === 'object'
    && error !== null
    && 'message' in error
    && typeof (error as { message: unknown }).message === 'string'
  )
}

global.isError = (error: unknown): boolean => {
  return error instanceof Error
}

// Server-side error utility functions (auto-imported from server/utils/errorUtils.ts)
global.getServerErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  if (error && typeof error === 'object') {
    if ('statusMessage' in error) {
      const msg = (error as { statusMessage?: unknown }).statusMessage
      if (typeof msg === 'string') return msg
    }
    if ('message' in error) {
      const msg = (error as { message?: unknown }).message
      if (typeof msg === 'string') return msg
    }
    if ('data' in error) {
      const data = (error as { data?: { message?: string } }).data
      if (data?.message) return data.message
    }
  }
  return 'An unknown error occurred'
}

global.getServerErrorStatusCode = (error: unknown): number => {
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
  return 500
}

global.isServerError = (error: unknown): boolean => {
  return error instanceof Error
}

global.logServerError = (context: string, error: unknown): void => {
  const message = global.getServerErrorMessage(error)
  console.error(`[${context}] Error:`, message)
}

global.isH3Error = (error: unknown): boolean => {
  return (
    typeof error === 'object'
    && error !== null
    && 'statusCode' in error
    && typeof (error as { statusCode?: unknown }).statusCode === 'number'
  )
}

global.isDatabaseError = (error: unknown): boolean => {
  return (
    typeof error === 'object'
    && error !== null
    && 'code' in error
    && typeof (error as { code?: unknown }).code === 'string'
  )
}

global.getDatabaseErrorCode = (error: unknown): string | undefined => {
  if (global.isDatabaseError(error)) {
    return (error as { code: string }).code
  }
  return undefined
}

global.getDatabaseErrorDetail = (error: unknown): string | undefined => {
  if (global.isDatabaseError(error)) {
    return (error as { detail?: string }).detail
  }
  return undefined
}

// Mock useCookie for testing with shared storage
// This ensures all calls to useCookie with the same name get the same ref
// Export this so tests can access and manipulate cookie data
export const cookieStorage = new Map<string, unknown>()

// Track cookie saves for testing
let _cookieSaveCount = 0

export const getCookieSaveCount = () => _cookieSaveCount
export const resetCookieSaveCount = () => {
  _cookieSaveCount = 0
}

global.useCookie = vi.fn((name: string, _options?: unknown) => {
  return {
    get value() {
      return cookieStorage.get(name)
    },
    set value(val: unknown) {
      _cookieSaveCount++
      if (val === null || val === undefined) {
        cookieStorage.delete(name)
      }
      else {
        cookieStorage.set(name, val)
      }
    },
  }
})

// Global i18n mock for @vue/test-utils
// This ensures $t is available in all mounted components
config.global.mocks = {
  $t: (key: string, params?: Record<string, unknown>) => {
    if (params) {
      let result = key
      Object.entries(params).forEach(([param, value]) => {
        result = result.replace(`{${param}}`, String(value))
      })
      return result
    }
    return key
  },
  $i18n: { locale: 'en' },
}

// Global stubs for common Nuxt components
config.global.stubs = {
  NuxtLink: { template: '<a :href="to"><slot /></a>', props: ['to'] },
  NuxtImg: { template: '<img :src="src" :alt="alt" />', props: ['src', 'alt', 'width', 'height', 'densities', 'loading', 'sizes', 'preset', 'fetchpriority'] },
  commonIcon: { template: '<span :class="name" data-testid="icon"></span>', props: ['name', 'size'] },
  ClientOnly: { template: '<slot />' },
  // UI components
  UiInput: { template: '<input :type="type || \'text\'" :value="modelValue" :placeholder="placeholder" :disabled="disabled" @input="$emit(\'update:modelValue\', $event.target.value)" @blur="$emit(\'blur\')" />', props: ['modelValue', 'type', 'placeholder', 'disabled', 'id', 'name', 'required', 'autocomplete'] },
  UiLabel: { template: '<label :for="htmlFor"><slot /></label>', props: ['htmlFor'] },
  UiButton: { template: '<button :type="type || \'button\'" :disabled="disabled" :class="[variant, size]" @click="$emit(\'click\')"><slot /></button>', props: ['type', 'disabled', 'variant', 'size', 'loading'] },
  UiCheckbox: { template: '<input type="checkbox" :checked="modelValue" :disabled="disabled" @change="$emit(\'update:modelValue\', $event.target.checked)" />', props: ['modelValue', 'disabled', 'id'] },
  UiBadge: { template: '<span :class="variant"><slot /></span>', props: ['variant'] },
  UiCard: { template: '<div class="card"><slot /></div>' },
  UiCardHeader: { template: '<div class="card-header"><slot /></div>' },
  UiCardTitle: { template: '<h3 class="card-title"><slot /></h3>' },
  UiCardDescription: { template: '<p class="card-description"><slot /></p>' },
  UiCardContent: { template: '<div class="card-content"><slot /></div>' },
  UiCardFooter: { template: '<div class="card-footer"><slot /></div>' },
  UiSheet: { template: '<div class="sheet" v-if="modelValue"><slot /></div>', props: ['modelValue'] },
  UiSheetContent: { template: '<div class="sheet-content"><slot /></div>', props: ['side'] },
  UiSheetHeader: { template: '<div class="sheet-header"><slot /></div>' },
  UiSheetTitle: { template: '<h2 class="sheet-title"><slot /></h2>' },
  UiSheetDescription: { template: '<p class="sheet-description"><slot /></p>' },
  UiSheetFooter: { template: '<div class="sheet-footer"><slot /></div>' },
  UiSheetClose: { template: '<button class="sheet-close" @click="$emit(\'close\')"><slot /></button>' },
  UiSelect: { template: '<select :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><slot /></select>', props: ['modelValue', 'disabled'] },
  UiSelectTrigger: { template: '<button class="select-trigger"><slot /></button>' },
  UiSelectValue: { template: '<span class="select-value"><slot /></span>', props: ['placeholder'] },
  UiSelectContent: { template: '<div class="select-content"><slot /></div>' },
  UiSelectItem: { template: '<option :value="value"><slot /></option>', props: ['value'] },
  UiTextarea: { template: '<textarea :value="modelValue" :placeholder="placeholder" :disabled="disabled" @input="$emit(\'update:modelValue\', $event.target.value)"></textarea>', props: ['modelValue', 'placeholder', 'disabled', 'rows'] },
  UiSkeleton: { template: '<div class="skeleton animate-pulse"></div>', props: ['class'] },
  UiTooltip: { template: '<div class="tooltip"><slot /></div>' },
  UiTooltipTrigger: { template: '<span class="tooltip-trigger"><slot /></span>' },
  UiTooltipContent: { template: '<div class="tooltip-content"><slot /></div>' },
  UiDialog: { template: '<div class="dialog" v-if="open"><slot /></div>', props: ['open'] },
  UiDialogContent: { template: '<div class="dialog-content"><slot /></div>' },
  UiDialogHeader: { template: '<div class="dialog-header"><slot /></div>' },
  UiDialogTitle: { template: '<h2 class="dialog-title"><slot /></h2>' },
  UiDialogDescription: { template: '<p class="dialog-description"><slot /></p>' },
  UiDialogFooter: { template: '<div class="dialog-footer"><slot /></div>' },
  UiDialogClose: { template: '<button class="dialog-close"><slot /></button>' },
  UiTabs: { template: '<div class="tabs"><slot /></div>', props: ['modelValue', 'defaultValue'] },
  UiTabsList: { template: '<div class="tabs-list"><slot /></div>' },
  UiTabsTrigger: { template: '<button class="tabs-trigger" :data-value="value"><slot /></button>', props: ['value'] },
  UiTabsContent: { template: '<div class="tabs-content" :data-value="value"><slot /></div>', props: ['value'] },
  UiAccordion: { template: '<div class="accordion"><slot /></div>' },
  UiAccordionItem: { template: '<div class="accordion-item"><slot /></div>', props: ['value'] },
  UiAccordionTrigger: { template: '<button class="accordion-trigger"><slot /></button>' },
  UiAccordionContent: { template: '<div class="accordion-content"><slot /></div>' },
  UiDropdownMenu: { template: '<div class="dropdown"><slot /></div>' },
  UiDropdownMenuTrigger: { template: '<button class="dropdown-trigger"><slot /></button>' },
  UiDropdownMenuContent: { template: '<div class="dropdown-content"><slot /></div>' },
  UiDropdownMenuItem: { template: '<div class="dropdown-item" @click="$emit(\'click\')"><slot /></div>' },
  UiDropdownMenuSeparator: { template: '<hr class="dropdown-separator" />' },
  UiRadioGroup: { template: '<div class="radio-group" role="radiogroup"><slot /></div>', props: ['modelValue'] },
  UiRadioGroupItem: { template: '<input type="radio" :value="value" :checked="$parent.modelValue === value" />', props: ['value', 'id'] },
  UiSwitch: { template: '<button type="button" role="switch" :aria-checked="modelValue" @click="$emit(\'update:modelValue\', !modelValue)"></button>', props: ['modelValue', 'disabled'] },
  UiScrollArea: { template: '<div class="scroll-area"><slot /></div>' },
  UiSeparator: { template: '<hr class="separator" />' },
  UiAvatar: { template: '<div class="avatar"><slot /></div>' },
  UiAvatarImage: { template: '<img :src="src" :alt="alt" />', props: ['src', 'alt'] },
  UiAvatarFallback: { template: '<span class="avatar-fallback"><slot /></span>' },
  UiProgress: { template: '<div class="progress" role="progressbar" :aria-valuenow="value"><div :style="{width: value + \'%\'}"></div></div>', props: ['value'] },
  UiPopover: { template: '<div class="popover"><slot /></div>' },
  UiPopoverTrigger: { template: '<button class="popover-trigger"><slot /></button>' },
  UiPopoverContent: { template: '<div class="popover-content"><slot /></div>' },
  Transition: { template: '<div><slot /></div>' },
  TransitionGroup: { template: '<div><slot /></div>' },
}

// Global directives
config.global.directives = {
  motion: {},
}

// Mock auth store for admin components
global.useAuthStore = vi.fn(() => ({
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  login: vi.fn(),
  logout: vi.fn(),
  checkAuth: vi.fn(),
}))

// Mock useInventory composable
global.useInventory = vi.fn(() => ({
  stockLevel: ref(50),
  stockStatus: computed(() => ({ label: 'In Stock', color: 'green', icon: 'M5 13l4 4L19 7' })),
  isLowStock: computed(() => false),
  isOutOfStock: computed(() => false),
  getStockLevelColor: vi.fn(() => 'text-green-600'),
  getStockLevelBgColor: vi.fn(() => 'bg-green-100'),
  getStockLevelPercentage: vi.fn((quantity: number, max: number) => Math.min(100, (quantity / max) * 100)),
  needsReorder: vi.fn((quantity: number, reorderPoint: number) => quantity <= reorderPoint),
  getStockStatus: vi.fn((quantity: number, lowThreshold: number = 10) => {
    if (quantity <= 0) return { label: 'Out of Stock', color: 'red', icon: 'M6 18L18 6M6 6l12 12' }
    if (quantity <= lowThreshold) return { label: 'Low Stock', color: 'yellow', icon: 'M12 9v2m0 4h.01' }
    return { label: 'In Stock', color: 'green', icon: 'M5 13l4 4L19 7' }
  }),
  getStockStatusClasses: vi.fn((status: { color: string }) => {
    const colorMap: Record<string, string> = {
      green: 'bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium',
      yellow: 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium',
      red: 'bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium',
      orange: 'bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium',
    }
    return colorMap[status?.color] || colorMap.green
  }),
  getStockIndicatorClasses: vi.fn((status: { color: string }) => {
    const colorMap: Record<string, string> = {
      green: 'w-2 h-2 rounded-full bg-green-500 mr-1.5',
      yellow: 'w-2 h-2 rounded-full bg-yellow-500 mr-1.5',
      red: 'w-2 h-2 rounded-full bg-red-500 mr-1.5',
      orange: 'w-2 h-2 rounded-full bg-orange-500 mr-1.5',
    }
    return colorMap[status?.color] || colorMap.green
  }),
  formatStockQuantity: vi.fn((quantity: number) => quantity.toLocaleString()),
  getLowStockThreshold: vi.fn(() => 10),
  getReorderPoint: vi.fn(() => 20),
}))

// Mock useDashboardRefresh composable
global.useDashboardRefresh = vi.fn(() => ({
  refreshing: ref(false),
  autoRefreshEnabled: ref(true),
  refresh: vi.fn(),
  startAutoRefresh: vi.fn(),
  stopAutoRefresh: vi.fn(),
}))

// Mock useAdminDashboardStore
global.useAdminDashboardStore = vi.fn(() => ({
  stats: {
    totalProducts: 150,
    activeProducts: 140,
    lowStockProducts: 5,
    totalUsers: 1200,
    activeUsers: 850,
    newUsersToday: 12,
    totalOrders: 320,
    conversionRate: 2.5,
    revenue: 45000,
    revenueToday: 1200,
  },
  isLoading: false,
  timeSinceRefresh: '5 min ago',
  fetchStats: vi.fn(),
}))

// Mock checkout-related composables
global.useCheckout = vi.fn(() => ({
  step: ref(1),
  isLoading: ref(false),
  error: ref(null),
  shippingAddress: ref(null),
  billingAddress: ref(null),
  paymentMethod: ref(null),
  orderSummary: computed(() => ({
    subtotal: 100,
    shipping: 10,
    tax: 8,
    total: 118,
    items: [],
  })),
  nextStep: vi.fn(),
  previousStep: vi.fn(),
  submitOrder: vi.fn(),
}))

global.useGuestCheckout = vi.fn(() => ({
  guestEmail: ref(''),
  isGuest: ref(true),
  validateEmail: vi.fn(() => true),
}))

global.useOrderConfirmation = vi.fn(() => ({
  order: ref(null),
  isLoading: ref(false),
  error: ref(null),
}))

// Mock useProductAnalytics composable
global.useProductAnalytics = vi.fn(() => ({
  trackProductView: vi.fn(),
  trackAddToCart: vi.fn(),
  trackPurchase: vi.fn(),
}))

// Mock useSearchFilters composable
global.useSearchFilters = vi.fn(() => ({
  filters: ref({}),
  activeFilters: computed(() => []),
  applyFilter: vi.fn(),
  removeFilter: vi.fn(),
  clearFilters: vi.fn(),
}))

// Mock useMediaQuery composable
global.useMediaQuery = vi.fn(() => ({
  isMobile: computed(() => false),
  isTablet: computed(() => false),
  isDesktop: computed(() => true),
}))

// Mock useDropzone composable (for file uploads)
global.useDropzone = vi.fn(() => ({
  isDragging: ref(false),
  files: ref([]),
  handleDrop: vi.fn(),
  handleFileSelect: vi.fn(),
  removeFile: vi.fn(),
}))
