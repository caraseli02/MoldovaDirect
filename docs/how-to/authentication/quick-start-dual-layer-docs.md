# Quick Start: Dual-Layer Documentation

## Prerequisites

- [Add prerequisites here]

## Steps


**Goal**: Get dual-layer documentation working in 1 hour  
**For**: Immediate value without full restructure

---

## What You'll Get

✅ AI assistants understand your project  
✅ Better code generation from AI  
✅ Faster onboarding for developers  
✅ Clear security rules enforced

---

## 1-Hour Implementation

### Step 1: Verify llms.txt (5 min)

**File**: `/llms.txt` (already created!)

**Test it**:
1. Open Cursor/Copilot/Claude
2. Ask: "What is this project about?"
3. AI should give accurate answer using llms.txt

**If it works**: ✅ Move to Step 2  
**If not**: Update llms.txt with more context

---

### Step 2: Create .cursorrules (15 min)

**File**: `/.cursorrules`

**Copy this**:
```markdown
# Moldova Direct - Cursor AI Rules

## Project Context
E-commerce platform for Moldovan products. Nuxt 4 + Vue 3 + Supabase + Stripe.

## Critical Security Rules
1. NEVER trust client-sent prices - always verify server-side
2. ALWAYS validate origin for state-changing operations (CSRF)
3. ALWAYS use atomic operations for inventory updates
4. ALWAYS add data-testid attributes to interactive elements

## Code Style
- TypeScript strict mode
- Vue 3 Composition API with `<script setup>`
- Tailwind CSS for styling
- Pinia for state management

## Component Pattern
```vue
<script setup lang="ts">
interface Props {
  product: Product
  quantity?: number
}
const props = withDefaults(defineProps<Props>(), {
  quantity: 1
})

const emit = defineEmits<{
  add: [product: Product, quantity: number]
}>()
</script>
```

## API Route Pattern
```typescript
export default defineEventHandler(async (event) => {
  // 1. Validate origin (CSRF)
  const originResult = validateOrigin(event)
  if (!originResult.valid) {
    throw createError({ statusCode: 403 })
  }
  
  // 2. Get authenticated user
  const user = await getUser(event)
  
  // 3. Validate input
  const body = await readBody(event)
  
  // 4. Verify prices server-side (CRITICAL)
  const { data: product } = await supabase
    .from('products')
    .select('price_eur')
    .eq('id', productId)
    .single()
  
  // 5. Use atomic operations
  await supabase.rpc('create_order_with_inventory', {
    order_data,
    order_items_data
  })
  
  return { success: true, data }
})
```

## File Patterns
- Components: `components/[feature]/[Name].vue`
- API routes: `server/api/[feature]/[action].[method].ts`
- Composables: `composables/use[Feature].ts`
- Tests: `tests/[type]/[feature].spec.ts`

## Testing Requirements
- Add E2E test for user-facing features
- Add unit test for business logic
- Use data-testid for selectors
- Mock external services
```

**Save as**: `/.cursorrules`

---

### Step 3: Create AGENTS.md (20 min)

**File**: `/AGENTS.md`

**Copy this template and customize**:
```markdown
# Moldova Direct - AI Agent Context

## Project Identity
**Name**: Moldova Direct  
**Type**: E-commerce Platform  
**Stack**: Nuxt 4.2.2, Vue 3.5, TypeScript, Supabase, Stripe

## Critical Security Rules

### NEVER Do This
```typescript
// ❌ WRONG: Trust client prices
const total = body.subtotal + body.shipping

// ❌ WRONG: Skip CSRF validation
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  // ... process without validation
})

// ❌ WRONG: Direct inventory update
await supabase
  .from('products')
  .update({ stock_quantity: newStock })
  .eq('id', productId)
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

## Architecture Patterns

### Modular Store Pattern
```typescript
stores/
├── cart/
│   ├── index.ts      // Main coordinator
│   ├── core.ts       // State & operations
│   ├── persistence.ts // Storage logic
│   └── types.ts      // TypeScript definitions
```

### Component Pattern
```vue
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

### API Route Pattern
```typescript
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

## Code Conventions

### Naming
- **Files**: kebab-case (`user-profile.vue`)
- **Components**: PascalCase (`UserProfile`)
- **Composables**: camelCase with `use` prefix (`useCart`)
- **Types**: PascalCase (`Product`, `CartItem`)
- **Constants**: SCREAMING_SNAKE_CASE (`MAX_CART_ITEMS`)

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

## Common Tasks

### Adding a New API Endpoint
1. Create file: `server/api/[feature]/[action].post.ts`
2. Add CSRF validation
3. Validate input
4. Use service role client
5. Return typed response
6. Add tests

### Adding a New Component
1. Create file: `components/[feature]/[Name].vue`
2. Use `<script setup lang="ts">`
3. Define props with TypeScript
4. Add data-testid attributes
5. Add tests

