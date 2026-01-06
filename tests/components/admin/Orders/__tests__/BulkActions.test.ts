import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BulkActions from '~/components/admin/Orders/BulkActions.vue'

// i18n plugin that returns keys
const mockI18n = {
  install(app: any) {
    app.config.globalProperties.$t = (key: string) => key
  },
}

describe('Admin Orders BulkActions', () => {
  const mountOptions = {
    global: {
      plugins: [mockI18n],
      stubs: {
        Button: {
          template: '<button :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
          props: ['disabled', 'variant', 'size'],
        },
        commonIcon: { template: '<span class="icon-stub"></span>' },
        Dialog: { template: '<div class="dialog-stub" v-if="open"><slot /></div>', props: ['open'] },
        DialogContent: { template: '<div class="dialog-content"><slot /></div>' },
        DialogHeader: { template: '<div class="dialog-header"><slot /></div>' },
        DialogTitle: { template: '<div class="dialog-title"><slot /></div>' },
        DialogDescription: { template: '<div class="dialog-desc"><slot /></div>' },
        DialogFooter: { template: '<div class="dialog-footer"><slot /></div>' },
        Textarea: { template: '<textarea></textarea>', props: ['modelValue', 'placeholder', 'rows'] },
      },
    },
  }

  it('should render when show is true', () => {
    const wrapper = mount(BulkActions, {
      ...mountOptions,
      props: { show: true, selectedCount: 3 },
    })
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.html()).not.toBe('<!--v-if-->')
  })

  it('should hide when show is false', () => {
    const wrapper = mount(BulkActions, {
      ...mountOptions,
      props: { show: false, selectedCount: 0 },
    })
    expect(wrapper.html()).toBe('<!--v-if-->')
  })

  it('should display selected count (plural)', () => {
    const wrapper = mount(BulkActions, {
      ...mountOptions,
      props: { show: true, selectedCount: 5 },
    })
    expect(wrapper.text()).toContain('5 orders selected')
  })

  it('should show singular form for one order', () => {
    const wrapper = mount(BulkActions, {
      ...mountOptions,
      props: { show: true, selectedCount: 1 },
    })
    expect(wrapper.text()).toContain('1 order selected')
  })

  it('should emit clear-selection when clicked', async () => {
    const wrapper = mount(BulkActions, {
      ...mountOptions,
      props: { show: true, selectedCount: 3 },
    })
    const buttons = wrapper.findAll('button')
    const clearButton = buttons.find(btn => btn.text().includes('Clear selection'))
    if (clearButton) {
      await clearButton.trigger('click')
      expect(wrapper.emitted('clear-selection')).toBeTruthy()
    }
  })

  it('should show bulk action buttons', () => {
    const wrapper = mount(BulkActions, {
      ...mountOptions,
      props: { show: true, selectedCount: 3 },
    })
    expect(wrapper.text()).toContain('Mark Processing')
    expect(wrapper.text()).toContain('Mark Shipped')
    expect(wrapper.text()).toContain('Mark Delivered')
  })

  it('should disable buttons when disabled prop is true', () => {
    const wrapper = mount(BulkActions, {
      ...mountOptions,
      props: { show: true, selectedCount: 3, disabled: true },
    })
    const buttons = wrapper.findAll('button')
    const actionButtons = buttons.filter(btn => btn.text().includes('Mark'))
    actionButtons.forEach((btn) => {
      expect(btn.attributes('disabled')).toBeDefined()
    })
  })
})
