// Authentication-related TypeScript types
// These types correspond to the enhanced database schema

export interface User {
  id: number
  email: string
  passwordHash: string
  name: string
  phone?: string
  preferredLanguage: string
  emailVerified: boolean
  verificationToken?: string
  verificationExpires?: string
  resetToken?: string
  resetExpires?: string
  failedLoginAttempts: number
  lockedUntil?: string
  lastLogin?: string
  createdAt: string
  updatedAt: string
}

export interface RefreshToken {
  id: number
  userId: number
  tokenHash: string
  expiresAt: string
  createdAt: string
}

export interface AuthEvent {
  id: number
  userId?: number
  eventType: 'login' | 'logout' | 'failed_login' | 'password_reset' | 'email_verification' | 'account_locked'
  ipAddress?: string
  userAgent?: string
  metadata?: string // JSON string for additional event data
  createdAt: string
}

// Request/Response types for authentication endpoints
export interface RegisterRequest {
  email: string
  password: string
  confirmPassword: string
  name: string
  phone?: string
  acceptTerms: boolean
  language: 'es' | 'en' | 'ro' | 'ru'
}

export interface LoginRequest {
  email: string
  password: string
}

export interface VerifyEmailRequest {
  token: string
}

export interface ResendVerificationRequest {
  email: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  password: string
  confirmPassword: string
}

export interface AuthResponse {
  user: Omit<User, 'passwordHash'>
  accessToken?: string
}

export interface ErrorResponse {
  statusCode: number
  statusMessage: string
  details?: {
    field?: string
    code?: string
  }
}

// Security-related types
export interface SecurityConfig {
  maxLoginAttempts: number
  lockoutDurationMinutes: number
  accessTokenExpiryMinutes: number
  refreshTokenExpiryDays: number
  verificationTokenExpiryHours: number
  resetTokenExpiryMinutes: number
}

export interface RateLimitConfig {
  loginAttemptsPerIP: number
  registrationAttemptsPerIP: number
  passwordResetAttemptsPerEmail: number
  verificationResendAttemptsPerEmail: number
  windowMinutes: number
}

// Multi-Factor Authentication (MFA) types
export interface MFAFactor {
  id: string
  type: 'totp'
  friendly_name?: string
  status: 'verified' | 'unverified'
  created_at: string
  updated_at: string
}

export interface MFAEnrollResponse {
  id: string
  type: 'totp'
  totp: {
    qr_code: string // Base64 encoded QR code image
    secret: string // Secret key for manual entry
    uri: string // OTPAuth URI for authenticator apps
  }
}

export interface MFAChallengeResponse {
  id: string
  expires_at: number
}

export interface MFAVerifyRequest {
  factorId: string
  challengeId: string
  code: string
}

export interface MFAUnenrollRequest {
  factorId: string
}

export interface AuthenticatorAssuranceLevel {
  currentLevel: 'aal1' | 'aal2' | null // aal1 = password only, aal2 = password + MFA
  nextLevel: 'aal2' | null
  currentAuthenticationMethods: string[]
}
