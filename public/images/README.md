# Hero Poster Image

## Required Image File

Place your hero poster image in this directory:

**hero-poster.jpg** (1920x1080, optimized WebP)
- Used as:
  - Video poster frame (desktop)
  - Main background image (mobile)
  - Fallback when video fails to load
- Format: WebP preferred, JPG fallback
- Dimensions: 1920x1080 (16:9 aspect ratio)
- File size target: < 200KB after optimization

## Image Content Suggestions

- High-quality vineyard landscape
- Wine bottles with Moldovan backdrop
- Winery cellar with barrels
- Rolling hills of Moldova

## Optimization

Use [Squoosh](https://squoosh.app/) or ImageOptim:
- WebP format, quality 80-85
- Remove metadata
- Target < 200KB file size

## Example using ImageMagick

```bash
# Convert to WebP
convert hero-poster.jpg -quality 85 -resize 1920x1080^ \
  -gravity center -extent 1920x1080 hero-poster.webp

# Optimize JPG
convert hero-poster.jpg -quality 80 -resize 1920x1080^ \
  -gravity center -extent 1920x1080 -strip hero-poster-optimized.jpg
```
