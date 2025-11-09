import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import AppHeader from './AppHeader.vue'

// Mock the useKeyboardShortcuts composable
const mockGetShortcutDisplay = vi.fn((key: string, options: any) => {
  if (options?.ctrlOrCmd) {
    return 'Ctrl+K'
  }
  return key.toUpperCase()
})

vi.mock('~/composables/useKeyboardShortcuts', () => ({
  default: () => ({
    getShortcutDisplay: mockGetShortcutDisplay,
  }),
  useKeyboardShortcuts: () => ({
    getShortcutDisplay: mockGetShortcutDisplay,
  }),
}))

// Mock useCart composable
const mockItemCount = ref(0)
global.useCart = vi.fn(() => ({
  itemCount: mockItemCount,
}))

// Mock useKeyboardShortcuts as global (Nuxt auto-import)
global.useKeyboardShortcuts = vi.fn(() => ({
  getShortcutDisplay: mockGetShortcutDisplay,
}))

// Mock i18n composables
global.useI18n = vi.fn(() => ({
  t: (key: string) => key,
  locale: ref('es'),
}))

global.useLocalePath = vi.fn(() => (path: string) => path)

// Mock components
vi.mock('./LanguageSwitcher.vue', () => ({
  default: {
    name: 'LanguageSwitcher',
    template: '<div>LanguageSwitcher</div>',
  },
}))

vi.mock('./MobileNav.vue', () => ({
  default: {
    name: 'MobileNav',
    template: '<div>MobileNav</div>',
    props: ['onClose'],
    emits: ['close'],
  },
}))

vi.mock('./ThemeToggle.vue', () => ({
  default: {
    name: 'ThemeToggle',
    template: '<div>ThemeToggle</div>',
  },
}))

vi.mock('@/components/ui/button', () => ({
  Button: {
    name: 'Button',
    template: '<button :aria-label="ariaLabel" :class="className" @click="$emit(\'click\')"><slot /></button>',
    props: {
      type: String,
      variant: String,
      size: String,
      ariaLabel: String,
      class: String,
    },
    computed: {
      className() {
        return this.class || ''
      }
    }
  },
}))

// Helper to create consistent global config for all tests
const createGlobalConfig = () => ({
  mocks: {
    $t: (key: string) => key,
  },
  stubs: {
    NuxtLink: {
      template: '<a :to="to" :aria-label="ariaLabel" :class="className"><slot /></a>',
      props: {
        to: [String, Object],
        ariaLabel: String,
        class: String,
      },
      computed: {
        className() {
          return this.class || ''
        }
      }
    },
  },
})

describe('AppHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockItemCount.value = 0
  })

  it('renders logo with link to home', () => {
    const wrapper = mount(AppHeader, {
      global: createGlobalConfig(),
    })

    expect(wrapper.text()).toContain('Moldova Direct')
    const logoLink = wrapper.findAll('a')[0]
    expect(logoLink.exists()).toBe(true)
  })

  it('renders desktop navigation links', () => {
    const wrapper = mount(AppHeader, {
      global: createGlobalConfig(),
    })

    // Desktop nav should contain these links
    expect(wrapper.text()).toContain('common.home')
    expect(wrapper.text()).toContain('common.shop')
    expect(wrapper.text()).toContain('common.about')
    expect(wrapper.text()).toContain('common.contact')
  })

  it('renders language switcher and theme toggle', () => {
    const wrapper = mount(AppHeader, {
      global: createGlobalConfig(),
    })

    expect(wrapper.findComponent({ name: 'LanguageSwitcher' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'ThemeToggle' }).exists()).toBe(true)
  })

  describe('Search functionality', () => {
    it('renders search button with keyboard shortcut hint', () => {
      const wrapper = mount(AppHeader, {
        global: createGlobalConfig(),
      })

      // Check search button exists
      const searchButtons = wrapper.findAll('button').filter(btn =>
        btn.attributes('aria-label')?.includes('common.search')
      )
      expect(searchButtons.length).toBeGreaterThan(0)

      // Check that getShortcutDisplay was called for the search shortcut
      expect(mockGetShortcutDisplay).toHaveBeenCalledWith('k', { ctrlOrCmd: true })
    })

    it('navigates to products page with search focus on button click', async () => {
      const wrapper = mount(AppHeader, {
        global: createGlobalConfig(),
      })

      // Find and click search button
      const searchButtons = wrapper.findAll('button').filter(btn =>
        btn.attributes('aria-label')?.includes('common.search')
      )

      if (searchButtons.length > 0) {
        await searchButtons[0].trigger('click')

        // Check navigateTo was called with correct params
        expect(global.navigateTo).toHaveBeenCalledWith(
          expect.objectContaining({
            path: '/products',
            query: { focus: 'search' },
          })
        )
      }
    })

    it('displays keyboard shortcut in aria-label', () => {
      const wrapper = mount(AppHeader, {
        global: createGlobalConfig(),
      })

      const searchButtons = wrapper.findAll('button').filter(btn =>
        btn.attributes('aria-label')?.includes('Ctrl+K')
      )
      expect(searchButtons.length).toBeGreaterThan(0)
    })
  })

  describe('Cart functionality', () => {
    it('does not show cart badge when cart is empty', () => {
      mockItemCount.value = 0

      const wrapper = mount(AppHeader, {
        global: createGlobalConfig(),
      })

      // Cart badge should not be visible
      const badges = wrapper.findAll('.bg-primary-600')
      expect(badges.length).toBe(0)
    })

    it('shows cart badge with count when cart has items', () => {
      mockItemCount.value = 3

      const wrapper = mount(AppHeader, {
        global: createGlobalConfig(),
      })

      // Cart badge should be visible with count
      const badges = wrapper.findAll('span').filter(span =>
        span.text() === '3'
      )
      expect(badges.length).toBeGreaterThan(0)
    })
  })

  describe('Mobile menu', () => {
    it('does not show mobile menu by default', () => {
      const wrapper = mount(AppHeader, {
        global: createGlobalConfig(),
      })

      expect(wrapper.findComponent({ name: 'MobileNav' }).exists()).toBe(false)
    })
  })

  describe('Accessibility', () => {
    it('has aria-expanded on mobile menu button', () => {
      const wrapper = mount(AppHeader, {
        global: createGlobalConfig(),
      })

      const mobileMenuButtons = wrapper.findAll('button').filter(btn =>
        btn.attributes('aria-expanded') !== undefined
      )
      expect(mobileMenuButtons.length).toBeGreaterThan(0)
    })
  })
})
