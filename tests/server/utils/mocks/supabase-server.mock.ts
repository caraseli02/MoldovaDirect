/**
 * Mock for #supabase/server module used in tests
 */

import { vi } from 'vitest'

export const serverSupabaseClient = vi.fn()
export const serverSupabaseServiceRole = vi.fn()
export const serverSupabaseUser = vi.fn()
