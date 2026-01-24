import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import BottomNav from '~/components/layout/BottomNav.vue'

// Mock vue-router
vi.mock('vue-router', () => ({
  useRoute: vi.fn(() => ({ path: '/', query: {} })),
}))

// Mock useCart composable
vi.mock('@/composables/useCart', () => ({
  useCart: vi.fn(() => ({
    itemCount: ref(3),
  })),
}))

describe('Layout BottomNav', () => {
  const mountComponent = () => {
    return mount(BottomNav, {
      global: {
        stubs: {
          NuxtLink: {
            template: '<a :href="to" :class="$attrs.class" :aria-current="$attrs[\'aria-current\']" :aria-label="$attrs[\'aria-label\']"><slot /></a>',
            props: ['to'],
            inheritAttrs: false,
          },
          ClientOnly: {
            template: '<span><slot /></span>',
          },
        },
        mocks: {
          $t: (k: string) => k,
        },
      },
    })
  }

  it('should render bottom navigation', () => {
    const wrapper = mountComponent()
    expect(wrapper.exists()).toBe(true)
  })

  it('should show navigation links', () => {
    const wrapper = mountComponent()
    expect(wrapper.text()).toContain('common.home')
    expect(wrapper.text()).toContain('common.shop')
    expect(wrapper.text()).toContain('common.cart')
    expect(wrapper.text()).toContain('common.search')
    expect(wrapper.text()).toContain('common.account')
  })

  it('should display cart count badge', () => {
    const wrapper = mountComponent()
    const cartBadge = wrapper.find('[data-testid="cart-count"]')
    expect(cartBadge.exists()).toBe(true)
    expect(cartBadge.text()).toBe('3')
  })

  it('should have fixed positioning at bottom', () => {
    const wrapper = mountComponent()
    const nav = wrapper.find('nav')
    expect(nav.classes()).toContain('fixed')
    expect(nav.classes()).toContain('bottom-0')
  })

  it('should be hidden on desktop', () => {
    const wrapper = mountComponent()
    const nav = wrapper.find('nav')
    expect(nav.classes()).toContain('lg:hidden')
  })

  it('should have proper ARIA labels', () => {
    const wrapper = mountComponent()
    const nav = wrapper.find('nav')
    expect(nav.attributes('aria-label')).toBe('Primary mobile navigation')
  })
})
