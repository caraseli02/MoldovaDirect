import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ServicesSection from '~/components/home/ServicesSection.vue'

vi.mock('#imports', () => ({
  useI18n: vi.fn(() => ({ t: (k: string) => k })),
  useLocalePath: vi.fn(() => (path: string) => path),
}))

// Mock commonIcon component
vi.mock('~/components/common/Icon.vue', () => ({
  default: {
    name: 'commonIcon',
    template: '<span :data-icon="name"></span>',
    props: ['name', 'class'],
  },
}))

// Mock NuxtLink
vi.mock('#app', () => ({
  NuxtLink: {
    name: 'NuxtLink',
    template: '<a :href="to"><slot /></a>',
    props: ['to'],
  },
}))

describe('Home ServicesSection', () => {
  const mockServices = [
    {
      title: 'Fast Shipping',
      description: 'Deliver your packages in 24-48 hours',
      cta: 'Learn More',
      href: '/services/shipping',
      icon: 'lucide:truck',
    },
    {
      title: 'Customs Clearance',
      description: 'Handle all customs documentation',
      cta: 'Get Started',
      href: '/services/customs',
      icon: 'lucide:file-check',
    },
    {
      title: 'Package Tracking',
      description: 'Track your shipments in real-time',
      cta: 'Track Now',
      href: '/services/tracking',
      icon: 'lucide:map-pin',
    },
  ]

  let wrapper: ReturnType<typeof mount>

  beforeEach(() => {
    wrapper = mount(ServicesSection, {
      props: {
        services: mockServices,
      },
      global: {
        stubs: {
          NuxtLink: {
            template: '<a :href="to"><slot /></a>',
            props: ['to'],
          },
          commonIcon: {
            template: '<span :data-icon="name"></span>',
            props: ['name'],
          },
        },
      },
    })
  })

  describe('Rendering', () => {
    it('should render the component', () => {
      expect(wrapper.exists()).toBe(true)
    })

    it('should render section with correct background classes', () => {
      const section = wrapper.find('section')
      expect(section.classes()).toContain('bg-white')
      expect(section.classes()).toContain('dark:bg-gray-950')
    })

    it('should render main title', () => {
      const title = wrapper.find('h2')
      expect(title.exists()).toBe(true)
      expect(title.text()).toBe('home.services.title')
    })

    it('should render subtitle', () => {
      const subtitle = wrapper.find('p')
      expect(subtitle.text()).toBe('home.services.subtitle')
    })

    it('should render contact CTA link', () => {
      const ctaLink = wrapper.findAll('a').at(0)
      expect(ctaLink?.attributes('href')).toBe('/contact')
      expect(ctaLink?.text()).toContain('home.services.contactCta')
    })

    it('should render all service cards', () => {
      const serviceCards = wrapper.findAll('.group')
      expect(serviceCards).toHaveLength(mockServices.length)
    })

    it('should render service titles correctly', () => {
      const serviceTitles = wrapper.findAll('h3')
      expect(serviceTitles).toHaveLength(mockServices.length)
      serviceTitles.forEach((title, index) => {
        expect(title.text()).toBe(mockServices[index].title)
      })
    })

    it('should render service descriptions', () => {
      const descriptions = wrapper.findAll('.group p')
      expect(descriptions.length).toBeGreaterThanOrEqual(mockServices.length)
      mockServices.forEach((service) => {
        const description = descriptions.find(d => d.text() === service.description)
        expect(description).toBeTruthy()
      })
    })

    it('should render service icons', () => {
      const icons = wrapper.findAll('[data-icon]')
      // Should have 1 arrow icon in header + 1 per service + 1 arrow per service CTA
      expect(icons.length).toBeGreaterThanOrEqual(mockServices.length)

      mockServices.forEach((service) => {
        const serviceIcon = icons.find(icon => icon.attributes('data-icon') === service.icon)
        expect(serviceIcon).toBeTruthy()
      })
    })

    it('should render service CTA links with correct hrefs', () => {
      const allLinks = wrapper.findAll('a')
      // First link is the contact CTA, rest are service CTAs
      const serviceLinks = allLinks.slice(1)

      serviceLinks.forEach((link, index) => {
        expect(link.attributes('href')).toBe(mockServices[index].href)
        expect(link.text()).toContain(mockServices[index].cta)
      })
    })
  })

  describe('Props Handling', () => {
    it('should accept services prop', () => {
      expect(wrapper.props('services')).toEqual(mockServices)
    })

    it('should handle empty services array', () => {
      const emptyWrapper = mount(ServicesSection, {
        props: {
          services: [],
        },
        global: {
          stubs: {
            NuxtLink: {
              template: '<a :href="to"><slot /></a>',
              props: ['to'],
            },
            commonIcon: {
              template: '<span :data-icon="name"></span>',
              props: ['name'],
            },
          },
        },
      })

      const serviceCards = emptyWrapper.findAll('.group')
      expect(serviceCards).toHaveLength(0)
    })

    it('should handle single service', () => {
      const singleServiceWrapper = mount(ServicesSection, {
        props: {
          services: [mockServices[0]],
        },
        global: {
          stubs: {
            NuxtLink: {
              template: '<a :href="to"><slot /></a>',
              props: ['to'],
            },
            commonIcon: {
              template: '<span :data-icon="name"></span>',
              props: ['name'],
            },
          },
        },
      })

      const serviceCards = singleServiceWrapper.findAll('.group')
      expect(serviceCards).toHaveLength(1)
    })
  })

  describe('User Interactions', () => {
    it('should have clickable service cards', () => {
      const serviceCards = wrapper.findAll('.group')
      serviceCards.forEach((card) => {
        const link = card.find('a')
        expect(link.exists()).toBe(true)
      })
    })

    it('should have hover transition classes on service cards', () => {
      const serviceCards = wrapper.findAll('.group')
      serviceCards.forEach((card) => {
        expect(card.classes()).toContain('transition')
        expect(card.classes()).toContain('hover:-translate-y-1')
        expect(card.classes()).toContain('hover:shadow-xl')
      })
    })

    it('should have hover background overlay', () => {
      const serviceCards = wrapper.findAll('.group')
      serviceCards.forEach((card) => {
        const overlay = card.find('.absolute.inset-0')
        expect(overlay.exists()).toBe(true)
        expect(overlay.classes()).toContain('group-hover:bg-slate-500/10')
      })
    })

    it('should have hover translate effect on CTA arrows', () => {
      const serviceCards = wrapper.findAll('.group')
      serviceCards.forEach((card) => {
        const ctaLink = card.find('a')
        expect(ctaLink.classes()).toContain('group-hover:translate-x-1')
      })
    })
  })

  describe('Responsive Behavior', () => {
    it('should have responsive grid classes', () => {
      const grid = wrapper.find('.mt-12.grid')
      expect(grid.classes()).toContain('md:grid-cols-2')
    })

    it('should have responsive heading sizes', () => {
      const heading = wrapper.find('h2')
      expect(heading.classes()).toContain('text-4xl')
      expect(heading.classes()).toContain('md:text-5xl')
      expect(heading.classes()).toContain('lg:text-6xl')
    })

    it('should have responsive subtitle text size', () => {
      const subtitle = wrapper.find('p.mt-4')
      expect(subtitle.classes()).toContain('text-sm')
      expect(subtitle.classes()).toContain('md:text-base')
    })

    it('should have responsive header layout', () => {
      const headerDiv = wrapper.find('.flex.flex-col')
      expect(headerDiv.classes()).toContain('md:flex-row')
      expect(headerDiv.classes()).toContain('md:items-center')
      expect(headerDiv.classes()).toContain('md:justify-between')
    })

    it('should have responsive padding', () => {
      const section = wrapper.find('section')
      expect(section.classes()).toContain('py-20')
      expect(section.classes()).toContain('md:py-28')
    })
  })

  describe('Accessibility', () => {
    it('should have semantic section element', () => {
      expect(wrapper.find('section').exists()).toBe(true)
    })

    it('should have proper heading hierarchy', () => {
      const h2 = wrapper.find('h2')
      const h3s = wrapper.findAll('h3')

      expect(h2.exists()).toBe(true)
      expect(h3s.length).toBe(mockServices.length)
    })

    it('should have descriptive link text', () => {
      const allLinks = wrapper.findAll('a')

      allLinks.forEach((link) => {
        const text = link.text().trim()
        expect(text.length).toBeGreaterThan(0)
        expect(text).not.toBe('')
      })
    })

    it('should have container for content width', () => {
      const container = wrapper.find('.container')
      expect(container.exists()).toBe(true)
    })

    it('should have visible focus states on interactive elements', () => {
      const links = wrapper.findAll('a')
      links.forEach((link) => {
        expect(link.classes()).toContain('transition')
      })
    })
  })

  describe('Styling and Layout', () => {
    it('should apply dark mode classes', () => {
      const section = wrapper.find('section')
      expect(section.classes()).toContain('dark:bg-gray-950')

      const serviceCards = wrapper.findAll('.group')
      serviceCards.forEach((card) => {
        expect(card.classes()).toContain('dark:border-gray-800')
        expect(card.classes()).toContain('dark:bg-gray-900')
      })
    })

    it('should have rounded corners on service cards', () => {
      const serviceCards = wrapper.findAll('.group')
      serviceCards.forEach((card) => {
        expect(card.classes()).toContain('rounded-3xl')
      })
    })

    it('should have proper spacing between elements', () => {
      const grid = wrapper.find('.grid')
      expect(grid.classes()).toContain('gap-6')
      expect(grid.classes()).toContain('mt-12')
    })

    it('should have icon badge styling', () => {
      const iconBadges = wrapper.findAll('.inline-flex.items-center.justify-center')
      iconBadges.forEach((badge) => {
        expect(badge.classes()).toContain('rounded-xl')
        expect(badge.classes()).toContain('bg-slate-100')
      })
    })
  })

  describe('i18n Integration', () => {
    it('should use i18n for title', () => {
      const title = wrapper.find('h2')
      expect(title.text()).toBe('home.services.title')
    })

    it('should use i18n for subtitle', () => {
      const subtitle = wrapper.find('p')
      expect(subtitle.text()).toBe('home.services.subtitle')
    })

    it('should use i18n for contact CTA', () => {
      const cta = wrapper.findAll('a').at(0)
      expect(cta?.text()).toContain('home.services.contactCta')
    })

    it('should use localePath for contact link', () => {
      const cta = wrapper.findAll('a').at(0)
      expect(cta?.attributes('href')).toBe('/contact')
    })
  })

  describe('Edge Cases', () => {
    it('should handle services with long titles', () => {
      const longTitleServices = [
        {
          ...mockServices[0],
          title: 'Very Long Service Title That Should Wrap Properly On Mobile Devices And Not Break Layout',
        },
      ]

      const longTitleWrapper = mount(ServicesSection, {
        props: {
          services: longTitleServices,
        },
        global: {
          stubs: {
            NuxtLink: {
              template: '<a :href="to"><slot /></a>',
              props: ['to'],
            },
            commonIcon: {
              template: '<span :data-icon="name"></span>',
              props: ['name'],
            },
          },
        },
      })

      const title = longTitleWrapper.find('h3')
      expect(title.text()).toBe(longTitleServices[0].title)
    })

    it('should handle services with long descriptions', () => {
      const longDescServices = [
        {
          ...mockServices[0],
          description: 'This is a very long description that should wrap properly and maintain good readability across all device sizes without breaking the card layout or causing overflow issues.',
        },
      ]

      const longDescWrapper = mount(ServicesSection, {
        props: {
          services: longDescServices,
        },
        global: {
          stubs: {
            NuxtLink: {
              template: '<a :href="to"><slot /></a>',
              props: ['to'],
            },
            commonIcon: {
              template: '<span :data-icon="name"></span>',
              props: ['name'],
            },
          },
        },
      })

      const description = longDescWrapper.findAll('.group p').find(p => p.text() === longDescServices[0].description)
      expect(description?.text()).toBe(longDescServices[0].description)
    })

    it('should handle special characters in service data', () => {
      const specialCharServices = [
        {
          title: 'Service & Solutions',
          description: 'Handle packages <5kg with "care"',
          cta: 'Learn More →',
          href: '/services/special',
          icon: 'lucide:package',
        },
      ]

      const specialCharWrapper = mount(ServicesSection, {
        props: {
          services: specialCharServices,
        },
        global: {
          stubs: {
            NuxtLink: {
              template: '<a :href="to"><slot /></a>',
              props: ['to'],
            },
            commonIcon: {
              template: '<span :data-icon="name"></span>',
              props: ['name'],
            },
          },
        },
      })

      const title = specialCharWrapper.find('h3')
      expect(title.text()).toContain('&')
    })
  })
})
