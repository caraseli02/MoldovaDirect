# Implementation Plan: Dual-Layer Documentation System

## Overview

This implementation plan breaks down the dual-layer documentation system into discrete, manageable tasks. The plan follows a three-phase approach: (1) Audit & Planning, (2) Human-Friendly Layer, and (3) AI-Friendly Layer. Each task builds on previous work and includes testing to validate correctness incrementally.

## Tasks

- [x] 1. Set up project structure and core types
  - Create `scripts/documentation/` directory for implementation
  - Define TypeScript interfaces from design document
  - Set up testing framework (Vitest + fast-check)
  - Configure test coverage reporting
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

- [x] 2. Implement Documentation Auditor
  - [x] 2.1 Implement file scanning functionality
    - Create `scanDirectory()` function to recursively scan docs/
    - Generate FileInventory with all files and metadata
    - _Requirements: 1.1_

  - [x] 2.2 Write property test for file scanning
    - **Property 1: Complete and accurate file inventory**
    - **Validates: Requirements 1.1, 1.2**

  - [x] 2.3 Implement file categorization logic
    - Create `categorizeFile()` function using content analysis
    - Classify files by Diátaxis type (tutorial, how-to, reference, explanation)
    - Use heuristics: keywords, structure, file path patterns
    - _Requirements: 1.2_

  - [x] 2.4 Write property test for categorization
    - Test that all files receive valid categories
    - Test categorization consistency
    - _Requirements: 1.2_

  - [x] 2.5 Implement duplicate detection
    - Create `findDuplicates()` function using content similarity
    - Use text similarity algorithm (e.g., cosine similarity)
    - Group files with >80% similarity
    - _Requirements: 1.3_

  - [x] 2.6 Write property test for duplicate detection
    - **Property 2: Duplicate detection completeness**
    - **Validates: Requirements 1.3**

  - [x] 2.7 Implement gap analysis
    - Create `identifyGaps()` function
    - Compare existing docs against required feature list
    - Identify missing documentation by priority
    - _Requirements: 1.4_

  - [x] 2.8 Write property test for gap analysis
    - **Property 3: Gap identification accuracy**
    - **Validates: Requirements 1.4**

  - [x] 2.9 Implement migration mapping generation
    - Create `createMigrationMapping()` function
    - Generate old path → new path mappings
    - Assign priority and effort estimates
    - _Requirements: 1.5, 1.6, 1.7_

  - [x] 2.10 Write property test for migration mapping
    - **Property 4: Migration mapping completeness**
    - **Validates: Requirements 1.5, 1.6, 1.7**

  - [x] 2.11 Implement audit report generation
    - Create `generateAuditReport()` function
    - Compile summary statistics and recommendations
    - Output markdown report
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

  - [x] 2.12 Write unit tests for audit report
    - Test report format and completeness
    - Test with sample documentation structure
    - _Requirements: 1.1-1.7_

- [x] 3. Checkpoint - Validate auditor functionality
  - Run all auditor tests
  - Execute auditor on actual docs/ directory
  - Review audit report for accuracy
  - Ensure all tests pass, ask the user if questions arise

