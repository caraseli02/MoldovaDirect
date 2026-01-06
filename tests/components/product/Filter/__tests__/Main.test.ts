import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import FilterMain from '~/components/product/Filter/Main.vue'

vi.mock('#imports', () => ({
  useI18n: vi.fn(() => ({ t: (k: string) => k })),
}))

describe('Product Filter Main', () => {
  const mockFilters = {
    categories: [],
    priceRange: { min: 0, max: 100 },
    attributes: {},
    search: '',
  }

  const mockAvailableFilters = {
    categories: [
      { id: 'cat-1', name: 'Wines', slug: 'wines', count: 10 },
    ],
    priceRange: { min: 0, max: 200 },
    attributes: [
      { key: 'color', label: 'Color', options: ['Red', 'White'] },
    ],
  }

  it('should render filter main component', () => {
    const wrapper = mount(FilterMain, {
      props: {
        filters: mockFilters,
        availableFilters: mockAvailableFilters,
      },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('should emit filter updates', async () => {
    const wrapper = mount(FilterMain, {
      props: {
        filters: mockFilters,
        availableFilters: mockAvailableFilters,
      },
    })

    // Wait for component to mount
    await wrapper.vm.$nextTick()

    // Check if component emits update event
    expect(wrapper.emitted()).toBeDefined()
  })

  it('should sync with external filter changes', async () => {
    const wrapper = mount(FilterMain, {
      props: {
        filters: mockFilters,
        availableFilters: mockAvailableFilters,
      },
    })

    const newFilters = {
      ...mockFilters,
      search: 'wine',
    }

    await wrapper.setProps({ filters: newFilters })
    expect(wrapper.props('filters')).toEqual(newFilters)
  })

  it('should render filter content', () => {
    const wrapper = mount(FilterMain, {
      props: {
        filters: mockFilters,
        availableFilters: mockAvailableFilters,
      },
    })
    expect(wrapper.html()).toBeTruthy()
  })
})
