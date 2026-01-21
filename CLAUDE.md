# Moldova Direct - Claude Code Instructions

**Project:** E-commerce platform (Nuxt 4 + Supabase + Vue 3)
**Stack:** Nuxt 4.2.2, Vite 7, Vue 3.5, Supabase, TailwindCSS

---

## 🎯 Project Overview

Multi-language e-commerce platform with admin panel for managing products, orders, and users.

**Key Features:**
- 4 locales: Spanish (es), English (en), Romanian (ro), Russian (ru)
- Admin panel with authentication
- Public e-commerce site
- Supabase backend with RLS

---

## 🚨 Critical Rules (Admin Panel Fixes - Branch: feat/admin-pages)

### ❌ NEVER: Dynamic Component Imports
```typescript
// ❌ CAUSES 500 ERRORS
const Component = useAsyncAdminComponent('Name')
const Component = defineAsyncComponent(() => import(`~/${path}.vue`))
```

### ✅ ALWAYS: Static Imports
```typescript
// ✅ CORRECT
import AdminDashboardOverview from '~/components/admin/Dashboard/Overview.vue'
```

**Why:** Vite cannot resolve dynamic imports with template strings. Results in "Unknown variable dynamic import" errors during SSR.

### ✅ Plugin Route Guards Required
```typescript
// plugins/*.client.ts
export default defineNuxtPlugin(() => {
  const route = useRoute()
  if (route.path.startsWith('/admin')) return // Skip admin
  // ... plugin logic
})
```

**Rule:** E-commerce plugins skip `/admin` routes, admin plugins skip public routes.

### ✅ Clear Cache After Structural Changes
```bash
pkill -9 node && rm -rf .nuxt node_modules/.vite .output && pnpm dev
```

**When:** After changing imports, adding components, or seeing import errors.

### ❌ NEVER: Skip Git Hooks
```bash
# ❌ FORBIDDEN - Never use these flags
git push --no-verify
git commit --no-verify
git push -n
```

**Why:** Git hooks ensure code quality, test coverage, and prevent regressions. If hooks fail, fix the underlying issue instead of bypassing them. Coverage thresholds exist to maintain code quality.

**If coverage fails:**
1. Add tests for new code
2. Exclude server files from unit coverage (tested via E2E)
3. Update thresholds only if justified and approved

---

## 📁 Project Structure

```
components/
├── admin/           # Admin panel components (auth required)
├── layout/          # Site layout components
├── product/         # Product display components
└── ui/              # Custom UI components

pages/
├── admin/           # Admin pages (middleware: auth + admin)
├── auth/            # Authentication pages
├── products/        # Public product pages
└── index.vue        # Homepage

plugins/
├── cart.client.ts           # Cart functionality (skip /admin)
├── cart-analytics.client.ts # Cart tracking (skip /admin)
└── supabase.client.ts       # Supabase client

i18n/locales/        # Translations (es, en, ro, ru)
```

---

## 🌍 Internationalization (i18n)

**Required:** All user-facing text must have translations in ALL 4 locales.

```typescript
// Add keys to all locale files
i18n/locales/es.json  // Spanish (primary)
i18n/locales/en.json  // English
i18n/locales/ro.json  // Romanian
i18n/locales/ru.json  // Russian
```

**Structure:**
```json
{
  "admin": {
    "navigation": { "dashboard": "Panel de Control" }
  },
  "product": {
    "details": { "price": "Precio" }
  }
}
```

---

## 🔐 Authentication Standards

**Admin Pages:**
```typescript
definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin'] // Both required
})
```

**Admin API Routes:**
```typescript
import { verifyAdminAuth } from '~/server/utils/adminAuth'

export default defineEventHandler(async (event) => {
  const user = await verifyAdminAuth(event) // Always verify first
  // ... route logic
})
```

---

## 🔄 Feature Implementation Workflow

### **CRITICAL:** Must Follow Instructions

After implementing any feature, you MUST follow this workflow:

