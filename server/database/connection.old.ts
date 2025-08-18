import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// Database connection
const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/moldovadirect'

// For development - disable SSL requirement
const sql = postgres(connectionString, { 
  ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
  max: 10,
  idle_timeout: 20,
  connect_timeout: 60,
})

export const db = drizzle(sql, { schema })

export { sql }