- [x] 4. Implement Content Migrator
  - [x] 4.1 Implement directory structure creation
    - Create `createStructure()` function
    - Generate Diátaxis folder structure (tutorials/, how-to/, reference/, explanation/, project/, archive/)
    - Handle existing directories gracefully
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 4.2 Write unit tests for structure creation
    - Test directory creation
    - Test handling of existing directories
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 4.3 Implement file migration logic
    - Create `migrateFile()` function
    - Copy file from old to new location
    - Preserve file metadata
    - Handle file conflicts
    - _Requirements: 4.1, 4.2_

  - [x] 4.4 Write property test for content preservation
    - **Property 13: Content preservation during migration**
    - **Validates: Requirements 4.1, 4.2**

  - [x] 4.5 Implement Git history preservation
    - Create `preserveGitHistory()` function
    - Use `git mv` to preserve history
    - Fall back to copy if git mv fails
    - _Requirements: 4.2_

  - [x] 4.6 Write unit tests for Git operations
    - Test git mv execution
    - Test fallback behavior
    - _Requirements: 4.2_

  - [x] 4.7 Implement content adaptation
    - Create `adaptContentToCategory()` function
    - Adapt content to fit target category conventions
    - Add category-specific sections (e.g., prerequisites for how-tos)
    - _Requirements: 4.7_

  - [x] 4.8 Write property test for content adaptation
    - **Property 17: Content adaptation to category**
    - **Validates: Requirements 4.7**

  - [x] 4.9 Implement duplicate consolidation
    - Create logic to merge duplicate files
    - Keep most recent/complete version
    - Archive or remove duplicates
    - _Requirements: 4.8_

  - [x] 4.10 Write property test for duplicate consolidation
    - **Property 18: Duplicate consolidation**
    - **Validates: Requirements 4.8**

  - [x] 4.11 Implement archival logic
    - Create `archiveFile()` function
    - Move outdated docs to archive/ with timestamp
    - Never delete documentation
    - _Requirements: 4.9_

  - [x] 4.12 Write property test for archival
    - **Property 19: Archival instead of deletion**
    - **Validates: Requirements 4.9**

- [x] 5. Implement Link Updater
  - [x] 5.1 Implement link extraction
    - Create `findInternalLinks()` function using remark
    - Parse markdown and extract all links
    - Classify as internal or external
    - _Requirements: 4.3_

  - [x] 5.2 Write unit tests for link extraction
    - Test with various markdown link formats
    - Test edge cases (relative paths, anchors)
    - _Requirements: 4.3_

  - [x] 5.3 Implement link updating
    - Create `updateLink()` function
    - Map old paths to new paths
    - Update relative paths correctly
    - _Requirements: 4.3_

  - [x] 5.4 Write property test for link updates
    - **Property 14: Link update completeness**
    - **Validates: Requirements 4.3**

  - [x] 5.5 Implement link validation
    - Create `validateLinks()` function
    - Check that all internal links point to existing files
    - Report broken links
    - _Requirements: 4.10_

  - [x] 5.6 Write property test for navigation accessibility
    - **Property 20: Navigation accessibility**
    - **Validates: Requirements 4.10**

  - [x] 5.7 Implement redirect generation
    - Create `generateRedirects()` function
    - Generate redirect configuration for old paths
    - Output in format suitable for web server or documentation tool
    - _Requirements: 4.4_

  - [x] 5.8 Write property test for redirect generation
    - **Property 15: Redirect mapping generation**
    - **Validates: Requirements 4.4**

  - [x] 5.9 Implement deprecation notice insertion
    - Create function to add deprecation notices to old locations
    - Include link to new location
    - _Requirements: 4.5_

  - [x] 5.10 Write property test for deprecation notices
    - **Property 16: Deprecation notice insertion**
    - **Validates: Requirements 4.5**

- [x] 6. Checkpoint - Validate migration functionality
  - Run all migration and link tests
  - Test migration on sample documentation subset
  - Verify content preservation and link integrity
  - Ensure all tests pass, ask the user if questions arise

