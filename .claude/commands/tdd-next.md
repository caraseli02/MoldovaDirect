# Show Next Component

Preview the next component test without starting the Ralph Wiggum loop.

## Task

1. Read `skill_audit_refactor.json` → "component-testing-coverage"
2. Find first component where `test_exists: false`
3. Show details without starting loop

## Output Format

```
📋 NEXT COMPONENT TEST

Component: components/cart/CartDrawer.vue
Test File: tests/components/cart/__tests__/CartDrawer.test.ts
Task ID:   comp-test-1
Status:    ⚪ Not started

Test Coverage:
  • Cart drawer open/close behavior
  • Rendering cart items
  • Empty cart state
  • Visual verification

Component Lines: [show file size]
Complexity: [low/medium/high based on file size]

To start the Ralph Wiggum loop: /tdd-loop
To just test this one component: Create the test manually
```

**Progress Bar:**
```
Components: ⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪ 0/10
```

Do NOT start loop. Do NOT create any tests. Just show the preview.
