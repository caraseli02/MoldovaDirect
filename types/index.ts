// Main types export file for Moldova Direct
// This file re-exports all types for easy importing

// Database types
export type {
  // Core types
  Translations,
  
  // Category types
  Category,
  CategoryWithChildren,
  CategoryFilter,
  
  // Product types
  Product,
  ProductImage,
  ProductAttribute,
  ProductWithRelations,
  
  // Filtering and search
  ProductFilters,
  PriceRange,
  AttributeFilter,
  
  // API response types
  Pagination,
  ProductListResponse,
  ProductDetailResponse,
  CategoryListResponse,
  CategoryDetailResponse,
  SearchResponse,
  
  // Cart types
  Cart,
  CartItem,
  CartWithItems,
  
  // Order types
  Address,
  Order,
  OrderItem,
  OrderWithItems,
  
  // Inventory types
  InventoryLog,
  
  // User types
  Profile,
  
  // Utility types
  ApiError,
  ApiResponse,
  
  // Form types
  ProductSearchForm,
  ProductFilterForm,
  
  // Component prop types
  ProductCardProps,
  ProductGridProps,
  ProductFilterProps,
  CategoryNavigationProps,
  
  // Store state types
  ProductStoreState,
  CartStoreState
} from './database'

// API types
export type {
  // Request types
  GetProductsRequest,
  GetProductRequest,
  SearchProductsRequest,
  GetCategoriesRequest,
  GetCategoryRequest,
  GetFeaturedProductsRequest,
  GetRelatedProductsRequest,
  
  // Response types
  ProductsApiResponse,
  ProductApiResponse,
  CategoriesApiResponse,
  CategoryApiResponse,
  SearchApiResponse,
  FeaturedProductsApiResponse,
  
  // Query types
  ProductQueryOptions,
  CategoryQueryOptions,
  
  // Search types
  SearchQuery,
  SearchResult,
  FilterAggregation,
  
  // Cache types
  CacheKey,
  CacheEntry,
  CacheOptions,
  
  // Validation types
  ValidationError,
  ValidationResult,
  
  // Localization types
  LocalizedContent,
  LocalizationContext,
  LocalizedApiResponse,
  
  // Performance types
  PerformanceMetrics,
  ApiMetrics,
  
  // Error types
  ApiErrorDetails,
  
  // Webhook types
  WebhookEvent,
  WebhookPayload,
  
  // Admin types
  AdminProductRequest,
  AdminCategoryRequest,
  BulkOperationRequest,
  BulkOperationResponse,
  
  // Export types
  ExportRequest,
  ExportResponse
} from './api'

// Auth types (re-export existing)
export type {
  User,
  RefreshToken,
  AuthEvent,
  RegisterRequest,
  LoginRequest,
  VerifyEmailRequest,
  ResendVerificationRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  AuthResponse,
  ErrorResponse,
  SecurityConfig,
  RateLimitConfig
} from './auth'

// Recommendation types
export type {
  // Core types
  RecommendationContext,
  RecommendationAlgorithm,
  RecommendationReasonType,
  
  // Request/Response types
  RecommendationRequest,
  RecommendationResponse,
  ProductRecommendation,
  RecommendationReason,
  RecommendationMetadata,
  
  // Analytics types
  RecommendationInteractionType,
  RecommendationAnalyticsEvent,
  RecommendationAnalyticsBatch,
  
  // User preferences
  UserRecommendationPreferences,
  AnonymousRecommendationPreferences,
  
  // Recently viewed types
  RecentlyViewedProduct,
  RecentlyViewedStorage,
  
  // Error types
  RecommendationErrorCode,
  RecommendationError,
  
  // Component prop types
  ProductRecommendationsProps,
  RecommendationCardProps,
  RecentlyViewedProps,
  
  // Composable return types
  UseRecommendationsReturn,
  UseRecentlyViewedReturn,
  UseRecommendationAnalyticsReturn,
  
  // Algorithm types
  ContentBasedParams,
  CollaborativeFilteringParams,
  BehavioralParams,
  AlgorithmConfig,
  
  // Cache types
  RecommendationCacheKey,
  CachedRecommendation
} from './recommendations'

// Recommendation constants
export { RecommendationErrorCodes } from './recommendations'

