# Server Routes Testing Guide

This guide covers patterns for testing Nuxt server routes (`/server/api/`) in a Nuxt 4 project.

## Setup

Server route tests use the **node environment** (not jsdom):

```typescript
// vitest.config.integration.ts
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/integration/**/*.test.ts', 'tests/server/**/*.test.ts'],
  },
})
```

## Project Mock Infrastructure

This project has pre-configured mocks in `tests/server/utils/mocks/`. The vitest config auto-resolves these:

```typescript
// vitest.config.ts - Already configured aliases
resolve: {
  alias: {
    '#supabase/server': resolve(__dirname, './tests/server/utils/mocks/supabase-server.mock.ts'),
    '#nitro': resolve(__dirname, './tests/server/utils/mocks/nitro.mock.ts'),
    'h3': resolve(__dirname, './tests/server/utils/mocks/h3.mock.ts'),
  },
}
```

### Available Mock Files

| File | Purpose |
|------|---------|
| `tests/server/utils/mocks/h3.mock.ts` | h3 utilities (getQuery, readBody, createError) |
| `tests/server/utils/mocks/supabase-server.mock.ts` | Supabase server client |
| `tests/server/utils/mocks/nitro.mock.ts` | Nitro runtime utilities |

## Essential Mocks (Reference Implementation)

### h3 Utilities

```typescript
// tests/server/utils/mocks/h3.mock.ts
import { vi } from 'vitest'

export const mockReadBody = vi.fn()
export const mockGetQuery = vi.fn()
export const mockGetHeader = vi.fn()
export const mockCreateError = vi.fn((options) => {
  const error = new Error(options.message || options.statusMessage)
  ;(error as any).statusCode = options.statusCode
  ;(error as any).statusMessage = options.statusMessage
  return error
})
export const mockSetResponseStatus = vi.fn()

vi.mock('h3', () => ({
  readBody: mockReadBody,
  getQuery: mockGetQuery,
  getHeader: mockGetHeader,
  createError: mockCreateError,
  setResponseStatus: mockSetResponseStatus,
  defineEventHandler: (handler: Function) => handler,
  getRouterParams: vi.fn(() => ({})),
}))
```

### Supabase Server Client

```typescript
// tests/server/utils/mocks/supabase-server.mock.ts
import { vi } from 'vitest'

export const mockSupabaseRpc = vi.fn()
export const mockSupabaseFrom = vi.fn()
export const mockSupabaseAuth = {
  admin: {
    getUserById: vi.fn(),
    updateUserById: vi.fn(),
  },
}

// Chain builder for Supabase queries
export const createSupabaseChain = (finalResult: any) => ({
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  neq: vi.fn().mockReturnThis(),
  in: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  single: vi.fn().mockResolvedValue(finalResult),
  maybeSingle: vi.fn().mockResolvedValue(finalResult),
})

vi.mock('#supabase/server', () => ({
  serverSupabaseServiceRole: vi.fn(() => ({
    rpc: mockSupabaseRpc,
    from: mockSupabaseFrom,
    auth: mockSupabaseAuth,
  })),
  serverSupabaseClient: vi.fn(() => ({
    from: mockSupabaseFrom,
    auth: {
      getUser: vi.fn(),
    },
  })),
}))
```

## Basic API Route Testing

### GET Endpoint

```typescript
// server/api/products/index.get.ts
export default defineEventHandler(async (event) => {
  const client = await serverSupabaseServiceRole(event)
  const query = getQuery(event)
  
  let dbQuery = client.from('products').select('*')
  
  if (query.category) {
    dbQuery = dbQuery.eq('category', query.category)
  }
  
  const { data, error } = await dbQuery
  
  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }
  
  return { products: data }
})
```

```typescript
// tests/server/api/products.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  mockGetQuery,
  mockCreateError,
} from '../utils/mocks/h3.mock'
import {
  mockSupabaseFrom,
  createSupabaseChain,
} from '../utils/mocks/supabase-server.mock'

describe('GET /api/products', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return all products', async () => {
    const mockProducts = [
      { id: '1', name: 'Wine', category: 'beverages' },
      { id: '2', name: 'Cheese', category: 'food' },
    ]
    
    mockGetQuery.mockReturnValue({})
    mockSupabaseFrom.mockReturnValue(
      createSupabaseChain({ data: mockProducts, error: null })
    )
    
    // Dynamic import after mocks
    const { default: handler } = await import('~/server/api/products/index.get')
    
    const result = await handler({} as any)
    
    expect(result).toEqual({ products: mockProducts })
    expect(mockSupabaseFrom).toHaveBeenCalledWith('products')
  })

  it('should filter by category', async () => {
    const mockProducts = [{ id: '1', name: 'Wine', category: 'beverages' }]
    
    mockGetQuery.mockReturnValue({ category: 'beverages' })
    
    const chain = createSupabaseChain({ data: mockProducts, error: null })
    mockSupabaseFrom.mockReturnValue(chain)
    
    const { default: handler } = await import('~/server/api/products/index.get')
    
    await handler({} as any)
    
    expect(chain.eq).toHaveBeenCalledWith('category', 'beverages')
  })

  it('should throw error on database failure', async () => {
    mockGetQuery.mockReturnValue({})
    mockSupabaseFrom.mockReturnValue(
      createSupabaseChain({ data: null, error: { message: 'DB Error' } })
    )
    
    const { default: handler } = await import('~/server/api/products/index.get')
    
    await expect(handler({} as any)).rejects.toThrow()
    expect(mockCreateError).toHaveBeenCalledWith({
      statusCode: 500,
      message: 'DB Error',
    })
  })
})
```

