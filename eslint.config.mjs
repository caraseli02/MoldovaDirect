// @ts-check
/**
 * ESLint Configuration for Moldova Direct
 *
 * KEY PRINCIPLE: 'any' vs 'unknown'
 * =================================
 * DO NOT blindly replace 'any' with 'unknown' - they are NOT equivalent!
 *
 * CORRECT usage:
 * - 'any': Use in type definitions, Record<string, any>, generics defaults (T = any)
 *   → intentionally permissive, disables type checking
 *   → appropriate for flexible data contracts
 *
 * - 'unknown': Use in function parameters, catch blocks, external data
 *   → requires type narrowing/guards before use
 *   → appropriate for untrusted external input
 *
 * Why? TypeScript Issue #41746, #42096:
 * - Function types extend Record<string, any> but NOT Record<string, unknown>
 * - Record<string, unknown> breaks type compatibility in generics
 * - These are fundamentally different in terms of type assignability
 *
 * WRONG (breaks types):
 *   interface Config { settings: Record<string, unknown> }
 *   const config: Record<string, any> = ... // ERROR: incompatible
 *
 * RIGHT (maintains compatibility):
 *   interface Config { settings: Record<string, any> }
 *   const config: Record<string, any> = ... // OK: compatible
 */

import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  // Custom rules for the project - BALANCED APPROACH
  // Legacy code: relaxed rules to avoid noise from TypeScript migration
  // New code in specific directories: stricter rules encouraged
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.vue'],
    rules: {
      // TypeScript specific rules
      // IMPORTANT: Do NOT use fixToUnknown=true - 'any' and 'unknown' are NOT equivalent
      // See: https://github.com/microsoft/TypeScript/issues/41746
      // 'any' is intentionally permissive (for data contracts, Record<string, X>, generics)
      // 'unknown' requires type narrowing (for untrusted external data)
      //
      // OFF for legacy code - many 'any' types added during TypeScript error fixes
      // These are intentional to maintain compatibility with existing patterns
      '@typescript-eslint/no-explicit-any': 'off',

      '@typescript-eslint/no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      }],

      // Disable unified-signatures as it's too strict for Vue emit definitions
      '@typescript-eslint/unified-signatures': 'off',

      // Vue specific rules
      'vue/multi-word-component-names': 'off', // Allow single-word component names
      'vue/no-v-html': 'warn', // Warn about v-html usage (XSS risk)
      'vue/require-default-prop': 'off', // Not always needed with TypeScript

      // General code quality - allow console.log for development
      'no-console': 'off',
      'no-debugger': 'warn',
    },
  },
  // Ignore patterns - exclude non-source files
  {
    ignores: [
      'node_modules/**',
      '.nuxt/**',
      '.output/**',
      'dist/**',
      'coverage/**',
      'test-results/**',
      'playwright-report/**',
      '*.min.js',
      'public/**',
      '.github/**',
      'scripts/**',
      '*.config.js',
      '*.config.cjs',
      '*.config.mjs',
      // Test utilities and fixtures
      'checkout-ux-testing/**',
      'tests/**/*.mjs',
      'tests/**/*.js',
      'tests/fixtures/**', // Ignore all test fixtures (including TypeScript)
      // Generated files
      'supabase/**',
      '*.d.ts',
      // Archived documentation and old test scripts (from .eslintignore)
      'docs/archive/**/*.mjs',
      'docs/fixes/**/test-scripts/**/*.mjs',
      // Environment files
      '.env',
      '.env.local',
      '.env.*.local',
    ],
  },
  // Override nuxt/vue rules for less strict development
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.vue'],
    rules: {
      'vue/html-self-closing': ['error', {
        html: {
          void: 'always',
          normal: 'never',
          component: 'always',
        },
        svg: 'always',
        math: 'always',
      }],
    },
  },
  // Test files - relax rules appropriate for testing
  {
    files: ['**/*.test.ts', '**/*.spec.ts', '**/tests/**', 'tests/**/*'],
    rules: {
      // Allow any in test files for mocking and testing
      '@typescript-eslint/no-explicit-any': 'off',
      // Allow console in test files for debugging
      'no-console': 'off',
      // Allow debugger in test files
      'no-debugger': 'off',
      // Allow empty patterns and unused vars in Playwright fixtures
      'no-empty-pattern': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
  // E2E test files - similar relaxed rules
  {
    files: ['**/*.e2e.ts', '**/*.e2e.js', '**/e2e/**'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
      'no-debugger': 'off',
    },
  },
  // STRICT MODE: Enable stricter rules for specific directories
  // Add directories here as you refactor them to encourage better typing
  // Uncomment to enforce stricter rules on new/refactored code:
  // {
  //   files: ['composables/**/*.ts', 'utils/**/*.ts', 'types/**/*.ts'],
  //   rules: {
  //     '@typescript-eslint/no-explicit-any': 'warn',
  //   },
  // },
)
