# Dual-Layer Documentation System

This directory contains the implementation of the dual-layer documentation system for Moldova Direct.

## Overview

The dual-layer documentation system provides:
1. **Human Layer**: Documentation organized using the Diátaxis framework (tutorials, how-to guides, reference, explanation)
2. **AI Layer**: Structured context files (llms.txt, AGENTS.md, .cursorrules, ai-context/) optimized for AI assistants

## Structure

```
scripts/documentation/
├── README.md                    # This file
├── types.ts                     # TypeScript interfaces and types
├── vitest.config.ts            # Test configuration
├── auditor/                    # Documentation auditor component
├── migrator/                   # Content migrator component
├── ai-context/                 # AI context generator component
├── navigation/                 # Navigation generator component
├── link-updater/              # Link updater component
├── validator/                 # Quality validator component
└── cli.ts                     # CLI entry point
```

## Components

### 1. Documentation Auditor
Analyzes existing documentation structure and content:
- Scans docs/ directory recursively
- Classifies files by Diátaxis type
- Identifies duplicates and gaps
- Generates audit report
- Creates migration mapping

### 2. Content Migrator
Moves and adapts documentation to new structure:
- Creates new directory structure
- Moves files to appropriate locations
- Updates internal links
- Adds breadcrumb navigation
- Creates index pages
- Preserves Git history

### 3. AI Context Generator
Generates AI-friendly context files:
- Generates/updates llms.txt
- Generates/updates AGENTS.md
- Generates/updates .cursorrules
- Generates ai-context/ files
- Extracts patterns from codebase
- Documents security rules

### 4. Navigation Generator
Creates navigation and index pages:
- Generates README.md with navigation
- Creates category index pages
- Adds breadcrumb navigation
- Generates "See Also" sections
- Creates quick reference cards

### 5. Link Updater
Updates internal links and creates redirects:
- Finds all internal links
- Updates links to new paths
- Creates redirect mappings
- Validates link integrity
- Generates redirect configuration

### 6. Quality Validator
Validates documentation quality and completeness:
- Checks for broken links
- Validates code examples
- Checks for required sections
- Validates formatting
- Generates quality report

## Testing

The system uses a dual testing approach:

### Unit Tests
- Test specific examples and edge cases
- Test error handling
- Test component integration

### Property-Based Tests
- Test universal properties across all inputs
- Use fast-check library
- Minimum 100 iterations per test
- Each test references design document property

### Running Tests

```bash
# Run all tests
pnpm test:docs

# Run tests with coverage
pnpm test:docs:coverage

# Run tests in watch mode
pnpm test:docs:watch
```

## Usage

### CLI Commands

```bash
# Audit existing documentation
node scripts/documentation/cli.ts audit

# Migrate documentation
node scripts/documentation/cli.ts migrate

# Validate documentation quality
node scripts/documentation/cli.ts validate

# Generate AI context files
node scripts/documentation/cli.ts generate-ai-context
```

## Development

### Adding New Components

1. Create component directory under `scripts/documentation/`
2. Implement component interface from `types.ts`
3. Add unit tests in `*.test.ts` files
4. Add property tests for universal properties
5. Update this README

### Code Style

- Use TypeScript strict mode
- Follow existing naming conventions
- Add JSDoc comments for public APIs
- Write tests for all new functionality

## Requirements

This implementation satisfies requirements:
- 1.1-1.7: Documentation Audit and Analysis
- 2.1-2.10: Human-Friendly Documentation Structure
- 3.1-3.10: AI-Friendly Context Files
- 4.1-4.10: Content Migration and Preservation
- 5.1-5.10: Security Documentation Requirements
- 6.1-6.10: Code Pattern Documentation
- 7.1-7.10: Progressive Disclosure Implementation
- 8.1-8.10: Documentation Maintenance and Quality

## References

- [Design Document](../../.kiro/specs/dual-layer-documentation/design.md)
- [Requirements Document](../../.kiro/specs/dual-layer-documentation/requirements.md)
- [Tasks Document](../../.kiro/specs/dual-layer-documentation/tasks.md)
- [Diátaxis Framework](https://diataxis.fr/)
