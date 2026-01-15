# AI-Era Documentation Proposal - Moldova Direct

## Overview

[Add high-level overview here]


**Date**: January 14, 2026  
**Status**: Proposal  
**Priority**: High - Future-Proofing Documentation

---

## The Problem: Documentation for AI Assistants

You're absolutely right to think about this! When AI writes or modifies code, **you** (the human) need to understand:
- What the AI changed and why
- How the system works now
- What context the AI had when making decisions
- How to guide the AI better next time

**Current Issue**: Our docs are optimized for humans reading linearly, not for:
- AI assistants understanding the codebase
- Humans understanding AI-generated code
- Quick context retrieval for AI tools
- Maintaining context as the project grows

---

## Research Summary: AI-Friendly Documentation (2024-2025)

### Key Findings

#### 1. **The Context Crisis**
- 65% of developers experience missing context during refactoring
- 60% struggle with context during test generation
- AI tools rely entirely on available context (unlike humans who accumulate knowledge)
- **Problem**: "Context rot" - AI loses understanding as codebase grows

#### 2. **llms.txt Standard** (September 2024)
New web standard for AI-friendly documentation:
- Markdown file at `/llms.txt` in project root
- Provides structured overview for LLMs
- Links to detailed documentation
- Think "sitemap.xml for AI"

#### 3. **Context Engineering > Prompt Engineering**
- Focus shifted from crafting perfect prompts to providing systematic context
- AI needs: architecture, patterns, conventions, dependencies
- Documentation should be machine-readable AND human-readable

#### 4. **Five Core Practices for LLM-Ready Docs**
1. **Consistent heading hierarchy** - AI navigates by structure
2. **Avoid vague pronouns** - "it", "this", "that" confuse AI
3. **Text alternatives for media** - Describe diagrams, screenshots
4. **Consistent terminology** - Same concept = same word
5. **Properly formatted code** - Clear language tags, complete examples

---

## Proposed Solution: Dual-Layer Documentation

### Layer 1: Human-Friendly (Diátaxis Structure)
```
docs/
├── tutorials/      # Learning-oriented
├── how-to/        # Problem-oriented
├── reference/     # Information-oriented
└── explanation/   # Understanding-oriented
```

### Layer 2: AI-Friendly (Context Files)

```
/
├── llms.txt                          # AI entry point (NEW)
├── .cursorrules                      # Cursor AI rules (NEW)
├── .github/
│   └── copilot-instructions.md      # GitHub Copilot context (NEW)
│
└── docs/
    ├── ai-context/                   # AI-specific docs (NEW)
    │   ├── AGENTS.md                # Project context for AI
    │   ├── ARCHITECTURE_SUMMARY.md  # High-level system design
    │   ├── PATTERNS.md              # Code patterns & conventions
    │   ├── DEPENDENCIES.md          # Dependency graph
    │   └── CONVENTIONS.md           # Naming, structure, style
    │
    └── [existing structure]
```

---

## Implementation: The llms.txt File

### What is llms.txt?

A markdown file at your project root that gives AI assistants a structured overview of your project.

**Example for Moldova Direct:**

