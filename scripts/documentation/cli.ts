#!/usr/bin/env node
/**
 * CLI Tool for Documentation Migration
 * 
 * Commands:
 * - audit: Run documentation auditor and generate report
 * - migrate: Run content migrator with progress reporting
 * - validate: Run quality validator and generate report
 * - generate-ai-context: Generate AI context files
 */

import { parseArgs } from 'node:util'

// Command handlers (will be implemented in subsequent tasks)
import { runAudit } from './commands/audit'
import { runMigrate } from './commands/migrate'
import { runValidate } from './commands/validate'
import { runGenerateAIContext } from './commands/generate-ai-context'
import { runBackup } from './commands/backup'

interface CLIOptions {
  command: string
  args: string[]
  flags: {
    dryRun?: boolean
    output?: string
    verbose?: boolean
    help?: boolean
  }
}

/**
 * Parse command-line arguments
 */
function parseCliArgs(): CLIOptions {
  const args = process.argv.slice(2)

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    return {
      command: 'help',
      args: [],
      flags: { help: true }
    }
  }

  const command = args[0] || 'help'
  const remainingArgs = args.slice(1)

  try {
    const { values } = parseArgs({
      args: remainingArgs,
      options: {
        'dry-run': {
          type: 'boolean',
          short: 'd',
          default: false,
        },
        output: {
          type: 'string',
          short: 'o',
        },
        verbose: {
          type: 'boolean',
          short: 'v',
          default: false,
        },
        help: {
          type: 'boolean',
          short: 'h',
          default: false,
        },
      },
      allowPositionals: true,
    })

    return {
      command,
      args: remainingArgs.filter(arg => !arg.startsWith('-')),
      flags: {
        dryRun: values['dry-run'] as boolean,
        output: values.output as string | undefined,
        verbose: values.verbose as boolean,
        help: values.help as boolean,
      },
    }
  } catch (error: any) {
    console.error(`Error parsing arguments: ${error.message}`)
    process.exit(1)
  }
}

/**
 * Display help information
 */
function displayHelp(): void {
  console.log(`
Documentation Migration CLI

Usage: npm run docs:cli <command> [options]

Commands:
  backup                   Create timestamped backup of documentation
  audit                    Run documentation auditor and generate report
  migrate                  Run content migrator with progress reporting
  validate                 Run quality validator and generate report
  generate-ai-context      Generate AI context files (llms.txt, AGENTS.md, etc.)

Options:
  -d, --dry-run           Run without making changes (migrate command only)
  -o, --output <path>     Output file path for reports
  -v, --verbose           Enable verbose logging
  -h, --help              Display this help message

Examples:
  npm run docs:cli backup
  npm run docs:cli backup --output backup-result.json
  npm run docs:cli audit
  npm run docs:cli audit --output audit-report.json
  npm run docs:cli migrate --dry-run
  npm run docs:cli migrate --verbose
  npm run docs:cli validate --output quality-report.json
  npm run docs:cli generate-ai-context

For more information, see: docs/how-to/documentation/migration-guide.md
`)
}

/**
 * Main CLI entry point
 */
async function main(): Promise<void> {
  const options = parseCliArgs()

  // Display help if requested
  if (options.flags.help || options.command === 'help') {
    displayHelp()
    process.exit(0)
  }

  // Set up logging
  const logger = {
    info: (message: string, ...args: any[]) => {
      console.log(`[INFO] ${message}`, ...args)
    },
    error: (message: string, ...args: any[]) => {
      console.error(`[ERROR] ${message}`, ...args)
    },
    warn: (message: string, ...args: any[]) => {
      console.warn(`[WARN] ${message}`, ...args)
    },
    verbose: (message: string, ...args: any[]) => {
      if (options.flags.verbose) {
        console.log(`[VERBOSE] ${message}`, ...args)
      }
    },
  }

  try {
    // Execute command
    switch (options.command) {
      case 'backup':
        await runBackup(options, logger)
        break

      case 'audit':
        await runAudit(options, logger)
        break

      case 'migrate':
        await runMigrate(options, logger)
        break

      case 'validate':
        await runValidate(options, logger)
        break

      case 'generate-ai-context':
        await runGenerateAIContext(options, logger)
        break

      default:
        logger.error(`Unknown command: ${options.command}`)
        logger.info('Run with --help to see available commands')
        process.exit(1)
    }

    logger.info('Command completed successfully')
    process.exit(0)
  } catch (error: any) {
    logger.error(`Command failed: ${error.message}`)
    if (options.flags.verbose && error.stack) {
      logger.error(error.stack)
    }
    process.exit(1)
  }
}

// Export types for command handlers
export type { CLIOptions }
export type Logger = {
  info: (message: string, ...args: any[]) => void
  error: (message: string, ...args: any[]) => void
  warn: (message: string, ...args: any[]) => void
  verbose: (message: string, ...args: any[]) => void
}

// Run CLI if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}
