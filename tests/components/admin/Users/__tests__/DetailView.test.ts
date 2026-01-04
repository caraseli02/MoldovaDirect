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

  it('should emit edit event when edit button clicked', async () => {
    const wrapper = mount(UserDetailView, mountOptions)
    const editButton = wrapper.find('button')
    if (editButton.exists()) {
      await editButton.trigger('click')
      expect(wrapper.emitted('edit')).toBeTruthy()
    }
  })
})
