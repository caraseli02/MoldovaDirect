import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ReturnsSummaryCard from '~/components/returns/ReturnsSummaryCard.vue'

vi.mock('#imports', () => ({
  useI18n: vi.fn(() => ({
    t: (k: string) => k,
    locale: { value: 'en' },
  })),
}))

describe('ReturnsSummaryCard', () => {
  const defaultProps = {
    title: 'Processing Time',
    metric: '3-5 Days',
    description: 'Average time to process your return request',
  }

  const createWrapper = (props = defaultProps) => {
    return mount(ReturnsSummaryCard, {
      props,
    })
  }

  describe('Rendering', () => {
    it('should render the summary card component', () => {
      const wrapper = createWrapper()
      expect(wrapper.exists()).toBe(true)
    })

    it('should render the main container with correct styling', () => {
      const wrapper = createWrapper()
      const container = wrapper.find('div')
      expect(container.classes()).toContain('rounded-xl')
      expect(container.classes()).toContain('p-4')
      expect(container.classes()).toContain('shadow-sm')
    })
  })

  describe('Props Rendering', () => {
    it('should display the title prop', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Processing Time')
    })

    it('should display the metric prop', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('3-5 Days')
    })

    it('should display the description prop', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Average time to process your return request')
    })

    it('should update when props change', async () => {
      const wrapper = createWrapper()
      await wrapper.setProps({
        title: 'New Title',
        metric: 'New Metric',
        description: 'New Description',
      })
      expect(wrapper.text()).toContain('New Title')
      expect(wrapper.text()).toContain('New Metric')
      expect(wrapper.text()).toContain('New Description')
    })
  })

  describe('Different Prop Values', () => {
    it('should render with refund period props', () => {
      const wrapper = createWrapper({
        title: 'Refund Period',
        metric: '14 Days',
        description: 'Time window to request a refund',
      })
      expect(wrapper.text()).toContain('Refund Period')
      expect(wrapper.text()).toContain('14 Days')
      expect(wrapper.text()).toContain('Time window to request a refund')
    })

    it('should render with success rate props', () => {
      const wrapper = createWrapper({
        title: 'Success Rate',
        metric: '98%',
        description: 'Percentage of approved returns',
      })
      expect(wrapper.text()).toContain('Success Rate')
      expect(wrapper.text()).toContain('98%')
      expect(wrapper.text()).toContain('Percentage of approved returns')
    })

    it('should render with shipping cost props', () => {
      const wrapper = createWrapper({
        title: 'Return Shipping',
        metric: 'Free',
        description: 'We cover return shipping costs',
      })
      expect(wrapper.text()).toContain('Return Shipping')
      expect(wrapper.text()).toContain('Free')
      expect(wrapper.text()).toContain('We cover return shipping costs')
    })

    it('should handle empty strings', () => {
      const wrapper = createWrapper({
        title: '',
        metric: '',
        description: '',
      })
      expect(wrapper.exists()).toBe(true)
      const paragraphs = wrapper.findAll('p')
      expect(paragraphs.length).toBe(3)
    })

    it('should handle long text content', () => {
      const longDescription = 'This is a very long description that contains a lot of text to test how the component handles overflow and wrapping of content in the card layout.'
      const wrapper = createWrapper({
        title: 'Long Content Test',
        metric: 'Extended Metric Value',
        description: longDescription,
      })
      expect(wrapper.text()).toContain(longDescription)
    })

    it('should handle special characters', () => {
      const wrapper = createWrapper({
        title: 'Price & Value',
        metric: '$99.99',
        description: 'Special chars: <test> & "quotes"',
      })
      expect(wrapper.text()).toContain('Price & Value')
      expect(wrapper.text()).toContain('$99.99')
    })

    it('should handle numeric string metrics', () => {
      const wrapper = createWrapper({
        title: 'Orders',
        metric: '1,234',
        description: 'Total orders processed',
      })
      expect(wrapper.text()).toContain('1,234')
    })
  })

  describe('Visual Styling', () => {
    it('should have title with uppercase styling', () => {
      const wrapper = createWrapper()
      const title = wrapper.find('.uppercase')
      expect(title.exists()).toBe(true)
      expect(title.classes()).toContain('tracking-wide')
    })

    it('should have title with small text size', () => {
      const wrapper = createWrapper()
      const title = wrapper.find('.text-xs')
      expect(title.exists()).toBe(true)
    })

    it('should have title with semibold font', () => {
      const wrapper = createWrapper()
      const title = wrapper.find('.text-xs.font-semibold')
      expect(title.exists()).toBe(true)
    })

    it('should have metric with large text size', () => {
      const wrapper = createWrapper()
      const metric = wrapper.find('.text-2xl')
      expect(metric.exists()).toBe(true)
    })

    it('should have metric with bold font', () => {
      const wrapper = createWrapper()
      const metric = wrapper.find('.font-bold')
      expect(metric.exists()).toBe(true)
    })

    it('should have proper spacing between elements', () => {
      const wrapper = createWrapper()
      wrapper.findAll('p')
      // Check mt-1 classes are present for spacing
      const elementsWithMargin = wrapper.findAll('.mt-1')
      expect(elementsWithMargin.length).toBe(2)
    })

    it('should have ring styling on container', () => {
      const wrapper = createWrapper()
      const container = wrapper.find('.ring-1')
      expect(container.exists()).toBe(true)
    })

    it('should have semi-transparent background', () => {
      const wrapper = createWrapper()
      const container = wrapper.find('.bg-white\\/80')
      expect(container.exists()).toBe(true)
    })
  })

  describe('Color Scheme', () => {
    it('should have primary color for title', () => {
      const wrapper = createWrapper()
      const title = wrapper.find('.text-slate-700')
      expect(title.exists()).toBe(true)
    })

    it('should have gray color for metric', () => {
      const wrapper = createWrapper()
      const metric = wrapper.find('.text-gray-900')
      expect(metric.exists()).toBe(true)
    })

    it('should have gray color for description', () => {
      const wrapper = createWrapper()
      const description = wrapper.find('.text-gray-600')
      expect(description.exists()).toBe(true)
    })
  })

  describe('Accessibility', () => {
    it('should have proper text hierarchy', () => {
      const wrapper = createWrapper()
      const paragraphs = wrapper.findAll('p')
      expect(paragraphs.length).toBe(3)
    })

    it('should have readable text contrast', () => {
      const wrapper = createWrapper()
      // Primary color for title provides good contrast
      const title = wrapper.find('.text-slate-700')
      expect(title.exists()).toBe(true)
      // Dark text for metric
      const metric = wrapper.find('.text-gray-900')
      expect(metric.exists()).toBe(true)
    })

    it('should render all content in paragraphs', () => {
      const wrapper = createWrapper()
      const text = wrapper.text()
      expect(text).toContain(defaultProps.title)
      expect(text).toContain(defaultProps.metric)
      expect(text).toContain(defaultProps.description)
    })
  })

  describe('Dark Mode Support', () => {
    it('should have dark mode classes for container', () => {
      const wrapper = createWrapper()
      const container = wrapper.find('.dark\\:bg-gray-900\\/60')
      expect(container.exists()).toBe(true)
    })

    it('should have dark mode classes for title', () => {
      const wrapper = createWrapper()
      const title = wrapper.find('.dark\\:text-slate-200')
      expect(title.exists()).toBe(true)
    })

    it('should have dark mode classes for metric', () => {
      const wrapper = createWrapper()
      const metric = wrapper.find('.dark\\:text-white')
      expect(metric.exists()).toBe(true)
    })

    it('should have dark mode classes for description', () => {
      const wrapper = createWrapper()
      const description = wrapper.find('.dark\\:text-gray-300')
      expect(description.exists()).toBe(true)
    })

    it('should have dark mode ring color', () => {
      const wrapper = createWrapper()
      const container = wrapper.find('.dark\\:ring-gray-800')
      expect(container.exists()).toBe(true)
    })
  })

  describe('Component Structure', () => {
    it('should have three child paragraphs', () => {
      const wrapper = createWrapper()
      const paragraphs = wrapper.findAll('p')
      expect(paragraphs.length).toBe(3)
    })

    it('should render content in correct order', () => {
      const wrapper = createWrapper()
      const paragraphs = wrapper.findAll('p')
      expect(paragraphs[0].text()).toBe(defaultProps.title)
      expect(paragraphs[1].text()).toBe(defaultProps.metric)
      expect(paragraphs[2].text()).toBe(defaultProps.description)
    })
  })
})
