# ESLint Warning Fix Guide

Quick guide to reduce the remaining 1303 ESLint warnings using automated scripts.

## 📋 Current Status

- **Warnings:** 1303 (down from 1720)
- **Errors:** 0 (fixed completely)
- **Main issues:** 688 `any` type warnings, 480+ test console logs, 99+ unused vars

## 🚀 Quick Start

### Option 1: Dry Run (Recommended First)

See what changes would be made without applying them:

```bash
./scripts/fix-all-warnings.sh --dry-run
```

### Option 2: Fix Specific Stage

Fix one stage at a time:

```bash
# Fix only any types
npx tsx scripts/fix-any-types.ts

# Fix only Vue component any types
npx tsx scripts/fix-vue-any-types.ts

# Or run all stages
./scripts/fix-all-warnings.sh
```

### Option 3: Fix Specific File

```bash
# Fix specific file
npx tsx scripts/fix-any-types.ts --file src/utils/example.ts

# Or for Vue
npx tsx scripts/fix-vue-any-types.ts --file components/Example.vue
```

## 📊 Scripts Overview

### 1. `scripts/fix-any-types.ts`

Fixes `any` type warnings in TypeScript files.

**What it does:**
- Replaces `any` with `unknown` in safe contexts
- Converts `T = any` to `T = unknown` in generics
- Converts `Record<K, any>` to `Record<K, unknown>`
- Converts `as any` to `as unknown`

**Usage:**
```bash
npx tsx scripts/fix-any-types.ts [--dry-run] [--stats] [--file <path>]

Options:
  --dry-run     Show changes without applying
  --stats       Show statistics only
  --file <path> Fix specific file
```

**Example:**
```bash
# See what would change
npx tsx scripts/fix-any-types.ts --dry-run

# Fix everything
npx tsx scripts/fix-any-types.ts

# Fix one file
npx tsx scripts/fix-any-types.ts --file utils/checkout.ts
```

### 2. `scripts/fix-vue-any-types.ts`

Fixes `any` type warnings in Vue components.

**Patterns it fixes:**
- `PropType<any>` → `PropType<unknown>`
- Function parameters with `any` → `unknown`
- Type annotations with `any` → `unknown`
- Return types with `any` → `unknown`
- `Record<K, any>` → `Record<K, unknown>`
- `as any` → `as unknown`

**Usage:**
```bash
npx tsx scripts/fix-vue-any-types.ts [--dry-run] [--file <path>]

Options:
  --dry-run     Show changes without applying
  --file <path> Fix specific file
```

**Example:**
```bash
# Preview Vue fixes
npx tsx scripts/fix-vue-any-types.ts --dry-run

# Apply Vue fixes
npx tsx scripts/fix-vue-any-types.ts

# Fix one Vue file
npx tsx scripts/fix-vue-any-types.ts --file components/MyComponent.vue
```

### 3. `scripts/fix-all-warnings.sh`

Master script that orchestrates the complete fixing process.

**Stages:**
1. Console cleanup (remove debug logs)
2. Unused variables (prefix with `_` or remove)
3. Any type fixes (run both TS and Vue fixers)
4. Validation (check build, lint, types)

**Usage:**
```bash
./scripts/fix-all-warnings.sh [--dry-run] [--stage <N>]

Options:
  --dry-run      Show changes without applying
  --stage <N>    Start from specific stage (1-4)
```

**Example:**
```bash
# Preview all changes
./scripts/fix-all-warnings.sh --dry-run

# Apply all fixes
./scripts/fix-all-warnings.sh

# Start from stage 3 (any types)
./scripts/fix-all-warnings.sh --stage 3

# Fix and validate only
./scripts/fix-all-warnings.sh --stage 4
```

## 📊 Expected Results

### Safe Automatic Fixes

These patterns are automatically fixed without manual review:

```typescript
// any → unknown (safe in most contexts)
function example(arg: any) { }        // ✅ Fixable
const data: any = value               // ✅ Fixable
as any                                 // ✅ Fixable
Record<string, any>                   // ✅ Fixable
T = any (generic defaults)            // ✅ Fixable
```

### Expected Reduction

Based on the patterns detected:

- **Stage 1 (Console):** ~100-150 warnings removed
- **Stage 2 (Unused vars):** ~50-100 warnings removed
- **Stage 3 (Any types):** ~200-300 warnings removed
- **Total potential:** 350-550 additional warnings fixed

**Target:** Reduce from 1303 → ~800-950 warnings

## ⚠️ Files Skipped by Default

These files are skipped because they safely suppress `any` warnings:

