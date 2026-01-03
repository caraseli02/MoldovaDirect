import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import SearchBar from '~/components/product/SearchBar.vue'

vi.mock('#imports', () => ({
  useI18n: vi.fn(() => ({
    t: (key: string) => key,
  })),
}))

describe('Product SearchBar', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  const defaultProps = {
    title: 'Buscar Productos',
    description: 'Encuentra tu vino perfecto',
    searchLabel: 'Buscar',
    filterButtonLabel: 'Filtros',
    searchInputId: 'product-search',
  }

  it('should render search bar with title and description', () => {
    const wrapper = mount(SearchBar, { props: defaultProps })

    expect(wrapper.text()).toContain('Buscar Productos')
    expect(wrapper.text()).toContain('Encuentra tu vino perfecto')
  })

  it('should display search input with label', () => {
    const wrapper = mount(SearchBar, { props: defaultProps })

    const input = wrapper.find('#product-search')
    expect(input.exists()).toBe(true)
    expect(wrapper.find('label[for="product-search"]').text()).toBe('Buscar')
  })

  it('should emit open-filters when filter button clicked', async () => {
    const wrapper = mount(SearchBar, { props: defaultProps })

    const filterButton = wrapper.find('button')
    await filterButton.trigger('click')

    expect(wrapper.emitted('open-filters')).toBeTruthy()
  })

  it('should display active filter count badge', () => {
    const wrapper = mount(SearchBar, {
      props: { ...defaultProps, activeFilterCount: 3 },
    })

    expect(wrapper.text()).toContain('3')
    expect(wrapper.html()).toContain('bg-blue-100')
  })

  it('should show loading spinner when loading prop is true', () => {
    const wrapper = mount(SearchBar, {
      props: { ...defaultProps, loading: true },
    })

    expect(wrapper.find('[role="status"]').exists()).toBe(true)
    expect(wrapper.html()).toContain('animate-spin')
  })

  it('should show search icon when not loading', () => {
    const wrapper = mount(SearchBar, {
      props: { ...defaultProps, loading: false },
    })

    const searchIcon = wrapper.find('[name="lucide:search"]')
    expect(searchIcon.exists()).toBe(true)
  })

  it('should set aria-expanded on filter button', () => {
    const wrapper = mount(SearchBar, {
      props: { ...defaultProps, showFilterPanel: true },
    })

    const filterButton = wrapper.find('button')
    expect(filterButton.attributes('aria-expanded')).toBe('true')
  })

  it('should have aria-controls linking to filter panel', () => {
    const wrapper = mount(SearchBar, { props: defaultProps })

    const filterButton = wrapper.find('button')
    expect(filterButton.attributes('aria-controls')).toBe('filter-panel')
  })
})
