/**
 * Mock Supabase client for testing
 */

import { vi } from 'vitest'

export interface MockSupabaseQuery {
  select: ReturnType<typeof vi.fn>
  insert: ReturnType<typeof vi.fn>
  update: ReturnType<typeof vi.fn>
  delete: ReturnType<typeof vi.fn>
  eq: ReturnType<typeof vi.fn>
  neq: ReturnType<typeof vi.fn>
  gt: ReturnType<typeof vi.fn>
  gte: ReturnType<typeof vi.fn>
  lt: ReturnType<typeof vi.fn>
  lte: ReturnType<typeof vi.fn>
  like: ReturnType<typeof vi.fn>
  ilike: ReturnType<typeof vi.fn>
  is: ReturnType<typeof vi.fn>
  in: ReturnType<typeof vi.fn>
  contains: ReturnType<typeof vi.fn>
  order: ReturnType<typeof vi.fn>
  limit: ReturnType<typeof vi.fn>
  single: ReturnType<typeof vi.fn>
  maybeSingle: ReturnType<typeof vi.fn>
  range: ReturnType<typeof vi.fn>
}

export interface MockSupabaseClient {
  from: ReturnType<typeof vi.fn>
  auth: {
    getSession: ReturnType<typeof vi.fn>
    getUser: ReturnType<typeof vi.fn>
    signIn: ReturnType<typeof vi.fn>
    signUp: ReturnType<typeof vi.fn>
    signOut: ReturnType<typeof vi.fn>
    resetPasswordForEmail: ReturnType<typeof vi.fn>
    updateUser: ReturnType<typeof vi.fn>
    onAuthStateChange: ReturnType<typeof vi.fn>
  }
  storage: {
    from: ReturnType<typeof vi.fn>
  }
}

export function createMockSupabaseQuery(): MockSupabaseQuery {
  const query: any = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    gt: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    like: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    contains: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    range: vi.fn().mockReturnThis(),
  }

  return query
}

export function createMockSupabaseClient(): MockSupabaseClient {
  const mockQuery = createMockSupabaseQuery()

  return {
    from: vi.fn(() => mockQuery),
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: null },
        error: null,
      }),
      getUser: vi.fn().mockResolvedValue({
        data: { user: null },
        error: null,
      }),
      signIn: vi.fn().mockResolvedValue({
        data: { user: null, session: null },
        error: null,
      }),
      signUp: vi.fn().mockResolvedValue({
        data: { user: null, session: null },
        error: null,
      }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      resetPasswordForEmail: vi.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
      updateUser: vi.fn().mockResolvedValue({
        data: { user: null },
        error: null,
      }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
    },
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn().mockResolvedValue({ data: null, error: null }),
        download: vi.fn().mockResolvedValue({ data: null, error: null }),
        list: vi.fn().mockResolvedValue({ data: [], error: null }),
        remove: vi.fn().mockResolvedValue({ data: null, error: null }),
        getPublicUrl: vi.fn().mockReturnValue({
          data: { publicUrl: 'https://example.com/file.jpg' },
        }),
      })),
    },
  }
}

/**
 * Helper to mock a successful Supabase query response
 */
export function mockSupabaseSuccess<T>(data: T) {
  return { data, error: null }
}

/**
 * Helper to mock a failed Supabase query response
 */
export function mockSupabaseError(message: string, code?: string) {
  return {
    data: null,
    error: {
      message,
      code: code || 'ERROR',
      details: null,
      hint: null,
    },
  }
}

/**
 * Helper to mock Supabase auth session
 */
export function mockAuthSession(user: any = null) {
  return {
    data: {
      session: user
        ? {
            access_token: 'mock-access-token',
            refresh_token: 'mock-refresh-token',
            user,
            expires_at: Date.now() + 3600000, // 1 hour from now
          }
        : null,
    },
    error: null,
  }
}
