// Wine regions data types for Moldova Direct
// Supports the WineRegionsMap component and region filtering

import type { Translations } from './database'
import type { WineRegion } from './product-attributes'

// =============================================
// WINE REGION DATA
// =============================================
export interface WineRegionData {
  id: WineRegion
  name: Translations
  description: Translations
  terroir: Translations
  climate: Translations
  coordinates: {
    lat: number
    lng: number
  }
  // Geographic boundaries for map display
  bounds?: {
    north: number
    south: number
    east: number
    west: number
  }
  // Key characteristics
  characteristics: {
    soilType: Translations
    elevation: string
    averageTemp: string
    rainfall: string
  }
  // Primary grape varieties grown in this region
  primaryGrapes: string[]
  // Number of producers in this region
  producerCount?: number
  // Featured wineries
  featuredWineries?: string[]
  // Representative products
  featuredProducts?: number[]
  // Images for the region
  images?: {
    hero: string
    gallery?: string[]
  }
}

// =============================================
// MAP DISPLAY OPTIONS
// =============================================
export interface MapDisplayOptions {
  zoom: number
  center: {
    lat: number
    lng: number
  }
  interactive: boolean
  showLabels: boolean
  showTooltips: boolean
}

// =============================================
// REGION FILTER
// =============================================
export interface RegionFilter {
  region: WineRegion
  active: boolean
}

// =============================================
// GEOJSON FEATURE
// =============================================
export interface RegionGeoJSONFeature {
  type: 'Feature'
  properties: {
    id: WineRegion
    name: string
    color: string
  }
  geometry: {
    type: 'Polygon'
    coordinates: number[][][]
  }
}

export interface RegionGeoJSON {
  type: 'FeatureCollection'
  features: RegionGeoJSONFeature[]
}

// =============================================
// COMPOSABLE RETURN TYPE
// =============================================
export interface UseWineRegionsReturn {
  regions: Ref<WineRegionData[]>
  loading: Ref<boolean>
  error: Ref<string | null>
  selectedRegion: Ref<WineRegion | null>
  fetchRegions: () => Promise<void>
  getRegionById: (id: WineRegion) => WineRegionData | undefined
  selectRegion: (id: WineRegion | null) => void
  filterProductsByRegion: (region: WineRegion | null) => void
}
