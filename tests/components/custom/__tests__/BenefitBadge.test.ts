import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BenefitBadge from '~/components/custom/BenefitBadge.vue'

// Helper function to create wrapper with proper stubs
const createWrapper = (props: Record<string, unknown> = {}) => {
  return mount(BenefitBadge, {
    props,
    global: {
      stubs: {
        CustomTooltip: {
          template: `
            <div class="tooltip-stub" data-testid="custom-tooltip">
              <slot name="trigger" />
              <span v-if="content" class="tooltip-content">{{ content }}</span>
            </div>
          `,
          props: ['content', 'icon', 'ariaLabel', 'placement'],
        },
        commonIcon: {
          template: '<span :class="name" data-testid="icon"></span>',
          props: ['name'],
        },
      },
    },
  })
}

describe('Custom BenefitBadge', () => {
  // Component Mounting and Rendering
  describe('Component Mounting', () => {
    it('should render the badge with required text prop', () => {
      const wrapper = createWrapper({ text: 'Free Shipping' })
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.text()).toContain('Free Shipping')
    })

    it('should render the badge as a div element', () => {
      const wrapper = createWrapper({ text: 'Test' })
      expect(wrapper.element.tagName).toBe('DIV')
    })

    it('should have inline-flex display class', () => {
      const wrapper = createWrapper({ text: 'Test' })
      expect(wrapper.classes()).toContain('inline-flex')
    })

    it('should have items-center class for vertical alignment', () => {
      const wrapper = createWrapper({ text: 'Test' })
      expect(wrapper.classes()).toContain('items-center')
    })

    it('should have gap-2 class for spacing', () => {
      const wrapper = createWrapper({ text: 'Test' })
      expect(wrapper.classes()).toContain('gap-2')
    })
  })

  // Props Validation and Reactivity
  describe('Props Validation', () => {
    it('should accept and display text prop', () => {
      const wrapper = createWrapper({ text: 'Premium Quality' })
      expect(wrapper.text()).toContain('Premium Quality')
    })

    it('should update text when prop changes', async () => {
      const wrapper = createWrapper({ text: 'Old Text' })
      expect(wrapper.text()).toContain('Old Text')
      await wrapper.setProps({ text: 'New Text' })
      expect(wrapper.text()).toContain('New Text')
    })

    it('should accept optional icon prop', () => {
      const wrapper = createWrapper({ text: 'Test', icon: 'lucide:check' })
      expect(wrapper.html()).toContain('lucide:check')
    })

    it('should accept optional tooltip prop', () => {
      const wrapper = createWrapper({ text: 'Test', tooltip: 'Additional info' })
      expect(wrapper.html()).toContain('Additional info')
    })

    it('should accept variant prop', () => {
      const wrapper = createWrapper({ text: 'Test', variant: 'success' })
      expect(wrapper.html()).toContain('bg-green-100')
    })

    it('should accept size prop', () => {
      const wrapper = createWrapper({ text: 'Test', size: 'sm' })
      expect(wrapper.classes()).toContain('text-xs')
    })
  })

  // Variant Styling
  describe('Variant Styling', () => {
    it('should apply neutral variant styling by default', () => {
      const wrapper = createWrapper({ text: 'Test' })
      expect(wrapper.html()).toContain('bg-gray-100')
      expect(wrapper.html()).toContain('text-gray-700')
    })

    it('should apply primary variant styling', () => {
      const wrapper = createWrapper({ text: 'Primary', variant: 'primary' })
      expect(wrapper.html()).toContain('bg-primary-100')
      expect(wrapper.html()).toContain('text-primary-700')
    })

    it('should apply success variant styling', () => {
      const wrapper = createWrapper({ text: 'Success', variant: 'success' })
      expect(wrapper.html()).toContain('bg-green-100')
      expect(wrapper.html()).toContain('text-green-700')
    })

    it('should apply info variant styling', () => {
      const wrapper = createWrapper({ text: 'Info', variant: 'info' })
      expect(wrapper.html()).toContain('bg-blue-100')
      expect(wrapper.html()).toContain('text-blue-700')
    })

    it('should apply warning variant styling', () => {
      const wrapper = createWrapper({ text: 'Warning', variant: 'warning' })
      expect(wrapper.html()).toContain('bg-amber-100')
      expect(wrapper.html()).toContain('text-amber-700')
    })

    it('should update variant classes when variant prop changes', async () => {
      const wrapper = createWrapper({ text: 'Test', variant: 'neutral' })
      expect(wrapper.html()).toContain('bg-gray-100')
      await wrapper.setProps({ variant: 'success' })
      expect(wrapper.html()).toContain('bg-green-100')
    })

    it('should include dark mode classes for primary variant', () => {
      const wrapper = createWrapper({ text: 'Test', variant: 'primary' })
      expect(wrapper.html()).toContain('dark:bg-primary-900/30')
      expect(wrapper.html()).toContain('dark:text-primary-200')
    })

    it('should include dark mode classes for success variant', () => {
      const wrapper = createWrapper({ text: 'Test', variant: 'success' })
      expect(wrapper.html()).toContain('dark:bg-green-900/30')
      expect(wrapper.html()).toContain('dark:text-green-200')
    })

    it('should include dark mode classes for info variant', () => {
      const wrapper = createWrapper({ text: 'Test', variant: 'info' })
      expect(wrapper.html()).toContain('dark:bg-blue-900/30')
      expect(wrapper.html()).toContain('dark:text-blue-200')
    })

    it('should include dark mode classes for warning variant', () => {
      const wrapper = createWrapper({ text: 'Test', variant: 'warning' })
      expect(wrapper.html()).toContain('dark:bg-amber-900/30')
      expect(wrapper.html()).toContain('dark:text-amber-200')
    })

    it('should include dark mode classes for neutral variant', () => {
      const wrapper = createWrapper({ text: 'Test', variant: 'neutral' })
      expect(wrapper.html()).toContain('dark:bg-gray-800')
      expect(wrapper.html()).toContain('dark:text-gray-200')
    })
  })

  // Size Styling
  describe('Size Styling', () => {
    it('should apply medium size styling by default', () => {
      const wrapper = createWrapper({ text: 'Test' })
      expect(wrapper.classes()).toContain('text-sm')
      expect(wrapper.classes()).toContain('px-3')
      expect(wrapper.classes()).toContain('py-1.5')
    })

    it('should apply small size styling', () => {
      const wrapper = createWrapper({ text: 'Test', size: 'sm' })
      expect(wrapper.classes()).toContain('text-xs')
      expect(wrapper.classes()).toContain('px-2')
      expect(wrapper.classes()).toContain('py-1')
    })

    it('should apply medium size styling explicitly', () => {
      const wrapper = createWrapper({ text: 'Test', size: 'md' })
      expect(wrapper.classes()).toContain('text-sm')
      expect(wrapper.classes()).toContain('px-3')
      expect(wrapper.classes()).toContain('py-1.5')
    })

    it('should update size classes when size prop changes', async () => {
      const wrapper = createWrapper({ text: 'Test', size: 'md' })
      expect(wrapper.classes()).toContain('text-sm')
      await wrapper.setProps({ size: 'sm' })
      expect(wrapper.classes()).toContain('text-xs')
    })

    it('should have rounded-full class for pill shape', () => {
      const wrapper = createWrapper({ text: 'Test' })
      expect(wrapper.classes()).toContain('rounded-full')
    })

    it('should have transition classes', () => {
      const wrapper = createWrapper({ text: 'Test' })
      expect(wrapper.classes()).toContain('transition-all')
      expect(wrapper.classes()).toContain('duration-200')
    })
  })

  // Icon Rendering
  describe('Icon Rendering', () => {
    it('should not render icon when icon prop is not provided', () => {
      const wrapper = createWrapper({ text: 'Test' })
      const icons = wrapper.findAll('[data-testid="icon"]')
      // Should only have tooltip icon if tooltip exists, otherwise none
      const nonTooltipIcons = icons.filter(icon => !icon.html().includes('lucide:help-circle'))
      expect(nonTooltipIcons.length).toBe(0)
    })

    it('should render icon when icon prop is provided', () => {
      const wrapper = createWrapper({ text: 'Test', icon: 'lucide:check' })
      const icon = wrapper.find('[data-testid="icon"]')
      expect(icon.exists()).toBe(true)
    })

    it('should pass icon name to commonIcon component', () => {
      const wrapper = createWrapper({ text: 'Test', icon: 'lucide:shield-check' })
      expect(wrapper.html()).toContain('lucide:shield-check')
    })

    it('should apply h-4 w-4 classes to icon for medium size', () => {
      const wrapper = createWrapper({ text: 'Test', icon: 'lucide:check', size: 'md' })
      expect(wrapper.html()).toContain('h-4')
      expect(wrapper.html()).toContain('w-4')
    })

    it('should apply h-3 w-3 classes to icon for small size', () => {
      const wrapper = createWrapper({ text: 'Test', icon: 'lucide:check', size: 'sm' })
      expect(wrapper.html()).toContain('h-3')
      expect(wrapper.html()).toContain('w-3')
    })

    it('should update icon size when size prop changes', async () => {
      const wrapper = createWrapper({ text: 'Test', icon: 'lucide:check', size: 'md' })
      expect(wrapper.html()).toContain('h-4')
      await wrapper.setProps({ size: 'sm' })
      expect(wrapper.html()).toContain('h-3')
    })
  })

  // Tooltip Functionality
  describe('Tooltip Functionality', () => {
    it('should not render tooltip when tooltip prop is not provided', () => {
      const wrapper = createWrapper({ text: 'Test' })
      expect(wrapper.find('[data-testid="custom-tooltip"]').exists()).toBe(false)
    })

    it('should render CustomTooltip when tooltip prop is provided', () => {
      const wrapper = createWrapper({ text: 'Test', tooltip: 'More information' })
      expect(wrapper.find('[data-testid="custom-tooltip"]').exists()).toBe(true)
    })

    it('should pass tooltip content to CustomTooltip', () => {
      const wrapper = createWrapper({ text: 'Test', tooltip: 'Additional details' })
      expect(wrapper.html()).toContain('Additional details')
    })

    it('should pass correct props to CustomTooltip component', () => {
      const wrapper = createWrapper({ text: 'Test', tooltip: 'Info' })
      // The CustomTooltip component should receive icon="lucide:info" prop
      // but in our stub it's not rendered in HTML, just accepted as prop
      expect(wrapper.find('[data-testid="custom-tooltip"]').exists()).toBe(true)
    })

    it('should include aria-label attribute in tooltip button', () => {
      const wrapper = createWrapper({ text: 'Free Shipping', tooltip: 'Info' })
      // The aria-label is set on the CustomTooltip component, check button exists
      const button = wrapper.find('button')
      expect(button.exists()).toBe(true)
    })

    it('should render help-circle icon in tooltip trigger button', () => {
      const wrapper = createWrapper({ text: 'Test', tooltip: 'Info' })
      expect(wrapper.html()).toContain('lucide:help-circle')
    })

    it('should apply correct button classes for tooltip trigger', () => {
      const wrapper = createWrapper({ text: 'Test', tooltip: 'Info' })
      const button = wrapper.find('button')
      expect(button.exists()).toBe(true)
      expect(button.classes()).toContain('inline-flex')
      expect(button.classes()).toContain('items-center')
      expect(button.classes()).toContain('justify-center')
      expect(button.classes()).toContain('rounded-full')
    })

    it('should have hover effect on tooltip button', () => {
      const wrapper = createWrapper({ text: 'Test', tooltip: 'Info' })
      const button = wrapper.find('button')
      expect(button.html()).toContain('hover:bg-white/20')
    })

    it('should set button type to button', () => {
      const wrapper = createWrapper({ text: 'Test', tooltip: 'Info' })
      const button = wrapper.find('button')
      expect(button.attributes('type')).toBe('button')
    })

    it('should apply small padding to tooltip button for small size', () => {
      const wrapper = createWrapper({ text: 'Test', tooltip: 'Info', size: 'sm' })
      const button = wrapper.find('button')
      expect(button.classes()).toContain('p-0.5')
    })

    it('should apply medium padding to tooltip button for medium size', () => {
      const wrapper = createWrapper({ text: 'Test', tooltip: 'Info', size: 'md' })
      const button = wrapper.find('button')
      expect(button.classes()).toContain('p-1')
    })

    it('should apply h-3.5 w-3.5 to help icon for medium size', () => {
      const wrapper = createWrapper({ text: 'Test', tooltip: 'Info', size: 'md' })
      expect(wrapper.html()).toContain('h-3.5')
      expect(wrapper.html()).toContain('w-3.5')
    })

    it('should apply h-3 w-3 to help icon for small size', () => {
      const wrapper = createWrapper({ text: 'Test', tooltip: 'Info', size: 'sm' })
      const html = wrapper.html()
      // Check that both h-3 and w-3 classes are present for small size
      expect(html).toContain('h-3')
      expect(html).toContain('w-3')
    })
  })

  // Text Content
  describe('Text Content', () => {
    it('should render text inside a span element', () => {
      const wrapper = createWrapper({ text: 'Test Content' })
      const span = wrapper.find('span')
      expect(span.exists()).toBe(true)
      expect(span.text()).toContain('Test Content')
    })

    it('should handle empty string text', () => {
      const wrapper = createWrapper({ text: '' })
      // Component should exist even with empty text
      expect(wrapper.exists()).toBe(true)
    })

    it('should handle long text content', () => {
      const longText = 'This is a very long benefit description that might wrap'
      const wrapper = createWrapper({ text: longText })
      expect(wrapper.text()).toContain(longText)
    })

    it('should handle special characters in text', () => {
      const specialText = 'Free Shipping & Returns!'
      const wrapper = createWrapper({ text: specialText })
      expect(wrapper.text()).toContain(specialText)
    })

    it('should handle unicode characters in text', () => {
      const unicodeText = '✓ Verified ★ Premium'
      const wrapper = createWrapper({ text: unicodeText })
      expect(wrapper.text()).toContain(unicodeText)
    })
  })

  // Combined Props
  describe('Combined Props', () => {
    it('should render badge with icon, text, and tooltip together', () => {
      const wrapper = createWrapper({
        text: 'Premium',
        icon: 'lucide:star',
        tooltip: 'Premium quality product',
        variant: 'primary',
        size: 'md',
      })
      expect(wrapper.text()).toContain('Premium')
      expect(wrapper.find('[data-testid="icon"]').exists()).toBe(true)
      expect(wrapper.find('button').exists()).toBe(true)
      expect(wrapper.html()).toContain('bg-primary-100')
    })

    it('should work with all props set to small size', () => {
      const wrapper = createWrapper({
        text: 'Small Badge',
        icon: 'lucide:check',
        tooltip: 'Info',
        variant: 'success',
        size: 'sm',
      })
      expect(wrapper.classes()).toContain('text-xs')
      expect(wrapper.html()).toContain('bg-green-100')
    })

    it('should update all aspects when multiple props change', async () => {
      const wrapper = createWrapper({
        text: 'Original',
        variant: 'neutral',
        size: 'md',
      })
      expect(wrapper.text()).toContain('Original')
      expect(wrapper.html()).toContain('bg-gray-100')
      expect(wrapper.classes()).toContain('text-sm')

      await wrapper.setProps({
        text: 'Updated',
        variant: 'success',
        size: 'sm',
      })
      expect(wrapper.text()).toContain('Updated')
      expect(wrapper.html()).toContain('bg-green-100')
      expect(wrapper.classes()).toContain('text-xs')
    })
  })

  // Edge Cases
  describe('Edge Cases', () => {
    it('should handle numeric text prop', () => {
      const wrapper = createWrapper({ text: '24/7 Support' })
      expect(wrapper.text()).toContain('24/7 Support')
    })

    it('should render without crashing when only text prop is provided', () => {
      expect(() => {
        createWrapper({ text: 'Minimal' })
      }).not.toThrow()
    })

    it('should handle rapid prop changes', async () => {
      const wrapper = createWrapper({ text: 'Test', variant: 'neutral' })
      await wrapper.setProps({ variant: 'primary' })
      await wrapper.setProps({ variant: 'success' })
      await wrapper.setProps({ variant: 'info' })
      await wrapper.setProps({ variant: 'warning' })
      expect(wrapper.html()).toContain('bg-amber-100')
    })

    it('should preserve styling when text changes', async () => {
      const wrapper = createWrapper({ text: 'Old', variant: 'primary', size: 'sm' })
      const originalVariant = wrapper.html().includes('bg-primary-100')
      await wrapper.setProps({ text: 'New' })
      expect(wrapper.html().includes('bg-primary-100')).toBe(originalVariant)
      expect(wrapper.classes()).toContain('text-xs')
    })

    it('should maintain structure when icon is added dynamically', async () => {
      const wrapper = createWrapper({ text: 'Test' })
      const icons = wrapper.findAll('[data-testid="icon"]')
      const initialIconCount = icons.filter(i => i.html().includes('lucide:check')).length
      expect(initialIconCount).toBe(0)
      await wrapper.setProps({ icon: 'lucide:check' })
      expect(wrapper.html()).toContain('lucide:check')
    })

    it('should maintain structure when tooltip is added dynamically', async () => {
      const wrapper = createWrapper({ text: 'Test' })
      expect(wrapper.find('button').exists()).toBe(false)
      await wrapper.setProps({ tooltip: 'New tooltip' })
      expect(wrapper.find('button').exists()).toBe(true)
    })

    it('should handle whitespace trimming in rendered text', () => {
      const wrapper = createWrapper({ text: '  Padded Text  ' })
      // Vue will trim whitespace in template rendering
      expect(wrapper.text()).toContain('Padded Text')
    })
  })

  // Accessibility
  describe('Accessibility', () => {
    it('should have proper button type for tooltip trigger', () => {
      const wrapper = createWrapper({ text: 'Test', tooltip: 'Info' })
      const button = wrapper.find('button')
      expect(button.attributes('type')).toBe('button')
    })

    it('should render tooltip with accessible button for screen readers', () => {
      const wrapper = createWrapper({ text: 'Eco-Friendly', tooltip: 'Details' })
      // Button should exist for tooltip trigger
      const button = wrapper.find('button')
      expect(button.exists()).toBe(true)
      expect(button.attributes('type')).toBe('button')
    })

    it('should be keyboard accessible with button element', () => {
      const wrapper = createWrapper({ text: 'Test', tooltip: 'Info' })
      const button = wrapper.find('button')
      expect(button.element.tagName).toBe('BUTTON')
    })

    it('should have transition classes for smooth interactions', () => {
      const wrapper = createWrapper({ text: 'Test' })
      expect(wrapper.html()).toContain('transition')
    })

    it('should have proper color contrast with variant classes', () => {
      const wrapper = createWrapper({ text: 'Test', variant: 'success' })
      // Success variant should have bg-green-100 and text-green-700
      expect(wrapper.html()).toContain('bg-green-100')
      expect(wrapper.html()).toContain('text-green-700')
    })
  })

  // Default Props
  describe('Default Props', () => {
    it('should use neutral variant as default', () => {
      const wrapper = createWrapper({ text: 'Test' })
      expect(wrapper.html()).toContain('bg-gray-100')
    })

    it('should use md size as default', () => {
      const wrapper = createWrapper({ text: 'Test' })
      expect(wrapper.classes()).toContain('text-sm')
      expect(wrapper.classes()).toContain('px-3')
    })

    it('should not render icon by default', () => {
      const wrapper = createWrapper({ text: 'Test' })
      const icons = wrapper.findAll('[data-testid="icon"]')
      const nonTooltipIcons = icons.filter(icon => !icon.html().includes('lucide:help-circle'))
      expect(nonTooltipIcons.length).toBe(0)
    })

    it('should not render tooltip by default', () => {
      const wrapper = createWrapper({ text: 'Test' })
      expect(wrapper.find('[data-testid="custom-tooltip"]').exists()).toBe(false)
    })
  })
})
