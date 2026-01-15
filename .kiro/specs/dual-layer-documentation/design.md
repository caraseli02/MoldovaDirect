# Design Document: Dual-Layer Documentation System

## Overview

The dual-layer documentation system provides a comprehensive solution for organizing project documentation to serve both human developers and AI assistants effectively. The system consists of two complementary layers:

1. **Human Layer**: Documentation organized using the Diátaxis framework (tutorials, how-to guides, reference, explanation) optimized for human navigation and learning
2. **AI Layer**: Structured context files (llms.txt, AGENTS.md, .cursorrules, ai-context/) optimized for machine parsing and AI code generation

The design addresses current pain points where developers spend 30+ minutes finding information in a 24-folder structure, and AI tools generate code that doesn't follow project patterns or security requirements.

## Architecture

### High-Level System Design

```
Moldova Direct Project Root
│
├── llms.txt                          # AI entry point (Layer 2)
├── .cursorrules                      # Cursor AI rules (Layer 2)
│
└── docs/                             # Documentation root
    │
    ├── README.md                     # Navigation hub (Layer 1)
    │
    ├── tutorials/                    # Learning-oriented (Layer 1)
    │   ├── 01-getting-started.md
    │   ├── 02-your-first-feature.md
    │   ├── 03-testing-basics.md
    │   └── 04-deployment-basics.md
    │
    ├── how-to/                       # Problem-oriented (Layer 1)
    │   ├── authentication/
    │   ├── checkout/
    │   ├── deployment/
    │   └── testing/
    │
    ├── reference/                    # Information-oriented (Layer 1)
    │   ├── api/
    │   ├── architecture/
    │   ├── configuration/
    │   └── components/
    │
    ├── explanation/                  # Understanding-oriented (Layer 1)
    │   ├── architecture/
    │   ├── decisions/
    │   └── concepts/
    │
    ├── project/                      # Project management (Layer 1)
    │   ├── status.md
    │   ├── roadmap.md
    │   ├── changelog.md
    │   └── contributing.md
    │
    ├── ai-context/                   # AI-specific docs (Layer 2)
    │   ├── AGENTS.md
    │   ├── ARCHITECTURE_SUMMARY.md
    │   ├── PATTERNS.md
    │   ├── DEPENDENCIES.md
    │   └── CONVENTIONS.md
    │
    └── archive/                      # Historical (Layer 1)
        └── [timestamped folders]
```

### Design Principles

1. **Separation of Concerns**: Human and AI layers serve different purposes but reference the same underlying information
2. **Single Source of Truth**: Technical details live in reference documentation; other layers link to it
3. **Progressive Disclosure**: Information presented in layers from overview to detail
4. **Backward Compatibility**: Old paths remain accessible during transition period
5. **Maintainability**: Clear ownership and update processes for each documentation type

### Layer Interaction Model

```
┌─────────────────────────────────────────────────────────────┐
│                        User Request                          │
└───────────────┬─────────────────────────────┬───────────────┘
                │                             │
                ▼                             ▼
    ┌───────────────────────┐     ┌──────────────────────┐
    │   Human Developer     │     │   AI Assistant       │
    │   (via browser/IDE)   │     │   (via API/tools)    │
    └───────────┬───────────┘     └──────────┬───────────┘
                │                             │
                ▼                             ▼
    ┌───────────────────────┐     ┌──────────────────────┐
    │   Layer 1: Human      │     │   Layer 2: AI        │
    │   - README.md         │     │   - llms.txt         │
    │   - tutorials/        │     │   - AGENTS.md        │
    │   - how-to/           │     │   - .cursorrules     │
    │   - reference/        │     │   - ai-context/      │
    │   - explanation/      │     │                      │
    └───────────┬───────────┘     └──────────┬───────────┘
                │                             │
                └──────────────┬──────────────┘
                               ▼
                ┌──────────────────────────────┐
                │  Shared Content Repository   │
                │  - Architecture docs         │
                │  - Code examples             │
                │  - Security rules            │
                │  - Pattern definitions       │
                └──────────────────────────────┘
```

## Components and Interfaces

### Component 1: Documentation Auditor

**Purpose**: Analyze existing documentation structure and content

**Responsibilities**:
- Scan docs/ directory recursively
- Classify files by Diátaxis type
- Identify duplicates and gaps
- Generate audit report
- Create migration mapping

