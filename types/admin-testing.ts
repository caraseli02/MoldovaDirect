/**
 * TypeScript types for Admin Testing Dashboard
 */

// User-related types
export interface CreatedUser {
  id: string
  email: string
  name: string
  role: string
  phone: string
}

export interface SeedUserOptions {
  count?: number
  withAddresses?: boolean
  withOrders?: boolean
  roles?: string[]
}

export interface UserSummary {
  total: number
  created: number
  failed: number
  withAddresses: boolean
  withOrders: boolean
  roles: string[]
}

// Data seeding types
export type PresetType =
  | 'empty'
  | 'minimal'
  | 'development'
  | 'demo'
  | 'stress'
  | 'low-stock'
  | 'holiday-rush'
  | 'new-store'

export interface SeedOptions {
  preset?: PresetType
  users?: number
  products?: number
  orders?: number
  categories?: boolean
  clearExisting?: boolean
}

export interface SeedStep {
  step: string
  duration: number
  count: number
}

export interface SeedResults {
  preset: string
  startTime: string
  steps: SeedStep[]
  errors: Array<{ step: string; error: string }>
}

// Cleanup types
export type CleanupAction =
  | 'clear-all'
  | 'clear-test-users'
  | 'clear-orders'
  | 'clear-products'
  | 'reset-database'
  | 'clear-old-carts'

export interface CleanupOptions {
  action: CleanupAction
  confirm?: boolean
  daysOld?: number
}

export interface CleanupResults {
  action: CleanupAction
  timestamp: string
  deletedCounts: Record<string, number>
  errors: string[]
}

// Impersonation types
export interface ImpersonateOptions {
  userId?: string
  action: 'start' | 'end'
  duration?: number
  reason?: string
  logId?: number
}

export interface ImpersonatedUser {
  id: string
  name: string
  email: string
  role: string
}

export interface ImpersonationSession {
  logId: number
  startedAt: string
  endedAt?: string
  duration?: number
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  errors?: Array<{ email?: string; error: string }>
  summary?: Record<string, any>
  results?: any
}

export interface SeedUsersResponse extends ApiResponse {
  users: CreatedUser[]
  summary: UserSummary
}

export interface SeedDataResponse extends ApiResponse {
  results: SeedResults
  endTime: string
  totalDuration: number
}

export interface CleanupResponse extends ApiResponse {
  results: CleanupResults
}

export interface ImpersonationStartResponse extends ApiResponse {
  action: 'start'
  token: string
  logId: number
  expiresAt: string
  duration: number
  impersonating: ImpersonatedUser
  warning: string
}

export interface ImpersonationEndResponse extends ApiResponse {
  action: 'end'
  session: ImpersonationSession
}

// Database statistics
export interface DatabaseStats {
  users: number
  testUsers: number
  products: number
  lowStockProducts: number
  orders: number
  recentOrders: number
  categories: number
  activeCarts: number
  totalRevenue: number
  lastUpdated: string
}

// Job management (for async operations)
export interface BackgroundJob {
  id: string
  type: 'seed-data' | 'cleanup' | 'import'
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress: number
  progressMessage: string
  startedAt: string
  completedAt?: string
  result?: any
  error?: string
  metadata?: Record<string, any>
}

// Scenario templates
export interface ScenarioTemplate {
  id: string
  name: string
  description: string
  config: SeedOptions
  createdAt: string
  lastUsed?: string
}

// Generation history
export interface GenerationHistoryItem {
  id: string
  preset: string
  config: SeedOptions
  timestamp: string
  results: {
    users?: number
    products?: number
    orders?: number
  }
  duration: number
}

// UI State types
export interface TestResult {
  success: boolean
  message: string
  users?: CreatedUser[]
  summary?: Record<string, any>
  errors?: Array<{ email?: string; error: string }>
  results?: any
  error?: any
}

export interface CustomDataConfig {
  products: number
  users: number
  orders: number
  clearExisting: boolean
}

export interface ProgressState {
  active: boolean
  percent: number
  message: string
  cancellable: boolean
}

export interface ValidationError {
  field: string
  message: string
  suggestion?: string
}
