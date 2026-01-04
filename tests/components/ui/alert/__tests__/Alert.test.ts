import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Alert from '~/components/ui/alert/Alert.vue'

describe('UI Alert', () => {
  it('should render alert', () => {
    const wrapper = mount(Alert, {
      slots: { default: 'Alert message' },
    })
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.text()).toBe('Alert message')
  })

  it('should have role="alert"', () => {
    const wrapper = mount(Alert)
    expect(wrapper.attributes('role')).toBe('alert')
  })

  it('should apply custom class', () => {
    const wrapper = mount(Alert, {
      props: { class: 'custom-alert' },
    })
    expect(wrapper.classes()).toContain('custom-alert')
  })

  it('should render with variant prop', () => {
    const wrapper = mount(Alert, {
      props: { variant: 'destructive' },
      slots: { default: 'Error occurred' },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('should have data-slot attribute', () => {
    const wrapper = mount(Alert)
    expect(wrapper.attributes('data-slot')).toBe('alert')
  })
})