- [x] 7. Implement Navigation Generator
  - [x] 7.1 Implement root README generation
    - Create `generateRootReadme()` function
    - Generate navigation by user need (learning, problem-solving, lookup, understanding)
    - Include quick start section
    - Include common tasks section
    - _Requirements: 2.4, 7.2_

  - [x] 7.2 Write unit tests for root README
    - Test README structure and content
    - Test navigation links
    - _Requirements: 2.4, 7.2_

  - [x] 7.3 Implement category index generation
    - Create `generateCategoryIndex()` function
    - Generate index pages for tutorials/, how-to/, reference/, explanation/
    - List all files with titles and descriptions
    - _Requirements: 2.8_

  - [x] 7.4 Write property test for index generation
    - **Property 7: Index page generation**
    - **Validates: Requirements 2.8**

  - [x] 7.5 Implement breadcrumb generation
    - Create `generateBreadcrumbs()` function
    - Generate breadcrumb navigation based on file path
    - Add to top of each file
    - _Requirements: 2.7_

  - [x] 7.6 Write property test for breadcrumbs
    - **Property 6: Breadcrumb navigation consistency**
    - **Validates: Requirements 2.7**

  - [x] 7.7 Implement "See Also" section generation
    - Create `generateSeeAlso()` function
    - Find related files based on tags, categories, content similarity
    - Add "See Also" section to files
    - _Requirements: 2.10_

  - [x] 7.8 Write property test for "See Also" sections
    - **Property 9: Related documentation links**
    - **Validates: Requirements 2.10**

  - [x] 7.9 Implement quick reference card generation
    - Create `generateQuickReference()` function
    - Generate quick reference cards for common tasks
    - Include code snippets and links
    - _Requirements: 7.4_

  - [x] 7.10 Write unit tests for quick reference cards
    - Test card format and content
    - _Requirements: 7.4_

  - [x] 7.11 Implement visual hierarchy
    - Add emojis, formatting, and structure to generated content
    - Improve scannability
    - _Requirements: 2.9_

  - [x] 7.12 Write property test for visual hierarchy
    - **Property 8: Visual hierarchy in generated content**
    - **Validates: Requirements 2.9**

- [x] 8. Implement content organization
  - [x] 8.1 Implement how-to organization by feature
    - Create subdirectories for authentication/, checkout/, deployment/, testing/
    - Organize how-to guides into appropriate subdirectories
    - _Requirements: 2.5_

  - [x] 8.2 Write property test for how-to organization
    - **Property 5: Content organization by category** (how-to part)
    - **Validates: Requirements 2.5**

  - [x] 8.3 Implement reference organization by domain
    - Create subdirectories for api/, architecture/, configuration/, components/
    - Organize reference docs into appropriate subdirectories
    - _Requirements: 2.6_

  - [x] 8.4 Write property test for reference organization
    - **Property 5: Content organization by category** (reference part)
    - **Validates: Requirements 2.6**

- [x] 9. Checkpoint - Validate navigation and organization
  - Run all navigation tests
  - Review generated README and index pages
  - Verify breadcrumbs and "See Also" sections
  - Test content organization
  - Ensure all tests pass, ask the user if questions arise

- [x] 10. Implement AI Context Generator
  - [x] 10.1 Implement llms.txt generation
    - Create `generateLlmsTxt()` function
    - Generate project overview section
    - Generate core documentation links
    - Generate code conventions summary
    - Generate key concepts section
    - _Requirements: 3.1_

  - [x] 10.2 Write unit tests for llms.txt
    - Test file structure and content
    - Test link validity
    - _Requirements: 3.1_

  - [x] 10.3 Implement AGENTS.md generation
    - Create `generateAgentsMd()` function
    - Generate project identity section
    - Generate technical stack section
    - Generate architecture patterns with code examples
    - _Requirements: 3.2_

  - [x] 10.4 Write unit tests for AGENTS.md structure
    - Test file structure and required sections
    - _Requirements: 3.2_

  - [x] 10.5 Implement security rules documentation
    - Add security rules section to AGENTS.md
    - Include "NEVER" and "ALWAYS" examples with code
    - Document all critical security requirements
    - _Requirements: 3.5, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

  - [x] 10.6 Write property test for security rule format
    - **Property 10: Security rule documentation format**
    - **Validates: Requirements 3.5**

  - [x] 10.7 Implement code pattern documentation
    - Add code patterns section to AGENTS.md
    - Include Vue 3, API route, composable, and testing patterns
    - Include complete working examples
    - _Requirements: 3.6, 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 10.8 Write property test for code example completeness
    - **Property 11: Code example completeness**
    - **Validates: Requirements 3.6**

  - [x] 10.9 Implement file organization documentation
    - Add file organization section to AGENTS.md
    - Include directory tree examples
    - Document naming conventions
    - _Requirements: 3.7, 6.6, 6.7_

  - [x] 10.10 Write property test for file organization docs
    - **Property 12: File organization documentation structure**
    - **Validates: Requirements 3.7**

  - [x] 10.11 Add common tasks and known issues
    - Document common development tasks
    - Document known issues and workarounds
    - _Requirements: 3.9_

  - [x] 10.12 Write unit tests for common tasks section
    - Test completeness of common tasks
    - _Requirements: 3.9_

  - [x] 10.13 Implement .cursorrules generation
    - Create `generateCursorRules()` function
    - Generate project context summary
    - Generate critical security rules
    - Generate file patterns and guidelines
    - _Requirements: 3.3_

  - [x] 10.14 Write unit tests for .cursorrules
    - Test file structure and content
    - _Requirements: 3.3_

