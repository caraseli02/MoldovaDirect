/**
 * Composable for handling image loading errors with fallback images
 */
export const useImageFallback = () => {
  const fallbackImages = {
    product: '/images/fallbacks/product-fallback.svg',
    portrait: '/images/fallbacks/portrait-fallback.svg',
    landscape: '/images/fallbacks/landscape-fallback.svg',
    avatar: '/images/fallbacks/avatar-fallback.svg',
    video: '/images/fallbacks/video-fallback.svg'
  }

  /**
   * Handle image loading error by replacing with fallback
   * @param event - The error event from img/NuxtImg element
   * @param type - The type of fallback image to use
   */
  const handleImageError = (event: Event, type: keyof typeof fallbackImages = 'landscape') => {
    const target = event.target as HTMLImageElement

    // Prevent infinite loop if fallback also fails
    if (target.src.includes('/images/fallbacks/')) {
      console.error('Fallback image also failed to load:', target.src)
      return
    }

    const fallbackUrl = fallbackImages[type]

    // Log the error for monitoring
    if (process.client) {
      console.warn('Image failed to load:', target.src, '→ Using fallback:', fallbackUrl)
    }

    // Replace with fallback image
    target.src = fallbackUrl
    target.alt = `${type} image unavailable`
  }

  /**
   * Get fallback image URL for a specific type
   * @param type - The type of fallback image
   */
  const getFallbackImage = (type: keyof typeof fallbackImages = 'landscape'): string => {
    return fallbackImages[type]
  }

  /**
   * Handle video loading error by replacing with static image
   * @param event - The error event from video element
   * @param fallbackImageUrl - The fallback image URL to display
   */
  const handleVideoError = (event: Event, fallbackImageUrl?: string) => {
    const video = event.target as HTMLVideoElement
    const container = video.parentElement

    if (!container) {
      console.error('Video error: No parent container found')
      return
    }

    // Log the error
    if (process.client) {
      console.warn('Video failed to load:', video.src, '→ Using image fallback')
    }

    // Hide the video
    video.style.display = 'none'

    // Create fallback image if it doesn't exist
    let fallbackImg = container.querySelector('.video-fallback-image') as HTMLImageElement

    if (!fallbackImg) {
      fallbackImg = document.createElement('img')
      fallbackImg.className = 'video-fallback-image absolute inset-0 w-full h-full object-cover'
      fallbackImg.src = fallbackImageUrl || fallbackImages.video
      fallbackImg.alt = 'Video unavailable'
      container.appendChild(fallbackImg)
    }
  }

  return {
    handleImageError,
    handleVideoError,
    getFallbackImage
  }
}
