# AI Context Testing Guide

## Overview

This guide explains how to test AI context files (llms.txt, AGENTS.md, .cursorrules, ai-context/) to ensure AI assistants generate high-quality code that follows project patterns and security requirements. Regular testing validates that AI tools understand project context and produce code that requires minimal fixes.

## Why Test AI Context?

AI context files serve as the "instruction manual" for AI assistants. Poor context leads to:

- Code that doesn't follow project patterns
- Security vulnerabilities
- Incorrect imports and dependencies
- Inconsistent naming conventions
- Code that requires extensive manual fixes

Good AI context results in:

- Code that follows project conventions
- Secure implementations
- Correct imports and structure
- Consistent style
- Minimal manual fixes needed

## Testing Tools

### Supported AI Tools

Test with multiple AI tools to ensure broad compatibility:

1. **Cursor AI** - IDE with built-in AI assistant
2. **GitHub Copilot** - Code completion in IDE
3. **Claude** (via API or web) - General-purpose AI
4. **ChatGPT** (via API or web) - General-purpose AI
5. **Cody** - Sourcegraph's AI assistant

### Testing Environment Setup

#### Cursor AI Setup

```bash
# Install Cursor (if not already installed)
# Download from: https://cursor.sh/

# Open project in Cursor
cursor .

# Verify .cursorrules is loaded
# Check: Settings → Cursor Settings → Rules
```

#### GitHub Copilot Setup

```bash
# Install Copilot extension in VS Code
# Verify it's enabled for the project

# Check Copilot status
# Look for Copilot icon in status bar
```

#### Claude/ChatGPT Setup

For API testing:

```bash
# Install dependencies
npm install @anthropic-ai/sdk openai

# Set API keys
export ANTHROPIC_API_KEY="your-key"
export OPENAI_API_KEY="your-key"

# Run test script
npm run test:ai-context
```

## Testing Methodology

### Test Categories

#### 1. Pattern Compliance Tests

Verify AI generates code following project patterns.

#### 2. Security Compliance Tests

Verify AI respects security rules and best practices.

#### 3. Convention Compliance Tests

Verify AI follows naming, organization, and style conventions.

#### 4. Completeness Tests

Verify AI generates complete, working code without placeholders.

#### 5. Context Understanding Tests

Verify AI understands project architecture and dependencies.

## Test Scenarios

### Scenario 1: Vue 3 Component Generation

**Objective**: Verify AI generates Vue 3 components following project patterns

**Test with Cursor AI**:

1. Create new file: `components/test/TestComponent.vue`
2. Type comment: `// Create a user profile card component with avatar, name, and bio`
3. Wait for AI suggestion
4. Accept suggestion

**Expected Output**:
```vue
<script setup lang="ts">
interface Props {
  name: string
  bio: string
  avatarUrl: string
}

const props = defineProps<Props>()
</script>

<template>
  <div class="profile-card">
    <img :src="avatarUrl" :alt="`${name}'s avatar`" class="avatar" />
    <h3 class="name">{{ name }}</h3>
    <p class="bio">{{ bio }}</p>
  </div>
</template>

<style scoped>
.profile-card {
  /* styles */
}
</style>
```

**Validation Checklist**:
- [ ] Uses `<script setup lang="ts">`
- [ ] Uses TypeScript interfaces for props
- [ ] Uses `defineProps<Props>()`
- [ ] Template uses proper Vue 3 syntax
- [ ] Scoped styles included
- [ ] No placeholders (e.g., "// TODO", "...")
- [ ] Proper naming conventions (kebab-case for file, PascalCase for component)

**Test with Claude/ChatGPT**:

Prompt:
```
Using the context from llms.txt and AGENTS.md, generate a Vue 3 component for a user profile card with avatar, name, and bio. Follow the project's Vue 3 patterns.
```

Validate same checklist as above.

### Scenario 2: API Route Generation

**Objective**: Verify AI generates secure API routes with proper validation

**Test with Cursor AI**:

1. Create new file: `server/api/products/[id].get.ts`
2. Type comment: `// Get product by ID with authentication`
3. Wait for AI suggestion
4. Accept suggestion

**Expected Output**:
```typescript
import { defineEventHandler, getRouterParam } from 'h3'
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  // Verify authentication
  const client = await serverSupabaseClient(event)
  const { data: { user }, error: authError } = await client.auth.getUser()
  
  if (authError || !user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized'
    })
  }

  // Get and validate product ID
  const id = getRouterParam(event, 'id')
  if (!id || isNaN(Number(id))) {
    throw createError({
      statusCode: 400,
      message: 'Invalid product ID'
    })
  }

  // Fetch product
  const { data: product, error } = await client
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    throw createError({
      statusCode: 404,
      message: 'Product not found'
    })
  }

  return product
})
```

