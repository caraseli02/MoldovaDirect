import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import AppFooter from '~/components/layout/AppFooter.vue'

vi.mock('#imports', () => ({
  useI18n: vi.fn(() => ({
    t: (k: string, params?: any) => {
      if (k === 'footer.newsletter.success.message') {
        return `Subscribed at ${params?.email || 'email'}`
      }
      return k
    },
  })),
  useLocalePath: vi.fn(() => (path: string) => path),
}))

vi.mock('vue-sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe('Layout AppFooter', () => {
  it('should render app footer', () => {
    const wrapper = mount(AppFooter)
    expect(wrapper.exists()).toBe(true)
  })

  it('should display Moldova Direct branding', () => {
    const wrapper = mount(AppFooter)
    expect(wrapper.text()).toContain('Moldova Direct')
  })

  it('should show information links', () => {
    const wrapper = mount(AppFooter)
    expect(wrapper.html()).toContain('/about')
    expect(wrapper.html()).toContain('/terms')
    expect(wrapper.html()).toContain('/privacy')
  })

  it('should display help section links', () => {
    const wrapper = mount(AppFooter)
    expect(wrapper.html()).toContain('/contact')
    expect(wrapper.html()).toContain('/faq')
    expect(wrapper.html()).toContain('/returns')
  })

  it('should show newsletter signup form', () => {
    const wrapper = mount(AppFooter)
    const input = wrapper.find('input[type="email"]')
    expect(input.exists()).toBe(true)
  })

  it('should display payment section', () => {
    const wrapper = mount(AppFooter)
    // Branch design shows payment icons instead of trust badge text
    expect(wrapper.text()).toContain('footer.payment.title')
  })

  it('should show payment method logos', () => {
    const wrapper = mount(AppFooter)
    const paymentLogos = wrapper.findAll('svg')
    expect(paymentLogos.length).toBeGreaterThan(0)
  })

  it('should validate email before submission', async () => {
    const wrapper = mount(AppFooter)
    const form = wrapper.find('form')
    const input = wrapper.find('input[type="email"]')

    await input.setValue('invalid-email')
    await form.trigger('submit')

    // Should not submit with invalid email
    expect(wrapper.vm.isSubmitting).toBe(false)
  })

  it('should handle newsletter subscription', async () => {
    const wrapper = mount(AppFooter)
    const form = wrapper.find('form')
    const input = wrapper.find('input[type="email"]')

    await input.setValue('test@example.com')
    await form.trigger('submit')

    expect(wrapper.vm.isSubmitting).toBe(true)
  })
})
