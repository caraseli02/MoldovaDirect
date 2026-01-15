# Landing Page Video Implementation

## Prerequisites

- [Add prerequisites here]

## Steps


**Status**: ✅ Implemented (awaiting video assets)
**Date**: 2025-11-23
**Branch**: `claude/add-landing-videos-01Ad34HPYSwhw7PN4za3Qiaa`

## Overview

Implemented a random video background system for the landing page hero section, following industry best practices for performance, UX, and accessibility.

## Architecture

### Components

1. **`composables/useHeroVideos.ts`**
   - Manages video library configuration
   - Handles random selection on page load
   - Device detection for mobile optimization
   - Returns current video and display logic

2. **`components/home/VideoHero.vue`** (existing)
   - Already had full video support
   - Supports WebM + MP4 formats
   - Poster image fallback
   - Mobile-optimized dimensions

3. **`pages/index.vue`** (updated)
   - Integrated `useHeroVideos()` composable
   - Dynamic props based on random selection
   - Automatic mobile/desktop handling

### File Structure

```
public/
└── videos/
    └── hero/
        ├── README.md              # Complete video specifications
        ├── .gitkeep               # Keep directory in git
        ├── hero-1.webm            # Video 1 (WebM format)
        ├── hero-1.mp4             # Video 1 (MP4 fallback)
        ├── hero-1-poster.jpg      # Video 1 loading poster
        ├── hero-2.webm            # Video 2
        ├── hero-2.mp4
        ├── hero-2-poster.jpg
        └── ... (add more as needed)
```

## Features

### ✅ Random Selection
- Videos selected randomly on each page load
- Uses `useState` to persist selection during session
- Cryptographically weak random (sufficient for UX)

### ✅ Performance Optimization
- **Mobile**: Shows poster image only (<768px)
- **Desktop/Tablet**: Full video playback
- Automatic format selection (WebM preferred, MP4 fallback)
- Lazy loading with proper priority

### ✅ Best Practices Compliance