## Recent Changes (January 2026)
- Security hardening: CSP, CSRF, rate limiting
- Custom component system: Replaced shadcn-vue
- Auth store modularization: Split into focused modules
- Cart initialization simplified: Use `import.meta.client`

## Resources
- [Full Documentation](docs/README.md)
- [Architecture Docs](docs/architecture/)
- [Testing Guide](docs/guides/TESTING.md)
```

**Save as**: `/AGENTS.md`

---

### Step 4: Test with AI (10 min)

**Test 1: Project Understanding**
```
Ask AI: "What is this project about?"
Expected: Accurate description from llms.txt
```

**Test 2: Security Rules**
```
Ask AI: "How should I handle payment processing?"
Expected: Mentions server-side price verification
```

**Test 3: Code Generation**
```
Ask AI: "Create a new API endpoint for updating user profile"
Expected: Includes CSRF validation, proper pattern
```

**Test 4: Pattern Following**
```
Ask AI: "Create a new Vue component for product card"
Expected: Uses <script setup lang="ts">, proper props
```

---

### Step 5: Document for Team (10 min)

**Create**: `docs/guides/USING_AI_CONTEXT.md`

```markdown
# Using AI Context in Moldova Direct

## For Developers

### When Using AI Tools (Cursor, Copilot, Claude)

The AI has access to project context through:
- `/llms.txt` - Project overview
- `/.cursorrules` - Cursor-specific rules
- `/AGENTS.md` - Detailed patterns and conventions

### What AI Knows

✅ **Security Rules**
- Never trust client prices
- Always validate CSRF
- Use atomic operations

✅ **Code Patterns**
- Vue 3 Composition API
- TypeScript strict mode
- Modular store structure

✅ **File Organization**
- Component structure
- API route patterns
- Test organization

### How to Get Better AI Suggestions

1. **Be Specific**
   ```
   ❌ "Add payment"
   ✅ "Add Stripe payment endpoint with server-side price verification"
   ```

2. **Reference Patterns**
   ```
   ✅ "Create a component following our Vue 3 pattern"
   ✅ "Add API route with CSRF validation like other endpoints"
   ```

3. **Ask for Explanations**
   ```
   ✅ "Why did you use atomic operations here?"
   ✅ "Explain the security considerations"
   ```

### Maintaining AI Context

When you add new patterns or rules:
1. Update `/AGENTS.md`
2. Update `/.cursorrules` if Cursor-specific
3. Update `/llms.txt` if major change
4. Test with AI to verify

### Common Issues

**AI doesn't follow patterns**
→ Check if pattern is documented in AGENTS.md

**AI suggests insecure code**
→ Verify security rules are in .cursorrules

**AI doesn't understand project**
→ Update llms.txt with more context
```

---

## Verification Checklist

After 1 hour, you should have:

- [ ] `/llms.txt` - Tested and working
- [ ] `/.cursorrules` - Created and saved
- [ ] `/AGENTS.md` - Created with patterns
- [ ] Tested with AI tool (4 tests passed)
- [ ] Team guide created

---

## What's Next?

### This Week
- [ ] Add more patterns to AGENTS.md as you discover them
- [ ] Update security rules based on code reviews
- [ ] Collect team feedback on AI code quality

### Next Week
- [ ] Create `docs/ai-context/` folder with detailed docs
- [ ] Add diagrams to AGENTS.md
- [ ] Expand llms.txt with more links

### This Month
- [ ] Implement full Diátaxis structure (human-friendly layer)
- [ ] Measure improvement in AI code quality
- [ ] Train team on maintaining AI context

---

## Success Metrics

Track these to measure effectiveness:

### Week 1
- ⏱️ Time AI takes to understand context: <10 seconds
- 🎯 AI code follows patterns: >80%
- 🔒 AI respects security rules: 100%

### Month 1
- 😊 Developer satisfaction: "AI is more helpful"
- ⚡ Development speed: Faster with AI
- ✅ Code quality: Fewer pattern violations

---

## Troubleshooting

### AI Doesn't Read llms.txt
**Solution**: Make sure file is at project root (`/llms.txt`)

### Cursor Doesn't Use .cursorrules
**Solution**: Restart Cursor after creating file

### AI Still Makes Mistakes
**Solution**: Add specific examples to AGENTS.md

### Team Confused
**Solution**: Share the team guide, do a quick demo

---

## Resources

- [Full Implementation Guide](dual-layer-docs-implementation-prompt.md)
- [AI-Era Documentation Proposal](./AI_ERA_DOCUMENTATION_PROPOSAL.md)
- [llms.txt Standard](https://llmstxt.org/)

---

**Done in 1 hour?** You now have AI-friendly documentation! 🎉

**Want more?** Use the full implementation prompt for complete dual-layer system.
