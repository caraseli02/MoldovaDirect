import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import FaqPreviewSection from '~/components/home/FaqPreviewSection.vue'

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

describe('Home FaqPreviewSection', () => {
  const mockItems = [
    {
      question: 'How long does shipping take?',
      answer: 'Standard shipping takes 5-7 business days, while express shipping is 2-3 business days.',
    },
    {
      question: 'What are the shipping costs?',
      answer: 'Shipping costs depend on package weight and destination. Check our calculator for exact pricing.',
    },
    {
      question: 'Can I track my package?',
      answer: 'Yes, all packages include real-time tracking from warehouse to your door.',
    },
    {
      question: 'Do you handle customs?',
      answer: 'We handle all customs paperwork and clearance for a seamless experience.',
    },
  ]

  let wrapper: ReturnType<typeof mount>

  beforeEach(() => {
    wrapper = mount(FaqPreviewSection, {
      props: {
        items: mockItems,
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
      expect(title.text()).toBe('home.faqPreview.title')
    })

    it('should render subtitle', () => {
      const subtitle = wrapper.find('p')
      expect(subtitle.text()).toBe('home.faqPreview.subtitle')
    })

    it('should render all FAQ items as details elements', () => {
      const faqItems = wrapper.findAll('details')
      expect(faqItems).toHaveLength(mockItems.length)
    })

    it('should render questions as summary elements', () => {
      const summaries = wrapper.findAll('summary')
      expect(summaries).toHaveLength(mockItems.length)

      summaries.forEach((summary, index) => {
        expect(summary.text()).toContain(mockItems[index].question)
      })
    })

    it('should render answers', () => {
      const answers = wrapper.findAll('details p')
      expect(answers).toHaveLength(mockItems.length)

      answers.forEach((answer, index) => {
        expect(answer.text()).toBe(mockItems[index].answer)
      })
    })

    it('should render chevron icons in summaries', () => {
      const icons = wrapper.findAll('summary [data-icon]')
      expect(icons).toHaveLength(mockItems.length)

      icons.forEach((icon) => {
        expect(icon.attributes('data-icon')).toBe('lucide:chevron-down')
      })
    })

    it('should render CTA link to FAQ page', () => {
      const ctaLink = wrapper.find('a[href="/faq"]')
      expect(ctaLink.exists()).toBe(true)
      expect(ctaLink.text()).toContain('home.faqPreview.cta')
    })

    it('should render arrow icon in CTA', () => {
      const ctaIcon = wrapper.find('a[href="/faq"] [data-icon]')
      expect(ctaIcon.attributes('data-icon')).toBe('lucide:arrow-right')
    })
  })

  describe('Props Handling', () => {
    it('should accept items prop', () => {
      expect(wrapper.props('items')).toEqual(mockItems)
    })

    it('should handle empty items array', () => {
      const emptyWrapper = mount(FaqPreviewSection, {
        props: {
          items: [],
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

      const faqItems = emptyWrapper.findAll('details')
      expect(faqItems).toHaveLength(0)
    })

    it('should handle single item', () => {
      const singleItemWrapper = mount(FaqPreviewSection, {
        props: {
          items: [mockItems[0]],
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

      const faqItems = singleItemWrapper.findAll('details')
      expect(faqItems).toHaveLength(1)
    })

    it('should handle odd number of items', () => {
      const oddItemsWrapper = mount(FaqPreviewSection, {
        props: {
          items: mockItems.slice(0, 3),
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

      const faqItems = oddItemsWrapper.findAll('details')
      expect(faqItems).toHaveLength(3)
    })
  })

  describe('User Interactions', () => {
    it('should have clickable summary elements', () => {
      const summaries = wrapper.findAll('summary')
      summaries.forEach((summary) => {
        expect(summary.classes()).toContain('cursor-pointer')
      })
    })

    it('should have hover transition on FAQ items', () => {
      const faqItems = wrapper.findAll('details')
      faqItems.forEach((item) => {
        expect(item.classes()).toContain('transition')
        expect(item.classes()).toContain('hover:-translate-y-1')
        expect(item.classes()).toContain('hover:shadow-lg')
      })
    })

    it('should have group class for CSS state targeting', () => {
      const faqItems = wrapper.findAll('details')
      faqItems.forEach((item) => {
        expect(item.classes()).toContain('group')
      })
    })

    it('should have rotate transition on chevron icons', () => {
      const icons = wrapper.findAll('summary [data-icon]')
      icons.forEach((icon) => {
        expect(icon.classes()).toContain('transition')
        expect(icon.classes()).toContain('group-open:rotate-180')
      })
    })

    it('should show open state styling', () => {
      const faqItems = wrapper.findAll('details')
      faqItems.forEach((item) => {
        expect(item.classes()).toContain('open:border-primary-300')
        expect(item.classes()).toContain('open:bg-primary-50/30')
      })
    })

    it('should have clickable CTA button', () => {
      const ctaLink = wrapper.find('a[href="/faq"]')
      expect(ctaLink.exists()).toBe(true)
      expect(ctaLink.classes()).toContain('transition')
      expect(ctaLink.classes()).toContain('hover:bg-primary-700')
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

    it('should use native details/summary elements for disclosure', () => {
      expect(wrapper.findAll('details').length).toBe(mockItems.length)
      expect(wrapper.findAll('summary').length).toBe(mockItems.length)
    })

    it('should have proper heading hierarchy', () => {
      const h2 = wrapper.find('h2')
      expect(h2.exists()).toBe(true)
    })

    it('should have container for content width', () => {
      const container = wrapper.find('.container')
      expect(container.exists()).toBe(true)
    })

    it('should have centered header content', () => {
      const headerDiv = wrapper.find('.mx-auto.max-w-3xl.text-center')
      expect(headerDiv.exists()).toBe(true)
    })

    it('should have descriptive link text for CTA', () => {
      const ctaLink = wrapper.find('a[href="/faq"]')
      expect(ctaLink.text()).toContain('home.faqPreview.cta')
    })

    it('should have text-left alignment for questions', () => {
      const summaries = wrapper.findAll('summary')
      summaries.forEach((summary) => {
        expect(summary.classes()).toContain('text-left')
      })
    })
  })

  describe('Styling and Layout', () => {
    it('should apply dark mode classes', () => {
      const section = wrapper.find('section')
      expect(section.classes()).toContain('dark:bg-gray-950')

      const faqItems = wrapper.findAll('details')
      faqItems.forEach((item) => {
        expect(item.classes()).toContain('dark:border-gray-800')
        expect(item.classes()).toContain('dark:bg-gray-900')
      })
    })

    it('should have rounded corners on FAQ items', () => {
      const faqItems = wrapper.findAll('details')
      faqItems.forEach((item) => {
        expect(item.classes()).toContain('rounded-3xl')
      })
    })

    it('should have proper spacing between elements', () => {
      const grid = wrapper.find('.grid')
      expect(grid.classes()).toContain('gap-6')
      expect(grid.classes()).toContain('mt-12')
    })

    it('should have border styling on FAQ items', () => {
      const faqItems = wrapper.findAll('details')
      faqItems.forEach((item) => {
        expect(item.classes()).toContain('border')
        expect(item.classes()).toContain('border-gray-200')
      })
    })

    it('should have CTA button styling', () => {
      const ctaLink = wrapper.find('a[href="/faq"]')
      expect(ctaLink.classes()).toContain('bg-primary-600')
      expect(ctaLink.classes()).toContain('text-white')
      expect(ctaLink.classes()).toContain('rounded-full')
      expect(ctaLink.classes()).toContain('font-semibold')
    })

    it('should center CTA in section', () => {
      const ctaContainer = wrapper.find('.mt-12.text-center')
      expect(ctaContainer.exists()).toBe(true)
    })

    it('should have proper text color for answers', () => {
      const answers = wrapper.findAll('details p')
      answers.forEach((answer) => {
        expect(answer.classes()).toContain('text-gray-600')
        expect(answer.classes()).toContain('dark:text-gray-400')
      })
    })
  })

  describe('i18n Integration', () => {
    it('should use i18n for title', () => {
      const title = wrapper.find('h2')
      expect(title.text()).toBe('home.faqPreview.title')
    })

    it('should use i18n for subtitle', () => {
      const subtitle = wrapper.find('p')
      expect(subtitle.text()).toBe('home.faqPreview.subtitle')
    })

    it('should use i18n for CTA text', () => {
      const cta = wrapper.find('a[href="/faq"]')
      expect(cta.text()).toContain('home.faqPreview.cta')
    })

    it('should use localePath for FAQ link', () => {
      const cta = wrapper.find('a[href="/faq"]')
      expect(cta.attributes('href')).toBe('/faq')
    })
  })

  describe('Edge Cases', () => {
    it('should handle FAQs with long questions', () => {
      const longQuestionItems = [
        {
          question: 'This is a very long question that might wrap across multiple lines on mobile devices and should still maintain good readability?',
          answer: 'Short answer',
        },
      ]

      const longQuestionWrapper = mount(FaqPreviewSection, {
        props: {
          items: longQuestionItems,
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

      const summary = longQuestionWrapper.find('summary')
      expect(summary.text()).toContain(longQuestionItems[0].question)
    })

    it('should handle FAQs with long answers', () => {
      const longAnswerItems = [
        {
          question: 'Short question?',
          answer: 'This is a very long answer that contains a lot of detailed information about the topic. It should wrap properly and maintain good readability across all device sizes without breaking the layout or causing overflow issues. The answer might span multiple lines and paragraphs.',
        },
      ]

      const longAnswerWrapper = mount(FaqPreviewSection, {
        props: {
          items: longAnswerItems,
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

      const answer = longAnswerWrapper.find('details p')
      expect(answer.text()).toBe(longAnswerItems[0].answer)
    })

    it('should handle special characters in FAQ data', () => {
      const specialCharItems = [
        {
          question: 'What about items <5kg & "fragile"?',
          answer: 'We handle packages <10kg with "special" care & attention.',
        },
      ]

      const specialCharWrapper = mount(FaqPreviewSection, {
        props: {
          items: specialCharItems,
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

      const summary = specialCharWrapper.find('summary')
      expect(summary.text()).toContain('&')
      expect(summary.text()).toContain('"')
    })

    it('should handle HTML-like content in answers', () => {
      const htmlContentItems = [
        {
          question: 'Test question?',
          answer: 'Answer with <strong>bold</strong> and <em>italic</em> text.',
        },
      ]

      const htmlWrapper = mount(FaqPreviewSection, {
        props: {
          items: htmlContentItems,
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

      const answer = htmlWrapper.find('details p')
      // Text content should escape HTML tags
      expect(answer.text()).toContain('<strong>')
    })

    it('should handle duplicate questions gracefully', () => {
      const duplicateItems = [
        { question: 'Same question?', answer: 'Answer 1' },
        { question: 'Same question?', answer: 'Answer 2' },
      ]

      const duplicateWrapper = mount(FaqPreviewSection, {
        props: {
          items: duplicateItems,
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

      const faqItems = duplicateWrapper.findAll('details')
      expect(faqItems).toHaveLength(2)
    })

    it('should handle empty strings in items', () => {
      const emptyStringItems = [
        { question: '', answer: 'Answer' },
        { question: 'Question', answer: '' },
      ]

      const emptyStringWrapper = mount(FaqPreviewSection, {
        props: {
          items: emptyStringItems,
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

      const faqItems = emptyStringWrapper.findAll('details')
      expect(faqItems).toHaveLength(2)
    })
  })

  describe('Native Details/Summary Behavior', () => {
    it('should allow details to be toggled', () => {
      const details = wrapper.find('details')

      // Initially closed
      expect(details.attributes('open')).toBeUndefined()

      // The native details element can be toggled (testing the structure exists)
      expect(details.exists()).toBe(true)
      expect(details.find('summary').exists()).toBe(true)
    })

    it('should have proper flex layout in summary', () => {
      const summaries = wrapper.findAll('summary')
      summaries.forEach((summary) => {
        expect(summary.classes()).toContain('flex')
        expect(summary.classes()).toContain('items-center')
        expect(summary.classes()).toContain('justify-between')
      })
    })

    it('should show answer with proper spacing when opened', () => {
      const answers = wrapper.findAll('details p')
      answers.forEach((answer) => {
        expect(answer.classes()).toContain('mt-4')
      })
    })
  })
})
