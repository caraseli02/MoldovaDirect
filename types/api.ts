// API-specific TypeScript types for Moldova Direct
// These types define the structure for API requests and responses

import type {
  ProductWithRelations,
  CategoryWithChildren,
  ProductFilters,
  Pagination,
  CategoryFilter,
  PriceRange,
  AttributeFilter,
} from './database'

// =============================================
// API REQUEST TYPES
// =============================================

// Product API requests
export interface GetProductsRequest {
  category?: string | number
  search?: string
  sort?: 'name' | 'price_asc' | 'price_desc' | 'newest' | 'featured'
  page?: number
  limit?: number
  featured?: boolean
  inStock?: boolean
  priceMin?: number
  priceMax?: number
  attributes?: string // JSON string of attribute filters
  locale?: string
}

export interface GetProductRequest {
  slug: string
  locale?: string
}

export interface SearchProductsRequest {
  q: string
  category?: string | number
  sort?: string
  page?: number
  limit?: number
  locale?: string
}

export interface GetCategoriesRequest {
  parent?: number
  locale?: string
  includeProductCount?: boolean
}

export interface GetCategoryRequest {
  slug: string
  locale?: string
  page?: number
  limit?: number
  sort?: string
}

export interface GetFeaturedProductsRequest {
  limit?: number
  category?: string | number
  locale?: string
}

export interface GetRelatedProductsRequest {
  productId: number
  limit?: number
  locale?: string
}

// =============================================
// API RESPONSE TYPES
// =============================================

// Standard API response wrapper
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: unknown
  }
  meta?: {
    timestamp: string
    requestId?: string
  }
}

// Product API responses
export interface ProductsApiResponse {
  products: ProductWithRelations[]
  pagination: Pagination
  filters: {
    categories: CategoryFilter[]
    priceRange: PriceRange
    attributes: AttributeFilter[]
  }
  meta: {
    total: number
    query?: string
    appliedFilters: ProductFilters
  }
}

export interface ProductApiResponse {
  product: ProductWithRelations
  relatedProducts: ProductWithRelations[]
  breadcrumbs: Array<{
    name: string
    slug: string
    url: string
  }>
}

export interface CategoriesApiResponse {
  categories: CategoryWithChildren[]
  meta: {
    total: number
    maxDepth: number
  }
}

export interface CategoryApiResponse {
  category: CategoryWithChildren
  products: ProductWithRelations[]
  pagination: Pagination
  breadcrumbs: Array<{
    name: string
    slug: string
    url: string
  }>
}

export interface SearchApiResponse {
  products: ProductWithRelations[]
  suggestions: string[]
  pagination: Pagination
  meta: {
    query: string
    totalResults: number
    searchTime: number
    correctedQuery?: string
  }
}

export interface FeaturedProductsApiResponse {
  products: ProductWithRelations[]
  meta: {
    category?: string
    total: number
  }
}

// =============================================
// DATABASE QUERY TYPES
// =============================================

// Supabase query builder types
export interface ProductQueryOptions {
  select?: string
  filters?: {
    categoryId?: number
    isActive?: boolean
    featured?: boolean
    inStock?: boolean
    priceRange?: { min: number, max: number }
    search?: string
  }
  sort?: {
    column: string
    ascending: boolean
  }
  pagination?: {
    page: number
    limit: number
  }
  locale?: string
}

export interface CategoryQueryOptions {
  select?: string
  filters?: {
    parentId?: number | null
    isActive?: boolean
  }
  sort?: {
    column: string
    ascending: boolean
  }
  includeChildren?: boolean
  includeProductCount?: boolean
  locale?: string
}

// =============================================
// SEARCH AND FILTERING TYPES
// =============================================

export interface SearchQuery {
  term: string
  filters: ProductFilters
  locale: string
  fuzzy?: boolean
  boost?: {
    name: number
    description: number
    category: number
    sku: number
  }
}

export interface SearchResult {
  product: ProductWithRelations
  score: number
  highlights: {
    field: string
    matches: string[]
  }[]
}

export interface FilterAggregation {
  categories: Array<{
    id: number
    name: string
    count: number
    children?: FilterAggregation['categories']
  }>
  priceRange: {
    min: number
    max: number
    buckets: Array<{
      min: number
      max: number
      count: number
    }>
  }
  attributes: Array<{
    name: string
    values: Array<{
      value: string
      count: number
    }>
  }>
  stock: {
    inStock: number
    outOfStock: number
    lowStock: number
  }
}