```markdown
# Moldova Direct

> E-commerce platform for authentic Moldovan food and wine products. Built with Nuxt 4, Vue 3, Supabase, and Stripe. Multi-language support (ES/EN/RO/RU).

## Project Overview

- **Stack**: Nuxt 4.2.2, Vue 3.5, TypeScript, Supabase, Stripe
- **Architecture**: SSR/CSR hybrid, modular monolith
- **State**: Pinia stores with TypeScript
- **Auth**: Supabase Auth with MFA for admins
- **Payments**: Stripe (webhooks implemented)
- **Testing**: Playwright E2E, Vitest unit tests

## Core Documentation

- [Architecture Overview](docs/ai-context/ARCHITECTURE_SUMMARY.md): System design and key decisions
- [Code Patterns](docs/ai-context/PATTERNS.md): How we structure code
- [API Reference](docs/reference/api/README.md): All API endpoints
- [Authentication](docs/architecture/AUTHENTICATION_ARCHITECTURE.md): Auth flow and security
- [Cart System](docs/architecture/CART_SYSTEM_ARCHITECTURE.md): Shopping cart internals
- [Checkout Flow](docs/architecture/CHECKOUT_FLOW.md): Multi-step checkout process

## Development Guides

- [Getting Started](docs/tutorials/01-getting-started.md): Setup development environment
- [Testing Guide](docs/guides/TESTING.md): How to write and run tests
- [Deployment](docs/guides/DEPLOYMENT_GUIDE.md): Deploy to production

## Code Conventions

- [TypeScript Patterns](docs/ai-context/PATTERNS.md#typescript): Type safety guidelines
- [Vue 3 Patterns](docs/ai-context/PATTERNS.md#vue3): Component structure
- [Nuxt 4 Patterns](docs/ai-context/PATTERNS.md#nuxt4): Server routes, composables
- [Testing Patterns](docs/ai-context/PATTERNS.md#testing): E2E and unit test structure

## Key Concepts

- **Modular Stores**: Cart and auth stores split into focused modules
- **Dual Persistence**: Cookie + localStorage for cart reliability
- **Server-Side Validation**: All prices verified server-side
- **Atomic Operations**: Inventory updates in single transaction
- **Progressive Enhancement**: Works without JavaScript

## Optional

- [Codebase Audit Report](docs/CODEBASE_AUDIT_REPORT.md): Detailed code quality assessment
- [Architecture Review Archive](docs/archive/architecture-reviews/): Historical reviews
- [Visual Regression Tests](docs/testing/VISUAL-REGRESSION-SUMMARY.md): Screenshot testing
```

**Benefits**:
- ✅ AI gets project overview in seconds
- ✅ Consistent context across all AI tools
- ✅ Humans can read it too (it's markdown!)
- ✅ Easy to maintain (one file)

---

## Implementation: AGENTS.md File

### What is AGENTS.md?

Detailed context specifically for AI coding agents. More technical than llms.txt.

**Example Structure:**

```markdown
# Moldova Direct - AI Agent Context

## Project Identity

**Name**: Moldova Direct  
**Type**: E-commerce Platform  
**Domain**: Authentic Moldovan food and wine  
**Target Market**: Spain (primary), expanding to EU

## Technical Stack

### Frontend
- **Framework**: Nuxt 4.2.2 (Vue 3.5 Composition API)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 with CSS variables
- **State**: Pinia stores (modular architecture)
- **UI**: Custom components (migrated from shadcn-vue)

### Backend
- **Runtime**: Nitro (Nuxt server)
- **Database**: Supabase PostgreSQL with RLS
- **Auth**: Supabase Auth (JWT + MFA for admins)
- **Payments**: Stripe (webhooks implemented)
- **Email**: Resend for transactional emails

### Infrastructure
- **Hosting**: Vercel (edge functions)
- **CI/CD**: GitHub Actions
- **Testing**: Playwright (E2E), Vitest (unit)
- **Monitoring**: Vercel Analytics

## Architecture Patterns

### State Management
```typescript
// Modular store pattern (PREFERRED)
stores/
├── cart/
│   ├── index.ts      // Main coordinator
│   ├── core.ts       // State & operations
│   ├── persistence.ts // Storage logic
│   └── types.ts      // TypeScript definitions
```

### API Routes
```typescript
// Server route pattern (REQUIRED)
export default defineEventHandler(async (event) => {
  // 1. Validate origin (CSRF protection)
  const originResult = validateOrigin(event)
  if (!originResult.valid) {
    throw createError({ statusCode: 403 })
  }
  
  // 2. Get authenticated user
  const user = await getUser(event)
  
  // 3. Validate input
  const body = await readBody(event)
  
  // 4. Server-side validation (CRITICAL)
  // Never trust client prices!
  
  // 5. Return response
  return { success: true, data }
})
```

### Component Structure
```vue
<!-- Vue 3 Composition API pattern (PREFERRED) -->
<script setup lang="ts">
// 1. Props with TypeScript
interface Props {
  product: Product
  quantity?: number
}
const props = withDefaults(defineProps<Props>(), {
  quantity: 1
})

// 2. Emits with types
const emit = defineEmits<{
  add: [product: Product, quantity: number]
}>()

// 3. Composables
const cart = useCart()
const { t } = useI18n()

// 4. Reactive state
const loading = ref(false)

// 5. Methods
async function handleAdd() {
  loading.value = true
  try {
    await cart.addItem(props.product, props.quantity)
    emit('add', props.product, props.quantity)
  } finally {
    loading.value = false
  }
}
</script>
```

## Critical Security Rules

### NEVER Do This
```typescript
// ❌ WRONG: Trust client prices
const total = body.subtotal + body.shipping

// ❌ WRONG: Direct database access without validation
await supabase.from('orders').insert({ total: body.total })

// ❌ WRONG: Skip CSRF validation
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  // ... process without validation
})
```

### ALWAYS Do This
```typescript
// ✅ CORRECT: Verify prices server-side
const { data: product } = await supabase
  .from('products')
  .select('price_eur')
  .eq('id', productId)
  .single()

