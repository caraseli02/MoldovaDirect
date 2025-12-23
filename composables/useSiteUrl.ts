import { useRuntimeConfig } from '#imports'

interface SiteUrlHelpers {
  siteUrl: string
  toAbsoluteUrl: (path?: string) => string
}

const ABSOLUTE_URL_REGEX = /^(https?:)?\/\//i

/**
 * Composable for generating absolute URLs based on the configured site URL.
 *
 * This composable provides utilities for converting relative paths to absolute URLs
 * using the site's base URL from runtime configuration. It includes validation to
 * prevent SSRF attacks by ensuring external URLs match the expected domain.
 *
 * @returns {SiteUrlHelpers} Object containing the base site URL and URL conversion helper
 * @example
 * const { siteUrl, toAbsoluteUrl } = useSiteUrl()
 */
export function useSiteUrl(): SiteUrlHelpers {
  const runtimeConfig = useRuntimeConfig()
  const configured = runtimeConfig.public?.siteUrl
  const fallback = 'https://www.moldovadirect.com'
  const base = (configured && typeof configured === 'string' && configured.trim().length > 0 ? configured : fallback).replace(/\/+$/, '')

  /**
   * Converts a relative path to an absolute URL, with validation to prevent SSRF.
   *
   * @param {string} [path] - The path to convert. If omitted, returns the base URL.
   * @returns {string} The absolute URL
   * @example
   * toAbsoluteUrl('/contact') // 'https://www.moldovadirect.com/contact'
   * toAbsoluteUrl('https://www.moldovadirect.com/about') // 'https://www.moldovadirect.com/about'
   */
  const toAbsoluteUrl = (path?: string) => {
    if (!path) {
      return base
    }

    // Check if the path is already an absolute URL
    if (ABSOLUTE_URL_REGEX.test(path)) {
      // Validate that absolute URLs match expected domain to prevent SSRF
      try {
        const url = new URL(path)
        const baseUrl = new URL(base)
        if (url.origin !== baseUrl.origin) {
          console.warn(`External URL detected: ${path}. Using base URL instead for security.`)
          return base
        }
        return path
      }
      catch {
        console.warn(`Invalid URL detected: ${path}. Using base URL instead.`)
        return base
      }
    }

    // Sanitize path to prevent double slashes or malformed URLs
    const cleanPath = path.replace(/^\/+/, '/')
    return `${base}${cleanPath.startsWith('/') ? '' : '/'}${cleanPath}`
  }

  return {
    siteUrl: base,
    toAbsoluteUrl,
  }
}
