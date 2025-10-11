# Internationalization (i18n) Configuration

This document describes the internationalization setup and configuration for Moldova Direct, including the recent optimization with lazy loading.

## Overview

Moldova Direct supports 4 languages with optimized performance through lazy loading of translation files. The system uses @nuxtjs/i18n module with custom configuration for optimal user experience.

## Configuration

### Nuxt Configuration

The i18n configuration in `nuxt.config.ts`:

```typescript
i18n: {
  locales: [
    { code: 'es', name: 'Español', file: 'es.json' },
    { code: 'en', name: 'English', file: 'en.json' },
    { code: 'ro', name: 'Română', file: 'ro.json' },
    { code: 'ru', name: 'Русский', file: 'ru.json' }
  ],
  lazy: true,
  langDir: 'locales/',
  defaultLocale: 'es',
  strategy: 'prefix_except_default',
  detectBrowserLanguage: {
    useCookie: true,
    cookieKey: 'i18n_redirected',
    redirectOn: 'root'
  }
}
```

### Key Configuration Options

#### Lazy Loading (`lazy: true`)
- **Purpose**: Improves initial page load performance
- **Behavior**: Translation files are loaded only when the language is first accessed
- **Benefits**: 
  - Reduces initial bundle size
  - Faster first contentful paint
  - Better Core Web Vitals scores
  - Automatic caching of loaded translations

#### Language Directory (`langDir: 'locales/'`)
- **Purpose**: Explicitly defines where translation files are located
- **Benefits**:
  - Clear project structure
  - Better IDE support and autocomplete
  - Easier maintenance and file organization

#### URL Strategy (`strategy: 'prefix_except_default'`)
- **Spanish (default)**: `/products`, `/cart`
- **Other languages**: `/en/products`, `/ro/cart`, `/ru/products`

## Supported Languages

| Code | Language | Native Name | Status |
|------|----------|-------------|---------|
| `es` | Spanish | Español | Default ✅ |
| `en` | English | English | Complete ✅ |
| `ro` | Romanian | Română | Complete ✅ |
| `ru` | Russian | Русский | Complete ✅ |

## File Structure

```
i18n/
└── locales/
    ├── es.json    # Spanish (default) - 100% complete
    ├── en.json    # English - 100% complete
    ├── ro.json    # Romanian - 100% complete
    └── ru.json    # Russian - 100% complete
```

### Translation File Format

Each locale file follows the same nested structure:

```json
{
  "nav": {
    "home": "Home",
    "products": "Products",
    "cart": "Shopping Cart",
    "account": "My Account"
  },
  "auth": {
    "login": "Sign In",
    "register": "Sign Up",
    "logout": "Sign Out",
    "errors": {
      "invalidCredentials": "Invalid email or password",
      "emailRequired": "Email is required"
    }
  },
  "products": {
    "title": "Our Products",
    "addToCart": "Add to Cart",
    "outOfStock": "Out of Stock"
  },
  "cart": {
    "title": "Shopping Cart",
    "empty": "Your cart is empty",
    "total": "Total"
  }
}
```

## Usage Examples

### Basic Translation

```vue
<template>
  <div>
    <h1>{{ $t('products.title') }}</h1>
    <button>{{ $t('products.addToCart') }}</button>
  </div>
</template>
```

### With Parameters

```vue
<template>
  <p>{{ $t('cart.itemCount', { count: items.length }) }}</p>
</template>
```

Translation file:
```json
{
  "cart": {
    "itemCount": "You have {count} items in your cart"
  }
}
```

### Pluralization

```vue
<template>
  <p>{{ $tc('cart.items', itemCount) }}</p>
</template>
```

Translation file:
```json
{
  "cart": {
    "items": "no items | one item | {count} items"
  }
}
```

### Programmatic Usage

```vue
<script setup>
const { t, locale, locales, setLocale } = useI18n()

// Get current locale
console.log(locale.value) // 'es', 'en', 'ro', or 'ru'

// Get all available locales
console.log(locales.value)

// Change language
const switchLanguage = (newLocale) => {
  setLocale(newLocale)
}

// Translate programmatically
const message = t('auth.errors.invalidCredentials')
</script>
```

### Route Localization

```vue
<template>
  <NuxtLink :to="localePath('/products')">
    {{ $t('nav.products') }}
  </NuxtLink>
</template>

<script setup>
const localePath = useLocalePath()
</script>
```

## Performance Optimizations

### Lazy Loading Benefits

With `lazy: true` enabled:

