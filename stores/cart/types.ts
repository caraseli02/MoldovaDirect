/**
 * Cart Type Definitions
 *
 * Comprehensive TypeScript interfaces for the modular cart system
 */

// =============================================
// CORE TYPES
// =============================================

export interface Product {
  id: string
  slug: string
  name: string
  price: number
  images: string[]
  stock: number
  category?: string
  weight?: number
  dimensions?: ProductDimensions
  attributes?: Record<string, any>
}

export interface ProductDimensions {
  length: number
  width: number
  height: number
  unit: 'cm' | 'in'
}

export interface CartItem {
  id: string
  product: Product
  quantity: number
  addedAt: Date
  lastModified?: Date
  source?: 'manual' | 'recommendation' | 'saved'
}

export interface CartSession {
  id: string
  userId?: string
  createdAt: Date
  lastActivity: Date
  expiresAt: Date
  metadata?: Record<string, any>
}

// =============================================
// VALIDATION TYPES
// =============================================

export interface ValidationCache {
  [productId: string]: {
    isValid: boolean
    product: Product
    timestamp: number
    ttl: number
  }
}

export interface ValidationQueue {
  [productId: string]: {
    priority: 'high' | 'medium' | 'low'
    timestamp: number
    retryCount: number
  }
}

export interface ValidationResult {
  isValid: boolean
  product: Product
  errors?: string[]
  warnings?: string[]
}

// =============================================
// ANALYTICS TYPES
// =============================================

export interface AnalyticsEvent {
  id: string
  type: 'add_to_cart' | 'remove_from_cart' | 'update_quantity' | 'view_cart' | 'abandon_cart'
  timestamp: Date
  sessionId: string
  userId?: string
  productId?: string
  quantity?: number
  value?: number
  metadata?: Record<string, any>
}

export interface AnalyticsSession {
  id: string
  startTime: Date
  lastActivity: Date
  events: AnalyticsEvent[]
  abandonmentTimer?: NodeJS.Timeout
  synced: boolean
}

// =============================================
// SECURITY TYPES
// =============================================

export interface SecurityValidation {
  isValid: boolean
  errors: string[]
  warnings?: string[]
  riskLevel: 'low' | 'medium' | 'high'
}

export interface SecurityContext {
  sessionId: string
  userId?: string
  ipAddress?: string
  userAgent?: string
  timestamp: Date
}

// =============================================
// PERSISTENCE TYPES
// =============================================

export type StorageType = 'localStorage' | 'sessionStorage' | 'memory'

export interface StorageOptions {
  type: StorageType
  key: string
  ttl?: number
  compress?: boolean
}

export interface StorageResult<T = unknown> {
  success: boolean
  data?: T
  error?: string
  fallbackUsed?: boolean
}

// =============================================
// ADVANCED FEATURES TYPES
// =============================================

export interface SavedForLaterItem {
  id: string
  product: Product
  quantity: number
  savedAt: Date
  originalCartItemId?: string
  reason?: string
}

export interface BulkOperation {
  type: 'select' | 'remove' | 'move_to_saved'
  itemIds: string[]
  timestamp: Date
}

export interface CartRecommendation {
  id: string
  product: Product
  reason: 'frequently_bought_together' | 'similar_products' | 'price_drop' | 'back_in_stock'
  confidence: number
  metadata?: Record<string, any>
}

// =============================================
// ERROR TYPES
// =============================================

export interface CartError {
  type: 'validation' | 'inventory' | 'network' | 'storage' | 'security'
  code: string
  message: string
  field?: string
  retryable: boolean
  timestamp: Date
  context?: Record<string, any>
}

// =============================================
// STATE INTERFACES
// =============================================

export interface CartCoreState {
  items: CartItem[]
  sessionId: string | null
  loading: boolean
  error: string | null
  lastSyncAt: Date | null
  // Cart locking state
  isLocked: boolean
  lockedAt: Date | null
  lockedUntil: Date | null
  lockedByCheckoutSessionId: string | null
}

export interface CartValidationState {
  validationCache: ValidationCache
  validationQueue: ValidationQueue
  backgroundValidationEnabled: boolean
  lastBackgroundValidation: Date | null
  validationInProgress: boolean
}

export interface CartAnalyticsState {
  sessionStartTime: Date | null
  lastActivity: Date | null
  events: AnalyticsEvent[]
  abandonmentTimer: NodeJS.Timeout | null
  syncInProgress: boolean
  offlineEvents: AnalyticsEvent[]
}

