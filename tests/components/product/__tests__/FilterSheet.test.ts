import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import FilterSheet from '~/components/product/FilterSheet.vue'

describe('Product FilterSheet', () => {
  // Custom stubs that properly handle v-model:open pattern
  const sheetStubs = {
    UiSheet: {
      template: '<div class="sheet" v-if="open"><slot /></div>',
      props: ['open'],
    },
    UiSheetContent: {
      template: '<div class="sheet-content"><slot /></div>',
      props: ['side'],
    },
    UiSheetHeader: {
      template: '<div class="sheet-header"><slot /></div>',
    },
    UiSheetTitle: {
      template: '<h2 class="sheet-title"><slot /></h2>',
    },
    UiSheetDescription: {
      template: '<p class="sheet-description"><slot /></p>',
    },
    UiSheetFooter: {
      template: '<div class="sheet-footer"><slot /></div>',
    },
    UiBadge: {
      template: '<span class="badge"><slot /></span>',
      props: ['variant'],
    },
    UiButton: {
      template: '<button type="button" :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
      props: ['variant', 'disabled', 'type'],
    },
  }

  const mountComponent = (props = {}) => {
    return mount(FilterSheet, {
      props: {
        modelValue: true,
        title: 'Filters',
        activeFilterCount: 0,
        ...props,
      },
      global: {
        stubs: sheetStubs,
      },
    })
  }

  it('should render filter sheet', () => {
    const wrapper = mountComponent()
    expect(wrapper.exists()).toBe(true)
  })

  it('should display filter title', () => {
    const wrapper = mountComponent({ title: 'Filter Products' })
    expect(wrapper.text()).toContain('Filter Products')
  })

  it('should show active filter count badge', () => {
    const wrapper = mountComponent({ activeFilterCount: 5 })
    expect(wrapper.text()).toContain('5')
  })

  it('should emit apply event when apply button clicked', async () => {
    const wrapper = mountComponent()
    const buttons = wrapper.findAll('button')
    // The apply button is the last one (or the one containing 'apply' text)
    const applyButton = buttons.find(btn =>
      btn.text().includes('products.filters.applyFilters') || btn.text().includes('Apply'),
    ) || buttons[buttons.length - 1]

    if (applyButton) {
      await applyButton.trigger('click')
      expect(wrapper.emitted('apply')).toBeTruthy()
    }
  })

  it('should show clear button when filters active', () => {
    const wrapper = mountComponent({
      activeFilterCount: 3,
      showClearButton: true,
    })
    expect(wrapper.text()).toContain('products.filters.clear')
  })

  it('should hide clear button when no filters active', () => {
    const wrapper = mountComponent({
      activeFilterCount: 0,
      showClearButton: true,
    })
    // Clear button should not appear when activeFilterCount is 0
    const buttons = wrapper.findAll('button')
    const clearButton = buttons.find(btn => btn.text().includes('products.filters.clear'))
    expect(clearButton).toBeUndefined()
  })
})
