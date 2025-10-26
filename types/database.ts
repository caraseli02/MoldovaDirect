// Database-related TypeScript types for Moldova Direct
// These types correspond to the Supabase database schema

// =============================================
// CORE TRANSLATION INTERFACE
// =============================================
export interface Translations {
  es: string
  en: string
  ro?: string
  ru?: string
  [key: string]: string | undefined  // Allow index signature for compatibility
}

// =============================================
// CATEGORY TYPES
// =============================================
export interface Category {
  id: number
  slug: string
  parentId?: number
  nameTranslations: Translations
  descriptionTranslations?: Translations
  imageUrl?: string
  sortOrder: number
  isActive: boolean
  createdAt: string
}

export interface CategoryWithChildren extends Category {
  children?: CategoryWithChildren[]
  productCount: number
  // Convenience properties for templates  
  name: Translations
  icon?: string
}


// =============================================
// PRODUCT TYPES
// =============================================
export interface ProductImage {
  id?: number
  url: string
  altText?: Translations
  sortOrder: number
  isPrimary: boolean
}

export interface ProductAttribute {
  name: string
  value: string
  type: 'text' | 'number' | 'boolean' | 'select'
}

export interface Product {
  id: number
  sku: string
  categoryId: number
  nameTranslations: Translations
  descriptionTranslations?: Translations
  shortDescriptionTranslations?: Translations
  priceEur: number
  compareAtPriceEur?: number
  weightKg?: number
  stockQuantity: number
  lowStockThreshold: number
  images?: ProductImage[]
  attributes?: Record<string, any>
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ProductWithRelations extends Product {
  category: Category
  images: ProductImage[]
  // Computed properties for frontend use
  name: Translations
  description?: Translations
  shortDescription?: Translations
  price: number
  comparePrice?: number
  slug: string
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock'
  formattedPrice: string
  primaryImage?: ProductImage
  // Legacy fields for compatibility with existing components
  tags?: string[]
  origin?: string
  volume?: number
  alcoholContent?: number
  isFeatured?: boolean
}

// =============================================
// PRODUCT FILTERING AND SEARCH
// =============================================
export interface ProductFilters {
  category?: string | number
  search?: string
  priceMin?: number
  priceMax?: number
  inStock?: boolean
  featured?: boolean
  attributes?: Record<string, string[]>
  sort?: 'name' | 'price_asc' | 'price_desc' | 'newest' | 'featured' | 'created'
  page?: number
  limit?: number
}

export interface PriceRange {
  min: number
  max: number
}

export interface CategoryFilter {
  id: number
  name: Translations
  slug: string
  productCount: number
  children?: CategoryFilter[]
}

export interface AttributeFilter {
  name: string
  label: string
  values: Array<{
    value: string
    label: string
    count: number
  }>
}

// =============================================
// API RESPONSE TYPES
// =============================================
export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ProductListResponse {
  products: ProductWithRelations[]
  pagination: Pagination
  filters: {
    categories: CategoryFilter[]
    priceRange: PriceRange
    attributes: AttributeFilter[]
  }
}

export interface ProductDetailResponse {
  product: ProductWithRelations
  relatedProducts: ProductWithRelations[]
}

export interface CategoryListResponse {
  categories: CategoryWithChildren[]
}

export interface CategoryDetailResponse {
  category: CategoryWithChildren
  products: ProductWithRelations[]
  pagination: Pagination
}

export interface SearchResponse {
  products: ProductWithRelations[]
  suggestions: string[]
  pagination: Pagination
  query: string
}

// =============================================
// CART TYPES
// =============================================
export interface Cart {
  id: number
  userId?: string
  sessionId?: string
  expiresAt?: string
  createdAt: string
  updatedAt: string
}

export interface CartItem {
  id: number
  cartId: number
  productId: number
  quantity: number
  addedAt: string
  product?: ProductWithRelations
}

export interface CartWithItems extends Cart {
  items: CartItem[]
  subtotal: number
  itemCount: number
}

// =============================================
// ORDER TYPES
// =============================================
export interface Address {
  id?: number
  userId?: string
  type: 'billing' | 'shipping'
  street: string
  city: string
  postalCode: string
  province?: string
  country: string
  isDefault: boolean
  createdAt?: string
}

export interface Order {
  id: number
  orderNumber: string
  userId?: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  paymentMethod: 'stripe' | 'paypal' | 'cod'
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  paymentIntentId?: string
  subtotalEur: number
  shippingCostEur: number
  taxEur: number
  totalEur: number
  shippingAddress: Address
  billingAddress: Address
  customerNotes?: string
  adminNotes?: string
  shippedAt?: string
  deliveredAt?: string
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  id: number
  orderId: number
  productId: number
  productSnapshot: ProductWithRelations
  quantity: number
  priceEur: number
  totalEur: number
}

export interface OrderWithItems extends Order {
  items: OrderItem[]
}

// =============================================
// INVENTORY TYPES
// =============================================
export interface InventoryLog {
  id: number
  productId: number
  quantityChange: number
  quantityAfter: number
  reason: 'sale' | 'return' | 'manual_adjustment' | 'stock_receipt'
  referenceId?: number
  createdBy?: string
  createdAt: string
}

// =============================================
// USER PROFILE TYPES
// =============================================
export interface Profile {
  id: string
  name: string
  phone?: string
  preferredLanguage: 'es' | 'en' | 'ro' | 'ru'
  createdAt: string
  updatedAt: string
}

// =============================================
// UTILITY TYPES
// =============================================
export interface ApiError {
  statusCode: number
  statusMessage: string
  details?: {
    field?: string
    code?: string
  }
}

export interface ApiResponse<T> {
  data?: T
  error?: ApiError
  success: boolean
}

// =============================================
// FORM TYPES
// =============================================
export interface ProductSearchForm {
  query: string
  category?: string
  sortBy: string
  filters: ProductFilters
}

export interface ProductFilterForm {
  categories: number[]
  priceRange: PriceRange
  attributes: Record<string, string[]>
  inStock: boolean
  featured: boolean
}

// =============================================
// COMPONENT PROP TYPES
// =============================================
export interface ProductCardProps {
  product: ProductWithRelations
  showQuickView?: boolean
  showCompare?: boolean
}

export interface ProductGridProps {
  products: ProductWithRelations[]
  loading?: boolean
  columns?: number
}

export interface ProductFilterProps {
  filters: ProductFilters
  availableFilters: {
    categories: CategoryFilter[]
    priceRange: PriceRange
    attributes: AttributeFilter[]
  }
  onFiltersChange: (filters: ProductFilters) => void
}

export interface CategoryNavigationProps {
  categories: CategoryWithChildren[]
  currentCategory?: string
  showProductCount?: boolean
}

// =============================================
// STORE STATE TYPES
// =============================================
export interface ProductStoreState {
  products: ProductWithRelations[]
  categories: CategoryWithChildren[]
  currentProduct: ProductWithRelations | null
  filters: ProductFilters
  pagination: Pagination
  loading: boolean
  error: string | null
}

export interface CartStoreState {
  cart: CartWithItems | null
  loading: boolean
  error: string | null
}
