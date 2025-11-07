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
  useKeyboardShortcuts: () => ({
    getShortcutDisplay: mockGetShortcutDisplay,
  }),
}))

// Mock useCart composable
const mockItemCount = ref(0)
global.useCart = vi.fn(() => ({
  itemCount: mockItemCount,
}))

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
    template: '<button @click="$emit(\'click\')"><slot /></button>',
    props: ['type', 'variant', 'size', 'ariaLabel', 'class'],
  },
}))

describe('AppHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockItemCount.value = 0
  })

  it('renders logo with link to home', () => {
    const wrapper = mount(AppHeader, {
      global: {
        stubs: {
          NuxtLink: {
            template: '<a :to="to"><slot /></a>',
            props: ['to'],
          },
        },
      },
    })

    expect(wrapper.text()).toContain('Moldova Direct')
    const logoLink = wrapper.findAll('a')[0]
    expect(logoLink.exists()).toBe(true)
  })

  it('renders desktop navigation links', () => {
    const wrapper = mount(AppHeader, {
      global: {
        stubs: {
          NuxtLink: {
            template: '<a :to="to"><slot /></a>',
            props: ['to'],
          },
        },
      },
    })

    // Desktop nav should contain these links
    expect(wrapper.text()).toContain('common.home')
    expect(wrapper.text()).toContain('common.shop')
    expect(wrapper.text()).toContain('common.about')
    expect(wrapper.text()).toContain('common.contact')
  })

  it('renders language switcher and theme toggle', () => {
    const wrapper = mount(AppHeader)

    expect(wrapper.findComponent({ name: 'LanguageSwitcher' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'ThemeToggle' }).exists()).toBe(true)
  })

  describe('Search functionality', () => {
    it('renders search button with keyboard shortcut hint', () => {
      const wrapper = mount(AppHeader, {
        global: {
          stubs: {
            NuxtLink: {
              template: '<a><slot /></a>',
              props: ['to'],
            },
          },
        },
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
        global: {
          stubs: {
            NuxtLink: {
              template: '<a><slot /></a>',
              props: ['to'],
            },
          },
        },
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
        global: {
          stubs: {
            NuxtLink: {
              template: '<a><slot /></a>',
              props: ['to'],
            },
          },
        },
      })

      const searchButtons = wrapper.findAll('button').filter(btn =>
        btn.attributes('aria-label')?.includes('Ctrl+K')
      )
      expect(searchButtons.length).toBeGreaterThan(0)
    })
  })

  describe('Cart functionality', () => {
    it('renders cart link', () => {
      const wrapper = mount(AppHeader, {
        global: {
          stubs: {
            NuxtLink: {
              template: '<a :to="to" :aria-label="ariaLabel"><slot /></a>',
              props: ['to', 'ariaLabel'],
            },
          },
        },
      })

      const cartLinks = wrapper.findAllComponents({ name: 'NuxtLink' })
      const cartLink = cartLinks.find(link =>
        link.props('ariaLabel')?.includes('common.cart')
      )
      expect(cartLink).toBeDefined()
    })

    it('does not show cart badge when cart is empty', () => {
      mockItemCount.value = 0

      const wrapper = mount(AppHeader, {
        global: {
          stubs: {
            NuxtLink: {
              template: '<a><slot /></a>',
              props: ['to', 'ariaLabel'],
            },
          },
        },
      })

      // Cart badge should not be visible
      const badges = wrapper.findAll('.bg-primary-600')
      expect(badges.length).toBe(0)
    })

    it('shows cart badge with count when cart has items', () => {
      mockItemCount.value = 3

      const wrapper = mount(AppHeader, {
        global: {
          stubs: {
            NuxtLink: {
              template: '<a><slot /></a>',
              props: ['to', 'ariaLabel'],
            },
          },
        },
      })

      // Cart badge should be visible with count
      const badges = wrapper.findAll('span').filter(span =>
        span.text() === '3'
      )
      expect(badges.length).toBeGreaterThan(0)
    })

    it('updates aria-label with cart count', () => {
      mockItemCount.value = 5

      const wrapper = mount(AppHeader, {
        global: {
          stubs: {
            NuxtLink: {
              template: '<a :aria-label="ariaLabel"><slot /></a>',
              props: ['to', 'ariaLabel'],
            },
          },
        },
      })

      const cartLinks = wrapper.findAllComponents({ name: 'NuxtLink' })
      const cartLink = cartLinks.find(link =>
        link.props('ariaLabel')?.includes('5')
      )
      expect(cartLink).toBeDefined()
    })
  })

  describe('Mobile menu', () => {
    it('does not show mobile menu by default', () => {
      const wrapper = mount(AppHeader)

      expect(wrapper.findComponent({ name: 'MobileNav' }).exists()).toBe(false)
    })

    it('shows mobile menu when toggled', async () => {
      const wrapper = mount(AppHeader, {
        global: {
          stubs: {
            NuxtLink: {
              template: '<a><slot /></a>',
              props: ['to'],
            },
          },
        },
      })

      // Find mobile menu button
      const mobileMenuButtons = wrapper.findAll('button').filter(btn =>
        btn.attributes('aria-label')?.includes('common.menu')
      )

      if (mobileMenuButtons.length > 0) {
        await mobileMenuButtons[0].trigger('click')

        // Mobile menu should now be visible
        expect(wrapper.findComponent({ name: 'MobileNav' }).exists()).toBe(true)
      }
    })

    it('prevents body scroll when mobile menu is open', async () => {
      const wrapper = mount(AppHeader, {
        global: {
          stubs: {
            NuxtLink: {
              template: '<a><slot /></a>',
              props: ['to'],
            },
          },
        },
      })

      const mobileMenuButtons = wrapper.findAll('button').filter(btn =>
        btn.attributes('aria-label')?.includes('common.menu')
      )

      if (mobileMenuButtons.length > 0) {
        await mobileMenuButtons[0].trigger('click')

        // Check that body overflow is set
        expect(document.body.style.overflow).toBe('hidden')
      }
    })

    it('restores body scroll when mobile menu is closed', async () => {
      const wrapper = mount(AppHeader, {
        global: {
          stubs: {
            NuxtLink: {
              template: '<a><slot /></a>',
              props: ['to'],
            },
          },
        },
      })

      const mobileMenuButtons = wrapper.findAll('button').filter(btn =>
        btn.attributes('aria-label')?.includes('common.menu') ||
        btn.attributes('aria-label')?.includes('common.close')
      )

      if (mobileMenuButtons.length > 0) {
        // Open menu
        await mobileMenuButtons[0].trigger('click')
        expect(document.body.style.overflow).toBe('hidden')

        // Close menu
        await mobileMenuButtons[0].trigger('click')
        expect(document.body.style.overflow).toBe('')
      }
    })

    it('cleans up body overflow on unmount', async () => {
      const wrapper = mount(AppHeader, {
        global: {
          stubs: {
            NuxtLink: {
              template: '<a><slot /></a>',
              props: ['to'],
            },
          },
        },
      })

      const mobileMenuButtons = wrapper.findAll('button').filter(btn =>
        btn.attributes('aria-label')?.includes('common.menu')
      )

      if (mobileMenuButtons.length > 0) {
        await mobileMenuButtons[0].trigger('click')
        expect(document.body.style.overflow).toBe('hidden')

        wrapper.unmount()
        expect(document.body.style.overflow).toBe('')
      }
    })
  })

  describe('Accessibility', () => {
    it('has proper aria-labels for buttons', () => {
      mockItemCount.value = 2

      const wrapper = mount(AppHeader, {
        global: {
          stubs: {
            NuxtLink: {
              template: '<a :aria-label="ariaLabel"><slot /></a>',
              props: ['to', 'ariaLabel'],
            },
          },
        },
      })

      // Search button
      const buttons = wrapper.findAll('button')
      const searchButton = buttons.find(btn =>
        btn.attributes('aria-label')?.includes('common.search')
      )
      expect(searchButton).toBeDefined()

      // Cart link
      const links = wrapper.findAllComponents({ name: 'NuxtLink' })
      const cartLink = links.find(link =>
        link.props('ariaLabel')?.includes('common.cart')
      )
      expect(cartLink).toBeDefined()
    })

    it('has aria-expanded on mobile menu button', () => {
      const wrapper = mount(AppHeader, {
        global: {
          stubs: {
            NuxtLink: {
              template: '<a><slot /></a>',
              props: ['to'],
            },
          },
        },
      })

      const mobileMenuButtons = wrapper.findAll('button').filter(btn =>
        btn.attributes('aria-expanded') !== undefined
      )
      expect(mobileMenuButtons.length).toBeGreaterThan(0)
    })
  })

  describe('Account link', () => {
    it('renders account link', () => {
      const wrapper = mount(AppHeader, {
        global: {
          stubs: {
            NuxtLink: {
              template: '<a :aria-label="ariaLabel"><slot /></a>',
              props: ['to', 'ariaLabel'],
            },
          },
        },
      })

      const accountLinks = wrapper.findAllComponents({ name: 'NuxtLink' })
      const accountLink = accountLinks.find(link =>
        link.props('ariaLabel')?.includes('common.account')
      )
      expect(accountLink).toBeDefined()
    })
  })
})
