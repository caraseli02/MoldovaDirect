import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import AppHeader from '~/components/layout/AppHeader.vue'

vi.mock('#imports', () => ({
  useI18n: vi.fn(() => ({
    t: (k: string) => k,
    locale: { value: 'en' },
  })),
  useLocalePath: vi.fn(() => (path: string) => path),
  useRoute: vi.fn(() => ({ path: '/' })),
  useCart: vi.fn(() => ({
    itemCount: { value: 3 },
  })),
  navigateTo: vi.fn(),
  useKeyboardShortcuts: vi.fn(() => ({
    getShortcutDisplay: () => 'Ctrl+K',
  })),
}))

describe('Layout AppHeader', () => {
  it('should render app header', () => {
    const wrapper = mount(AppHeader)
    expect(wrapper.exists()).toBe(true)
  })

  it('should display Moldova Direct logo', () => {
    const wrapper = mount(AppHeader)
    expect(wrapper.text()).toContain('Moldova Direct')
  })

  it('should show navigation links', () => {
    const wrapper = mount(AppHeader)
    expect(wrapper.text()).toContain('common.home')
    expect(wrapper.text()).toContain('common.shop')
    expect(wrapper.text()).toContain('common.about')
    expect(wrapper.text()).toContain('common.contact')
  })

  it('should display cart count badge', () => {
    const wrapper = mount(AppHeader)
    const cartBadge = wrapper.find('[data-testid="cart-count"]')
    expect(cartBadge.exists()).toBe(true)
    expect(cartBadge.text()).toBe('3')
  })

  it('should show search button', () => {
    const wrapper = mount(AppHeader)
    const searchButton = wrapper.find('[aria-label="common.search (Ctrl+K)"]')
    expect(searchButton.exists()).toBe(true)
  })

  it('should display account link', () => {
    const wrapper = mount(AppHeader)
    const accountLink = wrapper.find('[data-testid="user-menu"]')
    expect(accountLink.exists()).toBe(true)
  })

  it('should have sticky header with proper classes', () => {
    const wrapper = mount(AppHeader)
    const header = wrapper.find('header')
    expect(header.classes()).toContain('sticky')
    expect(header.classes()).toContain('top-0')
    expect(header.classes()).toContain('z-50')
  })
})
