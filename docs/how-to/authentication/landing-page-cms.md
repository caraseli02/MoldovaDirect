# Landing Page CMS Documentation


## Overview

The Landing Page Content Management System (CMS) provides a flexible, database-driven solution for managing landing page content without requiring code changes or deployments. Admins can create, edit, schedule, and reorder landing page sections through an intuitive admin interface.

## Features

- ✅ **Dynamic Content Management** - Edit landing page content without code changes
- ✅ **Multi-Language Support** - Manage content in ES, EN, RO, RU simultaneously
- ✅ **Section Scheduling** - Set start/end dates for time-sensitive content
- ✅ **Drag-and-Drop Reordering** - Change section order visually
- ✅ **Flexible Configuration** - Each section type has customizable settings
- ✅ **Preview Mode** - Preview changes before publishing
- ✅ **Role-Based Access** - Only admins can manage content
- ✅ **Audit Trail** - Track who created/updated each section

## Architecture

### Database Schema

**Table: `landing_sections`**

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `section_type` | TEXT | Type of section (announcement_bar, hero_carousel, etc.) |
| `display_order` | INTEGER | Order of appearance (0 = first) |
| `is_active` | BOOLEAN | Whether section is currently active |
| `starts_at` | TIMESTAMPTZ | Optional start date/time |
| `ends_at` | TIMESTAMPTZ | Optional end date/time |
| `translations` | JSONB | Multi-language content |
| `config` | JSONB | Section-specific configuration |
| `created_by` | UUID | User ID who created the section |
| `updated_by` | UUID | User ID who last updated |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

### File Structure

```
├── supabase/sql/
│   ├── supabase-landing-cms-schema.sql    # Database schema
│   └── seed-landing-sections.sql          # Initial content seed
├── types/
│   └── cms.ts                              # TypeScript type definitions
├── server/api/landing/sections/
│   ├── index.get.ts                        # GET /api/landing/sections
│   ├── index.post.ts                       # POST /api/landing/sections
│   ├── [id].get.ts                         # GET /api/landing/sections/:id
│   ├── [id].put.ts                         # PUT /api/landing/sections/:id
│   ├── [id].delete.ts                      # DELETE /api/landing/sections/:id
│   └── reorder.post.ts                     # POST /api/landing/sections/reorder
├── pages/admin/landing/
│   ├── index.vue                           # Admin dashboard
│   ├── sections.vue                        # Section list & management
│   └── editor.vue                          # Section editor form
└── components/admin/landing/
    ├── SectionCard.vue                     # Section list item
    ├── SectionEditor.vue                   # Edit form
    ├── AnnouncementBarEditor.vue           # Announcement bar editor
    ├── FeaturedProductsEditor.vue          # Featured products editor
    └── PromotionalBannerEditor.vue         # Promotional banner editor
```

## Section Types

### 1. Announcement Bar
**Type:** `announcement_bar`

Display promotional messages at the top of the page.

**Configuration:**
```typescript
{
  show_cta: boolean
  theme: 'primary' | 'success' | 'warning' | 'info'
  dismissible: boolean
}
```

**Translations:**
```typescript
{
  highlight: string    // Main message (e.g., "🎉 Free shipping")
  description: string  // Additional details
  cta_text: string     // Button text
}
```

### 2. Hero Carousel
**Type:** `hero_carousel`

Display rotating hero slides with images and CTAs.

**Configuration:**
```typescript
{
  auto_rotate: boolean
  rotation_interval: number      // milliseconds
  show_indicators: boolean
  show_arrows: boolean
  transition_duration: number    // milliseconds
}
```

**Individual Slide Type:** `hero_slide`

**Slide Configuration:**
```typescript
{
  image_url: string
  image_mobile_url: string (optional)
  video_url: string (optional)
  link_url: string
  text_position: 'left' | 'center' | 'right'
  overlay_opacity: number (0-1)
  animation_type: 'fade' | 'slide' | 'zoom'
}
```

### 3. Category Grid
**Type:** `category_grid`

Display product category navigation.

**Configuration:**
```typescript
{
  category_slugs: string[]       // e.g., ['wine', 'gourmet', 'gift']
  display_style: 'grid' | 'carousel' | 'masonry'
  columns: number
}
```

### 4. Featured Products
**Type:** `featured_products`

Display curated product selection.

**Configuration:**
```typescript
{
  display_count: number
  filter_type: 'manual' | 'best_sellers' | 'new_arrivals' | 'on_sale' | 'category'
  product_ids: string[] (optional)      // For manual selection
  category_slug: string (optional)      // For category filter
  show_filters: boolean
  grid_columns: {
    mobile: number
    tablet: number
    desktop: number
  }
}
```

