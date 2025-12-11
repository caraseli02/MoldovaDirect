/**
 * Landing Page CMS Types
 *
 * Type definitions for the Landing Page Content Management System.
 * These types correspond to the database schema in supabase-landing-cms-schema.sql
 */

// =====================================================
// SECTION TYPES
// =====================================================

/**
 * Available section types for the landing page
 */
export type SectionType
  = | 'announcement_bar'
    | 'hero_carousel'
    | 'hero_slide'
    | 'category_grid'
    | 'featured_products'
    | 'collections_showcase'
    | 'social_proof'
    | 'how_it_works'
    | 'services'
    | 'newsletter'
    | 'faq_preview'
    | 'promotional_banner'
    | 'flash_sale'

/**
 * Supported locales for multi-language content
 */
export type Locale = 'es' | 'en' | 'ro' | 'ru'

// =====================================================
// TRANSLATION STRUCTURES
// =====================================================

/**
 * Base translation interface for all sections
 */
export interface BaseTranslation {
  title?: string
  subtitle?: string
  description?: string
  cta_text?: string
  cta_url?: string
}

/**
 * Announcement bar translations
 */
export interface AnnouncementBarTranslation extends BaseTranslation {
  highlight: string
  description: string
  cta_text: string
}

/**
 * Hero slide translations
 */
export interface HeroSlideTranslation extends BaseTranslation {
  title: string
  subtitle: string
  primary_cta_text: string
  secondary_cta_text?: string
  image_alt: string
}

/**
 * Featured products translations
 */
export interface FeaturedProductsTranslation extends BaseTranslation {
  title: string
  subtitle: string
  filter_all?: string
  filter_bestsellers?: string
  filter_new?: string
  filter_sale?: string
}

/**
 * Promotional banner translations
 */
export interface PromotionalBannerTranslation extends BaseTranslation {
  badge_text?: string
  countdown_text?: string
}

/**
 * Multi-language translations object
 */
export type Translations<T extends BaseTranslation = BaseTranslation> = {
  [K in Locale]?: T
}

// =====================================================
// CONFIGURATION STRUCTURES
// =====================================================

/**
 * Base configuration for all sections
 */
export interface BaseConfig {
  background_color?: string
  text_color?: string
  custom_classes?: string
}

/**
 * Announcement bar configuration
 */
export interface AnnouncementBarConfig extends BaseConfig {
  show_cta: boolean
  dismissible?: boolean
  theme?: 'primary' | 'success' | 'warning' | 'info'
}

/**
 * Hero slide configuration
 */
export interface HeroSlideConfig extends BaseConfig {
  image_url: string
  image_mobile_url?: string
  video_url?: string
  link_url: string
  text_position: 'left' | 'center' | 'right'
  overlay_opacity?: number
  animation_type?: 'fade' | 'slide' | 'zoom'
}

/**
 * Hero carousel configuration
 */
export interface HeroCarouselConfig extends BaseConfig {
  auto_rotate: boolean
  rotation_interval?: number // milliseconds
  show_indicators: boolean
  show_arrows: boolean
  transition_duration?: number // milliseconds
}

/**
 * Featured products configuration
 */
export interface FeaturedProductsConfig extends BaseConfig {
  display_count: number
  filter_type: 'manual' | 'best_sellers' | 'new_arrivals' | 'on_sale' | 'category'
  product_ids?: string[] // For manual selection
  category_slug?: string // For category filter
  show_filters: boolean
  grid_columns?: {
    mobile: number
    tablet: number
    desktop: number
  }
}

/**
 * Category grid configuration
 */
export interface CategoryGridConfig extends BaseConfig {
  category_slugs: string[]
  display_style: 'grid' | 'carousel' | 'masonry'
  columns?: number
}

/**
 * Promotional banner configuration
 */
export interface PromotionalBannerConfig extends BaseConfig {
  discount_percentage?: number
  discount_amount?: number
  countdown_enabled: boolean
  countdown_end_date?: string // ISO date string
  featured_product_ids?: string[]
  banner_position: 'top' | 'middle' | 'bottom'
}

/**
 * Flash sale configuration
 */
export interface FlashSaleConfig extends BaseConfig {
  sale_end_date: string // ISO date string
  product_ids: string[]
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  max_quantity_per_user?: number
}

/**
 * Union type for all possible configurations
 */
export type SectionConfig
  = | AnnouncementBarConfig
    | HeroSlideConfig
    | HeroCarouselConfig
    | FeaturedProductsConfig
    | CategoryGridConfig
    | PromotionalBannerConfig
    | FlashSaleConfig
    | BaseConfig

// =====================================================
// DATABASE MODELS
// =====================================================

/**
 * Landing section database row (matches Supabase schema)
 */
export interface LandingSectionRow {
  id: string
  section_type: SectionType
  display_order: number
  is_active: boolean
  starts_at: string | null
  ends_at: string | null
  translations: Translations
  config: SectionConfig
  created_by: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
}

/**
 * Landing section with typed translations and config
 */
export interface LandingSection<
  T extends BaseTranslation = BaseTranslation,
  C extends SectionConfig = SectionConfig,
