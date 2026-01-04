import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ShippingInstructions from '~/components/checkout/ShippingInstructions.vue'

vi.mock('#imports', () => ({
  useI18n: vi.fn(() => ({ t: (k: string) => k })),
}))

describe('Checkout ShippingInstructions', () => {
  it('should render shipping instructions form', () => {
    const wrapper = mount(ShippingInstructions, {
      props: { modelValue: '' },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('should display textarea', () => {
    const wrapper = mount(ShippingInstructions, {
      props: { modelValue: '' },
    })
    const textarea = wrapper.find('textarea')
    expect(textarea.exists()).toBe(true)
  })

  it('should show character count', () => {
    const wrapper = mount(ShippingInstructions, {
      props: { modelValue: 'Test instructions' },
    })
    expect(wrapper.text()).toContain('17 / 500')
  })

  it('should use custom max length', () => {
    const wrapper = mount(ShippingInstructions, {
      props: { modelValue: '', maxLength: 200 },
    })
    expect(wrapper.text()).toContain('/ 200')
  })

  it('should emit update:modelValue on input', async () => {
    const wrapper = mount(ShippingInstructions, {
      props: { modelValue: '' },
    })
    const textarea = wrapper.find('textarea')
    await textarea.setValue('New instructions')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
  })

  it('should show optional label', () => {
    const wrapper = mount(ShippingInstructions, {
      props: { modelValue: '' },
    })
    expect(wrapper.text()).toContain('common.optional')
  })
})
