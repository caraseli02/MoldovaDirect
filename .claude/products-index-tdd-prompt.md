Refactor pages/products/index.vue (910 lines) using strict TDD.

BASELINE: Unit tests 5807 passed, file at 910 lines.

CRITICAL ISSUES (fix in TDD order):

1. Missing Import Bug: getErrorMessage used but not imported (lines 715, 759, 889)
   Test File: tests/pages/products/__tests__/index.imports.test.ts

2. SSR Hydration Mismatch: Duplicate searchQuery state (lines 564, 795-800)
   Test File: tests/pages/products/__tests__/index.ssr.test.ts

3. Type Safety: Double assertion (line 41), unsafe page cast (line 324)
   Test File: tests/pages/products/__tests__/index.types.test.ts

4. Extract: SearchSection, Toolbar, ProductGrid components
   Test Files: tests/components/product/__tests__/

TDD PROCESS FOR EACH FIX:
1. RED: Write test that FAILS, run pnpm test:unit, commit
2. GREEN: Write MINIMAL code to pass, run pnpm test:unit, commit
3. REFACTOR: Clean up if needed, run pnpm test:unit, commit

COMMANDS:
pnpm test:unit
pnpm test:unit tests/pages/products/__tests__/index.imports.test.ts
npx nuxi typecheck

SUCCESS: All tests pass, type check passes, file reduced to <300 lines.

Output <promise>PRODUCTS_INDEX_REFACTOR_COMPLETE</promise> when ALL issues fixed with tests passing.
