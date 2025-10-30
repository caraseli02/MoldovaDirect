import { useRuntimeConfig } from '#imports'

interface SiteUrlHelpers {
  siteUrl: string
  toAbsoluteUrl: (path?: string) => string
}

const ABSOLUTE_URL_REGEX = /^(https?:)?\/\//i

export function useSiteUrl(): SiteUrlHelpers {
  const runtimeConfig = useRuntimeConfig()
  const configured = runtimeConfig.public?.siteUrl
  const fallback = 'https://www.moldovadirect.com'
  const base = (configured && configured.trim().length > 0 ? configured : fallback).replace(/\/+$/, '')

  const toAbsoluteUrl = (path?: string) => {
    if (!path) {
      return base
    }

    if (ABSOLUTE_URL_REGEX.test(path)) {
      return path
    }

    return `${base}${path.startsWith('/') ? '' : '/'}${path}`
  }

  return {
    siteUrl: base,
    toAbsoluteUrl
  }
}
