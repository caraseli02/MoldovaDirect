# Plan: Write Comprehensive Tests for profile.vue Before Refactoring

**Goal**: Create safety-net tests for 1,359-line profile.vue component to enable confident refactoring

**Why Option 1 (Test First)**: The existing `tests/pages/account/profile.test.ts` only tests a mock component. Real functionality is untested.

**Aligns with**: `docs/testing/TDD_LARGE_FILE_REFACTORING_PLAN.md` - Week 1: Profile Page Test Suite

---

## Alignment with Existing Test Documentation

### Following TDD Plan Requirements
From `TDD_LARGE_FILE_REFACTORING_PLAN.md`, profile.vue is listed as **Week 1, High Priority**:

| Requirement | How We'll Meet It |
|-------------|------------------|
| **Coverage >90% line** | 9 test suites covering all functionality |
| **Coverage >85% branch** | Test all validation branches, error paths |
| **Coverage >95% function** | Test every method in component |
| **100% pass rate** | Fix flaky tests before considering complete |
| **<5% flaky test rate** | Avoid race conditions with fake timers |

### Known Problems to Avoid

Based on testing documentation and past issues:

| Problem | Solution in Our Plan |
|---------|---------------------|
| **Firefox test failures** | Use `data-testid` selectors (not CSS selectors) |
| **Race conditions** | Use `vi.useFakeTimers()` for debounce, proper `await` for async |
| **Mobile test config** | Add `hasTouch: true` for mobile-specific tests |
| **Hardcoded paths** | Use cross-platform path handling for file mocks |
| **Flaky tests** | Clear mocks in `beforeEach`, isolate test state |
| **Missing cleanup** | Proper timeout cleanup, event listener removal |

### Test Types from Documentation

| Type | Purpose | Our Coverage |
|------|---------|--------------|
| **Unit Tests** | Functions, computed properties | Form validation, completion % |
| **Component Tests** | Props, events, lifecycle | All user interactions |
| **Integration Tests** | API calls, state | Supabase auth, storage, addresses |
| **E2E Tests** | User workflows | Already exists in `tests/e2e/account/` |
| **Visual Tests** | UI regression | Use existing `.visual-testing/` framework |

---

## Phase 1: Test Infrastructure Setup (30 min)

### 1.1 Create Test Helper Utilities

**File**: `tests/pages/account/helpers.ts` (new)

```typescript
// Test helpers for profile page testing
export function createMockUser(overrides = {}) { ... }
export function createMockAddresses(count = 2) { ... }
export function mockSupabaseAuthUpdate() { ... }
export function mockSupabaseStorage() { ... }
export function waitForAutoSave() { ... }
```

### 1.2 Mock Supabase Storage

**File**: `tests/mocks/supabaseStorage.ts` (new)

- Mock bucket operations (upload, remove, getPublicUrl)
- File validation helpers
- Error simulation helpers

---

## Phase 2: Write Component Tests (incremental - one file at a time)

### File Structure
```
tests/pages/account/
├── profile/
│   ├── __tests__/
│   │   ├── component-structure.spec.ts    ✅ DOM rendering, sections
│   │   ├── avatar-upload.spec.ts          ✅ File upload, drag-drop, removal
│   │   ├── form-validation.spec.ts        ✅ Name, phone validation
│   │   ├── auto-save.spec.ts              ✅ Debouncing, save status
│   │   ├── address-management.spec.ts     ✅ CRUD operations
│   │   ├── profile-completion.spec.ts     ✅ Completion percentage
│   │   ├── modals.spec.ts                 ✅ All 5 modals, focus trap
│   │   ├── accessibility.spec.ts          ✅ Keyboard nav, ARIA
│   │   └── lifecycle.spec.ts              ✅ Mount, unmount, watchers
│   └── helpers.ts
```

### Test Specifications

