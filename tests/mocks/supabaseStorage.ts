/**
 * Mock Supabase Storage for Testing
 *
 * Provides a comprehensive mock of Supabase Storage operations.
 * Specifically designed for avatar upload testing in profile.vue.
 */

import { vi } from 'vitest'

export interface StorageError {
  message: string
  name?: string
  statusCode?: number
}

export interface UploadOptions {
  upsert?: boolean
  contentType?: string
}

export interface StorageFile {
  name: string
  id: string
  updated_at: string
  created_at: string
  last_accessed_at: string
  metadata?: Record<string, unknown>
}

/**
 * Mock Supabase Storage bucket
 */
export class MockStorageBucket {
  private files = new Map<string, StorageFile>()
  private uploadError: StorageError | null = null
  private removeError: StorageError | null = null

  /**
   * Upload a file to the mock storage bucket
   */
  upload = vi.fn().mockImplementation(
    async (
      _path: string,
      _file: File | Blob,
      _options?: UploadOptions,
    ) => {
      if (this.uploadError) {
        return { data: null, error: this.uploadError }
      }

      const storageFile: StorageFile = {
        name: path,
        id: `file-${Date.now()}`,
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        last_accessed_at: new Date().toISOString(),
      }

      this.files.set(path, storageFile)

      return { data: { path: storageFile.name, id: storageFile.id }, error: null }
    },
  )

  /**
   * Remove files from the mock storage bucket
   */
  remove = vi.fn().mockImplementation(async (paths: string[]) => {
    if (this.removeError) {
      return { data: null, error: this.removeError }
    }

    paths.forEach(path => this.files.delete(path))

    return { data: {}, error: null }
  })

  /**
   * List files in the mock storage bucket
   */
  list = vi.fn().mockImplementation(async (_path?: string, _options?: unknown) => {
    return {
      data: Array.from(this.files.values()),
      error: null,
    }
  })

  /**
   * Get public URL for a file
   */
  getPublicUrl = vi.fn().mockImplementation((path: string) => {
    return {
      data: {
        publicUrl: `https://mock-storage.example.com/${path}`,
      },
    }
  })

  /**
   * Download a file from the mock storage bucket
   */
  download = vi.fn().mockImplementation(async (path: string) => {
    const file = this.files.get(path)
    if (!file) {
      return {
        data: null,
        error: { message: 'File not found', name: 'StorageError', statusCode: 404 },
      }
    }

    return { data: file, error: null }
  })

  /**
   * Set an error to be returned on next upload
   */
  setUploadError(error: StorageError | null): void {
    this.uploadError = error
  }

  /**
   * Set an error to be returned on next remove
   */
  setRemoveError(error: StorageError | null): void {
    this.removeError = error
  }

  /**
   * Clear all files and errors
   */
  reset(): void {
    this.files.clear()
    this.uploadError = null
    this.removeError = null
  }

  /**
   * Check if a file exists in the mock storage
   */
  hasFile(path: string): boolean {
    return this.files.has(path)
  }

  /**
   * Get the number of files in the mock storage
   */
  get fileCount(): number {
    return this.files.size
  }
}

/**
 * Mock Supabase Storage client
 */
export class MockSupabaseStorage {
  private buckets = new Map<string, MockStorageBucket>()

  constructor() {
    // Initialize with common buckets
    this.buckets.set('avatars', new MockStorageBucket())
  }

  /**
   * Get a bucket by name
   */
  from = vi.fn().mockImplementation((bucketName: string) => {
    if (!this.buckets.has(bucketName)) {
      this.buckets.set(bucketName, new MockStorageBucket())
    }
    return this.buckets.get(bucketName)!
  })

  /**
   * Get a specific bucket for direct access
   */
  getBucket(bucketName: string): MockStorageBucket | undefined {
    return this.buckets.get(bucketName)
  }

  /**
   * Reset all buckets
   */
  reset(): void {
    this.buckets.forEach(bucket => bucket.reset())
  }
}

/**
 * Create a mock Supabase Storage instance for testing
 */
export function createMockSupabaseStorage(): MockSupabaseStorage {
  return new MockSupabaseStorage()
}

/**
 * Create a file validation helper
 */
export function validateImageFile(file: File): { valid: boolean, error?: string } {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'Invalid file type. Only images are allowed.' }
  }

  // Check file size (5MB limit)
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    return { valid: false, error: 'File size exceeds 5MB limit.' }
  }

  return { valid: true }
}

/**
 * Helper to create a test image file
 */
export function createTestImageFile(
  filename = 'test-avatar.jpg',
  size = 1024 * 100, // 100KB
  type = 'image/jpeg',
): File {
  const content = new Array(size).fill('x').join('')
  const blob = new Blob([content], { type })
  return new File([blob], filename, { type })
}

/**
 * Helper to create an oversized test file
 */
export function createOversizedTestFile(): File {
  return createTestImageFile('large.jpg', 6 * 1024 * 1024)
}

/**
 * Helper to create an invalid file type
 */
export function createInvalidFileTypeTestFile(): File {
  const content = new Array(100).fill('x').join('')
  const blob = new Blob([content], { type: 'application/pdf' })
  return new File([blob], 'document.pdf', { type: 'application/pdf' })
}

/**
 * Vitest mock for Supabase Storage
 * Use this for simpler mocking without the class structure
 */
export function mockSupabaseStorageSimple() {
  const mockBucket = {
    upload: vi.fn().mockResolvedValue({ data: { path: 'avatar.jpg' }, error: null }),
    remove: vi.fn().mockResolvedValue({ data: {}, error: null }),
    getPublicUrl: vi.fn().mockReturnValue({
      data: { publicUrl: 'https://example.com/avatar.jpg' },
    }),
    list: vi.fn().mockResolvedValue({ data: [], error: null }),
    download: vi.fn().mockResolvedValue({ data: null, error: null }),
  }

  return {
    from: vi.fn(() => mockBucket),
    bucket: mockBucket,
  }
}

/**
 * Mock a failed upload scenario
 */
export function mockFailedUpload(error: string = 'Upload failed') {
  return {
    upload: vi.fn().mockResolvedValue({
      data: null,
      error: { message: error, name: 'StorageError' },
    }),
    remove: vi.fn(),
    getPublicUrl: vi.fn(),
    list: vi.fn(),
    download: vi.fn(),
  }
}

/**
 * Mock a failed remove scenario
 */
export function mockFailedRemove(error: string = 'Remove failed') {
  return {
    upload: vi.fn().mockResolvedValue({ data: null, error: null }),
    remove: vi.fn().mockResolvedValue({
      data: null,
      error: { message: error, name: 'StorageError' },
    }),
    getPublicUrl: vi.fn(),
    list: vi.fn(),
    download: vi.fn(),
  }
}
