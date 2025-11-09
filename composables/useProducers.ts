import type { Producer, WineRegion } from '~/types'

/**
 * Producers Composable
 * Provides access to winemaker/producer stories and information
 * Supports the ProducerStoriesSection and producer detail views
 */
export const useProducers = () => {
  // Use Nuxt's useState for SSR-compatible reactive state
  const producers = useState<Producer[]>('producers', () => [])
  const selectedProducer = useState<Producer | null>('selected-producer', () => null)
  const loading = useState<boolean>('producers-loading', () => false)
  const error = useState<string | null>('producers-error', () => null)

  // Computed: Featured producers
  const featuredProducers = computed(() =>
    producers.value.filter(p => p.isFeatured && p.isActive)
  )

  // Fetch all producers
  const fetchProducers = async () => {
    // If already loaded, skip
    if (producers.value.length > 0) {
      return
    }

    loading.value = true
    error.value = null

    try {
      // For now, use static data until API endpoint is created
      // TODO: Replace with API call when backend is ready
      const staticProducers: Producer[] = [
        {
          id: 'producer-1',
          name: 'Ion Popescu',
          slug: 'ion-popescu',
          region: 'codru',
          shortBio: {
            en: 'Third-generation winemaker preserving traditional methods while embracing innovation',
            es: 'Vinicultor de tercera generación que preserva métodos tradicionales mientras abraza la innovación',
            ro: 'Producător de vin de a treia generație, păstrând metodele tradiționale și îmbrățișând inovația',
            ru: 'Винодел в третьем поколении, сохраняющий традиционные методы и внедряющий инновации'
          },
          fullStory: {
            en: 'Growing up among the vineyards of Codru, Ion learned winemaking from his grandfather. Today, he combines traditional Moldovan techniques with modern sustainable practices to create wines that express the unique terroir of his family\'s estate.',
            es: 'Creciendo entre los viñedos de Codru, Ion aprendió la vinificación de su abuelo. Hoy, combina técnicas moldavas tradicionales con prácticas sostenibles modernas para crear vinos que expresan el terroir único de la finca de su familia.',
            ro: 'Crescând printre viile din Codru, Ion a învățat vinificația de la bunicul său. Astăzi, combină tehnicile moldovenești tradiționale cu practici moderne sustenabile pentru a crea vinuri care exprimă terroirul unic al domeniului familiei sale.',
            ru: 'Вырос среди виноградников Кодру, Ион научился виноделию у своего дедушки. Сегодня он сочетает традиционные молдавские техники с современными устойчивыми практиками для создания вин, выражающих уникальный терруар поместья его семьи.'
          },
          philosophy: {
            en: 'Wine is a conversation between the land and the winemaker',
            es: 'El vino es una conversación entre la tierra y el vinicultor',
            ro: 'Vinul este o conversație între pământ și producătorul de vin',
            ru: 'Вино - это разговор между землёй и виноделом'
          },
          portraitImage: '/images/producers/ion-popescu.jpg',
          establishedYear: 1985,
          generationsOfWinemaking: 3,
          specialty: {
            en: 'Organic white wines',
            es: 'Vinos blancos orgánicos',
            ro: 'Vinuri albe organice',
            ru: 'Органические белые вина'
          },
          vineyardSize: '18 hectares',
          annualProduction: '35,000 bottles',
          primaryGrapes: ['Fetească Albă', 'Riesling'],
          sortOrder: 1,
          isFeatured: true,
          isActive: true
        },
        {
          id: 'producer-2',
          name: 'Maria Voicu',
          slug: 'maria-voicu',
          region: 'stefan-voda',
          shortBio: {
            en: 'Award-winning producer specializing in bold reds and natural winemaking',
            es: 'Productora galardonada especializada en tintos audaces y vinificación natural',
            ro: 'Producătoare premiată, specializată în roșii puternice și vinificație naturală',
            ru: 'Отмеченная наградами производительница, специализирующаяся на насыщенных красных и натуральном виноделии'
          },
          fullStory: {
            en: 'Maria brought new life to her family\'s historic winery in Stefan Voda. Her commitment to organic farming and minimal intervention winemaking has earned international recognition. Each bottle tells a story of patience, passion, and respect for nature.',
            es: 'Maria dio nueva vida a la histórica bodega de su familia en Stefan Voda. Su compromiso con la agricultura orgánica y la vinificación de mínima intervención ha ganado reconocimiento internacional. Cada botella cuenta una historia de paciencia, pasión y respeto por la naturaleza.',
            ro: 'Maria a adus viață nouă pivniței istorice a familiei sale din Ștefan Vodă. Angajamentul ei față de agricultura organică și vinificația cu intervenție minimă a câștigat recunoaștere internațională. Fiecare sticlă spune o poveste de răbdare, pasiune și respect pentru natură.',
            ru: 'Мария вдохнула новую жизнь в историческую винодельню своей семьи в Штефан Водэ. Её приверженность органическому земледелию и виноделию с минимальным вмешательством получила международное признание. Каждая бутылка рассказывает историю терпения, страсти и уважения к природе.'
          },
          philosophy: {
            en: 'Great wine is made in the vineyard, not the cellar',
            es: 'El gran vino se hace en el viñedo, no en la bodega',
            ro: 'Vinul mare se face în vie, nu în pivniță',
            ru: 'Великое вино делается на винограднике, а не в погребе'
          },
          portraitImage: '/images/producers/maria-voicu.jpg',
          establishedYear: 1992,
          generationsOfWinemaking: 4,
          specialty: {
            en: 'Natural red wines',
            es: 'Vinos tintos naturales',
            ro: 'Vinuri roșii naturale',
            ru: 'Натуральные красные вина'
          },
          vineyardSize: '25 hectares',
          annualProduction: '50,000 bottles',
          primaryGrapes: ['Cabernet Sauvignon', 'Saperavi'],
          awards: [
            {
              name: {
                en: 'Best Organic Wine',
                es: 'Mejor Vino Orgánico',
                ro: 'Cel Mai Bun Vin Organic',
                ru: 'Лучшее Органическое Вино'
              },
              year: 2023,
              organization: 'International Wine Challenge'
            }
          ],
          certifications: [
            {
              name: 'EU Organic',
              type: 'organic',
              year: 2018
            }
          ],
          sortOrder: 2,
          isFeatured: true,
          isActive: true
        },
        {
          id: 'producer-3',
          name: 'Alexandru Moraru',
          slug: 'alexandru-moraru',
          region: 'valul-lui-traian',
          shortBio: {
            en: 'Master of aromatic whites and innovative winemaking techniques',
            es: 'Maestro de blancos aromáticos y técnicas innovadoras de vinificación',
            ro: 'Maestru al vinurilor albe aromatice și tehnici inovatoare de vinificație',
            ru: 'Мастер ароматных белых вин и инновационных методов виноделия'
          },
          fullStory: {
            en: 'Trained in France and Italy, Alexandru returned to Moldova to showcase the potential of local grape varieties. His aromatic whites have put Valul lui Traian on the international wine map. He believes in letting the grapes speak for themselves.',
            es: 'Formado en Francia e Italia, Alexandru regresó a Moldavia para mostrar el potencial de las variedades de uva locales. Sus blancos aromáticos han puesto a Valul lui Traian en el mapa vitivinícola internacional. Cree en dejar que las uvas hablen por sí mismas.',
            ro: 'Instruit în Franța și Italia, Alexandru s-a întors în Moldova pentru a prezenta potențialul soiurilor locale de struguri. Vinurile sale albe aromatice au pus Valul lui Traian pe harta internațională a vinului. Crede în a lăsa strugurii să vorbească singuri.',
            ru: 'Обученный во Франции и Италии, Александр вернулся в Молдову, чтобы продемонстрировать потенциал местных сортов винограда. Его ароматные белые вина поставили Валул луй Траян на международную винную карту. Он верит в то, что нужно позволить винограду говорить самому за себя.'
          },
          philosophy: {
            en: 'Innovation honors tradition',
            es: 'La innovación honra la tradición',
            ro: 'Inovația onorează tradiția',
            ru: 'Инновации чтят традиции'
          },
          portraitImage: '/images/producers/alexandru-moraru.jpg',
          establishedYear: 2008,
          generationsOfWinemaking: 1,
          specialty: {
            en: 'Aromatic white wines',
            es: 'Vinos blancos aromáticos',
            ro: 'Vinuri albe aromatice',
            ru: 'Ароматные белые вина'
          },
          vineyardSize: '12 hectares',
          annualProduction: '28,000 bottles',
          primaryGrapes: ['Fetească Albă', 'Traminer', 'Sauvignon Blanc'],
          sortOrder: 3,
          isFeatured: true,
          isActive: true
        }
      ]

      producers.value = staticProducers
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch producers'
      console.error('Error fetching producers:', err)
    } finally {
      loading.value = false
    }
  }

  // Fetch single producer by slug
  const fetchProducerBySlug = async (slug: string): Promise<Producer | null> => {
    loading.value = true
    error.value = null

    try {
      // Check if already loaded
      const cached = producers.value.find(p => p.slug === slug)
      if (cached) {
        selectedProducer.value = cached
        return cached
      }

      // TODO: Replace with API call when backend is ready
      // For now, fetch all and find
      await fetchProducers()
      const producer = producers.value.find(p => p.slug === slug)

      if (producer) {
        selectedProducer.value = producer
        return producer
      }

      error.value = 'Producer not found'
      return null
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch producer'
      console.error('Error fetching producer:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // Get producers by region
  const getProducersByRegion = (region: WineRegion): Producer[] => {
    return producers.value.filter(p => p.region === region && p.isActive)
  }

  // Get featured producers with optional limit
  const getFeaturedProducers = (limit?: number): Producer[] => {
    const featured = featuredProducers.value
    return limit ? featured.slice(0, limit) : featured
  }

  return {
    producers: readonly(producers),
    featuredProducers: readonly(featuredProducers),
    selectedProducer,
    loading: readonly(loading),
    error: readonly(error),
    fetchProducers,
    fetchProducerBySlug,
    getProducersByRegion,
    getFeaturedProducers
  }
}
