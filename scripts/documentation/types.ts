/**
 * Type definitions for the dual-layer documentation system
 */

export type DiátaxisCategory =
  | 'tutorial'
  | 'how-to'
  | 'reference'
  | 'explanation'
  | 'project'
  | 'archive'
  | 'uncategorized'

export interface FileInfo {
  path: string
  name: string
  size: number
  lastModified: Date
  content: string
  category?: DiátaxisCategory
}

export interface FileInventory {
  files: FileInfo[]
  totalCount: number
  totalSize: number
  categories: Map<DiátaxisCategory, FileInfo[]>
}

export interface DuplicateReport {
  duplicateSets: Array<{
    files: FileInfo[]
    similarity: number
    recommendation: string
  }>
}

export interface GapAnalysis {
  missingTutorials: string[]
  missingHowTos: string[]
  missingReference: string[]
  missingExplanations: string[]
  priority: 'critical' | 'high' | 'medium' | 'low'
}

export interface AuditReport {
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

export interface MigrationMap {
  mappings: Array<{
    oldPath: string
    newPath: string
    category: DiátaxisCategory
    priority: number
    estimatedEffort: 'low' | 'medium' | 'high'
  }>
}

export interface MigrationResult {
  success: boolean
  oldPath: string
  newPath: string
  linksUpdated: number
  errors: string[]
}

export interface AIContextFile {
  name: string
  path: string
  type: string
}

export interface Link {
  text: string
  url: string
  line: number
  column: number
  isInternal: boolean
}

export interface LinkMap {
  [oldPath: string]: string // oldPath -> newPath
}

export interface ValidationReport {
  valid: Link[]
  broken: Link[]
  external: Link[]
}

export interface RedirectConfig {
  redirects: Array<{
    from: string
    to: string
    permanent: boolean
  }>
}

// AI Context Generation Types

export interface LlmsTxtConfig {
  projectName: string
  projectDescription: string
  stack: string[]
  coreDocLinks: Array<{ title: string; path: string }>
  conventions: string[]
  keyConcepts: string[]
}

export interface ProjectIdentity {
  name: string
  type: string
  domain: string
  targetMarket: string
}

export interface TechnicalStack {
  frontend: Record<string, string>
  backend: Record<string, string>
  infrastructure: Record<string, string>
}

export interface ArchitecturePattern {
  name: string
  description: string
  codeExample: string
  rationale: string
}

export interface SecurityRule {
  type: 'never' | 'always'
  rule: string
  codeExample: string
  explanation: string
}

export interface CodeConvention {
  category: 'naming' | 'organization' | 'testing' | 'other'
  convention: string
  example: string
}

export interface CommonTask {
  task: string
  steps: string[]
  codeExample?: string
}

export interface KnownIssue {
  issue: string
  workaround: string
  location: string
}

export interface AgentsMdConfig {
  projectIdentity: ProjectIdentity
  technicalStack: TechnicalStack
  architecturePatterns: ArchitecturePattern[]
  securityRules: SecurityRule[]
  codeConventions: CodeConvention[]
  commonTasks: CommonTask[]
  knownIssues: KnownIssue[]
}

export interface CursorRulesConfig {
  projectContext: string
  codeStyle: string[]
  criticalRules: string[]
  filePatterns: Record<string, string>
  componentCreationGuidelines: string[]
  apiRouteGuidelines: string[]
  testingRequirements: string[]
}

// AI Context Directory Types

export interface PatternDoc {
  vue3Patterns: ArchitecturePattern[]
  apiRoutePatterns: ArchitecturePattern[]
  composablePatterns: ArchitecturePattern[]
  testingPatterns: ArchitecturePattern[]
}

export interface Dependency {
  name: string
  version: string
  purpose: string
}

export interface DependencyDoc {
  critical: Dependency[]
  development: Dependency[]
  dependencyGraph: string // Mermaid diagram
}

export interface NamingConvention {
  type: 'file' | 'component' | 'composable' | 'type' | 'constant'
  convention: string
  example: string
}

export interface FileOrganization {
  structure: string // Directory tree
  rules: string[]
}

export interface CodeStyleRule {
  rule: string
  example: string
}

export interface ConventionDoc {
  naming: NamingConvention[]
  fileOrganization: FileOrganization
  codeStyle: CodeStyleRule[]
}

// Quality Validation Types

export interface LinkValidationReport {
  totalLinks: number
  validLinks: number
  brokenLinks: Array<{ file: string; link: string; line?: number }>
}

export interface CodeValidationReport {
  totalExamples: number
  validExamples: number
  invalidExamples: Array<{ file: string; line: number; error: string; language?: string }>
}

export interface StructureValidationReport {
  hasRequiredSections: boolean
  missingSections: string[]
  recommendations: string[]
}

export interface FormattingReport {
  hasProperHeadings: boolean
  hasCodeBlocks: boolean
  hasLinks: boolean
  issues: string[]
}

export interface FileMetadata {
  title?: string
  description?: string
  lastUpdated?: Date
  author?: string
  tags?: string[]
  relatedFiles?: string[]
  prerequisites?: string[]
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
}

export interface MetadataValidationReport {
  hasTitle: boolean
  hasDescription: boolean
  hasLastUpdated: boolean
  hasTags: boolean
  missingFields: string[]
}

export interface QualityReport {
  overallScore: number
  linkValidation: LinkValidationReport
  codeValidation: CodeValidationReport
  structureIssues: StructureValidationReport[]
  formattingIssues: FormattingReport[]
  metadataIssues: MetadataValidationReport[]
  recommendations: string[]
}
