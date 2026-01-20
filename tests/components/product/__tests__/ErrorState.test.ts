/**
 * Error State Component Tests
 *
 * Tests the ErrorState component behavior using Vue Test Utils.
 */
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ErrorState from '~/components/product/ErrorState.vue'

// Mock vue-i18n
vi.mock('vue-i18n', () => ({
  useI18n: vi.fn(() => ({
    t: (key: string) => key,
  })),
}))

// Mock UiButton component
vi.mock('#build/components/ui/button/Button.vue', () => ({
  name: 'UiButton',
  template: '<button @click="$emit(\'click\')"><slot /></button>',
  props: ['type', 'class'],
}))

describe('ErrorState Component', () => {
  it('should render error message from prop', () => {
    const wrapper = mount(ErrorState, {
      props: {
        errorMessage: 'Something went wrong',
      },
      global: {
        stubs: {
          UiButton: {
            template: '<button @click="$emit(\'click\')"><slot /></button>',
          },
        },
      },
    })

    expect(wrapper.text()).toContain('Something went wrong')
  })

  it('should use generic error message when no errorMessage provided', () => {
    const wrapper = mount(ErrorState, {
      global: {
        stubs: {
          UiButton: {
            template: '<button @click="$emit(\'click\')"><slot /></button>',
          },
        },
      },
    })

    expect(wrapper.text()).toContain('common.errorGeneric')
  })

  it('should emit retry event when button is clicked', async () => {
    const wrapper = mount(ErrorState, {
      global: {
        stubs: {
          UiButton: {
            template: '<button @click="$emit(\'click\')"><slot /></button>',
            emits: ['click'],
          },
        },
      },
    })

    const button = wrapper.find('button')
    expect(button.exists()).toBe(true)

    await button.trigger('click')
    expect(wrapper.emitted('retry')).toBeTruthy()
    // The retry event should be emitted at least once
    expect((wrapper.emitted('retry')?.length ?? 0)).toBeGreaterThan(0)
  })

  it('should have proper error styling classes', () => {
    const wrapper = mount(ErrorState, {
      global: {
        stubs: {
          UiButton: {
            template: '<button @click="$emit(\'click\')"><slot /></button>',
          },
        },
      },
    })

    const errorContainer = wrapper.find('div')
    expect(errorContainer.classes()).toContain('border-red-100')
    expect(errorContainer.classes()).toContain('bg-white')
  })
})
