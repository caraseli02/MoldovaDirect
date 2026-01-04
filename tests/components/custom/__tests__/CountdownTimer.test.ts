import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
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
}))

describe('Custom CountdownTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should render countdown timer', () => {
    const futureDate = new Date(Date.now() + 3600000) // 1 hour from now
    const wrapper = mount(CountdownTimer, {
      props: { endTime: futureDate },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('should display hours and minutes', () => {
    const futureDate = new Date(Date.now() + 7200000) // 2 hours from now
    const wrapper = mount(CountdownTimer, {
      props: { endTime: futureDate },
    })
    expect(wrapper.text()).toContain('h')
    expect(wrapper.text()).toContain('m')
  })

  it('should show clock icon when enabled', () => {
    const futureDate = new Date(Date.now() + 3600000)
    const wrapper = mount(CountdownTimer, {
      props: { endTime: futureDate, showIcon: true },
    })
    expect(wrapper.html()).toContain('lucide:clock')
  })

  it('should hide seconds in compact mode', () => {
    const futureDate = new Date(Date.now() + 7200000)
    const wrapper = mount(CountdownTimer, {
      props: { endTime: futureDate, compact: true, showSeconds: false },
    })
    expect(wrapper.text()).not.toContain('s')
  })

  it('should emit expired event when time runs out', async () => {
    const pastDate = new Date(Date.now() - 1000)
    const wrapper = mount(CountdownTimer, {
      props: { endTime: pastDate },
    })

    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('expired')).toBeTruthy()
  })
})
