# Hero Video Assets

## Required Video Files

Place your hero video files in this directory:

1. **hero-vineyard.webm** (<5MB, 15-30 seconds, 1920x1080)
   - WebM format (VP9 codec preferred)
   - Optimized for web delivery
   - 15-30 second loop
   - No audio track needed

2. **hero-vineyard.mp4** (<5MB, fallback for Safari)
   - H.264 codec
   - Same specifications as WebM
   - Safari/iOS compatibility

## Video Content Suggestions

- Moldovan vineyard landscapes (rolling hills, vines)
- Wine being poured into a glass
- Traditional winemaking process
- Wine cellar atmosphere
- Moldovan countryside scenes

## Optimization Tips

1. Use [HandBrake](https://handbrake.fr/) or [FFmpeg](https://ffmpeg.org/) for compression
2. Target bitrate: 1-2 Mbps for 1080p
3. Keep file size under 5MB for optimal LCP
4. Test on 3G connection speeds

## FFmpeg Example Commands

### WebM (VP9)
```bash
ffmpeg -i input.mov -c:v libvpx-vp9 -b:v 1.5M -maxrate 2M -bufsize 4M \
  -vf scale=1920:1080 -an -t 30 hero-vineyard.webm
```

### MP4 (H.264)
```bash
ffmpeg -i input.mov -c:v libx264 -preset slow -crf 23 \
  -vf scale=1920:1080 -an -t 30 hero-vineyard.mp4
```

## Performance Targets

- LCP (Largest Contentful Paint): < 2.5s
- File size: < 5MB
- First frame visible: < 1s
- Video plays smoothly on desktop (no video on mobile)
