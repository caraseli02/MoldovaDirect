# Mutation Testing Quick Reference Card

## What is Mutation Testing?

Mutation testing validates test quality by **introducing bugs** into code and verifying tests catch them.

**Example:**
```javascript
// Original Code
if (items.length > 0) {  // ✓ Correct
  render(items)
}

// Mutated Code (Bug Introduced)
if (items.length >= 0) {  // ✗ Bug - renders with empty array
  render(items)
}

// If test FAILS → Good test ✅
// If test PASSES → Bad test (false positive) ❌
```

---

## Quick Results

| Metric | Value | Status |
|--------|-------|--------|
| **Total Tests** | 17 files | - |
| **Mutations** | 19 | - |
| **Caught** | 12 (63%) | ⚠️ Fair |
| **Missed** | 7 (37%) | ❌ Needs work |

**Target:** 75-85% mutation score for production

---

## Top 3 Issues to Fix NOW

### 1. PriceRangeSlider - Wrong Event Name
**File:** `tests/components/product/Mobile/__tests__/PriceRangeSlider.test.ts`

**Problem:** Test uses `update:value` but component emits `update:modelValue`

**Fix:**
```typescript
// ❌ WRONG
expect(wrapper.emitted('update:value')).toBeTruthy()

// ✅ CORRECT
expect(wrapper.emitted('update:modelValue')).toBeTruthy()
expect(wrapper.emitted('update:modelValue')[0]).toEqual([[20, 60]])
```

---

### 2. SearchBar - Missing Input Event Test
**File:** `tests/components/product/__tests__/SearchBar.test.ts`

**Problem:** No test validates search input emits `update:searchQuery`

**Fix:**
```typescript
it('should emit update:searchQuery when user types', async () => {
  const wrapper = mount(SearchBar, { props: defaultProps })
  const input = wrapper.find('input[type="search"]')

  await input.setValue('wine')

  expect(wrapper.emitted('update:searchQuery')).toBeTruthy()
  expect(wrapper.emitted('update:searchQuery')[0]).toEqual(['wine'])
})
```

---

### 3. Breadcrumbs - No Item Count Validation
**File:** `tests/components/product/__tests__/Breadcrumbs.test.ts`

**Problem:** Tests check for existence but not actual breadcrumb items

**Fix:**
```typescript
it('should render all breadcrumb items', () => {
  const wrapper = mount(Breadcrumbs, {
    props: { items: mockItems }
  })

  const breadcrumbLinks = wrapper.findAll('a')
  expect(breadcrumbLinks.length).toBe(mockItems.length)
})
```

---

## Common Test Anti-Patterns

### ❌ Anti-Pattern 1: Existence-Only Checks
```typescript
it('should render component', () => {
  const wrapper = mount(MyComponent)
  expect(wrapper.exists()).toBe(true)  // ❌ Too weak!
})
```

**Why it's bad:** Component could render nothing and test still passes

**Fix:**
```typescript
it('should render all items', () => {
  const wrapper = mount(MyComponent, { props: { items: [1, 2, 3] } })
  expect(wrapper.findAll('.item').length).toBe(3)  // ✅ Validates content
})
```

---

### ❌ Anti-Pattern 2: Missing Event Payload
```typescript
it('should emit event', async () => {
  await wrapper.find('button').trigger('click')
  expect(wrapper.emitted('remove')).toBeTruthy()  // ❌ Doesn't check payload
})
```

**Why it's bad:** Event could emit wrong data and test passes

**Fix:**
```typescript
it('should emit remove event with correct item', async () => {
  await wrapper.find('button').trigger('click')
  expect(wrapper.emitted('remove')).toBeTruthy()
  expect(wrapper.emitted('remove')[0]).toEqual([expectedItem])  // ✅ Validates payload
})
```

---

### ❌ Anti-Pattern 3: Over-Stubbing
```typescript
stubs: {
  UiSheet: {
    template: '<div><slot /></div>',  // ❌ Loses v-model behavior
    props: ['open']
  }
}
```

**Why it's bad:** Stub doesn't emit events, hiding integration bugs

**Fix:**
```typescript
stubs: {
  UiSheet: {
    template: '<div v-if="open" @click="$emit(\'update:open\', false)"><slot /></div>',
    props: ['open']  // ✅ Stub emits events like real component
  }
}
```

---

## Best Test Patterns ✅

### Pattern 1: Count Rendered Elements
```typescript
it('should render all stories', () => {
  const wrapper = mount(EditorialStories, {
    props: { stories: mockStories }
  })
  const articles = wrapper.findAll('article')
  expect(articles.length).toBe(mockStories.length)  // ✅ Explicit count
})
```

---

### Pattern 2: Validate Event Payloads
```typescript
it('should emit chip with correct data', async () => {
  const chip = { id: '1', label: 'Test' }
  await wrapper.find('button').trigger('click')

  expect(wrapper.emitted('remove-chip')).toBeTruthy()
  expect(wrapper.emitted('remove-chip')[0]).toEqual([chip])  // ✅ Full payload check
})
```

---

### Pattern 3: Test State Changes
```typescript
it('should toggle selection correctly', async () => {
  const wrapper = mount(Checkbox, {
    props: { selected: ['red'] }
  })

  await wrapper.find('input').trigger('change')

  const emitted = wrapper.emitted('update:selected')
  expect(emitted[0][0]).toEqual(['red', 'blue'])  // ✅ Validates state mutation
})
```

---

## Mutation Testing Cheat Sheet

| Mutation Type | What to Test | Example Test |
|---------------|--------------|--------------|
| **Conditionals** | Empty states | `expect(wrapper.find('.list').exists()).toBe(false)` |
| **Events** | Name + payload | `expect(emitted('event')[0]).toEqual([data])` |
| **Loops** | Count items | `expect(wrapper.findAll('.item').length).toBe(3)` |
| **Logic** | State changes | `expect(newState).toEqual(expectedState)` |
| **Props** | Visibility | `expect(wrapper.find('.modal').exists()).toBe(true)` |

---

## Quality Grades

| Score | Grade | Assessment |
|-------|-------|------------|
| 90-100% | A | Excellent ✅✅✅ |
| 75-89% | B | Good ✅✅ |
| 60-74% | C | Fair ⚠️ |
| 0-59% | F | Needs Work ❌ |

**This Project: 63% (C - Fair)** ⚠️

---

## Quick Win Checklist

Before writing a new test, ask:

- [ ] Does it count rendered elements (not just check existence)?
- [ ] Does it validate event payloads (not just event names)?
- [ ] Does it test with empty data (edge case)?
- [ ] Does it verify state changes after user interaction?
- [ ] Are stubs minimal and realistic?

---

## Re-run Mutation Tests

After fixing tests, verify improvements:

```bash
# Run mutation test on specific file
npm run test:unit -- tests/components/product/__tests__/SearchBar.test.ts --run

# Manually introduce mutation to verify
sed -i '' 's/emit("update:searchQuery"/emit("search"/' components/product/SearchBar.vue
npm run test:unit -- tests/components/product/__tests__/SearchBar.test.ts --run
# Should FAIL if test is good

# Revert
git checkout components/product/SearchBar.vue
```

---

## Additional Resources

- **Full Report:** `MUTATION_TESTING_REPORT.md` (550 lines, 17KB)
- **Industry Standard:** 75-85% mutation score for production code
- **Tools:** Stryker Mutator (automated mutation testing)

---

**Last Updated:** January 5, 2026
**Mutation Score:** 63%
**Status:** Needs Improvement ⚠️
