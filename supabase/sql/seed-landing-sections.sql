-- =====================================================
-- Seed Landing Page Sections
-- =====================================================
-- This script seeds the landing_sections table with the
-- current static landing page content, migrating it to
-- the dynamic CMS system.
--
-- Usage:
-- 1. Ensure supabase-landing-cms-schema.sql has been run first
-- 2. Run this script to populate initial content
-- 3. Verify content in the admin panel
-- =====================================================

-- Clear existing sections (if any)
TRUNCATE TABLE landing_sections CASCADE;

-- =====================================================
-- 1. ANNOUNCEMENT BAR
-- =====================================================
INSERT INTO landing_sections (
  section_type,
  display_order,
  is_active,
  translations,
  config
) VALUES (
  'announcement_bar',
  0,
  true,
  '{
    "es": {
      "highlight": "🎉 Envío gratuito en pedidos de más de 50€",
      "description": "Entrega al día siguiente disponible en Madrid y Barcelona",
      "cta_text": "Comprar ahora"
    },
    "en": {
      "highlight": "🎉 Free shipping on orders over €50",
      "description": "Next-day delivery available in Madrid and Barcelona",
      "cta_text": "Shop Now"
    },
    "ro": {
      "highlight": "🎉 Transport gratuit pentru comenzi peste 50€",
      "description": "Livrare în 24 ore disponibilă în Madrid și Barcelona",
      "cta_text": "Cumpără acum"
    },
    "ru": {
      "highlight": "🎉 Бесплатная доставка при заказе от 50€",
      "description": "Доставка на следующий день доступна в Мадриде и Барселоне",
      "cta_text": "Купить сейчас"
    }
  }'::jsonb,
  '{
    "show_cta": true,
    "theme": "primary",
    "dismissible": false
  }'::jsonb
);

-- =====================================================
-- 2. HERO SECTION (keeping static for now as it uses custom component)
-- =====================================================
-- Note: Hero section remains as HeroSection.vue component
-- It could be converted to hero_carousel in future iteration

-- =====================================================
-- 3. CATEGORY GRID
-- =====================================================
INSERT INTO landing_sections (
  section_type,
  display_order,
  is_active,
  translations,
  config
) VALUES (
  'category_grid',
  1,
  true,
  '{
    "es": {
      "title": "Comienza tu viaje",
      "subtitle": "Explora nuestras selecciones más queridas y encuentra el maridaje ideal para cada ocasión."
    },
    "en": {
      "title": "Start Your Journey",
      "subtitle": "Explore our most loved selections and find the perfect pairing for every occasion."
    },
    "ro": {
      "title": "Începe călătoria ta",
      "subtitle": "Explorează selecțiile noastre preferate și găsește asocierea perfectă pentru fiecare ocazie."
    },
    "ru": {
      "title": "Начните своё путешествие",
      "subtitle": "Исследуйте наши любимые подборки и найдите идеальное сочетание для любого случая."
    }
  }'::jsonb,
  '{
    "category_slugs": ["wine", "gourmet", "gift", "subscription"],
    "display_style": "grid",
    "columns": 4
  }'::jsonb
);

-- =====================================================
-- 4. FEATURED PRODUCTS
-- =====================================================
INSERT INTO landing_sections (
  section_type,
  display_order,
  is_active,
  translations,
  config
) VALUES (
  'featured_products',
  2,
  true,
  '{
    "es": {
      "title": "Selección del equipo",
      "subtitle": "Lanzamientos limitados y superventas que nos inspiran esta semana.",
      "filter_all": "Todos",
      "filter_bestsellers": "Más vendidos",
      "filter_new": "Novedades",
      "filter_sale": "En oferta"
    },
    "en": {
      "title": "Editor''s Picks",
      "subtitle": "Limited releases and best-sellers our team is loving this week.",
      "filter_all": "All",
      "filter_bestsellers": "Best Sellers",
      "filter_new": "New Arrivals",
      "filter_sale": "On Sale"
    },
    "ro": {
      "title": "Alegerea editorului",
      "subtitle": "Lansări limitate și best-seller-e care ne inspiră săptămâna aceasta.",
      "filter_all": "Toate",
      "filter_bestsellers": "Cele mai vândute",
      "filter_new": "Noutăți",
      "filter_sale": "În ofertă"
    },
    "ru": {
      "title": "Выбор команды",
      "subtitle": "Лимитированные релизы и хиты продаж, которые вдохновляют нас на этой неделе.",
      "filter_all": "Все",
      "filter_bestsellers": "Бестселлеры",
      "filter_new": "Новинки",
      "filter_sale": "Распродажа"
    }
  }'::jsonb,
  '{
    "display_count": 12,
    "filter_type": "best_sellers",
    "show_filters": true,
    "grid_columns": {
      "mobile": 1,
      "tablet": 2,
      "desktop": 4
    }
  }'::jsonb
);

