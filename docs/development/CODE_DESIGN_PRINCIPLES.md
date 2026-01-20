# Code Design Principles

**Purpose:** Prevent architectural debt by designing for testability, maintainability, and modularity from the start.

> *"Testability is not just about writing tests. It's about designing for testability from the beginning."* - Fundamentals of Software Architecture, Ch 5

---

## The Golden Rules

### 1. Design for Testability First

> **"If you can't test it easily, your architecture is wrong."**

**Before writing any feature, ask:**
- Can I test the business logic without the UI?
- Can I test the component without its dependencies?
- Can I test in isolation or must I render the world?

**❌ Wrong: Monolithic component**
```vue
<script setup lang="ts">
// Everything mixed together - can't test without rendering entire UI
const form = reactive({ /* ... */ })
const addresses = ref<Address[]>([])
const showPasswordModal = ref(false)
const show2FAModal = ref(false)
const isLoading = ref(false)

const handleSubmit = async () => {
  // 50 lines of validation + API calls + UI state
  // Impossible to test in isolation
}
</script>
```

**✅ Right: Separated concerns**
```typescript
// composables/useProfileForm.ts - Testable without Vue!
export function useProfileForm() {
  const form = reactive<ProfileForm>({ /* ... */ })
  const validateForm = (): boolean => {
    // Pure logic - easy to test
    return form.name.length >= 2
  }
  return { form, validateForm }
}

// components/ProfileForm.vue - Just orchestrates UI
<script setup lang="ts">
const { form, validateForm } = useProfileForm()
// Component just renders and emits events
</script>
```

**Test the composable (no DOM needed):**
```typescript
describe('useProfileForm', () => {
  it('validates name length', () => {
    const { form, validateForm } = useProfileForm()
    form.name = 'A'
    expect(validateForm()).toBe(false)
  })
  // Fast: ~1ms, no rendering, no fragile DOM selectors
})
```

---

### 2. Component Size Limits

**Maximum component size: 300 lines**
**Preferred: 100-200 lines**
**Ideal: < 100 lines**

**Why?**
- Cognitive load: Humans can only hold ~7 things in working memory
- Scan time: A 100-line file takes ~30 seconds to understand
- Maintenance: Changes are localized to small files

**When you hit 300 lines, STOP and refactor:**

| Lines | Action | Example |
|-------|--------|---------|
| < 100 | ✅ Good | `AutoSaveIndicator.vue` (64 lines) |
| 100-200 | ⚠️ Monitor | `ProfilePersonalInfo.vue` (47 lines) |
| 200-300 | 🚨 Plan extraction | `ProfileSecuritySection.vue` (287 lines) → needs split |
| > 300 | ❌ Must refactor | `profile.vue` (1,359 lines) → monolithic |

**Extraction Pattern:**
```
When component grows beyond 300 lines:
  1. Identify distinct concerns (UI sections, business logic, data fetching)
  2. Extract business logic → composable
  3. Extract UI sections → separate components
  4. Extract shared types → types/*.ts
```

---

### 3. The Composable Decision Tree

**Should this be a composable?**

```
                   ┌─────────────────┐
                   │   Need state?   │
                   └────────┬────────┘
                            │
                   No ──────┴────── Yes
                   │                    │
                   ▼                    ▼
            ┌─────────────┐    ┌──────────────────┐
            │ Plain       │    │ Is it UI-specific?│
            │ function    │    └────────┬─────────┘
            └─────────────┘             │
                              Yes ──────┴────── No
                              │                    │
                              ▼                    ▼
                       ┌─────────────┐     ┌──────────────┐
                       │ Keep in     │     │ Is it reused  │
                       │ component   │     │ or complex?  │
                       └─────────────┘     └──────┬───────┘
                                                 │
                                    No ──────────┴───────── Yes
                                    │                       │
                                    ▼                       ▼
                             ┌─────────────┐         ┌──────────┐
                             │ Keep in     │         │ Extract  │
                             │ component   │         │ Composable│
                             └─────────────┘         └──────────┘
```

**Examples:**

| Scenario | Decision | Reason |
|----------|----------|--------|
| Form state + validation | ✅ Composable | Business logic, reusable |
| Toggle modal visibility | ❌ Component | UI-specific, simple |
| Data fetching + caching | ✅ Composable | Complex, reusable |
| Scroll position | ❌ Component | UI-specific |
| Authentication state | ✅ Composable (`useAuth`) | Global, reused everywhere |
| Format currency | ❌ Utils function | Pure, no state |

---

### 4. Three-Layer Separation

**Every feature should have three distinct layers:**

```
┌─────────────────────────────────────────────────────────────┐
│  LAYER 1: TYPES (Contract)                                  │
│  File: types/*.ts                                          │
│  • Defines interfaces                                      │
│  • No logic, no imports from other layers                  │
│  • Imported by everyone                                    │
├─────────────────────────────────────────────────────────────┤
│  LAYER 2: COMPOSABLES (Business Logic)                     │
│  File: composables/use*.ts                                 │
│  • Contains state & business rules                         │
│  • Imports from TYPES, utils, server API                   │
│  • NO component imports                                    │
│  • Testable without Vue                                    │
├─────────────────────────────────────────────────────────────┤
│  LAYER 3: COMPONENTS (Presentation)                        │
│  File: components/**/*.vue                                 │
│  • Renders UI                                              │
│  • Handles user input                                      │
│  • Imports from TYPES, COMPOSABLES                         │
│  • Minimal logic (just delegation)                         │
└─────────────────────────────────────────────────────────────┘
```

