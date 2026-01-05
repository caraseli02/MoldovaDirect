import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StatusBadge from '~/components/admin/Orders/StatusBadge.vue'

describe('Admin Orders StatusBadge', () => {
  it('should render status badge', () => {
    const wrapper = mount(StatusBadge, {
      props: {
        status: 'pending',
      },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('should display pending status', () => {
    const wrapper = mount(StatusBadge, {
      props: {
        status: 'pending',
      },
    })
    expect(wrapper.text()).toContain('Pending')
  })

  it('should display processing status with icon', () => {
    const wrapper = mount(StatusBadge, {
      props: {
        status: 'processing',
        showIcon: true,
      },
    })
    expect(wrapper.text()).toContain('Processing')
    expect(wrapper.html()).toContain('lucide:package')
  })

  it('should display delivered status', () => {
    const wrapper = mount(StatusBadge, {
      props: {
        status: 'delivered',
      },
    })
    expect(wrapper.text()).toContain('Delivered')
  })

  it('should display cancelled with destructive variant', () => {
    const wrapper = mount(StatusBadge, {
      props: {
        status: 'cancelled',
      },
    })
    expect(wrapper.text()).toContain('Cancelled')
  })

  it('should hide icon when showIcon is false', () => {
    const wrapper = mount(StatusBadge, {
      props: {
        status: 'shipped',
        showIcon: false,
      },
    })
    const icon = wrapper.find('.h-3')
    expect(icon.exists()).toBe(false)
  })
})
