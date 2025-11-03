# Image Assets TODO

This document tracks placeholder images that should be replaced with actual product photography.

## Current Status

All home page images are currently using Unsplash placeholder images. These should be replaced with professional product photography of your Moldovan products.

## Images to Replace

### Category Grid (`components/home/CategoryGrid.vue`)
**Source:** `composables/useHomeContent.ts` lines 90-97

| Category | Current Placeholder | Recommended Image |
|----------|-------------------|-------------------|
| **Wines** | Unsplash wine bottles | Photo of your Moldovan wine selection with bottles displayed elegantly |
| **Gourmet** | Unsplash food spread | Photo of your gourmet Moldovan food products (jams, honey, preserves) |
| **Gifts** | Unsplash gift boxes | Photo of your curated gift hampers with Moldovan products |
| **Subscriptions** | Unsplash boxes | Photo of your monthly subscription box with products |

**Recommended specs:**
- Resolution: 1200x800px minimum (landscape orientation)
- Format: WEBP or JPG
- Quality: High (80-90%)
- Style: Bright, clean backgrounds with good lighting

---

### Collections Showcase (`components/home/CollectionsShowcase.vue`)
**Source:** `components/home/CollectionsShowcase.vue` lines 72-114

| Collection | Current Placeholder | Recommended Image |
|-----------|-------------------|-------------------|
| **Reserve Cellar** | Unsplash wine cellar | Photo of premium Moldovan wines in an elegant setting |
| **Artisan Pantry** | Unsplash pantry items | Photo of artisan Moldovan gourmet products beautifully arranged |
| **Weekend Tasting** | Unsplash wine tasting | Photo of Moldovan wine and food pairing experience |

**Recommended specs:**
- Reserve Cellar: 1400x900px (larger card)
- Artisan Pantry: 900x600px
- Weekend Tasting: 900x600px
- Format: WEBP or JPG
- Quality: High (80-90%)
- Style: Atmospheric, lifestyle-oriented photos

---

### Hero Section (`components/home/HeroSection.vue`)
**Source:** `components/home/HeroSection.vue` line 45

Currently using: Unsplash food delivery image

**Recommended replacement:**
- Hero image showcasing Moldovan products and delivery
- Resolution: 1200x800px minimum
- Format: WEBP or JPG
- Style: Hero-quality photography with products prominently displayed
- Optional: Include delivery elements (box, packaging) to reinforce the delivery message

---

## Directory Structure

When ready to add real images, create this structure:

```
public/
  images/
    home/
      categories/
        signature-wines.jpg
        gourmet-pantry.jpg
        gift-hampers.jpg
        monthly-boxes.jpg
      collections/
        reserve-cellar.jpg
        artisan-pantry.jpg
        weekend-tasting.jpg
      hero.jpg
```

## How to Replace

1. Add your images to the appropriate directories above
2. Update the image paths in:
   - `composables/useHomeContent.ts` (lines 90-97)
   - `components/home/CollectionsShowcase.vue` (lines 81, 94, 107)
   - `components/home/HeroSection.vue` (line 45)
3. Remove the TODO comments
4. Test that all images load correctly

## Image Optimization Tips

- Use modern formats (WEBP) for better performance
- Compress images before uploading (use tools like TinyPNG or Squoosh)
- Consider using responsive images with different sizes
- Add proper alt text for accessibility
- Use lazy loading for below-the-fold images (already implemented with NuxtImg)

## Questions?

If you need help sourcing or optimizing product photography, consider:
- Professional product photographer
- Unsplash/Pexels for temporary high-quality placeholders
- Image optimization services (Cloudinary, imgix, etc.)
