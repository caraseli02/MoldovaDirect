import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ProductBreadcrumbs from '~/components/product/Breadcrumbs.vue'

vi.mock('#imports', () => ({
  useI18n: vi.fn(() => ({ t: (k: string) => k })),
}))

vi.mock('@vueuse/core', () => ({
  useWindowSize: vi.fn(() => ({ width: { value: 1024 } })),
}))

describe('Product Breadcrumbs', () => {
  it('should render breadcrumbs', () => {
    const wrapper = mount(ProductBreadcrumbs)
    expect(wrapper.exists()).toBe(true)
  })

  it('should show home link', () => {
    const wrapper = mount(ProductBreadcrumbs)
    expect(wrapper.html()).toContain('lucide:home')
  })

  it('should display products link', () => {
    const wrapper = mount(ProductBreadcrumbs)
    expect(wrapper.text()).toContain('products.breadcrumb')
  })

  it('should have proper ARIA attributes', () => {
    const wrapper = mount(ProductBreadcrumbs)
    expect(wrapper.find('nav').attributes('aria-label')).toBe('Breadcrumb')
  })

  it('should show search results when searchQuery provided', () => {
    const wrapper = mount(ProductBreadcrumbs, {
      props: { searchQuery: 'wine' },
    })
    expect(wrapper.html()).toContain('wine')
  })

  it('should show category path', () => {
    const mockCategory = {
      id: 1,
      name: { en: 'Wines' },
    }
    const wrapper = mount(ProductBreadcrumbs, {
      props: { currentCategory: mockCategory },
    })
    expect(wrapper.text()).toContain('Wines')
  })
})