### POST Endpoint

```typescript
// server/api/products/index.post.ts
export default defineEventHandler(async (event) => {
  const client = await serverSupabaseServiceRole(event)
  const body = await readBody(event)
  
  // Validation
  if (!body.name || !body.price) {
    throw createError({
      statusCode: 400,
      message: 'Name and price are required',
    })
  }
  
  const { data, error } = await client
    .from('products')
    .insert(body)
    .select()
    .single()
  
  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }
  
  return { product: data }
})
```

```typescript
// tests/server/api/products.post.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  mockReadBody,
  mockCreateError,
} from '../utils/mocks/h3.mock'
import {
  mockSupabaseFrom,
  createSupabaseChain,
} from '../utils/mocks/supabase-server.mock'

describe('POST /api/products', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create a product', async () => {
    const newProduct = { name: 'Wine', price: 15.99 }
    const createdProduct = { id: '1', ...newProduct }
    
    mockReadBody.mockResolvedValue(newProduct)
    mockSupabaseFrom.mockReturnValue(
      createSupabaseChain({ data: createdProduct, error: null })
    )
    
    const { default: handler } = await import('~/server/api/products/index.post')
    
    const result = await handler({} as any)
    
    expect(result).toEqual({ product: createdProduct })
  })

  it('should validate required fields', async () => {
    mockReadBody.mockResolvedValue({ name: 'Wine' }) // Missing price
    
    const { default: handler } = await import('~/server/api/products/index.post')
    
    await expect(handler({} as any)).rejects.toThrow()
    expect(mockCreateError).toHaveBeenCalledWith({
      statusCode: 400,
      message: 'Name and price are required',
    })
  })
})
```

## Testing Authentication

```typescript
// tests/server/api/admin/users.test.ts
import { mockGetHeader, mockCreateError } from '../../utils/mocks/h3.mock'
import { mockSupabaseAuth, mockSupabaseFrom, createSupabaseChain } from '../../utils/mocks/supabase-server.mock'

describe('GET /api/admin/users', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should require authorization header', async () => {
    mockGetHeader.mockReturnValue(undefined)
    
    const { default: handler } = await import('~/server/api/admin/users.get')
    
    await expect(handler({} as any)).rejects.toThrow()
    expect(mockCreateError).toHaveBeenCalledWith({
      statusCode: 401,
      message: 'Unauthorized',
    })
  })

  it('should require admin role', async () => {
    mockGetHeader.mockReturnValue('Bearer user-token')
    mockSupabaseAuth.admin.getUserById.mockResolvedValue({
      data: { id: '1', role: 'user' },
      error: null,
    })
    
    const { default: handler } = await import('~/server/api/admin/users.get')
    
    await expect(handler({} as any)).rejects.toThrow()
    expect(mockCreateError).toHaveBeenCalledWith({
      statusCode: 403,
      message: 'Forbidden',
    })
  })

  it('should return users for admin', async () => {
    const mockUsers = [
      { id: '1', email: 'user1@example.com' },
      { id: '2', email: 'user2@example.com' },
    ]
    
    mockGetHeader.mockReturnValue('Bearer admin-token')
    mockSupabaseAuth.admin.getUserById.mockResolvedValue({
      data: { id: 'admin', role: 'admin' },
      error: null,
    })
    mockSupabaseFrom.mockReturnValue(
      createSupabaseChain({ data: mockUsers, error: null })
    )
    
    const { default: handler } = await import('~/server/api/admin/users.get')
    
    const result = await handler({} as any)
    
    expect(result).toEqual({ users: mockUsers })
  })
})
```

## Testing RPC Calls

```typescript
// tests/server/api/stats.test.ts
import { mockSupabaseRpc } from '../utils/mocks/supabase-server.mock'

describe('GET /api/stats', () => {
  it('should call RPC and return stats', async () => {
    const mockStats = { totalProducts: 100, totalValue: 5000 }
    mockSupabaseRpc.mockResolvedValue({ data: mockStats, error: null })
    
    const { default: handler } = await import('~/server/api/stats.get')
    
    const result = await handler({} as any)
    
    expect(mockSupabaseRpc).toHaveBeenCalledWith('get_product_stats')
    expect(result).toEqual({ stats: mockStats })
  })
})
```

## Best Practices

### ✅ DO

1. **Mock h3 utilities** (`readBody`, `getQuery`, `createError`)
2. **Mock Supabase client** at module level
3. **Use dynamic imports** after setting up mocks
4. **Test all HTTP methods** (GET, POST, PUT, DELETE)
5. **Test error scenarios** (validation, auth, DB errors)
6. **Test edge cases** (empty body, missing params)

### ❌ DON'T

1. **Don't test with real database** in unit tests
2. **Don't forget to reset mocks** between tests
3. **Don't skip authentication tests**
4. **Don't ignore error handling**

### Test Coverage Checklist

For each API route, test:

- [ ] Happy path (successful response)
- [ ] Input validation (missing/invalid fields)
- [ ] Authentication (if protected)
- [ ] Authorization (if role-based)
- [ ] Database errors
- [ ] Edge cases (empty results, not found)
- [ ] Query parameters (if applicable)
- [ ] Request body parsing (for POST/PUT)
