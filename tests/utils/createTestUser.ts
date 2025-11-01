/**
 * Test utility for creating mock user objects
 */

export interface TestUser {
  id: string
  email: string
  email_verified?: boolean
  role?: 'user' | 'admin'
  created_at?: string
  updated_at?: string
  user_metadata?: {
    full_name?: string
    avatar_url?: string
    preferred_language?: string
  }
}

export function createTestUser(overrides: Partial<TestUser> = {}): TestUser {
  const defaultUser: TestUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    email_verified: true,
    role: 'user',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_metadata: {
      full_name: 'Test User',
      avatar_url: 'https://example.com/avatar.jpg',
      preferred_language: 'en',
    },
  }

  return {
    ...defaultUser,
    ...overrides,
    user_metadata: {
      ...defaultUser.user_metadata,
      ...overrides.user_metadata,
    },
  }
}

export function createTestAdmin(overrides: Partial<TestUser> = {}): TestUser {
  return createTestUser({
    ...overrides,
    role: 'admin',
    email: overrides.email || 'admin@example.com',
  })
}

export function createUnverifiedUser(overrides: Partial<TestUser> = {}): TestUser {
  return createTestUser({
    ...overrides,
    email_verified: false,
  })
}