**Dependency Rule:** One-way only
```
Components ──use──► Composables ──use──► Types
     │                              ▲
     └─────────────import─────────────┘

❌ FORBIDDEN:
  • Composables importing Components
  • Types importing Composables/Components
```

---

### 5. The Single Responsibility Table

**Before committing code, check:**

| Question | If YES | If NO |
|----------|--------|-------|
| Can I describe what this file does in 5 words? | ✅ Good | ⚠️ Too complex |
| Does changing X require touching file Y? | ❌ Coupled | ✅ Independent |
| Can I test this without rendering DOM? | ✅ Testable | ⚠️ Extract logic |
| Does this file do ONE thing well? | ✅ Focused | ❌ Split it |
| Is every function under 20 lines? | ✅ Simple | ⚠️ Break down |
| Can I reuse this in another context? | ✅ Valuable | ⚠️ Consider extracting |

---

## Common Anti-Patterns (Avoid These)

### ❌ The God Object

```vue
<!-- One component does everything -->
<script setup lang="ts">
// 50+ imports
// 1000+ lines
// Handles: forms, modals, API calls, validation, UI state
</script>
```

**Fix:** Extract to multiple focused components + composables

### ❌ The Smarty Component

```vue
<script setup lang="ts">
// Component contains business logic that should be in composable
const calculateDiscount = () => {
  // 30 lines of business rules
}
</script>
```

**Fix:** Move business logic to composable, keep component dumb

### ❌ The Chatty Component

```vue
<script setup lang="ts>
// Component directly manipulates parent's state
const parent = getCurrentInstance()?.parent
parent?.exposed?.someMethod()
</script>
```

**Fix:** Use props/emits for communication

### ❌ The Utility Pretender

```typescript
// File named "utils" but contains domain logic
export const processUser = (user: User) => {
  // 50 lines of user-specific logic
  // Should be in useUser() composable
}
```

**Fix:** If it has state or domain logic → composable. Pure functions only → utils.

---

## Component Naming Conventions

**Pattern:** `[Scope][Purpose][Type].vue`

| Pattern | Example | When to Use |
|---------|---------|-------------|
| `ProfilePage.vue` | AdminUsersPage.vue | Full page component |
| `ProfileSection.vue` | ProfilePersonalInfo.vue | Major UI section |
| `ProfileButton.vue` | AddToCartButton.vue | Reusable UI element |
| `ProfileModal.vue` | PasswordChangeModal.vue | Modal/Dialog |
| `ProfileIndicator.vue` | AutoSaveIndicator.vue | Status/display only |

**Composable Naming:** `use[Feature].ts`

| Good | Bad |
|------|------|
| `useProfileForm.ts` | `profileForm.ts` |
| `useAuth.ts` | `auth.ts` |
| `useCart.ts` | `shoppingCart.ts` |

---

## Quick Reference Checklist

**Before committing new code:**

```yaml
Component Size:
  ☐ Under 300 lines? (prefer <200)
  ☐ Single responsibility?
  ☐ Descriptive name?

Separation:
  ☐ Types in types/*.ts?
  ☐ Business logic in composables/*?
  ☐ Component only handles UI?

Testability:
  ☐ Can test logic without DOM?
  ☐ Can test component in isolation?
  ☐ Mocked external dependencies?

Coupling:
  ☐ No direct child access?
  ☐ Communication via props/emits?
  ☐ No circular dependencies?

Documentation:
  ☐ Complex functions commented?
  ☐ Props/Emits typed?
```

---

## Related Skills & Documentation

This document works together with existing skills:

| For... | See | Alignment |
|--------|-----|------------|
| **Vue 3 Composition API** | `.claude/skills/vue/` | Component/composable patterns |
| **Nuxt 4 patterns** | `.claude/skills/nuxt/` | Framework-specific guidance |
| **Testing patterns** | `.claude/skills/frontend-testing-vue/` | How to write tests once code is testable |
| **TDD workflow** | `.claude/skills/tdd-loop/` | Test-driven development process |
| **Backend architecture** | `.claude/skills/architecture-patterns/` | Clean/Hexagonal architecture |
| **UI/UX design** | `.claude/skills/design-guide/` | Visual design principles |
| **E2E testing** | `.claude/skills/playwright-skill/` | Browser automation |

**How they work together:**

```
┌─────────────────────────────────────────────────────────────┐
│  1. CODE_DESIGN_PRINCIPLES                                  │
│     "Design for testability from the beginning"             │
│     • Component size limits                                 │
│     • Three-layer separation                                │
│     • When to extract composables                           │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  2. Vue Skill + Nuxt Skill                                  │
│     "Implementation patterns"                               │
│     • Composition API usage                                 │
│     • Component structure                                   │
│     • Props/emits patterns                                  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  3. Frontend-Testing-Vue Skill + TDD-Loop                   │
│     "Verify quality"                                        │
│     • Write tests (TDD: test first!)                        │
│     • Run tests                                             │
│     • Refactor                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Reading References

- **Fundamentals of Software Architecture**
  - Chapter 4: Modularity (p. 68-95)
  - Chapter 5: Architectural Characteristics (p. 104-140)
  - Chapter 6: Architectural Styles (p. 156-195)

- **Related Docs:**
  - `docs/development/profile-refactor-architecture-deep-dive.md`
  - `docs/development/code-conventions.md`

---

**Last Updated:** 2026-01-19
**Status:** Active - Review quarterly
