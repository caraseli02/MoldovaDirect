import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import FilterSheet from '~/components/product/FilterSheet.vue'

vi.mock('#imports', () => ({
  useI18n: vi.fn(() => ({ t: (k: string) => k })),
}))

describe('Product FilterSheet', () => {
  it('should render filter sheet', () => {
    const wrapper = mount(FilterSheet, {
      props: {
        modelValue: true,
        title: 'Filter Products',
        activeFilterCount: 0,
      },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('should display filter title', () => {
    const wrapper = mount(FilterSheet, {
      props: {
        modelValue: true,
        title: 'Filter Products',
        activeFilterCount: 0,
      },
    })
    expect(wrapper.text()).toContain('Filter Products')
  })

  it('should show active filter count badge', () => {
    const wrapper = mount(FilterSheet, {
      props: {
        modelValue: true,
        activeFilterCount: 5,
      },
    })
    expect(wrapper.text()).toContain('5')
  })

  it('should emit apply event when apply button clicked', async () => {
    const wrapper = mount(FilterSheet, {
      props: {
        modelValue: true,
        activeFilterCount: 0,
      },
    })
    const applyButton = wrapper.find('button[type="button"]')
    await applyButton.trigger('click')
    expect(wrapper.emitted('apply')).toBeTruthy()
  })

  it('should show clear button when filters active', () => {
    const wrapper = mount(FilterSheet, {
      props: {
        modelValue: true,
        activeFilterCount: 3,
        showClearButton: true,
      },
    })
    expect(wrapper.text()).toContain('products.filters.clear')
  })

  it('should hide clear button when no filters active', () => {
    const wrapper = mount(FilterSheet, {
      props: {
        modelValue: true,
        activeFilterCount: 0,
        showClearButton: true,
      },
    })
    const buttons = wrapper.findAll('button')
    const clearButton = buttons.find(btn => btn.text().includes('clear'))
    expect(clearButton).toBeUndefined()
  })
})