#### 2.1 Component Structure (`component-structure.spec.ts`)
```typescript
describe('Profile Page - Component Structure', () => {
  it('should render all accordion sections', () => { ... })
  it('should render avatar section with upload button', () => { ... })
  it('should render profile completion indicator', () => { ... })
  it('should render delete account button', () => { ... })
  it('should have correct data-testid attributes', () => { ... })
})
```

#### 2.2 Avatar Upload (`avatar-upload.spec.ts`)
```typescript
describe('Profile Page - Avatar Upload', () => {
  it('should show user initials when no avatar', () => { ... })
  it('should show avatar image when URL exists', () => { ... })
  it('should trigger file input on camera button click', () => { ... })
  it('should validate file type (images only)', () => { ... })
  it('should validate file size (max 5MB)', () => { ... })
  it('should upload file to Supabase Storage', () => { ... })
  it('should update user metadata with avatar URL', () => { ... })
  it('should handle drag over state', () => { ... })
  it('should handle drag leave correctly', () => { ... })
  it('should handle file drop for upload', () => { ... })
  it('should remove avatar and clear metadata', () => { ... })
  it('should show loading state during upload', () => { ... })
  it('should show error message on upload failure', () => { ... })
})
```

#### 2.3 Form Validation (`form-validation.spec.ts`)
```typescript
describe('Profile Page - Form Validation', () => {
  it('should require name (min 2 chars)', () => { ... })
  it('should show error for empty name', () => { ... })
  it('should show error for name < 2 chars', () => { ... })
  it('should validate phone format (9+ digits)', () => { ... })
  it('should allow empty phone (optional)', () => { ... })
  it('should show error for invalid phone', () => { ... })
  it('should mark invalid fields with red border', () => { ... })
  it('should scroll to first error on save', () => { ... })
})
```

#### 2.4 Auto-Save (`auto-save.spec.ts`)
```typescript
describe('Profile Page - Auto-Save', () => {
  it('should debounce save by 1 second', () => { ... })
  it('should show saving status during save', () => { ... })
  it('should show saved status after success', () => { ... })
  it('should hide saved status after 2 seconds', () => { ... })
  it('should show error status on failure', () => { ... })
  it('should keep error visible for 5 seconds', () => { ... })
  it('should cancel pending save on new input', () => { ... })
  it('should update originalForm after successful save', () => { ... })
  it('should save preferences on select change (immediate)', () => { ... })
})
```

#### 2.5 Address Management (`address-management.spec.ts`)
```typescript
describe('Profile Page - Address Management', () => {
  it('should load addresses on mount', () => { ... })
  it('should map database fields to camelCase', () => { ... })
  it('should show address count text', () => { ... })
  it('should highlight default address', () => { ... })
  it('should open address form modal for new address', () => { ... })
  it('should open address form modal for editing', () => { ... })
  it('should create new address', () => { ... })
  it('should update existing address', () => { ... })
  it('should verify user owns address before update', () => { ... })
  it('should show delete confirmation modal', () => { ... })
  it('should delete address after confirmation', () => { ... })
  it('should verify user owns address before delete', () => { ... })
  it('should show loading state during delete', () => { ... })
  it('should reload addresses after operation', () => { ... })
})
```

#### 2.6 Profile Completion (`profile-completion.spec.ts`)
```typescript
describe('Profile Page - Profile Completion', () => {
  it('should show 0% with empty profile', () => { ... })
  it('should increment for valid name (2+ chars)', () => { ... })
  it('should increment for valid phone format', () => { ... })
  it('should increment for avatar', () => { ... })
  it('should increment for having addresses', () => { ... })
  it('should increment only for explicit preferences (not defaults)', () => { ... })
  it('should calculate percentage correctly', () => { ... })
})
```

