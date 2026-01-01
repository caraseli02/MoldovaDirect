/**
 * ts-5: Tests for TypeScript catch block type safety
 *
 * Verifies that catch blocks use `catch (error: unknown)` or untyped
 * `catch (error)` instead of unsafe `catch (error: any)`.
 */

import { describe, expect, it } from 'vitest'
import { execSync } from 'node:child_process'

describe('TypeScript Catch Block Safety (ts-5)', () => {
  it('should NOT use "catch (error: any)" pattern in source files', { timeout: 30000 }, () => {
    // Use grep to find all occurrences in source files (excluding tests, node_modules, and .nuxt)
    let result = ''
    try {
      result = execSync(
        `grep -r "catch (error: any)" --include="*.ts" --include="*.vue" . 2>/dev/null | grep -v node_modules | grep -v .nuxt | grep -v ".test.ts" | grep -v "__tests__" || true`,
        { cwd: process.cwd(), encoding: 'utf-8' },
      )
    }
    catch {
      // grep returns exit code 1 when no matches found
      result = ''
    }

    const lines = result.trim().split('\n').filter(Boolean)

    // Filter out this test file and the audit file
    const violations = lines.filter(line =>
      !line.includes('catchErrorAny.test.ts')
      && !line.includes('skill_audit_refactor.json')
      && !line.includes('CODEBASE_AUDIT_REPORT.md'),
    )

    if (violations.length > 0) {
      console.log('Files with catch (error: any):')
      violations.forEach(v => console.log(`  ${v}`))
    }

    expect(violations.length).toBe(0)
  })

  it('should NOT use "catch (err: any)" pattern in source files', { timeout: 30000 }, () => {
    let result = ''
    try {
      result = execSync(
        `grep -r "catch (err: any)" --include="*.ts" --include="*.vue" . 2>/dev/null | grep -v node_modules | grep -v .nuxt | grep -v ".test.ts" | grep -v "__tests__" || true`,
        { cwd: process.cwd(), encoding: 'utf-8' },
      )
    }
    catch {
      result = ''
    }

    const lines = result.trim().split('\n').filter(Boolean)

    const violations = lines.filter(line =>
      !line.includes('catchErrorAny.test.ts')
      && !line.includes('skill_audit_refactor.json')
      && !line.includes('CODEBASE_AUDIT_REPORT.md'),
    )

    if (violations.length > 0) {
      console.log('Files with catch (err: any):')
      violations.forEach(v => console.log(`  ${v}`))
    }

    expect(violations.length).toBe(0)
  })

  it('should NOT use "catch (e: any)" pattern in source files', { timeout: 30000 }, () => {
    let result = ''
    try {
      result = execSync(
        `grep -r "catch (e: any)" --include="*.ts" --include="*.vue" . 2>/dev/null | grep -v node_modules | grep -v .nuxt | grep -v ".test.ts" | grep -v "__tests__" || true`,
        { cwd: process.cwd(), encoding: 'utf-8' },
      )
    }
    catch {
      result = ''
    }

    const lines = result.trim().split('\n').filter(Boolean)

    const violations = lines.filter(line =>
      !line.includes('catchErrorAny.test.ts')
      && !line.includes('skill_audit_refactor.json')
      && !line.includes('CODEBASE_AUDIT_REPORT.md'),
    )

    if (violations.length > 0) {
      console.log('Files with catch (e: any):')
      violations.forEach(v => console.log(`  ${v}`))
    }

    expect(violations.length).toBe(0)
  })
})
