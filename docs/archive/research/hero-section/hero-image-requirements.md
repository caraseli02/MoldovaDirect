# Hero Background Image Specifications

## Image Dimensions

### Desktop
- Resolution: 1920x1080px (16:9 ratio)
- Viewport: Covers full viewport width
- Minimum height: 75vh

### Tablet
- Resolution: 1024x768px (4:3 ratio)
- Optimized for iPad and similar devices
- Minimum height: 70vh

### Mobile
- Resolution: 750x1334px (portrait)
- Mobile-first approach
- Minimum height: 60vh

## File Requirements

### Format & Compression
- **Primary Format**: WebP
  - Quality: 85% compression
  - Modern browser support (95%+)
  - File size target: <200KB per variant

- **Fallback Format**: JPEG
  - Quality: 80% compression
  - Legacy browser support
  - File size target: <250KB per variant

### Resolution
- **Retina/HiDPI**: @2x variants for high-DPI displays
- **Standard**: @1x for normal displays
- Nuxt Image will handle responsive srcsets automatically

## Content Guidelines

### Option 1: Moldova Vineyard Landscape (Recommended)
- **Scene**: Rolling vineyard hills at golden hour
- **Style**: Soft focus with bokeh effect
- **Tones**: Warm burgundy, gold, and green tones
- **Lighting**: Natural, avoid harsh shadows
- **Composition**: Rule of thirds, leave space for text overlay (left third)

### Option 2: Wine Bottle Product Shot
- **Quantity**: 1-3 bottles maximum
- **Setting**: Natural environment (vineyard, rustic table)
- **Depth**: Shallow depth of field (f/2.8 or lower)
- **Lighting**: Soft, diffused natural light
- **Styling**: Include props (grapes, wine glasses, vineyard elements)

### Option 3: Winemaker Portrait
- **Style**: Environmental portrait in cellar/vineyard
- **Focus**: Authentic Moldova winemaker
- **Purpose**: Storytelling and authenticity
- **Composition**: Subject on right, space for text on left

## Color Palette Requirements

### Must Include These Tones
- **Burgundy/Wine Red**: 40% of image (dominant)
- **Gold/Warm Accents**: 30% (highlights, sunlight)
- **Vineyard Green**: 20% (leaves, landscape)
- **Neutral Backgrounds**: 10% (sky, earth tones)

### Color Matching
Ensure image harmonizes with brand colors:
- Wine Burgundy: `hsl(0 50% 12%)` to `hsl(0 65% 45%)`
- Gold: `hsl(43 62% 48%)`
- Green: `hsl(145 40% 35%)`

## Accessibility Requirements

### Text Overlay Contrast
- **WCAG 2.2 AA Compliance**: Minimum 4.5:1 contrast ratio
- **Testing**: Use WebAIM Contrast Checker
- **Solution**: Dark gradient overlay if needed
  ```css
  background: linear-gradient(to right, rgba(0,0,0,0.8), rgba(0,0,0,0.5));
  ```

### Safe Zones
- **Text Area**: Left 50% of image should be darker/blurred
- **Busy Backgrounds**: Avoid complex patterns behind text
- **Focal Points**: Keep wine bottles/subjects on right side

## Performance Budget

### File Sizes
- **Desktop WebP**: <200KB
- **Desktop JPEG**: <250KB
- **Tablet WebP**: <150KB
- **Mobile WebP**: <100KB
- **Total Hero Section**: <300KB (including CSS/JS)

### Loading Performance
- **LCP Target**: <2.5 seconds
- **Loading Strategy**: Eager loading with fetchpriority="high"
- **Preload**: Critical hero image in `<head>`
- **Format**: Progressive JPEG/WebP for gradual rendering

## Technical Implementation

### File Naming Convention
```
/public/images/hero/
├── moldova-vineyard-desktop.webp
├── moldova-vineyard-desktop.jpg (fallback)
├── moldova-vineyard-tablet.webp
├── moldova-vineyard-mobile.webp
└── moldova-vineyard-mobile.jpg (fallback)
```