**Validation Checklist**:
- [ ] Uses `defineEventHandler`
- [ ] Includes authentication check
- [ ] Validates input parameters
- [ ] Uses proper error handling with `createError`
- [ ] Uses Supabase client correctly
- [ ] No client-side data trusted
- [ ] Proper TypeScript types
- [ ] No security vulnerabilities

### Scenario 3: Composable Generation

**Objective**: Verify AI generates composables following project patterns

**Test with Cursor AI**:

1. Create new file: `composables/useProductSearch.ts`
2. Type comment: `// Composable for searching products with filters`
3. Wait for AI suggestion

**Expected Output**:
```typescript
import { ref, computed } from 'vue'
import type { Product } from '~/types'

export function useProductSearch() {
  const searchQuery = ref('')
  const filters = ref({
    category: '',
    minPrice: 0,
    maxPrice: 1000
  })
  const products = ref<Product[]>([])
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const filteredProducts = computed(() => {
    return products.value.filter(product => {
      const matchesQuery = product.name
        .toLowerCase()
        .includes(searchQuery.value.toLowerCase())
      const matchesCategory = !filters.value.category || 
        product.category === filters.value.category
      const matchesPrice = product.price >= filters.value.minPrice &&
        product.price <= filters.value.maxPrice
      
      return matchesQuery && matchesCategory && matchesPrice
    })
  })

  async function search() {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch('/api/products', {
        query: {
          q: searchQuery.value,
          category: filters.value.category,
          minPrice: filters.value.minPrice,
          maxPrice: filters.value.maxPrice
        }
      })
      products.value = response
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }

  return {
    searchQuery,
    filters,
    products: filteredProducts,
    loading,
    error,
    search
  }
}
```

**Validation Checklist**:
- [ ] Uses Composition API
- [ ] Proper TypeScript types
- [ ] Uses `ref` and `computed` correctly
- [ ] Includes loading and error states
- [ ] Uses `$fetch` for API calls
- [ ] Returns object with reactive properties
- [ ] Follows naming convention (camelCase)
- [ ] No placeholders

### Scenario 4: Security Rule Compliance

**Objective**: Verify AI respects security rules

**Test with Cursor AI**:

1. Create new file: `server/api/checkout/create.post.ts`
2. Type comment: `// Create checkout session with Stripe`
3. Wait for AI suggestion

**Expected Output** (should include):
```typescript
export default defineEventHandler(async (event) => {
  // MUST verify CSRF token
  await verifyCsrfToken(event)
  
  // MUST authenticate user
  const client = await serverSupabaseClient(event)
  const { data: { user }, error: authError } = await client.auth.getUser()
  
  if (authError || !user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized'
    })
  }

  // Get cart items from database (NEVER trust client)
  const { data: cartItems } = await client
    .from('cart_items')
    .select('*, products(*)')
    .eq('user_id', user.id)

  // Calculate total server-side (NEVER trust client prices)
  const total = cartItems.reduce((sum, item) => {
    return sum + (item.products.price * item.quantity)
  }, 0)

  // Create Stripe session with server-calculated prices
  const stripe = useStripe()
  const session = await stripe.checkout.sessions.create({
    // ... session config with server prices
  })

  return { sessionId: session.id }
})
```

**Validation Checklist**:
- [ ] CSRF validation present
- [ ] Authentication check present
- [ ] Prices calculated server-side
- [ ] No client-sent prices trusted
- [ ] Proper error handling
- [ ] Service keys not exposed
- [ ] Request origin validated

### Scenario 5: Testing Pattern

**Objective**: Verify AI generates proper tests

**Test with Cursor AI**:

1. Create new file: `tests/unit/useProductSearch.test.ts`
2. Type comment: `// Unit tests for useProductSearch composable`
3. Wait for AI suggestion

**Expected Output**:
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useProductSearch } from '~/composables/useProductSearch'

describe('useProductSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should filter products by search query', () => {
    const { searchQuery, products, filteredProducts } = useProductSearch()
    
    products.value = [
      { id: 1, name: 'Red Wine', category: 'wine', price: 20 },
      { id: 2, name: 'White Wine', category: 'wine', price: 25 }
    ]
    
    searchQuery.value = 'red'
    
    expect(filteredProducts.value).toHaveLength(1)
    expect(filteredProducts.value[0].name).toBe('Red Wine')
  })

  it('should filter products by category', () => {
    const { filters, products, filteredProducts } = useProductSearch()
    
    products.value = [
      { id: 1, name: 'Wine', category: 'wine', price: 20 },
      { id: 2, name: 'Cheese', category: 'food', price: 10 }
    ]
    
    filters.value.category = 'wine'
    
    expect(filteredProducts.value).toHaveLength(1)
    expect(filteredProducts.value[0].category).toBe('wine')
  })

  it('should handle search errors gracefully', async () => {
    const { search, error } = useProductSearch()
    
    // Mock fetch to throw error
    global.$fetch = vi.fn().mockRejectedValue(new Error('Network error'))
    
    await search()
    
    expect(error.value).toBeTruthy()
    expect(error.value?.message).toBe('Network error')
  })
})
```

**Validation Checklist**:
- [ ] Uses Vitest
- [ ] Proper test structure (describe, it)
- [ ] Tests cover main functionality
- [ ] Tests include error cases
- [ ] Uses proper assertions
- [ ] Mocks external dependencies
- [ ] No placeholders

## Automated Testing

### Test Script

Create automated test script to validate AI context:

```typescript
// scripts/test-ai-context.ts
import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import { readFileSync } from 'fs'

