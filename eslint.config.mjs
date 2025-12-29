// @ts-check
/**
 * ESLint Configuration for Moldova Direct
 *
 * STATIC ANALYSIS STRATEGY (2025)
 * ================================
 * This config uses a layered approach:
 * 1. Oxlint: Fast first-pass linting (50-100x faster than ESLint)
 * 2. ESLint + @nuxt/eslint: Deep Vue/Nuxt-specific linting
 * 3. SonarJS: Bug detection, code smells, security vulnerabilities
 * 4. TypeScript-ESLint: Type-aware linting for advanced checks
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
 */

import withNuxt from './.nuxt/eslint.config.mjs'
import sonarjs from 'eslint-plugin-sonarjs'

export default withNuxt(
  // SonarJS recommended rules for bug detection and code quality
  sonarjs.configs.recommended,

  // Custom rules for the project - BALANCED APPROACH
  // Legacy code: relaxed rules to avoid noise from TypeScript migration
  // New code in specific directories: stricter rules encouraged
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.vue'],
    rules: {
      // ============================================
      // TypeScript Rules
      // ============================================
      // IMPORTANT: Do NOT use fixToUnknown=true - 'any' and 'unknown' are NOT equivalent
      // OFF for legacy code - many 'any' types added during TypeScript error fixes
      '@typescript-eslint/no-explicit-any': 'off',

      '@typescript-eslint/no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      }],

      // Disable unified-signatures as it's too strict for Vue emit definitions
      '@typescript-eslint/unified-signatures': 'off',

      // ============================================
      // Vue Rules
      // ============================================
      'vue/multi-word-component-names': 'off', // Allow single-word component names
      'vue/no-v-html': 'warn', // Warn about v-html usage (XSS risk)
      'vue/require-default-prop': 'off', // Not always needed with TypeScript

      // ============================================
      // General Code Quality
      // ============================================
      'no-console': 'off', // Allow console.log for development
      'no-debugger': 'warn',

      // ============================================
      // SonarJS Rules - Tuned for this project
      // ============================================
      // Cognitive complexity - warn on complex functions
      'sonarjs/cognitive-complexity': ['warn', 20],

      // Duplicate strings - allow some duplication (e.g., i18n keys)
      'sonarjs/no-duplicate-string': ['warn', { threshold: 5 }],

      // Allow nested ternaries for Vue templates (common pattern)
      'sonarjs/no-nested-conditional': 'warn',

      // Relax for Vue composables that often have similar structure
      'sonarjs/no-identical-functions': 'warn',

      // Too strict for Vue props/emits
      'sonarjs/sonar-prefer-read-only-props': 'off',

      // Allow todo comments (we track these separately)
      'sonarjs/todo-tag': 'off',

      // Relax elseif rule - sometimes clearer with separate if blocks
      'sonarjs/elseif-without-else': 'off',

      // Regex rules - warn instead of error (stylistic)
      'sonarjs/concise-regex': 'warn',
      'sonarjs/single-character-alternation': 'warn',

      // Type alias rule - too strict for inline types
      'sonarjs/use-type-alias': 'off',

      // Boolean return - sometimes if/else is clearer
      'sonarjs/prefer-single-boolean-return': 'warn',

      // Small switch - sometimes switch is clearer than if
      'sonarjs/no-small-switch': 'warn',

      // Nested functions - common in Vue composables
      'sonarjs/no-nested-functions': 'warn',

      // Pseudo-random - ok for non-security use cases
      'sonarjs/pseudo-random': 'warn',

      // Slow regex - warn for awareness, but don't block
      'sonarjs/slow-regex': 'warn',

      // Exception handling - warn for awareness
      'sonarjs/no-ignored-exceptions': 'warn',

      // Hard-coded passwords - mostly false positives in test code
      'sonarjs/no-hardcoded-passwords': 'warn',

      // Conflicts with TypeScript's unused vars
      'sonarjs/no-unused-vars': 'off',

      // Reduce initial value - sometimes intentional
      'sonarjs/reduce-initial-value': 'warn',

      // Redundant jumps - sometimes intentional for clarity
      'sonarjs/no-redundant-jump': 'warn',

      // Dead stores - sometimes intentional placeholders
      'sonarjs/no-dead-store': 'warn',

      // Nested template literals - sometimes cleaner
      'sonarjs/no-nested-template-literals': 'warn',

      // Hardcoded IPs - often test fixtures
      'sonarjs/no-hardcoded-ip': 'warn',

      // Redundant type aliases - TypeScript handles this
      'sonarjs/redundant-type-aliases': 'off',

      // Code eval (javascript:) - warn for security review
      'sonarjs/code-eval': 'warn',

      // Assertions in tests - handled by test framework
      'sonarjs/assertions-in-tests': 'warn',

      // Clear text protocols - often for local dev
      'sonarjs/no-clear-text-protocols': 'warn',

      // Unused imports - ESLint already handles this
      'sonarjs/unused-import': 'off',

      // Regex-related rules - warn for review
      'sonarjs/anchor-precedence': 'warn',
      'sonarjs/duplicates-in-character-class': 'warn',
      'sonarjs/regex-complexity': 'warn',
      'sonarjs/no-empty-alternatives': 'warn',

      // Code logic - legitimate warnings, not blocking
      'sonarjs/no-redundant-assignments': 'warn',
      'sonarjs/no-unused-collection': 'warn',
      'sonarjs/no-empty-collection': 'warn',
      'sonarjs/os-command': 'warn',
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
      'tests/fixtures/**',
      // Generated files
      'supabase/**',
      '*.d.ts',
      // Archived documentation and old test scripts
      'docs/archive/**/*.mjs',
      'docs/fixes/**/test-scripts/**/*.mjs',
      // Environment files
      '.env',
      '.env.local',
      '.env.*.local',
      // Visual testing
      '.visual-testing/**',
    ],
  },

  // Vue HTML formatting rules
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

  // Test files - relaxed rules for testing flexibility
  {
    files: ['**/*.test.ts', '**/*.spec.ts', '**/tests/**', 'tests/**/*'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
      'no-debugger': 'off',
      'no-empty-pattern': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      // Relax SonarJS for tests
      'sonarjs/no-duplicate-string': 'off',
      'sonarjs/cognitive-complexity': 'off',
      'sonarjs/no-identical-functions': 'off',
    },
  },

  // E2E test files - similar relaxed rules
  {
    files: ['**/*.e2e.ts', '**/*.e2e.js', '**/e2e/**'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
      'no-debugger': 'off',
      'sonarjs/no-duplicate-string': 'off',
      'sonarjs/cognitive-complexity': 'off',
    },
  },

  // STRICT MODE: Stricter rules for core business logic
  // Enable progressively as you refactor code
  {
    files: ['composables/**/*.ts', 'utils/**/*.ts', 'types/**/*.ts'],
    rules: {
      // Encourage better typing in core modules
      '@typescript-eslint/no-explicit-any': 'warn',
      // Stricter cognitive complexity for utility functions
      'sonarjs/cognitive-complexity': ['warn', 15],
    },
  },

  // Server code - stricter security rules
  {
    files: ['server/**/*.ts'],
    rules: {
      // Warn on any in server code (security sensitive)
      '@typescript-eslint/no-explicit-any': 'warn',
      // Stricter complexity for API handlers
      'sonarjs/cognitive-complexity': ['warn', 15],
    },
  },
)
