import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Input from '~/components/ui/input/Input.vue'

describe('UI Input', () => {
  it('should render input', () => {
    const wrapper = mount(Input)
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('input').exists()).toBe(true)
  })

  it('should bind v-model correctly', async () => {
    const wrapper = mount(Input, {
      props: {
        modelValue: 'test value',
        'onUpdate:modelValue': (e: string) => wrapper.setProps({ modelValue: e }),
      },
    })
    const input = wrapper.find('input')
    expect(input.element.value).toBe('test value')
  })

  it('should emit update on input', async () => {
    const wrapper = mount(Input)
    const input = wrapper.find('input')
    await input.setValue('new value')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
  })

  it('should apply custom class', () => {
    const wrapper = mount(Input, {
      props: { class: 'custom-input' },
    })
    expect(wrapper.find('input').classes()).toContain('custom-input')
  })

  it('should handle disabled state', () => {
    const wrapper = mount(Input, {
      attrs: { disabled: true },
    })
    expect(wrapper.find('input').element.disabled).toBe(true)
  })
})