export interface CartSecurityState {
  securityEnabled: boolean
  lastSecurityCheck: Date | null
  securityErrors: string[]
  riskLevel: 'low' | 'medium' | 'high'
}

export interface CartPersistenceState {
  storageType: StorageType
  lastSaveAt: Date | null
  saveInProgress: boolean
  autoSaveEnabled: boolean
}

export interface CartAdvancedState {
  selectedItems: Set<string>
  bulkOperationInProgress: boolean
  savedForLater: SavedForLaterItem[]
  recommendations: CartRecommendation[]
  recommendationsLoading: boolean
}

// =============================================
// ACTION INTERFACES
// =============================================

export interface CartCoreActions {
  addItem(product: Product, quantity: number): Promise<void>
  removeItem(itemId: string): Promise<void>
  updateQuantity(itemId: string, quantity: number): Promise<void>
  clearCart(): Promise<void>
  generateItemId(): string
  generateSessionId(): string
  initializeCart(): void
  // Cart locking actions
  lockCart(checkoutSessionId: string, lockDurationMinutes?: number): Promise<void>
  unlockCart(checkoutSessionId?: string): Promise<void>
  checkLockStatus(): Promise<{ isLocked: boolean, lockedAt: Date | null, lockedUntil: Date | null, lockedBySession: string | null }>
  isCartLocked(): boolean
}

export interface CartValidationActions {
  validateProduct(productId: string): Promise<void>
  batchValidateProducts(productIds: string[]): Promise<void>
  getCachedValidation(productId: string): ValidationResult | null
  setCachedValidation(productId: string, result: ValidationResult, ttl?: number): void
  clearValidationCache(productId?: string): void
  startBackgroundValidation(): void
  stopBackgroundValidation(): void
}

export interface CartAnalyticsActions {
  trackAddToCart(product: Product, quantity: number, subtotal: number, itemCount: number): void
  trackRemoveFromCart(product: Product, quantity: number, subtotal: number, itemCount: number): void
  trackQuantityUpdate(product: Product, oldQuantity: number, newQuantity: number, subtotal: number, itemCount: number): void
  trackCartView(): void
  trackAbandonmentWarning(): void
  syncEventsWithServer(): Promise<void>
  initializeCartSession(sessionId: string): void
}

export interface CartSecurityActions {
  validateCartData(operation: string, data: unknown): SecurityValidation
  isValidSessionId(sessionId: string): boolean
  isValidProductId(productId: string): boolean
  generateSecureSessionId(): string
  secureAddItem(productId: string, quantity: number, sessionId: string): Promise<void>
  secureUpdateQuantity(itemId: string, quantity: number, sessionId: string): Promise<void>
  secureRemoveItem(itemId: string, sessionId: string): Promise<void>
}

export interface CartPersistenceActions {
  saveToStorage(): Promise<StorageResult>
  loadFromStorage(): Promise<StorageResult>
  clearStorage(): Promise<StorageResult>
  setStorageType(type: StorageType): void
  createDebouncedSave(): void
}

export interface CartAdvancedActions {
  selectItem(itemId: string): void
  deselectItem(itemId: string): void
  selectAllItems(): void
  deselectAllItems(): void
  bulkRemoveSelected(): Promise<void>
  saveItemForLater(itemId: string, reason?: string): Promise<void>
  restoreFromSaved(savedItemId: string): Promise<void>
  loadRecommendations(): Promise<void>
}

// =============================================
// COMPUTED INTERFACES
// =============================================

export interface CartCoreGetters {
  itemCount: number
  subtotal: number
  isEmpty: boolean
  getItemByProductId: (productId: string) => CartItem | undefined
  isInCart: (productId: string) => boolean
}

export interface CartAdvancedGetters {
  selectedItemsCount: number
  selectedItemsSubtotal: number
  allItemsSelected: boolean
  hasSelectedItems: boolean
  savedForLaterCount: number
  isItemSelected: (itemId: string) => boolean
  getSelectedItems: CartItem[]
  getSavedForLaterItem: (itemId: string) => SavedForLaterItem | undefined
  isProductSavedForLater: (productId: string) => boolean
}

// =============================================
// UTILITY TYPES
// =============================================

export type CartEventType = 'item_added' | 'item_removed' | 'item_updated' | 'cart_cleared' | 'validation_completed'

