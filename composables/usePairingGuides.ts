import type { PairingGuide, PairingFilters } from '~/types'

/**
 * Pairing Guides Composable
 * Provides access to wine and food pairing recommendations
 * Supports the PairingGuidesSection with filtering
 */
export const usePairingGuides = () => {
  // Use Nuxt's useState for SSR-compatible reactive state
  const pairings = useState<PairingGuide[]>('pairing-guides', () => [])
  const filters = useState<PairingFilters>('pairing-filters', () => ({}))
  const loading = useState<boolean>('pairings-loading', () => false)
  const error = useState<string | null>('pairings-error', () => null)

  // Computed: Featured pairings
  const featuredPairings = computed(() =>
    pairings.value.filter(p => p.isFeatured && p.isActive),
  )

  // Computed: Filtered pairings
  const filteredPairings = computed(() => {
    let result = pairings.value.filter(p => p.isActive)

    // Apply wine type filter
    if (filters.value.wineType && filters.value.wineType.length > 0) {
      result = result.filter(p => filters.value.wineType?.includes(p.wineType))
    }

    // Apply occasion filter
    if (filters.value.occasion && filters.value.occasion.length > 0) {
      result = result.filter(p =>
        p.occasions.some(o => filters.value.occasion?.includes(o)),
      )
    }

    // Apply season filter
    if (filters.value.season && filters.value.season.length > 0) {
      result = result.filter(p =>
        p.seasons.some(s => filters.value.season?.includes(s)),
      )
    }

    // Apply meal type filter
    if (filters.value.mealType && filters.value.mealType.length > 0) {
      result = result.filter(p =>
        p.mealTypes.some(m => filters.value.mealType?.includes(m)),
      )
    }

    // Apply cuisine filter
    if (filters.value.cuisine && filters.value.cuisine.length > 0) {
      result = result.filter(p =>
        filters.value.cuisine?.includes(p.cuisine || ''),
      )
    }

    // Apply intensity filter
    if (filters.value.intensity && filters.value.intensity.length > 0) {
      result = result.filter(p =>
        filters.value.intensity?.includes(p.characteristics.intensity),
      )
    }

    // Apply search filter
    if (filters.value.search) {
      const searchLower = filters.value.search.toLowerCase()
      result = result.filter(p =>
        p.wineName.en.toLowerCase().includes(searchLower)
        || p.dishName.en.toLowerCase().includes(searchLower)
        || p.cuisine?.toLowerCase().includes(searchLower),
      )
    }

    return result
  })

  // Fetch all pairing guides
  const fetchPairings = async () => {
    // If already loaded, skip
    if (pairings.value.length > 0) {
      return
    }

    loading.value = true
    error.value = null

    try {
      // For now, use static data until API endpoint is created
      // TODO: Replace with API call when backend is ready
      const staticPairings: PairingGuide[] = [
        {
          id: 'pairing-1',
          slug: 'feteasca-alba-grilled-fish',
          wineName: {
            en: 'Fetească Albă',
            es: 'Fetească Albă',
            ro: 'Fetească Albă',
            ru: 'Фетяска Албэ',
          },
          wineType: 'white',
          dishName: {
            en: 'Grilled Sea Bass',
            es: 'Lubina a la Parrilla',
            ro: 'Biban de Mare la Grătar',
            ru: 'Морской Окунь на Гриле',
          },
          dishDescription: {
            en: 'Fresh sea bass with lemon and herbs, simply grilled to perfection',
            es: 'Lubina fresca con limón y hierbas, simplemente asada a la perfección',
            ro: 'Biban de mare proaspăt cu lămâie și ierburi, simplu fript la perfecțiune',
            ru: 'Свежий морской окунь с лимоном и травами, просто приготовленный на гриле до совершенства',
          },
          cuisine: 'Mediterranean',
          pairingReason: {
            en: 'The wine\'s crisp acidity and citrus notes complement the delicate fish without overpowering its natural flavors',
            es: 'La acidez fresca del vino y las notas cítricas complementan el pescado delicado sin dominar sus sabores naturales',
            ro: 'Aciditatea proaspătă a vinului și notele citrice completează peștele delicat fără a-i domina aromele naturale',
            ru: 'Свежая кислотность вина и цитрусовые ноты дополняют нежную рыбу, не подавляя её натуральные вкусы',
          },
          characteristics: {
            intensity: 'light',
            primaryFlavors: ['citrus', 'apple', 'white flowers'],
            wineBodyMatch: 'complement',
          },
          wineImage: '/images/pairings/feteasca-alba.jpg',
          foodImage: '/images/pairings/grilled-fish.jpg',
          occasions: ['everyday', 'casual'],
          seasons: ['spring', 'summer'],
          mealTypes: ['main-course'],
          servingSuggestions: {
            temperature: '8-10°C',
            glassType: 'White wine glass',
            garnishes: ['lemon', 'fresh dill', 'capers'],
          },
          sortOrder: 1,
          isFeatured: true,
          isActive: true,
        },
        {
          id: 'pairing-2',
          slug: 'cabernet-sauvignon-beef-stew',
          wineName: {
            en: 'Cabernet Sauvignon',
            es: 'Cabernet Sauvignon',
            ro: 'Cabernet Sauvignon',
            ru: 'Каберне Совиньон',
          },
          wineType: 'red',
          dishName: {
            en: 'Moldovan Beef Stew',
            es: 'Guiso de Carne Moldavo',
            ro: 'Tocană Moldovenească',
            ru: 'Молдавское Тушёное Мясо',
          },
          dishDescription: {
            en: 'Hearty beef stew with root vegetables and traditional Moldovan spices',
            es: 'Abundante guiso de carne con verduras de raíz y especias moldavas tradicionales',
            ro: 'Tocană abundentă de carne cu legume și condimente moldovenești tradiționale',
            ru: 'Сытное тушёное мясо с корнеплодами и традиционными молдавскими специями',
          },
          cuisine: 'Moldovan',
          pairingReason: {
            en: 'The wine\'s bold tannins and dark fruit flavors stand up to the rich, savory stew, creating a harmonious balance',
            es: 'Los taninos audaces del vino y los sabores de frutas oscuras resisten el guiso rico y sabroso, creando un equilibrio armonioso',
            ro: 'Taninurile puternice ale vinului și aromele de fructe închise rezistă tocanei bogate și gustoase, creând un echilibru armonios',
            ru: 'Насыщенные танины вина и вкусы тёмных фруктов выдерживают богатое, пикантное тушёное мясо, создавая гармоничный баланс',
          },
          characteristics: {
            intensity: 'bold',
            primaryFlavors: ['blackcurrant', 'cedar', 'tobacco'],
            wineBodyMatch: 'complement',
          },
          wineImage: '/images/pairings/cabernet-sauvignon.jpg',
          foodImage: '/images/pairings/beef-stew.jpg',
          occasions: ['everyday', 'special-occasion'],
          seasons: ['fall', 'winter'],
          mealTypes: ['main-course'],
          servingSuggestions: {
            temperature: '16-18°C',
            glassType: 'Bordeaux glass',
            decanting: '30-60 minutes recommended',
            garnishes: ['fresh parsley', 'crusty bread'],
          },
          sortOrder: 2,
          isFeatured: true,
          isActive: true,
        },
        {
          id: 'pairing-3',
          slug: 'traminer-blue-cheese',
          wineName: {
            en: 'Traminer',
            es: 'Traminer',
            ro: 'Traminer',
            ru: 'Траминер',
          },
          wineType: 'white',
          dishName: {
            en: 'Blue Cheese & Honey',
            es: 'Queso Azul y Miel',
            ro: 'Brânză cu Mucegai și Miere',
            ru: 'Голубой Сыр с Мёдом',
          },
          dishDescription: {
            en: 'Creamy blue cheese drizzled with local honey and walnuts',
            es: 'Queso azul cremoso rociado con miel local y nueces',
            ro: 'Brânză cu mucegai cremoasă cu miere locală și nuci',
            ru: 'Сливочный голубой сыр, политый местным мёдом с грецкими орехами',
          },
          cuisine: 'International',
          pairingReason: {
            en: 'The wine\'s aromatic sweetness and floral notes create a beautiful contrast with the salty, pungent cheese',
            es: 'La dulzura aromática del vino y las notas florales crean un hermoso contraste con el queso salado y picante',
            ro: 'Dulceața aromatică a vinului și notele florale creează un contrast frumos cu brânza sărată și pătrunzătoare',
            ru: 'Ароматная сладость вина и цветочные ноты создают прекрасный контраст с солёным, острым сыром',
          },
          characteristics: {
            intensity: 'medium',
            primaryFlavors: ['rose', 'lychee', 'honey'],
            wineBodyMatch: 'contrast',
          },
          wineImage: '/images/pairings/traminer.jpg',
          foodImage: '/images/pairings/blue-cheese.jpg',
          occasions: ['special-occasion', 'romantic'],
          seasons: ['year-round'],
          mealTypes: ['appetizer', 'dessert'],
          servingSuggestions: {
            temperature: '10-12°C',
            glassType: 'White wine glass',
            garnishes: ['walnuts', 'fresh figs', 'crackers'],
          },
          sortOrder: 3,
          isFeatured: true,
          isActive: true,
        },
      ]

      pairings.value = staticPairings
    }
    catch (err: unknown) {
      error.value = err instanceof Error ? getErrorMessage(err) : 'Failed to fetch pairing guides'
      console.error('Error fetching pairing guides:', getErrorMessage(err))
    }
    finally {
      loading.value = false
    }
  }

  // Fetch single pairing by slug
  const fetchPairingBySlug = async (slug: string): Promise<PairingGuide | null> => {
    loading.value = true
    error.value = null

    try {
      // Check if already loaded
      const cached = pairings.value.find(p => p.slug === slug)
      if (cached) {
        return cached
      }

      // TODO: Replace with API call when backend is ready
      // For now, fetch all and find
      await fetchPairings()
      const pairing = pairings.value.find(p => p.slug === slug)

      if (pairing) {
        return pairing
      }

      error.value = 'Pairing guide not found'
      return null
    }
    catch (err: unknown) {
      error.value = err instanceof Error ? getErrorMessage(err) : 'Failed to fetch pairing guide'
      console.error('Error fetching pairing guide:', getErrorMessage(err))
      return null
    }
    finally {
      loading.value = false
    }
  }

  // Apply filters
  const applyFilters = (newFilters: PairingFilters) => {
    filters.value = { ...newFilters }
  }

  // Clear all filters
  const clearFilters = () => {
    filters.value = {}
  }

  // Get featured pairings with optional limit
  const getFeaturedPairings = (limit?: number): PairingGuide[] => {
    const featured = featuredPairings.value
    return limit ? featured.slice(0, limit) : featured
  }

  // Get pairings by wine type
  const getPairingsByWineType = (type: string): PairingGuide[] => {
    return pairings.value.filter(p => p.wineType === type && p.isActive)
  }

  // Get pairings by occasion
  const getPairingsByOccasion = (occasion: string): PairingGuide[] => {
    return pairings.value.filter(p => p.occasions.includes(occasion as unknown as never) && p.isActive)
  }

  return {
    pairings: readonly(pairings),
    featuredPairings: readonly(featuredPairings),
    filteredPairings,
    filters: readonly(filters),
    loading: readonly(loading),
    error: readonly(error),
    fetchPairings,
    fetchPairingBySlug,
    applyFilters,
    clearFilters,
    getFeaturedPairings,
    getPairingsByWineType,
    getPairingsByOccasion,
  }
}
