import { pgTable, serial, text, varchar, decimal, integer, timestamp, boolean, json } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Categories table with hierarchical structure
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: json('name').$type<Record<string, string>>().notNull(), // Multi-language names
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: json('description').$type<Record<string, string>>(), // Multi-language descriptions
  parentId: integer('parent_id').references(() => categories.id),
  sortOrder: integer('sort_order').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

// Products table with multi-language support
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: json('name').$type<Record<string, string>>().notNull(), // Multi-language names
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: json('description').$type<Record<string, string>>(), // Multi-language descriptions
  shortDescription: json('short_description').$type<Record<string, string>>(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  comparePrice: decimal('compare_price', { precision: 10, scale: 2 }), // Original price for discounts
  sku: varchar('sku', { length: 100 }).unique(),
  barcode: varchar('barcode', { length: 100 }),
  weight: decimal('weight', { precision: 8, scale: 2 }), // Weight in kg
  stockQuantity: integer('stock_quantity').default(0),
  minStockLevel: integer('min_stock_level').default(5),
  categoryId: integer('category_id').references(() => categories.id).notNull(),
  isActive: boolean('is_active').default(true),
  isFeatured: boolean('is_featured').default(false),
  metaTitle: json('meta_title').$type<Record<string, string>>(),
  metaDescription: json('meta_description').$type<Record<string, string>>(),
  tags: json('tags').$type<string[]>().default([]),
  origin: varchar('origin', { length: 100 }), // Country of origin
  alcoholContent: decimal('alcohol_content', { precision: 4, scale: 2 }), // For wine products
  volume: decimal('volume', { precision: 8, scale: 2 }), // Volume in ml
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

// Product images table
export const productImages = pgTable('product_images', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  url: varchar('url', { length: 500 }).notNull(),
  altText: json('alt_text').$type<Record<string, string>>(), // Multi-language alt text
  sortOrder: integer('sort_order').default(0),
  isPrimary: boolean('is_primary').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

// Inventory logs for stock tracking
export const inventoryLogs = pgTable('inventory_logs', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  changeType: varchar('change_type', { length: 50 }).notNull(), // 'in', 'out', 'adjustment'
  quantity: integer('quantity').notNull(), // Positive for in, negative for out
  previousStock: integer('previous_stock').notNull(),
  newStock: integer('new_stock').notNull(),
  reason: text('reason'),
  reference: varchar('reference', { length: 255 }), // Order ID, etc.
  createdAt: timestamp('created_at').defaultNow().notNull()
})

// Relations
export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id]
  }),
  children: many(categories),
  products: many(products)
}))

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id]
  }),
  images: many(productImages),
  inventoryLogs: many(inventoryLogs)
}))

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id]
  })
}))

export const inventoryLogsRelations = relations(inventoryLogs, ({ one }) => ({
  product: one(products, {
    fields: [inventoryLogs.productId],
    references: [products.id]
  })
}))