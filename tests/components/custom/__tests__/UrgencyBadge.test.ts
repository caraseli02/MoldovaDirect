import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UrgencyBadge from '~/components/custom/UrgencyBadge.vue'

describe('Custom UrgencyBadge', () => {
  it('should render urgency badge', () => {
    const wrapper = mount(UrgencyBadge, {
      props: { text: 'Limited Stock' },
    })
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.text()).toContain('Limited Stock')
  })

  it('should apply info variant styling', () => {
    const wrapper = mount(UrgencyBadge, {
      props: { text: 'Info', variant: 'info' },
    })
    expect(wrapper.html()).toContain('bg-blue-100')
  })

  it('should apply warning variant styling', () => {
    const wrapper = mount(UrgencyBadge, {
      props: { text: 'Warning', variant: 'warning' },
    })
    expect(wrapper.html()).toContain('bg-yellow-100')
  })

  it('should apply danger variant styling', () => {
    const wrapper = mount(UrgencyBadge, {
      props: { text: 'Danger', variant: 'danger' },
    })
    expect(wrapper.html()).toContain('bg-red-100')
  })

  it('should show icon when provided', () => {
    const wrapper = mount(UrgencyBadge, {
      props: { text: 'Alert', icon: 'lucide:alert-circle' },
    })
    expect(wrapper.html()).toContain('lucide:alert-circle')
  })

  it('should show pulse animation for danger variant', () => {
    const wrapper = mount(UrgencyBadge, {
      props: { text: 'Critical', variant: 'danger', pulse: true },
    })
    expect(wrapper.html()).toContain('animate-ping')
  })
})
