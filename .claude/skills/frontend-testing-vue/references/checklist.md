# Test Generation Checklist

Use this checklist when generating or reviewing tests for Vue/Nuxt components, composables, and stores.

## Pre-Generation

- [ ] Read the source code completely
- [ ] Identify type (component, composable, store, server route, middleware)
- [ ] Note dependencies (router, stores, APIs, external services)
- [ ] Check for existing tests in the same directory
- [ ] **Identify ALL files in the directory** that need testing

## Testing Strategy

### ⚠️ Incremental Workflow (CRITICAL for Multi-File)

- [ ] **NEVER generate all tests at once** - process one file at a time
- [ ] Order files by complexity: utilities → composables → stores → components
- [ ] Create a todo list to track progress before starting
- [ ] For EACH file: write → run test → verify pass → then next
- [ ] **DO NOT proceed** to next file until current one passes

### Dynamic Import Pattern (CRITICAL for Nuxt)

- [ ] **Use dynamic imports** for composables with auto-imports
- [ ] Set up mocks BEFORE importing code under test
- [ ] Example:
  ```typescript
  vi.mock('vue-router', () => ({ useRoute: vi.fn() }))
  const { myComposable } = await import('~/composables/myComposable')
  ```

### Integration vs Mocking

- [ ] **DO NOT mock UI components** (Reka UI, shadcn-vue)
- [ ] Import real UI components
- [ ] Only mock: API calls, Supabase, external services
- [ ] Use real Pinia stores with `setActivePinia(createPinia())`

## Required Test Sections

### All Components MUST Have

- [ ] **Rendering tests** - Component renders without crashing
- [ ] **Props tests** - Required props, optional props, default values
- [ ] **Edge cases** - null, undefined, empty values, boundaries

### Conditional Sections (Add When Feature Present)

| Feature | Add Tests For |
|---------|---------------|
| `ref`/`reactive` | Initial state, mutations |
| `computed` | Derived values with different inputs |
| `watch`/`watchEffect` | Trigger conditions, execution |
| Event handlers | `@click`, `@input`, `@submit` |
| `emit` | Event emission with payloads |
| API calls (`$fetch`) | Loading, success, error states |
| Routing | Navigation, params, query |
| Pinia stores | State, getters, actions |
| Slots | Default and named slots |
| v-model | Two-way binding |

## Code Quality Checklist

### Structure

- [ ] Uses `describe` blocks to group related tests
- [ ] Test names follow `should <behavior> when <condition>` pattern
- [ ] AAA pattern (Arrange-Act-Assert) is clear
- [ ] Comments explain complex test scenarios

### Mocks

- [ ] **DO NOT mock UI components**
- [ ] `vi.clearAllMocks()` in `beforeEach`
- [ ] i18n uses global mock (returns keys)
- [ ] Router mocks match actual vue-router API
- [ ] `$fetch` mocked via `vi.stubGlobal`
- [ ] Pinia uses real store with test instance
- [ ] Dynamic imports used for auto-imported dependencies

### Vue Test Utils

- [ ] Use `mount()` for component testing
- [ ] Use `await` for all trigger/setValue calls
- [ ] Use `nextTick()` or `flushPromises()` for async updates
- [ ] Check `emitted()` for event assertions
- [ ] Use `exists()` for presence checks
- [ ] Use `isVisible()` for visibility checks

### Async

- [ ] All async tests use `async/await`
- [ ] `flushPromises()` used after API calls
- [ ] `nextTick()` used after state changes
- [ ] Fake timers properly setup/teardown
- [ ] No floating promises

### TypeScript

- [ ] No `any` types without justification
- [ ] Mock data uses actual types from source
- [ ] Factory functions have proper return types

## Coverage Goals

Project thresholds:

- [ ] >70% branch coverage
- [ ] >55% function coverage
- [ ] Incremental improvement on lines/statements

## Post-Generation (Per File)

**Run these checks after EACH test file:**

- [ ] Run `pnpm test:unit path/to/file.test.ts` - **MUST PASS before next file**
- [ ] Fix any failures immediately
- [ ] Mark file as complete in todo list
- [ ] Only then proceed to next file

### After All Files Complete

- [ ] Run full test suite: `pnpm test:unit`
- [ ] Check coverage: `pnpm test:coverage`
- [ ] Run TypeScript check

## Quick Commands

```bash
# Run specific test
pnpm test:unit path/to/file.test.ts

# Run with watch mode
pnpm test:unit:watch

# Run with coverage
pnpm test:coverage

# Run changed files only
pnpm test:quick

# Run integration tests
pnpm test:integration
```

## Common Issues and Fixes

### "useRoute is not defined"

```typescript
// Fix: Mock before dynamic import
vi.mock('vue-router', () => ({
  useRoute: vi.fn(() => ({ params: {}, query: {} })),
}))
const { myComposable } = await import('./myComposable')
```

### "getActivePinia was called with no active Pinia"

```typescript
// Fix: Set up Pinia in beforeEach
beforeEach(() => {
  setActivePinia(createPinia())
})
```

### "Cannot find module '#imports'"

```typescript
// Fix: Check vitest.config.ts alias
alias: {
  '#imports': resolve(__dirname, './tests/setup/nuxt-imports-mock.ts'),
}
```

### Test passes but component doesn't update

```typescript
// Fix: Use nextTick or flushPromises
await wrapper.find('button').trigger('click')
await nextTick() // or await flushPromises()
expect(wrapper.text()).toContain('Updated')
```

### Mock not being called

```typescript
// Fix: Ensure mock is set up before import
vi.mock('~/composables/useApi') // BEFORE import
const { ComponentThatUsesApi } = await import('./Component.vue')
```

## Test File Template Quick Reference

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { nextTick } from 'vue'
import { setActivePinia, createPinia } from 'pinia'

// Mocks (BEFORE imports)
vi.mock('vue-router', () => ({
  useRoute: vi.fn(() => ({ params: {}, query: {} })),
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}))

const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)

describe('ComponentName', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
  })

  describe('Rendering', () => {
    it('should render without crashing', async () => {
      const Component = (await import('./Component.vue')).default
      const wrapper = mount(Component)
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Props', () => {
    it('should display title prop', async () => {
      const Component = (await import('./Component.vue')).default
      const wrapper = mount(Component, {
        props: { title: 'Test Title' },
      })
      expect(wrapper.text()).toContain('Test Title')
    })
  })

  describe('Events', () => {
    it('should emit click event', async () => {
      const Component = (await import('./Component.vue')).default
      const wrapper = mount(Component)
      await wrapper.find('button').trigger('click')
      expect(wrapper.emitted('click')).toBeTruthy()
    })
  })

  describe('Edge Cases', () => {
    it('should handle null data', async () => {
      const Component = (await import('./Component.vue')).default
      const wrapper = mount(Component, {
        props: { data: null },
      })
      expect(wrapper.find('[data-testid="empty"]').exists()).toBe(true)
    })
  })
})
```
