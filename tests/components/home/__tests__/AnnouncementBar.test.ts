import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import AnnouncementBar from '~/components/home/AnnouncementBar.vue'

// Mock Nuxt auto-imports
vi.mock('#imports', () => ({
  useI18n: vi.fn(() => ({ t: (k: string) => k })),
  useLocalePath: vi.fn(() => (path: string) => path),
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

// Mock NuxtLink component
const NuxtLinkStub = {
  name: 'NuxtLink',
  template: '<a :href="to" :class="linkClass"><slot /></a>',
  props: ['to', 'class'],
  computed: {
    linkClass() {
      return this.$props.class || ''
    },
  },
}

describe('Home AnnouncementBar', () => {
  describe('Rendering', () => {
    let wrapper: VueWrapper

    beforeEach(() => {
      wrapper = mount(AnnouncementBar, {
        global: {
          stubs: {
            commonIcon: CommonIconStub,
            NuxtLink: NuxtLinkStub,
          },
        },
      })
    })

    it('renders the component', () => {
      expect(wrapper.exists()).toBe(true)
    })

    it('renders as a div with role banner', () => {
      const banner = wrapper.find('[role="banner"]')
      expect(banner.exists()).toBe(true)
      expect(banner.element.tagName).toBe('DIV')
    })

    it('has correct aria-label for accessibility', () => {
      const banner = wrapper.find('[role="banner"]')
      expect(banner.attributes('aria-label')).toBe('Promotional announcement')
    })

    it('applies gradient background classes', () => {
      const banner = wrapper.find('[role="banner"]')
      expect(banner.classes()).toContain('bg-gradient-to-r')
      expect(banner.classes()).toContain('from-brand-dark')
      expect(banner.classes()).toContain('via-brand-accent')
      expect(banner.classes()).toContain('to-brand-dark')
      expect(banner.classes()).toContain('text-brand-light')
    })

    it('renders container wrapper', () => {
      const container = wrapper.find('.container')
      expect(container.exists()).toBe(true)
    })

    it('renders content flex container', () => {
      const contentContainer = wrapper.find('.flex.items-center.justify-center')
      expect(contentContainer.exists()).toBe(true)
    })

    it('applies overflow-hidden and relative positioning', () => {
      const banner = wrapper.find('[role="banner"]')
      expect(banner.classes()).toContain('overflow-hidden')
      expect(banner.classes()).toContain('relative')
    })
  })

  describe('Icon Rendering', () => {
    let wrapper: VueWrapper

    beforeEach(() => {
      wrapper = mount(AnnouncementBar, {
        global: {
          stubs: {
            commonIcon: CommonIconStub,
            NuxtLink: NuxtLinkStub,
          },
        },
      })
    })

    it('renders sparkles icon', () => {
      const icons = wrapper.findAllComponents(CommonIconStub)
      const sparklesIcon = icons.find(icon => icon.props('name') === 'lucide:sparkles')
      expect(sparklesIcon).toBeDefined()
    })

    it('applies correct size classes to sparkles icon', () => {
      const icons = wrapper.findAllComponents(CommonIconStub)
      const sparklesIcon = icons.find(icon => icon.props('name') === 'lucide:sparkles')
      expect(sparklesIcon?.props('class')).toContain('h-4')
      expect(sparklesIcon?.props('class')).toContain('w-4')
    })

    it('applies flex-shrink-0 to sparkles icon', () => {
      const icons = wrapper.findAllComponents(CommonIconStub)
      const sparklesIcon = icons.find(icon => icon.props('name') === 'lucide:sparkles')
      expect(sparklesIcon?.props('class')).toContain('flex-shrink-0')
    })
  })

  describe('Text Content', () => {
    let wrapper: VueWrapper

    beforeEach(() => {
      wrapper = mount(AnnouncementBar, {
        global: {
          stubs: {
            commonIcon: CommonIconStub,
            NuxtLink: NuxtLinkStub,
          },
        },
      })
    })

    it('renders announcement highlight text', () => {
      const highlight = wrapper.find('.font-semibold')
      expect(highlight.exists()).toBe(true)
      expect(highlight.text()).toBe('home.announcement.highlight')
    })

    it('renders announcement description', () => {
      const description = wrapper.find('.block.sm\\:inline')
      expect(description.exists()).toBe(true)
      expect(description.text()).toBe('home.announcement.description')
    })

    it('renders separator bullet point', () => {
      const separator = wrapper.find('.hidden.sm\\:inline')
      expect(separator.exists()).toBe(true)
      expect(separator.text()).toBe('•')
    })

    it('applies text-center to main paragraph', () => {
      const paragraph = wrapper.find('p.text-center')
      expect(paragraph.exists()).toBe(true)
    })

    it('applies responsive text sizing', () => {
      const contentContainer = wrapper.find('.flex.items-center.justify-center')
      expect(contentContainer.classes()).toContain('text-sm')
      expect(contentContainer.classes()).toContain('md:text-base')
    })

    it('applies font-medium to content', () => {
      const contentContainer = wrapper.find('.flex.items-center.justify-center')
      expect(contentContainer.classes()).toContain('font-medium')
    })
  })

  describe('Props - showCta', () => {
    it('does not render CTA link when showCta is false', () => {
      const wrapper = mount(AnnouncementBar, {
        props: {
          showCta: false,
        },
        global: {
          stubs: {
            commonIcon: CommonIconStub,
            NuxtLink: NuxtLinkStub,
          },
        },
      })

      const link = wrapper.findComponent(NuxtLinkStub)
      expect(link.exists()).toBe(false)
    })

    it('does not render CTA link when showCta is undefined', () => {
      const wrapper = mount(AnnouncementBar, {
        global: {
          stubs: {
            commonIcon: CommonIconStub,
            NuxtLink: NuxtLinkStub,
          },
        },
      })

      const link = wrapper.findComponent(NuxtLinkStub)
      expect(link.exists()).toBe(false)
    })

    it('renders CTA link when showCta is true', () => {
      const wrapper = mount(AnnouncementBar, {
        props: {
          showCta: true,
        },
        global: {
          stubs: {
            commonIcon: CommonIconStub,
            NuxtLink: NuxtLinkStub,
          },
        },
      })

      const link = wrapper.findComponent(NuxtLinkStub)
      expect(link.exists()).toBe(true)
    })
  })

  describe('CTA Link (when showCta is true)', () => {
    let wrapper: VueWrapper

    beforeEach(() => {
      wrapper = mount(AnnouncementBar, {
        props: {
          showCta: true,
        },
        global: {
          stubs: {
            commonIcon: CommonIconStub,
            NuxtLink: NuxtLinkStub,
          },
        },
      })
    })

    it('links to products page', () => {
      const link = wrapper.findComponent(NuxtLinkStub)
      expect(link.props('to')).toBe('/products')
    })

    it('renders CTA text from translations', () => {
      const link = wrapper.findComponent(NuxtLinkStub)
      expect(link.text()).toContain('home.announcement.cta')
    })

    it('renders arrow-right icon in CTA', () => {
      const icons = wrapper.findAllComponents(CommonIconStub)
      const arrowIcon = icons.find(icon => icon.props('name') === 'lucide:arrow-right')
      expect(arrowIcon).toBeDefined()
    })

    it('applies correct icon size to arrow icon', () => {
      const icons = wrapper.findAllComponents(CommonIconStub)
      const arrowIcon = icons.find(icon => icon.props('name') === 'lucide:arrow-right')
      expect(arrowIcon?.props('class')).toContain('h-3')
      expect(arrowIcon?.props('class')).toContain('w-3')
      expect(arrowIcon?.props('class')).toContain('ml-1')
    })

    it('applies button styling to CTA link', () => {
      const link = wrapper.findComponent(NuxtLinkStub)
      expect(link.props('class')).toContain('rounded-full')
      expect(link.props('class')).toContain('border')
      expect(link.props('class')).toContain('px-4')
      expect(link.props('class')).toContain('py-1')
    })

    it('applies background and border effects to CTA', () => {
      const link = wrapper.findComponent(NuxtLinkStub)
      expect(link.props('class')).toContain('bg-brand-light/15')
      expect(link.props('class')).toContain('border-brand-light/25')
      expect(link.props('class')).toContain('backdrop-blur-sm')
    })

    it('applies hover effects to CTA', () => {
      const link = wrapper.findComponent(NuxtLinkStub)
      expect(link.props('class')).toContain('hover:bg-brand-light/25')
      expect(link.props('class')).toContain('hover:border-brand-light/35')
    })

    it('hides CTA on small screens and shows on medium+', () => {
      const link = wrapper.findComponent(NuxtLinkStub)
      expect(link.props('class')).toContain('hidden')
      expect(link.props('class')).toContain('md:inline-flex')
    })

    it('applies whitespace-nowrap to CTA', () => {
      const link = wrapper.findComponent(NuxtLinkStub)
      expect(link.props('class')).toContain('whitespace-nowrap')
    })

    it('applies text styling to CTA', () => {
      const link = wrapper.findComponent(NuxtLinkStub)
      expect(link.props('class')).toContain('text-xs')
      expect(link.props('class')).toContain('font-medium')
      expect(link.props('class')).toContain('tracking-wide')
    })

    it('applies transition to CTA', () => {
      const link = wrapper.findComponent(NuxtLinkStub)
      expect(link.props('class')).toContain('transition-all')
    })

    it('applies margin-left to CTA', () => {
      const link = wrapper.findComponent(NuxtLinkStub)
      expect(link.props('class')).toContain('ml-2')
    })
  })

  describe('Overlay Element', () => {
    let wrapper: VueWrapper

    beforeEach(() => {
      wrapper = mount(AnnouncementBar, {
        global: {
          stubs: {
            commonIcon: CommonIconStub,
            NuxtLink: NuxtLinkStub,
          },
        },
      })
    })

    it('renders luxury overlay element', () => {
      const overlay = wrapper.find('.pointer-events-none.absolute.inset-0')
      expect(overlay.exists()).toBe(true)
    })

    it('applies gradient to overlay', () => {
      const overlay = wrapper.find('.pointer-events-none.absolute.inset-0')
      expect(overlay.classes()).toContain('bg-gradient-to-r')
      expect(overlay.classes()).toContain('from-transparent')
      expect(overlay.classes()).toContain('via-brand-light/5')
      expect(overlay.classes()).toContain('to-transparent')
    })

    it('applies opacity to overlay', () => {
      const overlay = wrapper.find('.pointer-events-none.absolute.inset-0')
      expect(overlay.classes()).toContain('opacity-40')
    })

    it('disables pointer events on overlay', () => {
      const overlay = wrapper.find('.pointer-events-none')
      expect(overlay.exists()).toBe(true)
    })

    it('positions overlay absolutely with full coverage', () => {
      const overlay = wrapper.find('.pointer-events-none.absolute.inset-0')
      expect(overlay.classes()).toContain('absolute')
      expect(overlay.classes()).toContain('inset-0')
    })
  })

  describe('Layout and Styling', () => {
    let wrapper: VueWrapper

    beforeEach(() => {
      wrapper = mount(AnnouncementBar, {
        global: {
          stubs: {
            commonIcon: CommonIconStub,
            NuxtLink: NuxtLinkStub,
          },
        },
      })
    })

    it('applies vertical padding to content', () => {
      const contentContainer = wrapper.find('.flex.items-center.justify-center')
      expect(contentContainer.classes()).toContain('py-3')
    })

    it('applies gap between elements', () => {
      const contentContainer = wrapper.find('.flex.items-center.justify-center')
      expect(contentContainer.classes()).toContain('gap-3')
    })

    it('centers items vertically', () => {
      const contentContainer = wrapper.find('.flex.items-center.justify-center')
      expect(contentContainer.classes()).toContain('items-center')
    })

    it('centers items horizontally', () => {
      const contentContainer = wrapper.find('.flex.items-center.justify-center')
      expect(contentContainer.classes()).toContain('justify-center')
    })
  })

  describe('Responsive Design', () => {
    let wrapper: VueWrapper

    beforeEach(() => {
      wrapper = mount(AnnouncementBar, {
        global: {
          stubs: {
            commonIcon: CommonIconStub,
            NuxtLink: NuxtLinkStub,
          },
        },
      })
    })

    it('hides separator on small screens', () => {
      const separator = wrapper.find('.hidden.sm\\:inline')
      expect(separator.classes()).toContain('hidden')
      expect(separator.classes()).toContain('sm:inline')
    })

    it('changes description display from block to inline on small screens', () => {
      const description = wrapper.find('.block.sm\\:inline')
      expect(description.classes()).toContain('block')
      expect(description.classes()).toContain('sm:inline')
    })

    it('increases text size on medium screens', () => {
      const contentContainer = wrapper.find('.flex.items-center.justify-center')
      expect(contentContainer.classes()).toContain('text-sm')
      expect(contentContainer.classes()).toContain('md:text-base')
    })
  })

  describe('Accessibility', () => {
    let wrapper: VueWrapper

    beforeEach(() => {
      wrapper = mount(AnnouncementBar, {
        global: {
          stubs: {
            commonIcon: CommonIconStub,
            NuxtLink: NuxtLinkStub,
          },
        },
      })
    })

    it('uses semantic banner role', () => {
      const banner = wrapper.find('[role="banner"]')
      expect(banner.exists()).toBe(true)
    })

    it('provides descriptive aria-label', () => {
      const banner = wrapper.find('[role="banner"]')
      expect(banner.attributes('aria-label')).toBe('Promotional announcement')
    })

    it('uses semantic paragraph element for text', () => {
      const paragraph = wrapper.find('p')
      expect(paragraph.exists()).toBe(true)
    })

    it('provides visual hierarchy with font weights', () => {
      const highlight = wrapper.find('.font-semibold')
      const contentContainer = wrapper.find('.font-medium')
      expect(highlight.exists()).toBe(true)
      expect(contentContainer.exists()).toBe(true)
    })
  })

  describe('i18n Integration', () => {
    let wrapper: VueWrapper

    beforeEach(() => {
      wrapper = mount(AnnouncementBar, {
        global: {
          stubs: {
            commonIcon: CommonIconStub,
            NuxtLink: NuxtLinkStub,
          },
        },
      })
    })

    it('uses translation key for highlight', () => {
      const highlight = wrapper.find('.font-semibold')
      expect(highlight.text()).toBe('home.announcement.highlight')
    })

    it('uses translation key for description', () => {
      const description = wrapper.find('.block.sm\\:inline')
      expect(description.text()).toBe('home.announcement.description')
    })

    it('uses translation key for CTA when showCta is true', () => {
      const wrapperWithCta = mount(AnnouncementBar, {
        props: {
          showCta: true,
        },
        global: {
          stubs: {
            commonIcon: CommonIconStub,
            NuxtLink: NuxtLinkStub,
          },
        },
      })

      const link = wrapperWithCta.findComponent(NuxtLinkStub)
      expect(link.text()).toContain('home.announcement.cta')
    })
  })

  describe('Visual Effects', () => {
    let wrapper: VueWrapper

    beforeEach(() => {
      wrapper = mount(AnnouncementBar, {
        global: {
          stubs: {
            commonIcon: CommonIconStub,
            NuxtLink: NuxtLinkStub,
          },
        },
      })
    })

    it('applies backdrop blur to CTA when shown', () => {
      const wrapperWithCta = mount(AnnouncementBar, {
        props: {
          showCta: true,
        },
        global: {
          stubs: {
            commonIcon: CommonIconStub,
            NuxtLink: NuxtLinkStub,
          },
        },
      })

      const link = wrapperWithCta.findComponent(NuxtLinkStub)
      expect(link.props('class')).toContain('backdrop-blur-sm')
    })

    it('uses gradient backgrounds for visual depth', () => {
      const banner = wrapper.find('[role="banner"]')
      const overlay = wrapper.find('.pointer-events-none')
      expect(banner.classes()).toContain('bg-gradient-to-r')
      expect(overlay.classes()).toContain('bg-gradient-to-r')
    })
  })
})