#### 2.7 Modals (`modals.spec.ts`)
```typescript
describe('Profile Page - Modals', () => {
  describe('Password Modal', () => {
    it('should open on button click', () => { ... })
    it('should close on backdrop click', () => { ... })
    it('should close on Escape key', () => { ... })
    it('should trap focus within modal', () => { ... })
    it('should focus first element on open', () => { ... })
  })

  describe('2FA Modal', () => {
    it('should open on button click', () => { ... })
    it('should close on backdrop click', () => { ... })
    it('should trap focus within modal', () => { ... })
  })

  describe('Delete Account Modal', () => {
    it('should receive password and reason', () => { ... })
    it('should call delete API endpoint', () => { ... })
  })

  describe('Delete Address Modal', () => {
    it('should show address to delete', () => { ... })
    it('should execute delete on confirm', () => { ... })
  })

  describe('Address Form Modal', () => {
    it('should pre-fill for editing', () => { ... })
    it('should be empty for new address', () => { ... })
    it('should emit save with address data', () => { ... })
  })
})
```

#### 2.8 Accessibility (`accessibility.spec.ts`)
```typescript
describe('Profile Page - Accessibility', () => {
  it('should have proper ARIA labels on accordions', () => { ... })
  it('should update aria-expanded on toggle', () => { ... })
  it('should support keyboard navigation between accordions', () => { ... })
  it('should focus accordion on navigate-first/last/next/prev', () => { ... })
  it('should trap focus in modals', () => { ... })
  it('should have proper form labels', () => { ... })
  it('should announce save status to screen readers', () => { ... })
})
```

#### 2.9 Lifecycle (`lifecycle.spec.ts`)
```typescript
describe('Profile Page - Lifecycle', () => {
  it('should initialize form with user data on mount', () => { ... })
  it('should load addresses on mount', () => { ... })
  it('should add beforeunload listener for unsaved changes', () => { ... })
  it('should reload data when user changes', () => { ... })
  it('should show toast on session expiration', () => { ... })
  it('should cleanup timeouts on unmount', () => { ... })
  it('should remove event listeners on unmount', () => { ... })
})
```

---

## Phase 3: Run and Verify Tests (1 hour)

### 3.1 Execute All Tests
```bash
pnpm test tests/pages/account/profile/
```

### 3.2 Coverage Report
```bash
pnpm test:coverage -- tests/pages/account/profile/
```

Target: **>90% line coverage** (TDD plan requirement)

### 3.3 Fix Failing Tests
- Debug mock issues
- Fix timing issues with fake timers
- Adjust assertions

---

## Phase 4: Document Test Coverage (30 min)

### Update feature_list.json
```json
{
  "id": "td-files-1-pretest",
  "description": "Add comprehensive test coverage for profile.vue before refactoring",
  "implemented": true,
  "tested": true
}
```

---

## Execution Order (Incremental Workflow from `frontend-testing-vue` Skill)

**CRITICAL: Follow incremental approach - ONE file at a time:**

```
For each test file:
  ┌─────────────────────────────────────────┐
  │ 1. Write single test file              │
  │ 2. Run: pnpm test:unit <file>.test.ts  │
  │ 3. PASS? → Commit, next file           │
  │    FAIL? → Fix first, then continue    │
  └─────────────────────────────────────────┘
```

| Day | Tasks | Command to Run |
|-----|-------|----------------|
| **1 Morning** | Phase 1: Setup helpers, mocks | `pnpm test:unit helpers.ts` |
| **1 Afternoon** | Phase 2.1: Component structure ONLY | `pnpm test:unit component-structure.spec.ts` |
| **2 Morning** | Phase 2.2: Avatar upload (run & fix before next) | `pnpm test:unit avatar-upload.spec.ts` |
| **2 Midday** | Phase 2.3: Form validation | `pnpm test:unit form-validation.spec.ts` |
| **2 Afternoon** | Phase 2.4: Auto-save | `pnpm test:unit auto-save.spec.ts` |
| **3 Morning** | Phase 2.5: Address management | `pnpm test:unit address-management.spec.ts` |
| **3 Midday** | Phase 2.6-2.7: Completion, Modals | `pnpm test:unit profile-*.spec.ts` |
| **3 Afternoon** | Phase 2.8-2.9: Accessibility, Lifecycle | `pnpm test:unit *.spec.ts` |
| **4 Morning** | Phase 3: Run all, verify coverage | `pnpm test:coverage -- tests/pages/account/profile/` |
| **4 Afternoon** | Phase 4: Document, smoke test | `pnpm test:unit tests/pages/account/profile/` |

