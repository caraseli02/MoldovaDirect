# Landing Page Dependencies

## Animation Libraries

### @vueuse/motion (v3.0.3)
**Purpose**: Scroll and entry animations
**Size**: ~20KB
**Usage**:
```typescript
v-motion
:initial="{ opacity: 0, y: 50 }"
:visible-once="{ opacity: 1, y: 0 }"
```

### embla-carousel-vue (v8.6.0)
**Purpose**: Lightweight carousel for product showcases
**Size**: ~7KB
**Why over Swiper**: Smaller bundle, better performance for simple carousels
**Usage**: Product grid carousels, testimonials

### swiper (v12.0.3)
**Purpose**: Advanced carousels with autoplay and effects
**Size**: ~45KB
**Usage**: Hero section video carousel, complex multi-slide layouts

## Image Optimization

### @nuxt/image (v1.11.0)
**Purpose**: Automatic image optimization and responsive images
**Features**:
- WebP/AVIF format conversion
- Automatic responsive srcset
- Lazy loading
- Blur placeholder support

## Already Available

### @vueuse/core (v13.9.0)
**Useful Composables**:
- `useIntersectionObserver` - Scroll detection
- `usePreferredReducedMotion` - Accessibility
- `useRafFn` - Parallax effects
- `useScroll` - Scroll tracking
- `useWindowSize` - Responsive breakpoints

### lottie-web (v5.13.0)
**Purpose**: Optional icon animations
**Usage**: Micro-interactions, loading states

## Motion Configuration

Located in `nuxt.config.ts`:
```typescript
motion: {
  directives: {
    'pop-bottom': {
      initial: { scale: 0, opacity: 0, y: 100 },
      visible: { scale: 1, opacity: 1, y: 0 }
    }
  }
}
```

## Bundle Size Strategy

1. **Lightweight First**: Use embla-carousel-vue for simple carousels
2. **Only When Needed**: Use Swiper for advanced features (autoplay, effects)
3. **Code Splitting**: Dynamic imports for heavy components
4. **Tree Shaking**: Import only needed VueUse composables

## Performance Targets

- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Total Blocking Time: < 200ms
- Cumulative Layout Shift: < 0.1
