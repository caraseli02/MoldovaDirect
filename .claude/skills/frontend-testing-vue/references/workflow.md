# Testing Workflow Guide

This guide defines the workflow for generating tests, especially for complex components or directories with multiple files.

## Scope Clarification

| Scope | Rule |
|-------|------|
| **Single file** | Complete coverage in one generation |
| **Multi-file directory** | Process one file at a time, verify each before proceeding |

## ⚠️ Critical Rule: Incremental Approach

When testing a **directory with multiple files**, **NEVER generate all test files at once.** Use an incremental, verify-as-you-go approach.

### Why Incremental?

| Batch Approach (❌) | Incremental Approach (✅) |
|---------------------|---------------------------|
| Generate 5+ tests at once | Generate 1 test at a time |
| Run tests only at the end | Run test immediately after each file |
| Multiple failures compound | Single point of failure, easy to debug |
| Mock issues affect many files | Mock issues caught early |
| Messy git history | Clean, atomic commits possible |

## Single File Workflow

```
1. Read source code completely
2. Identify dependencies (composables, stores, APIs)
3. Determine which mocks are needed
4. Write the test file
5. Run test: pnpm test:unit <file>.test.ts
6. Fix any failures
7. Verify coverage is acceptable
```

## Directory/Multi-File Workflow (MUST FOLLOW)

### Step 1: Analyze and Plan

1. **List all files** that need tests
2. **Categorize by complexity**:
   - 🟢 **Simple**: Utility functions, simple composables
   - 🟡 **Medium**: Components with state, stores
   - 🔴 **Complex**: Components with API calls, routing, middleware
3. **Order by dependency**: Test dependencies before dependents
4. **Create a todo list** to track progress

### Step 2: Determine Processing Order

Process files in this recommended order:

```
1. Utility functions (simplest, no Vue)
2. Simple composables (isolated logic)
3. Pinia stores
4. Simple presentational components
5. Medium complexity components (state, events)
6. Complex components (API, routing)
7. Server routes
8. Middleware
9. Integration tests (last)
```

**Rationale**:
- Simpler files help establish mock patterns
- Composables used by components should be tested first
- Stores used by multiple components tested early

### Step 3: Process Each File Incrementally

**For EACH file in the ordered list:**

```
┌─────────────────────────────────────────────────┐
│  1. Write test file                             │
│  2. Run: pnpm test:unit <file>.test.ts          │
│  3. If FAIL → Fix immediately, re-run           │
│  4. If PASS → Mark complete in todo list        │
│  5. ONLY THEN proceed to next file              │
└─────────────────────────────────────────────────┘
```

**DO NOT proceed to the next file until the current one passes.**

### Step 4: Final Verification

After all individual tests pass:

```bash
# Run all tests in the directory together
pnpm test:unit path/to/directory/

# Check coverage
pnpm test:coverage
```

## Vue/Nuxt Complexity Guidelines

### 🔴 Very Complex (Consider refactoring first)

- Components with 10+ props
- Composables with 5+ external dependencies
- 500+ lines of code
- Heavy Supabase/API integration

**If testing as-is:**
- Use multiple `describe` blocks
- Create helper functions for setup
- Consider splitting test file

### 🟡 Medium Complexity

- Components with state and events
- Composables with 2-3 dependencies
- Pinia stores with actions

**Approach:**
- Group related tests in `describe` blocks
- Test state transitions thoroughly
- Mock external dependencies

### 🟢 Simple

- Pure utility functions
- Presentational components
- Simple composables (single responsibility)

**Approach:**
- Standard test structure
- Focus on props, rendering, edge cases

## Todo List Format

When testing multiple files, use this format:

```
Testing: composables/

Ordered by complexity (simple → complex):

☐ useFormatters.ts          [utility, simple]
☐ useLocalStorage.ts        [composable, simple]
☐ useProductFilters.ts      [composable, medium - uses router]
☐ useCart.ts                [composable, medium - uses store]
☐ useCheckout.ts            [composable, complex - uses API]

Progress: 0/5 complete
```

Update status as you complete each:
- ☐ → ⏳ (in progress)
- ⏳ → ✅ (complete and verified)
- ⏳ → ❌ (blocked, needs attention)

## When to Stop and Verify

**Always run tests after:**
- Completing a test file
- Making changes to fix a failure
- Modifying shared mocks
- Updating test utilities

**Signs you should pause:**
- More than 2 consecutive test failures
- Mock-related errors appearing
- Unclear why a test is failing
- Import/module resolution errors

## Common Nuxt-Specific Issues

### Auto-Import Problems

**Symptom:** `useRoute is not defined` or similar

**Solution:** Use dynamic imports:
```typescript
vi.mock('vue-router', () => ({ useRoute: vi.fn() }))
const { myComposable } = await import('~/composables/myComposable')
```

### Store Not Initialized

**Symptom:** `getActivePinia was called with no active Pinia`

**Solution:** Set up Pinia in beforeEach:
```typescript
beforeEach(() => {
  setActivePinia(createPinia())
})
```

### Reactivity Not Triggering

**Symptom:** Component doesn't update after state change

**Solution:** Use `await nextTick()` or `await wrapper.vm.$nextTick()`

### Server Route Module Errors

**Symptom:** `Cannot find module '#supabase/server'`

**Solution:** Ensure alias is configured in vitest.config.ts

## @nuxt/test-utils Configuration

For Nuxt-aware testing environment (official Nuxt 4 pattern):

### Simple Configuration

```typescript
// vitest.config.ts
import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    // Optional Nuxt-specific environment options
    // environmentOptions: {
    //   nuxt: {
    //     domEnvironment: 'happy-dom', // 'happy-dom' (default) or 'jsdom'
    //   }
    // }
  },
})
```

### Multi-Project Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          include: ['tests/unit/**/*.test.ts'],
          environment: 'node',
        },
      },
      await defineVitestProject({
        test: {
          name: 'nuxt',
          include: ['tests/nuxt/**/*.test.ts'],
          environment: 'nuxt',
        },
      }),
    ],
  },
})
```

### When to Use Each Environment

| Environment | Use For |
|-------------|---------|
| `node` | Server routes, utilities, pure functions |
| `jsdom` | Components without Nuxt features |
| `nuxt` | Components using Nuxt composables, full Nuxt runtime |

## Summary Checklist

Before starting multi-file testing:
- [ ] Listed all files needing tests
- [ ] Ordered by complexity (simple → complex)
- [ ] Created todo list for tracking
- [ ] Understand dependencies between files

During testing:
- [ ] Processing ONE file at a time
- [ ] Running tests after EACH file
- [ ] Using dynamic imports for composables
- [ ] Fixing failures BEFORE proceeding
- [ ] Updating todo list progress

After completion:
- [ ] All individual tests pass
- [ ] Full directory test run passes
- [ ] Coverage goals met (>70% branches, >55% functions)
- [ ] Todo list shows all complete
