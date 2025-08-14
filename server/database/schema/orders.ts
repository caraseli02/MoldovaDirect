import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'
import { users } from './users'
import { products } from './products'

export const carts = sqliteTable('carts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  sessionId: text('session_id'), // For anonymous users (future feature)
  expiresAt: text('expires_at'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
})

export const cartItems = sqliteTable('cart_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  cartId: integer('cart_id').references(() => carts.id, { onDelete: 'cascade' }),
  productId: integer('product_id').references(() => products.id, { onDelete: 'cascade' }),
  quantity: integer('quantity').notNull(),
  addedAt: text('added_at').default(sql`CURRENT_TIMESTAMP`)
})

export const orders = sqliteTable('orders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  orderNumber: text('order_number').notNull().unique(),
  userId: integer('user_id').references(() => users.id),
  status: text('status').notNull(), // pending, processing, shipped, delivered, cancelled
  paymentMethod: text('payment_method').notNull(), // stripe, paypal, cod
  paymentStatus: text('payment_status').notNull(), // pending, paid, failed, refunded
  paymentIntentId: text('payment_intent_id'), // Stripe/PayPal reference
  subtotalEur: real('subtotal_eur').notNull(),
  shippingCostEur: real('shipping_cost_eur').notNull(),
  taxEur: real('tax_eur').default(0),
  totalEur: real('total_eur').notNull(),
  shippingAddress: text('shipping_address', { mode: 'json' }).notNull(),
  billingAddress: text('billing_address', { mode: 'json' }).notNull(),
  customerNotes: text('customer_notes'),
  adminNotes: text('admin_notes'),
  shippedAt: text('shipped_at'),
  deliveredAt: text('delivered_at'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
})

export const orderItems = sqliteTable('order_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  orderId: integer('order_id').references(() => orders.id, { onDelete: 'cascade' }),
  productId: integer('product_id').references(() => products.id),
  productSnapshot: text('product_snapshot', { mode: 'json' }).notNull(), // Store product details at time of purchase
  quantity: integer('quantity').notNull(),
  priceEur: real('price_eur').notNull(),
  totalEur: real('total_eur').notNull()
})