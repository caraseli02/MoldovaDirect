import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import ProductBreadcrumbs from '~/components/product/Breadcrumbs.vue'

// Mock vue-i18n
vi.mock('vue-i18n', () => ({
  useI18n: vi.fn(() => ({
    t: (key: string, params?: Record<string, unknown>) => {
      if (params) {
        let result = key
        Object.entries(params).forEach(([param, value]) => {
          result = result.replace(`{${param}}`, String(value))
        })
        return result
      }
      return key
    },
  })),
}))

// Mock @vueuse/core
vi.mock('@vueuse/core', () => ({
  useWindowSize: vi.fn(() => ({
    width: ref(1024),
    height: ref(768),
  })),
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
    // The i18n mock replaces {query} with the actual value
    expect(wrapper.text()).toContain('products.breadcrumbNav.searchResults')
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
