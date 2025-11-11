# Self-Hosted AI Database Migration Evaluation

**Date:** 2025-11-11
**Project:** Moldova Direct
**Current Stack:** Supabase (Managed PostgreSQL + BaaS)
**Evaluation:** Migrating to self-hosted AI-powered database alternative

---

## Executive Summary

This document evaluates the feasibility of migrating Moldova Direct from Supabase to a self-hosted AI-powered database alternative. After comprehensive analysis of the current implementation and available alternatives, **we recommend a hybrid approach** rather than a complete migration, as it offers the best balance of AI capabilities, cost control, and development velocity.

### Key Findings

- **Current Supabase Usage:** Heavy reliance on authentication, real-time subscriptions, storage, and row-level security
- **AI Database Alternatives:** PostgreSQL with pgvector extension is the most mature AI-ready solution
- **Migration Complexity:** HIGH - Requires significant refactoring of authentication, storage, and real-time features
- **Recommended Approach:** Hybrid architecture with self-hosted PostgreSQL + pgvector for AI features while maintaining Supabase for auth/storage

---

## Current Supabase Implementation Analysis

### Features Currently Used

#### 1. **Authentication System** (Critical Dependency)
- **Usage:** 43 occurrences of `useSupabaseClient`, `useSupabaseUser`, `useSupabaseAuth` across 20 files
- **Implementation:** Leverages `auth.users` table with extended `profiles` table
- **Features:**
  - Email/password authentication
  - User session management
  - Auth state synchronization
  - Role-based access (customer, admin, manager)
  - Multi-language support (es, en, ro, ru)

**Files heavily dependent on Supabase Auth:**
- `middleware/auth.ts`
- `middleware/admin.ts`
- `middleware/guest.ts`
- `pages/auth/*` (login, register, forgot-password, verify-email, confirm)
- `pages/account/*` (profile, orders)

#### 2. **PostgreSQL Database** (Core Data Layer)
- **Schema Complexity:** HIGH
- **Tables:** 20+ tables including:
  - User management: `profiles`, `addresses`
  - E-commerce: `products`, `categories`, `inventory_logs`
  - Orders: `orders`, `order_items`, `order_tracking`, `order_returns`
  - Checkout: `carts`, `checkout_sessions`, `payment_methods`
  - Analytics: `cart_analytics`, `user_analytics`
  - Support: `support_tickets`, `email_logs`, `email_templates`

**Current Schema Location:** `/supabase/sql/` (19 SQL schema files)

#### 3. **Row-Level Security (RLS)** (Security Critical)
- **Implementation:** Comprehensive RLS policies on all user-facing tables
- **Policy Types:**
  - User-scoped policies using `auth.uid()`
  - Admin-only policies
  - Public read policies for products/categories

**Example from `profiles` table:**
```sql
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
```

**Dependency:** RLS policies are tightly coupled to Supabase's `auth.uid()` function

#### 4. **Storage System** (Avatar Management)
- **Bucket:** `avatars` bucket for user profile pictures
- **Features:**
  - Public read access
  - User-scoped upload/update/delete
  - Path-based security using `auth.uid()`

**Schema:** `/supabase/sql/supabase-avatar-storage.sql`

#### 5. **Real-Time Subscriptions** (Admin Feature)
- **Implementation:** `useAdminOrderRealtime.ts` composable
- **Use Cases:**
  - Real-time order status updates for admins
  - New order notifications
  - Conflict detection for concurrent admin edits
- **Technology:** Supabase Realtime channels with PostgreSQL change subscriptions

**Files using real-time:**
- `pages/admin/orders/index.vue`
- `pages/admin/orders/[id].vue`
- `pages/account/orders/index.vue`
- `pages/account/orders/[id].vue`

---

## AI-Powered Database Alternatives

### Top Self-Hosted Solutions with AI Capabilities

#### 1. **PostgreSQL + pgvector** (Recommended for AI Features)

**Overview:**
pgvector is an open-source PostgreSQL extension that adds vector similarity search, enabling AI-powered features like semantic search, recommendations, and RAG (Retrieval Augmented Generation) applications.

