import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),
  parentId: integer('parent_id'),
  nameTranslations: text('name_translations', { mode: 'json' }).notNull(), // {en: "Wine", es: "Vino", ro: "Vin", ru: "Вино"}
  descriptionTranslations: text('description_translations', { mode: 'json' }),
  imageUrl: text('image_url'),
  sortOrder: integer('sort_order').default(0),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
})

export const products = sqliteTable('products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sku: text('sku').notNull().unique(),
  categoryId: integer('category_id').references(() => categories.id),
  nameTranslations: text('name_translations', { mode: 'json' }).notNull(),
  descriptionTranslations: text('description_translations', { mode: 'json' }),
  priceEur: real('price_eur').notNull(),
  compareAtPriceEur: real('compare_at_price_eur'),
  weightKg: real('weight_kg'),
  stockQuantity: integer('stock_quantity').default(0),
  lowStockThreshold: integer('low_stock_threshold').default(5),
  images: text('images', { mode: 'json' }), // Array of image URLs
  attributes: text('attributes', { mode: 'json' }), // {alcohol_percentage: 13.5, volume_ml: 750, year: 2020}
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
})

export const inventoryLogs = sqliteTable('inventory_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  productId: integer('product_id').references(() => products.id, { onDelete: 'cascade' }),
  quantityChange: integer('quantity_change').notNull(), // Positive for additions, negative for removals
  quantityAfter: integer('quantity_after').notNull(),
  reason: text('reason').notNull(), // sale, return, manual_adjustment, stock_receipt
  referenceId: integer('reference_id'), // order_id or adjustment_id
  createdBy: integer('created_by').references(() => users.id),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
})

// Import users from users.ts for the reference
import { users } from './users'