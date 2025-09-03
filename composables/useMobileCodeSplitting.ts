/**
 * Mobile-specific code splitting composable
 * Dynamically loads components and features based on device type
 */
export const useMobileCodeSplitting = () => {
  const { isMobile, isTablet } = useDevice()
  const loadedComponents = ref(new Set<string>())
  const loadingComponents = ref(new Set<string>())
  
  // Component registry for lazy loading
  const componentRegistry = {
    // Mobile-specific components
    mobile: {
      VirtualProductGrid: () => import('~/components/mobile/VirtualProductGrid.vue'),
      PullToRefreshIndicator: () => import('~/components/mobile/PullToRefreshIndicator.vue'),
      PWAInstallPrompt: () => import('~/components/mobile/PWAInstallPrompt.vue'),
      PWAUpdatePrompt: () => import('~/components/mobile/PWAUpdatePrompt.vue'),
      OfflineIndicator: () => import('~/components/mobile/OfflineIndicator.vue')
    },
    
    // Desktop-specific components
    desktop: {
      ProductTableView: () => import('~/components/desktop/ProductTableView.vue'),
      AdvancedFilters: () => import('~/components/desktop/AdvancedFilters.vue'),
      ProductComparison: () => import('~/components/desktop/ProductComparison.vue')
    },
    
    // Tablet-specific components
    tablet: {
      TabletProductGrid: () => import('~/components/tablet/TabletProductGrid.vue'),
      TabletNavigation: () => import('~/components/tablet/TabletNavigation.vue')
    },
    
    // Feature-based components
    features: {
      ImageGallery: () => import('~/components/product/ImageGallery.vue'),
      ProductReviews: () => import('~/components/product/ProductReviews.vue'),
      RecommendationEngine: () => import('~/components/product/RecommendationEngine.vue'),
      AdvancedSearch: () => import('~/components/search/AdvancedSearch.vue')
    }
  }
  
  // Load component based on device type
  const loadComponent = async (componentName: string, category?: 'mobile' | 'desktop' | 'tablet' | 'features') => {
    const componentKey = `${category || 'features'}.${componentName}`
    
    // Return if already loaded
    if (loadedComponents.value.has(componentKey)) {
      return
    }
    
    // Return if already loading
    if (loadingComponents.value.has(componentKey)) {
      return
    }
    
    loadingComponents.value.add(componentKey)
    
    try {
      let componentLoader
      
      if (category) {
        componentLoader = componentRegistry[category]?.[componentName as keyof typeof componentRegistry[typeof category]]
      } else {
        // Auto-detect based on device
        if (isMobile.value && componentRegistry.mobile[componentName as keyof typeof componentRegistry.mobile]) {
          componentLoader = componentRegistry.mobile[componentName as keyof typeof componentRegistry.mobile]
        } else if (isTablet.value && componentRegistry.tablet[componentName as keyof typeof componentRegistry.tablet]) {
          componentLoader = componentRegistry.tablet[componentName as keyof typeof componentRegistry.tablet]
        } else if (componentRegistry.desktop[componentName as keyof typeof componentRegistry.desktop]) {
          componentLoader = componentRegistry.desktop[componentName as keyof typeof componentRegistry.desktop]
        } else {
          componentLoader = componentRegistry.features[componentName as keyof typeof componentRegistry.features]
        }
      }
      
      if (componentLoader) {
        await componentLoader()
        loadedComponents.value.add(componentKey)
      }
    } catch (error) {
      console.error(`Failed to load component ${componentKey}:`, error)
    } finally {
      loadingComponents.value.delete(componentKey)
    }
  }
  
  // Preload components based on device type
  const preloadDeviceComponents = async () => {
    const componentsToLoad: Array<{ name: string; category: 'mobile' | 'desktop' | 'tablet' }> = []
    
    if (isMobile.value) {
      componentsToLoad.push(
        { name: 'VirtualProductGrid', category: 'mobile' },
        { name: 'PullToRefreshIndicator', category: 'mobile' },
        { name: 'PWAInstallPrompt', category: 'mobile' }
      )
    } else if (isTablet.value) {
      componentsToLoad.push(
        { name: 'TabletProductGrid', category: 'tablet' },
        { name: 'TabletNavigation', category: 'tablet' }
      )
    } else {
      componentsToLoad.push(
        { name: 'ProductTableView', category: 'desktop' },
        { name: 'AdvancedFilters', category: 'desktop' }
      )
    }
    
    // Load components in parallel
    await Promise.all(
      componentsToLoad.map(({ name, category }) => loadComponent(name, category))
    )
  }
  
  // Preload feature components based on usage patterns
  const preloadFeatureComponents = async (features: string[]) => {
    await Promise.all(
      features.map(feature => loadComponent(feature, 'features'))
    )
  }
  
  // Load components on demand with intersection observer
  const loadOnIntersection = (elementRef: Ref<HTMLElement | undefined>, componentName: string, category?: 'mobile' | 'desktop' | 'tablet' | 'features') => {
    const { stop } = useIntersectionObserver(
      elementRef,
      ([{ isIntersecting }]) => {
        if (isIntersecting) {
          loadComponent(componentName, category)
          stop() // Stop observing once loaded
        }
      },
      { threshold: 0.1 }
    )
    
    return stop
  }
  
  // Load components based on user interaction
  const loadOnInteraction = (events: string[], componentName: string, category?: 'mobile' | 'desktop' | 'tablet' | 'features') => {
    const loadOnce = () => {
      loadComponent(componentName, category)
      // Remove event listeners after first interaction
      events.forEach(event => {
        document.removeEventListener(event, loadOnce)
      })
    }
    
    events.forEach(event => {
      document.addEventListener(event, loadOnce, { once: true, passive: true })
    })
  }
  
  // Get optimal loading strategy based on device
  const getLoadingStrategy = () => {
    if (isMobile.value) {
      return {
        strategy: 'lazy',
        preloadCritical: true,
        useIntersectionObserver: true,
        deferNonCritical: true
      }
    } else {
      return {
        strategy: 'eager',
        preloadCritical: true,
        useIntersectionObserver: false,
        deferNonCritical: false
      }
    }
  }
  
  // Check if component is loaded
  const isComponentLoaded = (componentName: string, category?: string) => {
    const key = category ? `${category}.${componentName}` : componentName
    return loadedComponents.value.has(key)
  }
  
  // Check if component is loading
  const isComponentLoading = (componentName: string, category?: string) => {
    const key = category ? `${category}.${componentName}` : componentName
    return loadingComponents.value.has(key)
  }
  
  return {
    // State
    loadedComponents: readonly(loadedComponents),
    loadingComponents: readonly(loadingComponents),
    
    // Methods
    loadComponent,
    preloadDeviceComponents,
    preloadFeatureComponents,
    loadOnIntersection,
    loadOnInteraction,
    getLoadingStrategy,
    isComponentLoaded,
    isComponentLoading
  }
}