const serverTotal = product.price_eur * quantity

// ✅ CORRECT: Validate origin
const originResult = validateOrigin(event)
if (!originResult.valid) {
  throw createError({ statusCode: 403 })
}

// ✅ CORRECT: Use atomic operations
await supabase.rpc('create_order_with_inventory', {
  order_data,
  order_items_data
})
```

## Code Conventions

### Naming
- **Files**: kebab-case (`user-profile.vue`, `create-order.post.ts`)
- **Components**: PascalCase (`UserProfile`, `ProductCard`)
- **Composables**: camelCase with `use` prefix (`useCart`, `useAuth`)
- **Types**: PascalCase (`Product`, `CartItem`, `OrderData`)
- **Constants**: SCREAMING_SNAKE_CASE (`MAX_CART_ITEMS`, `API_BASE_URL`)

### File Organization
```
components/
├── ui/              # Reusable UI components
├── checkout/        # Feature-specific components
└── admin/           # Admin-only components

composables/
├── useCart.ts       # Business logic
├── useAuth.ts       # Authentication
└── useToast.ts      # UI utilities

server/
├── api/             # API endpoints
├── utils/           # Server utilities
└── middleware/      # Server middleware
```

### Testing
```typescript
// E2E test pattern (Playwright)
test('user can add product to cart', async ({ page }) => {
  await page.goto('/products/wine-1')
  await page.click('[data-testid="add-to-cart"]')
  await expect(page.locator('[data-testid="cart-count"]')).toHaveText('1')
})

// Unit test pattern (Vitest)
describe('useCart', () => {
  it('adds item to cart', async () => {
    const { addItem, items } = useCart()
    await addItem(mockProduct, 2)
    expect(items.value).toHaveLength(1)
    expect(items.value[0].quantity).toBe(2)
  })
})
```

## Common Tasks

### Adding a New API Endpoint
1. Create file: `server/api/[feature]/[action].post.ts`
2. Add CSRF validation
3. Validate input with Zod schema
4. Use service role client for database access
5. Return typed response
6. Add tests

### Adding a New Component
1. Create file: `components/[feature]/[Name].vue`
2. Use `<script setup lang="ts">`
3. Define props with TypeScript
4. Add data-testid attributes
5. Add to Storybook (if applicable)
6. Add tests

### Modifying Database Schema
1. Create migration: `supabase/migrations/[timestamp]_[description].sql`
2. Update RLS policies
3. Update TypeScript types
4. Update API endpoints
5. Add tests
6. Document in architecture docs

## Dependencies

### Critical Dependencies
- `nuxt`: 4.2.2 (framework)
- `vue`: 3.5.18 (UI library)
- `@supabase/supabase-js`: Database & auth
- `stripe`: Payment processing
- `pinia`: State management

### Development Dependencies
- `@playwright/test`: E2E testing
- `vitest`: Unit testing
- `typescript`: Type checking
- `eslint`: Linting

## Known Issues & Workarounds

### Issue: Cart Persistence on Safari
**Problem**: Safari clears cookies aggressively  
**Workaround**: Dual persistence (cookie + localStorage)  
**Location**: `stores/cart/index.ts`

### Issue: Stripe Webhook Timing
**Problem**: Webhook may arrive before order creation  
**Workaround**: Idempotent webhook handler with retry  
**Location**: `server/api/webhooks/stripe.post.ts`

## Recent Changes

### January 2026
- Security hardening (PR #337): CSP, CSRF, rate limiting
- Custom component system (PR #346): Replaced shadcn-vue
- Auth store modularization: Split into focused modules
- Cart initialization simplified: Use `import.meta.client`

### November 2025
- Stripe webhook implementation: Payment status automation
- Admin MFA enforcement: Enhanced security
- WCAG 2.1 AA compliance: Accessibility improvements

## Future Plans

### Short-term (Next Month)
- Complete Stripe production configuration
- Enhance transactional email system
- Add admin analytics dashboard

### Long-term (Next Quarter)
- Implement repository pattern for database access
- Refactor large components (PaymentForm, HybridCheckout)
- Add comprehensive unit test coverage

## Questions to Ask Before Coding

1. **Security**: Does this handle user input? → Validate server-side
2. **Pricing**: Does this involve money? → Verify prices server-side
3. **Inventory**: Does this modify stock? → Use atomic operations
4. **Authentication**: Does this need auth? → Check user permissions
5. **Testing**: How will this be tested? → Add test cases

## Resources

- [Full Documentation](docs/README.md)
- [Architecture Docs](docs/architecture/)
- [API Reference](docs/reference/api/)
- [Testing Guide](docs/guides/TESTING.md)
```

