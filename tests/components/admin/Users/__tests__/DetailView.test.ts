import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import UserDetailView from '~/components/admin/Users/DetailView.vue'

vi.mock('#imports', () => ({ useI18n: vi.fn(() => ({ t: (k: string) => k })) }))

describe('Admin Users DetailView', () => {
  const mockUser = {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'customer',
    createdAt: '2025-01-01',
  }

  it('should render user detail view', () => {
    const wrapper = mount(UserDetailView, {
      props: { user: mockUser },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('should display user name', () => {
    const wrapper = mount(UserDetailView, {
      props: { user: mockUser },
    })
    expect(wrapper.text()).toContain('John Doe')
  })

  it('should show user email', () => {
    const wrapper = mount(UserDetailView, {
      props: { user: mockUser },
    })
    expect(wrapper.text()).toContain('john@example.com')
  })

  it('should display user role', () => {
    const wrapper = mount(UserDetailView, {
      props: { user: mockUser },
    })
    expect(wrapper.text()).toContain('customer')
  })

  it('should show registration date', () => {
    const wrapper = mount(UserDetailView, {
      props: { user: mockUser },
    })
    expect(wrapper.text()).toContain('2025')
  })
})
