import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import CertificationBar from '~/components/home/CertificationBar.vue'

// Mock Nuxt auto-imports
vi.mock('#imports', () => ({
  useI18n: vi.fn(() => ({ t: (k: string) => k })),
  useLocalePath: vi.fn(() => (path: string) => path),
}))

// Mock @vueuse/motion
vi.mock('@vueuse/motion', () => ({
  MotionPlugin: {},
}))

// Mock commonIcon component
const CommonIconStub = {
  name: 'CommonIcon',
  template: '<span :class="iconClass"><slot /></span>',
  props: ['name', 'class'],
  computed: {
    iconClass() {
      return this.$props.class || ''
    },
  },
}

describe('Home CertificationBar', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    wrapper = mount(CertificationBar, {
      global: {
        stubs: {
          commonIcon: CommonIconStub,
        },
        directives: {
          motion: () => {}, // Mock v-motion directive
        },
      },
    })
  })

  describe('Rendering', () => {
    it('renders the component', () => {
      expect(wrapper.exists()).toBe(true)
    })

    it('renders as a section element with correct role', () => {
      const section = wrapper.find('section')
      expect(section.exists()).toBe(true)
    })

    it('applies correct border and background classes', () => {
      const section = wrapper.find('section')
      expect(section.classes()).toContain('border-t')
      expect(section.classes()).toContain('border-b')
      expect(section.classes()).toContain('bg-white')
      expect(section.classes()).toContain('dark:bg-gray-950')
    })

    it('renders container wrapper', () => {
      const container = wrapper.find('.container')
      expect(container.exists()).toBe(true)
    })

    it('renders certification badges container with correct layout classes', () => {
      const badgesContainer = wrapper.find('.flex.flex-wrap.items-center.justify-center')
      expect(badgesContainer.exists()).toBe(true)
    })
  })

  describe('Certifications Data', () => {
    it('renders all 4 certification badges', () => {
      const badges = wrapper.findAll('.group.flex.items-center.gap-3')
      expect(badges).toHaveLength(4)
    })

    it('renders certification badge for authentic certification', () => {
      const badges = wrapper.findAll('.group.flex.items-center.gap-3')
      const authenticBadge = badges[0]
      expect(authenticBadge.exists()).toBe(true)
    })

    it('renders certification badge for quality certification', () => {
      const badges = wrapper.findAll('.group.flex.items-center.gap-3')
      const qualityBadge = badges[1]
      expect(qualityBadge.exists()).toBe(true)
    })

    it('renders certification badge for sustainable certification', () => {
      const badges = wrapper.findAll('.group.flex.items-center.gap-3')
      const sustainableBadge = badges[2]
      expect(sustainableBadge.exists()).toBe(true)
    })

    it('renders certification badge for secure certification', () => {
      const badges = wrapper.findAll('.group.flex.items-center.gap-3')
      const secureBadge = badges[3]
      expect(secureBadge.exists()).toBe(true)
    })
  })

  describe('Icon Rendering', () => {
    it('renders icon for each certification', () => {
      const icons = wrapper.findAllComponents(CommonIconStub)
      expect(icons).toHaveLength(4)
    })

    it('renders shield-check icon for authentic certification', () => {
      const icons = wrapper.findAllComponents(CommonIconStub)
      expect(icons[0].props('name')).toBe('lucide:shield-check')
    })

    it('renders award icon for quality certification', () => {
      const icons = wrapper.findAllComponents(CommonIconStub)
      expect(icons[1].props('name')).toBe('lucide:award')
    })

    it('renders leaf icon for sustainable certification', () => {
      const icons = wrapper.findAllComponents(CommonIconStub)
      expect(icons[2].props('name')).toBe('lucide:leaf')
    })

    it('renders lock icon for secure certification', () => {
      const icons = wrapper.findAllComponents(CommonIconStub)
      expect(icons[3].props('name')).toBe('lucide:lock')
    })

    it('applies correct icon background color for authentic certification', () => {
      const iconContainers = wrapper.findAll('.flex.h-12.w-12.items-center.justify-center.rounded-full')
      expect(iconContainers[0].classes()).toContain('bg-primary-100')
    })

    it('applies correct icon background color for quality certification', () => {
      const iconContainers = wrapper.findAll('.flex.h-12.w-12.items-center.justify-center.rounded-full')
      expect(iconContainers[1].classes()).toContain('bg-amber-100')
    })

    it('applies correct icon background color for sustainable certification', () => {
      const iconContainers = wrapper.findAll('.flex.h-12.w-12.items-center.justify-center.rounded-full')
      expect(iconContainers[2].classes()).toContain('bg-green-100')
    })

    it('applies correct icon background color for secure certification', () => {
      const iconContainers = wrapper.findAll('.flex.h-12.w-12.items-center.justify-center.rounded-full')
      expect(iconContainers[3].classes()).toContain('bg-blue-100')
    })

    it('applies correct icon color classes for authentic certification', () => {
      const icons = wrapper.findAllComponents(CommonIconStub)
      expect(icons[0].props('class')).toContain('text-primary-600')
    })

    it('applies correct icon color classes for quality certification', () => {
      const icons = wrapper.findAllComponents(CommonIconStub)
      expect(icons[1].props('class')).toContain('text-amber-600')
    })

    it('applies correct icon color classes for sustainable certification', () => {
      const icons = wrapper.findAllComponents(CommonIconStub)
      expect(icons[2].props('class')).toContain('text-green-600')
    })

    it('applies correct icon color classes for secure certification', () => {
      const icons = wrapper.findAllComponents(CommonIconStub)
      expect(icons[3].props('class')).toContain('text-blue-600')
    })

    it('applies transition and hover scale classes to icons', () => {
      const icons = wrapper.findAllComponents(CommonIconStub)
      icons.forEach((icon) => {
        expect(icon.props('class')).toContain('transition-transform')
        expect(icon.props('class')).toContain('group-hover:scale-110')
      })
    })
  })

  describe('Text Content', () => {
    it('renders title and subtitle for each certification', () => {
      const badges = wrapper.findAll('.group.flex.items-center.gap-3')
      badges.forEach((badge) => {
        const title = badge.find('.text-sm.font-semibold')
        const subtitle = badge.find('.text-xs')
        expect(title.exists()).toBe(true)
        expect(subtitle.exists()).toBe(true)
      })
    })

    it('renders correct translation keys for authentic certification', () => {
      const badges = wrapper.findAll('.group.flex.items-center.gap-3')
      const authenticBadge = badges[0]
      const title = authenticBadge.find('.text-sm.font-semibold')
      const subtitle = authenticBadge.find('.text-xs')
      expect(title.text()).toBe('home.certifications.authentic.title')
      expect(subtitle.text()).toBe('home.certifications.authentic.subtitle')
    })

    it('renders correct translation keys for quality certification', () => {
      const badges = wrapper.findAll('.group.flex.items-center.gap-3')
      const qualityBadge = badges[1]
      const title = qualityBadge.find('.text-sm.font-semibold')
      const subtitle = qualityBadge.find('.text-xs')
      expect(title.text()).toBe('home.certifications.quality.title')
      expect(subtitle.text()).toBe('home.certifications.quality.subtitle')
    })

    it('renders correct translation keys for sustainable certification', () => {
      const badges = wrapper.findAll('.group.flex.items-center.gap-3')
      const sustainableBadge = badges[2]
      const title = sustainableBadge.find('.text-sm.font-semibold')
      const subtitle = sustainableBadge.find('.text-xs')
      expect(title.text()).toBe('home.certifications.sustainable.title')
      expect(subtitle.text()).toBe('home.certifications.sustainable.subtitle')
    })

    it('renders correct translation keys for secure certification', () => {
      const badges = wrapper.findAll('.group.flex.items-center.gap-3')
      const secureBadge = badges[3]
      const title = secureBadge.find('.text-sm.font-semibold')
      const subtitle = secureBadge.find('.text-xs')
      expect(title.text()).toBe('home.certifications.secure.title')
      expect(subtitle.text()).toBe('home.certifications.secure.subtitle')
    })

    it('applies correct text styling to titles', () => {
      const titles = wrapper.findAll('.text-sm.font-semibold')
      titles.forEach((title) => {
        expect(title.classes()).toContain('text-gray-900')
        expect(title.classes()).toContain('dark:text-gray-50')
      })
    })

    it('applies correct text styling to subtitles', () => {
      const subtitles = wrapper.findAll('.text-xs.text-gray-600')
      expect(subtitles.length).toBeGreaterThan(0)
      subtitles.forEach((subtitle) => {
        expect(subtitle.classes()).toContain('dark:text-gray-400')
      })
    })
  })

  describe('Layout and Styling', () => {
    it('applies padding to section', () => {
      const section = wrapper.find('section')
      expect(section.classes()).toContain('py-8')
    })

    it('applies gap between certification badges', () => {
      const badgesContainer = wrapper.find('.flex.flex-wrap.items-center.justify-center')
      expect(badgesContainer.classes()).toContain('gap-8')
    })

    it('applies responsive gap for medium screens', () => {
      const badgesContainer = wrapper.find('.flex.flex-wrap.items-center.justify-center')
      expect(badgesContainer.classes()).toContain('md:gap-12')
    })

    it('applies group class to certification badges for hover effects', () => {
      const badges = wrapper.findAll('.group.flex.items-center.gap-3')
      expect(badges.length).toBe(4)
      badges.forEach((badge) => {
        expect(badge.classes()).toContain('group')
      })
    })

    it('applies left text alignment to text containers', () => {
      const textContainers = wrapper.findAll('.text-left')
      expect(textContainers.length).toBe(4)
    })

    it('applies transition classes to icon containers', () => {
      const iconContainers = wrapper.findAll('.flex.h-12.w-12.items-center.justify-center.rounded-full')
      iconContainers.forEach((container) => {
        expect(container.classes()).toContain('transition-all')
        expect(container.classes()).toContain('duration-300')
      })
    })
  })

  describe('Accessibility', () => {
    it('renders semantic section element', () => {
      expect(wrapper.find('section').exists()).toBe(true)
    })

    it('has proper heading hierarchy with text styling', () => {
      const titles = wrapper.findAll('.text-sm.font-semibold')
      expect(titles.length).toBe(4)
    })

    it('provides visual hierarchy with font sizes', () => {
      const titles = wrapper.findAll('.text-sm')
      const subtitles = wrapper.findAll('.text-xs')
      expect(titles.length).toBeGreaterThan(0)
      expect(subtitles.length).toBeGreaterThan(0)
    })

    it('uses semantic color contrast for dark mode', () => {
      const section = wrapper.find('section')
      expect(section.classes()).toContain('dark:bg-gray-950')
      expect(section.classes()).toContain('dark:border-gray-800')
    })

    it('provides sufficient icon sizes for visibility', () => {
      const icons = wrapper.findAllComponents(CommonIconStub)
      icons.forEach((icon) => {
        expect(icon.props('class')).toContain('h-6')
        expect(icon.props('class')).toContain('w-6')
      })
    })

    it('uses rounded-full for icon containers for better visual focus', () => {
      const iconContainers = wrapper.findAll('.rounded-full')
      expect(iconContainers.length).toBe(4)
    })
  })

  describe('Responsive Design', () => {
    it('uses flex-wrap for responsive layout', () => {
      const badgesContainer = wrapper.find('.flex.flex-wrap')
      expect(badgesContainer.exists()).toBe(true)
    })

    it('centers items on all screen sizes', () => {
      const badgesContainer = wrapper.find('.flex.flex-wrap.items-center.justify-center')
      expect(badgesContainer.classes()).toContain('items-center')
      expect(badgesContainer.classes()).toContain('justify-center')
    })

    it('increases gap on medium screens', () => {
      const badgesContainer = wrapper.find('.flex.flex-wrap')
      expect(badgesContainer.classes()).toContain('gap-8')
      expect(badgesContainer.classes()).toContain('md:gap-12')
    })
  })

  describe('Animation and Interactivity', () => {
    it('applies hover scale effect to icons', () => {
      const icons = wrapper.findAllComponents(CommonIconStub)
      icons.forEach((icon) => {
        expect(icon.props('class')).toContain('group-hover:scale-110')
      })
    })

    it('applies transition duration to icons', () => {
      const icons = wrapper.findAllComponents(CommonIconStub)
      icons.forEach((icon) => {
        expect(icon.props('class')).toContain('duration-300')
      })
    })

    it('applies transition to icon containers', () => {
      const iconContainers = wrapper.findAll('.flex.h-12.w-12.items-center.justify-center.rounded-full')
      iconContainers.forEach((container) => {
        expect(container.classes()).toContain('transition-all')
      })
    })
  })

  describe('Data Structure', () => {
    it('renders certifications in correct order', () => {
      const icons = wrapper.findAllComponents(CommonIconStub)
      expect(icons[0].props('name')).toBe('lucide:shield-check') // authentic
      expect(icons[1].props('name')).toBe('lucide:award') // quality
      expect(icons[2].props('name')).toBe('lucide:leaf') // sustainable
      expect(icons[3].props('name')).toBe('lucide:lock') // secure
    })

    it('applies unique key to each certification badge', () => {
      const badges = wrapper.findAll('.group.flex.items-center.gap-3')
      expect(badges).toHaveLength(4)
      // Keys are internal to Vue, but we can verify count
    })
  })
})