**Interface**:
```typescript
interface DocumentationAuditor {
  scanDirectory(path: string): Promise<FileInventory>
  categorizeFile(file: FileInfo): DiátaxisCategory
  findDuplicates(inventory: FileInventory): DuplicateReport
  identifyGaps(inventory: FileInventory): GapAnalysis
  generateAuditReport(inventory: FileInventory): AuditReport
  createMigrationMapping(inventory: FileInventory): MigrationMap
}

interface FileInfo {
  path: string
  name: string
  size: number
  lastModified: Date
  content: string
}

interface FileInventory {
  files: FileInfo[]
  totalCount: number
  totalSize: number
  categories: Map<DiátaxisCategory, FileInfo[]>
}

type DiátaxisCategory = 
  | 'tutorial' 
  | 'how-to' 
  | 'reference' 
  | 'explanation' 
  | 'project' 
  | 'archive' 
  | 'uncategorized'

interface DuplicateReport {
  duplicateSets: Array<{
    files: FileInfo[]
    similarity: number
    recommendation: string
  }>
}

interface GapAnalysis {
  missingTutorials: string[]
  missingHowTos: string[]
  missingReference: string[]
  missingExplanations: string[]
  priority: 'critical' | 'high' | 'medium' | 'low'
}

interface AuditReport {
  summary: {
    totalFiles: number
    byCategory: Map<DiátaxisCategory, number>
    duplicates: number
    gaps: number
  }
  details: {
    inventory: FileInventory
    duplicates: DuplicateReport
    gaps: GapAnalysis
  }
  recommendations: string[]
}

interface MigrationMap {
  mappings: Array<{
    oldPath: string
    newPath: string
    category: DiátaxisCategory
    priority: number
    estimatedEffort: 'low' | 'medium' | 'high'
  }>
}
```

### Component 2: Content Migrator

**Purpose**: Move and adapt documentation to new structure

**Responsibilities**:
- Create new directory structure
- Move files to appropriate locations
- Update internal links
- Add breadcrumb navigation
- Create index pages
- Preserve Git history

**Interface**:
```typescript
interface ContentMigrator {
  createStructure(targetPath: string): Promise<void>
  migrateFile(mapping: MigrationMapping): Promise<MigrationResult>
  updateLinks(content: string, linkMap: LinkMap): string
  addBreadcrumbs(content: string, path: string): string
  createIndexPage(category: DiátaxisCategory, files: FileInfo[]): string
  preserveGitHistory(oldPath: string, newPath: string): Promise<void>
}

interface MigrationMapping {
  oldPath: string
  newPath: string
  category: DiátaxisCategory
  adaptContent: boolean
}

interface MigrationResult {
  success: boolean
  oldPath: string
  newPath: string
  linksUpdated: number
  errors: string[]
}

interface LinkMap {
  [oldPath: string]: string  // oldPath -> newPath
}
```

### Component 3: AI Context Generator

**Purpose**: Generate AI-friendly context files

**Responsibilities**:
- Generate/update llms.txt
- Generate/update AGENTS.md
- Generate/update .cursorrules
- Generate ai-context/ files
- Extract patterns from codebase
- Document security rules

