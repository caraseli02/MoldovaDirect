# Static Analysis Configuration

This document explains the static analysis setup, the intentional warnings, and why they should NOT be "fixed."

## Overview

Moldova Direct uses a **5-layer static analysis stack**:

| Layer | Tool | Purpose | Speed |
|-------|------|---------|-------|
| 1 | Oxlint | Fast first-pass linting | 50-100x faster than ESLint |
| 2 | ESLint + @nuxt/eslint | Deep Vue/Nuxt-specific analysis | Standard |
| 3 | eslint-plugin-sonarjs | Bug detection, code smells, security | Standard |
| 4 | eslint-plugin-oxlint | Disables duplicate ESLint rules | N/A |
| 5 | Knip | Dead code detection | Fast |

## Configuration Files

- `eslint.config.mjs` - ESLint flat config with Nuxt integration
- `.oxlintrc.json` - Oxlint configuration
- `knip.config.ts` - Dead code detection config
- `scripts/pre-commit-tests.sh` - Pre-commit hook workflow

## Commands

```bash
# Fast lint (oxlint only)
pnpm lint:oxlint

# Full lint (ESLint + SonarJS)
pnpm lint

# Auto-fix ESLint issues
pnpm lint:fix

# Dead code detection
pnpm lint:knip

# Fix dead code (auto-remove unused exports)
pnpm lint:knip:fix
```

## Intentional Warnings (~974)

The codebase has approximately **974 ESLint warnings**. These are **intentional and should NOT be bulk-fixed**.

### Breakdown by Category

| Category | Count | Status |
|----------|-------|--------|
| `@typescript-eslint/no-explicit-any` | ~600 | Intentional |
| `sonarjs/no-nested-functions` | ~70 | Intentional |
| `sonarjs/pseudo-random` | ~80 | Intentional |
| `sonarjs/no-nested-conditional` | ~45 | Review case-by-case |
| `sonarjs/cognitive-complexity` | ~25 | Review case-by-case |
| Other | ~154 | Various |

### Why `any` Types are Intentional

**DO NOT replace `any` with `unknown` blindly.** They are fundamentally different:

```typescript
// ✅ CORRECT: 'any' in type guards - MUST use any
function isProduct(value: any): value is Product {
  return typeof value === 'object' && value !== null && 'id' in value
}

// ❌ WRONG: 'unknown' breaks type guards
function isProduct(value: unknown): value is Product {
  // Now requires: if (typeof value === 'object' && value !== null)
  // before EVERY property access - extremely verbose
}
```

**Categories where `any` is correct:**

1. **Type Guards** (~150 uses)
   - Receive untrusted input, narrow to known type
   - `unknown` would require type checks before every property access

2. **Generic Defaults** (~100 uses)
   - `ApiResponse<T = any>`, `CacheEntry<T = any>`
   - Actual type specified at usage site

3. **Function Type Constraints** (~50 uses)
   - `(...args: any[]) => unknown` in debounce/throttle
   - TypeScript limitation - `unknown[]` breaks `Parameters<T>`

4. **Catch Blocks** (~50 uses)
   - JavaScript errors can be anything
   - `any` allows direct `.message` access

5. **Third-Party Integration** (~100 uses)
   - Library types don't always match
   - `useCookie` overloads require `as any`

6. **Logging/Serialization** (~50 uses)
   - Loggers accept anything by design

### Technical Basis

From TypeScript issues #41746 and #42096:
- Function types extend `Record<string, any>` but NOT `Record<string, unknown>`
- `Record<string, unknown>` breaks type compatibility in generics
- These are fundamentally different in assignability

### Previous Refactor Findings

A previous large-scale refactor attempted to replace `any` with `unknown` and discovered:
- Many uses cannot be replaced without breaking functionality
- The verbosity increase doesn't add safety (code already handles types properly)
- Type guards require `any` by design

## SonarJS Rules Configuration

SonarJS is configured with pragmatic settings for Vue:

```javascript
// Relaxed for Vue patterns
'sonarjs/cognitive-complexity': ['warn', 20],  // Default is 15
'sonarjs/no-nested-functions': 'warn',          // Common in composables

// Security rules - active
'sonarjs/code-eval': 'warn',
'sonarjs/os-command': 'warn',
'sonarjs/no-hardcoded-passwords': 'warn',
```

## Pre-commit Workflow

The pre-commit hook runs checks in this order:

1. **Oxlint** - Fast pass, fails on warnings
2. **ESLint** - Deep analysis, auto-fixes then fails on errors
3. **TypeScript** - Type checking, fails on errors
4. **Unit Tests** - Changed files only
5. **E2E Smoke Tests** - Critical paths

## Adding New Code

For new code:
- Prefer specific types over `any` when possible
- Use `unknown` for external/untrusted input with proper type guards
- Don't worry about warning count - focus on correctness

For existing code:
- Don't refactor just to remove `any` warnings
- If you're already modifying a file, consider improving types
- Use judgment - some `any` is intentional and correct

## Disabling Rules

If you need to disable a rule for a specific line:

```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Reason here
const data: any = externalLibrary.getData()
```

Always include a comment explaining why.

## Related Documentation

- `eslint.config.mjs` - Full ESLint configuration with detailed comments
- `.oxlintrc.json` - Oxlint rule configuration
- `knip.config.ts` - Dead code detection settings
