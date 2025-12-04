---
inclusion: always
---

# Supabase Best Practices for Nuxt

This project uses the `@nuxtjs/supabase` module. Follow these guidelines when working with Supabase.

## Environment Variables

The module automatically reads these environment variables:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_anon_key              # Public anon key
SUPABASE_SERVICE_KEY=your_service_key   # Service role key (server-only)
```

**Important:** Use `SUPABASE_KEY` (not `SUPABASE_ANON_KEY`) - this is the official module convention.

## Server-Side Usage

### For Admin Operations (Bypasses RLS)

Use when you need to bypass Row Level Security policies:

```typescript
import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const supabase = serverSupabaseServiceRole(event)
  
  // This client has admin privileges
  const { data } = await supabase.from('orders').select('*')
  
  return { data }
})
```

### For User-Context Operations (Respects RLS)

Use when you want to respect Row Level Security with user's JWT:

```typescript
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)
  
  // This client uses the user's session
  const { data } = await supabase.from('orders').select('*')
  
  return { data }
})
```

## Client-Side Usage

```typescript
// In Vue components or composables
const supabase = useSupabaseClient()
const user = useSupabaseUser()

// Example: Fetch data
const { data } = await supabase.from('products').select('*')

// Example: Check authentication
if (user.value) {
  console.log('User is logged in:', user.value.email)
}
```

## What NOT to Do

### ❌ Don't Manually Create Clients

```typescript
// WRONG - Don't do this
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)
```

### ❌ Don't Add Supabase to Runtime Config

```typescript
// WRONG - Don't do this in nuxt.config.ts
runtimeConfig: {
  public: {
    supabaseUrl: process.env.SUPABASE_URL,  // Module handles this
    supabaseKey: process.env.SUPABASE_KEY   // Module handles this
  }
}
```

### ❌ Don't Use Wrong Environment Variable Names

```bash
# WRONG
SUPABASE_ANON_KEY=your_key

# CORRECT
SUPABASE_KEY=your_key
```

## Module Configuration

The module is configured in `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: ['@nuxtjs/supabase'],
  
  supabase: {
    redirectOptions: {
      login: '/auth/login',
      callback: '/auth/confirm',
      exclude: ['/products', '/cart', /* other public routes */]
    }
  }
})
```

## When to Use Each Helper

| Use Case | Helper | RLS | Use When |
|----------|--------|-----|----------|
| Admin operations | `serverSupabaseServiceRole` | Bypassed | Creating orders, updating inventory, admin dashboards |
| User operations | `serverSupabaseClient` | Enforced | User-specific queries, profile updates |
| Client-side | `useSupabaseClient` | Enforced | Frontend data fetching, user actions |

## Common Patterns

### Creating Orders (Admin)

```typescript
import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const supabase = serverSupabaseServiceRole(event)
  const body = await readBody(event)
  
  const { data: order } = await supabase
    .from('orders')
    .insert(body)
    .select()
    .single()
  
  return { order }
})
```

### Fetching User Orders (User Context)

```typescript
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)
  
  // RLS ensures user only sees their own orders
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
  
  return { orders }
})
```

### Authentication Check

```typescript
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }
  
  return { user }
})
```

## References

- [Nuxt Supabase Module](https://supabase.nuxtjs.org/)
- [serverSupabaseServiceRole](https://supabase.nuxtjs.org/services/serversupabaseservicerole)
- [serverSupabaseClient](https://supabase.nuxtjs.org/services/serversupabaseclient)
- [useSupabaseClient](https://supabase.nuxtjs.org/composables/usesupabaseclient)
- [useSupabaseUser](https://supabase.nuxtjs.org/composables/usesupabaseuser)

## Recent Changes

**October 25, 2025:** Completed full migration to Nuxt Supabase module best practices
- Fixed 31 server API routes to use module helpers
- Standardized environment variable naming
- Removed redundant runtime config
- Updated all documentation

See [SUPABASE_FIXES_COMPLETED.md](../../SUPABASE_FIXES_COMPLETED.md) for details.