> {
  id: string
  section_type: SectionType
  display_order: number
  is_active: boolean
  starts_at: Date | null
  ends_at: Date | null
  translations: Translations<T>
  config: C
  created_by: string | null
  updated_by: string | null
  created_at: Date
  updated_at: Date
}

// =====================================================
// SPECIFIC SECTION TYPES
// =====================================================

export type AnnouncementBarSection = LandingSection<
  AnnouncementBarTranslation,
  AnnouncementBarConfig
>

export type HeroSlideSection = LandingSection<
  HeroSlideTranslation,
  HeroSlideConfig
>

export type HeroCarouselSection = LandingSection<
  BaseTranslation,
  HeroCarouselConfig
>

export type FeaturedProductsSection = LandingSection<
  FeaturedProductsTranslation,
  FeaturedProductsConfig
>

export type CategoryGridSection = LandingSection<
  BaseTranslation,
  CategoryGridConfig
>

export type PromotionalBannerSection = LandingSection<
  PromotionalBannerTranslation,
  PromotionalBannerConfig
>

export type FlashSaleSection = LandingSection<
  BaseTranslation,
  FlashSaleConfig
>

// =====================================================
// API REQUEST/RESPONSE TYPES
// =====================================================

/**
 * Create section request body
 */
export interface CreateSectionRequest {
  section_type: SectionType
  display_order?: number
  is_active?: boolean
  starts_at?: string
  ends_at?: string
  translations: Translations
  config: SectionConfig
}

/**
 * Update section request body
 */
export interface UpdateSectionRequest extends Partial<CreateSectionRequest> {
  id: string
}

/**
 * Reorder sections request
 */
export interface ReorderSectionsRequest {
  section_id: string
  new_order: number
}

/**
 * Get sections query parameters
 */
export interface GetSectionsQuery {
  locale?: Locale
  active_only?: boolean
  section_type?: SectionType
  include_scheduled?: boolean
}

/**
 * API response for get sections
 */
export interface GetSectionsResponse {
  sections: LandingSectionRow[]
  total: number
  locale: Locale
}

/**
 * API response for single section
 */
export interface GetSectionResponse {
  section: LandingSectionRow
}

// =====================================================
// ADMIN UI TYPES
// =====================================================

/**
 * Section form data for admin interface
 */
export interface SectionFormData {
  section_type: SectionType
  display_order: number
  is_active: boolean
  starts_at: string
  ends_at: string
  translations: {
    es: Record<string, unknown>
    en: Record<string, unknown>
    ro: Record<string, unknown>
    ru: Record<string, unknown>
  }
  config: Record<string, unknown>
}

/**
 * Section editor props
 */
export interface SectionEditorProps {
  section?: LandingSectionRow
  onSave: (data: CreateSectionRequest | UpdateSectionRequest) => Promise<void>
  onCancel: () => void
}

/**
 * Section card props for admin list
 */
export interface SectionCardProps {
  section: LandingSectionRow
  onEdit: (section: LandingSectionRow) => void
  onDelete: (sectionId: string) => void
  onToggleActive: (sectionId: string, isActive: boolean) => void
  onDragStart?: () => void
  onDragEnd?: () => void
}

// =====================================================
// UTILITY TYPES
// =====================================================

/**
 * Section type metadata for UI
 */
export interface SectionTypeMeta {
  type: SectionType
  label: string
  description: string
  icon: string
  category: 'promotional' | 'content' | 'navigation' | 'social'
  supports_scheduling: boolean
  requires_products: boolean
}

/**
 * Section template for quick creation
 */
export interface SectionTemplate {
  name: string
  description: string
  section_type: SectionType
  default_translations: Translations
  default_config: SectionConfig
}

// =====================================================
// TYPE GUARDS
// =====================================================

/**
 * Check if section is an announcement bar
 */
export function isAnnouncementBarSection(
  section: LandingSectionRow,
): section is LandingSectionRow & { section_type: 'announcement_bar' } {
  return section.section_type === 'announcement_bar'
}

/**
 * Check if section is a hero slide
 */
export function isHeroSlideSection(
  section: LandingSectionRow,
): section is LandingSectionRow & { section_type: 'hero_slide' } {
  return section.section_type === 'hero_slide'
}

/**
 * Check if section is featured products
 */
export function isFeaturedProductsSection(
  section: LandingSectionRow,
): section is LandingSectionRow & { section_type: 'featured_products' } {
  return section.section_type === 'featured_products'
}

/**
 * Check if section requires product selection
 */
export function requiresProducts(sectionType: SectionType): boolean {
  return [
    'featured_products',
    'flash_sale',
    'promotional_banner',
  ].includes(sectionType)
}

/**
 * Check if section is currently active based on schedule
 */
export function isSectionActive(section: LandingSectionRow): boolean {
  if (!section.is_active) return false

  const now = new Date()

  if (section.starts_at) {
    const startDate = new Date(section.starts_at)
    if (now < startDate) return false
  }

  if (section.ends_at) {
    const endDate = new Date(section.ends_at)
    if (now > endDate) return false
  }

  return true
}
