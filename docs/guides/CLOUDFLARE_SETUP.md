# Moldova Direct - NuxtHub & Cloudflare Setup Guide

## Overview
This guide covers the complete setup and deployment of Moldova Direct using NuxtHub and Cloudflare's edge infrastructure.

## Architecture

### Technology Stack
- **Frontend Framework**: Nuxt 3 with NuxtHub
- **Edge Runtime**: Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite at the edge)
- **File Storage**: Cloudflare R2 (S3-compatible)
- **Cache/Sessions**: Cloudflare KV
- **CDN**: Cloudflare's global network (300+ locations)
- **Image Optimization**: Cloudflare Images
- **Analytics**: Cloudflare Web Analytics

## Prerequisites

1. **Cloudflare Account**: Sign up at [cloudflare.com](https://cloudflare.com)
2. **Node.js**: Version 20.11+ installed
3. **Git**: For version control
4. **NuxtHub Account**: Sign up at [hub.nuxt.com](https://hub.nuxt.com)

## Initial Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Create Cloudflare Resources

#### Create D1 Database
```bash
# Create the database
npm run cf:db:create

# Note the database ID from the output and update wrangler.toml
```

#### Create KV Namespace
```bash
# Create KV namespace for sessions
npm run cf:kv:create

# Note the namespace ID and update wrangler.toml
```

#### Create R2 Bucket
```bash
# Create R2 bucket for file storage
npm run cf:r2:create
```

### 3. Environment Configuration

Create `.env` file:
```bash
# Cloudflare Configuration
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_DATABASE_ID=your-database-id
CLOUDFLARE_D1_TOKEN=your-d1-token

# NuxtHub
NUXT_HUB_PROJECT_KEY=your-project-key

# Application
NUXT_PUBLIC_SITE_URL=https://moldovadirect.com

# Payment Providers (for production)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...

# Email Service (SendGrid/Resend)
EMAIL_API_KEY=...
EMAIL_FROM=noreply@moldovadirect.com
```

### 4. Database Setup

#### Generate Migrations
```bash
npm run db:generate
```

#### Push Schema to D1
```bash
npm run db:push
```

#### Access Database Studio
```bash
npm run db:studio
```

## Development

### Local Development with NuxtHub
```bash
# Start development server with NuxtHub bindings
npm run dev

# Access at http://localhost:3000
```

### Testing Edge Functions Locally
```bash
# Use wrangler for local testing
npx wrangler pages dev .output/public --compatibility-date=2024-11-01
```

## Database Management

### Schema Updates
When updating the database schema:

1. Modify schema files in `server/database/schema/`
2. Generate migration:
```bash
npm run db:generate
```
3. Push to D1:
```bash
npm run db:push
```

### Example: Adding a New Table
```typescript
// server/database/schema/reviews.ts
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const reviews = sqliteTable('reviews', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  productId: integer('product_id').notNull(),
  userId: integer('user_id').notNull(),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
})
```

## API Development

### Using the Database in API Routes
```typescript
// server/api/products/index.get.ts
export default defineEventHandler(async (event) => {
  const db = useDB()
  
  const products = await db
    .select()
    .from(tables.products)
    .where(eq(tables.products.isActive, true))
    .limit(20)
  
  return products
})
```

### Using KV Storage for Sessions
```typescript
// server/api/auth/session.post.ts
export default defineEventHandler(async (event) => {
  const kv = hubKV()
  const sessionId = generateId()
  
  await kv.put(`session:${sessionId}`, JSON.stringify({
    userId,
    createdAt: Date.now()
  }), {
    expirationTtl: 86400 // 24 hours
  })
  
  return { sessionId }
})
```

### Using R2 for File Storage
```typescript
// server/api/upload/image.post.ts
export default defineEventHandler(async (event) => {
  const blob = hubBlob()
  const form = await readFormData(event)
  const file = form.get('file') as File
  
  const { pathname } = await blob.put(
    `products/${Date.now()}-${file.name}`,
    file,
    {
      contentType: file.type,
      addRandomSuffix: false
    }
  )
  
  return { url: pathname }
})
```

## Deployment

### Deploy to NuxtHub (Recommended)
```bash
# Deploy to production
npm run deploy

# Deploy preview branch
npm run deploy:preview
```

### Manual Cloudflare Pages Deployment
```bash
# Build the application
npm run build

# Deploy to Cloudflare Pages
npx wrangler pages deploy .output/public --project-name=moldova-direct
```

### Connect Custom Domain

1. Go to Cloudflare Dashboard > Pages > Your Project
2. Click "Custom domains"
3. Add `moldovadirect.com` and `www.moldovadirect.com`
4. Follow DNS configuration instructions

## Performance Optimization

### Edge Caching Strategy
```typescript
// server/api/products/[id].get.ts
export default defineCachedEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const db = useDB()
  
  const product = await db
    .select()
    .from(tables.products)
    .where(eq(tables.products.id, parseInt(id)))
    .get()
  
  return product
}, {
  maxAge: 60 * 60, // Cache for 1 hour
  name: 'product-detail',
  swr: true // Stale-while-revalidate
})
```

### Image Optimization
```vue
<!-- Use Cloudflare Image Resizing -->
<template>
  <NuxtImg
    provider="cloudflare"
    :src="product.image"
    width="800"
    height="600"
    fit="cover"
    quality="85"
    format="auto"
  />
</template>
```

## Monitoring & Analytics

### Enable Cloudflare Analytics
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  hub: {
    analytics: true // Enables Cloudflare Web Analytics
  }
})
```

### Error Tracking with Sentry
```bash
npm install @sentry/vue
```

```typescript
// plugins/sentry.client.ts
import * as Sentry from '@sentry/vue'

