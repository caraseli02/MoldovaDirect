import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import BottomNav from '~/components/layout/BottomNav.vue'

vi.mock('#imports', () => ({
  useI18n: vi.fn(() => ({ t: (k: string) => k })),
}))

vi.mock('@/composables/useCart', () => ({
  useCart: vi.fn(() => ({
    itemCount: { value: 3 },
  })),
}))

vi.mock('vue-router', () => ({
  useRoute: vi.fn(() => ({ path: '/', query: {} })),
}))

describe('Layout BottomNav', () => {
  it('should render bottom navigation', () => {
    const wrapper = mount(BottomNav)
    expect(wrapper.exists()).toBe(true)
  })

  it('should show navigation links', () => {
    const wrapper = mount(BottomNav)
    expect(wrapper.text()).toContain('common.home')
    expect(wrapper.text()).toContain('common.shop')
    expect(wrapper.text()).toContain('common.cart')
    expect(wrapper.text()).toContain('common.search')
    expect(wrapper.text()).toContain('common.account')
  })

  it('should display cart count badge', () => {
    const wrapper = mount(BottomNav)
    const cartBadge = wrapper.find('[data-testid="cart-count"]')
    expect(cartBadge.text()).toBe('3')
  })

  it('should have fixed positioning at bottom', () => {
    const wrapper = mount(BottomNav)
    const nav = wrapper.find('nav')
    expect(nav.classes()).toContain('fixed')
    expect(nav.classes()).toContain('bottom-0')
  })

  it('should be hidden on desktop', () => {
    const wrapper = mount(BottomNav)
    const nav = wrapper.find('nav')
    expect(nav.classes()).toContain('md:hidden')
  })

  it('should have proper ARIA labels', () => {
    const wrapper = mount(BottomNav)
    const nav = wrapper.find('nav')
    expect(nav.attributes('aria-label')).toBe('Primary mobile navigation')
  })
})
