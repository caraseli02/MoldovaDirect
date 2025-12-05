/**
 * Mock for #nitro imports in tests
 */
import { vi } from 'vitest'

export const useStorage = vi.fn(() => ({
  getKeys: vi.fn().mockResolvedValue([]),
  removeItem: vi.fn().mockResolvedValue(undefined),
  getItem: vi.fn().mockResolvedValue(null),
  setItem: vi.fn().mockResolvedValue(undefined)
}))
