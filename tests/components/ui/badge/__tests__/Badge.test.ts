import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Badge from '~/components/ui/badge/Badge.vue'

describe('UI Badge', () => {
  it('should render badge', () => {
    const wrapper = mount(Badge, {
      slots: { default: 'New' },
    })
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.text()).toBe('New')
  })

  it('should apply default variant', () => {
    const wrapper = mount(Badge, {
      slots: { default: 'Badge' },
    })
    expect(wrapper.attributes('data-slot')).toBe('badge')
  })

  it('should accept custom class', () => {
    const wrapper = mount(Badge, {
      props: { class: 'custom-class' },
      slots: { default: 'Custom' },
    })
    expect(wrapper.classes()).toContain('custom-class')
  })

  it('should render with different variants', () => {
    const wrapper = mount(Badge, {
      props: { variant: 'destructive' },
      slots: { default: 'Error' },
    })
    expect(wrapper.exists()).toBe(true)
  })
})
