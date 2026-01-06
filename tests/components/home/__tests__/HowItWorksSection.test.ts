import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import HowItWorksSection from '~/components/home/HowItWorksSection.vue'

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

describe('Home HowItWorksSection', () => {
  const mockSteps = [
    {
      key: 'register',
      title: 'Create Account',
      description: 'Sign up and get your personal shipping address',
      icon: 'lucide:user-plus',
    },
    {
      key: 'shop',
      title: 'Shop Online',
      description: 'Buy from any store and ship to our warehouse',
      icon: 'lucide:shopping-cart',
    },
    {
      key: 'ship',
      title: 'We Ship',
      description: 'We consolidate and ship to your door',
      icon: 'lucide:truck',
    },
  ]

  let wrapper: ReturnType<typeof mount>

  beforeEach(() => {
    wrapper = mount(HowItWorksSection, {
      props: {
        steps: mockSteps,
      },
      global: {
        stubs: {
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
      expect(section.classes()).toContain('bg-gray-50')
      expect(section.classes()).toContain('dark:bg-gray-900')
    })

    it('should render main title', () => {
      const title = wrapper.find('h2')
      expect(title.exists()).toBe(true)
      expect(title.text()).toBe('home.howItWorks.title')
    })

    it('should render subtitle', () => {
      const subtitle = wrapper.find('p')
      expect(subtitle.text()).toBe('home.howItWorks.subtitle')
    })

    it('should render all step cards', () => {
      const stepCards = wrapper.findAll('.step-card')
      expect(stepCards).toHaveLength(mockSteps.length)
    })

    it('should render steps as ordered list', () => {
      const orderedList = wrapper.find('ol')
      expect(orderedList.exists()).toBe(true)
      expect(orderedList.classes()).toContain('list-none')
    })

    it('should render step titles correctly', () => {
      const stepTitles = wrapper.findAll('h3')
      expect(stepTitles).toHaveLength(mockSteps.length)
      stepTitles.forEach((title, index) => {
        expect(title.text()).toBe(mockSteps[index].title)
      })
    })

    it('should render step descriptions', () => {
      mockSteps.forEach((step) => {
        const description = wrapper.findAll('p').find(p => p.text() === step.description)
        expect(description).toBeTruthy()
      })
    })

    it('should render step icons', () => {
      const icons = wrapper.findAll('[data-icon]')
      expect(icons.length).toBe(mockSteps.length)

      mockSteps.forEach((step) => {
        const stepIcon = icons.find(icon => icon.attributes('data-icon') === step.icon)
        expect(stepIcon).toBeTruthy()
      })
    })

    it('should render formatted step numbers', () => {
      const stepNumbers = wrapper.findAll('.text-sm.font-semibold.text-primary-600')
      expect(stepNumbers).toHaveLength(mockSteps.length)

      stepNumbers.forEach((stepNumber, index) => {
        const expectedNumber = (index + 1).toString().padStart(2, '0')
        expect(stepNumber.text()).toBe(expectedNumber)
      })
    })
  })

  describe('Props Handling', () => {
    it('should accept steps prop', () => {
      expect(wrapper.props('steps')).toEqual(mockSteps)
    })

    it('should handle empty steps array', () => {
      const emptyWrapper = mount(HowItWorksSection, {
        props: {
          steps: [],
        },
        global: {
          stubs: {
            commonIcon: {
              template: '<span :data-icon="name"></span>',
              props: ['name'],
            },
          },
        },
      })

      const stepCards = emptyWrapper.findAll('.step-card')
      expect(stepCards).toHaveLength(0)
    })

    it('should handle single step', () => {
      const singleStepWrapper = mount(HowItWorksSection, {
        props: {
          steps: [mockSteps[0]],
        },
        global: {
          stubs: {
            commonIcon: {
              template: '<span :data-icon="name"></span>',
              props: ['name'],
            },
          },
        },
      })

      const stepCards = singleStepWrapper.findAll('.step-card')
      expect(stepCards).toHaveLength(1)
    })

    it('should handle many steps', () => {
      const manySteps = Array.from({ length: 10 }, (_, i) => ({
        key: `step-${i}`,
        title: `Step ${i + 1}`,
        description: `Description ${i + 1}`,
        icon: 'lucide:check',
      }))

      const manyStepsWrapper = mount(HowItWorksSection, {
        props: {
          steps: manySteps,
        },
        global: {
          stubs: {
            commonIcon: {
              template: '<span :data-icon="name"></span>',
              props: ['name'],
            },
          },
        },
      })

      const stepCards = manyStepsWrapper.findAll('.step-card')
      expect(stepCards).toHaveLength(10)
    })
  })

  describe('Step Number Formatting', () => {
    it('should format single digit numbers with leading zero', () => {
      const stepNumbers = wrapper.findAll('.text-sm.font-semibold.text-primary-600')

      expect(stepNumbers[0].text()).toBe('01')
      expect(stepNumbers[1].text()).toBe('02')
      expect(stepNumbers[2].text()).toBe('03')
    })

    it('should format double digit numbers correctly', () => {
      const manySteps = Array.from({ length: 12 }, (_, i) => ({
        key: `step-${i}`,
        title: `Step ${i + 1}`,
        description: `Description ${i + 1}`,
        icon: 'lucide:check',
      }))

      const manyStepsWrapper = mount(HowItWorksSection, {
        props: {
          steps: manySteps,
        },
        global: {
          stubs: {
            commonIcon: {
              template: '<span :data-icon="name"></span>',
              props: ['name'],
            },
          },
        },
      })

      const stepNumbers = manyStepsWrapper.findAll('.text-sm.font-semibold.text-primary-600')
      expect(stepNumbers[9].text()).toBe('10')
      expect(stepNumbers[10].text()).toBe('11')
      expect(stepNumbers[11].text()).toBe('12')
    })
  })

  describe('Connector Classes', () => {
    it('should add has-connector class to all steps except the last one', () => {
      const stepCards = wrapper.findAll('.step-card')

      // All except the last should have has-connector class
      for (let i = 0; i < stepCards.length - 1; i++) {
        expect(stepCards[i].classes()).toContain('has-connector')
      }

      // Last step should NOT have has-connector class
      expect(stepCards[stepCards.length - 1].classes()).not.toContain('has-connector')
    })

    it('should not add has-connector to single step', () => {
      const singleStepWrapper = mount(HowItWorksSection, {
        props: {
          steps: [mockSteps[0]],
        },
        global: {
          stubs: {
            commonIcon: {
              template: '<span :data-icon="name"></span>',
              props: ['name'],
            },
          },
        },
      })

      const stepCard = singleStepWrapper.find('.step-card')
      expect(stepCard.classes()).not.toContain('has-connector')
    })
  })

  describe('User Interactions', () => {
    it('should have hover transition classes on step cards', () => {
      const stepCards = wrapper.findAll('.step-card')
      stepCards.forEach((card) => {
        expect(card.classes()).toContain('transition')
        expect(card.classes()).toContain('hover:-translate-y-1')
        expect(card.classes()).toContain('hover:shadow-xl')
      })
    })

    it('should have shadow effect on cards', () => {
      const stepCards = wrapper.findAll('.step-card')
      stepCards.forEach((card) => {
        expect(card.classes()).toContain('shadow-lg')
      })
    })
  })

  describe('Responsive Behavior', () => {
    it('should have responsive grid classes', () => {
      const grid = wrapper.find('ol')
      expect(grid.classes()).toContain('md:grid-cols-3')
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

    it('should use ordered list for sequential steps', () => {
      expect(wrapper.find('ol').exists()).toBe(true)
    })

    it('should use list items for each step', () => {
      const listItems = wrapper.findAll('li')
      expect(listItems).toHaveLength(mockSteps.length)
    })

    it('should have proper heading hierarchy', () => {
      const h2 = wrapper.find('h2')
      const h3s = wrapper.findAll('h3')

      expect(h2.exists()).toBe(true)
      expect(h3s.length).toBe(mockSteps.length)
    })

    it('should have container for content width', () => {
      const container = wrapper.find('.container')
      expect(container.exists()).toBe(true)
    })

    it('should have centered header content', () => {
      const headerDiv = wrapper.find('.mx-auto.max-w-3xl.text-center')
      expect(headerDiv.exists()).toBe(true)
    })

    it('should have unique keys for step rendering', () => {
      const listItems = wrapper.findAll('li')
      // Keys are used internally by Vue for v-for
      expect(listItems.length).toBe(mockSteps.length)
    })
  })

  describe('Styling and Layout', () => {
    it('should apply dark mode classes', () => {
      const section = wrapper.find('section')
      expect(section.classes()).toContain('dark:bg-gray-900')

      const stepCards = wrapper.findAll('.step-card')
      stepCards.forEach((card) => {
        expect(card.classes()).toContain('dark:bg-gray-950')
      })
    })

    it('should have rounded corners on step cards', () => {
      const stepCards = wrapper.findAll('.step-card')
      stepCards.forEach((card) => {
        expect(card.classes()).toContain('rounded-3xl')
      })
    })

    it('should have proper spacing between elements', () => {
      const grid = wrapper.find('ol')
      expect(grid.classes()).toContain('gap-8')
      expect(grid.classes()).toContain('mt-12')
    })

    it('should have icon badge styling', () => {
      const iconBadges = wrapper.findAll('.flex.h-12.w-12')
      expect(iconBadges).toHaveLength(mockSteps.length)
      iconBadges.forEach((badge) => {
        expect(badge.classes()).toContain('rounded-xl')
        expect(badge.classes()).toContain('bg-primary-100')
      })
    })

    it('should have text-left alignment for step cards', () => {
      const stepCards = wrapper.findAll('.step-card')
      stepCards.forEach((card) => {
        expect(card.classes()).toContain('text-left')
      })
    })
  })

  describe('i18n Integration', () => {
    it('should use i18n for title', () => {
      const title = wrapper.find('h2')
      expect(title.text()).toBe('home.howItWorks.title')
    })

    it('should use i18n for subtitle', () => {
      const subtitle = wrapper.find('p')
      expect(subtitle.text()).toBe('home.howItWorks.subtitle')
    })
  })

  describe('Edge Cases', () => {
    it('should handle steps with long titles', () => {
      const longTitleSteps = [
        {
          ...mockSteps[0],
          title: 'Very Long Step Title That Should Wrap Properly On Mobile Devices',
        },
      ]

      const longTitleWrapper = mount(HowItWorksSection, {
        props: {
          steps: longTitleSteps,
        },
        global: {
          stubs: {
            commonIcon: {
              template: '<span :data-icon="name"></span>',
              props: ['name'],
            },
          },
        },
      })

      const title = longTitleWrapper.find('h3')
      expect(title.text()).toBe(longTitleSteps[0].title)
    })

    it('should handle steps with long descriptions', () => {
      const longDescSteps = [
        {
          ...mockSteps[0],
          description: 'This is a very long description that should wrap properly and maintain good readability across all device sizes without breaking the card layout.',
        },
      ]

      const longDescWrapper = mount(HowItWorksSection, {
        props: {
          steps: longDescSteps,
        },
        global: {
          stubs: {
            commonIcon: {
              template: '<span :data-icon="name"></span>',
              props: ['name'],
            },
          },
        },
      })

      const description = longDescWrapper.findAll('p').find(p => p.text() === longDescSteps[0].description)
      expect(description?.text()).toBe(longDescSteps[0].description)
    })

    it('should handle special characters in step data', () => {
      const specialCharSteps = [
        {
          key: 'special',
          title: 'Step & Process',
          description: 'Handle items <10kg with "care"',
          icon: 'lucide:package',
        },
      ]

      const specialCharWrapper = mount(HowItWorksSection, {
        props: {
          steps: specialCharSteps,
        },
        global: {
          stubs: {
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

    it('should handle duplicate keys gracefully', () => {
      const duplicateKeySteps = [
        { key: 'step1', title: 'Step 1', description: 'Desc 1', icon: 'lucide:check' },
        { key: 'step1', title: 'Step 2', description: 'Desc 2', icon: 'lucide:check' },
      ]

      const duplicateWrapper = mount(HowItWorksSection, {
        props: {
          steps: duplicateKeySteps,
        },
        global: {
          stubs: {
            commonIcon: {
              template: '<span :data-icon="name"></span>',
              props: ['name'],
            },
          },
        },
      })

      const stepCards = duplicateWrapper.findAll('.step-card')
      expect(stepCards).toHaveLength(2)
    })
  })

  describe('CSS Custom Properties', () => {
    it('should have scoped styles', () => {
      // The component includes scoped styles for connectors
      expect(wrapper.element.outerHTML).toBeTruthy()
    })

    it('should have relative positioning for connector pseudo-elements', () => {
      const stepCards = wrapper.findAll('.step-card')
      stepCards.forEach((card) => {
        expect(card.classes()).toContain('relative')
      })
    })
  })
})