**Interface**:
```typescript
interface AIContextGenerator {
  generateLlmsTxt(config: LlmsTxtConfig): Promise<string>
  generateAgentsMd(config: AgentsMdConfig): Promise<string>
  generateCursorRules(config: CursorRulesConfig): Promise<string>
  generateArchitectureSummary(): Promise<string>
  generatePatterns(codebasePath: string): Promise<PatternDoc>
  generateDependencies(packageJson: any): Promise<DependencyDoc>
  generateConventions(codebasePath: string): Promise<ConventionDoc>
}

interface LlmsTxtConfig {
  projectName: string
  projectDescription: string
  stack: string[]
  coreDocLinks: Array<{ title: string; path: string }>
  conventions: string[]
  keyConcepts: string[]
}

interface AgentsMdConfig {
  projectIdentity: ProjectIdentity
  technicalStack: TechnicalStack
  architecturePatterns: ArchitecturePattern[]
  securityRules: SecurityRule[]
  codeConventions: CodeConvention[]
  commonTasks: CommonTask[]
  knownIssues: KnownIssue[]
}

interface ProjectIdentity {
  name: string
  type: string
  domain: string
  targetMarket: string
}

interface TechnicalStack {
  frontend: Record<string, string>
  backend: Record<string, string>
  infrastructure: Record<string, string>
}

interface ArchitecturePattern {
  name: string
  description: string
  codeExample: string
  rationale: string
}

interface SecurityRule {
  type: 'never' | 'always'
  rule: string
  codeExample: string
  explanation: string
}

interface CodeConvention {
  category: 'naming' | 'organization' | 'testing' | 'other'
  convention: string
  example: string
}

interface CommonTask {
  task: string
  steps: string[]
  codeExample?: string
}

interface KnownIssue {
  issue: string
  workaround: string
  location: string
}

interface PatternDoc {
  vue3Patterns: ArchitecturePattern[]
  apiRoutePatterns: ArchitecturePattern[]
  composablePatterns: ArchitecturePattern[]
  testingPatterns: ArchitecturePattern[]
}

interface DependencyDoc {
  critical: Dependency[]
  development: Dependency[]
  dependencyGraph: string  // Mermaid diagram
}

interface Dependency {
  name: string
  version: string
  purpose: string
}

interface ConventionDoc {
  naming: NamingConvention[]
  fileOrganization: FileOrganization
  codeStyle: CodeStyleRule[]
}

interface NamingConvention {
  type: 'file' | 'component' | 'composable' | 'type' | 'constant'
  convention: string
  example: string
}

interface FileOrganization {
  structure: string  // Directory tree
  rules: string[]
}

interface CodeStyleRule {
  rule: string
  example: string
}
```

### Component 4: Navigation Generator

**Purpose**: Create navigation and index pages

**Responsibilities**:
- Generate README.md with navigation
- Create category index pages
- Add breadcrumb navigation
- Generate "See Also" sections
- Create quick reference cards

**Interface**:
```typescript
interface NavigationGenerator {
  generateRootReadme(structure: DocumentationStructure): string
  generateCategoryIndex(category: DiátaxisCategory, files: FileInfo[]): string
  generateBreadcrumbs(filePath: string): string
  generateSeeAlso(file: FileInfo, relatedFiles: FileInfo[]): string
  generateQuickReference(topic: string, items: QuickRefItem[]): string
}

interface DocumentationStructure {
  tutorials: FileInfo[]
  howTo: Map<string, FileInfo[]>  // feature -> files
  reference: Map<string, FileInfo[]>  // domain -> files
  explanation: Map<string, FileInfo[]>  // category -> files
  project: FileInfo[]
}

interface QuickRefItem {
  title: string
  description: string
  code?: string
  link?: string
}
```

### Component 5: Link Updater

**Purpose**: Update internal links and create redirects

**Responsibilities**:
- Find all internal links
- Update links to new paths
- Create redirect mappings
- Validate link integrity
- Generate redirect configuration

**Interface**:
```typescript
interface LinkUpdater {
  findInternalLinks(content: string): Link[]
  updateLink(link: Link, linkMap: LinkMap): Link
  validateLinks(files: FileInfo[]): ValidationReport
  generateRedirects(migrationMap: MigrationMap): RedirectConfig
}

interface Link {
  text: string
  url: string
  line: number
  column: number
}

interface ValidationReport {
  valid: Link[]
  broken: Link[]
  external: Link[]
}

interface RedirectConfig {
  redirects: Array<{
    from: string
    to: string
    permanent: boolean
  }>
}
```

### Component 6: Quality Validator

**Purpose**: Validate documentation quality and completeness

**Responsibilities**:
- Check for broken links
- Validate code examples
- Check for required sections
- Validate formatting
- Generate quality report

**Interface**:
```typescript
interface QualityValidator {
  validateLinks(files: FileInfo[]): LinkValidationReport
  validateCodeExamples(files: FileInfo[]): CodeValidationReport
  validateStructure(file: FileInfo, category: DiátaxisCategory): StructureValidationReport
  validateFormatting(file: FileInfo): FormattingReport
  generateQualityReport(files: FileInfo[]): QualityReport
}

interface LinkValidationReport {
  totalLinks: number
  validLinks: number
  brokenLinks: Array<{ file: string; link: string }>
}

interface CodeValidationReport {
  totalExamples: number
  validExamples: number
  invalidExamples: Array<{ file: string; line: number; error: string }>
}

interface StructureValidationReport {
  hasRequiredSections: boolean
  missingSections: string[]
  recommendations: string[]
}

interface FormattingReport {
  hasProperHeadings: boolean
  hasCodeBlocks: boolean
  hasLinks: boolean
  issues: string[]
}

interface QualityReport {
  overallScore: number
  linkValidation: LinkValidationReport
  codeValidation: CodeValidationReport
  structureIssues: StructureValidationReport[]
  formattingIssues: FormattingReport[]
  recommendations: string[]
}
```