Based on research from:
- [Unbounce - Benefits of Video on Landing Pages](https://unbounce.com/landing-page-articles/the-benefits-of-using-video-on-landing-pages/)
- [Involve.me - Video Landing Pages 2025](https://www.involve.me/blog/video-landing-pages)
- [KlientBoost - Landing Page Video Rules](https://www.klientboost.com/landing-pages/landing-page-video/)
- [vue-responsive-video-background-player](https://www.npmjs.com/package/vue-responsive-video-background-player)

**Implemented guidelines:**
- ✅ Muted autoplay (required for modern browsers)
- ✅ Multiple format support (WebM + MP4)
- ✅ Poster images for loading states
- ✅ Mobile optimization (static image)
- ✅ Short duration recommendation (5-15s)
- ✅ File size targets (<5MB WebM, <8MB MP4)
- ✅ Seamless looping
- ✅ Above-the-fold placement
- ✅ No text in video (overlaid in UI)

## Configuration

### Adding New Videos

**Step 1**: Add video files to `/public/videos/hero/`
```
hero-4.webm
hero-4.mp4
hero-4-poster.jpg
```

**Step 2**: Update `/composables/useHeroVideos.ts`
```typescript
const videos: HeroVideo[] = [
  // ... existing videos
  {
    id: 'new-video-name',
    webm: '/videos/hero/hero-4.webm',
    mp4: '/videos/hero/hero-4.mp4',
    poster: '/videos/hero/hero-4-poster.jpg',
    alt: 'Descriptive alt text for accessibility'
  }
]
```

**Step 3**: Clear cache and test
```bash
pkill -9 node && rm -rf .nuxt node_modules/.vite && npm run dev
```

### Disabling Videos (Fallback to Image/Gradient)

To temporarily disable videos without removing files:

**Option 1**: Set all videos to use poster image
```typescript
// In useHeroVideos.ts
const showVideo = computed(() => false) // Force poster image
```

**Option 2**: Disable in landing config
```typescript
// In useLandingConfig.ts
videoHero: false  // Hides entire section
```

## Video Specifications

### Technical Requirements

| Property | Value |
|----------|-------|
| **Duration** | 5-15 seconds |
| **Resolution** | 1920x1080 or 1280x720 |
| **Aspect Ratio** | 16:9 |
| **Frame Rate** | 24-30 fps |
| **Audio** | None (muted) |
| **WebM Size** | <5MB (VP9 codec) |
| **MP4 Size** | <8MB (h.264 codec) |
| **Poster Size** | <200KB (JPEG) |

### Content Guidelines

- **Theme**: Moldovan vineyards, wine production, or products
- **Style**: Cinematic, smooth camera movements
- **Colors**: Warm palette (burgundy, gold, earth tones)
- **Looping**: Must loop seamlessly (match start/end frames)
- **No overlays**: Text/logos added via UI layer

### Encoding Commands

See `/public/videos/hero/README.md` for complete FFmpeg commands.

**Quick example (WebM):**
```bash
ffmpeg -i input.mp4 -c:v libvpx-vp9 -b:v 2M -vf scale=1920:1080 -an -t 10 hero-1.webm
```

## Testing Checklist

Before adding videos to production:

- [ ] Videos loop seamlessly (no visible jump)
- [ ] File sizes within targets (<5MB WebM, <8MB MP4)
- [ ] Poster images optimized (<200KB)
- [ ] All 3 files present for each video (webm, mp4, poster)
- [ ] Videos autoplay on desktop (Chrome, Safari, Firefox)
- [ ] Poster image shows on mobile (<768px)
- [ ] Random selection works (refresh multiple times)
- [ ] No console errors
- [ ] Lighthouse performance score >90

## Browser Compatibility

| Browser | WebM | MP4 | Autoplay |
|---------|------|-----|----------|
| Chrome  | ✅   | ✅  | ✅ (muted) |
| Firefox | ✅   | ✅  | ✅ (muted) |
| Safari  | ❌   | ✅  | ✅ (muted) |
| Edge    | ✅   | ✅  | ✅ (muted) |

**Fallback strategy**: Safari uses MP4 format automatically.

## Performance Metrics

### Expected Impact
- **Initial Load**: +1-2s (video download)
- **LCP**: Poster image ensures fast initial paint
- **Bandwidth**: ~5-8MB per video (one-time download)
- **Mobile Savings**: 0 MB (poster only, ~200KB)

### Monitoring
- Use Lighthouse to verify performance >90
- Monitor bounce rate for video vs. non-video variants
- Track mobile vs. desktop engagement

## Troubleshooting

### Video doesn't autoplay
- ✅ Ensure `muted` attribute is set (VideoHero.vue:10)
- ✅ Check browser autoplay policy
- ✅ Verify video file exists at correct path

### Video doesn't loop seamlessly
- Re-encode with matching start/end frames
- Use `loop` attribute (VideoHero.vue:11)

### Large file size
- Re-encode with lower bitrate
- Reduce resolution to 1280x720
- Shorten duration to 5-8 seconds

### Mobile shows video instead of poster
- Check `useDevice()` composable is working
- Verify breakpoint is <768px
- Clear browser cache

## Future Enhancements

### Potential Features (not implemented)
- [ ] Video rotation on user interaction
- [ ] A/B testing different videos
- [ ] Analytics tracking (video impressions)
- [ ] CDN hosting for video assets
- [ ] Adaptive bitrate streaming
- [ ] Preloading next video (if rotation enabled)

### Considerations
- **Video rotation**: Could change video every 30-60s
- **Analytics**: Track which videos drive more conversions
- **CDN**: Move videos to Vercel Blob Storage or Supabase Storage for better global delivery

## Related Files

- `/composables/useHeroVideos.ts` - Video management logic
- `/components/home/VideoHero.vue` - Video display component
- `/pages/index.vue` - Landing page integration
- `/public/videos/hero/README.md` - Video specifications
- `/composables/useDevice.ts` - Device detection
- `/composables/useLandingConfig.ts` - Feature flags

## Notes

- Videos are NOT committed to git (too large)
- Use `.gitkeep` to preserve directory structure
- Consider CDN for production deployment
- Follow CLAUDE.md guidelines for all changes
- Test on multiple devices before deploying

---

**Last Updated**: 2025-11-23
**Author**: Claude Code
**Status**: Ready for video assets
