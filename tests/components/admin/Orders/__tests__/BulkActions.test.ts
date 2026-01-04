import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BulkActions from '~/components/admin/Orders/BulkActions.vue'

describe('Admin Orders BulkActions', () => {
  it('should render when show is true', () => {
    const wrapper = mount(BulkActions, {
      props: { show: true, selectedCount: 3 },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('should hide when show is false', () => {
    const wrapper = mount(BulkActions, {
      props: { show: false, selectedCount: 0 },
    })
    expect(wrapper.html()).toBe('<!--v-if-->')
  })

  it('should display selected count', () => {
    const wrapper = mount(BulkActions, {
      props: { show: true, selectedCount: 5 },
    })
    expect(wrapper.text()).toContain('5 orders selected')
  })

  it('should show singular form for one order', () => {
    const wrapper = mount(BulkActions, {
      props: { show: true, selectedCount: 1 },
    })
    expect(wrapper.text()).toContain('1 order selected')
  })

  it('should emit clear-selection when clicked', async () => {
    const wrapper = mount(BulkActions, {
      props: { show: true, selectedCount: 3 },
    })
    const clearButton = wrapper.find('button')
    await clearButton.trigger('click')
    expect(wrapper.emitted('clear-selection')).toBeTruthy()
  })

  it('should show bulk action buttons', () => {
    const wrapper = mount(BulkActions, {
      props: { show: true, selectedCount: 3 },
    })
    expect(wrapper.text()).toContain('Mark Processing')
    expect(wrapper.text()).toContain('Mark Shipped')
    expect(wrapper.text()).toContain('Mark Delivered')
  })

  it('should disable buttons when disabled prop is true', () => {
    const wrapper = mount(BulkActions, {
      props: { show: true, selectedCount: 3, disabled: true },
    })
    const buttons = wrapper.findAll('button')
    const actionButtons = buttons.filter(btn => btn.text().includes('Mark'))
    actionButtons.forEach(btn => {
      expect(btn.attributes('disabled')).toBeDefined()
    })
  })
})
