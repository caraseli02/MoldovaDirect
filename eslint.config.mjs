// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  // Custom rules for the project
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.vue'],
    rules: {
      // TypeScript specific rules
      '@typescript-eslint/no-explicit-any': ['warn', { fixToUnknown: false }],
      '@typescript-eslint/no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],
      // Disable unified-signatures as it's too strict for Vue emit definitions
      '@typescript-eslint/unified-signatures': 'off',

      // Vue specific rules
      'vue/multi-word-component-names': 'off', // Allow single-word component names
      'vue/no-v-html': 'warn', // Warn about v-html usage (XSS risk)
      'vue/require-default-prop': 'off', // Not always needed with TypeScript

      // General code quality
      'no-console': ['warn', { allow: ['warn', 'error'] }],
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
      // Generated files
      'supabase/**',
      '*.d.ts',
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
  // Suppress any warnings in test files
  {
    files: ['**/*.test.ts', '**/*.spec.ts', '**/tests/**'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  // Suppress any warnings in chart/dashboard/analytics components
  {
    files: ['**/Charts/**', '**/Dashboard/**', '**/analytics/**'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
)
