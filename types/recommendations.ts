// Product Recommendations TypeScript interfaces
// These types define the recommendation system structure and data flow

import type { Ref } from 'vue'
import type { ProductWithRelations, CartItem } from './database'

// =============================================
// CORE RECOMMENDATION TYPES
// =============================================

/**
 * Context in which recommendations are being requested
 */
export type RecommendationContext
  = | 'product_detail'
    | 'cart_view'
    | 'homepage'
    | 'category_browse'
    | 'search_results'
    | 'checkout'

/**
 * Available recommendation algorithms
 */
export type RecommendationAlgorithm
  = | 'content_based'
    | 'collaborative_filtering'
    | 'behavioral'
    | 'popularity'
    | 'hybrid'

/**
 * Types of recommendation reasons/explanations
 */
export type RecommendationReasonType
  = | 'similar_category'
    | 'frequently_bought_together'
    | 'based_on_history'
    | 'trending'
    | 'complementary'
    | 'recently_viewed'
    | 'popular_choice'

// =============================================
// REQUEST AND RESPONSE INTERFACES
// =============================================

/**
 * Request structure for fetching recommendations
 */
export interface RecommendationRequest {
  /** User ID for personalized recommendations (optional for anonymous users) */
  userId?: string
  /** Product ID for product-specific recommendations */
  productId?: number
  /** Category ID for category-based recommendations */
  categoryId?: number
  /** Current cart items for cart-based recommendations */
  cartItems?: CartItem[]
  /** Context where recommendations are being displayed */
  context: RecommendationContext
  /** Maximum number of recommendations to return */
  limit?: number
  /** Product IDs to exclude from recommendations */
  excludeProductIds?: number[]
  /** Preferred algorithms to use (optional) */
  algorithms?: RecommendationAlgorithm[]
  /** User's preferred language for explanations */
  language?: string
}

/**
 * Response structure containing recommendations and metadata
 */
export interface RecommendationResponse {
  /** Array of product recommendations */
  recommendations: ProductRecommendation[]
  /** Additional metadata about the recommendation generation */
  metadata: RecommendationMetadata
  /** Unique identifier for this recommendation request */
  requestId: string
}

/**
 * Individual product recommendation with scoring and reasoning
 */
export interface ProductRecommendation {
  /** The recommended product with full relations */
  product: ProductWithRelations
  /** Recommendation score (0-1, higher is better) */
  score: number
  /** Explanation for why this product was recommended */
  reason: RecommendationReason
  /** Algorithm that generated this recommendation */
  algorithm: RecommendationAlgorithm
  /** Position in the recommendation list (1-based) */
  position: number
  /** Additional metadata specific to this recommendation */
  metadata?: Record<string, unknown>
}

/**
 * Explanation for why a product was recommended
 */
export interface RecommendationReason {
  /** Type of recommendation reason */
  type: RecommendationReasonType
  /** Human-readable explanation text */
  explanation: string
  /** Confidence level in this recommendation (0-1) */
  confidence: number
  /** Additional context data for the reason */
  context?: Record<string, unknown>
}

/**
 * Metadata about the recommendation generation process
 */
export interface RecommendationMetadata {
  /** Total number of potential recommendations before filtering */
  totalCount: number
  /** Algorithms used in generating recommendations */
  algorithms: RecommendationAlgorithm[]
  /** Timestamp when recommendations were generated */
  generatedAt: string
  /** Whether results came from cache */
  cacheHit: boolean
  /** Time taken to generate recommendations in milliseconds */
  processingTimeMs: number
  /** Additional debug information */
  debug?: Record<string, unknown>
}

// =============================================
// ANALYTICS AND TRACKING TYPES
// =============================================

/**
 * Types of recommendation interactions to track
 */
export type RecommendationInteractionType
  = | 'impression'
    | 'click'
    | 'conversion'
    | 'dismissal'
    | 'add_to_cart'
    | 'view_details'

/**
 * Analytics event for recommendation interactions
 */
export interface RecommendationAnalyticsEvent {
  /** Type of interaction */
  action: RecommendationInteractionType
  /** User ID (if authenticated) */
  userId?: string
  /** Session ID for anonymous users */
  sessionId?: string
  /** The recommendation that was interacted with */
  recommendation: ProductRecommendation
  /** Context where the interaction occurred */
  context: RecommendationContext
  /** Request ID that generated this recommendation */
  requestId: string
  /** Timestamp of the interaction */
  timestamp: string
  /** Additional event metadata */
  metadata?: Record<string, unknown>
}