## Data Models

### File System Structure

```typescript
// Represents the new documentation structure
interface DocumentationFileSystem {
  root: string  // docs/
  tutorials: DirectoryNode
  howTo: DirectoryNode
  reference: DirectoryNode
  explanation: DirectoryNode
  project: DirectoryNode
  aiContext: DirectoryNode
  archive: DirectoryNode
}

interface DirectoryNode {
  path: string
  name: string
  files: FileNode[]
  subdirectories: DirectoryNode[]
  indexFile?: FileNode
}

interface FileNode {
  path: string
  name: string
  category: DiátaxisCategory
  metadata: FileMetadata
  content: string
}

interface FileMetadata {
  title: string
  description: string
  lastUpdated: Date
  author: string
  tags: string[]
  relatedFiles: string[]
  prerequisites?: string[]
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
}
```

### Migration State

```typescript
// Tracks migration progress
interface MigrationState {
  phase: 'audit' | 'planning' | 'migration' | 'validation' | 'complete'
  startDate: Date
  completionDate?: Date
  progress: MigrationProgress
  errors: MigrationError[]
}

interface MigrationProgress {
  totalFiles: number
  migratedFiles: number
  failedFiles: number
  skippedFiles: number
  percentComplete: number
}

interface MigrationError {
  file: string
  error: string
  timestamp: Date
  resolved: boolean
}
```

### AI Context Configuration