-- =====================================================
-- 5. COLLECTIONS SHOWCASE (keeping static for now)
-- =====================================================
-- Note: Collections showcase remains as CollectionsShowcase.vue component
-- It uses complex masonry layout that would need custom component

-- =====================================================
-- 6. SOCIAL PROOF (keeping static for now)
-- =====================================================
-- Note: Social proof remains as SocialProofSection.vue component
-- It includes testimonials carousel and partner logos

-- =====================================================
-- 7. HOW IT WORKS (keeping static for now)
-- =====================================================
-- Note: How It Works remains as HowItWorksSection.vue component
-- It uses step-based timeline layout

-- =====================================================
-- 8. SERVICES (keeping static for now)
-- =====================================================
-- Note: Services remains as ServicesSection.vue component
-- It uses 2-column service cards layout

-- =====================================================
-- 9. NEWSLETTER (keeping static for now)
-- =====================================================
-- Note: Newsletter remains as NewsletterSignup.vue component
-- It has form validation and API integration

-- =====================================================
-- 10. FAQ PREVIEW (keeping static for now)
-- =====================================================
-- Note: FAQ Preview remains as FaqPreviewSection.vue component
-- It uses collapsible accordion functionality

-- =====================================================
-- EXAMPLE: PROMOTIONAL BANNER (for future use)
-- =====================================================
-- Uncomment to add a promotional banner for special occasions

-- INSERT INTO landing_sections (
--   section_type,
--   display_order,
--   is_active,
--   starts_at,
--   ends_at,
--   translations,
--   config
-- ) VALUES (
--   'promotional_banner',
--   3, -- After featured products
--   true,
--   '2025-11-15 00:00:00+00', -- Black Friday start
--   '2025-11-30 23:59:59+00', -- Black Friday end
--   '{
--     "es": {
--       "title": "Black Friday: 30% de descuento",
--       "subtitle": "En toda nuestra colección de vinos premium",
--       "cta_text": "Ver ofertas",
--       "cta_url": "/products?category=wine&sale=true",
--       "badge_text": "Oferta limitada",
--       "countdown_text": "La oferta termina en"
--     },
--     "en": {
--       "title": "Black Friday: 30% Off",
--       "subtitle": "On our entire premium wine collection",
--       "cta_text": "Shop Deals",
--       "cta_url": "/products?category=wine&sale=true",
--       "badge_text": "Limited Time",
--       "countdown_text": "Offer ends in"
--     },
--     "ro": {
--       "title": "Black Friday: 30% reducere",
--       "subtitle": "La întreaga noastră colecție de vinuri premium",
--       "cta_text": "Vezi ofertele",
--       "cta_url": "/products?category=wine&sale=true",
--       "badge_text": "Ofertă limitată",
--       "countdown_text": "Oferta se termină în"
--     },
--     "ru": {
--       "title": "Черная пятница: скидка 30%",
--       "subtitle": "На всю нашу коллекцию премиальных вин",
--       "cta_text": "Смотреть предложения",
--       "cta_url": "/products?category=wine&sale=true",
--       "badge_text": "Ограниченное предложение",
--       "countdown_text": "Предложение заканчивается через"
--     }
--   }'::jsonb,
--   '{
--     "discount_percentage": 30,
--     "countdown_enabled": true,
--     "countdown_end_date": "2025-11-30T23:59:59Z",
--     "banner_position": "middle",
--     "background_color": "#1f2937",
--     "text_color": "#ffffff"
--   }'::jsonb
-- );

-- =====================================================
-- VERIFICATION
-- =====================================================
-- Check inserted sections
SELECT
  id,
  section_type,
  display_order,
  is_active,
  jsonb_pretty(translations->'es') as spanish_content,
  jsonb_pretty(config) as configuration
FROM landing_sections
ORDER BY display_order;

-- Count total sections
SELECT COUNT(*) as total_sections FROM landing_sections;

COMMENT ON TABLE landing_sections IS 'Landing page sections seeded with current static content. Announcement bar, category grid, and featured products are now dynamic. Other sections remain as Vue components for now.';