- [x] 11. Implement ai-context/ directory generation
  - [x] 11.1 Implement ARCHITECTURE_SUMMARY.md generation
    - Create `generateArchitectureSummary()` function
    - Extract high-level architecture from existing docs
    - Generate system design overview
    - _Requirements: 3.4_

  - [x] 11.2 Write unit tests for architecture summary
    - Test summary structure and content
    - _Requirements: 3.4_

  - [x] 11.3 Implement PATTERNS.md generation
    - Create `generatePatterns()` function
    - Extract code patterns from codebase
    - Document TypeScript, Vue 3, Nuxt 4, and testing patterns
    - _Requirements: 3.4, 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 11.4 Write unit tests for patterns documentation
    - Test pattern extraction and documentation
    - _Requirements: 3.4_

  - [x] 11.5 Implement DEPENDENCIES.md generation
    - Create `generateDependencies()` function
    - Extract dependencies from package.json
    - Generate dependency graph
    - Document critical vs development dependencies
    - _Requirements: 3.4_

  - [x] 11.6 Write unit tests for dependencies documentation
    - Test dependency extraction and categorization
    - _Requirements: 3.4_

  - [x] 11.7 Implement CONVENTIONS.md generation
    - Create `generateConventions()` function
    - Document naming conventions
    - Document file organization
    - Document code style rules
    - _Requirements: 3.4, 6.6, 6.7_

  - [x] 11.8 Write unit tests for conventions documentation
    - Test conventions extraction and documentation
    - _Requirements: 3.4_

- [x] 12. Checkpoint - Validate AI context generation
  - Run all AI context tests
  - Review generated llms.txt, AGENTS.md, .cursorrules
  - Review ai-context/ files
  - Test with AI tools (Cursor, Claude) to validate context quality
  - Ensure all tests pass, ask the user if questions arise

- [x] 13. Implement Quality Validator
  - [x] 13.1 Implement link validation
    - Create `validateLinks()` function
    - Check all internal links point to existing files
    - Report broken links
    - _Requirements: 4.10_

  - [x] 13.2 Write unit tests for link validation
    - Test with valid and broken links
    - _Requirements: 4.10_

  - [x] 13.3 Implement code example validation
    - Create `validateCodeExamples()` function
    - Parse code blocks and check syntax
    - Verify code examples are complete (no placeholders)
    - _Requirements: 3.6_

  - [x] 13.4 Write unit tests for code validation
    - Test with valid and invalid code examples
    - _Requirements: 3.6_

  - [x] 13.5 Implement structure validation
    - Create `validateStructure()` function
    - Check for required sections based on category
    - Report missing sections
    - _Requirements: 2.4, 2.7, 2.8, 2.9, 2.10_

  - [x] 13.6 Write unit tests for structure validation
    - Test with complete and incomplete documents
    - _Requirements: 2.4, 2.7, 2.8, 2.9, 2.10_

  - [x] 13.7 Implement metadata validation
    - Check for required metadata (title, description, last-updated, tags)
    - Report missing metadata
    - _Requirements: 8.6, 8.7_

  - [x] 13.8 Write property test for metadata completeness
    - **Property 24: Metadata completeness**
    - **Validates: Requirements 8.6, 8.7**

  - [x] 13.9 Implement quality report generation
    - Create `generateQualityReport()` function
    - Compile all validation results
    - Generate overall quality score
    - Provide recommendations
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [x] 13.10 Write unit tests for quality report
    - Test report generation and scoring
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 14. Implement progressive disclosure features
  - [x] 14.1 Implement overview-before-detail structure
    - Ensure generated content presents overviews first
    - Add "Learn More" links to detailed content
    - _Requirements: 7.1, 7.3_

  - [x] 14.2 Write property test for overview structure
    - **Property 21: Overview before detail structure**
    - **Validates: Requirements 7.1**

  - [x] 14.3 Write property test for "Learn More" links
    - **Property 23: Learn more links**
    - **Validates: Requirements 7.3**

  - [x] 14.4 Add quick start sections
    - Ensure tutorials and getting-started docs have quick start sections
    - _Requirements: 7.2_

  - [x] 14.5 Write property test for quick start sections
    - **Property 22: Quick start section presence**
    - **Validates: Requirements 7.2**

