import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import GuestInfoForm from '~/components/checkout/GuestInfoForm.vue'

vi.mock('#imports', () => ({
  useI18n: vi.fn(() => ({ t: (k: string) => k })),
}))

describe('Checkout GuestInfoForm', () => {
  const mockGuestInfo = {
    email: '',
    emailUpdates: false,
  }

  it('should render guest info form', () => {
    const wrapper = mount(GuestInfoForm, {
      props: { modelValue: mockGuestInfo, errors: {} },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('should display email input', () => {
    const wrapper = mount(GuestInfoForm, {
      props: { modelValue: mockGuestInfo, errors: {} },
    })
    const input = wrapper.find('input[type="email"]')
    expect(input.exists()).toBe(true)
  })

  it('should show email label with required indicator', () => {
    const wrapper = mount(GuestInfoForm, {
      props: { modelValue: mockGuestInfo, errors: {} },
    })
    expect(wrapper.html()).toContain('checkout.guestInfo.email')
    expect(wrapper.html()).toContain('text-red-500')
  })

  it('should display email error when present', () => {
    const wrapper = mount(GuestInfoForm, {
      props: {
        modelValue: mockGuestInfo,
        errors: { email: 'Invalid email' },
      },
    })
    expect(wrapper.text()).toContain('Invalid email')
  })

  it('should show email updates checkbox', () => {
    const wrapper = mount(GuestInfoForm, {
      props: { modelValue: mockGuestInfo, errors: {} },
    })
    expect(wrapper.text()).toContain('checkout.guestInfo.emailUpdates')
  })

  it('should emit update:modelValue on email input', async () => {
    const wrapper = mount(GuestInfoForm, {
      props: { modelValue: mockGuestInfo, errors: {} },
    })
    const input = wrapper.find('input[type="email"]')
    await input.setValue('test@example.com')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
  })

  it('should emit validate on email blur', async () => {
    const wrapper = mount(GuestInfoForm, {
      props: { modelValue: mockGuestInfo, errors: {} },
    })
    const input = wrapper.find('input[type="email"]')
    await input.trigger('blur')
    expect(wrapper.emitted('validate')).toBeTruthy()
  })
})
