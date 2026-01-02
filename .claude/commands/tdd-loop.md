# TDD Loop - Automated Component Testing Workflow

Start the Ralph Wiggum AI Loop for creating component tests using Test-Driven Development.

## Your Task

You are now in TDD loop mode for component testing. Follow these steps:

### Step 1: Pick Next Task
1. Read `skill_audit_refactor.json`
2. Find tasks in the "component-testing-coverage" section where `test_exists: false`
3. Select the highest priority untested component
4. Show the user which component you'll test

### Step 2: RED Phase (Create Failing Test)
1. Create the test file at the path specified in `test_file`
2. Import necessary testing utilities:
   ```typescript
   import { describe, it, expect, beforeEach, vi } from 'vitest'
   import { mount } from '@vue/test-utils'
   import { createPinia, setActivePinia } from 'pinia'
   ```
3. Write test cases for expected behavior based on the component's purpose
4. Run the test (it should FAIL since component logic may not be complete)
5. Update `test_exists: true` in the audit file

### Step 3: GREEN Phase (Implement/Verify Component)
1. If the component needs fixes to pass tests, implement them
2. Otherwise, just verify tests pass
3. Run tests again (should PASS)
4. Update `implemented: true` in the audit file

### Step 4: VISUAL Phase (Browser Testing)
1. If visual testing is required, use Chrome DevTools MCP or Playwright
2. Take screenshots to verify component renders correctly
3. Check responsive behavior if applicable
4. Update visual test task as implemented

### Step 5: Validate & Loop
1. Mark `tested: true` in audit file
2. Commit changes with message: `test: add unit tests for [ComponentName]`
3. Show progress summary
4. **Automatically continue to next component** (don't wait for user approval)
5. Stop when all component tests are complete or after 10 iterations

## Important Rules

- **Always test-first**: Create the test file before modifying the component
- **Run tests after each phase**: Verify RED -> GREEN progression
- **Update audit file**: Keep `skill_audit_refactor.json` synchronized
- **Commit frequently**: After each successful test creation
- **Auto-loop**: Continue automatically without asking (Ralph Wiggum style)

## Progress Tracking

After each component, show:
```
✅ Completed: CartDrawer.vue
📝 Tests created: 5
🎯 Next: CartSummary.vue
📊 Progress: 3/10 components tested (30%)
```

## When to Stop

- All 10 component tests are complete
- Maximum 10 iterations reached
- Test fails and can't be fixed automatically
- User types `/cancel-tdd`

---

**Remember**: You're in automated loop mode. Keep going until all components are tested!
