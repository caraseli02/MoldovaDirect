/**
 * Products Empty State Component Tests
 *
 * Tests the ProductsEmptyState component behavior using Vue Test Utils.
 */
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ProductsEmptyState from '~/components/product/ProductsEmptyState.vue'

// Mock vue-i18n
vi.mock('vue-i18n', () => ({
  useI18n: vi.fn(() => ({
    t: (key: string) => key,
  })),
}))

// Mock UiButton component
vi.mock('#build/components/ui/button/Button.vue', () => ({
  name: 'UiButton',
  template: '<button v-if="showButton" @click="$emit(\'click\')"><slot /></button>',
  props: ['type', 'class'],
  setup(props: any, { emit }: any) {
    const showButton = props?.['v-if'] !== false
    return { showButton, emit }
  },
}))

describe('ProductsEmptyState Component', () => {
  it('should show "no results" message when hasActiveFilters is true', () => {
    const wrapper = mount(ProductsEmptyState, {
      props: {
        hasActiveFilters: true,
      },
      global: {
        stubs: {
          UiButton: {
            template: '<button><slot /></button>',
          },
        },
      },
    })

    expect(wrapper.text()).toContain('products.noResults')
  })

  it('should show "no products" message when hasActiveFilters is false', () => {
    const wrapper = mount(ProductsEmptyState, {
      props: {
        hasActiveFilters: false,
      },
      global: {
        stubs: {
          UiButton: {
            template: '<button><slot /></button>',
          },
        },
      },
    })

    expect(wrapper.text()).toContain('products.noProducts')
  })

  it('should show "try different filters" when hasActiveFilters is true', () => {
    const wrapper = mount(ProductsEmptyState, {
      props: {
        hasActiveFilters: true,
      },
      global: {
        stubs: {
          UiButton: {
            template: '<button><slot /></button>',
          },
        },
      },
    })

    expect(wrapper.text()).toContain('products.tryDifferentFilters')
  })

  it('should show "coming soon" when hasActiveFilters is false', () => {
    const wrapper = mount(ProductsEmptyState, {
      props: {
        hasActiveFilters: false,
      },
      global: {
        stubs: {
          UiButton: {
            template: '<button><slot /></button>',
          },
        },
      },
    })

    expect(wrapper.text()).toContain('products.comingSoon')
  })

  it('should show clear filters button when hasActiveFilters is true', () => {
    const wrapper = mount(ProductsEmptyState, {
      props: {
        hasActiveFilters: true,
      },
      global: {
        stubs: {
          UiButton: {
            template: '<button><slot /></button>',
          },
        },
      },
    })

    const button = wrapper.find('button')
    expect(button.exists()).toBe(true)
    expect(button.text()).toContain('products.clearFilters')
  })

  it('should NOT show clear filters button when hasActiveFilters is false', () => {
    const wrapper = mount(ProductsEmptyState, {
      props: {
        hasActiveFilters: false,
      },
      global: {
        stubs: {
          UiButton: {
            template: '<button><slot /></button>',
          },
        },
      },
    })

    const buttons = wrapper.findAll('button')
    expect(buttons.length).toBe(0)
  })

  it('should emit clearFilters event when button is clicked', async () => {
    const wrapper = mount(ProductsEmptyState, {
      props: {
        hasActiveFilters: true,
      },
      global: {
        stubs: {
          UiButton: {
            template: '<button @click="$emit(\'click\')"><slot /></button>',
            emits: ['click'],
          },
        },
      },
    })

    const button = wrapper.find('button')
    await button.trigger('click')

    expect(wrapper.emitted('clearFilters')).toBeTruthy()
    // The clearFilters event should be emitted at least once
    expect((wrapper.emitted('clearFilters')?.length ?? 0)).toBeGreaterThan(0)
  })

  it('should have proper styling classes', () => {
    const wrapper = mount(ProductsEmptyState, {
      props: {
        hasActiveFilters: false,
      },
      global: {
        stubs: {
          UiButton: {
            template: '<button><slot /></button>',
          },
        },
      },
    })

    const container = wrapper.find('div')
    expect(container.classes()).toContain('border-dashed')
    expect(container.classes()).toContain('border-gray-300')
  })
})