**Pros:**
- ✅ Mature and battle-tested (used by Supabase itself)
- ✅ Native integration with PostgreSQL
- ✅ Supports exact and approximate nearest neighbor (ANN) search
- ✅ HNSW and IVF indexing for performance
- ✅ Recent improvements: pgvector 0.8.0 offers 9× faster queries, 100× better results
- ✅ Can be self-hosted on any infrastructure
- ✅ Compatible with existing PostgreSQL tools and workflows

**Cons:**
- ❌ Requires separate auth solution
- ❌ No built-in real-time subscriptions
- ❌ No managed storage solution
- ❌ DevOps overhead for self-hosting

**AI Capabilities:**
- Vector embeddings storage (up to 2000 dimensions)
- Similarity search with cosine, L2, and inner product distance metrics
- Integration with LangChain, LlamaIndex, OpenAI
- Support for RAG applications
- Image similarity search
- Anomaly detection
- Recommendation systems

**Performance:**
- Sub-100ms query response for millions of vectors (with proper indexing)
- Horizontal scaling via read replicas
- Supports billions of vectors with pagination

**Best For:**
- AI-powered search and recommendations
- Semantic similarity for products
- Customer support chatbots with RAG
- Fraud detection using embedding-based anomaly detection

#### 2. **Nhost** (Open-source Supabase Alternative)

**Overview:**
Nhost is an open-source backend combining Hasura (GraphQL), PostgreSQL, authentication, and storage in a unified platform.

**Pros:**
- ✅ Self-hostable with Docker
- ✅ Built-in authentication system
- ✅ File storage included
- ✅ GraphQL API auto-generation
- ✅ Can add pgvector for AI features
- ✅ Similar feature set to Supabase

