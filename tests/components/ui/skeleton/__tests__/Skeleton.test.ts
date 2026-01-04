import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Skeleton from '~/components/ui/skeleton/Skeleton.vue'

describe('UI Skeleton', () => {
  it('should render skeleton', () => {
    const wrapper = mount(Skeleton)
    expect(wrapper.exists()).toBe(true)
  })

  it('should have animate-pulse class', () => {
    const wrapper = mount(Skeleton)
    expect(wrapper.classes()).toContain('animate-pulse')
  })

  it('should apply custom class', () => {
    const wrapper = mount(Skeleton, {
      props: { class: 'h-10 w-full' },
    })
    expect(wrapper.classes()).toContain('h-10')
    expect(wrapper.classes()).toContain('w-full')
  })

  it('should have data-slot attribute', () => {
    const wrapper = mount(Skeleton)
    expect(wrapper.attributes('data-slot')).toBe('skeleton')
  })
})
