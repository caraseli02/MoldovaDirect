# LandingMediaMentionsBar Component

## Overview

A responsive "brag bar" component that displays press logos in an auto-scrolling carousel. Inspired by Brightland's press credibility section, it showcases media mentions to build trust and authority.

## Location

`/components/landing/LandingMediaMentionsBar.vue`

## Features

- **Auto-scrolling animation**: Smooth infinite scroll with seamless loop
- **Pause on hover**: Animation pauses when user hovers over logos
- **Responsive design**: Adapts to all screen sizes
- **Accessibility**: Full ARIA labels, keyboard navigation support
- **Motion preferences**: Respects `prefers-reduced-motion` setting
- **i18n support**: Heading text is translatable
- **Grayscale effect**: Logos appear grayscale, full color on hover

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `duration` | `number` | `30` | Animation duration in seconds |

## Usage

### Basic Usage

```vue
<template>
  <LandingMediaMentionsBar />
</template>
```

### Custom Duration

```vue
<template>
  <!-- Faster scroll (20 seconds) -->
  <LandingMediaMentionsBar :duration="20" />
</template>
```

### In Landing Page

```vue
<template>
  <div class="landing-page">
    <!-- Hero section -->
    <LandingHero />

    <!-- Media mentions bar -->
    <LandingMediaMentionsBar />

    <!-- Rest of page -->
    <LandingFeaturedProducts />
  </div>
</template>
```

## Data Structure

Press mentions are defined in the component's data:

```typescript
interface MediaMention {
  id: string      // Unique identifier
  name: string    // Publication name
  logo: string    // Path to logo SVG
  url: string     // Link to article/publication
}
```

## Customization

### Update Press Logos

Replace logos in `/public/images/press/`:
- wine-spectator.svg
- food-wine.svg
- forbes.svg
- nyt.svg
- wsj.svg

**Logo Requirements:**
- Format: SVG (preferred) or PNG
- Width: Max 120px
- Height: 40px
- Style: Grayscale (component handles filter)

### Update Press Links

Edit the `mentions` array in the component:

```typescript
const mentions: MediaMention[] = [
  {
    id: 'wine-spectator',
    name: 'Wine Spectator',
    logo: '/images/press/wine-spectator.svg',
    url: 'https://winespectator.com/article/your-article'
  },
  // Add more mentions...
]
```

### Translate Heading

Update locale files (`i18n/locales/[lang].json`):

```json
{
  "landing": {
    "mediaMentions": {
      "heading": "As Featured In"
    }
  }
}
```

## Styling

### Colors

Uses Tailwind utility classes:
- Background: `bg-cream-50`
- Border: `border-cream-200`
- Text: `text-gray-600`

### Animation

```css
/* Controlled by CSS keyframes */
@keyframes scroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
```

### Fade Edges

Gradient mask creates smooth fade effect:

```css
.mentions-carousel {
  mask-image: linear-gradient(
    to right,
    transparent 0%,
    black 10%,
    black 90%,
    transparent 100%
  );
}
```

## Accessibility

### Keyboard Navigation

- All logos are focusable links (first set only)
- Second set (duplicates) has `tabindex="-1"` and `aria-hidden="true"`

### Screen Readers

- Descriptive `aria-label` on each link: "Read article on [Publication Name]"
- Heading uses semantic structure
- Links open in new tab with `rel="noopener noreferrer"`

### Motion Sensitivity

```css
@media (prefers-reduced-motion: reduce) {
  .animate-scroll {
    animation: none;
  }
}
```

## Performance

### Optimizations

1. **Nuxt Image**: Uses `<NuxtImg>` for optimized loading
2. **Lazy loading**: Images load lazily with `loading="lazy"`
3. **CSS animations**: GPU-accelerated transforms
4. **Duplicate set**: Seamless infinite loop without JavaScript

### Event Listeners

Component properly cleans up event listeners:

```typescript
onMounted(() => {
  carouselTrack.value?.addEventListener('mouseenter', pauseAnimation)
  carouselTrack.value?.addEventListener('mouseleave', resumeAnimation)
})

onUnmounted(() => {
  carouselTrack.value?.removeEventListener('mouseenter', pauseAnimation)
  carouselTrack.value?.removeEventListener('mouseleave', resumeAnimation)
})
```

## Testing

### Manual Testing Checklist

- [ ] Auto-scroll animation works smoothly
- [ ] Animation pauses on hover
- [ ] Animation resumes after hover
- [ ] All logos load correctly
- [ ] Links open in new tabs
- [ ] Responsive on mobile, tablet, desktop
- [ ] Works with screen reader
- [ ] Respects motion preferences
- [ ] i18n heading displays correctly

### Browser Testing

- Chrome/Edge (Chromium)
- Firefox
- Safari (iOS and macOS)

## Browser Support

- Modern browsers (last 2 versions)
- CSS `mask-image` support (all modern browsers)
- CSS animations (universal support)

## Known Issues

None currently.

## Future Enhancements

Potential improvements:

1. **CMS Integration**: Fetch mentions from Supabase/CMS
2. **Analytics**: Track click-through rates
3. **A/B Testing**: Test different logo arrangements
4. **Dynamic Speed**: Adjust speed based on number of logos
5. **Touch Gestures**: Swipe to pause/resume on mobile

## Related Components

- `LandingHero.vue` - Hero section
- `LandingFeaturedProducts.vue` - Product showcase
- `LandingSocialProof.vue` - Testimonials

## References

- [Brightland Design Pattern](https://brightland.co/)
- [MDN - CSS mask-image](https://developer.mozilla.org/en-US/docs/Web/CSS/mask-image)
- [MDN - prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)