- [x] 15. Implement CLI tool for migration execution
  - [x] 15.1 Create CLI entry point
    - Create `scripts/documentation/cli.ts`
    - Implement command-line argument parsing
    - Add commands: audit, migrate, validate, generate-ai-context

  - [x] 15.2 Implement audit command
    - Run documentation auditor
    - Output audit report to console and file
    - _Requirements: 1.1-1.7_

  - [x] 15.3 Implement migrate command
    - Run content migrator with progress reporting
    - Support dry-run mode
    - Support rollback on failure
    - _Requirements: 4.1-4.10_

  - [x] 15.4 Implement validate command
    - Run quality validator
    - Output validation report
    - _Requirements: 8.1-8.10_

  - [x] 15.5 Implement generate-ai-context command
    - Run AI context generator
    - Generate all AI context files
    - _Requirements: 3.1-3.10_

  - [x] 15.6 Write integration tests for CLI
    - Test each command end-to-end
    - Test error handling

- [x] 16. Create maintenance documentation
  - [x] 16.1 Create maintenance guide
    - Document update procedures
    - Document review schedule
    - Document quality checklist
    - Document team responsibilities
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [x] 16.2 Create migration guide for team
    - Document how to use the migration tool
    - Document rollback procedures
    - Document troubleshooting steps

  - [x] 16.3 Create AI context testing guide
    - Document how to test AI context with different tools
    - Document how to validate AI-generated code quality
    - _Requirements: 3.1-3.10_

- [x] 17. Final checkpoint - End-to-end validation
  - Run complete test suite (unit + property + integration)
  - Execute full migration on actual docs/ directory (dry-run first)
  - Validate all generated files
  - Test AI context with Cursor, Claude, and GitHub Copilot
  - Generate quality report
  - Review with team
  - Ensure all tests pass, ask the user if questions arise

- [x] 18. Execute production migration
  - [x] 18.1 Create backup of current documentation
    - Create timestamped backup of docs/ directory
    - Store in safe location

  - [x] 18.2 Execute migration
    - Run migration tool on production docs/
    - Monitor progress and handle errors
    - Validate results

  - [x] 18.3 Generate AI context files
    - Generate llms.txt, AGENTS.md, .cursorrules
    - Generate ai-context/ directory files
    - Validate with AI tools

  - [x] 18.4 Update documentation links
    - Update all internal links
    - Generate redirects
    - Add deprecation notices to old locations

  - [x] 18.5 Validate production migration
    - Run quality validator on migrated docs
    - Check for broken links
    - Verify all content preserved
    - Test navigation

  - [x] 18.6 Communicate changes to team
    - Announce new documentation structure
    - Provide migration guide
    - Gather feedback

## Notes

- All tasks are required for comprehensive implementation
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties (minimum 100 iterations each)
- Unit tests validate specific examples and edge cases
- Integration tests validate end-to-end workflows
- The CLI tool enables easy execution of migration phases
- Production migration includes backup and rollback procedures
