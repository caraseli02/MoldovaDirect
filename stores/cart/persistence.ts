/**
 * Cart Persistence Module
 *
 * Handles cart data storage and retrieval using Nuxt's useCookie for SSR compatibility
 * Provides error handling and automatic serialization for storage operations
 */

import { ref } from 'vue'
import type {
  CartPersistenceState,
  CartPersistenceActions,
  StorageType,
  StorageOptions,
  StorageResult,
  CartItem,
} from './types'

// =============================================
// STATE MANAGEMENT
// =============================================

const state = ref<CartPersistenceState>({
  storageType: 'cookie', // Changed from localStorage to cookie for SSR compatibility
  lastSaveAt: null,
  saveInProgress: false,
  autoSaveEnabled: true,
})

// =============================================
// STORAGE UTILITIES
// =============================================

/**
 * Check if storage type is available
 */
function isStorageAvailable(type: StorageType): boolean {
  if (typeof window === 'undefined') return false

  try {
    const storage = type === 'localStorage' ? window.localStorage : window.sessionStorage
    const testKey = '__storage_test__'
    storage.setItem(testKey, 'test')
    storage.removeItem(testKey)
    return true
  }
  catch {
    return false
  }
}

/**
 * Get storage instance
 */
function getStorage(type: StorageType): Storage | null {
  if (typeof window === 'undefined') return null

  switch (type) {
    case 'localStorage':
      return isStorageAvailable('localStorage') ? window.localStorage : null
    case 'sessionStorage':
      return isStorageAvailable('sessionStorage') ? window.sessionStorage : null
    default:
      return null
  }
}

/**
 * In-memory storage fallback
 */
const memoryStorage = new Map<string, string>()

/**
 * Compress data for storage (simple JSON stringification for now)
 */
function compressData(data: any): string {
  return JSON.stringify(data)
}

/**
 * Decompress data from storage
 */
function decompressData(data: string): unknown {
  try {
    return JSON.parse(data)
  }
  catch {
    return null
  }
}

/**
 * Get best available storage type
 */
function getBestStorageType(): StorageType {
  if (isStorageAvailable('localStorage')) return 'localStorage'
  if (isStorageAvailable('sessionStorage')) return 'sessionStorage'
  return 'memory'
}

// =============================================
// STORAGE OPERATIONS
// =============================================

/**
 * Save data to storage
 */
