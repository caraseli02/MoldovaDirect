import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ReturnsResolution from '~/components/returns/ReturnsResolution.vue'

vi.mock('#imports', () => ({
  useI18n: vi.fn(() => ({
    t: (k: string) => k,
    locale: { value: 'en' },
  })),
  computed: (fn: () => unknown) => ({ value: fn() }),
}))

describe('ReturnsResolution', () => {
  const createWrapper = () => {
    return mount(ReturnsResolution)
  }

  describe('Rendering', () => {
    it('should render the resolution component', () => {
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

    it('should display the resolution title', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('returns.resolution.title')
    })

    it('should display the resolution subtitle', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('returns.resolution.subtitle')
    })

    it('should display the resolution note', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('returns.resolution.note')
    })
  })

  describe('Resolution Options Display', () => {
    it('should display refund option title', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('returns.resolution.options.refund.title')
    })

    it('should display refund option description', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('returns.resolution.options.refund.description')
    })

    it('should display refund option badge', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('returns.resolution.options.refund.badge')
    })

    it('should display replacement option title', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('returns.resolution.options.replacement.title')
    })

    it('should display replacement option description', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('returns.resolution.options.replacement.description')
    })

    it('should display replacement option badge', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('returns.resolution.options.replacement.badge')
    })

    it('should display credit option title', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('returns.resolution.options.credit.title')
    })

    it('should display credit option description', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('returns.resolution.options.credit.description')
    })

    it('should display credit option badge', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('returns.resolution.options.credit.badge')
    })
  })

  describe('Resolution Options Structure', () => {
    it('should render three resolution options', () => {
      const wrapper = createWrapper()
      const options = wrapper.findAll('.rounded-xl.bg-gray-50')
      expect(options.length).toBe(3)
    })

    it('should render badges for each option', () => {
      const wrapper = createWrapper()
      const badges = wrapper.findAll('.rounded-full.px-3')
      expect(badges.length).toBe(3)
    })

    it('should render options in a grid layout', () => {
      const wrapper = createWrapper()
      const grid = wrapper.find('.grid.gap-4')
      expect(grid.exists()).toBe(true)
    })
  })

  describe('Visual Elements', () => {
    it('should have a header icon', () => {
      const wrapper = createWrapper()
      const icon = wrapper.find('svg')
      expect(icon.exists()).toBe(true)
      expect(icon.attributes('aria-hidden')).toBe('true')
    })

    it('should have emerald-colored icon container', () => {
      const wrapper = createWrapper()
      const iconContainer = wrapper.find('.bg-emerald-50')
      expect(iconContainer.exists()).toBe(true)
    })

    it('should have proper icon container dimensions', () => {
      const wrapper = createWrapper()
      const iconContainer = wrapper.find('.h-10.w-10')
      expect(iconContainer.exists()).toBe(true)
      expect(iconContainer.classes()).toContain('rounded-full')
    })

    it('should display badge with emerald styling', () => {
      const wrapper = createWrapper()
      const badge = wrapper.find('.text-emerald-700')
      expect(badge.exists()).toBe(true)
    })
  })

  describe('Accessibility', () => {
    it('should have aria-hidden on decorative icons', () => {
      const wrapper = createWrapper()
      const svg = wrapper.find('svg')
      expect(svg.attributes('aria-hidden')).toBe('true')
    })

    it('should have proper text hierarchy', () => {
      const wrapper = createWrapper()
      const paragraphs = wrapper.findAll('p')
      expect(paragraphs.length).toBeGreaterThan(0)
    })

    it('should have visible option titles', () => {
      const wrapper = createWrapper()
      const titles = wrapper.findAll('.font-semibold')
      expect(titles.length).toBeGreaterThan(0)
    })
  })

  describe('Dark Mode Support', () => {
    it('should have dark mode classes for container', () => {
      const wrapper = createWrapper()
      const container = wrapper.find('.dark\\:bg-gray-900')
      expect(container.exists()).toBe(true)
    })

    it('should have dark mode classes for option cards', () => {
      const wrapper = createWrapper()
      const cards = wrapper.findAll('.dark\\:bg-gray-950')
      expect(cards.length).toBe(3)
    })

    it('should have dark mode classes for badges', () => {
      const wrapper = createWrapper()
      const darkBadge = wrapper.find('.dark\\:bg-emerald-900\\/30')
      expect(darkBadge.exists()).toBe(true)
    })

    it('should have dark mode text colors', () => {
      const wrapper = createWrapper()
      const darkText = wrapper.findAll('.dark\\:text-white')
      expect(darkText.length).toBeGreaterThan(0)
    })
  })

  describe('Styling', () => {
    it('should have ring styling on option cards', () => {
      const wrapper = createWrapper()
      const cards = wrapper.findAll('.ring-1')
      expect(cards.length).toBeGreaterThan(0)
    })

    it('should have proper spacing in grid', () => {
      const wrapper = createWrapper()
      const grid = wrapper.find('.gap-4')
      expect(grid.exists()).toBe(true)
    })

    it('should have proper padding on option cards', () => {
      const wrapper = createWrapper()
      const cards = wrapper.findAll('.p-4')
      expect(cards.length).toBeGreaterThan(0)
    })
  })
})
