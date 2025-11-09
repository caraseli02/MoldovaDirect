# Hero Section Demo Images & Videos

Demo placeholder assets for the hero section while you prepare custom Moldova content.

## 🖼️ Demo Background Images (Unsplash)

### Currently Active
```
https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=1920&q=85&fit=crop&auto=format
```
**Description**: Vineyard landscape with rolling hills at golden hour
**Best for**: Wide scenic shots, emphasizing heritage and tradition

---

### Alternative Options

#### Option 2: Wine Cellar & Barrels
```
https://images.unsplash.com/photo-1474722883778-792e7990302f?w=1920&q=85&fit=crop&auto=format
```
**Description**: Wine barrels in traditional cellar
**Best for**: Craftsmanship, aging process, premium quality

#### Option 3: Vineyard Rows
```
https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=1920&q=85&fit=crop&auto=format
```
**Description**: Organized vineyard rows, perfect symmetry
**Best for**: Precision, order, professional winemaking

#### Option 4: Grapes Close-up
```
https://images.unsplash.com/photo-1602421161362-fccabdf1330a?w=1920&q=85&fit=crop&auto=format
```
**Description**: Rich purple grapes on the vine
**Best for**: Product focus, harvest season, natural beauty

#### Option 5: Wine Tasting
```
https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=1920&q=85&fit=crop&auto=format
```
**Description**: Wine glasses with red wine, tasting experience
**Best for**: Social experience, celebration, lifestyle

#### Option 6: Sunset Vineyard
```
https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1920&q=85&fit=crop&auto=format
```
**Description**: Vineyard path at sunset with dramatic sky
**Best for**: Romance, journey, destination

## 🎥 Demo Video Placeholders

### Free Stock Video Sources

1. **Pexels Videos** (Free, high quality)
   - Search: "vineyard"
   - Search: "wine pouring"
   - Search: "wine grapes"
   - Download WebM + MP4 formats
   - URL: https://www.pexels.com/videos/

2. **Pixabay Videos** (Free, no attribution required)
   - Search: "winery"
   - Search: "wine cellar"
   - Download as WebM and MP4
   - URL: https://pixabay.com/videos/

3. **Coverr** (Free, curated)
   - Categories: Food & Drink
   - Keywords: wine, vineyard, grapes
   - URL: https://coverr.co/

### Recommended Video Specs
```
Format: WebM (VP9) + MP4 (H.264) for compatibility
Resolution: 1920x1080 (1080p)
Frame Rate: 30fps
Duration: 10-30 seconds (looping)
File Size: <5MB (WebM), <8MB (MP4)
Bitrate: 2-4 Mbps
```

## 🔄 How to Use These Placeholders

### Switch to a Different Image
In `pages/index.vue`, replace the `background-image` prop:

```vue
<HomeVideoHero
  background-image="https://images.unsplash.com/photo-NEW-IMAGE-ID?w=1920&q=85&fit=crop&auto=format"
  background-image-alt="Your new image description"
  ...
/>
```

### Enable Video Mode
1. Download a video from Pexels/Pixabay
2. Convert to WebM and MP4 (use https://cloudconvert.com/)
3. Place in `/public/videos/` folder:
   - `hero.webm`
   - `hero.mp4`
   - `hero-poster.jpg` (screenshot for loading state)

4. Update `pages/index.vue`:
```vue
<HomeVideoHero
  :show-video="true"
  video-webm="/videos/hero.webm"
  video-mp4="/videos/hero.mp4"
  poster-image="/videos/hero-poster.jpg"
  ...
/>
```

### Use Pure Gradient (No Media)
Remove the `background-image` prop entirely:

```vue
<HomeVideoHero
  :show-video="false"
  <!-- No background-image prop -->
  ...
/>
```

This will use the wine-burgundy gradient with decorative elements.

## 📐 Image URL Parameters

Unsplash supports dynamic image transformations via URL parameters:

```
?w=1920          # Width in pixels
&h=1080          # Height in pixels (optional, maintains aspect ratio if omitted)
&q=85            # Quality (0-100, default 75)
&fit=crop        # How to fit image (crop, clip, fill, scale)
&auto=format     # Automatic format selection (WebP for modern browsers)
&fm=webp         # Force specific format
&dpr=2           # Device pixel ratio (for retina displays)
```

### Example: Retina-optimized image
```
https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=1920&q=85&fit=crop&auto=format&dpr=2
```

## 🎨 Matching Brand Colors

When selecting images, ensure they contain:
- **Burgundy/Wine Red**: 40%+ of image (dominant)
- **Gold/Warm tones**: 30% (sunlight, highlights)
- **Green tones**: 20% (vineyard, nature)
- **Neutral backgrounds**: 10% (sky, earth)

Good matches:
- ✅ Sunset vineyards (warm golden hour light)
- ✅ Wine barrels in warm-lit cellars
- ✅ Deep red/purple grapes
- ❌ Avoid: Cold blue tones, harsh daylight, gray/industrial

## 📝 Attribution (Optional but Appreciated)

While Unsplash doesn't require attribution, it's good practice:

```html
<!-- Add to footer or credits page -->
Photo by [Photographer Name](unsplash.com/@username) on Unsplash
```

Find photographer credits in the Unsplash URL or on the image page.

## 🚀 Production Readiness

Before going live, replace demo assets with:

1. **Custom Photography**
   - Hire Moldova-based photographer
   - Shoot actual Moldova vineyards/wineries
   - Capture authentic producers and products
   - Budget: €300-500 for professional shoot

2. **Stock Photography** (if budget-constrained)
   - Adobe Stock: Moldova-specific searches
   - iStock: Higher quality than free alternatives
   - Shutterstock: Large wine/vineyard collection

3. **Optimize for Production**
   - Convert to WebP format
   - Generate @2x retina versions
   - Create responsive variants (mobile, tablet, desktop)
   - Follow specs in `/docs/hero-image-requirements.md`

---

**Last Updated**: 2025-01-09
**Related Docs**: `/docs/hero-image-requirements.md`
