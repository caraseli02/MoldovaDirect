# Show Next TDD Task

Show the next component testing task without starting the TDD loop.

## Your Task

1. Read `skill_audit_refactor.json`
2. Find tasks in the "component-testing-coverage" section
3. Filter to tasks where `test_exists: false` OR `implemented: false`
4. Show the highest priority untested component

## Output Format

Show a summary like this:

```
📋 Next Component Test: CartDrawer.vue

Component: components/cart/CartDrawer.vue
Test File: tests/components/cart/__tests__/CartDrawer.test.ts
Status: ❌ No tests exist

Planned Tests:
  1. Cart drawer open/close behavior
  2. Rendering cart items
  3. Empty cart state
  4. Visual verification

Priority: P1-high
Task ID: comp-test-1

To start working on this task, run: /tdd-loop
```

Also show overall progress:
- Total components to test: 10
- Tests created: X/10
- Tests passing: Y/10
- Completion: Z%

Do NOT start the TDD loop automatically.
