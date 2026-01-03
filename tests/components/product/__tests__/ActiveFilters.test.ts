import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ActiveFilters from '~/components/product/ActiveFilters.vue'

vi.mock('vue-i18n', () => ({
  useI18n: vi.fn(() => ({
    t: (key: string) => key,
  })),
}))

describe('Product ActiveFilters', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  const mockChips = [
    { id: '1', label: 'Vino Tinto', type: 'category' },
    { id: '2', label: 'Reserva', type: 'tag' },
    { id: '3', label: 'España', type: 'origin' },
  ]

  it('should render active filter chips', () => {
    const wrapper = mount(ActiveFilters, {
      props: { chips: mockChips },
    })

    expect(wrapper.text()).toContain('Vino Tinto')
    expect(wrapper.text()).toContain('Reserva')
    expect(wrapper.text()).toContain('España')
  })

  it('should display correct number of chips', () => {
    const wrapper = mount(ActiveFilters, {
      props: { chips: mockChips },
    })

    const chipButtons = wrapper.findAll('button[role="listitem"]')
    expect(chipButtons).toHaveLength(3)
  })

  it('should not render when no chips', () => {
    const wrapper = mount(ActiveFilters, {
      props: { chips: [] },
    })

    expect(wrapper.find('[role="list"]').exists()).toBe(false)
  })

  it('should emit remove-chip event when chip clicked', async () => {
    const wrapper = mount(ActiveFilters, {
      props: { chips: mockChips },
    })

    const firstChip = wrapper.find('button[role="listitem"]')
    await firstChip.trigger('click')

    expect(wrapper.emitted('remove-chip')).toBeTruthy()
    expect(wrapper.emitted('remove-chip')?.[0]).toEqual([mockChips[0]])
  })

  it('should show clear all button when showClearAll is true', () => {
    const wrapper = mount(ActiveFilters, {
      props: { chips: mockChips, showClearAll: true },
    })

    expect(wrapper.text()).toContain('products.filterSummary.clear')
  })

  it('should not show clear all button when showClearAll is false', () => {
    const wrapper = mount(ActiveFilters, {
      props: { chips: mockChips, showClearAll: false },
    })

    const clearButton = wrapper.find('[aria-label="products.filterSummary.clearAllFilters"]')
    expect(clearButton.exists()).toBe(false)
  })

  it('should emit clear-all event when clear button clicked', async () => {
    const wrapper = mount(ActiveFilters, {
      props: { chips: mockChips, showClearAll: true },
    })

    const clearButton = wrapper.find('[aria-label="products.filterSummary.clearAllFilters"]')
    await clearButton.trigger('click')

    expect(wrapper.emitted('clear-all')).toBeTruthy()
  })

  it('should use custom clear label when provided', () => {
    const wrapper = mount(ActiveFilters, {
      props: {
        chips: mockChips,
        showClearAll: true,
        clearAllLabel: 'Reset Filters',
      },
    })

    expect(wrapper.text()).toContain('Reset Filters')
  })
})
