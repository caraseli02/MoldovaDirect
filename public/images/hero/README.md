# Hero Images

Place optimized hero images here:

## Required Files:
- moldova-vineyard-hero.webp (1920x1080, <200KB)
- moldova-vineyard-hero-mobile.webp (768x1024, <100KB)

## Optimization Guidelines:
1. Use WebP format for best compression
2. Quality: 80-85 for hero images
3. Strip EXIF data
4. Use tools: squoosh.app or imagemagick

## Command to optimize:
```bash
# Using imagemagick
convert input.jpg -quality 85 -resize 1920x1080^ -gravity center -extent 1920x1080 -strip output.webp

# Using cwebp
cwebp -q 85 -resize 1920 1080 input.jpg -o output.webp
```

## TODO:
Replace Unsplash URL in LandingHeroSection.vue with:
`/images/hero/moldova-vineyard-hero.webp`

