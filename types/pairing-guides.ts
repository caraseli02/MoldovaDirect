// Pairing guides data types for Moldova Direct
// Supports wine and food pairing education and recommendations

import type { Translations } from './database'
import type { _WineRegion } from './product-attributes'

// =============================================
// PAIRING GUIDE
// =============================================
export interface PairingGuide {
  id: string
  slug: string
  // Wine information
  wineName: Translations
  wineType: 'red' | 'white' | 'rose' | 'sparkling' | 'dessert'
  wineProductId?: number
  // Food pairing
  dishName: Translations
  dishDescription: Translations
  cuisine?: string // e.g., "Italian", "French", "Moldovan"
  // Pairing explanation
  pairingReason: Translations // "Why this works"
  pairingNotes?: Translations // Additional details
  // Characteristics
  characteristics: {
    intensity: 'light' | 'medium' | 'bold'
    primaryFlavors: string[]
    wineBodyMatch: 'complement' | 'contrast'
  }
  // Images
  wineImage: string
  foodImage: string
  combinedImage?: string // Split or combined presentation
  // Recipe information
  recipe?: {
    slug: string
    servings: number
    cookingTime: string
    difficulty: 'easy' | 'medium' | 'hard'
    ingredients: Array<{
      name: Translations
      amount: string
    }>
    instructions: Translations[]
    chefNotes?: Translations
  }
  // Contextual filters
  occasions: Array<'everyday' | 'special-occasion' | 'celebration' | 'romantic' | 'holiday' | 'casual' | 'formal'>
  seasons: Array<'spring' | 'summer' | 'fall' | 'winter' | 'year-round'>
  mealTypes: Array<'appetizer' | 'main-course' | 'dessert' | 'snack'>
  // Serving suggestions
  servingSuggestions?: {
    temperature: string
    glassType: string
    decanting?: string
    garnishes?: string[]
  }
  // Alternative pairings
  alternativeWines?: Array<{
    name: string
    productId?: number
    reason: Translations
  }>
  alternativeDishes?: string[]
  // Metadata
  sortOrder?: number
  isFeatured?: boolean
  isActive: boolean
  viewCount?: number
  createdAt?: string
  updatedAt?: string
}

// =============================================
// PAIRING CARD (Summary)
// =============================================
export interface PairingCardData {
  id: string
  slug: string
  wineName: Translations
  wineType: 'red' | 'white' | 'rose' | 'sparkling' | 'dessert'
  dishName: Translations
  pairingReason: Translations
  wineImage: string
  foodImage: string
  occasions: string[]
  seasons: string[]
  isFeatured?: boolean
}

// =============================================
// PAIRING FILTERS
// =============================================
export interface PairingFilters {
  wineType?: Array<'red' | 'white' | 'rose' | 'sparkling' | 'dessert'>
  occasion?: Array<'everyday' | 'special-occasion' | 'celebration' | 'romantic' | 'holiday' | 'casual' | 'formal'>
  season?: Array<'spring' | 'summer' | 'fall' | 'winter' | 'year-round'>
  mealType?: Array<'appetizer' | 'main-course' | 'dessert' | 'snack'>
  cuisine?: string[]
  intensity?: Array<'light' | 'medium' | 'bold'>
  search?: string
}

// =============================================
// PAIRING SECTION OPTIONS
// =============================================
export interface PairingSectionOptions {
  showFilters: boolean
  defaultFilter?: keyof PairingFilters
  featuredOnly?: boolean
  limit?: number
  columns?: number
}

// =============================================
// EDUCATIONAL CONTENT
// =============================================
export interface PairingEducation {
  id: string
  title: Translations
  category: 'basics' | 'advanced' | 'wine-types' | 'food-types' | 'techniques'
  content: Translations
  examples?: string[] // Pairing guide IDs
  tips?: Translations[]
  sortOrder: number
}

// =============================================
// COMPOSABLE RETURN TYPE
// =============================================
export interface UsePairingGuidesReturn {
  pairings: Ref<PairingGuide[]>
  featuredPairings: Ref<PairingGuide[]>
  loading: Ref<boolean>
  error: Ref<string | null>
  filters: Ref<PairingFilters>
  filteredPairings: ComputedRef<PairingGuide[]>
  fetchPairings: () => Promise<void>
  fetchPairingBySlug: (slug: string) => Promise<PairingGuide | null>
  applyFilters: (filters: PairingFilters) => void
  clearFilters: () => void
  getFeaturedPairings: (limit?: number) => PairingGuide[]
  getPairingsByWineType: (type: string) => PairingGuide[]
  getPairingsByOccasion: (occasion: string) => PairingGuide[]
}
