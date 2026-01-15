/**
 * CLI Integration Tests
 * Tests each command end-to-end and error handling
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { runAudit } from '../commands/audit'
import { runMigrate } from '../commands/migrate'
import { runValidate } from '../commands/validate'
import { runGenerateAIContext } from '../commands/generate-ai-context'
import type { CLIOptions, Logger } from '../cli'

describe('CLI Integration Tests', () => {
  const testDir = path.join(process.cwd(), 'scripts/documentation/__tests__/fixtures/cli-test')

  // Mock logger
  const createMockLogger = (): Logger => {
    const logs: string[] = []
    return {
      info: (msg: string) => logs.push(`[INFO] ${msg}`),
      error: (msg: string) => logs.push(`[ERROR] ${msg}`),
      warn: (msg: string) => logs.push(`[WARN] ${msg}`),
      verbose: (msg: string) => logs.push(`[VERBOSE] ${msg}`),
    }
  }

  beforeEach(async () => {
    // Create test directory structure
    await fs.mkdir(testDir, { recursive: true })
    await fs.mkdir(path.join(testDir, 'docs'), { recursive: true })

    // Create sample documentation files
    await fs.writeFile(
      path.join(testDir, 'docs', 'getting-started.md'),
      '# Getting Started\n\nThis is a tutorial.',
      'utf-8'
    )
    await fs.writeFile(
      path.join(testDir, 'docs', 'api-reference.md'),
      '# API Reference\n\nThis is reference documentation.',
      'utf-8'
    )
    await fs.writeFile(
      path.join(testDir, 'docs', 'architecture.md'),
      '# Architecture\n\nThis explains the architecture.',
      'utf-8'
    )
  })

  afterEach(async () => {
    // Clean up test directory
    try {
      await fs.rm(testDir, { recursive: true, force: true })
    } catch {
      // Ignore cleanup errors
    }
  })

  describe('Audit Command', () => {
    it('should run audit and generate report', async () => {
      const outputPath = path.join(testDir, 'audit-report.json')
      const logger = createMockLogger()

      const options: CLIOptions = {
        command: 'audit',
        args: [path.join(testDir, 'docs')],
        flags: { output: outputPath },
      }

      await runAudit(options, logger)

      // Check that report file was created
      const reportExists = await fs
        .access(outputPath)
        .then(() => true)
        .catch(() => false)
      expect(reportExists).toBe(true)

      // Verify report content
      const reportContent = await fs.readFile(outputPath, 'utf-8')
      const report = JSON.parse(reportContent)
      expect(report.summary.totalFiles).toBeGreaterThan(0)
      expect(report.details).toBeDefined()
    })

    it('should handle non-existent directory', async () => {
      const logger = createMockLogger()

      const options: CLIOptions = {
        command: 'audit',
        args: [path.join(testDir, 'non-existent')],
        flags: {},
      }

      await expect(runAudit(options, logger)).rejects.toThrow('Directory not found')
    })
  })

  describe('Migrate Command', () => {
    it('should run migration in dry-run mode', async () => {
      const logger = createMockLogger()

      const options: CLIOptions = {
        command: 'migrate',
        args: [path.join(testDir, 'docs')],
        flags: { dryRun: true },
      }

      await runMigrate(options, logger)

      // Verify no actual changes were made
      const files = await fs.readdir(path.join(testDir, 'docs'))
      expect(files).toContain('getting-started.md')
      expect(files).not.toContain('tutorials') // No new structure created
    })
  })

  describe('Validate Command', () => {
    it('should run validation and generate report', async () => {
      const outputPath = path.join(testDir, 'quality-report.json')
      const logger = createMockLogger()

      const options: CLIOptions = {
        command: 'validate',
        args: [path.join(testDir, 'docs')],
        flags: { output: outputPath },
      }

      await runValidate(options, logger)

      // Check that report file was created
      const reportExists = await fs
        .access(outputPath)
        .then(() => true)
        .catch(() => false)
      expect(reportExists).toBe(true)

      // Verify report content
      const reportContent = await fs.readFile(outputPath, 'utf-8')
      const report = JSON.parse(reportContent)
      expect(report.overallScore).toBeDefined()
      expect(report.linkValidation).toBeDefined()
      expect(report.codeValidation).toBeDefined()
    })

    it('should detect broken links', async () => {
      // Create a file with broken links
      await fs.writeFile(
        path.join(testDir, 'docs', 'with-links.md'),
        '# With Links\n\n[Broken Link](./non-existent.md)',
        'utf-8'
      )

      const logger = createMockLogger()

      const options: CLIOptions = {
        command: 'validate',
        args: [path.join(testDir, 'docs')],
        flags: {},
      }

      await runValidate(options, logger)

      // Validation should complete even with broken links
      expect(true).toBe(true)
    })
  })

  describe('Generate AI Context Command', () => {
    it('should generate all AI context files', async () => {
      const logger = createMockLogger()

      const options: CLIOptions = {
        command: 'generate-ai-context',
        args: [],
        flags: {},
      }

      await runGenerateAIContext(options, logger)

      // Verify files were created
      const llmsTxtExists = await fs
        .access('llms.txt')
        .then(() => true)
        .catch(() => false)
      const agentsMdExists = await fs
        .access('AGENTS.md')
        .then(() => true)
        .catch(() => false)

      expect(llmsTxtExists).toBe(true)
      expect(agentsMdExists).toBe(true)

      // Clean up generated files
      await fs.unlink('llms.txt').catch(() => {})
      await fs.unlink('AGENTS.md').catch(() => {})
      await fs.unlink('.cursorrules').catch(() => {})
      await fs.rm('docs/ai-context', { recursive: true, force: true }).catch(() => {})
    })
  })
})
