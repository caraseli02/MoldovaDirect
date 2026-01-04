/**
 * Tests for EditorialStories component
 *
 * Component: components/product/EditorialStories.vue
 * Purpose: Displays a section of editorial stories with cards featuring
 *          tags, titles, descriptions, and CTA buttons
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import EditorialStories from '~/components/product/EditorialStories.vue'

interface Story {
  id: string
  title: string
  description: string
  tag: string
}

describe('EditorialStories', () => {
  let wrapper: VueWrapper

  // Mock data
  const mockStories: Story[] = [
    {
      id: '1',
      title: 'The Art of Wine Tasting',
      description: 'Learn the secrets of professional sommeliers',
      tag: 'Guide',
    },
    {
      id: '2',
      title: 'Seasonal Wine Pairings',
      description: 'Perfect wines for every season and occasion',
      tag: 'Pairings',
    },
    {
      id: '3',
      title: 'Vineyard Adventures',
      description: 'Explore the most beautiful wine regions',
      tag: 'Travel',
    },
  ]

  const defaultProps = {
    title: 'Featured Stories',
    subtitle: 'Discover wine culture and traditions',
    ctaText: 'Read More',
    stories: mockStories,
  }

  // Helper function to create wrapper with default props
  const createWrapper = (props = {}) => {
    return mount(EditorialStories, {
      props: {
        ...defaultProps,
        ...props,
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render the component', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      expect(wrapper.exists()).toBe(true)
    })

    it('should render as a section element', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      expect(wrapper.find('section').exists()).toBe(true)
    })

    it('should display the title', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      expect(wrapper.text()).toContain('Featured Stories')
    })

    it('should display the subtitle', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      expect(wrapper.text()).toContain('Discover wine culture and traditions')
    })

    it('should display all story cards', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      const articles = wrapper.findAll('article')
      expect(articles.length).toBe(mockStories.length)
    })

    it('should display story titles', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      expect(wrapper.text()).toContain('The Art of Wine Tasting')
      expect(wrapper.text()).toContain('Seasonal Wine Pairings')
      expect(wrapper.text()).toContain('Vineyard Adventures')
    })

    it('should display story descriptions', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      expect(wrapper.text()).toContain('Learn the secrets of professional sommeliers')
      expect(wrapper.text()).toContain('Perfect wines for every season and occasion')
      expect(wrapper.text()).toContain('Explore the most beautiful wine regions')
    })

    it('should display story tags', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      expect(wrapper.text()).toContain('Guide')
      expect(wrapper.text()).toContain('Pairings')
      expect(wrapper.text()).toContain('Travel')
    })

    it('should display CTA buttons for each story', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      const buttons = wrapper.findAll('button')
      expect(buttons.length).toBe(mockStories.length)
    })

    it('should display CTA text on buttons', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      const buttons = wrapper.findAll('button')
      buttons.forEach((button) => {
        expect(button.text()).toContain('Read More')
      })
    })
  })

  describe('Props Validation', () => {
    it('should accept title prop', () => {
      // Arrange & Act
      wrapper = createWrapper({ title: 'Custom Title' })

      // Assert
      expect(wrapper.props('title')).toBe('Custom Title')
      expect(wrapper.text()).toContain('Custom Title')
    })

    it('should accept subtitle prop', () => {
      // Arrange & Act
      wrapper = createWrapper({ subtitle: 'Custom Subtitle' })

      // Assert
      expect(wrapper.props('subtitle')).toBe('Custom Subtitle')
      expect(wrapper.text()).toContain('Custom Subtitle')
    })

    it('should accept ctaText prop', () => {
      // Arrange & Act
      wrapper = createWrapper({ ctaText: 'Learn More' })

      // Assert
      expect(wrapper.props('ctaText')).toBe('Learn More')
      expect(wrapper.text()).toContain('Learn More')
    })

    it('should accept stories prop', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      expect(wrapper.props('stories')).toEqual(mockStories)
    })
  })

  describe('Story Cards', () => {
    it('should render story tags with badge styling', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      const tags = wrapper.findAll('.bg-blue-100')
      expect(tags.length).toBe(mockStories.length)
    })

    it('should have proper card structure', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      const articles = wrapper.findAll('article')
      articles.forEach((article) => {
        expect(article.find('h4').exists()).toBe(true)
        expect(article.find('p').exists()).toBe(true)
        expect(article.find('button').exists()).toBe(true)
      })
    })

    it('should have arrow indicator in CTA buttons', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      const buttons = wrapper.findAll('button')
      buttons.forEach((button) => {
        expect(button.text()).toContain('→')
      })
    })

    it('should use story id as key', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert - verify articles are rendered correctly
      const articles = wrapper.findAll('article')
      expect(articles.length).toBe(3)
    })
  })

  describe('Layout', () => {
    it('should use grid layout for stories', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      const grid = wrapper.find('.grid')
      expect(grid.exists()).toBe(true)
    })

    it('should have 3 columns on medium screens', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      const grid = wrapper.find('.md\\:grid-cols-3')
      expect(grid.exists()).toBe(true)
    })

    it('should have gap between cards', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      const grid = wrapper.find('.gap-4')
      expect(grid.exists()).toBe(true)
    })
  })

  describe('Styling', () => {
    it('should have section with border and rounded corners', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      const section = wrapper.find('section')
      expect(section.classes()).toContain('rounded-2xl')
      expect(section.classes()).toContain('border')
    })

    it('should have shadow on section', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      const section = wrapper.find('section')
      expect(section.classes()).toContain('shadow-sm')
    })

    it('should have hover effect on cards', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      const articles = wrapper.findAll('article')
      articles.forEach((article) => {
        expect(article.classes()).toContain('hover:-translate-y-1')
        expect(article.classes()).toContain('hover:shadow-lg')
      })
    })

    it('should have transition on cards', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      const articles = wrapper.findAll('article')
      articles.forEach((article) => {
        expect(article.classes()).toContain('transition')
      })
    })

    it('should have gradient background on cards', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      const articles = wrapper.findAll('article')
      articles.forEach((article) => {
        expect(article.classes()).toContain('bg-gradient-to-br')
      })
    })
  })

  describe('Dark Mode Support', () => {
    it('should have dark mode classes on section', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      const section = wrapper.find('section')
      expect(section.classes().join(' ')).toMatch(/dark:/)
    })

    it('should have dark mode classes on title', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      const title = wrapper.find('h3')
      expect(title.classes().join(' ')).toMatch(/dark:/)
    })

    it('should have dark mode classes on tags', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      const tags = wrapper.findAll('.dark\\:bg-blue-900\\/60')
      expect(tags.length).toBeGreaterThan(0)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty stories array', () => {
      // Arrange & Act
      wrapper = createWrapper({ stories: [] })

      // Assert
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.findAll('article').length).toBe(0)
    })

    it('should handle single story', () => {
      // Arrange & Act
      wrapper = createWrapper({ stories: [mockStories[0]] })

      // Assert
      expect(wrapper.findAll('article').length).toBe(1)
    })

    it('should handle many stories', () => {
      // Arrange
      const manyStories = Array.from({ length: 10 }, (_, i) => ({
        id: String(i),
        title: `Story ${i}`,
        description: `Description ${i}`,
        tag: `Tag ${i}`,
      }))

      // Act
      wrapper = createWrapper({ stories: manyStories })

      // Assert
      expect(wrapper.findAll('article').length).toBe(10)
    })

    it('should handle long title text', () => {
      // Arrange
      const longTitleStory = [{
        id: '1',
        title: 'This is a very long title that should be displayed correctly without breaking the layout',
        description: 'Description',
        tag: 'Tag',
      }]

      // Act
      wrapper = createWrapper({ stories: longTitleStory })

      // Assert
      expect(wrapper.text()).toContain('This is a very long title')
    })

    it('should handle special characters in content', () => {
      // Arrange
      const specialStory = [{
        id: '1',
        title: 'Côtes du Rhône & Bordeaux',
        description: 'Explore French wines with élégance',
        tag: 'Château',
      }]

      // Act
      wrapper = createWrapper({ stories: specialStory })

      // Assert
      expect(wrapper.text()).toContain('Côtes du Rhône & Bordeaux')
      expect(wrapper.text()).toContain('élégance')
      expect(wrapper.text()).toContain('Château')
    })
  })

  describe('Accessibility', () => {
    it('should use semantic article elements for stories', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      const articles = wrapper.findAll('article')
      expect(articles.length).toBe(mockStories.length)
    })

    it('should use heading hierarchy (h3 for section, h4 for cards)', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      expect(wrapper.find('h3').exists()).toBe(true)
      expect(wrapper.findAll('h4').length).toBe(mockStories.length)
    })

    it('should have button elements for CTAs', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      const buttons = wrapper.findAll('button[type="button"]')
      expect(buttons.length).toBe(mockStories.length)
    })

    it('should have aria-hidden on decorative arrow', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      const arrows = wrapper.findAll('[aria-hidden="true"]')
      expect(arrows.length).toBe(mockStories.length)
    })
  })

  describe('Typography', () => {
    it('should have semibold title', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      const title = wrapper.find('h3')
      expect(title.classes()).toContain('font-semibold')
    })

    it('should have semibold story titles', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      const storyTitles = wrapper.findAll('h4')
      storyTitles.forEach((title) => {
        expect(title.classes()).toContain('font-semibold')
      })
    })

    it('should have semibold tags', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      const tags = wrapper.findAll('.font-semibold.uppercase')
      expect(tags.length).toBe(mockStories.length)
    })

    it('should use text-xl for main title', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      const title = wrapper.find('h3')
      expect(title.classes()).toContain('text-xl')
    })

    it('should use text-lg for story titles', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      const storyTitles = wrapper.findAll('h4')
      storyTitles.forEach((title) => {
        expect(title.classes()).toContain('text-lg')
      })
    })
  })
})
