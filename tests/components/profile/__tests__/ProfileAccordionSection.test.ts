import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ProfileAccordionSection from '~/components/profile/ProfileAccordionSection.vue'

// Mock #imports for i18n
vi.mock('#imports', () => ({
  useI18n: vi.fn(() => ({
    t: (k: string) => k,
    locale: { value: 'es' },
  })),
}))

// i18n plugin that provides $t to components
const mockI18n = {
  install(app: any) {
    app.config.globalProperties.$t = (key: string) => key
    app.config.globalProperties.$i18n = { locale: 'es' }
  },
}

// Default stubs for child components
const defaultStubs = {
  commonIcon: {
    template: '<span :data-icon="name" :class="$attrs.class"></span>',
    props: ['name'],
  },
  Transition: {
    template: '<div><slot /></div>',
  },
}

// Helper to mount with i18n and stubs
const mountWithConfig = (options: any = {}) => {
  return mount(ProfileAccordionSection, {
    ...options,
    global: {
      ...options.global,
      plugins: [...(options.global?.plugins || []), mockI18n],
      stubs: {
        ...defaultStubs,
        ...options.global?.stubs,
      },
    },
  })
}

describe('Profile ProfileAccordionSection Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const defaultProps = {
    title: 'Account Settings',
    subtitle: 'Manage your account preferences',
    icon: 'lucide:settings',
  }

  describe('Rendering', () => {
    it('should render accordion section', () => {
      const wrapper = mountWithConfig({
        props: defaultProps,
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('should display title', () => {
      const wrapper = mountWithConfig({
        props: defaultProps,
      })

      expect(wrapper.text()).toContain('Account Settings')
    })

    it('should display subtitle', () => {
      const wrapper = mountWithConfig({
        props: defaultProps,
      })

      expect(wrapper.text()).toContain('Manage your account preferences')
    })

    it('should render icon', () => {
      const wrapper = mountWithConfig({
        props: defaultProps,
      })

      const icon = wrapper.find('[data-icon="lucide:settings"]')
      expect(icon.exists()).toBe(true)
    })

    it('should render chevron icon', () => {
      const wrapper = mountWithConfig({
        props: defaultProps,
      })

      const chevronIcon = wrapper.find('[data-icon="lucide:chevron-down"]')
      expect(chevronIcon.exists()).toBe(true)
    })

    it('should render slot content when expanded', () => {
      const wrapper = mountWithConfig({
        props: {
          ...defaultProps,
          expanded: true,
        },
        slots: {
          default: '<div class="slot-content">Test Content</div>',
        },
      })

      expect(wrapper.find('.slot-content').exists()).toBe(true)
      expect(wrapper.text()).toContain('Test Content')
    })
  })

  describe('Props', () => {
    it('should accept custom iconBg', () => {
      const wrapper = mountWithConfig({
        props: {
          ...defaultProps,
          iconBg: 'bg-blue-100 dark:bg-blue-900',
        },
      })

      const iconContainer = wrapper.find('.w-10.h-10')
      expect(iconContainer.classes()).toContain('bg-blue-100')
    })

    it('should accept custom iconColor', () => {
      const wrapper = mountWithConfig({
        props: {
          ...defaultProps,
          iconColor: 'text-blue-600 dark:text-blue-400',
        },
      })

      const icon = wrapper.find('[data-icon="lucide:settings"]')
      expect(icon.classes()).toContain('text-blue-600')
    })

    it('should use default iconBg when not provided', () => {
      const wrapper = mountWithConfig({
        props: defaultProps,
      })

      const iconContainer = wrapper.find('.w-10.h-10')
      expect(iconContainer.classes()).toContain('bg-zinc-100')
    })

    it('should use default iconColor when not provided', () => {
      const wrapper = mountWithConfig({
        props: defaultProps,
      })

      const icon = wrapper.find('[data-icon="lucide:settings"]')
      expect(icon.classes()).toContain('text-zinc-600')
    })

    it('should apply border when isLast is false', () => {
      const wrapper = mountWithConfig({
        props: {
          ...defaultProps,
          isLast: false,
        },
      })

      const container = wrapper.find('div')
      expect(container.classes()).toContain('border-b')
    })

    it('should not apply border when isLast is true', () => {
      const wrapper = mountWithConfig({
        props: {
          ...defaultProps,
          isLast: true,
        },
      })

      const container = wrapper.find('div')
      expect(container.classes()).not.toContain('border-b')
    })
  })

  describe('Expanded State', () => {
    it('should show content when expanded is true', () => {
      const wrapper = mountWithConfig({
        props: {
          ...defaultProps,
          expanded: true,
        },
        slots: {
          default: '<p>Expanded content</p>',
        },
      })

      expect(wrapper.text()).toContain('Expanded content')
    })

    it('should hide content when expanded is false', () => {
      const wrapper = mountWithConfig({
        props: {
          ...defaultProps,
          expanded: false,
        },
        slots: {
          default: '<p>Expanded content</p>',
        },
      })

      const contentRegion = wrapper.find('[role="region"]')
      // v-show makes element invisible but still in DOM
      expect(contentRegion.isVisible()).toBe(false)
    })

    it('should rotate chevron when expanded', () => {
      const wrapper = mountWithConfig({
        props: {
          ...defaultProps,
          expanded: true,
        },
      })

      const chevronIcon = wrapper.find('[data-icon="lucide:chevron-down"]')
      expect(chevronIcon.classes()).toContain('rotate-180')
    })

    it('should not rotate chevron when collapsed', () => {
      const wrapper = mountWithConfig({
        props: {
          ...defaultProps,
          expanded: false,
        },
      })

      const chevronIcon = wrapper.find('[data-icon="lucide:chevron-down"]')
      expect(chevronIcon.classes()).not.toContain('rotate-180')
    })
  })

  describe('Emits', () => {
    it('should emit toggle when header button clicked', async () => {
      const wrapper = mountWithConfig({
        props: defaultProps,
      })

      await wrapper.find('button').trigger('click')

      expect(wrapper.emitted('toggle')).toBeTruthy()
      expect(wrapper.emitted('toggle')?.length).toBe(1)
    })

    it('should emit navigate-first on Home key press', async () => {
      const wrapper = mountWithConfig({
        props: defaultProps,
      })

      await wrapper.find('button').trigger('keydown.home')

      expect(wrapper.emitted('navigate-first')).toBeTruthy()
    })

    it('should emit navigate-last on End key press', async () => {
      const wrapper = mountWithConfig({
        props: defaultProps,
      })

      await wrapper.find('button').trigger('keydown.end')

      expect(wrapper.emitted('navigate-last')).toBeTruthy()
    })

    it('should emit navigate-next on ArrowDown key press', async () => {
      const wrapper = mountWithConfig({
        props: defaultProps,
      })

      await wrapper.find('button').trigger('keydown.arrow-down')

      expect(wrapper.emitted('navigate-next')).toBeTruthy()
    })

    it('should emit navigate-prev on ArrowUp key press', async () => {
      const wrapper = mountWithConfig({
        props: defaultProps,
      })

      await wrapper.find('button').trigger('keydown.arrow-up')

      expect(wrapper.emitted('navigate-prev')).toBeTruthy()
    })
  })

  describe('Accessibility', () => {
    it('should have proper button type', () => {
      const wrapper = mountWithConfig({
        props: defaultProps,
      })

      const button = wrapper.find('button')
      expect(button.attributes('type')).toBe('button')
    })

    it('should have aria-expanded attribute', () => {
      const wrapper = mountWithConfig({
        props: {
          ...defaultProps,
          expanded: true,
        },
      })

      const button = wrapper.find('button')
      expect(button.attributes('aria-expanded')).toBe('true')
    })

    it('should have aria-expanded false when collapsed', () => {
      const wrapper = mountWithConfig({
        props: {
          ...defaultProps,
          expanded: false,
        },
      })

      const button = wrapper.find('button')
      expect(button.attributes('aria-expanded')).toBe('false')
    })

    it('should have aria-controls pointing to content', () => {
      const wrapper = mountWithConfig({
        props: defaultProps,
      })

      const button = wrapper.find('button')
      const ariaControls = button.attributes('aria-controls')
      expect(ariaControls).toBe('accordion-content-account-settings')
    })

    it('should have proper id on header button', () => {
      const wrapper = mountWithConfig({
        props: defaultProps,
      })

      const button = wrapper.find('button')
      expect(button.attributes('id')).toBe('accordion-header-account-settings')
    })

    it('should have content region with role="region"', () => {
      const wrapper = mountWithConfig({
        props: {
          ...defaultProps,
          expanded: true,
        },
      })

      const region = wrapper.find('[role="region"]')
      expect(region.exists()).toBe(true)
    })

    it('should have aria-labelledby on content region', () => {
      const wrapper = mountWithConfig({
        props: {
          ...defaultProps,
          expanded: true,
        },
      })

      const region = wrapper.find('[role="region"]')
      expect(region.attributes('aria-labelledby')).toBe('accordion-header-account-settings')
    })

    it('should have matching ids for aria-controls and content id', () => {
      const wrapper = mountWithConfig({
        props: {
          ...defaultProps,
          expanded: true,
        },
      })

      const button = wrapper.find('button')
      const region = wrapper.find('[role="region"]')

      expect(button.attributes('aria-controls')).toBe(region.attributes('id'))
    })
  })

  describe('ID Generation (Slugify)', () => {
    it('should slugify title with spaces', () => {
      const wrapper = mountWithConfig({
        props: {
          ...defaultProps,
          title: 'Account Settings',
        },
      })

      const button = wrapper.find('button')
      expect(button.attributes('id')).toBe('accordion-header-account-settings')
    })

    it('should slugify title with special characters', () => {
      const wrapper = mountWithConfig({
        props: {
          ...defaultProps,
          title: 'My Profile & Settings!',
        },
      })

      const button = wrapper.find('button')
      expect(button.attributes('id')).toBe('accordion-header-my-profile--settings')
    })

    it('should convert title to lowercase', () => {
      const wrapper = mountWithConfig({
        props: {
          ...defaultProps,
          title: 'UPPERCASE TITLE',
        },
      })

      const button = wrapper.find('button')
      expect(button.attributes('id')).toBe('accordion-header-uppercase-title')
    })

    it('should handle multiple spaces', () => {
      const wrapper = mountWithConfig({
        props: {
          ...defaultProps,
          title: 'Title   With   Spaces',
        },
      })

      const button = wrapper.find('button')
      expect(button.attributes('id')).toBe('accordion-header-title-with-spaces')
    })
  })

  describe('Expose Focus Method', () => {
    it('should expose focus method', () => {
      const wrapper = mountWithConfig({
        props: defaultProps,
      })

      const vm = wrapper.vm as any
      expect(typeof vm.focus).toBe('function')
    })

    it('should focus button when focus method called', async () => {
      const wrapper = mountWithConfig({
        props: defaultProps,
        attachTo: document.body,
      })

      const vm = wrapper.vm as any
      const button = wrapper.find('button')

      vm.focus()
      await wrapper.vm.$nextTick()

      expect(document.activeElement).toBe(button.element)

      wrapper.unmount()
    })
  })

  describe('Styling', () => {
    it('should have full width button', () => {
      const wrapper = mountWithConfig({
        props: defaultProps,
      })

      const button = wrapper.find('button')
      expect(button.classes()).toContain('w-full')
    })

    it('should have hover state classes', () => {
      const wrapper = mountWithConfig({
        props: defaultProps,
      })

      const button = wrapper.find('button')
      expect(button.classes()).toContain('hover:bg-zinc-50')
    })

    it('should have dark mode hover classes', () => {
      const wrapper = mountWithConfig({
        props: defaultProps,
      })

      const button = wrapper.find('button')
      expect(button.classes()).toContain('dark:hover:bg-zinc-700/50')
    })

    it('should have focus ring classes', () => {
      const wrapper = mountWithConfig({
        props: defaultProps,
      })

      const button = wrapper.find('button')
      expect(button.classes()).toContain('focus:ring-2')
      expect(button.classes()).toContain('focus:ring-blue-500')
    })

    it('should have transition classes', () => {
      const wrapper = mountWithConfig({
        props: defaultProps,
      })

      const button = wrapper.find('button')
      expect(button.classes()).toContain('transition-colors')
    })

    it('should have responsive padding', () => {
      const wrapper = mountWithConfig({
        props: defaultProps,
      })

      const button = wrapper.find('button')
      expect(button.classes()).toContain('p-4')
      expect(button.classes()).toContain('md:px-6')
    })

    it('should have icon container with correct size', () => {
      const wrapper = mountWithConfig({
        props: defaultProps,
      })

      const iconContainer = wrapper.find('.w-10.h-10')
      expect(iconContainer.exists()).toBe(true)
      expect(iconContainer.classes()).toContain('rounded-lg')
    })

    it('should have chevron transition classes', () => {
      const wrapper = mountWithConfig({
        props: defaultProps,
      })

      const chevron = wrapper.find('[data-icon="lucide:chevron-down"]')
      expect(chevron.classes()).toContain('transition-transform')
    })
  })

  describe('Content Area', () => {
    it('should have overflow hidden on content wrapper', () => {
      const wrapper = mountWithConfig({
        props: {
          ...defaultProps,
          expanded: true,
        },
      })

      const contentWrapper = wrapper.find('[role="region"]')
      expect(contentWrapper.classes()).toContain('overflow-hidden')
    })

    it('should have padding on slot content wrapper', () => {
      const wrapper = mountWithConfig({
        props: {
          ...defaultProps,
          expanded: true,
        },
        slots: {
          default: '<p>Content</p>',
        },
      })

      const innerWrapper = wrapper.find('.px-4.pb-4')
      expect(innerWrapper.exists()).toBe(true)
    })

    it('should have responsive padding on content', () => {
      const wrapper = mountWithConfig({
        props: {
          ...defaultProps,
          expanded: true,
        },
        slots: {
          default: '<p>Content</p>',
        },
      })

      const innerWrapper = wrapper.find('.px-4.pb-4')
      expect(innerWrapper.classes()).toContain('md:px-6')
      expect(innerWrapper.classes()).toContain('md:pb-6')
    })
  })

  describe('Dark Mode', () => {
    it('should have dark mode border classes', () => {
      const wrapper = mountWithConfig({
        props: {
          ...defaultProps,
          isLast: false,
        },
      })

      const container = wrapper.find('div')
      expect(container.classes()).toContain('dark:border-zinc-700')
    })

    it('should have dark mode text classes for title', () => {
      const wrapper = mountWithConfig({
        props: defaultProps,
      })

      const title = wrapper.find('.text-zinc-900')
      expect(title.classes()).toContain('dark:text-white')
    })

    it('should have dark mode text classes for subtitle', () => {
      const wrapper = mountWithConfig({
        props: defaultProps,
      })

      const subtitle = wrapper.find('.text-zinc-500')
      expect(subtitle.classes()).toContain('dark:text-zinc-400')
    })

    it('should have dark mode classes for default icon background', () => {
      const wrapper = mountWithConfig({
        props: defaultProps,
      })

      const iconContainer = wrapper.find('.w-10.h-10')
      expect(iconContainer.classes()).toContain('dark:bg-zinc-700')
    })

    it('should have dark mode classes for default icon color', () => {
      const wrapper = mountWithConfig({
        props: defaultProps,
      })

      const icon = wrapper.find('[data-icon="lucide:settings"]')
      expect(icon.classes()).toContain('dark:text-zinc-400')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty title', () => {
      const wrapper = mountWithConfig({
        props: {
          ...defaultProps,
          title: '',
        },
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('should handle empty subtitle', () => {
      const wrapper = mountWithConfig({
        props: {
          ...defaultProps,
          subtitle: '',
        },
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('should handle very long title', () => {
      const longTitle = 'A'.repeat(200)
      const wrapper = mountWithConfig({
        props: {
          ...defaultProps,
          title: longTitle,
        },
      })

      expect(wrapper.text()).toContain(longTitle)
    })

    it('should handle special icon names', () => {
      const wrapper = mountWithConfig({
        props: {
          ...defaultProps,
          icon: 'mdi:account-circle-outline',
        },
      })

      const icon = wrapper.find('[data-icon="mdi:account-circle-outline"]')
      expect(icon.exists()).toBe(true)
    })

    it('should render empty slot content area when slot is empty', () => {
      const wrapper = mountWithConfig({
        props: {
          ...defaultProps,
          expanded: true,
        },
      })

      const region = wrapper.find('[role="region"]')
      expect(region.exists()).toBe(true)
    })

    it('should handle complex slot content', () => {
      const wrapper = mountWithConfig({
        props: {
          ...defaultProps,
          expanded: true,
        },
        slots: {
          default: `
            <form>
              <input type="text" />
              <button type="submit">Submit</button>
            </form>
          `,
        },
      })

      expect(wrapper.find('form').exists()).toBe(true)
      expect(wrapper.find('input').exists()).toBe(true)
    })
  })

  describe('Multiple Toggles', () => {
    it('should emit toggle on each click', async () => {
      const wrapper = mountWithConfig({
        props: defaultProps,
      })

      const button = wrapper.find('button')

      await button.trigger('click')
      await button.trigger('click')
      await button.trigger('click')

      expect(wrapper.emitted('toggle')?.length).toBe(3)
    })
  })

  describe('Text Styling', () => {
    it('should have semibold title', () => {
      const wrapper = mountWithConfig({
        props: defaultProps,
      })

      const title = wrapper.find('.font-semibold')
      expect(title.exists()).toBe(true)
      expect(title.text()).toBe('Account Settings')
    })

    it('should have small text for title', () => {
      const wrapper = mountWithConfig({
        props: defaultProps,
      })

      const titleWrapper = wrapper.find('p.text-sm.font-semibold')
      expect(titleWrapper.exists()).toBe(true)
    })

    it('should have extra small text for subtitle', () => {
      const wrapper = mountWithConfig({
        props: defaultProps,
      })

      const subtitle = wrapper.find('p.text-xs.text-zinc-500')
      expect(subtitle.exists()).toBe(true)
    })
  })

  describe('Icon Sizes', () => {
    it('should have correct icon size class', () => {
      const wrapper = mountWithConfig({
        props: defaultProps,
      })

      const mainIcon = wrapper.find('[data-icon="lucide:settings"]')
      expect(mainIcon.classes()).toContain('w-5')
      expect(mainIcon.classes()).toContain('h-5')
    })

    it('should have correct chevron size class', () => {
      const wrapper = mountWithConfig({
        props: defaultProps,
      })

      const chevron = wrapper.find('[data-icon="lucide:chevron-down"]')
      expect(chevron.classes()).toContain('w-5')
      expect(chevron.classes()).toContain('h-5')
    })

    it('should have chevron with muted color', () => {
      const wrapper = mountWithConfig({
        props: defaultProps,
      })

      const chevron = wrapper.find('[data-icon="lucide:chevron-down"]')
      expect(chevron.classes()).toContain('text-zinc-400')
    })
  })
})