async function saveToStorage(
  key: string,
  data: any,
  options: Partial<StorageOptions> = {},
): Promise<StorageResult> {
  const storageType = options.type || state.value.storageType
  const compress = options.compress || false

  try {
    const serializedData = compress ? compressData(data) : JSON.stringify(data)

    // Try primary storage
    const storage = getStorage(storageType)
    if (storage) {
      storage.setItem(key, serializedData)
      return { success: true, data }
    }

    // Fallback to memory storage
    memoryStorage.set(key, serializedData)
    return {
      success: true,
      data,
      fallbackUsed: true,
    }
  }
  catch (error: any) {
    // Try fallback storage types
    const fallbackTypes: StorageType[] = ['sessionStorage', 'memory']

    for (const fallbackType of fallbackTypes) {
      if (fallbackType === storageType) continue

      try {
        const fallbackStorage = getStorage(fallbackType)
        if (fallbackStorage) {
          const serializedData = compress ? compressData(data) : JSON.stringify(data)
          fallbackStorage.setItem(key, serializedData)
          return {
            success: true,
            data,
            fallbackUsed: true,
          }
        }
        else if (fallbackType === 'memory') {
          const serializedData = compress ? compressData(data) : JSON.stringify(data)
          memoryStorage.set(key, serializedData)
          return {
            success: true,
            data,
            fallbackUsed: true,
          }
        }
      }
      catch {
        continue
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Storage operation failed',
    }
  }
}

/**
 * Load data from storage
 */
async function _loadFromStorage(
  key: string,
  options: Partial<StorageOptions> = {},
): Promise<StorageResult> {
  const storageType = options.type || state.value.storageType
  const compress = options.compress || false

  try {
    // Try primary storage
    const storage = getStorage(storageType)
    if (storage) {
      const serializedData = storage.getItem(key)
      if (serializedData) {
        const data = compress ? decompressData(serializedData) : JSON.parse(serializedData)
        return { success: true, data }
      }
    }

    // Try memory storage
    const memoryData = memoryStorage.get(key)
    if (memoryData) {
      const data = compress ? decompressData(memoryData) : JSON.parse(memoryData)
      return {
        success: true,
        data,
        fallbackUsed: true,
      }
    }

    return { success: true, data: null }
  }
  catch (error: any) {
    // Try fallback storage types
    const fallbackTypes: StorageType[] = ['localStorage', 'sessionStorage', 'memory']

    for (const fallbackType of fallbackTypes) {
      if (fallbackType === storageType) continue

      try {
        const fallbackStorage = getStorage(fallbackType)
        if (fallbackStorage) {
          const serializedData = fallbackStorage.getItem(key)
          if (serializedData) {
            const data = compress ? decompressData(serializedData) : JSON.parse(serializedData)
            return {
              success: true,
              data,
              fallbackUsed: true,
            }
          }
        }
        else if (fallbackType === 'memory') {
          const memoryData = memoryStorage.get(key)
          if (memoryData) {
            const data = compress ? decompressData(memoryData) : JSON.parse(memoryData)
            return {
              success: true,
              data,
              fallbackUsed: true,
            }
          }
        }
      }
      catch {
        continue
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Storage load failed',
    }
  }
}

/**
 * Remove data from storage
 */
async function _removeFromStorage(
  key: string,
  options: Partial<StorageOptions> = {},
): Promise<StorageResult> {
  const storageType = options.type || state.value.storageType

  try {
    // Remove from primary storage
    const storage = getStorage(storageType)
    if (storage) {
      storage.removeItem(key)
    }

    // Remove from memory storage
    memoryStorage.delete(key)

    // Remove from all fallback storages
    const allTypes: StorageType[] = ['localStorage', 'sessionStorage']
    for (const type of allTypes) {
      if (type !== storageType) {
        const fallbackStorage = getStorage(type)
        if (fallbackStorage) {
          fallbackStorage.removeItem(key)
        }
      }
    }

    return { success: true }
  }
  catch (error: any) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Storage removal failed',
    }
  }
}

// =============================================
// DEBOUNCED SAVE FUNCTIONALITY
// =============================================

let debouncedSaveTimeout: NodeJS.Timeout | null = null
let pendingSaveData: { key: string, data: any, options?: Partial<StorageOptions> } | null = null

/**
 * Create debounced save function
 */
function createDebouncedSave(delay: number = 1000) {
  return function debouncedSave(
    key: string,
    data: any,
    options: Partial<StorageOptions> = {},
  ): Promise<StorageResult> {
    return new Promise((resolve, reject) => {
      // Clear existing timeout
      if (debouncedSaveTimeout) {
        clearTimeout(debouncedSaveTimeout)
      }

      // Store pending data
      pendingSaveData = { key, data, options }

      // Set new timeout
      debouncedSaveTimeout = setTimeout(async () => {
        if (pendingSaveData) {
          try {
            const result = await saveToStorage(
              pendingSaveData.key,
              pendingSaveData.data,
              pendingSaveData.options,
            )
            state.value.lastSaveAt = new Date()
            resolve(result)
          }
          catch (error: any) {
            reject(error)
          }
          finally {
            pendingSaveData = null
            debouncedSaveTimeout = null
          }
        }
      }, delay)
    })
  }
}

// =============================================
// CART-SPECIFIC PERSISTENCE USING COOKIES
// =============================================

const CART_STORAGE_KEY = 'moldova_direct_cart'

/**
 * Save cart data to cookie storage (SSR compatible)
 */
