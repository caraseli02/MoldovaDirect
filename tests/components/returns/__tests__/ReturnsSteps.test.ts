import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ReturnsSteps from '~/components/returns/ReturnsSteps.vue'

vi.mock('#imports', () => ({
  useI18n: vi.fn(() => ({
    t: (k: string) => k,
    locale: { value: 'en' },
  })),
  computed: (fn: () => unknown) => ({ value: fn() }),
}))

describe('ReturnsSteps', () => {
  const createWrapper = () => {
    return mount(ReturnsSteps)
  }

  describe('Rendering', () => {
    it('should render the steps component', () => {
      const wrapper = createWrapper()
      expect(wrapper.exists()).toBe(true)
    })

    it('should render the main container with correct styling', () => {
      const wrapper = createWrapper()
      const container = wrapper.find('div')
      expect(container.classes()).toContain('rounded-2xl')
      expect(container.classes()).toContain('border')
      expect(container.classes()).toContain('bg-white')
    })

    it('should display the steps title', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('returns.steps.title')
    })

    it('should display the steps subtitle', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('returns.steps.subtitle')
    })
  })

  describe('Step Indicators', () => {
    it('should render an ordered list for steps', () => {
      const wrapper = createWrapper()
      const orderedList = wrapper.find('ol')
      expect(orderedList.exists()).toBe(true)
    })

    it('should render four step items', () => {
      const wrapper = createWrapper()
      const steps = wrapper.findAll('ol li')
      expect(steps.length).toBe(4)
    })

    it('should display step numbers 1 through 4', () => {
      const wrapper = createWrapper()
      // Select step number circles within the ordered list (excluding header icon)
      const orderedList = wrapper.find('ol')
      const stepNumbers = orderedList.findAll('.h-10.w-10.rounded-full')
      expect(stepNumbers.length).toBe(4)
      expect(stepNumbers[0].text()).toContain('1')
      expect(stepNumbers[1].text()).toContain('2')
      expect(stepNumbers[2].text()).toContain('3')
      expect(stepNumbers[3].text()).toContain('4')
    })

    it('should have step number circles with ring styling', () => {
      const wrapper = createWrapper()
      const stepCircles = wrapper.findAll('.ring-2')
      expect(stepCircles.length).toBe(4)
    })
  })

  describe('Step Labels', () => {
    it('should display review step title', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('returns.steps.items.review.title')
    })

    it('should display review step description', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('returns.steps.items.review.description')
    })

    it('should display document step title', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('returns.steps.items.document.title')
    })

    it('should display document step description', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('returns.steps.items.document.description')
    })

    it('should display contact step title', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('returns.steps.items.contact.title')
    })

    it('should display contact step description', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('returns.steps.items.contact.description')
    })

    it('should display ship step title', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('returns.steps.items.ship.title')
    })

    it('should display ship step description', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('returns.steps.items.ship.description')
    })
  })

  describe('Documents Section', () => {
    it('should display documents title', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('returns.steps.documentsTitle')
    })

    it('should display order document item', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('returns.steps.documents.order')
    })

    it('should display photos document item', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('returns.steps.documents.photos')
    })

    it('should display packaging document item', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('returns.steps.documents.packaging')
    })

    it('should display preference document item', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('returns.steps.documents.preference')
    })

    it('should render document list with bullet points', () => {
      const wrapper = createWrapper()
      const bullets = wrapper.findAll('.bg-slate-500')
      expect(bullets.length).toBeGreaterThanOrEqual(4)
    })
  })

  describe('Packaging Section', () => {
    it('should display packaging title', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('returns.steps.packagingTitle')
    })

    it('should display packaging description', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('returns.steps.packagingDescription')
    })

    it('should have packaging section with highlighted background', () => {
      const wrapper = createWrapper()
      const packagingSection = wrapper.find('.bg-slate-50\\/70')
      expect(packagingSection.exists()).toBe(true)
    })
  })

  describe('Visual Layout', () => {
    it('should render two columns on medium screens', () => {
      const wrapper = createWrapper()
      const grid = wrapper.find('.md\\:grid-cols-2')
      expect(grid.exists()).toBe(true)
    })

    it('should have a header icon', () => {
      const wrapper = createWrapper()
      const icon = wrapper.find('svg')
      expect(icon.exists()).toBe(true)
      expect(icon.attributes('aria-hidden')).toBe('true')
    })

    it('should have proper icon container styling', () => {
      const wrapper = createWrapper()
      const iconContainer = wrapper.find('.h-10.w-10.rounded-full')
      expect(iconContainer.exists()).toBe(true)
    })

    it('should have step list with proper spacing', () => {
      const wrapper = createWrapper()
      const stepList = wrapper.find('ol.space-y-4')
      expect(stepList.exists()).toBe(true)
    })
  })

  describe('Accessibility', () => {
    it('should have aria-hidden on decorative icons', () => {
      const wrapper = createWrapper()
      const svg = wrapper.find('svg')
      expect(svg.attributes('aria-hidden')).toBe('true')
    })

    it('should use ordered list for sequential steps', () => {
      const wrapper = createWrapper()
      const orderedList = wrapper.find('ol')
      expect(orderedList.exists()).toBe(true)
    })

    it('should use unordered list for documents', () => {
      const wrapper = createWrapper()
      const unorderedLists = wrapper.findAll('ul')
      expect(unorderedLists.length).toBeGreaterThan(0)
    })

    it('should have proper heading structure', () => {
      const wrapper = createWrapper()
      const semiboldTitles = wrapper.findAll('.font-semibold')
      expect(semiboldTitles.length).toBeGreaterThan(0)
    })
  })

  describe('Dark Mode Support', () => {
    it('should have dark mode classes for container', () => {
      const wrapper = createWrapper()
      const container = wrapper.find('.dark\\:bg-gray-900')
      expect(container.exists()).toBe(true)
    })

    it('should have dark mode classes for step numbers', () => {
      const wrapper = createWrapper()
      const stepCircles = wrapper.findAll('.dark\\:bg-slate-900\\/30')
      expect(stepCircles.length).toBeGreaterThan(0)
    })

    it('should have dark mode classes for documents section', () => {
      const wrapper = createWrapper()
      const docSection = wrapper.find('.dark\\:bg-gray-950')
      expect(docSection.exists()).toBe(true)
    })

    it('should have dark mode text colors', () => {
      const wrapper = createWrapper()
      const darkText = wrapper.findAll('.dark\\:text-white')
      expect(darkText.length).toBeGreaterThan(0)
    })
  })

  describe('Step Content Structure', () => {
    it('should have gap between step number and content', () => {
      const wrapper = createWrapper()
      const stepItems = wrapper.findAll('li.flex.gap-4')
      expect(stepItems.length).toBe(4)
    })

    it('should have space between title and description', () => {
      const wrapper = createWrapper()
      const contentContainers = wrapper.findAll('.space-y-1')
      expect(contentContainers.length).toBe(4)
    })
  })
})