### 5. Promotional Banner
**Type:** `promotional_banner`

Display time-sensitive promotional content.

**Configuration:**
```typescript
{
  discount_percentage: number (optional)
  discount_amount: number (optional)
  countdown_enabled: boolean
  countdown_end_date: string (ISO date)
  featured_product_ids: string[]
  banner_position: 'top' | 'middle' | 'bottom'
  background_color: string
  text_color: string
}
```

### 6. Flash Sale
**Type:** `flash_sale`

Display limited-time product sales with countdown.

**Configuration:**
```typescript
{
  sale_end_date: string (ISO date)
  product_ids: string[]
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  max_quantity_per_user: number (optional)
}
```

## API Endpoints

### GET /api/landing/sections

Retrieve landing page sections with optional filtering.

**Query Parameters:**
- `locale` (string) - Language code: es, en, ro, ru (default: 'es')
- `active_only` (boolean) - Only return active sections (default: true)
- `section_type` (string) - Filter by section type
- `include_scheduled` (boolean) - Include scheduled sections (default: false)

**Response:**
```typescript
{
  sections: LandingSectionRow[]
  total: number
  locale: Locale
}
```

**Example:**
```bash
GET /api/landing/sections?locale=es&active_only=true
```

### GET /api/landing/sections/:id

Get a single landing page section by ID.

**Response:**
```typescript
{
  section: LandingSectionRow
}
```

### POST /api/landing/sections

Create a new landing page section. **Requires admin role.**

**Body:**
```typescript
{
  section_type: SectionType
  display_order?: number           // Auto-calculated if not provided
  is_active?: boolean              // Default: true
  starts_at?: string               // ISO date
  ends_at?: string                 // ISO date
  translations: Translations
  config: SectionConfig
}
```

**Example:**
```json
{
  "section_type": "announcement_bar",
  "is_active": true,
  "translations": {
    "es": {
      "highlight": "🎉 Envío gratuito en pedidos de más de 50€",
      "description": "Entrega al día siguiente disponible",
      "cta_text": "Comprar ahora"
    },
    "en": {
      "highlight": "🎉 Free shipping on orders over €50",
      "description": "Next-day delivery available",
      "cta_text": "Shop Now"
    }
  },
  "config": {
    "show_cta": true,
    "theme": "primary"
  }
}
```

### PUT /api/landing/sections/:id

Update an existing landing page section. **Requires admin role.**

**Body:** Partial `UpdateSectionRequest` (any fields to update)

### DELETE /api/landing/sections/:id

Delete a landing page section. **Requires admin role.**

**Response:**
```typescript
{
  success: boolean
  message: string
}
```

### POST /api/landing/sections/reorder

Change the display order of sections. **Requires admin role.**

**Body:**
```typescript
{
  section_id: string
  new_order: number
}
```

## Setup Instructions

### 1. Run Database Migration

```bash
# Connect to your Supabase instance
psql $DATABASE_URL

# Run schema creation
\i supabase/sql/supabase-landing-cms-schema.sql

# Seed initial content
\i supabase/sql/seed-landing-sections.sql
```

Or using Supabase CLI:

```bash
supabase db push
supabase db seed
```

### 2. Verify Installation

Check that the table was created:

```sql
SELECT * FROM landing_sections ORDER BY display_order;
```

### 3. Grant Admin Role

Ensure your user has the admin role:

```sql
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'your-email@example.com';
```

### 4. Access Admin Panel

Navigate to: `/admin/landing/sections`

## Usage Guide

### Creating a New Section

1. Navigate to **Admin → Landing Page → Sections**
2. Click **"+ Add Section"**
3. Select section type from dropdown
4. Fill in translations for all languages (ES, EN, RO, RU)
5. Configure section-specific settings
6. Set scheduling (optional):
   - `starts_at`: When section becomes active
   - `ends_at`: When section becomes inactive
7. Click **"Save Section"**

### Editing a Section

1. Navigate to section list
2. Click **"Edit"** on the desired section
3. Modify translations or configuration
4. Click **"Save Changes"**

### Reordering Sections

1. Navigate to section list
2. Drag and drop sections to desired order
3. Changes are saved automatically

### Scheduling Content

**Example: Black Friday Promotion**

1. Create promotional banner section
2. Set `starts_at`: `2025-11-20 00:00:00+00`
3. Set `ends_at`: `2025-11-30 23:59:59+00`
4. Section will automatically activate/deactivate

### Toggling Section Visibility

