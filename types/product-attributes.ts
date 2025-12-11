// Wine-specific product attributes for Moldova Direct
// These types extend the Product.attributes field for wine products

import type { Translations } from './database'

// =============================================
// WINE REGIONS
// =============================================
export type WineRegion = 'codru' | 'stefan-voda' | 'valul-lui-traian'

export interface WineRegionInfo {
  name: string
  terroir: Translations
  climate: string
  coordinates?: {
    lat: number
    lng: number
  }
}

// =============================================
// PRODUCER INFORMATION
// =============================================
export interface ProducerInfo {
  id: string
  name: string
  story: Translations
  image: string
  region: WineRegion
  establishedYear?: number
  specialty?: string
  gallery?: string[]
}

// =============================================
// TASTING NOTES
// =============================================
export interface TastingNotes {
  aromas: string[]
  flavors: string[]
  body: 'light' | 'medium' | 'full'
  finish?: 'short' | 'medium' | 'long'
  acidity?: 'low' | 'medium' | 'high'
  tannins?: 'low' | 'medium' | 'high'
}

// =============================================
// PAIRING INFORMATION
// =============================================
export interface PairingInfo {
  foods: string[]
  recipes: Array<{
    name: string
    slug: string
  }>
  occasions?: string[]
  servingTemp?: string
  glassType?: string
}

// =============================================
// WINE PRODUCT ATTRIBUTES
// =============================================
export interface WineProductAttributes {
  // Producer and origin
  producer?: ProducerInfo
  region?: WineRegionInfo

  // Wine characteristics
  vintage?: number
  grapeVarieties?: string[]
  tastingNotes?: TastingNotes

  // Pairing and serving
  pairings?: PairingInfo

  // Production details
  productionMethod?: string
  agingProcess?: string
  alcoholContent?: number

  // Awards and certifications
  awards?: Array<{
    name: string
    year: number
    organization?: string
  }>
  certifications?: Array<{
    name: string
    type: 'organic' | 'biodynamic' | 'sustainable' | 'other'
  }>
}

// =============================================
// TYPE GUARDS
// =============================================
export function isWineProduct(attributes: unknown): attributes is WineProductAttributes {
  return attributes && (
    'producer' in attributes
    || 'region' in attributes
    || 'grapeVarieties' in attributes
    || 'tastingNotes' in attributes
  )
}

export function hasProducerInfo(attributes: unknown): attributes is { producer: ProducerInfo } {
  return attributes && 'producer' in attributes && attributes.producer !== null
}

export function hasRegionInfo(attributes: unknown): attributes is { region: WineRegionInfo } {
  return attributes && 'region' in attributes && attributes.region !== null
}
