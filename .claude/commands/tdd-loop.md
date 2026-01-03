# Ralph Wiggum TDD Loop - Component Testing

Create component tests iteratively using the Ralph Wiggum AI Loop technique.

## Loop Execution

You will work through component tests in `skill_audit_refactor.json` → "component-testing-coverage" section.

**On each iteration:**

1. **SELECT** → Pick next component where `test_exists: false`
2. **READ** → Examine the component file to understand its behavior
3. **TEST** → Create comprehensive test file following TDD principles
4. **VERIFY** → Run tests to ensure they work
5. **COMMIT** → Git commit with message: `test: add unit tests for [ComponentName]`
6. **UPDATE** → Mark `test_exists: true`, `implemented: true`, `tested: true` in audit file
7. **LOOP** → Continue to next component automatically

## Test Template

Each component test should follow this structure:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ComponentName from '~/components/path/ComponentName.vue'

describe('ComponentName', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('should render correctly', () => {
    const wrapper = mount(ComponentName)
    expect(wrapper.exists()).toBe(true)
  })

  // Add component-specific tests based on its functionality
})
```

## Completion Signal

**Stop when you output this exact phrase:**
```
🎯 ALL COMPONENT TESTS COMPLETE
```

Output this phrase ONLY when:
- All 30 components have tests created (test_exists: true)
- All tests pass
- All changes committed and pushed
- audit file fully updated

## Auto-Loop Behavior

**DO NOT ASK FOR PERMISSION between components** — this is Ralph Wiggum style autonomous iteration.

After each component:
- Immediately proceed to next
- Show brief status: `✅ [ComponentName] done → 🔄 [NextComponent] starting`
- Commit frequently (after each component test)

## Failure Handling

If a test fails to run:
- Try to fix it once
- If still failing, mark the issue in audit file and continue to next component
- Document failures but don't stop the loop

## Max Iterations

- Maximum: 40 iterations (30 components + 10 buffer for fixes)
- After 40 iterations, output completion signal even if incomplete
- Show final summary with completed/remaining counts

---

**Start the loop by outputting:** `🚀 Starting Ralph Wiggum TDD Loop for 30 components`