1. **Testing Phase**
   - Test the feature using **Chrome DevTools MCP** (browser automation)
   - Verify all functionality works as expected
   - Test across different browsers and screen sizes
   - Ensure no console errors or warnings

2. **Commit Phase**
   - After testing is complete, commit the current state to git
   - Use descriptive commit messages
   - Ensure all changes are included

3. **Ready-to-Merge State**
   - Leave the project in a complete, ready-to-be-merged state
   - Feature must be fully working
   - All tests must pass
   - No broken functionality

4. **Feature List Management**
   - When implementing features: **ONLY update `implemented` and `tested` fields to `true`**
   - Do not change feature descriptions, IDs, or structure during feature implementation
   - Maintenance operations (syncing with GitHub issues, renaming to reflect architectural changes) are allowed during dedicated cleanup PRs
   - Update `docs/status/PROJECT_STATUS.md` to reflect progress

### Example Workflow
```bash
# 1. Implement the feature
# 2. Test using Chrome DevTools MCP
# 3. Update feature_list.json (mark as implemented and tested)
# 4. Commit to git
git add .
git commit -m "feat: implement [feature name] - tested and verified"
# 5. Verify project is ready to merge
pnpm build && pnpm test
```

---

## 📋 Before Committing Checklist

### Feature Implementation
- [ ] Feature fully implemented and working
- [ ] Tested using Chrome DevTools MCP
- [ ] `feature_list.json` updated (implemented: true, tested: true)
- [ ] `docs/status/PROJECT_STATUS.md` updated if needed
- [ ] Project left in ready-to-merge state

### Code Design (NEW - Prevents Monoliths)
- [ ] Component under 300 lines? (See: [CODE_DESIGN_PRINCIPLES.md](docs/development/CODE_DESIGN_PRINCIPLES.md))
- [ ] Business logic extracted to composables?
- [ ] Types defined in `types/*.ts`?
- [ ] Can test logic without DOM?
- [ ] Single responsibility per file?

### Admin Changes
- [ ] Static imports only (no dynamic imports)
- [ ] Plugin route guards in place
- [ ] Translations added to all 4 locales
- [ ] Cache cleared if imports changed
- [ ] All admin pages return 200 (not 500)

### General Changes
- [ ] Code follows existing patterns
- [ ] No console errors
- [ ] TypeScript types correct
- [ ] Responsive design works
- [ ] i18n keys in all locales
- [ ] **UI Components: Used shadcn-vue (UiButton, UiInput, etc.) NOT raw HTML**

---

## 🛠️ Common Commands

```bash
# Development
pnpm dev              # Start dev server (port 3000)

# Clean restart
pkill -9 node && rm -rf .nuxt node_modules/.vite && pnpm dev

# Testing
pnpm test             # Run tests
pnpm type-check       # TypeScript check

# Build
pnpm build            # Production build
pnpm preview          # Preview build

# Database
npx supabase status   # Check Supabase connection
```

---

## 📚 Detailed Documentation

### Documentation Structure (Updated January 2026)

The `docs/` folder uses **role-based navigation**. Start with the right path:

| If you are... | Start here |
|---------------|------------|
| 🆕 New to project | [Quick Start](docs/getting-started/QUICK_START_GUIDE.md) → [Tech Stack](docs/development/tech.md) → [Code Conventions](docs/development/code-conventions.md) |
| 🔄 Returning | [CHANGELOG](docs/CHANGELOG.md) → [Project Status](docs/status/PROJECT_STATUS.md) |
| 🐛 Debugging | [Troubleshooting](docs/development/troubleshooting-components.md) → [Testing Strategy](docs/guides/TESTING_STRATEGY.md) |
| 🛠️ Building feature | [Code Design Principles](docs/development/CODE_DESIGN_PRINCIPLES.md) → [Patterns](docs/development/PATTERNS_TO_PRESERVE.md) → [Components](docs/development/component-inventory.md) → [i18n](docs/features/I18N_CONFIGURATION.md) |

### Documentation Guidelines

When creating or updating documentation:

1. **Follow the structure** - Place docs in the appropriate folder:
   - `getting-started/` - Setup guides
   - `architecture/` - System design
   - `features/` - Feature-specific docs
   - `guides/` - How-to guides
   - `development/` - Patterns and standards
   - `testing/` - Test documentation
   - `status/` - Project progress
   - `archive/` - Historical/completed work

2. **Archive completed work** - Move finished specs to `docs/archive/completed-specs/`

3. **Consolidate research** - Keep one authoritative guide per topic, archive detailed research

4. **Update the README** - When adding important docs, update `docs/README.md`

5. **No stale references** - Current stack is Supabase + Vercel (not Cloudflare)

### Key Documentation Files

**Progress Tracking:**
- Feature list: `feature_list.json` - Comprehensive feature tracking with testing status
- Project status: `docs/status/PROJECT_STATUS.md` - Overall project completeness and current phase
- Initialization script: `init.sh` - Automated setup and testing guide

**Admin Panel Issues & Solutions:**
- Full details: `docs/archive/fixes/admin-fixes/ISSUES-AND-SOLUTIONS.md`
- Code review: `docs/archive/fixes/admin-fixes/CLEAN-CODE-REVIEW.md`

**Project Documentation:**
- Doc index: `docs/README.md` - Role-based navigation hub
- Main README: `README.md`

**Project Status:**
- Current status: `docs/status/PROJECT_STATUS.md`
- Roadmap: `docs/status/ROADMAP.md`
- Feature specs: `docs/specs/`

---

## 🎨 Coding Standards

**TypeScript:** Required for all new files
**Components:** Vue 3 Composition API with `<script setup>`
**Styling:** TailwindCSS utility classes
**State:** Pinia stores for shared state
**API:** Supabase client with RLS policies

---

## 🎨 UI Components (MANDATORY)

### ❌ NEVER: Raw HTML Form Elements
```vue
<!-- ❌ FORBIDDEN - Raw HTML elements with manual styling -->
<button class="rounded-lg border px-4 py-2...">Click</button>
<input type="text" class="w-full px-4 py-2 border..." />
<select class="rounded-lg border...">
  <option value="1">Option 1</option>
</select>
<label for="name">Name</label>
<textarea class="w-full px-4 py-2..."></textarea>
```

### ✅ ALWAYS: shadcn-vue Components
```vue
<!-- ✅ CORRECT - Use components/ui/ components -->
<UiButton variant="outline">Click</UiButton>
<UiInput v-model="name" placeholder="Name" />
<UiSelect v-model="value">
  <UiSelectTrigger>
    <UiSelectValue placeholder="Select..." />
  </UiSelectTrigger>
  <UiSelectContent>
    <UiSelectItem value="1">Option 1</UiSelectItem>
  </UiSelectContent>
</UiSelect>
<UiLabel for="name">Name</UiLabel>
<UiTextarea v-model="description" />
```

### Available shadcn-vue Components
Located in `components/ui/`:

| Category | Components |
|----------|------------|
| **Forms** | `UiInput`, `UiSelect`, `UiTextarea`, `UiCheckbox`, `UiSwitch`, `UiSlider`, `UiRadioGroup` |
| **Labels** | `UiLabel` |
| **Buttons** | `UiButton` (never raw `<button>`) |
| **Cards** | `UiCard`, `UiCardHeader`, `UiCardContent`, `UiCardFooter`, `UiCardTitle`, `UiCardDescription` |
| **Dialogs** | `UiDialog`, `UiAlertDialog`, `UiSheet` (side panel) |
| **Feedback** | `UiAlert`, `UiBadge`, `UiSonner` (toasts), `UiAvatar`, `UiSkeleton`, `UiProgress` |
| **Navigation** | `UiTabs`, `UiPagination`, `UiDropdownMenu`, `UiPopover`, `UiTooltip` |
| **Data Display** | `UiTable`, `UiAccordion` |