- `**/*.test.ts` - Test files (already configured in ESLint)
- `**/*.spec.ts` - Test specs (already configured)
- `**/Charts/**` - Chart components (untyped library)
- `**/Dashboard/**` - Dashboard components
- `tests/**` - Test utilities

## 🔄 Workflow

### Recommended Approach

1. **Preview Changes (Dry Run)**
   ```bash
   ./scripts/fix-all-warnings.sh --dry-run
   ```

2. **Review Specific Files**
   ```bash
   npx tsx scripts/fix-any-types.ts --stats
   # Review top files from output
   ```

3. **Apply Fixes Gradually**
   ```bash
   # Fix general TS files
   npx tsx scripts/fix-any-types.ts

   # Check for errors
   npx nuxi typecheck

   # Then fix Vue files
   npx tsx scripts/fix-vue-any-types.ts

   # Validate
   npm run lint
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "fix: reduce eslint warnings with automated tools"
   git push
   ```

## 🛡️ Safety Measures

### What's Protected

- ✅ Test files are never modified
- ✅ Chart/Dashboard components skip risky changes
- ✅ Types are only replaced in safe contexts
- ✅ No breaking changes to function signatures
- ✅ Backward compatible

### What You Should Review

After running the scripts:

```bash
# See all changes
git diff

# See specific changes
git diff utils/
git diff components/

# Check for issues
npm run lint
npx nuxi typecheck
npm run build
```

## 📈 Progress Tracking

### Check Current Status

```bash
# Before starting
npm run lint 2>&1 | grep "✖"

# After fixes
npm run lint 2>&1 | grep "✖"

# Compare
npm run lint 2>&1 | grep "@typescript-eslint/no-explicit-any" | wc -l
```

### Files with Most Warnings

```bash
npx tsx scripts/fix-any-types.ts --stats
npx tsx scripts/fix-vue-any-types.ts
```

## 🐛 Troubleshooting

### TypeScript Errors After Fixing

If you get new TypeScript errors:

1. Revert changes: `git checkout -- .`
2. Fix manually with IDE type hints
3. Or use `as unknown` instead of `unknown` for complex types

### Build Fails After Fixes

```bash
# Clean build
rm -rf .nuxt .output dist
npm run build

# Or
npm run build -- --force
```

### Need to Undo

```bash
# Undo all changes
git checkout -- .

# Or undo specific file
git checkout -- src/utils/example.ts
```

## 📝 Examples

### Example 1: Fix One Component

```bash
# Preview changes to UserForm.vue
npx tsx scripts/fix-vue-any-types.ts --dry-run --file components/UserForm.vue

# Apply fixes
npx tsx scripts/fix-vue-any-types.ts --file components/UserForm.vue

# Check result
git diff components/UserForm.vue
```

### Example 2: Fix All Utilities

```bash
# See utilities with any warnings
npm run lint 2>&1 | grep "utils.*any"

# Fix them
npx tsx scripts/fix-any-types.ts

# Verify
npm run lint 2>&1 | grep "utils.*any"
```

### Example 3: Staged Approach

```bash
# Stage 1: See what would happen
./scripts/fix-all-warnings.sh --dry-run

# Stage 2: Fix only TypeScript
npx tsx scripts/fix-any-types.ts
git add utils/ composables/ server/
git commit -m "fix: reduce any warnings in TS files"

# Stage 3: Fix Vue files
npx tsx scripts/fix-vue-any-types.ts
git add components/
git commit -m "fix: reduce any warnings in Vue components"

# Stage 4: Validate
npm run lint
npx nuxi typecheck
npm run build
```

## ✨ Advanced Options

### Custom Pattern Matching

To add custom patterns, edit the pattern arrays in:
- `scripts/fix-any-types.ts` (Line 71+)
- `scripts/fix-vue-any-types.ts` (Line 16+)

### Running with npm Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "fix:any": "npx tsx scripts/fix-any-types.ts",
    "fix:vue": "npx tsx scripts/fix-vue-any-types.ts",
    "fix:all": "./scripts/fix-all-warnings.sh",
    "fix:check": "npx tsx scripts/fix-any-types.ts --stats"
  }
}
```

Then run:
```bash
npm run fix:any
npm run fix:check
```

## 📚 Resources

- **ESLint Config:** `eslint.config.mjs`
- **Summary:** `ESLINT_CLEANUP_SUMMARY.md`
- **Issues:** `docs/ISSUES_AND_SOLUTIONS.md`

## 🎯 Goals

- **Short Term:** Reduce warnings to <1000 (quick wins)
- **Medium Term:** Reduce to <500 (most any types fixed)
- **Long Term:** Reduce to <100 (production-grade)

---

**Last Updated:** 2025-12-10
**Status:** Scripts ready for use
