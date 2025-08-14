import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  phone: text('phone'),
  preferredLanguage: text('preferred_language').default('es'),
  emailVerified: integer('email_verified', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
})

export const addresses = sqliteTable('addresses', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // 'billing' or 'shipping'
  street: text('street').notNull(),
  city: text('city').notNull(),
  postalCode: text('postal_code').notNull(),
  province: text('province'),
  country: text('country').default('ES'),
  isDefault: integer('is_default', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
})

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  refreshToken: text('refresh_token').unique(),
  expiresAt: text('expires_at').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
})