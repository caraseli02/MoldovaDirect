# ESLint Warning Fixers

These scripts help automatically fix remaining ESLint warnings.

## Quick Commands

```bash
# See what needs fixing
npm run lint 2>&1 | grep "@typescript-eslint/no-explicit-any" | head -20

# Auto-fix all warnings (be careful - check afterwards)
npm run lint -- --fix

# Check specific warning count
npm run lint 2>&1 | grep "any"
npm run lint 2>&1 | grep "console"
npm run lint 2>&1 | grep "unused"
```

## Manual Patterns to Fix

### 1. Replace `any` with `unknown`

```typescript
// ❌ Before
function process(data: any): any { }

// ✅ After  
function process(data: unknown): unknown { }
```

### 2. Replace `as any` with `as unknown`

```typescript
// ❌ Before
const value = something as any

// ✅ After
const value = something as unknown
```

### 3. Replace `Record<K, any>` with `Record<K, unknown>`

```typescript
// ❌ Before
const config: Record<string, any> = {}

// ✅ After
const config: Record<string, unknown> = {}
```

### 4. Replace generic defaults `any` → `unknown`

```typescript
// ❌ Before
function getData<T = any>(): T { }

// ✅ After
function getData<T = unknown>(): T { }
```

### 5. Fix Vue `PropType<any>`

```typescript
// ❌ Before
import { PropType } from 'vue'
const props = defineProps({
  data: Object as PropType<any>
})

// ✅ After
const props = defineProps<{ data?: unknown }>()
```

## Top Files to Fix (by warning count)

Run: `npm run lint 2>&1 | grep "@typescript-eslint/no-explicit-any" | awk -F: '{print $1}' | sort | uniq -c | sort -rn | head -20`

This shows which files have the most `any` warnings.

## Strategy

1. **Start with utilities** (`utils/**/*.ts`)  
2. **Then stores** (`stores/**/*.ts`)
3. **Then composables** (`composables/**/*.ts`)
4. **Then components** (highest effort, last)

Each file typically takes 5-15 minutes to fully type correctly.

## Validation After Fixing

```bash
# Check ESLint
npm run lint

# Check TypeScript
npx nuxi typecheck

# Check build
npm run build
```

## ESLint Config Location

See: `eslint.config.mjs` for current configuration including suppressed warning patterns.

---

**Status:** 1303 warnings remaining (from 1720)
**Goal:** Reduce systematically over time using the patterns above