### Nuxt Image Configuration
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  image: {
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
    },
    domains: ['moldovadirect.com'],
    presets: {
      hero: {
        modifiers: {
          format: 'webp',
          quality: 85,
          fit: 'cover',
        }
      }
    }
  }
})
```

### Component Usage
```vue
<NuxtImg
  src="/images/hero/moldova-vineyard.webp"
  alt="Moldova vineyard landscape at golden hour sunset"
  width="1920"
  height="1080"
  format="webp"
  quality="85"
  loading="eager"
  fetchpriority="high"
  sizes="100vw"
  preset="hero"
  :img-attrs="{
    class: 'w-full h-full object-cover object-center'
  }"
/>
```

## Image Sources

### Stock Photography Options
1. **Unsplash**: Search "moldova vineyard", "wine landscape"
2. **Pexels**: High-quality free wine/vineyard photos
3. **Adobe Stock**: Premium Moldova vineyard photography
4. **Getty Images**: Professional winery/cellar imagery

### Custom Photography
- **Recommended**: Commission authentic Moldova vineyard photos
- **Budget**: €300-500 for professional photography session
- **Timeline**: 2-3 weeks for shoot + post-processing
- **Rights**: Full commercial usage rights required

## Quality Checklist

Before finalizing image, verify:

- [ ] Image dimensions match specifications (1920x1080 desktop, etc.)
- [ ] File format is WebP with JPEG fallback
- [ ] File size under 200KB (WebP) / 250KB (JPEG)
- [ ] Color palette includes burgundy, gold, and green tones
- [ ] Text overlay area (left 50%) has sufficient contrast
- [ ] No busy patterns behind text placement area
- [ ] Image is sharp at 100% zoom
- [ ] Retina @2x version available
- [ ] Alt text is descriptive and meaningful
- [ ] Image works in both light and dark color schemes
- [ ] Tested on slow 3G connection (loads in <3s)
- [ ] LCP measurement <2.5s on Lighthouse

## Content Security

### Image Rights
- Ensure proper licensing for commercial use
- Attribute photographers if required
- Avoid copyrighted brand imagery (wine labels)
- Use model releases if people are featured

### Brand Compliance
- Image reflects Moldova wine heritage
- Conveys premium quality and authenticity
- Aligns with brand values (tradition, craftsmanship)
- Suitable for all markets (Spain, Romania, international)

## Testing Protocol

### Device Testing
1. **Desktop** (1920x1080, 2560x1440)
2. **Laptop** (1366x768, 1920x1200)
3. **Tablet** (iPad: 1024x768, iPad Pro: 2048x1536)
4. **Mobile** (iPhone SE: 375x667, iPhone 14: 390x844)

### Browser Testing
- Chrome/Edge 95+ ✓
- Safari 14+ ✓
- Firefox 90+ ✓
- Mobile Safari iOS 14+ ✓
- Chrome Android ✓

### Performance Testing
- **Lighthouse**: 95+ Performance score
- **WebPageTest**: <2.5s LCP on 4G
- **GT Metrix**: Grade A for image optimization

---

## Quick Start

### 1. Select Image
Choose from Option 1 (Vineyard), Option 2 (Product), or Option 3 (Winemaker)

### 2. Optimize
Use online tools or Photoshop:
- Resize to 1920x1080px
- Export as WebP (85% quality)
- Export JPEG fallback (80% quality)
- Verify file size <200KB

### 3. Upload
Place in `/public/images/hero/` directory

### 4. Implement
Update VideoHero.vue component with NuxtImg

### 5. Test
Run Lighthouse, check LCP <2.5s, verify WCAG contrast

---

**Last Updated**: 2025-01-09
**Version**: 1.0
**Owner**: Product & Engineering Team
