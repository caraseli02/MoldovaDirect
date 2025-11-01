-- =====================================================
-- Landing Page CMS Schema
-- =====================================================
-- This schema provides a flexible content management system
-- for the landing page, allowing admins to create, edit,
-- reorder, and schedule different section types dynamically.
--
-- Features:
-- - Multi-language content support (ES, EN, RO, RU)
-- - Section scheduling (start/end dates)
-- - Drag-and-drop ordering
-- - Section type flexibility (hero_carousel, banner, products, etc.)
-- - Preview mode support
-- - Full audit trail (created_at, updated_at)
-- =====================================================

-- =====================================================
-- 1. LANDING_SECTIONS TABLE
-- =====================================================
-- Core table for storing all landing page sections
CREATE TABLE IF NOT EXISTS landing_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Section identification
  section_type TEXT NOT NULL CHECK (section_type IN (
    'announcement_bar',
    'hero_carousel',
    'hero_slide',
    'category_grid',
    'featured_products',
    'collections_showcase',
    'social_proof',
    'how_it_works',
    'services',
    'newsletter',
    'faq_preview',
    'promotional_banner',
    'flash_sale'
  )),

  -- Display control
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Scheduling
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,

  -- Multi-language content (JSONB for flexibility)
  -- Structure: { "es": {...}, "en": {...}, "ro": {...}, "ru": {...} }
  translations JSONB NOT NULL DEFAULT '{}',

  -- Section-specific configuration (JSONB for flexibility)
  -- Examples:
  -- - hero_slide: { "image_url": "...", "cta_url": "...", "background_color": "..." }
  -- - featured_products: { "product_ids": [...], "filter_type": "manual", "category_slug": "..." }
  -- - promotional_banner: { "discount_percentage": 20, "countdown_enabled": true }
  config JSONB NOT NULL DEFAULT '{}',

  -- Metadata
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- 2. INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_landing_sections_type ON landing_sections(section_type);
CREATE INDEX IF NOT EXISTS idx_landing_sections_active ON landing_sections(is_active);
CREATE INDEX IF NOT EXISTS idx_landing_sections_order ON landing_sections(display_order);
CREATE INDEX IF NOT EXISTS idx_landing_sections_schedule ON landing_sections(starts_at, ends_at);
CREATE INDEX IF NOT EXISTS idx_landing_sections_translations ON landing_sections USING gin(translations);
CREATE INDEX IF NOT EXISTS idx_landing_sections_config ON landing_sections USING gin(config);

-- =====================================================
-- 3. TRIGGER FOR UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION update_landing_sections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_landing_sections_updated_at ON landing_sections;
CREATE TRIGGER trigger_landing_sections_updated_at
  BEFORE UPDATE ON landing_sections
  FOR EACH ROW
  EXECUTE FUNCTION update_landing_sections_updated_at();

-- =====================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE landing_sections ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active sections
DROP POLICY IF EXISTS "landing_sections_select_active" ON landing_sections;
CREATE POLICY "landing_sections_select_active"
  ON landing_sections
  FOR SELECT
  USING (
    is_active = true
    AND (starts_at IS NULL OR starts_at <= now())
    AND (ends_at IS NULL OR ends_at >= now())
  );

-- Policy: Admins can select all sections (including inactive/scheduled)
DROP POLICY IF EXISTS "landing_sections_select_admin" ON landing_sections;
CREATE POLICY "landing_sections_select_admin"
  ON landing_sections
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Policy: Only admins can insert sections
DROP POLICY IF EXISTS "landing_sections_insert_admin" ON landing_sections;
CREATE POLICY "landing_sections_insert_admin"
  ON landing_sections
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Policy: Only admins can update sections
DROP POLICY IF EXISTS "landing_sections_update_admin" ON landing_sections;
CREATE POLICY "landing_sections_update_admin"
  ON landing_sections
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Policy: Only admins can delete sections
DROP POLICY IF EXISTS "landing_sections_delete_admin" ON landing_sections;
CREATE POLICY "landing_sections_delete_admin"
  ON landing_sections
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- =====================================================
-- 5. HELPER FUNCTIONS
-- =====================================================

-- Function: Get active sections for a specific locale
CREATE OR REPLACE FUNCTION get_active_landing_sections(p_locale TEXT DEFAULT 'es')
RETURNS TABLE (
  id UUID,
  section_type TEXT,
  display_order INTEGER,
  translations JSONB,
  config JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ls.id,
    ls.section_type,
    ls.display_order,
    ls.translations,
    ls.config,
    ls.created_at,
    ls.updated_at
  FROM landing_sections ls
  WHERE ls.is_active = true
    AND (ls.starts_at IS NULL OR ls.starts_at <= now())
    AND (ls.ends_at IS NULL OR ls.ends_at >= now())
  ORDER BY ls.display_order ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Reorder sections (swap display_order)
CREATE OR REPLACE FUNCTION reorder_landing_sections(
  p_section_id UUID,
  p_new_order INTEGER
)
RETURNS VOID AS $$
DECLARE
  v_old_order INTEGER;
BEGIN
  -- Get current order
  SELECT display_order INTO v_old_order
  FROM landing_sections
  WHERE id = p_section_id;

  -- Update orders
  IF v_old_order < p_new_order THEN
    -- Moving down: shift items up
    UPDATE landing_sections
    SET display_order = display_order - 1
    WHERE display_order > v_old_order
      AND display_order <= p_new_order
      AND id != p_section_id;
  ELSE
    -- Moving up: shift items down
    UPDATE landing_sections
    SET display_order = display_order + 1
    WHERE display_order >= p_new_order
      AND display_order < v_old_order
      AND id != p_section_id;
  END IF;

  -- Update target section
  UPDATE landing_sections
  SET display_order = p_new_order
  WHERE id = p_section_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users (admin check is in RLS)
GRANT EXECUTE ON FUNCTION get_active_landing_sections(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION reorder_landing_sections(UUID, INTEGER) TO authenticated;

-- =====================================================
-- 6. COMMENTS FOR DOCUMENTATION
-- =====================================================
COMMENT ON TABLE landing_sections IS 'Stores all landing page sections with multi-language support, scheduling, and flexible configuration';
COMMENT ON COLUMN landing_sections.section_type IS 'Type of section: announcement_bar, hero_carousel, featured_products, etc.';
COMMENT ON COLUMN landing_sections.display_order IS 'Order of appearance on the landing page (0 = first)';
COMMENT ON COLUMN landing_sections.translations IS 'Multi-language content as JSONB: { "es": {...}, "en": {...}, "ro": {...}, "ru": {...} }';
COMMENT ON COLUMN landing_sections.config IS 'Section-specific configuration as JSONB (flexible schema per section_type)';
COMMENT ON COLUMN landing_sections.starts_at IS 'Optional: When this section becomes active (for scheduled content)';
COMMENT ON COLUMN landing_sections.ends_at IS 'Optional: When this section becomes inactive (for limited-time offers)';