**After EACH test file passes:**
```bash
git add tests/pages/account/profile/__tests__/[name].spec.ts
git commit -m "test: add [name] tests for profile.vue"
```

---

## Critical Files to Modify

**New Files:**
- `tests/pages/account/profile/__tests__/*.spec.ts` (9 test files)
- `tests/pages/account/helpers.ts` (test helpers)
- `tests/mocks/supabaseStorage.ts` (Supabase Storage mock)

**Files to Read:**
- `pages/account/profile.vue` (component under test)
- `tests/setup/vitest.setup.ts` (existing setup)
- `tests/utils/mockSupabase.ts` (existing Supabase mocks)

**Files to Update:**
- `feature_list.json` (mark test pre-req complete)

---

## Success Criteria (Aligned with TDD Plan Quality Gates)

**Coverage Targets (from TDD plan):**
- ✅ **>90% line coverage** (TDD requirement for large files)
- ✅ **>85% branch coverage** (all validation/error paths)
- ✅ **>95% function coverage** (every method tested)

**Quality Gates:**
- ✅ All 9 test suites pass consistently (100% pass rate)
- ✅ No tests use mock component (real component mounted)
- ✅ Tests catch intentional regressions (smoke test before refactoring)
- ✅ CI/CD passes with new tests
- ✅ **<5% flaky test rate** (avoid race conditions)

**Refactoring Readiness (from TDD plan checklist):**
- ✅ Component structure tests (renders without errors)
- ✅ Functionality tests (all user interactions)
- ✅ Error handling tests (loading, error, empty states)
- ✅ Accessibility tests (keyboard nav, ARIA, focus)
- ✅ Mobile responsiveness tests

---

## Notes & Known Problems to Avoid

**Testing Patterns (from `frontend-testing-vue` skill + existing codebase):**
- Use `vi.useFakeTimers()` for debounce testing (avoid race conditions)
- Use `data-testid` selectors (Firefox compatibility, not CSS selectors)
- Mock `window.addEventListener` for beforeunload
- Use `createTestingPinia` for Pinia isolation
- Stub child components (AddressFormModal, DeleteAccountModal, ProfileAccordionSection)
- **CRITICAL**: Dynamic import pattern for Nuxt composables:
  ```typescript
  // ✅ Mock BEFORE dynamic import
  vi.mock('#app', () => ({ useSupabaseClient: vi.fn() }))
  const { useSupabaseClient } = await import('#app')
  ```

**AAA Pattern (Arrange-Act-Assert) for each test:**
```typescript
it('should show error when name is empty', async () => {
  // Arrange
  const wrapper = mount(ProfilePage)
  const nameInput = wrapper.find('[data-testid="name-input"]')

  // Act
  await nameInput.setValue('')
  await nameInput.trigger('blur')

  // Assert
  expect(wrapper.find('[data-testid="name-error"]').exists()).toBe(true)
})
```

**Anti-Patterns to Avoid (from test docs + skill):**
- ❌ Don't skip git hooks (forbidden in project)
- ❌ Don't use CSS selectors (`find('.btn')`) → use `find('[data-testid="save-btn"]')`
- ❌ Don't forget cleanup in `beforeEach` (causes flaky tests)
- ❌ Don't use hardcoded paths (breaks cross-platform)
- ❌ Don't use `waitForTimeout` → use proper waits (`await vi.advanceTimersByTimeAsync()`)
- ❌ Don't generate all tests at once → **INCREMENTAL: Write one file → Run → Fix → Next**

**Mobile Testing:**
- Add `hasTouch: true` configuration for touch-specific tests
- Test 44x44px minimum touch targets

**Test Naming Convention (from skill):**
- Use `should <behavior> when <condition>` format
- Example: `it('should show error message when validation fails')`
