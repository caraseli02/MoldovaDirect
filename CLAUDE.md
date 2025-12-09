# Moldova Direct - Claude Code Instructions

**Project:** E-commerce platform (Nuxt 4 + Supabase + Vue 3)
**Stack:** Nuxt 4.1.3, Vite 7, Vue 3.5, Supabase, TailwindCSS

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
pkill -9 node && rm -rf .nuxt node_modules/.vite .output && npm run dev
```

**When:** After changing imports, adding components, or seeing import errors.

---

## 📁 Project Structure

```
components/
├── admin/           # Admin panel components (auth required)
├── layout/          # Site layout components
├── product/         # Product display components
└── ui/              # Shadcn UI components

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
   - **Strictly do not remove or modify anything in `feature_list.json`**
   - **ONLY update the `implemented` and `tested` fields to `true`**
   - Do not change feature descriptions, IDs, or structure
   - Update `claude-progress.md` to reflect progress

### Example Workflow
```bash
# 1. Implement the feature
# 2. Test using Chrome DevTools MCP
# 3. Update feature_list.json (mark as implemented and tested)
# 4. Commit to git
git add .
git commit -m "feat: implement [feature name] - tested and verified"
# 5. Verify project is ready to merge
npm run build && npm run test
```

---

## 📋 Before Committing Checklist

### Feature Implementation
- [ ] Feature fully implemented and working
- [ ] Tested using Chrome DevTools MCP
- [ ] `feature_list.json` updated (implemented: true, tested: true)
- [ ] `claude-progress.md` updated with progress
- [ ] Project left in ready-to-merge state

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

---

## 🛠️ Common Commands

```bash
# Development
npm run dev              # Start dev server (port 3000)

# Clean restart
pkill -9 node && rm -rf .nuxt node_modules/.vite && npm run dev

# Testing
npm run test             # Run tests
npm run type-check       # TypeScript check

# Build
npm run build            # Production build
npm run preview          # Preview build

# Database
npx supabase status      # Check Supabase connection
```

---

## 📚 Detailed Documentation

**Progress Tracking:**
- Feature list: `feature_list.json` - Comprehensive feature tracking with testing status
- Progress tracking: `claude-progress.md` - Overall project completeness and metrics
- Initialization script: `init.sh` - Automated setup and testing guide

**Admin Panel Issues & Solutions:**
- Full details: `docs/fixes/admin-fixes/ISSUES-AND-SOLUTIONS.md`
- Code review: `docs/fixes/admin-fixes/CLEAN-CODE-REVIEW.md`

**Project Documentation:**
- Doc index: `docs/README.md`
- Documentation index: `docs/meta/DOCUMENTATION_INDEX.md`
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

**Last Updated:** 2025-12-08
**Admin Status:** All 5 pages working ✅
**New Files:** `feature_list.json`, `claude-progress.md`, `init.sh`