interface TestCase {
  name: string
  prompt: string
  expectedPatterns: string[]
  forbiddenPatterns: string[]
}

const testCases: TestCase[] = [
  {
    name: 'Vue 3 Component',
    prompt: 'Create a Vue 3 component for a product card',
    expectedPatterns: [
      '<script setup lang="ts">',
      'defineProps',
      'interface Props',
      '<template>',
      '<style scoped>'
    ],
    forbiddenPatterns: [
      'TODO',
      '...',
      'placeholder',
      'export default {' // Should use script setup
    ]
  },
  {
    name: 'API Route with Security',
    prompt: 'Create an API route to update user profile',
    expectedPatterns: [
      'defineEventHandler',
      'serverSupabaseClient',
      'auth.getUser',
      'createError',
      'statusCode: 401'
    ],
    forbiddenPatterns: [
      'process.env.SUPABASE_SERVICE_KEY', // Should not expose keys
      'req.body.price' // Should not trust client prices
    ]
  },
  {
    name: 'Composable',
    prompt: 'Create a composable for managing user preferences',
    expectedPatterns: [
      'export function use',
      'ref(',
      'computed(',
      'return {'
    ],
    forbiddenPatterns: [
      'export default',
      'class ',
      'TODO'
    ]
  }
]

async function testWithClaude(testCase: TestCase): Promise<boolean> {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
  })

  const llmsTxt = readFileSync('llms.txt', 'utf-8')
  const agentsMd = readFileSync('docs/ai-context/AGENTS.md', 'utf-8')

  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `Context:\n${llmsTxt}\n\n${agentsMd}\n\nTask: ${testCase.prompt}`
    }]
  })

  const response = message.content[0].type === 'text' 
    ? message.content[0].text 
    : ''

  // Check expected patterns
  const hasExpected = testCase.expectedPatterns.every(pattern =>
    response.includes(pattern)
  )

  // Check forbidden patterns
  const hasForbidden = testCase.forbiddenPatterns.some(pattern =>
    response.includes(pattern)
  )

  const passed = hasExpected && !hasForbidden

  console.log(`\n${testCase.name}: ${passed ? '✅ PASS' : '❌ FAIL'}`)
  if (!passed) {
    console.log('Expected patterns missing:', 
      testCase.expectedPatterns.filter(p => !response.includes(p))
    )
    console.log('Forbidden patterns found:',
      testCase.forbiddenPatterns.filter(p => response.includes(p))
    )
  }

  return passed
}

async function runTests() {
  console.log('Testing AI Context Quality...\n')

  const results = await Promise.all(
    testCases.map(testCase => testWithClaude(testCase))
  )

  const passed = results.filter(r => r).length
  const total = results.length

  console.log(`\n\nResults: ${passed}/${total} tests passed`)
  
  if (passed === total) {
    console.log('✅ All tests passed! AI context is working correctly.')
    process.exit(0)
  } else {
    console.log('❌ Some tests failed. Review AI context files.')
    process.exit(1)
  }
}

runTests()
```

### Running Automated Tests

```bash
# Set API keys
export ANTHROPIC_API_KEY="your-key"
export OPENAI_API_KEY="your-key"

# Run tests
npm run test:ai-context

