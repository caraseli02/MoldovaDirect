---
status: pending
priority: p2
issue_id: "007"
tags: [documentation, developer-experience, api]
dependencies: []
---

# Missing Comprehensive API Documentation

## Problem Statement

The project has excellent architecture and feature documentation (50+ files), but lacks comprehensive API documentation for the 50+ API endpoints in the codebase. The DOCUMENTATION_INDEX.md lists "API Documentation: In Progress" but no structured API docs exist.

**Location:**
- Missing file: `docs/API_DOCUMENTATION.md`
- Mentioned in: `DOCUMENTATION_INDEX.md:231`
- API endpoints: `server/api/**/*.{get,post,put,patch,delete}.ts`

## Findings

- **Current State:** Developers must read source code to understand endpoints
- **Impact:** Slower onboarding, potential endpoint misuse, harder testing
- **Coverage Gap:** ~50+ endpoints across auth, admin, cart, checkout, products
- **Documentation Status:** Architecture ✅ | Testing ✅ | API ❌

**Endpoint Categories:**
1. Authentication (`/api/auth/*`) - 6 endpoints
2. Admin (`/api/admin/*`) - 20+ endpoints
3. Cart (`/api/cart/*`) - 5 endpoints
4. Checkout (`/api/checkout/*`) - 4 endpoints
5. Products (`/api/products/*`) - 8 endpoints
6. Search (`/api/search/*`) - 3 endpoints
7. Email Templates (`/api/admin/email-templates/*`) - 4 endpoints

## Proposed Solutions

### Option 1: Markdown API Documentation (Primary Solution)

Create comprehensive markdown documentation:

**Structure:**
```markdown
# Moldova Direct API Documentation

## Table of Contents
- [Authentication](#authentication)
- [Admin Endpoints](#admin-endpoints)
- [Cart & Checkout](#cart-checkout)
- [Products](#products)

## Authentication

### POST /api/auth/login
**Description:** Authenticate user with email/password

**Auth Required:** No

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "customer"
  },
  "session": {
    "access_token": "jwt...",
    "expires_at": 1234567890
  }
}
```

**Error Responses:**
- 401: Invalid credentials
- 429: Rate limit exceeded
- 500: Server error

**Rate Limits:** 5 requests per minute per IP
```

**Pros:**
- Quick to create (4-6 hours)
- Easy to maintain in version control
- Searchable in GitHub
- Integrates with existing docs

**Cons:**
- Manual updates required
- No interactive testing
- Not auto-generated from code

**Effort:** Medium (4-6 hours)
**Risk:** Low

### Option 2: OpenAPI/Swagger Specification (Long-term Solution)

Implement OpenAPI 3.0 specification with Swagger UI:

1. Add `@scalar/nuxt` or `nuxt-api-party` module
2. Generate OpenAPI spec from TypeScript types
3. Host interactive docs at `/api-docs`
4. Auto-generate client SDKs

**Pros:**
- Interactive testing interface
- Auto-generated from types
- Industry standard
- Client SDK generation

**Cons:**
- Initial setup time (8-10 hours)
- Learning curve for team
- Requires maintenance of annotations

**Effort:** Large (8-10 hours)
**Risk:** Medium

### Option 3: Hybrid Approach (Recommended)

Phase 1 (This week):
- Create markdown docs for critical endpoints (auth, admin, checkout)
- Document request/response formats
- Include authentication requirements

Phase 2 (Next month):
- Implement OpenAPI specification
- Migrate markdown docs to OpenAPI format
- Set up Swagger UI for interactive testing

**Pros:**
- Quick wins with markdown
- Long-term scalability with OpenAPI
- Gradual migration path

**Cons:**
- Duplicate effort during transition
- Need to maintain both temporarily

**Effort:** Medium → Large (6 hours + 8 hours)
**Risk:** Low

## Recommended Action

**PHASE 1 (This Week - 4-6 hours):**
1. Create `docs/API_DOCUMENTATION.md`
2. Document critical endpoints:
   - Authentication (login, logout, refresh, MFA)
   - Admin orders (list, update, bulk operations)
   - Checkout (create order, payment, inventory)
3. Include auth requirements, rate limits, error codes
4. Add examples for common use cases

**PHASE 2 (Next Month - 8-10 hours):**
5. Install OpenAPI tooling (`@scalar/nuxt`)
6. Annotate endpoint handlers with JSDoc/decorators
7. Generate OpenAPI specification
8. Host interactive docs at `/api-docs`
9. Archive markdown docs or convert to OpenAPI

## Technical Details

- **Affected Files:**
  - New: `docs/API_DOCUMENTATION.md`
  - Future: `openapi.yaml` or auto-generated
  - All files in `server/api/`

- **Related Components:**
  - All API endpoints
  - Type definitions in `types/`
  - Authentication middleware

- **Database Changes:** None

## Resources

- OpenAPI Specification: https://swagger.io/specification/
- Scalar Nuxt: https://github.com/scalar/scalar/tree/main/packages/nuxt
- Existing API endpoints: `server/api/`
- Example API docs: Stripe, Supabase, GitHub APIs

## Acceptance Criteria

**Phase 1 (Markdown Docs):**
- [ ] Created `docs/API_DOCUMENTATION.md`
- [ ] Documented all authentication endpoints with examples
- [ ] Documented critical admin endpoints (orders, users, email-templates)
- [ ] Documented checkout flow endpoints
- [ ] Included authentication requirements for each endpoint
- [ ] Documented rate limits where applicable
- [ ] Included error response formats and codes
- [ ] Added to DOCUMENTATION_INDEX.md
- [ ] Linked from README.md

**Phase 2 (OpenAPI - Future):**
- [ ] OpenAPI 3.0 spec generated or written
- [ ] Swagger UI accessible at `/api-docs`
- [ ] All endpoints documented in spec
- [ ] Interactive testing works for all endpoints
- [ ] Client SDK generation configured

## Work Log

### 2025-11-02 - Initial Discovery
**By:** Claude Triage System
**Actions:**
- Issue discovered during documentation review and triage
- Identified gap between excellent feature docs and missing API docs
- Categorized as P2 (important but not blocking)
- Estimated effort: Medium (4-6 hours for Phase 1)

**Learnings:**
- Documentation is comprehensive in most areas (architecture, testing, features)
- API documentation specifically called out as "In Progress" in index
- Over 50 endpoints exist without formal documentation
- Would significantly improve developer onboarding experience

## Notes

**Priority Rationale:**
- P2 (not P1) because existing code is well-structured and readable
- TypeScript types provide some self-documentation
- More critical for external developers or API consumers
- Should be completed after P0/P1 security issues resolved

**Developer Experience Impact:**
- Current: Developers read source code (manageable but slow)
- With docs: Much faster endpoint discovery and testing
- With OpenAPI: Interactive testing and auto-generated clients

**Quick Win Opportunity:**
- Start with markdown docs for highest-traffic endpoints
- Can be completed in single focused work session
- Immediate value for team

Source: Documentation triage session on 2025-11-02
Related GitHub Issues: None (documentation gap identified in triage)
