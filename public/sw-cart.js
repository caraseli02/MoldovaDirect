// Cart-specific service worker for caching cart data and operations
const CART_CACHE_NAME = 'moldova-direct-cart-v1'
const CART_DATA_CACHE_NAME = 'moldova-direct-cart-data-v1'
const PRODUCT_IMAGES_CACHE_NAME = 'moldova-direct-product-images-v1'

// Cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate'
}

// URLs to cache for cart functionality
const CART_URLS = [
  '/cart',
  '/api/products',
  '/api/categories'
]

// Install event - cache essential cart resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CART_CACHE_NAME)
      .then((cache) => {
        return cache.addAll(CART_URLS)
      })
      .then(() => {
        return self.skipWaiting()
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName.startsWith('moldova-direct-cart-') && 
                cacheName !== CART_CACHE_NAME && 
                cacheName !== CART_DATA_CACHE_NAME &&
                cacheName !== PRODUCT_IMAGES_CACHE_NAME) {
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        return self.clients.claim()
      })
  )
})

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Handle cart data requests
  if (url.pathname.includes('/api/products') || url.pathname.includes('/api/categories')) {
    event.respondWith(handleApiRequest(request))
  }
  // Handle product images
  else if (request.destination === 'image' && url.pathname.includes('product')) {
    event.respondWith(handleImageRequest(request))
  }
  // Handle cart page
  else if (url.pathname === '/cart') {
    event.respondWith(handleCartPageRequest(request))
  }
})

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
  const cache = await caches.open(CART_DATA_CACHE_NAME)
  
  try {
    // Try network first
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      // Cache successful responses
      cache.put(request, networkResponse.clone())
      return networkResponse
    }
    
    // If network fails, try cache
    const cachedResponse = await cache.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    return networkResponse
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await cache.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Return offline response
    return new Response(
      JSON.stringify({ 
        error: 'Offline', 
        message: 'No network connection and no cached data available' 
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

// Handle image requests with cache-first strategy
async function handleImageRequest(request) {
  const cache = await caches.open(PRODUCT_IMAGES_CACHE_NAME)
  
  // Try cache first
  const cachedResponse = await cache.match(request)
  if (cachedResponse) {
    return cachedResponse
  }
  
  try {
    // If not in cache, fetch from network
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      // Cache the image
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    // Return placeholder image if both cache and network fail
    return new Response(
      '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#f3f4f6"/><text x="100" y="100" text-anchor="middle" dy=".3em" fill="#9ca3af">Image unavailable</text></svg>',
      {
        headers: { 'Content-Type': 'image/svg+xml' }
      }
    )
  }
}

// Handle cart page with stale-while-revalidate strategy
async function handleCartPageRequest(request) {
  const cache = await caches.open(CART_CACHE_NAME)
  
  // Get cached version immediately
  const cachedResponse = await cache.match(request)
  
  // Fetch fresh version in background
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  }).catch(() => {
    // Network failed, return cached version if available
    return cachedResponse
  })
  
  // Return cached version immediately if available, otherwise wait for network
  return cachedResponse || fetchPromise
}

// Handle cart data synchronization messages
self.addEventListener('message', (event) => {
  const { type, data } = event.data
  
  switch (type) {
    case 'CACHE_CART_DATA':
      handleCacheCartData(data)
      break
    case 'CLEAR_CART_CACHE':
      handleClearCartCache()
      break
    case 'SYNC_CART_DATA':
      handleSyncCartData(data)
      break
  }
})

// Cache cart data for offline access
async function handleCacheCartData(cartData) {
  try {
    const cache = await caches.open(CART_DATA_CACHE_NAME)
    const response = new Response(JSON.stringify(cartData), {
      headers: { 'Content-Type': 'application/json' }
    })
    
    await cache.put('/cart-data', response)
  } catch (error) {
    console.error('Failed to cache cart data:', error)
  }
}

// Clear cart cache
async function handleClearCartCache() {
  try {
    await caches.delete(CART_DATA_CACHE_NAME)
    await caches.delete(PRODUCT_IMAGES_CACHE_NAME)
  } catch (error) {
    console.error('Failed to clear cart cache:', error)
  }
}

// Sync cart data when online
async function handleSyncCartData(cartData) {
  try {
    // This would typically sync with your backend
    // For now, we'll just update the cache
    await handleCacheCartData(cartData)
    
    // Notify all clients that sync is complete
    const clients = await self.clients.matchAll()
    clients.forEach(client => {
      client.postMessage({
        type: 'CART_SYNC_COMPLETE',
        data: cartData
      })
    })
  } catch (error) {
    console.error('Failed to sync cart data:', error)
  }
}

// Background sync for cart data
self.addEventListener('sync', (event) => {
  if (event.tag === 'cart-sync') {
    event.waitUntil(syncCartData())
  }
})

async function syncCartData() {
  try {
    const cache = await caches.open(CART_DATA_CACHE_NAME)
    const cachedResponse = await cache.match('/cart-data')
    
    if (cachedResponse) {
      const cartData = await cachedResponse.json()
      
      // Sync with backend (implement your sync logic here)
      // For now, we'll just log the sync attempt
      console.log('Syncing cart data:', cartData)
    }
  } catch (error) {
    console.error('Background sync failed:', error)
  }
}