async function saveCartData(cartData: {
  items: CartItem[]
  sessionId: string | null
  lastSyncAt: Date | null
}): Promise<StorageResult> {
  if (state.value.saveInProgress) {
    return { success: false, error: 'Save already in progress' }
  }

  state.value.saveInProgress = true

  try {
    const dataToSave = {
      ...cartData,
      timestamp: new Date().toISOString(),
      version: '1.0',
    }

    // Use Nuxt's useCookie for SSR-compatible storage
    interface CartCookieData {
      items: CartItem[]
      sessionId: string | null
      lastSyncAt: Date | null
      timestamp: string
      version: string
    }

    const cartCookie = useCookie<CartCookieData>(CART_STORAGE_KEY, {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      watch: true,
    })

    cartCookie.value = dataToSave as CartCookieData
    state.value.lastSaveAt = new Date()

    return { success: true }
  }
  catch (error: any) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save cart data',
    }
  }
  finally {
    state.value.saveInProgress = false
  }
}

/**
 * Load cart data from cookie storage
 */
async function loadCartData(): Promise<StorageResult<{
  items: CartItem[]
  sessionId: string | null
  lastSyncAt: Date | null
}>> {
  try {
    // Use Nuxt's useCookie for SSR-compatible storage
    interface CartCookieData {
      items: CartItem[]
      sessionId: string | null
      lastSyncAt: Date | null | string
      timestamp?: string
      version?: string
    }

    const cartCookie = useCookie<CartCookieData | null>(CART_STORAGE_KEY, {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })

    const loadedData = cartCookie.value

    if (!loadedData) {
      return { success: true, data: undefined }
    }

    // Convert date strings back to Date objects
    if (loadedData.lastSyncAt && typeof loadedData.lastSyncAt === 'string') {
      loadedData.lastSyncAt = new Date(loadedData.lastSyncAt)
    }

    // Validate cart items
    if (Array.isArray(loadedData.items)) {
      loadedData.items = loadedData.items.map(item => ({
        ...item,
        addedAt: new Date(item.addedAt),
        lastModified: item.lastModified ? new Date(item.lastModified) : undefined,
      }))
    }
    else {
      loadedData.items = []
    }

    return {
      success: true,
      data: loadedData as { items: CartItem[], sessionId: string | null, lastSyncAt: Date | null },
    }
  }
  catch (error: any) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load cart data',
    }
  }
}

/**
 * Clear cart data from cookie storage
 */
async function clearCartData(): Promise<StorageResult> {
  try {
    const cartCookie = useCookie(CART_STORAGE_KEY)
    cartCookie.value = null
    state.value.lastSaveAt = null

    return { success: true }
  }
  catch (error: any) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to clear cart data',
    }
  }
}

// =============================================
// ACTIONS INTERFACE
// =============================================

const actions: CartPersistenceActions = {
  async saveToStorage(): Promise<StorageResult> {
    // This will be implemented by the main cart store
    // which has access to the cart data
    throw new Error('saveToStorage must be implemented by the main cart store')
  },

  async loadFromStorage(): Promise<StorageResult> {
    return loadCartData()
  },

  async clearStorage(): Promise<StorageResult> {
    return clearCartData()
  },

  setStorageType(type: StorageType): void {
    state.value.storageType = type
  },

  createDebouncedSave(): void {
    // Debounced save is already created
    // This method exists for compatibility
  },
}

// =============================================
// COMPOSABLE INTERFACE
// =============================================

export function useCartPersistence() {
  return {
    // State
    state: readonly(state),

    // Actions
    ...actions,

    // Utilities
    saveCartData,
    loadCartData,
    clearCartData,
    isStorageAvailable,
    getBestStorageType,
    createDebouncedSave,
  }
}

// =============================================
// DIRECT EXPORTS FOR STORE USAGE
// =============================================

export {
  state as cartPersistenceState,
  actions as cartPersistenceActions,
  saveCartData,
  loadCartData,
  clearCartData,
  isStorageAvailable,
  getBestStorageType,
  createDebouncedSave,
}
