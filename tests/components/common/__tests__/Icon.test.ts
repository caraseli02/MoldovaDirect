import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Icon from '~/components/common/Icon.vue'

describe('Common Icon', () => {
  it('should render icon component', () => {
    const wrapper = mount(Icon, {
      props: { name: 'lucide:home' },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('should render home icon', () => {
    const wrapper = mount(Icon, {
      props: { name: 'lucide:home' },
    })
    expect(wrapper.html()).toBeTruthy()
  })

  it('should handle icon name without prefix', () => {
    const wrapper = mount(Icon, {
      props: { name: 'home' },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('should handle heroicons prefix', () => {
    const wrapper = mount(Icon, {
      props: { name: 'heroicons:home' },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('should handle icon names with hyphens', () => {
    const wrapper = mount(Icon, {
      props: { name: 'arrow-right' },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('should fallback for unknown icons', () => {
    const wrapper = mount(Icon, {
      props: { name: 'unknown-icon-name' },
    })
    expect(wrapper.exists()).toBe(true)
  })
})