// Email types
export type {
  // Core types
  EmailType,
  EmailStatus,
  EmailLog,
  EmailMetadata,
  
  // Input types
  CreateEmailLogInput,
  UpdateEmailLogInput,
  
  // Response types
  EmailLogWithOrder,
  EmailLogFilters,
  EmailLogListResponse,
  
  // Statistics types
  EmailDeliveryStats,
  
  // Configuration types
  EmailRetryConfig
} from './email'

// Email constants and utilities
export {
  DEFAULT_EMAIL_RETRY_CONFIG,
  calculateRetryDelay,
  shouldRetryEmail
} from './email'

// =============================================
// COMMONLY USED TYPE UNIONS (imported from guards to avoid circular imports)
// =============================================

// Import and re-export commonly used types from guards
export type { LanguageCode, ProductSortOption, StockStatus } from './guards'

// Order status
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

// Payment status
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

// Payment methods
export type PaymentMethod = 'stripe' | 'paypal' | 'cod'

// Address types
export type AddressType = 'billing' | 'shipping'

// Inventory reasons
export type InventoryReason = 'sale' | 'return' | 'manual_adjustment' | 'stock_receipt'

// Cache types
export type CacheType = 'products' | 'product' | 'categories' | 'category' | 'search'

// API methods
export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

// =============================================
// UTILITY TYPE HELPERS
// =============================================

// Make all properties of T optional except for K
export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>

// Make all properties of T required except for K
export type RequiredExcept<T, K extends keyof T> = Required<T> & Partial<Pick<T, K>>

// Extract localized string from translations object
export type LocalizedString<T extends Record<string, string>> = T[keyof T]

// Create a type with only the specified keys from T
export type PickByType<T, U> = {
  [K in keyof T as T[K] extends U ? K : never]: T[K]
}

// Create a type that omits keys with null or undefined values
export type NonNullable<T> = {
  [K in keyof T]: NonNullable<T[K]>
}

// =============================================
// BRANDED TYPES FOR TYPE SAFETY
// =============================================

// Brand type for IDs to prevent mixing different ID types
declare const __brand: unique symbol
type Brand<T, B> = T & { [__brand]: B }

export type ProductId = Brand<number, 'ProductId'>
export type CategoryId = Brand<number, 'CategoryId'>
export type UserId = Brand<string, 'UserId'>
export type OrderId = Brand<number, 'OrderId'>
export type CartId = Brand<number, 'CartId'>

// =============================================
// CONDITIONAL TYPES
// =============================================

// Type that includes relations based on a condition
export type WithRelations<T, Include extends boolean> = Include extends true
  ? T extends Product
    ? ProductWithRelations
    : T extends Category
    ? CategoryWithChildren
    : T
  : T

// Type for API responses that may include error states
export type ApiResult<T> = 
  | { success: true; data: T; error?: never }
  | { success: false; data?: never; error: ApiError }

// =============================================
// TEMPLATE LITERAL TYPES
// =============================================

// API endpoint paths
export type ApiEndpoint = 
  | '/api/products'
  | '/api/products/[slug]'
  | '/api/categories'
  | '/api/categories/[slug]'
  | '/api/search'
  | '/api/products/featured'
  | '/api/products/related/[id]'

// Image size variants
export type ImageSize = 'thumbnail' | 'small' | 'medium' | 'large' | 'original'

// Theme variants
export type ThemeVariant = 'light' | 'dark' | 'auto'

// =============================================
// MAPPED TYPES
// =============================================

// Create a type where all string properties become optional
export type OptionalStrings<T> = {
  [K in keyof T]: T[K] extends string ? T[K] | undefined : T[K]
}

// Create a type where all properties become readonly
export type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K]
}

// Create a type for form field states
export type FormFieldState<T> = {
  [K in keyof T]: {
    value: T[K]
    error?: string
    touched: boolean
    dirty: boolean
  }
}

// =============================================
// TYPE GUARDS AND UTILITIES
// =============================================

// Re-export type guards and utility functions
export {
  // Type guards
  isTranslations,
  isProduct,
  isProductWithRelations,
  isCategory,
  isCategoryWithChildren,
  isLanguageCode,
  isProductSortOption,
  isStockStatus,
  isProductFilters,
  
  // Validation functions
  validateProduct,
  validateCategory,
  validateProductFilters,
  
  // Transformation functions
  transformProduct,
  getLocalizedText,
  formatPrice,
  calculateStockStatus,
  generateSlug,
  sanitizeSearchQuery,
  buildCategoryBreadcrumbs,
  
  // Utility functions
  deepClone,
  debounce,
  throttle
} from './guards'