1. **Initial Bundle Size**: Reduced by ~75% (only default language loaded)
2. **First Load**: Faster initial page render
3. **Language Switching**: Smooth loading with automatic caching
4. **Memory Usage**: Lower memory footprint

### Loading Behavior

```typescript
// First visit - only Spanish loaded
// User switches to English - en.json loaded and cached
// User switches back to Spanish - instant (already loaded)
// User switches to Romanian - ro.json loaded and cached
```

### Caching Strategy

- Translation files are cached in browser memory
- Subsequent language switches are instant
- Cache persists during the session
- Files are re-fetched only on page refresh

## Browser Language Detection

The system automatically detects user's preferred language:

```typescript
detectBrowserLanguage: {
  useCookie: true,              // Remember user's choice
  cookieKey: 'i18n_redirected', // Cookie name
  redirectOn: 'root'            // Only redirect on root path
}
```

### Detection Flow

1. Check if user has previously selected a language (cookie)
2. If no cookie, detect browser's preferred language
3. If detected language is supported, redirect to that locale
4. If not supported, use default Spanish
5. Save choice in cookie for future visits

## SEO Considerations

### URL Structure

- **Spanish (default)**: `https://moldovadirect.com/products`
- **English**: `https://moldovadirect.com/en/products`
- **Romanian**: `https://moldovadirect.com/ro/products`
- **Russian**: `https://moldovadirect.com/ru/products`

### Meta Tags

Automatic generation of:
- `hreflang` tags for all language versions
- Localized meta titles and descriptions
- Open Graph tags in appropriate language
- Canonical URLs for each language version

## Development Guidelines

### Adding New Translations

1. **Add to all locale files**:
   ```bash
   # Add the same key to all files
   i18n/locales/es.json
   i18n/locales/en.json
   i18n/locales/ro.json
   i18n/locales/ru.json
   ```

2. **Use consistent key structure**:
   ```json
   {
     "section": {
       "subsection": {
         "key": "value"
       }
     }
   }
   ```

3. **Test all languages**:
   ```bash
   npm run test:i18n
   ```

### Adding New Languages

1. **Create new locale file**:
   ```bash
   touch i18n/locales/fr.json
   ```

2. **Update nuxt.config.ts**:
   ```typescript
   locales: [
     // ... existing locales
     { code: 'fr', name: 'Français', file: 'fr.json' }
   ]
   ```

3. **Add to Supabase redirects**:
   ```typescript
   exclude: [..., '/fr', '/fr/*']
   ```

### Translation Keys Naming

- Use descriptive, hierarchical keys
- Group related translations
- Use camelCase for keys
- Avoid abbreviations

```json
{
  "auth": {
    "loginForm": {
      "title": "Sign In",
      "emailLabel": "Email Address",
      "passwordLabel": "Password",
      "submitButton": "Sign In",
      "forgotPasswordLink": "Forgot your password?"
    }
  }
}
```

## Testing

### Translation Coverage

```bash
# Test all translations are present
npm run test:i18n

# Test specific language
npm run test:i18n -- --locale=en
```

### E2E Testing

All E2E tests run across all supported locales:

```bash
# Test all locales
npm run test:e2e

# Test specific locale
npm run test:e2e -- --locale=ro
```

## Troubleshooting

### Common Issues

1. **Missing Translation Keys**
   ```
   Error: Translation key 'auth.newKey' not found
   ```
   **Solution**: Add the key to all locale files

2. **Lazy Loading Not Working**
   ```
   All translations loaded at once
   ```
   **Solution**: Ensure `lazy: true` and `langDir` are set correctly

3. **Wrong Language Detection**
   ```
   Always defaults to Spanish
   ```
   **Solution**: Check browser language settings and cookie configuration

### Debug Mode

Enable i18n debugging:

```typescript
// nuxt.config.ts
i18n: {
  debug: process.env.NODE_ENV === 'development',
  // ... other config
}
```

## Migration Notes

### Recent Changes (Current Update)

- ✅ Added `lazy: true` for performance optimization
- ✅ Added explicit `langDir: 'locales/'` path
- ✅ Improved initial page load times
- ✅ Better development experience with explicit paths

### Benefits of This Update

1. **Performance**: ~75% reduction in initial bundle size
2. **User Experience**: Faster page loads, especially on mobile
3. **Developer Experience**: Clearer file organization
4. **Scalability**: Better support for adding new languages

This configuration provides optimal performance while maintaining full internationalization capabilities across all supported languages.