1. Navigate to section list
2. Toggle the **"Active"** switch
3. Inactive sections are hidden from public view

## Development Guide

### Adding a New Section Type

1. **Update Database Enum**

```sql
ALTER TYPE section_type ADD VALUE 'new_section_type';
```

2. **Add TypeScript Types**

```typescript
// types/cms.ts

export interface NewSectionConfig extends BaseConfig {
  // Add configuration fields
  custom_field: string
}

export interface NewSectionTranslation extends BaseTranslation {
  // Add translation fields
  custom_text: string
}

export type NewSection = LandingSection<
  NewSectionTranslation,
  NewSectionConfig
>
```

3. **Create Editor Component**

```vue
<!-- components/admin/landing/NewSectionEditor.vue -->
<template>
  <div>
    <!-- Editor form fields -->
  </div>
</template>
```

4. **Create Display Component**

```vue
<!-- components/home/NewSection.vue -->
<template>
  <section>
    <!-- Section display logic -->
  </section>
</template>
```

5. **Update Landing Page**

```vue
<!-- pages/index.vue -->
<component
  v-if="section.section_type === 'new_section_type'"
  :is="NewSection"
  :config="section"
/>
```

### Testing

```bash
# Run unit tests
npm run test:unit -- types/cms.test.ts

# Run API tests
npm run test:unit -- server/api/landing/sections/*.test.ts

# Run E2E tests
npm run test:e2e -- tests/admin/landing.spec.ts
```

## Best Practices

### 1. Content Strategy

- ✅ Use scheduling for time-sensitive content (sales, holidays)
- ✅ Keep announcement bar messages concise (under 100 characters)
- ✅ Update featured products weekly for freshness
- ✅ Test content in all 4 languages before publishing
- ✅ Use preview mode to verify layout before activating

### 2. Performance

- ✅ Limit active sections to 10-12 for optimal page load
- ✅ Use image CDN for hero slides (e.g., Cloudinary, Vercel)
- ✅ Cache API responses with short TTL (5-10 minutes)
- ✅ Lazy-load sections below the fold

### 3. SEO

- ✅ Include keywords in section titles and descriptions
- ✅ Use descriptive image alt text in hero slides
- ✅ Structure sections logically (hero → products → social proof)
- ✅ Keep h1/h2 tags hierarchical

### 4. Accessibility

- ✅ Ensure color contrast meets WCAG AA standards
- ✅ Add aria-labels to interactive elements
- ✅ Test keyboard navigation
- ✅ Provide text alternatives for images

## Troubleshooting

### Issue: Section not appearing on landing page

**Check:**
1. Is `is_active` set to `true`?
2. Is current date/time between `starts_at` and `ends_at`?
3. Run: `SELECT * FROM get_active_landing_sections('es')`

### Issue: Permission denied when creating section

**Check:**
1. Is user authenticated?
2. Does user have admin role?
```sql
SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = 'user-id';
```

### Issue: Translations not displaying

**Check:**
1. Is locale correctly set in query parameter?
2. Do translations exist for all required fields?
3. Is JSONB structure correct?

### Issue: Reordering not working

**Check:**
1. Is `reorder_landing_sections` function defined?
2. Check database logs for errors
3. Verify display_order values are sequential

## Migration from Static Content

The current implementation uses a **hybrid approach**:

- **Dynamic (CMS)**: Announcement bar, category grid, featured products
- **Static (Vue Components)**: Hero, collections, social proof, how it works, services, newsletter, FAQ

**Future Iterations:**
- Convert hero to hero_carousel with slides
- Add collections_showcase section type
- Add social_proof section type with testimonial management
- Add how_it_works section type with step customization

## Support

For questions or issues:

1. Check this documentation
2. Review type definitions in `types/cms.ts`
3. Inspect database schema in `supabase/sql/supabase-landing-cms-schema.sql`
4. Contact development team

## Changelog

### v1.0.0 (PR #2) - 2025-11-01

- ✅ Initial CMS implementation
- ✅ Database schema and migrations
- ✅ TypeScript type definitions
- ✅ API endpoints (CRUD + reorder)
- ✅ Seeding scripts for initial content
- ✅ Documentation and usage guide

### Future Roadmap

- [ ] Admin UI components
- [ ] Drag-and-drop reordering interface
- [ ] Preview mode functionality
- [ ] Section templates library
- [ ] A/B testing integration
- [ ] Analytics tracking per section
- [ ] Version history and rollback
- [ ] Bulk operations (duplicate, archive)
- [ ] Advanced scheduling (recurring content)
- [ ] Multi-page CMS support (About, Contact, etc.)
