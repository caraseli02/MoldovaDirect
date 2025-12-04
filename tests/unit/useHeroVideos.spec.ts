import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { useHeroVideos } from '~/composables/useHeroVideos'

describe('useHeroVideos', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    // Minimal Nuxt composable stubs
    vi.stubGlobal('useState', (_key: string, init: () => any) => {
      return ref(init())
    })
  })

  const mockDevice = (isMobileValue: boolean) => {
    vi.stubGlobal('useDevice', () => ({
      isMobile: ref(isMobileValue),
    }))
  }

  it('exposes all configured videos including latest additions', () => {
    mockDevice(false)
    const { videos } = useHeroVideos()

    expect(videos.length).toBeGreaterThanOrEqual(5)
    const ids = videos.map(v => v.id)
    expect(ids).toContain('vineyard-aerial')
    expect(ids).toContain('table-service')
  })

  it('picks a random video from the configured list', () => {
    mockDevice(false)
    // Force deterministic pick
    vi.spyOn(Math, 'random').mockReturnValue(0.42)

    const { currentVideo, videos } = useHeroVideos()
    expect(videos).toContainEqual(currentVideo.value)
  })

  it('disables video on mobile via showVideo', () => {
    mockDevice(true)
    const { showVideo } = useHeroVideos()

    expect(showVideo.value).toBe(false)
  })
})
