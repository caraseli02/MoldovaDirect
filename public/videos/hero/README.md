# Hero Video Assets

This directory contains background videos for the landing page hero section.

## 📁 File Structure

Each video requires **3 files**:

```
hero-{number}.webm        # Primary format (best compression)
hero-{number}.mp4         # Fallback (Safari/older browsers)
hero-{number}-poster.jpg  # Loading state image
```

### Example:
```
hero-1.webm
hero-1.mp4
hero-1-poster.jpg

hero-2.webm
hero-2.mp4
hero-2-poster.jpg
```

## 🎬 Video Specifications

### Technical Requirements
- **Duration**: 5-15 seconds (must loop seamlessly)
- **Resolution**: 1920x1080 (Full HD) or 1280x720 (HD)
- **Aspect Ratio**: 16:9
- **Frame Rate**: 24-30 fps
- **Audio**: None (must be muted for autoplay)

### File Size Targets
- **WebM**: <5MB (VP9 codec)
- **MP4**: <8MB (h.264 codec)
- **Poster**: <200KB (JPEG, optimized)

### Content Guidelines
- Focus on Moldovan vineyards, wine production, or products
- Smooth, cinematic movements (avoid jerky camera work)
- Warm, inviting color palette (burgundy, gold, earth tones)
- Should loop seamlessly (start/end should match)
- No text or logos (content goes in foreground)

## 🛠️ Encoding Recommendations

### FFmpeg Commands

**WebM (VP9 codec):**
```bash
ffmpeg -i input.mp4 -c:v libvpx-vp9 -b:v 2M -vf scale=1920:1080 -an -t 10 hero-1.webm
```

**MP4 (h.264 codec):**
```bash
ffmpeg -i input.mp4 -c:v libx264 -preset slow -crf 22 -vf scale=1920:1080 -an -t 10 hero-1.mp4
```

**Poster Image (extract first frame):**
```bash
ffmpeg -i hero-1.mp4 -ss 00:00:01 -vframes 1 -q:v 2 hero-1-poster.jpg
```

### Online Tools (if FFmpeg unavailable)
- [CloudConvert](https://cloudconvert.com/) - Video format conversion
- [Compressor.io](https://compressor.io/) - Image optimization
- [HandBrake](https://handbrake.fr/) - Desktop video encoder

## 🎯 Performance Best Practices

1. **Always provide both formats** - WebM for modern browsers, MP4 for Safari
2. **Optimize file size** - Smaller = faster loading = better UX
3. **Test loop points** - Ensure smooth transitions when video loops
4. **Mobile fallback** - System automatically shows poster on mobile (<768px)
5. **Lazy loading** - Videos load with `fetchpriority="high"` on hero section

## 🔄 Adding New Videos

1. Add your 3 files to this directory (webm, mp4, poster)
2. Update `/composables/useHeroVideos.ts` to include new video:

```typescript
const videos: HeroVideo[] = [
  // ... existing videos
  {
    id: 'your-video-name',
    webm: '/videos/hero/hero-4.webm',
    mp4: '/videos/hero/hero-4.mp4',
    poster: '/videos/hero/hero-4-poster.jpg',
    alt: 'Descriptive alt text for accessibility'
  }
]
```

3. Clear cache and test:
```bash
pkill -9 node && rm -rf .nuxt node_modules/.vite && npm run dev
```

## 📊 Current Videos

- `hero-1.*` - Vineyard sunset scene
- `hero-2.*` - Wine pouring close-up
- `hero-3.*` - Cellar with oak barrels

## ⚠️ Important Notes

- **DO NOT** commit large video files (>10MB) to git
- Consider using CDN for video hosting in production
- Test on multiple browsers (Chrome, Safari, Firefox)
- Verify autoplay works (requires muted attribute)
- Ensure videos are compressed before upload

## 🔗 Resources

- [Web Video Best Practices](https://web.dev/fast/#optimize-your-videos)
- [FFmpeg Documentation](https://ffmpeg.org/documentation.html)
- [Can I Use - Video Formats](https://caniuse.com/?search=video%20format)

---

**Last Updated**: 2025-11-23
**Maintained by**: Development Team
