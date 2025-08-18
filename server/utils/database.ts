import { drizzle } from 'drizzle-orm/d1'
import * as schema from '../database/schema/index'

// Export all commonly used Drizzle ORM functions
export { 
  sql, 
  eq, 
  and, 
  or, 
  desc, 
  asc, 
  inArray,
  gte,
  lte,
  gt,
  lt,
  ne,
  like,
  notLike,
  between,
  notBetween,
  isNull,
  isNotNull
} from 'drizzle-orm'

export function useDB() {
  // NuxtHub automatically provides the D1 database binding
  return drizzle(hubDatabase(), { schema })
}

export const tables = schema