export interface CartEvent {
  type: CartEventType
  payload: unknown
  timestamp: Date
}

export type CartHook = (event: CartEvent) => void

// =============================================
// CONFIGURATION TYPES
// =============================================

export interface CartConfig {
  validation: {
    enabled: boolean
    backgroundValidation: boolean
    cacheTimeout: number
    maxRetries: number
  }
  analytics: {
    enabled: boolean
    abandonmentTimeout: number
    syncInterval: number
    offlineStorage: boolean
  }
  security: {
    enabled: boolean
    validateSessionId: boolean
    validateProductId: boolean
    maxSecurityErrors: number
  }
  persistence: {
    storageType: StorageType
    autoSave: boolean
    saveDebounceTime: number
    compression: boolean
  }
  advanced: {
    saveForLater: boolean
    bulkOperations: boolean
    recommendations: boolean
    maxRecommendations: number
  }
}

export const DEFAULT_CART_CONFIG: CartConfig = {
  validation: {
    enabled: true,
    backgroundValidation: true,
    cacheTimeout: 300000, // 5 minutes
    maxRetries: 3,
  },
  analytics: {
    enabled: true,
    abandonmentTimeout: 1800000, // 30 minutes
    syncInterval: 300000, // 5 minutes
    offlineStorage: true,
  },
  security: {
    enabled: true,
    validateSessionId: true,
    validateProductId: true,
    maxSecurityErrors: 5,
  },
  persistence: {
    storageType: 'localStorage',
    autoSave: true,
    saveDebounceTime: 1000,
    compression: false,
  },
  advanced: {
    saveForLater: true,
    bulkOperations: true,
    recommendations: true,
    maxRecommendations: 5,
  },
}

// =============================================
// LEGACY COMPATIBILITY TYPES
// =============================================

// These types ensure compatibility with existing code
export interface LegacyCartStore {
  // Core properties
  items: CartItem[]
  sessionId: string | null
  loading: boolean
  error: string | null
  itemCount: number
  subtotal: number
  isEmpty: boolean

  // Advanced features
  selectedItems: Set<string>
  selectedItemsCount: number
  selectedItemsSubtotal: number
  allItemsSelected: boolean
  hasSelectedItems: boolean
  bulkOperationInProgress: boolean
  savedForLater: SavedForLaterItem[]
  savedForLaterCount: number
  recommendations: CartRecommendation[]
  recommendationsLoading: boolean

  // Validation
  validationInProgress: boolean
  backgroundValidationEnabled: boolean

  // Storage
  storageType: StorageType
  lastSyncAt: Date | null

  // Methods
  addItem: (product: Product, quantity?: number) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  getItemByProductId: (productId: string) => CartItem | undefined
  isInCart: (productId: string) => boolean

  // Advanced methods
  isItemSelected: (itemId: string) => boolean
  getSelectedItems: () => CartItem[]
  toggleItemSelection: (itemId: string) => void
  toggleSelectAll: () => void
  removeSelectedItems: () => Promise<void>
  moveSelectedToSavedForLater: () => Promise<void>
  addToSavedForLater: (product: Product, quantity?: number) => Promise<void>
  removeFromSavedForLater: (itemId: string) => Promise<void>
  moveToCartFromSavedForLater: (itemId: string) => Promise<void>
  loadRecommendations: () => Promise<void>

  // Validation methods
  validateCart: () => Promise<boolean>
  validateCartWithRetry: (maxRetries?: number) => Promise<boolean>

  // Direct methods
  directAddItem: (product: Product, quantity?: number) => Promise<void>
  directUpdateQuantity: (itemId: string, quantity: number) => Promise<void>
  directRemoveItem: (itemId: string) => Promise<void>
  directClearCart: () => Promise<void>
  directValidateCart: () => Promise<boolean>

  // Utility methods
  recoverCart: () => Promise<boolean>
  forceSync: () => Promise<{ success: boolean, error?: string }>
  toggleBackgroundValidation: () => void
  clearValidationCache: (productId?: string) => void

  // Performance
  performanceMetrics: {
    lastOperationTime: number
    averageOperationTime: number
    operationCount: number
    syncCount: number
    errorCount: number
  }
  getPerformanceMetrics: () => {
    lastOperationTime: number
    averageOperationTime: number
    operationCount: number
    syncCount: number
    errorCount: number
  }
  resetPerformanceMetrics: () => void
}