```typescript
// Configuration for AI context generation
interface AIContextConfig {
  llmsTxt: LlmsTxtConfig
  agentsMd: AgentsMdConfig
  cursorRules: CursorRulesConfig
  updateFrequency: 'manual' | 'weekly' | 'monthly'
  autoGenerate: boolean
}

interface CursorRulesConfig {
  projectContext: string
  codeStyle: string[]
  criticalRules: string[]
  filePatterns: Record<string, string>
  componentCreationGuidelines: string[]
  apiRouteGuidelines: string[]
  testingRequirements: string[]
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Converting EARS to Properties

Based on the prework analysis, I'll convert testable acceptance criteria into properties. After reflection, I've identified opportunities to combine related properties for better coverage and reduced redundancy.

**Property 1: Complete and accurate file inventory**
*For any* directory structure, when generating an inventory, all files should be included and correctly categorized by Diátaxis type (tutorial, how-to, reference, explanation, project, archive, or uncategorized)
**Validates: Requirements 1.1, 1.2**

**Property 2: Duplicate detection completeness**
*For any* set of documentation files, when analyzing for duplicates, all files with similar content (above a similarity threshold) should be identified and grouped together
**Validates: Requirements 1.3**

**Property 3: Gap identification accuracy**
*For any* set of required features and existing documentation, when identifying gaps, all features without corresponding documentation should be reported
**Validates: Requirements 1.4**

**Property 4: Migration mapping completeness**
*For any* set of files to migrate, the migration mapping should include every file with a valid old path, new path, category, priority, and effort estimate
**Validates: Requirements 1.5, 1.6, 1.7**

**Property 5: Content organization by category**
*For any* set of documentation files, when organizing by category (how-to by feature, reference by domain), all files should be placed in appropriate subdirectories matching their category
**Validates: Requirements 2.5, 2.6**

**Property 6: Breadcrumb navigation consistency**
*For any* file in the documentation structure, the file should contain breadcrumb navigation that accurately reflects its location in the hierarchy
**Validates: Requirements 2.7**

**Property 7: Index page generation**
*For any* directory containing documentation files, an index page should be generated that lists all files in that directory with titles and descriptions
**Validates: Requirements 2.8**

**Property 8: Visual hierarchy in generated content**
*For any* generated documentation content (README, index pages), the content should include visual hierarchy elements (headings, emojis, formatting) to improve scannability
**Validates: Requirements 2.9**

**Property 9: Related documentation links**
*For any* documentation file with related content, a "See Also" section should be present with links to related files
**Validates: Requirements 2.10**

**Property 10: Security rule documentation format**
*For any* security rule documented in AI context files, the documentation should include both a "NEVER" example and an "ALWAYS" example with code
**Validates: Requirements 3.5**

**Property 11: Code example completeness**
*For any* code pattern documented, the code example should be syntactically valid, complete (no placeholders), and executable
**Validates: Requirements 3.6**

**Property 12: File organization documentation structure**
*For any* file organization documentation, it should include a directory tree structure example showing the recommended organization
**Validates: Requirements 3.7**

**Property 13: Content preservation during migration**
*For any* file migrated from old location to new location, the content should be identical (or adapted according to category conventions) and Git history should be preserved
**Validates: Requirements 4.1, 4.2**

**Property 14: Link update completeness**
*For any* set of files with internal links, after migration, all internal links should point to valid new locations (no broken links)
**Validates: Requirements 4.3**

**Property 15: Redirect mapping generation**
*For any* migration mapping, a corresponding redirect configuration should be generated mapping each old path to its new path
**Validates: Requirements 4.4**

**Property 16: Deprecation notice insertion**
*For any* file that has been migrated, the old location should contain a deprecation notice with a link to the new location
**Validates: Requirements 4.5**

**Property 17: Content adaptation to category**
*For any* file migrated to a new category, the content should be adapted to follow the conventions of that category (e.g., tutorials should be step-by-step, how-tos should be task-focused)
**Validates: Requirements 4.7**

**Property 18: Duplicate consolidation**
*For any* set of duplicate files identified, after migration, only one authoritative version should exist in the new structure with others archived or removed
**Validates: Requirements 4.8**

**Property 19: Archival instead of deletion**
*For any* outdated documentation file, it should be moved to the archive/ directory rather than deleted
**Validates: Requirements 4.9**

**Property 20: Navigation accessibility**
*For any* migrated file, it should be reachable through the navigation structure (linked from README, index pages, or parent directories)
**Validates: Requirements 4.10**

**Property 21: Overview before detail structure**
*For any* documentation section with both overview and detailed content, the overview should appear before detailed content in the document structure
**Validates: Requirements 7.1**

**Property 22: Quick start section presence**
*For any* tutorial or getting-started documentation, a "Quick Start" section should be present near the beginning
**Validates: Requirements 7.2**

**Property 23: Learn more links**
*For any* overview or summary content, "Learn More" links should be present pointing to detailed documentation
**Validates: Requirements 7.3**

**Property 24: Metadata completeness**
*For any* documentation file, metadata should include title, description, last-updated date, and tags
**Validates: Requirements 8.6, 8.7**

## Error Handling

### Error Categories

1. **File System Errors**
   - Directory creation failures
   - File read/write failures
   - Permission errors
   - Disk space errors

2. **Content Errors**
   - Invalid markdown syntax
   - Broken internal links
   - Missing required sections
   - Invalid code examples

3. **Migration Errors**
   - File conflicts (target already exists)
   - Git history preservation failures
   - Link update failures
   - Content adaptation failures

4. **Validation Errors**
   - Categorization failures
   - Duplicate detection errors
   - Gap analysis errors
   - Quality check failures

### Error Handling Strategies

**File System Errors**:
```typescript
try {
  await fs.mkdir(targetPath, { recursive: true })
} catch (error) {
  if (error.code === 'EEXIST') {
    // Directory already exists, continue
    logger.info(`Directory ${targetPath} already exists`)
  } else if (error.code === 'EACCES') {
    // Permission denied
    throw new MigrationError(
      `Permission denied creating directory ${targetPath}`,
      'PERMISSION_DENIED',
      { path: targetPath, originalError: error }
    )
  } else if (error.code === 'ENOSPC') {
    // No space left on device
    throw new MigrationError(
      `No space left on device`,
      'DISK_FULL',
      { path: targetPath, originalError: error }
    )
  } else {
    // Unknown error
    throw new MigrationError(
      `Failed to create directory ${targetPath}`,
      'UNKNOWN_ERROR',
      { path: targetPath, originalError: error }
    )
  }
}
```

**Content Errors**:
```typescript
function validateMarkdown(content: string, filePath: string): ValidationResult {
  const errors: ValidationError[] = []
  
  // Check for broken internal links
  const links = extractLinks(content)
  for (const link of links) {
    if (link.isInternal && !fileExists(link.target)) {
      errors.push({
        type: 'BROKEN_LINK',
        message: `Broken internal link: ${link.target}`,
        line: link.line,
        severity: 'error'
      })
    }
  }
  
  // Check for required sections
  const requiredSections = getRequiredSections(filePath)
  const actualSections = extractHeadings(content)
  for (const required of requiredSections) {
    if (!actualSections.includes(required)) {
      errors.push({
        type: 'MISSING_SECTION',
        message: `Missing required section: ${required}`,
        severity: 'warning'
      })
    }
  }
  
  return {
    valid: errors.filter(e => e.severity === 'error').length === 0,
    errors,
    warnings: errors.filter(e => e.severity === 'warning')
  }
}
```

**Migration Errors**:
```typescript
async function migrateFile(mapping: MigrationMapping): Promise<MigrationResult> {
  const errors: string[] = []
  
  try {
    // Check if target already exists
    if (await fileExists(mapping.newPath)) {
      const resolution = await resolveConflict(mapping)
      if (resolution === 'skip') {
        return {
          success: false,
          oldPath: mapping.oldPath,
          newPath: mapping.newPath,
          linksUpdated: 0,
          errors: ['Target file already exists, skipped']
        }
      }
    }
    
    // Read source content
    const content = await fs.readFile(mapping.oldPath, 'utf-8')
    
    // Adapt content if needed
    const adaptedContent = mapping.adaptContent
      ? adaptContentToCategory(content, mapping.category)
      : content
    
    // Update internal links
    const { updatedContent, linksUpdated } = updateInternalLinks(
      adaptedContent,
      mapping.oldPath,
      mapping.newPath
    )
    
    // Write to new location
    await fs.mkdir(path.dirname(mapping.newPath), { recursive: true })
    await fs.writeFile(mapping.newPath, updatedContent, 'utf-8')
    
    // Preserve Git history
    await preserveGitHistory(mapping.oldPath, mapping.newPath)
    
    return {
      success: true,
      oldPath: mapping.oldPath,
      newPath: mapping.newPath,
      linksUpdated,
      errors: []
    }
  } catch (error) {
    errors.push(error.message)
    return {
      success: false,
      oldPath: mapping.oldPath,
      newPath: mapping.newPath,
      linksUpdated: 0,
      errors
    }
  }
}
```

**Validation Errors**:
```typescript
function handleValidationError(error: ValidationError): void {
  switch (error.severity) {
    case 'error':
      // Block migration for errors
      throw new MigrationError(
        `Validation failed: ${error.message}`,
        'VALIDATION_ERROR',
        { error }
      )
    case 'warning':
      // Log warnings but continue
      logger.warn(`Validation warning: ${error.message}`, {
        file: error.file,
        line: error.line
      })
      break
    case 'info':
      // Log info messages
      logger.info(`Validation info: ${error.message}`)
      break
  }
}
```

### Rollback Strategy

If migration fails, the system should support rollback:

```typescript
interface MigrationTransaction {
  id: string
  startTime: Date
  operations: MigrationOperation[]
  state: 'in_progress' | 'completed' | 'rolled_back'
}

