import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useSiteUrl } from '~/composables/useSiteUrl'

// Mock the Nuxt runtime config
vi.mock('#imports', () => ({
  useRuntimeConfig: vi.fn()
}))

describe('useSiteUrl', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe('siteUrl', () => {
    it('should use configured site URL from runtime config', () => {
      const { useRuntimeConfig } = await import('#imports')
      vi.mocked(useRuntimeConfig).mockReturnValue({
        public: { siteUrl: 'https://example.com/' }
      } as any)

      const { siteUrl } = useSiteUrl()
      expect(siteUrl).toBe('https://example.com')
    })

    it('should trim trailing slashes from configured URL', () => {
      const { useRuntimeConfig } = await import('#imports')
      vi.mocked(useRuntimeConfig).mockReturnValue({
        public: { siteUrl: 'https://example.com///' }
      } as any)

      const { siteUrl } = useSiteUrl()
      expect(siteUrl).toBe('https://example.com')
    })

    it('should use fallback URL when config is empty', () => {
      const { useRuntimeConfig } = await import('#imports')
      vi.mocked(useRuntimeConfig).mockReturnValue({
        public: { siteUrl: '' }
      } as any)

      const { siteUrl } = useSiteUrl()
      expect(siteUrl).toBe('https://www.moldovadirect.com')
    })

    it('should use fallback URL when config is not set', () => {
      const { useRuntimeConfig } = await import('#imports')
      vi.mocked(useRuntimeConfig).mockReturnValue({
        public: {}
      } as any)

      const { siteUrl } = useSiteUrl()
      expect(siteUrl).toBe('https://www.moldovadirect.com')
    })
  })

  describe('toAbsoluteUrl', () => {
    beforeEach(() => {
      const { useRuntimeConfig } = await import('#imports')
      vi.mocked(useRuntimeConfig).mockReturnValue({
        public: { siteUrl: 'https://www.moldovadirect.com' }
      } as any)
    })

    it('should return base URL when path is not provided', () => {
      const { toAbsoluteUrl } = useSiteUrl()
      expect(toAbsoluteUrl()).toBe('https://www.moldovadirect.com')
      expect(toAbsoluteUrl(undefined)).toBe('https://www.moldovadirect.com')
    })

    it('should convert relative path to absolute URL', () => {
      const { toAbsoluteUrl } = useSiteUrl()
      expect(toAbsoluteUrl('/about')).toBe('https://www.moldovadirect.com/about')
    })

    it('should handle paths without leading slash', () => {
      const { toAbsoluteUrl } = useSiteUrl()
      expect(toAbsoluteUrl('about')).toBe('https://www.moldovadirect.com/about')
    })

    it('should sanitize paths with multiple leading slashes', () => {
      const { toAbsoluteUrl } = useSiteUrl()
      expect(toAbsoluteUrl('///about')).toBe('https://www.moldovadirect.com/about')
    })

    it('should accept absolute URLs with same origin', () => {
      const { toAbsoluteUrl } = useSiteUrl()
      expect(toAbsoluteUrl('https://www.moldovadirect.com/contact')).toBe('https://www.moldovadirect.com/contact')
    })

    it('should reject absolute URLs with different origin for security', () => {
      const { toAbsoluteUrl } = useSiteUrl()
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      expect(toAbsoluteUrl('https://evil.com/phishing')).toBe('https://www.moldovadirect.com')
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('External URL detected')
      )

      consoleWarnSpy.mockRestore()
    })

    it('should handle protocol-relative URLs', () => {
      const { toAbsoluteUrl } = useSiteUrl()
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      // Protocol-relative URLs from different origins should be rejected
      expect(toAbsoluteUrl('//evil.com/path')).toBe('https://www.moldovadirect.com')
      expect(consoleWarnSpy).toHaveBeenCalled()

      consoleWarnSpy.mockRestore()
    })

    it('should handle malformed URLs gracefully', () => {
      const { toAbsoluteUrl } = useSiteUrl()
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      expect(toAbsoluteUrl('https://:invalid:url')).toBe('https://www.moldovadirect.com')
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid URL detected')
      )

      consoleWarnSpy.mockRestore()
    })

    it('should handle empty string path', () => {
      const { toAbsoluteUrl } = useSiteUrl()
      expect(toAbsoluteUrl('')).toBe('https://www.moldovadirect.com')
    })
  })
})