export default defineNuxtPlugin((nuxtApp) => {
  Sentry.init({
    app: nuxtApp.vueApp,
    dsn: 'your-sentry-dsn',
    environment: process.env.NODE_ENV
  })
})
```

## Cost Analysis

### Free Tier Limits
- **Workers**: 100,000 requests/day
- **D1 Database**: 5GB storage, 5M rows read/day
- **KV Storage**: 100,000 reads/day, 1,000 writes/day
- **R2 Storage**: 10GB storage, 10M requests/month
- **Bandwidth**: Unlimited (within fair use)

### Estimated Monthly Costs

#### Startup (0-1000 orders/month)
- **Total**: $0 (within free tier)

#### Growth (1000-5000 orders/month)
- **Workers**: $5 (Paid plan)
- **D1**: $5 (if exceeding free tier)
- **R2**: $0.015/GB stored
- **Total**: ~$10-15/month

#### Scale (5000+ orders/month)
- **Workers**: $5 base + $0.50/million requests
- **D1**: $5 base + usage
- **R2**: Storage + request costs
- **Total**: ~$30-50/month

## Security Best Practices

### 1. Environment Variables
Never commit sensitive data. Use Cloudflare's secret management:
```bash
wrangler secret put STRIPE_SECRET_KEY
```

### 2. CORS Configuration
```typescript
// server/middleware/cors.ts
export default defineEventHandler((event) => {
  setHeaders(event, {
    'Access-Control-Allow-Origin': process.env.NUXT_PUBLIC_SITE_URL,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  })
})
```

### 3. Rate Limiting
```typescript
// server/middleware/rateLimit.ts
const attempts = new Map()

export default defineEventHandler(async (event) => {
  const ip = getClientIP(event)
  const key = `${ip}:${event.node.req.url}`
  
  const count = attempts.get(key) || 0
  if (count > 100) { // 100 requests per minute
    throw createError({
      statusCode: 429,
      statusMessage: 'Too Many Requests'
    })
  }
  
  attempts.set(key, count + 1)
  setTimeout(() => attempts.delete(key), 60000)
})
```

## Troubleshooting

### Common Issues

#### 1. D1 Database Connection Error
```bash
# Verify database binding
wrangler d1 list

# Check wrangler.toml configuration
```

#### 2. KV Namespace Not Found
```bash
# List KV namespaces
wrangler kv:namespace list

# Update binding in wrangler.toml
```

#### 3. Build Errors
```bash
# Clear cache and rebuild
rm -rf .nuxt .output node_modules/.cache
npm run build
```

### Debug Mode
```typescript
// Enable detailed logging
export default defineNuxtConfig({
  nitro: {
    debug: true
  }
})
```

## Migration from PostgreSQL

### Data Migration Script
```typescript
// scripts/migrate-to-d1.ts
import { drizzle as pgDrizzle } from 'drizzle-orm/postgres-js'
import { drizzle as d1Drizzle } from 'drizzle-orm/d1'
import postgres from 'postgres'

async function migrate() {
  // Connect to PostgreSQL
  const pgClient = postgres(process.env.PG_DATABASE_URL)
  const pgDb = pgDrizzle(pgClient)
  
  // Connect to D1
  const d1Db = d1Drizzle(hubDatabase())
  
  // Migrate products
  const products = await pgDb.select().from(pgSchema.products)
  for (const product of products) {
    await d1Db.insert(d1Schema.products).values(product)
  }
  
  console.log('Migration completed')
}
```

## Backup Strategy

### Automated Backups
```bash
# Create backup script
#!/bin/bash
wrangler d1 export moldova-direct-db --output=backups/db-$(date +%Y%m%d).sql
```

### Schedule with GitHub Actions
```yaml
name: Database Backup
on:
  schedule:
    - cron: '0 2 * * *' # Daily at 2 AM
jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Backup D1
        run: |
          npm install -g wrangler
          wrangler d1 export ${{ secrets.DB_NAME }} --output=backup.sql
      - name: Upload to R2
        run: |
          wrangler r2 object put backups/$(date +%Y%m%d).sql --file=backup.sql
```

## Support Resources

### Documentation
- [NuxtHub Docs](https://hub.nuxt.com/docs)
- [Cloudflare D1 Docs](https://developers.cloudflare.com/d1/)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Drizzle ORM Docs](https://orm.drizzle.team/)

### Community
- [NuxtHub Discord](https://discord.gg/nuxt)
- [Cloudflare Discord](https://discord.cloudflare.com)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/cloudflare-workers)

### Getting Help
1. Check the [NuxtHub FAQ](https://hub.nuxt.com/docs/faq)
2. Search [GitHub Issues](https://github.com/nuxt-hub/core/issues)
3. Ask in Discord community
4. Contact support@nuxt.com for NuxtHub-specific issues

## Next Steps

1. **Set up Cloudflare account** and create resources
2. **Configure environment variables**
3. **Run database migrations**
4. **Deploy to NuxtHub**
5. **Configure custom domain**
6. **Set up monitoring**
7. **Implement CI/CD pipeline**

---

*Last updated: November 2024*
*Version: 1.0.0*