/**
 * Batch analytics data for multiple events
 */
export interface RecommendationAnalyticsBatch {
  /** Array of analytics events */
  events: RecommendationAnalyticsEvent[]
  /** Batch metadata */
  batchId: string
  /** Timestamp when batch was created */
  createdAt: string
}

// =============================================
// USER PREFERENCES AND SETTINGS
// =============================================

/**
 * User's recommendation preferences and settings
 */
export interface UserRecommendationPreferences {
  /** User ID */
  userId: string
  /** Products the user has dismissed */
  dismissedProducts: number[]
  /** Categories the user prefers */
  preferredCategories: number[]
  /** Custom algorithm weights for this user */
  algorithmWeights: Record<RecommendationAlgorithm, number>
  /** Whether user wants explanations shown */
  showExplanations: boolean
  /** Maximum number of recommendations to show */
  maxRecommendations: number
  /** Last updated timestamp */
  updatedAt: string
}

/**
 * Anonymous user preferences stored in localStorage
 */
export interface AnonymousRecommendationPreferences {
  /** Products dismissed by anonymous user */
  dismissedProducts: number[]
  /** Recently viewed products */
  recentlyViewed: Array<{
    productId: number
    viewedAt: string
  }>
  /** Preferences expiry date */
  expiresAt: string
}

// =============================================
// RECENTLY VIEWED TYPES
// =============================================

/**
 * Recently viewed product entry
 */
export interface RecentlyViewedProduct {
  /** Product ID */
  productId: number
  /** Product slug for navigation */
  slug: string
  /** When the product was viewed */
  viewedAt: string
  /** Full product data (optional, for caching) */
  product?: ProductWithRelations
}

/**
 * Recently viewed products storage structure
 */
export interface RecentlyViewedStorage {
  /** Array of recently viewed products */
  products: RecentlyViewedProduct[]
  /** Maximum number of items to store */
  maxItems: number
  /** Number of days to keep items */
  expiryDays: number
  /** Last cleanup timestamp */
  lastCleanup: string
}

// =============================================
// ERROR HANDLING TYPES
// =============================================

/**
 * Recommendation-specific error codes
 */
export const RecommendationErrorCodes = {
  INSUFFICIENT_DATA: 'INSUFFICIENT_DATA',
  ALGORITHM_FAILURE: 'ALGORITHM_FAILURE',
  NETWORK_ERROR: 'NETWORK_ERROR',
  INVALID_REQUEST: 'INVALID_REQUEST',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  CACHE_ERROR: 'CACHE_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
} as const

export type RecommendationErrorCode = typeof RecommendationErrorCodes[keyof typeof RecommendationErrorCodes]

/**
 * Recommendation system error with fallback strategies
 */
export interface RecommendationError {
  /** Error code */
  code: RecommendationErrorCode
  /** Human-readable error message */
  message: string
  /** Context where error occurred */
  context?: RecommendationContext
  /** Suggested fallback strategy */
  fallbackStrategy?: 'popular_products' | 'category_products' | 'empty_state' | 'cached_results'
  /** Additional error details */
  details?: Record<string, unknown>
}

// =============================================
// COMPONENT PROP TYPES
// =============================================

/**
 * Props for ProductRecommendations component
 */
export interface ProductRecommendationsProps {
  /** Context for recommendations */
  context: RecommendationContext
  /** Product ID for product-specific recommendations */
  productId?: number
  /** Category ID for category-based recommendations */
  categoryId?: number
  /** Section title */
  title?: string
  /** Maximum number of recommendations to display */
  limit?: number
  /** Whether to show recommendation explanations */
  showExplanations?: boolean
  /** Layout style for recommendations */
  layout?: 'grid' | 'carousel' | 'list'
  /** Custom CSS classes */
  class?: string
  /** Loading state override */
  loading?: boolean
}

/**
 * Props for RecommendationCard component
 */
export interface RecommendationCardProps {
  /** The recommendation to display */
  recommendation: ProductRecommendation
  /** Whether to show the recommendation reason */
  showReason?: boolean
  /** Whether to show dismiss button */
  showDismiss?: boolean
  /** Compact display mode */
  compact?: boolean
  /** Custom CSS classes */
  class?: string
}

/**
 * Props for RecentlyViewed component
 */
export interface RecentlyViewedProps {
  /** Maximum number of items to display */
  limit?: number
  /** Whether to show section title */
  showTitle?: boolean
  /** Layout orientation */
  layout?: 'horizontal' | 'vertical'
  /** Custom CSS classes */
  class?: string
}

