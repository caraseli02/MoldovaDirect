import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import CheckoutHeader from '~/components/checkout/CheckoutHeader.vue'

vi.mock('#imports', () => ({
  useI18n: vi.fn(() => ({ t: (k: string) => k })),
  useLocalePath: vi.fn(() => (path: string) => path),
}))

describe('Checkout CheckoutHeader', () => {
  it('should render checkout header', () => {
    const wrapper = mount(CheckoutHeader)
    expect(wrapper.exists()).toBe(true)
  })

  it('should display Moldova Direct logo', () => {
    const wrapper = mount(CheckoutHeader)
    expect(wrapper.text()).toContain('Moldova Direct')
  })

  it('should show checkout title', () => {
    const wrapper = mount(CheckoutHeader)
    expect(wrapper.text()).toContain('checkout.title')
  })

  it('should have sticky positioning', () => {
    const wrapper = mount(CheckoutHeader)
    const header = wrapper.find('header')
    expect(header.classes()).toContain('sticky')
    expect(header.classes()).toContain('top-0')
  })

  it('should show security icon on mobile', () => {
    const wrapper = mount(CheckoutHeader)
    const securityIcons = wrapper.findAll('svg')
    expect(securityIcons.length).toBeGreaterThan(0)
  })

  it('should toggle mobile menu', async () => {
    const wrapper = mount(CheckoutHeader)
    const menuButton = wrapper.find('[aria-expanded]')
    expect(wrapper.vm.showMobileMenu).toBe(false)
    await menuButton.trigger('click')
    expect(wrapper.vm.showMobileMenu).toBe(true)
  })

  it('should show help link', () => {
    const wrapper = mount(CheckoutHeader)
    expect(wrapper.text()).toContain('common.help')
  })
})
