# Landing Page Videos - Quick Start Guide

**Goal**: Add background videos to the landing page hero section with random playback.

## 🎯 Current Status

✅ **Infrastructure Ready** - All code implemented
⏳ **Waiting for**: Video assets to be added

## 📦 What's Been Implemented

1. **Composable**: `composables/useHeroVideos.ts`
   - Manages video library
   - Random selection on page load
   - Mobile detection (shows poster on mobile)

2. **Integration**: `pages/index.vue`
   - Connected to video composable
   - Dynamic props for random videos

3. **Directory**: `public/videos/hero/`
   - Ready for video files
   - Includes complete README with specs

4. **Documentation**: `docs/features/landing-videos/`
   - Implementation details
   - Best practices research
   - Setup instructions

## 🚀 How to Add Videos (3 Steps)

### Step 1: Prepare Your Videos

Each video needs **3 files**:

```
hero-1.webm         # Main format (VP9 codec, <5MB)
hero-1.mp4          # Fallback (h.264 codec, <8MB)
hero-1-poster.jpg   # Loading image (<200KB)
```

**Specifications:**
- Duration: 5-15 seconds (loop seamlessly)
- Resolution: 1920x1080 or 1280x720
- No audio (must be muted)
- 24-30fps

**Encoding Example (FFmpeg):**
```bash
# WebM
ffmpeg -i input.mp4 -c:v libvpx-vp9 -b:v 2M -vf scale=1920:1080 -an -t 10 hero-1.webm

# MP4
ffmpeg -i input.mp4 -c:v libx264 -preset slow -crf 22 -vf scale=1920:1080 -an -t 10 hero-1.mp4

# Poster
ffmpeg -i hero-1.mp4 -ss 00:00:01 -vframes 1 -q:v 2 hero-1-poster.jpg
```

### Step 2: Add Files to Project

Copy your video files to:
```
/public/videos/hero/
```

**Example:**
```
public/videos/hero/
├── hero-1.webm
├── hero-1.mp4
├── hero-1-poster.jpg
├── hero-2.webm
├── hero-2.mp4
├── hero-2-poster.jpg
├── hero-3.webm
├── hero-3.mp4
└── hero-3-poster.jpg
```

### Step 3: Update Configuration (if needed)

If your files are named differently, update `/composables/useHeroVideos.ts`:

```typescript
const videos: HeroVideo[] = [
  {
    id: 'vineyard-sunset',
    webm: '/videos/hero/hero-1.webm',
    mp4: '/videos/hero/hero-1.mp4',
    poster: '/videos/hero/hero-1-poster.jpg',
    alt: 'Moldovan vineyard at sunset'
  },
  {
    id: 'wine-pouring',
    webm: '/videos/hero/hero-2.webm',
    mp4: '/videos/hero/hero-2.mp4',
    poster: '/videos/hero/hero-2-poster.jpg',
    alt: 'Premium Moldovan wine being poured'
  },
  // Add more videos here
]
```

### Step 4: Test

```bash
# Clear cache (important!)
pkill -9 node && rm -rf .nuxt node_modules/.vite && npm run dev

# Visit http://localhost:3000
# Refresh multiple times to see random selection
```

## ✅ Testing Checklist

- [ ] Videos autoplay on desktop
- [ ] Poster shows on mobile (<768px)
- [ ] Videos loop seamlessly (no jump)
- [ ] Random selection works (refresh page)
- [ ] No console errors
- [ ] Lighthouse score >90

## 🎨 Video Content Suggestions

**Theme**: Moldovan wine culture

**Ideas:**
1. Vineyard sunset/sunrise panning shot
2. Wine pouring into glass (slow motion)
3. Oak barrels in cellar
4. Grapes on vine close-up
5. Wine tasting/swirling in glass

**Tips:**
- Warm color palette (burgundy, gold, amber)
- Smooth, cinematic movements
- No text/logos (added via UI)
- Ensure loop point matches start/end

## 📊 Expected Performance

| Metric | Desktop | Mobile |
|--------|---------|--------|
| **Load Time** | +1-2s | +0.2s |
| **Bandwidth** | 5-8MB | 200KB |
| **Format** | WebM/MP4 | Poster only |
| **Autoplay** | ✅ Yes | ❌ No (poster) |

## 🔧 Troubleshooting

### Video doesn't play
- Check browser console for errors
- Verify file paths are correct
- Ensure videos are muted (autoplay requirement)

### File too large
- Re-encode with lower bitrate
- Reduce to 1280x720 resolution
- Shorten duration to 5-8 seconds

### Not random
- Clear browser cache
- Check `useHeroVideos.ts` has multiple videos
- Refresh page multiple times

## 📚 Additional Resources

- **Full specs**: `/public/videos/hero/README.md`
- **Implementation**: `docs/features/landing-videos/IMPLEMENTATION.md`
- **FFmpeg guide**: https://ffmpeg.org/documentation.html
- **Online converter**: https://cloudconvert.com/

## 🎥 Temporary Fallback (Before Videos Added)

Currently, the hero section shows a **poster image** until videos are added.

To use the poster until ready:
- No action needed - it's the default fallback
- Videos will automatically activate once files are added

## 🚢 Deployment Notes

**Important for Production:**

1. **Do NOT commit videos to git** (too large)
   - Use `.gitignore` for `*.webm`, `*.mp4` in `/public/videos/`
   - Upload videos directly to server/CDN

2. **Consider CDN** for better performance
   - Cloudflare R2
   - AWS S3 + CloudFront
   - Update paths in `useHeroVideos.ts`

3. **Monitor performance**
   - Check Lighthouse scores
   - Track page load times
   - Monitor bounce rates

## 📞 Need Help?

- **Video specs**: See `/public/videos/hero/README.md`
- **Code details**: See `docs/features/landing-videos/IMPLEMENTATION.md`
- **FFmpeg help**: https://ffmpeg.org/ffmpeg.html

---

**Status**: ✅ Code ready, awaiting video assets
**Last Updated**: 2025-11-23