### When Raw HTML Is Allowed
```vue
<!-- ✅ ALLOWED - Layout divs (no semantic meaning) -->
<div class="grid grid-cols-2 gap-4">
<div class="flex items-center gap-2">
<div v-if="condition" class="p-4">

<!-- ✅ ALLOWED - Semantic HTML for structure -->
<nav>...</nav>
<main>...</main>
<section>...</section>
<article>...</article>
<header>...</header>
<footer>...</footer>

<!-- ✅ ALLOWED - SVG icons -->
<svg xmlns="http://www.w3.org/2000/svg">...</svg>
```

### ESLint Enforcement
This rule is **enforced by ESLint**:
```javascript
// eslint.config.mjs
'vue/no-restricted-html-elements': ['error', {
  elements: ['button', 'input', 'select', 'textarea', 'label'],
  message: 'Use shadcn-vue components instead...',
}]
```

If you see this error, replace the raw HTML with the corresponding `Ui*` component.

---

## 🏗️ Code Design Principles

**CRITICAL:** Read [Code Design Principles](docs/development/CODE_DESIGN_PRINCIPLES.md) before writing new features.

> *"Testability is not just about writing tests. It's about designing for testability from the beginning."*

### Quick Rules

| Rule | Limit | Action |
|------|-------|--------|
| **Component Size** | Max 300 lines | Extract when exceeded |
| **Function Size** | Max 50 lines | Break down further |
| **Cyclomatic Complexity** | Max 10 | Simplify logic |
| **File Responsibility** | One thing | Split if multiple |

### Before Committing New Code

```yaml
Design for Testability:
  ☐ Can test logic without DOM? (Extract to composable)
  ☐ Can test component in isolation? (Minimize dependencies)
  ☐ Business logic separate from UI? (Three-layer pattern)

Prevent Monoliths:
  ☐ File under 300 lines? (Else split)
  ☐ Single responsibility? (Else extract)
  ☐ Reusable logic in composable? (Not duplicated)

Three-Layer Pattern:
  ☐ Types in types/*.ts (contracts)
  ☐ Logic in composables/*.ts (testable without Vue)
  ☐ UI in components/**/*.vue (presentation only)
```

**Full guide:** `docs/development/CODE_DESIGN_PRINCIPLES.md`

---

## 📸 Visual Testing

Visual regression testing captures screenshots for review. All visual testing assets are organized in `.visual-testing/`.

### Directory Structure

```
.visual-testing/
├── baselines/          # Reference screenshots (git tracked)
│   └── [feature]/      # e.g., orders, products, checkout
│       └── [name]-[viewport].png
├── snapshots/          # Current test run (gitignored)
│   └── [timestamp]/
│       └── [feature]/
├── reports/            # HTML review reports (gitignored)
│   └── index.html
├── utils.ts            # Shared utilities
└── README.md           # Detailed documentation
```

### Commands

```bash
# Run visual tests for orders page
pnpm run test:visual:orders

# Run all visual tests
pnpm run test:visual:all

# Serve visual review report (starts local server)
pnpm run visual:serve
# Then open http://localhost:3333
```

### Naming Convention

Screenshots follow: `[name]-[viewport].png`

- **name**: Descriptive (kebab-case) - `full-page`, `metrics-section`, `filter-active`
- **viewport**: `mobile` (375px), `tablet` (768px), `desktop` (1440px)

### Adding Visual Tests

1. Create test in `tests/e2e/visual/[feature].spec.ts`
2. Import utilities from `.visual-testing/utils.ts`
3. Use `captureScreenshot()` or `captureResponsiveScreenshots()`
4. Run tests and review `.visual-testing/reports/index.html`

### Git Policy

- **baselines/** - Committed (reference images)
- **snapshots/** - Ignored (runtime)
- **reports/** - Ignored (generated)

---

**Last Updated:** 2026-01-21
**Admin Status:** All 5 pages working ✅
**Docs Structure:** Role-based navigation (January 2026 cleanup)
**Code Design:** Added principles to prevent monolithic components
**UI Components:** MANDATORY use of shadcn-vue (enforced by ESLint)


---

## Plan Mode

- Make the plan extremely concise. Sacrifice grammar for the sake of concision.
- At the end of each plan, give me a list of unresolved questions to answer, if any.