interface MigrationOperation {
  type: 'create' | 'move' | 'update' | 'delete'
  path: string
  backup?: string
  completed: boolean
}

async function rollbackMigration(transaction: MigrationTransaction): Promise<void> {
  logger.info(`Rolling back migration ${transaction.id}`)
  
  // Reverse operations in reverse order
  for (const op of transaction.operations.reverse()) {
    if (!op.completed) continue
    
    try {
      switch (op.type) {
        case 'create':
          // Delete created file
          await fs.unlink(op.path)
          break
        case 'move':
          // Move file back
          if (op.backup) {
            await fs.rename(op.path, op.backup)
          }
          break
        case 'update':
          // Restore from backup
          if (op.backup) {
            await fs.copyFile(op.backup, op.path)
          }
          break
        case 'delete':
          // Restore from backup
          if (op.backup) {
            await fs.copyFile(op.backup, op.path)
          }
          break
      }
    } catch (error) {
      logger.error(`Failed to rollback operation`, { op, error })
    }
  }
  
  transaction.state = 'rolled_back'
  logger.info(`Migration ${transaction.id} rolled back successfully`)
}
```

## Testing Strategy

### Dual Testing Approach

The documentation system will use both unit tests and property-based tests to ensure correctness:

**Unit Tests**: Verify specific examples, edge cases, and error conditions
- Test specific directory structures
- Test specific file content patterns
- Test error handling for known failure modes
- Test integration between components

**Property Tests**: Verify universal properties across all inputs
- Test file inventory generation with random directory structures
- Test categorization with random file content
- Test link updating with random link patterns
- Test content preservation with random file sets

Both types of tests are complementary and necessary for comprehensive coverage.

### Property-Based Testing Configuration

**Testing Library**: fast-check (for TypeScript/JavaScript)

**Configuration**:
- Minimum 100 iterations per property test
- Each property test references its design document property
- Tag format: `Feature: dual-layer-documentation, Property {number}: {property_text}`

**Example Property Test**:
```typescript
import fc from 'fast-check'
import { describe, it, expect } from 'vitest'

