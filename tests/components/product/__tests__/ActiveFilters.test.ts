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

  it('should not render when no chips (empty array)', () => {
    const wrapper = mount(ActiveFilters, {
      props: { chips: [] },
    })

    // When chips.length is 0, the list should NOT render
    // This test catches mutations like `chips.length >= 0` (which would always be true)
    expect(wrapper.find('[role="list"]').exists()).toBe(false)
    // Also verify no chip buttons are rendered
    expect(wrapper.findAll('button[role="listitem"]')).toHaveLength(0)
  })

  it('should render when chips array has exactly one item (boundary test)', () => {
    const singleChip = [{ id: '1', label: 'Single Chip', type: 'category' }]
    const wrapper = mount(ActiveFilters, {
      props: { chips: singleChip },
    })

    // When chips.length is 1 (>0), the list SHOULD render
    // This test catches mutations like `chips.length > 1`
    expect(wrapper.find('[role="list"]').exists()).toBe(true)
    expect(wrapper.findAll('button[role="listitem"]')).toHaveLength(1)
  })

  it('should render all chips when array has multiple items', () => {
    const wrapper = mount(ActiveFilters, {
      props: { chips: mockChips },
    })

    // Verify all 3 chips render with role="listitem"
    expect(wrapper.find('[role="list"]').exists()).toBe(true)
    expect(wrapper.findAll('button[role="listitem"]')).toHaveLength(3)
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

  it('should emit remove-chip with correct chip data when specific chip clicked', async () => {
    const wrapper = mount(ActiveFilters, {
      props: { chips: mockChips },
    })

    // Click the second chip (Reserva)
    const chipButtons = wrapper.findAll('button[role="listitem"]')
    await chipButtons[1].trigger('click')

    // Verify correct chip data is emitted
    expect(wrapper.emitted('remove-chip')).toBeTruthy()
    const emittedChip = wrapper.emitted('remove-chip')?.[0]?.[0]
    expect(emittedChip).toEqual(mockChips[1])
    expect(emittedChip.id).toBe('2')
    expect(emittedChip.label).toBe('Reserva')
    expect(emittedChip.type).toBe('tag')
  })

  it('should render chip labels correctly', () => {
    const wrapper = mount(ActiveFilters, {
      props: { chips: mockChips },
    })

    const chipButtons = wrapper.findAll('button[role="listitem"]')

    // Verify each chip's label is rendered
    expect(chipButtons[0].text()).toContain('Vino Tinto')
    expect(chipButtons[1].text()).toContain('Reserva')
    expect(chipButtons[2].text()).toContain('España')
  })

  it('should have accessible aria-label on each chip button', () => {
    const wrapper = mount(ActiveFilters, {
      props: { chips: mockChips },
    })

    const chipButtons = wrapper.findAll('button[role="listitem"]')

    // Each chip should have an aria-label for screen readers
    chipButtons.forEach((button) => {
      expect(button.attributes('aria-label')).toContain('products.filterSummary.removeFilter')
    })
  })
})