// =============================================
// CACHE TYPES
// =============================================

export interface CacheKey {
  type: 'products' | 'product' | 'categories' | 'category' | 'search'
  params: Record<string, unknown>
  locale: string
}

export interface CacheEntry<T = unknown> {
  key: string
  data: T
  timestamp: number
  ttl: number
  tags: string[]
}

export interface CacheOptions {
  ttl?: number // Time to live in seconds
  tags?: string[] // Cache tags for invalidation
  revalidate?: boolean // Whether to revalidate in background
}

// =============================================
// VALIDATION TYPES
// =============================================

export interface ValidationError {
  field: string
  code: string
  message: string
  value?: unknown
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  data?: unknown
}

// =============================================
// LOCALIZATION TYPES
// =============================================

export interface LocalizedContent<T = string> {
  es: T
  en: T
  ro?: T
  ru?: T
}

export interface LocalizationContext {
  locale: string
  fallbackLocale: string
  availableLocales: string[]
}

export interface LocalizedApiResponse<T> {
  data: T
  locale: string
  fallbackUsed: boolean
  availableLocales: string[]
}

// =============================================
// PERFORMANCE MONITORING TYPES
// =============================================

export interface PerformanceMetrics {
  requestId: string
  endpoint: string
  method: string
  duration: number
  cacheHit: boolean
  dbQueries: number
  dbDuration: number
  timestamp: string
}

export interface ApiMetrics {
  totalRequests: number
  averageResponseTime: number
  cacheHitRate: number
  errorRate: number
  slowQueries: Array<{
    query: string
    duration: number
    timestamp: string
  }>
}

// =============================================
// ERROR HANDLING TYPES
// =============================================

export interface ApiErrorDetails {
  code: string
  message: string
  field?: string
  value?: unknown
  suggestion?: string
}

export interface ApiError extends Error {
  statusCode: number
  code: string
  details?: ApiErrorDetails[]
  requestId?: string
}

// =============================================
// WEBHOOK TYPES
// =============================================

export interface WebhookEvent {
  id: string
  type: 'product.created' | 'product.updated' | 'product.deleted' | 'category.created' | 'category.updated' | 'category.deleted'
  data: unknown
  timestamp: string
  source: string
}

export interface WebhookPayload {
  event: WebhookEvent
  signature: string
  timestamp: number
}

// Stripe Webhook Types
export type StripeWebhookEventType
  = | 'payment_intent.succeeded'
    | 'payment_intent.payment_failed'
    | 'payment_intent.canceled'
    | 'payment_intent.created'
    | 'charge.succeeded'
    | 'charge.refunded'
    | 'customer.created'
    | 'customer.updated'
    | 'customer.deleted'

export interface StripeWebhookResponse {
  received: boolean
  eventId: string
  eventType: StripeWebhookEventType
}

export interface StripeWebhookError {
  statusCode: number
  statusMessage: string
  details?: string
}

// =============================================
// ADMIN API TYPES
// =============================================

export interface AdminProductRequest {
  sku?: string
  categoryId: number
  nameTranslations: LocalizedContent
  descriptionTranslations?: LocalizedContent
  shortDescriptionTranslations?: LocalizedContent
  priceEur: number
  compareAtPriceEur?: number
  weightKg?: number
  stockQuantity: number
  lowStockThreshold?: number
  images?: Array<{
    url: string
    altText?: LocalizedContent
    sortOrder: number
    isPrimary: boolean
  }>
  attributes?: Record<string, unknown>
  isActive?: boolean
}

export interface AdminCategoryRequest {
  slug?: string
  parentId?: number
  nameTranslations: LocalizedContent
  descriptionTranslations?: LocalizedContent
  imageUrl?: string
  sortOrder?: number
  isActive?: boolean
}

export interface BulkOperationRequest {
  operation: 'update' | 'delete' | 'activate' | 'deactivate'
  ids: number[]
  data?: unknown
}

export interface BulkOperationResponse {
  success: number
  failed: number
  errors: Array<{
    id: number
    error: string
  }>
}

// =============================================
// EXPORT TYPES
// =============================================

export interface ExportRequest {
  format: 'csv' | 'xlsx' | 'json'
  filters?: ProductFilters
  fields?: string[]
  locale?: string
}

export interface ExportResponse {
  url: string
  filename: string
  size: number
  recordCount: number
  expiresAt: string
}
