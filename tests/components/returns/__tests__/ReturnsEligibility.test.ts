import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ReturnsEligibility from '~/components/returns/ReturnsEligibility.vue'

vi.mock('#imports', () => ({
  useI18n: vi.fn(() => ({
    t: (k: string) => k,
    locale: { value: 'en' },
  })),
  computed: (fn: () => unknown) => ({ value: fn() }),
}))

describe('ReturnsEligibility', () => {
  const createWrapper = () => {
    return mount(ReturnsEligibility)
  }

  describe('Rendering', () => {
    it('should render the eligibility component', () => {
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

    it('should display the eligibility title', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('returns.eligibility.title')
    })

    it('should display the eligibility subtitle', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('returns.eligibility.subtitle')
    })

    it('should display the eligibility note', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('returns.eligibility.note')
    })
  })

  describe('Allowed Items Section', () => {
    it('should display the allowed items title', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('returns.eligibility.allowedTitle')
    })

    it('should display all allowed item reasons', () => {
      const wrapper = createWrapper()
      const allowedKeys = [
        'returns.eligibility.allowed.damaged',
        'returns.eligibility.allowed.incorrect',
        'returns.eligibility.allowed.quality',
        'returns.eligibility.allowed.unopened',
      ]
      allowedKeys.forEach((key) => {
        expect(wrapper.text()).toContain(key)
      })
    })

    it('should render allowed items as a list', () => {
      const wrapper = createWrapper()
      const lists = wrapper.findAll('ul')
      expect(lists.length).toBeGreaterThan(0)
    })

    it('should render bullet points for allowed items', () => {
      const wrapper = createWrapper()
      const bullets = wrapper.findAll('.bg-primary-500')
      expect(bullets.length).toBeGreaterThan(0)
    })
  })

  describe('Denied Items Section', () => {
    it('should display the denied items title', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('returns.eligibility.deniedTitle')
    })

    it('should display all denied item reasons', () => {
      const wrapper = createWrapper()
      const deniedKeys = [
        'returns.eligibility.denied.used',
        'returns.eligibility.denied.late',
        'returns.eligibility.denied.perishable',
        'returns.eligibility.denied.custom',
      ]
      deniedKeys.forEach((key) => {
        expect(wrapper.text()).toContain(key)
      })
    })

    it('should render bullet points for denied items', () => {
      const wrapper = createWrapper()
      const bullets = wrapper.findAll('.bg-gray-400')
      expect(bullets.length).toBe(4)
    })
  })

  describe('Visual Layout', () => {
    it('should render two columns on medium screens', () => {
      const wrapper = createWrapper()
      const grid = wrapper.find('.grid')
      expect(grid.classes()).toContain('md:grid-cols-2')
    })

    it('should have a header icon', () => {
      const wrapper = createWrapper()
      const icon = wrapper.find('svg')
      expect(icon.exists()).toBe(true)
      expect(icon.attributes('aria-hidden')).toBe('true')
    })

    it('should have proper icon container styling', () => {
      const wrapper = createWrapper()
      const iconContainer = wrapper.find('.h-10.w-10')
      expect(iconContainer.exists()).toBe(true)
      expect(iconContainer.classes()).toContain('rounded-full')
    })
  })

  describe('Accessibility', () => {
    it('should have aria-hidden on decorative icons', () => {
      const wrapper = createWrapper()
      const svg = wrapper.find('svg')
      expect(svg.attributes('aria-hidden')).toBe('true')
    })

    it('should use semantic list elements for items', () => {
      const wrapper = createWrapper()
      const unorderedLists = wrapper.findAll('ul')
      expect(unorderedLists.length).toBe(2)
    })

    it('should have proper heading hierarchy with paragraph tags', () => {
      const wrapper = createWrapper()
      const paragraphs = wrapper.findAll('p')
      expect(paragraphs.length).toBeGreaterThan(0)
    })
  })

  describe('Dark Mode Support', () => {
    it('should have dark mode classes for container', () => {
      const wrapper = createWrapper()
      const container = wrapper.find('.dark\\:bg-gray-900')
      expect(container.exists()).toBe(true)
    })

    it('should have dark mode classes for text elements', () => {
      const wrapper = createWrapper()
      const darkTextElements = wrapper.findAll('.dark\\:text-gray-300')
      expect(darkTextElements.length).toBeGreaterThan(0)
    })
  })
})