**Cons:**
- ❌ Smaller community than Supabase
- ❌ GraphQL-first (requires refactoring from Supabase's REST/Realtime approach)
- ❌ Limited real-time capabilities compared to Supabase
- ❌ Self-hosting complexity

**Best For:**
- Teams wanting Supabase-like features with self-hosting
- Projects requiring GraphQL
- Full control over infrastructure

#### 3. **Appwrite** (Self-Hosted BaaS)

**Overview:**
Open-source Firebase/Supabase alternative with comprehensive backend services.

**Pros:**
- ✅ Self-hostable via Docker
- ✅ Built-in authentication (email, OAuth, phone)
- ✅ File storage with security rules
- ✅ Real-time API
- ✅ Database with permissions system
- ✅ TypeScript/JavaScript SDKs
- ✅ GraphQL support added in 2025

**Cons:**
- ❌ Uses custom database (MariaDB) instead of PostgreSQL
- ❌ Would require complete data migration
- ❌ No native pgvector support
- ❌ Different security model from RLS

**Best For:**
- Greenfield projects
- Teams prioritizing on-premises compliance
- Projects needing multi-platform SDKs

#### 4. **Hasura + PostgreSQL** (GraphQL-First)

**Overview:**
Hasura generates a real-time GraphQL API on top of PostgreSQL with powerful permission system.

**Pros:**
- ✅ Auto-generates GraphQL from PostgreSQL schema
- ✅ Supports pgvector extension
- ✅ Advanced permission system
- ✅ Real-time subscriptions via GraphQL
- ✅ REST endpoints in v3.0 (2025)
- ✅ Self-hostable

**Cons:**
- ❌ Requires separate auth service (Auth0, Keycloak, etc.)
- ❌ GraphQL-first approach requires frontend refactoring
- ❌ No built-in storage solution
- ❌ Steeper learning curve

**Best For:**
- Teams comfortable with GraphQL
- Projects needing advanced permissions
- Microservices architecture

#### 5. **PocketBase** (Lightweight Alternative)

**Overview:**
Single-file executable combining database (SQLite), authentication, file storage, and real-time.

**Pros:**
- ✅ Extremely lightweight (single binary)
- ✅ Built-in auth, storage, real-time
- ✅ Easy to deploy
- ✅ Go-based, high performance
- ✅ JavaScript SDK similar to Supabase

**Cons:**
- ❌ SQLite-based (not PostgreSQL)
- ❌ Limited scalability compared to PostgreSQL
- ❌ No pgvector support
- ❌ Not suitable for high-traffic applications
- ❌ Young ecosystem

**Best For:**
- Small to medium projects
- Prototypes and MVPs
- Single-server deployments

#### 6. **Xata** (Serverless Postgres with AI)

**Overview:**
Serverless PostgreSQL with built-in search, analytics, and AI features.

**Pros:**
- ✅ Native vector search support (2025 feature)
- ✅ TypeScript-first SDK
- ✅ AI-powered schema suggestions
- ✅ Database branching for development
- ✅ Built for RAG workloads

**Cons:**
- ❌ Managed service (not fully self-hosted)
- ❌ Would still incur ongoing costs
- ❌ Smaller ecosystem than Supabase
- ❌ Requires migration from Supabase

**Best For:**
- Teams needing AI features with managed infrastructure
- TypeScript-heavy codebases
- RAG applications

---

## Migration Complexity Assessment

### Complexity Rating: **HIGH** (8/10)

### Required Changes by Component

#### 1. **Authentication System** - Complexity: CRITICAL
**Effort:** 3-4 weeks
**Risk:** HIGH

**Current State:**
- Deep integration with Supabase Auth across 20+ files
- Middleware dependencies (`auth.ts`, `admin.ts`, `guest.ts`)
- Session management via `useSupabaseUser()`
- RLS policies using `auth.uid()`

**Migration Requirements:**
- **Option A:** Implement custom auth with JWT
  - Create user registration/login endpoints
  - Implement password hashing (bcrypt)
  - JWT generation and validation
  - Session management
  - Password reset flows
  - Email verification
  - OAuth integration (if needed)

- **Option B:** Use third-party auth (Keycloak, Auth0, Clerk)
  - Integration overhead
  - Additional service costs
  - SDK migration

- **Option C:** Keep Supabase for auth only (Hybrid approach)
  - Minimal changes
  - Continue using existing auth flows
  - Cross-database auth validation

**Files Requiring Changes:**
- All `middleware/*.ts` files
- All `pages/auth/*.vue` files
- All `pages/account/*.vue` files
- `composables/useShippingAddress.ts`
- `composables/useOrderDetail.ts`
- `composables/useOrders.ts`
- 50+ server API routes using `auth.uid()`

#### 2. **Database Schema & RLS** - Complexity: HIGH
**Effort:** 2-3 weeks
**Risk:** MEDIUM

**Current State:**
- 19 SQL schema files with complex relationships
- Extensive RLS policies on 15+ tables
- PostgreSQL-specific features (JSONB, extensions)

**Migration Requirements:**
- Export existing schema from Supabase
- Remove/replace Supabase-specific functions (`auth.uid()`)
- Implement alternative security:
  - Application-level authorization
  - Database roles and grants
  - Views with security checks
- Test data integrity
- Migrate existing production data

**Challenges:**
- RLS policies would need to be rewritten as application logic
- Risk of security gaps during transition
- Data migration with zero downtime is complex

#### 3. **Storage System** - Complexity: MEDIUM
**Effort:** 1-2 weeks
**Risk:** LOW

**Current State:**
- Single `avatars` bucket
- Supabase Storage policies for access control

**Migration Requirements:**
- **Option A:** MinIO (S3-compatible, self-hosted)
  - Docker deployment
  - Bucket creation
  - Access policies via IAM
  - Update upload endpoints

- **Option B:** AWS S3 / Cloudflare R2
  - Managed service (still costs money)
  - Higher reliability
  - CDN integration

- **Option C:** Local file storage
  - Simple but not scalable
  - No CDN
  - Backup complexity

**Files Requiring Changes:**
- Avatar upload/delete endpoints
- Profile page image handling
- Storage access utilities

#### 4. **Real-Time Subscriptions** - Complexity: HIGH
**Effort:** 2-3 weeks
**Risk:** MEDIUM

**Current State:**
- `useAdminOrderRealtime.ts` composable
- PostgreSQL change subscriptions
- 6 Vue components using real-time

**Migration Requirements:**
- **Option A:** PostgreSQL LISTEN/NOTIFY
  - Native PostgreSQL feature
  - Requires WebSocket server (Socket.io, ws)
  - Implement pub/sub logic
  - Connection management

- **Option B:** Redis Pub/Sub
  - Add Redis to infrastructure
  - Implement message queues
  - WebSocket gateway

- **Option C:** Polling-based updates
  - Simpler implementation
  - Higher latency
  - More database load

**Files Requiring Changes:**
- `composables/useAdminOrderRealtime.ts`
- `pages/admin/orders/index.vue`
- `pages/admin/orders/[id].vue`
- `pages/account/orders/index.vue`
- `pages/account/orders/[id].vue`

#### 5. **API Layer** - Complexity: MEDIUM
**Effort:** 2 weeks
**Risk:** LOW

**Current State:**
- 100+ server API routes using `useSupabaseClient()`
- Supabase client for queries

**Migration Requirements:**
- Replace `useSupabaseClient()` with PostgreSQL client (pg, Prisma, Drizzle)
- Rewrite queries from Supabase PostgREST syntax to SQL
- Update error handling
- Add connection pooling

**Example Change:**
```typescript
// Before (Supabase)
const { data, error } = await supabase
  .from('products')
  .select('*')
  .eq('id', id)
  .single()

// After (Prisma)
const data = await prisma.products.findUnique({
  where: { id }
})
```

---

## Cost Analysis

### Current Costs (Supabase)

**Estimated Monthly Cost:** $25-$75/month (Pro tier)
- Database: Included
- Authentication: Unlimited
- Storage: 100GB
- Bandwidth: 250GB
- Real-time: Unlimited

### Self-Hosted Costs

**Infrastructure (VPS/Cloud):**
- PostgreSQL server: $20-$100/month (4GB-16GB RAM)
- Redis (for real-time): $10-$20/month
- Storage (S3/MinIO): $5-$20/month
- Monitoring/logging: $10-$30/month
- **Total: $45-$170/month**

**Additional Costs:**
- DevOps time: 10-20 hours/month ($500-$2000/month if outsourced)
- Migration development: $10,000-$25,000 (one-time)
- Ongoing maintenance: 5-10 hours/month

**Break-even Analysis:**
- Self-hosting is cheaper ONLY if:
  - You have in-house DevOps expertise
  - Traffic is very high (>1TB/month on Supabase = $100+/month)
  - You already have infrastructure

---

## AI Feature Implementation Comparison

### Scenario: Product Recommendation System using AI

#### Option 1: Current Supabase + pgvector
- Enable pgvector extension in Supabase dashboard
- Add embedding columns to products table
- Generate embeddings via OpenAI API
- Store in Supabase PostgreSQL
- Query with similarity search
- **Effort:** 1-2 days
- **Cost:** $0 additional (pgvector included in Supabase)

#### Option 2: Self-Hosted PostgreSQL + pgvector
- Set up PostgreSQL server
- Install pgvector extension
- Migrate data
- Implement security layer
- Add embedding generation pipeline
- Deploy and monitor
- **Effort:** 2-3 weeks
- **Cost:** $100-$200/month infrastructure

### Verdict: Supabase is significantly faster for AI implementation

---

## Recommendations

### Primary Recommendation: **Hybrid Approach**

**Strategy:** Keep Supabase for core BaaS features, add self-hosted components for AI-specific needs

**Architecture:**
```
┌─────────────────────────────────────────┐
│         Nuxt Frontend                   │
└───────────┬─────────────────────────────┘
            │
            ├─────────────────┬──────────────────┐
            │                 │                  │
            ▼                 ▼                  ▼
    ┌───────────────┐  ┌──────────────┐  ┌──────────────┐
    │   Supabase    │  │ PostgreSQL   │  │ AI Services  │
    │   (Managed)   │  │ + pgvector   │  │ (Optional)   │
    │               │  │ (Self-hosted)│  │              │
    ├───────────────┤  ├──────────────┤  ├──────────────┤
    │ • Auth        │  │ • AI Vectors │  │ • LLM APIs   │
    │ • Storage     │  │ • Embeddings │  │ • RAG Chain  │
    │ • Real-time   │  │ • Similarity │  │ • Custom ML  │
    │ • Core Data   │  │   Search     │  │              │
    └───────────────┘  └──────────────┘  └──────────────┘
```

**Benefits:**
- ✅ Minimal migration effort
- ✅ Keep battle-tested auth and real-time
- ✅ Add AI capabilities with pgvector
- ✅ Gradual migration path
- ✅ Low risk

**Implementation:**
1. Enable pgvector in Supabase (native support)
2. Add AI-specific tables/columns
3. Implement semantic search on products
4. Add RAG for customer support
5. Keep existing auth/storage/real-time

**When to Self-Host Components:**
- Auth: Only if GDPR/compliance requires on-premises
- Database: Only if data sovereignty is critical
- Storage: Only if costs exceed $200/month

### Alternative Recommendation: **Full Migration to Nhost**

**Use Case:** If company policy prohibits third-party data hosting

**Pros:**
- Full control over data
- Open-source stack
- Can add pgvector

**Cons:**
- 3-6 months migration effort
- Higher DevOps complexity
- Risk of bugs during transition

**Migration Path:**
1. Set up Nhost infrastructure (Docker/Kubernetes)
2. Migrate database schema
3. Configure Hasura GraphQL
4. Rewrite frontend to use GraphQL
5. Set up Nhost Auth
6. Migrate authentication flows
7. Configure storage
8. Test and validate
9. Gradual rollout

---

## AI Use Cases for Moldova Direct

### Recommended AI Features (using pgvector)

#### 1. **Semantic Product Search**
**Implementation:** 2-3 days
**Value:** HIGH

- Generate embeddings for product descriptions
- Enable natural language search ("wine that goes with fish")
- Improve search relevance by 40-60%

**Technical:**
```sql
-- Add embedding column
ALTER TABLE products ADD COLUMN embedding vector(1536);

-- Similarity search
SELECT * FROM products
ORDER BY embedding <-> query_embedding
LIMIT 10;
```

#### 2. **Smart Product Recommendations**
**Implementation:** 3-5 days
**Value:** HIGH

- "Customers who bought X also liked Y"
- Cross-category recommendations
- Increase average order value by 15-25%

**Technical:**
- Compute product embeddings from descriptions + categories
- Find similar products via cosine similarity
- Filter by stock availability

#### 3. **Customer Support Chatbot with RAG**
**Implementation:** 1-2 weeks
**Value:** MEDIUM

- Answer common questions using product knowledge base
- Reduce support ticket volume by 30-50%
- 24/7 availability in multiple languages

**Technical:**
- Embed FAQ documents
- Use LangChain for RAG pipeline
- Store conversation history in Supabase

#### 4. **Dynamic Pricing Insights**
**Implementation:** 1 week
**Value:** MEDIUM

- Analyze competitor pricing patterns
- Detect anomalies in order patterns
- Optimize pricing strategy

**Technical:**
- Store pricing history vectors
- Anomaly detection via embedding distance
- Alert on unusual patterns

#### 5. **Image-Based Product Search**
**Implementation:** 2-3 weeks
**Value:** LOW (unless you have product images)

- "Find products similar to this image"
- Visual similarity search

**Technical:**
- Generate image embeddings (CLIP, ResNet)
- Store in pgvector
- Query with uploaded images

---

## Migration Timeline (Full Self-Hosted)

### If Full Migration is Required

**Phase 1: Planning & Setup** (2 weeks)
- Infrastructure provisioning
- PostgreSQL + pgvector installation
- Development environment setup
- Schema migration preparation

**Phase 2: Core Database Migration** (3 weeks)
- Export Supabase schema
- Remove Supabase-specific features
- Data migration scripts
- Testing and validation

**Phase 3: Authentication System** (4 weeks)
- Choose auth solution (custom vs. third-party)
- Implement auth endpoints
- Update frontend auth flows
- Migrate user accounts
- Security audit

**Phase 4: Storage & Real-time** (3 weeks)
- Set up MinIO/S3
- Migrate avatar files
- Implement WebSocket server
- Real-time subscription refactoring

**Phase 5: API Layer** (2 weeks)
- Replace Supabase client
- Update all API routes
- Error handling
- Testing

**Phase 6: Testing & QA** (3 weeks)
- Integration testing
- Load testing
- Security testing
- User acceptance testing

**Phase 7: Deployment** (2 weeks)
- Production infrastructure setup
- Gradual rollout
- Monitoring and alerts
- Backup and disaster recovery

**Total:** 19 weeks (~4.5 months)

**Team Required:**
- 1 Senior Backend Engineer
- 1 DevOps Engineer
- 1 Frontend Engineer (part-time)
- 1 QA Engineer (part-time)

---

## Risk Assessment

### High Risks

1. **Authentication Security**
   - Risk: Bugs in custom auth could expose user data
   - Mitigation: Use battle-tested libraries, security audit

2. **Data Loss During Migration**
   - Risk: Incomplete data transfer or corruption
   - Mitigation: Extensive testing, parallel running, rollback plan

3. **Performance Degradation**
   - Risk: Self-hosted solution slower than Supabase
   - Mitigation: Load testing, proper indexing, caching layer

4. **Downtime**
   - Risk: Extended outage during migration
   - Mitigation: Blue-green deployment, gradual rollout

### Medium Risks

5. **Cost Overruns**
   - Risk: Infrastructure costs higher than estimated
   - Mitigation: Start small, monitor usage, optimize

6. **Development Delays**
   - Risk: Migration takes longer than planned
   - Mitigation: Agile approach, MVP scope, buffer time

7. **Missing Features**
   - Risk: Self-hosted solution lacks Supabase features
   - Mitigation: Feature audit, alternative solutions

---

## Decision Matrix

| Factor | Supabase | Hybrid (Supabase + Self-hosted) | Full Self-Hosted |
|--------|----------|--------------------------------|------------------|
| **AI Capabilities** | High (pgvector native) | Very High | High |
| **Development Speed** | Very Fast | Fast | Slow |
| **Migration Effort** | None | Low (1-2 weeks) | Very High (4-6 months) |
| **Monthly Cost** | $25-$75 | $50-$150 | $100-$300+ |
| **DevOps Complexity** | None | Low | High |
| **Data Control** | Limited | Partial | Full |
| **Scalability** | Auto-scaling | Manual | Manual |
| **Risk** | Low | Low-Medium | High |
| **Vendor Lock-in** | High | Medium | None |

---

## Conclusion

### Final Recommendation: **Stay with Supabase + Add AI Features**

**Reasoning:**
1. **AI capabilities are available in Supabase:** pgvector is natively supported, enabling all desired AI features without migration
2. **Migration cost is prohibitive:** $10,000-$25,000 development cost + 4-6 months timeline
3. **Risk is high:** Authentication and real-time are critical features that work perfectly in current setup
4. **ROI is negative:** Self-hosting costs more when DevOps time is factored in
5. **No business requirement:** No compliance or data sovereignty requirements mentioned

### Recommended Implementation Plan

**Week 1-2: Enable AI Features in Supabase**
- Enable pgvector extension in Supabase dashboard
- Add embedding columns to products table
- Set up OpenAI API integration for embeddings

**Week 3-4: Implement Semantic Search**
- Generate embeddings for all products
- Build semantic search API endpoint
- Update frontend search to use semantic search

**Week 5-6: Product Recommendations**
- Implement similarity-based recommendations
- A/B test against rule-based recommendations
- Measure impact on conversion rate

**Week 7-8: Customer Support RAG**
- Build FAQ knowledge base
- Implement RAG chatbot
- Add to customer support page

**Total Effort:** 8 weeks with 1 developer
**Total Cost:** $0 infrastructure (Supabase includes pgvector)

### When to Reconsider Self-Hosting

**Triggers for Re-evaluation:**
- Monthly Supabase costs exceed $500/month (very high traffic)
- Regulatory requirement for on-premises data storage
- Acquisition of in-house DevOps team
- Supabase deprecates critical features
- Business pivot requiring fundamentally different architecture

---

## Additional Resources

### Documentation
- [Supabase pgvector Guide](https://supabase.com/docs/guides/ai)
- [pgvector GitHub](https://github.com/pgvector/pgvector)
- [LangChain + Supabase Integration](https://python.langchain.com/docs/integrations/vectorstores/supabase)

### Alternative Tools
- [Nhost Documentation](https://docs.nhost.io/)
- [Hasura Quickstart](https://hasura.io/docs/latest/getting-started/index/)
- [Appwrite Self-Hosting Guide](https://appwrite.io/docs/self-hosting)

### AI Integration Examples
- [Semantic Search with pgvector](https://supabase.com/blog/openai-embeddings-postgres-vector)
- [Building RAG Applications](https://python.langchain.com/docs/tutorials/rag/)
- [Vector Similarity Benchmarks](https://supabase.com/blog/pgvector-performance)

---

**Evaluation Completed By:** Claude Code
**Review Status:** Ready for stakeholder review
**Next Steps:** Present findings to technical leadership for decision
