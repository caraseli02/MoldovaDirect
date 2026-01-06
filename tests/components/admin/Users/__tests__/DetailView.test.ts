import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import UserDetailView from '~/components/admin/Users/DetailView.vue'

// Mock user data
const mockUserData = {
  id: 'user-1',
  email: 'john@example.com',
  status: 'active',
  email_confirmed_at: '2025-01-01',
  created_at: '2025-01-01',
  last_sign_in_at: '2025-01-02',
  profile: {
    name: 'John Doe',
    phone: '+1234567890',
    preferred_language: 'en',
  },
  statistics: {
    totalOrders: 10,
    totalSpent: 500,
    averageOrderValue: 50,
    accountAge: 365,
  },
  orders: [],
  addresses: [],
  activity: [],
}

// i18n plugin that returns keys
const mockI18n = {
  install(app: any) {
    app.config.globalProperties.$t = (key: string) => key
  },
}

describe('Admin Users DetailView', () => {
  beforeEach(() => {
    // Override the global useAdminUsersStore mock with our test data
    ;(global as any).useAdminUsersStore = vi.fn(() => ({
      currentUser: mockUserData,
      userDetailLoading: false,
      error: null,
      clearCurrentUser: vi.fn(),
    }))
  })

  const mountOptions = {
    props: { userId: 'user-1' },
    global: {
      plugins: [mockI18n],
      stubs: {
        commonIcon: { template: '<span class="icon-stub"></span>' },
        AdminUsersActionsDropdown: { template: '<div class="actions-dropdown-stub"></div>', props: ['user'] },
        AdminUtilsUserActivityTracker: { template: '<div class="activity-tracker-stub"></div>', props: ['userId', 'userName'] },
        AdminUserPermissionManager: { template: '<div class="permission-manager-stub"></div>', props: ['userId', 'userName'] },
      },
    },
  }

  it('should render user detail view', () => {
    const wrapper = mount(UserDetailView, mountOptions)
    expect(wrapper.exists()).toBe(true)
  })

  it('should display user name', () => {
    const wrapper = mount(UserDetailView, mountOptions)
    expect(wrapper.text()).toContain('John Doe')
  })

  it('should show user email', () => {
    const wrapper = mount(UserDetailView, mountOptions)
    expect(wrapper.text()).toContain('john@example.com')
  })

  it('should display user status', () => {
    const wrapper = mount(UserDetailView, mountOptions)
    expect(wrapper.text()).toContain('active')
  })

  it('should show statistics cards', () => {
    const wrapper = mount(UserDetailView, mountOptions)
    expect(wrapper.text()).toContain('Total Orders')
    expect(wrapper.text()).toContain('Total Spent')
    expect(wrapper.text()).toContain('Avg Order Value')
    expect(wrapper.text()).toContain('Days Active')
  })

  it('should emit edit event with correct userId when edit button clicked', async () => {
    const wrapper = mount(UserDetailView, mountOptions)
    const editButton = wrapper.find('button')
    expect(editButton.exists()).toBe(true)
    await editButton.trigger('click')
    const emitted = wrapper.emitted('edit')
    expect(emitted).toBeTruthy()
    expect(emitted![0]).toEqual(['user-1'])
  })

  // Event emission tests with payload validation
  describe('event emissions with payloads', () => {
    it('should emit edit event with userId matching props', async () => {
      const wrapper = mount(UserDetailView, {
        ...mountOptions,
        props: { userId: 'user-custom-123' },
      })
      const editButton = wrapper.find('button')
      expect(editButton.exists()).toBe(true)
      await editButton.trigger('click')
      const emitted = wrapper.emitted('edit')
      expect(emitted).toBeTruthy()
      expect(emitted!.length).toBe(1)
      expect(emitted![0]).toEqual(['user-custom-123'])
    })
  })

  // Statistics display tests
  describe('statistics display', () => {
    it('should display correct totalOrders value', () => {
      const wrapper = mount(UserDetailView, mountOptions)
      expect(wrapper.text()).toContain('10')
    })

    it('should display correct accountAge value', () => {
      const wrapper = mount(UserDetailView, mountOptions)
      expect(wrapper.text()).toContain('365')
    })

    it('should format totalSpent as currency', () => {
      const wrapper = mount(UserDetailView, mountOptions)
      // The formatCurrency function formats as EUR
      expect(wrapper.text()).toMatch(/500|EUR/)
    })
  })

  // User status display tests
  describe('user status display', () => {
    it('should apply green styling for active status', () => {
      const wrapper = mount(UserDetailView, mountOptions)
      const statusBadge = wrapper.find('.bg-green-100')
      expect(statusBadge.exists()).toBe(true)
      expect(statusBadge.text()).toBe('active')
    })

    it('should apply yellow styling for inactive status', () => {
      ;(global as any).useAdminUsersStore = vi.fn(() => ({
        currentUser: { ...mockUserData, status: 'inactive' },
        userDetailLoading: false,
        error: null,
        clearCurrentUser: vi.fn(),
      }))
      const wrapper = mount(UserDetailView, mountOptions)
      const statusBadge = wrapper.find('.bg-yellow-100')
      expect(statusBadge.exists()).toBe(true)
      expect(statusBadge.text()).toBe('inactive')
    })
  })

  // Email verification display tests
  describe('email verification display', () => {
    it('should not show unverified warning when email is confirmed', () => {
      const wrapper = mount(UserDetailView, mountOptions)
      expect(wrapper.text()).not.toContain('Email not verified')
    })

    it('should show unverified warning when email is not confirmed', () => {
      ;(global as any).useAdminUsersStore = vi.fn(() => ({
        currentUser: { ...mockUserData, email_confirmed_at: null },
        userDetailLoading: false,
        error: null,
        clearCurrentUser: vi.fn(),
      }))
      const wrapper = mount(UserDetailView, mountOptions)
      expect(wrapper.text()).toContain('Email not verified')
    })
  })

  // Tab navigation tests
  describe('tab navigation', () => {
    it('should display all tab options', () => {
      const wrapper = mount(UserDetailView, mountOptions)
      expect(wrapper.text()).toContain('Profile')
      expect(wrapper.text()).toContain('Orders')
      expect(wrapper.text()).toContain('Activity')
      expect(wrapper.text()).toContain('Permissions')
    })

    it('should show Profile tab as active by default', () => {
      const wrapper = mount(UserDetailView, mountOptions)
      const activeTab = wrapper.find('.border-blue-500')
      expect(activeTab.exists()).toBe(true)
      expect(activeTab.text()).toContain('Profile')
    })
  })

  // Profile tab content tests
  describe('profile tab content', () => {
    it('should display user phone number', () => {
      const wrapper = mount(UserDetailView, mountOptions)
      expect(wrapper.text()).toContain('+1234567890')
    })

    it('should display preferred language', () => {
      const wrapper = mount(UserDetailView, mountOptions)
      expect(wrapper.text()).toContain('en')
    })

    it('should show "Not provided" when phone is missing', () => {
      ;(global as any).useAdminUsersStore = vi.fn(() => ({
        currentUser: { ...mockUserData, profile: { ...mockUserData.profile, phone: null } },
        userDetailLoading: false,
        error: null,
        clearCurrentUser: vi.fn(),
      }))
      const wrapper = mount(UserDetailView, mountOptions)
      expect(wrapper.text()).toContain('Not provided')
    })
  })

  // Loading state tests
  describe('loading state', () => {
    it('should show loading message when loading', () => {
      ;(global as any).useAdminUsersStore = vi.fn(() => ({
        currentUser: null,
        userDetailLoading: true,
        error: null,
        clearCurrentUser: vi.fn(),
      }))
      const wrapper = mount(UserDetailView, mountOptions)
      expect(wrapper.text()).toContain('Loading user details')
    })
  })

  // Error state tests
  describe('error state', () => {
    it('should show error message when error occurs', () => {
      ;(global as any).useAdminUsersStore = vi.fn(() => ({
        currentUser: null,
        userDetailLoading: false,
        error: 'Failed to load user',
        clearCurrentUser: vi.fn(),
      }))
      const wrapper = mount(UserDetailView, mountOptions)
      expect(wrapper.text()).toContain('Failed to load user')
    })

    it('should emit action event with retry when retry button clicked', async () => {
      ;(global as any).useAdminUsersStore = vi.fn(() => ({
        currentUser: null,
        userDetailLoading: false,
        error: 'Failed to load user',
        clearCurrentUser: vi.fn(),
      }))
      const wrapper = mount(UserDetailView, mountOptions)
      const retryButton = wrapper.find('button')
      expect(retryButton.exists()).toBe(true)
      await retryButton.trigger('click')
      const emitted = wrapper.emitted('action')
      expect(emitted).toBeTruthy()
      expect(emitted![0]).toEqual(['retry', 'user-1'])
    })
  })
})
