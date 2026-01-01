import type { WineRegionData, WineRegion } from '~/types'

/**
 * Wine Regions Composable
 * Provides access to Moldova's wine regions data and filtering
 * Supports the WineRegionsMap component
 */
export const useWineRegions = () => {
  // Use Nuxt's useState for SSR-compatible reactive state
  const regions = useState<WineRegionData[]>('wine-regions', () => [])
  const selectedRegion = useState<WineRegion | null>('selected-region', () => null)
  const loading = useState<boolean>('wine-regions-loading', () => false)
  const error = useState<string | null>('wine-regions-error', () => null)

  // Fetch all wine regions
  const fetchRegions = async () => {
    // If already loaded, skip
    if (regions.value.length > 0) {
      return
    }

    loading.value = true
    error.value = null

    try {
      // For now, use static data until API endpoint is created
      // TODO: Replace with API call when backend is ready
      const staticRegions: WineRegionData[] = [
        {
          id: 'codru',
          name: {
            en: 'Codru',
            es: 'Codru',
            ro: 'Codru',
            ru: 'Кодру',
          },
          description: {
            en: 'The heart of Moldovan winemaking, known for balanced white and red wines',
            es: 'El corazón de la vinificación moldava, conocido por sus vinos blancos y tintos equilibrados',
            ro: 'Inima vinificației moldovenești, cunoscută pentru vinurile albe și roșii echilibrate',
            ru: 'Сердце молдавского виноделия, известное сбалансированными белыми и красными винами',
          },
          terroir: {
            en: 'Rolling hills with diverse microclimates and rich clay-limestone soils',
            es: 'Colinas onduladas con microclimas diversos y ricos suelos arcillo-calcáreos',
            ro: 'Dealuri ondulate cu microclimate diverse și soluri bogate de argilă-calcar',
            ru: 'Холмистая местность с разнообразными микроклиматами и богатыми глинисто-известняковыми почвами',
          },
          climate: {
            en: 'Continental with warm summers and mild winters, 450-550mm annual rainfall',
            es: 'Continental con veranos cálidos e inviernos suaves, 450-550mm de precipitación anual',
            ro: 'Continental cu veri calde și ierni blânde, 450-550mm precipitații anuale',
            ru: 'Континентальный с теплым летом и мягкой зимой, 450-550мм годовых осадков',
          },
          coordinates: {
            lat: 47.0,
            lng: 28.5,
          },
          characteristics: {
            soilType: {
              en: 'Clay-limestone and chernozem',
              es: 'Arcilla-caliza y chernozem',
              ro: 'Argilă-calcar și cernoziom',
              ru: 'Глина-известняк и чернозём',
            },
            elevation: '150-250m',
            averageTemp: '10-12°C',
            rainfall: '450-550mm',
          },
          primaryGrapes: ['Fetească Albă', 'Fetească Regală', 'Riesling', 'Cabernet Sauvignon', 'Merlot'],
          producerCount: 45,
        },
        {
          id: 'stefan-voda',
          name: {
            en: 'Stefan Voda',
            es: 'Stefan Voda',
            ro: 'Ștefan Vodă',
            ru: 'Стефан Водэ',
          },
          description: {
            en: 'Southern region producing bold reds and sweet dessert wines',
            es: 'Región sur que produce tintos audaces y vinos de postre dulces',
            ro: 'Regiunea sudică producând roșii puternice și vinuri dulci de desert',
            ru: 'Южный регион, производящий насыщенные красные и сладкие десертные вина',
          },
          terroir: {
            en: 'Steep slopes with excellent drainage and southern exposure',
            es: 'Pendientes pronunciadas con excelente drenaje y exposición sur',
            ro: 'Pante abrupte cu drenaj excelent și expunere sudică',
            ru: 'Крутые склоны с отличным дренажем и южной экспозицией',
          },
          climate: {
            en: 'Warmer continental, 500-600mm rainfall, optimal for full-bodied reds',
            es: 'Continental más cálido, 500-600mm de lluvia, óptimo para tintos con cuerpo',
            ro: 'Continental mai cald, 500-600mm precipitații, optim pentru roșii cu corp',
            ru: 'Более тёплый континентальный, 500-600мм осадков, оптимальный для полнотелых красных',
          },
          coordinates: {
            lat: 46.5,
            lng: 29.5,
          },
          characteristics: {
            soilType: {
              en: 'Limestone and sandy loam',
              es: 'Caliza y marga arenosa',
              ro: 'Calcar și lut nisipos',
              ru: 'Известняк и песчаный суглинок',
            },
            elevation: '100-200m',
            averageTemp: '11-13°C',
            rainfall: '500-600mm',
          },
          primaryGrapes: ['Cabernet Sauvignon', 'Merlot', 'Saperavi', 'Muscat', 'Traminer'],
          producerCount: 28,
        },
        {
          id: 'valul-lui-traian',
          name: {
            en: 'Valul lui Traian',
            es: 'Valul lui Traian',
            ro: 'Valul lui Traian',
            ru: 'Валул луй Траян',
          },
          description: {
            en: 'Southeastern region specializing in aromatic whites and rosés',
            es: 'Región sureste especializada en blancos aromáticos y rosados',
            ro: 'Regiunea de sud-est specializată în vinuri albe aromatice și rozé',
            ru: 'Юго-восточный регион, специализирующийся на ароматных белых и розовых винах',
          },
          terroir: {
            en: 'Gentle slopes with maritime influence from the Black Sea',
            es: 'Pendientes suaves con influencia marítima del Mar Negro',
            ro: 'Pante blânde cu influență maritimă de la Marea Neagră',
            ru: 'Пологие склоны с морским влиянием Чёрного моря',
          },
          climate: {
            en: 'Moderated by Black Sea proximity, 400-500mm rainfall, ideal for whites',
            es: 'Moderado por la proximidad del Mar Negro, 400-500mm lluvia, ideal para blancos',
            ro: 'Moderat de proximitatea Mării Negre, 400-500mm precipitații, ideal pentru albe',
            ru: 'Умеренный близостью Чёрного моря, 400-500мм осадков, идеальный для белых',
          },
          coordinates: {
            lat: 46.2,
            lng: 28.8,
          },
          characteristics: {
            soilType: {
              en: 'Limestone and clay with marine fossils',
              es: 'Caliza y arcilla con fósiles marinos',
              ro: 'Calcar și argilă cu fosile marine',
              ru: 'Известняк и глина с морскими окаменелостями',
            },
            elevation: '80-150m',
            averageTemp: '10-11°C',
            rainfall: '400-500mm',
          },
          primaryGrapes: ['Fetească Albă', 'Aligote', 'Sauvignon Blanc', 'Pinot Gris', 'Traminer'],
          producerCount: 22,
        },
      ]

      regions.value = staticRegions
    }
    catch (err: unknown) {
      error.value = err instanceof Error ? getErrorMessage(err) : 'Failed to fetch wine regions'
      console.error('Error fetching wine regions:', getErrorMessage(err))
    }
    finally {
      loading.value = false
    }
  }

  // Get region by ID
  const getRegionById = (id: WineRegion): WineRegionData | undefined => {
    return regions.value.find(r => r.id === id)
  }

  // Select a region (for filtering)
  const selectRegion = (id: WineRegion | null) => {
    selectedRegion.value = id
  }

  // Filter products by region
  const filterProductsByRegion = (region: WineRegion | null) => {
    selectRegion(region)
    // This will be used by product catalog to filter products
    // The actual filtering logic will be in useProductCatalog
  }

  return {
    regions: readonly(regions),
    selectedRegion,
    loading: readonly(loading),
    error: readonly(error),
    fetchRegions,
    getRegionById,
    selectRegion,
    filterProductsByRegion,
  }
}
