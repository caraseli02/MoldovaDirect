/**
 * Test Helper Utilities for Profile Page Testing
 *
 * Provides mock data factories and test utilities for profile.vue component tests.
 * Aligns with TDD_LARGE_FILE_REFACTORING_PLAN.md requirements.
 */

import type { Address, AddressEntity } from '~/types/address'

/**
 * Creates a mock Supabase user object for testing
 */
export function createMockUser(overrides: Partial<MockUser> = {}): MockUser {
  return {
    id: 'test-user-id-123',
    email: 'test@example.com',
    user_metadata: {
      name: 'Test User',
      full_name: 'Test User',
      phone: '+1234567890',
      avatar_url: null,
      preferred_language: 'en',
      preferred_currency: 'EUR',
      ...overrides.user_metadata,
    },
    ...overrides,
  }
}

/**
 * Creates a mock user with minimal data (for testing profile completion)
 */
export function createMinimalUser(): MockUser {
  return {
    id: 'minimal-user-id',
    email: 'minimal@example.com',
    user_metadata: {},
  }
}

/**
 * Creates a mock user with avatar URL
 */
export function createMockUserWithAvatar(): MockUser {
  return createMockUser({
    user_metadata: {
      ...createMockUser().user_metadata,
      avatar_url: 'https://example.com/avatar.jpg',
    },
  })
}

/**
 * Creates mock address data for testing
 */
export function createMockAddress(overrides: Partial<Address> = {}): Address {
  return {
    id: 1,
    type: 'shipping',
    firstName: 'John',
    lastName: 'Doe',
    company: undefined,
    street: '123 Test Street',
    city: 'Test City',
    postalCode: '12345',
    province: undefined,
    country: 'Moldova',
    phone: '+37369123456',
    isDefault: false,
    ...overrides,
  }
}

/**
 * Creates multiple mock addresses
 */
export function createMockAddresses(count = 2): Address[] {
  return Array.from({ length: count }, (_, i) =>
    createMockAddress({
      id: i + 1,
      firstName: `User${i + 1}`,
      lastName: `Test${i + 1}`,
      isDefault: i === 0,
    }),
  )
}

/**
 * Creates a mock address entity (database format)
 */
export function createMockAddressEntity(overrides: Partial<AddressEntity> = {}): AddressEntity {
  const address = createMockAddress()
  return {
    id: address.id!,
    user_id: 'test-user-id-123',
    type: address.type,
    first_name: address.firstName,
    last_name: address.lastName,
    company: address.company || null,
    street: address.street,
    city: address.city,
    postal_code: address.postalCode,
    province: address.province || null,
    country: address.country,
    phone: address.phone || null,
    is_default: address.isDefault,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }
}

/**
 * Creates mock File object for avatar upload testing
 */
export function createMockFile(
  filename = 'test-avatar.jpg',
  type = 'image/jpeg',
  size = 1024 * 100, // 100KB
): File {
  const content = new Array(size).fill('x').join('')
  const blob = new Blob([content], { type })
  return new File([blob], filename, { type })
}

/**
 * Creates a mock oversized file (>5MB) for testing size validation
 */
export function createOversizedFile(): File {
  return createMockFile('large.jpg', 'image/jpeg', 6 * 1024 * 1024) // 6MB
}

/**
 * Creates a mock invalid file type for testing type validation
 */
export function createInvalidFileTypeFile(): File {
  return createMockFile('document.pdf', 'application/pdf', 1024 * 100)
}

/**
 * Mock Supabase Storage bucket operations
 */
export function mockSupabaseStorage() {
  const storage = {
    upload: vi.fn().mockResolvedValue({ data: null, error: null }),
    remove: vi.fn().mockResolvedValue({ data: null, error: null }),
    getPublicUrl: vi.fn().mockReturnValue({
      data: { publicUrl: 'https://example.com/avatar.jpg' },
    }),
    list: vi.fn().mockResolvedValue({ data: [], error: null }),
    download: vi.fn().mockResolvedValue({ data: null, error: null }),
  }

  return {
    bucket: vi.fn(() => storage),
    storage,
  }
}

/**
 * Mock Supabase auth update user operation
 */
export function mockSupabaseAuthUpdate() {
  return {
    updateUser: vi.fn().mockResolvedValue({
      data: { user: createMockUser() },
      error: null,
    }),
  }
}

/**
 * Mock Supabase query builder for addresses
 */
export function mockSupabaseAddressQuery(
  addresses: AddressEntity[] = [],
  error = null,
) {
  const mockQuery = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockResolvedValue({ data: null, error }),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue({
      data: addresses,
      error,
    }),
  }

  return {
    from: vi.fn(() => mockQuery),
    mockQuery,
  }
}

/**
 * Advances fake timers by a specified amount of time
 * Use with vi.useFakeTimers() for testing debounced operations
 */
export async function waitForAutoSave(ms = 1100): Promise<void> {
  await vi.advanceTimersByTimeAsync(ms)
}

/**
 * Creates a mock toast notification plugin
 */
export function createMockToast() {
  return {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    dismiss: vi.fn(),
    toast: vi.fn(),
  }
}

/**
 * Creates a mock Nuxt app with required plugins
 */
export function createMockNuxtApp() {
  return {
    $i18n: {
      t: vi.fn((key: string) => key),
      locale: { value: 'en' },
    },
    $toast: createMockToast(),
  }
}

/**
 * Standard mock options for mounting ProfilePage component
 */
export function createProfilePageMountOptions() {
  return {
    global: {
      stubs: {
        ProfileAccordionSection: {
          template: '<div class="accordion-stub"><slot /></div>',
          props: ['title', 'subtitle', 'icon', 'expanded', 'isLast'],
          emits: ['toggle', 'navigate-first', 'navigate-last', 'navigate-next', 'navigate-prev'],
        },
        AddressFormModal: {
          template: '<div class="address-form-modal-stub"><slot /></div>',
          props: ['address'],
          emits: ['save', 'close'],
        },
        DeleteAccountModal: {
          template: '<div class="delete-account-modal-stub"><slot /></div>',
          props: [],
          emits: ['confirm', 'close'],
        },
        Button: {
          template: '<button class="btn-stub"><slot /></button>',
          props: ['variant', 'disabled'],
        },
        commonIcon: {
          template: '<span class="icon-stub" :data-name="name"></span>',
          props: ['name'],
        },
      },
    },
  }
}

/**
 * Validates that profile completion percentage is calculated correctly
 */
export function validateProfileCompletion(
  actual: number,
  expected: number,
): boolean {
  return Math.abs(actual - expected) < 1 // Allow small rounding differences
}

// Type definitions
export interface MockUser {
  id: string
  email: string
  user_metadata: {
    name?: string
    full_name?: string
    phone?: string
    avatar_url?: string | null
    preferred_language?: string
    preferred_currency?: string
  }
}