# Run with specific tool
npm run test:ai-context -- --tool=claude
npm run test:ai-context -- --tool=openai
```

## Manual Testing Checklist

Use this checklist when manually testing AI context:

### Pre-Test Setup
- [ ] AI context files are up-to-date
- [ ] llms.txt exists and is complete
- [ ] AGENTS.md exists and is complete
- [ ] .cursorrules exists (for Cursor)
- [ ] ai-context/ directory is populated

### Pattern Compliance
- [ ] Vue 3 components use Composition API
- [ ] API routes include authentication
- [ ] API routes include input validation
- [ ] Composables follow naming convention
- [ ] TypeScript types are explicit
- [ ] No placeholders in generated code

### Security Compliance
- [ ] CSRF validation in state-changing routes
- [ ] Authentication checks present
- [ ] Server-side price calculation
- [ ] No client-sent prices trusted
- [ ] Service keys not exposed
- [ ] Request origin validated

### Convention Compliance
- [ ] File naming: kebab-case
- [ ] Component naming: PascalCase
- [ ] Composable naming: camelCase
- [ ] Proper imports
- [ ] Proper file organization

### Completeness
- [ ] No TODO comments
- [ ] No placeholder text
- [ ] No "..." ellipsis
- [ ] Complete function implementations
- [ ] All imports included
- [ ] Proper error handling

### Context Understanding
- [ ] Uses correct dependencies
- [ ] Understands project architecture
- [ ] Follows established patterns
- [ ] References correct file paths
- [ ] Uses correct API endpoints

## Measuring AI Code Quality

### Quality Metrics

Track these metrics to measure AI context effectiveness:

1. **Pattern Compliance Rate**: % of generated code following patterns
2. **Security Compliance Rate**: % of generated code following security rules
3. **Fix Rate**: Average number of fixes needed per AI-generated code
4. **Time to Working Code**: Time from generation to working implementation
5. **Developer Satisfaction**: Survey scores on AI code quality

### Scoring System

Use this scoring system for each test:

- **5 points**: Perfect - no changes needed
- **4 points**: Minor fixes - small tweaks only
- **3 points**: Moderate fixes - some refactoring needed
- **2 points**: Major fixes - significant changes needed
- **1 point**: Unusable - complete rewrite needed

**Target Score**: Average of 4+ across all tests

### Tracking Results

Create a test results log:

```markdown
# AI Context Test Results

## Test Date: 2026-01-15

### Cursor AI
- Vue 3 Component: 5/5 ✅
- API Route: 4/5 ✅ (minor: missing one validation)
- Composable: 5/5 ✅
- Security: 5/5 ✅
- Testing: 4/5 ✅ (minor: missing edge case)

**Average: 4.6/5**

### Claude
- Vue 3 Component: 5/5 ✅
- API Route: 5/5 ✅
- Composable: 4/5 ✅ (minor: verbose)
- Security: 5/5 ✅
- Testing: 5/5 ✅

**Average: 4.8/5**

### GitHub Copilot
- Vue 3 Component: 4/5 ✅
- API Route: 3/5 ⚠️ (missing CSRF)
- Composable: 4/5 ✅
- Security: 3/5 ⚠️ (needs improvement)
- Testing: 4/5 ✅

**Average: 3.6/5** ⚠️ Needs improvement

## Actions
- Update .cursorrules with more explicit security rules
- Add more security examples to AGENTS.md
- Retest Copilot after updates
```

## Improving AI Context

### When Tests Fail

If AI-generated code doesn't meet quality standards:

#### Step 1: Identify the Gap

- What pattern was not followed?
- What security rule was violated?
- What convention was missed?

#### Step 2: Update AI Context

**For pattern issues**:
- Add or improve pattern documentation in AGENTS.md
- Include more complete code examples
- Add rationale for the pattern

**For security issues**:
- Add explicit security rules to AGENTS.md
- Include both "NEVER" and "ALWAYS" examples
- Add to .cursorrules for Cursor

**For convention issues**:
- Update CONVENTIONS.md in ai-context/
- Add examples to AGENTS.md
- Update llms.txt if needed

#### Step 3: Retest

- Run the same test again
- Verify improvement
- Test with multiple AI tools

#### Step 4: Document

- Update test results log
- Note what was changed
- Track improvement over time

### Continuous Improvement

- Test AI context after every major update
- Track metrics over time
- Gather developer feedback
- Iterate on AI context files
- Share learnings with team

## Best Practices

### Do's

✅ Test with multiple AI tools
✅ Test regularly (weekly or after updates)
✅ Track metrics over time
✅ Update AI context based on failures
✅ Include complete code examples
✅ Document security rules explicitly
✅ Test both simple and complex scenarios
✅ Validate generated code actually works

### Don'ts

❌ Test with only one AI tool
❌ Assume AI context works without testing
❌ Ignore test failures
❌ Use incomplete code examples
❌ Rely on AI to infer security rules
❌ Skip validation of generated code
❌ Test only happy path scenarios

## Resources

- [AGENTS.md](../ai-context/AGENTS.md) - Main AI context file
- [llms.txt](../../llms.txt) - AI entry point
- [.cursorrules](../../.cursorrules) - Cursor-specific rules
- [Maintenance Guide](./MAINTENANCE_GUIDE.md) - Documentation maintenance
- [Migration Guide](./MIGRATION_GUIDE.md) - Migration procedures

## Getting Help

- **Slack**: #documentation or #ai-tools
- **GitHub Issues**: Tag with `ai-context` and `documentation`
- **Email**: docs@moldovadirect.com
- **Office Hours**: Fridays 2-3 PM

---

**Last Updated**: 2026-01-15
**Owner**: Tech Lead
**Review Schedule**: Monthly
