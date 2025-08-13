import type { InferSelectModel, InferInsertModel } from 'drizzle-orm'
import type { categories, products, productImages, inventoryLogs } from '~/server/database/schema'

// Database model types
export type Category = InferSelectModel<typeof categories>
export type NewCategory = InferInsertModel<typeof categories>

export type Product = InferSelectModel<typeof products>
export type NewProduct = InferInsertModel<typeof products>

export type ProductImage = InferSelectModel<typeof productImages>
export type NewProductImage = InferInsertModel<typeof productImages>

export type InventoryLog = InferSelectModel<typeof inventoryLogs>
export type NewInventoryLog = InferInsertModel<typeof inventoryLogs>

// Extended types with relations
export type CategoryWithChildren = Category & {
  children?: CategoryWithChildren[]
  parent?: Category
}

export type ProductWithRelations = Product & {
  category: Category
  images: ProductImage[]
}

export type ProductWithDetails = ProductWithRelations & {
  inventoryLogs?: InventoryLog[]
}

// API response types
export interface ProductFilters {
  categoryId?: number
  search?: string
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
  featured?: boolean
  tags?: string[]
  sortBy?: 'name' | 'price' | 'created' | 'featured'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface ProductListResponse {
  products: ProductWithRelations[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface CategoryListResponse {
  categories: CategoryWithChildren[]
}

// Multi-language content types
export interface MultiLanguageText {
  es: string  // Spanish (default)
  en: string  // English
  ro: string  // Romanian
  ru: string  // Russian
}

// Form types for admin
export interface ProductFormData {
  name: MultiLanguageText
  slug: string
  description?: MultiLanguageText
  shortDescription?: MultiLanguageText
  price: number
  comparePrice?: number
  sku?: string
  barcode?: string
  weight?: number
  stockQuantity: number
  minStockLevel: number
  categoryId: number
  isActive: boolean
  isFeatured: boolean
  metaTitle?: MultiLanguageText
  metaDescription?: MultiLanguageText
  tags: string[]
  origin?: string
  alcoholContent?: number
  volume?: number
  images: ProductImageFormData[]
}

export interface ProductImageFormData {
  url: string
  altText?: MultiLanguageText
  sortOrder: number
  isPrimary: boolean
}

export interface CategoryFormData {
  name: MultiLanguageText
  slug: string
  description?: MultiLanguageText
  parentId?: number
  sortOrder: number
  isActive: boolean
}