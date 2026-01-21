/**
 * Hero Video Management Composable
 *
 * Manages random selection and configuration of hero section background videos.
 * Follows best practices for landing page video performance and UX.
 *
 * Features:
 * - Random video selection on mount
 * - Mobile detection (shows poster image on small screens)
 * - Support for multiple video formats (WebM + MP4)
 * - Lazy poster image loading
 *
 * Usage:
 * const { currentVideo, showVideo } = useHeroVideos()
 */

export interface HeroVideo {
  id: string
  webm: string
  mp4: string
  poster: string
  alt: string
}

export const useHeroVideos = () => {
  /**
   * Video library configuration
   *
   * IMPORTANT: Add your video files to /public/videos/hero/ directory
   *
   * File naming convention:
   * - hero-{number}.webm (primary format, better compression)
   * - hero-{number}.mp4 (fallback for Safari/older browsers)
   * - hero-{number}-poster.jpg (loading state image)
   *
   * Video optimization guidelines:
   * - Duration: 5-15 seconds (loop seamlessly)
   * - Resolution: 1920x1080 or 1280x720
   * - File size: <5MB per video (WebM), <8MB (MP4)
   * - Frame rate: 24-30fps
   * - Codec: VP9 (WebM), h.264 (MP4)
   * - Must be muted (autoplay requirement)
   *
   * Example files:
   * /public/videos/hero/hero-1.webm
   * /public/videos/hero/hero-1.mp4
   * /public/videos/hero/hero-1-poster.jpg
   */
  const videos: HeroVideo[] = [
    {
      id: 'vineyard-sunset',
      webm: '/videos/hero/hero-1.webm',
      mp4: '/videos/hero/hero-1.mp4',
      poster: '/videos/hero/hero-1-poster.jpg',
      alt: 'Moldovan vineyard at sunset',
    },
    {
      id: 'wine-pouring',
      webm: '/videos/hero/hero-2.webm',
      mp4: '/videos/hero/hero-2.mp4',
      poster: '/videos/hero/hero-2-poster.jpg',
      alt: 'Premium Moldovan wine being poured',
    },
    {
      id: 'cellar-barrels',
      webm: '/videos/hero/hero-3.webm',
      mp4: '/videos/hero/hero-3.mp4',
      poster: '/videos/hero/hero-3-poster.jpg',
      alt: 'Traditional wine cellar with oak barrels',
    },
    {
      id: 'vineyard-aerial',
      webm: '/videos/hero/hero-4.webm',
      mp4: '/videos/hero/hero-4.mp4',
      poster: '/videos/hero/hero-4-poster.jpg',
      alt: 'Aerial view of Moldovan vineyards at golden hour',
    },
    // Temporarily disabled until webm file is generated
    // Run: bash scripts/generate-hero-assets.sh after installing ffmpeg
    // {
    //   id: 'table-service',
    //   webm: '/videos/hero/hero-5.webm',
    //   mp4: '/videos/hero/hero-5.mp4',
    //   poster: '/videos/hero/hero-5-poster.jpg',
    //   alt: 'Serving Moldovan wine and delicacies on a table'
    // }
    // Add more videos here as needed
  ]

  /**
   * Randomly select a video from the library
   * Selection persists for the page session via useState
   */
  const getRandomVideo = (): HeroVideo => {
    // Validate videos array is not empty
    if (videos.length === 0) {
      console.error('[useHeroVideos] No videos configured in video library')
      throw new Error('Hero video library is empty. Add videos to the array.')
    }

    const randomIndex = Math.floor(Math.random() * videos.length)
    const selectedVideo = videos[randomIndex]

    // Validate video object structure
    if (!selectedVideo || !selectedVideo.id) {
      console.error('[useHeroVideos] Invalid video object selected:', selectedVideo)
      // Fallback to first video if available
      return videos[0] as HeroVideo
    }

    return selectedVideo
  }

  // Select video once per page load
  const currentVideo = useState<HeroVideo>('hero-video', getRandomVideo)

  /**
   * Determine if video should play
   * Performance optimization: Let video load on all devices, but use CSS media queries
   * to hide it on mobile. This eliminates hydration blocking from device detection.
   * Mobile users will see the poster image via CSS, saving bandwidth.
   */
  const showVideo = computed(() => {
    // Always true to prevent hydration mismatches
    // CSS handles hiding video on mobile: @media (max-width: 768px) { video { display: none; } }
    return true
  })

  return {
    videos,
    currentVideo,
    showVideo,
  }
}
