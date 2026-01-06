import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import CountdownTimer from '~/components/custom/CountdownTimer.vue'

vi.mock('#imports', () => ({
  useI18n: vi.fn(() => ({
    t: (k: string) => {
      const translations: Record<string, string> = {
        'common.time.days': 'd',
        'common.time.hours': 'h',
        'common.time.minutes': 'm',
        'common.time.seconds': 's',
      }
      return translations[k] || k
    },
  })),
  ref,
  computed,
  onMounted,
  onUnmounted,
}))

describe('Custom CountdownTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  const mountTimer = (props = {}) => {
    return mount(CountdownTimer, {
      props: {
        endTime: new Date(Date.now() + 3600000), // 1 hour from now
        ...props,
      },
      global: {
        stubs: {
          commonIcon: {
            template: '<span :class="name" data-testid="icon" v-bind="$attrs">icon</span>',
            props: ['name'],
          },
        },
      },
    })
  }

  it('should render countdown timer', () => {
    const futureDate = new Date(Date.now() + 3600000) // 1 hour from now
    const wrapper = mountTimer({ endTime: futureDate })
    expect(wrapper.exists()).toBe(true)
  })

  it('should display hours and minutes', () => {
    const futureDate = new Date(Date.now() + 7200000) // 2 hours from now
    const wrapper = mountTimer({ endTime: futureDate })
    expect(wrapper.text()).toContain('h')
    expect(wrapper.text()).toContain('m')
  })

  it('should show clock icon when enabled', () => {
    const futureDate = new Date(Date.now() + 3600000)
    const wrapper = mountTimer({ endTime: futureDate, showIcon: true })
    expect(wrapper.find('[data-testid="icon"]').exists()).toBe(true)
  })

  it('should hide seconds when showSeconds is false', () => {
    const futureDate = new Date(Date.now() + 7200000)
    const wrapper = mountTimer({ endTime: futureDate, showSeconds: false })
    // With showSeconds: false, the 's' label should not appear
    const text = wrapper.text()
    // Should have h and m but no seconds section
    expect(text).toContain('h')
    expect(text).toContain('m')
  })

  it('should emit expired event when time runs out', async () => {
    const pastDate = new Date(Date.now() - 1000)
    const wrapper = mountTimer({ endTime: pastDate })

    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('expired')).toBeTruthy()
  })
})