---

## Implementation: .cursorrules File

For Cursor AI specifically:

```markdown
# Moldova Direct - Cursor AI Rules

## Project Context
E-commerce platform for Moldovan products. Nuxt 4 + Vue 3 + Supabase + Stripe.

## Code Style
- TypeScript strict mode
- Vue 3 Composition API with `<script setup>`
- Tailwind CSS for styling
- Pinia for state management

## Critical Rules
1. NEVER trust client-sent prices - always verify server-side
2. ALWAYS validate origin for state-changing operations (CSRF)
3. ALWAYS use atomic operations for inventory updates
4. ALWAYS add data-testid attributes to interactive elements

## File Patterns
- Components: `components/[feature]/[Name].vue`
- API routes: `server/api/[feature]/[action].[method].ts`
- Composables: `composables/use[Feature].ts`
- Tests: `tests/[type]/[feature].spec.ts`

## When Creating Components
- Use TypeScript for props
- Add proper emits typing
- Include accessibility attributes
- Add loading/error states

## When Creating API Routes
1. Validate origin (CSRF)
2. Authenticate user
3. Validate input
4. Verify prices server-side
5. Use service role client
6. Return typed response

## Testing Requirements
- Add E2E test for user-facing features
- Add unit test for business logic
- Use data-testid for selectors
- Mock external services

## Documentation
- Update relevant architecture docs
- Add JSDoc comments for complex logic
- Update API reference if adding endpoints
```

---

## Benefits of AI-Era Documentation

### For You (Human Developer)
✅ **Understand AI changes faster**
- Clear context about what AI knows
- Patterns AI should follow
- Security rules AI must respect

✅ **Guide AI better**
- Consistent conventions
- Clear examples
- Known patterns

✅ **Onboard faster**
- AI can explain the codebase
- Quick context retrieval
- Structured learning path

### For AI Assistants
✅ **Better code generation**
- Understands project patterns
- Follows security rules
- Uses correct conventions

✅ **Fewer mistakes**
- Clear "never do this" examples
- Security guardrails
- Consistent style

✅ **Faster context loading**
- Structured information
- Clear hierarchy
- Machine-readable format

### For the Project
✅ **Maintainability**
- Consistent code style
- Clear patterns
- Easy to understand

✅ **Security**
- AI follows security rules
- Server-side validation enforced
- CSRF protection required

✅ **Quality**
- Testing requirements clear
- Accessibility built-in
- Performance patterns documented

---

## Implementation Plan

### Phase 1: Core AI Context (Week 1)

**Day 1-2: Create llms.txt**
- [ ] Create `/llms.txt` with project overview
- [ ] Link to key documentation
- [ ] Add code conventions summary
- [ ] Test with Claude/ChatGPT

**Day 3-4: Create AGENTS.md**
- [ ] Document architecture patterns
- [ ] Add security rules
- [ ] Include code examples
- [ ] Add common tasks guide

**Day 5: Create .cursorrules**
- [ ] Add Cursor-specific rules
- [ ] Include critical patterns
- [ ] Add file structure conventions

