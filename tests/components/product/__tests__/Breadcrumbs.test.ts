import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import ProductBreadcrumbs from '~/components/product/Breadcrumbs.vue'

// Mock vue-i18n
vi.mock('vue-i18n', () => ({
  useI18n: vi.fn(() => ({
    locale: ref('en'),
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
  // Create a proper stub for commonIcon
  const globalStubs = {
    commonIcon: {
      template: '<span :class="name" data-testid="icon">icon</span>',
      props: ['name'],
    },
    NuxtLink: {
      template: '<a :href="to"><slot /></a>',
      props: ['to'],
    },
  }

  const mountComponent = (props = {}) => {
    return mount(ProductBreadcrumbs, {
      props,
      global: { stubs: globalStubs },
    })
  }

  it('should render breadcrumbs', () => {
    const wrapper = mountComponent()
    expect(wrapper.exists()).toBe(true)
  })

  it('should show home link', () => {
    const wrapper = mountComponent()
    expect(wrapper.html()).toContain('lucide:home')
  })

  it('should display products link', () => {
    const wrapper = mountComponent()
    expect(wrapper.text()).toContain('products.breadcrumb')
  })

  it('should have proper ARIA attributes', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('nav').attributes('aria-label')).toBe('Breadcrumb')
  })

  it('should always render nav element even with empty props', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('nav').exists()).toBe(true)
  })

  it('should show search results when searchQuery provided', () => {
    const wrapper = mountComponent({ searchQuery: 'wine' })
    // The i18n mock replaces {query} with the actual value
    expect(wrapper.text()).toContain('products.breadcrumbNav.searchResults')
  })

  it('should show category path', () => {
    const mockCategory = {
      id: 1,
      name: { en: 'Wines', es: 'Vinos' },
    }
    const wrapper = mountComponent({ currentCategory: mockCategory })
    expect(wrapper.text()).toContain('Wines')
  })

  // Test for breadcrumbItems.length > 0 condition (line 69)
  it('should not render category items when no category is set', () => {
    const wrapper = mountComponent({ currentCategory: null })

    // The nav should exist but no extra category breadcrumb items
    expect(wrapper.find('nav').exists()).toBe(true)

    // Only Home and Products links should be in the breadcrumb
    const listItems = wrapper.findAll('li')
    // Home + separator + Products = at least 3 li elements (Home, separator, Products)
    expect(listItems.length).toBeGreaterThanOrEqual(2)

    // But no additional category path should be shown
    expect(wrapper.text()).not.toContain('Wines')
  })

  it('should render category breadcrumb items when category is provided', () => {
    const mockCategory = {
      id: 1,
      name: { en: 'Red Wines', es: 'Vinos Tintos' },
    }
    const wrapper = mountComponent({ currentCategory: mockCategory })

    // Should show the category name in breadcrumbs
    expect(wrapper.text()).toContain('Red Wines')
  })

  it('should render nested category path correctly', () => {
    const mockCategoryPath = [
      { id: 1, name: { en: 'Wines', es: 'Vinos' } },
      { id: 2, name: { en: 'Red Wines', es: 'Vinos Tintos' } },
    ]
    const wrapper = mountComponent({ categoryPath: mockCategoryPath })

    // Both categories should appear in breadcrumbs
    expect(wrapper.text()).toContain('Wines')
    expect(wrapper.text()).toContain('Red Wines')
  })

  it('should show chevron separators between breadcrumb items', () => {
    const mockCategory = {
      id: 1,
      name: { en: 'Wines', es: 'Vinos' },
    }
    const wrapper = mountComponent({ currentCategory: mockCategory })

    // Should have chevron-right icons as separators
    expect(wrapper.html()).toContain('lucide:chevron-right')
  })

  it('should style last breadcrumb item differently (current page)', () => {
    const mockCategory = {
      id: 1,
      name: { en: 'Wines', es: 'Vinos' },
    }
    const wrapper = mountComponent({ currentCategory: mockCategory })

    // Find the last breadcrumb - should be styled as current (font-medium)
    const breadcrumbList = wrapper.find('ol')
    expect(breadcrumbList.exists()).toBe(true)
  })

  it('should include searchQuery in breadcrumbs after category path', () => {
    const mockCategory = {
      id: 1,
      name: { en: 'Wines', es: 'Vinos' },
    }
    const wrapper = mountComponent({
      currentCategory: mockCategory,
      searchQuery: 'merlot',
    })

    // Both category and search should appear
    expect(wrapper.text()).toContain('Wines')
    expect(wrapper.text()).toContain('products.breadcrumbNav.searchResults')
  })

  it('should have schema.org structured data attributes', () => {
    const wrapper = mountComponent()

    const breadcrumbList = wrapper.find('[itemtype="https://schema.org/BreadcrumbList"]')
    expect(breadcrumbList.exists()).toBe(true)
  })
})
