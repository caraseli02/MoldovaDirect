/**
 * Products Page Section Configuration
 *
 * Centralized feature flag system for managing products page sections.
 * Follows the KISS principle established in landing page modernization.
 *
 * Sections are organized by importance and conversion impact:
 * - Core: Essential product browsing functionality
 * - Discovery: Help users find products
 * - Engagement: Additional content and context
 */

export interface ProductsPageConfig {
  // Core Features - Critical for product browsing
  heroSection: boolean
  categoryNavigation: boolean
  searchAndFilters: boolean
  productGrid: boolean
  pagination: boolean

  // Discovery Features - Help users find products
  discoveryCollections: boolean
  quickFilters: boolean
  recentlyViewed: boolean

  // Engagement Features - Additional context
  editorialStories: boolean

  // Performance Features - Optimize for large catalogs
  virtualScrolling: boolean
  pullToRefresh: boolean
}

export const useProductsConfig = () => {
  const config: ProductsPageConfig = {
    // Core: Always enabled
    heroSection: true,
    categoryNavigation: true,
    searchAndFilters: true,
    productGrid: true,
    pagination: true,

    // Discovery: High value
    discoveryCollections: true,
    quickFilters: true,
    recentlyViewed: true,

    // Engagement: Support
    editorialStories: true,

    // Performance: Mobile optimization
    virtualScrolling: true, // Only activates when products > VIRTUAL_SCROLL_THRESHOLD
    pullToRefresh: true, // Mobile only
  }

  /**
   * Check if a specific section is enabled
   * @param sectionKey - The section identifier from ProductsPageConfig
   * @returns boolean indicating if section should be rendered
   */
  const isSectionEnabled = (sectionKey: keyof ProductsPageConfig): boolean => {
    return config[sectionKey] ?? false
  }

  /**
   * Get all enabled sections (useful for debugging)
   * @returns Array of enabled section keys
   */
  const getEnabledSections = (): string[] => {
    return Object.entries(config)
      .filter(([_, enabled]) => enabled)
      .map(([key]) => key)
  }

  /**
   * Get section count statistics
   * @returns Object with counts per category
   */
  const getSectionStats = () => {
    const core = ['heroSection', 'categoryNavigation', 'searchAndFilters', 'productGrid', 'pagination']
    const discovery = ['discoveryCollections', 'quickFilters', 'recentlyViewed']
    const engagement = ['editorialStories']
    const performance = ['virtualScrolling', 'pullToRefresh']

    return {
      core: core.filter(key => config[key as keyof ProductsPageConfig]).length,
      discovery: discovery.filter(key => config[key as keyof ProductsPageConfig]).length,
      engagement: engagement.filter(key => config[key as keyof ProductsPageConfig]).length,
      performance: performance.filter(key => config[key as keyof ProductsPageConfig]).length,
      total: getEnabledSections().length,
    }
  }

  return {
    config,
    isSectionEnabled,
    getEnabledSections,
    getSectionStats,
  }
}
