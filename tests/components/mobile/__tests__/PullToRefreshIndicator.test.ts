import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import PullToRefreshIndicator from '~/components/mobile/PullToRefreshIndicator.vue'

vi.mock('#imports', () => ({
  useI18n: vi.fn(() => ({
    t: (key: string) => key,
    locale: { value: 'en' },
  })),
  computed: vi.fn(fn => ({ value: fn() })),
}))

describe('PullToRefreshIndicator', () => {
  const defaultProps = {
    isRefreshing: false,
    isPulling: false,
    canRefresh: false,
    pullDistance: 0,
    statusText: 'Pull to refresh',
    indicatorStyle: {},
  }

  it('should render the component', () => {
    const wrapper = mount(PullToRefreshIndicator, {
      props: defaultProps,
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('should display status text', () => {
    const wrapper = mount(PullToRefreshIndicator, {
      props: {
        ...defaultProps,
        statusText: 'Pull to refresh',
      },
    })

    expect(wrapper.text()).toContain('Pull to refresh')
  })

  it('should show different status text when can refresh', () => {
    const wrapper = mount(PullToRefreshIndicator, {
      props: {
        ...defaultProps,
        canRefresh: true,
        statusText: 'Release to refresh',
      },
    })

    expect(wrapper.text()).toContain('Release to refresh')
  })

  it('should show refreshing status text', () => {
    const wrapper = mount(PullToRefreshIndicator, {
      props: {
        ...defaultProps,
        isRefreshing: true,
        statusText: 'Refreshing...',
      },
    })

    expect(wrapper.text()).toContain('Refreshing...')
  })

  it('should have animate-spin class when refreshing', () => {
    const wrapper = mount(PullToRefreshIndicator, {
      props: {
        ...defaultProps,
        isRefreshing: true,
        statusText: 'Refreshing...',
      },
    })

    const spinningElement = wrapper.find('.animate-spin')
    expect(spinningElement.exists()).toBe(true)
  })

  it('should not have animate-spin class when not refreshing', () => {
    const wrapper = mount(PullToRefreshIndicator, {
      props: {
        ...defaultProps,
        isRefreshing: false,
      },
    })

    const refreshIconContainer = wrapper.find('.refresh-icon')
    expect(refreshIconContainer.classes()).not.toContain('animate-spin')
  })

  it('should show progress bar when pulling', () => {
    const wrapper = mount(PullToRefreshIndicator, {
      props: {
        ...defaultProps,
        isPulling: true,
        pullDistance: 40,
      },
    })

    // Progress bar container should exist
    const progressBar = wrapper.find('.w-16.h-1')
    expect(progressBar.exists()).toBe(true)
  })

  it('should not show progress bar when refreshing', () => {
    const wrapper = mount(PullToRefreshIndicator, {
      props: {
        ...defaultProps,
        isRefreshing: true,
        isPulling: true,
        pullDistance: 40,
      },
    })

    // Progress bar should not be visible during refresh
    const progressBar = wrapper.find('.w-16.h-1')
    expect(progressBar.exists()).toBe(false)
  })

  it('should apply indicator style', () => {
    const customStyle = { transform: 'translateY(50px)' }
    const wrapper = mount(PullToRefreshIndicator, {
      props: {
        ...defaultProps,
        indicatorStyle: customStyle,
      },
    })

    const indicator = wrapper.find('.pull-to-refresh-indicator')
    expect(indicator.attributes('style')).toContain('translateY(50px)')
  })

  it('should have proper container positioning', () => {
    const wrapper = mount(PullToRefreshIndicator, {
      props: defaultProps,
    })

    const indicator = wrapper.find('.pull-to-refresh-indicator')
    expect(indicator.exists()).toBe(true)
  })

  it('should have flex layout for content', () => {
    const wrapper = mount(PullToRefreshIndicator, {
      props: defaultProps,
    })

    const flexContainer = wrapper.find('.flex.flex-col.items-center')
    expect(flexContainer.exists()).toBe(true)
  })

  it('should have SVG refresh icon', () => {
    const wrapper = mount(PullToRefreshIndicator, {
      props: defaultProps,
    })

    const svg = wrapper.find('svg')
    expect(svg.exists()).toBe(true)
  })

  it('should rotate icon based on pull distance', () => {
    const wrapper = mount(PullToRefreshIndicator, {
      props: {
        ...defaultProps,
        pullDistance: 45,
      },
    })

    // Icon should rotate based on pullDistance * 2, capped at 180
    const svg = wrapper.find('svg')
    const style = svg.attributes('style')
    expect(style).toContain('rotate(90deg)')
  })

  it('should cap icon rotation at 180 degrees', () => {
    const wrapper = mount(PullToRefreshIndicator, {
      props: {
        ...defaultProps,
        pullDistance: 100,
      },
    })

    const svg = wrapper.find('svg')
    const style = svg.attributes('style')
    expect(style).toContain('rotate(180deg)')
  })

  it('should apply blue text color when refreshing', () => {
    const wrapper = mount(PullToRefreshIndicator, {
      props: {
        ...defaultProps,
        isRefreshing: true,
        statusText: 'Refreshing...',
      },
    })

    // The status text should have blue color
    const statusText = wrapper.find('p')
    expect(statusText.classes()).toContain('text-blue-600')
  })

  it('should apply green text color when can refresh', () => {
    const wrapper = mount(PullToRefreshIndicator, {
      props: {
        ...defaultProps,
        canRefresh: true,
        statusText: 'Release to refresh',
      },
    })

    const statusText = wrapper.find('p')
    expect(statusText.classes()).toContain('text-green-600')
  })

  it('should apply gray text color when pulling', () => {
    const wrapper = mount(PullToRefreshIndicator, {
      props: {
        ...defaultProps,
        isPulling: true,
        statusText: 'Pull to refresh',
      },
    })

    const statusText = wrapper.find('p')
    expect(statusText.classes()).toContain('text-gray-600')
  })

  it('should have dark mode compatible styling', () => {
    const wrapper = mount(PullToRefreshIndicator, {
      props: {
        ...defaultProps,
        isPulling: true,
      },
    })

    const statusText = wrapper.find('p')
    expect(statusText.classes()).toContain('dark:text-gray-400')
  })

  it('should have proper progress bar fill width', () => {
    const wrapper = mount(PullToRefreshIndicator, {
      props: {
        ...defaultProps,
        isPulling: true,
        pullDistance: 40, // 50% of 80
      },
    })

    const progressFill = wrapper.find('.bg-blue-600.rounded-full')
    expect(progressFill.attributes('style')).toContain('width: 50%')
  })

  it('should cap progress bar at 100%', () => {
    const wrapper = mount(PullToRefreshIndicator, {
      props: {
        ...defaultProps,
        isPulling: true,
        pullDistance: 100, // More than 80
      },
    })

    const progressFill = wrapper.find('.bg-blue-600.rounded-full')
    expect(progressFill.attributes('style')).toContain('width: 100%')
  })

  it('should have proper text styling', () => {
    const wrapper = mount(PullToRefreshIndicator, {
      props: defaultProps,
    })

    const statusText = wrapper.find('p')
    expect(statusText.classes()).toContain('text-sm')
    expect(statusText.classes()).toContain('font-medium')
  })

  it('should have refresh icon container', () => {
    const wrapper = mount(PullToRefreshIndicator, {
      props: defaultProps,
    })

    const iconContainer = wrapper.find('.refresh-icon')
    expect(iconContainer.exists()).toBe(true)
  })

  it('should have mb-2 margin on icon container', () => {
    const wrapper = mount(PullToRefreshIndicator, {
      props: defaultProps,
    })

    const iconContainer = wrapper.find('.refresh-icon')
    expect(iconContainer.classes()).toContain('mb-2')
  })

  it('should use blue color for refresh icon when refreshing', () => {
    const wrapper = mount(PullToRefreshIndicator, {
      props: {
        ...defaultProps,
        isRefreshing: true,
      },
    })

    const blueIcon = wrapper.find('svg.text-blue-600')
    expect(blueIcon.exists()).toBe(true)
  })

  it('should use gray color for refresh icon when not refreshing', () => {
    const wrapper = mount(PullToRefreshIndicator, {
      props: {
        ...defaultProps,
        isRefreshing: false,
      },
    })

    const grayIcon = wrapper.find('svg.text-gray-600')
    expect(grayIcon.exists()).toBe(true)
  })
})