// =============================================
// COMPOSABLE RETURN TYPES
// =============================================

/**
 * Return type for useRecommendations composable
 */
export interface UseRecommendationsReturn {
  /** Current recommendations */
  recommendations: Ref<ProductRecommendation[]>
  /** Loading state */
  loading: Ref<boolean>
  /** Error state */
  error: Ref<RecommendationError | null>
  /** Fetch recommendations function */
  fetchRecommendations: (request: RecommendationRequest) => Promise<void>
  /** Dismiss a recommendation */
  dismissRecommendation: (productId: number) => void
  /** Track user interaction with recommendation */
  trackInteraction: (recommendation: ProductRecommendation, action: RecommendationInteractionType) => void
  /** Clear current recommendations */
  clearRecommendations: () => void
  /** Refresh recommendations */
  refreshRecommendations: () => Promise<void>
}

/**
 * Return type for useRecentlyViewed composable
 */
export interface UseRecentlyViewedReturn {
  /** Recently viewed products */
  recentlyViewed: Ref<ProductWithRelations[]>
  /** Loading state */
  loading: Ref<boolean>
  /** Add product to recently viewed */
  addToRecentlyViewed: (product: ProductWithRelations) => void
  /** Clear all recently viewed products */
  clearRecentlyViewed: () => void
  /** Remove specific product from recently viewed */
  removeFromRecentlyViewed: (productId: number) => void
  /** Get recently viewed products */
  getRecentlyViewed: () => ProductWithRelations[]
}

/**
 * Return type for useRecommendationAnalytics composable
 */
export interface UseRecommendationAnalyticsReturn {
  /** Track recommendation impression */
  trackImpression: (recommendations: ProductRecommendation[], context: RecommendationContext) => void
  /** Track recommendation click */
  trackClick: (recommendation: ProductRecommendation, context: RecommendationContext) => void
  /** Track recommendation conversion */
  trackConversion: (recommendation: ProductRecommendation, orderId: string) => void
  /** Track recommendation dismissal */
  trackDismissal: (recommendation: ProductRecommendation, context: RecommendationContext) => void
  /** Send analytics batch */
  sendBatch: () => Promise<void>
  /** Get pending events count */
  getPendingEventsCount: () => number
}

// =============================================
// ALGORITHM-SPECIFIC TYPES
// =============================================

/**
 * Content-based recommendation parameters
 */
export interface ContentBasedParams {
  /** Weight for category similarity */
  categoryWeight: number
  /** Weight for attribute similarity */
  attributeWeight: number
  /** Weight for price similarity */
  priceWeight: number
  /** Minimum similarity threshold */
  minSimilarity: number
}

/**
 * Collaborative filtering parameters
 */
export interface CollaborativeFilteringParams {
  /** Minimum number of common users */
  minCommonUsers: number
  /** User similarity threshold */
  userSimilarityThreshold: number
  /** Item similarity threshold */
  itemSimilarityThreshold: number
}

/**
 * Behavioral recommendation parameters
 */
export interface BehavioralParams {
  /** Weight for recent views */
  recentViewWeight: number
  /** Weight for purchase history */
  purchaseHistoryWeight: number
  /** Weight for cart additions */
  cartAdditionWeight: number
  /** Time decay factor */
  timeDecayFactor: number
}

/**
 * Algorithm configuration
 */
export interface AlgorithmConfig {
  /** Content-based parameters */
  contentBased: ContentBasedParams
  /** Collaborative filtering parameters */
  collaborativeFiltering: CollaborativeFilteringParams
  /** Behavioral parameters */
  behavioral: BehavioralParams
  /** Default algorithm weights */
  defaultWeights: Record<RecommendationAlgorithm, number>
}

// =============================================
// CACHE TYPES
// =============================================

/**
 * Cache key structure for recommendations
 */
export interface RecommendationCacheKey {
  /** Context */
  context: RecommendationContext
  /** User ID (if applicable) */
  userId?: string
  /** Product ID (if applicable) */
  productId?: number
  /** Category ID (if applicable) */
  categoryId?: number
  /** Hash of cart items (if applicable) */
  cartHash?: string
  /** Algorithm preferences */
  algorithms: RecommendationAlgorithm[]
}

/**
 * Cached recommendation entry
 */
export interface CachedRecommendation {
  /** Cache key */
  key: string
  /** Cached response */
  response: RecommendationResponse
  /** Cache timestamp */
  cachedAt: string
  /** Cache expiry timestamp */
  expiresAt: string
  /** Cache hit count */
  hitCount: number
}