describe('Documentation System Properties', () => {
  // Feature: dual-layer-documentation, Property 1: Complete and accurate file inventory
  it('should generate complete inventory for any directory structure', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generator: random directory structure
        fc.array(fc.record({
          path: fc.string({ minLength: 1, maxLength: 50 }),
          name: fc.string({ minLength: 1, maxLength: 20 }),
          content: fc.string({ maxLength: 1000 })
        }), { minLength: 1, maxLength: 50 }),
        async (files) => {
          // Setup: create test directory structure
          const testDir = await createTestDirectory(files)
          
          // Execute: generate inventory
          const auditor = new DocumentationAuditor()
          const inventory = await auditor.scanDirectory(testDir)
          
          // Verify: all files are included
          expect(inventory.files).toHaveLength(files.length)
          
          // Verify: all files are categorized
          for (const file of inventory.files) {
            expect(file.category).toBeDefined()
            expect(['tutorial', 'how-to', 'reference', 'explanation', 'project', 'archive', 'uncategorized'])
              .toContain(file.category)
          }
          
          // Cleanup
          await cleanupTestDirectory(testDir)
        }
      ),
      { numRuns: 100 }
    )
  })
  
  // Feature: dual-layer-documentation, Property 14: Link update completeness
  it('should update all internal links after migration', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generator: random files with internal links
        fc.array(fc.record({
          path: fc.string({ minLength: 1, maxLength: 50 }),
          content: fc.string({ maxLength: 500 }),
          links: fc.array(fc.string({ minLength: 1, maxLength: 50 }), { maxLength: 10 })
        }), { minLength: 1, maxLength: 20 }),
        // Generator: random migration mappings
        fc.dictionary(fc.string(), fc.string()),
        async (files, linkMap) => {
          // Setup: create test files
          const testDir = await createTestFilesWithLinks(files)
          
          // Execute: migrate files
          const migrator = new ContentMigrator()
          const results = await migrator.migrateFiles(files, linkMap)
          
          // Verify: no broken links
          const validator = new LinkUpdater()
          const validation = await validator.validateLinks(results.migratedFiles)
          expect(validation.brokenLinks).toHaveLength(0)
          
          // Cleanup
          await cleanupTestDirectory(testDir)
        }
      ),
      { numRuns: 100 }
    )
  })
})
```

### Unit Testing Examples

**Example Unit Tests**:
```typescript
describe('Documentation Auditor', () => {
  it('should categorize getting-started guide as tutorial', () => {
    const content = `
# Getting Started

This guide will walk you through setting up the project step by step.

## Step 1: Install Dependencies
...
    `
    const auditor = new DocumentationAuditor()
    const category = auditor.categorizeFile({
      path: 'docs/getting-started.md',
      name: 'getting-started.md',
      content
    })
    expect(category).toBe('tutorial')
  })
  
  it('should categorize API reference as reference', () => {
    const content = `
# API Reference

## Endpoints

### GET /api/products
Returns a list of products.

**Parameters:**
- page: number
- limit: number
    `
    const auditor = new DocumentationAuditor()
    const category = auditor.categorizeFile({
      path: 'docs/api/products.md',
      name: 'products.md',
      content
    })
    expect(category).toBe('reference')
  })
  
  it('should handle file system errors gracefully', async () => {
    const migrator = new ContentMigrator()
    
    // Test permission denied
    await expect(
      migrator.migrateFile({
        oldPath: '/root/protected.md',
        newPath: '/tmp/test.md',
        category: 'tutorial',
        adaptContent: false
      })
    ).rejects.toThrow('Permission denied')
    
    // Test disk full
    await expect(
      migrator.migrateFile({
        oldPath: '/tmp/large-file.md',
        newPath: '/full-disk/test.md',
        category: 'tutorial',
        adaptContent: false
      })
    ).rejects.toThrow('No space left')
  })
})
```

### Integration Testing

**Integration Test Scenarios**:
1. End-to-end migration of sample documentation
2. AI context file generation from real codebase
3. Link validation across entire documentation structure
4. Quality validation of migrated content
5. Rollback and recovery from failed migration

**Example Integration Test**:
```typescript
describe('End-to-End Migration', () => {
  it('should successfully migrate sample documentation', async () => {
    // Setup: create sample documentation structure
    const sampleDocs = await createSampleDocumentation()
    
    // Phase 1: Audit
    const auditor = new DocumentationAuditor()
    const inventory = await auditor.scanDirectory(sampleDocs.path)
    const auditReport = await auditor.generateAuditReport(inventory)
    expect(auditReport.summary.totalFiles).toBeGreaterThan(0)
    
    // Phase 2: Plan migration
    const migrationMap = await auditor.createMigrationMapping(inventory)
    expect(migrationMap.mappings.length).toBe(inventory.files.length)
    
    // Phase 3: Execute migration
    const migrator = new ContentMigrator()
    await migrator.createStructure(sampleDocs.targetPath)
    
    const results = []
    for (const mapping of migrationMap.mappings) {
      const result = await migrator.migrateFile(mapping)
      results.push(result)
    }
    
    // Verify: all migrations successful
    const failures = results.filter(r => !r.success)
    expect(failures).toHaveLength(0)
    
    // Phase 4: Validate
    const validator = new QualityValidator()
    const qualityReport = await validator.generateQualityReport(
      results.map(r => ({ path: r.newPath }))
    )
    expect(qualityReport.linkValidation.brokenLinks).toHaveLength(0)
    
    // Phase 5: Generate AI context
    const aiGenerator = new AIContextGenerator()
    const llmsTxt = await aiGenerator.generateLlmsTxt({
      projectName: 'Moldova Direct',
      projectDescription: 'E-commerce platform',
      stack: ['Nuxt 4', 'Vue 3', 'TypeScript'],
      coreDocLinks: [],
      conventions: [],
      keyConcepts: []
    })
    expect(llmsTxt).toContain('# Moldova Direct')
    
    // Cleanup
    await cleanupSampleDocumentation(sampleDocs)
  })
})
```

### Test Coverage Goals

- **Unit Test Coverage**: 80% minimum for all components
- **Property Test Coverage**: All 24 properties must have corresponding tests
- **Integration Test Coverage**: All major workflows (audit, migrate, validate, generate)
- **Error Handling Coverage**: All error paths must be tested

### Continuous Testing

- Run unit tests on every commit
- Run property tests on every pull request
- Run integration tests before merging to main
- Run full test suite before releases

## Implementation Notes

### Technology Choices

**Language**: TypeScript (matches project stack)
**Testing**: Vitest (unit tests) + fast-check (property tests)
**File System**: Node.js fs/promises API
**Git Operations**: simple-git library
**Markdown Parsing**: remark + remark-parse
**Link Extraction**: remark-extract-links

### Performance Considerations

1. **Parallel Processing**: Process multiple files concurrently during migration
2. **Incremental Updates**: Only process changed files when updating AI context
3. **Caching**: Cache categorization results to avoid re-analyzing unchanged files
4. **Streaming**: Use streaming for large files to reduce memory usage

### Security Considerations

1. **Path Traversal**: Validate all file paths to prevent directory traversal attacks
2. **File Permissions**: Respect file system permissions, fail gracefully on permission errors
3. **Content Sanitization**: Sanitize user-provided content before writing to files
4. **Git History**: Ensure Git operations don't expose sensitive information

### Maintenance Considerations

1. **Versioning**: Version the documentation structure to support future migrations
2. **Backward Compatibility**: Maintain redirects for at least 30 days
3. **Monitoring**: Log all migration operations for audit trail
4. **Documentation**: Document the migration process itself for future reference
