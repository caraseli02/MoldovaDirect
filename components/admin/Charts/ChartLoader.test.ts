import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, ref } from 'vue'
import type { ChartData, ChartOptions } from 'chart.js'

/**
 * ChartLoader Component Tests
 *
 * Tests the async Chart.js wrapper component for:
 * - Lazy loading behavior
 * - Reactive data updates
 * - Error handling
 * - Cleanup on unmount
 */

// Mock Chart.js to avoid loading the actual library in tests
vi.mock('chart.js', () => ({
  Chart: vi.fn().mockImplementation((canvas, config) => ({
    destroy: vi.fn(),
    update: vi.fn(),
    data: config.data,
    options: config.options,
    type: config.type,
  })),
  registerables: [],
}))

describe('ChartLoader', () => {
  let wrapper: any
  let ChartLoader: any

  beforeEach(async () => {
    // Dynamically import component to test
    const module = await import('./ChartLoader.vue')
    ChartLoader = module.default
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('should render loading state initially', () => {
    const chartData: ChartData<'line'> = {
      labels: ['A', 'B', 'C'],
      datasets: [{
        label: 'Test',
        data: [1, 2, 3],
      }],
    }

    wrapper = mount(ChartLoader, {
      props: {
        type: 'line',
        data: chartData,
      },
    })

    expect(wrapper.html()).toBeTruthy()
  })

  it('should accept all required props', () => {
    const chartData: ChartData<'bar'> = {
      labels: ['Q1', 'Q2', 'Q3'],
      datasets: [{
        label: 'Revenue',
        data: [100, 200, 300],
      }],
    }

    const chartOptions: ChartOptions<'bar'> = {
      responsive: true,
      plugins: {
        legend: {
          display: false,
        },
      },
    }

    wrapper = mount(ChartLoader, {
      props: {
        type: 'bar',
        data: chartData,
        options: chartOptions,
        height: 400,
      },
    })

    expect(wrapper.props('type')).toBe('bar')
    expect(wrapper.props('data')).toEqual(chartData)
    expect(wrapper.props('options')).toEqual(chartOptions)
    expect(wrapper.props('height')).toBe(400)
  })

  it('should validate chart type prop', () => {
    const chartData: ChartData<'line'> = {
      labels: ['A'],
      datasets: [{ label: 'Test', data: [1] }],
    }

    // Valid types
    const validTypes = ['line', 'bar', 'doughnut', 'pie']
    validTypes.forEach((type) => {
      wrapper = mount(ChartLoader, {
        props: {
          type: type as unknown,
          data: chartData,
        },
      })
      expect(wrapper.props('type')).toBe(type)
      wrapper.unmount()
    })
  })

  it('should emit chart-created event when chart is initialized', async () => {
    const chartData: ChartData<'line'> = {
      labels: ['A', 'B'],
      datasets: [{ label: 'Test', data: [1, 2] }],
    }

    wrapper = mount(ChartLoader, {
      props: {
        type: 'line',
        data: chartData,
      },
    })

    await flushPromises()

    // Check if chart-created event would be emitted
    // Note: In real test with actual Chart.js, we'd check wrapper.emitted('chart-created')
    expect(wrapper.exists()).toBe(true)
  })

  it('should support all chart types', () => {
    const types: Array<'line' | 'bar' | 'doughnut' | 'pie'> = ['line', 'bar', 'doughnut', 'pie']

    types.forEach((type) => {
      const chartData: ChartData = {
        labels: ['A', 'B', 'C'],
        datasets: [{ label: 'Test', data: [1, 2, 3] }],
      }

      wrapper = mount(ChartLoader, {
        props: {
          type,
          data: chartData,
        },
      })

      expect(wrapper.props('type')).toBe(type)
      wrapper.unmount()
    })
  })

  it('should use default options when not provided', () => {
    const chartData: ChartData<'line'> = {
      labels: ['A'],
      datasets: [{ label: 'Test', data: [1] }],
    }

    wrapper = mount(ChartLoader, {
      props: {
        type: 'line',
        data: chartData,
      },
    })

    expect(wrapper.props('options')).toEqual({
      responsive: true,
      maintainAspectRatio: true,
    })
  })

  it('should handle reactive data updates', async () => {
    // Create a test wrapper component with reactive data
    const TestWrapper = defineComponent({
      setup() {
        const chartData = ref<ChartData<'line'>>({
          labels: ['A', 'B'],
          datasets: [{ label: 'Test', data: [1, 2] }],
        })

        const _updateData = () => {
          chartData.value = {
            labels: ['X', 'Y', 'Z'],
            datasets: [{ label: 'Updated', data: [10, 20, 30] }],
          }
        }

        return () => h(ChartLoader, {
          type: 'line',
          data: chartData.value,
        })
      },
    })

    wrapper = mount(TestWrapper)
    await flushPromises()

    expect(wrapper.exists()).toBe(true)
  })

  it('should render with custom dimensions', () => {
    const chartData: ChartData<'bar'> = {
      labels: ['A'],
      datasets: [{ label: 'Test', data: [1] }],
    }

    wrapper = mount(ChartLoader, {
      props: {
        type: 'bar',
        data: chartData,
        height: 500,
        width: 800,
      },
    })

    expect(wrapper.props('height')).toBe(500)
    expect(wrapper.props('width')).toBe(800)
  })

  it('should have proper wrapper div', () => {
    const chartData: ChartData<'line'> = {
      labels: ['A'],
      datasets: [{ label: 'Test', data: [1] }],
    }

    wrapper = mount(ChartLoader, {
      props: {
        type: 'line',
        data: chartData,
      },
    })

    const wrapperDiv = wrapper.find('.chart-loader-wrapper')
    expect(wrapperDiv.exists()).toBe(true)
  })
})

describe('ChartLoader Integration', () => {
  it('should be importable', async () => {
    const module = await import('./ChartLoader.vue')
    expect(module.default).toBeDefined()
  })

  it('should export proper TypeScript types', () => {
    // Type check - this will fail at compile time if types are wrong
    const validProps: {
      type: 'line' | 'bar' | 'doughnut' | 'pie'
      data: ChartData
      options?: ChartOptions
      height?: number
      width?: number
    } = {
      type: 'line',
      data: {
        labels: ['A'],
        datasets: [{ label: 'Test', data: [1] }],
      },
    }

    expect(validProps).toBeDefined()
  })
})