### Phase 2: Enhanced Context (Week 2)

**Day 1-2: Architecture Summary**
- [ ] Create `docs/ai-context/ARCHITECTURE_SUMMARY.md`
- [ ] High-level system design
- [ ] Key decisions and rationale
- [ ] Component relationships

**Day 3-4: Patterns Documentation**
- [ ] Create `docs/ai-context/PATTERNS.md`
- [ ] TypeScript patterns
- [ ] Vue 3 patterns
- [ ] API route patterns
- [ ] Testing patterns

**Day 5: Dependencies & Conventions**
- [ ] Create `docs/ai-context/DEPENDENCIES.md`
- [ ] Create `docs/ai-context/CONVENTIONS.md`
- [ ] Document naming conventions
- [ ] Document file organization

### Phase 3: Validation & Iteration (Week 3)

**Day 1-2: Test with AI Tools**
- [ ] Test with Cursor AI
- [ ] Test with GitHub Copilot
- [ ] Test with Claude/ChatGPT
- [ ] Collect feedback

**Day 3-4: Refine Based on Feedback**
- [ ] Update llms.txt
- [ ] Enhance AGENTS.md
- [ ] Add missing patterns
- [ ] Fix unclear sections

**Day 5: Documentation & Training**
- [ ] Document the AI context system
- [ ] Create guide for maintaining AI docs
- [ ] Train team on using AI context

---

## Measuring Success

### Quantitative Metrics
- ⏱️ **Time to understand AI changes**: Target <5 minutes
- 🎯 **AI code quality**: Fewer security issues, consistent style
- 📊 **Context retrieval speed**: AI finds info in <10 seconds
- 🔄 **Iteration speed**: Faster development with AI assistance

### Qualitative Metrics
- 😊 **Developer satisfaction**: "AI understands our patterns"
- 🤖 **AI effectiveness**: "AI generates production-ready code"
- 📚 **Documentation clarity**: "Easy to understand what AI knows"
- 🔒 **Security confidence**: "AI follows security rules"

---

## Example: Before & After

### Before (Current)

**You**: "Add a payment method to checkout"

**AI**: *Generates code that:*
- ❌ Trusts client-sent prices
- ❌ Skips CSRF validation
- ❌ Uses wrong component pattern
- ❌ Missing TypeScript types

**You**: *Spend 30 minutes fixing AI code* 😫

### After (With AI Context)

**You**: "Add a payment method to checkout"

**AI**: *Reads llms.txt and AGENTS.md, then generates code that:*
- ✅ Validates prices server-side
- ✅ Includes CSRF protection
- ✅ Uses correct component pattern
- ✅ Proper TypeScript types
- ✅ Includes tests

**You**: *Review and merge in 5 minutes* 🎉

---

## Maintenance

### Weekly
- [ ] Update llms.txt if major features added
- [ ] Review AI-generated code for pattern compliance

### Monthly
- [ ] Update AGENTS.md with new patterns
- [ ] Add new security rules if discovered
- [ ] Update dependencies list

### Quarterly
- [ ] Full review of AI context docs
- [ ] Gather team feedback
- [ ] Update based on AI tool improvements

---

## Resources

### Standards & Specifications
- [llms.txt Official Spec](https://llmstxt.org/) - Standard for AI-friendly docs
- [AGENTS.md Specification](https://github.com/propelcode/agents-md) - Context for AI agents

### Tools
- [llms-txt validator](https://llmstxt.org/validator) - Validate your llms.txt
- [Context Engineering Guide](https://contextengineering.ai/) - Best practices

### Examples
- [FastHTML llms.txt](https://fastht.ml/llms.txt) - Well-structured example
- [Supabase docs](https://supabase.com/docs) - AI-friendly documentation

---

## Next Steps

1. **Review this proposal** with the team
2. **Start with llms.txt** (2 hours to create)
3. **Test with AI tools** (Cursor, Copilot, Claude)
4. **Iterate based on results**
5. **Expand to full AI context** if successful

---

**Questions?** Let's discuss how AI-era documentation can help you understand and guide AI-generated code better!

---

**Prepared by**: Kiro AI Assistant  
**Based on**: 2024-2025 AI documentation research  
**Status**: Ready for implementation
