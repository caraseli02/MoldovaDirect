import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Button from '~/components/ui/button/Button.vue'

describe('UI Button', () => {
  it('should render button', () => {
    const wrapper = mount(Button, {
      slots: { default: 'Click me' },
    })
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.text()).toBe('Click me')
  })

  it('should render as button element by default', () => {
    const wrapper = mount(Button, {
      slots: { default: 'Button' },
    })
    expect(wrapper.element.tagName).toBe('BUTTON')
  })

  it('should apply custom class', () => {
    const wrapper = mount(Button, {
      props: { class: 'my-button' },
      slots: { default: 'Test' },
    })
    expect(wrapper.classes()).toContain('my-button')
  })

  it('should handle click events', async () => {
    const wrapper = mount(Button, {
      slots: { default: 'Click' },
    })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })

  it('should render with variant prop', () => {
    const wrapper = mount(Button, {
      props: { variant: 'destructive' },
      slots: { default: 'Delete' },
    })
    expect(wrapper.exists()).toBe(true)
  })
})
