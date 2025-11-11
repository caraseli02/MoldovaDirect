// Producer data types for Moldova Direct
// Supports the ProducerStoriesSection and producer storytelling features

import type { Translations } from './database'
import type { WineRegion } from './product-attributes'

// =============================================
// PRODUCER
// =============================================
export interface Producer {
  id: string
  name: string
  slug: string
  region: WineRegion
  // Story and biography
  shortBio: Translations // 50-100 words for cards
  fullStory: Translations // 300-500 words for modal
  philosophy?: Translations
  // Visual content
  portraitImage: string // Primary portrait (2000x2000px)
  heroImage?: string // Header image for detail view
  gallery?: string[] // Additional photos
  // Contact and location
  location?: {
    coordinates: {
      lat: number
      lng: number
    }
    address?: string
  }
  website?: string
  // Background info
  establishedYear?: number
  generationsOfWinemaking?: number
  specialty: Translations // e.g., "Organic wines", "Traditional methods"
  // Production details
  vineyardSize?: string // e.g., "25 hectares"
  annualProduction?: string // e.g., "50,000 bottles"
  primaryGrapes?: string[]
  // Awards and recognition
  awards?: Array<{
    name: Translations
    year: number
    organization?: string
    image?: string
  }>
  certifications?: Array<{
    name: string
    type: 'organic' | 'biodynamic' | 'sustainable' | 'pdo' | 'pgi' | 'other'
    year?: number
    image?: string
  }>
  // Related products
  productIds?: number[]
  featuredProductIds?: number[]
  // Metadata
  sortOrder?: number
  isFeatured?: boolean
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

// =============================================
// PRODUCER CARD (Summary)
// =============================================
export interface ProducerCardData {
  id: string
  name: string
  slug: string
  region: WineRegion
  shortBio: Translations
  portraitImage: string
  specialty: Translations
  establishedYear?: number
}

// =============================================
// PRODUCER DETAIL (Full)
// =============================================
export interface ProducerDetailData extends Producer {
  products?: Array<{
    id: number
    name: Translations
    slug: string
    image: string
    priceEur: number
  }>
  relatedProducers?: ProducerCardData[]
}

// =============================================
// CAROUSEL OPTIONS
// =============================================
export interface ProducerCarouselOptions {
  autoplay: boolean
  autoplaySpeed: number // milliseconds
  loop: boolean
  slidesPerView: number
  spaceBetween: number
  navigation: boolean
  pagination: boolean
  breakpoints?: Record<number, {
    slidesPerView: number
    spaceBetween: number
  }>
}

// =============================================
// COMPOSABLE RETURN TYPE
// =============================================
export interface UseProducersReturn {
  producers: Ref<Producer[]>
  featuredProducers: Ref<Producer[]>
  loading: Ref<boolean>
  error: Ref<string | null>
  selectedProducer: Ref<Producer | null>
  fetchProducers: () => Promise<void>
  fetchProducerBySlug: (slug: string) => Promise<Producer | null>
  getProducersByRegion: (region: WineRegion) => Producer[]
  getFeaturedProducers: (limit?: number) => Producer[]
}
