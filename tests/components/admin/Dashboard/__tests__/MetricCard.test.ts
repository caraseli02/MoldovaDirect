import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import MetricCard from '~/components/admin/Dashboard/MetricCard.vue'

describe('Admin Dashboard MetricCard', () => {
  it('should render metric card', () => {
    const wrapper = mount(MetricCard, {
      props: {
        label: 'Total Revenue',
        value: '€12,500',
      },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('should display label and value', () => {
    const wrapper = mount(MetricCard, {
      props: {
        label: 'Total Orders',
        value: 142,
      },
    })
    expect(wrapper.text()).toContain('Total Orders')
    expect(wrapper.text()).toContain('142')
  })

  it('should show trend indicator when provided', () => {
    const wrapper = mount(MetricCard, {
      props: {
        label: 'Sales',
        value: 1000,
        trend: 'up',
      },
    })
    expect(wrapper.text()).toContain('📈')
    expect(wrapper.text()).toContain('Upward')
  })

  it('should apply correct variant styles', () => {
    const wrapper = mount(MetricCard, {
      props: {
        label: 'Revenue',
        value: 5000,
        icon: 'lucide:dollar-sign',
        variant: 'success',
      },
    })
    const iconBg = wrapper.find('.bg-green-500')
    expect(iconBg.exists()).toBe(true)
  })

  it('should display subtext when provided', () => {
    const wrapper = mount(MetricCard, {
      props: {
        label: 'Users',
        value: 500,
        subtext: 'Active this month',
      },
    })
    expect(wrapper.text()).toContain('Active this month')
  })

  it('should show down trend with red color', () => {
    const wrapper = mount(MetricCard, {
      props: {
        label: 'Conversions',
        value: 20,
        trend: 'down',
      },
    })
    expect(wrapper.html()).toContain('text-red-500')
    expect(wrapper.text()).toContain('📉')
  })
})
